/**
 * ═══════════════════════════════════════════════════════════
 * SMSService — provider-agnostic SMS/WhatsApp delivery.
 *
 * Provider selection is automatic and requires NO code changes:
 *   - TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER
 *     → real delivery via Twilio (SMS or WhatsApp)
 *   - None of the above → development provider:
 *       the OTP is logged to the server console AND stored
 *       in-memory so it can be retrieved via the protected
 *       dev-only endpoint (GET /api/dev/last-sms). Nothing is
 *       ever silently "pretended" as sent.
 *
 * Business/verification logic (OTP generation, expiry, retry
 * limits, audit logging) never depends on which provider is
 * active — it only calls sendSms().
 * ═══════════════════════════════════════════════════════════
 */

import { logger } from "./logger";

export type SmsSendResult = {
  ok: boolean;
  provider: "twilio" | "dev-console";
  providerMessageId?: string;
  error?: string;
  sentAt: string;
};

// ── Provider detection ──────────────────────────────────────
function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

export function smsProviderStatus(): { configured: boolean; provider: "twilio" | "dev-console" } {
  return {
    configured: isTwilioConfigured(),
    provider: isTwilioConfigured() ? "twilio" : "dev-console",
  };
}

// ── Dev-mode in-memory log ───────────────────────────────────
// Bounded map keyed by normalized phone (digits only).
// Never used in production (real provider is active there).
const DEV_SMS_LOG = new Map<string, { body: string; channel: string; sentAt: string }>();
const DEV_SMS_LOG_MAX = 200;

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function rememberDevSms(phone: string, channel: string, body: string) {
  const key = normalizePhone(phone);
  if (DEV_SMS_LOG.size >= DEV_SMS_LOG_MAX) {
    const oldest = DEV_SMS_LOG.keys().next().value;
    if (oldest) DEV_SMS_LOG.delete(oldest);
  }
  DEV_SMS_LOG.set(key, { body, channel, sentAt: new Date().toISOString() });
}

export function getDevSmsLog(phone: string) {
  return DEV_SMS_LOG.get(normalizePhone(phone)) ?? null;
}

// ── Twilio delivery ──────────────────────────────────────────
async function sendViaTwilio(
  to: string,
  channel: "sms" | "whatsapp",
  body: string
): Promise<SmsSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken  = process.env.TWILIO_AUTH_TOKEN!;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

  // Twilio WhatsApp requires "whatsapp:+1234" address format
  const fromAddr = channel === "whatsapp" ? `whatsapp:${fromNumber}` : fromNumber;
  const toAddr   = channel === "whatsapp" ? `whatsapp:${to}` : to;

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const params = new URLSearchParams({ From: fromAddr, To: toAddr, Body: body });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json() as any;

    if (!response.ok || data.status === "failed" || data.error_code) {
      const errorMsg = data.message ?? data.error_message ?? `HTTP ${response.status}`;
      logger.error({ to, channel, error: errorMsg }, "Twilio SMS send failed");
      return { ok: false, provider: "twilio", error: errorMsg, sentAt: new Date().toISOString() };
    }

    return {
      ok: true,
      provider: "twilio",
      providerMessageId: data.sid,
      sentAt: new Date().toISOString(),
    };
  } catch (err: any) {
    logger.error({ to, channel, err: err?.message }, "Twilio SMS send threw");
    return { ok: false, provider: "twilio", error: err?.message ?? "unknown_error", sentAt: new Date().toISOString() };
  }
}

// ── Main send primitive ──────────────────────────────────────
/**
 * Sends an SMS or WhatsApp message.
 * Provider is selected automatically — callers never need to know which one ran.
 */
export async function sendSmsMessage(
  to: string,
  channel: "sms" | "whatsapp",
  body: string
): Promise<SmsSendResult> {
  if (!isTwilioConfigured()) {
    // Development provider: no real delivery. Logged so QA can read
    // the OTP from server logs, and retrievable via the protected
    // dev-only endpoint. Provider is explicitly "dev-console".
    console.log(`[${channel}:dev-console] to=${to} body="${body}"`);
    rememberDevSms(to, channel, body);
    return { ok: true, provider: "dev-console", sentAt: new Date().toISOString() };
  }

  return sendViaTwilio(to, channel, body);
}
