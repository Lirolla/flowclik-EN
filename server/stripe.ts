import Stripe from "stripe";
import { ENV } from "./_core/env";

// Stripe desabilitado temporarily - configure STRIPE_SECRET_KEY para habilitar
let stripe: Stripe | null = null;

if (ENV.stripeSecretKey) {
  stripe = new Stripe(ENV.stripeSecretKey, {
    apiVersion: "2026-01-28.clover",
    typescript: true,
  });
}

export { stripe };

/**
 * Create a Stripe checkout session for photo purchase
 */
export async function createPhotoCheckoutSession({
  photoId,
  photoTitle,
  photoDescription,
  photoUrl,
  amount, // in cents
  successUrl,
  cancelUrl,
}: {
  photoId: number;
  photoTitle: string;
  photoDescription?: string;
  photoUrl: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: photoTitle,
            description: photoDescription || "Foto em alta resolution",
            images: [photoUrl],
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: "photo_sale",
      photoId: photoId.toString(),
    },
  });

  return session;
}

/**
 * Create a Stripe checkout session for multiple photos
 */
export async function createMultiPhotoCheckoutSession({
  photos,
  collectionId,
  collectionName,
  successUrl,
  cancelUrl,
}: {
  photos: Array<{
    id: number;
    title: string;
    thumbnailUrl: string;
    price: number; // in cents
  }>;
  collectionId: number;
  collectionName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: photos.map(photo => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: photo.title || `Foto #${photo.id}`,
          description: `Foto da galeria: ${collectionName}`,
          images: [photo.thumbnailUrl],
        },
        unit_amount: photo.price,
      },
      quantity: 1,
    })),
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: "multi_photo_sale",
      collectionId: collectionId.toString(),
      photoIds: photos.map(p => p.id).join(","),
    },
  });

  return session;
}

/**
 * Create a Stripe checkout session for appointment payment
 */
export async function createAppointmentCheckoutSession({
  appointmentId,
  serviceName,
  amount, // in cents
  clientEmail,
  clientName,
  successUrl,
  cancelUrl,
}: {
  appointmentId: number;
  serviceName: string;
  amount: number;
  clientEmail: string;
  clientName: string;
  successUrl: string;
   cancelUrl: string;
}) {
  if (!stripe) throw new Error("Stripe not configured");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: `Agendamento: ${serviceName}`,
            description: "Photography service payment",
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: "appointment_payment",
      appointmentId: appointmentId.toString(),
      clientName,
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Generate a secure random token for download links
 */
export function generateDownloadToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
