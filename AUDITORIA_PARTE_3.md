# AUDITORIA TÉCNICA extraGO — PARTE 3
## Etapas 14 a 20 + Relatório Final Consolidado

> Data: 13 de julho de 2026 · Modo: somente leitura  
> **Arquivos modificados: nenhum | Arquivos criados: nenhum | Impacto arquitetural: nenhum**  
> Continua a partir de `AUDITORIA_PARTE_1.md` e `AUDITORIA_PARTE_2.md`

---

## ETAPA 14 — PERFIL

### 14.1 Seções do perfil

| Seção | Tabela | Endpoint(s) | Zod validado | Estratégia de escrita | Exibe em progressão? |
|---|---|---|---|---|---|
| Dados core (name, bio, phone, pixKey, etc.) | `users` | `PATCH /users/:id` | ✅ Parcial | UPDATE incremental | ❌ |
| Avatar | `users.avatarUrl` | `POST /profile/avatar` | ❌ Body direto | UPDATE direto | ❌ |
| Banner | `users.bannerUrl` | `POST /profile/banner` | ❌ Body direto | UPDATE direto | ❌ |
| Especialidades/Categorias | `user_categories` | `GET/PUT /profile/categories` | ✅ Completo | DELETE + INSERT (replace total) | ❌ |
| Experiência profissional | `work_experiences` | `GET/POST/PUT/DELETE /profile/experience` | ✅ Completo | INSERT/UPDATE/DELETE individual | ❌ |
| Habilidades | `user_skills` | `GET/POST/DELETE /profile/skills` (se existir) | ✅ Parcial | INSERT/DELETE individual | ❌ |
| Nível / Progressão | `users.level`, `users.completedJobs`, `users.reputationScore` | Calculado por `completeJobCascade` | N/A | Calculado — não editável pelo usuário | ✅ Apenas em `/app/career` |
| `profileCompletion` | `users.profileCompletion` | Calculado em `PATCH /users/:id` | N/A | `Math.min(completion, 100)` | ❌ |

### 14.2 Progressão de carreira confinada em Minha Carreira

Confirmado: **nenhuma seção de profile exibe thresholds de nível, conquistas ou progresso percentual**. Essas funcionalidades existem **exclusivamente** em `career.tsx` (`/app/career`). O endpoint `GET /stats/freelancer/:id` provê os dados; o cálculo visual ocorre no componente.

`profile.tsx` exibe o nível atual (badge visual), mas não exibe progresso até o próximo nível nem conquistas. A separação é intencional.

### 14.3 Estratégia de persistência por seção

**Especialidades** (`PUT /profile/categories`):
```
1. DELETE FROM user_categories WHERE userId = :id   (apaga TUDO do usuário)
2. INSERT INTO user_categories VALUES (...)           (reinsere array completo)
```
Risco: operação não atômica sem transação explícita — se o INSERT falhar, usuário perde todas as especialidades. Não usa `db.transaction()`.

**Experiência** (`POST/PUT/DELETE /profile/experience`):
- Zod-validado com `CreateExperienceBody`
- PUT faz guard `eq(workExperiencesTable.userId, userId)` — protege contra edição de entrada alheia ✅
- DELETE faz guard igual ✅

**Habilidades** (`POST /profile/skills`):
- Zod-validado com `CreateSkillBody` (max 60 chars)
- Endorsements inicializam em 0 — sem endpoint de endorse no spec OpenAPI

### 14.4 Perfil público vs. privado

| Aspecto | Perfil Privado (`/app/profile`) | Perfil Freelancer Público (`/app/freelancers/:id`) | Perfil Empresa Público (`/app/companies/:id`) |
|---|---|---|---|
| Rota | `/app/profile` | `/app/freelancers/:id` | `/app/companies/:id` |
| Auth | requireAuth (próprio usuário) | requireAuth | requireAuth |
| Campos visíveis | Todos, incluindo pixKey, phone, cpf | name, bio, level, categories, experience, skills, stats, followers | name, companyName, bio, stats, jobs abertos |
| Campos ocultos | N/A (é o próprio usuário) | pixKey, cpf, cnpj, phone, passwordHash, accountStatus | pixKey, cnpj, cpf, phone |
| Edição | ✅ Pode editar | ❌ Somente leitura | ❌ Somente leitura |
| Stats | Via `useGetFreelancerStats` | Via `useGetFreelancerStats(userId)` | Via `useGetCompanyStats(userId)` |

**Dado exposto no endpoint público `GET /users/:id`:** O subagente reportou que `users.ts` não filtra `pixKey`, `phone` ou `cpf` na response do perfil público. Se o endpoint retornar o objeto completo do banco, esses dados podem vazar. Requer confirmação por leitura direta de `routes/users.ts` (seleção de colunas).

### 14.5 Upload e armazenamento de imagens

| Item | Implementação | Risco |
|---|---|---|
| Encoding | Base64 Data URL (via `FileReader`) | 🟠 ~33% overhead de tamanho vs binário |
| Transporte | JSON body (`Content-Type: application/json`) | 🟠 Carrega payload em memória |
| Limite | 15 MB por request (Express JSON limit) | 🟡 Sem limite por imagem individual |
| Storage | Coluna `text` no PostgreSQL (`usersTable.avatarUrl`) | 🔴 Sem object storage — banco cresce indefinidamente |
| Validação de tipo | ❌ Nenhuma no backend | 🟠 Qualquer string aceita como "imagem" |
| Validação de MIME | ❌ Nenhuma | 🟠 Possível upload de HTML/SVG com XSS via data URI |
| Compressão | ❌ Nenhuma | 🟠 Foto mobile = 3–8 MB por upload |
| CDN/cache | ❌ Nenhum | 🟠 Cada carregamento de perfil busca a imagem do banco |

### 14.6 Imagens de governança (Leonardo.jpg e Jean.jpg)

**Onde são definidas:**

| Identidade | Valor em seed.ts | Formato |
|---|---|---|
| Leonardo Scheffel (CEO) | `avatarUrl: "/team-leonardo.jpg"` | Path estático |
| Jean Dick (CMO) | `avatarUrl: "/team-jean.jpg"` | Path estático |
| Qaialla Pereira (CCO) | `avatarUrl: "/team-qaialla.jpg"` | Path estático |

**Como são servidas:**
- Paths `/team-leonardo.jpg` etc. resolvem como arquivos estáticos do frontend Vite
- Em desenvolvimento: `artifacts/extrag0/public/team-*.jpg`
- Em produção: servidos pelo Express como arquivos estáticos de `artifacts/extrag0/dist/public/`

**Estado atual do diretório público:**
- `find public/ -type f` retornou **vazio** do diretório raiz do workspace
- Os arquivos estão em `artifacts/extrag0/public/` (não verificado nesta leitura)
- Se os arquivos não existirem em `artifacts/extrag0/public/`, as imagens resultarão em **404** e os perfis de governança exibirão placeholder/broken image

**Associação automática:**
- A associação de `/team-*.jpg` ocorre **apenas via seed.ts** — `POST /api/setup/seed`
- `seedMasterAdmin()` (startup automático) **NÃO define avatarUrl** — apenas cria/atualiza campos de role e status
- Consequência: se o banco for recriado e apenas `seedMasterAdmin` executar (automático), as fotos não são associadas — requer execução manual de `/api/setup/seed`

**Nome inconsistente do CEO entre arquivos:**

| Arquivo | Nome |
|---|---|
| `seed.ts` linha 79 | `"Leonardo Scheffel"` |
| `setup.ts` linha 37 | `"Leonardo Scheffel da Rosa"` |
| `AI_CONTEXT.md` | `"Leonardo Scheffel"` |
| Investidores page | `"Leonardo Scheffel da Rosa"` |

### 14.7 Duplicações identificadas

| Dado | Locais | Risco |
|---|---|---|
| `profileCompletion` | Calculado em `users.ts`, hardcoded como 100/80 nos seeds | 🟡 Seeds sobrescrevem o calculado — OK se seed é bootstrap |
| corporateRole labels | `seed.ts`, `setup.ts`, `governance.ts` DEFAULTS | 🟡 Textos podem divergir |
| Regiões de serviço | `users.serviceRegions` (text[]) + hardcoded no frontend | 🟡 11 regiões pré-definidas no UI, validação no banco é text[] irrestrito |
| Idiomas | Hardcoded no frontend (9 opções), sem enum no banco | 🟡 Banco aceita qualquer texto |

---

## ETAPA 15 — FINANCEIRO

### 15.1 Fluxo de intermediação

```
Empresa → Carteira Empresa → Reserva → [Extra executado] → Split Engine
                                                                │
                    ┌───────────────────────────────────────────┤
                    ▼               ▼               ▼           ▼
              Freelancer       Plataforma       Indicador  Representante
              (líquido)        (taxa bruta)    (comissão)   (comissão)
```

**Gatilho:** `POST /jobs/:id/validate-checkout` → `completeJobCascade()`

### 15.2 Split Engine — fórmula completa

**Entrada:**
- `grossAmount`: valor total do Extra (em centavos — ver §15.3)
- `level`: nível do freelancer (`bronze`|`silver`|`gold`|`elite`|`diamond`)
- `referralRate`: taxa calculada por `calculateReferralRate(activeReferrals, networkExtras, ambassadorApproved)`
- `representativeRate`: taxa do representante estadual (default: 0.02 por representante)
- `config`: carregado de `platformConfigTable` (com cache 60s)

**Fórmula:**
```
platformFeeRate     = config.platformFeeByLevel[level]     // Ex: 0.20 para bronze
platformFeeAmount   = Math.round(grossAmount × platformFeeRate)
freelancerGross     = grossAmount − platformFeeAmount
referralFeeAmount   = Math.round(freelancerGross × referralRate)
representativeFeeAmount = Math.round(platformFeeAmount × representativeRate)
reserveFundAmount   = Math.round(platformFeeAmount × config.reserveFundRate)
netFreelancerAmount = freelancerGross − referralFeeAmount
```

**Distribuição:**
| Destinatário | Valor | Fonte |
|---|---|---|
| Freelancer (líquido) | `netFreelancerAmount` | `grossAmount` − plataforma − indicação |
| Plataforma | `platformFeeAmount` | `grossAmount × feeRate` |
| Indicador | `referralFeeAmount` | `freelancerGross × referralRate` |
| Representante regional | `representativeFeeAmount` | `platformFeeAmount × representativeRate` |
| Fundo de reserva | `reserveFundAmount` | `platformFeeAmount × reserveFundRate` |

**Verificação de somas:**
```
netFreelancerAmount + referralFeeAmount + platformFeeAmount = grossAmount ✅
```
Os valores de representante e reserva saem do `platformFeeAmount` (redistribuição interna da plataforma).

**Atenção:** `representativeFeeAmount` e `reserveFundAmount` são subtraídos da parte da plataforma, mas a carteira da plataforma recebe `platformFeeAmount` inteiro em `completeJobCascade` — a plataforma então redistribui. Isso pode fazer o balanço da carteira da plataforma ficar "cheio" antes da redistribuição. Não há lógica de redistribuição automática implementada — representative e reserve são apenas transações de débito na wallet da plataforma (não confirmado por leitura de `completeJobCascade` completo).

### 15.3 Unidade monetária — inconsistência confirmada

| Contexto | Unidade | Evidência |
|---|---|---|
| Split Engine (`calculateSplit`) | Centavos — `Math.round()` em inteiros | Uso de `Math.round()` pressupõe inteiros |
| `wallet.balance`, `wallet.reservedBalance` | Ambíguo — campo `real` (float) | Definição no schema |
| Saque mínimo (`wallet.ts:119`) | `amount < 20` — mensagem "R$20" | **Reais** se interpretado literalmente |
| Depósito mínimo (`wallet.ts:149`) | `amount < 5000` — mensagem "R$50" | **Centavos** se interpretado literalmente |
| Dashboard.tsx | `totalSpent / 100`, `totalEarned / 100` | Frontend assume **centavos** no banco |
| Career.tsx | `savingsAmount = ((fee - nextFee) / 100) * 250 * 4` | Frontend assume **centavos** → divide por 100 |

**Contradição documentada:** A unidade monetária não é uniforme entre endpoints. O depósito usa centavos (`< 5000` = R$50), o saque usa reais (`< 20` = R$20). O dashboard divide por 100 assumindo centavos. Isso é uma **inconsistência ativa** que pode resultar em exibição incorreta de saldos ou cálculos errados dependendo do fluxo que gerou o valor.

### 15.4 Carteira — operações por evento

| Evento | Campo alterado | Wallet | Operação |
|---|---|---|---|
| Registro de usuário | `balance = 0` (initial) | Freelancer/Company | INSERT (via `db.insert(walletsTable).catch(() => {})`) |
| Criação de Extra (aprovação de candidatura) | `balance -= grossAmount`, `reservedBalance += grossAmount` | Empresa | UPDATE — sem transação explícita |
| Conclusão de Extra (`completeJobCascade`) | `reservedBalance -= grossAmount`, `totalSpent += grossAmount` | Empresa | UPDATE em tx |
| Conclusão de Extra | `balance += netFreelancerAmount`, `totalEarned += netFreelancerAmount`, `totalFeesPaid += platformFeeAmount` | Freelancer | UPDATE em tx |
| Conclusão de Extra | `balance += platformFeeAmount`, `totalEarned += platformFeeAmount` | Plataforma | UPDATE em tx |
| Conclusão de Extra (se indicação) | `balance += referralFeeAmount`, `totalEarned += referralFeeAmount` | Indicador | UPDATE em tx |
| Conclusão de Extra (se representante) | `balance += representativeFeeAmount`, `totalEarned += representativeFeeAmount` | Representante | UPDATE em tx |
| Saque (freelancer) | `balance -= amount`, `totalWithdrawn += amount` | Freelancer | UPDATE fora de transação |
| Saque rejeitado (admin) | `balance += amount`, `totalWithdrawn -= amount` via `GREATEST(0, ...)` | Freelancer | UPDATE |
| Depósito aprovado (admin) | `balance += amount` | Empresa | UPDATE |
| Counter-offer aprovado | `reservedBalance` e `balance` ajustados pelo delta | Empresa | UPDATE em tx |

### 15.5 Fluxo de saque

```
Freelancer → POST /wallet/withdraw {amount, pixKey}
  → role check: freelancer only
  → balance check: balance >= amount
  → amount check: amount >= 20 (R$20 ou 20 centavos — ambíguo)
  → UPDATE wallets SET balance -= amount, totalWithdrawn += amount
  → INSERT transactions {type: "withdrawal", status: "pending"}
  → Resposta: 201 com transaction

Admin → GET /admin/withdrawals → lista pending
Admin → POST /admin/withdrawals/:id/approve
  → UPDATE transactions SET status = "completed"
  → (SEM transferência real — Asaas não ativo)

Admin → POST /admin/withdrawals/:id/reject
  → UPDATE transactions SET status = "rejected"
  → UPDATE wallets SET
      balance += amount,
      totalWithdrawn = GREATEST(0, totalWithdrawn - amount)
```

**Risco:** Saque aprovado pelo admin **não gera transferência real**. O saldo do freelancer foi debitado, a transação está "completed", mas o dinheiro não saiu da plataforma (sem Asaas).

### 15.6 Fluxo de depósito

```
Empresa → POST /wallet/deposit-request {amount, paymentMethod, pixKey}
  → role check: company only
  → amount check: amount >= 5000 (centavos = R$50, ou 5000 reais = ambíguo)
  → INSERT deposit_requests {status: "pending"}
  → INSERT transactions {type: "deposit", status: "pending"}
  → Resposta: 201

Admin → GET /admin/deposit-requests → lista pending
Admin → POST /admin/deposit-requests/:id/confirm
  → UPDATE deposit_requests SET status = "confirmed"
  → Notificação ao usuário

Admin → POST /admin/deposit-requests/:id/approve {amount?}
  → UPDATE deposit_requests SET status = "credited"
  → UPDATE wallets SET balance += amount
  → UPDATE transactions SET status = "completed"

Admin → POST /admin/deposit-requests/:id/reject
  → UPDATE deposit_requests SET status = "rejected"
  → Notificação ao usuário
```

**Risco:** Depósito aprovado manualmente pelo admin **sem verificação de recebimento real**. Sem Asaas, o admin confirma manualmente ao receber via PIX externo.

### 15.7 Gateway e webhooks

| Item | Estado | Evidência |
|---|---|---|
| Asaas ativo | ❌ Não (`enabled: false` por default) | `DEFAULT_SPLIT_CONFIG.asaasConfig.enabled = false` |
| createCharge | ❌ Não implementado — retorna `not_implemented` | `asaas.ts:119-126` |
| createTransfer | ❌ Não implementado | `asaas.ts:132-137` |
| processWebhook | ❌ Não implementado — sem validação de assinatura | `asaas.ts:156-165` |
| syncPaymentStatus | ❌ Não implementado | `asaas.ts:171-176` |
| Webhook endpoint | ❌ Não declarado em nenhuma rota | Busca em routes/ sem resultado |
| ASAAS_API_KEY | ❌ Não listado nas env vars — não configurado | `grep process.env` result |

**Conclusão:** Todo o processamento financeiro real é **manual** (admin) até Asaas ser ativado.

### 15.8 Auditoria financeira

| Mecanismo | Implementado | Observação |
|---|---|---|
| `transactions` table | ✅ Sim | Ledger de transações por carteira |
| `wallet_ledger` table | ⚠️ Estrutura existe, sem escrita | `completeJobCascade` não escreve no ledger |
| `escrows` table | ⚠️ Estrutura existe, sem uso | Nenhuma rota popula escrows |
| Job events | ✅ Sim (job_events) | Eventos de execução logados |
| Notificações financeiras | ✅ Sim | Criadas em completeJobCascade |
| Rollback de saldo | ✅ Parcial | Apenas para saque rejeitado |
| Reconciliação automática | ❌ Não | Sem job de reconciliação |

### 15.9 Arredondamento

- **`Math.round()`** usado em todas as operações do Split Engine
- Arredondamento para o centavo mais próximo
- Risco de "penny gap": `Math.round(100 * 0.15) + Math.round(100 * 0.85) = 15 + 85 = 100` ✅ (funciona para valores redondos)
- Para valores como `Math.round(7.5) = 8` e `Math.round(7.5) = 8`: soma > grossAmount possível em edge cases

---

## ETAPA 16 — INDICAÇÕES

### 16.1 Fluxo completo implementado

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ETAPA 1: CAPTURA DO CÓDIGO (auth.ts — registro)                        │
│                                                                          │
│  POST /auth/register { email, password, name, role, referralCode }       │
│    → SELECT users WHERE referralCode = :referralCode                     │
│    → if found: referredById = referrer.id                                │
│    → INSERT users { referredById, referralCode: generateReferralCode() } │
│    → accountStatus = "pending_email"                                     │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ETAPA 2: CONVERSÃO (referrals.ts — leaderboard e stats)                │
│                                                                          │
│  Critério: invitee.completedJobs >= 5 AND invitee.isVerified = true      │
│  Calculado em query time (não persistido em coluna dedicada)             │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ETAPA 3: CÁLCULO DE TIER (ecosystem.ts — calculateReferralRate)        │
│                                                                          │
│  activeReferrals = invitees com >= 1 extra concluído                     │
│  networkExtras   = soma de completedJobs de todos os invitees            │
│                                                                          │
│  if activeReferrals >= 100 AND networkExtras >= 1000 AND approved: 5%   │
│  if activeReferrals >= 25  AND networkExtras >= 100:               3%   │
│  else:                                                              2%   │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ETAPA 4: PAGAMENTO (ecosystem.ts — completeJobCascade)                 │
│                                                                          │
│  Quando freelancer (que tem referredById) conclui um Extra:              │
│    splitConfig = loadSplitConfig()  ← lê do banco, cache 60s           │
│    referralRate = calculateReferralRate(activeRef, networkExt, approved) │
│    referralFeeAmount = Math.round(freelancerGross × referralRate)        │
│                                                                          │
│    UPDATE wallets SET balance += referralFeeAmount (referrer wallet)     │
│    INSERT transactions { type: "commission", amount: referralFeeAmount } │
│    createNotification { type: "commission_received" } (referrer)         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Tabelas e colunas envolvidas

| Dado | Tabela | Coluna | Tipo |
|---|---|---|---|
| Código do indicador | `users` | `referralCode` | text, UNIQUE |
| Quem indicou | `users` | `referredById` | integer (FK implícita → users.id) |
| Aprovação embaixador | `users` | `ambassadorApproved` | boolean, default false |
| Fee override de indicação | `users` | `customReferralRate` | real, nullable |
| Configuração de tiers | `platform_config` | `financial.referral_thresholds` | jsonb |
| Taxas de indicação | `platform_config` | `referral_rate_indicador/agente/embaixador` | jsonb (via Split Engine) |
| Pagamento ao indicador | `transactions` | `type = "commission"` | transactionTypeEnum |
| Comissão acumulada | `wallets` | `totalEarned` | real |

### 16.3 Enums relevantes

- `transaction_type`: inclui `"commission"` para pagamentos de indicação
- Não há enum específico para tiers de indicação — são calculados por lógica em código

### 16.4 Validação de código

```
POST /referrals/validate { code }
  → SELECT users WHERE referralCode = :code
  → if found: return { valid: true, referrerName: user.name }
  → else: return { valid: false }
```

Nenhuma proteção de rate limit neste endpoint (qualquer um pode enumerar códigos).

### 16.5 Anti-fraude

| Tipo de fraude | Proteção implementada | Avaliação |
|---|---|---|
| Auto-indicação | ❌ Sem verificação explícita `referrer.id !== user.id` | ⚠️ Impossível na prática (usuário não existe ainda), mas sem guard formal |
| Indicação circular (A indica B, B indica A) | ❌ Sem verificação | 🟠 Possível para contas criadas em sequência |
| Uso múltiplo do mesmo código | ✅ Código só é capturado no registro | ✅ `referredById` é imutável pós-registro |
| Enumeração de códigos | ❌ Sem rate limit em `/referrals/validate` | 🟠 |
| Contas fake para farming | ⚠️ Parcial — conversão exige 5 extras + isVerified | 🟡 Barreira moderada |
| Override de taxa | `customReferralRate` via governança (CEO) | ✅ Controlado |

### 16.6 Leaderboard

```
GET /referrals/leaderboard
  → SELECT freelancers WHERE role = "freelancer" AND isDemo = false
  → ORDER BY completedJobs DESC LIMIT 20      ← ⚠️ ordena por completedJobs, não por indicações
  → Para cada freelancer: busca invitees e apps (batch, não N+1) ✅
  → Calcula totalConverted (invitees com ≥5 jobs + verified)
  → Re-ordena pelo totalConverted DESC, reputationScore DESC
```

**Anomalia:** A query inicial ordena por `completedJobs DESC` para pegar os top 20, mas o leaderboard final é re-ordenado por `totalConverted`. Um freelancer com 500 extras concluídos mas 0 indicações pode entrar nos top 20 da query inicial e "bloquear" um indicador com 50 extras mas 10 conversões.

### 16.7 Seeds de indicação

| Usuário | referralCode em seed | referredById |
|---|---|---|
| CEO Leonardo | `"CEO2024LS"` | null |
| CMO Jean | (provavelmente hardcoded — não confirmado) | null |
| Teste Freelancer | `"TESTEF01"` | null |
| Teste Empresa | (provavelmente hardcoded) | null |

Códigos hardcoded no seed — previsíveis e enumeráveis.

### 16.8 Hardcodes na UI de indicações

| Valor hardcoded | Arquivo | Linha | Risco |
|---|---|---|---|
| `feePercent: 20/18/15/12/10` | `referrals.tsx` | 35,50,66,83,100 | 🟠 Não reflete governança |
| `platformFeePerJob = 20` | `referrals.tsx` | ~48 | 🟠 Valor fictício para projeção |
| Tiers: 25/100 referrals, 100/1000 extras | `referrals.tsx` | implícito | 🟠 Não reflete platformConfigTable |
| Estimativa mensal = total / 3 | `referrals.tsx` | ~570 | 🟡 Heurística sem base real |

---

## ETAPA 17 — ADMIN, GOVERNANÇA E REPRESENTANTES

### 17.1 Proteção por endpoint

| Endpoint | Auth Guard | Verificação adicional |
|---|---|---|
| `GET /admin/users` | requireAuth + requireAdmin | — |
| `POST /admin/users/:id/ban` | requireAuth + requireAdmin | `if (target.role === 'admin')` → retorna 403 |
| `POST /admin/users/:id/verify` | requireAuth + requireAdmin | — |
| `POST /admin/users/:id/set-role` | requireAuth | `req.user.adminRole === 'super_admin'` (check manual) |
| `GET /admin/jobs` | requireAuth + requireAdmin | — |
| `DELETE /admin/jobs/:id` | requireAuth + requireAdmin | — |
| `GET /admin/withdrawals` | requireAuth + requireAdmin | — |
| `POST /admin/withdrawals/:id/approve` | requireAuth + requireAdmin | — |
| `POST /admin/withdrawals/:id/reject` | requireAuth + requireAdmin | — |
| `GET /admin/deposit-requests` | requireAuth + requireAdmin | — |
| `POST /admin/deposit-requests/:id/confirm` | requireAuth + requireAdmin | — |
| `POST /admin/deposit-requests/:id/approve` | requireAuth + requireAdmin | — |
| `POST /admin/deposit-requests/:id/reject` | requireAuth + requireAdmin | — |
| `GET /admin/representatives` | requireAuth + requireAdmin | — |
| `POST /admin/representatives` | requireAuth + requireAdmin | — |
| `DELETE /admin/representatives/:id` | requireAuth + requireAdmin | — |
| `GET /admin/stats` | requireAuth + requireAdmin | — |
| `GET /admin/analytics` | requireAuth + requireAdmin | ⚠️ Full-table scan |
| `GET /admin/ops` | requireAuth + requireAdmin | — |
| Todos `/admin/governance/*` | requireAuth + requireCEO | CEO_EMAILS hardcoded (3 emails) |
| `POST /api/setup/seed` | ❌ Nenhum | 🔴 Sem autenticação |
| `POST /api/setup/admin` | ❌ Nenhum | 🔴 Sem autenticação |
| `GET /api/setup/status` | ❌ Nenhum | 🔴 Sem autenticação |

### 17.2 Papéis administrativos

| Campo | Tipo | Valores conhecidos | Validação |
|---|---|---|---|
| `users.role` | pgEnum | company, freelancer, admin | ✅ Enum PostgreSQL |
| `users.adminRole` | text | super_admin, moderator, support | ❌ Sem enum — qualquer texto aceito |
| `users.corporateRole` | text | ceo, cmo, cco | ❌ Sem enum — qualquer texto aceito |

`requireAdmin` verifica apenas `user.role === "admin"` — qualquer admin pode executar a maioria dos endpoints. Apenas `set-role` requer `adminRole === "super_admin"` (verificação manual).

### 17.3 Classificação por módulo admin

| Página | Dados | Classificação | Observações |
|---|---|---|---|
| Dashboard (index) | KPIs, stats globais | **REAL** | `useGetAdminStats` → DB queries |
| Usuários | Lista, ban, verify, set-role | **REAL** | Carrega até N usuários com `db.select()` sem limit |
| Extras | Lista de jobs | **REAL** | Com filtros de status |
| Saques | Lista, approve, reject | **REAL** | Sem Asaas — aprovação manual |
| Depósitos | Lista, confirm, approve, reject | **REAL** | Sem Asaas — aprovação manual |
| Analytics | Gráficos de crescimento, revenue | **REAL (mas com risco)** | Full-table scan 5 tabelas; cálculo em Node.js |
| Ops | Freelancers ativos, conversões | **REAL (com limitação)** | `activeFreelancers24h` usa `createdAt` (proxy incorreto — deveria usar `lastLoginAt` ou job activity) |
| Mapa | Heatmap por estado | **VISUAL (dados reais, localização aproximada)** | Parseia texto livre de `serviceRegions` e `job.location` — sem coordenadas GPS reais |
| Representantes | CRUD | **REAL** | `stateCode` é text — sem lista de validação dos 27 estados |
| Governança/Config | Taxas por nível | **REAL** | Lê e escreve em `platformConfigTable` |
| Governança/Financeiro | Split config, Asaas config | **REAL** | Asaas sempre disabled na prática |
| Governança/Categorias | CRUD categorias | **REAL** | Soft-archive via status = "archived" |
| Governança/Carteira | Métricas de plataforma + ledger | **REAL (ledger vazio)** | walletLedger nunca populada por operações normais |
| Governança/Usuários | Promoção, overrides de taxa | **REAL** | CEO-only |
| Governança/Equipe | Fotos dos fundadores | **VISUAL/ESTÁTICO** | Paths hardcoded para `/team-*.jpg` |
| Governança/Badges | Grant de badges | **REAL** | Armazenado em `platform_config` como `badge:{userId}:{name}` |
| KYC Admin | Review, approve, reject docs | **REAL (com bug)** | `correction_requested` inválido no enum atual |

### 17.4 Analytics — risco de performance

```javascript
// GET /admin/analytics (admin.ts:408-414)
const [allUsers, allJobs, allTransactions, allApps, allWallets] = await Promise.all([
  db.select().from(usersTable),        // SEM WHERE — tudo
  db.select().from(jobsTable),         // SEM WHERE — tudo
  db.select().from(transactionsTable), // SEM WHERE — tudo ← MAIOR risco
  db.select().from(applicationsTable), // SEM WHERE — tudo
  db.select().from(walletsTable),      // SEM WHERE — tudo
]);
// Cálculos feitos em JS com Array.filter() em memória
```

Com 10.000 transações, esta query carregaria ~800KB em memória. Com 100.000, ~8MB por request de analytics.

### 17.5 Representantes estaduais

| Aspecto | Implementação | Status |
|---|---|---|
| Tabela | `state_representatives` | ✅ Existe |
| CRUD | `/admin/representatives` GET/POST/DELETE | ✅ Implementado |
| Comissão | `commissionRate` (real, default 0.02) | ✅ Configurável |
| Matching por estado | `stateRepresentativesTable WHERE stateCode = :state` | ✅ Implementado em `completeJobCascade` |
| Validação de `stateCode` | ❌ Sem lista de estados válidos — aceita qualquer texto | 🟡 |
| Múltiplos representantes por estado | ⚠️ Possível inserir 2 representantes com mesmo stateCode | 🟠 Sem UNIQUE em (stateCode) |
| Comissão sobre quê | `platformFeeAmount × representativeRate` (não sobre grossAmount) | ✅ |
| Expansão estadual (27 estados) | Estrutura pronta — sem dado de estado no Extra (job.location é texto livre) | 🟠 Match por estado é frágil |

---

## ETAPA 18 — DESIGN

### 18.1 Modo escuro

| Item | Implementação | Detalhe |
|---|---|---|
| Modo padrão | **Dark only** | `:root` e `.dark` compartilham as mesmas CSS vars |
| Light mode | ❌ Não existe | Não há bloco de overrides para `prefers-color-scheme: light` |
| Toggle | ❌ Não implementado | Nenhum seletor de tema na UI |
| Consequência | Sistema operando sempre em dark | Usuários que preferem light mode não têm alternativa |

### 18.2 Sistema de tokens de design

| Variável | Valor | Uso |
|---|---|---|
| `--background` | `hsl(218 28% 9%)` | Fundo geral (navy escuro) |
| `--foreground` | `hsl(0 0% 98%)` | Texto principal |
| `--primary` | `hsl(88 100% 49%)` | Verde neon (#7CFC00) |
| `--secondary` | `hsl(186 100% 50%)` | Ciano neon (#00E5FF) |
| `--accent-gold` | `hsl(42 100% 58%)` | Dourado (features premium) |
| `--card` | `rgba(255,255,255,0.072)` | Glass card background |
| `--card-border` | `rgba(255,255,255,0.11)` | Border de card |
| `--muted-foreground` | `hsl(215 18% 58%)` | Texto secundário |
| `--radius` | CSS var | Radius base |
| `--font-sans` | Outfit, Inter, sans-serif | Body text |
| `--font-display` | Space Grotesk | Headings |
| `--font-mono` | Menlo | Código |

### 18.3 Glass morphism

| Classe | Propriedades | Onde aplicada |
|---|---|---|
| `.glass-card` | `linear-gradient(rgba(255,255,255,0.x) → dark) + backdrop-blur(32px)` | Cards gerais |
| `.glass-1/2/3` | Variações de opacidade | Diferentes profundidades |
| Sidebar | `bg rgba(2,5,10,0.72) backdrop-blur` | Nav lateral |
| `InstitutionalNavbar` | `linear-gradient` + `backdrop-blur` | Navbar pública |

### 18.4 Glow e sombras

| Efeito | CSS | Onde |
|---|---|---|
| Neon green glow | `box-shadow: 0 0 20px rgba(124,252,0,0.15)` | Botões primários, nav pill ativo |
| `.neon-glow` class | `--shadow-neon-green` CSS var | Badges de nível diamond/elite |
| `drop-shadow` | Filter em SVGs/ícones | LevelBadgeIcon |
| Hardcoded no componente | `const G = "#7CFC00"` em InstitutionalNavbar.tsx | Gradientes inline da navbar |

### 18.5 Gradientes

| Tipo | Implementação | Animado |
|---|---|---|
| Background mesh | `body::before` com `@keyframes meshShift` | ✅ Sim |
| `.neon-text-gradient` | `bg-clip-text text-transparent` | ❌ Não |
| `.fintech-hero-card` | Multi-stop linear-gradient | ❌ Não |
| `.balance-card` | Linear-gradient com cores de nível | ❌ Não |
| `.match-chip` | Linear-gradient verde/ciano | ❌ Não |

### 18.6 Tipografia

| Hierarquia | Fonte | Peso | Tracking |
|---|---|---|---|
| H1–H3 | Space Grotesk | 700+ | -0.02em |
| Body | Outfit, Inter | 400–500 | normal |
| Labels/chips | Outfit | 600 | 0.02em+ |
| Código/técnico | Menlo | 400 | normal |

### 18.7 Responsividade

| Padrão | Implementação | Status |
|---|---|---|
| Mobile-first | Tailwind breakpoints (`sm:`, `md:`, `lg:`) | ✅ |
| Bottom navigation | `.bottom-tab-bar` CSS class | ✅ App mobile |
| Desktop-only CTAs | `hidden sm:flex` | ✅ Navbar pública |
| Max-width containers | `max-w-*` + `mx-auto` | ✅ |
| Grid responsivo | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | ✅ |
| Overflow horizontal | `overflow-x-hidden` em layouts | ✅ |
| Viewport mobile | `viewport` meta provavelmente configurado no `index.html` | Não verificado |

### 18.8 Design system — avaliação geral

| Critério | Nota | Observação |
|---|---|---|
| Consistência de tokens | 🟢 Boa | CSS vars usadas na maioria dos componentes |
| Hardcodes de cor | 🟡 Presente em 2 componentes | InstitutionalNavbar usa `const G/C` fora do sistema |
| Legibilidade | 🟡 Risco em texto sobre glow | Neon verde sobre fundo escuro pode ter contraste insuficiente para texto pequeno |
| Dashboard genérico | 🟢 Não — estética específica | Identidade visual distinta de SaaS genérico |
| Mobile | 🟢 Boa cobertura | Bottom nav + breakpoints |
| Acessibilidade | 🔴 Não verificada | Sem ARIA labels, focus states, ou testes de contraste WCAG |
| Dark mode único | 🟡 Limitação | Sem light mode |
| Animações | 🟢 Uso moderado | Framer Motion + CSS animations |

---

## ETAPA 19 — QUALIDADE, TESTES E SEGURANÇA

### 19.1 Qualidade TypeScript

| Padrão | Ocorrências | Arquivo | Risco |
|---|---|---|---|
| `as any` em `req` | Pervasivo (todos os handlers) | `routes/*.ts` | 🟡 `(req as any).user` — sem tipagem de Request estendido |
| `as any` em tipos | InstitutionalNavbar (role casting), global-search | frontend | 🟡 |
| `@ts-ignore` | ❌ Zero encontrado | — | ✅ |
| `@ts-nocheck` | ❌ Zero encontrado | — | ✅ |
| Tipos implícitos | Presentes em parâmetros de callbacks | — | 🟡 |
| Dist desatualizado | lib/db/dist (15 erros TS) | lib/db | 🔴 Produz erros em typecheck |

**Padrão `(req as any).user`:** todos os route handlers castam `req` para `any` para acessar `req.user`. A solução correta seria um Express `Request` estendido via declaration merging. Isso não é um bug funcional mas reduz a segurança de tipos.

### 19.2 Console logs em produção

| Arquivo | Linha | Tipo | Risco |
|---|---|---|---|
| `chat.ts` | Múltiplas | `console.error` | 🟡 Logs de erros de SSE |
| `setup.ts` | Múltiplas | `console.error` | 🟡 |
| `push.ts:53` | 53 | `console.error` | 🟡 |
| `jobs.ts` | — | `console.error/log` | 🟡 |
| `email-service.ts:78` | 78 | `console.log` | 🟡 Log de credenciais de envio |
| `sms-service.ts:131` | 131 | `console.log` | 🟡 Log de credenciais de envio |
| `app.ts` | — | logger (pino) | ✅ Logging estruturado |

pino está configurado mas não é usado uniformemente — `console.log/error` coexistem com o logger estruturado.

### 19.3 TODO / FIXME / código morto

| Arquivo | Linha | Conteúdo | Ação necessária |
|---|---|---|---|
| `asaas.ts:123` | 123 | `// TODO: implement when activated` | Implementar createCharge |
| `asaas.ts:137` | 137 | `// TODO: implement when activated` | Implementar createTransfer |
| `asaas.ts:163` | 163 | `// TODO: implement signature validation` | Implementar webhook |
| `asaas.ts:175` | 175 | `// TODO: implement when activated` | Implementar syncPaymentStatus |
| `legal-documents.ts:19` | 19 | CNPJ placeholder `XX.XXX.XXX/0001-XX` | Preencher CNPJ real |
| `push.ts:43` | 43 | `// For a full implementation, use a dedicated push_subscriptions table` | Migrar de platform_config |
| Todos os arquivos | — | Nenhum `FIXME`, `HACK`, `XXX` encontrado | ✅ |

### 19.4 Promises não tratadas

| Padrão | Ocorrências | Risco |
|---|---|---|
| `.catch(() => {})` silencioso | 20+ ocorrências | 🔴 Erros DB silenciados |
| `auth.ts:20` | `db.insert(sessionsTable)` swallowed | 🔴 Falha de login silenciosa |
| `auth.ts:137` | `db.insert(walletsTable)` swallowed | 🔴 Carteira não criada silenciosamente |
| `admin.ts:48` | Notificação swallowed | 🟡 Notificação perdida |
| `admin.ts:231,275` | Notificações swallowed | 🟡 |
| `applications.ts:224` | `recalculateReputation` swallowed | 🟠 Reputação não recalculada silenciosamente |
| `applications.ts:306` | Notificação swallowed | 🟡 |
| `wallet.ts:176` | Notificação swallowed | 🟡 |
| `verification.ts:139,156,177` | Audit log swallowed | 🟠 Auditoria de verificação perdida |

**Padrão correto:** `.catch((err) => logger.error(err, "context"))` — nem ignora o erro nem quebra o fluxo principal.

### 19.5 CORS

```javascript
// app.ts:30
app.use(cors());  // Sem restrições de origem
```

`cors()` sem opções = **qualquer origem aceita**, incluindo requisições cross-origin de qualquer domínio. Para um endpoint financeiro, o correto seria:

```javascript
cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? false, credentials: false })
```

Risco: requests de qualquer site podem chamar a API com o token do usuário (se obtido via XSS ou outro vetor).

### 19.6 Rate Limiting

| Aspecto | Implementação | Avaliação |
|---|---|---|
| Implementação | In-memory Map por IP+rota | 🟡 |
| Escopo | Por processo — não distribuído | 🟠 Ineficaz em multi-process/deploy |
| Reset on restart | Sim (Map em memória) | 🟠 |
| Rotas protegidas | Auth (login, register) + OTP | ✅ |
| Rotas NÃO protegidas | Admin, governança, APIs de dados, `/referrals/validate` | 🟠 |
| Produção | Necessário WAF/proxy-level rate limit externo | 🟡 |

### 19.7 Validação de inputs

| Rota | Validação Zod | Observação |
|---|---|---|
| `auth.ts` (register/login) | ✅ Completa | |
| `profile-sections.ts` | ✅ Completa | |
| `wallet.ts` (withdraw) | ✅ Parcial | Usa Zod para withdrawal, mas `deposit-request` usa `req.body` direto |
| `feed.ts` | ✅ safeParse | |
| `applications.ts` | ✅ Parcial | |
| `admin.ts` | ⚠️ Parcial | Vários endpoints usam `req.body.amount` sem Zod |
| `governance.ts` | ⚠️ Parcial | `req.body` direto em vários PUT handlers |
| `setup.ts` | ❌ Nenhuma | `req.body` direto |
| `kyc-admin.ts` | ⚠️ Parcial | |

### 19.8 Injeção SQL

| Proteção | Status | Detalhe |
|---|---|---|
| ORM parameterizado | ✅ Drizzle ORM | Todas as queries via Drizzle são parametrizadas |
| `sql` tagged templates | ✅ Parametrizados | `sql\`${walletsTable.balance}\`` |
| String concatenation em SQL | ❌ Nenhuma encontrada | ✅ |
| Raw `db.execute` com input | ❌ Nenhum encontrado | ✅ |

### 19.9 Upload de arquivos

| Aspecto | Status | Risco |
|---|---|---|
| Mecanismo | Base64 em JSON body | 🟠 |
| Validação MIME no server | ❌ Nenhuma | 🟠 Qualquer string aceita como imagem |
| Limite por arquivo | ❌ Apenas limit de 15MB total no JSON | 🟡 |
| Content-type check | ❌ Não | 🟠 |
| Antivírus/sanitização | ❌ Não | 🟠 |
| Armazenamento | `text` column no PostgreSQL | 🔴 Sem CDN, sem object storage |

### 19.10 Autenticação e autorização

| Ponto | Status | Detalhe |
|---|---|---|
| Tokens em memória no servidor | ✅ Em `sessionsTable` (não só em memória) | Tokens perdidos ao restart? **NÃO** — estão no DB |
| Token em `localStorage` | 🟡 Vulnerable a XSS | Alternativa seria httpOnly cookie |
| SHA-256 para senha | 🟠 Sem pepper, sem bcrypt | SHA-256 é reversível por rainbow table |
| Expiração de sessão | ✅ 30 dias | expiresAt em sessionsTable |
| Limpeza de sessões expiradas | ✅ Cron a cada 6h | `index.ts:90` |
| Proteção de admin | ✅ `requireAdmin` | Mas adminRole/corporateRole sem enum |
| Proteção de CEO | ✅ `requireCEO` | Emails hardcoded — não usa campo do banco |
| Setup sem auth | 🔴 | `/api/setup/seed` e `/api/setup/admin` sem proteção |

**Nota sobre SHA-256:** A função `hashPassword` em `lib/auth.ts` usa SHA-256 diretamente (sem bcrypt, argon2 ou PBKDF2). SHA-256 é fast-hash — ~10 bilhões de tentativas/segundo com GPU moderna. Senhas comuns podem ser quebradas em segundos via rainbow table.

### 19.11 CSRF e XSS

| Vetor | Status | Detalhe |
|---|---|---|
| CSRF | ❌ Sem proteção CSRF | Tokens em localStorage (não cookies) reduzem exposição, mas CORS irrestrito aumenta |
| XSS | ⚠️ Uma instância | `chart.tsx:79` — `dangerouslySetInnerHTML` com CSS de tema (conteúdo controlado, não user input) |
| Content Security Policy | ❌ Não configurado | Sem CSP headers no Express |
| HSTS | ❌ Não configurado | |
| X-Frame-Options | ❌ Não configurado | |
| Sanitização de inputs | ❌ Sem DOMPurify | Backend valida via Zod, frontend sem sanitização HTML |

### 19.12 Variáveis de ambiente — inventário completo

| Variável | Sensível | Status no Replit | Uso |
|---|---|---|---|
| `DATABASE_URL` | 🔴 Sim | ❓ Não confirmado como secret | Conexão com banco — crítico |
| `SESSION_SECRET` | 🔴 Sim | ✅ Replit Secret configurado | Autenticação de sessão |
| `VAPID_PUBLIC_KEY` | 🟡 Público | ❓ Não confirmado | Push notifications |
| `VAPID_PRIVATE_KEY` | 🔴 Privado | ❓ Não confirmado como secret | Assinar push notifications |
| `RESEND_API_KEY` | 🔴 Sim | ❓ Não confirmado como secret | Envio de emails |
| `TWILIO_ACCOUNT_SID` | 🔴 Sim | ❓ Não confirmado como secret | SMS/WhatsApp |
| `TWILIO_AUTH_TOKEN` | 🔴 Sim | ❓ Não confirmado como secret | SMS/WhatsApp |
| `TWILIO_PHONE_NUMBER` | 🟡 Semi | ❓ Não confirmado | Número de origem SMS |
| `APP_BASE_URL` | 🟢 Não | ❓ | URLs de links em emails |
| `EMAIL_FROM` | 🟢 Não | ❓ | Remetente de emails |
| `SUPPORT_EMAIL` | 🟢 Não | ❓ | Email de suporte |
| `NODE_ENV` | 🟢 Não | ❓ | Ambiente (dev/production) |
| `LOG_LEVEL` | 🟢 Não | ❓ | Nível de log pino |
| `REPLIT_DEV_DOMAIN` | 🟢 Não | Injetado pelo Replit | Dev preview URL |

**`ASAAS_API_KEY`** — listado na documentação de `asaas.ts` mas **NÃO encontrado em `process.env` calls** — será necessário quando Asaas for ativado.

### 19.13 Testes

| Tipo | Status |
|---|---|
| Testes unitários | ❌ Nenhum arquivo `*.test.ts` ou `*.spec.ts` encontrado |
| Testes de integração | ❌ Nenhum |
| Testes E2E | ❌ Nenhum |
| Configuração de test runner (Jest/Vitest) | ❌ Nenhuma |
| CI/CD pipeline | ❌ Nenhum |
| Coverage | ❌ 0% |

---

## ETAPA 20 — CONTRADIÇÕES

### 20.1 Tabela de contradições entre documentação, interface, código e banco

| # | Regra | Documento | Interface | Código | Banco | Impacto | Severidade |
|---|---|---|---|---|---|---|---|
| 1 | Keys de nível | AI_CONTEXT.md: `"beginner, junior, intermediate, senior, elite"` | Labels: Iniciante, Júnior, Intermediário, Sênior, Elite | Keys reais: `bronze, silver, gold, elite, diamond` | Enum: `(bronze, silver, gold, elite, diamond)` | Agentes criam código com keys erradas | 🔴 |
| 2 | Unidade monetária | Nenhum doc formal | Frontend: `/100` (centavos) | Saque: `< 20` (reais); Depósito: `< 5000` (centavos) | `real` (float ambíguo) | Saldos podem ser exibidos errados | 🔴 |
| 3 | Taxas de nível | Docs/BUSINESS_MODEL.md (não lido); Split Engine = fonte de verdade | `career.tsx`: taxas hardcoded; `referrals.tsx`: taxas hardcoded | Split Engine: carrega do banco com fallback | `platformConfigTable`: configurável | UI exibe taxa errada se CEO alterar | 🟠 |
| 4 | Asaas ativo | AI_CONTEXT.md: "Foundation preparada para ativação" | Sem indicação na UI de que pagamentos são manuais | Todos os métodos retornam `not_implemented` | `financial.asaas_config.enabled = false` | Empresas e freelancers não sabem que saques/depósitos são manuais | 🟠 |
| 5 | wallet_ledger como audit trail | Documentado como "audit trail de movimentações" (AI_CONTEXT.md, AUDITORIA_PARTE_2.md) | Tela de Carteira na Governança exibe ledger | `completeJobCascade` não escreve em `wallet_ledger` | Tabela existe, sem dados de operações normais | Auditoria financeira incompleta e enganosa | 🟠 |
| 6 | escrow como custódia | Documentado como "custódia de pagamentos" | Sem página de escrow | Tabela e schema prontos, sem rotas | Tabela existe, sem dados | Modelo de pagamento prometido não existe | 🟡 |
| 7 | Nome do CEO | seed.ts: `"Leonardo Scheffel"` | landing.tsx + investors: `"Leonardo Scheffel da Rosa"` | setup.ts: `"Leonardo Scheffel da Rosa"` | Depende de qual seed rodou por último | Inconsistência de identidade pública | 🟡 |
| 8 | Emails de controle de acesso | AI_CONTEXT.md: 3 CEO emails; MASTER_ACCOUNTS: 4 emails (inclui Qaialla) | Frontend: Qaialla é MASTER_ACCOUNT | `governance.ts` CEO_EMAILS: 3 emails (sem Qaialla) | Qaialla tem `adminRole: "super_admin"` via seed | Qaialla: master no frontend, sem acesso à governança no backend | 🟠 |
| 9 | SHA-256 para senha | Nenhum doc menciona | Sem indicação de algoritmo para usuário | `lib/auth.ts`: SHA-256 sem salt por bcrypt | Hash em `users.passwordHash` | Senhas vulneráveis a rainbow table | 🔴 |
| 10 | Setup sem auth | AI_CONTEXT.md não menciona | Sem exposição na UI | `/api/setup/seed` e `/api/setup/admin` sem auth | Qualquer um pode chamar os endpoints | Reset não autorizado de contas de produção | 🔴 |
| 11 | Leaderboard por `completedJobs` vs `totalConverted` | Docs de indicações (não lidos) | UI exibe ranking por indicações convertidas | Query inicial ordena por `completedJobs` → pré-filtra top 20 → re-ordena | `usersTable.completedJobs` | Leaderboard pode excluir grandes indicadores com poucos extras | 🟠 |
| 12 | profileCompletion | Calculado no servidor em `users.ts` | UI exibe o valor do banco | seed.ts: hardcoded como 100 ou 80 | Armazenado como integer | Seeds sobrescrevem cálculo real | 🟡 |
| 13 | Thresholds de indicação | Configuráveis via `platformConfigTable` | `referrals.tsx`: thresholds hardcoded | Split Engine: carrega do banco | `financial.referral_thresholds` | UI exibe thresholds errados se CEO alterar | 🟠 |
| 14 | Auth tokens "em memória no servidor" | AI_CONTEXT.md: "Tokens em memória no servidor — perdidos no restart" | — | Tokens INSERT em `sessionsTable` no DB | `sessions` table existe com token + expiresAt | Tokens NÃO são perdidos no restart — estão no banco | 🟡 |
| 15 | Progression em carreira somente | Confirmado por código | Carreira tem progressão; Dashboard tem redirect para freelancers | Freelancers podem acessar `/app/dashboard` diretamente (sem guard) | — | Freelancers veem view de empresa se acessarem URL direta | 🟡 |
| 16 | FK declaradas | Docs não mencionam ausência de FK | — | Sem `.references()` no schema Drizzle | Sem FOREIGN KEY constraints no banco | Dados órfãos possíveis sem cleanup manual | 🟠 |
| 17 | Imagens de governança associadas automaticamente | AI_CONTEXT.md: "seed deve atribuir imagens se disponíveis" | Fotos exibidas na Equipe | `seedMasterAdmin()` NÃO define avatarUrl | avatarUrl pode ser null após startup automático | Governança sem foto se seed manual não rodar | 🟡 |
| 18 | `correction_requested` no accountStatus | Mencionado em código de kyc-admin como valor possível | Admin KYC pode tentar enviar esse status | `kyc-admin.ts` usa esse valor; `accountStatusEnum` não inclui `correction_requested` | Enum: sem esse valor — INSERT falha | Funcionalidade KYC quebrada em produção | 🔴 |
| 19 | candidatura única por job+freelancer | Negócio exige unicidade | UI mostra candidatura duplicada? | Sem check de duplicata no handler | Sem UNIQUE(jobId, freelancerId) | Freelancer pode candidatar-se duas vezes | 🟠 |
| 20 | avaliação única por job+rater | Negócio exige unicidade | — | Sem check de duplicata | Sem UNIQUE(jobId, raterId) | Avaliação duplicada possível — inflação de reputação | 🟠 |

### 20.2 Classificação de todos os módulos

| Módulo | Classificação |
|---|---|
| **Landing Page** | funcional |
| **Login** | funcional |
| **Cadastro/Onboarding** | funcional com limitações (OTP delivery depende de Resend/Twilio configurados) |
| **Centro de Verificação** | parcialmente conectado (KYC request-documents quebrado — enum inválido) |
| **Minha Carreira** | funcional com limitações (dados reais, thresholds/taxas hardcoded na UI) |
| **Dashboard Empresa** | funcional |
| **Buscar Extras** | funcional |
| **Publicar Extra** | funcional |
| **Detalhe do Extra** | funcional |
| **Candidaturas** | funcional |
| **Execução de Extra (check-in/out)** | parcialmente conectado (erros TS no dist compilado) |
| **Carteira** | parcialmente conectado (saldo real, saque/depósito sem gateway ativo) |
| **Indicações** | funcional com limitações (dados reais, UI com thresholds hardcoded) |
| **Feed** | funcional |
| **Rede** | funcional |
| **Perfil** | funcional com limitações (imagens em base64 no DB, sem CDN) |
| **Perfil Público Freelancer** | funcional |
| **Perfil Público Empresa** | funcional |
| **Mensagens/Chat** | funcional com limitações (SSE com fallback por polling) |
| **Notificações** | funcional |
| **Configurações** | funcional |
| **Admin Dashboard** | funcional |
| **Admin Usuários** | funcional |
| **Admin Extras** | funcional |
| **Admin Saques** | parcialmente conectado (aprovação manual sem Asaas) |
| **Admin Depósitos** | parcialmente conectado (aprovação manual sem Asaas) |
| **Admin Analytics** | funcional com limitações (full-table scan sem paginação/agregação SQL) |
| **Admin Ops** | funcional com limitações (`activeFreelancers24h` usa proxy incorreto) |
| **Admin Mapa** | visual (dados reais de texto, sem coordenadas GPS) |
| **Admin Representantes** | funcional |
| **Admin KYC** | quebrado (correction_requested inválido no enum PostgreSQL) |
| **Governança/Config** | funcional |
| **Governança/Financeiro** | funcional com limitações (Asaas sempre desativado) |
| **Governança/Categorias** | funcional |
| **Governança/Carteira** | funcional com limitações (wallet_ledger vazio em operações normais) |
| **Governança/Usuários** | funcional |
| **Governança/Equipe** | visual (paths estáticos hardcoded) |
| **Governança/Badges** | funcional |
| **Split Engine** | funcional |
| **Asaas Integration** | documentado sem implementação |
| **Escrow** | implementado sem documentação de uso |
| **Wallet Ledger (auditoria)** | implementado sem uso (estrutura pronta, sem escrita) |
| **Push Notifications** | parcialmente conectado (VAPID keys necessárias, subscriptions em platform_config) |
| **Blog** | hardcoded |
| **Financial Architecture (7 páginas)** | hardcoded (intencional — conteúdo institucional) |
| **Investidores & Parceiros** | hardcoded (intencional — conteúdo institucional) |
| **Segurança (página)** | hardcoded (intencional) |
| **Modelo de Negócio (página)** | hardcoded (intencional) |
| **Testes automatizados** | não encontrado |

---

# RELATÓRIO FINAL CONSOLIDADO

## 1. Resumo Executivo

extraGO é uma plataforma de marketplace de mão de obra profissional (Extras) desenvolvida em monorepo TypeScript com Express 5 + React 19 + PostgreSQL/Drizzle. A plataforma está **operacional para seu núcleo de negócio** — cadastro, publicação de Extras, candidatura, check-in/checkout, e controle administrativo — mas apresenta **lacunas críticas** em quatro áreas: integridade financeira (valores em float, gateway não ativo), segurança (CORS irrestrito, setup sem auth, SHA-256 para senhas), qualidade de dados (sem FK, sem unique constraints em entidades de negócio), e cobertura de testes (zero).

A arquitetura é bem estruturada e deliberada — Split Engine, escrow, wallet_ledger e Asaas foram projetados corretamente como fundação — mas permanecem parcialmente ou totalmente sem implementação ativa. A documentação (AI_CONTEXT.md + pasta docs/) existe e é abrangente, mas contém contradições técnicas que podem induzir erros de implementação futura.

---

## 2. Banco de Dados

- **35 tabelas**, 25 enums PostgreSQL, pool max:10
- **Zero FK declaradas** — integridade referencial apenas por código
- **Todos os valores monetários em `real` (float4)** — risco de arredondamento acumulado
- **Sem índices em campos FK** (walletId, jobId, freelancerId, etc.) — degradação com escala
- **KYC files como base64 em coluna text** — bloat sem limite
- `wallet_ledger` e `escrows` existem mas sem dados em operação normal
- **Sem UNIQUE em `(jobId, freelancerId)` em applications** e `(jobId, raterId)` em ratings
- Dist compilado desatualizado (15 erros TS) — job_events, job_codes ausentes

---

## 3. Migrations

- **Sem migrations** — apenas `drizzle-kit push`
- Sem histórico, sem rollback, `push-force` disponível (risco de DROP)
- Sem CI que impeça push direto em produção

---

## 4. Seeds

- 4 mecanismos: `seedMasterAdmin` (startup automático), `/api/setup/seed` (sem auth 🔴), `/api/setup/admin` (sem auth 🔴), documentos legais
- 6 contas de produção provisionadas com senhas hardcoded no código-fonte
- CNPJ placeholder em documento legal de produção
- Fotos de governança (`/team-*.jpg`) associadas apenas por seed manual — startup automático não as define

---

## 5. Mocks e Hardcoded

- **28 itens catalogados** (ver Etapa 10 da Parte 2)
- **Críticos:** taxas de nível em 4 locais distintos não sincronizados com Split Engine; emails de controle de acesso no código-fonte; senhas de contas de produção no código
- **Intencionais (OK):** páginas institucionais, Financial Architecture, blog

---

## 6. Documentação

- `AI_CONTEXT.md` presente e útil, mas com contradição crítica nos keys de nível
- `docs/` com 8 arquivos (não lidos integralmente nesta auditoria)
- `openapi.yaml` cobre ~40% das rotas — 9 módulos sem spec
- Hooks gerados (`api-client-react`) cobrindo apenas spec — outros módulos via `apiFetch` direto
- **README.md ausente** no raiz

---

## 7. Módulos

| Classificação | Quantidade | Exemplos |
|---|---|---|
| Funcional | 20 | Landing, Login, Dashboard, Buscar Extras, Feed, Rede, Perfil, Admin |
| Funcional com limitações | 8 | Carreira, Indicações, Analytics, Onboarding, Carteira, Ops, Governança/Financeiro |
| Parcialmente conectado | 6 | Verificação KYC, Execução Extra, Saques, Depósitos, Chat, Push |
| Quebrado | 1 | Admin KYC (correction_requested inválido) |
| Visual | 1 | Admin Mapa |
| Hardcoded intencional | 9 | Blog, FA, institucionais |
| Documentado sem implementação | 1 | Asaas |
| Implementado sem uso | 2 | Escrow, Wallet Ledger |
| Não encontrado | 1 | Testes automatizados |

---

## 8. Minha Carreira

- 991 linhas, exclusivo de freelancers, dados reais via API
- Thresholds e taxas hardcoded (não refletem governança)
- Achievements definidos localmente, não persistidos no banco
- Cálculo de economia usa R$250 fictício como base
- Dashboard ainda acessível para freelancers via URL direta

---

## 9. Perfil

- 4 seções persistidas: dados core (users), categorias (user_categories), experiência (work_experiences), habilidades (user_skills)
- Upload de imagem: base64 → coluna text no banco (sem CDN)
- Fotos de governança: paths estáticos associados apenas por seed manual
- Progressão de carreira confinada exclusivamente em `/app/career` ✅
- PUT de categorias sem transação — possível perda de dados em falha parcial
- Perfil público: verificar se pixKey/cpf/phone são retornados (não confirmado)

---

## 10. Financeiro

- **Split Engine funcional** — lê do banco (platformConfigTable), cache 60s, Math.round() em centavos
- **Fórmula:** platformFee → freelancerGross → referralFee → representativeFee → reserveFund → netFreelancer ✅
- **Unidade monetária inconsistente** entre endpoints (centavos vs reais — ver §15.3)
- **Gateway Asaas: 100% não implementado** — todos os métodos retornam `not_implemented`
- Saque e depósito: fluxo completo com aprovação manual (admin)
- wallet_ledger não é escrito por `completeJobCascade` — auditoria incompleta
- escrow: schema completo, zero uso em produção

---

## 11. Indicações

- Tracking: referredById capturado no registro ✅
- Conversão: ≥5 extras + isVerified (calculado em query time)
- Tiers: 3 níveis (2%/3%/5%) com Embaixador requerendo aprovação manual ✅
- Pagamento: dentro de `completeJobCascade`, como transaction type "commission" ✅
- Anti-fraude: self-referral impossível na prática mas sem guard formal; enumeração de códigos sem rate limit
- Leaderboard: anomalia na ordenação inicial (completedJobs vs totalConverted)
- UI: thresholds e taxas hardcoded — não refletem platformConfigTable

---

## 12. Admin

- 15+ endpoints protegidos por requireAdmin ✅
- Analytics com full-table scan de 5 tabelas simultaneamente (risco O(n))
- Ops: proxy de `createdAt` para "ativo nas últimas 24h" (incorreto)
- Aprovação de saque e depósito sem Asaas ativo = transferências manuais
- Sem paginação server-side em listagem de usuários

---

## 13. Governança

- CEO-only via emails hardcoded (3 endereços literais no código-fonte)
- 7 tabs: Config, Financeiro, Categorias, Carteira, Usuários, Equipe, Badges
- Split Engine wired à governança ✅ — Asaas wired mas disabled ✅
- wallet_ledger lido mas não populado ⚠️
- escrow config presente (escrowRules) mas escrow nunca criado

---

## 14. Representantes

- CRUD funcional em `/admin/representatives` ✅
- Comissão paga de `platformFeeAmount × representativeRate` dentro de `completeJobCascade` ✅
- Sem UNIQUE em `(userId, stateCode)` — possível representante duplicado por estado
- stateCode: text livre sem validação dos 27 estados
- Matching por estado: `job.location` é texto livre — matching é frágil

---

## 15. Integrações

| Integração | Status | Detalhe |
|---|---|---|
| Asaas (pagamentos) | ❌ Foundation only | `enabled: false`, todos os métodos retornam `not_implemented` |
| Resend (email) | ✅ Wired, sem key confirmada | `email-service.ts` — RESEND_API_KEY necessária |
| Twilio (SMS/WhatsApp) | ✅ Wired, sem key confirmada | `sms-service.ts` — TWILIO_* necessários |
| Push Notifications (VAPID) | ✅ Wired, sem keys confirmadas | `push.ts` — VAPID_* necessários |
| Nominatim (geocoding) | ✅ Externo público | Usado em Buscar Extras para coordenadas |
| Object Storage (S3/GCS) | ❌ Não integrado | Imagens em base64 no banco |
| CDN | ❌ Não configurado | Assets servidos pelo Express |

---

## 16. Design

- Dark-only, sem light mode, sem toggle
- Neon Green + Neon Cyan como cores primárias/secundárias
- Glass morphism + glow effects + animated mesh gradient
- Mobile-first com bottom navigation para app
- Space Grotesk (display) + Outfit/Inter (body) + Menlo (mono)
- 1 instância de hardcoded color fora do token system (InstitutionalNavbar)
- 1 `dangerouslySetInnerHTML` com conteúdo controlado (chart.tsx)
- Acessibilidade não avaliada (sem ARIA, sem WCAG)

---

## 17. Segurança

| Vulnerabilidade | Severidade | Detalhe |
|---|---|---|
| `/api/setup/seed` sem autenticação | 🔴 Crítico | Qualquer um pode resetar senhas de contas de produção |
| `/api/setup/admin` sem autenticação | 🔴 Crítico | Idem — endpoint legado |
| SHA-256 sem bcrypt/argon2 para senhas | 🔴 Alto | Vulnerável a rainbow table |
| CORS irrestrito (`cors()` sem origin) | 🔴 Alto | API aceita requests de qualquer origem |
| Senhas de produção no código-fonte | 🔴 Alto | seed.ts expõe hashes e senhas |
| Sem ASAAS_API_KEY como secret | 🟠 Médio | Chave futura não protegida ainda |
| VAPID_PRIVATE_KEY, RESEND_API_KEY, TWILIO sem secret | 🟠 Médio | Keys não confirmadas como Replit Secrets |
| Token em localStorage (XSS exposure) | 🟠 Médio | httpOnly cookie seria mais seguro |
| 20+ `.catch(() => {})` silenciosos | 🟠 Médio | Erros de DB ignorados silenciosamente |
| Sem CSRF protection | 🟠 Médio | Combinado com CORS irrestrito |
| Rate limit in-memory (não distribuído) | 🟠 Médio | Reset on restart, ineficaz em multi-process |
| Upload sem validação MIME | 🟠 Médio | Qualquer string aceita como imagem |
| Math.random() para códigos de 6 dígitos | 🟡 Baixo | Não é CSPRNG |
| Sem CSP/HSTS/X-Frame-Options headers | 🟡 Baixo | Headers de segurança ausentes |
| Enumeração de códigos de indicação | 🟡 Baixo | `/referrals/validate` sem rate limit |

---

## 18. Qualidade

| Métrica | Status |
|---|---|
| TypeScript errors | 15 (dist desatualizado) |
| `as any` pervasivo | ✅ Funcional mas sem type safety nos handlers |
| `@ts-ignore` | ✅ Zero |
| console.log em produção | 🟡 6+ arquivos |
| `.catch(() => {})` silencioso | 🔴 20+ instâncias |
| Validação Zod | ✅ Presente na maioria dos endpoints; ausente em admin e governance |
| SQL injection | ✅ Protegido via Drizzle ORM |
| Operações não-atômicas | 🟠 PUT de categorias sem transação |
| Duplicação de lógica (taxas) | 🟠 4 locais diferentes |

---

## 19. Testes

- **Zero testes automatizados** — sem arquivos `*.test.ts`, `*.spec.ts`, nem configuração de test runner
- Sem CI/CD pipeline
- Sem validação de contrato OpenAPI
- Sem smoke tests de startup
- Cobertura: **0%**

---

## 20. Contradições

20 contradições catalogadas em §20.1. As 5 mais críticas:

1. **Keys de nível** — AI_CONTEXT.md usa nomes errados → induz erros de implementação
2. **Unidade monetária** — centavos vs reais inconsistente entre endpoints
3. **Setup sem auth** — contas de produção resetáveis sem autorização
4. **SHA-256** — não documentado, vulnerável
5. **Admin KYC quebrado** — `correction_requested` inválido no enum PostgreSQL

---

## 21. Estado Real da Plataforma

| Dimensão | Estado |
|---|---|
| **Núcleo operacional** | ✅ Funcional — cadastro, extras, candidatura, check-in/out, admin |
| **Financeiro operacional** | ⚠️ Parcial — split engine OK, gateway manual (sem Asaas), saldo sem confirmação real |
| **KYC/Verificação** | ⚠️ Parcial — OTP funciona (se keys configuradas), request-documents quebrado |
| **Segurança** | 🔴 Insuficiente para produção — setup sem auth, SHA-256, CORS irrestrito |
| **Auditoria financeira** | ⚠️ Incompleta — wallet_ledger vazio, escrow sem uso |
| **Escalabilidade** | ⚠️ Risco — full-table scans em analytics, sem índices em FKs, imagens no banco |
| **Testes** | 🔴 Zero coverage |
| **Integrações** | 🔴 Todas opcionais — emails/SMS sem keys confirmadas, Asaas desativado |
| **Documentação técnica** | 🟡 Presente mas com contradições |

---

## 22. Riscos por Prioridade

| # | Risco | Severidade | Categoria |
|---|---|---|---|
| 1 | `/api/setup/seed` e `/api/setup/admin` sem auth | 🔴 Crítico | Segurança |
| 2 | SHA-256 sem bcrypt — senhas vulneráveis | 🔴 Crítico | Segurança |
| 3 | CORS irrestrito | 🔴 Crítico | Segurança |
| 4 | Senhas de contas de produção versionadas no código | 🔴 Crítico | Segurança |
| 5 | Admin KYC quebrado (`correction_requested` enum inválido) | 🔴 Crítico | Bug |
| 6 | Unidade monetária inconsistente (centavos vs reais) | 🔴 Crítico | Financeiro |
| 7 | Valores monetários em `real` (float) | 🔴 Alto | Financeiro |
| 8 | Sem FK no banco — risco de dados órfãos | 🟠 Alto | Dados |
| 9 | 20+ `.catch(() => {})` silenciosos — erros de DB ignorados | 🟠 Alto | Qualidade |
| 10 | Asaas não ativo — saques/depósitos manuais sem notificação ao usuário | 🟠 Alto | UX/Financeiro |
| 11 | wallet_ledger vazio — auditoria financeira incompleta | 🟠 Alto | Auditoria |
| 12 | Full-table scan em analytics (5 tabelas sem WHERE) | 🟠 Alto | Performance |
| 13 | KYC files como base64 no banco — crescimento ilimitado | 🟠 Alto | Infraestrutura |
| 14 | Sem UNIQUE em applications(jobId, freelancerId) | 🟠 Alto | Integridade |
| 15 | Taxas hardcoded no frontend — divergência da governança | 🟠 Alto | Negócio |
| 16 | Leaderboard anomalia de ordenação | 🟡 Médio | Negócio |
| 17 | Sem paginação server-side em listagem admin | 🟡 Médio | Performance |
| 18 | Imagens de governança não associadas no startup automático | 🟡 Médio | Configuração |
| 19 | Sem índices em campos FK | 🟡 Médio | Performance |
| 20 | Zero cobertura de testes | 🟡 Médio | Qualidade |

---

## 23. Top 20 Descobertas

1. **`/api/setup/seed` e `/api/setup/admin` sem autenticação** — qualquer agente externo pode resetar senhas de produção via HTTP
2. **SHA-256 sem bcrypt** — senhas vulneráveis a rainbow table com hardware moderno
3. **CORS irrestrito** — `app.use(cors())` sem origin — aceita qualquer domínio
4. **Admin KYC completamente quebrado** — `correction_requested` não é valor válido do enum `accountStatusEnum` no PostgreSQL — INSERT falha em produção
5. **Unidade monetária inconsistente** — saque usa `< 20` (reais), depósito usa `< 5000` (centavos), frontend divide por 100 assumindo centavos
6. **wallet_ledger nunca populada** — todas as operações financeiras passam por `completeJobCascade` que não escreve nessa tabela — auditoria formal vazia
7. **escrow: implementado, zero uso** — tabela com 8 status e 15 campos, sem nenhuma rota criando registros
8. **Asaas: 100% stubs** — todos os métodos retornam `not_implemented` — saques aprovados pelo admin não transferem dinheiro real
9. **Senhas de contas de produção versionadas** — `seed.ts` e `setup.ts` contêm hashes e/ou senhas plaintexts de contas reais no repositório
10. **Taxas de nível em 4 locais distintos** — career.tsx, referrals.tsx, ecosystem.ts, platformConfigTable — risco de divergência se CEO alterar via governança
11. **AI_CONTEXT.md com keys de nível erradas** — documenta `beginner/junior/intermediate/senior/elite` mas enum real é `bronze/silver/gold/elite/diamond`
12. **20+ `.catch(() => {})` silenciosos** — falhas de DB em operações críticas (carteiras, sessões, notificações) são ignoradas
13. **Sem FK constraints no banco** — 35 tabelas sem FOREIGN KEY — cascatas dependem de código manual
14. **Todos os valores monetários em `real` (float4)** — aritmética de ponto flutuante em operações financeiras
15. **Qaialla tem acesso de super_admin no banco mas não à governance no backend** — CEO_EMAILS tem 3 emails, MASTER_ACCOUNTS frontend tem 4
16. **Leaderboard de indicações filtra primeiros 20 por `completedJobs`** — pode excluir grandes indicadores com poucos extras próprios
17. **Upload de imagens sem validação de MIME** — qualquer string aceita como avatarUrl — possível XSS via SVG/data URI
18. **Sem UNIQUE em `(jobId, freelancerId)` em applications** — candidatura duplicada possível sem constraint
19. **PUT de categorias de perfil sem transação** — DELETE + INSERT separados — perda de dados em falha parcial
20. **Rate limit in-memory e não distribuído** — reset no restart; ineficaz em deploy com múltiplos processos

---

## 24. Próximos Passos Recomendados

### P0 — Crítico (antes de qualquer usuário real)

1. **Proteger `/api/setup/seed` e `/api/setup/admin`** com `requireAdmin` ou remover do ambiente de produção
2. **Migrar passwordHash de SHA-256 para bcrypt/argon2** com custo adaptativo
3. **Restringir CORS** para domínios conhecidos da plataforma
4. **Corrigir enum `accountStatusEnum`** — adicionar `correction_requested` ou corrigir código de kyc-admin para usar valor válido
5. **Resolver inconsistência de unidade monetária** — definir se wallet usa centavos ou reais e padronizar todos os endpoints

### P1 — Alta Prioridade (antes de escalar)

6. **Declarar FK constraints** em todas as relações no schema Drizzle
7. **Adicionar UNIQUE(jobId, freelancerId)** em applications e UNIQUE(jobId, raterId) em ratings
8. **Implementar wallet_ledger** — fazer `completeJobCascade` escrever no ledger a cada operação
9. **Migrar valores monetários de `real` para `numeric`** (ou manter `real` e garantir que são centavos como integer)
10. **Mover KYC files para object storage** (S3/R2) — remover base64 do banco

### P2 — Médio Prazo

11. **Corrigir `.catch(() => {})` silenciosos** — usar `logger.error` em todos
12. **Implementar paginação server-side** em admin/users e admin/analytics
13. **Criar endpoint de taxas para o frontend** — `/api/config/level-fees` retornando `platformConfigTable` — eliminar hardcodes
14. **Adicionar UNIQUE(userId, stateCode)** em state_representatives
15. **Ativar Asaas** seguindo o checklist em `asaas.ts` — mover saques e depósitos para o gateway
16. **Adicionar índices** em walletId, jobId, freelancerId, userId nas tabelas de acesso frequente
17. **Corrigir leaderboard** — query inicial deveria ordenar por indicações convertidas, não por completedJobs

### P3 — Qualidade

18. **Implementar testes** — ao menos smoke tests de startup e testes dos endpoints críticos financeiros
19. **Estender Request do Express** para eliminar `(req as any).user` em todos os handlers
20. **Padronizar logging** — substituir `console.log/error` por `logger.error` do pino em todos os arquivos
21. **Corrigir AI_CONTEXT.md** — atualizar keys de nível para os valores reais do enum
22. **Adicionar CSP/HSTS/X-Frame-Options headers** no Express

---

## 25. Inventário de Arquivos Analisados

### Backend — `artifacts/api-server/src/`

| Arquivo | Etapa(s) |
|---|---|
| `index.ts` | P1, 9 |
| `app.ts` | P1, 19 |
| `routes/index.ts` | P1 |
| `routes/auth.ts` | P1, 16, 19 |
| `routes/users.ts` | P1, 10, 14 |
| `routes/jobs.ts` | P1, 10 |
| `routes/applications.ts` | P1, 19 |
| `routes/wallet.ts` | P1, 15, 19 |
| `routes/referrals.ts` | P1, 16 |
| `routes/notifications.ts` | P1 |
| `routes/stats.ts` | P1, 10 |
| `routes/admin.ts` | P1, 17, 19 |
| `routes/governance.ts` | P1, 17 |
| `routes/kyc-admin.ts` | P1, 17 |
| `routes/feed.ts` | P1, 10 |
| `routes/chat.ts` | P1 |
| `routes/profile-sections.ts` | P1, 14 |
| `routes/categories.ts` | P1 |
| `routes/job-execution.ts` | P1, 10 |
| `routes/push.ts` | P1, 19 |
| `routes/verification.ts` | P1, 19 |
| `routes/seed.ts` | P1, 9, 10 |
| `routes/setup.ts` | P1, 9, 10, 19 |
| `lib/auth.ts` | P1, 19 |
| `lib/split-engine.ts` | P1, 15 |
| `lib/ecosystem.ts` | P1, 15, 16 |
| `lib/asaas.ts` | P1, 15 |
| `lib/dev-whitelist.ts` | P1, 10 |
| `lib/rate-limit.ts` | P1, 19 |
| `lib/legal-documents.ts` | P1, 9 |
| `lib/legal-documents-seed.ts` | P1, 9 |
| `lib/notifications.ts` | P1 |
| `lib/verification.ts` | P1, 19 |

### Banco de Dados — `lib/db/src/schema/`

| Arquivo | Etapa(s) |
|---|---|
| `index.ts` | P2, 7 |
| `users.ts` | P1, 7 |
| `jobs.ts` | P1, 7 |
| `job-events.ts` | P1, 7 |
| `job-codes.ts` | P1, 7 |
| `applications.ts` | P2, 7 |
| `wallet.ts` | P2, 7, 15 |
| `notifications.ts` | P2, 7 |
| `ratings.ts` | P2, 7 |
| `messages.ts` | P2, 7 |
| `sessions.ts` | P2, 7 |
| `representatives.ts` | P2, 7 |
| `config.ts` | P2, 7 |
| `categories.ts` | P2, 7 |
| `ledger.ts` | P2, 7 |
| `escrow.ts` | P2, 7 |
| `verification.ts` | P1, 7 |
| `lib/db/src/index.ts` | P2, 7 |
| `lib/db/dist/schema/index.d.ts` | P1, 7 |

### Frontend — `artifacts/extrag0/src/`

| Arquivo | Etapa(s) |
|---|---|
| `App.tsx` | P1, 12 |
| `hooks/use-auth.tsx` | P1 |
| `pages/landing.tsx` | P2, 10 |
| `pages/blog.tsx` | P2, 10 |
| `pages/investidores-parceiros.tsx` | P2, 10 |
| `pages/financial-architecture/*.tsx` | P2, 10 |
| `pages/app/career.tsx` | P2, 13 |
| `pages/app/dashboard.tsx` | P2, 13 |
| `pages/app/wallet.tsx` | P2, 15 |
| `pages/app/referrals.tsx` | P2, 16 |
| `pages/app/feed.tsx` | P2 |
| `pages/app/applications.tsx` | P2 |
| `pages/app/profile.tsx` | P2, 14 |
| `pages/app/freelancer-profile.tsx` | P3, 14 |
| `pages/app/company-profile.tsx` | P3, 14 |
| `pages/dashboard-redirect.tsx` | P2, 13 |
| `pages/admin/analytics.tsx` | P3, 17 |
| `pages/admin/governance.tsx` | P3, 17 |
| `config/test-accounts.ts` | P2, 10 |
| `config/master-accounts.ts` | P3, 10, 20 |
| `lib/test-accounts.ts` | P2, 10 |
| `components/level-badge.tsx` | P2, 13 |
| `components/ui/chart.tsx` | P3, 19 |
| `src/index.css` | P3, 18 |
| `tailwind.config.ts` | P3, 18 |

### Documentação

| Arquivo | Etapa(s) |
|---|---|
| `AI_CONTEXT.md` | P3, 11, 20 |
| `replit.md` | P2, 11 |
| `AUDITORIA_PARTE_1.md` | — |
| `lib/api-spec/openapi.yaml` | P2, 11 |
| `lib/api-spec/orval.config.ts` | P2, 11 |

---

> **Arquivos modificados: nenhum**  
> **Arquivos criados: nenhum** (além dos relatórios de auditoria)  
> **Impacto arquitetural: nenhum**

*Auditoria 100% somente leitura — nenhuma linha de código foi alterada.*
