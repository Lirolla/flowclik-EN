import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { photoSelections, appointments, collections, mediaItems } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendSelectionNotificationEmail, sendAdminSelectionNotification, sendClientSelectionNotification, sendPhotosDeliveredEmail } from "../_core/emailTemplates";
import { notifyOwner } from "../_core/notification";

export const photoSelectionsRouter = router({
  /**
   * Toggle photo selection (client marks/unmarks favorite)
   */
  toggleSelection: publicProcedure
    .input(z.object({
      mediaItemId: z.number(),
      collectionId: z.number(),
      isSelected: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if selection already exists
      const existing = await db
        .select()
        .from(photoSelections)
        .where(
          and(
            eq(photoSelections.mediaItemId, input.mediaItemId),
            eq(photoSelections.collectionId, input.collectionId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Update existing
        await db
          .update(photoSelections)
          .set({ isSelected: input.isSelected ? 1 : 0, updatedAt: new Date().toISOString() })
          .where(and(eq(photoSelections.id, existing[0].id), eq(photoSelections.tenantId, getTenantId(ctx))));
      } else {
        // Create new
        await db.insert(photoSelections).values({
          mediaItemId: input.mediaItemId,
          collectionId: input.collectionId,
          isSelected: input.isSelected ? 1 : 0,
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
      mediaItemId: z.number(),
      collectionId: z.number(),
      feedback: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if selection already exists
      const existing = await db
        .select()
        .from(photoSelections)
        .where(
          and(
            eq(photoSelections.mediaItemId, input.mediaItemId),
            eq(photoSelections.collectionId, input.collectionId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Update existing
        await db
          .update(photoSelections)
          .set({ clientFeedback: input.feedback, updatedAt: new Date().toISOString() })
          .where(and(eq(photoSelections.id, existing[0].id), eq(photoSelections.tenantId, getTenantId(ctx))));
      } else {
        // Create new
        await db.insert(photoSelections).values({
          mediaItemId: input.mediaItemId,
          collectionId: input.collectionId,
          clientFeedback: input.feedback,
          isSelected: 0,
          tenantId: getTenantId(ctx),
        });
      }

      return { success: true };
    }),

  /**
   * Get all selections for a collection
   */
  getByCollection: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(photoSelections)
        .where(and(eq(photoSelections.collectionId, input.collectionId), eq(photoSelections.tenantId, getTenantId(ctx))));
    }),

  /**
   * Get selected photos with details (admin view)
   */
  getSelectedPhotos: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) return [];

      const { mediaItems } = await import('../../drizzle/schema');

      // Get all selected photos with media details
      const selections = await db
        .select({
          id: photoSelections.id,
          mediaItemId: photoSelections.mediaItemId,
          isSelected: photoSelections.isSelected,
          clientFeedback: photoSelections.clientFeedback,
          editedPhotoUrl: photoSelections.editedPhotoUrl,
          status: photoSelections.status,
          createdAt: photoSelections.createdAt,
          mediaUrl: mediaItems.originalUrl,
          mediaTitle: mediaItems.title,
          mediaType: mediaItems.mediaType,
        })
        .from(photoSelections)
        .leftJoin(mediaItems, eq(photoSelections.mediaItemId, mediaItems.id))
        .where(
          and(
            eq(photoSelections.collectionId, input.collectionId),
            eq(photoSelections.isSelected, 1)
          )
        )
        .orderBy(photoSelections.createdAt)
        .limit(200); // Limit to 200 photos per collection

      return selections;
    }),

  /**
   * Upload edited photo (admin)
   */
  uploadEditedPhoto: protectedProcedure
    .input(z.object({
      selectionId: z.number(),
      editedPhotoUrl: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(photoSelections)
        .set({
          editedPhotoUrl: input.editedPhotoUrl,
          status: "completed",
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(photoSelections.id, input.selectionId), eq(photoSelections.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Submit selection (client finalizes selection and triggers workflow)
   */
  submitSelection: publicProcedure
    .input(z.object({ collectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { collections } = await import('../../drizzle/schema');

      // Get collection to find appointmentId
      const collection = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection[0] || !collection[0].appointmentId) {
        throw new Error("Galeria não vinculada a um agendamento");
      }

      // Update appointment status to final_editing
      await db
        .update(appointments)
        .set({ status: "final_editing", updatedAt: new Date().toISOString() })
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      // Update all selections status to editing
      await db
        .update(photoSelections)
        .set({ status: "editing", updatedAt: new Date().toISOString() })
        .where(
          and(
            eq(photoSelections.collectionId, input.collectionId),
            eq(photoSelections.isSelected, 1)
          )
        );

      // Get appointment details for email
      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      // Count selected photos
      const selectedPhotos = await db
        .select()
        .from(photoSelections)
        .where(
          and(
            eq(photoSelections.collectionId, input.collectionId),
            eq(photoSelections.isSelected, 1)
          )
        );

      // Count total photos
      const totalPhotos = await db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.collectionId, input.collectionId), eq(mediaItems.tenantId, getTenantId(ctx))));

      if (appointment[0]) {
        // Send email to client
        await sendSelectionNotificationEmail({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          galleryTitle: collection[0].name,
          selectedCount: selectedPhotos.length,
          totalPhotos: totalPhotos.length,
        }).catch(err => console.error('Erro ao enviar email ao cliente:', err));

        // Send notification to admin
        await sendAdminSelectionNotification({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          galleryTitle: collection[0].name,
          selectedCount: selectedPhotos.length,
          totalPhotos: totalPhotos.length,
        }).catch(err => console.error('Erro ao enviar notificação ao admin:', err));

        // Notify owner via Manus notification
        await notifyOwner({
          title: `❤️ ${appointment[0].clientName} selecionou ${selectedPhotos.length} fotos`,
          content: `Galeria: ${collection[0].name}\nSeleção: ${selectedPhotos.length} de ${totalPhotos.length} fotos`,
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

      const { mediaItems } = await import('../../drizzle/schema');

      // Get all selections with edited photos
      const editedPhotos = await db
        .select({
          id: photoSelections.id,
          mediaItemId: photoSelections.mediaItemId,
          clientFeedback: photoSelections.clientFeedback,
          editedPhotoUrl: photoSelections.editedPhotoUrl,
          status: photoSelections.status,
          originalUrl: mediaItems.originalUrl,
          title: mediaItems.title,
        })
        .from(photoSelections)
        .leftJoin(mediaItems, eq(photoSelections.mediaItemId, mediaItems.id))
        .where(
          and(
            eq(photoSelections.collectionId, input.collectionId),
            eq(photoSelections.isSelected, 1)
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
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection[0] || !collection[0].appointmentId) {
        throw new Error("Galeria não vinculada a um agendamento");
      }

      // Update appointment status to delivered
      await db
        .update(appointments)
        .set({ status: "delivered", updatedAt: new Date().toISOString() })
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      // Get appointment details for email
      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, collection[0].appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      // Count edited photos
      const editedPhotos = await db
        .select()
        .from(photoSelections)
        .where(
          and(
            eq(photoSelections.collectionId, input.collectionId),
            eq(photoSelections.isSelected, 1)
          )
        );

      if (appointment[0]) {
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL?.replace('/api', '') || 'https://lirolla.com';
        const albumUrl = `${baseUrl}/galeria/${collection[0].slug}/album`;

        // Send final album email to client
        await sendPhotosDeliveredEmail({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          galleryTitle: collection[0].name,
          albumUrl,
          editedPhotoCount: editedPhotos.length,
        }).catch(err => console.error('Erro ao enviar email de álbum final:', err));

        // Notify owner
        await notifyOwner({
          title: `🎉 Álbum final entregue: ${appointment[0].clientName}`,
          content: `Galeria: ${collection[0].name}\nFotos editadas: ${editedPhotos.length}`,
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

      const { mediaItems } = await import('../../drizzle/schema');

      // Get all edited photos URLs
      const photos = await db
        .select({
          id: photoSelections.id,
          editedPhotoUrl: photoSelections.editedPhotoUrl,
          title: mediaItems.title,
        })
        .from(photoSelections)
        .leftJoin(mediaItems, eq(photoSelections.mediaItemId, mediaItems.id))
        .where(
          and(
            eq(photoSelections.collectionId, input.collectionId),
            eq(photoSelections.isSelected, 1)
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
