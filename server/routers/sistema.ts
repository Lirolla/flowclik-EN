import { z } from "zod";
import { sendTicketReplyNotification } from "../_core/emailTemplates";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { supportTickets, supportTicketReplies, users, tenants, subscriptions, collections } from "../../drizzle/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Middleware para painel do sistema (admin)
const sistemaProcedure = publicProcedure.use(({ ctx, next }) => {
  // Check 1: JWT auth with admin/master role
  if (ctx.user?.role === "admin" || ctx.user?.role === "master") {
    return next({ ctx });
  }
  // Check 2: Sistema auth header (from /system panel)
  const sistemaAuth = ctx.req.headers["x-sistema-auth"];
  if (sistemaAuth === "admin_master_authenticated") {
    return next({ ctx });
  }
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Access denied. Apenas super administradores canm acessar esta feature.",
  });
});

export const sistemaRouter = router({
  // Dashboard - Estatísticas gerais
  getDashboardStats: sistemaProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Total tenants
    const [{ totalTenants }] = await db
      .select({ totalTenants: count() })
      .from(tenants);

    // Total de signatures ativas
    const [{ activeSubscriptions }] = await db
      .select({ activeSubscriptions: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // Total de tickets abertos
    const [{ openTickets }] = await db
      .select({ openTickets: count() })
      .from(supportTickets)
      .where(eq(supportTickets.status, "open"));

    // Total de galerias criadas
    const [{ totalGalleries }] = await db
      .select({ totalGalleries: count() })
      .from(collections);

    // Lasts tenants cadastrados
    const recentTenants = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        subdomain: tenants.subdomain,
        email: tenants.email,
        createdAt: tenants.createdAt,
      })
      .from(tenants)
      .orderBy(desc(tenants.createdAt))
      .limit(5);

    return {
      totalTenants,
      activeSubscriptions,
      openTickets,
      totalGalleries,
      recentTenants,
    };
  }),

  // Listar TODOS os tickets (de todos os tenants)
  getAllTickets: sistemaProcedure
    .input(
      z
        .object({
          status: z.enum(["all", "open", "in_progress", "resolved", "closed"]).default("all"),
          limit: z.number().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const filters = input?.status && input.status !== "all" 
        ? eq(supportTickets.status, input.status)
        : undefined;

      const tickets = await db
        .select({
          id: supportTickets.id,
          tenantId: supportTickets.tenantId,
          subject: supportTickets.subject,
          status: supportTickets.status,
          priority: supportTickets.priority,
          createdAt: supportTickets.createdAt,
          lastReplyAt: supportTickets.lastReplyAt,
          tenantName: tenants.name,
          tenantSubdomain: tenants.subdomain,
          userName: users.name,
          userEmail: users.email,
        })
        .from(supportTickets)
        .leftJoin(tenants, eq(supportTickets.tenantId, tenants.id))
        .leftJoin(users, eq(supportTickets.userId, users.id))
        .where(filters)
        .orderBy(desc(supportTickets.createdAt))
        .limit(input?.limit || 50);

      return tickets;
    }),

  // Ver details de qualquer ticket (sem filtro de tenant)
  getTicketById: sistemaProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Buscar ticket
      const [ticket] = await db
        .select({
          id: supportTickets.id,
          tenantId: supportTickets.tenantId,
          subject: supportTickets.subject,
          message: supportTickets.message,
          status: supportTickets.status,
          priority: supportTickets.priority,
          createdAt: supportTickets.createdAt,
          lastReplyAt: supportTickets.lastReplyAt,
          resolvedAt: supportTickets.resolvedAt,
          tenantName: tenants.name,
          tenantSubdomain: tenants.subdomain,
          userName: users.name,
          userEmail: users.email,
        })
        .from(supportTickets)
        .leftJoin(tenants, eq(supportTickets.tenantId, tenants.id))
        .leftJoin(users, eq(supportTickets.userId, users.id))
        .where(eq(supportTickets.id, input.ticketId))
        .limit(1);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Buscar TODAS as respostas (incluindo notas internas)
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
        .where(eq(supportTicketReplies.ticketId, input.ticketId))
        .orderBy(supportTicketReplies.createdAt);

      return {
        ticket,
        replies,
      };
    }),

  // Super admin respwhere ticket
  replyToTicket: sistemaProcedure
    .input(
      z.object({
        ticketId: z.number(),
        message: z.string().min(1, "Mensagem not can estar vazia"),
        isInternal: z.boolean().default(false), // Nota interna (só super admin vê)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify se ticket existe
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, input.ticketId))
        .limit(1);

      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      // Adicionar resposta
      await db.insert(supportTicketReplies).values({
        tenantId: ticket.tenantId, // Herdar tenantId do ticket
        ticketId: input.ticketId,
        userId: ctx.user?.id || 29,
        message: input.message,
        isInternal: input.isInternal ? 1 : 0,
      });

      // Atualizar ticket (only se not for nota interna)
      if (!input.isInternal) {
        const userId = ctx.user?.id || 29;
        await db.execute(sql`UPDATE support_tickets SET status = 'in_progress', lastReplyAt = NOW(), lastReplyBy = ${userId} WHERE id = ${input.ticketId}`);
      }

      // Enviar email de notification ao photographer (se not for nota interna)
      if (!input.isInternal) {
        try {
          const [ticketUser] = await db.select().from(users).where(eq(users.id, ticket.userId)).limit(1);
          if (ticketUser?.email) {
            sendTicketReplyNotification({
              photographerEmail: ticketUser.email,
              photographerName: ticketUser.name || 'Photographer',
              ticketSubject: ticket.subject,
              responsePreview: input.message.substring(0, 200),
            }).catch(err => console.error('Erro email reply ticket:', err));
          }
        } catch (emailErr) {
          console.error('Erro ao enviar email reply:', emailErr);
        }
      }

      return { success: true };
    }),

  // Marcar ticket as resolvido
  resolveTicket: sistemaProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userId = ctx.user?.id || 29;
      await db.execute(sql`UPDATE support_tickets SET status = 'resolved', resolvedAt = NOW(), resolvedBy = ${userId} WHERE id = ${input.ticketId}`);

      return { success: true };
    }),

  // Listar todos os tenants
  getAllTenants: sistemaProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const tenantsData = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        subdomain: tenants.subdomain,
        email: tenants.email,
        status: tenants.status,
        createdAt: tenants.createdAt,
        plan: subscriptions.plan,
        subscriptionStatus: subscriptions.status,
        storageLimit: subscriptions.storageLimit,
        galleryLimit: subscriptions.galleryLimit,
      })
      .from(tenants)
      .leftJoin(subscriptions, eq(tenants.id, subscriptions.tenantId))
      .orderBy(desc(tenants.createdAt));

    return tenantsData;
  }),
});
