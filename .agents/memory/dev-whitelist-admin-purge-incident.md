---
name: Dev-whitelist purge wiped the production CEO account
description: Why a real admin/CEO account can vanish with no error, and the two-layer fix — read before touching dev-whitelist.ts or the master-admin bootstrap in index.ts.
---

## What happened
`purgeWhitelistConflicts()` (dev-whitelist.ts) is meant to let ONE specific tester email re-register endlessly by purging their own old row first. It matched conflicts by CPF **or phone**, not just email — and CPF/phone are real personal identifiers. When the real CEO tested onboarding under a second personal email using his own real CPF/phone, the purge matched his shared CPF/phone and deleted his production `leonardoscheffel2000@gmail.com` account too (cascading through every child table). No error was raised anywhere.

On the next server restart, `seedMasterAdmin()` in `index.ts` (a startup bootstrap that runs every boot) silently re-created a bare-bones stand-in row for that email — right role/adminRole, but `accountStatus` left at the schema default `"draft"` and `emailVerifiedAt` null. The frontend's `nextOnboardingRoute()` forces any non-`"verified"` accountStatus into `/onboarding` or `/verification-center`, so the CEO could still "log in" (password matched) but got bounced into onboarding forever — looked like "lost access" with no visible error.

## Fix (two layers, both required)
1. `purgeWhitelistConflicts` now excludes `role = 'admin'` from ever being purged, regardless of email/CPF/phone match — a testing convenience must never be able to delete an admin account.
2. `seedMasterAdmin()` (index.ts) and the `/api/setup/seed` upserts (seed.ts) now explicitly set `accountStatus: "verified"` and `emailVerifiedAt` for all master admin accounts, on both the create and update path — so even if a master-admin row is ever recreated from scratch again, it can never land in an onboarding-gated state.

**Why this matters for future work:** any "dev-only" convenience that deletes/purges rows by a broad identifier (CPF, phone, IP, device id) is a latent account-deletion vector if that identifier can ever coincide with a real privileged account — always scope such purges to the exact whitelisted row's own id/email, and hard-exclude admin roles as a second safety net.
