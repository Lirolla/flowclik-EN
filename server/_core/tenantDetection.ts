import { Request } from "express";
import { getDb } from "../db";
import { tenants } from "../../drizzle/schema";
import { eq, or } from "drizzle-orm";

/**
 * Detecta o tenant baseado no subdomínio ou domínio customizado
 * 
 * Exemplos:
 * - joao.lirolla.com → busca tenant com subdomain="joao"
 * - fotografia-silva.com → busca tenant com customDomain="fotografia-silva.com"
 * - localhost:3000 → retorna tenant padrão (id=1, lirolla)
 */
export async function detectTenantFromRequest(req: Request): Promise<number> {
  const host = req.get("host") || "";
  
  console.log(`[Tenant Detection] Host: ${host}`);

  // Desenvolvimento local: sempre retorna tenant 1 (lirolla)
  if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("manusvm.computer")) {
    console.log(`[Tenant Detection] Localhost detectado, usando tenant padrão (id=1)`);
    return 1;
  }

  // flowclik.com (domínio principal) = Landing page (sem tenant)
  // Retorna 0 para indicar que NÃO é um tenant, é a landing page
  const domain = host.split(":")[0];
  if (domain === "flowclik.com" || domain === "www.flowclik.com") {
    console.log(`[Tenant Detection] Domínio principal flowclik.com detectado - Landing page (sem tenant)`);
    return 0; // 0 = landing page, não é tenant
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Tenant Detection] Database não disponível, usando tenant padrão");
    return 1;
  }

  // Caso 1: Domínio customizado (ex: fotografia-silva.com)
  // Buscar tenant que tenha esse domínio cadastrado
  const [customDomainTenant] = await db
    .select({ id: tenants.id, customDomain: tenants.customDomain })
    .from(tenants)
    .where(eq(tenants.customDomain, domain))
    .limit(1);

  if (customDomainTenant) {
    console.log(`[Tenant Detection] Domínio customizado encontrado: ${domain} → tenant ${customDomainTenant.id}`);
    return customDomainTenant.id;
  }

  // Caso 2: Subdomínio (ex: joao.lirolla.com)
  // Extrair subdomínio antes do domínio principal
  const parts = domain.split(".");
  
  // Se tem pelo menos 3 partes (ex: joao.lirolla.com)
  if (parts.length >= 3) {
    const subdomain = parts[0]; // "joao"
    
    // Buscar tenant com esse subdomínio
    const [subdomainTenant] = await db
      .select({ id: tenants.id, subdomain: tenants.subdomain })
      .from(tenants)
      .where(eq(tenants.subdomain, subdomain))
      .limit(1);

    if (subdomainTenant) {
      console.log(`[Tenant Detection] Subdomínio encontrado: ${subdomain} → tenant ${subdomainTenant.id}`);
      return subdomainTenant.id;
    }
  }

  // Caso 3: Domínio principal (lirolla.com)
  // Retorna tenant padrão (id=1)
  console.log(`[Tenant Detection] Nenhum tenant específico encontrado, usando tenant padrão (id=1)`);
  return 1;
}

/**
 * Valida se um subdomínio está disponível para uso
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Subdomínios reservados
  const reserved = ["www", "api", "admin", "app", "mail", "ftp", "blog", "shop", "store"];
  if (reserved.includes(subdomain.toLowerCase())) {
    return false;
  }

  // Verificar se já existe no banco
  const [existing] = await db
    .select({ id: tenants.id, subdomain: tenants.subdomain })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain))
    .limit(1);

  return !existing;
}

/**
 * Valida se um domínio customizado está disponível
 */
export async function isCustomDomainAvailable(domain: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [existing] = await db
    .select({ id: tenants.id, customDomain: tenants.customDomain })
    .from(tenants)
    .where(eq(tenants.customDomain, domain))
    .limit(1);

  return !existing;
}
