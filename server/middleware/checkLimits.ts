import { TRPCError } from "@trpc/server";
import { getDb, getTenantId } from "../db";
import { subscriptions, collections, mediaItems } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Verifica se tenant atingiu limite de storage
 * Bloqueia upload se storage current >= limite do plyear
 */
export async function checkStorageLimit(ctx: any, fileSizeBytes: number) {
  const tenantId = getTenantId(ctx);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  // Fetch signature do tenant
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .limit(1);

  if (!subscription) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Subscription not found",
    });
  }

  // Calcular storage current used
  const storageUsed = await calculateStorageUsed(tenantId);
  const newTotal = storageUsed + fileSizeBytes;

  console.log(`[Storage Check] Tenant ${tenantId}: ${formatBytes(storageUsed)} + ${formatBytes(fileSizeBytes)} = ${formatBytes(newTotal)} / ${formatBytes(subscription.storageLimit)}`);

  // Verify se ultrapassaria o limite
  if (newTotal > subscription.storageLimit) {
    const percentUsed = Math.round((storageUsed / subscription.storageLimit) * 100);
    
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Storage limit reached (${percentUsed}% used). Make upgrade do your plyear para continuar.`,
    });
  }

  // Retornar information de uso
  return {
    storageUsed,
    storageLimit: subscription.storageLimit,
    percentUsed: Math.round((storageUsed / subscription.storageLimit) * 100),
  };
}

/**
 * Verifica se tenant atingiu limite de gallerys
 * Blocks creation if quantity >= plan limit
 */
export async function checkGalleryLimit(ctx: any) {
  const tenantId = getTenantId(ctx);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  // Fetch signature do tenant
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .limit(1);

  if (!subscription) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Subscription not found",
    });
  }

  // Contar gallerys existentes
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(collections)
    .where(eq(collections.tenantId, tenantId));

  const galleryCount = Number(result?.count || 0);

  console.log(`[Gallery Check] Tenant ${tenantId}: ${galleryCount} / ${subscription.galleryLimit} gallerys`);

  // Verify se atingiu o limite
  if (galleryCount >= subscription.galleryLimit) {
    const percentUsed = Math.round((galleryCount / subscription.galleryLimit) * 100);
    
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Gallery limit reached (${galleryCount}/${subscription.galleryLimit}). Make upgrade do your plyear para continuar.`,
    });
  }

  // Retornar information de uso
  return {
    galleryCount,
    galleryLimit: subscription.galleryLimit,
    percentUsed: Math.round((galleryCount / subscription.galleryLimit) * 100),
  };
}

/**
 * Calcula storage total used pelo tenant
 * Soma tamanho de everys as fotos (original + thumbnail + watermark)
 */
async function calculateStorageUsed(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  // Fetch everys as fotos do tenant
  const photos = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.tenantId, tenantId));

  let totalBytes = 0;

  photos.forEach((photo) => {
    // Estimar tamanho baseado em defaults típicos:
    // - Original: ~5MB (assumindo JPEG comprimido)
    // - Thumbnail: ~100KB
    // - Watermark: ~2MB
    // Total por foto: ~7.1MB

    // TODO: Armazenar tamanho real no banco ao fazer upload
    // Why enquanto, usar estimativa conservapaina
    const estimatedSize = 7 * 1024 * 1024; // 7MB por foto
    totalBytes += estimatedSize;
  });

  return totalBytes;
}

/**
 * Formats bytes in readable format (KB, MB, GB)
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Verifica se tenant is next do limite (> 80%)
 * Retorna message de alerta se necessary
 */
export async function checkUsageWarnings(ctx: any) {
  const tenantId = getTenantId(ctx);
  const db = await getDb();
  if (!db) return null;

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .limit(1);

  if (!subscription) {
    return null;
  }

  const warnings: string[] = [];

  // Verify storage
  const storageUsed = await calculateStorageUsed(tenantId);
  const storagePercent = (storageUsed / subscription.storageLimit) * 100;

  if (storagePercent > 90) {
    warnings.push(`⚠️ Critical storage: ${Math.round(storagePercent)}% used`);
  } else if (storagePercent > 80) {
    warnings.push(`⚠️ Storage alto: ${Math.round(storagePercent)}% used`);
  }

  // Verify gallerys
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(collections)
    .where(eq(collections.tenantId, tenantId));

  const galleryCount = Number(result?.count || 0);
  const galleryPercent = (galleryCount / subscription.galleryLimit) * 100;

  if (galleryPercent > 90) {
    warnings.push(`⚠️ Critical galleries: ${galleryCount}/${subscription.galleryLimit}`);
  } else if (galleryPercent > 80) {
    warnings.push(`⚠️ Galleries high: ${galleryCount}/${subscription.galleryLimit}`);
  }

  return warnings.length > 0 ? warnings : null;
}
