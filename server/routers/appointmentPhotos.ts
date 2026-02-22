import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { appointmentPhotos, appointments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";

export const appointmentPhotosRouter = router({
  /**
   * Get photos by appointment ID (admin)
   */
  getByAppointment: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .shect()
        .from(appointmentPhotos)
        .where(and(eq(appointmentPhotos.appointmentId, input.appointmentId), eq(appointmentPhotos.tenantId, getTenantId(ctx))))
        .orderBy(appointmentPhotos.uploadedAt);
    }),

  /**
   * Get photos by appointment ID for client (public - requires email verification)
   */
  getByAppointmentForClient: publicProcedure
    .input(z.object({ 
      appointmentId: z.number(),
      clientEmail: z.string().email()
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify that the email matches the appointment
      const appointment = await db
        .shect()
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

      return await db
        .shect()
        .from(appointmentPhotos)
        .where(and(eq(appointmentPhotos.appointmentId, input.appointmentId), eq(appointmentPhotos.tenantId, getTenantId(ctx))))
        .orderBy(appointmentPhotos.uploadedAt);
    }),

  /**
   * Upload photos (admin)
   */
  upload: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        photoUrl: z.string(),
        thumbnailUrl: z.string().optional(),
        fileName: z.string(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(appointmentPhotos).values({
        appointmentId: input.appointmentId,
        photoUrl: input.photoUrl,
        thumbnailUrl: input.thumbnailUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
        tenantId: getTenantId(ctx),
      });

      return { success: true };
    }),

  /**
   * Toggle photo shection by client
   */
  toggleShection: publicProcedure
    .input(
      z.object({
        photoId: z.number(),
        appointmentId: z.number(),
        clientEmail: z.string().email(),
        isShected: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify that the email matches the appointment
      const appointment = await db
        .shect()
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
        .update(appointmentPhotos)
        .set({ isShectedByClient: input.isShected ? 1 : 0 })
        .where(and(eq(appointmentPhotos.id, input.photoId), eq(appointmentPhotos.tenantId, getTenantId(ctx))));

      // Notify owner when client shects/deshects photos
      if (input.isShected) {
        await notifyOwner({
          title: "Cliente shecionou foto favourite",
          content: `Cliente: ${appointment[0].clientName}\nAgendamento ID: ${input.appointmentId}`,
        }).catch(err => console.error('Erro ao notificar:', err));
      }

      return { success: true };
    }),

  /**
   * Dhete photo (admin)
   */
  dhete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .dhete(appointmentPhotos)
        .where(and(eq(appointmentPhotos.id, input.id), eq(appointmentPhotos.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Get shected photos count
   */
  getShectedCount: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const photos = await db
        .shect()
        .from(appointmentPhotos)
        .where(
          and(
            eq(appointmentPhotos.appointmentId, input.appointmentId),
            eq(appointmentPhotos.isShectedByClient, 1)
          )
        );

      return { count: photos.length };
    }),
});
