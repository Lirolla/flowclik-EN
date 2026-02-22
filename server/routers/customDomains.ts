import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { customDomains, tenants } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import dns from "dns";
import { promisify } from "util";

const dnsResolve4 = promisify(dns.resolve4);
const dnsResolveCname = promisify(dns.resolveCname);

const VPS_IP = "72.61.129.119";

// Verificar se o DNS do domínio aponta para nosso servidor
async function checkDNS(domain: string): Promise<{ ok: boolean; message: string }> {
  try {
    // Tentar resolver registro A
    try {
      const addresses = await dnsResolve4(domain);
      if (addresses.includes(VPS_IP)) {
        return { ok: true, message: "Registro A apontando corretamente para " + VPS_IP };
      }
      // Verificar se aponta para Cloudflare (IPs comuns do Cloudflare)
      const cloudflareRanges = ["104.21.", "172.67.", "104.16.", "104.17.", "104.18.", "104.19.", "104.20."];
      const isCloudflare = addresses.some((addr: string) => cloudflareRanges.some(range => addr.startsWith(range)));
      if (isCloudflare) {
        return { ok: true, message: "DNS apontando via Cloudflare (proxy ativo)" };
      }
      return { ok: false, message: `DNS aponta para ${addresses.join(", ")} ao invés de ${VPS_IP}. Configure o registro A corretamente.` };
    } catch (e: any) {
      // Se não tem registro A, tentar CNAME
    }

    // Tentar resolver CNAME
    try {
      const cnames = await dnsResolveCname(domain);
      if (cnames.some((c: string) => c.includes("flowclik"))) {
        return { ok: true, message: "CNAME apontando para FlowClik" };
      }
      return { ok: false, message: `CNAME aponta para ${cnames.join(", ")}. Configure para apontar para flowclik.com` };
    } catch (e: any) {
      // Sem CNAME também
    }

    return { ok: false, message: "Nenhum registro DNS encontrado. Configure o registro A apontando para " + VPS_IP };
  } catch (error: any) {
    return { ok: false, message: "Erro ao verificar DNS: " + (error.message || "desconhecido") };
  }
}

export const customDomainsRouter = router({
  // Listar domínios do tenant atual
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const domains = await db
      .select()
      .from(customDomains)
      .where(eq(customDomains.tenantId, ctx.user.tenantId));

    return domains;
  }),

  // Adicionar novo domínio personalizado
  add: protectedProcedure
    .input(
      z.object({
        domain: z.string().min(3).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Validar formato do domínio (aceita .com.br, .com, etc)
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(input.domain)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Formato de domínio inválido. Ex: meufotografo.com.br",
        });
      }

      // Verificar se domínio já está em uso na tabela custom_domains
      const [existing] = await db
        .select()
        .from(customDomains)
        .where(eq(customDomains.domain, input.domain))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este domínio já está sendo usado por outro fotógrafo.",
        });
      }

      // Verificar se já está em uso na tabela tenants
      const [existingTenant] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.customDomain, input.domain))
        .limit(1);

      if (existingTenant) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este domínio já está associado a outro fotógrafo.",
        });
      }

      // Adicionar domínio na tabela custom_domains
      await db.insert(customDomains).values({
        tenantId: ctx.user.tenantId,
        domain: input.domain,
        verified: 0,
        status: "pending",
      });

      return {
        success: true,
        domain: input.domain,
        instructions: {
          type: "A",
          host: "@",
          value: VPS_IP,
          ttl: 3600,
        },
      };
    }),

  // Verificar se domínio está configurado corretamente (com verificação DNS real)
  verify: protectedProcedure
    .input(
      z.object({
        domainId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Buscar domínio
      const [domain] = await db
        .select()
        .from(customDomains)
        .where(
          and(
            eq(customDomains.id, input.domainId),
            eq(customDomains.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Domínio não encontrado" });
      }

      // Verificar DNS real
      const dnsCheck = await checkDNS(domain.domain);

      if (!dnsCheck.ok) {
        // Atualizar status para failed
        await db
          .update(customDomains)
          .set({ status: "failed" })
          .where(eq(customDomains.id, input.domainId));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: dnsCheck.message,
        });
      }

      // DNS OK! Marcar como verificado
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await db
        .update(customDomains)
        .set({
          verified: 1,
          verifiedAt: now,
          status: "active",
        })
        .where(eq(customDomains.id, input.domainId));

      // IMPORTANTE: Atualizar o campo customDomain na tabela tenants
      // Isso é o que o tenantDetection.ts usa para identificar o tenant
      await db
        .update(tenants)
        .set({ customDomain: domain.domain })
        .where(eq(tenants.id, ctx.user.tenantId));

      console.log(`[Custom Domain] Domínio ${domain.domain} verificado e ativado para tenant ${ctx.user.tenantId}`);

      return { success: true, verified: true, message: dnsCheck.message };
    }),

  // Remover domínio personalizado
  remove: protectedProcedure
    .input(
      z.object({
        domainId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verificar se domínio pertence ao tenant
      const [domain] = await db
        .select()
        .from(customDomains)
        .where(
          and(
            eq(customDomains.id, input.domainId),
            eq(customDomains.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Domínio não encontrado" });
      }

      // Remover domínio da tabela custom_domains
      await db.delete(customDomains).where(eq(customDomains.id, input.domainId));

      // Limpar o customDomain na tabela tenants se for o mesmo
      const [tenant] = await db
        .select({ id: tenants.id, customDomain: tenants.customDomain })
        .from(tenants)
        .where(eq(tenants.id, ctx.user.tenantId))
        .limit(1);

      if (tenant && tenant.customDomain === domain.domain) {
        await db
          .update(tenants)
          .set({ customDomain: null })
          .where(eq(tenants.id, ctx.user.tenantId));
      }

      console.log(`[Custom Domain] Domínio ${domain.domain} removido do tenant ${ctx.user.tenantId}`);

      return { success: true };
    }),
});
