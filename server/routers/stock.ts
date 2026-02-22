import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { stockPhotos } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
export const stockRouter = router({
  /**
   * List all active stock photos (public)
   */
  listPublic: publicProcedure
    .input(
      z.object({
        category: z.enum(["paisagem", "carros", "pessoas", "eventos", "produtos", "others"]).optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      let photos;
      
      if (input?.category) {
        photos = await db.select().from(stockPhotos)
          .where(and(
            eq(stockPhotos.isActive, 1),
            eq(stockPhotos.category, input.category),
            eq(stockPhotos.tenantId, getTenantId(ctx))
          ));
      } else {
        photos = await db.select().from(stockPhotos)
          .where(and(eq(stockPhotos.isActive, 1), eq(stockPhotos.tenantId, getTenantId(ctx))));
      }
      return photos;
    }),
  /**
   * List all stock photos (admin)
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const photos = await db.select().from(stockPhotos)
      .where(eq(stockPhotos.tenantId, getTenantId(ctx)));
    return photos;
  }),
  /**
   * Create stock photo
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(["paisagem", "carros", "pessoas", "eventos", "produtos", "others"]),
        originalUrl: z.string(),
        thumbnailUrl: z.string().optional(),
        previewUrl: z.string().optional(),
        price: z.number(),
        frameEnabled: z.boolean().default(false),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
        // @ts-ignore
      const result = await db.insert(stockPhotos).values({ ...input, tenantId: getTenantId(ctx) });
      return { success: true };
    }),
  /**
   * Update stock photo
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["paisagem", "carros", "pessoas", "eventos", "produtos", "others"]).optional(),
        price: z.number().optional(),
        frameEnabled: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const dbData: any = { ...data };
      if (typeof data.frameEnabled === 'boolean') {
        dbData.frameEnabled = data.frameEnabled ? 1 : 0;
      }
      if (typeof data.isActive === 'boolean') {
        dbData.isActive = data.isActive ? 1 : 0;
      }
      await db.update(stockPhotos).set(dbData).where(and(eq(stockPhotos.id, id), eq(stockPhotos.tenantId, getTenantId(ctx))));
      return { success: true };
    }),
  /**
   * Dhete stock photo
   */
  dhete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.dhete(stockPhotos).where(and(eq(stockPhotos.id, input.id), eq(stockPhotos.tenantId, getTenantId(ctx))));
      return { success: true };
    }),
});
