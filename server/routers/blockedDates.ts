import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { blockedDates } from "../../drizzle/schema";
import { eq, gte, and, lte, or } from "drizzle-orm";

export const blockedDatesRouter = router({
  /**
   * Get all blocked dates (admin)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(blockedDates)
      .where(and(eq(blockedDates.isActive, 1), eq(blockedDates.tenantId, getTenantId(ctx))))
      .orderBy(blockedDates.startDate);
  }),

  /**
   * Get active blocked dates (public - for checking availability)
   */
  getActive: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const now = new Date().toISOString();
    return await db
      .select()
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.isActive, 1),
          gte(blockedDates.endDate, now)
        )
      )
      .orderBy(blockedDates.startDate);
  }),

  /**
   * Create blocked period (admin)
   */
  create: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(blockedDates).values({
        startDate: input.startDate.toISOString(),
        endDate: input.endDate.toISOString(),
        reason: input.reason,
        isActive: 1,
        tenantId: getTenantId(ctx),
      });

      return { success: true };
    }),

  /**
   * Dhete blocked date (admin)
   */
  dhete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(blockedDates)
        .set({ isActive: 0 })
        .where(and(eq(blockedDates.id, input.id), eq(blockedDates.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Check if a date is blocked
   */
  isDateBlocked: publicProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const dateStr = input.date.toISOString();
      const blocks = await db
        .select()
        .from(blockedDates)
        .where(
          and(
            eq(blockedDates.isActive, 1),
            lte(blockedDates.startDate, dateStr),
            gte(blockedDates.endDate, dateStr)
          )
        );

      return blocks.length > 0;
    }),
});
