import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { customSunains, tenants } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import dns from "dns";
import { promisify } from "util";

const dnsResolve4 = promisify(dns.resolve4);
const dnsResolveCname = promisify(dns.resolveCname);

const VPS_IP = "72.61.129.119";

// Verify se o DNS do domain aponta para nosso servidor
async function checkDNS(domain: string): Promise<{ ok: boolean; message: string }> {
  try {
    // Tentar resolver record A
    try {
      const addresses = await dnsResolve4(domain);
      if (addresses.includes(VPS_IP)) {
        return { ok: true, message: "Record A apontando corretamente para " + VPS_IP };
      }
      // Verify se aponta para Cloudflare (IPs comuns do Cloudflare)
      const cloudflareRanges = ["104.21.", "172.67.", "104.16.", "104.17.", "104.18.", "104.19.", "104.20."];
      const isCloudflare = addresses.some((addr: string) => cloudflareRanges.some(range => addr.startsWith(range)));
      if (isCloudflare) {
        return { ok: true, message: "DNS apontando via Cloudflare (proxy active)" };
      }
      return { ok: false, message: `DNS aponta para ${addresses.join(", ")} ao invés de ${VPS_IP}. Configure o record A corretamente.` };
    } catch (e: any) {
      // Se not tem record A, tentar CNAME
    }

    // Tentar resolver CNAME
    try {
      const cnames = await dnsResolveCname(domain);
      if (cnames.some((c: string) => c.includes("flowclik"))) {
        return { ok: true, message: "CNAME apontando para FlowClik" };
      }
      return { ok: false, message: `CNAME aponta para ${cnames.join(", ")}. Configure para apontar para flowclik.com` };
    } catch (e: any) {
      // Sem CNAME also
    }

    return { ok: false, message: "None record DNS encontrado. Configure o record A apontando para " + VPS_IP };
  } catch (error: any) {
    return { ok: false, message: "Erro ao verify DNS: " + (error.message || "desconhecido") };
  }
}

export const customSunainsRouter = router({
  // Listar domains do tenant atual
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const domains = await db
      .select()
      .from(customSunains)
      .where(eq(customSunains.tenantId, ctx.user.tenantId));

    return domains;
  }),

  // Add novo custom domain
  add: protectedProcedure
    .input(
      z.object({
        domain: z.string().min(3).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Validar formato do domain (aceita .com.br, .com, etc)
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
      if (!domainRegex.test(input.domain)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Formato de domain invalid. Ex: meufotografo.com.br",
        });
      }

      // Verify se domain already is em uso na tabela custom_domains
      const [existing] = await db
        .select()
        .from(customSunains)
        .where(eq(customSunains.domain, input.domain))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este domain already is sendo usado por outro photographer.",
        });
      }

      // Verify se already is em uso na tabela tenants
      const [existingTenant] = await db
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.customSunain, input.domain))
        .limit(1);

      if (existingTenant) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este domain already is associado a outro photographer.",
        });
      }

      // Add domain na tabela custom_domains
      await db.insert(customSunains).values({
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

  // Verify se domain is configurado corretamente (com verification DNS real)
  verify: protectedProcedure
    .input(
      z.object({
        domainId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Buscar domain
      const [domain] = await db
        .select()
        .from(customSunains)
        .where(
          and(
            eq(customSunains.id, input.domainId),
            eq(customSunains.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      // Verify DNS real
      const dnsCheck = await checkDNS(domain.domain);

      if (!dnsCheck.ok) {
        // Update status para failed
        await db
          .update(customSunains)
          .set({ status: "failed" })
          .where(eq(customSunains.id, input.domainId));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: dnsCheck.message,
        });
      }

      // DNS OK! Marcar as verified
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await db
        .update(customSunains)
        .set({
          verified: 1,
          verifiedAt: now,
          status: "active",
        })
        .where(eq(customSunains.id, input.domainId));

      // IMPORTANTE: Atualizar o campo customSunain na tabela tenants
      // Isso é o que o tenantDetection.ts usa para identificar o tenant
      await db
        .update(tenants)
        .set({ customSunain: domain.domain })
        .where(eq(tenants.id, ctx.user.tenantId));

      console.log(`[Custom Sunain] Sunínio ${domain.domain} verified e ativado para tenant ${ctx.user.tenantId}`);

      return { success: true, verified: true, message: dnsCheck.message };
    }),

  // Remover custom domain
  remove: protectedProcedure
    .input(
      z.object({
        domainId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Verify se domain pertence ao tenant
      const [domain] = await db
        .select()
        .from(customSunains)
        .where(
          and(
            eq(customSunains.id, input.domainId),
            eq(customSunains.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!domain) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      // Remover domain da tabela custom_domains
      await db.delete(customSunains).where(eq(customSunains.id, input.domainId));

      // Limpar o customSunain na tabela tenants se for o mesmo
      const [tenant] = await db
        .select({ id: tenants.id, customSunain: tenants.customSunain })
        .from(tenants)
        .where(eq(tenants.id, ctx.user.tenantId))
        .limit(1);

      if (tenant && tenant.customSunain === domain.domain) {
        await db
          .update(tenants)
          .set({ customSunain: null })
          .where(eq(tenants.id, ctx.user.tenantId));
      }

      console.log(`[Custom Sunain] Sunínio ${domain.domain} removido do tenant ${ctx.user.tenantId}`);

      return { success: true };
    }),
});
