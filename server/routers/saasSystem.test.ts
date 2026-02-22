import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { tenants, subscriptions, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("SaaS System - Cadastro de Tenants", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  const testSubdomain = `test-${Date.now()}`;

  beforeAll(async () => {
    db = await getDb();
  });

  it("deve criar tenant + subscription + usuário admin", async () => {
    if (!db) throw new Error("Database não disponível");

    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    // 1. Criar tenant
    const result = await caller.saasSystem.createTenant({
      name: "Fotógrafo Teste",
      email: `${testSubdomain}@test.com`,
      subdomain: testSubdomain,
      password: "senha123",
    });

    expect(result.success).toBe(true);
    expect(result.subdomain).toBe(testSubdomain);
    expect(result.url).toBe(`https://${testSubdomain}.flowclick.com`);

    // 2. Verificar tenant criado
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, testSubdomain));

    expect(tenant).toBeDefined();
    expect(tenant.name).toBe("Fotógrafo Teste");
    expect(tenant.email).toBe(`${testSubdomain}@test.com`);
    expect(tenant.status).toBe("active");

    // 3. Verificar subscription criada
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, tenant.id));

    expect(subscription).toBeDefined();
    expect(subscription.plan).toBe("starter");
    expect(subscription.status).toBe("trialing");
    expect(subscription.storageLimit).toBe(10737418240); // 10GB
    expect(subscription.galleryLimit).toBe(10);

    // 4. Verificar usuário admin criado
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, `${testSubdomain}@test.com`));

    expect(user).toBeDefined();
    expect(user.name).toBe("Fotógrafo Teste");
    expect(user.role).toBe("admin");
    expect(user.tenantId).toBe(tenant.id);
    expect(user.password).toBeDefined(); // Hash bcrypt

    console.log("✅ Tenant criado com sucesso:", {
      tenantId: tenant.id,
      subdomain: tenant.subdomain,
      plan: subscription.plan,
      status: subscription.status,
      userRole: user.role,
    });
  }, 30000);

  it("deve rejeitar subdomínio duplicado", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      caller.saasSystem.createTenant({
        name: "Outro Fotógrafo",
        email: "outro@test.com",
        subdomain: testSubdomain, // Mesmo subdomínio
        password: "senha123",
      })
    ).rejects.toThrow("Subdomínio já está em uso");
  });

  it("deve verificar disponibilidade de subdomínio", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    // Subdomínio existente
    const existing = await caller.saasSystem.checkSubdomain({
      subdomain: testSubdomain,
    });
    expect(existing.available).toBe(false);

    // Subdomínio disponível
    const available = await caller.saasSystem.checkSubdomain({
      subdomain: `novo-${Date.now()}`,
    });
    expect(available.available).toBe(true);
  });
});
