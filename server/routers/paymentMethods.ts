import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { appointments, paymentTransactions, siteConfig, appointmentExtras } from "../../drizzle/schema";
import { eq , and } from "drizzle-orm";
import { sendPaymentConfirmationEmail } from "../_core/emailTemplates";
import { notifyOwner } from "../_core/notification";

export const paymentMethodsRouter = router({
  /**
   * Get available payment methods from site config
   */
  getAvailableMethods: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {
      cash: false,
      bankTransfer: false,
      pix: false,
      paymentLink: false,
    };

    const config = await db.select().from(siteConfig).limit(1)
      .where(eq(siteConfig.tenantId, getTenantId(ctx)))
    
    if (!config[0]) {
      return {
        cash: false,
        bankTransfer: false,
        pix: false,
        paymentLink: false,
      };
    }

    return {
      cash: config[0].paymentCashEnabled,
      cashInstructions: config[0].paymentCashInstructions,
      bankTransfer: config[0].paymentBankTransferEnabled,
      bankDetails: config[0].paymentBankDetails,
      pix: config[0].paymentPixEnabled,
      pixKey: config[0].paymentPixKey,
      paymentLink: config[0].paymentLinkEnabled,
    };
  }),

  /**
   * Record manual payment (cash, bank transfer, or PIX) - Admin only
   */
  recordManualPayment: protectedProcedure
    .input(z.object({
      appointmentId: z.number(),
      amount: z.number(),
      paymentMethod: z.enum(["cash", "bank_transfer", "pix", "payment_link"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get appointment
      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!appointment[0]) {
        throw new Error("Agendamento não encontrado");
      }

      // Create payment transaction
      await db.insert(paymentTransactions).values({
        tenantId: getTenantId(ctx),
        appointmentId: input.appointmentId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        status: "completed",
        notes: input.notes,
        paidAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });

      // Update appointment paid amount
      const newPaidAmount = (appointment[0].paidAmount || 0) + input.amount;
      const finalPrice = appointment[0].finalPrice || 0;
      
      let newPaymentStatus: "partial" | "paid" = "partial";
      if (newPaidAmount >= finalPrice) {
        newPaymentStatus = "paid";
      }

      await db
        .update(appointments)
        .set({
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
          paymentMethod: input.paymentMethod,
          // @ts-ignore
          paidAt: newPaymentStatus === "paid" ? new Date().toISOString().slice(0, 19).replace('T', ' ') : appointment[0].paidAt,
        })
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      // Mapear nomes dos métodos de pagamento
      const methodNames: Record<string, string> = {
        cash: "Cash",
        bank_transfer: "Transferência Bancária",
        pix: "Bank transfer",
        payment_link: "Link de Pagamento",
      };

      // Send email if fully paid
      if (newPaymentStatus === "paid") {
        await sendPaymentConfirmationEmail({
          clientName: appointment[0].clientName,
          clientEmail: appointment[0].clientEmail,
          serviceName: "Sessão Fotográfica",
          amount: finalPrice,
          paymentDate: new Date().toLocaleDateString('pt-BR'),
        }).catch(err => console.error('Erro ao enviar email:', err));
      }

      // Notify owner
      await notifyOwner({
        title: `💰 Pagamento ${newPaymentStatus === "paid" ? "completo" : "parcial"} recebido`,
        content: `Cliente: ${appointment[0].clientName}\nMétodo: ${methodNames[input.paymentMethod] || input.paymentMethod}\nValor: R$ ${input.amount.toFixed(2)}\nTotal pago: R$ ${newPaidAmount.toFixed(2)} de R$ ${finalPrice.toFixed(2)}`,
      }).catch(err => console.error('Erro ao notificar:', err));

      return {
        success: true,
        newPaidAmount,
        paymentStatus: newPaymentStatus,
      };
    }),

  /**
   * Get payment history for an appointment
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(paymentTransactions)
        .where(and(eq(paymentTransactions.appointmentId, input.appointmentId), eq(paymentTransactions.tenantId, getTenantId(ctx))));
    }),

  /**
   * Update payment method for appointment
   */
  updatePaymentMethod: protectedProcedure
    .input(z.object({
      appointmentId: z.number(),
      paymentMethod: z.enum(["cash", "bank_transfer", "stripe", "pix", "payment_link"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(appointments)
        .set({ paymentMethod: input.paymentMethod })
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Get payment summary for appointment
   */
  getPaymentSummary: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!appointment[0]) {
        return null;
      }

      const transactions = await db
        .select()
        .from(paymentTransactions)
        .where(and(eq(paymentTransactions.appointmentId, input.appointmentId), eq(paymentTransactions.tenantId, getTenantId(ctx))));

      // Get extras and sum their prices
      const extras = await db
        .select()
        .from(appointmentExtras)
        .where(and(eq(appointmentExtras.appointmentId, input.appointmentId), eq(appointmentExtras.tenantId, getTenantId(ctx))));

      const extrasTotal = extras.reduce((sum, extra) => sum + extra.price, 0);
      const basePrice = appointment[0].finalPrice || 0;
      const finalPrice = basePrice + extrasTotal;
      const paidAmount = appointment[0].paidAmount || 0;
      const remainingAmount = finalPrice - paidAmount;

      return {
        finalPrice,
        paidAmount,
        remainingAmount,
        paymentStatus: appointment[0].paymentStatus,
        paymentMethod: appointment[0].paymentMethod,
        transactions,
      };
    }),
});
