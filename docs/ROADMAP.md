# extraGO — PRODUCT ROADMAP

> **Status:** Documento vivo — atualizar conforme itens forem concluídos ou priorizados.
> **Última revisão:** Junho 2026

---

## Objetivo

Registrar as prioridades estratégicas do produto, marcos de expansão e visão de longo prazo. Este documento orienta decisões de priorização e garante alinhamento entre produto, tecnologia e negócio.

---

## ⚠️ Nota sobre Ambiente de Desenvolvimento

O projeto extraGO é desenvolvido em múltiplas contas Replit. O proprietário realiza remixes e migrações frequentes como parte do fluxo normal de desenvolvimento.

**Itens de roadmap relacionados a deployment, hosting e infraestrutura de produção** devem ser planejados considerando migração futura. O proprietário declarará explicitamente quando o ambiente final de produção for atingido — somente então devem ser executadas ações irreversíveis de infraestrutura.

Ver `docs/MASTER_CONTEXT.md` seção "Multi-Replit Development Policy" para regras completas.

---

## Princípios para Priorização

1. **Dados reais antes de novas features** — nenhum usuário deve ver mock data
2. **Mobile first** — maioria dos profissionais acessa via smartphone
3. **Confiança antes de funcionalidade** — reputação e pagamentos são críticos
4. **Expansão pela rede** — indicações e representantes antes de paid marketing
5. **Infraestrutura antes de features periféricas** — core sólido sustenta o flywheel

---

## Status dos Itens

| Status | Significado |
|---|---|
| ✅ Concluído | Feature implementada e validada |
| 🔄 Em progresso | Trabalho ativo em andamento |
| 📋 Planejado | Priorizado para próxima sprint |
| 🔮 Futuro | Roadmap de médio/longo prazo |
| ⏸ Pausado | Deprioritizado temporariamente |

---

## Fase 1 — Fundação (atual)

### ✅ 1. Plataforma Core
MVP completo com as funcionalidades essenciais de todos os perfis:
- Autenticação (login, cadastro, sessão)
- Área do Freelancer (dashboard, extras, candidaturas, wallet, indicações)
- Área da Empresa (dashboard, publicação de extras, gestão de candidatos, wallet)
- Admin (dashboard, usuários, extras, saques, analytics, ops, mapa, representantes, governance)
- Landing institucional com posicionamento de infraestrutura
- Página de investidores completa
- Sistema de badges de nível (sprite-based)
- Notificações SSE em tempo real
- Wallet com fluxo de depósito (empresa) e saque PIX (freelancer)

---

### ✅ 2. Identidade Visual
Refinamento da identidade visual alinhada com posicionamento de infraestrutura nacional:
- Landing page aprovada como fonte visual canônica
- UnifiedNavbar (única navbar em toda a plataforma)
- AppBackground (fundo fixo área autenticada)
- Terminologia oficial (Extra, Profissional, Empresa)
- Eliminação de overlays excessivos

---

### ✅ 3. Test Data Isolation
Política documentada e helpers implementados:
- `canUseMockData()` — isolamento de dados de demonstração
- `isMasterAccount()` — proteção de 3 contas de governança
- Contas de teste oficiais registradas (2 contas)
- Contas master oficiais registradas (3 contas: Leonardo, Jean Dick, extrago.ceo)
- Seeder reescrito para provisionar apenas 5 contas aprovadas — sem dados de ecossistema

---

### ✅ 4. Limpeza de Dados de Produção
O banco de dados foi completamente limpo. Apenas 5 contas aprovadas permanecem:
- `leonardoscheffel2000@gmail.com` (CEO)
- `jeandick2000@gmail.com` (CMO)
- `extrago.ceo@yahoo.com` (CEO Master)
- `teste.f@extrago.com` (freelancer de teste)
- `teste.e@extrago.com` (empresa de teste)

---

### ✅ 5. CEO Governance Center — Fase 1
Painel de controle executivo em `/admin/governance` com 4 tabs iniciais:
- Configurações da plataforma com sliders por seção (taxas e thresholds)
- Confirmação antes de salvar alterações
- Overrides por usuário (fee customizada, taxa de indicação, notas)
- Badge management com badges predefinidos e categorias
- Backend em `routes/governance.ts`

---

### ✅ 6. Sprint Financeiro — Split Engine, Ledger, Escrow, Asaas Foundation

Sprint completo de infraestrutura financeira implementado:

#### Split Engine (`artifacts/api-server/src/lib/split-engine.ts`)
- Motor financeiro centralizado — todas as taxas passam aqui
- Lê configurações do `platformConfigTable` (chaves `level_fee_*`, `referral_rate_*`, `financial.*`)
- Cache de 60 segundos em memória; invalidação automática após save de governança
- `loadSplitConfig()`, `calculateSplit()`, `calculateReferralRate()`, `invalidateSplitConfigCache()`
- Wired em `completeJobCascade()` — carregado ANTES da DB transaction
- Taxas de nível e comissões de indicação não são mais hardcoded

#### Wallet Ledger (`lib/db/src/schema/ledger.ts`)
- `walletLedgerTable` — ledger de dupla entrada para audit trail completo
- Campos: `debitWalletId`, `creditWalletId`, `amount`, `type`, `referenceType`, `referenceId`, `description`, `metadata` (jsonb)
- Schema implementado + tabela criada no banco
- Visualização via Governance → tab Carteira

#### Escrow Foundation (`lib/db/src/schema/escrow.ts`)
- `escrowsTable` com máquina de estados completa: `draft → open → funded → in_progress → completed → released / cancelled / disputed`
- Armazena snapshot de todos os valores calculados pelo Split Engine no momento do funding
- Campos Asaas preparados: `asaasChargeId`, `asaasTransferId`
- Schema implementado + tabela criada no banco
- Foundation only — não ativo no fluxo de conclusão de extras ainda

#### Asaas Foundation (`artifacts/api-server/src/lib/asaas.ts`)
- Abstraction layer completa: `AsaasService`, `getAsaasService()`, `refreshAsaasInstance()`
- Métodos implementados (stubs): `createCharge`, `createTransfer`, `getBalance`, `processWebhook`, `syncPaymentStatus`
- Todos retornam `{ ok: false, errorCode: "not_implemented" }` até ativação
- Frontend nunca acessa Asaas — toda comunicação via extraGO API
- Checklist de ativação documentado no arquivo e em `BUSINESS_MODEL.md`

#### Governança de Categorias (`lib/db/src/schema/categories.ts`)
- `categoriesTable` com soft-archive, display order, ícones, regras (jsonb)
- CRUD completo via Governance → tab Categorias
- Slug auto-gerado do nome

#### CEO Governance Center — 3 novos tabs
- **Financeiro:** split de representante/investidor/reserva; configuração de escrow; regras de saque; status Asaas (read-only)
- **Categorias:** CRUD completo de categorias de extras
- **Carteira:** métricas da wallet da plataforma + ledger paginado

#### Platform Wallet View (`GET /api/admin/governance/platform-wallet`)
- Saldo atual, total de taxas coletadas, comissões de indicação pagas, saques pendentes
- Transações recentes da wallet da plataforma

---

### 🔄 7. Motor de Progressão de Nível
Calcular nível do freelancer automaticamente com base em extras concluídos + avaliações:
- Notificação ao subir de nível (parcialmente implementado em `completeJobCascade`)
- Exibir progresso até o próximo nível com barra visual
- Histórico de progressão

**Critérios de progressão definidos em `BUSINESS_MODEL.md`**

---

### 📋 8. Wallet Ledger — Escrita Automática

O schema e a visualização do ledger já existem. O próximo passo é instrumentar `completeJobCascade` para escrever entradas automáticas:
- Entrada por débito da empresa
- Entrada por crédito do freelancer
- Entrada por taxa da plataforma
- Entrada por comissão de indicação (se aplicável)
- Entrada por comissão do representante (se aplicável)
- Entrada por fundo de reserva (se aplicável)

---

### 📋 9. Escrow — Integração no Fluxo de Extras

O schema e a máquina de estados do escrow já existem. Integrar no fluxo de contratação:
- Criar registro de escrow ao aprovar candidatura
- Fundar escrow ao confirmar início do extra
- Liberar escrow ao concluir extra (manual ou automático após `autoReleaseHours`)
- Fluxo de disputa com janela configurável

**Dependência:** Requer definição de `financial.escrow_rules.enabled = true` via Governance

---

### 📋 10. Centro Financeiro para Empresas
Dashboard financeiro corporativo completo:
- Histórico completo de depósitos
- Saldo disponível, reservado e pendente em destaque
- Extrato de pagamentos por extra concluído
- Relatório exportável (CSV/PDF)

---

### 📋 11. Admin Mobile Responsiveness
Painel administrativo totalmente responsivo:
- Tabelas adaptadas para cards/lista em mobile
- Ações acessíveis em telas pequenas
- Drawer de navegação em mobile

---

### 📋 12. Feed de Atividade de Indicações (Real-Time)
Atividade em tempo real da rede de indicações:
- Novo indicado se cadastrou
- Indicado concluiu primeiro extra
- Comissão recebida (valor + quem gerou)
- Notificação push in-app

---

## Fase 2 — Expansão Nacional

### 🔮 13. Asaas — Ativação Completa

Antes de ativar Asaas em produção, todos os itens abaixo devem estar concluídos:

- [ ] `ASAAS_API_KEY` configurado em environment secrets
- [ ] Wallet Ledger com escrita automática (item 8) implementado
- [ ] Escrow integrado ao fluxo de extras (item 9) implementado e testado
- [ ] Webhook endpoint implementado e validado com sandbox Asaas
- [ ] Cálculos do Split Engine validados contra valores de transferência Asaas
- [ ] `financial.asaas_config.environment` = sandbox → testes completos
- [ ] `financial.asaas_config.enabled = true` via Governance Center
- [ ] Aprovação do CEO antes de mudar ambiente para `production`

---

### 🔮 14. PIX Automático para Saques

Com Asaas ativo, automatizar o fluxo de saque:
- Freelancer solicita saque → `AsaasService.createTransfer()` executa automaticamente
- Webhook Asaas atualiza status do saque
- Notificação automática ao freelancer

**Dependência:** Item 13 (Asaas ativo)

---

### 🔮 15. Onboarding por Representante Estadual
Fluxo de captação regional:
- Landing page personalizada por estado
- Onboarding guiado com representante como padrinho
- Métricas de performance do representante em tempo real

---

### 🔮 16. Motor de Matching Inteligente
Matching automático empresa ↔ profissional:
- Baseado em histórico, avaliações, localização, disponibilidade
- Score de compatibilidade visível para ambos os lados
- Sugestões proativas ("Extras para você esta semana")

---

### 🔮 17. Verificação de Identidade
Background check integrado:
- CPF, antecedentes criminais, validação de documentos
- Badge "Verificado" com data e método
- Integração com parceiros de background check

---

### 🔮 18. Avaliações Bilaterais Completas
Sistema de reputação bilateral:
- Freelancer avalia empresa e vice-versa
- Score público de reputação
- Histórico de avaliações no perfil

---

### 🔮 19. Centro Nacional de Operações — Fase 2
Expansão do mapa e ops:
- Distribuição de extras em tempo real por geolocalização
- Heatmap de demanda por setor
- Alertas de concentração de demanda

---

## Fase 3 — Infraestrutura Financeira

### 🔮 20. Produtos Financeiros Próprios
Expansão do ecossistema financeiro (requer Asaas ativo + base jurídica):
- Antecipação de recebíveis para freelancers
- Crédito para empresas (contratação parcelada)
- Cartão extraGO (futura possibilidade)

---

### 🔮 21. Assinaturas Profissionais e Empresariais
Planos pagos com benefícios diferenciados:
- Freelancer PRO: maior visibilidade no feed, analytics avançados, badge verificado
- Empresa Premium: pool premium, reporting, posting ilimitado

---

### 🔮 22. Integrações Ecossistema
Integrações com plataformas complementares:
- Escolas de qualificação (certificados verificados)
- Sistemas de ERP para empresas grandes
- Plataformas de background check
- Parceiros de benefícios para freelancers

---

## Visão de Expansão

```
2026 (Fase 1 — Fundação)
├── SP, RJ, MG, ES operacionais
├── 100.000 usuários cadastrados
├── Motor de progressão ativo
├── Split Engine + Ledger + Escrow foundation implementados
└── Wallet e PIX consolidados

2027 (Fase 2 — Expansão Nacional)
├── Asaas ativo em produção (PIX automático)
├── 27 representantes estaduais ativos
├── Cobertura nacional completa
├── Motor de matching inteligente
└── Verificação de identidade

2028-2030 (Fase 3 — Infraestrutura)
├── Produtos financeiros próprios
├── Maior rede de trabalho eventual do Brasil
├── Parceria com ERPs e sistemas corporativos
└── Dados proprietários de matching como ativo
```

---

## Marcos Estratégicos

| Marco | Métrica | Fase |
|---|---|---|
| Primeiros 1.000 extras concluídos | Volume transacional real | Fase 1 |
| Ledger com audit trail completo | Conformidade financeira | Fase 1 |
| Escrow ativo no fluxo de extras | Confiança bilateral | Fase 1-2 |
| Asaas ativo (sandbox validado) | PIX automático | Fase 2 |
| 10 representantes estaduais ativos | Cobertura regional inicial | Fase 1-2 |
| 100.000 usuários cadastrados | Escala de rede | Fase 2 |
| 27 representantes (cobertura nacional) | Infraestrutura nacional | Fase 2 |
| R$ 1M em volume transacional mensal | Validação do modelo | Fase 2 |
| Produtos financeiros próprios | Diferenciação como infraestrutura | Fase 3 |

---

## Gaps Remanescentes Antes de Pagamentos em Produção

Itens implementados como foundation mas que precisam ser completados antes de processar pagamentos reais:

| Item | Status | Bloqueio |
|---|---|---|
| Wallet Ledger — escrita automática em `completeJobCascade` | 📋 Planejado | — |
| Escrow — integração no fluxo de candidatura/conclusão | 📋 Planejado | — |
| Asaas webhook endpoint | 📋 Planejado | Ledger + Escrow devem estar prontos primeiro |
| Validação completa em sandbox Asaas | 📋 Planejado | Webhook + Split Engine validados |
| `ASAAS_API_KEY` em environment secrets | 📋 Planejado | Aprovação do CEO |
| Aprovação do CEO para ativação em produção | 📋 Planejado | Todos os itens acima |

---

## Diretrizes Permanentes

- Prioridade sempre ao que sustenta o flywheel (matching + reputação + pagamentos)
- Expansão pela rede — indicações e representantes têm custo de aquisição ≈ 0
- Nunca sacrificar confiança por velocidade de entrega
- Mobile first em toda nova feature
- Nunca ativar Asaas em produção sem checklist completo aprovado pelo CEO

---

## Regras Obrigatórias

1. Atualizar o status dos itens neste documento quando concluídos
2. Qualquer nova feature planejada deve ser adicionada aqui antes de implementar
3. Features de Fase 3 não entram em desenvolvimento enquanto Fase 1 tiver itens pendentes
4. Todo item concluído deve ter o checklist de validação dos docs relevantes marcado
5. Items de infraestrutura de produção devem aguardar declaração do ambiente final pelo proprietário
6. Asaas não entra em ambiente de produção sem aprovação explícita do CEO

---

## Checklist de Validação

- [ ] O item implementado foi marcado como ✅ Concluído neste doc?
- [ ] A feature reforça pelo menos um dos 6 pilares do ecossistema?
- [ ] O impacto no flywheel de receita está claro?
- [ ] Mobile foi considerado no escopo da feature?
- [ ] O item está alinhado com a fase correta (não queimando etapas)?
- [ ] Se envolve pagamentos: o checklist de Asaas foi verificado?
