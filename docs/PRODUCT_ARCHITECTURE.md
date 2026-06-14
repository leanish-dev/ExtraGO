# extraGO — PRODUCT ARCHITECTURE

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

## Módulos da Plataforma

### 1. Landing Institucional
- **Rota:** `/`
- **Propósito:** Posicionamento da marca, conversão para cadastro
- **Audiência:** Todas (pública)
- **Arquivo:** `artifacts/extrag0/src/pages/landing.tsx`

### 2. Área do Profissional (Freelancer)
- **Rota:** `/app` (dashboard freelancer)
- **Módulos:**
  - Dashboard com métricas pessoais
  - Browsing de extras disponíveis
  - Gestão de candidaturas
  - Perfil público e portfólio
  - Wallet e histórico financeiro
  - Sistema de indicações e leaderboard
  - Notificações em tempo real (SSE)
- **Arquivos:** `artifacts/extrag0/src/pages/app/`

### 3. Área da Empresa
- **Rota:** `/app` (dashboard empresa)
- **Módulos:**
  - Dashboard de contratações
  - Publicação e gestão de extras
  - Gestão de candidatos por extra
  - Wallet corporativa e depósitos
  - Perfil da empresa
  - Solicitação de depósito via PIX
- **Arquivos:** `artifacts/extrag0/src/pages/app/`

### 4. Centro Financeiro
- **Rotas:** `/financas/*`
- **Módulos:**
  - Arquitetura de receita
  - Sistema de intermediação por performance
  - Sistema de indicações (tiers e comissões)
  - Planos profissionais
  - Planos empresariais
  - Modelo de expansão nacional
  - Estrutura financeira
- **Arquivos:** `artifacts/extrag0/src/pages/financial-architecture/`

### 5. Centro Nacional de Operações (Admin)
- **Rota:** `/admin`
- **Páginas:**
  1. Dashboard — visão geral do ecossistema
  2. Usuários — gestão e moderação
  3. Extras — moderação de publicações
  4. Saques — aprovação de withdrawals PIX
  5. Analytics — métricas do ecossistema
  6. Operações (Ops) — health check do sistema
  7. Mapa Nacional — geolocalização da rede
  8. Representantes — gestão da rede regional
- **Arquivos:** `artifacts/extrag0/src/pages/admin/`

### 6. Sistema de Reputação
- Avaliações bilaterais (empresa → freelancer, freelancer → empresa)
- Histórico de extras concluídos
- Score de reputação por usuário
- **Schema:** `lib/db/src/schema/ratings.ts`

### 7. Sistema de Níveis
- 5 níveis: Iniciante → Júnior → Intermediário → Sênior → Elite
- Chaves internas: `beginner`, `junior`, `intermediate`, `senior`, `elite`
- Taxa de intermediação decrescente (20% → 10%)
- Badge visual por nível (sprite system)
- **Config:** `artifacts/extrag0/src/components/level-badge.tsx`

### 8. Sistema de Indicações
- Código de indicação único por usuário
- 3 tiers de comissão: 2% / 3% / 5%
- Leaderboard nacional
- Comissão recorrente sobre extras da rede
- **Schema:** `lib/db/src/schema/` (referralCode em usersTable)

### 9. Representantes Estaduais
- Cobertura de todos os 27 estados + DF
- 5% da receita operacional distribuída por performance
- Ferramentas de gestão regional no admin
- **Rota admin:** `/admin/representatives`

### 10. Arquitetura Financeira (Páginas Institucionais)
- Páginas públicas explicando o modelo financeiro da extraGO
- Voltadas para investidores e parceiros estratégicos
- **Rota:** `/financas/`

### 11. Página de Investidores
- **Rota:** `/investidores-parceiros`
- Tese de investimento completa
- Visão 2030, mercado, diferenciais
- Estrutura de equity e captação
- **Arquivo:** `artifacts/extrag0/src/pages/investidores-parceiros.tsx`

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Express 5 (Node.js 24) |
| Database | PostgreSQL + Drizzle ORM |
| Validação | Zod (v4) + drizzle-zod |
| API Contract | OpenAPI YAML → Orval codegen |
| Roteamento | Wouter |
| Estado | TanStack React Query |
| Auth | Custom token-based (Bearer, in-memory) |
| Real-time | SSE (Server-Sent Events) com `?token=` auth |
| Monorepo | pnpm workspaces |

---

## Fluxo de Dados

```
openapi.yaml (source of truth)
    → pnpm codegen → lib/api-client-react/ (hooks)
    → pnpm codegen → lib/api-zod/ (schemas)

lib/db/src/schema/ (source of truth)
    → pnpm db:push → PostgreSQL
    → drizzle-zod → validação no backend
```

---

## Autenticação

- Tokens Bearer gerados no login e armazenados em-memória no servidor
- Client armazena em `localStorage`
- Renovação de token: re-login necessário após restart do servidor
- SSE: token via query param `?token=` (EventSource não suporta headers)
- Admin: verificação de `role === "admin"` no middleware de rota
