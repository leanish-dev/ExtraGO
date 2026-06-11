---
name: Progression & referral tiers
description: extraGO's 5-tier level/fee system and 3-tier referral commission — the value table, the key≠label trap, and where switches must cover all cases.
---

# Level progression (5 tiers)

Source of truth: `artifacts/api-server/src/lib/ecosystem.ts` (`LEVEL_FEE`, `LEVEL_THRESHOLDS`, `LEVEL_LABELS`, `calculateLevel`, `getLevelProgress`).

**Internal DB enum key ≠ user-facing label.** This is the #1 trap — the labels were re-pointed but the enum keys were never renamed (renaming would break existing rows/auth).

| key (DB enum) | label (UI)     | fee | net (você fica) | threshold (jobs / rep) |
|---------------|----------------|-----|------------------|------------------------|
| bronze        | Iniciante      | 20% | 80%              | 0   / —    |
| silver        | Júnior         | 18% | 82%              | 20  / 4.5  |
| gold          | Intermediário  | 15% | 85%              | 100 / 4.7  |
| elite         | Sênior         | 12% | 88%              | 300 / 4.8  |
| diamond       | Elite          | 10% | 90%              | 600 / 4.9  |

**Why diamond was ADDED, not a rename:** a 5th tier was needed but the existing 4 enum values are persisted on every user row and referenced by auth. So `diamond` is a brand-new enum value (+ DB migration) and the *labels* shifted (old "elite"→"Sênior", new top "diamond"→"Elite"). Do NOT "fix" the apparent key/label mismatch by renaming keys.

**How to apply — switches/maps on `level` MUST cover all 5 keys.** Any `["gold","elite"].includes(level)` style allowlist, `levelMap`, `LEVEL_META`, `FEE_MAP`, badge map, glow/`=== "elite"` check, etc. silently mishandles `diamond` if it's omitted. Past miss: the counter-offer gate in `applications.ts` excluded diamond (the top tier) from a privilege. Top-tier glow / "max level" checks must compare against `"diamond"`, not `"elite"`.

# Referral commission (3 tiers)

Replaces the old flat 3%. Computed live from network stats in `referralRate()` (ecosystem.ts) and surfaced via `/referrals/me` (`tier`, `commissionRate`, `activeReferrals`, `networkExtras`).

| tier        | rate | condition |
|-------------|------|-----------|
| Base        | 2%   | default |
| Pro         | 3%   | ≥25 active referrals AND ≥100 network extras |
| Embaixador  | 5%   | ≥100 active AND ≥1000 network AND `users.ambassadorApproved` (DB-backed, admin-granted) |

The 5% Embaixador tier is gated on the `ambassadorApproved` boolean column — it cannot be reached by volume alone. `requireAuth` attaches the raw DB user, so `ambassadorApproved` is available in route handlers (not stripped by `formatUser`).

# Consistency checklist when touching fees/tiers

Values must stay identical across: ecosystem.ts (backend math), admin.ts (feesByLevel/levelDistribution), referrals.ts, and frontend display in profile.tsx, dashboard.tsx, referrals.tsx, network.tsx, admin/analytics.tsx, level-badge.tsx, plus public pages modelo-de-negocio.tsx, investidores-parceiros.tsx, financial-architecture/performance.tsx. Grep for any stale `18%/16%/14%` fee or flat `0.03` referral before declaring done.
