import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { photoComments, appointments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const photoCommentsRouter = router({
  /**
   * Add comment (client)
   */
  add: publicProcedure
    .input(z.object({
      photoId: z.number(),
      appointmentId: z.number(),
      clientEmail: z.string().email(),
      comment: z.string().min(1),
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

      await db.insert(photoComments).values({
        photoId: input.photoId,
        appointmentId: input.appointmentId,
        clientEmail: input.clientEmail,
        comment: input.comment,
        tenantId: getTenantId(ctx),
      });

      // Notify owner
      await notifyOwner({
        title: "Novo comment em foto",
        content: `Cliente: ${appointment[0].clientName}\nAgendamento ID: ${input.appointmentId}\nComment: ${input.comment}`,
      }).catch(err => console.error('Erro ao notificar:', err));

      return { success: true };
    }),

  /**
   * Get comments by photo ID (admin)
   */
  getByPhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(photoComments)
        .where(and(eq(photoComments.photoId, input.photoId), eq(photoComments.tenantId, getTenantId(ctx))))
        .orderBy(photoComments.createdAt);
    }),

  /**
   * Get comments by appointment ID (admin)
   */
  getByAppointment: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(photoComments)
        .where(and(eq(photoComments.appointmentId, input.appointmentId), eq(photoComments.tenantId, getTenantId(ctx))))
        .orderBy(photoComments.createdAt);
    }),

  /**
   * Get comments for client
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

      return await db
        .select()
        .from(photoComments)
        .where(and(eq(photoComments.appointmentId, input.appointmentId), eq(photoComments.tenantId, getTenantId(ctx))))
        .orderBy(photoComments.createdAt);
    }),

  /**
   * Delete comment (admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(photoComments)
        .where(and(eq(photoComments.id, input.id), eq(photoComments.tenantId, getTenantId(ctx))));

      return { success: true };
    }),
});
