import { router, protectedProcedure } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { eq, sql , and } from "drizzle-orm";

export const usageRouter = router({
  // Obter statistics de uso (version simplifieach para page de signature)
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { mediaItems, collections } = await import('../../drizzle/schema');
    const tenantId = getTenantId(ctx);
    console.log('[USAGE DEBUG] tenantId:', tenantId);

    // Contar fotos no R2 (tabshe mediaItems)
    const [photoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(mediaItems)
      .where(eq(mediaItems.tenantId, tenantId));

    const totalPhotos = Number(photoCount.count || 0);

    // Estimar storage (5MB por foto)
    const storageUsed = totalPhotos * 5 * 1024 * 1024; // bytes

    // Contar galerias
    const [galleryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(collections)
      .where(eq(collections.tenantId, tenantId));

    const galleriesUsed = Number(galleryCount.count || 0);
    console.log('[USAGE DEBUG] galleriesUsed:', galleriesUsed, 'tenantId:', tenantId);

    return {
      storageUsed, // em bytes
      galleriesUsed,
      totalPhotos,
    };
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Import tables
    const { appointmentPhotos, finalAlbums, collections } = await import('../../drizzle/schema');

    // Count photos in session galleries (raw photos)
    const [photoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointmentPhotos)
      .where(eq(appointmentPhotos.tenantId, getTenantId(ctx)));

    // Count photos in final albums (edited photos)
    const [finalPhotoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(finalAlbums)
      .where(eq(finalAlbums.tenantId, getTenantId(ctx)));

    const totalRawPhotos = Number(photoCount.count || 0);
    const totalEditedPhotos = Number(finalPhotoCount.count || 0);
    const totalPhotos = totalRawPhotos + totalEditedPhotos;

    // Estimate storage (5MB average per photo)
    // In production, you'd store actual file sizes in the database
    const estimatedStorageGB = (totalPhotos * 5) / 1024; // 5MB per photo average

    // Count galleries (collections)
    const [galleryCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(collections)
      .where(eq(collections.tenantId, getTenantId(ctx)));

    const totalGalleries = Number(galleryCount.count || 0);

    // Plan limits (hardcoded for now, will come from subscription later)
    const limits = {
      storageGB: 10,
      galleries: 10,
    };

    // Calculate usage percentages
    const storagePercentage = Math.min((estimatedStorageGB / limits.storageGB) * 100, 100);
    const galleriesPercentage = Math.min((totalGalleries / limits.galleries) * 100, 100);

    return {
      storage: {
        used: Number(estimatedStorageGB.toFixed(2)),
        limit: limits.storageGB,
        percentage: Number(storagePercentage.toFixed(1)),
        unit: "GB" as const,
      },
      galleries: {
        used: totalGalleries,
        limit: limits.galleries,
        percentage: Number(galleriesPercentage.toFixed(1)),
      },
      photos: {
        total: totalPhotos,
        raw: totalRawPhotos,
        edited: totalEditedPhotos,
      },
      plan: {
        name: "Starter",
        price: 8.99,
        currency: "£",
        billingCycle: "monthly" as const,
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    };
  }),
});
