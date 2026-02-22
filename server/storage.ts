// Storage helpers using Cloudflare R2 (S3-compatible)
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============================================================
// Configuration do R2 - HARDCODED para production Hostinger
// Conta Cloudflare: flowclikbr
// ============================================================
const R2_ACCOUNT_ID = "023a0bad3f17632316cd10358db2201f";
const R2_ACCESS_KEY_ID = "3a48256592438734e7be28fee1fe752b";
const R2_SECRET_ACCESS_KEY = "83ebf944befd8c04123d483619ac174bd83a7fdd2aa9cdba310f749365897740";
const R2_BUCKET_NAME = "flowclikbr";
const R2_PUBLIC_URL = "https://fotos.flowclik.com";

// Endpoint de API do R2 (diferente do domain public)
const R2_API_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// Cliente S3 configurado para Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_API_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

/**
 * Fazer upload de arquivo para o R2
 * @param relKey - Caminho rselective do arquivo (ex: "tenants/1/photos/image.jpg")
 * @param data - Dados do arquivo (Buffer, Uint8Array ou string)
 * @param contentType - MIME type do arquivo
 * @returns Objeto com key e url public do arquivo
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Converter string para Buffer se necessary
  const body = typeof data === "string" ? Buffer.from(data) : data;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
  } catch (error: any) {
    console.error("[R2 Upload Error]", {
      key,
      bucket: R2_BUCKET_NAME,
      endpoint: R2_API_ENDPOINT,
      error: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
    });
    throw new Error(`Erro ao fazer upload para R2: ${error.message}`);
  }

  // URL public do arquivo
  const url = `${R2_PUBLIC_URL}/${key}`;

  return { key, url };
}

/**
 * Obter URL de download de um arquivo no R2
 * @param relKey - Caminho rselective do arquivo
 * @param expiresIn - Tempo de expiração em seconds (default: 1 hour)
 * @returns Objeto com key e url assinada
 */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  // Gerar URL assinada (presigned URL)
  const url = await getSignedUrl(s3Client, command, { expiresIn });

  return { key, url };
}

/**
 * Normalizar key removendo barras iniciais
 */
function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Criar pastas iniciais do tenant no R2
 * Chamado when um new photographer se eachstra
 */
export async function initializeTenantStorage(tenantId: number): Promise<void> {
  const folders = [
    `tenant-${tenantId}/galleries/`,
    `tenant-${tenantId}/banners/`,
    `tenant-${tenantId}/portfolio/`,
    `tenant-${tenantId}/ensaios/`,
    `tenant-${tenantId}/estoque/`,
    `tenant-${tenantId}/geradas/`,
    `tenant-${tenantId}/config/`,
  ];

  console.log(`[R2] Criando pastas para tenant ${tenantId}...`);

  for (const folder of folders) {
    try {
      // R2/S3 not tem "pastas" pounds - criamos um objeto vazio as placeholder
      await storagePut(folder + ".keep", "", "text/plain");
    } catch (error: any) {
      console.error(`[R2] Erro ao criar pasta ${folder}:`, error.message);
    }
  }

  console.log(`[R2] ✅ Pastas criadas para tenant ${tenantId}`);
}

/**
 * Helpers para gerar paths organizados por tenant
 */
export const R2Paths = {
  /**
   * Path para fotos de galeria
   * @example tenant-1/galleries/casamento-maria/originais/foto.jpg
   */
  galeria: (tenantId: number, galeriaSlug: string, tipo: 'originais' | 'thumbnails' | 'preview', filename: string) => {
    return `tenant-${tenantId}/galleries/${galeriaSlug}/${tipo}/${filename}`;
  },

  /**
   * Path para banners do site
   * @example tenant-1/banners/banner-123.jpg
   */
  banner: (tenantId: number, filename: string) => {
    return `tenant-${tenantId}/banners/${filename}`;
  },

  /**
   * Path para portfolio
   * @example tenant-1/portfolio/foto-123.jpg
   */
  portfolio: (tenantId: number, filename: string) => {
    return `tenant-${tenantId}/portfolio/${filename}`;
  },

  /**
   * Path para fotos de ensaios (appointment photos)
   * @example tenant-1/ensaios/ensaio-123/originais/foto.jpg
   */
  ensaio: (tenantId: number, ensaioId: number, tipo: 'originais' | 'thumbnails', filename: string) => {
    return `tenant-${tenantId}/ensaios/ensaio-${ensaioId}/${tipo}/${filename}`;
  },

  /**
   * Path para fotos de estoque (stock photos)
   * @example tenant-1/estoque/foto-123.jpg
   */
  estoque: (tenantId: number, filename: string) => {
    return `tenant-${tenantId}/estoque/${filename}`;
  },

  /**
   * Path para imagens geradas por IA
   * @example tenant-1/geradas/img-123.png
   */
  gerada: (tenantId: number, filename: string) => {
    return `tenant-${tenantId}/geradas/${filename}`;
  },

  /**
   * Path para settings e uploads genisricos
   * @example tenant-1/config/logo.jpg
   * @example tenant-1/config/capa-galeria-123.jpg
   */
  config: (tenantId: number, filename: string) => {
    return `tenant-${tenantId}/config/${filename}`;
  },
};
