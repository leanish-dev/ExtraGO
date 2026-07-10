---
name: Auth/KYC/Legal Phase 1 foundation
description: Where the verification, KYC, legal-acceptance, and account-lifecycle infrastructure lives and how it wires into login/register.
---

The `account_status` lifecycle (draft→pending_email→pending_phone→pending_documents→pending_review→verified, plus rejected/blocked/inactive) is enforced additively: `computeAccountStatus()` only auto-advances the natural pending_* chain, never touches admin-set terminal states.

**Why:** admin-set states (rejected/blocked/verified) must never be silently overwritten by a user completing an unrelated verification step.

**How to apply:** any new flow that changes a verification flag (email/phone/documents) should call the shared advance helper instead of writing `accountStatus` directly, and only when current status is one of draft/pending_email/pending_phone/pending_documents.

Email verification and password reset share one table (`email_verifications`) distinguished by a `purpose` enum column, instead of a separate reset-token table — keeps token/OTP/expiry logic in one place.

No email/SMS delivery provider is configured yet — `sendEmail`/`sendSms` in `artifacts/api-server/src/lib/verification.ts` just log the token/OTP server-side. That is the single integration point to swap in a real provider (Twilio/SendGrid/etc.) later; do not scatter delivery logic elsewhere.

KYC documents accept a `fileUrl` string (base64 data URI or path), same convention as `usersTable.avatarUrl` — no object storage integration exists in this repo yet.

Gotcha: `lib/db` ships pre-built `.d.ts` files in `dist/` used by TS project references. After adding/renaming exports in `lib/db/src/schema/*`, run `npx tsc -b --force` inside `lib/db` or downstream packages get stale "no exported member" type errors even though runtime (esbuild) works fine.

Gotcha: `drizzle-kit push` blocks non-interactively on destructive-looking confirmations (e.g. adding a unique constraint to a non-empty table) even with `--force`, because the prompt is an Ink UI needing a TTY. Workaround: apply the specific ALTER TABLE/constraint manually via `psql` first, then re-run `drizzle-kit push` for the remaining non-destructive diff.

Frontend (Phase 2): the multi-step onboarding wizard lives at `pages/onboarding.tsx` (mounted at both `/register` and `/onboarding`), with a companion `pages/verification-center.tsx` and `lib/verification-api.ts` (thin fetch wrappers, since these endpoints predate/aren't in the generated `@workspace/api-client-react`). Login redirects non-admin users by `accountStatus` via `nextOnboardingRoute()`.

**Important:** when introducing `accountStatus`, all pre-existing users in the DB had `NULL`/`draft` — they had to be bulk-backfilled to `verified` (except any genuinely new pending signup) or every legacy user gets forced back into onboarding on next login. Admins are always exempted from onboarding redirects regardless of status.
