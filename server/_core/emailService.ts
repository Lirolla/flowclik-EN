import { Resend } from "resend";
import { getDb } from "../db";
import { siteConfig, tenants } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ============================================================
// FlowClik Email Service - Powered by Resend
// ============================================================

// API Key global da plataforma FlowClik
const FLOWCLIK_RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FLOWCLIK_FROM_EMAIL = "FlowClik <noreply@flowclik.com>";
const ADMIN_EMAIL = "contato@flowclik.com";

// Resend client global
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(FLOWCLIK_RESEND_API_KEY);
  }
  return resendClient;
}

// ============================================================
// Base Template - Design profissional FlowClik
// ============================================================

function baseTemplate(content: string, footerText?: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowClik</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f1419; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f1419;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">
          
          <!-- Header com Logo -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 12px 30px; border-radius: 12px;">
                    <span style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Flow<span style="color: #0f1419;">Clik</span></span>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">Plataforma de Fotografia Profissional</p>
            </td>
          </tr>

          <!-- Content Card -->
          <tr>
            <td style="background-color: #1a1f2e; border-radius: 16px; padding: 40px 35px; border: 1px solid #2d3548;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 20px;">
              <p style="color: #4b5563; font-size: 12px; margin: 0; line-height: 1.6;">
                ${footerText || "Este email foi enviado automaticamente pela plataforma FlowClik."}
                <br>
                <a href="https://flowclik.com" style="color: #22c55e; text-decoration: none;">flowclik.com</a>
              </p>
              <p style="color: #374151; font-size: 11px; margin: 15px 0 0 0;">
                &copy; ${new Date().getFullYear()} FlowClik - Todos os direitos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Botão estilizado reutilizável
function emailButton(text: string, url: string, color: string = "#22c55e"): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 25px auto;">
      <tr>
        <td style="background-color: ${color}; border-radius: 8px; padding: 14px 32px;">
          <a href="${url}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">${text}</a>
        </td>
      </tr>
    </table>`;
}

// Card de detalhes
function detailsCard(items: { label: string; value: string }[]): string {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 8px 12px; color: #9ca3af; font-size: 13px; border-bottom: 1px solid #2d3548;">${item.label}</td>
      <td style="padding: 8px 12px; color: #e5e7eb; font-size: 13px; font-weight: 600; border-bottom: 1px solid #2d3548; text-align: right;">${item.value}</td>
    </tr>
  `).join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #141824; border-radius: 10px; margin: 20px 0; border: 1px solid #2d3548;">
      ${rows}
    </table>`;
}

// ============================================================
// TEMPLATES DE EMAIL
// ============================================================

// --- EMAILS PARA CLIENTES (visitantes do site do fotógrafo) ---

export function templateConfirmacaoAgendamento(data: {
  clientName: string;
  photographerName: string;
  serviceName: string;
  date: string;
  time: string;
  price: string;
  notes?: string;
  siteUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">📅 Agendamento Confirmado!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Seu ensaio fotográfico está marcado</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.clientName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Seu agendamento com <strong style="color: #22c55e;">${data.photographerName}</strong> foi confirmado com sucesso! Estamos ansiosos para capturar momentos especiais para você.
    </p>

    ${detailsCard([
      { label: "📸 Serviço", value: data.serviceName },
      { label: "📅 Data", value: data.date },
      { label: "🕐 Horário", value: data.time },
      { label: "💰 Valor", value: data.price },
      ...(data.notes ? [{ label: "📝 Observações", value: data.notes }] : []),
    ])}

    <p style="color: #9ca3af; font-size: 14px; line-height: 1.7; margin-top: 20px;">
      <strong style="color: #e5e7eb;">O que vem agora?</strong><br>
      O fotógrafo entrará em contato para confirmar os detalhes finais. Após a sessão, você receberá um link para visualizar e selecionar suas fotos favoritas.
    </p>

    ${emailButton("Ver Meu Agendamento", data.siteUrl)}
  `, `Email enviado por ${data.photographerName} via FlowClik`);
}

export function templateFotosProntas(data: {
  clientName: string;
  photographerName: string;
  collectionName: string;
  totalPhotos: number;
  galleryUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">📸 Suas Fotos Estão Prontas!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Hora de ver os resultados</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.clientName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Ótimas notícias! <strong style="color: #22c55e;">${data.photographerName}</strong> finalizou suas fotos e elas estão prontas para visualização.
    </p>

    ${detailsCard([
      { label: "📁 Coleção", value: data.collectionName },
      { label: "🖼️ Total de Fotos", value: `${data.totalPhotos} fotos` },
    ])}

    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Acesse sua galeria privada para ver todas as fotos e selecionar suas favoritas!
    </p>

    ${emailButton("🖼️ Ver Minhas Fotos", data.galleryUrl)}
  `, `Email enviado por ${data.photographerName} via FlowClik`);
}

export function templateSelecaoFotos(data: {
  clientName: string;
  photographerName: string;
  collectionName: string;
  maxSelections: number;
  galleryUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">👀 Selecione Suas Fotos Favoritas!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Escolha as melhores para edição final</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.clientName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Suas fotos estão prontas para seleção! Acesse a galeria e escolha até <strong style="color: #22c55e;">${data.maxSelections} fotos</strong> para a edição final.
    </p>

    ${detailsCard([
      { label: "📁 Coleção", value: data.collectionName },
      { label: "✅ Máximo de Seleções", value: `${data.maxSelections} fotos` },
    ])}

    ${emailButton("✨ Selecionar Fotos", data.galleryUrl)}

    <p style="color: #6b7280; font-size: 13px; margin-top: 15px; text-align: center;">
      Após selecionar, o fotógrafo iniciará a edição final.
    </p>
  `, `Email enviado por ${data.photographerName} via FlowClik`);
}

export function templateLinkPagamento(data: {
  clientName: string;
  photographerName: string;
  description: string;
  amount: string;
  paymentUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">💳 Link de Pagamento</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Pagamento seguro e rápido</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.clientName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      <strong style="color: #22c55e;">${data.photographerName}</strong> enviou um link de pagamento para você.
    </p>

    ${detailsCard([
      { label: "📋 Descrição", value: data.description },
      { label: "💰 Valor", value: data.amount },
    ])}

    ${emailButton("💳 Realizar Pagamento", data.paymentUrl, "#22c55e")}

    <p style="color: #6b7280; font-size: 13px; margin-top: 15px; text-align: center;">
      Pagamento processado de forma segura.
    </p>
  `, `Email enviado por ${data.photographerName} via FlowClik`);
}

export function templateFotosEntregues(data: {
  clientName: string;
  photographerName: string;
  collectionName: string;
  downloadUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">🎉 Suas Fotos Foram Entregues!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Download disponível</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.clientName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Suas fotos editadas estão prontas para download! Foi um prazer trabalhar com você.
    </p>

    ${detailsCard([
      { label: "📁 Coleção", value: data.collectionName },
    ])}

    ${emailButton("📥 Baixar Minhas Fotos", data.downloadUrl)}

    <p style="color: #d1d5db; font-size: 14px; line-height: 1.7; margin-top: 20px; text-align: center;">
      Obrigado por escolher <strong style="color: #22c55e;">${data.photographerName}</strong>! 
      Se gostou do trabalho, compartilhe com amigos e família. 💚
    </p>
  `, `Email enviado por ${data.photographerName} via FlowClik`);
}

// --- EMAILS PARA FOTÓGRAFOS ---

export function templateBoasVindasFotografo(data: {
  photographerName: string;
  subdomain: string;
  loginUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">🎉 Bem-vindo(a) ao FlowClik!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Sua plataforma de fotografia está pronta</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.photographerName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Seja muito bem-vindo(a) ao FlowClik! Sua conta foi criada com sucesso e seu site já está no ar.
    </p>

    ${detailsCard([
      { label: "🌐 Seu Site", value: `${data.subdomain}.flowclik.com` },
      { label: "📊 Painel Admin", value: "Acesse pelo botão abaixo" },
    ])}

    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      <strong style="color: #e5e7eb;">Próximos passos:</strong>
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 10px 0;">
      <tr><td style="color: #d1d5db; font-size: 14px; padding: 6px 0;">✅ Personalize seu site (cores, logo, sobre)</td></tr>
      <tr><td style="color: #d1d5db; font-size: 14px; padding: 6px 0;">✅ Adicione seus serviços e preços</td></tr>
      <tr><td style="color: #d1d5db; font-size: 14px; padding: 6px 0;">✅ Faça upload do seu portfólio</td></tr>
      <tr><td style="color: #d1d5db; font-size: 14px; padding: 6px 0;">✅ Configure seus horários disponíveis</td></tr>
      <tr><td style="color: #d1d5db; font-size: 14px; padding: 6px 0;">✅ Compartilhe seu link com clientes!</td></tr>
    </table>

    ${emailButton("🚀 Acessar Meu Painel", data.loginUrl)}
  `);
}

export function templateNovoAgendamento(data: {
  photographerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  date: string;
  time: string;
  price: string;
  adminUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">📅 Novo Agendamento!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Um cliente acabou de agendar</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.photographerName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Você recebeu um novo agendamento! Confira os detalhes:
    </p>

    ${detailsCard([
      { label: "👤 Cliente", value: data.clientName },
      { label: "📧 Email", value: data.clientEmail },
      ...(data.clientPhone ? [{ label: "📱 Telefone", value: data.clientPhone }] : []),
      { label: "📸 Serviço", value: data.serviceName },
      { label: "📅 Data", value: data.date },
      { label: "🕐 Horário", value: data.time },
      { label: "💰 Valor", value: data.price },
    ])}

    ${emailButton("📋 Ver no Painel", data.adminUrl)}
  `);
}

export function templateClienteSelecionouFotos(data: {
  photographerName: string;
  clientName: string;
  collectionName: string;
  selectedCount: number;
  adminUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">✅ Cliente Selecionou Fotos!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Seleção pronta para revisão</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.photographerName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      <strong style="color: #22c55e;">${data.clientName}</strong> finalizou a seleção de fotos da coleção <strong>"${data.collectionName}"</strong>.
    </p>

    ${detailsCard([
      { label: "📁 Coleção", value: data.collectionName },
      { label: "🖼️ Fotos Selecionadas", value: `${data.selectedCount} fotos` },
    ])}

    <p style="color: #d1d5db; font-size: 14px; line-height: 1.7;">
      Acesse o painel para revisar a seleção e iniciar a edição final.
    </p>

    ${emailButton("👁️ Ver Seleção", data.adminUrl)}
  `);
}

export function templateTicketRespondido(data: {
  photographerName: string;
  ticketSubject: string;
  responsePreview: string;
  ticketUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">💬 Ticket Respondido</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Suporte FlowClik</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.photographerName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Seu ticket de suporte recebeu uma resposta:
    </p>

    ${detailsCard([
      { label: "📋 Assunto", value: data.ticketSubject },
    ])}

    <div style="background-color: #141824; border-radius: 10px; padding: 15px 20px; margin: 15px 0; border-left: 3px solid #22c55e;">
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
        "${data.responsePreview}"
      </p>
    </div>

    ${emailButton("Ver Ticket Completo", data.ticketUrl)}
  `);
}

export function templateVencimentoPlano(data: {
  photographerName: string;
  planName: string;
  expiryDate: string;
  renewUrl: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #f59e0b; font-size: 24px; margin: 0 0 8px 0;">⚠️ Seu Plano Está Vencendo</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Renove para continuar usando</p>
    
    <p style="color: #e5e7eb; font-size: 15px; line-height: 1.7;">
      Olá <strong>${data.photographerName}</strong>,
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Seu plano <strong style="color: #f59e0b;">${data.planName}</strong> vence em <strong style="color: #f59e0b;">${data.expiryDate}</strong>.
    </p>
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Renove agora para não perder acesso ao seu site, galerias e agendamentos.
    </p>

    ${detailsCard([
      { label: "📋 Plano Atual", value: data.planName },
      { label: "📅 Vencimento", value: data.expiryDate },
    ])}

    ${emailButton("🔄 Renovar Plano", data.renewUrl, "#f59e0b")}

    <p style="color: #6b7280; font-size: 13px; margin-top: 15px; text-align: center;">
      Após o vencimento, seu site ficará temporariamente indisponível.
    </p>
  `);
}

// --- EMAILS PARA ADMIN (contato@flowclik.com) ---

export function templateNovoFotografoCadastrado(data: {
  photographerName: string;
  email: string;
  subdomain: string;
  plan: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #22c55e; font-size: 24px; margin: 0 0 8px 0;">🆕 Novo Fotógrafo Cadastrado!</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Painel Admin FlowClik</p>
    
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      Um novo fotógrafo se cadastrou na plataforma:
    </p>

    ${detailsCard([
      { label: "👤 Nome", value: data.photographerName },
      { label: "📧 Email", value: data.email },
      { label: "🌐 Subdomínio", value: `${data.subdomain}.flowclik.com` },
      { label: "📋 Plano", value: data.plan },
    ])}

    ${emailButton("Ver no Painel Admin", "https://flowclik.com/system/photographers")}
  `);
}

export function templateNovoTicketSuporte(data: {
  photographerName: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return baseTemplate(`
    <h1 style="color: #ef4444; font-size: 24px; margin: 0 0 8px 0;">🎫 Novo Ticket de Suporte</h1>
    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 25px 0;">Requer atenção</p>
    
    <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
      <strong style="color: #22c55e;">${data.photographerName}</strong> (${data.email}) abriu um ticket:
    </p>

    ${detailsCard([
      { label: "📋 Assunto", value: data.subject },
    ])}

    <div style="background-color: #141824; border-radius: 10px; padding: 15px 20px; margin: 15px 0; border-left: 3px solid #ef4444;">
      <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">
        ${data.message}
      </p>
    </div>

    ${emailButton("Responder Ticket", "https://flowclik.com/system/tickets", "#ef4444")}
  `);
}

// ============================================================
// FUNÇÃO PRINCIPAL DE ENVIO
// ============================================================

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendFlowClikEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const resend = getResendClient();
    
    const result = await resend.emails.send({
      from: options.from || FLOWCLIK_FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
    });

    if (result.error) {
      console.error("❌ Erro ao enviar email:", result.error);
      return false;
    }

    console.log(`✅ Email enviado: ${options.subject} → ${options.to}`);
    return true;
  } catch (error: any) {
    console.error(`⚠️ Falha ao enviar email (${options.subject}):`, error.message);
    return false;
  }
}

// ============================================================
// FUNÇÕES DE ALTO NÍVEL (usar nos routers)
// ============================================================

// --- Para Clientes ---

export async function enviarEmailConfirmacaoAgendamento(data: {
  clientName: string;
  clientEmail: string;
  photographerName: string;
  serviceName: string;
  date: string;
  time: string;
  price: string;
  notes?: string;
  siteUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.clientEmail,
    subject: `📅 Agendamento Confirmado - ${data.photographerName}`,
    html: templateConfirmacaoAgendamento(data),
  });
}

export async function enviarEmailFotosProntas(data: {
  clientName: string;
  clientEmail: string;
  photographerName: string;
  collectionName: string;
  totalPhotos: number;
  galleryUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.clientEmail,
    subject: `📸 Suas Fotos Estão Prontas - ${data.photographerName}`,
    html: templateFotosProntas(data),
  });
}

export async function enviarEmailSelecaoFotos(data: {
  clientName: string;
  clientEmail: string;
  photographerName: string;
  collectionName: string;
  maxSelections: number;
  galleryUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.clientEmail,
    subject: `👀 Selecione Suas Fotos - ${data.photographerName}`,
    html: templateSelecaoFotos(data),
  });
}

export async function enviarEmailLinkPagamento(data: {
  clientName: string;
  clientEmail: string;
  photographerName: string;
  description: string;
  amount: string;
  paymentUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.clientEmail,
    subject: `💳 Link de Pagamento - ${data.photographerName}`,
    html: templateLinkPagamento(data),
  });
}

export async function enviarEmailFotosEntregues(data: {
  clientName: string;
  clientEmail: string;
  photographerName: string;
  collectionName: string;
  downloadUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.clientEmail,
    subject: `🎉 Suas Fotos Foram Entregues - ${data.photographerName}`,
    html: templateFotosEntregues(data),
  });
}

// --- Para Fotógrafos ---

export async function enviarEmailBoasVindas(data: {
  photographerName: string;
  photographerEmail: string;
  subdomain: string;
  loginUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.photographerEmail,
    subject: "🎉 Bem-vindo(a) ao FlowClik! Sua plataforma está pronta",
    html: templateBoasVindasFotografo(data),
  });
}

export async function enviarEmailNovoAgendamento(data: {
  photographerName: string;
  photographerEmail: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  serviceName: string;
  date: string;
  time: string;
  price: string;
  adminUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.photographerEmail,
    subject: `📅 Novo Agendamento - ${data.clientName}`,
    html: templateNovoAgendamento(data),
  });
}

export async function enviarEmailClienteSelecionouFotos(data: {
  photographerName: string;
  photographerEmail: string;
  clientName: string;
  collectionName: string;
  selectedCount: number;
  adminUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.photographerEmail,
    subject: `✅ ${data.clientName} selecionou fotos - ${data.collectionName}`,
    html: templateClienteSelecionouFotos(data),
  });
}

export async function enviarEmailTicketRespondido(data: {
  photographerName: string;
  photographerEmail: string;
  ticketSubject: string;
  responsePreview: string;
  ticketUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.photographerEmail,
    subject: `💬 Ticket Respondido - ${data.ticketSubject}`,
    html: templateTicketRespondido(data),
  });
}

export async function enviarEmailVencimentoPlano(data: {
  photographerName: string;
  photographerEmail: string;
  planName: string;
  expiryDate: string;
  renewUrl: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: data.photographerEmail,
    subject: `⚠️ Seu plano vence em breve - ${data.planName}`,
    html: templateVencimentoPlano(data),
  });
}

// --- Para Admin ---

export async function enviarEmailNovoFotografo(data: {
  photographerName: string;
  email: string;
  subdomain: string;
  plan: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: ADMIN_EMAIL,
    subject: `🆕 Novo Fotógrafo: ${data.photographerName}`,
    html: templateNovoFotografoCadastrado(data),
  });
}

export async function enviarEmailNovoTicket(data: {
  photographerName: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  return sendFlowClikEmail({
    to: ADMIN_EMAIL,
    subject: `🎫 Novo Ticket: ${data.subject}`,
    html: templateNovoTicketSuporte(data),
  });
}
