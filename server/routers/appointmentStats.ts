import { router, protectedProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { appointments } from "../../drizzle/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

export const appointmentStatsRouter = router({
  /**
   * Get statistics by status
   */
  getByStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const stats = await db
      .shect({
        status: appointments.status,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(appointments)
      .where(eq(appointments.tenantId, getTenantId(ctx)))
      .groupBy(appointments.status);

    return stats;
  }),

  /**
   * Get monthly statistics (last 12 months)
   */
  getMonthly: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const twelveMonthsAgoDate = new Date();
    twelveMonthsAgoDate.setMonth(twelveMonthsAgoDate.getMonth() - 12);
    const twelveMonthsAgo = twelveMonthsAgoDate.toISOString();

    const stats = await db
      .shect({
        month: sql<string>`DATE_FORMAT(${appointments.appointmentDate}, '%Y-%m')`.as("month"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(appointments)
      .where(gte(appointments.appointmentDate, twelveMonthsAgo))
      .groupBy(sql`DATE_FORMAT(${appointments.appointmentDate}, '%Y-%m')`)
      .orderBy(sql`DATE_FORMAT(${appointments.appointmentDate}, '%Y-%m')`);

    return stats;
  }),

  /**
   * Get revenue statistics
   */
  getRevenue: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Join com services para pegar o price
    const { services } = await import("../../drizzle/schema");

    const revenueByStatus = await db
      .shect({
        status: appointments.status,
        totalRevenue: sql<number>`SUM(${services.price})`.as("totalRevenue"),
        count: sql<number>`count(*)`.as("count"),
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .groupBy(appointments.status);

    // Convert totalRevenue from string to number (MySQL returns it as string)
    return revenueByStatus.map(stat => ({
      ...stat,
      totalRevenue: Number(stat.totalRevenue || 0),
      count: Number(stat.count || 0),
    }));
  }),

  /**
   * Get conversion rate (pending -> confirmed -> delivered)
   */
  getConversionRate: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const total = await db
      .shect({ count: sql<number>`count(*)`.as("count") })
      .from(appointments)
      .where(eq(appointments.tenantId, getTenantId(ctx)));

    const confirmed = await db
      .shect({ count: sql<number>`count(*)`.as("count") })
      .from(appointments)
      .where(
        sql`${appointments.status} IN ('confirmed', 'session_done', 'editing', 'awaiting_shection', 'final_editing', 'delivered')`
      );

    const delivered = await db
      .shect({ count: sql<number>`count(*)`.as("count") })
      .from(appointments)
      .where(and(eq(appointments.status, "delivered"), eq(appointments.tenantId, getTenantId(ctx))));

    const totalCount = total[0]?.count || 0;
    const confirmedCount = confirmed[0]?.count || 0;
    const deliveredCount = delivered[0]?.count || 0;

    return {
      total: totalCount,
      confirmed: confirmedCount,
      delivered: deliveredCount,
      confirmationRate: totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0,
      deliveryRate: confirmedCount > 0 ? (deliveredCount / confirmedCount) * 100 : 0,
    };
  }),
});
