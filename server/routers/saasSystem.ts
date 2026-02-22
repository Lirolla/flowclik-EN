import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tenants, subscriptions, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { initializeTenantStorage } from "../storage";

export const saasSystemRouter = router({
  /**
   * Criar novo tenant (fotógrafo) com trial gratuito
   * PUBLIC - Qualquer pessoa pode se cadastrar
   */
  createTenant: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        subdomain: z
          .string()
          .min(3, "Subdomínio deve ter pelo menos 3 caracteres")
          .max(63, "Subdomínio muito longo")
          .regex(
            /^[a-z0-9-]+$/,
            "Apenas letras minúsculas, números e hífen"
          ),
        password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      // 1. Validar se subdomínio já existe
      const existingTenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, input.subdomain))
        .limit(1);

      if (existingTenant.length > 0) {
        throw new Error("Subdomínio já está em uso");
      }

      // 2. Validar se email já existe
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("Email já cadastrado");
      }

      // 3. Hash da senha
      const passwordHash = await bcrypt.hash(input.password, 10);

      // 4. Criar tenant (dados Brasil)
        // @ts-ignore
      const [newTenant] = await db.insert(tenants).values({
        name: input.name,
        subdomain: input.subdomain,
        email: input.email,
        baseCountry: "United Kingdom",
        baseCurrency: "BRL",
        currencySymbol: "R$",
        timezone: "America/Sao_Paulo",
        status: "active",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      });

      const tenantId = newTenant.insertId;

      // 4.5. Inicializar pastas do tenant no R2
      try {
        await initializeTenantStorage(Number(tenantId));
      } catch (error: any) {
        console.error("[Tenant Creation] Erro ao criar pastas R2:", error.message);
        // Não falha o cadastro se as pastas não forem criadas, mas loga o erro
      }

      // 5. Criar assinatura trial (7 dias grátis)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      await db.insert(subscriptions).values({
        tenantId: Number(tenantId),
        plan: "starter",
        status: "trialing",
        storageLimit: 10737418240, // 10GB
        galleryLimit: 10,
        extraStorage: 0,
        extraGalleries: 0,
        cancelAtPeriodEnd: 0,
      });

      // 6. Criar usuário admin
      await db.insert(users).values({
        tenantId: Number(tenantId),
        email: input.email,
        password: passwordHash,
        name: input.name,
        loginMethod: "email",
        role: "admin",
      });

      // 7. Retornar sucesso
      return {
        success: true,
        tenantId: Number(tenantId),
        subdomain: input.subdomain,
        url: `https://${input.subdomain}.flowclik.com`,
        trialEndsAt: trialEndDate,
      };
    }),

  /**
   * Verificar se subdomínio está disponível
   * PUBLIC - Para validação em tempo real no formulário
   */
  checkSubdomain: publicProcedure
    .input(z.object({ subdomain: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      const existing = await db
        .select()
        .from(tenants)
        .where(eq(tenants.subdomain, input.subdomain))
        .limit(1);

      return {
        available: existing.length === 0,
      };
    }),
});
