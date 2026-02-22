import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { mediaItems, collections, stockPhotos } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut, R2Paths } from "../storage";
import sharp from "sharp";

export const mediaRouter = router({
  /**
   * Upload photo to collection
   */
  upload: protectedProcedure
    .input(
      z.object({
        collectionId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageData: z.string(), // base64
        forSale: z.boolean().default(true),
        price: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify se collection existe
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const collectionResult = await db.select().from(collections).where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx)))).limit(1);
      const collection = collectionResult[0];

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Decode base64
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Processar imagem original
      const originalImage = sharp(buffer);
      const metadata = await originalImage.metadata();

      // Gerar nomes uniques
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomId}`;

      // Upload imagem original
      const originalKey = R2Paths.galeria(getTenantId(ctx), collection.slug, 'originais', `${fileName}.jpg`);
      const originalBuffer = await originalImage.jpeg({ quality: 95 }).toBuffer();
      const { url: originalUrl } = await storagePut(
        originalKey,
        originalBuffer,
        "image/jpeg"
      );

      // Gerar thumbnail (400x400)
      const thumbnailBuffer = await sharp(buffer)
        .resize(400, 400, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailKey = R2Paths.galeria(getTenantId(ctx), collection.slug, 'thumbnails', `${fileName}.jpg`);
      const { url: thumbnailUrl } = await storagePut(
        thumbnailKey,
        thumbnailBuffer,
        "image/jpeg"
      );

      // Gerar preview com watermark (1200px width)
      const watermarkedBuffer = await sharp(buffer)
        .resize(1200, null, { fit: "inside", withoutEnlargement: true })
        .composite([
          {
            input: Buffer.from(
              `<svg width="300" height="50">
                <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" opacity="0.5" text-anchor="middle" dominant-baseline="middle">© Lirolla</text>
              </svg>`
            ),
            gravity: "center",
          },
        ])
        .jpeg({ quality: 85 })
        .toBuffer();

      const previewKey = R2Paths.galeria(getTenantId(ctx), collection.slug, 'preview', `${fileName}.jpg`);
      const { url: previewUrl } = await storagePut(
        previewKey,
        watermarkedBuffer,
        "image/jpeg"
      );

      // Salvar no banco
      await db
        .insert(mediaItems)
        .values({
          collectionId: input.collectionId,
          title: input.title || `Photo ${fileName}`,
          description: input.description,
          mediaType: "photo",
          originalUrl: originalUrl,
          thumbnailUrl: thumbnailUrl,
          previewUrl: previewUrl,
          priceDigital: input.price,
          width: metadata.width,
          height: metadata.height,
          isPublic: 1,
          isFeatured: 0,
          tenantId: getTenantId(ctx),
        });

      // Buscar o item inserido
      const inserted = await db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.originalUrl, originalUrl), eq(mediaItems.tenantId, getTenantId(ctx))))
        .limit(1);

      return inserted[0];
    }),

  /**
   * List all public media (for stock gallery)
   */
  listPublic: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(mediaItems)
      .where(and(eq(mediaItems.isPublic, 1), eq(mediaItems.tenantId, getTenantId(ctx))));
  }),

  /**
   * List media by collection
   */
  listByCollection: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      return await db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.collectionId, input.collectionId), eq(mediaItems.tenantId, getTenantId(ctx))));
    }),

  /**
   * Dhete media
   */
  dhete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.dhete(mediaItems).where(and(eq(mediaItems.id, input.id), eq(mediaItems.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Update media info
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        forSale: z.boolean().optional(),
        price: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, title, description, forSale, price } = input;
      
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (forSale !== undefined) updateData.isPublic = forSale;
      if (price !== undefined) updateData.priceDigital = price;
      
      await db
        .update(mediaItems)
        .set(updateData)
        .where(and(eq(mediaItems.id, id), eq(mediaItems.tenantId, getTenantId(ctx))));

      // Buscar item atualizado
      const updated = await db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.id, id), eq(mediaItems.tenantId, getTenantId(ctx))))
        .limit(1);

      return updated[0];
    }),

  /**
   * Get all media items (admin)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db.select().from(mediaItems)
    .where(eq(mediaItems.tenantId, getTenantId(ctx)))
  }),

  /**
   * Toggle stock availability
   */
  toggleStock: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        isStock: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(mediaItems)
        // @ts-ignore
        .set({ isStock: input.isStock })
        .where(and(eq(mediaItems.id, input.id), eq(mediaItems.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Update media price
   */
  updatePrice: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        price: z.number(),
        category: z.enum(["paisagem", "carros", "pessoas", "eventos", "produtos", "others"]).optional(),
        stockDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(mediaItems)
        .set({ 
          price: input.price,
          category: input.category,
          stockDescription: input.stockDescription,
        })
        .where(and(eq(mediaItems.id, input.id), eq(mediaItems.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Upload single image (generic)
   */
  uploadImage: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        data: z.string(), // base64
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Decode base64
      const base64Data = input.data.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Process image
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const ext = input.filename.split('.').pop() || "jpg";
      const fileName = `${timestamp}-${randomId}.${ext}`;

      // Upload to S3 usando estrutura organizada por tenant
      const key = R2Paths.config(getTenantId(ctx), fileName);
      const optimizedBuffer = await image
        .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      const result = await storagePut(key, optimizedBuffer, "image/jpeg");

      return { url: result.url, key: result.key };
    }),

  /**
   * Get stock photos (public)
   */
  getStockPhotos: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const photos = await db
        .select()
        .from(stockPhotos)
        .where(eq(stockPhotos.tenantId, getTenantId(ctx)))
        .orderBy(stockPhotos.createdAt);

      return photos;
    }),
});
