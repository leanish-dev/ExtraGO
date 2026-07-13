---
name: Setup guard and dev-whitelist environment variables
description: How the /api/setup/* bootstrap endpoints are protected and how dev-whitelist PII is sourced, for consistency in future work.
---

## Setup endpoint protection

`POST /api/setup/seed` and `POST /api/setup/admin` are guarded by `requireSetupSecret`
middleware (`artifacts/api-server/src/lib/setup-guard.ts`), applied at the route level in
`routes/seed.ts` and `routes/setup.ts`.

Rule: if `SETUP_SECRET` is not set in the environment, the endpoint returns 403
**unconditionally, in every `NODE_ENV`** — not just production. Comparison against the
caller-supplied `x-setup-secret` header uses `crypto.timingSafeEqual` (with a length check
first, since `timingSafeEqual` throws on mismatched buffer lengths rather than returning
false). Failure responses are always the same generic message, never revealing which part
of the check failed.

**Why:** an earlier audit found these endpoints callable by anyone in any environment,
including production, with no auth. The safe default was chosen to be "always blocked
unless someone deliberately opts in by setting the secret" — this also means seeding a
fresh dev environment now requires setting `SETUP_SECRET` locally first; there is no
implicit dev-mode bypass.

**How to apply:** if adding another one-off bootstrap/ops endpoint in this family, reuse
`requireSetupSecret` rather than inventing a new gate. If you need a dev-only bypass,
that must be a deliberate, explicit decision — not a default.

## Dev-whitelist PII sourcing

`artifacts/api-server/src/lib/dev-whitelist.ts` no longer hardcodes any real email/CPF/phone.
Values come exclusively from comma-separated environment variables: `DEV_WHITELIST_EMAILS`,
`DEV_WHITELIST_CPFS`, `DEV_WHITELIST_PHONES`. Missing/empty variable → empty whitelist set
for that type (no-op), regardless of environment. The existing `isDevWhitelistActive()`
production gate (`NODE_ENV !== "production"`) is unchanged and still the primary guard for
the whole feature.

**Why:** a real CPF and a real personal email were versioned directly in source — a
critical PII leak. Moving to env vars removes the leak without touching the underlying
purge-then-insert behavior (which itself already excludes `role = "admin"` after a prior
incident wiped the real CEO account — see `dev-whitelist-admin-purge-incident.md`).

**How to apply:** never reintroduce a literal email/CPF/phone into this file. If the
whitelist needs to be populated for local testing, set the env vars via Replit Secrets/env,
not by editing the file.
