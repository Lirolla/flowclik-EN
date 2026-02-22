import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FLOWCLIK_FROM = "FlowClik <noreply@flowclik.com>";

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(RESEND_API_KEY);
  return resendClient;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const r = getResend();
    const result = await r.emails.send({
      from: FLOWCLIK_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    if (result.error) {
      console.error("Resend error:", result.error);
      return false;
    }
    console.log(`✅ Email enviado: ${options.subject} → ${options.to}`);
    return true;
  } catch (error: any) {
    console.error(`⚠️ Falha ao enviar email (${options.subject}):`, error.message);
    return false;
  }
}

/**
 * Send email in background (fire and forget)
 */
export function sendEmailAsync(options: EmailOptions): void {
  sendEmail(options).catch(err => {
    console.error("Background email failed:", err);
  });
}

/**
 * Verify email connection (always true for Resend)
 */
export async function verifyEmailConnection(): Promise<boolean> {
  return !!RESEND_API_KEY;
}
