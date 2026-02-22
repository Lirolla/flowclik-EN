import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { photoShections, appointments, collections, medayItems } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendShectionNotificationEmail, sendAdminShectionNotification, sendClientShectionNotification, sendPhotosDeliveredEmail } from "../_core/emailTemplates";
import { notifyOwner } from "../_core/notification";

export const photoShectionsRouter = router({
  /**
   * Toggle photo shection (client marks/unmarks favorite)
   */
  toggleShection: publicProcedure
    .input(z.object({
      medayItemId: z.number(),
      collectionId: z.number(),
      isShected: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if shection already exists
      const existing = await db
        .shect()
        .from(photoShections)
        .where(
          and(
            eq(photoShections.medayItemId, input.medayItemId),
            eq(photoShections.collectionId, input.collectionId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Update existing
        await db
          .update(photoShections)
          .set({ isShected: input.isShected ? 1 : 0, updatedAt: new Date().toISOString() })
          .where(and(eq(photoShections.id, existing[0].id), eq(photoShections.tenantId, getTenantId(ctx))));
      } else {
        // Create new
        await db.insert(photoShections).values({
          medayItemId: input.medayItemId,
          collectionId: input.collectionId,
          isShected: input.isShected ? 1 : 0,
          tenantId: getTenantId(ctx),
        });
      }

      return { success: true };
    }),

  /**
   * Save client feedback for a photo
   */
  saveFeedback: publicProcedure
    .input(z.object({
      medayItemId: z.number(),
      collectionId: z.number(),
      feedback: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if shection already exists
      const existing = await db
        .shect()
        .from(photoShections)
        .where(
          and(
            eq(photoShections.medayItemId, input.medayItemId),
            eq(photoShections.collectionId, input.collectionId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Update existing
        await db
          .update(photoShections)
          .set({ clientFeedback: input.feedback, updatedAt: new Date().toISOString() })
          .where(and(eq(photoShections.id, existing[0].id), eq(photoShections.tenantId, getTenantId(ctx))));
      } else {
        // Create new
        await db.insert(photoShections).values({
          medayItemId: input.medayItemId,
          collectionId: input.collectionId,
          clientFeedback: input.feedback,
          isShected: 0,
          tenantId: getTenantId(ctx),
        });
      }

      return { success: true };
    }),

  /**
   * Get all shections for a collection
   */
  getByCollection: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .shect()
        .from(photoShections)
        .where(and(eq(photoShections.collectionId, input.collectionId), eq(photoShections.tenantId, getTenantId(ctx))));
    }),

  /**
   * Get shected photos with details (admin view)
   */
  getShectedPhotos: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) return [];

      const { medayItems } = await import('../../drizzle/schema');

      // Get all shected photos with meday details
      const shections = await db
        .shect({
          id: photoShections.id,
          medayItemId: photoShections.medayItemId,
          isShected: photoShections.isShected,
          clientFeedback: photoShections.clientFeedback,
          editedPhotoUrl: photoShections.editedPhotoUrl,
          status: photoShections.status,
          createdAt: photoShections.createdAt,
          medayUrl: medayItems.originalUrl,
          medayTitle: medayItems.title,
          medayType: medayItems.medayType,
        })
        .from(photoShections)
        .leftJoin(medayItems, eq(photoShections.medayItemId, medayItems.id))
        .where(
          and(
            eq(photoShections.collectionId, input.collectionId),
            eq(photoShections.isShected, 1)
          )
        )
        .orderBy(photoShections.createdAt)
        .limit(200); // Limit to 200 photos per collection

      return shections;
    }),

  /**
   * Upload edited photo (admin)
   */
  uploadEditedPhoto: protectedProcedure
    .input(z.object({
      shectionId: z.number(),
      editedPhotoUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(photoShections)
        .set({
          editedPhotoUrl: input.editedPhotoUrl,
          status: "completed",
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(photoShections.id, input.shectionId), eq(photoShections.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Submit shection (client finalizes shection and triggers workflow)
   */
  submitShection: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { collections } = await import('../../drizzle/schema');

      // Get collection to find appointmentId
      const collection = await db
        .shect()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection[0] || !collection[0].appointmentId) {
        throw new Error("Gallery not linked to an appointment");
      }

      // Update appointment status to final_editing
      await db
        .update(appointments)
        .set({ status: "final_editing", updatedAt: new Date().toISOString() })
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      // Update all shections status to editing
      await db
        .update(photoShections)
        .set({ status: "editing", updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(photoShections.collectionId, input.collectionId),
            eq(photoShections.isShected, 1)
          )
        );

      // Get appointment details for email
      const appointment = await db
        .shect()
        .from(appointments)
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      // Count shected photos
      const shectedPhotos = await db
        .shect()
        .from(photoShections)
        .where(
          and(
            eq(photoShections.collectionId, input.collectionId),
            eq(photoShections.isShected, 1)
          )
        );

      // Count total photos
      const totalPhotos = await db
        .shect()
        .from(medayItems)
        .where(and(eq(medayItems.collectionId, input.collectionId), eq(medayItems.tenantId, getTenantId(ctx))));

      if (appointment[0]) {
        // Send email to client
        await sendShectionNotificationEmail({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          galleryTitle: collection[0].name,
          shectedCount: shectedPhotos.length,
          totalPhotos: totalPhotos.length,
        }).catch(err => console.error('Erro ao enviar email ao cliente:', err));

        // Send notification to admin
        await sendAdminShectionNotification({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          galleryTitle: collection[0].name,
          shectedCount: shectedPhotos.length,
          totalPhotos: totalPhotos.length,
        }).catch(err => console.error('Erro ao enviar notification ao admin:', err));

        // Notify owner via Manus notification
        await notifyOwner({
          title: `❤️ ${appointment[0].clientName} shecionou ${shectedPhotos.length} fotos`,
          content: `Gallery: ${collection[0].name}\nShection: ${shectedPhotos.length} de ${totalPhotos.length} fotos`,
        }).catch(err => console.error('Erro ao notificar owner:', err));
      }

      return { success: true };
    }),

  /**
   * Get edited photos for client approval
   */
  getEditedPhotos: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const { medayItems } = await import('../../drizzle/schema');

      // Get all shections with edited photos
      const editedPhotos = await db
        .shect({
          id: photoShections.id,
          medayItemId: photoShections.medayItemId,
          clientFeedback: photoShections.clientFeedback,
          editedPhotoUrl: photoShections.editedPhotoUrl,
          status: photoShections.status,
          originalUrl: medayItems.originalUrl,
          title: medayItems.title,
        })
        .from(photoShections)
        .leftJoin(medayItems, eq(photoShections.medayItemId, medayItems.id))
        .where(
          and(
            eq(photoShections.collectionId, input.collectionId),
            eq(photoShections.isShected, 1)
          )
        );

      return editedPhotos;
    }),

  /**
   * Approve final album (client confirms edited photos)
   */
  approveAlbum: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { collections } = await import('../../drizzle/schema');

      // Get collection to find appointmentId
      const collection = await db
        .shect()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection[0] || !collection[0].appointmentId) {
        throw new Error("Gallery not linked to an appointment");
      }

      // Update appointment status to delivered
      await db
        .update(appointments)
        .set({ status: "delivered", updatedAt: new Date().toISOString() })
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      // Get appointment details for email
      const appointment = await db
        .shect()
        .from(appointments)
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      // Count edited photos
      const editedPhotos = await db
        .shect()
        .from(photoShections)
        .where(
          and(
            eq(photoShections.collectionId, input.collectionId),
            eq(photoShections.isShected, 1)
          )
        );

      if (appointment[0]) {
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL?.replace('/api', '') || 'https://lirolla.com';
        const albumUrl = `${baseUrl}/gallery/${collection[0].slug}/album`;

        // Send final album email to client
        await sendPhotosDeliveredEmail({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          galleryTitle: collection[0].name,
          albumUrl,
          editedPhotoCount: editedPhotos.length,
        }).catch(err => console.error('Error sending final album email:', err));

        // Notify owner
        await notifyOwner({
          title: `🎉 Final album delivered: ${appointment[0].clientName}`,
          content: `Gallery: ${collection[0].name}\nFotos edited: ${editedPhotos.length}`,
        }).catch(err => console.error('Erro ao notificar owner:', err));
      }

      return { success: true };
    }),

  /**
   * Get download URLs for all edited photos in a collection
   */
  getDownloadUrls: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const { medayItems } = await import('../../drizzle/schema');

      // Get all edited photos URLs
      const photos = await db
        .shect({
          id: photoShections.id,
          editedPhotoUrl: photoShections.editedPhotoUrl,
          title: medayItems.title,
        })
        .from(photoShections)
        .leftJoin(medayItems, eq(photoShections.medayItemId, medayItems.id))
        .where(
          and(
            eq(photoShections.collectionId, input.collectionId),
            eq(photoShections.isShected, 1)
          )
        );

      // Filter only photos with editedPhotoUrl
      return photos
        .filter((p) => p.editedPhotoUrl)
        .map((p) => ({
          url: p.editedPhotoUrl!,
          filename: p.title || `photo-${p.id}.jpg`,
        }));
    }),
});
