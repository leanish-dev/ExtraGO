import { Request } from "express";
import crypto from "crypto";
import { eq, and, ne } from "drizzle-orm";
import {
  db,
  usersTable,
  verificationAuditLogTable,
  fraudLogTable,
  loginAttemptsTable,
  type FraudLog,
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
