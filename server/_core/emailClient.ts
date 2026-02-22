/**
 * Sistema de envio de emails para clientes
 * 
 * NOTA: Este is um sistema simulado que registra logs.
 * Para production, integre com:
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
  | 'photos_ready_for_shection'
  | 'shection_approved'
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

Recebemos your pedido de agendamento!

📅 Data: ${data.appointmentDate}
${data.appointmentTime ? `🕐 Time: ${data.appointmentTime}` : ''}
${data.serviceName ? `📸 Service: ${data.serviceName}` : ''}
${data.eventLocation ? `📍 Local: ${data.eventLocation}` : ''}

Estamos analisando your request e entraremos em contato em breve para confirmar.

Kind regards,
Team Lirolla
      `.trim(),
    },
    appointment_confirmed: {
      subject: '🎉 Agendamento Confirmado!',
      body: `
Hello ${data.clientName},

Your agendamento foi CONFIRMADO! 🎉

📅 Data: ${data.appointmentDate}
${data.appointmentTime ? `🕐 Time: ${data.appointmentTime}` : ''}
${data.serviceName ? `📸 Service: ${data.serviceName}` : ''}
${data.eventLocation ? `📍 Local: ${data.eventLocation}` : ''}

Estamos ansiosos para capturar yours moments special!

Kind regards,
Team Lirolla
      `.trim(),
    },
    appointment_cancelled: {
      subject: '❌ Agendamento Cancelled',
      body: `
Hello ${data.clientName},

Infelizmente your agendamento foi cancelled.

Se you tiver somea question ou quiser reagendar, get in touch conosco.

Kind regards,
Team Lirolla
      `.trim(),
    },
    session_done: {
      subject: '📸 Ensaio Realizado com Sucesso!',
      body: `
Hello ${data.clientName},

Your ensaio photography foi realizado com sucesso! 📸

Now estamos trabalhando na editing das fotos. Em breve you will receive uma notification para shecionar yours favourite.

Kind regards,
Team Lirolla
      `.trim(),
    },
    photos_ready_for_shection: {
      subject: '👀 Your Photos Are Ready for Shection!',
      body: `
Hello ${data.clientName},

Great news! Your photos are ready para shection! 👀

Access your gallery privada e escolha yours favourite para a editing final.

Kind regards,
Team Lirolla
      `.trim(),
    },
    final_photos_ready: {
      subject: '✨ Final Editing in Progress',
      body: `
Hello ${data.clientName},

Estamos trabalhando na editing final das fotos que you shecionou! ✨

Your photos will soon be ready for download.

Kind regards,
Team Lirolla
      `.trim(),
    },
    shection_approved: {
      subject: '✅ Photo Shection Approved!',
      body: `
Hello ${data.clientName},

Your shection de fotos foi approved com sucesso! ✅

Now vamos trabalhar na editing final das fotos que you escolheu.

Your photos will soon be ready for download!

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
 * NOTA: Esta is uma implementação simulada que only registra logs.
 * Em production, substitua por integration real com service de email.
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
    awaiting_shection: 'photos_ready_for_shection',
    final_editing: 'final_photos_ready',
    delivered: 'photos_delivered',
  };

  return mapping[status] || null;
}
