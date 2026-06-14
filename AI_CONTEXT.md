# AI_CONTEXT.md — extraGO

> Este arquivo é lido por agentes de IA antes de qualquer alteração no projeto.
> É a camada de governança para garantir consistência entre sessões.

---

## LEIA ANTES DE QUALQUER ALTERAÇÃO

### 1. Ler a documentação em `docs/`

Antes de implementar qualquer feature, alteração visual ou refatoração:

| Arquivo | Quando ler |
|---|---|
| `docs/MASTER_CONTEXT.md` | Sempre — posicionamento e visão |
| `docs/BUSINESS_MODEL.md` | Ao tocar em taxas, níveis, indicações |
| `docs/VISUAL_GUIDELINES.md` | Ao tocar em qualquer componente visual |
| `docs/TEST_DATA_POLICY.md` | Ao tocar em dados exibidos ao usuário |
| `docs/PRODUCT_ARCHITECTURE.md` | Ao adicionar rotas, módulos ou integrações |
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

### Contas Master (NUNCA mostrar mock data)
```
leonardoscheffel2000@gmail.com  — SUPER_ADMIN / CEO
extrago.ceo@yahoo.com           — SUPER_ADMIN / CEO
```
Helper: `artifacts/extrag0/src/config/master-accounts.ts` → `isMasterAccount(email)`

### Regra geral
- Master → dados reais ou empty state
- Teste → pode ver mock data
- Comum → dados reais ou empty state elegante
- **NUNCA** mostrar métricas falsas, rankings inventados ou receitas fictícias a usuários comuns

---

## Regras Técnicas Obrigatórias

### Ao alterar o modelo de negócio (taxas, níveis):
- Níveis têm 5 valores: `beginner`, `junior`, `intermediate`, `senior`, `elite`
- Switches sobre nível DEVEM cobrir todos os 5
- Verificar `docs/BUSINESS_MODEL.md` antes de alterar

### Ao alterar rotas de API:
- O router está montado em `app.use("/api", router)` — rotas no router NÃO incluem `/api/`
- Após alterar `openapi.yaml`: rodar `pnpm --filter @workspace/api-spec run codegen`
- Após alterar schema DB: rodar `pnpm --filter @workspace/db run push`

### SSE (Server-Sent Events):
- EventSource não suporta headers customizados
- Auth token via query param `?token=` nos endpoints SSE

### Auth:
- Tokens em memória no servidor — perdidos no restart
- Client armazena em `localStorage`

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
artifacts/extrag0/        — React 19 frontend (porta 8081)
lib/db/src/schema/        — Drizzle ORM schema (source of truth)
lib/api-spec/openapi.yaml — OpenAPI spec (source of truth)
lib/api-client-react/     — React Query hooks (gerado)
lib/api-zod/              — Zod schemas (gerado)
docs/                     — Documentação permanente
```

---

## Checkpoints Disponíveis

O Replit cria checkpoints automáticos. Em caso de regressão severa, o usuário pode fazer rollback via painel do Replit sem necessidade de git manual.
