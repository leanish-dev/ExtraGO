import { Resend } from "resend";
import { logger } from "./logger";

/**
 * ═══════════════════════════════════════════════════════════
 * EmailService — provider-agnostic email delivery abstraction.
 *
 * Provider selection is automatic and requires NO code changes:
 *   - If RESEND_API_KEY is set        → real delivery via Resend.
 *   - If RESEND_API_KEY is NOT set    → development provider:
 *       the email is logged to the server console AND persisted
 *       in-memory so it can be retrieved via the protected
 *       dev-only endpoint (GET /api/dev/last-email). No inbox is
 *       used, and nothing is ever silently "pretended" as sent.
 *
 * Business/verification logic (OTP generation, expiry, retry
 * limits, audit logging) never depends on which provider is
 * active — it only calls sendVerificationEmail()/sendEmail().
 * ═══════════════════════════════════════════════════════════
 */

const FROM_ADDRESS = process.env.EMAIL_FROM || "extraGO <noreply@extrago.com.br>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "suporte@extrago.com.br";

export type EmailSendResult = {
  ok: boolean;
  provider: "resend" | "dev-console";
  providerMessageId?: string;
  error?: string;
  sentAt: string;
};

// Bounded in-memory log so a dev-only endpoint can retrieve the last
// emails sent per address without a database migration. Never used
// in production (provider is real there), and never exposed publicly.
const DEV_EMAIL_LOG = new Map<string, { subject: string; html: string; text: string; sentAt: string }>();
const DEV_EMAIL_LOG_MAX = 200;

function rememberDevEmail(to: string, subject: string, html: string, text: string) {
  if (DEV_EMAIL_LOG.size >= DEV_EMAIL_LOG_MAX) {
    const oldestKey = DEV_EMAIL_LOG.keys().next().value;
    if (oldestKey) DEV_EMAIL_LOG.delete(oldestKey);
  }
  DEV_EMAIL_LOG.set(to, { subject, html, text, sentAt: new Date().toISOString() });
}

export function getDevEmailLog(to: string) {
  return DEV_EMAIL_LOG.get(to) ?? null;
}

let resendClient: Resend | null = null;
function getResendClient(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function isProviderConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Low-level send primitive. Prefer the higher-level template functions
 * below (sendVerificationEmail, etc.) for user-facing emails.
 */
export async function sendRawEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailSendResult> {
  const { to, subject, html, text } = params;

  if (!isProviderConfigured()) {
    // Development provider: no real inbox delivery. Logged so QA can read
    // the OTP/token from server logs, and retrievable via the protected
    // dev-only endpoint. This is NOT a mock of success — provider is
    // explicitly reported as "dev-console", not "resend".
    console.log(`[email:dev-console] to=${to} subject="${subject}"\n${text}`);
    rememberDevEmail(to, subject, html, text);
    return { ok: true, provider: "dev-console", sentAt: new Date().toISOString() };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      logger.error({ to, subject, error }, "Resend email send failed");
      return { ok: false, provider: "resend", error: error.message ?? String(error), sentAt: new Date().toISOString() };
    }

    return { ok: true, provider: "resend", providerMessageId: data?.id, sentAt: new Date().toISOString() };
  } catch (err: any) {
    logger.error({ to, subject, err: err?.message }, "Resend email send threw");
    return { ok: false, provider: "resend", error: err?.message ?? "unknown_error", sentAt: new Date().toISOString() };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function verificationEmailHtml(params: { name: string; otpCode: string; verifyUrl: string; expiresInMinutes: number }): string {
  const { name, otpCode, verifyUrl, expiresInMinutes } = params;
  const safeName = escapeHtml(name || "");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Confirme seu e-mail — extraGO</title>
</head>
<body style="margin:0;padding:0;background-color:#050b10;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050b10;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background-color:#0b141c;border-radius:20px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 0 32px;text-align:center;">
              <span style="display:inline-block;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">extra<span style="color:#00e6a8;">GO</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;text-align:center;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">Confirme seu e-mail</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#9fb0ba;">Olá${safeName ? ", " + safeName : ""}! Use o código abaixo para confirmar sua conta na extraGO.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 8px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(0,230,168,0.08);border:1px solid rgba(0,230,168,0.35);border-radius:14px;padding:16px 28px;">
                <span style="font-size:32px;font-weight:800;letter-spacing:0.18em;color:#00e6a8;">${escapeHtml(otpCode)}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 0 32px;text-align:center;">
              <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;background-color:#00e6a8;color:#00110b;font-weight:700;font-size:14px;text-decoration:none;padding:13px 28px;border-radius:12px;">Verificar e-mail</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b7b84;">Este código expira em ${expiresInMinutes} minutos.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0 32px;">
              <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
                <p style="margin:0;font-size:12px;color:#6b7b84;line-height:1.5;">
                  Por segurança, nunca compartilhe este código com ninguém. A equipe extraGO nunca solicitará seu código de verificação por telefone, WhatsApp ou e-mail.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#4d5a61;">Não foi você? Ignore este e-mail ou fale com a gente: <a href="mailto:${escapeHtml(SUPPORT_EMAIL)}" style="color:#00e6a8;text-decoration:none;">${escapeHtml(SUPPORT_EMAIL)}</a></p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#3a444a;">© ${new Date().getFullYear()} extraGO — Marketplace de Extras</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function verificationEmailText(params: { name: string; otpCode: string; verifyUrl: string; expiresInMinutes: number }): string {
  const { name, otpCode, verifyUrl, expiresInMinutes } = params;
  return [
    `Olá${name ? ", " + name : ""}!`,
    ``,
    `Seu código de verificação extraGO é: ${otpCode}`,
    ``,
    `Ou confirme por este link: ${verifyUrl}`,
    ``,
    `Este código expira em ${expiresInMinutes} minutos.`,
    `Por segurança, nunca compartilhe este código com ninguém.`,
    ``,
    `Não foi você? Ignore este e-mail ou fale com a gente: ${SUPPORT_EMAIL}`,
  ].join("\n");
}

/**
 * Sends the e-mail verification OTP using the premium extraGO template.
 * Provider is selected automatically — callers never need to know which
 * one ran. Returns the full EmailSendResult so callers can log delivery
 * timestamps and handle failures without ever assuming success.
 */
export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  otpCode: string;
  token: string;
  expiresInMinutes: number;
  appBaseUrl: string;
}): Promise<EmailSendResult> {
  const { to, name, otpCode, token, expiresInMinutes, appBaseUrl } = params;
  const verifyUrl = `${appBaseUrl.replace(/\/$/, "")}/onboarding?verifyToken=${encodeURIComponent(token)}`;

  return sendRawEmail({
    to,
    subject: "Confirme seu e-mail — extraGO",
    html: verificationEmailHtml({ name, otpCode, verifyUrl, expiresInMinutes }),
    text: verificationEmailText({ name, otpCode, verifyUrl, expiresInMinutes }),
  });
}

/**
 * Generic transactional email (password reset, etc.) — plain-text style,
 * still routed through the same provider-selection logic.
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<EmailSendResult> {
  return sendRawEmail({
    to,
    subject,
    text: body,
    html: `<p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0b141c;">${escapeHtml(body).replace(/\n/g, "<br/>")}</p>`,
  });
}

export function emailProviderStatus(): { configured: boolean; provider: "resend" | "dev-console" } {
  return { configured: isProviderConfigured(), provider: isProviderConfigured() ? "resend" : "dev-console" };
}
