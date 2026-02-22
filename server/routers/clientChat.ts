import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { clientMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const clientChatRouter = router({
  /**
   * Get all messages for an appointment (public - client can see their own)
   */
  getMessages: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const messages = await db
        .select()
        .from(clientMessages)
        .where(and(eq(clientMessages.appointmentId, input.appointmentId), eq(clientMessages.tenantId, getTenantId(ctx))))
        .orderBy(clientMessages.createdAt);
      
      return messages;
    }),

  /**
   * Send a message (both client and admin can send)
   */
  sendMessage: publicProcedure
    .input(z.object({
      appointmentId: z.number(),
      senderId: z.number(),
      senderRole: z.enum(["admin", "client"]),
      message: z.string().min(1),
      fileUrl: z.string().optional(),
      fileName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [newMessage] = await db.insert(clientMessages).values({
        tenantId: getTenantId(ctx),
        appointmentId: input.appointmentId,
        senderId: input.senderId,
        senderRole: input.senderRole,
        message: input.message,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        isRead: 0,
      });

      return { success: true, messageId: newMessage.insertId };
    }),

  /**
   * Mark messages as read
   */
  markAsRead: publicProcedure
    .input(z.object({
      appointmentId: z.number(),
      role: z.enum(["admin", "client"]), // Mark messages from the OTHER role as read
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Mark all unread messages from the opposite role as read
      const oppositeRole = input.role === "admin" ? "client" : "admin";
      
      await db
        .update(clientMessages)
        .set({ isRead: 1 })
        .where(
          and(
            eq(clientMessages.appointmentId, input.appointmentId),
            eq(clientMessages.tenantId, getTenantId(ctx)),
            eq(clientMessages.senderRole, oppositeRole),
            eq(clientMessages.isRead, 0)
          )
        );

      return { success: true };
    }),

  /**
   * Get unread count for admin (messages from clients for specific appointment)
   */
  getUnreadCountAdmin: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const unreadMessages = await db
        .select()
        .from(clientMessages)
        .where(
          and(
            eq(clientMessages.appointmentId, input.appointmentId),
            eq(clientMessages.tenantId, getTenantId(ctx)),
            eq(clientMessages.senderRole, "client"),
            eq(clientMessages.isRead, 0)
          )
        );

      return { count: unreadMessages.length };
    }),

  /**
   * Get unread count for client (messages from admin for specific appointment)
   */
  getUnreadCountClient: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const unreadMessages = await db
        .select()
        .from(clientMessages)
        .where(
          and(
            eq(clientMessages.appointmentId, input.appointmentId),
            eq(clientMessages.tenantId, getTenantId(ctx)),
            eq(clientMessages.senderRole, "admin"),
            eq(clientMessages.isRead, 0)
          )
        );

      return { count: unreadMessages.length };
    }),

  /**
   * Get all conversations with preview (admin only)
   */
  getAllConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { appointments, services } = await import('../../drizzle/schema');
      const { sql } = await import('drizzle-orm');
      
      // Get all appointments that have messages (filtered by tenant)
      const appointmentsWithMessages = await db
        .select({
          id: appointments.id,
          clientName: appointments.clientName,
          clientEmail: appointments.clientEmail,
          serviceId: appointments.serviceId,
        })
        .from(appointments)
        .innerJoin(clientMessages, eq(clientMessages.appointmentId, appointments.id))
        .where(eq(appointments.tenantId, getTenantId(ctx)))
        .groupBy(appointments.id);

      // For each appointment, get details
      const conversations = await Promise.all(
        appointmentsWithMessages.map(async (apt) => {
          // Get service name
          const [service] = await db
            .select({ name: services.name })
            .from(services)
        // @ts-ignore
            .where(and(eq(services.id, apt.serviceId), eq(services.tenantId, getTenantId(ctx))));

          // Get last message
          const [lastMsg] = await db
            .select()
            .from(clientMessages)
            .where(and(eq(clientMessages.appointmentId, apt.id), eq(clientMessages.tenantId, getTenantId(ctx))))
            .orderBy(desc(clientMessages.createdAt))
            .limit(1);

          // Get unread count
          const unreadMsgs = await db
            .select()
            .from(clientMessages)
            .where(
              and(
                eq(clientMessages.appointmentId, apt.id),
                eq(clientMessages.tenantId, getTenantId(ctx)),
                eq(clientMessages.senderRole, "client"),
                eq(clientMessages.isRead, 0)
              )
            );

          return {
            appointmentId: apt.id,
            clientName: apt.clientName,
            clientEmail: apt.clientEmail,
            serviceName: service?.name || "Service",
            lastMessage: lastMsg?.message || "",
            lastMessageTime: lastMsg?.createdAt || null,
            lastMessageSender: lastMsg?.senderRole || "client",
            unreadCount: unreadMsgs.length,
          };
        })
      );

      // Sort by last message time
      conversations.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      return conversations;
    }),

  /**
   * Get unread count for admin (total across all conversations)
   */
  getTotalUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { sql } = await import('drizzle-orm');
      
      const [result] = await db
        .select({
          total: sql<number>`COUNT(*)`,
        })
        .from(clientMessages)
        .where(
          and(
            eq(clientMessages.tenantId, getTenantId(ctx)),
            eq(clientMessages.senderRole, "client"),
            eq(clientMessages.isRead, 0)
          )
        );
      
      return result?.total || 0;
    }),
});
