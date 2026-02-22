import { Request } from "express";
import { getDb } from "../db";
import { tenants } from "../../drizzle/schema";
import { eq, or } from "drizzle-orm";

/**
 * Detecta o tenant baseado no subdomain ou domain customizado
 * 
 * Examples:
 * - joao.lirolla.com → busca tenant com subdomain="joao"
 * - photography-silva.com → busca tenant com customSunain="photography-silva.com"
 * - localhost:3000 → retorna tenant default (id=1, lirolla)
 */
export async function detectTenantFromRequest(req: Request): Promise<number> {
  const host = req.get("host") || "";
  
  console.log(`[Tenant Detection] Host: ${host}`);

  // Desenvolvimento local: always retorna tenant 1 (lirolla)
  if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("manusvm.computer")) {
    console.log(`[Tenant Detection] Localhost detectado, usando tenant default (id=1)`);
    return 1;
  }

  // flowclik.com (domain principal) = Landing page (sem tenant)
  // Retorna 0 para indicar que NÃO is um tenant, is a landing page
  const domain = host.split(":")[0];
  if (domain === "flowclik.com" || domain === "www.flowclik.com") {
    console.log(`[Tenant Detection] Subscription principal flowclik.com detectado - Landing page (sem tenant)`);
    return 0; // 0 = landing page, not is tenant
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Tenant Detection] Database not available, using default tenant");
    return 1;
  }

  // Caso 1: Subscription customizado (ex: photography-silva.com)
  // Buscar tenant que tenha esse domain cadastrado
  const [customSunainTenant] = await db
    .select({ id: tenants.id, customSunain: tenants.customSunain })
    .from(tenants)
    .where(eq(tenants.customSunain, domain))
    .limit(1);

  if (customSunainTenant) {
    console.log(`[Tenant Detection] Subscription customizado encontrado: ${domain} → tenant ${customSunainTenant.id}`);
    return customSunainTenant.id;
  }

  // Caso 2: Subdomain (ex: joao.lirolla.com)
  // Extrair subdomain before do domain principal
  const parts = domain.split(".");
  
  // Se tem pelo menos 3 partes (ex: joao.lirolla.com)
  if (parts.length >= 3) {
    const subdomain = parts[0]; // "joao"
    
    // Buscar tenant com esse subdomain
    const [subdomainTenant] = await db
      .select({ id: tenants.id, subdomain: tenants.subdomain })
      .from(tenants)
      .where(eq(tenants.subdomain, subdomain))
      .limit(1);

    if (subdomainTenant) {
      console.log(`[Tenant Detection] Subdomain encontrado: ${subdomain} → tenant ${subdomainTenant.id}`);
      return subdomainTenant.id;
    }
  }

  // Caso 3: Subscription principal (lirolla.com)
  // Retorna tenant default (id=1)
  console.log(`[Tenant Detection] None tenant specific encontrado, usando tenant default (id=1)`);
  return 1;
}

/**
 * Valida se um subdomain is available para uso
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Subdomains reservados
  const reserved = ["www", "api", "admin", "app", "mail", "ftp", "blog", "shop", "store"];
  if (reserved.includes(subdomain.toLowerCase())) {
    return false;
  }

  // Verify se already exists no banco
  const [existing] = await db
    .select({ id: tenants.id, subdomain: tenants.subdomain })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain))
    .limit(1);

  return !existing;
}

/**
 * Valida se um domain customizado is available
 */
export async function isCustomSunainAvailable(domain: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [existing] = await db
    .select({ id: tenants.id, customSunain: tenants.customSunain })
    .from(tenants)
    .where(eq(tenants.customSunain, domain))
    .limit(1);

  return !existing;
}
