# extraGO — AGENT START HERE

> **LEITURA OBRIGATÓRIA** antes de qualquer implementação neste projeto.
> Este documento é o mapa de orientação para agentes de IA trabalhando na extraGO.

---

## ⚠️ AVISO CRÍTICO — AMBIENTE MULTI-REPLIT

O projeto extraGO pode existir simultaneamente em múltiplas contas Replit.
O proprietário realiza remixes e migrações frequentes entre contas durante o desenvolvimento.

**Checklist obrigatório antes de qualquer recomendação de deploy, hosting ou infraestrutura:**

- [ ] O proprietário declarou explicitamente que esta é a conta Replit final?

**Se a resposta for desconhecida → assuma NÃO.**

Até que o proprietário declare explicitamente que o ambiente final de produção foi atingido:
- Não recomendar arquitetura de deployment permanente
- Não recomendar decisões irreversíveis de infraestrutura
- Não remover salvaguardas de migração
- Não assumir estabilidade de longo prazo do banco de dados atual
- Considerar possibilidade de migração futura em qualquer recomendação de backup ou domínio

Ver `docs/MASTER_CONTEXT.md` seção "Multi-Replit Development Policy" para regras completas.

---

## O que é a extraGO?

A extraGO é **a Infraestrutura de Mão de Obra do Brasil** — não um job board, não um portal de vagas, não um marketplace de hospitalidade.

É um ecossistema que conecta profissionais freelancers, empresas, representantes estaduais e investidores em uma rede nacional de trabalho eventual com reputação, progressão e pagamentos integrados.

**Leia `MASTER_CONTEXT.md` para o posicionamento completo.**

---

## Mapa de Documentação

| Documento | Quando ler | O que contém |
|---|---|---|
| `MASTER_CONTEXT.md` | **Sempre** — primeira leitura obrigatória | Visão, missão, posicionamento, tese de investimento, Visão 2030, Multi-Replit Policy |
| `BUSINESS_MODEL.md` | Antes de qualquer feature financeira, de nível, indicação, escrow ou split | Taxas, níveis, Split Engine, referral, representantes, wallet, ledger, escrow, Asaas |
| `VISUAL_GUIDELINES.md` | Antes de qualquer trabalho de UI/UX | Paleta, tipografia, overlay, navbar, backgrounds, terminologia |
| `TEST_DATA_POLICY.md` | Antes de trabalhar com dados, dashboards ou analytics | Mock data, contas de teste, contas master, empty states, Profile Asset Policy |
| `PRODUCT_ARCHITECTURE.md` | Antes de criar rotas, componentes, schemas ou integrações | Stack, monorepo, módulos, Split Engine, Asaas, fluxo de dados, auth |
| `ROADMAP.md` | Antes de propor ou priorizar features | Status atual, gaps antes de produção financeira, marcos, fases |

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
> **As taxas acima são defaults — o valor real vem do Split Engine (`loadSplitConfig()`).**

### Contas Especiais
```ts
// MASTER / GOVERNANÇA: nunca veem mock data (3 contas)
isMasterAccount("leonardoscheffel2000@gmail.com") // true — CEO
isMasterAccount("extrago.ceo@yahoo.com")          // true — CEO Master
isMasterAccount("jeandick2000@gmail.com")          // true — CMO

// TESTE: únicas que podem ver mock data (2 contas)
canUseMockData("teste.f@extrago.com") // true
canUseMockData("teste.e@extrago.com") // true
```

> **ATENÇÃO:** `jeandick2000@gmail.com` é conta de governança master — NUNCA exibir
> mock data, seed data, estatísticas simuladas ou qualquer valor artificial para esta conta.

---

## Gotchas Técnicos Críticos

1. **Express route prefix:** `app.use("/api", router)` já prefixia. Rotas dentro do router NÃO incluem `/api/`.

2. **SSE auth:** EventSource não suporta headers — usar `?token=` query param.

3. **AppBackground:** O wrapper do `App.tsx` NÃO deve ter `bg-background` — bloqueia a imagem de fundo.

4. **FormLabel crash:** `FormLabel` fora de `FormField` context causa crash em runtime — usar `<label>` simples.

5. **Codegen obrigatório:** Após mudar `openapi.yaml` → rodar `pnpm --filter @workspace/api-spec run codegen`. Após mudar schema DB → rodar `pnpm --filter @workspace/db run push`. Endpoints de governance usam `apiFetch` direto — não precisam de codegen.

6. **Tokens in-memory:** Auth tokens são perdidos no restart do servidor — comportamento esperado.

7. **Endpoints de setup em produção:** `/api/setup/seed` e `/api/setup/admin` devem ser protegidos ou removidos em produção.

8. **Split Engine — CRÍTICO:** `loadSplitConfig()` DEVE ser chamado ANTES de iniciar qualquer `db.transaction()`. Drizzle transactions não suportam I/O assíncrono adicional de forma segura. Chamar dentro da transaction causará comportamento indefinido.

9. **Invalidação de cache do Split Engine:** Após qualquer save de configuração de governança (config ou financial), chamar `invalidateSplitConfigCache()`. O cache é de 60 segundos — sem invalidação, as novas taxas só entram em vigor na próxima expiração.

10. **Taxas nunca hardcoded:** Nenhuma taxa de intermediação, comissão de indicação, ou percentual financeiro deve ser hardcoded no código. Sempre usar `loadSplitConfig()` + `calculateSplit()` / `calculateReferralRate()`.

11. **Asaas — frontend isolado:** O frontend NUNCA se comunica com Asaas diretamente. Toda integração é via extraGO API → `AsaasService`. Atualmente todos os métodos retornam `not_implemented` — não ativar sem checklist completo.

12. **Governance endpoints:** As rotas `GET/PUT /api/admin/governance/*` usam `apiFetch` direto no frontend (não codegen). O middleware `requireCEO` verifica os 3 emails exatos no backend.

---

## Estrutura do Projeto (Resumo)

```
artifacts/api-server/    ← Backend Express (porta 8080)
  src/lib/split-engine.ts ← Motor financeiro — TODA taxa passa aqui
  src/lib/asaas.ts        ← Foundation layer Asaas (stubs — não ativo)
  src/lib/ecosystem.ts    ← completeJobCascade (usa Split Engine)
artifacts/extrag0/       ← Frontend React + Vite (porta 8081)
lib/api-spec/openapi.yaml ← Source of truth da API
lib/db/src/schema/       ← Source of truth do banco
  categories.ts          ← categoriesTable
  ledger.ts              ← walletLedgerTable (audit trail)
  escrow.ts              ← escrowsTable (foundation)
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
- [ ] **Esta recomendação envolve deploy/hosting/infraestrutura? O proprietário declarou este ambiente como final?**
- [ ] Se for feature financeira: li `BUSINESS_MODEL.md`? As taxas vêm do Split Engine?
- [ ] Se for trabalho de UI: li `VISUAL_GUIDELINES.md`?
- [ ] Se for feature com dados: li `TEST_DATA_POLICY.md`?
- [ ] Se for nova rota ou schema: li `PRODUCT_ARCHITECTURE.md`?
- [ ] A terminologia que vou usar está correta (Extra, Profissional, Empresa)?
- [ ] Vou cobrir todos os 5 níveis de freelancer se houver switch de nível?
- [ ] A feature respeita os dados reais para usuários comuns (sem mock data)?
- [ ] Se `loadSplitConfig()` for necessário: está sendo chamado ANTES de `db.transaction()`?

---

## Checklist Antes de Finalizar Qualquer Implementação

- [ ] A terminologia oficial foi usada em toda a UI?
- [ ] Contas master (3 contas) não veem mock data?
- [ ] Imagens de perfil de governança preservadas (Leonardo.jpg / Jean.jpg)?
- [ ] Se nova rota: está no `openapi.yaml` + codegen rodado (ou usa `apiFetch` diretamente)?
- [ ] Se novo schema de DB: `db:push` rodado?
- [ ] Empty states implementados para novos componentes com dados?
- [ ] Mobile testado (touch targets, legibilidade, scroll)?
- [ ] Nenhuma segunda navbar ou sistema de navegação paralelo foi criado?
- [ ] `ROADMAP.md` atualizado se uma feature planejada foi concluída?
- [ ] Se há cálculo financeiro: passa pelo Split Engine (não hardcoded)?
- [ ] Se há save de configuração de governança: `invalidateSplitConfigCache()` é chamado?
- [ ] Frontend não se comunica diretamente com Asaas?

---

## Fundadores / Contas de Governança

| Nome | Email | Role | Imagem de Perfil | Controles |
|---|---|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO / SUPER_ADMIN | `Leonardo.jpg` | Split Rules, Financial Governance, Platform Wallet, Escrow Config, Category Governance, All Financial Parameters |
| Jean Dick | `jeandick2000@gmail.com` | CMO / SUPER_ADMIN | `Jean.jpg` | Split Rules, Financial Governance, Platform Wallet, Escrow Config, Category Governance, All Financial Parameters |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO Master / SUPER_ADMIN | — | Split Rules, Financial Governance, Platform Wallet, Escrow Config, Category Governance, All Financial Parameters |

Estas 3 contas têm acesso exclusivo ao CEO Governance Center (`/admin/governance`) verificado via middleware `requireCEO` no backend (email exato) e via `CEO_EMAILS` array no frontend.

---

> **Este documento deve ser lido no início de cada nova sessão de trabalho na extraGO.**
> Atualize-o sempre que uma regra crítica nova for descoberta ou uma decisão arquitetural importante for tomada.
