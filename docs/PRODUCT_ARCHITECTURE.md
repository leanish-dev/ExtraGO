# extraGO — PRODUCT ARCHITECTURE

---

## Objetivo

Documentar a arquitetura completa da plataforma extraGO: frontend, backend, banco de dados, módulos de produto, fluxos de dados e integrações. Este documento é a referência técnica e de produto para qualquer trabalho de desenvolvimento.

---

## Visão Geral

A extraGO é composta por camadas interconectadas que formam a infraestrutura completa de mão de obra.

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING INSTITUCIONAL                │
│              Posicionamento, Proposta, CTA              │
└─────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌──────────────┐   ┌──────────────────┐   ┌──────────────┐
│   ÁREA DO    │   │   ÁREA DA        │   │   PÁGINA DE  │
│ PROFISSIONAL │   │   EMPRESA        │   │ INVESTIDORES │
└──────────────┘   └──────────────────┘   └──────────────┘
         ↓                    ↓
┌─────────────────────────────────────────────────────────┐
│         SPLIT ENGINE + WALLET LEDGER + ESCROW           │
│         Motor Financeiro — Todas as Taxas Passam Aqui   │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│              CENTRO FINANCEIRO (Wallets + PIX)          │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│         CENTRO NACIONAL DE OPERAÇÕES (Admin)            │
│              + CEO GOVERNANCE CENTER                    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│         ASAAS FOUNDATION (infraestrutura futura)        │
│         Foundation only — stubs — não ativo             │
└─────────────────────────────────────────────────────────┘
```

---

## Stack Técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | React 19, Tailwind 4 |
| Backend | Express | Express 5, Node.js 24 |
| Database | PostgreSQL + Drizzle ORM | — |
| Validação | Zod + drizzle-zod | zod/v4 |
| API Contract | OpenAPI YAML → Orval codegen | — |
| Roteamento | Wouter | — |
| Estado remoto | TanStack React Query | — |
| Auth | Custom token Bearer (in-memory) | — |
| Real-time | SSE (Server-Sent Events) | — |
| Monorepo | pnpm workspaces | — |
| Build | esbuild (CJS bundle) | — |

---

## Estrutura do Monorepo

```
/
├── artifacts/
│   ├── api-server/          ← Backend Express (porta 8080)
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── auth.ts          ← Auth Bearer tokens
│   │       │   ├── ecosystem.ts     ← completeJobCascade (usa Split Engine)
│   │       │   ├── split-engine.ts  ← Motor financeiro (fonte de verdade das taxas)
│   │       │   └── asaas.ts         ← Asaas foundation layer (stubs)
│   │       └── routes/      ← todos os endpoints
│   ├── extrag0/             ← Frontend React (porta 8081, ext 80)
│   │   └── src/
│   │       ├── components/  ← componentes reutilizáveis
│   │       ├── config/      ← test-accounts, master-accounts
│   │       ├── hooks/       ← hooks customizados
│   │       └── pages/       ← páginas da aplicação
│   └── mockup-sandbox/      ← Servidor de previews de componentes
├── lib/
│   ├── api-spec/            ← openapi.yaml (source of truth da API)
│   ├── api-client-react/    ← hooks gerados pelo Orval
│   ├── api-zod/             ← schemas Zod gerados pelo Orval
│   └── db/
│       └── src/schema/      ← schema Drizzle (source of truth do DB)
└── docs/                    ← Documentação permanente do projeto
```

---

## Rotas da API (Backend)

| Arquivo | Prefixo | Descrição |
|---|---|---|
| `auth.ts` | `/api/auth` | Login, logout, registro, sessão |
| `users.ts` | `/api/users` | Perfil, listagem, verificação |
| `jobs.ts` | `/api/jobs` | CRUD de extras, busca, filtros |
| `applications.ts` | `/api/applications` | Candidaturas, aprovação, rejeição |
| `wallet.ts` | `/api/wallet` | Saldo, transações, saques, depósitos |
| `referrals.ts` | `/api/referrals` | Leaderboard, código, rede |
| `notifications.ts` | `/api/notifications` | Listagem, marcar como lido |
| `feed.ts` | `/api/feed` | SSE — notificações em tempo real |
| `admin.ts` | `/api/admin` | Dashboard, moderação, gestão |
| `stats.ts` | `/api/stats` | Métricas do ecossistema |
| `health.ts` | `/api/health` | Health check da API |
| `profile-sections.ts` | `/api/profile-sections` | Portfólio, seções do perfil |
| `chat.ts` | `/api/chat` | Mensagens entre usuários |
| `governance.ts` | `/api/admin/governance/*` | CEO Governance Center — todos os endpoints abaixo |
| `setup.ts` | `/api/setup/admin` | Admin bootstrap (dev only) — idempotente |
| `seed.ts` | `/api/setup/seed` | Provisionamento das 5 contas aprovadas (dev only) — sem dados de ecossistema |

### Endpoints de Governança (`routes/governance.ts`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/governance/config` | Configurações de taxas e thresholds (nivel/referral) |
| PUT | `/api/admin/governance/config` | Salvar configurações + invalida cache Split Engine |
| GET | `/api/admin/governance/financial` | Configuração financeira completa (split rates, escrow, saque, Asaas) |
| PUT | `/api/admin/governance/financial` | Salvar configuração financeira + invalida cache Split Engine |
| GET | `/api/admin/governance/categories` | Listar categorias (com opção de incluir arquivadas) |
| POST | `/api/admin/governance/categories` | Criar categoria |
| PUT | `/api/admin/governance/categories/:id` | Atualizar categoria |
| DELETE | `/api/admin/governance/categories/:id` | Arquivar categoria (soft-delete) |
| PUT | `/api/admin/governance/categories/reorder` | Reordenar categorias por displayOrder |
| GET | `/api/admin/governance/platform-wallet` | Métricas da wallet da plataforma + transações recentes |
| GET | `/api/admin/governance/ledger` | Entradas do ledger paginadas (com filtro por tipo) |
| GET | `/api/admin/governance/admins` | Listar usuários admin |
| POST | `/api/admin/governance/users/:id/promote` | Promover usuário (adminRole/corporateRole) |
| GET | `/api/admin/governance/users/:id/overrides` | Overrides de governança de um usuário |
| PUT | `/api/admin/governance/users/:id/overrides` | Salvar overrides (customFee, customReferralRate, notes) |
| GET | `/api/admin/governance/overrides` | Listar todos os usuários com overrides ativos |
| POST | `/api/admin/governance/badges/grant` | Conceder badge a usuário |
| DELETE | `/api/admin/governance/badges/:id` | Remover badge |
| GET | `/api/admin/governance/badges` | Listar todos os badges concedidos |

> **REGRA TÉCNICA CRÍTICA:** `app.use("/api", router)` — o Express já prefixia com `/api`. Rotas dentro do router NÃO devem incluir `/api/` no path.

> **REGRA DE CODEGEN:** Endpoints de governança usam `apiFetch` direto no frontend — não requerem atualização do `openapi.yaml` para funcionar.

---

## Schema do Banco de Dados

Localização: `lib/db/src/schema/`

| Arquivo | Tabela | Descrição |
|---|---|---|
| `users.ts` | `usersTable` | Usuários, roles, nível, referralCode, customFee, customReferralRate, governanceNotes |
| `jobs.ts` | `jobsTable` | Extras publicados pelas empresas |
| `applications.ts` | `applicationsTable` | Candidaturas de freelancers |
| `wallet.ts` | `walletsTable` + `transactionsTable` | Saldo (4 tipos), transações, tipos de wallet (freelancer/company/platform) |
| `sessions.ts` | `sessionsTable` | Tokens de autenticação |
| `notifications.ts` | `notificationsTable` | Notificações in-app |
| `ratings.ts` | `ratingsTable` | Avaliações bilaterais |
| `messages.ts` | `messagesTable` | Mensagens entre usuários |
| `representatives.ts` | `representativesTable` | Representantes estaduais |
| `config.ts` | `platformConfigTable` | Configurações da plataforma + badges + parâmetros financeiros (chaves `financial.*`) |
| `categories.ts` | `categoriesTable` | Categorias de extras — gerenciadas pela Governance |
| `ledger.ts` | `walletLedgerTable` | Ledger de dupla entrada — audit trail de movimentações |
| `escrow.ts` | `escrowsTable` | Custódia de pagamentos — foundation (ainda não ativo no fluxo) |
| `index.ts` | — | Re-exporta todos os schemas |

### Detalhes das novas tabelas

#### `categoriesTable`
- `id`, `name`, `slug` (unique), `description`, `icon`, `status` (active/archived), `displayOrder`, `rules` (jsonb), `createdAt`, `updatedAt`, `createdBy`
- `categoryStatusEnum`: `active | archived`

#### `walletLedgerTable`
- `id`, `debitWalletId`, `creditWalletId`, `amount`, `type`, `referenceType`, `referenceId`, `description`, `metadata` (jsonb), `createdAt`, `createdBy`
- Projetado como ledger de dupla entrada — cada crédito tem um débito correspondente

#### `escrowsTable`
- `id`, `jobId`, `applicationId`, `companyWalletId`, `freelancerWalletId`, `platformWalletId`
- Valores calculados: `grossAmount`, `platformFeeAmount`, `referralFeeAmount`, `representativeFeeAmount`, `reserveFundAmount`, `netFreelancerAmount`
- Snapshots de taxas: `feeRateSnapshot`, `referralRateSnapshot`, `representativeRateSnapshot`
- Status (`escrowStatusEnum`): `draft | open | funded | in_progress | completed | released | cancelled | disputed`
- Timestamps: `fundedAt`, `inProgressAt`, `completedAt`, `releasedAt`, `cancelledAt`
- Asaas: `asaasChargeId`, `asaasTransferId` (preenchidos quando Asaas for ativado)
- `metadata` (jsonb), `disputeReason`

---

## Split Engine (`artifacts/api-server/src/lib/split-engine.ts`)

Motor único de cálculo financeiro. Toda taxa, comissão e split passa por aqui.

### Interfaces exportadas

```typescript
SplitConfig      // Configuração completa de parâmetros financeiros
SplitResult      // Resultado detalhado da divisão de um extra
```

### Funções exportadas

```typescript
loadSplitConfig(): Promise<SplitConfig>
// Lê platformConfigTable, cache 60s. CHAMAR ANTES DE DB TRANSACTION.

calculateSplit(config, grossAmount, level, referralRate, repRate): SplitResult
// Calcula divisão completa: platform fee, referral, representative, reserve, freelancer net

calculateReferralRate(config, activeReferrals, networkExtras, approved): number
// Determina tier e taxa do indicador

invalidateSplitConfigCache(): void
// Chamado após save de governança

referralTierLabel(config, rate): string
// Label legível do tier de indicação

DEFAULT_SPLIT_CONFIG: SplitConfig
// Valores padrão (fallback quando platformConfigTable não tem a chave)
```

### Chaves em `platformConfigTable` lidas pelo Split Engine

```
level_fee_bronze / silver / gold / elite / diamond
referral_rate_indicador / agente / embaixador
financial.representative_rate
financial.investor_rate
financial.reserve_fund_rate
financial.referral_thresholds   (jsonb)
financial.escrow_rules          (jsonb)
financial.withdrawal_rules      (jsonb)
financial.asaas_config          (jsonb)
```

---

## Asaas Foundation (`artifacts/api-server/src/lib/asaas.ts`)

Abstraction layer para futura integração com Asaas (infraestrutura de pagamentos).

**Status atual:** Foundation only — todos os métodos retornam `{ ok: false, errorCode: "not_implemented" }`.

### Arquitetura mandatória

```
Frontend → extraGO API → Business Rules → Split Engine → AsaasService
```

O frontend **nunca** acessa Asaas diretamente. Toda comunicação é intermediada.

### Exportações

```typescript
AsaasService           // Classe principal com todos os métodos
getAsaasService()      // Singleton — instância compartilhada
refreshAsaasInstance() // Atualizar config após mudança de governança
```

### Config injetada em runtime

Config vem do `loadSplitConfig()` → campo `asaasConfig`. Ajustável via Governance Center → tab Financeiro.

---

## CEO Governance Center (`/admin/governance`)

Painel de controle exclusivo para as 3 contas de governança (CEO/CMO/SUPER_ADMIN).

### 7 Tabs

| Tab | Rota interna | Descrição |
|---|---|---|
| **Config** | `activeTab === "config"` | Taxas por nível + comissões de indicação + thresholds de progressão. Sliders com lock por seção. Confirmação antes de salvar. |
| **Financeiro** | `activeTab === "financial"` | Split de representante/investidor/reserva; configuração de escrow (toggle + horas); regras de saque (mínimo, prazo); status Asaas (read-only). |
| **Categorias** | `activeTab === "categories"` | CRUD de categorias de extras. Soft-archive. Campos: nome, slug (auto), ícone, descrição, ordem. |
| **Carteira** | `activeTab === "wallet"` | Métricas da wallet da plataforma (saldo, taxas coletadas, comissões pagas, saques pendentes). Ledger paginado. |
| **Usuários** | `activeTab === "users"` | Overrides por usuário: customFee, customReferralRate, governanceNotes. Busca por usuário. |
| **Equipe** | `activeTab === "team"` | Listagem de admins. Promoção de usuários. |
| **Badges** | `activeTab === "badges"` | Badges predefinidos (Fundador, Investidor, etc.) + grants. Stored como `badge:{userId}:{name}` em platformConfigTable. |

### Acesso

Verificado por email no frontend e no backend via middleware `requireCEO`:
```
leonardoscheffel2000@gmail.com
extrago.ceo@yahoo.com
jeandick2000@gmail.com
```

### Estrutura Administrativa Completa

| Nome | Email | Cargo Institucional | corporateRole |
|---|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO & Founder | `ceo` |
| Jean Dick | `jeandick2000@gmail.com` | CMO & Co-Founder | `cmo` |
| Qaialla Pereira | `qaialla.exclusive@gmail.com` | CCO & Co-Founder | `cco` |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO Master | `ceo` |

> **Nota de UX:** A navbar exibe o `corporateRole` como badge colorido (CEO=dourado, CMO=ciano, CCO=índigo) em vez de "Super Admin". Widths automáticas via `inline-flex`.

---

## `ecosystem.ts` — Fluxo de Conclusão de Extra

`completeJobCascade()` é a função crítica que executa quando um extra é concluído.

### Ordem de execução (CRÍTICO)

```typescript
// 1. Carregar configuração ANTES da transação (async I/O não seguro dentro de tx)
const splitCfg = await loadSplitConfig();

// 2. Executar toda a lógica dentro da DB transaction
const result = await db.transaction(async (tx) => {
  // 2a. Verificar saldo da empresa
  // 2b. Buscar dados do freelancer
  // 2c. Calcular taxa usando splitCfg.platformFeeByLevel[level]
  // 2d. Movimentar wallets (empresa → freelancer − taxa → plataforma)
  // 2e. Calcular comissão de indicação usando calcRefRate(splitCfg, ...)
  // 2f. Creditar comissão na wallet do indicador
  // 2g. Atualizar status da aplicação e do job
  // 2h. Criar notificações
  // 2i. Verificar progressão de nível do freelancer
});
```

---

## Módulos de Produto

### 1. Landing Institucional
- **Rota:** `/`
- **Propósito:** Posicionamento da marca, conversão para cadastro
- **Arquivo:** `artifacts/extrag0/src/pages/landing.tsx`

### 2. Área do Profissional (Freelancer)
- **Rota base:** `/app`

| Página | Arquivo | Descrição |
|---|---|---|
| Dashboard | `dashboard.tsx` | Métricas pessoais, nível, histórico |
| Extras | `jobs.tsx` + `feed.tsx` | Browse de extras disponíveis |
| Candidaturas | `applications.tsx` | Status das candidaturas |
| Perfil | `profile.tsx` | Perfil público e portfólio |
| Wallet | `wallet.tsx` | Saldo, saques, transações |
| Indicações | `referrals.tsx` | Rede, leaderboard, comissões |
| Notificações | `notifications.tsx` | Centro de notificações |
| Carreira | `career.tsx` | Progressão de nível |
| Chat | `chat.tsx` | Mensagens |
| Configurações | `settings.tsx` | Conta, preferências |

### 3. Área da Empresa
- **Rota base:** `/app`

| Página | Arquivo | Descrição |
|---|---|---|
| Dashboard | `dashboard.tsx` | Métricas de contratação |
| Publicar Extra | `post-job.tsx` | Criação de extra |
| Extras | `jobs.tsx` | Gestão dos extras publicados |
| Perfil da Empresa | `company-profile.tsx` | Perfil corporativo |
| Wallet | `wallet.tsx` | Depósitos PIX, histórico |
| Candidatos | `job-detail.tsx` | Gestão de candidatos por extra |

### 4. Centro Financeiro (Páginas Públicas Institucionais)
- **Rota base:** `/financas/`

| Página | Arquivo | Descrição |
|---|---|---|
| Estrutura de Receita | `revenue-structure.tsx` | Camadas de receita da extraGO |
| Planos Profissionais | `professional-plans.tsx` | Planos para freelancers |
| Planos Empresariais | `business-plans.tsx` | Planos corporativos |
| Indicações | `referrals.tsx` | Tiers e comissões |
| Performance | `performance.tsx` | Sistema de níveis |
| Modelo de Expansão | `expansion-model.tsx` | Representantes estaduais |
| Representantes | `state-representatives.tsx` | Detalhes por estado |

### 5. Centro Nacional de Operações (Admin)
- **Rota base:** `/admin`

| Página | Rota | Arquivo | Descrição |
|---|---|---|---|
| Dashboard | `/admin` | `index.tsx` | Visão geral do ecossistema |
| Usuários | `/admin/users` | `users.tsx` | Gestão e moderação de usuários |
| Extras | `/admin/jobs` | `jobs.tsx` | Moderação de publicações |
| Saques | `/admin/withdrawals` | `withdrawals.tsx` | Aprovação de withdrawals PIX |
| Analytics | `/admin/analytics` | `analytics.tsx` | Métricas do ecossistema |
| Operações | `/admin/ops` | `ops.tsx` | Health check do sistema |
| Mapa Nacional | `/admin/map` | `map.tsx` | Geolocalização da rede |
| Representantes | `/admin/representatives` | `representatives.tsx` | Gestão da rede regional |
| CEO Governance | `/admin/governance` | `governance.tsx` | 7 tabs: Config, Financeiro, Categorias, Carteira, Usuários, Equipe, Badges |

> **Nota:** O painel admin possui 9 páginas. Gráficos usam barras CSS-only — sem biblioteca recharts.

### 6. Página de Investidores
- **Rota:** `/investidores-parceiros`
- **Arquivo:** `artifacts/extrag0/src/pages/investidores-parceiros.tsx`

### 7. Páginas Públicas Auxiliares

| Página | Rota | Arquivo |
|---|---|---|
| Login | `/login` | `login.tsx` |
| Cadastro | `/register` | `register.tsx` |
| Blog | `/blog` | `blog.tsx` |
| Modelo de Negócio | `/modelo-de-negocio` | `modelo-de-negocio.tsx` |
| Segurança | `/seguranca` | `seguranca.tsx` |
| Não encontrado | — | `not-found.tsx` |

---

## Sistema de Autenticação

- Tokens Bearer gerados no login
- Armazenados em memória no servidor + `localStorage` no cliente
- Tokens perdidos em restart do servidor → usuário precisa re-logar
- SSE: token via query param `?token=` (EventSource não suporta headers customizados)
- Admin: middleware verifica `role === "admin"` nas rotas protegidas
- Governance: middleware adicional `requireCEO` verifica email exato nas 3 contas
- Roles disponíveis: `freelancer`, `company`, `admin`

---

## Fluxo de Dados

```
openapi.yaml (source of truth da API)
    → pnpm codegen → lib/api-client-react/ (React Query hooks)
    → pnpm codegen → lib/api-zod/ (schemas Zod)

lib/db/src/schema/ (source of truth do DB)
    → pnpm db:push → PostgreSQL
    → drizzle-zod → validação no backend

platformConfigTable (fonte de verdade das taxas em runtime)
    → loadSplitConfig() → SplitConfig (cache 60s)
    → calculateSplit() / calculateReferralRate()
    → completeJobCascade() (usa config carregada antes da tx)
```

### Regras de codegen
- Sempre rodar `pnpm --filter @workspace/api-spec run codegen` após mudar `openapi.yaml`
- Sempre rodar `pnpm --filter @workspace/db run push` após mudar schemas do DB
- Nunca editar arquivos em `lib/api-client-react/` ou `lib/api-zod/` diretamente — são gerados
- **Excepção:** Endpoints de governança usam `apiFetch` direto — não precisam de codegen

---

## Variáveis de Ambiente Obrigatórias

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Sim (auto-provisionado pelo Replit) |
| `PORT` | Porta do servidor | Sim (definido no comando do workflow) |
| `BASE_PATH` | Caminho base do Vite (frontend) | Sim (frontend) |
| `ASAAS_API_KEY` | Chave da API Asaas | Não (apenas quando Asaas for ativado) |

> **NOTA MULTI-REPLIT:** Estas variáveis precisam ser reconfiguradas em cada conta Replit
> para onde o projeto for migrado. `DATABASE_URL` em particular aponta para o banco
> da conta atual — não é portável entre contas automaticamente.

---

## Diretrizes Permanentes

- `openapi.yaml` é a fonte de verdade da API — mudanças na API começam aqui
- `lib/db/src/schema/` é a fonte de verdade do banco — mudanças no DB começam aqui
- `platformConfigTable` é a fonte de verdade das taxas em runtime — Split Engine lê daqui
- Nunca editar arquivos gerados pelo Orval diretamente
- O Express prefixia `/api` — rotas no router não repetem `/api/`

---

## Regras Obrigatórias

1. Toda nova rota de API deve ser documentada no `openapi.yaml` antes de implementar (exceto governance que usa `apiFetch`)
2. Todo novo campo no banco deve estar no schema Drizzle + rodar `db:push`
3. SSE usa `?token=` query param — não headers
4. Roles válidas: `freelancer`, `company`, `admin` — não criar roles ad-hoc
5. Tokens de auth são in-memory — comportamento esperado perder sessão em restart
6. `loadSplitConfig()` SEMPRE antes de `db.transaction()` — nunca dentro
7. `invalidateSplitConfigCache()` após qualquer save de config de governança
8. Frontend nunca acessa Asaas diretamente — toda comunicação via extraGO API

---

## Checklist de Validação

- [ ] Nova rota está documentada no `openapi.yaml` (ou usa `apiFetch` diretamente)?
- [ ] Codegen foi rodado após mudança no spec?
- [ ] Schema do banco foi atualizado e `db:push` foi rodado?
- [ ] Nova feature usa hooks gerados pelo Orval (ou `apiFetch` para governance)?
- [ ] Rota do Express não inclui `/api/` prefix duplicado?
- [ ] SSE endpoints aceitam `?token=` para autenticação?
- [ ] Não há loops de await para queries que poderiam ser JOINs?
- [ ] `loadSplitConfig()` é chamado ANTES de qualquer `db.transaction()`?
- [ ] `invalidateSplitConfigCache()` é chamado após save de configuração financeira?
- [ ] Frontend não se comunica diretamente com Asaas?
