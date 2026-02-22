import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { siteConfig } from "../../drizzle/schema";
import { eq , and } from "drizzle-orm";

export const siteConfigRouter = router({
  /**
   * Get site config (public)
   */
  get: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const config = await db.select().from(siteConfig).limit(1)
      .where(eq(siteConfig.tenantId, getTenantId(ctx)))
    return config[0] || null;
  }),

  /**
   * Update business mode (admin)
   */
  updateBusinessMode: protectedProcedure
    .input(z.object({
      businessMode: z.enum(["photography_only", "video_only", "both"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get existing config
      const existing = await db.select().from(siteConfig).limit(1)
      .where(eq(siteConfig.tenantId, getTenantId(ctx)))

      if (existing.length === 0) {
        // Create new config
        await db.insert(siteConfig).values({
          businessMode: input.businessMode,
          tenantId: getTenantId(ctx),
        });
      } else {
        // Update existing
        await db
          .update(siteConfig)
          .set({ businessMode: input.businessMode })
          .where(and(eq(siteConfig.id, existing[0].id), eq(siteConfig.tenantId, getTenantId(ctx))));
      }

      return { success: true };
    }),

  /**
   * Update site config (admin)
   */
  update: protectedProcedure
    .input(z.object({
      siteName: z.string().optional(),
      siteTagline: z.string().optional(),
      logoUrl: z.string().optional(),
      stockPhotosEnabled: z.boolean().optional(),
      aboutTitle: z.string().optional(),
      
      aboutContent: z.string().optional(),
      
      aboutImage: z.string().optional(),
      aboutMission: z.string().optional(),
      
      aboutVision: z.string().optional(),
      
      aboutValues: z.string().optional(),
      
      servicesIntro: z.string().optional(),
      
      
      
      contactPhone: z.string().optional(),
      contactEmail: z.string().optional(),
      contactWhatsApp: z.string().optional(),
      contactAddress: z.string().optional(),
      socialInstagram: z.string().optional(),
      socialFacebook: z.string().optional(),
      socialYouTube: z.string().optional(),
      templateName: z.string().optional(),
      templateDescription: z.string().optional(),
      paymentStripeEnabled: z.boolean().optional(),
      paymentBankTransferEnabled: z.boolean().optional(),
      paymentBankDetails: z.string().optional(),
      paymentCashEnabled: z.boolean().optional(),
      paymentCashInstructions: z.string().optional(),
      paymentPixEnabled: z.boolean().optional(),
      paymentPixKey: z.string().optional(),
      paymentLinkEnabled: z.boolean().optional(),
      parallaxEnabled: z.boolean().optional(),
      parallaxImageUrl: z.string().optional(),
      parallaxTitle: z.string().optional(),
      parallaxSubtitle: z.string().optional(),
      // Regional settings
      baseCountry: z.string().optional(),
      baseCurrency: z.string().optional(),
      currencySymbol: z.string().optional(),
      timezone: z.string().optional(),
      phoneCountryCode: z.string().optional(),
      // Visual theme settings
      siteThemeLayout: z.enum(["classic", "sidebar", "wedding", "wedding-videos", "editorial", "cinematic"]).optional(),
      siteThemeMode: z.enum(["light", "dark"]).optional(),
      siteThemeAccentColor: z.enum(["red", "black", "blue"]).optional(),
      siteFont: z.enum(["poppins", "inter", "roboto", "playfair", "montserrat", "lato"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log('[siteConfig.update] Input received:', JSON.stringify(input, null, 2));
        
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Get existing config
        const existing = await db.select().from(siteConfig).limit(1)
        .where(eq(siteConfig.tenantId, getTenantId(ctx)));

        console.log('[siteConfig.update] Existing config found:', existing.length);

        if (existing.length === 0) {
          // Create new config
          console.log('[siteConfig.update] Creating new config for tenant:', getTenantId(ctx));
          // @ts-ignore
          await db.insert(siteConfig).values({ ...input, tenantId: getTenantId(ctx) });
        } else {
          // Update existing
          console.log('[siteConfig.update] Updating existing config ID:', existing[0].id);
          await db
            .update(siteConfig)
            .set(input as any)
            .where(and(eq(siteConfig.id, existing[0].id), eq(siteConfig.tenantId, getTenantId(ctx))));
        }

        console.log('[siteConfig.update] Success!');
        return { success: true };
      } catch (error) {
        console.error('[siteConfig.update] ERROR:', error);
        throw error;
      }
    }),
});
