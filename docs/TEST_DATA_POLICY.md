# extraGO — TEST DATA POLICY

## Objetivo

Garantir que dados simulados, métricas artificiais e cenários de demonstração sejam visíveis **apenas** para contas de teste autorizadas. Todos os demais usuários devem visualizar dados reais ou empty states elegantes.

---

## Contas de Teste Oficiais

| Papel | Email | Senha | Permissão |
|---|---|---|---|
| Freelancer de teste | `teste.f@extrago.com` | `ext123@` | Pode ver mock data |
| Empresa de teste | `teste.e@extrago.com` | `ext123@` | Pode ver mock data |

---

## Contas Master Oficiais

| Nome | Email | Badge | Permissão |
|---|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO | SUPER_ADMIN |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO | SUPER_ADMIN |

---

## Hierarquia de Contas

```
MASTER_ACCOUNTS (SUPER_ADMIN)
         ↓
   TEST_ACCOUNTS
         ↓
  USUÁRIOS COMUNS
```

---

## Regras por Tier

### Contas MASTER
- **NUNCA** visualizam mock data, seed data ou métricas fictícias
- **SEMPRE** veem dados reais ou empty states apropriados
- Prioridade máxima — qualquer verificação de mock data deve excluir masters primeiro

### Contas TESTE
- **PODEM** visualizar mock data e cenários de demonstração
- São as únicas contas autorizadas a ver dados simulados
- Usadas para demos, QA e desenvolvimento

### Usuários Comuns
- **NUNCA** visualizam dados inventados
- Veem dados reais ou empty states elegantes
- Nunca: receitas falsas, rankings falsos, analytics falsos, números inventados

---

## Implementação Técnica

### Helpers de verificação

**Frontend:** `artifacts/extrag0/src/config/test-accounts.ts`
```ts
export const TEST_ACCOUNTS = [
  "teste.f@extrago.com",
  "teste.e@extrago.com",
];

export const canUseMockData = (email?: string): boolean => {
  if (!email) return false;
  return TEST_ACCOUNTS.includes(email.toLowerCase());
};
```

**Frontend:** `artifacts/extrag0/src/config/master-accounts.ts`
```ts
export const MASTER_ACCOUNTS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
];

export const isMasterAccount = (email?: string): boolean => {
  if (!email) return false;
  return MASTER_ACCOUNTS.includes(email.toLowerCase());
};
```

### Lógica de uso

```ts
// Exemplo de guard em componente
const { user } = useAuth();

if (isMasterAccount(user?.email)) {
  // mostrar dados reais ou empty state — NUNCA mock
} else if (canUseMockData(user?.email)) {
  // pode mostrar mock data
} else {
  // dados reais ou empty state
}
```

---

## Mapeamento de Seed/Mock Data Atual

### API Server

| Arquivo | Rota | Descrição |
|---|---|---|
| `artifacts/api-server/src/routes/seed.ts` | `POST /api/setup/seed` | Seeder idempotente de 1004 linhas — cria usuários, wallets, transações, jobs, aplicações, avaliações e notificações de teste |

> **NOTA:** O endpoint `/api/setup/seed` deve ser restrito ou removido em produção. Nunca expor em ambiente público sem autenticação de admin.

### Frontend

| Tipo | Localização | Descrição |
|---|---|---|
| Números ilustrativos | `financial-architecture/referrals.tsx` | Exemplo numérico em prosa: "10.000 profissionais, 10 extras/mês, R$200" — é texto educativo, não dado exibido como real |
| Calculadora de indicações | `pages/landing.tsx` | Slider interativo de simulação — claramente identificado como estimativa |

> **CONCLUSÃO DA AUDITORIA:** Não foram encontradas variáveis `mockData`, `fakeData`, `demoData`, `sampleData`, `mockMetrics` ou `fakeMetrics` no frontend. Dados do admin são todos consumidos de APIs reais (`/api/admin/analytics`, `/api/admin/stats`). O único ponto de seed real é o endpoint `POST /api/setup/seed` no backend.

---

## Empty States

Todo componente que exibe dados deve ter um empty state elegante. Exemplos:
- Sem extras disponíveis → "Nenhum extra disponível no momento."
- Sem histórico financeiro → "Seu histórico de transações aparecerá aqui."
- Sem indicados → "Compartilhe seu código e comece a construir sua rede."

Nunca preencher com zeros, dashes ou placeholders que pareçam dados reais.
