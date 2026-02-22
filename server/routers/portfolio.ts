import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { portfolioItems } from "../../drizzle/schema";
import { eq, desc , and } from "drizzle-orm";

export const portfolioRouter = router({
  /**
   * List portfolio items for home page (public)
   */
  listForHome: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(portfolioItems)
      .where(and(eq(portfolioItems.showOnHome, 1), eq(portfolioItems.tenantId, getTenantId(ctx))))
      .orderBy(desc(portfolioItems.sortOrder), desc(portfolioItems.createdAt))
      .limit(8);
  }),

  /**
   * List all active portfolio items (public)
   */
  listActive: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(portfolioItems)
      .where(and(eq(portfolioItems.isActive, 1), eq(portfolioItems.tenantId, getTenantId(ctx))))
      .orderBy(desc(portfolioItems.sortOrder), desc(portfolioItems.createdAt));
  }),

  /**
   * List all portfolio items (admin)
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(portfolioItems)
      .where(eq(portfolioItems.tenantId, getTenantId(ctx)))
      .orderBy(desc(portfolioItems.sortOrder), desc(portfolioItems.createdAt));
  }),

  /**
   * Create portfolio item (admin)
   */
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["photo", "video"]).default("photo"),
        title: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        story: z.string().optional(),
        imageUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).default(true),
        showOnHome: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)).default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(portfolioItems).values({
        type: input.type,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        story: input.story || null,
        imageUrl: input.imageUrl || null,
        thumbnailUrl: input.thumbnailUrl || null,
        videoUrl: input.videoUrl || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive ? 1 : 0,
        showOnHome: input.showOnHome ? 1 : 0,
        tenantId: getTenantId(ctx),
      });

      return { success: true, id: result[0].insertId };
    }),

  /**
   * Update portfolio item (admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["photo", "video"]).optional(),
        title: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        story: z.string().optional(),
        imageUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        videoUrl: z.string().optional(),
        sortOrder: z.number(),
        isActive: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
        showOnHome: z.union([z.boolean(), z.number()]).transform(v => Boolean(v)),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {
        type: input.type,
        title: input.title,
        description: input.description || null,
        location: input.location || null,
        story: input.story || null,
        sortOrder: input.sortOrder,
        isActive: input.isActive ? 1 : 0,
        showOnHome: input.showOnHome ? 1 : 0,
      };
      
      if (input.type) updateData.type = input.type;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl || null;
      if (input.thumbnailUrl !== undefined) updateData.thumbnailUrl = input.thumbnailUrl || null;
      if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl || null;

      await db
        .update(portfolioItems)
        .set(updateData)
        .where(and(eq(portfolioItems.id, input.id), eq(portfolioItems.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Delete portfolio item (admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(portfolioItems).where(and(eq(portfolioItems.id, input.id), eq(portfolioItems.tenantId, getTenantId(ctx))));

      return { success: true };
    }),
});
