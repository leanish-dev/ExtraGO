/**
 * ═══════════════════════════════════════════════════════════
 * DEV WHITELIST — Development-only test account bypass
 *
 * When NODE_ENV !== "production", certain well-known test
 * identifiers are allowed to bypass duplicate-registration
 * guards so the full onboarding flow can be exercised
 * repeatedly without needing to manually wipe the database.
 *
 * HOW IT WORKS
 * ───────────────────────────────────────────────────────────
 * 1. On registration, if the incoming email/CPF/phone matches
 *    a whitelisted value, any existing user that holds that
 *    value is fully purged (all child records then the user
 *    row itself) before the new INSERT proceeds.
 * 2. The DB-level UNIQUE constraint is preserved — there is
 *    never a real duplicate; the old row is always removed
 *    first.
 * 3. In production (NODE_ENV === "production") NONE of this
 *    runs. isDevWhitelistActive() returns false and every
 *    exported function is a no-op.
 *
 * NEVER expose this module's behaviour to the client, and
 * never import it from production-only code paths.
 * ═══════════════════════════════════════════════════════════
 */

import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

// ── Guard ────────────────────────────────────────────────────
export function isDevWhitelistActive(): boolean {
  return process.env.NODE_ENV !== "production";
}

// ── Whitelisted test identifiers ─────────────────────────────
// Normalised: digits-only for CPF/phone, lowercase for email.
const WHITELIST_EMAILS = new Set(["leoscheffel.drosa@gmail.com"]);
const WHITELIST_CPFS   = new Set(["03970275083"]); // 039.702.750-83
const WHITELIST_PHONES = new Set(["54981433576"]);

function normaliseCpf(raw: string)   { return raw.replace(/\D/g, ""); }
function normalisePhone(raw: string) { return raw.replace(/\D/g, ""); }

export function isWhitelistEmail(email: string)  { return WHITELIST_EMAILS.has(email.toLowerCase().trim()); }
export function isWhitelistCpf(cpf: string)      { return WHITELIST_CPFS.has(normaliseCpf(cpf)); }
export function isWhitelistPhone(phone: string)  { return WHITELIST_PHONES.has(normalisePhone(phone)); }

/** Returns true if ANY of the supplied values are on the whitelist. */
export function isAnyWhitelisted(opts: { email?: string; cpf?: string; phone?: string }): boolean {
  if (!isDevWhitelistActive()) return false;
  if (opts.email && isWhitelistEmail(opts.email)) return true;
  if (opts.cpf   && isWhitelistCpf(opts.cpf))     return true;
  if (opts.phone && isWhitelistPhone(opts.phone))  return true;
  return false;
}

// ── Full purge of a user and every child record ───────────────
/**
 * Deletes a user and ALL related records across every table.
 * Each statement is executed individually because Drizzle's
 * db.execute() does not support multi-statement queries.
 * Order: deepest child tables first, user row last.
 */
async function purgeUserById(userId: number): Promise<void> {
  logger.warn({ userId }, "[dev-whitelist] Purging test user and all related records");

  const stmts: ReturnType<typeof sql>[] = [
    // kyc_review_history → kyc_documents
    sql`DELETE FROM kyc_review_history WHERE kyc_document_id IN (SELECT id FROM kyc_documents WHERE user_id = ${userId})`,
    sql`DELETE FROM kyc_documents          WHERE user_id = ${userId}`,
    sql`DELETE FROM email_verifications    WHERE user_id = ${userId}`,
    sql`DELETE FROM phone_verifications    WHERE user_id = ${userId}`,
    sql`DELETE FROM legal_acceptances      WHERE user_id = ${userId}`,
    sql`DELETE FROM verification_audit_log WHERE user_id = ${userId}`,
    sql`DELETE FROM fraud_log              WHERE user_id = ${userId}`,
    sql`DELETE FROM notifications          WHERE user_id = ${userId}`,
    sql`DELETE FROM sessions               WHERE user_id = ${userId}`,

    // posts + reactions to them
    sql`DELETE FROM post_comments WHERE post_id IN (SELECT id FROM posts WHERE user_id = ${userId})`,
    sql`DELETE FROM post_likes    WHERE post_id IN (SELECT id FROM posts WHERE user_id = ${userId})`,
    sql`DELETE FROM post_saves    WHERE post_id IN (SELECT id FROM posts WHERE user_id = ${userId})`,
    // reactions BY this user on other posts
    sql`DELETE FROM post_comments WHERE user_id = ${userId}`,
    sql`DELETE FROM post_likes    WHERE user_id = ${userId}`,
    sql`DELETE FROM post_saves    WHERE user_id = ${userId}`,
    sql`DELETE FROM posts         WHERE user_id = ${userId}`,

    sql`DELETE FROM user_follows     WHERE follower_id = ${userId} OR following_id = ${userId}`,
    sql`DELETE FROM user_categories  WHERE user_id = ${userId}`,
    sql`DELETE FROM work_experiences WHERE user_id = ${userId}`,
    sql`DELETE FROM user_skills      WHERE user_id = ${userId}`,

    // ratings as rater or rated
    sql`DELETE FROM ratings WHERE rater_id = ${userId} OR rated_id = ${userId}`,

    // applications as freelancer
    sql`DELETE FROM applications WHERE freelancer_id = ${userId}`,

    // messages / conversations
    sql`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE participant1_id = ${userId} OR participant2_id = ${userId})`,
    sql`DELETE FROM conversations WHERE participant1_id = ${userId} OR participant2_id = ${userId}`,

    // jobs posted by this company (cascade to their dependents)
    sql`DELETE FROM applications WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ${userId})`,
    sql`DELETE FROM ratings      WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ${userId})`,
    sql`DELETE FROM escrows      WHERE job_id IN (SELECT id FROM jobs WHERE company_id = ${userId})`,
    sql`DELETE FROM jobs WHERE company_id = ${userId}`,

    // wallet family
    sql`DELETE FROM transactions     WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id = ${userId})`,
    sql`DELETE FROM deposit_requests WHERE user_id = ${userId}`,
    sql`DELETE FROM deposit_requests WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id = ${userId})`,
    sql`DELETE FROM wallet_ledger    WHERE debit_wallet_id  IN (SELECT id FROM wallets WHERE user_id = ${userId}) OR credit_wallet_id IN (SELECT id FROM wallets WHERE user_id = ${userId})`,
    sql`DELETE FROM escrows          WHERE company_wallet_id IN (SELECT id FROM wallets WHERE user_id = ${userId}) OR freelancer_wallet_id IN (SELECT id FROM wallets WHERE user_id = ${userId})`,
    sql`DELETE FROM wallets WHERE user_id = ${userId}`,

    // finally the user row itself
    sql`DELETE FROM users WHERE id = ${userId}`,
  ];

  for (const stmt of stmts) {
    await db.execute(stmt);
  }

  logger.warn({ userId }, "[dev-whitelist] Purge complete");
}

/**
 * Finds any existing users that conflict with the supplied whitelist
 * values and purges them completely, then also removes orphaned
 * login_attempt rows keyed by email.
 *
 * Call this inside the registration handler BEFORE the duplicate checks
 * and the INSERT, when isDevWhitelistActive() is true.
 */
export async function purgeWhitelistConflicts(opts: {
  email?: string;
  cpf?: string;
  phone?: string;
}): Promise<void> {
  if (!isDevWhitelistActive()) return;

  const { email, cpf, phone } = opts;
  const normCpf   = cpf   ? normaliseCpf(cpf)   : null;
  const normPhone = phone ? normalisePhone(phone) : null;

  // Collect all matching user IDs (there may be more than one if a phone
  // is reused on a different email row, etc.)
  const rows = await db.execute(sql`
    SELECT id FROM users
    WHERE  (${email}::text IS NOT NULL AND email = ${email})
        OR (${normCpf}::text IS NOT NULL AND cpf = ${normCpf})
        OR (${normPhone}::text IS NOT NULL AND phone = ${normPhone})
  `);

  const ids: number[] = (rows as any).rows?.map((r: any) => Number(r.id)) ?? [];
  for (const id of ids) {
    await purgeUserById(id);
  }

  // Also wipe login_attempts keyed by this email (no user_id FK)
  if (email) {
    await db.execute(sql`DELETE FROM login_attempts WHERE email = ${email}`);
    await db.execute(sql`DELETE FROM fraud_log WHERE details->>'email' = ${email}`);
  }
}
