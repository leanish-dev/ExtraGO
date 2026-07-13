# SYSTEM_STATE.md — extraGO
# Estado Atual Consolidado e Verificado da Plataforma

> **Gerado em:** 13 de julho de 2026
> **Modo:** read-only — nenhum arquivo alterado, nenhum banco modificado, nenhuma migration executada
> **Fonte de verdade:** código-fonte, dist compilado, saída real de typecheck e build

---

## ⚠️ LEIA ANTES DE IMPLEMENTAR

Este documento substitui as seções de "Estado Atual" de todas as auditorias anteriores.
É a única fonte de verdade sobre o estado real do sistema.
As auditorias históricas (AUDITORIA_PARTE_1.md, PARTE_2.md, PARTE_3.md) permanecem como registro.

---

## 1. REVALIDAÇÕES — TABELA DE EVIDÊNCIAS

Para cada ponto solicitado, evidência direta do código-fonte, dist compilado, banco e runtime.

### Item 1 — Versão exata do Express

| Dimensão | Evidência | Valor |
|---|---|---|
| Código-fonte (`package.json`) | `"express": "^5.2.1"` | ^5.2.1 |
| node_modules resolvido | `node -e "require('./artifacts/api-server/node_modules/express/package.json').version"` | **5.2.1** |
| PRODUCT_ARCHITECTURE.md | Diz "Express 5" | ✅ Correto |
| AI_CONTEXT_V2_PROPOSTA.md | Diz "Express ~4.x (NÃO Express 5)" | ❌ Incorreto |

**Conclusão: CORRIGIDO** — Express instalado e resolvido é **5.2.1** (Express 5). PRODUCT_ARCHITECTURE.md estava correto. AI_CONTEXT_V2_PROPOSTA.md estava errada e deve ser desconsiderada nesse ponto.

---

### Item 2 — accountStatusEnum: quantidade e valores exatos

Fonte: `lib/db/src/schema/verification.ts`, linha 14.

```
"draft" | "pending_email" | "pending_phone" | "pending_documents"
| "pending_review" | "verified" | "rejected" | "blocked" | "inactive"
```

**9 valores. `"correction_requested"` NÃO existe neste enum.**

| Dimensão | Evidência | Conclusão |
|---|---|---|
| Código-fonte | 9 valores listados explicitamente | CONFIRMADO |
| Dist compilado | Tipo inferido nas mensagens de erro TS confirma 9 valores | CONFIRMADO |
| Banco | drizzle-kit push cria a partir do source — enum de 9 valores no banco | CONFIRMADO (inferido) |
| Runtime | Erros TS ao tentar escrever `"correction_requested"` nesta coluna | CONFIRMADO |

**Conclusão: CONFIRMADO** — 9 valores, sem `correction_requested`.

---

### Item 3 — Fluxo correto de solicitação de correção KYC

**Enums relevantes (ambos existem no source E no dist):**

- `kycDocumentStatusEnum` (`lib/db/src/schema/verification.ts`, linha 130):
  ```
  "pending" | "submitted" | "under_review" | "correction_requested"
  | "approved" | "rejected" | "expired"
  ```
  ✅ TEM `"correction_requested"` — para status de documentos individuais.

- `accountStatusEnum` (`lib/db/src/schema/verification.ts`, linha 14):
  ```
  "draft" | "pending_email" | "pending_phone" | "pending_documents"
  | "pending_review" | "verified" | "rejected" | "blocked" | "inactive"
  ```
  ❌ NÃO TEM `"correction_requested"` — para status da conta.

**Fluxo real que deveria existir (semântica correta):**

```
Admin solicita correção
  → kycDocumentsTable.status = "correction_requested"   ✅ (enum correto)
  → usersTable.accountStatus = "pending_documents"       ✅ (enum existente, semântica correta)
                                                          ("pending_documents" = aguardando documentos)
```

**Fluxo atual no código (quebrado):**

```
kyc-admin.ts linha 275/338:
  → usersTable.accountStatus = "correction_requested"   ❌ TypeScript error (valor não existe no enum)
```

**Comportamento frontend esperado:**
- Usuário com `accountStatus === "pending_documents"` é direcionado ao fluxo de upload
- Documentos com `status === "correction_requested"` exibem mensagem de erro específica

**Comportamento backend esperado (após correção):**
- `POST /admin/kyc/:id/request-correction` → setar `usersTable.accountStatus = "pending_documents"`
- `POST /admin/kyc/:id/request-correction` → setar `kycDocumentsTable.status = "correction_requested"` (já funciona)

| Dimensão | Evidência | Conclusão |
|---|---|---|
| Código-fonte | kyc-admin.ts usa "correction_requested" em usersTable | REQUER ALTERAÇÃO DE CÓDIGO |
| Dist compilado | Tipos refletem enum de 9 valores — valor inválido | REQUER ALTERAÇÃO DE CÓDIGO |
| Banco | accountStatusEnum no banco não aceita "correction_requested" | SEM ALTERAÇÃO DE SCHEMA |
| Runtime | INSERT falha silenciosamente ou com erro de DB em produção | REQUER ALTERAÇÃO DE CÓDIGO |

---

### Item 4 — Deve-se adicionar `correction_requested` ao `accountStatusEnum`?

**Conclusão: NÃO REQUER ALTERAÇÃO DE SCHEMA.**

O `kycDocumentStatusEnum` já tem `"correction_requested"` para o nível granular (documento). O status de conta `"pending_documents"` é semanticamente correto para representar "conta aguardando reenvio de documentos". Adicionar ao `accountStatusEnum` criaria dois status com sobreposição semântica e exigiria migration de banco. A correção correta é mudar 2 linhas em `kyc-admin.ts` e 1 linha em `verification.ts`.

---

### Item 5 — `captureMetadata`: schema-fonte, dist compilado, banco

| Dimensão | Evidência | Conclusão |
|---|---|---|
| Código-fonte | `lib/db/src/schema/verification.ts` linha 143: `captureMetadata: text("capture_metadata")` | EXISTE no source |
| Dist compilado (pré-rebuild) | Campo ausente no dist — causava TS error 2769 | ERA stale |
| Dist compilado (pós-rebuild `typecheck:libs`) | `lib/db/dist/schema/verification.d.ts` linha 915: `captureMetadata: PgColumn<...>` | EXISTE no dist rebuilt |
| Banco | drizzle-kit push do source criou a coluna | EXISTE no banco (inferido) |
| Runtime | Após rebuild, TS error desaparece | NÃO REQUER ALTERAÇÃO DE SCHEMA |

**Conclusão: NÃO REQUER ALTERAÇÃO — era artefato de dist desatualizado. Resolvido por `pnpm run typecheck:libs`.**

---

### Item 6 — `updatedAt` e `walletReservationId`: schema-fonte, dist compilado, banco

| Campo | Source | Dist pré-rebuild | Dist pós-rebuild | Banco | Conclusão |
|---|---|---|---|---|---|
| `updatedAt` | `jobs.ts` linha 39: `timestamp("updated_at").notNull().defaultNow()` | AUSENTE | PRESENTE (linha 314) | EXISTE | NÃO REQUER ALTERAÇÃO |
| `walletReservationId` | `jobs.ts` linha 37: `text("wallet_reservation_id")` | AUSENTE | PRESENTE (linha 280) | EXISTE | NÃO REQUER ALTERAÇÃO |

**Conclusão: NÃO REQUER ALTERAÇÃO — eram artefatos de dist desatualizado. Resolvidos por rebuild.**

---

### Item 7 — Quantidade exata de tabelas e enums

**Contado diretamente dos arquivos `lib/db/src/schema/*.ts`:**

**35 tabelas:**
```
applications, categories, conversations, deposit_requests,
email_verifications, escrows, fraud_log, job_codes, job_events,
jobs, kyc_documents, kyc_review_history, legal_acceptances,
legal_documents, login_attempts, messages, notifications,
phone_verifications, platform_config, post_comments, post_likes,
posts, post_saves, ratings, sessions, state_representatives,
transactions, user_categories, user_follows, users, user_skills,
verification_audit_log, wallet_ledger, wallets, work_experiences
```

**24 enums PostgreSQL:**
```
account_status, application_status, category_status, deposit_method,
deposit_status, email_verification_purpose, escrow_status, fraud_log_type,
job_code_type, job_event_type, job_status, kyc_document_status,
kyc_document_type, kyc_review_action, legal_document_status,
legal_document_type, level, phone_verification_channel, post_type,
role, shift_type, transaction_status, transaction_type, wallet_type
```

**Conclusão: CORRIGIDO** — AI_CONTEXT_V2_PROPOSTA.md dizia "35 tabelas, 25 enums". Enums reais: **24** (não 25).

---

### Item 8 — FK Constraints: uso de `.references()` no Drizzle

```bash
grep -rn "\.references(" lib/db/src/schema/ --include="*.ts"
# Resultado: nenhuma ocorrência
```

**Zero FK constraints declarados em todo o schema Drizzle.**

Isso significa que o banco PostgreSQL não tem FOREIGN KEY constraints reais. Integridade referencial é responsabilidade da camada de aplicação.

**Riscos concretos:**
- Registro de `job_events` pode existir com `job_id` inválido (job deletado)
- `transactions` pode ter `walletId` apontando para wallet inexistente
- `applications` pode ter `jobId` e `freelancerId` de registros deletados
- Remoção de usuário não cascadia para seus dados (órfãos acumulam)

| Dimensão | Evidência | Conclusão |
|---|---|---|
| Código-fonte | 0 ocorrências de `.references()` | CONFIRMADO |
| Dist compilado | N/A | — |
| Banco | Sem FK constraints inferidos do Drizzle schema | CONFIRMADO (sem .references(), Drizzle não cria FKs) |
| Runtime | Dados órfãos possíveis sem proteção de integridade | RISCO CONFIRMADO |

---

### Item 9 — Módulos que usam SSE

**SSE real (text/event-stream + res.write + flushHeaders):**

| Módulo | Rota | Evidência |
|---|---|---|
| `chat.ts` | `GET /chat/sse` | linha 37: `res.setHeader("Content-Type", "text/event-stream")`, linha 42: `res.flushHeaders()` |

**Módulos que usam `req.socket` apenas para capturar IP do cliente (não SSE):**

| Módulo | Uso |
|---|---|
| `job-execution.ts` | `req.socket?.remoteAddress` — para logging de IP, não SSE |
| `jobs.ts` | `req.socket?.remoteAddress` — para logging de IP, não SSE |

**Módulos listados como SSE nos relatórios anteriores mas que usam REST:**

| Módulo | Status Real |
|---|---|
| `feed.ts` | REST API — `GET /posts`, `POST /posts`, `PUT /posts/:id/like`. SEM SSE. |
| `notifications.ts` | REST API — listagem e mark-read. SEM SSE. |

**Conclusão: CORRIGIDO** — Apenas `chat.ts` usa SSE real. "Feed SSE" nos relatórios anteriores era incorreto — feed.ts usa REST puro.

---

### Item 10 — Senhas, hashes, tokens e PII hardcoded

**Em `seed.ts` (`artifacts/api-server/src/routes/seed.ts`):**

| Item | Tipo | Risco |
|---|---|---|
| `hashPassword("Gremory26@")` | Senha CEO + CEO Master em plaintext | 🔴 Crítico — versionado no código |
| `hashPassword("Extrago27@")` | Senha CMO em plaintext | 🔴 Crítico — versionado no código |
| `hashPassword("Qaialla27@")` | Senha CCO em plaintext | 🔴 Crítico — versionado no código |
| `hashPassword("ext123@")` | Senha contas de teste (×2) | 🟡 Médio — contas de teste, mas ainda versionado |
| `phone: "(11) 90000-0001"` | Telefone fictício | 🟢 Baixo — fake |
| `phone: "(11) 90000-0002"` | Telefone fictício | 🟢 Baixo — fake |

**Em `setup.ts` (`artifacts/api-server/src/routes/setup.ts`):**

| Item | Tipo | Risco |
|---|---|---|
| `ADMIN_HASH` — hash pré-computado hardcoded | Hash SHA-256 da senha do CEO | 🔴 Crítico — hash versionado |

**Em `dev-whitelist.ts` (`artifacts/api-server/src/lib/dev-whitelist.ts`):**

| Item | Tipo | Risco |
|---|---|---|
| `[REDACTED — email pessoal real]` | Email pessoal real versionado | 🔴 PII — email pessoal do CEO no repositório — **RESOLVIDO em 13/07/2026 sessão 2, ver seção 8 e Checkpoint 3 em SPRINT_PROGRESS.md** |
| `[REDACTED — CPF real]` | CPF real versionado | 🔴 PII crítico — CPF real de pessoa física — **RESOLVIDO em 13/07/2026 sessão 2** |

> **NOTA:** O `dev-whitelist.ts` tem guard `isDevWhitelistActive()` que verifica `NODE_ENV !== "production"`. Em produção com `NODE_ENV=production`, o whitelist não executa. Mas o CPF e email ainda estão versionados no repositório.

**Conclusão: CONFIRMADO** — PII real (CPF + email pessoal) e senhas de produção em plaintext estão versionados no código-fonte.

---

### Item 11 — `Math.random()` em dados operacionais

**Localização:** `artifacts/api-server/src/routes/job-execution.ts`, linha 21:

```typescript
return String(Math.floor(100000 + Math.random() * 900000));
```

Este código gera os códigos de 6 dígitos usados para check-in e checkout de Extras.

`Math.random()` **não é CSPRNG** (Cryptographically Secure Pseudo-Random Number Generator). Em Node.js, o equivalente seguro é `crypto.randomInt(100000, 999999)`.

**Impacto:** Um atacante motivado poderia prever ou forçar códigos válidos com menor esforço do que com CSPRNG. Para um sistema de check-in com implicações financeiras, isso representa risco médio-alto.

**Conclusão: CONFIRMADO** — Math.random() em dado operacional crítico (código de check-in/checkout).

---

### Item 12 — Resultados exatos de build e typecheck

Comandos executados nesta sessão, em ordem:

| Comando | Exit Code | Resultado |
|---|---|---|
| `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` (ANTES do rebuild) | **2** | 15 erros em 5 arquivos |
| `cd artifacts/extrag0 && npx tsc --noEmit` | **0** | 0 erros |
| `pnpm run typecheck:libs` | **0** | PASSOU — dist de lib/db reconstruído |
| `cd artifacts/api-server && node build.mjs` (esbuild) | **0** | PASSOU — esbuild ignora tipos |
| `pnpm --filter @workspace/extrag0 run build` (Vite) | **0** | PASSOU — bundle gerado com avisos de chunk size |
| `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` (APÓS rebuild) | **2** | **3 erros** em 2 arquivos |

**Distribuição dos 3 erros restantes (pós-rebuild):**

| # | Arquivo | Linha | Erro |
|---|---|---|---|
| 1 | `src/routes/kyc-admin.ts` | 275 | `"correction_requested"` incompatível com `accountStatusEnum` |
| 2 | `src/routes/kyc-admin.ts` | 338 | `"correction_requested"` incompatível com `accountStatusEnum` (2ª ocorrência) |
| 3 | `src/routes/verification.ts` | 271 | Comparação `accountStatus === "correction_requested"` impossível (sem sobreposição de tipos) |

**CORRIGINDO o relatório anterior:**
- "15 erros não resolvíveis" → **INCORRETO**
- Estado real: **12 erros resolvidos por `pnpm run typecheck:libs`; 3 erros restantes exigem correção de código (não de schema)**
- Correção dos 3 erros: mudar `"correction_requested"` para `"pending_documents"` em `kyc-admin.ts` + remover comparação impossível em `verification.ts`

---

### Item 13 — Permissões de `qaialla.exclusive@gmail.com`

Fonte: `seed.ts` linhas 119-138, `governance.ts` linhas 9-19.

| Campo | Valor | Fonte |
|---|---|---|
| `role` | `"admin"` | seed.ts linha 125 |
| `adminRole` | `"super_admin"` | seed.ts linha 125 |
| `corporateRole` | `"cco"` | seed.ts linha 126 |
| `accountStatus` | `"verified"` | seed.ts linha 135 |
| `level` | `"diamond"` | seed.ts linha 124 |
| `avatarUrl` | `"/team-qaialla.jpg"` | seed.ts linha 133 |

**Acesso via `requireAdmin` (verifica `role === "admin"`):**
- ✅ Todas as rotas `/admin/*` que usam `requireAdmin`
- ✅ `/admin/users`, `/admin/jobs`, `/admin/withdrawals`, `/admin/analytics`, `/admin/ops`, `/admin/map`, `/admin/representatives`
- ✅ `/admin/kyc/*`

**Acesso via `requireCEO` (verifica email em `CEO_EMAILS`):**
```typescript
const CEO_EMAILS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];
// qaialla.exclusive@gmail.com NÃO está nesta lista
```
- ❌ `/admin/governance/*` — **retorna 403 para Qaialla**

**Conclusão: CONFIRMADO** — Qaialla tem acesso admin completo (super_admin) mas não tem acesso ao CEO Governance Center.

---

### Item 14 — Separação: acesso admin geral vs Governance CEO

| Acesso | Mecanismo | Quem tem acesso |
|---|---|---|
| **Admin Geral** | `requireAdmin` → verifica `user.role === "admin"` | Leonardo, Jean, Qaialla, extrago.ceo (todos têm role=admin) |
| **CEO Governance Center** | `requireCEO` → verifica email em `CEO_EMAILS` | Apenas: leonardoscheffel2000@gmail.com, extrago.ceo@yahoo.com, jeandick2000@gmail.com |

Qaialla (CCO) tem super_admin mas **não tem acesso à Governance**. Isso é comportamento documentado e intencional.

**Conclusão: CONFIRMADO** — separação clara e implementada corretamente.

---

### Item 15 — Revisão da classificação P0/P1/P2

**Reclassificações aplicadas:**

| Item | Classificação Anterior | Classificação Correta | Justificativa |
|---|---|---|---|
| Push web (VAPID) | P1 | **P2** | Não é requisito do MVP; funcionalidade opcional; notificações in-app funcionam sem push web |
| `push_subscriptions` tabela dedicada | P1 | **P2** | Decorre do item anterior |
| Wallet Ledger escrita automática | P1 | **P1** | Necessário para conformidade financeira mínima |
| CORS sem whitelist | P0 | **P1** | Risco real mas Bearer auth mitiga CSRF; impacto é data exfiltration, não account takeover |
| SHA-256 → bcrypt | P0 | **P0** | Permanece crítico — senhas de usuários reais vulneráveis |
| Setup endpoints sem auth | P0 | **P0** | Permanece crítico |
| Rebuild dist (`typecheck:libs`) | P0 | **P0** | Permanece crítico — 3 erros ainda bloqueiam build |
| correction_requested TS errors | P0 | **P0** | Permanece crítico — KYC admin quebrado em produção |

---

### Item 16 — Estratégia de migração SHA-256 → Argon2id/bcrypt

**Estratégia: Lazy Migration (retrocompatível, zero downtime, sem invalidar contas)**

```
Fluxo de login (após implementação):

1. Usuário envia email + senha
2. Backend busca usuário e verifica prefixo do hash:
   - Hash começa com "$argon2" → verificar com Argon2id
   - Hash não começa com "$argon2" → SHA-256 legado
3. Se SHA-256 legado:
   a. Verificar senha com hashPassword_sha256(senha + "extragO_salt_2024")
   b. Se VÁLIDA: rehash com Argon2id, salvar novo hash → login bem-sucedido
   c. Se INVÁLIDA: rejeitar login normalmente
4. Se Argon2id:
   a. Verificar com argon2.verify(hash, senha)
   b. Sucesso ou rejeição normalmente
```

**Detalhes de implementação:**

```typescript
// lib/auth.ts — nova função de verificação de senha
export async function verifyPassword(input: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$argon2")) {
    return argon2.verify(storedHash, input);
  }
  // Legacy SHA-256
  return storedHash === hashPassword_sha256(input);
}

export async function hashPasswordSecure(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}
```

**Migração automática no login:**

```typescript
// No handler de login, após verifyPassword retornar true:
if (!user.passwordHash.startsWith("$argon2")) {
  const newHash = await hashPasswordSecure(password);
  await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));
}
```

**Vantagens:**
- Zero invalidação de contas existentes
- Migração automática e progressiva no login
- Novas contas já usam Argon2id
- Mudança de senha sempre usa Argon2id
- Sem necessidade de comunicar usuários

**Dependências:** `npm install argon2` (pacote nativo, suportado no Node.js 20)

---

### Item 17 — Risco de CORS com Bearer auth

**Avaliação corrigida:**

O modelo de autenticação da extraGO usa **Bearer token no header `Authorization`**.

| Vetor | Com CORS irrestrito + Bearer auth | Risco real |
|---|---|---|
| **CSRF** | ❌ Não aplicável — CSRF explora cookies; Bearer token em header não é enviado automaticamente pelo browser | Risco de CSRF: **BAIXO** |
| **Data exfiltration** | ✅ Aplicável — script malicioso em qualquer origem pode chamar a API com token obtido de `localStorage` | Risco de exfiltration: **MÉDIO** |
| **Scraping/abuso** | ✅ Aplicável — qualquer domínio pode fazer chamadas à API sem autenticação se endpoints forem públicos | Risco de abuso: **MÉDIO** |
| **Phishing com token** | ✅ Aplicável — site de phishing pode capturar token via XSS + exfiltrar chamadas | Risco: **MÉDIO** |

**Conclusão: CORRIGIDO** — CORS irrestrito é um risco **médio** (não crítico) para este modelo de autenticação. O risco principal não é CSRF, mas sim exfiltração e abuso. Deve ser corrigido antes da produção pública mas não bloqueia MVP operacional interno.

Correção mínima:
```typescript
app.use(cors({
  origin: [
    process.env.APP_BASE_URL ?? "http://localhost:5000",
    /\.replit\.app$/,
    /\.replit\.dev$/,
  ],
  credentials: false, // Bearer auth — sem cookies
}));
```

---

### Item 18 — Distinção: problema de dist vs problema de schema real

**ANTES desta auditoria:** Relatório anterior propunha adicionar campos ao schema para resolver TS errors.

**APÓS revalidação:**

| Campo | Diagnóstico Anterior | Diagnóstico Correto |
|---|---|---|
| `captureMetadata` | "adicionar ao schema" | Campo existe no source e no dist rebuilt — era stale |
| `updatedAt` | "adicionar ao schema" | Campo existe no source e no dist rebuilt — era stale |
| `walletReservationId` | "adicionar ao schema" | Campo existe no source e no dist rebuilt — era stale |
| `jobEventsTable` | "desatualizado no dist" | Correto — resolvido por typecheck:libs |
| `jobCodesTable` | "desatualizado no dist" | Correto — resolvido por typecheck:libs |
| `waiting_checkin`/`waiting_checkout` | "dist desatualizado" | Correto — resolvido por typecheck:libs |

**Regra aplicada corretamente:** Nunca propor mudança de schema quando o problema é dist compilado desatualizado. A solução correta é `pnpm run typecheck:libs`.

---

## 2. ESTADO DO BUILD (Verificado nesta sessão)

```
┌─────────────────────────────────────────────────┬──────────┬────────────────────────┐
│ Verificação                                     │ Status   │ Detalhe                │
├─────────────────────────────────────────────────┼──────────┼────────────────────────┤
│ pnpm run typecheck:libs                         │ ✅ PASSA │ EXIT:0 — dist rebuilt  │
│ tsc api-server (pós-rebuild)                    │ ✅ PASSA │ 0 erros — corrigido 13/07/2026 sessão 2 │
│ tsc frontend                                    │ ✅ PASSA │ EXIT:0                 │
│ esbuild backend (build isolado)                 │ ✅ PASSA │ EXIT:0 — ignora tipos  │
│ Vite frontend build                             │ ✅ PASSA │ EXIT:0 — chunks >500kb │
│ pnpm run build (raiz — typecheck && build)      │ ⚠️ PARCIAL │ typecheck agora passa; build raiz falha só em artifacts/mockup-sandbox (exige PORT/BASE_PATH do workflow do canvas). api-server e extrag0 buildam EXIT:0 isoladamente. │
└─────────────────────────────────────────────────┴──────────┴────────────────────────┘
```

**Para o build raiz passar:** corrigir os 3 erros restantes em `kyc-admin.ts` (×2) e `verification.ts` (×1).

---

## 3. STACK ATUAL (Verificada e corrigida)

| Categoria | Tecnologia | Versão Verificada |
|---|---|---|
| Linguagem | TypeScript | ~5.9.3 |
| Runtime | Node.js | **v20.20.0** (replit.nix) |
| Backend | Express | **5.2.1** (não 4.x) |
| Frontend | React + Vite | React 19.1.0, Vite ^7.3.2 |
| Bundler backend | esbuild | 0.27.3 — ignora erros de tipo |
| ORM | Drizzle ORM | ^0.45.2 |
| Banco | PostgreSQL | 16 — Replit managed |
| Auth | Bearer token | sessionsTable (PostgreSQL) — 30 dias — SHA-256 (não bcrypt) |
| Rate limiting | In-memory | Reset no restart — não distribuído |
| Email | Resend | Console fallback sem RESEND_API_KEY |
| SMS | Twilio | Console fallback sem TWILIO_* |
| Push | VAPID / Web Push | Subscriptions em platform_config — VAPID_* necessários |
| Realtime (real SSE) | `chat.ts` apenas | `/chat/sse` — token via ?token= |
| Pagamentos | Asaas | Foundation only — todos os métodos retornam not_implemented |
| Testes | **AUSENTE** | Zero arquivos *.test.ts |
| CI/CD | **AUSENTE** | Nenhum pipeline |

---

## 4. PERMISSÕES POR CONTA (Verificado no seed.ts e governance.ts)

| Email | role | adminRole | corporateRole | level | Admin Geral | Governance CEO |
|---|---|---|---|---|---|---|
| leonardoscheffel2000@gmail.com | admin | super_admin | ceo | diamond | ✅ | ✅ |
| jeandick2000@gmail.com | admin | super_admin | cmo | diamond | ✅ | ✅ |
| qaialla.exclusive@gmail.com | admin | super_admin | cco | diamond | ✅ | ❌ (403) |
| extrago.ceo@yahoo.com | admin | super_admin | — | elite* | ✅ | ✅ |
| teste.f@extrago.com | freelancer | — | — | bronze | ❌ | ❌ |
| teste.e@extrago.com | company | — | — | bronze | ❌ | ❌ |

> *`extrago.ceo@yahoo.com` recebe `level: "elite"` no seed, enquanto as outras contas founder recebem `"diamond"`. Comportamento não documentado — pode ser intencional (conta reserva/backup) ou esquecimento.

---

## 5. MÓDULOS SSE (Corrigido)

**Módulo com SSE real:**
- `chat.ts` — `GET /chat/sse` — streams eventos de mensagens em tempo real

**Módulos com REST (anteriormente listados incorretamente como SSE):**
- `feed.ts` — REST API (`GET /posts`, `POST /posts`, etc.)
- `notifications.ts` — REST API (`GET /notifications`, etc.)

**Padrão de autenticação SSE:**
```
EventSource não suporta headers → token enviado via ?token=<token> na URL
```

---

## 6. CONTRADIÇÕES IDENTIFICADAS E STATUS

| # | Assunto | Documentação | Código Real | Status |
|---|---|---|---|---|
| 1 | Versão do Express | AI_CONTEXT_V2_PROPOSTA.md: "~4.x" | Express 5.2.1 instalado | **RESOLVIDA** neste doc |
| 2 | Tokens auth | PRODUCT_ARCHITECTURE.md: "in-memory" | sessionsTable PostgreSQL (persistente) | **RESOLVIDA** neste doc |
| 3 | Level keys | BUSINESS_MODEL.md: "beginner/junior/intermediate/senior/elite" | bronze/silver/gold/elite/diamond | **RESOLVIDA** neste doc — chaves reais no código |
| 4 | correction_requested | Usada no código como accountStatus | Não existe no accountStatusEnum | **IDENTIFICADA** — requer correção de código |
| 5 | SSE no feed | Relatórios anteriores: "feed usa SSE" | feed.ts usa REST puro | **RESOLVIDA** neste doc |
| 6 | Quantidade de enums | AI_CONTEXT_V2_PROPOSTA.md: "25 enums" | 24 enums | **RESOLVIDA** neste doc |
| 7 | Erros TypeScript | Relatório anterior: "15 erros não resolvíveis" | 3 erros reais após rebuild | **RESOLVIDA** neste doc |
| 8 | captureMetadata como problema de schema | Relatório anterior: "adicionar ao schema" | Campo existe no source e dist | **RESOLVIDA** neste doc |
| 9 | Dashboard acessível a freelancers | Documentação: "Minha Carreira substitui Dashboard" | App.tsx usa ALL_USER_ROLES em /app/dashboard | **CONTRADIÇÃO RESTANTE** |
| 10 | extrago.ceo level elite vs diamond | Seed: elite, outras: diamond | Sem documentação explicando a diferença | **CONTRADIÇÃO RESTANTE** |
| 11 | requireAuth não verifica accountStatus | AGENT_START_HERE implica gate de verificação | Middlewares declarados, não aplicados | **CONTRADIÇÃO RESTANTE** |

---

## 7. SEGURANÇA — AVALIAÇÃO CORRIGIDA

| Risco | Severidade Anterior | Severidade Corrigida | Evidência |
|---|---|---|---|
| SHA-256 passwords (não bcrypt) | Crítico | **Crítico** | auth.ts linha 7 |
| Setup endpoints sem auth | Crítico | **Crítico** | seed.ts, setup.ts sem middleware |
| PII real versionado (CPF + email) | Crítico | **Crítico** | dev-whitelist.ts |
| Senhas de produção em plaintext no código | Crítico | **Crítico** | seed.ts |
| CORS irrestrito | Alto | **Médio** | app.ts — Bearer auth mitiga CSRF; risco real é exfiltração |
| Math.random() em códigos operacionais | Médio | **Médio** | job-execution.ts linha 21 |
| Rate limiting in-memory | Alto | **Médio** | lib/rate-limit.ts — perde contadores no restart |
| Middlewares de verificação não aplicados | Alto | **Alto** | lib/auth.ts — qualquer token válido acessa endpoints protegidos |
| Sem FK constraints | Alto | **Alto** | Dados órfãos sem proteção |
| Valores monetários em float4 | Alto | **Alto** | Erros de arredondamento acumulados |
| 20+ .catch(() => {}) silenciosos | Médio | **Médio** | Erros críticos de DB ignorados |

---

## 8. ARQUIVOS COM ERRO (Estado pós-rebuild) — ATUALIZAÇÃO 13/07/2026 (sessão 2)

**RESOLVIDO.** Os 3 erros TypeScript restantes foram corrigidos:

```
artifacts/api-server/src/routes/kyc-admin.ts    → accountStatus: "correction_requested" → "pending_documents" (linhas 275, 338)
artifacts/api-server/src/routes/verification.ts → comparação impossível removida (linha 271)
```

**Validação pós-correção:**

| Comando | Exit Code |
|---|---|
| `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` | **0** — 0 erros |
| `pnpm run typecheck` (raiz) | **0** |
| `pnpm --filter @workspace/api-server run build` | **0** |
| `pnpm --filter @workspace/extrag0 run build` | **0** |

**Nota:** `pnpm run build` na raiz (`pnpm -r --if-present run build`) falha em `artifacts/mockup-sandbox` porque seu `vite.config.ts` exige as variáveis de ambiente `PORT` e `BASE_PATH`, fornecidas apenas pelo workflow do canvas — não é uma regressão desta correção; api-server e extrag0 (os artefatos de produto) buildam com EXIT:0 isoladamente.

Semântica mantida: documentos individuais (`kycDocumentsTable.status`) continuam usando `"correction_requested"` — apenas o status da CONTA (`usersTable.accountStatus`) passou a usar `"pending_documents"`. Nenhuma migration foi necessária.

---

*Arquivos modificados: kyc-admin.ts, verification.ts (sessão 2)*
*Arquivos criados: SYSTEM_STATE.md, SPRINT_PROGRESS.md*
*Banco alterado: não*
*Migrations executadas: não*
*Seeds executadas: não*
