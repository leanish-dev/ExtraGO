# LAUNCH_CHECKLIST.md — extraGO
# Checklist de Lançamento

> **Gerado em:** 13 de julho de 2026
> **Versão:** 1.0 — baseada em SYSTEM_STATE.md e RECOVERY_ROADMAP.md
> **Uso:** Este documento é verificado manualmente antes de cada etapa de lançamento.
> Cada item deve ter evidência concreta antes de ser marcado ✅.

---

## COMO USAR ESTE CHECKLIST

- Marcar `✅` somente quando evidência concreta confirma o item
- Marcar `❌` quando confirmado como falho
- Marcar `⚠️` quando parcialmente implementado ou com ressalvas
- Nunca marcar `✅` sem executar o teste descrito
- O lançamento só é autorizado quando todos os itens **GATE** estão `✅`
- Itens **NICE** podem ser `⚠️` no lançamento mas devem virar `✅` pós-lançamento

---

## SEÇÃO 1 — BUILD E TIPAGEM

### 1.1 Libs compiladas (lib/db dist atualizado)

| # | Item | Teste | Status |
|---|---|---|---|
| 1 | `pnpm run typecheck:libs` retorna EXIT:0 | `pnpm run typecheck:libs && echo OK` | `✅` GATE — confirmado 13/07/2026 |
| 2 | `lib/db/dist/schema/` inclui `job-events.d.ts` | `ls lib/db/dist/schema/ | grep job-events` | `✅` GATE — confirmado |
| 3 | `lib/db/dist/schema/` inclui `job-codes.d.ts` | `ls lib/db/dist/schema/ | grep job-codes` | `✅` GATE — confirmado |

### 1.2 Typecheck do backend

| # | Item | Teste | Status |
|---|---|---|---|
| 4 | Backend sem erros TypeScript | `cd artifacts/api-server && npx tsc -p tsconfig.json --noEmit 2>&1 | grep Found` → vazio | `✅` GATE — confirmado 13/07/2026 |
| 5 | `kyc-admin.ts` sem `"correction_requested"` em accountStatus | `grep -n "correction_requested" artifacts/api-server/src/routes/kyc-admin.ts` → vazio (só usos em kycDocumentsTable.status, corretos) | `✅` GATE — confirmado |
| 6 | `verification.ts` sem comparação impossível | comparação `=== "correction_requested"` removida; enum overlap agora válido | `✅` GATE — confirmado |

### 1.3 Typecheck do frontend

| # | Item | Teste | Status |
|---|---|---|---|
| 7 | Frontend sem erros TypeScript | `cd artifacts/extrag0 && npx tsc --noEmit 2>&1 | tail -5` → 0 erros | `✅` GATE — confirmado 13/07/2026 |

### 1.4 Build completo

| # | Item | Teste | Status |
|---|---|---|---|
| 8 | `pnpm run build` (raiz) retorna EXIT:0 | `pnpm run build; echo "EXIT:$?"` | `⚠️` GATE — api-server e extrag0 buildam com EXIT:0 isoladamente; `pnpm run build` na raiz falha apenas em `artifacts/mockup-sandbox` (exige env vars PORT/BASE_PATH do workflow do canvas, não é regressão de produto) |
| 9 | Bundle do frontend gerado em `artifacts/extrag0/dist/` | `ls artifacts/extrag0/dist/public/assets/*.js | head -3` | `✅` GATE — confirmado 13/07/2026 |

---

## SEÇÃO 2 — SEGURANÇA

### 2.1 Hash de senhas

| # | Item | Teste | Status |
|---|---|---|---|
| 10 | `hashPassword` em `lib/auth.ts` usa Argon2id (não SHA-256) | `grep -n "argon2\|sha256" artifacts/api-server/src/lib/auth.ts` → argon2, não sha256 | `□` GATE |
| 11 | Lazy migration implementada no handler de login | Login com conta existente funciona + hash muda para `$argon2...` no banco | `□` GATE |
| 12 | SHA-256 legado ainda reconhecido (retrocompatibilidade) | `grep hashPassword_sha256 artifacts/api-server/src/lib/auth.ts` → função existe | `□` GATE |

### 2.2 Endpoints de setup protegidos

| # | Item | Teste | Status |
|---|---|---|---|
| 13 | `POST /api/setup/seed` retorna 403 sem header correto | `curl -X POST http://localhost:8080/api/setup/seed` → 403 | `✅` GATE — confirmado 13/07/2026 (testado sem header e com header incorreto, ambos 403) |
| 14 | `POST /api/setup/admin` retorna 403 sem header correto | `curl -X POST http://localhost:8080/api/setup/admin` → 403 | `✅` GATE — confirmado 13/07/2026 |
| 15 | `SETUP_SECRET` definido como Replit Secret | Verificar em ambiente de produção | `□` GATE — **AÇÃO REQUERIDA DO PROPRIETÁRIO**: sem `SETUP_SECRET` definido, os endpoints ficam permanentemente bloqueados (403) em qualquer ambiente, inclusive quando o próprio proprietário precisar rodar o seed. Definir o secret via Replit Secrets antes de usar `/api/setup/seed` ou `/api/setup/admin`. |

### 2.3 PII e senhas no código-fonte

| # | Item | Teste | Status |
|---|---|---|---|
| 16 | Nenhum CPF real em `dev-whitelist.ts` | `grep -n "[0-9]\{11\}" artifacts/api-server/src/lib/dev-whitelist.ts` → vazio | `✅` GATE — confirmado 13/07/2026 |
| 17 | Nenhum email pessoal real em `dev-whitelist.ts` | `grep -n "leoscheffel\|.@gmail\|.@yahoo" artifacts/api-server/src/lib/dev-whitelist.ts` → vazio | `✅` GATE — confirmado |
| 18 | Senhas de produção não estão em `setup.ts` como plaintext | `grep -n "Gremory\|Extrago\|Qaialla\|ext123" artifacts/api-server/src/routes/setup.ts` → vazio | `□` NICE — não abordado nesta sessão (fora do escopo dos Checkpoints 1-4; ver Checkpoint 4 nota) |
| 19 | `dev-whitelist.ts` busca whitelist de variáveis de ambiente | `grep "process.env" artifacts/api-server/src/lib/dev-whitelist.ts` → ao menos 1 ocorrência | `✅` GATE — confirmado: `DEV_WHITELIST_EMAILS`, `DEV_WHITELIST_CPFS`, `DEV_WHITELIST_PHONES` |

### 2.4 CORS

| # | Item | Teste | Status |
|---|---|---|---|
| 20 | CORS configurado com allowlist (não wildcard) | `grep "cors(" artifacts/api-server/src/app.ts` → contém `origin:` com array ou regex | `□` GATE |
| 21 | Requisição de origem não permitida retorna sem ACAO header | `curl -H "Origin: http://evil.com" http://localhost:8080/api/health -v 2>&1 | grep -i access-control` → vazio | `□` GATE |

### 2.5 Criptografia em dados operacionais

| # | Item | Teste | Status |
|---|---|---|---|
| 22 | Códigos de check-in/checkout usam `crypto.randomInt` | `grep -n "randomInt\|Math.random" artifacts/api-server/src/routes/job-execution.ts` → randomInt (não Math.random) | `□` GATE |

### 2.6 Rate limiting

| # | Item | Teste | Status |
|---|---|---|---|
| 23 | Rate limiting ativo em `/api/auth/login` | Mais de 10 tentativas em 60s → 429 | `□` GATE |
| 24 | Rate limiting ativo em `/api/auth/verify-otp` | Mais de 5 tentativas em 60s → 429 | `□` GATE |
| 25 | Limitação aceitável para MVP (in-memory) documentada | Consta em replit.md ou SYSTEM_STATE.md como trade-off conhecido | `□` NICE |

---

## SEÇÃO 3 — AUTENTICAÇÃO E AUTORIZAÇÃO

### 3.1 Sessões

| # | Item | Teste | Status |
|---|---|---|---|
| 26 | Token gerado no login existe em `sessionsTable` no banco | `SELECT * FROM sessions WHERE user_id = <id> ORDER BY created_at DESC LIMIT 1;` | `□` GATE |
| 27 | Token expira em 30 dias | `SELECT expires_at FROM sessions WHERE user_id = <id>` → `created_at + 30 days` | `□` GATE |
| 28 | Logout invalida sessão no banco | Após logout: `SELECT * FROM sessions WHERE token = '<token>'` → vazio | `□` GATE |

### 3.2 Controle de acesso

| # | Item | Teste | Status |
|---|---|---|---|
| 29 | Freelancer não acessa `/admin/*` | Token de freelancer em `GET /api/admin/users` → 403 | `□` GATE |
| 30 | Qaialla não acessa `/admin/governance/*` | Token de Qaialla em `GET /api/admin/governance/config` → 403 | `□` GATE |
| 31 | CEO acessa `/admin/governance/*` | Token de Leonardo em `GET /api/admin/governance/config` → 200 | `□` GATE |
| 32 | Token inválido retorna 401 | `curl -H "Authorization: Bearer token-invalido" /api/auth/me` → 401 | `□` GATE |

### 3.3 Verificação de conta (se middleware aplicado)

| # | Item | Teste | Status |
|---|---|---|---|
| 33 | Usuário `draft` não acessa rotas autenticadas de app | Token de conta draft → 403 nos endpoints protegidos | `□` GATE (se P1-12 implementado) |
| 34 | Usuário `pending_review` não cria Extra | Token de conta pending_review em `POST /api/jobs` → 403 | `□` GATE (se P1-12 implementado) |

---

## SEÇÃO 4 — BANCO DE DADOS

### 4.1 Conexão e migrações

| # | Item | Teste | Status |
|---|---|---|---|
| 35 | Banco PostgreSQL acessível | `psql $DATABASE_URL -c "SELECT 1"` → `1` | `□` GATE |
| 36 | Todas as 35 tabelas existem no banco | `psql $DATABASE_URL -c "\dt" | wc -l` → ≥37 linhas | `□` GATE |
| 37 | Todos os 24 enums PostgreSQL existem | `psql $DATABASE_URL -c "SELECT typname FROM pg_type WHERE typtype='e' ORDER BY typname"` → 24 resultados | `□` GATE |
| 38 | Schema do banco foi sincronizado com `drizzle-kit push` | `drizzle-kit push --config=lib/db/drizzle.config.ts` → sem mudanças pendentes | `□` GATE |

### 4.2 Integridade dos dados

| # | Item | Teste | Status |
|---|---|---|---|
| 39 | Todas as 6 contas aprovadas existem no banco | `SELECT id, email, role, account_status FROM users WHERE role = 'admin' OR email LIKE '%teste%'` | `□` GATE |
| 40 | Contas CEO/CMO/CCO têm `account_status = 'verified'` | `SELECT email, account_status FROM users WHERE admin_role = 'super_admin'` → all verified | `□` GATE |
| 41 | Wallets existem para as 6 contas | `SELECT u.email, w.type FROM users u JOIN wallets w ON w.user_id = u.id` → ao menos 1 wallet por conta | `□` GATE |

### 4.3 FK Constraints (se P1-13 implementado)

| # | Item | Teste | Status |
|---|---|---|---|
| 42 | FK constraints ativas nas relações críticas | `psql $DATABASE_URL -c "SELECT conname FROM pg_constraint WHERE contype='f'"` → lista não vazia | `□` NICE |

---

## SEÇÃO 5 — FLUXOS CRÍTICOS

### 5.1 Cadastro e verificação de conta

| # | Item | Teste | Status |
|---|---|---|---|
| 43 | Cadastro de novo freelancer funciona | POST `/api/auth/register` com dados válidos → 201, email de verificação enviado | `□` GATE |
| 44 | Verificação de email funciona | Clicar no link de verificação → `email_verified_at` preenchido no banco | `□` GATE |
| 45 | Verificação de telefone (OTP SMS) funciona | `POST /api/verification/send-otp` → SMS recebido, OTP válido aceito | `□` GATE |
| 46 | Upload de documento KYC funciona | `POST /api/kyc/upload/:type` com arquivo → kycDocumentsTable atualizado | `□` GATE |
| 47 | Aprovação KYC pelo admin funciona | Admin aprova via `/admin/kyc/:id/approve` → `accountStatus = "verified"` | `□` GATE |
| 48 | Solicitação de correção KYC funciona (pós-fix) | Admin solicita correção → `accountStatus = "pending_documents"`, documentos = `"correction_requested"` | `□` GATE |

### 5.2 Ciclo de vida de Extra

| # | Item | Teste | Status |
|---|---|---|---|
| 49 | Empresa cria Extra | `POST /api/jobs` → Extra aparece em `GET /api/jobs` com status `open` | `□` GATE |
| 50 | Freelancer se candidata | `POST /api/jobs/:id/apply` → application criada, status `pending` | `□` GATE |
| 51 | Empresa aprova candidatura | `PUT /api/applications/:id/approve` → application `approved`, job `in_progress` | `□` GATE |
| 52 | Empresa gera código de check-in | `POST /api/job-execution/:id/generate-checkin-code` → jobCodesTable atualizado | `□` GATE |
| 53 | Freelancer faz check-in com código | `POST /api/job-execution/:id/checkin` → job `waiting_checkout` | `□` GATE |
| 54 | Empresa gera código de checkout | `POST /api/job-execution/:id/generate-checkout-code` | `□` GATE |
| 55 | Freelancer faz checkout | `POST /api/job-execution/:id/checkout` → job `completed` | `□` GATE |
| 56 | Pagamento processado após conclusão | `completeJobCascade` executado → wallets atualizados, transações criadas | `□` GATE |

### 5.3 Carteira digital

| # | Item | Teste | Status |
|---|---|---|---|
| 57 | Saldo da empresa reduz ao reservar extra | Wallet da empresa: saldo antes > saldo depois da reserva | `□` GATE |
| 58 | Saldo do freelancer aumenta após conclusão | Wallet do freelancer: saldo antes < saldo depois de `completeJobCascade` | `□` GATE |
| 59 | Requisição de saque cria registro em `deposit_requests` | `POST /api/wallet/withdraw-request` → registro no banco | `□` GATE |
| 60 | Admin aprova saque via fluxo 2-steps | Confirm → Approve → status `approved` | `□` GATE |

### 5.4 Indicações

| # | Item | Teste | Status |
|---|---|---|---|
| 61 | Código de indicação único gerado no cadastro | `SELECT referral_code FROM users WHERE id = <novo_id>` → valor não nulo e único | `□` GATE |
| 62 | Uso de código de indicação vincula referrer | Cadastro com `?ref=CODIGO` → `referral_info` preenchida no banco | `□` GATE |
| 63 | Comissão de indicação calculada corretamente | `calculateReferralRate` retorna 2/3/5% conforme tier | `□` GATE |

---

## SEÇÃO 6 — INTEGRAÇÕES EXTERNAS

### 6.1 Email (Resend)

| # | Item | Teste | Status |
|---|---|---|---|
| 64 | `RESEND_API_KEY` configurado como secret | Verificar em Replit Secrets | `□` GATE |
| 65 | Email de verificação chegou ao destinatário | Completar cadastro → checar inbox real | `□` GATE |
| 66 | Email de OTP chegou ao destinatário | Solicitar OTP → checar inbox real | `□` GATE |

### 6.2 SMS (Twilio)

| # | Item | Teste | Status |
|---|---|---|---|
| 67 | `TWILIO_ACCOUNT_SID` configurado como secret | Verificar em Replit Secrets | `□` GATE |
| 68 | `TWILIO_AUTH_TOKEN` configurado como secret | Verificar em Replit Secrets | `□` GATE |
| 69 | `TWILIO_PHONE_NUMBER` configurado como secret | Verificar em Replit Secrets | `□` GATE |
| 70 | SMS de OTP chegou ao destinatário | Solicitar OTP via telefone → receber SMS real | `□` GATE |

### 6.3 Asaas (Gateway de Pagamento)

| # | Item | Teste | Status |
|---|---|---|---|
| 71 | Status do Asaas é `not_implemented` (esperado pré-lançamento) | `GET /api/admin/governance/financial` → `asaasStatus: "not_implemented"` | `□` NICE |
| 72 | Decisão sobre ativação do Asaas documentada pelo CEO | Consta em RECOVERY_ROADMAP.md ou decisão registrada | `□` NICE |

### 6.4 Push Web (VAPID)

| # | Item | Teste | Status |
|---|---|---|---|
| 73 | `VAPID_PUBLIC_KEY` configurado | Verificar em Replit Secrets | `□` NICE (P2) |
| 74 | `VAPID_PRIVATE_KEY` configurado | Verificar em Replit Secrets | `□` NICE (P2) |
| 75 | Notificação push chegou ao browser | Subscrever e disparar evento → notificação no browser | `□` NICE (P2) |

---

## SEÇÃO 7 — DOCUMENTOS LEGAIS

| # | Item | Teste | Status |
|---|---|---|---|
| 76 | 9 documentos legais existem no banco | `SELECT COUNT(*) FROM legal_documents` → 9 | `□` GATE |
| 77 | Termos de Uso aprovados pelo CEO | Documento com `type = "terms_of_service"` tem `status = "active"` | `□` GATE |
| 78 | Política de Privacidade aprovada | Documento com `type = "privacy_policy"` tem `status = "active"` | `□` GATE |
| 79 | Aceite de documentos obrigatório no cadastro | Novo usuário não acessa app sem aceitar termos | `□` GATE |
| 80 | Aceitações registradas em `legal_acceptances` | Após aceite: `SELECT * FROM legal_acceptances WHERE user_id = <id>` | `□` GATE |

---

## SEÇÃO 8 — FUNCIONALIDADES ADMIN

### 8.1 Painel admin

| # | Item | Teste | Status |
|---|---|---|---|
| 81 | Dashboard admin carrega sem erros JS | `/admin` com conta admin → Console limpo | `□` GATE |
| 82 | Lista de usuários pagina corretamente | `GET /api/admin/users?page=1&limit=20` → 200 com dados | `□` GATE |
| 83 | Lista de extras pagina corretamente | `GET /api/admin/jobs?page=1&limit=20` → 200 com dados | `□` GATE |
| 84 | Analytics carregam | `GET /api/admin/analytics` → 200 com dados | `□` GATE |

### 8.2 Governance CEO

| # | Item | Teste | Status |
|---|---|---|---|
| 85 | Governance Center carrega para CEO | `/admin/governance` com token CEO → 200 em todos os 7 tabs | `□` GATE |
| 86 | Alteração de taxa via Governance reflete em `platformConfigTable` | PUT `/admin/governance/financial` → SELECT confirma nova taxa no banco | `□` GATE |
| 87 | Categorias CRUD funcionam | Criar, editar, arquivar categoria via Governance | `□` GATE |

---

## SEÇÃO 9 — CONFIGURAÇÃO DE AMBIENTE

### 9.1 Variáveis de ambiente verificadas

| # | Variável | Necessária para | Status |
|---|---|---|---|
| 88 | `DATABASE_URL` | Banco PostgreSQL | `□` GATE |
| 89 | `SESSION_SECRET` | Segurança das sessões | `□` GATE |
| 90 | `NODE_ENV=production` | Guards de produção | `□` GATE |
| 91 | `SETUP_SECRET` | Proteger endpoints de seed/setup | `□` GATE |
| 92 | `RESEND_API_KEY` | Emails | `□` GATE |
| 93 | `TWILIO_ACCOUNT_SID` | SMS | `□` GATE |
| 94 | `TWILIO_AUTH_TOKEN` | SMS | `□` GATE |
| 95 | `TWILIO_PHONE_NUMBER` | SMS | `□` GATE |
| 96 | `PORT` | Servidor HTTP | `□` GATE |
| 97 | `BASE_PATH` | Frontend routing | `□` GATE |
| 98 | `VAPID_PUBLIC_KEY` | Push web | `□` NICE |
| 99 | `VAPID_PRIVATE_KEY` | Push web | `□` NICE |
| 100 | `ASAAS_API_KEY` | Gateway pagamento (fase P2-P3) | `□` NICE |
| 101 | `DEV_WHITELIST_EMAILS` | Dev bypass (opcional) | `□` NICE |
| 102 | `DEV_WHITELIST_CPFS` | Dev bypass (opcional) | `□` NICE |

### 9.2 Guards de produção

| # | Item | Teste | Status |
|---|---|---|---|
| 103 | `dev-whitelist.ts` retorna false com `NODE_ENV=production` | `grep "isDevWhitelistActive" artifacts/api-server/src/lib/dev-whitelist.ts` → verifica NODE_ENV | `□` GATE |
| 104 | Logs de seed/setup não aparecem nos logs de produção | Checar logs após start em produção | `□` GATE |

---

## SEÇÃO 10 — PERFORMANCE E ESTABILIDADE

| # | Item | Teste | Status |
|---|---|---|---|
| 105 | Servidor inicia sem erros no log | `pnpm --filter @workspace/api-server run dev` → 0 linhas ERROR nos primeiros 30s | `□` GATE |
| 106 | Frontend carrega em < 5s em conexão 4G simulada | DevTools → Network → Slow 4G → DOMContentLoaded < 5s | `□` GATE |
| 107 | Endpoint de health responde < 200ms | `curl -w "%{time_total}" http://localhost:8080/api/health` → < 0.200 | `□` NICE |
| 108 | Bundle JS principal < 2MB | `ls -la artifacts/extrag0/dist/public/assets/*.js` → menor que 2097152 bytes | `□` NICE |
| 109 | Sem erros 500 em fluxos do checklist acima | Após executar todos os testes → `grep -c "500" /tmp/api-server.log` → 0 | `□` GATE |

---

## SEÇÃO 11 — TESTES MANUAIS DE REGRESSÃO

### 11.1 Fluxo completo freelancer

| # | Item | Status |
|---|---|---|
| 110 | Cadastro → verificação email → verificação telefone → upload docs → aprovação admin → acesso completo ao app | `□` GATE |
| 111 | Buscar extra → candidatar → aguardar aprovação → receber código → check-in → checkout → saldo atualizado | `□` GATE |
| 112 | Indicar um amigo → amigo se cadastra com código → comissão registrada | `□` GATE |
| 113 | Solicitar saque → admin aprova → registro em deposit_requests | `□` GATE |

### 11.2 Fluxo completo empresa

| # | Item | Status |
|---|---|---|
| 114 | Cadastro empresa → verificação → aprovação → criar extra → receber candidaturas | `□` GATE |
| 115 | Aprovar candidatura → gerar código → aguardar check-in → gerar código checkout → concluir | `□` GATE |
| 116 | Visualizar histórico de extras e pagamentos na carteira | `□` GATE |

### 11.3 Fluxo completo admin

| # | Item | Status |
|---|---|---|
| 117 | Login admin → acessar dashboard → revisar fila KYC → aprovar usuário | `□` GATE |
| 118 | Login CEO → acessar Governance → alterar taxa → confirmar no banco | `□` GATE |
| 119 | Admin tenta acessar Governance (non-CEO) → 403 | `□` GATE |

---

## SEÇÃO 12 — PÓS-LANÇAMENTO (1ª semana)

| # | Item | Status |
|---|---|---|
| 120 | Monitorar logs de erro diariamente nos primeiros 7 dias | `□` |
| 121 | Confirmar que nenhum PII real aparece em logs | `□` |
| 122 | Verificar que `dev-whitelist` não está ativo em produção | `□` |
| 123 | Completar wallet ledger automático (P1-5) | `□` |
| 124 | Completar declaração FK constraints (P1-13) | `□` |
| 125 | Configurar push VAPID (P2-1, P2-2) | `□` |
| 126 | Monitorar rate limiting — ajustar limites se legítimos usuários atingirem | `□` |
| 127 | Revisão de segurança dos logs — nenhuma senha ou token em logs | `□` |

---

## RESUMO EXECUTIVO — STATUS DO CHECKLIST

| Seção | Total itens | GATE | NICE | Concluídos | Pendentes |
|---|---|---|---|---|---|
| 1. Build e Tipagem | 9 | 9 | 0 | 0 | 9 |
| 2. Segurança | 16 | 14 | 2 | 0 | 16 |
| 3. Auth e Autorização | 9 | 8 | 1* | 0 | 9 |
| 4. Banco de Dados | 8 | 7 | 1 | 0 | 8 |
| 5. Fluxos Críticos | 24 | 24 | 0 | 0 | 24 |
| 6. Integrações | 12 | 7 | 5 | 0 | 12 |
| 7. Documentos Legais | 5 | 5 | 0 | 0 | 5 |
| 8. Admin | 7 | 7 | 0 | 0 | 7 |
| 9. Ambiente | 18 | 13 | 5 | 0 | 18 |
| 10. Performance | 5 | 2 | 3 | 0 | 5 |
| 11. Testes manuais | 10 | 10 | 0 | 0 | 10 |
| 12. Pós-lançamento | 8 | 0 | 8 | 0 | 8 |
| **TOTAL** | **131** | **106** | **25** | **0** | **131** |

> `*` Itens 33/34 dependem de P1-12 ser implementado.

**Para lançamento autorizado:** todos os 106 itens GATE devem ser `✅`.

---

## ASSINATURAS DE APROVAÇÃO

| Papel | Nome | Data | Assinatura |
|---|---|---|---|
| CEO | Leonardo Scheffel | — | — |
| CMO | Jean Dick | — | — |
| CCO | Qaialla Pereira | — | — |
| Responsável Técnico | — | — | — |

> Este checklist deve ser assinado pelo CEO antes do deploy em produção.

---

*Arquivos modificados: nenhum*
*Arquivos criados: LAUNCH_CHECKLIST.md*
*Banco alterado: não*
