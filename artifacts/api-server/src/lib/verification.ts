import { Request } from "express";
import crypto from "crypto";
import { eq, and, ne, desc, isNull } from "drizzle-orm";
import {
  db,
  usersTable,
  verificationAuditLogTable,
  fraudLogTable,
  loginAttemptsTable,
  emailVerificationsTable,
  phoneVerificationsTable,
  legalDocumentsTable,
  legalAcceptancesTable,
  kycDocumentsTable,
  kycReviewHistoryTable,
  type FraudLog,
  type LegalDocument,
} from "@workspace/db";

/**
 * ═══════════════════════════════════════════════════════════
 * PHASE 1 — Auth / KYC / Legal architecture helpers.
 * These are building blocks for Phase 2 flows. None of them
 * are wired into existing login/register behavior by default,
 * so current auth flows keep working unmodified.
 * ═══════════════════════════════════════════════════════════
 */

// ── Disposable email blocking ────────────────────────────────
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

// ── Token / OTP generation ───────────────────────────────────
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export function hashSignature(payload: Record<string, unknown>): string {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function hashDocumentContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// ── Request metadata (IP / User-Agent parsing) ───────────────
export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

export function parseUserAgent(ua: string | undefined): { browser: string; operatingSystem: string; device: string } {
  const s = ua ?? "";
  let browser = "Unknown";
  if (/Edg\//.test(s)) browser = "Edge";
  else if (/Chrome\//.test(s) && !/Chromium/.test(s)) browser = "Chrome";
  else if (/Firefox\//.test(s)) browser = "Firefox";
  else if (/Safari\//.test(s) && !/Chrome/.test(s)) browser = "Safari";
  else if (/OPR\//.test(s)) browser = "Opera";

  let operatingSystem = "Unknown";
  if (/Windows/.test(s)) operatingSystem = "Windows";
  else if (/Android/.test(s)) operatingSystem = "Android";
  else if (/iPhone|iPad|iOS/.test(s)) operatingSystem = "iOS";
  else if (/Mac OS X/.test(s)) operatingSystem = "macOS";
  else if (/Linux/.test(s)) operatingSystem = "Linux";

  const device = /Mobile|Android|iPhone/.test(s) ? "Mobile" : /iPad|Tablet/.test(s) ? "Tablet" : "Desktop";

  return { browser, operatingSystem, device };
}

// ── Duplicate detection ──────────────────────────────────────
export async function findDuplicateCpf(cpf: string, excludeUserId?: number) {
  const conditions = excludeUserId
    ? and(eq(usersTable.cpf, cpf), ne(usersTable.id, excludeUserId))
    : eq(usersTable.cpf, cpf);
  const [existing] = await db.select().from(usersTable).where(conditions).limit(1);
  return existing ?? null;
}

export async function findDuplicateCnpj(cnpj: string, excludeUserId?: number) {
  const conditions = excludeUserId
    ? and(eq(usersTable.cnpj, cnpj), ne(usersTable.id, excludeUserId))
    : eq(usersTable.cnpj, cnpj);
  const [existing] = await db.select().from(usersTable).where(conditions).limit(1);
  return existing ?? null;
}

export async function findDuplicatePhone(phone: string, excludeUserId?: number) {
  const conditions = excludeUserId
    ? and(eq(usersTable.phone, phone), ne(usersTable.id, excludeUserId))
    : eq(usersTable.phone, phone);
  const [existing] = await db.select().from(usersTable).where(conditions).limit(1);
  return existing ?? null;
}

// ── Audit / fraud logging (append-only) ──────────────────────
export async function recordAuditLog(params: {
  userId?: number | null;
  action: string;
  details?: Record<string, unknown>;
  req?: Request;
}): Promise<void> {
  const ipAddress = params.req ? getClientIp(params.req) : undefined;
  const userAgent = params.req?.headers["user-agent"] as string | undefined;
  await db.insert(verificationAuditLogTable).values({
    userId: params.userId ?? null,
    action: params.action,
    details: params.details ?? {},
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  }).catch(() => {});
}

export async function recordFraudLog(params: {
  userId?: number | null;
  type: FraudLog["type"];
  details?: Record<string, unknown>;
  req?: Request;
}): Promise<void> {
  const ipAddress = params.req ? getClientIp(params.req) : undefined;
  const userAgent = params.req?.headers["user-agent"] as string | undefined;
  await db.insert(fraudLogTable).values({
    userId: params.userId ?? null,
    type: params.type,
    details: params.details ?? {},
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  }).catch(() => {});
}

// ── Login attempts / rate limiting / temporary lock ──────────
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function recordLoginAttempt(params: {
  email: string;
  success: boolean;
  reason?: string;
  req?: Request;
}): Promise<void> {
  const ipAddress = params.req ? getClientIp(params.req) : undefined;
  const userAgent = params.req?.headers["user-agent"] as string | undefined;
  await db.insert(loginAttemptsTable).values({
    email: params.email,
    success: params.success,
    reason: params.reason ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  }).catch(() => {});
}

export function isAccountLocked(user: { lockedUntil: Date | null }): boolean {
  return !!user.lockedUntil && user.lockedUntil > new Date();
}

export async function registerFailedLogin(userId: number, currentFailedAttempts: number): Promise<void> {
  const nextCount = currentFailedAttempts + 1;
  const shouldLock = nextCount >= MAX_FAILED_ATTEMPTS;
  await db.update(usersTable).set({
    failedLoginAttempts: nextCount,
    lockedUntil: shouldLock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
  }).where(eq(usersTable.id, userId));
}

export async function resetFailedLogin(userId: number): Promise<void> {
  await db.update(usersTable).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
  }).where(eq(usersTable.id, userId));
}

// ── Delivery abstraction (email / SMS / WhatsApp) ────────────
/**
 * Real email delivery lives in ./email-service.ts (EmailService), which
 * automatically switches between Resend (when RESEND_API_KEY is set) and
 * a development console/log provider. Re-exported here so existing
 * callers keep working unchanged.
 */
export { sendEmail, sendVerificationEmail, emailProviderStatus, getDevEmailLog } from "./email-service";

/**
 * Sends an SMS/WhatsApp OTP via the provider-agnostic SMSService.
 * Automatically switches between Twilio (when TWILIO_* env vars are set)
 * and a development console/log provider. Re-exported here so existing
 * callers keep working unchanged.
 */
export { sendSmsMessage as sendSms, smsProviderStatus, getDevSmsLog } from "./sms-service";

// ── Email verification / password reset ──────────────────────
const EMAIL_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_RESEND_COOLDOWN_MS = 60 * 1000; // 60s

export async function createEmailVerification(params: {
  userId: number;
  email: string;
  purpose: "verify_email" | "password_reset" | "change_email";
}) {
  const [existing] = await db
    .select()
    .from(emailVerificationsTable)
    .where(and(
      eq(emailVerificationsTable.userId, params.userId),
      eq(emailVerificationsTable.purpose, params.purpose),
      isNull(emailVerificationsTable.verifiedAt),
    ))
    .orderBy(desc(emailVerificationsTable.id))
    .limit(1);

  if (existing && Date.now() - existing.lastSentAt.getTime() < EMAIL_RESEND_COOLDOWN_MS) {
    return { throttled: true as const, record: existing };
  }

  const token = generateVerificationToken();
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS);

  const [record] = await db.insert(emailVerificationsTable).values({
    userId: params.userId,
    email: params.email,
    purpose: params.purpose,
    token,
    otpCode,
    expiresAt,
    resendCount: existing ? existing.resendCount + 1 : 0,
  }).returning();

  return { throttled: false as const, record };
}

/**
 * Persists the outcome of an email-send attempt (success or failure) onto
 * its email_verifications row, so delivery status/timestamps are queryable
 * and failures are never silently swallowed.
 */
export async function recordEmailDeliveryResult(
  recordId: number,
  result: { ok: boolean; provider: string; error?: string; sentAt: string },
) {
  await db.update(emailVerificationsTable).set({
    deliveredAt: result.ok ? new Date(result.sentAt) : null,
    deliveryProvider: result.provider,
    deliveryError: result.ok ? null : (result.error ?? "unknown_error"),
  }).where(eq(emailVerificationsTable.id, recordId));
}

export async function consumeEmailVerification(params: {
  token?: string;
  otpCode?: string;
  purpose: "verify_email" | "password_reset" | "change_email";
}) {
  if (!params.token && !params.otpCode) return null;
  const condition = params.token
    ? eq(emailVerificationsTable.token, params.token)
    : eq(emailVerificationsTable.otpCode, params.otpCode!);

  const [record] = await db
    .select()
    .from(emailVerificationsTable)
    .where(and(condition, eq(emailVerificationsTable.purpose, params.purpose)))
    .orderBy(desc(emailVerificationsTable.id))
    .limit(1);

  if (!record) return { status: "not_found" as const };
  if (record.verifiedAt) return { status: "already_used" as const };
  if (record.expiresAt < new Date()) return { status: "expired" as const };

  await db.update(emailVerificationsTable)
    .set({ verifiedAt: new Date() })
    .where(eq(emailVerificationsTable.id, record.id));

  return { status: "ok" as const, record };
}

// ── Phone verification ───────────────────────────────────────
const PHONE_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PHONE_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_PHONE_ATTEMPTS = 5;

export async function createPhoneVerification(params: {
  userId: number;
  phone: string;
  channel: "sms" | "whatsapp";
}) {
  const [existing] = await db
    .select()
    .from(phoneVerificationsTable)
    .where(and(
      eq(phoneVerificationsTable.userId, params.userId),
      isNull(phoneVerificationsTable.verifiedAt),
    ))
    .orderBy(desc(phoneVerificationsTable.id))
    .limit(1);

  if (existing && Date.now() - existing.lastSentAt.getTime() < PHONE_RESEND_COOLDOWN_MS) {
    return { throttled: true as const, record: existing };
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + PHONE_CODE_TTL_MS);

  const [record] = await db.insert(phoneVerificationsTable).values({
    userId: params.userId,
    phone: params.phone,
    code,
    channel: params.channel,
    expiresAt,
  }).returning();

  return { throttled: false as const, record };
}

export async function confirmPhoneVerification(params: { userId: number; code: string }) {
  const [record] = await db
    .select()
    .from(phoneVerificationsTable)
    .where(and(eq(phoneVerificationsTable.userId, params.userId), isNull(phoneVerificationsTable.verifiedAt)))
    .orderBy(desc(phoneVerificationsTable.id))
    .limit(1);

  if (!record) return { status: "not_found" as const };
  if (record.expiresAt < new Date()) return { status: "expired" as const };
  if (record.attempts >= MAX_PHONE_ATTEMPTS) return { status: "too_many_attempts" as const };

  if (record.code !== params.code) {
    await db.update(phoneVerificationsTable)
      .set({ attempts: record.attempts + 1 })
      .where(eq(phoneVerificationsTable.id, record.id));
    return { status: "invalid" as const };
  }

  await db.update(phoneVerificationsTable)
    .set({ verifiedAt: new Date() })
    .where(eq(phoneVerificationsTable.id, record.id));

  return { status: "ok" as const, record };
}

// ── Legal documents & acceptance ─────────────────────────────
export async function getLatestPublishedDocument(type: LegalDocument["type"]) {
  const [doc] = await db
    .select()
    .from(legalDocumentsTable)
    .where(and(eq(legalDocumentsTable.type, type), eq(legalDocumentsTable.status, "published")))
    .orderBy(desc(legalDocumentsTable.publicationDate))
    .limit(1);
  return doc ?? null;
}

export async function recordLegalAcceptance(params: {
  userId: number;
  document: LegalDocument;
  req?: Request;
}) {
  const ipAddress = params.req ? getClientIp(params.req) : undefined;
  const userAgent = params.req?.headers["user-agent"] as string | undefined;
  const { browser, operatingSystem, device } = parseUserAgent(userAgent);
  const signatureHash = hashSignature({
    userId: params.userId,
    documentId: params.document.id,
    version: params.document.version,
    ipAddress,
    userAgent,
    timestamp: Date.now(),
  });

  const [record] = await db.insert(legalAcceptancesTable).values({
    userId: params.userId,
    documentId: params.document.id,
    documentType: params.document.type,
    version: params.document.version,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
    browser,
    operatingSystem,
    device,
    signatureHash,
  }).returning();

  return record;
}

// ── KYC documents ─────────────────────────────────────────────
export async function submitKycDocument(params: {
  userId: number;
  documentType: (typeof kycDocumentsTable.$inferInsert)["documentType"];
  fileUrl: string;
  captureMetadata?: string | null;
}) {
  const [previous] = await db
    .select()
    .from(kycDocumentsTable)
    .where(and(eq(kycDocumentsTable.userId, params.userId), eq(kycDocumentsTable.documentType, params.documentType)))
    .orderBy(desc(kycDocumentsTable.version))
    .limit(1);

  const [record] = await db.insert(kycDocumentsTable).values({
    userId: params.userId,
    documentType: params.documentType,
    fileUrl: params.fileUrl,
    captureMetadata: params.captureMetadata ?? null,
    version: (previous?.version ?? 0) + 1,
    status: "pending",
  }).returning();

  return record;
}

export async function reviewKycDocument(params: {
  documentId: number;
  reviewerId: number;
  action: "approved" | "rejected" | "correction_requested" | "comment";
  notes?: string;
}) {
  const [document] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.id, params.documentId)).limit(1);
  if (!document) return null;

  const statusMap: Record<string, "approved" | "rejected" | "correction_requested" | undefined> = {
    approved: "approved",
    rejected: "rejected",
    correction_requested: "correction_requested",
  };
  const nextStatus = statusMap[params.action];

  if (nextStatus) {
    await db.update(kycDocumentsTable).set({
      status: nextStatus,
      reviewerId: params.reviewerId,
      reviewNotes: params.notes ?? null,
      reviewedAt: new Date(),
    }).where(eq(kycDocumentsTable.id, params.documentId));
  }

  const [historyEntry] = await db.insert(kycReviewHistoryTable).values({
    kycDocumentId: params.documentId,
    reviewerId: params.reviewerId,
    action: params.action,
    notes: params.notes ?? null,
  }).returning();

  return { document, historyEntry, nextStatus: nextStatus ?? document.status };
}

// ── Account status machine ───────────────────────────────────
export const ACCOUNT_STATUSES = [
  "draft",
  "pending_email",
  "pending_phone",
  "pending_documents",
  "pending_review",
  "verified",
  "rejected",
  "blocked",
  "inactive",
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/**
 * Computes the next natural account status from verification flags.
 * Does not persist — callers decide when to write it (Phase 2 wiring).
 * "blocked" and "rejected" are terminal/admin-set states and are never
 * auto-computed here — they must be set explicitly by admin review.
 */
export function computeAccountStatus(user: {
  accountStatus: string;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  isBanned: boolean;
}): AccountStatus {
  if (user.accountStatus === "blocked" || user.accountStatus === "rejected" || user.isBanned) {
    return user.isBanned ? "blocked" : (user.accountStatus as AccountStatus);
  }
  if (user.accountStatus === "verified") return "verified";
  if (!user.emailVerifiedAt) return "pending_email";
  if (!user.phoneVerifiedAt) return "pending_phone";
  return "pending_documents";
}
