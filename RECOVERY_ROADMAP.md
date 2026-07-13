# RECOVERY_ROADMAP.md — extraGO
# Plano de Recuperação e Ordem de Implementação

> **Gerado em:** 13 de julho de 2026
> **Fonte:** SYSTEM_STATE.md + revalidações diretas no código
> **Premissa:** Nenhuma etapa foi implementada ainda — este documento define a ordem segura de execução.

---

## PRINCÍPIOS DESTE ROADMAP

1. **Cada etapa é independente e testável** — critério de aceite explícito antes de avançar.
2. **Nenhuma etapa destrói trabalho anterior** — todas são retrocompatíveis.
3. **Commits separados por etapa** — facilita rollback se necessário.
4. **Sequência obrigatória para bloqueadores** — etapas P0 devem ser concluídas em ordem.
5. **Etapas P1 e P2 podem ser paralelizadas** após P0 zerado.

---

## BACKLOG DEFINITIVO (Sem duplicações)

### P0 — Bloqueadores de lançamento

| ID | Descrição | Módulo(s) afetado(s) | Arquivos | Dificuldade | Estimativa |
|---|---|---|---|---|---|
| **P0-1** | ✅ Rebuild do dist de `lib/db` para zerar 12 dos 15 erros TS | Build | `lib/db/` | Baixa | 10 min — **CONCLUÍDA (já satisfeita no início da sessão 2)** |
| **P0-2** | ✅ Corrigir `correction_requested` em `kyc-admin.ts` (×2) e `verification.ts` (×1) — usar `"pending_documents"` | KYC Admin | `routes/kyc-admin.ts`, `routes/verification.ts` | Baixa | 1–2h — **CONCLUÍDA 13/07/2026, sessão 2** |
| **P0-3** | ✅ Proteger `/api/setup/seed` e `/api/setup/admin` — adicionar token de proteção ou desabilitar em `NODE_ENV=production` | Segurança | `routes/seed.ts`, `routes/setup.ts`, `lib/setup-guard.ts` | Baixa | 2–3h — **CONCLUÍDA 13/07/2026, sessão 2** |
| **P0-4** | Migrar hash de senha de SHA-256 para Argon2id com lazy migration no login | Segurança / Auth | `lib/auth.ts` | Média | 4–6h — **NÃO INICIADA nesta conta (fora do escopo de checkpoints 1-4)** |
| **P0-5** | ✅ Remover CPF real e email pessoal de `dev-whitelist.ts` — mover para variável de ambiente ou README local | Segurança / PII | `lib/dev-whitelist.ts` | Baixa | 1h — **CONCLUÍDA 13/07/2026, sessão 2** |
| **P0-6** | Senhas de produção em `seed.ts` — não remover do seed (são necessárias para provisionar), mas documentar que seed é dev-only e garantir que `NODE_ENV=production` impede acesso | Segurança | `routes/seed.ts`, `routes/setup.ts` | Baixa | 1h — **PARCIALMENTE ATENDIDA**: endpoint agora requer `SETUP_SECRET` em qualquer ambiente (mais forte que apenas checar `NODE_ENV`); plaintext das senhas em `seed.ts` não foi removido (necessário para provisionar contas) — ver LAUNCH_CHECKLIST item 18 |

### P1 — Deve ser corrigido antes do lançamento público

| ID | Descrição | Módulo(s) afetado(s) | Arquivos | Dificuldade | Estimativa |
|---|---|---|---|---|---|
| **P1-1** | Configurar CORS com allowlist de origens (replit.app, replit.dev, domínio de produção) | Segurança | `app.ts` | Baixa | 1h |
| **P1-2** | Configurar `RESEND_API_KEY` como secret — emails de verificação e OTP funcionais | Integração | Secrets do Replit | Baixa | 30 min |
| **P1-3** | Configurar `TWILIO_*` como secrets — SMS/OTP funcional | Integração | Secrets do Replit | Baixa | 30 min |
| **P1-4** | Substituir `Math.random()` por `crypto.randomInt()` na geração de código de check-in/checkout | Segurança | `routes/job-execution.ts` | Baixa | 30 min |
| **P1-5** | Implementar wallet ledger — escrita automática em `completeJobCascade` (6 tipos de entrada) | Financeiro | `lib/ecosystem.ts`, `lib/db/src/schema/ledger.ts` | Alta | 2–3 dias |
| **P1-6** | Adicionar rate limiting persistente para login/OTP (ou aceitar in-memory como MVP com restart-awareness documentada) | Segurança | `lib/rate-limit.ts` | Média | 1–2 dias |
| **P1-7** | Taxas de nível na UI de Minha Carreira — ler do Split Engine via API em vez de hardcoded | Frontend / Financeiro | `pages/app/career.tsx` | Média | 4–6h |
| **P1-8** | Externalizar chave PIX de destino (`PLATFORM_PIX_KEY`) para variável de ambiente | Carteira | `pages/app/wallet.tsx` | Baixa | 1h |
| **P1-9** | Corrigir PRODUCT_ARCHITECTURE.md — tokens são persistentes (sessionsTable), não in-memory | Documentação | `docs/PRODUCT_ARCHITECTURE.md` | Baixa | 30 min |
| **P1-10** | Corrigir BUSINESS_MODEL.md — level keys são bronze/silver/gold/elite/diamond | Documentação | `docs/BUSINESS_MODEL.md` | Baixa | 30 min |
| **P1-11** | Atualizar AI_CONTEXT_V2_PROPOSTA.md — Express 5.2.1 (não 4.x), 24 enums (não 25), SSE apenas em chat.ts | Documentação | `AI_CONTEXT_V2_PROPOSTA.md` | Baixa | 1h |
| **P1-12** | Aplicar `requireAccountStatus("verified")` nas rotas críticas (ou garantir que o frontend force onboarding completo) | Auth / KYC | `lib/auth.ts`, rotas principais | Alta | 1–2 dias |
| **P1-13** | Declarar FKs explícitas no schema Drizzle (ao menos nas relações críticas: job_events→jobs, applications→users, transactions→wallets) | Banco | `lib/db/src/schema/` (múltiplos) | Média | 4–8h |

### P2 — Pode ser corrigido após lançamento

| ID | Descrição | Módulo(s) afetado(s) | Dificuldade | Estimativa |
|---|---|---|---|---|
| **P2-1** | Gerar e configurar VAPID keys — push web | Notificações | Baixa | 1h |
| **P2-2** | Tabela dedicada `push_subscriptions` em vez de `platform_config` multipropósito | Push | Média | 4h |
| **P2-3** | Escrow integrado ao fluxo de candidatura e conclusão de extras | Financeiro | Alta | 3–5 dias |
| **P2-4** | PIX automático via Asaas (depende de P2-3 + ativação Asaas) | Financeiro | Muito Alta | 1–2 semanas |
| **P2-5** | Progressão de nível totalmente automática (barra de progresso, histórico) | Minha Carreira | Média | 1–2 dias |
| **P2-6** | Admin mobile responsiveness (tabelas → cards em mobile) | Admin | Média | 2–3 dias |
| **P2-7** | Feed de atividade de indicações em real-time | Indicações | Média | 2–3 dias |
| **P2-8** | Compensação automática de representantes no ledger | Representantes | Alta | 3–5 dias |
| **P2-9** | Fraud prevention em indicações (auto-referral, ciclos, duplicatas) | Indicações | Alta | 2–3 dias |
| **P2-10** | Índices em colunas FK de alta frequência (walletId, jobId, userId) | Banco / Performance | Média | 4h |
| **P2-11** | Paginação em endpoints de listagem sem cursor/offset (admin analytics) | Performance | Média | 1–2 dias |
| **P2-12** | Substituir `.catch(() => {})` silenciosos por tratamento explícito | Qualidade | Baixa | 4–8h |
| **P2-13** | openapi.yaml expandido para cobrir governance, kyc, job-execution, verification | API / Docs | Média | 1–2 dias |
| **P2-14** | `platform_config` namespace seguro (separar push subscriptions de config financeira) | Arquitetura | Baixa | 2–4h |
| **P2-15** | Dashboard freelancer — remover `"freelancer"` de `ALL_USER_ROLES` ou criar view específica por role | Frontend | Baixa | 2h |

### P3 — Roadmap futuro (Fase 2–3)

| ID | Descrição |
|---|---|
| **P3-1** | Asaas — ativação completa (checklist completo em BUSINESS_MODEL.md) |
| **P3-2** | Motor de matching inteligente (histórico + geolocalização + avaliações) |
| **P3-3** | Verificação de identidade com background check |
| **P3-4** | Avaliações bilaterais completas com sistema de reputação |
| **P3-5** | Assinaturas profissionais/empresariais |
| **P3-6** | Mapa nacional em tempo real (heatmap vivo de demanda) |
| **P3-7** | Blog conectado a CMS |
| **P3-8** | Relatórios exportáveis (CSV/PDF) |
| **P3-9** | Produtos financeiros próprios (antecipação, crédito) |
| **P3-10** | Integrações com ERP/background check/escolas de qualificação |

---

## ORDEM DE IMPLEMENTAÇÃO SEGURA

### FASE 1 — Correções Críticas de Build e Segurança

**Objetivo:** Build limpo, senhas seguras, setup protegido, PII removido do código.
**Duração estimada:** 3–5 dias

---

#### Etapa 1.1 — Rebuild do dist (P0-1)

**Descrição:** Recompilar `lib/db` para incluir `job-events` e `job-codes` no dist. Isso resolve 12 dos 15 erros TypeScript sem nenhuma alteração de código.

**Commit:** `chore(db): rebuild lib/db dist — resolve 12 TS errors`

**Arquivos afetados:**
- `lib/db/dist/` — regenerado automaticamente pelo `tsc --build`

**Comando de execução:**
```bash
pnpm run typecheck:libs
```

**Critério de aceite:**
- `pnpm run typecheck:libs` retorna EXIT:0
- `tsc -p tsconfig.json --noEmit` no api-server mostra exatamente 3 erros (não 15)
- Os 3 erros restantes são apenas os de `kyc-admin.ts` e `verification.ts`

**Validação:**
```bash
cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit 2>&1 | grep "Found"
# Esperado: Found 3 errors in 2 files
```

**Dependências:** nenhuma — pode ser feito imediatamente.

**STATUS: ✅ CONCLUÍDA (13/07/2026, sessão 2).** `pnpm run typecheck:libs` EXIT:0, dist sincronizado (job-events.d.ts, job-codes.d.ts, captureMetadata, updatedAt, walletReservationId, waiting_checkin/waiting_checkout todos presentes e confirmados via grep direto no dist).

---

#### Etapa 1.2 — Correção do KYC `correction_requested` (P0-2)

**Descrição:** Substituir o valor inválido `"correction_requested"` em `usersTable.accountStatus` por `"pending_documents"` (que existe no enum e é semanticamente correto). Corrigir também a comparação impossível em `verification.ts`.

**Commit:** `fix(kyc): use pending_documents account status when requesting corrections`

**Arquivos afetados:**
```
artifacts/api-server/src/routes/kyc-admin.ts   — linhas 275 e 338
artifacts/api-server/src/routes/verification.ts — linha 271
```

**Mudanças exatas:**

Em `kyc-admin.ts` linhas 275 e 338:
```typescript
// ANTES (quebrado):
await db.update(usersTable).set({ accountStatus: "correction_requested" }).where(...)

// DEPOIS (correto):
await db.update(usersTable).set({ accountStatus: "pending_documents" }).where(...)
```

Em `verification.ts` linha 271:
```typescript
// ANTES (comparação impossível):
if (dbUser && (dbUser.accountStatus === "pending_documents" || dbUser.accountStatus === "correction_requested")) {

// DEPOIS (comparação válida):
if (dbUser && dbUser.accountStatus === "pending_documents") {
```

**Lógica mantida:** Os documentos individuais continuam recebendo `status: "correction_requested"` via `kycDocumentsTable` — isso funciona corretamente e não muda. O que muda é o status da conta (usersTable), que passa a usar `"pending_documents"` para indicar que o usuário deve reenviar documentos.

**Critério de aceite:**
- `tsc -p tsconfig.json --noEmit` retorna EXIT:0 (0 erros)
- `pnpm run build` (raiz) retorna EXIT:0

**Validação:**
```bash
cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit 2>&1 | grep "Found"
# Esperado: (sem output — zero erros)
pnpm run build
# Esperado: EXIT:0
```

**Dependências:** Etapa 1.1 deve estar concluída.

**STATUS: ✅ CONCLUÍDA (13/07/2026, sessão 2).** Correção aplicada exatamente como planejado. `tsc` backend: 0 erros. `pnpm run typecheck` raiz: EXIT:0. Ver `SPRINT_PROGRESS.md` checkpoint 2.

---

#### Etapa 1.3 — Remover PII de `dev-whitelist.ts` (P0-5)

**Descrição:** Remover CPF real e email pessoal real do código-fonte versionado. Mover para variáveis de ambiente (nomes apenas, nunca valores em documentação versionada).

**STATUS: ✅ CONCLUÍDA (13/07/2026, sessão 2).** Ver Checkpoint 3 em `SPRINT_PROGRESS.md`.

**Commit:** `security: remove real PII from dev-whitelist source code`

**Arquivos afetados:**
```
artifacts/api-server/src/lib/dev-whitelist.ts
```

**Mudança:**
```typescript
// ANTES (PII no código):
const WHITELIST_EMAILS = new Set(["<email pessoal real>"]);
const WHITELIST_CPFS   = new Set(["<cpf real>"]);

// DEPOIS (via variável de ambiente):
const rawEmails = process.env.DEV_WHITELIST_EMAILS ?? "";
const rawCpfs   = process.env.DEV_WHITELIST_CPFS ?? "";
const WHITELIST_EMAILS = new Set(rawEmails.split(",").map(e => e.trim().toLowerCase()).filter(Boolean));
const WHITELIST_CPFS   = new Set(rawCpfs.split(",").map(c => c.replace(/\D/g, "")).filter(Boolean));
```

**Critério de aceite:**
- `dev-whitelist.ts` não contém nenhum email real ou CPF real
- Funcionalidade de whitelist mantida (só desativa se env var não definida)

**Validação:**
```bash
grep -n "@gmail.com\|@yahoo.com" artifacts/api-server/src/lib/dev-whitelist.ts
# Esperado: nenhuma ocorrência
```

**Dependências:** Etapa 1.2.

---

#### Etapa 1.4 — Proteger endpoints de setup (P0-3, P0-6)

**Descrição:** Adicionar proteção simples aos endpoints `/api/setup/seed` e `/api/setup/admin`. A abordagem recomendada é verificar um `SETUP_SECRET` no header — simples, reversível, sem remover funcionalidade de desenvolvimento.

**Commit:** `security: protect setup endpoints with SETUP_SECRET header`

**Arquivos afetados:**
```
artifacts/api-server/src/routes/seed.ts
artifacts/api-server/src/routes/setup.ts
```

**Mudança (ambos os arquivos):**
```typescript
// No início de cada handler POST:
const setupSecret = process.env.SETUP_SECRET;
if (setupSecret) {
  const provided = req.headers["x-setup-secret"];
  if (provided !== setupSecret) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
}
// Se SETUP_SECRET não está definido, endpoint funciona normalmente (dev mode)
```

**Critério de aceite:**
- Com `SETUP_SECRET` definido: requisição sem o header retorna 403
- Com `SETUP_SECRET` definido: requisição com header correto funciona normalmente
- Sem `SETUP_SECRET`: comportamento inalterado (dev mode)

**Validação:**
```bash
# Sem secret no env: funciona
curl -X POST http://localhost:8080/api/setup/seed -H "Content-Type: application/json"

# Com SETUP_SECRET=meu-secret no env:
curl -X POST http://localhost:8080/api/setup/seed -H "x-setup-secret: meu-secret"
# Esperado: 200

curl -X POST http://localhost:8080/api/setup/seed
# Esperado: 403
```

**Dependências:** Etapa 1.3. Após implementar, definir `SETUP_SECRET` como Replit Secret.

---

#### Etapa 1.5 — Migração de senhas SHA-256 → Argon2id (P0-4)

**Descrição:** Implementar lazy migration de hash de senhas. Reconhece hash legado no login, valida, e rehash automático para Argon2id após login bem-sucedido.

**Commit:** `security: migrate password hashing from SHA-256 to Argon2id (lazy migration)`

**Arquivos afetados:**
```
artifacts/api-server/src/lib/auth.ts
artifacts/api-server/src/routes/auth.ts      (handler de login)
artifacts/api-server/package.json            (dependência: argon2)
```

**Mudança em `auth.ts`:**
```typescript
import argon2 from "argon2";

// Manter função legada para reconhecimento
export function hashPassword_sha256(password: string): string {
  return crypto.createHash("sha256").update(password + "extragO_salt_2024").digest("hex");
}

// Nova função para novas senhas
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

// Verificação unificada (detecta legado automaticamente)
export async function verifyPassword(input: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$argon2")) {
    return argon2.verify(storedHash, input);
  }
  // Legado SHA-256
  return storedHash === hashPassword_sha256(input);
}
```

**Handler de login — adicionar rehash após sucesso:**
```typescript
const isValid = await verifyPassword(password, user.passwordHash);
if (isValid && !user.passwordHash.startsWith("$argon2")) {
  // Rehash silencioso — sem impacto no fluxo
  const newHash = await hashPassword(password);
  await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id)).catch(() => {});
}
```

**ATENÇÃO:** `seed.ts` e `setup.ts` também usam `hashPassword`. Após essa mudança, a função se torna assíncrona. Atualizar as chamadas nesses arquivos.

**Critério de aceite:**
- Login com conta existente (SHA-256) funciona sem interrupção
- Após login bem-sucedido, hash no banco muda para `$argon2...`
- Login subsequente usa Argon2id automaticamente
- Nova conta usa Argon2id desde o cadastro

**Validação:**
```bash
# 1. Fazer login com uma conta existente
# 2. Verificar o hash no banco — deve começar com $argon2
# SELECT password_hash FROM users WHERE email = 'leonardoscheffel2000@gmail.com';
```

**Dependências:** Etapas 1.1–1.4. Esta etapa é a mais complexa da Fase 1 — planejar com cuidado.

---

### FASE 2 — Estabilização

**Objetivo:** CORS configurado, integrações externas funcionais, qualidade de código mínima.
**Duração estimada:** 3–5 dias

---

#### Etapa 2.1 — CORS com allowlist (P1-1)

**Commit:** `security: restrict CORS to known origins`

**Mudança em `app.ts`:**
```typescript
app.use(cors({
  origin: [
    process.env.APP_BASE_URL ?? "http://localhost:5000",
    /\.replit\.app$/,
    /\.replit\.dev$/,
  ],
  credentials: false,
}));
```

**Critério de aceite:**
- Requisição de `http://evil.com` retorna header `Access-Control-Allow-Origin` ausente ou diferente

---

#### Etapa 2.2 — Substituir `Math.random()` por CSPRNG (P1-4)

**Commit:** `security: use crypto.randomInt for check-in/checkout codes`

**Mudança em `job-execution.ts` linha 21:**
```typescript
// ANTES:
return String(Math.floor(100000 + Math.random() * 900000));

// DEPOIS:
return String(crypto.randomInt(100000, 1000000));
```

**Critério de aceite:**
- Código de 6 dígitos ainda gerado corretamente
- Sem import adicional necessário (crypto é built-in Node.js)

---

#### Etapa 2.3 — Configurar secrets de integrações (P1-2, P1-3)

**Commits separados:**
- `chore(env): configure RESEND_API_KEY secret`
- `chore(env): configure TWILIO_* secrets`

**Ações:** Configurar os secrets no Replit Secrets. Validar fallback para console em desenvolvimento.

**Critério de aceite:**
- `GET /admin/ops` ou endpoint de health mostra `emailProvider: "resend"` (não "dev-console")
- OTP de email chega ao destinatário real

---

#### Etapa 2.4 — Correções de documentação (P1-9, P1-10, P1-11)

**Commit:** `docs: correct stale claims in PRODUCT_ARCHITECTURE and BUSINESS_MODEL`

**Mudanças:**
- `docs/PRODUCT_ARCHITECTURE.md`: "Auth tokens in-memory" → "Auth tokens em sessionsTable (PostgreSQL)"
- `docs/BUSINESS_MODEL.md`: "beginner/junior/intermediate/senior/elite" → "bronze/silver/gold/elite/diamond"
- `AI_CONTEXT_V2_PROPOSTA.md`: "Express ~4.x" → "Express 5.2.1", "25 enums" → "24 enums", corrigir SSE

---

#### Etapa 2.5 — Taxas de nível via API no frontend (P1-7)

**Commit:** `feat(career): load level fees from Split Engine API instead of hardcoded values`

**Descrição:** A página de Minha Carreira exibe taxas fixas (20/18/15/12/10%). Se a Governance alterar essas taxas, a UI não reflete. Criar endpoint `GET /api/platform/fee-config` (público) que retorna as taxas por nível do Split Engine, ou expandir endpoint existente.

**Arquivos afetados:**
- `artifacts/extrag0/src/pages/app/career.tsx` — remover array LEVELS com feePercent fixo
- `artifacts/api-server/src/routes/stats.ts` ou novo endpoint público

**Critério de aceite:**
- Taxas exibidas na UI refletem valores do `platformConfigTable` em tempo real
- Mudança via Governance Center → tab Config reflete na UI de Carreira após refresh

---

#### Etapa 2.6 — Externalizar PLATFORM_PIX_KEY (P1-8)

**Commit:** `chore(env): externalize platform PIX key to environment variable`

**Mudança em `wallet.tsx`:**
```typescript
// ANTES:
const PLATFORM_PIX_KEY = "...valor fixo...";

// DEPOIS:
// Retornado pelo backend em GET /wallet/pix-info ou similar
```

---

### FASE 3 — Integrações Financeiras

**Objetivo:** Wallet Ledger automático, gateway Asaas pronto.
**Duração estimada:** 1–2 semanas

---

#### Etapa 3.1 — Wallet Ledger escrita automática (P1-5)

**Commit:** `feat(financial): wire wallet ledger entries in completeJobCascade`

**Descrição:** Instrumentar `completeJobCascade` para escrever entradas duplas no `walletLedgerTable` para cada movimentação:

| Entrada | Débito | Crédito | Tipo |
|---|---|---|---|
| Pagamento empresa | companyWallet | freelancerWallet | `job` |
| Taxa da plataforma | freelancerWallet | platformWallet | `platform_fee` |
| Comissão de indicação | platformWallet | referralWallet | `referral_commission` |
| Comissão representante | platformWallet | representativeWallet | `representative_commission` |

**Arquivos afetados:**
- `artifacts/api-server/src/lib/ecosystem.ts`

**Critério de aceite:**
- Após `completeJobCascade`, `wallet_ledger` tem ≥2 entradas por extra concluído
- Tab Carteira da Governance exibe histórico de transações

---

#### Etapa 3.2 — Escrow integrado ao fluxo (P2-3)

**Commit:** `feat(financial): integrate escrow into application approval and job completion flow`

Dependência: Etapa 3.1 concluída.

---

#### Etapa 3.3 — Webhook Asaas e ativação (P2-4)

**Commit:** `feat(asaas): implement webhook endpoint and activate payment gateway`

Dependência: Etapas 3.1 + 3.2 + aprovação explícita do CEO.

---

### FASE 4 — Qualidade

**Objetivo:** Sem erros silenciosos, FK constraints, índices, tipagem.
**Duração estimada:** 1 semana

- **P1-12** — Aplicar middlewares de verificação de conta (requireAccountStatus)
- **P1-13** — Declarar FK constraints no schema Drizzle
- **P2-10** — Índices em colunas de alta frequência
- **P2-11** — Paginação nos endpoints de listagem
- **P2-12** — Substituir `.catch(() => {})` silenciosos
- **P2-15** — Dashboard freelancer — remover acesso via ALL_USER_ROLES

---

### FASE 5 — Preparação para Produção

**Objetivo:** Declaração formal do ambiente, variáveis revisadas, testes manuais completos.
**Duração estimada:** 3–5 dias

- Declaração formal do ambiente de produção final pelo proprietário
- Revisão completa de todas as variáveis de ambiente
- Teste manual de todos os fluxos críticos com conta master
- Revisão de logs (sem erros de inicialização)
- Push VAPID configurado (P2-1)
- Tabela push_subscriptions criada (P2-2)

---

### FASE 6 — Lançamento

**Objetivo:** Deploy público, monitoramento ativo.
**Duração estimada:** 1–2 dias

- Deploy no ambiente de produção declarado
- Health check ativo
- Setup endpoints desabilitados em produção (via SETUP_SECRET)
- Monitoramento de logs de erro
- Rollback plan documentado

---

## RESUMO DO PLANO

```
FASE 1 (3–5 dias)        FASE 2 (3–5 dias)          FASE 3 (1–2 semanas)
─────────────────────    ─────────────────────────   ─────────────────────────
1.1 Rebuild dist         2.1 CORS allowlist          3.1 Wallet Ledger auto
1.2 Fix correction_req   2.2 CSPRNG codes            3.2 Escrow no fluxo
1.3 Remove PII           2.3 Config secrets          3.3 Asaas webhook
1.4 Protect setup        2.4 Fix docs
1.5 Argon2id migration   2.5 Fees via API
                         2.6 PIX key env

FASE 4 (1 semana)        FASE 5 (3–5 dias)           FASE 6 (1–2 dias)
─────────────────────    ─────────────────────────   ─────────────────────────
P1-12 Auth middleware    Env review                  Deploy
P1-13 FK constraints     Var audit                   Health check
P2-10 Indexes            Manual testing              Monitoring
P2-11 Pagination         VAPID setup                 Rollback plan
P2-12 .catch() fixes     Push subscriptions table
P2-15 Dashboard roles    Produção declarada
```

---

## DEPENDÊNCIAS ENTRE ETAPAS

```
1.1 (rebuild dist)
  └→ 1.2 (fix correction_requested) — depende de 1.1
       └→ 1.3 (remove PII)
            └→ 1.4 (protect setup)
                 └→ 1.5 (Argon2id) — mais complexa; pode ser paralelizada com 2.x após 1.4

2.x → podem começar em paralelo após 1.2 concluída
3.x → dependem de 2.x estabilizadas
4.x → dependem de 3.x (especialmente ledger)
5.x → dependem de todas as fases anteriores
6   → depende de 5
```

---

## CRITÉRIOS DE CONCLUSÃO POR FASE

### Fase 1 concluída quando:
```
□ pnpm run typecheck retorna EXIT:0 (0 erros)
□ pnpm run build retorna EXIT:0
□ dev-whitelist.ts sem PII real
□ Setup endpoints retornam 403 sem SETUP_SECRET header
□ Login com conta existente mantém funcionamento
□ Hash no banco muda para $argon2 após primeiro login
```

### Fase 2 concluída quando:
```
□ CORS: req de domínio não permitido retorna sem ACAO header
□ Código de check-in usa crypto.randomInt
□ Email de verificação chega ao destinatário real (Resend ativo)
□ SMS de OTP funcional (Twilio ativo)
□ Taxas na UI de Carreira refletem platformConfigTable
□ Documentação atualizada (Express 5, 24 enums, SSE apenas chat)
```

### Fase 3 concluída quando:
```
□ wallet_ledger tem entradas após cada extra concluído
□ Tab Carteira da Governance exibe ledger populado
□ Escrow criado ao aprovar candidatura (se enabled=true)
```

### Fase 4 concluída quando:
```
□ Usuário não verificado recebe 403 em endpoints protegidos (via requireAccountStatus)
□ FK constraints declarados nas relações críticas
□ Nenhum .catch(() => {}) silencioso em operações críticas
```

### Fase 5 concluída quando:
```
□ Proprietário declarou ambiente de produção final
□ Todas as env vars revisadas e confirmadas
□ Todos os fluxos testados manualmente com conta master
□ Zero erros nos logs de inicialização
```

### Fase 6 concluída quando:
```
□ Deploy executado com sucesso
□ Health check retornando 200
□ Setup endpoints bloqueados em produção
□ Monitoramento de logs ativo
```

---

*Arquivos modificados: nenhum*
*Arquivos criados: RECOVERY_ROADMAP.md*
*Banco alterado: não*
