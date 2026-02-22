import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { collections, mediaItems, appointments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const sessionGalleryRouter = router({
  /**
   * Create gallery for appointment (admin)
   */
  createForAppointment: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get appointment details
      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!appointment || appointment.length === 0) {
        throw new Error("Appointment not found");
      }

      // Check if gallery already exists
      const existing = await db
        .select()
        .from(collections)
        .where(and(eq(collections.appointmentId, input.appointmentId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (existing && existing.length > 0) {
        return { galleryId: existing[0].id, slug: existing[0].slug };
      }

      // Create private gallery
      const slug = `ensaio-${input.appointmentId}-${Date.now()}`;
      const inserted = await db.insert(collections).values({
        name: `Ensaio - ${appointment[0].clientName}`,
        slug,
        description: `Fotos do ensaio realizado em ${new Date(appointment[0].appointmentDate).toLocaleDateString('en-GB')}`,
        isPublic: 0, // Private gallery
        isFeatured: 0,
        appointmentId: input.appointmentId,
        tenantId: getTenantId(ctx),
      });

      return { galleryId: inserted[0].insertId, slug };
    }),

  /**
   * Get gallery by appointment ID (admin)
   */
  getByAppointment: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const gallery = await db
        .select()
        .from(collections)
        .where(and(eq(collections.appointmentId, input.appointmentId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!gallery || gallery.length === 0) {
        return null;
      }

      // Get photos count and favorites count
      const photos = await db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.collectionId, gallery[0].id), eq(mediaItems.tenantId, getTenantId(ctx))));

      const favoritesCount = photos.filter(p => p.isFavorite).length;

      return {
        ...gallery[0],
        photosCount: photos.length,
        favoritesCount,
      };
    }),

  /**
   * Get gallery for client (public - requires email verification)
   */
  getForClient: publicProcedure
    .input(z.object({ 
      appointmentId: z.number(),
      clientEmail: z.string().email()
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify that the email matches the appointment
      const appointment = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.clientEmail, input.clientEmail)
          )
        )
        .limit(1);

      if (!appointment || appointment.length === 0) {
        throw new Error("Appointment not found ou email invalid");
      }

      // Get gallery
      const gallery = await db
        .select()
        .from(collections)
        .where(and(eq(collections.appointmentId, input.appointmentId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!gallery || gallery.length === 0) {
        return null;
      }

      // Get photos
      const photos = await db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.collectionId, gallery[0].id), eq(mediaItems.tenantId, getTenantId(ctx))))
        .orderBy(mediaItems.createdAt);

      return {
        gallery: gallery[0],
        photos,
        appointment: appointment[0],
      };
    }),

  /**
   * Toggle favorite (client)
   */
  toggleFavorite: publicProcedure
    .input(z.object({
      photoId: z.number(),
      appointmentId: z.number(),
      clientEmail: z.string().email(),
      isFavorite: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify that the email matches the appointment
      const appointment = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.clientEmail, input.clientEmail)
          )
        )
        .limit(1);

      if (!appointment || appointment.length === 0) {
        throw new Error("Appointment not found ou email invalid");
      }

      await db
        .update(mediaItems)
        .set({ isFavorite: input.isFavorite ? 1 : 0 })
        .where(and(eq(mediaItems.id, input.photoId), eq(mediaItems.tenantId, getTenantId(ctx))));

      // Notify owner when client marks favorites
      if (input.isFavorite) {
        await notifyOwner({
          title: "Cliente marcou foto favourite",
          content: `Cliente: ${appointment[0].clientName}\nAgendamento ID: ${input.appointmentId}`,
        }).catch(err => console.error('Erro ao notificar:', err));
      }

      return { success: true };
    }),
});
