import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tenants, users, subscriptions, siteConfig } from "../../drizzle/schema";
import { isSubdomainAvailable } from "../_core/tenantDetection";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq, and, sql } from "drizzle-orm";
import { initializeTenantStorage } from "../storage";

export const tenantsRouter = router({
  /**
   * Registrar novo tenant (cadastro public)
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome must ter pelo menos 2 caracteres"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Senha must ter pelo menos 6 caracteres"),
        subdomain: z.string()
          .min(3, "Subdomain must ter pelo menos 3 caracteres")
          .max(50, "Subdomain muito longo")
          .regex(/^[a-z0-9-]+$/, "Subdomain must conter only letras minúsculas, numbers and hyphens"),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Validar se subdomain is available
      const available = await isSubdomainAvailable(input.subdomain);
      if (!available) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Este subdomain already is em uso ou é reservado" 
        });
      }

      // Check if email already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "This email is already registered" 
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Calcular data de fim do trial (7 days)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      // 1. Criar tenant
      await db.insert(tenants).values({
        subdomain: input.subdomain,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        status: 'active',
        baseCountry: 'Brasil',
        baseCurrency: 'GBP',
        currencySymbol: '£',
        timezone: 'Europe/London',
        primaryColor: '#000000',
        accentColor: '#C9A961',
        trialEndsAt: trialEndsAt.toISOString().slice(0, 19).replace('T', ' '),
      });

      // Buscar tenant recém-criado
      const [createdTenant] = await db
        .select({ id: tenants.id, subdomain: tenants.subdomain, email: tenants.email })
        .from(tenants)
        .where(eq(tenants.email, input.email))
        .limit(1);

      const tenantId = createdTenant.id;

      // 1.5. Initializar pastas do tenant no R2
      try {
        await initializeTenantStorage(tenantId);
      } catch (error: any) {
        console.error("[Tenant Creation] Erro ao criar pastas R2:", error.message);
        // Not falha o cadastro se as pastas not forem criadas
      }

      // 2. Criar usuário admin do tenant
      await db.insert(users).values({
        tenantId,
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: 'admin',
      });

      // 3. Criar subscription default (trial de 7 days)
      // Usar SQL puro para evitar problemas com defaults do Drizzle
      await db.execute(
        sql`INSERT INTO subscriptions (tenantId, plan, status, currentPeriodStart, currentPeriodEnd) VALUES (${tenantId}, 'basico', 'trialing', ${new Date().toISOString()}, ${trialEndsAt.toISOString()})`
      );

      // 4. Criar siteConfig default
      await db.insert(siteConfig).values({
        tenantId,
        siteName: input.name,
        siteTagline: 'Photography Profissional',
        businessMode: 'photography_only',
        paymentCashEnabled: 1,
        paymentBankTransferEnabled: 1,
        paymentStripeEnabled: 0,
        stockPhotosEnabled: 0,
      });

      return {
        success: true,
        tenantId,
        subdomain: input.subdomain,
        redirectUrl: `https://${input.subdomain}.flowclik.com/admin`,
      };
    }),

  /**
   * Verify disponibilidade de subdomain
   */
  checkSubdomain: publicProcedure
    .input(z.object({ subdomain: z.string() }))
    .query(async ({ input }) => {
      const available = await isSubdomainAvailable(input.subdomain);
      return { available };
    }),
});
