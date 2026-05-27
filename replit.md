# extraGO — Workforce Marketplace

A workforce marketplace platform where freelancers can find work and companies can post jobs. Features role-based auth, job management, wallet/PIX withdrawals, referral system, notifications, and an admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/extrag0 run dev` — run the frontend (port 8081, external port 80)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080)
- Frontend: React 19 + Vite + Tailwind CSS 4 (port 8081)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Routing: Wouter
- State: TanStack React Query

## Where things live

- `artifacts/api-server/` — Express backend
- `artifacts/extrag0/` — React frontend
- `lib/db/src/schema/` — Drizzle ORM schema (source of truth)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod schemas

## Architecture decisions

- Custom auth: token-based (Bearer), stored in-memory on server + localStorage on client
- No external auth provider — self-contained auth in `artifacts/api-server/src/lib/auth.ts`
- No external payment integration — PIX withdrawals are manual/admin-approved DB records
- Monorepo with pnpm workspaces; `lib/` packages are shared, `artifacts/` are runnable apps
- API and frontend run on separate ports (8080/8081); frontend proxies API calls

## Product

- Freelancers browse and apply to jobs posted by companies
- Companies post jobs and manage applications
- Wallet system with PIX withdrawal requests (admin approval flow)
- Referral leaderboard and referral code validation
- In-app notifications
- Admin panel for user management, job moderation, and withdrawal approvals

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `PORT` env var must be set before starting either service (set in `.replit` workflow commands)
- `BASE_PATH` env var must be set for the frontend Vite server
- Auth tokens are in-memory only — lost on API server restart
- Always run `pnpm --filter @workspace/db run push` after schema changes
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
