import { TRPCError } from "@trpc/server";
import { getDb, getTenantId } from "../db";
import { subscriptions, collections, mediaItems } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Verifica se tenant atingiu limite de storage
 * Bloqueia upload se storage atual >= limite do plano
 */
export async function checkStorageLimit(ctx: any, fileSizeBytes: number) {
  const tenantId = getTenantId(ctx);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  // Buscar assinatura do tenant
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .limit(1);

  if (!subscription) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Assinatura não encontrada",
    });
  }

  // Calcular storage atual usado
  const storageUsed = await calculateStorageUsed(tenantId);
  const newTotal = storageUsed + fileSizeBytes;

  console.log(`[Storage Check] Tenant ${tenantId}: ${formatBytes(storageUsed)} + ${formatBytes(fileSizeBytes)} = ${formatBytes(newTotal)} / ${formatBytes(subscription.storageLimit)}`);

  // Verificar se ultrapassaria o limite
  if (newTotal > subscription.storageLimit) {
    const percentUsed = Math.round((storageUsed / subscription.storageLimit) * 100);
    
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Limite de armazenamento atingido (${percentUsed}% usado). Faça upgrade do seu plano para continuar.`,
    });
  }

  // Retornar informações de uso
  return {
    storageUsed,
    storageLimit: subscription.storageLimit,
    percentUsed: Math.round((storageUsed / subscription.storageLimit) * 100),
  };
}

/**
 * Verifica se tenant atingiu limite de galerias
 * Bloqueia criação se quantidade >= limite do plano
 */
export async function checkGalleryLimit(ctx: any) {
  const tenantId = getTenantId(ctx);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

  // Buscar assinatura do tenant
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, tenantId))
    .limit(1);

  if (!subscription) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Assinatura não encontrada",
    });
  }

  // Contar galerias existentes
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(collections)
    .where(eq(collections.tenantId, tenantId));

  const galleryCount = Number(result?.count || 0);

  console.log(`[Gallery Check] Tenant ${tenantId}: ${galleryCount} / ${subscription.galleryLimit} galerias`);

  // Verificar se atingiu o limite
  if (galleryCount >= subscription.galleryLimit) {
    const percentUsed = Math.round((galleryCount / subscription.galleryLimit) * 100);
    
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Limite de galerias atingido (${galleryCount}/${subscription.galleryLimit}). Faça upgrade do seu plano para continuar.`,
    });
  }

  // Retornar informações de uso
  return {
    galleryCount,
    galleryLimit: subscription.galleryLimit,
    percentUsed: Math.round((galleryCount / subscription.galleryLimit) * 100),
  };
}

/**
 * Calcula storage total usado pelo tenant
 * Soma tamanho de todas as fotos (original + thumbnail + watermark)
 */
async function calculateStorageUsed(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  // Buscar todas as fotos do tenant
  const photos = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.tenantId, tenantId));

  let totalBytes = 0;

  photos.forEach((photo) => {
    // Estimar tamanho baseado em padrões típicos:
    // - Original: ~5MB (assumindo JPEG comprimido)
    // - Thumbnail: ~100KB
    // - Watermark: ~2MB
    // Total por foto: ~7.1MB

    // TODO: Armazenar tamanho real no banco ao fazer upload
    // Por enquanto, usar estimativa conservadora
    const estimatedSize = 7 * 1024 * 1024; // 7MB por foto
    totalBytes += estimatedSize;
  });

  return totalBytes;
}

/**
 * Formata bytes em formato legível (KB, MB, GB)
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Verifica se tenant está próximo do limite (> 80%)
 * Retorna mensagem de alerta se necessário
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

  // Verificar storage
  const storageUsed = await calculateStorageUsed(tenantId);
  const storagePercent = (storageUsed / subscription.storageLimit) * 100;

  if (storagePercent > 90) {
    warnings.push(`⚠️ Armazenamento crítico: ${Math.round(storagePercent)}% usado`);
  } else if (storagePercent > 80) {
    warnings.push(`⚠️ Armazenamento alto: ${Math.round(storagePercent)}% usado`);
  }

  // Verificar galerias
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(collections)
    .where(eq(collections.tenantId, tenantId));

  const galleryCount = Number(result?.count || 0);
  const galleryPercent = (galleryCount / subscription.galleryLimit) * 100;

  if (galleryPercent > 90) {
    warnings.push(`⚠️ Galerias críticas: ${galleryCount}/${subscription.galleryLimit}`);
  } else if (galleryPercent > 80) {
    warnings.push(`⚠️ Galerias altas: ${galleryCount}/${subscription.galleryLimit}`);
  }

  return warnings.length > 0 ? warnings : null;
}
