---
name: Multi-Replit development policy and governance documentation
description: Rules for multi-account Replit development, 3 master accounts, profile asset assignments, and seed endpoint behavior.
---

## Multi-Replit Development Policy

The extraGO project is developed across multiple Replit accounts. The owner frequently remixes and migrates between accounts.

**The current Replit account is NOT assumed to be the final production environment.**

Before making any deployment, hosting, infrastructure or production recommendations, agents must ask:
- Has the owner explicitly stated this is the final Replit account?
- If unknown → assume NO.

Until explicit declaration: assume migration remains possible. All infrastructure recommendations must consider portability.

**Why:** The owner uses Replit remixes as a development workflow. Treating the current account as permanent leads to irreversible infrastructure decisions that break on migration.

**How to apply:** Every time a prompt involves deployment, domain, database permanence, SSL, backups, or production hardening — check this rule first.

---

## Master / Governance Accounts (3 total)

All three accounts are in `MASTER_ACCOUNTS` array in `artifacts/extrag0/src/config/master-accounts.ts`:

```
leonardoscheffel2000@gmail.com  — CEO / SUPER_ADMIN
extrago.ceo@yahoo.com           — CEO Master / SUPER_ADMIN
jeandick2000@gmail.com          — CMO / SUPER_ADMIN
```

**Why jeandick2000 matters:** This account was added to master-accounts.ts but was missing from AI_CONTEXT.md, AGENT_START_HERE.md, and TEST_DATA_POLICY.md — a documentation drift that caused agents to treat it as non-master. All docs now corrected.

**How to apply:** Any mock data guard must check all 3. `isMasterAccount()` covers all 3 — use this helper, never hardcode emails.

---

## Profile Asset Policy

Official governance profile image assignments:

| Email | Image |
|---|---|
| `leonardoscheffel2000@gmail.com` | `Leonardo.jpg` |
| `jeandick2000@gmail.com` | `Jean.jpg` |

These images are part of the institutional identity of the platform. Must be preserved during:
- Seed/bootstrap execution
- Database restoration
- Account provisioning workflows
- Migrations or remixes to new Replit accounts

**Why:** Governance identity must be consistent across environments.

---

## Seed Endpoint — Current Behavior

`POST /api/setup/seed` provisions ONLY these 5 approved accounts (idempotent, no ecosystem data):
1. `leonardoscheffel2000@gmail.com` — CEO / super_admin
2. `jeandick2000@gmail.com` — CMO / super_admin
3. `extrago.ceo@yahoo.com` — CEO Master / super_admin
4. `teste.f@extrago.com` — test freelancer
5. `teste.e@extrago.com` — test company

The endpoint NEVER creates jobs, transactions, applications, ratings, notifications or any ecosystem/demo data. The old documentation claiming it did is obsolete.
