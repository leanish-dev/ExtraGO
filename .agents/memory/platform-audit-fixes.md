---
name: extraGO Platform Audit Fixes
description: Durable lessons from the full platform audit — what was fake, broken, or inefficient and how it was fixed
---

## Auth token persistence
The token store is in-memory (lost on server restart). Frontend now clears localStorage and re-routes to login when `useGetMe` returns 401/403. Fix is in `use-auth.tsx` via `useEffect` watching the query `error` field.

**Why:** Server restarts left stale tokens in localStorage, causing infinite loading for logged-in users.

## Shared apiFetch utility
All pages that used raw fetch (`chat`, `feed`, `network`, `profile`, `company-profile`, `freelancer-profile`) now import from `src/lib/api-fetch.ts`.

**Why:** Identical helper was copy-pasted in 6 files; auth token injection must stay consistent.

## Backend fake/random data
- `earnsByMonth` in `stats/freelancer/:id` — replaced `Math.random()` with real credit transactions from wallet
- `revenueByMonth` in `admin/stats` — replaced `Math.random()` with real credit transactions grouped by month
- `averageRating: 4.5` in `stats/company/:id` — replaced with company user's actual `reputationScore`
- `totalRevenue` in admin stats queried `commission` type (never exists) — changed to `credit` type
- `pendingWithdrawals` in admin stats — fixed to query `type='withdrawal' AND status='pending'` directly

## Job totalValue calculation
Was hardcoded `hourlyRate * workersNeeded * 8`. Now computes actual hours from `startTime`/`endTime`, defaulting to 8h if not set.

## Referrals leaderboard N+1
Was doing up to N*M DB queries (20 freelancers × their invitees × their apps). Now uses 3 batch queries with `ANY(ARRAY[...])` pattern.

## Admin bottom nav (mobile)
`getBottomTabItems` defaulted to freelancer tabs for admin role. Added admin case: Painel/Usuários/Vagas/Saques.

## Onboarding wizard
Was entirely non-functional UI with no API calls. Rewrote to be fully controlled and call `PATCH /users/:id` at each step. Uses `useUpdateUser` + `useQueryClient.invalidateQueries({ queryKey: ["me"] })`. Also changed `sessionStorage` → `localStorage` for persistent "dismissed" state.

## Broken job detail links
Dashboard used `href="/app/jobs/${job.id}"` but no `/app/jobs/:id` route exists. Changed to `/app/jobs` (the list page).

## Drizzle SQL patterns
For IN-style array queries with Drizzle, use:
`sql\`${table.col} = ANY(ARRAY[${sql.join(ids.map(id => sql\`${id}\`), sql\`, \`)}]::int[])\``
This pattern is already used in admin.ts for company lookups.
