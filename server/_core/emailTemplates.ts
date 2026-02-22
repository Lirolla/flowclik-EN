import { Resend } from "resend";

// API Key global da plataforma FlowClik
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FLOWCLIK_FROM = "FlowClik <noreply@flowclik.com>";
const ADMIN_EMAIL = "contato@flowclik.com";

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(RESEND_API_KEY);
  return resendClient;
}

// ============================================================
// Envio genisrico via Resend
// ============================================================
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): Promise<boolean> {
  try {
    const r = getResend();
    const result = await r.emails.send({
      from: FLOWCLIK_FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (result.error) {
      console.error("Resend error:", result.error);
      return false;
    }
    console.log(`✅ Email sent: ${opts.subject} → ${opts.to}`);
    return true;
  } catch (err: any) {
    console.error(`⚠️ Email falhou (${opts.subject}):`, err.message);
    return false;
  }
}

// ============================================================
// Base Template HTML - Design FlowClik
// ============================================================
function base(content: string, footer?: string): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f1419;font-family:'Monoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f1419;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
<tr><td align="center" style="padding:30px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr><td style="padding:12px 30px;">
      <span style="font-size:32px;font-weight:800;letter-spacing:-0.5px;"><span style="color:#e879f9;">Flow</span><span style="color:#c026d3;">Clik</span></span>
    </td></tr>
  </table>
  <p style="color:#a78bfa;font-size:13px;margin:10px 0 0 0;">Plataforma de Photography Profissional</p>
</td></tr>
<tr><td style="background-color:#1a1f2e;border-radius:16px;padding:40px 35px;border:1px solid #2d3548;">
${content}
</td></tr>
<tr><td align="center" style="padding:30px 20px;">
  <p style="color:#4b5563;font-size:12px;margin:0;line-height:1.6;">
    ${footer || "Este email foi sent automaticamente pela plataforma FlowClik."}<br>
    <a href="https://flowclik.com" style="color:#e879f9;text-decoration:none;">flowclik.com</a>
  </p>
  <p style="color:#374151;font-size:11px;margin:15px 0 0 0;">&copy; ${new Date().getFullYear()} FlowClik - All rights reserved</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function btn(text: string, url: string, color = "#c026d3"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:25px auto;">
<tr><td style="background-color:${color};border-radius:8px;padding:14px 32px;">
<a href="${url}" style="color:#fff;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">${text}</a>
</td></tr></table>`;
}

function card(items: {label:string;value:string}[]): string {
  const rows = items.map(i => `<tr>
<td style="padding:8px 12px;color:#9ca3af;font-size:13px;border-bottom:1px solid #2d3548;">${i.label}</td>
<td style="padding:8px 12px;color:#e5e7eb;font-size:13px;font-weight:600;border-bottom:1px solid #2d3548;text-align:right;">${i.value}</td>
</tr>`).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#141824;border-radius:10px;margin:20px 0;border:1px solid #2d3548;">${rows}</table>`;
}

// ============================================================
// INTERFACES
// ============================================================
interface AppointmentData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  price: number;
  notes?: string;
}

interface GalleryData {
  clientName: string;
  clientEmail: string;
  galleryTitle: string;
  galleryUrl: string;
  password?: string;
  photoCount: number;
}

interface PaymentData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  amount: number;
  paymentDate: string;
}

interface SelectionData {
  clientName: string;
  clientEmail: string;
  galleryTitle: string;
  selectedCount: number;
  totalPhotos: number;
}

// ============================================================
// EMAILS PARA CLIENTES
// ============================================================

export async function sendAppointmentConfirmationEmail(data: AppointmentData): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">📅 Agendamento Confirmado!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Your photography session is scheduled</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.clientName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Your appointment has been confirmed com sucesso! Estamos ansiosos para capturar moments special para you.</p>
${card([
  {label:"📸 Service", value: data.serviceName},
  {label:"📅 Data", value: data.appointmentDate},
  {label:"🕐 Time", value: data.appointmentTime},
  {label:"💰 Valor", value: "£ " + data.price.toFixed(2).replace(".",",")},
])}
<p style="color:#9ca3af;font-size:14px;line-height:1.7;margin-top:20px;">
<strong style="color:#e5e7eb;">O que vem now?</strong><br>
The photographer will contact you to confirm the final details. After the session, you will receive a link to view and select your favourite photos.</p>
  `);
  return sendEmail({ to: data.clientEmail, subject: "📅 Agendamento Confirmado!", html });
}

export async function sendAppointmentCancelledEmail(data: AppointmentData): Promise<boolean> {
  const html = base(`
<h1 style="color:#ef4444;font-size:24px;margin:0 0 8px 0;">❌ Agendamento Cancelled</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Your booking has been cancelled</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.clientName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Unfortunately your booking has been cancelled.</p>
${card([
  {label:"📸 Service", value: data.serviceName || "N/A"},
  {label:"📅 Data", value: data.appointmentDate || "N/A"},
])}
<p style="color:#d1d5db;font-size:14px;line-height:1.7;">Se you tiver alguma question ou quiser reagendar, get in touch conosco.</p>
  `);
  return sendEmail({ to: data.clientEmail, subject: "❌ Agendamento Cancelled", html });
}

export async function sendGalleryReadyEmail(data: GalleryData): Promise<boolean> {
  const passwordSection = data.password ? `
<div style="background-color:#141824;border-radius:10px;padding:15px 20px;margin:15px 0;border-left:3px solid #f59e0b;">
  <p style="color:#f59e0b;font-size:13px;margin:0 0 5px 0;font-weight:600;">🔒 Senha de acesso:</p>
  <p style="color:#e5e7eb;font-size:18px;font-weight:bold;margin:0;">${data.password}</p>
</div>` : "";

  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">📸 Your Gallery Is Pronta!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Hour de ver os resultados</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.clientName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Great news! Your photos are ready and are now available in your online gallery!</p>
${card([
  {label:"📁 Gallery", value: data.galleryTitle},
  {label:"🖼️ Total de Fotos", value: data.photoCount + " fotos"},
])}
${passwordSection}
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Access your gallery privada para ver everys as fotos e shecionar yours favourite!</p>
${btn("🖼️ Acessar Minha Gallery", data.galleryUrl)}
<p style="color:#6b7280;font-size:13px;margin-top:15px;text-align:center;">Navegue pelas fotos e clique no ❤️ nas yours favourite.</p>
  `);
  return sendEmail({ to: data.clientEmail, subject: '📸 Your gallery "' + data.galleryTitle + '" is ready!', html });
}

export async function sendSelectionNotificationEmail(data: SelectionData): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">❤️ Photo Selection Recebida!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Thank you pela your selection</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.clientName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Recebemos yours selections de fotos favourite! Thank you por dedicar tempo para escolher as betteres imagens.</p>
${card([
  {label:"📁 Gallery", value: data.galleryTitle},
  {label:"❤️ Selected Photos", value: data.selectedCount + " de " + data.totalPhotos},
])}
<p style="color:#d1d5db;font-size:14px;line-height:1.7;"><strong style="color:#e5e7eb;">Next steps:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">🎨 Now vamos editar yours fotos shecionadas com every carinho</td></tr>
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">⏰ The edited photos will be ready within 5 business days</td></tr>
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">📧 You will receive um email com o link para download</td></tr>
</table>
  `);
  return sendEmail({ to: data.clientEmail, subject: "❤️ Photo Selection Recebida!", html });
}

export async function sendPhotosDeliveredEmail(data: {
  clientName: string;
  clientEmail: string;
  galleryTitle: string;
  downloadUrl: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">🎉 Yours Fotos Outsidem Delivereds!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Download available</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.clientName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Yours fotos edited are prontas para download! It was a pleasure working with you.</p>
${card([{label:"📁 Gallery", value: data.galleryTitle}])}
${btn("📥 Baixar Minhas Fotos", data.downloadUrl)}
<p style="color:#d1d5db;font-size:14px;line-height:1.7;margin-top:20px;text-align:center;">
Thank you por nos escolher! Se gostou do trabalho, share with friends and family. 💚</p>
  `);
  return sendEmail({ to: data.clientEmail, subject: "🎉 Yours Fotos Outsidem Delivereds!", html });
}

export async function sendPaymentConfirmationEmail(data: PaymentData): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">✅ Payment Confirmed!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Thank you pelo pagamento</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.clientName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Your pagamento foi confirmado com sucesso!</p>
${card([
  {label:"📸 Service", value: data.serviceName},
  {label:"💰 Valor", value: "£ " + data.amount.toFixed(2).replace(".",",")},
  {label:"📅 Data", value: data.paymentDate},
])}
  `);
  return sendEmail({ to: data.clientEmail, subject: "✅ Payment Confirmed!", html });
}

// ============================================================
// EMAILS PARA FOTÓGRAFOS
// ============================================================

export async function sendWelcomePhotographerEmail(data: {
  name: string;
  email: string;
  subdomain: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">🎉 Bem-vindo(a) ao FlowClik!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Your plataforma de photography is pronta</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.name}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Seja very bem-vindo(a) ao FlowClik! Your conta foi criada com sucesso e your site already is no ar.</p>
${card([
  {label:"🌐 Your Site", value: data.subdomain + ".flowclik.com"},
  {label:"📊 Painel Admin", value: "Access via the button below"},
])}
<p style="color:#d1d5db;font-size:15px;line-height:1.7;"><strong style="color:#e5e7eb;">Next steps:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:10px 0;">
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">✅ Personalize your site (cores, logo, about)</td></tr>
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">✅ Adicione yours services e prices</td></tr>
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">✅ Make upload do your portfolio</td></tr>
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">✅ Configure yours times available</td></tr>
<tr><td style="color:#d1d5db;font-size:14px;padding:6px 0;">✅ Share your link with clients!</td></tr>
</table>
${btn("🚀 Acessar Meu Painel", "https://" + data.subdomain + ".flowclik.com/admin")}
  `);
  return sendEmail({ to: data.email, subject: "🎉 Welcome to FlowClik! Your platform is ready", html });
}

export async function sendNewAppointmentNotification(data: {
  photographerEmail: string;
  photographerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
  price: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">📅 New Agendamento!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">A client has just booked</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.photographerName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">You have received a new booking! Check the details:</p>
${card([
  {label:"👤 Cliente", value: data.clientName},
  {label:"📧 Email", value: data.clientEmail},
  {label:"📱 Phone", value: data.clientPhone},
  {label:"📸 Service", value: data.serviceName},
  {label:"📅 Data", value: data.date},
  {label:"🕐 Time", value: data.time},
  {label:"💰 Valor", value: data.price},
])}
  `);
  return sendEmail({ to: data.photographerEmail, subject: "📅 New Agendamento - " + data.clientName, html });
}

export async function sendClientSelectionNotification(data: {
  photographerEmail: string;
  photographerName: string;
  clientName: string;
  galleryTitle: string;
  selectedCount: number;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">✅ Cliente Shecionou Fotos!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Selection pronta para reviare</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.photographerName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;"><strong style="color:#e879f9;">${data.clientName}</strong> has completed the photo selection for gallery <strong>"${data.galleryTitle}"</strong>.</p>
${card([
  {label:"📁 Gallery", value: data.galleryTitle},
  {label:"🖼️ Selected Photos", value: data.selectedCount + " fotos"},
])}
<p style="color:#d1d5db;font-size:14px;line-height:1.7;">Acesse o painel para revisar a selection e iniciar a editing final.</p>
  `);
  return sendEmail({ to: data.photographerEmail, subject: "✅ " + data.clientName + " shecionou fotos - " + data.galleryTitle, html });
}

export async function sendTicketReplyNotification(data: {
  photographerEmail: string;
  photographerName: string;
  ticketSubject: string;
  responsePreview: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">💬 Ticket Answered</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Support FlowClik</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.photographerName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Your ticket de suporte recebeu uma resposta:</p>
${card([{label:"📋 Assunto", value: data.ticketSubject}])}
<div style="background-color:#141824;border-radius:10px;padding:15px 20px;margin:15px 0;border-left:3px solid #e879f9;">
<p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0;font-style:italic;">"${data.responsePreview}"</p>
</div>
  `);
  return sendEmail({ to: data.photographerEmail, subject: "💬 Ticket Answered - " + data.ticketSubject, html });
}

export async function sendPlanExpiryNotification(data: {
  photographerEmail: string;
  photographerName: string;
  planName: string;
  expiryDate: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#f59e0b;font-size:24px;margin:0 0 8px 0;">⚠️ Your Plyear Is Vencendo</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Renove para continuar usando</p>
<p style="color:#e5e7eb;font-size:15px;line-height:1.7;">Hello <strong>${data.photographerName}</strong>,</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Your plyear <strong style="color:#f59e0b;">${data.planName}</strong> vence em <strong style="color:#f59e0b;">${data.expiryDate}</strong>.</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Renew now to keep access to your site, galleries and bookings.</p>
${card([
  {label:"📋 Plyear Current", value: data.planName},
  {label:"📅 Expiry", value: data.expiryDate},
])}
${btn("🔄 Renewr Plyear", "https://flowclik.com", "#f59e0b")}
  `);
  return sendEmail({ to: data.photographerEmail, subject: "⚠️ Your plan expires soon - " + data.planName, html });
}

// ============================================================
// EMAILS PARA ADMIN
// ============================================================

export async function sendAdminNewPhotographerEmail(data: {
  name: string;
  email: string;
  subdomain: string;
  plan: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">🆕 New Photographer Cadastrado!</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Painel Admin FlowClik</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">Um new photographer se cadastrou na plataforma:</p>
${card([
  {label:"👤 Nome", value: data.name},
  {label:"📧 Email", value: data.email},
  {label:"🌐 Subdomain", value: data.subdomain + ".flowclik.com"},
  {label:"📋 Plyear", value: data.plan},
])}
${btn("Ver no Painel Admin", "https://flowclik.com/system/photographers")}
  `);
  return sendEmail({ to: ADMIN_EMAIL, subject: "🆕 New Photographer: " + data.name, html });
}

export async function sendAdminNewTicketEmail(data: {
  photographerName: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const html = base(`
<h1 style="color:#ef4444;font-size:24px;margin:0 0 8px 0;">🎫 New Ticket de Support</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Requires attention</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;"><strong style="color:#e879f9;">${data.photographerName}</strong> (${data.email}) abriu um ticket:</p>
${card([{label:"📋 Assunto", value: data.subject}])}
<div style="background-color:#141824;border-radius:10px;padding:15px 20px;margin:15px 0;border-left:3px solid #ef4444;">
<p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0;">${data.message.substring(0, 500)}</p>
</div>
${btn("Reply Ticket", "https://flowclik.com/system/tickets", "#ef4444")}
  `);
  return sendEmail({ to: ADMIN_EMAIL, subject: "🎫 New Ticket: " + data.subject, html });
}

export async function sendAdminSelectionNotification(data: SelectionData): Promise<boolean> {
  const html = base(`
<h1 style="color:#c026d3;font-size:24px;margin:0 0 8px 0;">🔔 New Photo Selection</h1>
<p style="color:#9ca3af;font-size:14px;margin:0 0 25px 0;">Cliente finalizou selection</p>
<p style="color:#d1d5db;font-size:15px;line-height:1.7;">New selection recebida:</p>
${card([
  {label:"👤 Cliente", value: data.clientName + " (" + data.clientEmail + ")"},
  {label:"📁 Gallery", value: data.galleryTitle},
  {label:"❤️ Shecionadas", value: data.selectedCount + " de " + data.totalPhotos + " fotos"},
])}
  `);
  return sendEmail({ to: ADMIN_EMAIL, subject: "🔔 " + data.clientName + " shecionou " + data.selectedCount + " fotos", html });
}
