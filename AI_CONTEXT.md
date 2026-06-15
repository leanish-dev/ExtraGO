# AI_CONTEXT.md — extraGO

> Este arquivo é lido por agentes de IA antes de qualquer alteração no projeto.
> É a camada de governança para garantir consistência entre sessões.

---

## ⚠️ LEIA PRIMEIRO — AMBIENTE MULTI-REPLIT

O projeto extraGO é desenvolvido em múltiplas contas Replit.
O proprietário realiza remixes e migrações frequentes entre contas.

**A conta Replit atual NÃO é assumida como:**
- O ambiente final de produção
- O banco de dados final de produção
- A infraestrutura permanente de hospedagem

**Agentes NÃO devem:**
- Recomendar arquitetura de deployment permanente sem declaração explícita do proprietário
- Assumir estabilidade de longo prazo da infraestrutura atual
- Tomar decisões irreversíveis de infraestrutura sem autorização explícita

**Antes de qualquer recomendação de deploy/hosting/infraestrutura, responder:**
- [ ] O proprietário declarou explicitamente que esta é a conta Replit final?
- Se a resposta for desconhecida → assuma **NÃO**.

Ver `docs/MASTER_CONTEXT.md` seção "Multi-Replit Development Policy" para regras completas.

---

## LEIA ANTES DE QUALQUER ALTERAÇÃO

### 1. Ler a documentação em `docs/`

Antes de implementar qualquer feature, alteração visual ou refatoração:

| Arquivo | Quando ler |
|---|---|
| `docs/MASTER_CONTEXT.md` | Sempre — posicionamento e visão |
| `docs/BUSINESS_MODEL.md` | Ao tocar em taxas, níveis, indicações, split engine, escrow |
| `docs/VISUAL_GUIDELINES.md` | Ao tocar em qualquer componente visual |
| `docs/TEST_DATA_POLICY.md` | Ao tocar em dados exibidos ao usuário |
| `docs/PRODUCT_ARCHITECTURE.md` | Ao adicionar rotas, módulos, schemas ou integrações |
| `docs/ROADMAP.md` | Ao planejar features ou priorizar trabalho |

---

## Identidade da extraGO

**Frase oficial:** "extraGO — A Infraestrutura de Mão de Obra do Brasil."

A extraGO **NÃO é** portal de vagas, job board nem marketplace de hospitalidade.

A extraGO **É** infraestrutura nacional: Uber Operations + LinkedIn Workforce + Stripe Financial.

---

## Regras de Dados

### Contas de Teste
```
teste.f@extrago.com  — pode ver mock data
teste.e@extrago.com  — pode ver mock data
```
Helper: `artifacts/extrag0/src/config/test-accounts.ts` → `canUseMockData(email)`

### Contas Master / Governança (NUNCA mostrar mock data)
```
leonardoscheffel2000@gmail.com  — CEO / SUPER_ADMIN
extrago.ceo@yahoo.com           — CEO Master / SUPER_ADMIN
jeandick2000@gmail.com          — CMO / SUPER_ADMIN
```
Helper: `artifacts/extrag0/src/config/master-accounts.ts` → `isMasterAccount(email)`

> **REGRA CRÍTICA:** As 3 contas acima são contas de governança. Nunca recebem dados de demo,
> seed data, mock data, estatísticas simuladas, rankings fabricados ou qualquer valor artificial.

### Regra geral
- Master → dados reais ou empty state
- Teste → pode ver mock data
- Comum → dados reais ou empty state elegante
- **NUNCA** mostrar métricas falsas, rankings inventados ou receitas fictícias a usuários comuns

---

## Política de Imagens de Perfil de Governança

As contas de governança possuem imagens de perfil oficiais permanentes.
Estas imagens fazem parte da identidade oficial da plataforma.

| Email | Arquivo de Imagem |
|---|---|
| `leonardoscheffel2000@gmail.com` | `Leonardo.jpg` |
| `jeandick2000@gmail.com` | `Jean.jpg` |

**Regras permanentes:**
- Sempre que seed, bootstrap, restauração de conta ou provisionamento de governança for executado,
  estas imagens devem ser atribuídas se disponíveis.
- Agentes devem preservar estas atribuições durante migrações, remixes, rebuilds e provisionamento.
- Estas imagens são padrão de identidade de governança — não substituir por avatares genéricos.

Ver `docs/TEST_DATA_POLICY.md` seção "Profile Asset Policy" para regras completas.

---

## Regras Técnicas Obrigatórias

### Ao alterar o modelo de negócio (taxas, níveis):
- Níveis têm 5 valores: `beginner`, `junior`, `intermediate`, `senior`, `elite`
- Switches sobre nível DEVEM cobrir todos os 5
- Verificar `docs/BUSINESS_MODEL.md` antes de alterar
- **Taxas não são hardcoded** — lidas do `platformConfigTable` via Split Engine

### Ao alterar rotas de API:
- O router está montado em `app.use("/api", router)` — rotas no router NÃO incluem `/api/`
- Após alterar `openapi.yaml`: rodar `pnpm --filter @workspace/api-spec run codegen`
- Após alterar schema DB: rodar `pnpm --filter @workspace/db run push`
- Rotas de governança usam `apiFetch` direto (não codegen) — não precisam de spec update

### Split Engine (CRÍTICO):
- `loadSplitConfig()` deve ser chamado **ANTES** do início de qualquer `db.transaction()`
- Drizzle transactions não suportam I/O assíncrono adicional de forma segura
- Após salvar governança: chamar `invalidateSplitConfigCache()` para limpar o cache de 60s
- Split Engine lê `platformConfigTable` com chaves `financial.*` e `level_fee_*`
- Toda lógica de split, taxa, comissão e referral DEVE passar pelo Split Engine

### SSE (Server-Sent Events):
- EventSource não suporta headers customizados
- Auth token via query param `?token=` nos endpoints SSE

### Auth:
- Tokens em memória no servidor — perdidos no restart
- Client armazena em `localStorage`

### Asaas Foundation:
- `artifacts/api-server/src/lib/asaas.ts` — abstraction layer preparada, todos os métodos retornam `not_implemented`
- Frontend **NUNCA** se comunica com Asaas diretamente
- Ativação só após checklist completo na governance → tab Financeiro

---

## Regras Visuais

- Landing Page aprovada = fonte da verdade visual
- Overlays: máximo 0.42 em heroes, 0.30 em seções de conteúdo
- `textShadow`: máximo `rgba(0,0,0,0.42)`
- ÚNICA navbar: `UnifiedNavbar` (= `InstitutionalNavbar`)
- Terminologia: "Extra" (não "vaga" ou "job")

---

## Proibições Absolutas

1. NÃO usar screenshots como fonte da verdade
2. NÃO solicitar screenshots repetidamente
3. NÃO reconstruir páginas inteiras sem autorização
4. NÃO alterar identidade visual aprovada
5. NÃO substituir imagens aprovadas
6. NÃO criar dashboards SaaS genéricos
7. NÃO transformar a extraGO em portal de vagas
8. NÃO usar "MARKETPLACE #1 DE HOSPITALIDADE" ou similar
9. NÃO assumir que a conta Replit atual é o ambiente de produção final
10. NÃO recomendar arquitetura de deployment permanente sem declaração explícita do proprietário
11. NÃO hardcodar taxas, percentuais de split ou comissões — sempre usar Split Engine
12. NÃO comunicar frontend diretamente com Asaas — toda integração via extraGO API

---

## Validação Obrigatória ao Finalizar

Todo trabalho deve passar por:

```bash
pnpm run typecheck   # zero erros TypeScript
pnpm run build       # build sem erros
```

Para mudanças de schema:
```bash
pnpm --filter @workspace/db run push
```

Para mudanças de API spec:
```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Estrutura do Projeto (Resumo)

```
artifacts/api-server/     — Express 5 backend (porta 8080)
  src/lib/split-engine.ts — Motor de cálculo financeiro (fonte de verdade das taxas)
  src/lib/asaas.ts        — Foundation layer para integração Asaas (stubs)
  src/lib/ecosystem.ts    — Lógica de conclusão de extras (usa Split Engine)
artifacts/extrag0/        — React 19 frontend (porta 8081)
lib/db/src/schema/        — Drizzle ORM schema (source of truth)
  categories.ts           — categoriesTable (gerenciado pela Governance)
  ledger.ts               — walletLedgerTable (audit trail de movimentações)
  escrow.ts               — escrowsTable (custódia de pagamentos, foundation)
lib/api-spec/openapi.yaml — OpenAPI spec (source of truth para API codegen)
lib/api-client-react/     — React Query hooks (gerado)
lib/api-zod/              — Zod schemas (gerado)
docs/                     — Documentação permanente
```

---

## Checkpoints Disponíveis

O Replit cria checkpoints automáticos. Em caso de regressão severa, o usuário pode fazer rollback via painel do Replit sem necessidade de git manual.
