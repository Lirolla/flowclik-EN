/**
 * Sistema de envio de emails para clientes
 * 
 * NOTA: Este é um sistema simulado que registra logs.
 * Para produção, integre com:
 * - SendGrid (https://sendgrid.com)
 * - Mailgun (https://www.mailgun.com)
 * - AWS SES (https://aws.amazon.com/ses)
 * - Resend (https://resend.com)
 */

export type EmailTemplate = 
  | 'appointment_created'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'session_done'
  | 'photos_ready_for_selection'
  | 'selection_approved'
  | 'final_photos_ready'
  | 'photos_delivered';

interface EmailData {
  to: string;
  clientName: string;
  appointmentDate?: string;
  appointmentTime?: string;
  serviceName?: string;
  eventLocation?: string;
}

const getEmailContent = (template: EmailTemplate, data: EmailData) => {
  const templates = {
    appointment_created: {
      subject: '✅ Booking Received - Awaiting Confirmation',
      body: `
Hello ${data.clientName},

Recebemos seu pedido de agendamento!

📅 Data: ${data.appointmentDate}
${data.appointmentTime ? `🕐 Time: ${data.appointmentTime}` : ''}
${data.serviceName ? `📸 Service: ${data.serviceName}` : ''}
${data.eventLocation ? `📍 Local: ${data.eventLocation}` : ''}

Estamos analisando sua solicitação e entraremos em contato em breve para confirmar.

Kind regards,
Team Lirolla
      `.trim(),
    },
    appointment_confirmed: {
      subject: '🎉 Agendamento Confirmado!',
      body: `
Hello ${data.clientName},

Seu agendamento foi CONFIRMADO! 🎉

📅 Data: ${data.appointmentDate}
${data.appointmentTime ? `🕐 Time: ${data.appointmentTime}` : ''}
${data.serviceName ? `📸 Service: ${data.serviceName}` : ''}
${data.eventLocation ? `📍 Local: ${data.eventLocation}` : ''}

Estamos ansiosos para capturar seus moments especiais!

Kind regards,
Team Lirolla
      `.trim(),
    },
    appointment_cancelled: {
      subject: '❌ Agendamento Cancelled',
      body: `
Hello ${data.clientName},

Infelizmente seu agendamento foi cancelled.

Se you tiver alguma dúvida ou quiser reagendar, get in touch conosco.

Kind regards,
Team Lirolla
      `.trim(),
    },
    session_done: {
      subject: '📸 Ensaio Realizado com Sucesso!',
      body: `
Hello ${data.clientName},

Seu ensaio photography foi realizado com sucesso! 📸

Agora estamos trabalhando na editing das fotos. Em breve you receberá uma notification para selecionar suas favoritas.

Kind regards,
Team Lirolla
      `.trim(),
    },
    photos_ready_for_selection: {
      subject: '👀 Your Photos Are Ready for Selection!',
      body: `
Hello ${data.clientName},

Great news! Your photos are ready para selection! 👀

Access your gallery privada e escolha suas favoritas para a editing final.

Kind regards,
Team Lirolla
      `.trim(),
    },
    final_photos_ready: {
      subject: '✨ Final Editing in Progress',
      body: `
Hello ${data.clientName},

Estamos trabalhando na editing final das fotos que you selecionou! ✨

Em breve suas fotos estarão prontas para download.

Kind regards,
Team Lirolla
      `.trim(),
    },
    selection_approved: {
      subject: '✅ Photo Selection Approved!',
      body: `
Hello ${data.clientName},

Sua selection de fotos foi approved com sucesso! ✅

Agora vamos trabalhar na editing final das fotos que you escolheu.

Em breve suas fotos estarão prontas para download!

Kind regards,
Team Lirolla
      `.trim(),
    },
    photos_delivered: {
      subject: '📦 Your Photos Are Ready!',
      body: `
Hello ${data.clientName},

Your photos are ready! 📦

Access your gallery para fazer o download.

It was a pleasure working with you!

Kind regards,
Team Lirolla
      `.trim(),
    },
  };

  return templates[template];
};

/**
 * Envia email para o cliente
 * 
 * NOTA: Esta é uma implementação simulada que only registra logs.
 * Em produção, substitua por integration real com service de email.
 */
export async function sendClientEmail(
  template: EmailTemplate,
  data: EmailData
): Promise<boolean> {
  try {
    const emailContent = getEmailContent(template, data);

    // LOG: Simula envio de email
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 EMAIL ENVIADO PARA CLIENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Para: ${data.to}`);
    console.log(`Assunto: ${emailContent.subject}`);
    console.log('─────────────────────────────────────────');
    console.log(emailContent.body);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // TODO: Integrar com service de email real
    // Example com SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: data.to,
    //   from: 'noreply@lirolla.com',
    //   subject: emailContent.subject,
    //   text: emailContent.body,
    // });

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

/**
 * Mapeia status do agendamento para template de email
 */
export function getEmailTemplateForStatus(status: string): EmailTemplate | null {
  const mapping: Record<string, EmailTemplate> = {
    confirmed: 'appointment_confirmed',
    cancelled: 'appointment_cancelled',
    session_done: 'session_done',
    awaiting_selection: 'photos_ready_for_selection',
    final_editing: 'final_photos_ready',
    delivered: 'photos_delivered',
  };

  return mapping[status] || null;
}
