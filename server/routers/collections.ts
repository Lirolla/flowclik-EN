import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { collections, mediaItems, photoSelections } from "../../drizzle/schema";
import { sql, eq, and } from "drizzle-orm";
import { sendGalleryReadyEmail } from "../_core/emailTemplates";
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export const collectionsRouter = router({
  /**
   * Get all collections (public)
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db!.select().from(collections).where(eq(collections.tenantId, getTenantId(ctx)));
  }),

  /**
   * Get public collections only
   */
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db!.select().from(collections).where(and(eq(collections.tenantId, getTenantId(ctx)), eq(collections.isPublic, 1)));
  }),

  /**
   * Get featured collections
   */
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db!.select().from(collections).where(and(eq(collections.tenantId, getTenantId(ctx)), eq(collections.isFeatured, 1)));
  }),

  /**
   * Get by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const result = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.id), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);
      
      return result[0] || null;
    }),

  /**
   * Get by ID with media items
   */
  getWithMedia: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.id), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);
      
      if (!collection) return null;
      
      // Get all media items for this collection
      const items = await db
        .select()
        .from(mediaItems)
        .where(eq(mediaItems.collectionId, input.id));
      
      return {
        ...collection,
        mediaItems: items,
      };
    }),

  /**
   * Get by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.slug, input.slug), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);
      
      if (!collection) return null;
      
      // Get photo selections with edited photos
      const selections = await db
        .select({
          id: photoSelections.id,
          mediaItemId: photoSelections.mediaItemId,
          editedPhotoUrl: photoSelections.editedPhotoUrl,
          mediaTitle: mediaItems.title,
        })
        .from(photoSelections)
        .leftJoin(mediaItems, eq(photoSelections.mediaItemId, mediaItems.id))
        .where(eq(photoSelections.collectionId, collection.id));
      
      return {
        ...collection,
        photoSelections: selections,
      };
    }),

  /**
   * Create collection
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        password: z.string().optional(),
        layoutType: z.enum(["grid", "masonry", "fullscreen"]).default('masonry'),
        isFeatured: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).default(false),
        isPublic: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).default(true),
        sortOrder: z.number().default(0),
        eventDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Separar eventDate do input
      const { eventDate, ...restInput } = input;
      
      // Montar dados de inserção - remover campos undefined
      const insertData: any = { 
        name: restInput.name,
        slug: restInput.slug,
        tenantId: getTenantId(ctx),
        layoutType: restInput.layoutType || 'masonry',
        isFeatured: restInput.isFeatured ?? false,
        isPublic: restInput.isPublic ?? true,
        sortOrder: restInput.sortOrder ?? 0,
        salesEnabled: 0, // Default
        pricePerPhoto: 2500, // Default
      };
      
      // Add campos opcionais only se existirem
      if (restInput.description) insertData.description = restInput.description;
      if (restInput.coverImageUrl) insertData.coverImageUrl = restInput.coverImageUrl;
      if (restInput.password) insertData.password = restInput.password;
      if (eventDate) insertData.eventDate = eventDate; // Already vem no formato YYYY-MM-DD

      console.log('[Collections Create] Insert data:', JSON.stringify(insertData, null, 2));

      
      const result = await db!.insert(collections).values(insertData);
      const insertId = result[0].insertId;
      
      // Fetch the inserted item with the correct ID
      const inserted = await db
        .select()
        .from(collections)
        .where(eq(collections.id, insertId))
        .limit(1);
      
      return inserted[0];
    }),

  /**
   * Update collection
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        coverImageUrl: z.string().optional(),
        password: z.string().optional(),
        layoutType: z.enum(["grid", "masonry", "fullscreen"]).optional(),
        isFeatured: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).optional(),
        isPublic: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

      console.log('[DEBUG collections.update] Input received:', JSON.stringify(input, null, 2));

      // Converter boolean para tinyint (0 ou 1)
      const dbData: any = { ...data };
      console.log('[DEBUG collections.update] dbData ANTES conversion:', JSON.stringify(dbData, null, 2));
      if (typeof data.isFeatured === 'boolean') {
        dbData.isFeatured = data.isFeatured ? 1 : 0;
      }
      if (typeof data.isPublic === 'boolean') {
        dbData.isPublic = data.isPublic ? 1 : 0;
      }

      console.log('[DEBUG collections.update] dbData DEPOIS conversion:', JSON.stringify(dbData, null, 2));

      await db!.update(collections).set(dbData).where(and(eq(collections.id, id), eq(collections.tenantId, getTenantId(ctx))));

      // Fetch updated item
      const updated = await db
        .select()
        .from(collections)
        .where(eq(collections.id, id))
        .limit(1);

      return updated[0];
    }),

  /**
   * Delete collection
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tenantId = getTenantId(ctx);

      // 1. Fetch all gallery photos to get R2 URLs
      const photos = await db
        .select({
          id: mediaItems.id,
          originalUrl: mediaItems.originalUrl,
          previewUrl: mediaItems.previewUrl,
          thumbnailUrl: mediaItems.thumbnailUrl,
          watermarkedUrl: mediaItems.watermarkedUrl,
        })
        .from(mediaItems)
        .where(and(eq(mediaItems.collectionId, input.id), eq(mediaItems.tenantId, tenantId)));

      // 2. Extrair keys do R2 a partir das URLs
      const R2_PUBLIC_URL = "https://fotos.flowclik.com";
      const keysToDelete: string[] = [];

      for (const photo of photos) {
        const urls = [photo.originalUrl, photo.previewUrl, photo.thumbnailUrl, photo.watermarkedUrl];
        for (const url of urls) {
          if (url && url.startsWith(R2_PUBLIC_URL)) {
            // Extrair a key removendo o domain public
            const key = url.replace(R2_PUBLIC_URL + "/", "");
            if (key) keysToDelete.push(key);
          }
        }
      }

      // 3. Dhetar objetos do R2
      if (keysToDelete.length > 0) {
        try {
          const R2_ACCOUNT_ID = "023a0bad3f17632316cd10358db2201f";
          const s3 = new S3Client({
            region: "auto",
            endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID || "3a48256592438734e7be28fee1fe752b",
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "83ebf944befd8c04123d483619ac174bd83a7fdd2aa9cdba310f749365897740",
            },
            forcePathStyle: true,
          });
          const bucket = process.env.R2_BUCKET_NAME || "flowclikbr";

          // Dhetar em lotes de 1000 (limite do S3)
          for (let i = 0; i < keysToDelete.length; i += 1000) {
            const batch = keysToDelete.slice(i, i + 1000);
            await s3.send(new DeleteObjectsCommand({
              Bucket: bucket,
              Delete: { Objects: batch.map(Key => ({ Key })) },
            }));
          }

          console.log(`[R2] Gallery ${input.id}: ${keysToDelete.length} arquivos deleted do R2`);
        } catch (r2Error: any) {
          console.error(`[R2] Error deleting gallery files ${input.id}:`, r2Error.message);
          // Continua same se falhar no R2 - not bloqueia a dheção do banco
        }
      }

      // 4. Delete gallery photo selections
      await db.delete(photoSelections).where(
        sql`mediaItemId IN (SELECT id FROM mediaItems WHERE collectionId = ${input.id} AND tenantId = ${tenantId})`
      ).catch(() => {});

      // 5. Dhetar mediaItems do banco
      await db.delete(mediaItems).where(and(eq(mediaItems.collectionId, input.id), eq(mediaItems.tenantId, tenantId)));

      // 6. Delete the gallery from database
      await db.delete(collections).where(and(eq(collections.id, input.id), eq(collections.tenantId, tenantId)));

      console.log(`[Gallery] Gallery ${input.id} deleted com ${photos.length} fotos e ${keysToDelete.length} arquivos R2`);
      return { success: true, deletedPhotos: photos.length, deletedR2Files: keysToDelete.length };
    }),

  /**
   * Send gallery link by email
   */
  sendGalleryLink: protectedProcedure
    .input(z.object({ 
      collectionId: z.number(),
      clientEmail: z.string().email()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get collection
      const collection = await db
        .select()
        .from(collections)
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection[0]) {
        throw new Error("Gallery not found");
      }

      const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL?.replace('/api', '') || 'https://lirolla.com';
      const galleryUrl = `${baseUrl}/gallery/${collection[0].slug}`;
      
      // Count photos in gallery
      const photos = await db!.select().from(mediaItems).where(eq(mediaItems.collectionId, input.collectionId));
      
      // Send email using professional template
      const emailSent = await sendGalleryReadyEmail({
        clientName: input.clientEmail.split('@')[0], // TODO: fetch real client name
        clientEmail: input.clientEmail,
        galleryTitle: collection[0].name,
        galleryUrl,
        password: collection[0].password || undefined,
        photoCount: photos.length,
      });

      if (!emailSent) {
        throw new Error('Falha ao enviar email');
      }

      return { 
        success: true,
        message: `Email sent para ${input.clientEmail} com ${photos.length} fotos`
      };
    }),

  /**
   * Enable sales for a collection
   */
  enableSales: protectedProcedure
    .input(z.object({ 
      collectionId: z.number(),
      pricePerPhoto: z.number().default(2500), // £ 25.00
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Generate unique slug
      const slug = `gallery-${input.collectionId}-${Date.now()}`;

      // Update collection
      await db
        .update(collections)
        .set({
          salesEnabled: 1,
          publicSlug: slug,
          pricePerPhoto: input.pricePerPhoto,
        })
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))));

      // Mark all photos as available for sale
      await db
        .update(mediaItems)
        // @ts-ignore
        .set({ availableForSale: true })
        .where(eq(mediaItems.collectionId, input.collectionId));

      return { 
        success: true,
        publicSlug: slug,
        url: `/gallery-shop/${slug}`,
      };
    }),

  /**
   * Disable sales for a collection
   */
  disableSales: protectedProcedure
    .input(z.object({ collectionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(collections)
        .set({
          salesEnabled: 0,
          publicSlug: null,
        })
        .where(and(eq(collections.id, input.collectionId), eq(collections.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Get collection by appointment ID
   */
  getByAppointmentId: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.appointmentId, input.appointmentId), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      return collection || null;
    }),

  /**
   * Get collection by public slug (for sales page)
   */
  getByPublicSlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.publicSlug, input.slug), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection || !collection.salesEnabled) {
        return null;
      }

      // Get photos available for sale
      const photos = await db
        .select()
        .from(mediaItems)
        .where(eq(mediaItems.collectionId, collection.id));

      return {
        ...collection,
        photos: photos.filter(p => p.availableForSale),
      };
    }),

  /**
   * Get collections with photo selections count (OPTIMIZED - single query)
   */
  getWithSelectionsCount: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const db = await getDb();
    if (!db) return [];

    // Single optimized query with JOIN and COUNT
    const { sql } = await import('drizzle-orm');
    
    const result = await db
      .select({
        id: collections.id,
        name: collections.name,
        slug: collections.slug,
        description: collections.description,
        coverImageUrl: collections.coverImageUrl,
        eventDate: collections.eventDate,
        isPublic: collections.isPublic,
        isFeatured: collections.isFeatured,
        layoutType: collections.layoutType,
        password: collections.password,
        appointmentId: collections.appointmentId,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
        selectionsCount: sql<number>`CAST(COUNT(CASE WHEN ${photoSelections.isSelected} = 1 THEN 1 END) AS SIGNED)`,
      })
      .from(collections)
      .leftJoin(photoSelections, eq(photoSelections.collectionId, collections.id))
      .where(eq(collections.tenantId, getTenantId(ctx)))
      .groupBy(collections.id)
      .having(sql`COUNT(CASE WHEN ${photoSelections.isSelected} = 1 THEN 1 END) > 0`)
      .orderBy(sql`MAX(${collections.updatedAt}) DESC`)
      .limit(50); // Limit to 50 most recent collections

    return result;
  }),

  // TEMPORARY: Delete test galleries
  deleteTestGalleries: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    const { mediaItems, collections } = await import('../../drizzle/schema');
    const { sql } = await import('drizzle-orm');
    const dbConn = await getDb();
    if (!dbConn) throw new Error('Database not available');
    
    // Dhetar fotos first
    await db!.delete(mediaItems).where(sql`collectionId >= 21`);
    
    // Dhetar galerias
    const result = await db!.delete(collections).where(sql`id >= 21`);
    
    return { deleted: result[0].affectedRows };
  }),
});
