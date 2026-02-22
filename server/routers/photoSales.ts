import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { photoSales, collections, mediaItems, users } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const photoSalesRouter = router({
  /**
   * Get sales statistics by collection
   */
  getStatsByCollection: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) return null;

      // Get all sales for this collection
      const sales = await db
        .select()
        .from(photoSales)
        .where(
          and(
            eq(photoSales.collectionId, input.collectionId),
            eq(photoSales.status, 'paid')
          )
        );

      // Calculate stats
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalSales = sales.length;
      const uniqueBuyers = new Set(sales.map(s => s.buyerEmail)).size;

      return {
        totalRevenue,
        totalSales,
        uniqueBuyers,
        sales: sales.map(s => ({
          id: s.id,
          buyerName: s.buyerName,
          buyerEmail: s.buyerEmail,
          amount: s.amount,
          productType: s.productType,
          createdAt: s.createdAt,
          paidAt: s.paidAt,
        })),
      };
    }),

  /**
   * Get all sales with details
   */
  getAllSales: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const db = await getDb();
    if (!db) return [];

    const sales = await db
      .select({
        id: photoSales.id,
        photoId: photoSales.photoId,
        collectionId: photoSales.collectionId,
        buyerName: photoSales.buyerName,
        buyerEmail: photoSales.buyerEmail,
        amount: photoSales.amount,
        status: photoSales.status,
        productType: photoSales.productType,
        createdAt: photoSales.createdAt,
        paidAt: photoSales.paidAt,
        photoTitle: mediaItems.title,
        collectionName: collections.name,
      })
      .from(photoSales)
      .leftJoin(mediaItems, eq(photoSales.photoId, mediaItems.id))
      .leftJoin(collections, eq(photoSales.collectionId, collections.id))
      .orderBy(desc(photoSales.createdAt));

    return sales;
  }),

  /**
   * Get sales summary (dashboard)
   */
  getSalesSummary: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const db = await getDb();
    if (!db) return null;

    // Get all paid sales
    const paidSales = await db
      .select()
      .from(photoSales)
      .where(and(eq(photoSales.status, 'paid'), eq(photoSales.tenantId, getTenantId(ctx))));

    // Calculate totals
    const totalRevenue = paidSales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalSales = paidSales.length;
    const uniqueBuyers = new Set(paidSales.map(s => s.buyerEmail)).size;

    // Get sales by collection
    const salesByCollection = await db
      .select({
        collectionId: photoSales.collectionId,
        collectionName: collections.name,
        count: sql<number>`count(*)`,
        revenue: sql<number>`sum(${photoSales.amount})`,
      })
      .from(photoSales)
      .leftJoin(collections, eq(photoSales.collectionId, collections.id))
      .where(and(eq(photoSales.status, 'paid'), eq(photoSales.tenantId, getTenantId(ctx))))
      .groupBy(photoSales.collectionId, collections.name);

    return {
      totalRevenue,
      totalSales,
      uniqueBuyers,
      salesByCollection,
    };
  }),

  /**
   * Create checkout session for multiple photos
   */
  createCheckout: publicProcedure
    .input(z.object({
      photoIds: z.array(z.number()),
      collectionId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get collection
      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection || !collection.salesEnabled) {
        throw new Error('Collection not available for sales');
      }

      // Get photos
      const photos = await db
        .select()
        .from(mediaItems)
        .where(
          and(
            eq(mediaItems.collectionId, input.collectionId),
            sql`${mediaItems.id} IN (${input.photoIds.join(',')})`
          )
        );

      if (photos.length === 0) {
        throw new Error('No photos found');
      }

      // Create checkout session
      const { createMultiPhotoCheckoutSession } = await import('../stripe');
      const session = await createMultiPhotoCheckoutSession({
        photos: photos.map(p => ({
          id: p.id,
          title: p.title,
          thumbnailUrl: p.thumbnailUrl || p.originalUrl,
          price: collection.pricePerPhoto || 2500,
        })),
        collectionId: collection.id,
        collectionName: collection.name,
        successUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/galeria-compra/${collection.publicSlug}`,
      });

      // Create pending sales records
      for (const photo of photos) {
        await db.insert(photoSales).values({
          tenantId: getTenantId(ctx),
          photoId: photo.id,
          collectionId: collection.id,
          buyerEmail: 'pending@checkout.com',
          buyerName: 'Pending',
          amount: collection.pricePerPhoto || 2500,
          stripeSessionId: session.id,
          status: 'pending',
          productType: 'digital',
        });
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Create a photo sale (called after Stripe payment)
   */
  create: publicProcedure
    .input(z.object({
      photoId: z.number(),
      collectionId: z.number(),
      buyerEmail: z.string().email(),
      buyerName: z.string(),
      amount: z.number(),
      stripeSessionId: z.string(),
      stripePaymentIntentId: z.string().optional(),
      productType: z.enum(['digital']).default('digital'),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Generate download token
      const downloadToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
      
      // Set download expiration (7 days)
      const downloadExpiresAt = new Date();
      downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 7);

        // @ts-ignore
      const [sale] = await db.insert(photoSales).values({
        tenantId: getTenantId(ctx),
        photoId: input.photoId,
        collectionId: input.collectionId,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        amount: input.amount,
        stripeSessionId: input.stripeSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        status: 'paid',
        productType: input.productType,
        downloadToken,
        downloadExpiresAt,
        paidAt: new Date().toISOString(),
      });

      return {
        success: true,
        downloadToken,
        downloadExpiresAt,
      };
    }),
});
