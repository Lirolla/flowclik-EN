import { sendEmail } from "../_core/email";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb, getTenantId } from "../db";
import { contractTemplates, contracts, appointments, services, tenants, users, siteConfig } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import jsPDF from "jspdf";

export const contractsRouter = router({
  /**
   * Get all contract templates
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
    const db = await getDb();
    if (!db) return [];
    return db.select().from(contractTemplates)
      .where(eq(contractTemplates.tenantId, getTenantId(ctx)))
      .orderBy(desc(contractTemplates.createdAt));
  }),

  /**
   * Create template
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      content: z.string(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(contractTemplates).values({
        name: input.name,
        description: input.description || null,
        content: input.content,
        isActive: input.isActive !== false ? 1 : 0,
        tenantId: getTenantId(ctx),
      });
      return { success: true };
    }),

  /**
   * Update template
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().optional(),
      content: z.string(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(contractTemplates)
        .set({
          name: input.name,
          description: input.description || null,
          content: input.content,
          isActive: input.isActive !== false ? 1 : 0,
        })
        .where(and(eq(contractTemplates.id, input.id), eq(contractTemplates.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Delete template
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(contractTemplates)
        .where(and(eq(contractTemplates.id, input.id), eq(contractTemplates.tenantId, getTenantId(ctx))));
      return { success: true };
    }),

  /**
   * Seed default templates (insere os 4 modelos readys)
   */
  seedDefaults: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const tenantId = getTenantId(ctx);
      
      // Verify se already tem templates
      const existing = await db.select().from(contractTemplates)
        .where(eq(contractTemplates.tenantId, tenantId));
      
      if (existing.length > 0) {
        return { success: false, message: "Templates already exist. Delete them first if you want to recreate." };
      }

      const defaultTemplates = [
        {
          name: "Photo Session Contract",
          description: "For personal, boudoir, maternity, family, sweet 16, newborn sessions. Includes image rights and privacy clauses.",
          content: `PHOTOGRAPHY SERVICES CONTRACT - SESSION

CLIENT: {cliente}
E-mail: {email}
Telefone: {telefone}
CPF: {cpf}
Address: {endereco}

PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}
Address Profissional: {fotografo_endereco}

The above identified parties enter into this photography services contract, which shall be governed by the following clauses and conditions:

CLAUSE 1ª – DO OBJETO
This contract has as its object the provision of photography session services, as specified:
• Session Type: {servico}
• Session Date: {data}
• Time: {horario}
• Local: {local}
• Estimated Duration: {duracao}

CLAUSE 2ª – DO AMOUNT E FORMA DE PAGAMENTO
2.1. The total value of the services is £ {valor}.
2.2. Payment can be made via bank transfer or payment link.
2.3. 50% deposit upon booking, remainder due by the session date.

CLAUSE 3ª – INCLUDED SERVICES
3.1. The following are included in the price:
• Photography session with estimated duration as agreed;
• Professional treatment and editing of selected photographs;
• Delivery of high-resolution photos via digital means (online gallery).
3.2. The delivery time for edited photos is up to 15 (fifteen) business days after the session.

CLAUSE 4ª – COPYRIGHT
4.1. The photographs produced are works protected by copyright, with the PHOTOGRAPHER being the holder of the economic and moral rights thereof.
4.2. The CLIENT receives a personal and non-commercial use licence for the delivered photographs.
4.3. Alteration, digital manipulation or application of filters to the delivered photographs without prior authorisation from the PHOTOGRAPHER is prohibited.
4.4. Reproduction, distribution or commercial use of the photographs requires express written authorisation from the PHOTOGRAPHER.

CLAUSE 5ª – IMAGE RIGHTS
5.1. The CLIENT authorises / does not authorise (delete as applicable) the use of their images by the PHOTOGRAPHER for professional promotion purposes, including portfolio, social media and website.
5.2. In the case of intimate or boudoir sessions, the PHOTOGRAPHER undertakes NOT to use the images for any promotional purpose without express written authorisation from the CLIENT.
5.3. The PHOTOGRAPHER guarantees absolute confidentiality regarding the images produced, in compliance with data protection legislation.

CLAUSE 6ª – CANCELLATION AND RESCHEDULING
6.1. Cancellation with at least 7 days notice: full refund of deposit.
6.2. Cancellation with less than 7 days notice: deposit will not be refunded.
6.3. Cancellation on the day or no-show: full amount will be due.
6.4. Rescheduling permitted once, at no cost, with 48 hours notice.
6.5. Adverse weather conditions (outdoor sessions): rescheduling at no cost.

CLAUSE 7ª – PHOTOGRAPHER OBLIGATIONS
7.1. Carry out the photo session with care and professionalism.
7.2. Deliver the edited photographs within the stipulated timeframe.
7.3. Maintain confidentiality regarding personal data and images of the CLIENT (data protection).
7.4. Make photos available in a secure online gallery for a minimum of 30 days.

CLAUSE 8ª – CLIENT OBLIGATIONS
8.1. Make payments on the agreed dates.
8.2. Attend at the scheduled location and time.
8.3. Inform of any restrictions or special needs.
8.4. Respect the copyright of the photographer.

CLAUSE 9ª – DATA PROTECTION
9.1. Personal data collected will be used exclusively for the execution of this contract.
9.2. The PHOTOGRAPHER undertakes not to share personal data with third parties.

CLAUSE 10ª – JURISDICTION
For the resolution of any disputes, the parties hect the jurisdiction of the CLIENT's domicile.

{cidade}, {data_contrato}

_______________________________
CLIENT: {cliente}
CPF: {cpf}

_______________________________
PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}`,
        },
        {
          name: "Wedding Coverage Contract",
          description: "For weddings, graduations and ceremonies. Includes event coverage, second photographer and album clauses.",
          content: `PHOTOGRAPHY SERVICES CONTRACT - WEDDING / CEREMONY

CLIENT(S): {cliente}
E-mail: {email}
Telefone: {telefone}
CPF: {cpf}
Address: {endereco}

PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}
Address Profissional: {fotografo_endereco}

CLAUSE 1ª – DO OBJETO
Photographic coverage of the event:
• Event Type: {servico}
• Data: {data}
• Time: {horario}
• Local: {local}
• Coverage Duration: {duracao}

CLAUSE 2ª – DO AMOUNT E PAGAMENTO
2.1. Valor total: £ {valor}.
2.2. 30% deposit upon signing to reserve the date; 40% due 30 days before; 30% due 7 days before.
2.3. Methods: bank transfer or payment link.
2.4. The date reservation will only be confirmed after receipt of the deposit.

CLAUSE 3ª – INCLUDED SERVICES
3.1. Complete photographic coverage (ceremony and reception); professional editing; minimum delivery of 300 high-resolution photos; online gallery; behind the scenes.
3.2. Delivery time: up to 45 business days after the event.

CLAUSE 4ª – EVENT COVERAGE
4.1. The photographer will cover the main moments with professionalism and artistic freedom.
4.2. The CLIENT must inform in advance of specific moments they wish to be captured.

CLAUSE 5ª – COPYRIGHT
5.1. Photographs are protected works of authorship. CLIENT receives a personal and family use licence.
5.2. Commercial use by third parties requires express authorisation.
5.3. Alteration or application of filters without authorisation is prohibited.

CLAUSE 6ª – IMAGE RIGHTS
6.1. CLIENT authorises use for the photographer's portfolio, social media and website.
6.2. Restrictions must be communicated in writing before the event.

CLAUSE 7ª – CANCELLATION
7.1. Up to 90 days before: 80% refund of deposit.
7.2. Between 90 and 30 days: 50% refund of deposit.
7.3. Less than 30 days: deposit not refunded.
7.4. Cancellation by the PHOTOGRAPHER: full refund + 20% penalty.
7.5. Force majeure: rescheduling at no cost.

CLAUSE 8ª – LIABILITY
8.1. Professional equipment with backup (second camera body).
8.2. Technical failure with total loss: full refund of all amounts.

CLAUSE 9ª – MEALS AND LOGISTICS
9.1. CLIENT will provide meals for photographer and assistant(s).
9.2. Travel over 50 km: additional transport cost.

CLAUSE 10ª – DATA PROTECTION
10.1. Personal data treated with confidentiality, in compliance with data protection legislation.

CLAUSE 11ª – JURISDICTION
Jurisdiction of the CLIENT's domicile.

{cidade}, {data_contrato}

_______________________________
CLIENT: {cliente}
CPF: {cpf}

_______________________________
PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}`,
        },
        {
          name: "Corporate / Social Event Contract",
          description: "For parties, birthdays, graduations, corporate events, chebrations and launches.",
          content: `PHOTOGRAPHY SERVICES CONTRACT - EVENT

CLIENT: {cliente}
E-mail: {email}
Telefone: {telefone}
CPF/CNPJ: {cpf}
Address: {endereco}

PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}
Address Profissional: {fotografo_endereco}

CLAUSE 1ª – DO OBJETO
Photographic coverage of the event:
• Event Type: {servico}
• Data: {data}
• Time: {horario}
• Local: {local}
• Duration: {duracao}

CLAUSE 2ª – DO AMOUNT E PAGAMENTO
2.1. Valor total: £ {valor}.
2.2. 50% deposit upon booking; 50% due by the event date.
2.3. Methods: bank transfer or payment link.

CLAUSE 3ª – SERVICES
3.1. Photographic coverage for the agreed period; professional editing; digital delivery via online gallery (high resolution).
3.2. Delivery time: up to 20 business days after the event.

CLAUSE 4ª – COPYRIGHT
4.1. Photographer holds the copyright.
4.2. CLIENT receives an institutional use licence for event promotion.
4.3. Use in advertising campaigns requires additional authorisation.

CLAUSE 5ª – IMAGE RIGHTS
5.1. CLIENT declares having authorisation from participants for photographic recording.
5.2. Photographer may use images in portfolio, unless expressly restricted.

CLAUSE 6ª – CANCELLATION
6.1. More than 15 days: full refund of deposit.
6.2. Less than 15 days: deposit retained as booking fee.
6.3. On the day or no-show: full amount due.
6.4. Rescheduling permitted once, with 72 hours notice.

CLAUSE 7ª – GENERAL CONDITIONS
7.1. Free access to all event areas.
7.2. Meals for events lasting more than 4 hours.

CLAUSE 8ª – DATA PROTECTION
8.1. Personal data processed exclusively for contract execution.
8.2. Images of minors will not be used for promotion without authorisation from guardians.

CLAUSE 9ª – JURISDICTION
Jurisdiction of the CLIENT's domicile.

{cidade}, {data_contrato}

_______________________________
CLIENT: {cliente}
CPF/CNPJ: {cpf}

_______________________________
PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}`,
        },
        {
          name: "Simplified Photography Contract",
          description: "Simple and straightforward template for any type of photography service. Ideal for quick jobs and one-off sessions.",
          content: `SIMPLIFIED PHOTOGRAPHY SERVICES CONTRACT

CLIENT: {cliente}
E-mail: {email} | Telefone: {telefone}
CPF: {cpf}

PHOTOGRAPHER(A): {fotografo}
CPF/CNPJ: {fotografo_documento}

1. SERVICE: {servico}
2. DATA: {data} | TIME: {horario}
3. LOCAL: {local}
4. AMOUNT: £ {valor}
5. PAYMENT: As agreed between the parties.

6. DELIVERY: Edited photos within 15 business days via digital gallery.

7. COPYRIGHT: The photographs are authored by the PHOTOGRAPHER. The CLIENT receives a personal use licence.

8. CANCELLATION: Cancellations with less than 48 hours notice will result in retention of 50% of the amount as a booking fee.

9. IMAGE: The CLIENT authorises ( ) YES ( ) NO the use of photos for the photographer's portfolio.

10. DATA PROTECTION: Personal data processed in compliance with data protection legislation, exclusively for this contract.

11. JURISDICTION: CLIENT's domicile.

{cidade}, {data_contrato}

___________________          ___________________
CLIENT                  PHOTOGRAPHER(A)
{cliente}                    {fotografo}
CPF: {cpf}                   CPF/CNPJ: {fotografo_documento}`,
        },
      ];

      for (const tmpl of defaultTemplates) {
        await db.insert(contractTemplates).values({
          name: tmpl.name,
          description: tmpl.description,
          content: tmpl.content,
          isActive: 1,
          tenantId,
        });
      }

      return { success: true, count: defaultTemplates.length };
    }),

  /**
   * Generate contract from appointment + template
   * Replaces all variables with real appointment data
   */
  generateFromAppointment: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      appointmentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tenantId = getTenantId(ctx);

      // Buscar template
      const [template] = await db.select().from(contractTemplates)
        .where(and(eq(contractTemplates.id, input.templateId), eq(contractTemplates.tenantId, tenantId)))
        .limit(1);
      if (!template) throw new Error("Template not found");

      // Buscar appointment com dados do service
      const [appointment] = await db.select({
        id: appointments.id,
        clientName: appointments.clientName,
        clientEmail: appointments.clientEmail,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        eventLocation: appointments.eventLocation,
        numberOfPeople: appointments.numberOfPeople,
        estimatedDuration: appointments.estimatedDuration,
        finalPrice: appointments.finalPrice,
        customServiceName: appointments.customServiceName,
        notes: appointments.notes,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, tenantId)))
      .limit(1);
      
      if (!appointment) throw new Error("Appointment not found");

      // Buscar dados do tenant (photographer)
      const [tenant] = await db.select().from(tenants)
        .where(eq(tenants.id, tenantId)).limit(1);

      // Buscar dados do admin (photographer)
      const [adminUser] = await db.select().from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, 'admin'))).limit(1);

      // Preparar variables
      const serviceName = appointment.customServiceName || appointment.serviceName || 'Photo Session';
      const price = appointment.finalPrice || appointment.servicePrice || 0;
      const priceFormatted = (price / 100).toFixed(2).replace('.', ',');
      const signalFormatted = (price / 200).toFixed(2).replace('.', ',');
      const dateFormatted = appointment.appointmentDate 
        ? new Date(appointment.appointmentDate).toLocaleDateString('en-GB')
        : '___/___/______';
      const everyy = new Date().toLocaleDateString('en-GB');

      // Substituir variables
      let content = template.content;
      const replacements: Record<string, string> = {
        '{cliente}': appointment.clientName || '________________________',
        '{email}': appointment.clientEmail || '________________________',
        '{telefone}': appointment.clientPhone || '________________________',
        '{cpf}': '________________________',
        '{endereco}': '________________________',
        '{fotografo}': tenant?.name || adminUser?.name || '________________________',
        '{fotografo_documento}': '________________________',
        '{fotografo_endereco}': '________________________',
        '{servico}': serviceName,
        '{data}': dateFormatted,
        '{horario}': appointment.appointmentTime || 'A combinar',
        '{local}': appointment.eventLocation || 'A definir',
        '{duracao}': appointment.estimatedDuration || 'A combinar',
        '{valor}': priceFormatted,
        '{valor_sinal}': signalFormatted,
        '{cidade}': '________________________',
        '{data_contrato}': everyy,
        '{local_recepcao}': '________________________',
      };

      for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
      }

      // Buscar siteConfig para logo
      const [config] = await db.select({
        logoUrl: siteConfig.logoUrl,
        siteName: siteConfig.siteName,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);

      return {
        success: true,
        content,
        templateName: template.name,
        clientName: appointment.clientName,
        appointmentDate: dateFormatted,
        serviceName,
        price: priceFormatted,
        logoUrl: config?.logoUrl || null,
        siteName: config?.siteName || null,
        clientEmail: appointment.clientEmail || null,
        clientPhone: appointment.clientPhone || null,
      };
    }),

  /**
   * Generate PDF from filled contract content
   */
  generatePDF: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      appointmentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const tenantId = getTenantId(ctx);

      // Buscar template
      const [template] = await db.select().from(contractTemplates)
        .where(and(eq(contractTemplates.id, input.templateId), eq(contractTemplates.tenantId, tenantId)))
        .limit(1);
      if (!template) throw new Error("Template not found");

      // Buscar appointment com service
      const [appointment] = await db.select({
        id: appointments.id,
        clientName: appointments.clientName,
        clientEmail: appointments.clientEmail,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        eventLocation: appointments.eventLocation,
        estimatedDuration: appointments.estimatedDuration,
        finalPrice: appointments.finalPrice,
        customServiceName: appointments.customServiceName,
        serviceName: services.name,
        servicePrice: services.price,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, tenantId)))
      .limit(1);
      
      if (!appointment) throw new Error("Appointment not found");

      // Buscar tenant
      const [tenant] = await db.select().from(tenants)
        .where(eq(tenants.id, tenantId)).limit(1);
      const [adminUser] = await db.select().from(users)
        .where(and(eq(users.tenantId, tenantId), eq(users.role, 'admin'))).limit(1);

      // Preparar variables
      const serviceName = appointment.customServiceName || appointment.serviceName || 'Photo Session';
      const price = appointment.finalPrice || appointment.servicePrice || 0;
      const priceFormatted = (price / 100).toFixed(2).replace('.', ',');
      const signalFormatted = (price / 200).toFixed(2).replace('.', ',');
      const dateFormatted = appointment.appointmentDate 
        ? new Date(appointment.appointmentDate).toLocaleDateString('en-GB')
        : '___/___/______';
      const everyy = new Date().toLocaleDateString('en-GB');

      let content = template.content;
      const replacements: Record<string, string> = {
        '{cliente}': appointment.clientName || '________________________',
        '{email}': appointment.clientEmail || '________________________',
        '{telefone}': appointment.clientPhone || '________________________',
        '{cpf}': '________________________',
        '{endereco}': '________________________',
        '{fotografo}': tenant?.name || adminUser?.name || '________________________',
        '{fotografo_documento}': '________________________',
        '{fotografo_endereco}': '________________________',
        '{servico}': serviceName,
        '{data}': dateFormatted,
        '{horario}': appointment.appointmentTime || 'A combinar',
        '{local}': appointment.eventLocation || 'A definir',
        '{duracao}': appointment.estimatedDuration || 'A combinar',
        '{valor}': priceFormatted,
        '{valor_sinal}': signalFormatted,
        '{cidade}': '________________________',
        '{data_contrato}': everyy,
        '{local_recepcao}': '________________________',
      };

      for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
      }

      // Buscar siteConfig para logo
      const [config] = await db.select({
        logoUrl: siteConfig.logoUrl,
        siteName: siteConfig.siteName,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);

      // Gerar PDF
      const doc = new jsPDF();
      let startY = 20;
      
      // Add logo se available
      if (config?.logoUrl) {
        try {
          doc.addImage(config.logoUrl, 'PNG', 20, 10, 50, 25);
          startY = 42;
        } catch (e) {
          // Se falhar ao add imagem, continua sem logo
          console.log('Erro ao add logo ao PDF:', e);
        }
      }
      
      // Title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(template.name.toUpperCase(), 170);
      doc.text(titleLines, 20, startY);
      
      // Content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content, 170);
      
      let y = startY + 15;
      const pageHeight = 280;
      
      for (const line of lines) {
        if (y > pageHeight) {
          doc.addPage();
          y = 20;
        }
        // Bold para clauses
        if (line.startsWith('CLAUSE') || line.startsWith('CONTRAT')) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(line, 20, y);
        y += 5;
      }

      const pdfBase64 = doc.output("datauristring");
      return {
        success: true,
        pdfData: pdfBase64,
        fileName: `contrato-${appointment.clientName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
      };
    }),

  // Salvar contrato no banco
  saveContract: protectedProcedure
    .input(z.object({
      appointmentId: z.number(),
      templateId: z.number(),
      content: z.string(),
      clientName: z.string(),
      clientEmail: z.string().optional(),
      templateName: z.string().optional(),
      serviceName: z.string().optional(),
      price: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify se already exists um contrato para este agendamento
      const existing = await db.select().from(contracts)
        .where(and(
          eq(contracts.appointmentId, input.appointmentId),
          eq(contracts.tenantId, tenantId)
        ))
        .limit(1);
      
      if (existing.length > 0) {
        // Atualizar contrato existente
        await db.update(contracts)
          .set({
            content: input.content,
            templateName: input.templateName || null,
            serviceName: input.serviceName || null,
            price: input.price || null,
          })
          .where(eq(contracts.id, existing[0].id));
        return { success: true, id: existing[0].id, updated: true };
      }
      
      // Criar new contrato
      const result = await db.insert(contracts).values({
        tenantId,
        appointmentId: input.appointmentId,
        templateId: input.templateId,
        clientName: input.clientName,
        clientEmail: input.clientEmail || null,
        content: input.content,
        templateName: input.templateName || null,
        serviceName: input.serviceName || null,
        price: input.price || null,
        status: 'draft',
      });
      
      return { success: true, id: (result as any)[0].insertId, updated: false };
    }),

  // Enviar contrato por email via Resend
  sendContractEmail: protectedProcedure
    .input(z.object({
      appointmentId: z.number(),
      templateId: z.number(),
      content: z.string(),
      clientName: z.string(),
      clientEmail: z.string(),
      templateName: z.string().optional(),
      serviceName: z.string().optional(),
      price: z.string().optional(),
      logoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tenantId = getTenantId(ctx);
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Buscar siteConfig para nome do estúdio
      const [config] = await db.select({
        siteName: siteConfig.siteName,
      }).from(siteConfig).where(eq(siteConfig.tenantId, tenantId)).limit(1);
      
      const studioName = config?.siteName || 'FlowClik';
      
      // Montar HTML do email
      const contentHtml = input.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
      
      const html = `
        <div style="font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          ${input.logoUrl ? `<div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #ddd;"><img src="${input.logoUrl}" alt="${studioName}" style="max-height: 60px; max-width: 200px;" /></div>` : ''}
          <h2 style="color: #333; font-size: 18px; margin-bottom: 5px;">${input.templateName || 'Photography Service Contract'}</h2>
          <p style="color: #666; font-size: 13px; margin-bottom: 20px;">Service: ${input.serviceName || ''} | Valor: £ ${input.price || ''}</p>
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; font-size: 13px; line-height: 1.8; color: #333; white-space: pre-wrap;">${contentHtml}</div>
          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
            <p>Shipped por ${studioName} via FlowClik</p>
          </div>
        </div>
      `;
      
      const sent = await sendEmail({
        to: input.clientEmail,
        subject: `${input.templateName || 'Contrato'} - ${studioName}`,
        html,
        text: input.content,
      });
      
      if (sent) {
        // Salvar/atualizar contrato as sent
        const existing = await db.select().from(contracts)
          .where(and(
            eq(contracts.appointmentId, input.appointmentId),
            eq(contracts.tenantId, tenantId)
          ))
          .limit(1);
        
        if (existing.length > 0) {
          await db.update(contracts)
            .set({ status: 'sent', sentAt: new Date().toISOString().slice(0, 19).replace('T', ' '), content: input.content })
            .where(eq(contracts.id, existing[0].id));
        } else {
          await db.insert(contracts).values({
            tenantId,
            appointmentId: input.appointmentId,
            templateId: input.templateId,
            clientName: input.clientName,
            clientEmail: input.clientEmail,
            content: input.content,
            templateName: input.templateName || null,
            serviceName: input.serviceName || null,
            price: input.price || null,
            status: 'sent',
            sentAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          });
        }
      }
      
      return { success: sent };
    }),

  // Listar contratos salvos
  getSavedContracts: protectedProcedure
    .query(async ({ ctx }) => {
      const tenantId = getTenantId(ctx);
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(contracts)
        .where(eq(contracts.tenantId, tenantId))
        .orderBy(desc(contracts.createdAt));
      return result;
    }),

});
