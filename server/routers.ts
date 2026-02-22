import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { z } from "zod";

// Import all routers
import { medayRouter } from "./routers/meday";
import { collectionsRouter } from "./routers/collections";
import { clientsRouter } from "./routers/clients";
import { dashboardRouter } from "./routers/dashboard";
import { servicesRouter } from "./routers/services";
import { appointmentsRouter } from "./routers/appointments";
import { bannerRouter } from "./routers/banner";
import { contractsRouter } from './routers/contracts';
import { aboutRouter } from './routers/about';
import { contactRouter } from './routers/contact';
import { portfolioRouter } from './routers/portfolio';
import { ordersRouter } from './routers/orders';
import { stockRouter } from './routers/stock';
import { blockedDatesRouter } from './routers/blockedDates';
import { appointmentStatsRouter } from './routers/appointmentStats';
import { clientDetailsRouter } from './routers/clientDetails';
import { appointmentPhotosRouter } from './routers/appointmentPhotos';
import { sessionGalleryRouter } from './routers/sessionGallery';
import { photoCommentsRouter } from './routers/photoComments';
import { siteConfigRouter } from './routers/siteConfig';
import { paymentsRouter } from './routers/payments';
import { photoSelectionsRouter } from './routers/photoSelections';
import { paymentMethodsRouter } from './routers/paymentMethods';
import { clientChatRouter } from './routers/clientChat';
import { downloadControlRouter } from './routers/downloadControl';
import { albumGuestsRouter } from './routers/albumGuests';
import { finalAlbumsRouter } from './routers/finalAlbums';
import { usageRouter } from './routers/usage';
import { photoSalesRouter } from './routers/photoSales';
import { supportTicketsRouter } from './routers/supportTickets';
import { sistemaRouter } from './routers/system';
import { customAuthRouter } from './routers/customAuth';
import { systemRouter as adminSystemRouter } from './routers/system';
import { saasSystemRouter } from './routers/saasSystem';
import { subscriptionsRouter } from './routers/subscriptions';
import { customSunainsRouter } from './routers/customSunains';
import { emailRouter } from './routers/email';
import { emailMarketingRouter } from './routers/emailMarketing';
import { tenantsRouter } from './routers/tenants';

export const appRouter = router({
  // System routers
  system: adminSystemRouter,
  saasSystem: saasSystemRouter,
  customSunains: customSunainsRouter,

  // Authentication
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(
        z.object({
          phone: z.string().optional(),
          cpf: z.string().optional(),
          zipCode: z.string().optional(),
          street: z.string().optional(),
          number: z.string().optional(),
          complement: z.string().optional(),
          neighborhood: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");
        const { users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        
        await dbInstance
          .update(users)
          .set({
            phone: input.phone,
            cpf: input.cpf,
            zipCode: input.zipCode,
            street: input.street,
            number: input.number,
            complement: input.complement,
            neighborhood: input.neighborhood,
            city: input.city,
            state: input.state,
            country: input.country,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.id, ctx.user!.id));

        return { success: true };
      }),
  }),

  // Custom authentication (JWT)
  customAuth: customAuthRouter,

  // Site configuration
  site: router({
    getConfig: publicProcedure.query(async ({ ctx }) => {
      return await db.getSiteConfig(db.getTenantId(ctx));
    }),
    updateConfig: protectedProcedure
      .input(z.object({
        activeTemplate: z.string().optional(),
        siteName: z.string().optional(),
        siteTagline: z.string().optional(),
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        accentColor: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateSiteConfig(input);
      }),
  }),

  // Banner slides
  bannerSlides: router({
    getActive: publicProcedure.query(async () => {
      return await db.getActiveSlides();
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { bannerSlides } = await import('../drizzle/schema');
      return await dbInstance.select().from(bannerSlides);
    }),
  }),

  // Feature routers
  collections: collectionsRouter,
  meday: medayRouter,
  clients: clientsRouter,
  dashboard: dashboardRouter,
  services: servicesRouter,
  appointments: appointmentsRouter,
  banner: bannerRouter,
  contracts: contractsRouter,
  about: aboutRouter,
  contact: contactRouter,
  portfolio: portfolioRouter,
  orders: ordersRouter,
  stock: stockRouter,
  blockedDates: blockedDatesRouter,
  appointmentStats: appointmentStatsRouter,
  clientDetails: clientDetailsRouter,
  appointmentPhotos: appointmentPhotosRouter,
  sessionGallery: sessionGalleryRouter,
  photoComments: photoCommentsRouter,
  siteConfig: siteConfigRouter,
  payments: paymentsRouter,
  photoSales: photoSalesRouter,
  supportTickets: supportTicketsRouter,
  sistema: sistemaRouter,

  photoSelections: photoSelectionsRouter,
  paymentMethods: paymentMethodsRouter,
  clientChat: clientChatRouter,
  downloadControl: downloadControlRouter,
  albumGuests: albumGuestsRouter,
  finalAlbums: finalAlbumsRouter,
  usage: usageRouter,
  subscriptions: subscriptionsRouter,

  // Tenants (cadastro de photographers)
  tenants: tenantsRouter,

  // Email transacional (Resend)
  email: emailRouter,
  emailMarketing: emailMarketingRouter,
});

export type AppRouter = typeof appRouter;
