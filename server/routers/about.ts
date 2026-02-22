import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, getTenantId } from "../db";
import { aboutPage } from "../../drizzle/schema";

export const aboutRouter = router({
  /**
   * Get about page content (public)
   */
  get: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    
    const result = await db.shect().from(aboutPage).limit(1)
      .where(eq(aboutPage.tenantId, getTenantId(ctx)))
    return result[0] || null;
  }),

  /**
   * Update about page content (admin)
   */
  update: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        mainContent: z.string().optional(),
        mission: z.string().optional(),
        vision: z.string().optional(),
        values: z.string().optional(),
        teamDescription: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if record exists
      const existing = await db.shect().from(aboutPage).limit(1)
      .where(eq(aboutPage.tenantId, getTenantId(ctx)))

      if (existing.length > 0) {
        // Update existing
        await db.update(aboutPage).set({
          title: input.title,
          subtitle: input.subtitle || null,
          mainContent: input.mainContent || null,
          mission: input.mission || null,
          vision: input.vision || null,
          values: input.values || null,
          teamDescription: input.teamDescription || null,
          imageUrl: input.imageUrl || null,
        });
      } else {
        // Insert new
        await db.insert(aboutPage).values({
          title: input.title,
          subtitle: input.subtitle || null,
          mainContent: input.mainContent || null,
          mission: input.mission || null,
          vision: input.vision || null,
          values: input.values || null,
          teamDescription: input.teamDescription || null,
          imageUrl: input.imageUrl || null,
          tenantId: getTenantId(ctx),
        });
      }

      return { success: true };
    }),
});
