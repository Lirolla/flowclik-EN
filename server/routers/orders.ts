import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { orders, orderItems, stockPhotos, siteConfig } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const ordersRouter = router({
  /**
   * Get payment config (public - for checkout page)
   */
  getPaymentConfig: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const config = await db.select({
      paymentPixEnabled: siteConfig.paymentPixEnabled,
      paymentPixKey: siteConfig.paymentPixKey,
      paymentCashEnabled: siteConfig.paymentCashEnabled,
      paymentCashInstructions: siteConfig.paymentCashInstructions,
      paymentBankTransferEnabled: siteConfig.paymentBankTransferEnabled,
      paymentBankTransferDetails: siteConfig.paymentBankDetails,
      paymentLinkEnabled: siteConfig.paymentLinkEnabled,
    }).from(siteConfig).where(eq(siteConfig.tenantId, getTenantId(ctx)));
    return config[0] || null;
  }),

  /**
   * Create order (public - checkout)
   */
  checkout: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        paymentMethod: z.enum(["pix", "payment_link", "bank_transfer"]),
        items: z.array(
          z.object({
            photoId: z.number(),
            itemType: z.enum(["digital", "print"]).default("digital"),
            quantity: z.number().default(1),
          })
        ).min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const tenantId = getTenantId(ctx);

      // Get photo prices
      const photoIds = input.items.map(i => i.photoId);
      const photos = await db.select().from(stockPhotos)
        .where(and(eq(stockPhotos.isActive, 1), eq(stockPhotos.tenantId, tenantId)));
      
      const photoMap = new Map(photos.map(p => [p.id, p]));
      
      let totalAmount = 0;
      const orderItemsData: any[] = [];
      
      for (const item of input.items) {
        const photo = photoMap.get(item.photoId);
        if (!photo) throw new Error(`Foto #${item.photoId} não encontrada`);
        const price = photo.price * item.quantity;
        totalAmount += price;
        orderItemsData.push({
          mediaId: item.photoId,
          itemType: item.itemType,
          itemName: photo.title || `Foto #${photo.id}`,
          price: photo.price,
          quantity: item.quantity,
          tenantId,
        });
      }

      // Create order
      const [result] = await db.insert(orders).values({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone || null,
        totalAmount,
        discountAmount: 0,
        finalAmount: totalAmount,
        status: "pending",
        paymentMethod: input.paymentMethod,
        tenantId,
      });

      const orderId = result.insertId;

      // Create order items
      for (const item of orderItemsData) {
        await db.insert(orderItems).values({
          ...item,
          orderId: Number(orderId),
        });
      }

      return { 
        success: true, 
        orderId: Number(orderId),
        totalAmount,
      };
    }),

  /**
   * Get order by ID (public - for order confirmation page)
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const tenantId = getTenantId(ctx);
      
      const [order] = await db.select().from(orders)
        .where(and(eq(orders.id, input.id), eq(orders.tenantId, tenantId)));
      
      if (!order) return null;

      const items = await db.select().from(orderItems)
        .where(eq(orderItems.orderId, input.id));

      return { ...order, items };
    }),

  /**
   * Get all orders (admin only)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const allOrders = await db.select().from(orders)
      .where(eq(orders.tenantId, getTenantId(ctx)))
      .orderBy(desc(orders.createdAt));

    // Get items for each order
    const result = [];
    for (const order of allOrders) {
      const items = await db.select().from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      result.push({ ...order, items });
    }
    return result;
  }),

  /**
   * Update order status (admin only)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "processing", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(orders)
        .set({ status: input.status })
        .where(and(eq(orders.id, input.id), eq(orders.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Add payment link to order (admin only)
   */
  addPaymentLink: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        paymentLink: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(orders)
        .set({ paymentLink: input.paymentLink })
        .where(and(eq(orders.id, input.id), eq(orders.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Confirm payment and mark as paid (admin only)
   */
  confirmPayment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(orders)
        .set({ status: "paid" })
        .where(and(eq(orders.id, input.id), eq(orders.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Get order status with download links (public - by id + email)
   */
  getOrderStatus: publicProcedure
    .input(z.object({ id: z.number(), email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const tenantId = getTenantId(ctx);
      
      const [order] = await db.select().from(orders)
        .where(and(
          eq(orders.id, input.id), 
          eq(orders.customerEmail, input.email),
          eq(orders.tenantId, tenantId)
        ));
      
      if (!order) return null;

      const items = await db.select().from(orderItems)
        .where(eq(orderItems.orderId, input.id));

      // Get photo URLs if paid/completed
      let downloadUrls: any[] = [];
      if (order.status === 'paid' || order.status === 'completed') {
        for (const item of items) {
          if (item.mediaId) {
            const [photo] = await db.select().from(stockPhotos)
              .where(eq(stockPhotos.id, item.mediaId));
            if (photo) {
              downloadUrls.push({
                itemId: item.id,
                name: item.itemName,
                url: photo.originalUrl,
              });
            }
          }
        }
      }

      return { 
        ...order, 
        items, 
        downloadUrls,
        canDownload: order.status === 'paid' || order.status === 'completed',
      };
    }),

});
