import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, between, sql } from "drizzle-orm";
import { getDb, getTenantId } from "../db";
import { clientEvents, emailTemplates, emailCampaigns, emailLogs, users } from "../../drizzle/schema";
import { Resend } from "resend";

// Usar Resend via env var global (same default do emailService.ts)
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "FlowClik <noreply@flowclik.com>";
import { defaultEmailTemplates } from "./defaultEmailTemplates";


export const emailMarketingRouter = router({
  // ============ CLIENT EVENTS ============
  
  listEvents: protectedProcedure
    .input(z.object({
      month: z.number().min(1).max(12).optional(),
      year: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      let query = db.select({
        event: clientEvents,
        clientName: users.name,
        clientEmail: users.email,
      })
      .from(clientEvents)
      .leftJoin(users, eq(clientEvents.clientId, users.id))
      .where(eq(clientEvents.tenantId, tenantId))
      .orderBy(clientEvents.eventDate);
      
      const results = await query;
      return results.map(r => ({
        ...r.event,
        clientName: r.clientName,
        clientEmail: r.clientEmail,
      }));
    }),

  createEvent: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      eventType: z.enum(['birthday','wedding','session','anniversary','other']),
      eventName: z.string().min(1),
      eventDate: z.string(),
      notes: z.string().optional(),
      autoSendEmail: z.boolean().optional(),
      templateId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.insert(clientEvents).values({
        clientId: input.clientId,
        tenantId,
        eventType: input.eventType,
        eventName: input.eventName,
        eventDate: input.eventDate,
        notes: input.notes || null,
        autoSendEmail: input.autoSendEmail ? 1 : 0,
        templateId: input.templateId || null,
      });
      return { success: true };
    }),

  updateEvent: protectedProcedure
    .input(z.object({
      id: z.number(),
      eventType: z.enum(['birthday','wedding','session','anniversary','other']).optional(),
      eventName: z.string().min(1).optional(),
      eventDate: z.string().optional(),
      notes: z.string().optional(),
      autoSendEmail: z.boolean().optional(),
      templateId: z.number().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.eventType !== undefined) updateData.eventType = data.eventType;
      if (data.eventName !== undefined) updateData.eventName = data.eventName;
      if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.autoSendEmail !== undefined) updateData.autoSendEmail = data.autoSendEmail ? 1 : 0;
      if (data.templateId !== undefined) updateData.templateId = data.templateId;
      
      await db.update(clientEvents)
        .set(updateData)
        .where(and(eq(clientEvents.id, id), eq(clientEvents.tenantId, tenantId)));
      return { success: true };
    }),

  deleteEvent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.delete(clientEvents)
        .where(and(eq(clientEvents.id, input.id), eq(clientEvents.tenantId, tenantId)));
      return { success: true };
    }),

  // ============ EMAIL TEMPLATES ============
  
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    return await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.tenantId, tenantId))
      .orderBy(desc(emailTemplates.createdAt));
  }),

  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      htmlContent: z.string().min(1),
      category: z.enum(['birthday','promotion','reminder','thank_you','welcome','custom']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(emailTemplates).values({
        tenantId,
        name: input.name,
        subject: input.subject,
        htmlContent: input.htmlContent,
        category: input.category || 'custom',
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      subject: z.string().min(1).optional(),
      htmlContent: z.string().min(1).optional(),
      category: z.enum(['birthday','promotion','reminder','thank_you','welcome','custom']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { id, ...data } = input;
      await db.update(emailTemplates)
        .set(data)
        .where(and(eq(emailTemplates.id, id), eq(emailTemplates.tenantId, tenantId)));
      return { success: true };
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.delete(emailTemplates)
        .where(and(eq(emailTemplates.id, input.id), eq(emailTemplates.tenantId, tenantId)));
      return { success: true };
    }),

  // ============ CAMPAIGNS ============
  
  listCampaigns: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    return await db.select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.tenantId, tenantId))
      .orderBy(desc(emailCampaigns.createdAt));
  }),

  createCampaign: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      templateId: z.number().optional(),
      subject: z.string().min(1),
      htmlContent: z.string().min(1),
      recipientType: z.enum(['all','selected','event_based']).optional(),
      recipientIds: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const result = await db.insert(emailCampaigns).values({
        tenantId,
        name: input.name,
        templateId: input.templateId || null,
        subject: input.subject,
        htmlContent: input.htmlContent,
        recipientType: input.recipientType || 'all',
        recipientIds: input.recipientIds || null,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  deleteCampaign: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.delete(emailCampaigns)
        .where(and(eq(emailCampaigns.id, input.id), eq(emailCampaigns.tenantId, tenantId)));
      return { success: true };
    }),

  // ============ SEND EMAILS ============
  
  // Enviar email individual para um cliente
  sendToClient: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      subject: z.string().min(1),
      htmlContent: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Verify Resend API Key
      if (!RESEND_API_KEY) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "RESEND_API_KEY not configured on server" });
      }
      
      // Buscar cliente
      const clientList = await db.select()
        .from(users)
        .where(and(eq(users.id, input.clientId), eq(users.tenantId, tenantId)))
        .limit(1);
      
      const client = clientList[0];
      if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      
      const resend = new Resend(RESEND_API_KEY);
      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: client.email,
          subject: input.subject,
          html: input.htmlContent,
        });
        
        if (error) throw new Error(error.message);
        
        // Registrar no log
        await db.insert(emailLogs).values({
          tenantId,
          clientId: client.id,
          toEmail: client.email,
          toName: client.name,
          subject: input.subject,
          status: 'sent',
          resendMessageId: data?.id || null,
        });
        
        return { success: true, messageId: data?.id };
      } catch (err: any) {
        // Registrar falha no log
        await db.insert(emailLogs).values({
          tenantId,
          clientId: client.id,
          toEmail: client.email,
          toName: client.name,
          subject: input.subject,
          status: 'failed',
          errorMessage: err.message,
        });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message || "Erro ao enviar email" });
      }
    }),

  // Enviar campanha para múltiplos clientes
  sendCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      // Verify Resend API Key
      if (!RESEND_API_KEY) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "RESEND_API_KEY not configured on server" });
      }
      
      // Buscar campanha
      const campaigns = await db.select()
        .from(emailCampaigns)
        .where(and(eq(emailCampaigns.id, input.campaignId), eq(emailCampaigns.tenantId, tenantId)))
        .limit(1);
      
      const campaign = campaigns[0];
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Campaign not found" });
      
      // Buscar recipients
      let recipients: any[];
      if (campaign.recipientType === 'selected' && campaign.recipientIds) {
        const ids = JSON.parse(campaign.recipientIds);
        recipients = await db.select()
          .from(users)
          .where(and(eq(users.tenantId, tenantId), eq(users.role, 'user')));
        recipients = recipients.filter((c: any) => ids.includes(c.id));
      } else {
        recipients = await db.select()
          .from(users)
          .where(and(eq(users.tenantId, tenantId), eq(users.role, 'user')));
      }
      
      if (recipients.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "None recipient encontrado" });
      }
      
      // Update status da campanha
      await db.update(emailCampaigns)
        .set({ status: 'sending' })
        .where(eq(emailCampaigns.id, campaign.id));
      
      const resend = new Resend(RESEND_API_KEY);
      let sentCount = 0;
      let failedCount = 0;
      
      for (const recipient of recipients) {
        try {
          // Substituir variables no template
          let html = campaign.htmlContent
            .replace(/\{\{nome\}\}/g, recipient.name)
            .replace(/\{\{email\}\}/g, recipient.email)
            .replace(/\{\{name\}\}/g, recipient.name);
          
          let subject = campaign.subject
            .replace(/\{\{nome\}\}/g, recipient.name)
            .replace(/\{\{name\}\}/g, recipient.name);
          
          const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: recipient.email,
            subject,
            html,
          });
          
          if (error) throw new Error(error.message);
          
          await db.insert(emailLogs).values({
            tenantId,
            campaignId: campaign.id,
            clientId: recipient.id,
            toEmail: recipient.email,
            toName: recipient.name,
            subject,
            status: 'sent',
            resendMessageId: data?.id || null,
          });
          sentCount++;
        } catch (err: any) {
          await db.insert(emailLogs).values({
            tenantId,
            campaignId: campaign.id,
            clientId: recipient.id,
            toEmail: recipient.email,
            toName: recipient.name,
            subject: campaign.subject,
            status: 'failed',
            errorMessage: err.message,
          });
          failedCount++;
        }
        
        // Dshey de 100ms between envios para not estourar rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Atualizar campanha
      await db.update(emailCampaigns)
        .set({
          status: failedCount === recipients.length ? 'failed' : 'sent',
          sentCount,
          failedCount,
          sentAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        })
        .where(eq(emailCampaigns.id, campaign.id));
      
      return { success: true, sentCount, failedCount, total: recipients.length };
    }),

  // ============ EMAIL LOGS ============
  
  listLogs: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      return await db.select()
        .from(emailLogs)
        .where(eq(emailLogs.tenantId, tenantId))
        .orderBy(desc(emailLogs.sentAt))
        .limit(input?.limit || 50);
    }),

  // ============ UPCOMING EVENTS (para dashboard) ============
  
  upcomingEvents: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const results = await db.select({
      event: clientEvents,
      clientName: users.name,
      clientEmail: users.email,
    })
    .from(clientEvents)
    .leftJoin(users, eq(clientEvents.clientId, users.id))
    .where(and(
      eq(clientEvents.tenantId, tenantId),
      between(clientEvents.eventDate, 
        now.toISOString().slice(0, 19).replace('T', ' '),
        thirtyDaysFromNow.toISOString().slice(0, 19).replace('T', ' ')
      )
    ))
    .orderBy(clientEvents.eventDate)
    .limit(20);
    
    return results.map(r => ({
      ...r.event,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
    }));
  }),

  // Initializar templates default
  initDefaultTemplates: protectedProcedure.mutation(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const existing = await db.select({ count: sql<number>`COUNT(*)` })
      .from(emailTemplates)
      .where(eq(emailTemplates.tenantId, tenantId));
    
    if (Number(existing[0]?.count || 0) > 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Templates already were initializados" });
    }
    
    for (const tpl of defaultEmailTemplates) {
      await db.insert(emailTemplates).values({
        tenantId,
        name: tpl.name,
        subject: tpl.subject,
        htmlContent: tpl.htmlContent,
        category: tpl.category as any,
        isDefault: 1,
      });
    }
    return { success: true, count: defaultEmailTemplates.length };
  }),

  // Stats para o dashboard
  stats: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = getTenantId(ctx);
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    
    const [eventsResult] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(clientEvents)
      .where(eq(clientEvents.tenantId, tenantId));
    
    const [templatesResult] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(emailTemplates)
      .where(eq(emailTemplates.tenantId, tenantId));
    
    const [campaignsResult] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(emailCampaigns)
      .where(eq(emailCampaigns.tenantId, tenantId));
    
    const [sentResult] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(emailLogs)
      .where(and(eq(emailLogs.tenantId, tenantId), eq(emailLogs.status, 'sent')));
    
    return {
      totalEvents: Number(eventsResult?.count || 0),
      totalTemplates: Number(templatesResult?.count || 0),
      totalCampaigns: Number(campaignsResult?.count || 0),
      totalEmailsSent: Number(sentResult?.count || 0),
    };
  }),
});
