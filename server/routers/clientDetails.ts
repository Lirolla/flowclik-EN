import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { appointments, orders } from "../../drizzle/schema";
import { eq , and } from "drizzle-orm";

export const clientDetailsRouter = router({
  /**
   * Get client appointments by email
   */
  getAppointmentsByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.clientEmail, input.email), eq(appointments.tenantId, getTenantId(ctx))))
        .orderBy(appointments.appointmentDate);
    }),

  /**
   * Get client orders by email
   */
  getOrdersByEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select()
        .from(orders)
        .where(and(eq(orders.customerEmail, input.email), eq(orders.tenantId, getTenantId(ctx))))
        .orderBy(orders.createdAt);
    }),

  /**
   * Get client summary (total spent, appointments count, etc)
   */
  getClientSummary: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const clientAppointments = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.clientEmail, input.email), eq(appointments.tenantId, getTenantId(ctx))));

      const clientOrders = await db
        .select()
        .from(orders)
        .where(and(eq(orders.customerEmail, input.email), eq(orders.tenantId, getTenantId(ctx))));

      const totalSpent = clientOrders.reduce((sum, order) => sum + order.finalAmount, 0);
      const totalAppointments = clientAppointments.length;
      const completedAppointments = clientAppointments.filter(
        (apt) => apt.status === "delivered"
      ).length;

      return {
        totalSpent,
        totalAppointments,
        completedAppointments,
        pendingAppointments: clientAppointments.filter((apt) => apt.status === "pending").length,
        totalOrders: clientOrders.length,
      };
    }),
});
