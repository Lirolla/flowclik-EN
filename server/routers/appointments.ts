import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, getTenantId } from "../db";
import { appointments, users, services, appointmentExtras, collections, tenants } from "../../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendAppointmentConfirmationEmail, sendAppointmentCancelledEmail, sendNewAppointmentNotification, sendEmail } from "../_core/emailTemplates";

export const appointmentsRouter = router({
  /**
   * Get all appointments (admin)
   */
  /**
   * Find appointment by email + password (public - client login)
   */
  findByEmail: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      password: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      // First, find appointment by email
      const [appointment] = await db
        .select({
          id: appointments.id,
          clientName: appointments.clientName,
          clientEmail: appointments.clientEmail,
          appointmentId: appointments.id,
        })
        .from(appointments)
        .where(and(eq(appointments.clientEmail, input.email), eq(appointments.tenantId, getTenantId(ctx))))
        .orderBy(appointments.createdAt)
        .limit(1);
      
      if (!appointment) return null;
      
      // Then, find collection linked to this appointment and validate password
      const { collections } = await import('../../drizzle/schema');
      const [collection] = await db
        .select({
          id: collections.id,
          password: collections.password,
        })
        .from(collections)
        .where(and(eq(collections.appointmentId, appointment.id), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);
      
      // If no collection or password doesn't match, return null
      if (!collection || collection.password !== input.password) {
        return null;
      }
      
      return appointment;
    }),

  /**
   * Get appointment by ID (public - client can see their own)
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [result] = await db
        .select({
          id: appointments.id,
          serviceId: appointments.serviceId,
          userId: appointments.userId,
          clientName: appointments.clientName,
          clientEmail: appointments.clientEmail,
          clientPhone: appointments.clientPhone,
          date: appointments.appointmentDate,
          time: appointments.appointmentTime,
          location: appointments.eventLocation,
          numberOfPeople: appointments.numberOfPeople,
          estimatedDuration: appointments.estimatedDuration,
          status: appointments.status,
          paymentStatus: appointments.paymentStatus,
          paymentMethod: appointments.paymentMethod,
          finalPrice: appointments.finalPrice,
          paidAmount: appointments.paidAmount,
          paidAt: appointments.paidAt,
          notes: appointments.notes,
          contractUrl: appointments.contractUrl,
          contractSigned: appointments.contractSigned,
          selectionApproved: appointments.selectionApproved,
          createdAt: appointments.createdAt,
          slug: appointments.slug,
          customServiceName: appointments.customServiceName,
          serviceName: services.name,
          servicePrice: services.price,
          serviceType: services.serviceType,
        })
        .from(appointments)
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .where(and(eq(appointments.id, input.id), eq(appointments.tenantId, getTenantId(ctx))));
      
      return result || null;
    }),

  /**
   * Get all appointments (admin)
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    
    const db = await getDb();
    if (!db) return [];
    
    // Join with services to get service name, price, and type
    const results = await db
      .select({
        id: appointments.id,
        serviceId: appointments.serviceId,
        userId: appointments.userId,
        clientName: appointments.clientName,
        clientEmail: appointments.clientEmail,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        eventLocation: appointments.eventLocation,
        numberOfPeople: appointments.numberOfPeople,
        estimatedDuration: appointments.estimatedDuration,
        status: appointments.status,
        paymentStatus: appointments.paymentStatus,
        paymentMethod: appointments.paymentMethod,
        finalPrice: appointments.finalPrice,
        paidAmount: appointments.paidAmount,
        stripeSessionId: appointments.stripeSessionId,
        stripePaymentIntentId: appointments.stripePaymentIntentId,
        paidAt: appointments.paidAt,
        notes: appointments.notes,
        adminNotes: appointments.adminNotes,
        contractUrl: appointments.contractUrl,
        contractSigned: appointments.contractSigned,
        selectionApproved: appointments.selectionApproved,
        selectionApprovedAt: appointments.selectionApprovedAt,
        createdAt: appointments.createdAt,
        updatedAt: appointments.updatedAt,
        customServiceName: appointments.customServiceName,
        // Service data
        serviceName: services.name,
        servicePrice: services.price,
        serviceType: services.serviceType,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id));
    
    return results;
  }),

  /**
   * Get pending appointments (admin)
   */
  getPending: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    
    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.status, 'pending'), eq(appointments.tenantId, getTenantId(ctx))));
  }),

  /**
   * Get upcoming appointments (admin)
   */
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    
    const db = await getDb();
    if (!db) return [];
    
    const now = new Date().toISOString();
    
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.status, 'confirmed'),
        // @ts-ignore
          gte(appointments.appointmentDate, now as string)
        )
      );
  }),

  /**
   * Create appointment (public)
   */
  create: publicProcedure
    .input(
      z.object({
        serviceId: z.number().optional(),
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientPhone: z.string(),
        appointmentDate: z.date(),
        appointmentTime: z.string().optional(),
        eventLocation: z.string().optional(),
        numberOfPeople: z.number().optional(),
        estimatedDuration: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 1. Verify se cliente already exists
      let userId: number | undefined;
      const [existingClient] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, input.clientEmail), eq(users.tenantId, getTenantId(ctx))))
        .limit(1);

      if (existingClient) {
        // Cliente already exists, usar o ID dele
        userId = existingClient.id;
      } else {
        // Cliente not existe, criar novo
        try {
          console.log('[BOOKING] Criando novo cliente:', {
            name: input.clientName,
            email: input.clientEmail,
            phone: input.clientPhone
          });
          
          const result = await db.insert(users).values({
            tenantId: getTenantId(ctx),
            openId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: input.clientName,
            email: input.clientEmail,
            phone: input.clientPhone || null,
            loginMethod: "booking",
            role: "user",
          });
          
          console.log('[BOOKING] Insert result:', result);
          
          // Buscar o cliente recém-criado para pegar o ID
          const [createdClient] = await db
            .select()
            .from(users)
            .where(and(eq(users.email, input.clientEmail), eq(users.tenantId, getTenantId(ctx))))
            .limit(1);
          
          console.log('[BOOKING] Cliente criado:', createdClient);
          
          if (!createdClient) {
            console.error('[BOOKING] ERROR: Client not found after INSERT!');
            throw new Error('Falha ao criar cliente');
          }
          
          userId = createdClient.id;
        } catch (error) {
          console.error('[BOOKING] Erro ao criar cliente:', error);
          // Continuar sem userId - agendamento will be criado only com dados do cliente
          userId = undefined;
        }
      }

      // 2. Buscar preço do service se serviceId foi fornecido
      let servicePrice = 0;
      if (input.serviceId) {
        const [service] = await db
          .select()
          .from(services)
          .where(and(eq(services.id, input.serviceId), eq(services.tenantId, getTenantId(ctx))))
          .limit(1);
        if (service) {
          servicePrice = service.price;
        }
      }

      // 3. Criar agendamento com userId, finalPrice e slug
      // Gerar slug: nome-cliente-timestamp
      const slug = `${input.clientName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
      
        const { sql } = await import('drizzle-orm');
      const appointmentDateStr = input.appointmentDate instanceof Date ? input.appointmentDate.toISOString().slice(0, 19).replace('T', ' ') : input.appointmentDate ? new Date(input.appointmentDate).toISOString().slice(0, 19).replace('T', ' ') : null;
      
      const result = await db.execute(sql`INSERT INTO appointments 
        (tenantId, serviceId, clientName, clientEmail, clientPhone, appointmentDate, appointmentTime, eventLocation, numberOfPeople, estimatedDuration, notes, userId, status, finalPrice, slug) 
        VALUES (${getTenantId(ctx)}, ${input.serviceId || null}, ${input.clientName}, ${input.clientEmail}, ${input.clientPhone || null}, ${appointmentDateStr}, ${input.appointmentTime || null}, ${input.eventLocation || null}, ${input.numberOfPeople || null}, ${input.estimatedDuration || null}, ${input.notes || null}, ${userId || null}, 'pending', ${servicePrice}, ${slug})`);
      
      const insertId = (result as any)[0].insertId;
      
      // 4. Buscar o item inserido
      const inserted = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, insertId))
        .limit(1);

      // 5. Notificar o proprietário about novo agendamento
      await notifyOwner({
        title: "Novo Agendamento Received",
        content: `Cliente: ${input.clientName}\nEmail: ${input.clientEmail}\nData: ${new Date(input.appointmentDate as unknown as string).toLocaleDateString('en-GB')}${input.appointmentTime ? ` at ${input.appointmentTime}` : ''}`,
      }).catch(err => console.error('Erro ao notificar:', err));

      // Enviar email de notification para o photographer
      try {
        // Buscar dados do tenant/photographer
        const [tenant] = await db.select().from(tenants).where(eq(tenants.id, getTenantId(ctx))).limit(1);
        if (tenant) {
          // Buscar email do admin do tenant
          const [adminUser] = await db.select().from(users).where(and(eq(users.tenantId, getTenantId(ctx)), eq(users.role, 'admin'))).limit(1);
          if (adminUser?.email) {
            sendNewAppointmentNotification({
              photographerEmail: adminUser.email,
              photographerName: tenant.name || adminUser.name || 'Photographer',
              clientName: input.clientName,
              clientEmail: input.clientEmail,
              clientPhone: input.clientPhone,
              serviceName: service?.name || 'Photo Session',
              date: new Date(input.appointmentDate as unknown as string).toLocaleDateString('en-GB'),
              time: input.appointmentTime || 'A combinar',
              price: service?.price ? '£ ' + (Number(service.price) / 100).toFixed(2).replace('.', ',') : 'A combinar',
            }).catch(err => console.error('Erro ao enviar email de novo agendamento:', err));
          }
        }
      } catch (emailErr) {
        console.error('Erro ao enviar email:', emailErr);
      }

      return inserted[0];
    }),

  /**
   * Update appointment status (admin)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          'pending',
          'confirmed',
          'session_done',
          'editing',
          'awaiting_selection',
          'final_editing',
          'delivered',
          'cancelled'
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(appointments)
        .set({ status: input.status })
        .where(and(eq(appointments.id, input.id), eq(appointments.tenantId, getTenantId(ctx))));

      // Buscar item atualizado
      const updated = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, input.id), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      // Notificar o proprietário about mudança de status
      const statusLabels: Record<string, string> = {
        pending: '⏳ Pending',
        confirmed: '✅ Confirmado',
        session_done: '📸 Ensaio Realizado',
        editing: '🎨 Photos in Editing',
        awaiting_selection: '👀 Awaiting Selection do Cliente',
        final_editing: '✏️ Editando Selected Photos',
        delivered: '📦 Delivered',
        cancelled: '❌ Cancelled',
      };

      // Enviar email ao cliente em cada mudança de status
      if (updated[0]) {
        const appt = updated[0] as any;
        const clientName = appt.clientName || 'Cliente';
        const clientEmail = appt.clientEmail;
        const dateStr = appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-GB') : '';
        const timeStr = appt.appointmentTime || 'A combinar';

        // Buscar subdomain do tenant para gerar link do site
        let siteUrl = 'https://flowclik.com';
        try {
          const [tenant] = await db.select({ subdomain: tenants.subdomain }).from(tenants).where(eq(tenants.id, getTenantId(ctx))).limit(1);
          if (tenant?.subdomain) {
            siteUrl = `https://${tenant.subdomain}.flowclik.com`;
          }
        } catch (e) { /* fallback para url default */ }

        try {
          switch (input.status) {
            case 'confirmed':
              sendAppointmentConfirmationEmail({
                clientName,
                clientEmail,
                serviceName: appt.serviceName || 'Photo Session',
                appointmentDate: dateStr,
                appointmentTime: timeStr,
                price: appt.finalPrice ? Number(appt.finalPrice) : 0,
              }).catch(err => console.error('Error email confirmation:', err));
              break;

            case 'session_done':
              sendEmail({
                to: clientEmail,
                subject: '📸 Ensaio Realizado com Sucesso!',
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1f2e;padding:40px;border-radius:16px;color:#e5e7eb;">
                  <h1 style="color:#c026d3;font-size:24px;">📸 Ensaio Realizado!</h1>
                  <p>Hello <strong>${clientName}</strong>,</p>
                  <p>Seu ensaio photography foi realizado com sucesso! Agora suas fotos estão sendo processadas com todo carinho.</p>
                  <div style="background:#141824;border-radius:10px;padding:15px;margin:20px 0;border-left:3px solid #c026d3;">
                    <p style="margin:5px 0;">📅 Data: <strong>${dateStr}</strong></p>
                    <p style="margin:5px 0;">⏰ Time: <strong>${timeStr}</strong></p>
                  </div>
                  <p><strong>Next passo:</strong> As fotos serão editadas e you receberá um aviso por email when estiverem prontas. Fique de olho!</p>
                  <p style="color:#9ca3af;font-size:13px;margin-top:30px;">FlowClik - Plataforma de Photography Profissional</p>
                </div>`,
              }).catch(err => console.error('Erro email ensaio realizado:', err));
              break;

            case 'editing':
              sendEmail({
                to: clientEmail,
                subject: '🎨 Your Photos Are Being Edited!',
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1f2e;padding:40px;border-radius:16px;color:#e5e7eb;">
                  <h1 style="color:#c026d3;font-size:24px;">🎨 Photos in Editing!</h1>
                  <p>Hello <strong>${clientName}</strong>,</p>
                  <p>Great news! Suas fotos already estão sendo editadas com todo carinho e atenção aos details.</p>
                  <div style="background:#141824;border-radius:10px;padding:15px;margin:20px 0;border-left:3px solid #f59e0b;">
                    <p style="margin:5px 0;">🖌️ Estamos trabalhando nas suas fotos</p>
                    <p style="margin:5px 0;">✨ Cada detalhe is sendo cuidado</p>
                  </div>
                  <p>Fique tranquilo(a), avisaremos por email assim que sua galeria estiver pronta para visualização!</p>
                  <p style="color:#9ca3af;font-size:13px;margin-top:30px;">FlowClik - Plataforma de Photography Profissional</p>
                </div>`,
              }).catch(err => console.error('Error email photos in editing:', err));
              break;

            case 'awaiting_selection':
              sendEmail({
                to: clientEmail,
                subject: '👀 Your Gallery Is Ready - Select Your Favourites!',
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1f2e;padding:40px;border-radius:16px;color:#e5e7eb;">
                  <h1 style="color:#c026d3;font-size:24px;">👀 Hour de Escolher Suas Favourites!</h1>
                  <p>Hello <strong>${clientName}</strong>,</p>
                  <p>Sua galeria de fotos is ready! Acesse o painel do seu photographer para visualizar e selecionar suas fotos favoritas.</p>
                  <div style="background:#141824;border-radius:10px;padding:15px;margin:20px 0;border-left:3px solid #10b981;">
                    <p style="margin:5px 0;">🖼️ Suas fotos estão esperando por you</p>
                    <p style="margin:5px 0;">❤️ Select as que mais gostou</p>
                    <p style="margin:5px 0;">⏰ Wednto before selecionar, mais rápido betweengaremos</p>
                  </div>
                  <a href="${siteUrl}" style="display:block;text-align:center;background:#c026d3;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">Acessar Meu Painel</a>
                  <p style="color:#9ca3af;font-size:12px;">Ou acesse diretamente: <a href="${siteUrl}" style="color:#c026d3;">${siteUrl}</a></p>
                  <p style="color:#9ca3af;font-size:13px;margin-top:30px;">FlowClik - Plataforma de Photography Profissional</p>
                </div>`,
              }).catch(err => console.error('Error email awaiting selection:', err));
              break;

            case 'final_editing':
              sendEmail({
                to: clientEmail,
                subject: '✏️ Editando Suas Selected Photos!',
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1f2e;padding:40px;border-radius:16px;color:#e5e7eb;">
                  <h1 style="color:#c026d3;font-size:24px;">✏️ Editando Suas Selecionadas!</h1>
                  <p>Hello <strong>${clientName}</strong>,</p>
                  <p>Recebemos sua selection de fotos e already estamos trabalhando na editing final das suas favoritas!</p>
                  <div style="background:#141824;border-radius:10px;padding:15px;margin:20px 0;border-left:3px solid #8b5cf6;">
                    <p style="margin:5px 0;">🎨 Editing final in progress</p>
                    <p style="margin:5px 0;">✨ Cada foto will be tratada individualmente</p>
                    <p style="margin:5px 0;">📧 You receberá um email when estiverem prontas</p>
                  </div>
                  <p>Estamos quase lá! Em breve suas fotos editadas estarão prontas para download.</p>
                  <p style="color:#9ca3af;font-size:13px;margin-top:30px;">FlowClik - Plataforma de Photography Profissional</p>
                </div>`,
              }).catch(err => console.error('Erro email editando selecionadas:', err));
              break;

            case 'delivered':
              sendEmail({
                to: clientEmail,
                subject: '🎉 Suas Fotos Foram Delivereds!',
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1f2e;padding:40px;border-radius:16px;color:#e5e7eb;">
                  <h1 style="color:#c026d3;font-size:24px;">🎉 Fotos Delivereds!</h1>
                  <p>Hello <strong>${clientName}</strong>,</p>
                  <p>Suas fotos editadas estão prontas e disponíveis para download! It was a pleasure working with you.</p>
                  <div style="background:#141824;border-radius:10px;padding:15px;margin:20px 0;border-left:3px solid #10b981;">
                    <p style="margin:5px 0;">📥 Your photos are ready para baixar</p>
                    <p style="margin:5px 0;">💾 Recomendamos fazer backup das suas fotos</p>
                  </div>
                  <a href="${siteUrl}" style="display:block;text-align:center;background:#10b981;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">Acessar e Baixar Minhas Fotos</a>
                  <p style="color:#9ca3af;font-size:12px;">Ou acesse diretamente: <a href="${siteUrl}" style="color:#c026d3;">${siteUrl}</a></p>
                  <p>Thank you por nos escolher! Se gostou do trabalho, share with friends and family. 💚</p>
                  <p style="color:#9ca3af;font-size:13px;margin-top:30px;">FlowClik - Plataforma de Photography Profissional</p>
                </div>`,
              }).catch(err => console.error('Erro email delivered:', err));
              break;

            case 'cancelled':
              sendAppointmentCancelledEmail({
                clientName,
                clientEmail,
                serviceName: appt.serviceName || '',
                appointmentDate: dateStr,
                appointmentTime: timeStr,
                price: 0,
              }).catch(err => console.error('Erro email cancellation:', err));
              break;
          }
        } catch (emailErr) {
          console.error('Erro ao enviar email de status:', emailErr);
        }
      }

      if (updated[0]) {
        await notifyOwner({
          title: `Status do Agendamento Atualizado: ${statusLabels[input.status] || input.status}`,
          content: `Cliente: ${updated[0].clientName}\nEmail: ${updated[0].clientEmail}\nNovo Status: ${statusLabels[input.status] || input.status}`,
        }).catch(err => console.error('Erro ao notificar:', err));
      }

      return updated[0];
    }),

  /**
   * Update appointment
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        serviceId: z.number().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().email().optional(),
        clientPhone: z.string().optional(),
        appointmentDate: z.date().optional(),
        appointmentTime: z.string().optional(),
        eventLocation: z.string().optional(),
        numberOfPeople: z.number().optional(),
        estimatedDuration: z.string().optional(),
        notes: z.string().optional(),
        adminNotes: z.string().optional(),
        status: z.enum([
          'pending',
          'confirmed',
          'session_done',
          'editing',
          'awaiting_selection',
          'final_editing',
          'delivered',
          'cancelled'
        ]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;

        // @ts-ignore
      await db.update(appointments).set(data as any).where(and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId(ctx))));

      // Buscar item atualizado
      const updated = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, id), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      return updated[0];
    }),

  /**
   * Approve selection (client)
   */
  approveSelection: publicProcedure
    .input(z.object({
      appointmentId: z.number(),
      clientEmail: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify that the email matches the appointment
      const appointment = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.id, input.appointmentId),
            eq(appointments.clientEmail, input.clientEmail)
          )
        )
        .limit(1);

      if (!appointment || appointment.length === 0) {
        throw new Error("Appointment not found ou email invalid");
      }

      // Update appointment
      await db
        .update(appointments)
        .set({
          selectionApproved: 1,
        // @ts-ignore
          selectionApprovedAt: new Date().toISOString(),
          status: 'final_editing', // Automatically move to final editing
        })
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      // Notify owner
      await notifyOwner({
        title: "Cliente aprovou selection de fotos",
        content: `Cliente: ${appointment[0].clientName}\nAgendamento ID: ${input.appointmentId}\nStatus alterado para: Editando Selecionadas`,
      }).catch(err => console.error('Erro ao notificar:', err));

      // Email de selection approved will be enviado pelo sistema de galerias

      return { success: true };
    }),

  /**
   * Create manual appointment (admin) - linked to existing client
   */
  createManual: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        customServiceName: z.string().optional(),
        customPrice: z.number().optional(),
        serviceId: z.number().optional(),
        appointmentDate: z.date(),
        appointmentTime: z.string().optional(),
        eventLocation: z.string().optional(),
        numberOfPeople: z.number().optional(),
        estimatedDuration: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get client info (users with role='user')
      const { users } = await import('../../drizzle/schema');
      const client = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.clientId), eq(users.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!client || client.length === 0) {
        throw new Error('Client not found');
      }

      // Buscar preço do service se fornecido
      let servicePrice = 0;
      if (input.serviceId) {
        const [service] = await db
          .select()
          .from(services)
          .where(and(eq(services.id, input.serviceId), eq(services.tenantId, getTenantId(ctx))))
          .limit(1);
        if (service) {
          servicePrice = service.price;
        }
      }
      
      // Se customPrice foi fornecido, usar valor em pounds diretamente
      if (input.customPrice !== undefined && input.customPrice !== null) {
        servicePrice = Math.round(input.customPrice);
      }
      // Gerar slug
        // @ts-ignore
      const slug = `${(client[0].fullName || client[0].name || "client").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
      
      // Create appointment with client info
        const { sql } = await import('drizzle-orm');
      const manualDateStr = input.appointmentDate instanceof Date ? input.appointmentDate.toISOString().slice(0, 19).replace('T', ' ') : input.appointmentDate ? new Date(input.appointmentDate).toISOString().slice(0, 19).replace('T', ' ') : null;
      
      const result = await db.execute(sql`INSERT INTO appointments 
        (tenantId, clientName, clientEmail, clientPhone, serviceId, userId, appointmentDate, appointmentTime, eventLocation, numberOfPeople, estimatedDuration, notes, status, finalPrice, slug, customServiceName) 
        VALUES (${getTenantId(ctx)}, ${client[0].fullName || client[0].name || ''}, ${client[0].email || ''}, ${client[0].phone || null}, ${input.serviceId || null}, ${input.clientId}, ${manualDateStr}, ${input.appointmentTime || null}, ${input.eventLocation || null}, ${input.numberOfPeople || null}, ${input.estimatedDuration || null}, ${input.notes || null}, 'confirmed', ${servicePrice}, ${slug}, ${input.customServiceName || null})`);
      
      return { success: true, id: (result as any)[0].insertId };
    }),

  /**
   * Update final price (admin)
   */
  updateFinalPrice: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        finalPrice: z.number(), // Em pounds
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(appointments)
        .set({ finalPrice: input.finalPrice })
        .where(and(eq(appointments.id, input.appointmentId), eq(appointments.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Add extra service to appointment
   */
  addExtra: protectedProcedure
    .input(
      z.object({
        appointmentId: z.number(),
        description: z.string(),
        price: z.number(), // Em pounds
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(appointmentExtras).values({
        tenantId: getTenantId(ctx),
        appointmentId: input.appointmentId,
        description: input.description,
        price: input.price,
      });

      return { success: true };
    }),

  /**
   * Get extras for appointment
   */
  getExtras: publicProcedure
    .input(z.object({ appointmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const extras = await db
        .select()
        .from(appointmentExtras)
        .where(and(eq(appointmentExtras.appointmentId, input.appointmentId), eq(appointmentExtras.tenantId, getTenantId(ctx))));

      return extras;
    }),

  /**
   * Delete extra service
   */
  deleteExtra: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(appointmentExtras).where(and(eq(appointmentExtras.id, input.id), eq(appointmentExtras.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Delete appointment
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(appointments).where(and(eq(appointments.id, input.id), eq(appointments.tenantId, getTenantId(ctx))));

      return { success: true };
    }),

  /**
   * Register guest for shared album access
   */
  registerGuest: publicProcedure
    .input(z.object({
      slug: z.string(),
      email: z.string().email(),
      name: z.string().optional(),
      relationship: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find appointment by slug
      const [appointment] = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.slug, input.slug), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!appointment) {
        throw new Error("Album not found");
      }

      // Find collection for this appointment
      const { collections, albumGuests } = await import('../../drizzle/schema');
      const [collection] = await db
        .select()
        .from(collections)
        .where(and(eq(collections.appointmentId, appointment.id), eq(collections.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!collection) {
        throw new Error("Collection not found");
      }

      // Check if guest already registered
      const [existingGuest] = await db
        .select()
        .from(albumGuests)
        .where(
          and(
            eq(albumGuests.collectionId, collection.id),
            eq(albumGuests.email, input.email)
          )
        )
        .limit(1);

      if (existingGuest) {
        return { success: true, message: "You already tem acesso a este álbum" };
      }

      // Register new guest
      await db.insert(albumGuests).values({
        tenantId: getTenantId(ctx),
        collectionId: collection.id,
        email: input.email,
        name: input.name || null,
        relationship: input.relationship || null,
      });

      return { success: true, message: "Acesso concedido!" };
    }),

  /**
   * Get appointment by slug (public - for shared album)
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [appointment] = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.slug, input.slug), eq(appointments.tenantId, getTenantId(ctx))))
        .limit(1);

      if (!appointment) return null;

      // Get final album photos for this appointment
      const { finalAlbums } = await import('../../drizzle/schema');
      const photos = await db
        .select()
        .from(finalAlbums)
        .where(and(eq(finalAlbums.appointmentId, appointment.id), eq(finalAlbums.tenantId, getTenantId(ctx))));

      return {
        ...appointment,
        photos,
      };
    }),

  /**
   * Get appointments with final albums (admin) - SUPER OPTIMIZED
   * Returns appointments with photos + leads count + collection data in 1 query
   */
  getWithFinalAlbums: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    
    const db = await getDb();
    if (!db) return [];
    
    const { finalAlbums, albumGuests } = await import('../../drizzle/schema');
    const { sql } = await import('drizzle-orm');
    
    // Super optimized query: appointments + service + leads count + collection in 1 query
    const result = await db
      .select({
        id: appointments.id,
        serviceId: appointments.serviceId,
        userId: appointments.userId,
        clientName: appointments.clientName,
        clientEmail: appointments.clientEmail,
        clientPhone: appointments.clientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        eventLocation: appointments.eventLocation,
        numberOfPeople: appointments.numberOfPeople,
        estimatedDuration: appointments.estimatedDuration,
        status: appointments.status,
        paymentStatus: appointments.paymentStatus,
        finalPrice: appointments.finalPrice,
        paidAmount: appointments.paidAmount,
        createdAt: appointments.createdAt,
        slug: appointments.slug,
        // Service data
        serviceName: services.name,
        serviceType: services.serviceType,
        // Leads count (agregado)
        leadsCount: sql<number>`CAST(COUNT(DISTINCT ${albumGuests.id}) AS SIGNED)`,
        // Collection data (agregado)
        collectionId: sql<number>`MAX(${collections.id})`,
        collectionSlug: sql<string>`MAX(${collections.slug})`,
        collectionPublicSlug: sql<string>`MAX(${collections.publicSlug})`,
        collectionSalesEnabled: sql<number>`MAX(${collections.salesEnabled})`,
        collectionPricePerPhoto: sql<number>`MAX(${collections.pricePerPhoto})`,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(finalAlbums, and(
        eq(finalAlbums.appointmentId, appointments.id),
        eq(finalAlbums.tenantId, getTenantId(ctx))
      ))
      .leftJoin(collections, and(
        eq(collections.appointmentId, appointments.id),
        eq(collections.tenantId, getTenantId(ctx))
      ))
      .leftJoin(albumGuests, and(
        eq(albumGuests.collectionId, collections.id),
        eq(albumGuests.tenantId, getTenantId(ctx))
      ))
      .where(eq(appointments.tenantId, getTenantId(ctx)))
      .groupBy(appointments.id)
      .orderBy(sql`MAX(${appointments.appointmentDate}) DESC`)
      .limit(100);
    
    return result;
  }),
});
