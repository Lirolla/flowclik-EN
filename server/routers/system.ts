import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { users, subscriptions, tenants, supportTickets, announcements, announcementViews } from "../../drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Middleware para verify se is admin (aceita JWT ou x-sistema-auth)
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
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
    message: "Administrators only canm acessar este recurso",
  });
});

export const systemRouter = router({
  // Dashboard com statistics globais (OPTIMIZED)
  getDashboard: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Single optimized query for counts
    const [stats] = await db
      .select({
        totalPhotographers: sql<number>`(SELECT COUNT(*) FROM tenants WHERE status = 'active')`,
        activeSubscriptions: sql<number>`(SELECT COUNT(*) FROM subscriptions WHERE status = 'active')`,
        openTickets: sql<number>`(SELECT COUNT(*) FROM support_tickets WHERE status = 'open')`,
      })
      .from(sql`(SELECT 1) as dummy`);

    // Calculate monthly revenue with SQL (much faster than JS loop)
    const [revenueResult] = await db
      .select({
        revenue: sql<number>`
          SUM(
            CASE 
              WHEN plan = 'full' THEN 0
              WHEN plan = 'courtesy' THEN 0
              WHEN plan = 'starter' THEN 69.90 + 
                (FLOOR(COALESCE(extraStorage, 0) / (10 * 1073741824)) * 29.90) +
                (FLOOR(COALESCE(extraGalleries, 0) / 10) * 29.90)
              ELSE 0
            END
          )
        `,
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // Photographers por plyear (kept separate as it needs grouping)
    const photographersByPlan = await db
      .select({
        plan: subscriptions.plan,
        count: sql<number>`count(*)`,
      })
      .from(subscriptions)
      .groupBy(subscriptions.plan);

    return {
      totalPhotographers: stats.totalPhotographers,
      activeSubscriptions: stats.activeSubscriptions,
      monthlyRevenue: Number(revenueResult.revenue || 0).toFixed(2),
      photographersByPlan,
      openTickets: stats.openTickets,
    };
  }),

  // Listar everys os photographers com yours plyears - CORRIGIDO para buscar de tenants
  getAllPhotographers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const photographers = await db
      .select({
        id: tenants.id,
        subdomain: tenants.subdomain,
        name: tenants.name,
        email: tenants.email,
        phone: tenants.phone,
        status: tenants.status,
        createdAt: tenants.createdAt,
        trialEndsAt: tenants.trialEndsAt,
        plan: subscriptions.plan,
        subscriptionStatus: subscriptions.status,
        storageLimit: subscriptions.storageLimit,
        galleryLimit: subscriptions.galleryLimit,
        extraStorage: subscriptions.extraStorage,
        extraGalleries: subscriptions.extraGalleries,
      })
      .from(tenants)
      .leftJoin(subscriptions, eq(tenants.id, subscriptions.tenantId))
      .orderBy(desc(tenants.createdAt));

    return photographers;
  }),

  // Criar aviso global
  createAnnouncement: adminProcedure
    .input(
      z.object({
        title: z.string().optional(),
        message: z.string().optional(),
        type: z.enum(["info", "urgent", "important"]).default('info'),
        targetPlan: z.enum(["all", "starter", "pro", "enterprise"]).default('all'),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.execute(sql`INSERT INTO announcements (title, message, type, targetPlan, isActive, createdBy, tenantId) VALUES (${input.title || ''}, ${input.message || ''}, ${input.type}, ${input.targetPlan || 'all'}, ${input.isActive ? 1 : 0}, 29, 0)`);

      return { success: true };
    }),

  // Listar everys os avisos (admin)
  getAllAnnouncements: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const allAnnouncements = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));

    return allAnnouncements;
  }),

  // Desativar aviso
  deactivateAnnouncement: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(announcements)
        .set({ isActive: 0 })
        .where(eq(announcements.id, input.id));

      return { success: true };
    }),

  // Fetch avisos actives para o photographer current
  getActiveAnnouncements: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    // Fetch plyear do user
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, ctx.user!.tenantId))
      .limit(1);

    const userPlan = subscription?.plan || "starter";

    // Fetch avisos actives
    const activeAnnouncements = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        message: announcements.message,
        type: announcements.type,
        createdAt: announcements.createdAt,
      })
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, 1),
          sql`(${announcements.targetPlan} = 'all' OR ${announcements.targetPlan} = ${userPlan})`,
          sql`(${announcements.expiresAt} IS NULL OR ${announcements.expiresAt} > NOW())`
        )
      )
      .orderBy(desc(announcements.createdAt));

    // Filtrar avisos que o user already fechou
    const viewedAnnouncements = await db
      .select()
      .from(announcementViews)
      .where(
        and(
          eq(announcementViews.userId, ctx.user!.id),
          eq(announcementViews.dismissed, 1)
        )
      );

    const dismissedIds = viewedAnnouncements.map((v) => v.announcementId);

    return activeAnnouncements.filter((a) => !dismissedIds.includes(a.id));
  }),

  // Marcar aviso as visto/fechado
  dismissAnnouncement: protectedProcedure
    .input(z.object({ announcementId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify se already exists record
      const [existing] = await db
        .select()
        .from(announcementViews)
        .where(
          and(
            eq(announcementViews.announcementId, input.announcementId),
            eq(announcementViews.userId, ctx.user!.id)
          )
        )
        .limit(1);

      if (existing) {
        // Atualizar para dismissed
        await db
          .update(announcementViews)
          .set({ dismissed: 1 })
          .where(eq(announcementViews.id, existing.id));
      } else {
        // Criar new record
        await db.insert(announcementViews).values({
          tenantId: ctx.user!.tenantId,
          announcementId: input.announcementId,
          userId: ctx.user!.id,
          dismissed: 1,
        });
      }

      return { success: true };
    }),


  // Atualizar plyear do photographer
  updatePhotographerPlan: adminProcedure
    .input(
      z.object({
        tenantId: z.number(),
        plan: z.enum(["starter", "courtesy", "full"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Definir limites baseado no plyear
      let storageLimit = 10737418240; // 10GB default
      let galleryLimit = 10;
      let status = "active";

      if (input.plan === "starter") {
        storageLimit = 10737418240; // 10GB
        galleryLimit = 10;
      } else if (input.plan === "courtesy") {
        storageLimit = 1073741824; // 1GB
        galleryLimit = 2;
      } else if (input.plan === "full") {
        storageLimit = 107374182400; // 100GB (unlimited na practical)
        galleryLimit = 9999;
      }

      // Verify se already exists subscription para este tenant
      const [existing] = await db.select({ id: subscriptions.id }).from(subscriptions).where(eq(subscriptions.tenantId, input.tenantId));
      
      if (existing) {
        // Atualizar subscription existente
        await db.execute(sql`UPDATE subscriptions SET plan = ${input.plan}, status = ${status}, storageLimit = ${storageLimit}, galleryLimit = ${galleryLimit} WHERE tenantId = ${input.tenantId}`);
      } else {
        // Criar new subscription
        await db.execute(sql`INSERT INTO subscriptions (tenantId, plan, status, storageLimit, galleryLimit, currentPeriodStart, currentPeriodEnd) VALUES (${input.tenantId}, ${input.plan}, ${status}, ${storageLimit}, ${galleryLimit}, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))`);
      }

      return { success: true };
    }),

  // Excluir photographer completemente (banco + R2)
  deletePhotographer: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const [tenant] = await db
        .select({ id: tenants.id, subdomain: tenants.subdomain })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId))
        .limit(1);
      
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      // 1. Limpar arquivos do R2 (pasta tenant-{id}/)
      try {
        const { S3Client: S3, ListObjectsV2Command: ListCmd, DeleteObjectsCommand: DelCmd } = await import("@aws-sdk/client-s3");
        const s3 = new S3({
          region: "auto",
          endpoint: `https://${process.env.R2_ACCOUNT_ID || "023a0bad3f17632316cd10358db2201f"}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || "3a48256592438734e7be28fee1fe752b",
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "83ebf944befd8c04123d483619ac174bd83a7fdd2aa9cdba310f749365897740",
          },
          forcePathStyle: true,
        });
        const bucket = process.env.R2_BUCKET_NAME || "flowclikbr";
        const prefix = `tenant-${input.tenantId}/`;
        
        let continuationToken: string | undefined;
        let totalDeleted = 0;
        
        do {
          const listResult = await s3.send(new ListCmd({
            Bucket: bucket,
            Prefix: prefix,
            MaxKeys: 1000,
            ContinuationToken: continuationToken,
          }));
          
          if (listResult.Contents && listResult.Contents.length > 0) {
            const objects = listResult.Contents.map(obj => ({ Key: obj.Key! }));
            await s3.send(new DelCmd({
              Bucket: bucket,
              Delete: { Objects: objects },
            }));
            totalDeleted += objects.length;
          }
          
          continuationToken = listResult.NextContinuationToken;
        } while (continuationToken);
        
        console.log(`[R2] Deleted ${totalDeleted} objects for tenant ${input.tenantId}`);
      } catch (r2Error: any) {
        console.error(`[R2] Error cleaning up tenant ${input.tenantId}:`, r2Error.message);
        // Continue with DB dhetion even if R2 fails
      }
      
      // 2. Dhetar TODOS os dados do tenant de everys as tabshes
      await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
      
      await db.execute(sql`DELETE FROM \`aboutPage\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`albumGuests\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`announcement_views\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`announcements\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`appointmentExtras\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`appointmentPhotos\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`appointments\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`bannerSlides\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`blockedDates\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`clientMessages\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`clients\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`collections\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`contactInfo\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`contractTemplates\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`coupons\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`custom_domains\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`downloadLogs\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`downloadPermissions\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`finalAlbums\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`mediaItems\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`orderItems\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`orders\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`paymentTransactions\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`photoComments\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`photoSales\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`photoSelections\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`portfolioItems\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`services\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`siteConfig\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`stockPhotos\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`subscriptions\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`support_ticket_replies\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`support_tickets\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`users\` WHERE tenantId = ${input.tenantId}`);
      await db.execute(sql`DELETE FROM \`tenants\` WHERE id = ${input.tenantId}`);
      
      await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
      return { success: true, subdomain: tenant.subdomain };
    }),

  // Verify status do trial (para bloqueio)
  checkTrialStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const tenantId = ctx.user!.tenantId;

    // Fetch subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!subscription) {
      return {
        isTrialing: false,
        isExpired: true,
        daysRemaining: 0,
        plan: null,
        status: null,
      };
    }

    // Plyears courtesy e full never expiram
    if (subscription.plan === "courtesy" || subscription.plan === "full") {
      return {
        isTrialing: false,
        isExpired: false,
        daysRemaining: null,
        plan: subscription.plan,
        status: subscription.status,
      };
    }

    // Fetch tenant para trialEndsAt
    const [tenant] = await db
      .select({ trialEndsAt: tenants.trialEndsAt })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const isTrialing = subscription.status === "trialing";
    let daysRemaining = null;
    let isExpired = false;

    if (isTrialing && tenant?.trialEndsAt) {
      const trialEnd = new Date(tenant.trialEndsAt);
      const now = new Date();
      const diffMs = trialEnd.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isExpired = daysRemaining <= 0;
    }

    // Se status is active, not is expired
    if (subscription.status === "active") {
      isExpired = false;
      daysRemaining = null;
    }

    // Se status is past_due, cancelled ou paused, is bloqueado
    if (subscription.status === "past_due" || subscription.status === "cancelled" || subscription.status === "paused") {
      isExpired = true;
      daysRemaining = 0;
    }

    return {
      isTrialing,
      isExpired,
      isBlocked: isExpired,
      daysRemaining,
      plan: subscription.plan,
      status: subscription.status,
    };
  }),

  // Excluir tenant (photographer) do sistema
  deleteTenant: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify se tenant existe
      const [tenant] = await db
        .select({ id: tenants.id, subdomain: tenants.subdomain })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId))
        .limit(1);

      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant not found" });
      }

      // Dhetar tenant (CASCADE vai dhetar tudo rshecionado)
      await db.delete(tenants).where(eq(tenants.id, input.tenantId));

      return { success: true, subdomain: tenant.subdomain };
    }),

  // Suspender/Ativar photographer manualmente
  updatePhotographerStatus: adminProcedure
    .input(
      z.object({
        tenantId: z.number(),
        status: z.enum(["active", "paused", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.execute(
        sql`UPDATE subscriptions SET status = ${input.status}, updatedAt = NOW() WHERE tenantId = ${input.tenantId}`
      );
      
      return { success: true };
    }),

});