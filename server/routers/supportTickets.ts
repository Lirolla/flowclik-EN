import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { supportTickets, supportTicketReplies, users } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";
import { sendAdminNewTicketEmail } from "../_core/emailTemplates";

export const supportTicketsRouter = router({
  // Photographer cria ticket
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5, "Assunto must ter pelo menos 5 caracteres"),
        message: z.string().min(10, "Mensagem must ter pelo menos 10 caracteres"),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Criar ticket
      const [result] = await db.insert(supportTickets).values({
        tenantId,
        userId: ctx.user!.id,
        subject: input.subject,
        message: input.message,
        priority: input.priority,
        status: "open",
      });

      // Notificar owner
      await notifyOwner({
        title: `🎫 New Ticket #${result.insertId}`,
        content: `**Tenant:** ${tenantId}\n**Assunto:** ${input.subject}\n**Prioridade:** ${input.priority}\n\n${input.message.substring(0, 200)}...`,
      });

      // Enviar email para admin
      try {
        const [user] = await db.select().from(users).where(eq(users.id, ctx.user!.id)).limit(1);
        sendAdminNewTicketEmail({
          photographerName: user?.name || 'Photographer',
          email: user?.email || '',
          subject: input.subject,
          message: input.message,
        }).catch(err => console.error('Erro email novo ticket:', err));
      } catch (emailErr) {
        console.error('Erro ao enviar email ticket:', emailErr);
      }

      return { ticketId: result.insertId };
    }),

  // Photographer busca seus tickets
  getMyTickets: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.tenantId, tenantId))
      .orderBy(desc(supportTickets.createdAt));

    return tickets;
  }),

  // Photographer busca details de um ticket
  getTicketById: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input, ctx }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar ticket
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.id, input.ticketId),
            eq(supportTickets.tenantId, tenantId) // Ensure que é do tenant correto
          )
        )
        .limit(1);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Buscar respostas (excluir notas internas se not for super admin)
      const replies = await db
        .select({
          id: supportTicketReplies.id,
          message: supportTicketReplies.message,
          createdAt: supportTicketReplies.createdAt,
          isInternal: supportTicketReplies.isInternal,
          userName: users.name,
          userEmail: users.email,
        })
        .from(supportTicketReplies)
        .leftJoin(users, eq(supportTicketReplies.userId, users.id))
        .where(
          and(
            eq(supportTicketReplies.ticketId, input.ticketId),
            // Hide notas internas se not for super admin
            ctx.user!.role === "admin" 
              ? eq(supportTicketReplies.isInternal, 0)
              : undefined
          )
        )
        .orderBy(supportTicketReplies.createdAt);

      return {
        ticket,
        replies,
      };
    }),

  // Photographer adiciona resposta ao ticket
  addReply: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        message: z.string().min(10, "Mensagem must ter pelo menos 10 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify se ticket pertence ao tenant
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.id, input.ticketId),
            eq(supportTickets.tenantId, tenantId)
          )
        )
        .limit(1);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Adicionar resposta
      await db.insert(supportTicketReplies).values({
        tenantId: tenantId,
        ticketId: input.ticketId,
        userId: ctx.user!.id,
        message: input.message,
        isInternal: 0,
      });

      // Atualizar ticket
      await db
        .update(supportTickets)
        .set({
          lastReplyAt: new Date().toISOString(),
          lastReplyBy: ctx.user!.id,
          status: "in_progress",
        })
        .where(eq(supportTickets.id, input.ticketId));

      // Notificar owner
      await notifyOwner({
        title: `💬 Nova resposta no Ticket #${input.ticketId}`,
        content: `**Assunto:** ${ticket.subject}\n\n${input.message.substring(0, 200)}...`,
      });

      return { success: true };
    }),
});
