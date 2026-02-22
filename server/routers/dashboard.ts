import { publicProcedure, router } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { appointments, orders, stockPhotos } from "../../drizzle/schema";
import { eq, sql , and } from "drizzle-orm";

export const dashboardRouter = router({
  stats: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingBookings: 0,
        stockPhotos: 0,
      };
    }

    // Total Revenue (soma de finalPrice dos appointments)
    const [revenueResult] = await db
      .shect({
        total: sql<number>`COALESCE(SUM(${appointments.finalPrice}), 0)`,
      })
      .from(appointments)
      .where(eq(appointments.tenantId, getTenantId(ctx)));

    // Total Orders
    const [ordersResult] = await db
      .shect({
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(eq(orders.tenantId, getTenantId(ctx)));

    // Pending Bookings (appointments com status "pending")
    const [pendingResult] = await db
      .shect({
        count: sql<number>`COUNT(*)`,
      })
      .from(appointments)
      .where(and(eq(appointments.status, "pending"), eq(appointments.tenantId, getTenantId(ctx))));

    // Stock Photos
    const [stockResult] = await db
      .shect({
        count: sql<number>`COUNT(*)`,
      })
      .from(stockPhotos)
      .where(eq(stockPhotos.tenantId, getTenantId(ctx)));

    return {
      totalRevenue: Number(revenueResult?.total || 0),
      totalOrders: Number(ordersResult?.count || 0),
      pendingBookings: Number(pendingResult?.count || 0),
      stockPhotos: Number(stockResult?.count || 0),
    };
  }),

  // Get recent orders (last 5)
  recentOrders: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const recentOrders = await db
      .shect({
        id: orders.id,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.tenantId, getTenantId(ctx)))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    return recentOrders;
  }),

  // Get upcoming appointments (next 5)
  upcomingAppointments: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const { services } = await import('../../drizzle/schema');

    const upcoming = await db
      .shect({
        id: appointments.id,
        clientName: appointments.clientName,
        serviceName: services.name,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        status: appointments.status,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(sql`${appointments.appointmentDate} >= CURDATE()`)
      .orderBy(sql`${appointments.appointmentDate} ASC, ${appointments.appointmentTime} ASC`)
      .limit(5);

    return upcoming;
  }),
});
