import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { photoSales, appointments, medayItems, stockPhotos } from "../../drizzle/schema";
import { 
  createPhotoCheckoutSession, 
  createAppointmentCheckoutSession,
  generateDownloadToken 
} from "../stripe";
import { eq , and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const paymentsRouter = router({
  /**
   * Create checkout session for photo purchase
   */
  createPhotoCheckout: publicProcedure
    .input(
      z.object({
        photoId: z.number(),
        productType: z.enum(["digital"]).default('digital'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get photo details
      const photoResult = await db
        .select()
        .from(stockPhotos)
        .where(and(eq(stockPhotos.id, input.photoId), eq(stockPhotos.tenantId, getTenantId(ctx))))
        .limit(1);
      
      const photo = photoResult[0];

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      // Check if photo has price
      if (!photo.price || photo.price === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta foto not is available para venda",
        });
      }

      // Calculate total price with customizations
      let totalPrice = Math.round(photo.price * 100); // Base price in cents

      // Build product description
      let productDescription = "Foto Digital (Alta Resolução)";

      // Create Stripe checkout session
      const session = await createPhotoCheckoutSession({
        photoId: photo.id,
        photoTitle: photo.title || `Foto #${photo.id}`,
        photoDescription: productDescription,
        photoUrl: photo.thumbnailUrl || photo.originalUrl,
        amount: totalPrice,
        successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pagamento/cancelled`,
      });

      // Create pending photo sale record
      await db.insert(photoSales).values({
        tenantId: getTenantId(ctx),
        photoId: photo.id,
        buyerEmail: "pending@checkout.com", // Will be updated by webhook
        buyerName: "Pending",
        amount: totalPrice,
        stripeSessionId: session.id,
        status: "pending",
        productType: input.productType,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Create checkout session for appointment payment
   */
  createAppointmentCheckout: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        amount: z.number(), // in GBP (will be converted to cents)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get appointment details
      const appointmentResult = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);
      
      const appointment = appointmentResult[0];

      if (!appointment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Appointment not found",
        });
      }

      // Only admin can create payment links
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Administrators only canm enviar links de pagamento",
        });
      }

      // Create Stripe checkout session
      const session = await createAppointmentCheckoutSession({
        appointmentId: appointment.id,
        serviceName: `Service Fotográfico - ${appointment.clientName}`,
        amount: Math.round(input.amount * 100), // Convert to cents
        clientEmail: appointment.clientEmail,
        clientName: appointment.clientName,
        successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pagamento/cancelled`,
      });

      // Update appointment with payment info
      await db
        .update(appointments)
        .set({
          finalPrice: Math.round(input.amount * 100),
          stripeSessionId: session.id,
          paymentStatus: "awaiting_payment",
          status: "awaiting_payment",
        })
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Get photo sale by download token
   */
  getPhotoSaleByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const saleResult = await db
        .select()
        .from(photoSales)
        .where(and(eq(photoSales.downloadToken, input.token), eq(photoSales.tenantId, getTenantId(ctx))))
        .limit(1);
      
      const sale = saleResult[0];

      if (!sale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link de download invalid ou expired",
        });
      }

      // Check if token is expired
        // @ts-ignore
      if (sale.downloadExpiresAt && new Date() > sale.downloadExpiresAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Link de download expired",
        });
      }

      // Get photo details
      const photoResult = await db
        .select()
        .from(medayItems)
        .where(and(eq(medayItems.id, sale.photoId), eq(medayItems.tenantId, getTenantId(ctx))))
        .limit(1);
      
      const photo = photoResult[0];

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      // Increment download count
      await db
        .update(photoSales)
        .set({
          downloadCount: (sale.downloadCount || 0) + 1,
        })
        .where(and(eq(photoSales.id, sale.id), eq(photoSales.tenantId, getTenantId(ctx))));

      return {
        sale,
        photo,
      };
    }),

  /**
   * Get all photo sales (admin only)
   */
  getAllPhotoSales: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Access denied",
      });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const sales = await db
      .select()
      .from(photoSales)
      .where(eq(photoSales.tenantId, getTenantId(ctx)))
      .orderBy((t) => t.createdAt);

    return sales;
  }),
});
