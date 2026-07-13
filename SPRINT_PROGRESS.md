# SPRINT_PROGRESS.md — extraGO
# Registro de checkpoints — Conta 1 (Sprints 01 e 02)

> Cada checkpoint só é registrado após ser salvo e validado. Não avançar sem checkpoint anterior salvo.

---

## CHECKPOINT 0 — Estado inicial (13/07/2026)

**Documentos revisados:** AGENT_START_HERE.md, SYSTEM_STATE.md, RECOVERY_ROADMAP.md, LAUNCH_CHECKLIST.md (docs.md/MASTER_CONTEXT, BUSINESS_MODEL, PRODUCT_ARCHITECTURE, VISUAL_GUIDELINES, TEST_DATA_POLICY, ROADMAP, AI_CONTEXT, AI_CONTEXT_V2_PROPOSTA já auditados na sessão anterior e refletidos em SYSTEM_STATE.md — não re-auditados nesta sessão por regra de economia de cota).

**Estado real confirmado nesta sessão (revalidação direta, não reaproveitamento):**
- `pnpm run typecheck:libs` → EXIT:0
- `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` → EXIT:0 (comando), **3 erros reportados** em 2 arquivos (kyc-admin.ts ×2, verification.ts ×1) — coincide exatamente com SYSTEM_STATE.md item 12.
- dist de `lib/db` sincronizado: job-events.d.ts, job-codes.d.ts, captureMetadata, updatedAt, walletReservationId, waiting_checkin/waiting_checkout — todos confirmados presentes via grep direto.

**Classificação:** CONFIRMADO — SYSTEM_STATE.md refletia com precisão o estado real no momento da leitura.

**Primeira etapa a executar:** Checkpoint 1 (sincronizar lib/db) — já satisfeito pelo estado atual; segue-se diretamente para Checkpoint 2.

---

## CHECKPOINT 1 — Sincronizar lib/db (13/07/2026)

**Resultado:** `pnpm run typecheck:libs` já retornava EXIT:0 antes de qualquer alteração nesta sessão. Dist já estava sincronizado com o source (rebuild feito em sessão anterior, registrado em SYSTEM_STATE.md item 5/6/12).

**Confirmações diretas:**
```
lib/db/dist/schema/job-events.d.ts   → existe
lib/db/dist/schema/job-codes.d.ts    → existe
captureMetadata                       → presente em verification.d.ts:915
updatedAt                             → presente em jobs.d.ts:314
walletReservationId                   → presente em jobs.d.ts:280
waiting_checkin / waiting_checkout    → presentes em jobs.d.ts (enum + literal types)
```

**tsc api-server pós-confirmação:** 3 erros em 2 arquivos (kyc-admin.ts linhas 275/338, verification.ts linha 271) — exatamente os erros de código (não de dist) previstos por SYSTEM_STATE.md e RECOVERY_ROADMAP.md.

**Critério de conclusão:** ✅ ATENDIDO — typecheck:libs exit 0; dist sincronizado; erros de dist desatualizado inexistentes; únicos erros restantes são de código (Checkpoint 2).

**Documentos atualizados:** nenhuma alteração necessária em SYSTEM_STATE.md/RECOVERY_ROADMAP/LAUNCH_CHECKLIST para este checkpoint especificamente (já documentavam corretamente este estado) — apenas este registro em SPRINT_PROGRESS.md.

---

## CHECKPOINT 2 — Corrigir KYC (13/07/2026)

**Revalidação de semântica (antes de codificar):**
- `kycDocumentStatusEnum` TEM `"correction_requested"` — usado corretamente para status de documento individual (`kycDocumentsTable.status`). Mantido sem alteração.
- `accountStatusEnum` NÃO TEM `"correction_requested"` — 9 valores confirmados no source e dist. `"pending_documents"` já existe e representa corretamente "conta aguardando reenvio de documentos".
- Nenhuma alteração de schema necessária — confirmado.

**Alterações de código:**
- `artifacts/api-server/src/routes/kyc-admin.ts` linha 275 (rota `/admin/kyc/users/:id/request-documents`): `accountStatus: "correction_requested"` → `accountStatus: "pending_documents"`.
- `artifacts/api-server/src/routes/kyc-admin.ts` linha 338 (rota `/admin/kyc/users/:id/request-selfie`): idêntico.
- `artifacts/api-server/src/routes/verification.ts` linha 271: comparação `dbUser.accountStatus === "pending_documents" || dbUser.accountStatus === "correction_requested"` → apenas `dbUser.accountStatus === "pending_documents"` (removida a metade impossível, sem overlap de tipos).

**Lógica de negócio preservada:** documentos individuais continuam recebendo `status: "correction_requested"` em `kycDocumentsTable` — comportamento inalterado. Apenas o status da CONTA passou a usar o valor correto do enum.

**Validação (exit codes reais, nesta sessão):**

| Comando | Exit Code |
|---|---|
| `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` | **0** — 0 erros (`grep "Found"` vazio) |
| `pnpm run typecheck` (raiz) | **0** |
| `pnpm --filter @workspace/api-server run build` (esbuild) | **0** |
| `pnpm --filter @workspace/extrag0 run build` (vite) | **0** |
| `pnpm run build` (raiz, `pnpm -r --if-present run build`) | **falha** — mas apenas em `artifacts/mockup-sandbox` (canvas), que exige env vars `PORT`/`BASE_PATH` só fornecidas pelo workflow do canvas. Não é regressão do produto; api-server e extrag0 (os artefatos reais do produto) buildam isoladamente com EXIT:0. |

**Nenhuma supressão usada:** sem `any`, `ts-ignore` ou `ts-expect-error` introduzidos.
**Nenhuma mudança de schema:** confirmado — apenas 3 linhas de código de rota alteradas.

**Critério de conclusão:** ✅ ATENDIDO — backend 0 erros TS; typecheck raiz EXIT:0; build dos artefatos de produto (api-server + extrag0) EXIT:0; sem supressões; sem mudança de schema.

**Bloqueio registrado (não resolvido nesta etapa, fora do escopo do Checkpoint 2):** `pnpm run build` na raiz continua falhando por causa do mockup-sandbox exigir PORT/BASE_PATH fora do contexto de workflow — não é um bloqueador de KYC/typecheck, é uma característica de configuração do artefato de canvas. Registrado em LAUNCH_CHECKLIST.md item 8 como ⚠️.

**Documentos atualizados:** SYSTEM_STATE.md (seção 8), RECOVERY_ROADMAP.md (Etapas 1.1 e 1.2 marcadas concluídas), LAUNCH_CHECKLIST.md (itens 1-7, 9 marcados ✅; item 8 marcado ⚠️ com nota).

---

## CHECKPOINT 3 — Remover PII do código (13/07/2026)

**Revalidação de semântica:** `kycDocumentStatusEnum` não afetado por este checkpoint; escopo é exclusivamente `artifacts/api-server/src/lib/dev-whitelist.ts`.

**Alteração:** hardcoded `WHITELIST_EMAILS`/`WHITELIST_CPFS`/`WHITELIST_PHONES` (email pessoal real + CPF real + telefone versionados) substituídos por leitura de variáveis de ambiente:
- `DEV_WHITELIST_EMAILS` (lista separada por vírgula)
- `DEV_WHITELIST_CPFS` (lista separada por vírgula)
- `DEV_WHITELIST_PHONES` (lista separada por vírgula)

Ausência de qualquer variável → `Set` vazio → whitelist inativa para aquele tipo (comportamento no-op, conforme requisito). `isDevWhitelistActive()` (gate por `NODE_ENV !== "production"`) inalterado — em produção nada disto executa, independentemente das variáveis estarem definidas.

**Nenhum valor real foi definido como variável de ambiente nesta sessão** — não era necessário para o checkpoint (remover PII do código versionado), e a introdução de novos valores reais é decisão do proprietário da conta, fora do escopo desta tarefa.

**Documentação:** SYSTEM_STATE.md (seção 10/item 10 da tabela, linhas de PII) e RECOVERY_ROADMAP.md (Etapa 1.3) tinham o email pessoal e CPF real em texto — ambos foram redigidos/mascarados nesta sessão, pois são documentos vivos ativamente mantidos (não auditorias históricas como AUDITORIA_PARTE_1.md, que foi deixada intocada por ser registro histórico).

**Validação (exit codes reais):**

| Comando | Exit Code |
|---|---|
| `grep -rn "PII real" (email/CPF específicos)` em todo o repo (exceto `.git`, `node_modules`, `AUDITORIA_PARTE_1.md` histórico) | vazio nos arquivos vivos alterados |
| `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` | **0** |
| `pnpm run typecheck` (raiz) | **0** |
| `pnpm --filter @workspace/api-server run build` | **0** |

**Critério de conclusão:** ✅ ATENDIDO — nenhum PII real em `dev-whitelist.ts`; comportamento desativado em produção preservado; ausência de env vars resulta em whitelist vazia; typecheck e build passam.

**Documentos atualizados:** SYSTEM_STATE.md, RECOVERY_ROADMAP.md, LAUNCH_CHECKLIST.md (itens 16, 17, 19 marcados ✅; item 18 mantido pendente — fora de escopo).

---

## CHECKPOINT 4 — Proteger setup (13/07/2026)

**Implementação:** novo módulo `artifacts/api-server/src/lib/setup-guard.ts` exportando middleware `requireSetupSecret`, aplicado a `POST /api/setup/seed` (`routes/seed.ts`) e `POST /api/setup/admin` (`routes/setup.ts`).

**Regras implementadas:**
- `SETUP_SECRET` lido exclusivamente de `process.env`. Nunca logado, nunca ecoado na resposta.
- Se `SETUP_SECRET` não estiver definido → **sempre 403**, em qualquer `NODE_ENV` (não apenas em produção — bloqueio é o padrão seguro até alguém definir o secret deliberadamente).
- Se definido, o caller deve enviar o valor exato no header `x-setup-secret`.
- Comparação em tempo constante via `crypto.timingSafeEqual` (com checagem de tamanho antes, para não vazar timing por diferença de comprimento) — evita side-channel timing attack.
- Resposta de falha é genérica: `{ error: "Setup endpoints are disabled" }` — nunca revela se o problema foi "sem header" vs "header errado" vs "secret não configurado".
- Não executa seed durante a validação — apenas testes de rota com curl, sem body de seed real.

**Validação real executada (server rodando, restart aplicado):**

```
POST /api/setup/seed  (sem header)              → 403
POST /api/setup/seed  (header x-setup-secret errado) → 403
POST /api/setup/admin (sem header)               → 403
```

**Validação de build:**

| Comando | Exit Code |
|---|---|
| `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit` | **0** |
| `pnpm run typecheck` (raiz) | **0** |
| `pnpm --filter @workspace/api-server run build` | **0** |

**Critério de conclusão:** ✅ ATENDIDO — 403 sem secret correto em produção OU desenvolvimento; comparação segura; sem log do secret; sem detalhes sensíveis na resposta; funcionalidade dev preservada via configuração explícita do secret; seed não foi executado durante a validação.

**Bloqueio registrado para o proprietário da conta:** `SETUP_SECRET` ainda não está definido como Replit Secret neste ambiente. Isso significa que, no estado atual, **nenhuma chamada a `/api/setup/seed` ou `/api/setup/admin` funcionará** — inclusive para o próprio proprietário — até que o secret seja configurado explicitamente (ver `environment-secrets` skill / painel de Secrets do Replit). Este é o comportamento correto e esperado pelo checkpoint (“sem SETUP_SECRET em produção, endpoint deve permanecer bloqueado”), estendido também ao ambiente de desenvolvimento por segurança. Item 15 do LAUNCH_CHECKLIST.md marcado como ação pendente do proprietário.

**Item fora de escopo, registrado e não resolvido:** P0-6 / LAUNCH_CHECKLIST item 18 — senhas de produção em plaintext dentro de `seed.ts` não foram removidas (são necessárias para provisionar as 6 contas aprovadas via upsert idempotente). A proteção por `SETUP_SECRET` mitiga o risco de execução não autorizada, mas o plaintext ainda existe no histórico de código-fonte versionado. Fica registrado como bloqueio para uma etapa futura (fora do escopo dos Checkpoints 1-4 desta conta).

**Documentos atualizados:** RECOVERY_ROADMAP.md (P0-1 a P0-6 com status atualizado), LAUNCH_CHECKLIST.md (itens 13, 14 ✅; item 15 com nota de ação pendente do proprietário).

---

## RESUMO FINAL DA SESSÃO (13/07/2026)

**Checkpoints 0-4 concluídos nesta conta.** Estado final:

| Verificação | Status |
|---|---|
| `pnpm run typecheck:libs` | ✅ EXIT:0 |
| `cd artifacts/api-server && npx tsc --noEmit` | ✅ EXIT:0 (0 erros) |
| `pnpm run typecheck` (raiz) | ✅ EXIT:0 |
| `pnpm --filter @workspace/api-server run build` | ✅ EXIT:0 |
| `pnpm --filter @workspace/extrag0 run build` | ✅ EXIT:0 |
| `pnpm run build` (raiz, todos os workspaces) | ⚠️ falha apenas em `artifacts/mockup-sandbox` (exige PORT/BASE_PATH do workflow do canvas — não é regressão de produto) |
| PII real em `dev-whitelist.ts` | ✅ removido — lido de env vars (`DEV_WHITELIST_EMAILS/CPFS/PHONES`) |
| `/api/setup/seed` e `/api/setup/admin` sem `SETUP_SECRET` | ✅ retornam 403 (testado em runtime) |

**Bloqueios registrados para próxima conta/sessão (não resolvidos, fora do escopo desta conta):**
1. **P0-4** — hash de senha SHA-256 → Argon2id (lazy migration) — não iniciado.
2. **P0-6 / item 18** — senhas de produção em plaintext em `seed.ts` — não removido (necessário para upsert idempotente das 6 contas; mitigado por SETUP_SECRET mas não eliminado).
3. **Ação do proprietário** — `SETUP_SECRET` precisa ser definido como Replit Secret antes que `/api/setup/seed`/`/api/setup/admin` voltem a funcionar em qualquer ambiente.
4. **CORS irrestrito** (P1-1), **Math.random() em códigos de check-in** (P1-4), **rate limiting in-memory** (P1-6) e demais itens P1/P2 do RECOVERY_ROADMAP.md — não abordados, fora do escopo desta conta.
5. **`pnpm run build` na raiz** continua falhando por causa do `artifacts/mockup-sandbox` exigir env vars fornecidas apenas pelo workflow do canvas — não é um bloqueador de lançamento do produto (api-server + extrag0), mas impede usar o comando de build "tudo de uma vez" fora do workflow.

**Nenhuma migration, seed ou alteração de dados reais foi executada nesta sessão.** Nenhuma refatoração fora do escopo foi realizada. Nenhuma regra financeira foi alterada.
