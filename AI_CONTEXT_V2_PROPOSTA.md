# AI_CONTEXT_V2_PROPOSTA.md — extraGO

> **Gerado em:** 13 de julho de 2026  
> **Origem:** Auditoria técnica completa (AUDITORIA_PARTE_1, PARTE_2, PARTE_3) + leitura direta do código-fonte  
> **Escopo:** Apenas arquitetura, stack, módulos, convenções e riscos técnicos confirmados.  
> Identidade de marca, governança, posicionamento e dados de contas pertencem a `docs/MASTER_CONTEXT.md` e `docs/TEST_DATA_POLICY.md` — não duplicados aqui.

---

## ⚠️ LEIA ANTES DE QUALQUER ALTERAÇÃO

### Documentação obrigatória por tipo de trabalho

| Arquivo | Quando ler |
|---|---|
| `docs/MASTER_CONTEXT.md` | Sempre — identidade, posicionamento, Multi-Replit Policy |
| `docs/BUSINESS_MODEL.md` | Ao tocar em taxas, níveis, indicações, split engine, escrow |
| `docs/VISUAL_GUIDELINES.md` | Ao tocar em qualquer componente visual |
| `docs/TEST_DATA_POLICY.md` | Ao tocar em dados, dashboards ou analytics |
| `docs/PRODUCT_ARCHITECTURE.md` | Ao adicionar rotas, módulos, schemas ou integrações |
| `docs/ROADMAP.md` | Ao planejar features ou priorizar trabalho |
| `docs/AGENT_START_HERE.md` | Primeiro documento a ler em qualquer sessão nova |

---

## 1. Arquitetura Atual Confirmada

### Visão geral

Monorepo TypeScript gerenciado com **pnpm workspaces**. Três artefatos principais:

```
artifacts/api-server/   ← Backend (REST API)
artifacts/extrag0/      ← Frontend (SPA)
artifacts/mockup-sandbox/ ← Servidor de preview de componentes (design)
```

Bibliotecas compartilhadas:

```
lib/db/                 ← @workspace/db — schema Drizzle + pool PostgreSQL
lib/api-spec/           ← openapi.yaml + Orval config
lib/api-client-react/   ← Hooks TanStack Query (GERADOS — nunca editar)
lib/api-zod/            ← Schemas Zod (GERADOS — nunca editar)
```

### Fluxo de request

```
Frontend (porta 5000) → fetch → Backend (porta 8080)
  → app.use("/api", router)  ← prefixo /api já aplicado aqui
  → requireAuth / requireAdmin / requireCEO
  → Route handler → Drizzle ORM → PostgreSQL 16
```

### Fluxo de startup do backend

```
[Startup api-server]
  → Valida PORT (obrigatório — lança erro se ausente)
  → cors() sem restrição de origem [RISCO — ver §7]
  → json limit 15MB
  → app.use("/api", router) com 20 módulos de rotas
  → app.listen(port)
  → waitForDatabase() — 10 tentativas, 1.5s cada
  → seedMasterAdmin() — cria/repara leonardoscheffel2000@gmail.com
      ↳ Se conta não existe: INSERT com level="elite" (não "diamond")
      ↳ Se existe: UPDATE apenas role/adminRole/isVerified/accountStatus/emailVerifiedAt
      ↳ NÃO atualiza level, passwordHash, avatarUrl, referralCode
  → cleanExpiredSessions()
  → [dev] fs.watch em seed.ts / auth.ts para avisar build stale
```

---

## 2. Stack Atual (Confirmado por auditoria)

| Categoria | Tecnologia | Versão / Observação |
|---|---|---|
| Linguagem | TypeScript | ~5.9.3 |
| Runtime | Node.js | 20 (definido em replit.nix) |
| Backend | Express | ~4.x (NÃO Express 5) |
| Frontend | React | 19.1.0 |
| Build frontend | Vite | ^7.3.2 |
| Bundler backend | esbuild | 0.27.3 — ignora erros de tipo |
| Gerenciador de pacotes | pnpm | 9+ |
| ORM | Drizzle ORM | ^0.45.2 |
| Banco de dados | PostgreSQL | 16 — Replit managed |
| Auth | Token Bearer | sessionsTable no banco — 30 dias — SHA-256 com salt fixo (não bcrypt) |
| UI | Radix UI + shadcn/ui + Tailwind CSS | ^4.1.14 |
| Estado de servidor | TanStack Query | ^5.90.21 — staleTime 30s |
| Roteamento frontend | Wouter | ^3.3.5 |
| Validação backend | Zod | v4 (3.25.76) |
| Geração de tipos API | Orval | openapi.yaml → hooks e schemas Zod |
| Animação | Framer Motion | ^12.23.24 |
| Logging | Pino + pino-http | Logging estruturado — mas console.log coexiste em vários arquivos |
| Rate limiting | In-memory custom | Zera no restart — não distribuído |
| Email | Resend | RESEND_API_KEY necessária — console fallback em dev |
| SMS | Twilio | TWILIO_* necessário — stub/simulado sem keys |
| Pagamentos | Asaas | Foundation only — todos os métodos retornam `not_implemented` |
| Push | Web Push / VAPID | VAPID_* necessário — subscriptions em platform_config |
| Realtime | SSE | Token via `?token=` query param (EventSource não suporta headers) |
| Geocoding | Nominatim/OpenStreetMap | Externo, sem chave, sem SLA |
| Testes | **AUSENTE** | Zero arquivos *.test.ts ou *.spec.ts |
| Lint | **AUSENTE** | Prettier instalado, sem script de execução |
| CI/CD | **AUSENTE** | Nenhum pipeline configurado |

---

## 3. Estrutura Real do Projeto

```
workspace/
├── artifacts/api-server/           ← Backend Express ~4.x (porta 8080)
│   └── src/
│       ├── index.ts                ← Entrypoint: seedMasterAdmin, cleanExpiredSessions
│       ├── app.ts                  ← cors irrestrito, json 15mb, /api router
│       ├── routes/                 ← 20 módulos de rotas
│       │   ├── auth.ts             ← login, register, logout
│       │   ├── users.ts            ← perfil, listagem, rating
│       │   ├── jobs.ts             ← CRUD de Extras
│       │   ├── applications.ts     ← candidaturas, approve, reject, complete
│       │   ├── job-execution.ts    ← check-in/checkout, códigos de 6 dígitos
│       │   ├── wallet.ts           ← saldo, saque, depósito
│       │   ├── referrals.ts        ← leaderboard, stats, validate code
│       │   ├── notifications.ts    ← listagem, mark-read
│       │   ├── stats.ts            ← métricas públicas e por role
│       │   ├── admin.ts            ← dashboard, usuários, saques, depósitos, analytics, ops, representantes
│       │   ├── governance.ts       ← CEO-only: config, financeiro, categorias, carteira, usuários, equipe, badges
│       │   ├── kyc-admin.ts        ← review de documentos KYC [PARCIALMENTE QUEBRADO]
│       │   ├── verification.ts     ← OTP email/phone, legal, KYC docs
│       │   ├── feed.ts             ← posts, likes, saves
│       │   ├── chat.ts             ← conversas, mensagens, SSE
│       │   ├── profile-sections.ts ← categorias, experiência, habilidades
│       │   ├── categories.ts       ← listagem pública de categorias
│       │   ├── push.ts             ← subscriptions VAPID
│       │   ├── seed.ts             ← POST /api/setup/seed [SEM AUTH — RISCO CRÍTICO]
│       │   └── setup.ts            ← POST /api/setup/admin [SEM AUTH — RISCO CRÍTICO]
│       └── lib/
│           ├── split-engine.ts     ← Motor financeiro (fonte de verdade das taxas)
│           ├── ecosystem.ts        ← completeJobCascade (usa Split Engine)
│           ├── asaas.ts            ← Foundation layer Asaas (todos stubs — não ativo)
│           ├── auth.ts             ← requireAuth, requireAdmin, requireCEO, hashPassword
│           ├── verification.ts     ← lógica de OTP e KYC
│           ├── dev-whitelist.ts    ← purgeUserById (apenas dev) [contém PII versionada]
│           ├── notifications.ts    ← createNotification helper
│           ├── rate-limit.ts       ← in-memory rate limiter
│           └── legal-documents.ts  ← 9 documentos legais [CNPJ placeholder]
│
├── artifacts/extrag0/              ← Frontend React 19 + Vite (porta 5000)
│   └── src/
│       ├── App.tsx                 ← 33 rotas, ProtectedRoute, AuthProvider
│       ├── pages/
│       │   ├── landing.tsx         ← / (pública, copy hardcoded)
│       │   ├── blog.tsx            ← /blog (hardcoded — sem CMS)
│       │   ├── onboarding.tsx      ← /onboarding (8 passos)
│       │   ├── investidores-parceiros.tsx ← /investidores-parceiros
│       │   ├── financial-architecture/ ← 7 páginas institucionais hardcoded
│       │   ├── app/
│       │   │   ├── dashboard.tsx   ← /app/dashboard (empresa + admin; acessível a freelancer via URL direta)
│       │   │   ├── career.tsx      ← /app/career (exclusivo freelancer; thresholds hardcoded)
│       │   │   ├── jobs.tsx        ← /app/jobs
│       │   │   ├── post-job.tsx    ← /app/jobs/new
│       │   │   ├── job-detail.tsx  ← /app/jobs/:id
│       │   │   ├── applications.tsx
│       │   │   ├── wallet.tsx
│       │   │   ├── referrals.tsx   ← thresholds hardcoded — diverge de platformConfigTable
│       │   │   ├── feed.tsx
│       │   │   ├── network.tsx
│       │   │   ├── profile.tsx
│       │   │   ├── freelancer-profile.tsx
│       │   │   ├── company-profile.tsx
│       │   │   ├── chat.tsx        ← SSE com fallback por polling
│       │   │   ├── notifications.tsx
│       │   │   └── settings.tsx
│       │   └── admin/
│       │       ├── index.tsx       ← dashboard admin
│       │       ├── users.tsx
│       │       ├── jobs.tsx
│       │       ├── withdrawals.tsx
│       │       ├── analytics.tsx   ← full-table scan sem paginação
│       │       ├── ops.tsx
│       │       ├── map.tsx
│       │       ├── representatives.tsx
│       │       ├── kyc.tsx         ← QUEBRADO (correction_requested enum inválido)
│       │       └── governance.tsx  ← 7 tabs CEO-only
│       ├── components/
│       │   ├── level-badge.tsx     ← sprite-based badge system
│       │   ├── referral-simulator.tsx ← componente compartilhado (landing + app)
│       │   └── unified-navbar.tsx  ← ÚNICA navbar do sistema (= InstitutionalNavbar)
│       ├── config/
│       │   ├── test-accounts.ts    ← canUseMockData() — 4 emails hardcoded
│       │   └── master-accounts.ts  ← isMasterAccount() — 4 emails hardcoded
│       ├── hooks/
│       │   └── use-auth.tsx        ← AuthProvider, useAuth
│       └── lib/
│           └── api-fetch.ts        ← fetch com Authorization: Bearer <token>
│
├── artifacts/mockup-sandbox/       ← Preview de componentes (design — Vite)
│
├── lib/db/                         ← @workspace/db
│   ├── src/
│   │   ├── index.ts                ← exporta pool, db, todos os schemas
│   │   └── schema/                 ← 16 arquivos — SOURCE OF TRUTH DO BANCO
│   │       ├── users.ts            ← levelEnum: bronze/silver/gold/elite/diamond
│   │       ├── jobs.ts             ← jobStatusEnum: 10 estados
│   │       ├── job-events.ts       ← jobEventTypeEnum: 17 tipos
│   │       ├── job-codes.ts        ← jobCodeTypeEnum: 4 tipos
│   │       ├── applications.ts
│   │       ├── wallet.ts
│   │       ├── notifications.ts
│   │       ├── ratings.ts
│   │       ├── messages.ts
│   │       ├── sessions.ts
│   │       ├── representatives.ts
│   │       ├── config.ts           ← platformConfigTable (chave-valor jsonb)
│   │       ├── categories.ts       ← categoriesTable (gerenciado pela Governança)
│   │       ├── ledger.ts           ← walletLedgerTable [estrutura ok — não populada]
│   │       ├── escrow.ts           ← escrowsTable [estrutura ok — zero uso em rotas]
│   │       └── verification.ts     ← 12 tabelas de KYC/verificação
│   └── dist/schema/                ← DESATUALIZADO — não contém job-events.d.ts nem job-codes.d.ts
│       └── index.d.ts              ← ⚠️ causa dos 15 erros TypeScript atuais
│
├── lib/api-spec/
│   └── openapi.yaml                ← Source of truth para codegen (~40% das rotas)
│
├── lib/api-client-react/           ← Hooks gerados pelo Orval (nunca editar)
├── lib/api-zod/                    ← Schemas Zod gerados (nunca editar)
├── docs/                           ← Documentação permanente
└── scripts/
```

---

## 4. Módulos Implementados

### Backend — 20 módulos de rota

| Módulo | Rota(s) | Status |
|---|---|---|
| auth | /auth/login, /register, /logout, /me | ✅ Funcional |
| users | /users/:id, /users/freelancers, /users/companies | ✅ Funcional |
| jobs | /jobs CRUD | ✅ Funcional |
| applications | /applications CRUD, approve, reject, complete | ✅ Funcional |
| job-execution | /jobs/:id/generate-checkin, validate-checkin, validate-checkout | ⚠️ Parcial (15 TS errors por dist desatualizado) |
| wallet | /wallet/me, /withdraw, /deposit-request | ⚠️ Parcial (sem gateway Asaas) |
| referrals | /referrals/me, /leaderboard, /validate | ✅ Funcional |
| notifications | /notifications, /mark-read | ✅ Funcional |
| stats | /stats/platform, /stats/freelancer/:id, /stats/company/:id | ✅ Funcional (endpoints /stats/platform e /stats/activity-feed públicos) |
| admin | /admin/users, /jobs, /withdrawals, /deposit-requests, /analytics, /ops, /representatives | ✅ Funcional |
| governance | /admin/governance/* (7 sub-rotas) | ✅ Funcional (CEO-only) |
| kyc-admin | /admin/kyc/* | 🔴 Quebrado (correction_requested inválido no enum) |
| verification | /auth/verify-*, /legal/*, /kyc/documents | ⚠️ Parcial |
| feed | /feed, /posts/* | ✅ Funcional |
| chat | /chat/conversations, /messages, /sse | ✅ Funcional |
| profile-sections | /profile/categories, /experience, /skills | ✅ Funcional |
| categories | /categories | ✅ Funcional |
| push | /push/subscribe, /unsubscribe | ⚠️ Parcial (VAPID keys necessárias) |
| seed | POST /api/setup/seed | 🔴 Sem autenticação |
| setup | POST /api/setup/admin, GET /api/setup/status | 🔴 Sem autenticação |

### Banco de Dados — 35 tabelas, 25 enums PostgreSQL

**Tabelas ativas (com rotas que escrevem dados):**
users, wallets, sessions, jobs, job_events, job_codes, applications, transactions, deposit_requests, conversations, messages, notifications, ratings, user_follows, posts, post_comments, post_likes, post_saves, user_categories, work_experiences, user_skills, state_representatives, platform_config, categories, legal_documents, legal_acceptances, email_verifications, phone_verifications, kyc_documents, kyc_review_history, login_attempts, fraud_log, verification_audit_log

**Tabelas sem escrita em operações normais (estrutura pronta, sem uso ativo):**
- `wallet_ledger` — estrutura OK, `completeJobCascade` NÃO escreve nela — auditoria financeira vazia
- `escrows` — schema completo (8 status, foundation), zero rotas criando registros

### Enums PostgreSQL críticos

```typescript
// Níveis de freelancer — VALORES REAIS DO ENUM
levelEnum: "bronze" | "silver" | "gold" | "elite" | "diamond"
// Labels públicos: Iniciante / Júnior / Intermediário / Sênior / Elite
// Taxas default: 20% / 18% / 15% / 12% / 10%
// ⚠️ Sempre cobrir todos os 5 valores em switches

// Status de conta
accountStatusEnum: "draft" | "pending_email" | "pending_phone" | "pending_documents" | "pending_review" | "verified" | "rejected" | "blocked" | "inactive"
// ⚠️ "correction_requested" NÃO existe neste enum — uso em kyc-admin.ts causa bug em produção

// Status de Extra
jobStatusEnum: "open" | "scheduled" | "waiting_checkin" | "checked_in" | "in_progress" | "on_break" | "waiting_checkout" | "completed" | "cancelled" | "disputed"

// Roles
roleEnum: "company" | "freelancer" | "admin"

// adminRole — coluna TEXT (não enum PostgreSQL) — qualquer string aceita no banco
// Valores em uso: "super_admin", "admin", "finance_admin", "operations_admin", "support_admin", "regional_manager", "state_representative"

// corporateRole — coluna TEXT (não enum PostgreSQL) — qualquer string aceita no banco
// Valores em uso: "ceo", "cmo", "cco"
```

### Frontend — módulos e classificação

| Módulo | Classificação | Nota |
|---|---|---|
| Landing, Login, Cadastro | Funcional | |
| Dashboard Empresa | Funcional | |
| Minha Carreira | Funcional com limitações | Thresholds/taxas hardcoded no frontend |
| Buscar Extras, Publicar Extra, Detalhe | Funcional | |
| Candidaturas | Funcional | |
| Carteira | Parcialmente conectado | Saldo real; saque/depósito manual sem Asaas |
| Indicações | Funcional com limitações | Thresholds hardcoded; leaderboard com anomalia de ordenação |
| Feed, Rede, Perfil, Chat, Notificações, Configurações | Funcional | |
| Centro de Verificação / KYC | Parcialmente conectado | request-documents quebrado (enum inválido) |
| Admin Dashboard, Usuários, Extras, Representantes | Funcional | |
| Admin Analytics, Ops | Funcional com limitações | Full-table scan sem paginação |
| Admin Mapa | Visual | Dados reais de texto, sem GPS real |
| Admin Saques, Depósitos | Parcialmente conectado | Aprovação manual sem Asaas |
| Admin KYC | 🔴 Quebrado | correction_requested inválido no enum PostgreSQL |
| Governança (7 tabs) | Funcional (CEO-only) | wallet_ledger lido mas não populado |
| Execução de Extra (check-in/out) | Parcialmente conectado | Erros TS no backend por dist desatualizado |
| Blog | Hardcoded | Sem CMS — artigos não editáveis sem deploy |
| Financial Architecture (7 páginas) | Hardcoded intencional | Conteúdo institucional |
| Asaas Integration | Documentado sem implementação | Todos os métodos retornam `not_implemented` |
| Escrow | Implementado sem uso | Schema pronto, zero rotas |
| Wallet Ledger (auditoria) | Implementado sem escrita | Estrutura pronta, completeJobCascade não escreve |
| Push Notifications | Parcialmente conectado | VAPID keys necessárias |

---

## 5. Integrações Atuais

| Integração | Status | Chave/Config necessária | Detalhe |
|---|---|---|---|
| **Asaas** (pagamentos) | ❌ Foundation only | ASAAS_API_KEY (ainda não configurada) | `enabled: false`, todos os métodos retornam `not_implemented`. Ativação requer checklist completo em Governance → tab Financeiro |
| **Resend** (email) | ✅ Wired | RESEND_API_KEY (status no Replit não confirmado) | `email-service.ts` — fallback para console em dev |
| **Twilio** (SMS/WhatsApp) | ✅ Wired | TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER | `sms-service.ts` — stub se keys ausentes |
| **Push / VAPID** | ✅ Wired | VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY | Subscriptions em `platform_config` (multipropósito) |
| **Nominatim** (geocoding) | ✅ Ativo | Nenhuma | OpenStreetMap externo, sem chave, sem SLA |
| **Replit PostgreSQL** | ✅ Ativo | DATABASE_URL | Pool max:10; sem migrations — apenas drizzle-kit push |
| **Object Storage** | ❌ Não integrado | — | Imagens como base64 em coluna text no banco |
| **CDN** | ❌ Não configurado | — | Assets servidos pelo Express diretamente |

### Variáveis de ambiente

| Variável | Sensível | Status confirmado |
|---|---|---|
| SESSION_SECRET | 🔴 Sim | ✅ Replit Secret configurado |
| DATABASE_URL | 🔴 Sim | ❓ Não confirmado como Replit Secret |
| RESEND_API_KEY | 🔴 Sim | ❓ Não confirmado |
| TWILIO_ACCOUNT_SID | 🔴 Sim | ❓ Não confirmado |
| TWILIO_AUTH_TOKEN | 🔴 Sim | ❓ Não confirmado |
| TWILIO_PHONE_NUMBER | 🟡 Semi | ❓ Não confirmado |
| VAPID_PUBLIC_KEY | 🟡 Público | ❓ Não confirmado |
| VAPID_PRIVATE_KEY | 🔴 Privado | ❓ Não confirmado como Secret |
| APP_BASE_URL | 🟢 Não | ❓ |
| EMAIL_FROM | 🟢 Não | ❓ |
| NODE_ENV | 🟢 Não | ❓ |
| ASAAS_API_KEY | 🔴 Sim | ❌ Ainda não configurada — necessária quando Asaas for ativado |

---

## 6. Convenções Técnicas

### Roteamento

```
app.use("/api", router)  ← prefixo /api aplicado aqui
Rotas dentro do router NÃO incluem "/api/" no path.
```

### Split Engine (CRÍTICO)

```typescript
// lib/split-engine.ts
loadSplitConfig()          // Lê platformConfigTable; cache 60s em memória
calculateSplit()           // Usa config carregado; Math.round() em centavos
calculateReferralRate()    // Tiers: 2% / 3% / 5% baseados em activeReferrals + networkExtras
invalidateSplitConfigCache() // Chamar após qualquer save de governança financeira
```

**Regra crítica:** `loadSplitConfig()` DEVE ser chamado ANTES de iniciar qualquer `db.transaction()`. Drizzle transactions não suportam I/O assíncrono adicional de forma segura. Chamar dentro da transaction causará comportamento indefinido.

**Regra crítica:** Após qualquer save de configuração de governança, chamar `invalidateSplitConfigCache()`. O cache é de 60 segundos — sem invalidação, as novas taxas só entram em vigor na próxima expiração.

**Regra absoluta:** Nenhuma taxa, percentual de split, comissão ou parâmetro financeiro pode ser hardcoded. Sempre usar `loadSplitConfig()` + `calculateSplit()` / `calculateReferralRate()`.

### SSE (Server-Sent Events)

```
EventSource não suporta headers customizados.
Auth token enviado via query param: ?token=<token>
```

### Autenticação

- Tokens armazenados na tabela `sessionsTable` no banco de dados (PostgreSQL)
- **NÃO são perdidos no restart do servidor** — persistem no banco
- Expiração: 30 dias (`expiresAt` na tabela sessions)
- Token no cliente: `localStorage["extragO_token"]`
- Hash de senha: SHA-256 com salt fixo — **vulnerável a rainbow table** (não usa bcrypt/argon2)
- `requireAuth` verifica token válido + `user.isBanned === false` — **NÃO verifica accountStatus**
- Middlewares de verificação (`requireVerifiedEmail`, `requireAccountStatus`, etc.) existem em `lib/auth.ts` mas **não estão aplicados a nenhuma rota** (Phase 2)

### Controle de acesso CEO (Governance)

```typescript
// routes/governance.ts
const CEO_EMAILS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];
// Verificação por email literal — não por campo adminRole no banco
// qaialla.exclusive@gmail.com NÃO está nesta lista → 403 na governance
```

### Asaas

```typescript
// lib/asaas.ts — abstraction layer
// Todos os métodos retornam: { success: false, error: "not_implemented" }
// O frontend NUNCA se comunica com Asaas diretamente
// Ativação: requer ASAAS_API_KEY + aprovação dos controladores de governança
```

### Imagens de perfil

- Armazenadas como Base64 Data URL em coluna `text` no banco
- Overhead de ~33% vs binário; sem CDN; sem validação de MIME no backend
- Limite total de 15MB por request (Express JSON limit)
- Imagens de governança: paths estáticos (`/team-leonardo.jpg`, `/team-jean.jpg`, `/team-qaialla.jpg`)
- Associação das imagens de governança acontece **apenas via `POST /api/setup/seed`** — o `seedMasterAdmin()` de startup NÃO define avatarUrl

### OpenAPI e Codegen

```bash
# Após mudar openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Após mudar schema do banco
pnpm --filter @workspace/db run push
```

- openapi.yaml cobre ~40% das rotas implementadas
- Rotas sem spec: governance, kyc-admin, job-execution, push, verification, feed, profile-sections, categories, chat-SSE
- Essas rotas usam `apiFetch` direto no frontend — sem codegen, sem tipagem compartilhada

### Navbar

```
ÚNICA navbar do sistema: UnifiedNavbar (= InstitutionalNavbar)
Não criar segundo sistema de navegação.
Páginas públicas sempre exibem nav pública mesmo se usuário estiver logado (effectiveUser = null em INSTITUTIONAL_PATHS).
```

### Background da área autenticada

```typescript
// App.tsx wrapper div NÃO deve ter bg-background
// AppBackground (position:fixed, z-index:0) usa /app-background.png
// bg-background em index.css é apenas fallback para body
```

### FormLabel

```
FormLabel fora de FormField context causa crash em runtime.
Usar <label> simples quando não estiver dentro de FormField.
```

### Terminologia

```
Extra / Extras        (nunca "Vaga", "Vagas", "Job", "Jobs")
Profissional          (nunca "Candidato")
Empresa               (nunca "Cliente", "Empregador")
```

---

## 7. Riscos Conhecidos (Confirmados por auditoria)

### Críticos

| # | Risco | Evidência |
|---|---|---|
| 1 | `/api/setup/seed` e `/api/setup/admin` **sem autenticação** — qualquer HTTP pode resetar contas de produção | `routes/seed.ts`, `routes/setup.ts` |
| 2 | **SHA-256 sem bcrypt** para hash de senhas — vulnerável a rainbow table com GPU moderna | `lib/auth.ts` |
| 3 | **CORS irrestrito** — `cors()` sem origin aceita qualquer domínio | `app.ts` |
| 4 | **`correction_requested` não existe em `accountStatusEnum`** — INSERT falha em produção no fluxo KYC admin | `kyc-admin.ts`, `verification.ts` |
| 5 | **Dist compilado de `lib/db` desatualizado** — `job_events.d.ts` e `job_codes.d.ts` ausentes → 15 erros TypeScript | `lib/db/dist/schema/index.d.ts` |
| 6 | **Senhas de contas de produção versionadas no código-fonte** | `routes/seed.ts`, `routes/setup.ts` |

### Altos

| # | Risco | Evidência |
|---|---|---|
| 7 | **Valores monetários em `real` (float4)** — erros de arredondamento acumulados em operações financeiras | schema inteiro — wallet.ts, jobs.ts, escrow.ts |
| 8 | **Unidade monetária inconsistente** — saque usa `< 20` (reais), depósito usa `< 5000` (centavos), frontend divide por 100 | wallet.ts, dashboard.tsx, career.tsx |
| 9 | **Sem FK constraints** — 35 tabelas sem FOREIGN KEY declarado — dados órfãos sem limpeza manual | schema inteiro |
| 10 | **20+ `.catch(() => {})` silenciosos** — erros críticos de DB (carteiras, sessões) ignorados | auth.ts, applications.ts, wallet.ts |
| 11 | **wallet_ledger não populada** — `completeJobCascade` não escreve nessa tabela — auditoria financeira formal vazia | ecosystem.ts, ledger.ts |
| 12 | **Full-table scan em `/admin/analytics`** — 5 tabelas carregadas inteiras em memória, sem WHERE | admin.ts |
| 13 | **Middlewares de verificação não aplicados** — `requireVerifiedEmail`, `requireAccountStatus`, etc. declarados mas nunca usados — qualquer token válido acessa endpoints protegidos | lib/auth.ts |
| 14 | **Taxas hardcoded em 4 locais no frontend** — career.tsx, referrals.tsx — não refletem platformConfigTable | frontend |
| 15 | **KYC files como base64 em coluna text** — crescimento ilimitado do banco | kyc_documents.fileUrl |

### Médios

| # | Risco | Evidência |
|---|---|---|
| 16 | Sem UNIQUE em `(jobId, freelancerId)` em applications — candidatura duplicada possível | applications.ts |
| 17 | Sem UNIQUE em `(jobId, raterId)` em ratings — avaliação duplicada possível | ratings.ts |
| 18 | Sem índices em campos FK (walletId, jobId, freelancerId, userId) — full-scan com crescimento | schema inteiro |
| 19 | Rate limit in-memory — não distribuído, reset no restart | lib/rate-limit.ts |
| 20 | `platform_config` multipropósito — taxas financeiras + push subscriptions + badges na mesma tabela sem namespace seguro | config.ts |
| 21 | Leaderboard de indicações: query inicial ordena por `completedJobs` (não por indicações) — pode excluir grandes indicadores | referrals.ts |
| 22 | `PUT /profile/categories` sem transação — DELETE + INSERT separados — perda de dados em falha parcial | profile-sections.ts |
| 23 | `activeFreelancers24h` usa `createdAt` como proxy (incorreto — deveria usar `lastLoginAt` ou atividade) | admin.ts |
| 24 | `Math.random()` para gerar código de 6 dígitos de check-in/checkout — não é CSPRNG | job-execution.ts |
| 25 | `/referrals/validate` sem rate limit — enumeração de códigos possível | referrals.ts |

---

## 8. Comandos de Validação

```bash
# Typecheck completo (inclui backend + frontend)
# ⚠️ ESTADO ATUAL: FALHA com 15 erros TypeScript (dist da lib/db desatualizado)
pnpm run typecheck

# Solução para os 15 erros: recompilar a lib antes do typecheck
pnpm run typecheck:libs   # compila libs (incluindo lib/db)
pnpm run typecheck        # deve zerar erros após compilação

# Build completo (typecheck primeiro, depois build)
# ⚠️ ESTADO ATUAL: FALHA porque typecheck falha antes de chegar ao esbuild
pnpm run build

# Build isolado do backend (esbuild — ignora erros de tipo, PASSA mesmo com 15 erros TS)
cd artifacts/api-server && node ./build.mjs

# Build do frontend (Vite — PASSA, 0 erros TS no frontend)
pnpm --filter @workspace/extrag0 run build

# Aplicar mudanças no schema do banco
pnpm --filter @workspace/db run push

# Regenerar hooks + schemas após mudar openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Provisionar contas de produção (sem auth — executar apenas em ambiente controlado)
# curl -X POST https://<host>/api/setup/seed
```

### Estado atual do build

| Check | Status | Detalhe |
|---|---|---|
| `pnpm run typecheck` | 🔴 FALHA | 15 erros — 5 arquivos — causa raiz: lib/db/dist desatualizado |
| `pnpm run build` (raiz) | 🔴 FALHA | Falha no typecheck antes de chegar ao esbuild |
| Build esbuild isolado (backend) | ✅ PASSA | esbuild ignora erros de tipo |
| `pnpm --filter @workspace/extrag0 run build` | ✅ PASSA | 0 erros TS no frontend |

### Distribuição dos 15 erros TypeScript (causa raiz: dist desatualizado)

| Arquivo | Erros | Causa |
|---|---|---|
| `src/routes/job-execution.ts` | 7 | jobEventsTable, jobCodesTable, waiting_checkin, waiting_checkout, updatedAt ausentes do dist |
| `src/routes/jobs.ts` | 4 | jobEventsTable, walletReservationId, updatedAt ausentes do dist |
| `src/routes/kyc-admin.ts` | 2 | "correction_requested" inválido no accountStatusEnum |
| `src/lib/verification.ts` | 1 | captureMetadata ausente do dist |
| `src/routes/verification.ts` | 1 | comparação com "correction_requested" sem sobreposição de tipos |

---

## 9. Referências para Documentação Oficial

| Documento | Caminho | Conteúdo |
|---|---|---|
| Identidade e posicionamento | `docs/MASTER_CONTEXT.md` | Visão, missão, Multi-Replit Policy, governança |
| Modelo de negócio | `docs/BUSINESS_MODEL.md` | Taxas, níveis, split, referral, representantes, wallet, Asaas |
| Guia visual | `docs/VISUAL_GUIDELINES.md` | Paleta, tipografia, overlay, navbar, backgrounds |
| Política de dados de teste | `docs/TEST_DATA_POLICY.md` | Contas master, contas teste, Profile Asset Policy |
| Arquitetura de produto | `docs/PRODUCT_ARCHITECTURE.md` | Módulos, schemas, integrações, fluxo de dados |
| Roadmap | `docs/ROADMAP.md` | Status atual, gaps antes de produção financeira, fases |
| Onboarding de agentes | `docs/AGENT_START_HERE.md` | Checklist por tipo de trabalho, gotchas críticos |
| Schema do banco | `lib/db/src/schema/` | Source of truth de todas as tabelas e enums |
| Contrato da API | `lib/api-spec/openapi.yaml` | Source of truth para codegen (~40% das rotas) |
| Auditoria técnica completa | `AUDITORIA_PARTE_1.md`, `AUDITORIA_PARTE_2.md`, `AUDITORIA_PARTE_3.md` | 20 etapas, 20 contradições catalogadas, Top 20 descobertas |

---

## APÊNDICE — Relatório de Auditoria do AI_CONTEXT.md Anterior

### Metodologia

Cada afirmação do AI_CONTEXT.md original foi confrontada com:
1. Código-fonte direto (schema, routes, lib)
2. Saída de comandos executados na auditoria (tsc, build)
3. Auditorias PARTE_1, PARTE_2, PARTE_3

### Classificação linha por linha

| Seção | Afirmação | Classificação | Evidência / Correção |
|---|---|---|---|
| Multi-Replit | Política completa de ambiente multi-Replit | ✅ CONFIRMADO ATUAL | Consistente com MASTER_CONTEXT.md |
| Docs — tabela de leitura | Tabela de documentos em docs/ | ✅ CONFIRMADO ATUAL | Todos os arquivos existem em docs/ |
| Identidade extraGO | "Uber Operations + LinkedIn + Stripe" | HISTÓRICO ÚTIL | Pertence ao MASTER_CONTEXT.md — não duplicar aqui |
| Contas de teste (teste.f e teste.e) | Emails e helper canUseMockData() | ✅ CONFIRMADO ATUAL | routes/feed.ts, routes/users.ts confirmam |
| Contas master (3 emails) | leonardoscheffel2000, extrago.ceo, jeandick | ✅ CONFIRMADO ATUAL | CEO_EMAILS em governance.ts confirmado |
| Imagens de perfil — Leonardo.jpg e Jean.jpg | Filenames citados como "Leonardo.jpg" e "Jean.jpg" | ⚠️ ALTERADO | Paths reais em seed.ts são "/team-leonardo.jpg" e "/team-jean.jpg". Qaialla também tem "/team-qaialla.jpg" — não mencionada aqui |
| Política de imagens | Regras de atribuição durante seed | HISTÓRICO ÚTIL | Pertence ao TEST_DATA_POLICY.md; informação técnica relevante: seedMasterAdmin() NÃO define avatarUrl |
| Níveis — "beginner, junior, intermediate, senior, elite" | Keys internas dos níveis | 🔴 INCORRETO | Enum real: bronze, silver, gold, elite, diamond. Esse era o erro mais crítico do documento anterior (Auditoria §11.3, §20.1 item 1) |
| Express route prefix (/api) | app.use("/api", router) | ✅ CONFIRMADO ATUAL | app.ts confirmado |
| Codegen após openapi.yaml | pnpm --filter @workspace/api-spec run codegen | ✅ CONFIRMADO ATUAL | package.json confirmado |
| DB push após schema | pnpm --filter @workspace/db run push | ✅ CONFIRMADO ATUAL | lib/db/package.json confirmado |
| Governance routes: apiFetch direto | Não precisam de spec update | ✅ CONFIRMADO ATUAL | Confirmado por auditoria §11.2 |
| Split Engine: loadSplitConfig() antes de db.transaction() | Drizzle não suporta I/O adicional em tx | ✅ CONFIRMADO ATUAL | lib/split-engine.ts confirmado |
| Split Engine: invalidateSplitConfigCache() após save | Cache de 60s | ✅ CONFIRMADO ATUAL | lib/split-engine.ts confirmado |
| Split Engine: lê platformConfigTable com financial.* e level_fee_* | Chaves de config | ✅ CONFIRMADO ATUAL | lib/split-engine.ts confirmado |
| SSE: auth via ?token= | EventSource sem headers | ✅ CONFIRMADO ATUAL | routes/chat.ts confirmado |
| Auth: "Tokens em memória no servidor — perdidos no restart" | Persistência de tokens | 🔴 INCORRETO | Tokens estão na sessionsTable no banco PostgreSQL — NÃO são perdidos no restart (Auditoria §19.10, §20.1 item 14). Cleanup ocorre via cleanExpiredSessions() a cada 6h |
| Asaas: todos os métodos retornam not_implemented | Stubs | ✅ CONFIRMADO ATUAL | lib/asaas.ts confirmado |
| Frontend nunca comunica com Asaas | Isolamento de integração | ✅ CONFIRMADO ATUAL | Sem chamadas a Asaas no frontend |
| Overlays: máx 0.42 em heroes, 0.30 em seções | Valores de overlay | ⚠️ ALTERADO | institutional-overlay-rules.md define: overlay max 0.55, textShadow max rgba(0,0,0,0.42), vignette max rgba(0,0,0,0.38) |
| ÚNICA navbar: UnifiedNavbar | Sistema de navegação | ✅ CONFIRMADO ATUAL | components/unified-navbar.tsx confirmado |
| Terminologia: "Extra" | Nomenclatura | ✅ CONFIRMADO ATUAL | terminology-extra.md, AGENT_START_HERE.md |
| Proibições 1-8 (brand/produto) | Regras de identidade | HISTÓRICO ÚTIL | Pertencem ao MASTER_CONTEXT.md — não duplicar |
| Proibições 9-10 (Replit/deploy) | Política Multi-Replit | HISTÓRICO ÚTIL | Pertencem ao MASTER_CONTEXT.md |
| Proibições 11-12 (técnicas: hardcode taxas, Asaas frontend) | Regras técnicas | ✅ CONFIRMADO ATUAL — mantidas nas convenções técnicas deste documento | |
| Validação: pnpm run typecheck | Comando | ✅ CONFIRMADO ATUAL com ressalva | Estado atual: FALHA com 15 erros. Correto após recompilar lib/db |
| Validação: pnpm run build | Comando | ✅ CONFIRMADO ATUAL com ressalva | Estado atual: FALHA (typecheck quebra antes do esbuild) |
| Estrutura do projeto — "Express 5 backend" | Versão do Express | ⚠️ INCORRETO | Auditoria §SEÇÃO 4 confirma Express ~4.x, não Express 5 |
| Estrutura do projeto — "porta 8081" para frontend | Porta do frontend | ⚠️ ALTERADO | Workflow config: PORT=5000. Porta 8081 não confirmada em nenhum arquivo |
| Schema: categories.ts, ledger.ts, escrow.ts | Arquivos do schema | ✅ CONFIRMADO ATUAL | lib/db/src/schema/ confirmado |
| Libs geradas: api-client-react, api-zod | Arquivos gerados | ✅ CONFIRMADO ATUAL | Gerados pelo Orval |
| Checkpoints Replit | Funcionalidade da plataforma | ✅ CONFIRMADO ATUAL | Plataforma Replit |

### Regras removidas (pertenciam a outro documento)

As seguintes seções foram **removidas** do AI_CONTEXT porque pertencem a `docs/MASTER_CONTEXT.md` ou `docs/TEST_DATA_POLICY.md` e não devem ser duplicadas:

- Seção "Identidade da extraGO" completa
- Regra geral de dados mock (master → real, teste → mock, comum → real) — pertence ao TEST_DATA_POLICY.md
- Política de imagens de perfil de governança — pertence ao TEST_DATA_POLICY.md
- Proibições absolutas 1-10 de caráter de marca/posicionamento/deploy — pertencem ao MASTER_CONTEXT.md

### Regras corrigidas

1. **Keys de nível** — de `beginner/junior/intermediate/senior/elite` para `bronze/silver/gold/elite/diamond`
2. **Auth tokens** — de "em memória, perdidos no restart" para "na sessionsTable (banco PostgreSQL), persistentes"
3. **Express versão** — de "Express 5" para "Express ~4.x"
4. **Porta do frontend** — de "porta 8081" para "porta 5000"
5. **Paths das imagens de governança** — de "Leonardo.jpg / Jean.jpg" para "/team-leonardo.jpg / /team-jean.jpg / /team-qaialla.jpg"
6. **Valores de overlay** — atualizados conforme institutional-overlay-rules.md

### Regras mantidas (sem alteração)

Todas as convenções técnicas confirmadas foram mantidas: Express route prefix, Split Engine (ordem de chamada, invalidação de cache, proibição de hardcode), SSE auth, Asaas isolamento, codegen e push commands, navbar única, terminologia Extra/Profissional/Empresa, proibições de hardcode financeiro e de comunicação direta com Asaas.
