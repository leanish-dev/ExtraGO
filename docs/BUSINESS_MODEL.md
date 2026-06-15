# extraGO — BUSINESS MODEL

---

## Objetivo

Documentar a estrutura financeira, os motores de receita, os sistemas de progressão e o ecossistema econômico da extraGO. Este arquivo é a referência obrigatória para qualquer feature que envolva dinheiro, taxas, níveis, indicações, representantes, escrow ou split financeiro.

---

## Sistema de Níveis (Freelancers)

A progressão de nível reduz a taxa de intermediação, incentivando qualidade e permanência.

| Nível | Chave Interna | Taxa de Intermediação | Requisitos de Progressão |
|---|---|---|---|
| Iniciante | `beginner` | 20% | Entrada na plataforma |
| Júnior | `junior` | 18% | 20 extras concluídos + avaliação ≥ 4.5 |
| Intermediário | `intermediate` | 15% | 100 extras + avaliação ≥ 4.7 + verificado |
| Sênior | `senior` | 12% | 300 extras + avaliação ≥ 4.8 + verificado |
| Elite | `elite` (≡ diamond) | 10% | 600 extras + avaliação ≥ 4.9 + verificado + aprovação |

> **ATENÇÃO TÉCNICA:** A chave interna `elite` corresponde ao badge "diamond" e ao label "Elite" — switches sobre nível DEVEM cobrir todos os 5 valores: `beginner`, `junior`, `intermediate`, `senior`, `elite`.
>
> **IMPLEMENTAÇÃO:** As taxas por nível NÃO são hardcoded. São lidas do `platformConfigTable` com chaves `level_fee_bronze`, `level_fee_silver`, `level_fee_gold`, `level_fee_elite`, `level_fee_diamond` pelo Split Engine (`artifacts/api-server/src/lib/split-engine.ts`). Governança pode ajustá-las via CEO Governance Center → tab Configurações.

---

## Split Engine — Motor Financeiro da Plataforma

O **Split Engine** (`artifacts/api-server/src/lib/split-engine.ts`) é a fonte única de verdade para todos os cálculos financeiros da extraGO. Nenhuma taxa, comissão ou divisão de valor deve ser calculada fora deste módulo.

### Funções exportadas

| Função | Descrição |
|---|---|
| `loadSplitConfig()` | Carrega configuração do `platformConfigTable`. Cache de 60s em memória. CHAMAR ANTES DE QUALQUER DB TRANSACTION. |
| `calculateSplit(config, grossAmount, level, referralRate, repRate)` | Calcula divisão completa de um extra: plataforma, freelancer, referral, representante, fundo de reserva. |
| `calculateReferralRate(config, activeReferrals, networkExtras, approved)` | Determina tier de indicação (indicador/agente/embaixador) e retorna a taxa correspondente. |
| `invalidateSplitConfigCache()` | Força expiração do cache. Chamado automaticamente após salvar configuração de governança. |
| `referralTierLabel(config, rate)` | Retorna label do tier de indicação para display. |

### Fluxo de divisão de um extra concluído

```
Extra bruto (R$ X)
    ↓
Taxa da plataforma (10–20% por nível do freelancer)
    ↓ → Plataforma retém a taxa
    ↓ → Split interno da taxa:
    │       → Comissão do Representante Estadual (% sobre a taxa)
    │       → Participação de Investidores (% sobre a taxa)
    │       → Fundo de Reserva Operacional (% sobre a taxa)
    │       → Caixa operacional da extraGO (restante)
    ↓
Valor líquido para o Freelancer (bruto − taxa)
    ↓ → Comissão de Indicação (% sobre o líquido do freelancer, para o indicador)
    ↓ → Valor final creditado na wallet do freelancer
```

### Parâmetros configuráveis via Governance Center

| Chave em `platformConfigTable` | Parâmetro | Default |
|---|---|---|
| `level_fee_bronze` | Taxa nível Iniciante | 20% |
| `level_fee_silver` | Taxa nível Júnior | 18% |
| `level_fee_gold` | Taxa nível Intermediário | 15% |
| `level_fee_elite` | Taxa nível Sênior | 12% |
| `level_fee_diamond` | Taxa nível Elite | 10% |
| `referral_rate_indicador` | Comissão Indicador (Tier 1) | 2% |
| `referral_rate_agente` | Comissão Agente (Tier 2) | 3% |
| `referral_rate_embaixador` | Comissão Embaixador (Tier 3) | 5% |
| `financial.representative_rate` | % da taxa destinada ao representante estadual | 5% |
| `financial.investor_rate` | % da taxa para investidores parceiros | 0% |
| `financial.reserve_fund_rate` | % da taxa para fundo de reserva operacional | 0% |
| `financial.referral_thresholds` | Requisitos para Agente e Embaixador (jsonb) | ver abaixo |
| `financial.escrow_rules` | Configuração do sistema de custódia (jsonb) | ver abaixo |
| `financial.withdrawal_rules` | Limites e prazos de saque PIX (jsonb) | ver abaixo |
| `financial.asaas_config` | Status e ambiente da integração Asaas (jsonb) | desativado |

---

## Programa de Indicações (3 Tiers)

| Tier | Label | Taxa sobre Líquido do Freelancer | Requisitos |
|---|---|---|---|
| 1 | Indicador | 2% | Qualquer usuário com código de indicação |
| 2 | Agente de Captação | 3% | 25+ indicados ativos + 100+ extras na rede |
| 3 | Embaixador Regional | 5% | 100+ ativos + 1000+ extras + aprovação manual |

A comissão é **recorrente** — incide sobre cada extra concluído pelos indicados ativos, sem limite de ganhos.
Os thresholds são configuráveis via `financial.referral_thresholds` no Governance Center.

### Como funciona na prática

```
Usuário A indica → Usuário B (se cadastra com código de A)
Usuário B conclui extra de R$ 500
    → B paga taxa de intermediação (ex: 20% = R$ 100)
    → Freelancer B recebe líquido de R$ 400
    → A recebe 2% do líquido de B = R$ 8 (comissão de indicação Tier 1)
    → extraGO retém R$ 100 (taxa), do qual desconta os R$ 8 de comissão
```

---

## Representantes Estaduais — Modelo de Compensação

A taxa do representante estadual (`financial.representative_rate`) é calculada **sobre a taxa da plataforma** (não sobre o valor bruto do extra).

```
Extra de R$ 1.000 com freelancer Júnior (18% de taxa)
    → Taxa da plataforma: R$ 180
    → Comissão do representante (5% da taxa): R$ 9
    → extraGO retém: R$ 171 (antes de outras deduções)
```

**Default:** 5% da taxa da plataforma → Fundo Nacional de Representantes.
Configurable individualmente por representante no futuro.

---

## Investidores Parceiros

`financial.investor_rate` define % da taxa destinada a investidores parceiros registrados.
**Default:** 0% (sem participação automática configurada ainda).
Configurável pelo CEO Governance Center → tab Financeiro.

---

## Fundo de Reserva Operacional

`financial.reserve_fund_rate` define % da taxa retida como reserva operacional.
**Default:** 0% (sem retenção automática configurada ainda).
Configurável pelo CEO Governance Center → tab Financeiro.

---

## Escrow — Custódia de Pagamentos

O sistema de escrow (`lib/db/src/schema/escrow.ts`) está implementado como **foundation** — a infraestrutura está pronta mas a custódia automática ainda não está ativa no fluxo de conclusão de extras.

### Estados do Escrow

```
draft → open → funded → in_progress → completed → released
                                 ↘ cancelled
                                 ↘ disputed
```

### Parâmetros configuráveis (`financial.escrow_rules`)

| Campo | Descrição | Default |
|---|---|---|
| `enabled` | Ativa custódia automática no fluxo de extras | false |
| `autoReleaseHours` | Horas após conclusão para liberação automática | 72h |
| `disputeWindowHours` | Janela para abertura de disputa após conclusão | 24h |

### Campos auditados por extra

Cada registro de escrow armazena os valores calculados pelo Split Engine no momento do funding:
`grossAmount`, `platformFeeAmount`, `referralFeeAmount`, `representativeFeeAmount`, `reserveFundAmount`, `netFreelancerAmount`, além dos snapshots das taxas aplicadas (`feeRateSnapshot`, `referralRateSnapshot`, `representativeRateSnapshot`).

---

## Wallet Ledger — Audit Trail Financeiro

O `walletLedgerTable` é um **ledger de dupla entrada** — toda movimentação de saldo na plataforma deve produzir uma entrada correspondente. Serve como audit trail imutável.

### Tipos de entrada (`referenceType`)

```
job                    — pagamento por extra
application            — candidatura vinculada
withdrawal             — saque PIX freelancer
deposit                — depósito empresa
commission             — comissão de indicação
escrow_fund            — custódia de fundos
escrow_release         — liberação de custódia
escrow_cancel          — cancelamento de custódia
platform_fee           — taxa da plataforma
referral_commission    — comissão ao indicador
representative_commission — comissão ao representante
reserve_fund           — retenção fundo de reserva
```

### Estrutura da entrada

| Campo | Tipo | Descrição |
|---|---|---|
| `debitWalletId` | int | Wallet debitada (quem paga) |
| `creditWalletId` | int | Wallet creditada (quem recebe) |
| `amount` | real | Valor em centavos |
| `type` | text | Tipo de transação |
| `referenceType` / `referenceId` | text | Referência ao objeto de negócio |
| `description` | text | Descrição legível |
| `metadata` | jsonb | Dados adicionais (snapshot de rates, etc.) |

> **NOTA:** O ledger está implementado como schema e endpoint de visualização. A escrita automática de entradas no `completeJobCascade` é o próximo passo (não implementado ainda).

---

## Asaas Foundation — Camada de Integração Financeira

`artifacts/api-server/src/lib/asaas.ts` é a abstraction layer entre a lógica de negócio da extraGO e a infraestrutura de pagamentos Asaas.

**Status atual:** Foundation only — todos os métodos retornam `not_implemented`. Nenhuma chamada real à API Asaas é feita.

### Arquitetura

```
Frontend → extraGO API → Business Rules → Split Engine → AsaasService
```

O **frontend nunca se comunica com Asaas diretamente**. Toda integração é intermediada pela extraGO.

### Checklist de ativação (a ser executado quando pronto)

1. Definir `ASAAS_API_KEY` em environment secrets
2. Configurar `financial.asaas_config` via Governance Center → tab Financeiro
3. Definir `asaasConfig.enabled = true`
4. Testar endpoint de webhook com sandbox Asaas
5. Verificar que cálculos do Split Engine batem com valores de transferência Asaas
6. Ativar `asaasConfig.environment = "production"` apenas após validação sandbox completa

### Métodos do `AsaasService`

| Método | Propósito |
|---|---|
| `createCharge(request)` | Criar cobrança PIX/cartão/boleto para depósito de empresa |
| `createTransfer(request)` | Criar transferência PIX para saque de freelancer |
| `getBalance()` | Consultar saldo da conta Asaas |
| `processWebhook(payload, signature)` | Processar webhook de status de pagamento |
| `syncPaymentStatus(chargeId)` | Sincronizar status de pagamento externo |

---

## Categorias — Governança de Setores

O `categoriesTable` centraliza as categorias de extras na plataforma. Gerenciado exclusivamente pelo CEO Governance Center → tab Categorias.

- Sem lista hardcoded de categorias em nenhum lugar do código
- Soft-archive (status `archived`) em vez de hard-delete
- Campo `rules` (jsonb) suporta parâmetros financeiros específicos por categoria no futuro
- `displayOrder` controla ordenação no feed

---

## Motores de Receita

### 1. Intermediação por Performance
Taxa decrescente (10–20%) aplicada sobre o valor de cada extra concluído. Principal motor de receita transacional. Reduz conforme nível do freelancer. **Calculada exclusivamente pelo Split Engine.**

### 2. Programa de Indicações
Freelancers e empresas indicam novos usuários e recebem % recorrente do líquido gerado pela sua rede. Motor de crescimento orgânico com custo de aquisição próximo de zero.

### 3. Representantes Estaduais
% da taxa da plataforma (configurável via `financial.representative_rate`) destinado ao representante estadual onde o extra ocorreu.

### 4. Investidores Parceiros
% da taxa da plataforma (configurável via `financial.investor_rate`) destinado a investidores parceiros.

### 5. Fundo de Reserva
% da taxa da plataforma (configurável via `financial.reserve_fund_rate`) retido como reserva operacional.

### 6. Assinaturas Profissionais e Empresariais _(futuro)_
Planos pagos: maior visibilidade, acesso antecipado, analytics avançados, posting ilimitado.

### 7. Ecossistema Financeiro _(futuro — Asaas)_
Wallet integrada, PIX automático, antecipação de recebíveis, produtos financeiros. Receita via spread e tarifas sobre movimentações, processada via Asaas após ativação.

---

## Fluxo de Depósito (Empresa)

```
Empresa solicita depósito (POST /wallet/deposit-request)
    → Admin confirma (useAdminConfirmDepositRequest)
    → Admin aprova (useAdminApproveDepositRequest)
    → Saldo creditado na wallet da empresa
```

**Futuro:** com Asaas ativo, a cobrança será gerada automaticamente via `AsaasService.createCharge()` e o status atualizado por webhook.

## Fluxo de Saque (Freelancer)

```
Freelancer solicita saque PIX (mínimo configurado em financial.withdrawal_rules)
    → Admin revisa na fila de saques (/admin/withdrawals)
    → Admin aprova → PIX processado manualmente
    → Transação registrada
```

**Futuro:** com Asaas ativo, o PIX será executado automaticamente via `AsaasService.createTransfer()`.

---

## Wallet Platform — Carteira da Plataforma

A wallet da plataforma (`walletType = "platform"`) concentra todas as taxas cobradas. Visível no CEO Governance Center → tab Carteira, com métricas:

- Saldo atual
- Total de taxas coletadas (`SUM(platform_fee transactions)`)
- Comissões de indicação pagas
- Saques pendentes de freelancers

---

## Estrutura Financeira Oficial

| Destino | % | Implementação |
|---|---|---|
| Taxa da Plataforma (freelancer) | 10–20% do extra | Split Engine — `level_fee_*` |
| Comissão de Indicação | 2–5% do líquido do freelancer | Split Engine — `referral_rate_*` |
| Comissão do Representante | % da taxa (configurável) | Split Engine — `financial.representative_rate` |
| Participação de Investidores | % da taxa (configurável) | Split Engine — `financial.investor_rate` |
| Fundo de Reserva | % da taxa (configurável) | Split Engine — `financial.reserve_fund_rate` |
| Caixa Operacional extraGO | Restante da taxa | Calculado automaticamente |

---

## Governança Financeira — Controles CEO

Todas as configurações financeiras são controladas exclusivamente pelos 3 controladores de governança:

```
leonardoscheffel2000@gmail.com — CEO
extrago.ceo@yahoo.com          — CEO Master
jeandick2000@gmail.com         — CMO / SUPER_ADMIN
```

Via CEO Governance Center → tab Financeiro:
- Ajuste de taxas por nível (tab Configurações)
- Ajuste de comissões de indicação (tab Configurações)
- Configuração de split (representante, investidor, reserva) (tab Financeiro)
- Configuração de escrow (tab Financeiro)
- Configuração de regras de saque (tab Financeiro)
- Status e ambiente da integração Asaas (tab Financeiro — read-only)

---

## Flywheel de Receita

```
Extra concluído
    → Split Engine calcula divisão completa
    → Taxa de intermediação coletada (receita imediata)
    → Avaliação gerada (reputação do freelancer sobe)
    → Nível sobe (taxa cai, freelancer permanece na plataforma)
    → Indicadores recebem comissão recorrente
    → Representante recebe comissão regional
    → Rede cresce → mais volume → mais receita
```

---

## Diretrizes Permanentes

- Taxas de intermediação só diminuem por nível — nunca por negociação avulsa (exceto overrides de governança)
- Comissões de indicação são recorrentes e automáticas — não manuais
- Toda taxa, comissão e split DEVE ser calculado pelo Split Engine — sem hardcode
- Saque mínimo definido em `financial.withdrawal_rules.minAmountCents` (default R$ 20,00)
- Escrow só ativa quando `financial.escrow_rules.enabled = true` via governança
- Asaas só ativa quando `financial.asaas_config.enabled = true` + checklist completo

---

## Regras Obrigatórias

1. Qualquer feature financeira deve respeitar os 4 tipos de saldo da wallet
2. Switches sobre nível de freelancer DEVEM cobrir todos os 5 níveis (`beginner` → `elite`)
3. O fluxo de depósito de empresa requer 2 passos admin: confirmar → aprovar
4. Saques de freelancer são atualmente manuais (PIX) — pagamento automático requer ativação Asaas
5. Comissões de indicação são calculadas sobre o **líquido** do freelancer (após taxa da plataforma)
6. Comissão de representante é calculada sobre a **taxa da plataforma** (não sobre o bruto)
7. `loadSplitConfig()` deve ser chamado ANTES de qualquer `db.transaction()` no backend
8. `invalidateSplitConfigCache()` deve ser chamado após qualquer save de configuração de governança

---

## Checklist de Validação

- [ ] A feature respeita os 5 níveis de freelancer com as chaves corretas?
- [ ] As taxas são lidas do Split Engine (não hardcoded)?
- [ ] `loadSplitConfig()` é chamado ANTES da DB transaction?
- [ ] O fluxo financeiro usa os 4 tipos de saldo corretamente?
- [ ] Depósito de empresa passa pelo fluxo de 2 etapas (confirmar + aprovar)?
- [ ] Comissões de indicação são calculadas sobre o líquido do freelancer?
- [ ] Comissão do representante é calculada sobre a taxa da plataforma?
- [ ] Não há pagamento automático sem aprovação de admin (enquanto Asaas não está ativo)?
- [ ] Frontend não se comunica diretamente com Asaas?
