import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { siteConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

// Helper para pegar tenantId do contexto
function getTenantId(ctx: any): number {
  if (!ctx.user?.tenantId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Tenant ID not found",
    });
  }
  return ctx.user.tenantId;
}

export const emailRouter = router({
  // Salvar configuração de email (API Key + email de envio)
  saveConfig: protectedProcedure
    .input(
      z.object({
        emailSender: z.string().email("Invalid email"),
        resendApiKey: z.string().min(10, "API Key inválida"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = getTenantId(ctx);

      // Atualizar no banco
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db
        .update(siteConfig)
        .set({
          emailSender: input.emailSender,
          resendApiKey: input.resendApiKey,
        })
        .where(eq(siteConfig.tenantId, tenantId));

      return { success: true };
    }),

  // Buscar configuração de email
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const configs = await db.select({
      emailSender: siteConfig.emailSender,
      resendApiKey: siteConfig.resendApiKey,
    }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);
    
    const config = configs[0] || null;

    if (!config) {
      return { emailSender: null, resendApiKey: null };
    }

    // Mascarar API Key (mostrar só primeiros 8 caracteres)
    const maskedApiKey = config.resendApiKey
      ? config.resendApiKey.substring(0, 8) + "..." + config.resendApiKey.slice(-4)
      : null;

    return {
      emailSender: config.emailSender,
      resendApiKey: maskedApiKey,
      hasApiKey: !!config.resendApiKey,
    };
  }),

  // Enviar email de teste
  sendTestEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);

    // Buscar configuração
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const configs = await db.select({
      emailSender: siteConfig.emailSender,
      resendApiKey: siteConfig.resendApiKey,
    }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);
    
    const config = configs[0] || null;

    if (!config?.resendApiKey || !config?.emailSender) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Configure o email e API Key primeiro",
      });
    }

    // Inicializar Resend
    const resend = new Resend(config.resendApiKey);

    try {
      // Enviar email de teste
      const { data, error } = await resend.emails.send({
        from: config?.emailSender || 'FlowClik <noreply@flowclik.com>',
        to: config.emailSender, // Envia para o próprio photographer
        subject: "✅ Email Configurado com Sucesso - FlowClik",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🎉 Parabéns!</h1>
            <p style="font-size: 16px; color: #333;">
              Seu email profissional está configurado e funcionando perfeitamente!
            </p>
            <p style="font-size: 14px; color: #666;">
              A partir de agora, seus clientes receberão emails automáticos:
            </p>
            <ul style="font-size: 14px; color: #666;">
              <li>✅ Confirmação de agendamento</li>
              <li>⏰ Lembrete 24h antes do evento</li>
              <li>📸 Gallery pronta para visualizar</li>
              <li>💬 New message no chat</li>
              <li>💰 Payment received</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              Este é um email de teste enviado pelo FlowClik.<br>
              Remetente: ${config.emailSender}
            </p>
          </div>
        `,
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao enviar email: ${error.message}`,
        });
      }

      return { success: true, messageId: data?.id };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Erro ao enviar email de teste",
      });
    }
  }),

  // Enviar email transacional (confirmação, lembrete, etc)
  sendTransactionalEmail: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string(),
        html: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const tenantId = getTenantId(ctx);

      // Buscar configuração
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const configs = await db.select({
        emailSender: siteConfig.emailSender,
        resendApiKey: siteConfig.resendApiKey,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);
      
      const config = configs[0] || null;

      if (!config?.resendApiKey || !config?.emailSender) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email não configurado",
        });
      }

      // Inicializar Resend
      const resend = new Resend(config.resendApiKey);

      try {
        const { data, error } = await resend.emails.send({
          from: config?.emailSender || 'FlowClik <noreply@flowclik.com>',
          to: input.to,
          subject: input.subject,
          html: input.html,
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Erro ao enviar email: ${error.message}`,
          });
        }

        return { success: true, messageId: data?.id };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Erro ao enviar email",
        });
      }
    }),
});
