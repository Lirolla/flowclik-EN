import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { bannerSlides } from "../../drizzle/schema";
import { eq , and } from "drizzle-orm";
import { storagePut, R2Paths } from "../storage";

export const bannerRouter = router({
  /**
   * Get all active slides (public)
   */
  getActive: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(bannerSlides)
      .where(and(eq(bannerSlides.isActive, 1), eq(bannerSlides.tenantId, getTenantId(ctx))))
      .orderBy(bannerSlides.sortOrder);
  }),

  /**
   * Get all slides (admin)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    
    const db = await getDb();
    if (!db) return [];
    
    const slides = await db.select().from(bannerSlides).orderBy(bannerSlides.sortOrder)
    .where(eq(bannerSlides.tenantId, getTenantId(ctx)));
    
    // Converter tinyint para boolean
    return slides.map(slide => ({
      ...slide,
      isActive: Boolean(slide.isActive)
    }));
  }),

  /**
   * Create slide
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        buttonText: z.string().optional(),
        buttonLink: z.string().optional(),
        imageData: z.string().optional(), // base64
        videoUrl: z.string().optional(),
        displayOn: z.enum(["photography", "video", "both"]).default("both"),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let imageUrl: string | null = null;

      // Upload imagem se fornecida
      if (input.imageData) {
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const fileName = `banner-${timestamp}-${randomId}.jpg`;
        const key = R2Paths.banner(getTenantId(ctx), fileName);

        const { url } = await storagePut(key, buffer, "image/jpeg");
        imageUrl = url;
      }

      // Detectar tipo automaticamente
      const slideType: "image" | "video" = input.videoUrl ? "video" : "image";

      const slideData = {
        tenantId: getTenantId(ctx),
        slideType,
        title: input.title || null,
        description: input.subtitle || null,
        buttonText: input.buttonText || null,
        buttonLink: input.buttonLink || null,
        imageUrl,
        videoUrl: input.videoUrl || null,
        displayOn: input.displayOn,
        sortOrder: input.sortOrder,
        isActive: input.isActive ? 1 : 0,
      };

      await db.insert(bannerSlides).values(slideData);

      // Buscar o item inserido
      const inserted = await db
        .select()
        .from(bannerSlides)
        .where(eq(bannerSlides.tenantId, getTenantId(ctx)))
        .orderBy(bannerSlides.id)
        .limit(1);

      return inserted[inserted.length - 1];
    }),

  /**
   * Update slide
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional().nullable(),
        subtitle: z.string().optional().nullable(),
        buttonText: z.string().optional().nullable(),
        buttonLink: z.string().optional().nullable(),
        imageData: z.string().optional(),
        videoUrl: z.string().optional().nullable(),
        displayOn: z.enum(["photography", "video", "both"]).optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, imageData, subtitle, isActive, ...data } = input;
      const updateData: any = { 
        ...data,
        description: subtitle !== undefined ? subtitle : undefined,
        isActive: isActive !== undefined ? (isActive ? 1 : 0) : undefined
      };

      // Detectar tipo automaticamente
      if (input.videoUrl) {
        updateData.slideType = "video";
      } else if (imageData) {
        updateData.slideType = "image";
      }

      // Upload new imagem se fornecida
      if (imageData) {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const fileName = `banner-${timestamp}-${randomId}.jpg`;
        const key = R2Paths.banner(getTenantId(ctx), fileName);

        const { url } = await storagePut(key, buffer, "image/jpeg");
        updateData.imageUrl = url;
      }

      await db.update(bannerSlides).set(updateData).where(and(eq(bannerSlides.id, id), eq(bannerSlides.tenantId, getTenantId(ctx))));

      // Buscar item atualizado
      const updated = await db
        .select()
        .from(bannerSlides)
        .where(and(eq(bannerSlides.id, id), eq(bannerSlides.tenantId, getTenantId(ctx))))
        .limit(1);

      return updated[0];
    }),

  /**
   * Delete slide
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(bannerSlides).where(and(eq(bannerSlides.id, input.id), eq(bannerSlides.tenantId, getTenantId(ctx))));

      return { success: true };
    }),
});
