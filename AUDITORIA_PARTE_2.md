# AUDITORIA TÉCNICA extraGO — PARTE 2
## Etapas 7 a 13

> Data: 13 de julho de 2026 · Modo: somente leitura · Nenhum arquivo alterado.
> Contexto de partida: `AUDITORIA_PARTE_1.md`

---

## ETAPA 7 — BANCO DE DADOS

### 7.1 Identificação

| Campo | Valor |
|---|---|
| Banco | PostgreSQL 16 (provisionado pelo Replit) |
| ORM | Drizzle ORM ^0.45.2 |
| Pool | `pg.Pool` — max:10, idleTimeout:30 s, connTimeout:5 s |
| Config | `lib/db/drizzle.config.ts` — lê `DATABASE_URL` (lança Error se ausente) |
| Entrypoint | `lib/db/src/index.ts` — exporta `pool`, `db`, e re-exporta todos os schemas |
| Schema fonte | `lib/db/src/schema/index.ts` — 16 arquivos |
| Schema compilado | `lib/db/dist/schema/index.d.ts` — **desatualizado**: `job-events` e `job-codes` ausentes do dist |

### 7.2 Enums PostgreSQL (definidos como `pgEnum`)

| Enum | Valores | Arquivo |
|---|---|---|
| `role` | company, freelancer, admin | users.ts |
| `level` | bronze, silver, gold, elite, diamond | users.ts |
| `post_type` | general, job_completion, availability | users.ts |
| `job_status` | open, scheduled, waiting_checkin, checked_in, in_progress, on_break, waiting_checkout, completed, cancelled, disputed | jobs.ts |
| `shift_type` | hourly, daily | jobs.ts |
| `job_event_type` | created, edited, accepted, checkin_code_generated, checkin_validated, started, paused, resumed, checkout_code_generated, checkout_validated, finished, cancelled, disputed, payment_released, wallet_reserved, wallet_released, face_scan_requested | job-events.ts |
| `job_code_type` | checkin_company, checkin_freelancer, checkout_company, checkout_freelancer | job-codes.ts |
| `application_status` | pending, approved, rejected, completed, cancelled, counter_offered, counter_accepted, counter_rejected | applications.ts |
| `wallet_type` | freelancer, company, representative, platform | wallet.ts |
| `transaction_type` | credit, debit, withdrawal, commission, refund, deposit, platform_fee, reservation, release | wallet.ts |
| `transaction_status` | pending, completed, failed, rejected | wallet.ts |
| `deposit_method` | pix, credit_card, bank_transfer | wallet.ts |
| `deposit_status` | pending, confirmed, rejected, credited | wallet.ts |
| `account_status` | draft, pending_email, pending_phone, pending_documents, pending_review, verified, rejected, blocked, inactive | verification.ts |
| `legal_document_type` | terms_of_use, privacy_policy, lgpd, freelancer_agreement, company_agreement, payment_policy, cancellation_policy, community_guidelines, anti_fraud_policy | verification.ts |
| `legal_document_status` | draft, published, archived | verification.ts |
| `email_verification_purpose` | verify_email, password_reset, change_email | verification.ts |
| `phone_verification_channel` | sms, whatsapp | verification.ts |
| `kyc_document_type` | rg, cnh, cpf_card, cnpj_card, proof_of_address, selfie, company_contract, other | verification.ts |
| `kyc_document_status` | pending, approved, rejected, correction_requested | verification.ts |
| `kyc_review_action` | approved, rejected, correction_requested, comment | verification.ts |
| `fraud_log_type` | duplicate_cpf, duplicate_cnpj, duplicate_email, duplicate_phone, disposable_email, rate_limit_exceeded, account_locked, suspicious_login, other | verification.ts |
| `escrow_status` | draft, open, funded, in_progress, completed, released, cancelled, disputed | escrow.ts |
| `category_status` | active, archived | categories.ts |

**Nota:** `adminRole` e `corporateRole` são colunas `text` — **não são enums PostgreSQL**. O banco aceita qualquer string. A validação ocorre apenas em código.

### 7.3 Tabelas (35 no total)

#### Tabela detalhada por domínio

---

**`users`** — Entidade central do sistema

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | PK |
| email | text | N | — | UNIQUE |
| passwordHash | text | N | — | SHA-256+salt |
| name | text | N | — | |
| role | roleEnum | N | — | |
| adminRole | text | S | — | Não é pgEnum |
| corporateRole | text | S | — | Não é pgEnum |
| avatarUrl | text | S | — | Base64 ou path |
| bannerUrl | text | S | — | |
| bio | text | S | — | |
| professionalSummary | text | S | — | |
| phone | text | S | — | |
| companyName | text | S | — | company role |
| pixKey | text | S | — | |
| categories | text[] | N | [] | |
| languages | text[] | N | [] | |
| serviceRegions | text[] | N | [] | |
| availability | jsonb | S | — | |
| level | levelEnum | N | bronze | |
| reputationScore | real | N | 0 | ⚠️ float para score |
| completedJobs | integer | N | 0 | |
| responseRate | real | N | 0 | |
| isVerified | boolean | N | false | |
| isBanned | boolean | N | false | |
| profileCompletion | integer | N | 0 | |
| accountStatus | accountStatusEnum | N | draft | |
| cpf | text | S | — | UNIQUE |
| cnpj | text | S | — | UNIQUE |
| emailVerifiedAt | timestamp | S | — | |
| phoneVerifiedAt | timestamp | S | — | |
| failedLoginAttempts | integer | N | 0 | |
| lockedUntil | timestamp | S | — | |
| lastLoginAt | timestamp | S | — | |
| referralCode | text | N | — | UNIQUE |
| referredById | integer | S | — | FK implícita → users.id |
| ambassadorApproved | boolean | N | false | |
| isDemo | boolean | N | false | Filtro de dados demo |
| customFee | real | S | — | Override governança |
| customReferralRate | real | S | — | Override governança |
| governanceNotes | text | S | — | Notas CEO |
| createdAt | timestamp | N | now() | |

**Dados pessoais:** email, name, phone, cpf, cnpj, pixKey, avatarUrl, bio.
**Dados financeiros:** reputationScore, customFee, customReferralRate, totalEarned (via wallet).

---

**`user_categories`** — Categorias profissionais do freelancer

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| userId | integer | N | — | FK implícita → users.id |
| category | text | N | — |
| isPrimary | boolean | N | false |
| subspecialties | text[] | N | [] |
| yearsExperience | integer | N | 0 |
| certifications | text[] | N | [] |
| createdAt | timestamp | N | now() |

---

**`work_experiences`** — Histórico profissional

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| userId | integer | N | — |
| company | text | N | — |
| role | text | N | — |
| startDate | text | N | — |
| endDate | text | S | — |
| description | text | S | — |
| achievements | text[] | N | [] |
| imageUrls | text[] | N | [] |
| createdAt | timestamp | N | now() |

---

**`user_skills`** — Habilidades do profissional

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| userId | integer | N | — |
| skill | text | N | — |
| endorsements | integer | N | 0 |
| createdAt | timestamp | N | now() |

---

**`user_follows`** — Relacionamentos sociais (seguir/seguindo)

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| followerId | integer | N | — |
| followingId | integer | N | — |
| createdAt | timestamp | N | now() |

**Índice único:** `user_follows_unique` ON (follower_id, following_id) — único índice não-PK/UNIQUE explicitamente definido no schema.

---

**`posts`** — Feed social

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| userId | integer | N | — |
| content | text | N | — |
| imageUrls | text[] | N | [] |
| postType | postTypeEnum | N | general |
| likes / saves / reposts | integer | N | 0 |
| createdAt | timestamp | N | now() |

**`post_comments`, `post_likes`, `post_saves`** — Interações sociais com posts. Estrutura similar: id, postId, userId, createdAt.

---

**`jobs`** — Extras (oportunidades de trabalho)

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | PK |
| title | text | N | — | |
| description | text | N | — | |
| category | text | N | — | Não FK para categories |
| location | text | N | — | Texto livre |
| date | text | N | — | Formato ISO string |
| startTime / endTime | text | N | — | HH:MM |
| workersNeeded | integer | N | 1 | Vagas disponíveis |
| workersApproved | integer | N | 0 | Aprovados |
| hourlyRate | real | N | — | ⚠️ float para dinheiro |
| dailyRate | real | S | — | |
| shiftType | shiftTypeEnum | N | hourly | |
| totalValue | real | N | 0 | ⚠️ float para dinheiro |
| status | jobStatusEnum | N | open | 10 estados |
| companyId | integer | N | — | FK implícita → users.id |
| walletReservationId | text | S | — | Referência de reserva |
| createdAt / updatedAt | timestamp | N | now() | |

---

**`job_events`** — Log imutável de eventos de execução de Extras

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| jobId | integer | N | — |
| eventType | jobEventTypeEnum | N | — | 17 tipos |
| actorId | integer | S | — |
| actorRole | text | S | — |
| ipAddress / userAgent | text | S | — |
| gps / metadata | jsonb | S | — |
| createdAt | timestamp | N | now() |

---

**`job_codes`** — Códigos de check-in/checkout (6 dígitos)

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| jobId | integer | N | — |
| applicationId | integer | S | — |
| codeType | jobCodeTypeEnum | N | — | 4 tipos |
| code | text | N | — |
| expiresAt | timestamp | N | — | Obrigatório |
| usedAt | timestamp | S | — |
| usedByUserId | integer | S | — |
| ipAddress / gps | text | S | — |
| createdAt | timestamp | N | now() |

---

**`applications`** — Candidaturas de Extras

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| jobId | integer | N | — |
| freelancerId | integer | N | — |
| status | applicationStatusEnum | N | pending | 8 estados |
| message | text | S | — |
| proposedRate | real | S | — | ⚠️ float para dinheiro |
| appliedAt | timestamp | N | now() |

---

**`wallets`** — Carteiras financeiras (1 por usuário)

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | PK |
| userId | integer | N | — | UNIQUE — 1 carteira por usuário |
| walletType | walletTypeEnum | N | freelancer | |
| balance | real | N | 0 | ⚠️ float para dinheiro |
| reservedBalance | real | N | 0 | ⚠️ float para dinheiro |
| pendingBalance | real | N | 0 | |
| totalEarned | real | N | 0 | |
| totalWithdrawn | real | N | 0 | |
| totalFeesPaid | real | N | 0 | |
| totalSpent | real | N | 0 | |

⚠️ **RISCO FINANCEIRO:** Todos os valores monetários são `real` (float4 — 32 bits). Aritmética de ponto flutuante em valores financeiros pode introduzir erros de arredondamento acumulados. O padrão de indústria é `numeric`/`decimal` ou armazenar em centavos como `integer`. O schema importa `numeric` mas não o usa nas colunas de valor.

---

**`transactions`** — Ledger de transações financeiras

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| walletId | integer | N | — |
| type | transactionTypeEnum | N | — | 9 tipos |
| amount | real | N | — | ⚠️ float |
| description | text | N | — |
| status | transactionStatusEnum | N | pending |
| pixKey | text | S | — | Dados pessoais |
| referenceId | text | S | — |
| createdAt | timestamp | N | now() |

---

**`deposit_requests`** — Solicitações de depósito (aprovação manual)

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| walletId / userId | integer | N | — |
| amount | real | N | — | ⚠️ float |
| paymentMethod | depositMethodEnum | N | pix |
| pixKey | text | S | — | Dados pessoais |
| status | depositStatusEnum | N | pending |
| adminNote | text | S | — |
| approvedById | integer | S | — |
| createdAt / updatedAt | timestamp | N | now() |

---

**`conversations`** — Threads de chat

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| participant1Id / participant2Id | integer | N | — |
| lastMessageAt | timestamp | S | — |
| createdAt | timestamp | N | now() |

**`messages`** — Mensagens individuais

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| conversationId | integer | N | — |
| senderId | integer | N | — |
| content | text | N | — |
| type | varchar(20) | N | text |
| isRead | boolean | N | false |
| createdAt | timestamp | N | now() |

---

**`notifications`** — Notificações in-app

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| userId | integer | N | — |
| type | text | N | — |
| category | text | N | system |
| priority | text | N | normal |
| title / message | text | N | — |
| isRead | boolean | N | false |
| link | text | S | — |
| createdAt | timestamp | N | now() |

---

**`ratings`** — Avaliações mútuas

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| jobId / raterId / ratedId | integer | N | — |
| score | real | N | — | ⚠️ float |
| comment | text | S | — |
| createdAt | timestamp | N | now() |

---

**`sessions`** — Tokens de autenticação

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | |
| token | text | N | — | UNIQUE |
| userId | integer | N | — | |
| createdAt | timestamp | N | now() | |
| expiresAt | timestamp | S | — | 30 dias |

⚠️ **RISCO DE PERFORMANCE:** Nenhum índice em `userId`. Busca por token é O(1) via UNIQUE. Mas `requireAuth` faz SELECT por token — sem índice composto, qualquer listagem de sessões por usuário é full-scan.

---

**`state_representatives`** — Representantes estaduais

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| userId | integer | N | — |
| stateCode | text | N | — |
| commissionRate | real | N | 0.02 | ⚠️ float |
| createdAt | timestamp | N | now() |

---

**`platform_config`** — Configurações de governança (chave-valor)

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | |
| key | text | N | — | UNIQUE |
| value | jsonb | N | — | |
| description | text | S | — | |
| updatedAt | timestamp | N | now() | |
| updatedBy | integer | S | — | |

**Chaves usadas:** `financial.*`, `level_fee_*`, `push:sub:{userId}:{endpoint}` (push subscriptions), `badge:{userId}:{name}` (badges). A tabela é multipropósito — armazena configurações financeiras, subscriptions de push e badges de usuários.

---

**`categories`** — Categorias de serviços (gerenciadas pela governança)

| Campo | Tipo | Null | Default |
|---|---|---|---|
| id | serial | N | auto |
| name | text | N | — |
| slug | text | N | — | UNIQUE |
| description / icon | text | S | — |
| status | categoryStatusEnum | N | active |
| displayOrder | integer | N | 0 |
| rules | jsonb | S | — |
| createdAt / updatedAt | timestamp | N | now() |
| createdBy | integer | S | — |

---

**`wallet_ledger`** — Audit trail de movimentações financeiras

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | |
| debitWalletId | integer | S | — | FK implícita |
| creditWalletId | integer | S | — | FK implícita |
| amount | real | N | — | ⚠️ float |
| type | text | N | — | Não é enum |
| referenceType / referenceId | text | S | — | |
| description | text | N | — | |
| metadata | jsonb | S | — | |
| createdAt | timestamp | N | now() | |
| createdBy | integer | S | — | |

---

**`escrows`** — Custódia de pagamentos (foundation — não ativa)

| Campo | Tipo | Null | Default | Observação |
|---|---|---|---|---|
| id | serial | N | auto | |
| jobId / applicationId | integer | S | — | |
| companyWalletId / freelancerWalletId / platformWalletId | integer | S | — | |
| grossAmount | real | N | — | ⚠️ float |
| platformFeeAmount / referralFeeAmount / representativeFeeAmount / reserveFundAmount / netFreelancerAmount | real | N | 0 | ⚠️ float |
| feeRateSnapshot / referralRateSnapshot / representativeRateSnapshot | real | S | — | Snapshot das taxas no momento |
| status | escrowStatusEnum | N | draft | 8 estados |
| fundedAt / inProgressAt / completedAt / releasedAt / cancelledAt | timestamp | S | — | |
| disputeReason / asaasChargeId / asaasTransferId | text | S | — | |
| metadata | jsonb | S | — | |
| createdAt / updatedAt | timestamp | N | now() | |

---

**Tabelas de verificação/KYC** — Detalhes já em `verification.ts` (auditadas na Parte 1):

| Tabela | Finalidade |
|---|---|
| `legal_documents` | 9 tipos de documento legal versionados |
| `legal_acceptances` | Log imutável de aceites (append-only) |
| `email_verifications` | OTPs de email (verify, reset, change) |
| `phone_verifications` | OTPs de SMS/WhatsApp |
| `kyc_documents` | Documentos KYC (base64 em DB) |
| `kyc_review_history` | Histórico de revisão KYC (append-only) |
| `login_attempts` | Log de tentativas de login |
| `fraud_log` | Log de eventos de fraude |
| `verification_audit_log` | Audit trail geral de verificação |

---

### 7.4 Tabela de acesso por tabela

| Tabela | Finalidade | Leituras (routes) | Escritas (routes) | Seeds | Riscos principais |
|---|---|---|---|---|---|
| users | Entidade central | auth, admin, users, stats, referrals, governance, kyc-admin, feed, jobs, applications, verification, profile-sections, seed, setup, index.ts | auth (register/login), admin (ban/verify/set-role), governance (promote/override), kyc-admin, verification, users (PATCH), seed, setup | seed.ts, setup.ts, index.ts (seedMasterAdmin) | CPF/CNPJ/email/phone dados pessoais; SHA-256 para senha; adminRole/corporateRole sem enum |
| wallets | Saldo financeiro | wallet, admin, stats, governance, jobs, applications, ecosystem.ts | wallet (withdraw), jobs (create/delete/cancel), applications (complete/counter), admin (approve-deposit), ecosystem.ts, auth (register) | seed.ts (ensureWallet) | Float para valores monetários; sem FK declarada; wallet de plataforma sem isolamento |
| transactions | Ledger de movimentos | wallet, stats, admin, governance | wallet, jobs, applications, admin (approve), ecosystem.ts | — | Float; sem índice em walletId; transações platform_fee sem validação cruzada |
| deposit_requests | Depósitos manuais | wallet, admin | wallet (request), admin (confirm/approve/reject) | — | Aprovação manual sem integração Asaas ativa |
| jobs | Extras | jobs, admin, stats, applications, governance, feed, job-execution | jobs (CRUD), admin (delete), job-execution (status) | — | category não FK; location texto livre; float para hourlyRate/totalValue |
| job_events | Audit trail de execução | job-execution | job-execution, jobs | — | Não exportado do dist compilado (TS error) |
| job_codes | Códigos check-in/out | job-execution | job-execution | — | Não exportado do dist compilado (TS error) |
| applications | Candidaturas | applications, admin, stats, dashboard, ecosystem | applications (CRUD, approve, reject, complete, counter) | — | Sem unicidade (jobId, freelancerId) — possível duplicata |
| sessions | Auth tokens | auth (requireAuth), index.ts | auth (login/register/logout), index.ts (cleanup) | — | Sem índice em userId; tokens armazenados como texto plano |
| conversations | Chat threads | chat | chat (create) | — | Sem unique constraint em (p1, p2) — possível duplicata de conversa |
| messages | Mensagens | chat | chat (send) | — | Sem paginação server-side declarada |
| notifications | Notificações in-app | notifications, chat | notifications, ecosystem.ts, kyc-admin, applications, jobs | — | type/category/priority como text sem enum |
| ratings | Avaliações | users, stats, admin | users (rate), applications (complete via ecosystem) | — | Sem unique constraint em (jobId, raterId) — avaliação duplicada possível |
| user_follows | Rede social | users | users (follow/unfollow) | — | uniqueIndex correto |
| posts / post_* | Feed social | feed | feed | — | isDemo sem filtro automático fora de feed.ts |
| user_categories / work_experiences / user_skills | Perfil profissional | profile-sections, users | profile-sections | — | — |
| state_representatives | Representantes | admin, stats, governance | admin (CRUD) | — | commissionRate float |
| platform_config | Configuração global + badges + push subscriptions | governance, split-engine, push | governance (CRUD), push (subscribe/unsubscribe) | — | Tabela multipropósito — risco de colisão de chaves |
| categories | Categorias de serviços | categories, governance | governance (CRUD soft-delete) | — | Não FK para jobs.category |
| wallet_ledger | Audit trail financeiro | governance | — | — | Não usado nas rotas de wallet ou ecosystem — ledger não populado nas operações normais |
| escrows | Custódia de pagamentos | — | — | — | Tabela criada, não usada em nenhuma rota ativa |
| legal_documents / legal_acceptances | Documentos legais | verification | verification (accept), seed | seed.ts | — |
| email_verifications / phone_verifications | OTPs | verification | verification | — | OTPs armazenados como texto |
| kyc_documents / kyc_review_history | KYC | kyc-admin, verification | kyc-admin, verification | — | base64 em coluna text; captureMetadata ausente do dist |
| login_attempts / fraud_log / verification_audit_log | Segurança/fraude | — | auth (login), verification, kyc-admin | — | — |
| sessions | Auth | auth (requireAuth) | auth, index.ts | seed.ts (via upsertUser) | — |

### 7.5 Relacionamentos (FK implícitas — sem `.references()` declarado)

```
users ─┬─< wallets (users.id → wallets.userId)
       ├─< sessions (users.id → sessions.userId)
       ├─< jobs (users.id → jobs.companyId)
       ├─< applications (users.id → applications.freelancerId)
       ├─< notifications (users.id → notifications.userId)
       ├─< ratings (rater/rated → users.id)
       ├─< conversations (participant1/2 → users.id)
       ├─< messages (senderId → users.id)
       ├─< posts, post_comments, post_likes, post_saves (userId)
       ├─< user_categories, work_experiences, user_skills
       ├─< user_follows (followerId, followingId)
       ├─< state_representatives (userId)
       ├─< email_verifications, phone_verifications
       ├─< kyc_documents, kyc_review_history (reviewerId)
       ├─< legal_acceptances
       ├─< login_attempts (sem FK — apenas email string)
       ├─< fraud_log
       ├─< verification_audit_log
       └─< users (referredById — auto-referência)

jobs ──┬─< job_events (jobs.id → job_events.jobId)
       ├─< job_codes (jobs.id → job_codes.jobId)
       ├─< applications (jobs.id → applications.jobId)
       ├─< ratings (jobs.id → ratings.jobId)
       └─< escrows (jobs.id → escrows.jobId)

wallets ─< transactions (walletId)
        ─< deposit_requests (walletId)
        ─< wallet_ledger (debitWalletId / creditWalletId)
        ─< escrows (company/freelancer/platformWalletId)

conversations ─< messages (conversationId)
kyc_documents ─< kyc_review_history (kycDocumentId)
```

**⚠️ RISCO CRÍTICO DE INTEGRIDADE REFERENCIAL:** Nenhuma FK é declarada no schema Drizzle. Sem `FOREIGN KEY` + `ON DELETE CASCADE` no PostgreSQL, a exclusão de um usuário não remove automaticamente registros filhos. A limpeza é feita manualmente em `dev-whitelist.ts::purgeUserById()` via SQL raw, e apenas em desenvolvimento. Em produção, não há mecanismo de limpeza em cascata.

### 7.6 Índices explícitos declarados no schema

| Tabela | Índice | Tipo | Colunas |
|---|---|---|---|
| users | (implícito via UNIQUE) | UNIQUE | email, referralCode, cpf, cnpj |
| wallets | (implícito via UNIQUE) | UNIQUE | userId |
| sessions | (implícito via UNIQUE) | UNIQUE | token |
| platform_config | (implícito via UNIQUE) | UNIQUE | key |
| categories | (implícito via UNIQUE) | UNIQUE | slug |
| user_follows | `user_follows_unique` | UNIQUE | (followerId, followingId) |

**Todos os demais campos de FK (walletId, jobId, freelancerId, userId, etc.) NÃO têm índices declarados.** Isso implica full-scan em queries por FK sem UNIQUE.

### 7.7 Constraints

| Tipo | Existência | Observação |
|---|---|---|
| PRIMARY KEY | ✅ Todos os serial | |
| UNIQUE | ✅ Declarados (via `.unique()`) | email, cpf, cnpj, referralCode, sessions.token, wallets.userId, platform_config.key, categories.slug |
| FOREIGN KEY | ❌ Nenhum declarado | Integridade referencial somente via código |
| CHECK | ❌ Nenhum | Sem validação de range no banco (ex: score 0-5, balance >= 0) |
| NOT NULL | ✅ Via `.notNull()` | Campos obrigatórios |
| DEFAULT | ✅ Via `.default()` | Maioria dos campos numéricos e booleanos |
| CASCADE (DELETE/UPDATE) | ❌ Nenhum | Sem cascata no banco |

### 7.8 Diagrama textual de entidades

```
┌─────────────────────────────────────────────────────────────────┐
│                           USERS                                   │
│ (role: company|freelancer|admin)                                   │
│ id, email, passwordHash, name, role, adminRole, corporateRole,     │
│ level, reputationScore, completedJobs, accountStatus, isVerified,  │
│ cpf, cnpj, phone, referralCode, referredById, isDemo, ...          │
└──────┬──────────────────────────────────────────────────────────┘
       │ 1:1                                    │ 1:N
       ▼                                        ▼
┌──────────────┐    ┌──────────────────┐  ┌────────────────────────┐
│   WALLETS    │    │     SESSIONS     │  │         JOBS           │
│ userId(U)    │    │ token(U),userId  │  │ companyId→users        │
│ balance      │    │ expiresAt        │  │ status(10 estados)     │
│ reserved     │    └──────────────────┘  │ walletReservationId    │
│ totalEarned  │                          └──────┬─────────────────┘
└──────┬───────┘                                 │ 1:N
       │ 1:N                          ┌──────────┼──────────────┐
       ▼                              ▼          ▼              ▼
┌────────────────┐           ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  TRANSACTIONS  │           │ APPLICATIONS │ │JOB_EVENTS│ │  JOB_CODES  │
│ walletId,type  │           │ freelancerId │ │ jobId    │ │ jobId, code  │
│ amount(float)  │           │ jobId,status │ │ eventType│ │ codeType     │
│ 9 tipos        │           │ 8 estados    │ │ 17 tipos │ │ expiresAt    │
└────────────────┘           └──────┬───────┘ └──────────┘ └──────────────┘
                                    │ completeJobCascade
┌──────────────────────────────────┐│
│         FINANCIAL LAYER          ││
├──────────────┬──────────────┐    ││
│ DEPOSIT_REQS │ WALLET_LEDGER│    ││
│ walletId     │ debit/credit │    ││
│ 4 status     │ type(text)   │    ││
└──────────────┴──────────────┘    ││
┌──────────────────────────────────┘│
│ ESCROWS (foundation — inativo)    │
│ company/freelancer/platformWallet │
│ grossAmount, splits, status(8)    │
└───────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  SOCIAL / PROFILE                     │
├─────────────────┬────────────────────────────────────┤
│  CONVERSATIONS  │  MESSAGES                          │
│  participant1/2 │  conversationId, senderId          │
├─────────────────┼────────────────────────────────────┤
│  POSTS          │  POST_COMMENTS / LIKES / SAVES     │
│  USER_FOLLOWS   │  USER_CATEGORIES / SKILLS / XP     │
├─────────────────┼────────────────────────────────────┤
│  RATINGS        │  NOTIFICATIONS                     │
│  CATEGORIES     │  STATE_REPRESENTATIVES             │
└─────────────────┴────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                VERIFICAÇÃO / KYC / AUTH               │
├──────────────────────────────────────────────────────┤
│  LEGAL_DOCUMENTS → LEGAL_ACCEPTANCES (append-only)   │
│  EMAIL_VERIFICATIONS  PHONE_VERIFICATIONS             │
│  KYC_DOCUMENTS → KYC_REVIEW_HISTORY (append-only)    │
│  LOGIN_ATTEMPTS  FRAUD_LOG  VERIFICATION_AUDIT_LOG   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   GOVERNANÇA                          │
│  PLATFORM_CONFIG (key/jsonb) — taxas, badges, push   │
└──────────────────────────────────────────────────────┘
```

### 7.9 Riscos do banco de dados consolidados

| # | Severidade | Risco | Evidência |
|---|---|---|---|
| 1 | 🔴 | Todos os valores monetários em `real` (float4) — erros de arredondamento acumulados | wallet.ts, jobs.ts, applications.ts, escrow.ts |
| 2 | 🔴 | Sem FK declaradas — sem integridade referencial no banco | schema inteiro |
| 3 | 🔴 | KYC files armazenados como base64 em coluna text — bloat de tabela sem limite | kyc_documents.fileUrl |
| 4 | 🟠 | Sem índices em campos de FK (walletId, jobId, freelancerId, userId em transactions, applications, etc.) | schema inteiro |
| 5 | 🟠 | Sem unique constraint em (jobId, freelancerId) em applications — um freelancer pode candidatar-se duas vezes | applications.ts |
| 6 | 🟠 | Sem unique constraint em (jobId, raterId) em ratings — avaliação duplicada possível | ratings.ts |
| 7 | 🟠 | Sem unique constraint em (participant1Id, participant2Id) em conversations — duplicata de conversa possível | messages.ts |
| 8 | 🟠 | `platform_config` multipropósito — mistura taxas financeiras, push subscriptions e badges sem namespace seguro | config.ts |
| 9 | 🟠 | `wallet_ledger` não é populado pelas operações normais (ecosystem.ts não escreve nela) — ledger de auditoria vazio | ledger.ts; grep: sem escrita em wallet.ts/ecosystem.ts |
| 10 | 🟠 | `escrows` completamente inativo — nenhuma rota cria registros | escrow.ts |
| 11 | 🟡 | Sem CHECK constraints — balance pode ser negativo, score pode exceder 5.0, timestamps sem ordem | schema |
| 12 | 🟡 | `login_attempts` sem FK para users — keyed apenas por email text | verification.ts |
| 13 | 🟡 | adminRole e corporateRole como `text` sem constraint — qualquer string é aceita | users.ts |

---

## ETAPA 8 — MIGRATIONS

### 8.1 Estado atual

**Não existem migrations.** Confirmado:
- `lib/db/src/migrations/` — **pasta inexistente**
- Nenhum arquivo `*.sql` ou migration runner encontrado
- `drizzle.config.ts` não define `out` (diretório de migrations)

### 8.2 Estratégia em uso: `drizzle-kit push`

```json
// lib/db/package.json (scripts)
"push":       "drizzle-kit push --config ./drizzle.config.ts"
"push-force": "drizzle-kit push --force --config ./drizzle.config.ts"
```

`drizzle-kit push` **sincroniza o schema TypeScript diretamente contra o banco** sem gerar arquivos de migration. O comportamento:

1. Lê `lib/db/src/schema/index.ts` (source of truth)
2. Conecta ao banco via `DATABASE_URL`
3. Compara schema atual com estado do banco (introspection)
4. Executa DDL (CREATE TABLE, ALTER TABLE, CREATE INDEX, etc.) diretamente
5. Não cria nem salva histórico da operação

### 8.3 Como um banco limpo seria criado

Para criar o banco do zero a partir do schema atual:

```bash
# 1. Garantir que DATABASE_URL aponte para o banco limpo
# 2. Compilar a lib (necessário para resolver os exports)
pnpm run typecheck:libs

# 3. Executar o push
pnpm --filter @workspace/db run push
```

O push criaria as seguintes estruturas na ordem:
1. Todos os `pgEnum` (25 enums)
2. Todas as tabelas (35 tabelas)
3. Todos os índices UNIQUE e o `user_follows_unique`
4. **NÃO criaria FK constraints** (não declaradas no schema)
5. **NÃO criaria CHECK constraints** (não declaradas)

### 8.4 Diferenças entre schema fonte e banco atual

O banco em produção foi criado por múltiplas execuções de `drizzle-kit push` ao longo do tempo. As diferenças prováveis:

| Situação | Schema fonte | Banco atual | Evidência |
|---|---|---|---|
| `job_events` / `job_codes` | Exportados em `schema/index.ts` | Provavelmente existem (criados por push anterior) | Os erros TS são do dist compilado, não do banco |
| `walletReservationId` em jobs | Presente em `jobs.ts` linha 37 | Provavelmente existe | Mesmo motivo |
| `updatedAt` em jobs | Presente em `jobs.ts` linha 39 | Provavelmente existe | Mesmo motivo |
| `captureMetadata` em kyc_documents | Presente em `verification.ts` linha 143 | Provavelmente existe | Erro TS é do dist |
| `correction_requested` em accountStatusEnum | **NÃO está** no enum | **NÃO está** no banco | Erro TS confirma: valor inválido no enum PostgreSQL |
| `escrows` | Presente | Provavelmente existe (schema maduro) | Tabela nunca usada em rotas |
| `wallet_ledger` | Presente | Provavelmente existe | Mesma situação |

**Conclusão:** Os 15 erros TypeScript surgem da **dessincronia entre o dist compilado da lib e o schema fonte**, não entre o schema e o banco. O banco provavelmente está mais atualizado que o dist. A correção imediata é recompilar a lib.

### 8.5 Riscos da estratégia de push

| Risco | Descrição | Severidade |
|---|---|---|
| Sem histórico | Não é possível auditar quais mudanças foram feitas e quando | 🟠 |
| Sem rollback | Uma mudança incompatível não pode ser desfeita automaticamente | 🔴 |
| DROP implícito | `drizzle-kit push` pode propor DROP de colunas/tabelas removidas do schema | 🔴 |
| `push-force` | Bypassa confirmações de segurança | 🔴 |
| Sem CI validation | Nenhum pipeline impede push direto em produção | 🟠 |
| Sem ambiente de staging | Mudanças vão direto para o banco de produção | 🟠 |

---

## ETAPA 9 — SEEDS

### 9.1 Arquivos identificados

| Arquivo | Tipo | Execução | Ambiente | Startup |
|---|---|---|---|---|
| `artifacts/api-server/src/index.ts` (`seedMasterAdmin`) | Estrutural/Produção | Automática a cada startup do servidor | Todos | ✅ Sim |
| `artifacts/api-server/src/routes/seed.ts` (`POST /api/setup/seed`) | Produção | Manual (HTTP sem auth) | Todos | ❌ Não |
| `artifacts/api-server/src/routes/setup.ts` (`POST /api/setup/admin`) | Bootstrap | Manual (HTTP sem auth) | Todos | ❌ Não |
| `artifacts/api-server/src/lib/legal-documents-seed.ts` | Dados de produção | Via seed.ts | Todos | ❌ Não |
| `artifacts/api-server/src/lib/legal-documents.ts` | Dados de produção | Via seed.ts | Todos | ❌ Não |
| `artifacts/api-server/src/lib/dev-whitelist.ts` | Desenvolvimento | Via registro (auth/register) | Apenas dev | ❌ Não |

### 9.2 Análise por arquivo

#### `seedMasterAdmin()` — `src/index.ts:45–86`

| Campo | Valor |
|---|---|
| Classificação | **Estrutural / Produção** |
| Execução | A cada startup do servidor |
| Idempotente | ✅ Sim — UPDATE seletivo se conta existe |
| Tabelas | `users` (INSERT ou UPDATE) |
| Inserts | 0 ou 1 — apenas se conta não existe |
| Updates | Campos: role, adminRole, isVerified, accountStatus, emailVerifiedAt (somente se divergirem) |
| Riscos | Cria conta CEO com `level: "elite"` (não "diamond"); não atualiza level nem passwordHash de contas existentes |

#### `POST /api/setup/seed` — `src/routes/seed.ts`

| Campo | Valor |
|---|---|
| Classificação | **Produção** |
| Execução | HTTP POST manual — sem autenticação |
| Idempotente | ✅ Sim — UPSERT por email |
| Tabelas | `users`, `wallets`, `legal_documents` |
| Inserts | Até 6 usuários + até 9 documentos legais (se não existem) |
| Updates | Todos os campos de todos os 6 usuários + documentos legais alterados |
| Riscos | **SEM AUTH** — qualquer um pode resetar senhas; expõe IDs e emails na resposta JSON |

#### `POST /api/setup/admin` — `src/routes/setup.ts`

| Campo | Valor |
|---|---|
| Classificação | **Bootstrap** (legado/redundante) |
| Execução | HTTP POST manual — sem autenticação |
| Idempotente | ✅ Sim — UPDATE se existe |
| Tabelas | `users` somente |
| Inserts | 0 ou 1 — apenas leonardoscheffel2000@gmail.com |
| Updates | role, adminRole, corporateRole, isVerified, level |
| Riscos | **SEM AUTH**; não define `accountStatus: "verified"` no INSERT; não cria wallet; funcionalidade duplicada por seed.ts |

#### `lib/legal-documents-seed.ts` + `lib/legal-documents.ts`

| Campo | Valor |
|---|---|
| Classificação | **Dados de produção** |
| Execução | Invocado por seed.ts |
| Idempotente | ✅ Sim — compara hash do conteúdo |
| Conteúdo | 9 documentos legais completos em português |
| Riscos | CNPJ placeholder `XX.XXX.XXX/0001-XX` em pelo menos um documento |

### 9.3 Tabela de entidades de seed

| Entidade | Identificador | Conta | Origem | Ambiente | Permitido | Risco |
|---|---|---|---|---|---|---|
| CEO Leonardo | leonardoscheffel2000@gmail.com | admin/super_admin/ceo/diamond | seed.ts #1 + seedMasterAdmin | Todos | ✅ Conta oficial | 🔴 Senha hardcoded; endpoint sem auth |
| CMO Jean Dick | jeandick2000@gmail.com | admin/super_admin/cmo/diamond | seed.ts #2 | Todos | ✅ Conta oficial | 🔴 Senha hardcoded; endpoint sem auth |
| CCO Qaialla | qaialla.exclusive@gmail.com | admin/super_admin/cco/diamond | seed.ts #3 | Todos | ✅ Conta oficial | 🔴 Senha hardcoded; endpoint sem auth |
| CEO Master Yahoo | extrago.ceo@yahoo.com | admin/super_admin/elite | seed.ts #4 | Todos | ✅ Conta oficial | 🔴 Senha hardcoded; nível elite (não diamond) |
| Freelancer Teste | teste.f@extrago.com | freelancer/bronze | seed.ts #5 | Todos | ✅ Autorizado | 🟡 Senha hardcoded; pode ver mock data |
| Empresa Teste | teste.e@extrago.com | company | seed.ts #6 | Todos | ✅ Autorizado | 🟡 Senha hardcoded; pode ver mock data |
| Documentos Legais (9) | type enum | — | seed.ts via legal-documents.ts | Todos | ✅ Produção | 🟡 CNPJ placeholder em conteúdo |
| Usuários isDemo | (não criados pelo seed atual) | freelancer/company | Não existem no seed atual | — | ❌ Não existem | — |

### 9.4 Como remover dados demonstrativos sem executar nada

O sistema usa `isDemo: boolean` nos usuários para identificar contas demo. A lógica de filtro está nos routes:

- `feed.ts`: filtra posts de usuários com `isDemo = true` para contas não-teste
- `users.ts`: filtra usuários com `isDemo = false` para listagem
- `jobs.ts`: filtra extras de empresas com `isDemo = true`
- `referrals.ts`: filtra leaderboard para `isDemo = false`
- `stats.ts`: contagens excluem `isDemo = true`

**Para remover dados demo sem executar nada:**

1. Nenhum usuário com `isDemo: true` existe no seed atual — todos os 6 seeds têm `isDemo: false`
2. O mecanismo de filtragem está pronto, mas não há dados demo para filtrar no estado atual do banco
3. Se existirem dados demo (inseridos manualmente ou por seed anterior), a remoção seria via SQL direto:
   ```sql
   -- Identificação (read-only — NÃO EXECUTAR)
   SELECT id, email, name FROM users WHERE is_demo = true;
   SELECT id, title FROM jobs WHERE company_id IN (SELECT id FROM users WHERE is_demo = true);
   ```
4. A exclusão segura requer seguir a ordem de `dev-whitelist.ts::purgeUserById` (dependências em cascata)
5. Sem FK cascades, a exclusão direta de `users` onde `isDemo = true` deixaria órfãos em todas as tabelas filhas

---

## ETAPA 10 — MOCKS E HARDCODED

### 10.1 Inventário completo

| Arquivo | Trecho | Tipo | Persistido | Conta | Risco |
|---|---|---|---|---|---|
| `pages/blog.tsx` | `const POSTS = [{ title: "...", date: "Jun 2026", ... }]` — array completo de artigos | HARDCODED | Não | Todos | 🟡 Não editável sem deploy |
| `pages/app/career.tsx` | `const LEVELS = [{key:"bronze", feePercent:20, ...}, ...]` — 5 objetos | HARDCODED | Não | Freelancers | 🟠 Duplica governança; sem sync com Split Engine |
| `pages/app/career.tsx` | `const ACHIEVEMENTS = [{id:"first_extra", ...}, ...]` — 8 objetos | HARDCODED | Não | Freelancers | 🟡 Lógica de conquistas não persistida no banco |
| `pages/app/career.tsx` | `const LEVEL_FEES = {bronze:20, silver:18, ...}` | HARDCODED | Não | Freelancers | 🟠 Diverge do Split Engine se taxas mudam na governança |
| `pages/app/career.tsx` | `const LEVEL_NEXT = {bronze:{threshold:20, fee:18}, ...}` | HARDCODED | Não | Freelancers | 🟠 Idem |
| `pages/app/career.tsx` | `const REPUTATION_IMPACTS = [{label:"Ranking", ...}]` — 5 itens | HARDCODED | Não | Freelancers | 🟢 Conteúdo educativo — sem impacto operacional |
| `pages/app/referrals.tsx` | `buildLevelConfig()` — duplica thresholds e fees de career.tsx | HARDCODED | Não | Freelancers | 🟠 Terceira duplicata dos thresholds |
| `pages/financial-architecture/performance.tsx` e demais 6 | Conteúdo informativo completo | HARDCODED (intencional) | Não | Público | 🟢 Institucional — sem impacto operacional |
| `pages/financial-architecture/_shared.tsx` | Paths `/fa-sub-bg.webp`, `/fa-header.webp` | HARDCODED | Não | Público | 🟢 Static assets — aceitável |
| `pages/investidores-parceiros.tsx`, `modelo-de-negocio.tsx`, `seguranca.tsx` | Copy e dados | HARDCODED (intencional) | Não | Público | 🟢 Institucional |
| `pages/landing.tsx` | Copy de marketing | HARDCODED (intencional) | Não | Público | 🟢 Institucional |
| `routes/feed.ts` | `TEST_ACCOUNTS_FEED = ["teste.f@extrago.com", "teste.e@extrago.com"]` | HARDCODED | Não | Backend | 🟡 Emails de teste hardcoded no código-fonte |
| `routes/users.ts` | `TEST_ACCOUNTS_USERS = ["teste.f@extrago.com", "teste.e@extrago.com"]` | HARDCODED | Não | Backend | 🟡 Idem |
| `routes/jobs.ts` | `TEST_ACCOUNTS_JOBS = ["teste.f@extrago.com", "teste.e@extrago.com"]` | HARDCODED | Não | Backend | 🟡 Idem |
| `routes/governance.ts` | `CEO_EMAILS = ["leonardoscheffel2000@gmail.com", ...]` | HARDCODED | Não | Backend | 🟠 Controle de acesso por email literal |
| `routes/seed.ts` | Senhas: `hashPassword("Gremory26@")`, `hashPassword("Extrago27@")`, etc. | HARDCODED | Não (processo) | Backend | 🔴 Senhas de contas de produção versionadas |
| `routes/setup.ts` | `ADMIN_HASH = "55815ec3857918a0c7accc86eb5f8a645f4e35262b5a0a4ca56057142d0e502f"` | HARDCODED | Não | Backend | 🔴 Hash de senha hardcoded |
| `lib/dev-whitelist.ts` | Email pessoal, CPF, telefone do fundador | HARDCODED | Não | Dev | 🟠 PII em código versionado |
| `lib/legal-documents.ts` | CNPJ placeholder `XX.XXX.XXX/0001-XX` | HARDCODED (placeholder) | Sim (via seed) | Público | 🟡 Dado falso em documento legal de produção |
| `lib/asaas.ts` | Todos os métodos retornam `not_implemented` | FALLBACK | Não | Backend | 🟡 Integração de pagamentos não ativa |
| `pages/app/notifications.tsx` | `fallbackMeta` object para notificações sem metadados | FALLBACK | Não | Todos | 🟢 UX seguro |
| `pages/app/chat.tsx` | Polling fallback para falha de SSE | FALLBACK | Não | Todos | 🟢 Resiliência |
| `config/test-accounts.ts` (frontend) | `TEST_EMAILS = ["teste.f@...", "teste.e@...", ...]` — 4 emails | HARDCODED | Não | Frontend | 🟡 Não sincronizado com backend TEST_ACCOUNTS |
| `config/master-accounts.ts` (frontend) | `MASTER_ACCOUNTS = [4 emails]`, `CEO_GOVERNANCE_EMAILS = [3 emails]` | HARDCODED | Não | Frontend | 🟡 Duplica CEO_EMAILS do governance.ts |
| `lib/ecosystem.ts` | `LEVEL_FEE`, `LEVEL_LABELS`, `LEVEL_THRESHOLDS` (constantes) | FALLBACK/DEFAULT | Não | Backend | 🟠 Usado como fallback — Split Engine carrega do banco primeiro |
| `routes/governance.ts` | `DEFAULTS` (level_fee_bronze: 0.20, etc.) | FALLBACK | Não | Backend | 🟡 Fallback quando não configurado na governança |
| `routes/job-execution.ts` | `Math.random()` para gerar código de 6 dígitos | DADO REAL | Não | Backend | 🟡 Math.random não é CSPRNG; suficiente para UX, não para segurança |
| `pages/app/dashboard.tsx` | `((currentFee - nextFee) / 100) * 250 * 4` — savings hardcoded com R$250 como base | HARDCODED | Não | Todos | 🟠 Cálculo de economia baseado em valor fictício |

### 10.2 Classificações consolidadas

**MOCK** (dados inventados substituindo dados reais):
- `blog.tsx`: artigos de blog falsos

**HARDCODED** (valores que deveriam ser configuráveis):
- Taxas de nível em `career.tsx`, `referrals.tsx` (3 lugares distintos) e `ecosystem.ts` — contradizem o princípio do Split Engine
- Emails de controle de acesso (`CEO_EMAILS`, `TEST_ACCOUNTS_*`)
- Senhas em `seed.ts` e `setup.ts`
- R$250 como base de cálculo de economia em `dashboard.tsx`

**FALLBACK** (comportamento quando dado real não disponível):
- `asaas.ts`: `not_implemented` em todos os métodos
- `fallbackMeta` em notifications
- `LEVEL_FEE` em `ecosystem.ts` (sobrescrito pelo Split Engine quando disponível)

**DADO REAL** (dado calculado ou gerado, não mock):
- Todas as páginas de app (dashboard, wallet, jobs, applications, referrals, career, feed, chat, network, admin)

**NÃO CONFIRMADO**:
- Conteúdo de `docs/*.md` — referenciado por AI_CONTEXT.md, existência confirmada, conteúdo não lido integralmente

### 10.3 Contradição de thresholds de nível

O sistema tem **4 locais diferentes** definindo os thresholds e taxas de nível, com risco de divergência:

| Local | Bronze | Silver | Gold | Elite | Diamond |
|---|---|---|---|---|---|
| `ecosystem.ts` (backend, source) | 0% fee, 0 jobs | 18%, 20 jobs | 15%, 100 jobs | 12%, 300 jobs | 10%, 600 jobs |
| `career.tsx` (frontend) | 20%, 0 jobs | 18%, 20 jobs | 15%, 100 jobs | 12%, 300 jobs | 10%, 600 jobs |
| `referrals.tsx` (frontend) | 20%, 0 jobs | 18%, 20 jobs | 15%, 100 jobs | 12%, 300 jobs | 10%, 600 jobs |
| `governance.ts` DEFAULTS (backend) | 20% | 18% | 15% | 12% | 10% |
| `platformConfigTable` (banco) | Configurável | Configurável | Configurável | Configurável | Configurável |

**RISCO:** Se os thresholds forem alterados via governança no banco, os valores hardcoded no frontend **não serão atualizados automaticamente**. O frontend exibiria taxas incorretas para o usuário.

---

## ETAPA 11 — DOCUMENTAÇÃO

### 11.1 Inventário de documentos encontrados

| Documento | Caminho | Objetivo | Implementação | Status | Conflitos |
|---|---|---|---|---|---|
| `AI_CONTEXT.md` | Raiz | Governança de agentes de IA — regras obrigatórias antes de qualquer alteração | Parcialmente seguido | ✅ Presente e atualizado | Menciona level keys "beginner/junior/intermediate/senior/elite" mas enum real é "bronze/silver/gold/elite/diamond" ⚠️ |
| `replit.md` | Raiz | Visão geral do projeto + preferências de usuário | Seguido | ✅ Presente | — |
| `AUDITORIA_PARTE_1.md` | Raiz | Relatório de auditoria Parte 1 | — | ✅ Gerado nesta sessão | — |
| `docs/AGENT_START_HERE.md` | `docs/` | Onboarding para agentes | Não lido | ✅ Existe | Desconhecido |
| `docs/MASTER_CONTEXT.md` | `docs/` | Posicionamento estratégico e visão do produto | Não lido | ✅ Existe | Desconhecido |
| `docs/BUSINESS_MODEL.md` | `docs/` | Modelo de negócio: taxas, níveis, split | Não lido | ✅ Existe | Pode ter conflito com hardcodes em career.tsx |
| `docs/PRODUCT_ARCHITECTURE.md` | `docs/` | Arquitetura técnica | Não lido | ✅ Existe | Desconhecido |
| `docs/ROADMAP.md` | `docs/` | Planejamento de features | Não lido | ✅ Existe | Desconhecido |
| `docs/TEST_DATA_POLICY.md` | `docs/` | Política de dados de teste e demo | Não lido | ✅ Existe | Desconhecido |
| `docs/VISUAL_GUIDELINES.md` | `docs/` | Guia visual: overlays, tipografia, cores | Não lido | ✅ Existe | Desconhecido |
| `docs/UX_AUDIT_AREA_LOGADA.md` | `docs/` | Auditoria UX da área logada | Não lido | ✅ Existe | Desconhecido |
| `lib/api-spec/openapi.yaml` | `lib/api-spec/` | Contrato da API (fonte de verdade para codegen) | Parcialmente — ver divergências | ✅ Existe (~2300 linhas) | Rotas de governança, kyc-admin, job-execution, push **NÃO estão no spec** |
| `lib/api-spec/orval.config.ts` | `lib/api-spec/` | Config de geração de código (Orval) | Seguido | ✅ Existe | — |
| `lib/api-client-react/` | `lib/` | Hooks gerados pelo Orval | Gerado — pode estar desatualizado | ✅ Existe | Se spec desatualizado, hooks divergem |
| `lib/api-zod/` | `lib/` | Schemas Zod gerados | Gerado | ✅ Existe | Idem |

### 11.2 Divergências entre openapi.yaml e implementação real

**Rotas implementadas mas AUSENTES do openapi.yaml:**

| Rota | Módulo |
|---|---|
| Governança (`/admin/governance/*`) | `routes/governance.ts` |
| KYC Admin (`/admin/kyc/*`) | `routes/kyc-admin.ts` |
| Execução de Extras (`/jobs/:id/generate-*`, `/jobs/:id/validate-*`, etc.) | `routes/job-execution.ts` |
| Push Notifications (`/push/*`) | `routes/push.ts` |
| Verificação (`/auth/verify-*`, `/legal/*`, `/kyc/documents*`) | `routes/verification.ts` |
| Feed/Posts (`/feed`, `/posts/*`) | `routes/feed.ts` |
| Profile sections (`/profile/*`) | `routes/profile-sections.ts` |
| Categorias (`/categories`) | `routes/categories.ts` |
| Chat SSE (`/chat/sse`) | `routes/chat.ts` |

**Rotas no openapi.yaml mas com status divergente:**
- `POST /admin/users/{id}/ban` — spec presente; implementação: sem proteção de contas super_admin
- `GET /admin/stats` — spec presente; implementação: carrega tabelas inteiras em memória

**Hooks gerados (`@workspace/api-client-react`) cobrem apenas rotas no spec.** As rotas de governança, kyc-admin, job-execution e outras não geradas são chamadas via `apiFetch()` direto no frontend, sem validação de tipos compartilhada.

### 11.3 Contradição crítica na documentação

**`AI_CONTEXT.md`, linha 109:**
```
Níveis têm 5 valores: `beginner`, `junior`, `intermediate`, `senior`, `elite`
```

**Enum real (`lib/db/src/schema/users.ts`, linha 9):**
```typescript
export const levelEnum = pgEnum("level", ["bronze", "silver", "gold", "elite", "diamond"]);
```

Os nomes de exibição (`Iniciante`, `Júnior`, `Intermediário`, `Sênior`, `Elite`) são os labels públicos (em `LEVEL_LABELS`), mas os valores do enum no banco são os keys internos (`bronze`, `silver`, `gold`, `elite`, `diamond`). O AI_CONTEXT.md usa nomes incorretos que não correspondem nem aos keys nem aos labels — esta inconsistência pode induzir erros em futuras implementações por agentes.

---

## ETAPA 12 — MÓDULOS

### 12.1 Classificação funcional de cada módulo

| Módulo | Rota(s) | Backend | Frontend | Classificação | Observações |
|---|---|---|---|---|---|
| **Landing** | `/` | `GET /stats/platform` | `landing.tsx` | **funcional** | Stats reais + copy hardcoded |
| **Login** | `/login` | `POST /auth/login` | `login.tsx` | **funcional** | — |
| **Cadastro/Onboarding** | `/onboarding` | `POST /auth/register` + OTP | `onboarding.tsx` | **funcional** | 8 passos |
| **Verificação** | `/verification-center` | `/auth/verify-*`, `/legal/*`, `/kyc/documents` | `verification-center.tsx` | **funcional** | KYC request-documents quebrado (bug `correction_requested`) |
| **Minha Carreira** | `/app/career` | `GET /stats/freelancer/{id}`, `/applications`, `/transactions` | `career.tsx` | **parcial** — funcional com hardcodes | Thresholds e taxas hardcoded no frontend |
| **Dashboard Empresa** | `/app/dashboard` | `GET /stats/company/{id}`, `/jobs`, `/applications` | `dashboard.tsx` | **funcional** | |
| **Buscar Extras** | `/app/jobs` | `GET /jobs` | `jobs.tsx` | **funcional** | Nominatim externo para geolocalização |
| **Publicar Extra** | `/app/jobs/new` | `POST /jobs` | `post-job.tsx` | **funcional** | |
| **Detalhe do Extra** | `/app/jobs/:id` | `GET /jobs/{id}` | `job-detail.tsx` | **funcional** | |
| **Candidaturas** | `/app/applications` | `GET /applications`, approve/reject | `applications.tsx` | **funcional** | |
| **Carteira** | `/app/wallet` | `GET /wallet/me`, `/transactions`, `/withdraw` | `wallet.tsx` | **funcional** | Saque sem Asaas ativo |
| **Indicações** | `/app/referrals` | `GET /referrals/me`, `/leaderboard` | `referrals.tsx` | **parcial** — funcional com hardcodes | Thresholds duplicados |
| **Feed** | `/app/feed` | `GET /feed`, `/posts/*` | `feed.tsx` | **funcional** | Filtro de demo data por email |
| **Rede** | `/app/network` | `GET /users/freelancers`, `/users/companies` | `network.tsx` | **funcional** | |
| **Perfil** | `/app/profile` | `GET/PATCH /users/{id}`, `/profile/*` | `profile.tsx` | **funcional** | |
| **Perfil Profissional Público** | `/app/freelancers/:id` | `GET /users/{id}`, `/experience`, `/skills` | `freelancer-profile.tsx` | **funcional** | |
| **Perfil Empresa Público** | `/app/companies/:id` | `GET /users/{id}` | `company-profile.tsx` | **funcional** | |
| **Mensagens** | `/app/chat` | `GET /chat/conversations`, SSE | `chat.tsx` | **funcional** | Token em query param |
| **Notificações** | `/app/notifications` | `GET /notifications`, mark-read | `notifications.tsx` | **funcional** | fallbackMeta para tipo desconhecido |
| **Configurações** | `/app/settings` | `PATCH /users/{id}` | `settings.tsx` | **funcional** | |
| **Admin Dashboard** | `/admin` | `GET /admin/stats` | `admin/index.tsx` | **funcional** | Full-table scan |
| **Admin Usuários** | `/admin/users` | `GET /admin/users`, ban, verify, set-role | `admin/users.tsx` | **funcional** | Carrega até 200 usuários em memória |
| **Admin Extras** | `/admin/jobs` | `GET /admin/jobs` | `admin/jobs.tsx` | **funcional** | |
| **Admin Saques** | `/admin/withdrawals` | `GET /admin/withdrawals`, approve/reject | `admin/withdrawals.tsx` | **funcional** | Sem Asaas ativo |
| **Admin Analytics** | `/admin/analytics` | `GET /admin/analytics` | `admin/analytics.tsx` | **funcional** | Full-table scan de múltiplas tabelas |
| **Admin Ops** | `/admin/ops` | `GET /admin/ops` | `admin/ops.tsx` | **funcional** | `activeFreelancers24h` por `createdAt` (impreciso) |
| **Admin Mapa** | `/admin/map` | via `/admin/analytics` | `admin/map.tsx` | **funcional** | |
| **Admin Representantes** | `/admin/representatives` | `GET/POST/DELETE /admin/representatives` | `admin/representatives.tsx` | **funcional** | |
| **Admin Governança** | `/admin/governance` | `GET/PUT /admin/governance/*` | `admin/governance.tsx` | **funcional** | Acesso restrito a CEO_EMAILS |
| **Admin KYC** | `/admin/kyc` | `GET /admin/kyc/*` | `admin/kyc.tsx` | **parcial** | request-documents/request-selfie quebrados |
| **Execução de Extras** | `jobs/:id/generate-*` | `routes/job-execution.ts` | via job-detail.tsx | **parcial** | Erros TS no backend (dist desatualizado) |
| **Blog** | `/blog` | — | `blog.tsx` | **hardcoded** | Sem backend, sem CMS |
| **Financial Architecture** (7 páginas) | `/financial-architecture/*` | — | `financial-architecture/*.tsx` | **hardcoded (intencional)** | Conteúdo institucional |
| **Financeiro Asaas** | — | `lib/asaas.ts` | — | **documentado sem implementação** | Todos os métodos retornam `not_implemented` |
| **Split Engine** | Interno | `lib/split-engine.ts` | — | **funcional** | Cache 60s; carregado antes de transações |
| **Escrow** | — | `lib/db/src/schema/escrow.ts` | — | **implementado sem uso** | Tabela criada, nenhuma rota popula |
| **Wallet Ledger** | `/admin/governance/ledger` | `walletLedgerTable` | — | **parcial** | Lido na governança, mas não escrito pelo ecosystem.ts |

### 12.2 Resumo de classificações

| Classificação | Módulos |
|---|---|
| **Funcional** | Landing, Login, Cadastro, Dashboard, Buscar Extras, Publicar Extra, Detalhe Extra, Candidaturas, Carteira, Feed, Rede, Perfil, Chat, Notificações, Configurações, Admin (todos os 8) |
| **Parcial** | Minha Carreira (hardcodes de thresholds), Indicações (hardcodes), Verificação/KYC (bug `correction_requested`), Execução de Extras (erros TS), Admin KYC (request-documents/selfie), Wallet Ledger |
| **Hardcoded** | Blog |
| **Hardcoded intencional** | Financial Architecture (7 páginas), páginas institucionais |
| **Documentado sem implementação** | Integração Asaas (pagamentos reais) |
| **Implementado sem uso** | Escrow (tabela e schema, sem rotas) |

---

## ETAPA 13 — MINHA CARREIRA

### 13.1 Visão geral

`pages/app/career.tsx` — 991 linhas. Página exclusiva de freelancers acessível em `/app/career`.

### 13.2 Confirmação de roteamento

| Questão | Resposta | Evidência |
|---|---|---|
| Freelancer é redirecionado para Career? | ✅ Sim — `DashboardRedirect` envia `role === "freelancer"` para `/app/career` | `pages/dashboard-redirect.tsx` |
| Dashboard ainda existe para freelancers? | ✅ Sim — `/app/dashboard` tem `allowedRoles={ALL_USER_ROLES}` | `App.tsx` linha 171 |
| Freelancer pode acessar Dashboard diretamente? | ✅ Sim — nenhuma guard bloqueia URL direta | `App.tsx` |
| Career é o destino de fallback? | ✅ Sim — role mismatch redireciona freelancer para `/app/career` | `App.tsx` linha 108 |

**Conclusão:** Minha Carreira é a **landing page padrão** do freelancer, mas Dashboard ainda é **tecnicamente acessível** via URL direta. Não existe bloqueio backend ou frontend que impeça um freelancer de navegar para `/app/dashboard`.

### 13.3 O que a página cobre

| Elemento | Implementado | Origem dos dados | Mock/Hardcode |
|---|---|---|---|
| Saudação | ✅ `getGreeting()` por hora local | `new Date().getHours()` | HARDCODED (lógica local, aceitável) |
| Nome do usuário | ✅ | `useAuth().user.name` | DADO REAL |
| Nível atual | ✅ Badge com sprite | `user.level` (DB) | DADO REAL |
| Label do nível | ✅ | `LEVELS` array local | HARDCODED (mas coerente com `LEVEL_LABELS` do backend) |
| Taxa do nível | ✅ | `LEVEL_FEES` local | HARDCODED — risco de divergência com Split Engine |
| Progresso para próximo nível | ✅ | `completedJobs` + thresholds locais | HARDCODED thresholds |
| Reputação (estrelas) | ✅ `ReputationRingSmall` | `useGetFreelancerStats()` → `reputationScore` | DADO REAL |
| Extras concluídos | ✅ `AnimatedCounter` | `useGetFreelancerStats()` → `completedJobs` | DADO REAL |
| Atividade recente | ✅ `ActivityFeed` com applications e transactions | `useListApplications()`, `useListTransactions()` | DADO REAL |
| Conquistas (Achievements) | ✅ Exibidas com lock/unlock | `ACHIEVEMENTS` array — calculado localmente com `completedJobs` e `reputationScore` | HARDCODED — não persistido no banco |
| Simulador de ganhos | ✅ | Input do usuário × `LEVEL_FEES` hardcoded | HARDCODED |
| Metas (próximo nível) | ✅ | `LEVEL_NEXT` hardcoded | HARDCODED |
| Timeline/história | ❌ Não encontrado | — | INEXISTENTE |
| Missões | ❌ Não encontrado | — | INEXISTENTE |
| Representante Regional | ❌ Não encontrado | — | INEXISTENTE |

### 13.4 Endpoints chamados

| Hook | Endpoint real | Tabelas | Dados retornados |
|---|---|---|---|
| `useGetFreelancerStats(userId)` | `GET /stats/freelancer/{id}` | users, wallets, transactions, applications, ratings | completedJobs, reputationScore, totalEarned, activeApplications, avgRating |
| `useListApplications()` | `GET /applications` | applications, jobs, users | Lista de candidaturas do freelancer |
| `useListTransactions()` | `GET /wallet/transactions` | transactions, wallets | Histórico de transações |

### 13.5 Cálculos no componente (frontend)

| Cálculo | Onde | Hardcodes envolvidos |
|---|---|---|
| `progress` — % até próximo nível | `career.tsx` | `LEVEL_NEXT[currentLevel].threshold` (hardcoded) |
| `jobsLeft` — extras faltantes | `career.tsx` | `LEVEL_NEXT[currentLevel].threshold` (hardcoded) |
| `starsLeft` — estrelas faltantes | `career.tsx` | `nextStarsReq` em `LEVELS` (hardcoded) |
| `simEarnings` — ganhos potenciais por nível | `career.tsx` | `LEVEL_FEES` (hardcoded) × valor simulado do usuário |
| `savingsAmount` — economia trocando de nível | `career.tsx` | `((currentFee - nextFee) / 100) * 250 * 4` — R$250/semana × 4 sem fictício |
| Achievements unlocked | `career.tsx` | `ACHIEVEMENTS[].unlocked(completedJobs, stars, isVerified)` — 8 regras hardcoded |

### 13.6 Risco de divergência entre frontend e backend

O backend calcula o nível via `calculateLevel()` em `ecosystem.ts` usando os thresholds de `LEVEL_THRESHOLDS`. O frontend usa o campo `user.level` retornado pelo banco (já calculado pelo backend). **O nível exibido é correto** — vem do banco.

O problema são os **thresholds e taxas para exibição**:
- Backend define taxas em `Split Engine` (lidas do banco) — são a source of truth operacional
- Frontend exibe taxas de `LEVEL_FEES` hardcoded — podem divergir se o CEO alterar as taxas via governança

Se o CEO alterar `level_fee_bronze` de 20% para 22% na Governança, o banco e o backend passarão a cobrar 22%, mas a página Minha Carreira continuará exibindo 20%.

### 13.7 Resumo funcional

| Item | Status |
|---|---|
| Saudação | ✅ Funcional (hora local) |
| Nível + badge | ✅ Dado real do banco |
| Progresso para próximo nível | ✅ Funcional / ⚠️ thresholds hardcoded |
| Reputação | ✅ Dado real |
| Atividade | ✅ API real (applications + transactions) |
| Conquistas | ✅ Calculadas localmente / ❌ não persistidas |
| Simulador de ganhos | ✅ Input livre / ⚠️ taxas hardcoded |
| Metas | ✅ Próximo nível calculado / ⚠️ thresholds hardcoded |
| Timeline | ❌ Não implementado |
| Missões | ❌ Não implementado |
| Dashboard para Profissional | ✅ Ainda acessível via URL direta |

---

## OBSERVAÇÕES FINAIS DA PARTE 2

### Descobertas não documentadas na Parte 1

| # | Descoberta | Impacto |
|---|---|---|
| 1 | `wallet_ledger` nunca é escrito pelas operações normais de carteira — o ledger de auditoria está vazio | 🟠 Auditoria financeira incompleta |
| 2 | `escrows` completamente inativo — tabela criada, sem rotas que populem | 🟡 Foundation para integração futura |
| 3 | Pasta `docs/` existe com 8 arquivos de documentação (MASTER_CONTEXT, BUSINESS_MODEL, ROADMAP, etc.) — não lida integralmente | Necessário para Parte 3 |
| 4 | `AI_CONTEXT.md` usa nomes de nível incorretos ("beginner/junior/intermediate/senior/elite") | 🟠 Risco de erro de implementação por agentes |
| 5 | `config/test-accounts.ts` no frontend tem 4 emails mas backend `TEST_ACCOUNTS_*` tem apenas 2 | 🟡 Inconsistência entre listas de controle |
| 6 | `config/master-accounts.ts` no frontend inclui Qaialla como MASTER_ACCOUNT mas `CEO_GOVERNANCE_EMAILS` (governance.ts backend) não inclui | 🟡 Política de acesso diverge entre frontend e backend |
| 7 | `Math.random()` usado para gerar código de 6 dígitos em `job-execution.ts` — não é CSPRNG | 🟡 Código previsível em ataque com seed conhecida |
| 8 | `applications` sem unique(jobId, freelancerId) — possível candidatura duplicada | 🟠 Integridade de negócio |
| 9 | `ratings` sem unique(jobId, raterId) — possível avaliação duplicada | 🟠 Integridade de reputação |
| 10 | `savingsAmount` em dashboard.tsx usa R$250 como valor base fictício — pode criar expectativa falsa | 🟡 UX |

### Pendências para a Parte 3

- Leitura completa dos arquivos `docs/*.md` (MASTER_CONTEXT, BUSINESS_MODEL, PRODUCT_ARCHITECTURE, ROADMAP, TEST_DATA_POLICY, VISUAL_GUIDELINES, UX_AUDIT_AREA_LOGADA)
- Análise do `openapi.yaml` completo vs rotas implementadas não especificadas
- Análise do fluxo completo `completeJobCascade` em `ecosystem.ts`
- Análise do `lib/split-engine.ts` completo
- Verificação de paginação nas rotas de listagem (N+1 e full-table risks)
- Análise de `GET /admin/analytics` (full-table scan confirmado)
- Verificação de comportamento de `DashboardPage` quando `user.role === "freelancer"` (componente exibe Company ou Career view?)
- Análise do módulo de push notifications (service worker, VAPID keys)
- Análise de `lib/api-zod` e `lib/api-client-react` para verificar desalinhamento com spec
