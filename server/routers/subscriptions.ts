import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import Stripe from "stripe";
import { getDb, getTenantId } from "../db";
import * as db from "../db";
import { subscriptions, tenants, subscriptionAddons } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// Initializar Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover" as any,
  });
}

// Price IDs dos produtos Stripe (Produção BR)
const PRICE_IDS = {
  PLAN_BASIC: "price_1T35MO3qmmbjfC9dAO6yM22s",      // £ 69,90/month
  ADDON_STORAGE: "price_1T35MR3qmmbjfC9dfpfFrAKJ",    // £ 29,90/month (+10GB)
  ADDON_GALLERIES: "price_1T35MV3qmmbjfC9dGHxfo7cB",  // £ 29,90/month (+10 galerias)
};

export const subscriptionsRouter = router({
  /**
   * Obter signature atual do tenant
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = db.getTenantId(ctx);
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    const [subscription] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    return subscription || null;
  }),

  /**
   * Obter add-ons actives do tenant
   */
  getActiveAddons: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = db.getTenantId(ctx);
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    const addons = await dbInstance
      .select()
      .from(subscriptionAddons)
      .where(and(
        eq(subscriptionAddons.tenantId, tenantId),
        eq(subscriptionAddons.status, "active")
      ));

    return addons;
  }),

  /**
   * Criar sesare de checkout para plyear basic (£ 69,90/month)
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      successUrl: z.string(),
      cancelUrl: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = db.getTenantId(ctx);
      const user = ctx.user!;

      if (!stripe) throw new Error("Stripe not configured");

      // Verify se already tem customer no Stripe
      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");

      const [subscription] = await dbInstance
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      let customerEmail = user.email;

      // Se already tem customer ID, usar ele
      const sessionParams: any = {
        mode: "subscription",
        line_items: [{ price: PRICE_IDS.PLAN_BASIC, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          tenantId: tenantId.toString(),
          userId: user.id.toString(),
          plan: "basic",
          type: "plan",
        },
        payment_method_types: ["card"],
        locale: "en-GB",
      };

      if (subscription?.stripeCustomerId) {
        sessionParams.customer = subscription.stripeCustomerId;
      } else {
        sessionParams.customer_email = customerEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Comprar add-on de storage (+10GB) - cria signature separada
   */
  buyStorageAddon: protectedProcedure
    .input(z.object({
      successUrl: z.string(),
      cancelUrl: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = db.getTenantId(ctx);
      const user = ctx.user!;

      if (!stripe) throw new Error("Stripe not configured");

      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");

      // Verify se tem plyear active
      const [subscription] = await dbInstance
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      if (!subscription || (subscription.status !== "active" && subscription.plan !== "courtesy" && subscription.plan !== "full")) {
        throw new Error("You needs ter um plyear active para comprar add-ons");
      }

      const sessionParams: any = {
        mode: "subscription",
        line_items: [{ price: PRICE_IDS.ADDON_STORAGE, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          tenantId: tenantId.toString(),
          userId: user.id.toString(),
          addonType: "storage",
          type: "addon",
        },
        payment_method_types: ["card"],
        locale: "en-GB",
      };

      if (subscription?.stripeCustomerId) {
        sessionParams.customer = subscription.stripeCustomerId;
      } else {
        sessionParams.customer_email = user.email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Comprar add-on de galerias (+10 galerias) - cria signature separada
   */
  buyGalleriesAddon: protectedProcedure
    .input(z.object({
      successUrl: z.string(),
      cancelUrl: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = db.getTenantId(ctx);
      const user = ctx.user!;

      if (!stripe) throw new Error("Stripe not configured");

      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");

      // Verify se tem plyear active
      const [subscription] = await dbInstance
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      if (!subscription || (subscription.status !== "active" && subscription.plan !== "courtesy" && subscription.plan !== "full")) {
        throw new Error("You needs ter um plyear active para comprar add-ons");
      }

      const sessionParams: any = {
        mode: "subscription",
        line_items: [{ price: PRICE_IDS.ADDON_GALLERIES, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: {
          tenantId: tenantId.toString(),
          userId: user.id.toString(),
          addonType: "galleries",
          type: "addon",
        },
        payment_method_types: ["card"],
        locale: "en-GB",
      };

      if (subscription?.stripeCustomerId) {
        sessionParams.customer = subscription.stripeCustomerId;
      } else {
        sessionParams.customer_email = user.email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Cancelar add-on individual (com verification de uso)
   */
  cancelAddon: protectedProcedure
    .input(z.object({
      addonId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = db.getTenantId(ctx);

      if (!stripe) throw new Error("Stripe not configured");

      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");

      // Buscar o add-on
      const [addon] = await dbInstance
        .select()
        .from(subscriptionAddons)
        .where(and(
          eq(subscriptionAddons.id, input.addonId),
          eq(subscriptionAddons.tenantId, tenantId)
        ))
        .limit(1);

      if (!addon) throw new Error("Add-on not found");

      // Verify uso before de cancelar
      const { medayItems, collections } = await import("../../drizzle/schema");

      if (addon.addonType === "storage") {
        // Verify se o storage extra is sendo usado
        const [photoCount] = await dbInstance
          .select({ count: sql<number>`count(*)` })
          .from(medayItems)
          .where(eq(medayItems.tenantId, tenantId));
        const totalPhotos = Number(photoCount.count || 0);
        const storageUsed = totalPhotos * 5 * 1024 * 1024; // 5MB por foto

        // Buscar subscription para ver limites base
        const [subscription] = await dbInstance
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.tenantId, tenantId))
          .limit(1);

        // Contar outros add-ons de storage actives (exceto este)
        const otherStorageAddons = await dbInstance
          .select()
          .from(subscriptionAddons)
          .where(and(
            eq(subscriptionAddons.tenantId, tenantId),
            eq(subscriptionAddons.addonType, "storage"),
            eq(subscriptionAddons.status, "active")
          ));
        const otherStorageCount = otherStorageAddons.filter(a => a.id !== addon.id).length;
        const storageAfterCancel = (subscription?.storageLimit || 10737418240) + (otherStorageCount * 10737418240);

        if (storageUsed > storageAfterCancel) {
          throw new Error("Not é possible cancelar este add-on. Seu armazenamento usado excede o limite sem ele. Libere espaço first.");
        }
      }

      if (addon.addonType === "galleries") {
        // Verify se as galerias extras estão sendo usadas
        const [galleryCount] = await dbInstance
          .select({ count: sql<number>`count(*)` })
          .from(collections)
          .where(eq(collections.tenantId, tenantId));
        const galleriesUsed = Number(galleryCount.count || 0);

        const [subscription] = await dbInstance
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.tenantId, tenantId))
          .limit(1);

        // Contar outros add-ons de galerias actives (exceto este)
        const otherGalleryAddons = await dbInstance
          .select()
          .from(subscriptionAddons)
          .where(and(
            eq(subscriptionAddons.tenantId, tenantId),
            eq(subscriptionAddons.addonType, "galleries"),
            eq(subscriptionAddons.status, "active")
          ));
        const otherGalleryCount = otherGalleryAddons.filter(a => a.id !== addon.id).length;
        const galleriesAfterCancel = (subscription?.galleryLimit || 10) + (otherGalleryCount * 10);

        if (galleriesUsed > galleriesAfterCancel) {
          throw new Error("Not é possible cancelar este add-on. Your galleries usadas excedem o limite sem ele. Remova galerias first.");
        }
      }

      // Cancelar no Stripe (no final do period)
      await stripe.subscriptions.update(addon.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Atualizar no banco
      await dbInstance
        .update(subscriptionAddons)
        .set({
          status: "cancelled",
          canceledAt: new Date().toISOString(),
        })
        .where(eq(subscriptionAddons.id, addon.id));

      return { success: true };
    }),

  /**
   * Cancel plan basic
   */
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const tenantId = db.getTenantId(ctx);

    if (!stripe) throw new Error("Stripe not configured");

    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    const [subscription] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error("Subscription not found");
    }

    // Cancelar no Stripe (no final do period)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await dbInstance
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: 1 })
      .where(eq(subscriptions.id, subscription.id));

    return { success: true };
  }),

  /**
   * Reativar signature cancelada
   */
  reactivate: protectedProcedure.mutation(async ({ ctx }) => {
    const tenantId = db.getTenantId(ctx);

    if (!stripe) throw new Error("Stripe not configured");

    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    const [subscription] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error("Subscription not found");
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await dbInstance
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: 0 })
      .where(eq(subscriptions.id, subscription.id));

    return { success: true };
  }),

  /**
   * Obter portal de gerenciamento do cliente Stripe
   */
  createWhytalSession: protectedProcedure
    .input(z.object({ returnUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = db.getTenantId(ctx);

      if (!stripe) throw new Error("Stripe not configured");

      const dbInstance = await getDb();
      if (!dbInstance) throw new Error("Database not available");

      const [subscription] = await dbInstance
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .limit(1);

      if (!subscription || !subscription.stripeCustomerId) {
        throw new Error("Cliente Stripe not found");
      }

      const session = await stripe.billingWhytal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return { url: session.url };
    }),

  /**
   * Verify status do trial do tenant atual
   */
  checkTrialStatus: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = db.getTenantId(ctx);
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    const [subscription] = await dbInstance
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

    // Se is suspended, cancelled ou inadimplente, bloquear
    if (subscription.status === "paused" || subscription.status === "cancelled" || subscription.status === "past_due") {
      return {
        isTrialing: false,
        isExpired: true,
        daysRemaining: 0,
        plan: subscription.plan,
        status: subscription.status,
      };
    }

    // Se already is active (pagou), not is expired
    if (subscription.status === "active") {
      return {
        isTrialing: false,
        isExpired: false,
        daysRemaining: null,
        plan: subscription.plan,
        status: subscription.status,
      };
    }

    // Buscar tenant para trialEndsAt
    const [tenant] = await dbInstance
      .select({ trialEndsAt: tenants.trialEndsAt })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    const isTrialing = subscription.status === "trialing";
    let daysRemaining: number | null = null;
    let isExpired = false;

    if (isTrialing && tenant?.trialEndsAt) {
      const trialEnd = new Date(tenant.trialEndsAt);
      const now = new Date();
      const diffMs = trialEnd.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isExpired = daysRemaining <= 0;
    } else if (isTrialing && !tenant?.trialEndsAt) {
      isExpired = true;
      daysRemaining = 0;
    }

    return {
      isTrialing,
      isExpired,
      daysRemaining,
      plan: subscription.plan,
      status: subscription.status,
    };
  }),

  /**
   * Obter summary complete de signature + add-ons + uso
   */
  getSubscriptionSummary: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = db.getTenantId(ctx);
    const dbInstance = await getDb();
    if (!dbInstance) throw new Error("Database not available");

    // Buscar subscription
    const [subscription] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    // Buscar add-ons actives
    const addons = await dbInstance
      .select()
      .from(subscriptionAddons)
      .where(and(
        eq(subscriptionAddons.tenantId, tenantId),
        eq(subscriptionAddons.status, "active")
      ));

    // Calcular limites totais
    const baseStorage = subscription?.storageLimit || 10737418240; // 10GB
    const baseGalleries = subscription?.galleryLimit || 10;
    const storageAddonsCount = addons.filter(a => a.addonType === "storage").length;
    const galleryAddonsCount = addons.filter(a => a.addonType === "galleries").length;
    const totalStorageLimit = baseStorage + (storageAddonsCount * 10737418240);
    const totalGalleryLimit = baseGalleries + (galleryAddonsCount * 10);

    // Calcular uso atual
    const { medayItems, collections } = await import("../../drizzle/schema");

    const [photoCount] = await dbInstance
      .select({ count: sql<number>`count(*)` })
      .from(medayItems)
      .where(eq(medayItems.tenantId, tenantId));
    const totalPhotos = Number(photoCount.count || 0);
    const storageUsed = totalPhotos * 5 * 1024 * 1024;

    const [galleryCount] = await dbInstance
      .select({ count: sql<number>`count(*)` })
      .from(collections)
      .where(eq(collections.tenantId, tenantId));
    const galleriesUsed = Number(galleryCount.count || 0);

    return {
      subscription,
      addons,
      limits: {
        totalStorageLimit,
        totalGalleryLimit,
        storageUsed,
        galleriesUsed,
        totalPhotos,
        storageAddonsCount,
        galleryAddonsCount,
      },
    };
  }),
});
