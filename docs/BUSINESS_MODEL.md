# extraGO — BUSINESS MODEL

---

## Objetivo

Documentar a estrutura financeira, os motores de receita, os sistemas de progressão e o ecossistema econômico da extraGO. Este arquivo é a referência obrigatória para qualquer feature que envolva dinheiro, taxas, níveis, indicações ou representantes.

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

> **ATENÇÃO TÉCNICA:** A chave interna `elite` corresponde ao badge "diamond" e ao label "Elite" — switches sobre nível DEVEM cobrir todos os 5 valores: `beginner`, `junior`, `intermediate`, `senior`, `elite`. Ver `docs/PRODUCT_ARCHITECTURE.md` para referência do componente de badge.

---

## Programa de Indicações (3 Tiers)

| Tier | Label | Taxa sobre Extras da Rede | Requisitos |
|---|---|---|---|
| 1 | Indicador | 2% | Qualquer usuário com código de indicação |
| 2 | Agente de Captação | 3% | 25+ indicados ativos + 100+ extras na rede |
| 3 | Embaixador Regional | 5% | 100+ ativos + 1000+ extras + aprovação manual |

A comissão é **recorrente** — incide sobre cada extra concluído pelos indicados ativos, sem limite de ganhos.

### Como funciona na prática

```
Usuário A indica → Usuário B (se cadastra com código de A)
Usuário B conclui extra de R$ 500
    → B paga taxa de intermediação (ex: 20% = R$ 100)
    → A recebe 2% do extra bruto = R$ 10 (comissão de indicação)
    → extraGO retém R$ 90
```

---

## Motores de Receita

### 1. Intermediação por Performance
Taxa decrescente (10–20%) aplicada sobre o valor de cada extra concluído. Principal motor de receita transacional. Reduz conforme nível do freelancer.

### 2. Programa de Indicações
Freelancers e empresas indicam novos usuários e recebem % recorrente da receita gerada pela sua rede. Motor de crescimento orgânico com custo de aquisição próximo de zero.

### 3. Assinaturas Profissionais (Freelancers)
Planos pagos: maior visibilidade no feed, acesso antecipado a extras premium, badge verificado, analytics pessoais avançados.

### 4. Assinaturas Empresariais
Planos corporativos: dashboard de gestão avançado, posting ilimitado, acesso a pool premium de profissionais verificados, relatórios de performance.

### 5. Representantes Estaduais
5% da receita operacional forma o Fundo Nacional de Representantes, distribuído por performance regional com base em:
- Empresas ativas no estado
- Profissionais ativos no estado
- Extras concluídos no estado
- Taxa de crescimento mensal
- Atingimento de metas acordadas

### 6. Ecossistema Financeiro
Wallet integrada, PIX, antecipação de recebíveis, produtos financeiros futuros. Receita via spread e tarifas financeiras sobre movimentações.

### 7. Parceiros e Influenciadores
Parcerias estratégicas com plataformas complementares (escolas profissionalizantes, background check, ERPs), influenciadores de nicho e canais de captação B2B.

---

## Estrutura Financeira Oficial

| Destino | % | Descrição |
|---|---|---|
| Caixa e Reserva Estratégica | 25% | Runway, reserva operacional |
| Fundadores e Investidores | 20% | Retorno sobre capital |
| Marketing e Expansão | 20% | Aquisição, crescimento regional |
| Tecnologia e Inovação | 10% | Produto, infra, P&D |
| Operações | 10% | Time, suporte, processos |
| Fundo Estratégico | 10% | Oportunidades, M&A futuro |
| Representantes | 5% | Fundo Nacional de Representantes |

---

## Representantes Estaduais

A extraGO opera via rede de representantes regionais — um por estado (27 + DF).

### Função do Representante
- Desenvolver a rede de profissionais e empresas no seu estado
- Representar a extraGO em eventos e parcerias locais
- Garantir qualidade e conformidade das operações regionais

### Modelo de Compensação
- Recebe % do Fundo Nacional de Representantes proporcional à performance do seu estado
- Bônus por atingimento de metas regionais
- Sem custo fixo para a extraGO — modelo de participação nos resultados

### Gestão
- Gerenciado via painel `/admin/representatives`
- Métricas por estado: profissionais ativos, empresas ativas, extras concluídos, crescimento

---

## Modelo de Pricing (Referência)

| Parâmetro | Valor |
|---|---|
| Taxa base freelancer Iniciante | 20% sobre valor bruto do extra |
| Taxa mínima (Elite) | 10% |
| Comissão mínima indicador (Tier 1) | 2% |
| Comissão máxima (Embaixador, Tier 3) | 5% |
| Saque mínimo via PIX | R$ 20,00 |
| % para Fundo de Representantes | 5% da receita operacional |

---

## Ecossistema Financeiro (Wallet)

### Tipos de Saldo

| Campo | Descrição |
|---|---|
| `balance` | Saldo disponível para saque |
| `reservedBalance` | Saldo bloqueado para extras em andamento |
| `pendingBalance` | Valores a receber de extras em aprovação |
| `pendingDeposits` | Depósitos aguardando confirmação (empresas) |

### Fluxo de Depósito (Empresa)
```
Empresa solicita depósito (POST /wallet/deposit-request)
    → Admin confirma (useAdminConfirmDepositRequest)
    → Admin aprova (useAdminApproveDepositRequest)
    → Saldo creditado na wallet da empresa
```

### Fluxo de Saque (Freelancer)
```
Freelancer solicita saque PIX (mínimo R$ 20)
    → Admin revisa na fila de saques (/admin/withdrawals)
    → Admin aprova → PIX processado manualmente
    → Transação registrada
```

---

## Flywheel de Receita

```
Extra concluído
    → Taxa de intermediação (receita imediata)
    → Avaliação (reputação do freelancer sobe)
    → Nível sobe (taxa cai, freelancer permanece na plataforma)
    → Indicadores recebem comissão recorrente
    → Rede cresce → mais volume → mais receita
```

---

## Diretrizes Permanentes

- Taxas de intermediação só diminuem por nível — nunca por negociação avulsa
- Comissões de indicação são recorrentes e automáticas — não manuais
- O Fundo de Representantes é inviolável — sempre 5% da receita operacional
- Saque mínimo de R$ 20,00 permanece constante (pode subir, nunca descer)

---

## Regras Obrigatórias

1. Qualquer feature financeira deve respeitar os 4 tipos de saldo da wallet
2. Switches sobre nível de freelancer DEVEM cobrir todos os 5 níveis (`beginner` → `elite`)
3. O fluxo de depósito de empresa requer 2 passos admin: confirmar → aprovar
4. Saques de freelancer são sempre manuais (PIX) — não há pagamento automático
5. Comissões de indicação devem ser computadas sobre o valor bruto do extra

---

## Boas Práticas

- Exibir sempre o nível atual e o próximo nível com progresso visual
- Mostrar ao freelancer quanto economizaria em taxas ao subir de nível
- Mostrar ao indicador quanto ganhou e quanto sua rede está gerando
- Nunca mostrar saldo `pendingBalance` como disponível para saque
- Empty states financeiros devem ser motivadores, não neutros

---

## Restrições

- Não criar novas fontes de receita sem alinhamento com os fundadores
- Não modificar as % da estrutura financeira sem aprovação formal
- Não implementar pagamentos automáticos — todo saque é manual e aprovado por admin
- Não expor endpoint `/api/setup/seed` em produção

---

## Checklist de Validação

- [ ] A feature respeita os 5 níveis de freelancer com as chaves corretas?
- [ ] O fluxo financeiro usa os 4 tipos de saldo corretamente?
- [ ] Depósito de empresa passa pelo fluxo de 2 etapas (confirmar + aprovar)?
- [ ] Comissões de indicação são calculadas sobre o valor bruto?
- [ ] O Fundo de Representantes (5%) está contabilizado?
- [ ] Não há pagamento automático sem aprovação de admin?
