import Stripe from "stripe";
import { Request, Response } from "express";

// Stripe desabilitado temporarily
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  });
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    // Criar line items para Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.title,
          description: "Download digital de foto profissional",
        },
        unit_amount: item.price, // Price already is em centavos
      },
      quantity: item.quantity || 1,
    }));

    // Criar sessao de checkout
    if (!stripe) throw new Error("Stripe not configured");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/cart`,
      metadata: {
        items: JSON.stringify(items.map((item: any) => ({ id: item.id, quantity: item.quantity }))),
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: error.message });
  }
}
