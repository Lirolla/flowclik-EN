import { Request, Response } from "express";
import Stripe from "stripe";
import * as db from "../db";
import { subscriptions, subscriptionAddons, tenants } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover" as any,
  });
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handler para webhook do Stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event: Stripe.Event;
  try {
    if (!stripe) throw new Error("Stripe not configured");
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`[Stripe Webhook] Unhandled: ${event.type}`);
    }
    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error:`, error);
    res.status(500).send(`Webhook handler failed: ${error.message}`);
  }
}

/**
 * Checkout completed - criar/atualizar signature ou add-on
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = parseInt(session.metadata?.tenantId || "0");
  const type = session.metadata?.type || "plan";
  const addonType = session.metadata?.addonType;

  if (!tenantId) {
    throw new Error("Missing tenantId in session metadata");
  }

  const dbInstance = await db.getDb();
  if (!dbInstance) throw new Error("Database not available");

  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (type === "addon" && addonType) {
    // ===== ADD-ON: criar record na tabshe subscription_addons =====
    console.log(`[Stripe] Add-on ${addonType} purchased for tenant ${tenantId}`);

    // Buscar subscription principal para pegar o ID
    const [mainSub] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    // Buscar details da subscription do Stripe para pegar period
    if (stripe && stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      
      await dbInstance.insert(subscriptionAddons).values({
        tenantId,
        subscriptionId: mainSub?.id || 0,
        addonType: addonType as "storage" | "galleries",
        stripeSubscriptionId,
        stripePriceId: stripeSub.items.data[0]?.price?.id || "",
        status: "active",
        quantity: 1,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000).toISOString(),
      });
    }

    // Atualizar limites na subscription principal
    await recalculateAddonLimits(dbInstance, tenantId);

    // Atualizar stripeCustomerId se necessary
    if (mainSub && !mainSub.stripeCustomerId) {
      await dbInstance
        .update(subscriptions)
        .set({ stripeCustomerId })
        .where(eq(subscriptions.id, mainSub.id));
    }

  } else {
    // ===== PLANO PRINCIPAL: criar/atualizar subscription =====
    console.log(`[Stripe] Plan basic purchased for tenant ${tenantId}`);

    const [existing] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenantId))
      .limit(1);

    if (existing) {
      await dbInstance
        .update(subscriptions)
        .set({
          plan: "basic" as any,
          status: "active",
          stripeCustomerId,
          stripeSubscriptionId,
          cancelAtPeriodEnd: 0,
        })
        .where(eq(subscriptions.id, existing.id));
    } else {
      await dbInstance.insert(subscriptions).values({
        tenantId,
        plan: "basic" as any,
        status: "active",
        stripeCustomerId,
        stripeSubscriptionId,
        storageLimit: 10737418240,
        galleryLimit: 10,
        extraStorage: 0,
        extraGalleries: 0,
      });
    }
  }
}

/**
 * Subscription atualizada no Stripe
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const dbInstance = await db.getDb();
  if (!dbInstance) throw new Error("Database not available");

  const stripeSubId = subscription.id;
  const newStatus = subscription.status;

  // Verify se is um add-on
  const [addon] = await dbInstance
    .select()
    .from(subscriptionAddons)
    .where(eq(subscriptionAddons.stripeSubscriptionId, stripeSubId))
    .limit(1);

  if (addon) {
    // Atualizar add-on
    await dbInstance
      .update(subscriptionAddons)
      .set({
        status: mapStripeStatus(newStatus),
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .where(eq(subscriptionAddons.id, addon.id));

    await recalculateAddonLimits(dbInstance, addon.tenantId);
  } else {
    // Atualizar plyear principal
    const [mainSub] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
      .limit(1);

    if (mainSub) {
      await dbInstance
        .update(subscriptions)
        .set({
          status: mapStripeStatus(newStatus),
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .where(eq(subscriptions.id, mainSub.id));
    }
  }
}

/**
 * Subscription deleted no Stripe
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbInstance = await db.getDb();
  if (!dbInstance) throw new Error("Database not available");

  const stripeSubId = subscription.id;

  // Verify se is um add-on
  const [addon] = await dbInstance
    .select()
    .from(subscriptionAddons)
    .where(eq(subscriptionAddons.stripeSubscriptionId, stripeSubId))
    .limit(1);

  if (addon) {
    await dbInstance
      .update(subscriptionAddons)
      .set({
        status: "cancelled",
        canceledAt: new Date().toISOString(),
      })
      .where(eq(subscriptionAddons.id, addon.id));

    await recalculateAddonLimits(dbInstance, addon.tenantId);
  } else {
    // Cancel plan principal
    const [mainSub] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
      .limit(1);

    if (mainSub) {
      await dbInstance
        .update(subscriptions)
        .set({
          status: "cancelled",
          canceledAt: new Date().toISOString(),
        })
        .where(eq(subscriptions.id, mainSub.id));
    }
  }
}

/**
 * Invoice paga com sucesso
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const dbInstance = await db.getDb();
  if (!dbInstance) throw new Error("Database not available");

  const stripeSubId = invoice.subscription as string;
  if (!stripeSubId) return;

  // Verify se is add-on
  const [addon] = await dbInstance
    .select()
    .from(subscriptionAddons)
    .where(eq(subscriptionAddons.stripeSubscriptionId, stripeSubId))
    .limit(1);

  if (addon) {
    await dbInstance
      .update(subscriptionAddons)
      .set({ status: "active" })
      .where(eq(subscriptionAddons.id, addon.id));
  } else {
    const [mainSub] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
      .limit(1);

    if (mainSub) {
      await dbInstance
        .update(subscriptions)
        .set({ status: "active" })
        .where(eq(subscriptions.id, mainSub.id));
    }
  }
}

/**
 * Pagamento falhou
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const dbInstance = await db.getDb();
  if (!dbInstance) throw new Error("Database not available");

  const stripeSubId = invoice.subscription as string;
  if (!stripeSubId) return;

  // Verify se is add-on
  const [addon] = await dbInstance
    .select()
    .from(subscriptionAddons)
    .where(eq(subscriptionAddons.stripeSubscriptionId, stripeSubId))
    .limit(1);

  if (addon) {
    await dbInstance
      .update(subscriptionAddons)
      .set({ status: "past_due" })
      .where(eq(subscriptionAddons.id, addon.id));
  } else {
    const [mainSub] = await dbInstance
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubId))
      .limit(1);

    if (mainSub) {
      await dbInstance
        .update(subscriptions)
        .set({ status: "past_due" })
        .where(eq(subscriptions.id, mainSub.id));
    }
  }
}

/**
 * Recalcular limites de add-ons para um tenant
 */
async function recalculateAddonLimits(dbInstance: any, tenantId: number) {
  const activeAddons = await dbInstance
    .select()
    .from(subscriptionAddons)
    .where(and(
      eq(subscriptionAddons.tenantId, tenantId),
      eq(subscriptionAddons.status, "active")
    ));

  const storageAddons = activeAddons.filter((a: any) => a.addonType === "storage").length;
  const galleryAddons = activeAddons.filter((a: any) => a.addonType === "galleries").length;

  await dbInstance
    .update(subscriptions)
    .set({
      extraStorage: storageAddons * 10737418240,
      extraGalleries: galleryAddons * 10,
    })
    .where(eq(subscriptions.tenantId, tenantId));

  console.log(`[Stripe] Recalculated limits for tenant ${tenantId}: +${storageAddons * 10}GB storage, +${galleryAddons * 10} galleries`);
}

/**
 * Mapear status do Stripe para status do banco
 */
function mapStripeStatus(stripeStatus: string): "active" | "past_due" | "cancelled" | "paused" | "trialing" {
  switch (stripeStatus) {
    case "active": return "active";
    case "past_due": return "past_due";
    case "canceled":
    case "cancelled": return "cancelled";
    case "paused": return "paused";
    case "trialing": return "trialing";
    default: return "active";
  }
}
