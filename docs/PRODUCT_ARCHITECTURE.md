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
│              CENTRO FINANCEIRO (Wallets + PIX)          │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│         CENTRO NACIONAL DE OPERAÇÕES (Admin)            │
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
│   │       ├── lib/         ← auth, middleware
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
| `governance.ts` | `/api/governance` | CEO Governance Center — configurações, overrides por usuário |
| `setup.ts` | `/api/setup/admin` | Admin bootstrap (dev only) — idempotente |
| `seed.ts` | `/api/setup/seed` | Provisionamento das 5 contas aprovadas (dev only) — idempotente, sem dados de ecossistema |

> **REGRA TÉCNICA CRÍTICA:** `app.use("/api", router)` — o Express já prefixia com `/api`. Rotas dentro do router NÃO devem incluir `/api/` no path. Ver `.agents/memory/express-route-prefix.md`.

---

## Schema do Banco de Dados

Localização: `lib/db/src/schema/`

| Arquivo | Tabela principal | Descrição |
|---|---|---|
| `users.ts` | `usersTable` | Usuários, roles, nível, referralCode, customFee, customReferralRate, governanceNotes |
| `jobs.ts` | `jobsTable` | Extras publicados pelas empresas |
| `applications.ts` | `applicationsTable` | Candidaturas de freelancers |
| `wallet.ts` | `walletsTable` | Saldo, reservas, pendências |
| `sessions.ts` | `sessionsTable` | Tokens de autenticação |
| `notifications.ts` | `notificationsTable` | Notificações in-app |
| `ratings.ts` | `ratingsTable` | Avaliações bilaterais |
| `messages.ts` | `messagesTable` | Mensagens entre usuários |
| `representatives.ts` | `representativesTable` | Representantes estaduais |
| `platformConfig.ts` | `platformConfigTable` | Configurações da plataforma + badges de governança |
| `index.ts` | — | Re-exporta todos os schemas |

---

## Módulos de Produto

### 1. Landing Institucional
- **Rota:** `/`
- **Propósito:** Posicionamento da marca, conversão para cadastro
- **Audiência:** Pública
- **Arquivo:** `artifacts/extrag0/src/pages/landing.tsx`
- **Destaques:** Typewriter de setores, simulador de indicações, WhatsApp CTA

### 2. Área do Profissional (Freelancer)
- **Rota base:** `/app`
- **Arquivos:** `artifacts/extrag0/src/pages/app/`
- **Módulos internos:**

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
- **Arquivos:** `artifacts/extrag0/src/pages/app/`
- **Módulos internos:**

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
- **Arquivos:** `artifacts/extrag0/src/pages/financial-architecture/`

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
- **Arquivos:** `artifacts/extrag0/src/pages/admin/`

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
| CEO Governance | `/admin/governance` | `governance.tsx` | Configurações da plataforma, overrides por usuário, badge management |

> **Nota:** O painel admin possui 9 páginas. Gráficos usam barras CSS-only — sem biblioteca recharts.

### 6. Página de Investidores
- **Rota:** `/investidores-parceiros`
- **Arquivo:** `artifacts/extrag0/src/pages/investidores-parceiros.tsx`
- **Conteúdo:** Tese de investimento, Visão 2030, equity, diferenciais, fotos da equipe

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

## Dashboards

### Dashboard do Freelancer
- Nível atual + progresso para próximo nível
- Extras candidatados / concluídos / em andamento
- Saldo disponível (wallet)
- Avaliação média
- Atividade recente da rede de indicações
- Notificações não lidas

### Dashboard da Empresa
- Extras publicados ativos
- Candidaturas recebidas (pendentes, aprovadas, rejeitadas)
- Saldo disponível para contratar
- Histórico de contratações

### Dashboard Admin
- Usuários totais / ativos / novos
- Extras totais / ativos / concluídos
- Volume financeiro (transações, saques, depósitos)
- Saques pendentes de aprovação
- Depósitos pendentes de confirmação
- Representantes ativos por estado

---

## Sistema de Autenticação

- Tokens Bearer gerados no login
- Armazenados em memória no servidor + `localStorage` no cliente
- Tokens perdidos em restart do servidor → usuário precisa re-logar
- SSE: token via query param `?token=` (EventSource não suporta headers customizados)
- Admin: middleware verifica `role === "admin"` nas rotas protegidas
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
```

### Regras de codegen
- Sempre rodar `pnpm --filter @workspace/api-spec run codegen` após mudar `openapi.yaml`
- Sempre rodar `pnpm --filter @workspace/db run push` após mudar schemas do DB
- Nunca editar arquivos em `lib/api-client-react/` ou `lib/api-zod/` diretamente — são gerados

---

## Operações Nacionais

### Representantes Estaduais
- 27 estados + DF com representante designado
- Métricas por estado rastreadas no admin
- Distribuição do Fundo de Representantes baseada em performance regional

### Centro Nacional de Operações (Admin `/admin/map`)
- Mapa do Brasil com distribuição geográfica de extras e profissionais
- Heatmap de demanda por estado/região
- Status de representantes por estado

### Health Check (`/admin/ops`)
- Status da API
- Status do banco de dados
- Status do serviço SSE
- Métricas de latência e disponibilidade

---

## Variáveis de Ambiente Obrigatórias

| Variável | Descrição | Obrigatório |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Sim (auto-provisionado pelo Replit) |
| `PORT` | Porta do servidor | Sim (definido no comando do workflow) |
| `BASE_PATH` | Caminho base do Vite (frontend) | Sim (frontend) |

> **NOTA MULTI-REPLIT:** Estas variáveis precisam ser reconfiguradas em cada conta Replit
> para onde o projeto for migrado. `DATABASE_URL` em particular aponta para o banco
> da conta atual — não é portável entre contas automaticamente.

---

## Diretrizes Permanentes

- `openapi.yaml` é a fonte de verdade da API — mudanças na API começam aqui
- `lib/db/src/schema/` é a fonte de verdade do banco — mudanças no DB começam aqui
- Nunca editar arquivos gerados pelo Orval diretamente
- O Express prefixia `/api` — rotas no router não repetem `/api/`

---

## Regras Obrigatórias

1. Toda nova rota de API deve ser documentada no `openapi.yaml` antes de implementar
2. Todo novo campo no banco deve estar no schema Drizzle + rodar `db:push`
3. SSE usa `?token=` query param — não headers
4. Roles válidas: `freelancer`, `company`, `admin` — não criar roles ad-hoc
5. Tokens de auth são in-memory — comportamento esperado perder sessão em restart

---

## Boas Práticas

- Usar hooks gerados (`lib/api-client-react/`) em vez de fetch direto
- Usar schemas Zod gerados (`lib/api-zod/`) para validação em vez de Zod manual
- Queries N+1 no backend devem usar JOINs ou batch queries — não loops de await
- Componentes que buscam dados usam React Query — não useState + useEffect manual
- Erros de API devem ser explícitos — não usar fallbacks silenciosos

---

## Restrições

- Não adicionar dependências externas de auth (Firebase, Auth0, Clerk etc.)
- Não adicionar gateway de pagamento externo — pagamentos são manuais (PIX)
- Não criar stores globais (Zustand, Redux) — usar React Query + context
- Não usar Docker ou virtualenv — Nix gerencia o ambiente no Replit

---

## Checklist de Validação

- [ ] Nova rota está documentada no `openapi.yaml`?
- [ ] Codegen foi rodado após mudança no spec?
- [ ] Schema do banco foi atualizado e `db:push` foi rodado?
- [ ] Nova feature usa hooks gerados pelo Orval?
- [ ] Rota do Express não inclui `/api/` prefix duplicado?
- [ ] SSE endpoints aceitam `?token=` para autenticação?
- [ ] Não há loops de await para queries que poderiam ser JOINs?
