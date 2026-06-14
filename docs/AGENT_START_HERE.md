# extraGO — AGENT START HERE

> **LEITURA OBRIGATÓRIA** antes de qualquer implementação neste projeto.
> Este documento é o mapa de orientação para agentes de IA trabalhando na extraGO.

---

## O que é a extraGO?

A extraGO é **a Infraestrutura de Mão de Obra do Brasil** — não um job board, não um portal de vagas, não um marketplace de hospitalidade.

É um ecossistema que conecta profissionais freelancers, empresas, representantes estaduais e investidores em uma rede nacional de trabalho eventual com reputação, progressão e pagamentos integrados.

**Leia `MASTER_CONTEXT.md` para o posicionamento completo.**

---

## Mapa de Documentação

| Documento | Quando ler | O que contém |
|---|---|---|
| `MASTER_CONTEXT.md` | **Sempre** — primeira leitura obrigatória | Visão, missão, posicionamento, tese de investimento, Visão 2030 |
| `BUSINESS_MODEL.md` | Antes de qualquer feature financeira, de nível ou indicação | Taxas, níveis, indicações, representantes, wallet, fluxos de receita |
| `VISUAL_GUIDELINES.md` | Antes de qualquer trabalho de UI/UX | Paleta, tipografia, overlay, navbar, backgrounds, terminologia |
| `TEST_DATA_POLICY.md` | Antes de trabalhar com dados, dashboards ou analytics | Mock data, contas de teste, contas master, empty states, auditorias |
| `PRODUCT_ARCHITECTURE.md` | Antes de criar rotas, componentes ou schemas | Stack, estrutura de monorepo, módulos, fluxo de dados, auth |
| `ROADMAP.md` | Antes de propor ou priorizar features | Status atual, marcos, visão de expansão, fases do produto |

---

## Regras Invioláveis

### Terminologia
| ❌ Nunca usar | ✅ Sempre usar |
|---|---|
| Vaga / Vagas / Job / Jobs | **Extra / Extras** |
| Candidato | **Profissional** ou **Freelancer** |
| Empregador / Cliente | **Empresa** |
| Marketplace de hospitalidade | **Infraestrutura de Mão de Obra** |

### Níveis de Freelancer (5 níveis — cobrir todos)
```
beginner → junior → intermediate → senior → elite
  20%        18%        15%          12%      10%
```
> Switches sobre nível DEVEM cobrir todos os 5 valores. `elite` = chave interna para o nível "Elite/Diamond".

### Contas Especiais
```ts
// MASTER: nunca veem mock data
isMasterAccount("leonardoscheffel2000@gmail.com") // true
isMasterAccount("extrago.ceo@yahoo.com") // true

// TESTE: únicas que podem ver mock data
canUseMockData("teste.f@extrago.com") // true
canUseMockData("teste.e@extrago.com") // true
```

### Gotchas Técnicos Críticos

1. **Express route prefix:** `app.use("/api", router)` já prefixia. Rotas dentro do router NÃO incluem `/api/`.
2. **SSE auth:** EventSource não suporta headers — usar `?token=` query param.
3. **AppBackground:** O wrapper do `App.tsx` NÃO deve ter `bg-background` — bloqueia a imagem de fundo.
4. **FormLabel crash:** `FormLabel` fora de `FormField` context causa crash em runtime — usar `<label>` simples.
5. **Codegen obrigatório:** Após mudar `openapi.yaml` → rodar `pnpm --filter @workspace/api-spec run codegen`. Após mudar schema DB → rodar `pnpm --filter @workspace/db run push`.
6. **Tokens in-memory:** Auth tokens são perdidos no restart do servidor — comportamento esperado.
7. **Admin seed em produção:** Endpoints `/api/setup/seed` e `/api/setup/admin` devem ser protegidos/removidos em produção.

---

## Estrutura do Projeto (Resumo)

```
artifacts/api-server/    ← Backend Express (porta 8080)
artifacts/extrag0/       ← Frontend React + Vite (porta 8081)
lib/api-spec/openapi.yaml ← Source of truth da API
lib/db/src/schema/       ← Source of truth do banco
lib/api-client-react/    ← Hooks gerados (não editar diretamente)
lib/api-zod/             ← Schemas Zod gerados (não editar diretamente)
docs/                    ← Documentação permanente (este diretório)
```

---

## Comandos Essenciais

```bash
# Iniciar API
pnpm --filter @workspace/api-server run dev

# Iniciar Frontend
pnpm --filter @workspace/extrag0 run dev

# Regenerar hooks + schemas após mudar openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Aplicar mudanças no schema do banco
pnpm --filter @workspace/db run push

# Typecheck completo
pnpm run typecheck

# Build completo
pnpm run build
```

---

## Arquivos Gerados (nunca editar diretamente)

- `lib/api-client-react/` — gerado pelo Orval a partir do `openapi.yaml`
- `lib/api-zod/` — gerado pelo Orval a partir do `openapi.yaml`

---

## Checklist Antes de Qualquer Implementação

- [ ] Li `MASTER_CONTEXT.md` e entendo o posicionamento da extraGO?
- [ ] Se for feature financeira: li `BUSINESS_MODEL.md`?
- [ ] Se for trabalho de UI: li `VISUAL_GUIDELINES.md`?
- [ ] Se for feature com dados: li `TEST_DATA_POLICY.md`?
- [ ] Se for nova rota ou schema: li `PRODUCT_ARCHITECTURE.md`?
- [ ] A terminologia que vou usar está correta (Extra, Profissional, Empresa)?
- [ ] Vou cobrir todos os 5 níveis de freelancer se houver switch de nível?
- [ ] A feature respeita os dados reais para usuários comuns (sem mock data)?

---

## Checklist Antes de Finalizar Qualquer Implementação

- [ ] A terminologia oficial foi usada em toda a UI?
- [ ] Contas master não veem mock data?
- [ ] Se nova rota: está no `openapi.yaml` + codegen rodado?
- [ ] Se novo schema de DB: `db:push` rodado?
- [ ] Empty states implementados para novos componentes com dados?
- [ ] Mobile testado (touch targets, legibilidade, scroll)?
- [ ] Nenhuma segunda navbar ou sistema de navegação paralelo foi criado?
- [ ] `ROADMAP.md` atualizado se uma feature planejada foi concluída?

---

## Contato dos Fundadores / Contas Master

| Nome | Email | Role |
|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO / SUPER_ADMIN |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO / SUPER_ADMIN |

---

> **Este documento deve ser lido no início de cada nova sessão de trabalho na extraGO.**
> Atualize-o sempre que uma regra crítica nova for descoberta ou uma decisão arquitetural importante for tomada.
