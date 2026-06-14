# extraGO — TEST DATA POLICY

---

## Objetivo

Garantir que dados simulados, métricas artificiais e cenários de demonstração sejam visíveis **apenas** para contas de teste autorizadas. Todos os demais usuários devem visualizar dados reais ou empty states elegantes. Esta política protege a credibilidade da plataforma com usuários reais, investidores e parceiros.

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
- Qualquer bug visto por uma conta master é um bug de produção

### Contas TESTE
- **PODEM** visualizar mock data e cenários de demonstração
- São as únicas contas autorizadas a ver dados simulados
- Usadas para demos, QA e desenvolvimento
- Dados de teste são substituídos por dados reais quando disponíveis

### Usuários Comuns
- **NUNCA** visualizam dados inventados
- Veem dados reais ou empty states elegantes
- Nunca: receitas falsas, rankings falsos, analytics falsos, números inventados
- Empty states são motivadores — nunca apáticos ou técnicos

---

## Implementação Técnica

### Helpers de verificação (Frontend)

**`artifacts/extrag0/src/config/test-accounts.ts`**
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

**`artifacts/extrag0/src/config/master-accounts.ts`**
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

### Lógica de uso em componentes

```ts
const { user } = useAuth();

if (isMasterAccount(user?.email)) {
  // mostrar dados reais ou empty state — NUNCA mock
} else if (canUseMockData(user?.email)) {
  // pode mostrar mock data para demonstração
} else {
  // dados reais ou empty state
}
```

### Regra de precedência (sempre verificar nesta ordem)

```
1. isMasterAccount() → se true: dados reais / empty state obrigatório
2. canUseMockData()  → se true: mock data permitido
3. default           → dados reais / empty state
```

---

## Mapeamento de Seed / Mock Data Atual

### API Server

| Arquivo | Rota | Descrição |
|---|---|---|
| `artifacts/api-server/src/routes/seed.ts` | `POST /api/setup/seed` | Seeder idempotente — cria usuários, wallets, transações, jobs, aplicações, avaliações e notificações de teste |
| `artifacts/api-server/src/routes/setup.ts` | `POST /api/setup/admin` | Bootstrap idempotente de admin; senha `Gremory26@` |

> **NOTA CRÍTICA:** Os endpoints `/api/setup/seed` e `/api/setup/admin` devem ser restritos ou removidos em produção. Nunca expor em ambiente público sem proteção.

### Frontend

| Tipo | Localização | Descrição |
|---|---|---|
| Números ilustrativos | `financial-architecture/referrals.tsx` | Exemplo numérico em prosa: "10.000 profissionais, 10 extras/mês, R$200" — é texto educativo, não dado exibido como real |
| Calculadora de indicações | `pages/landing.tsx` | Slider interativo de simulação — claramente identificado como estimativa |

### Conclusão da auditoria (status atual)

Não foram encontradas variáveis `mockData`, `fakeData`, `demoData`, `sampleData`, `mockMetrics` ou `fakeMetrics` injetadas no frontend para usuários comuns. Dados do admin são consumidos de APIs reais (`/api/admin/analytics`, `/api/admin/stats`). O único ponto de seed real é o endpoint `POST /api/setup/seed` no backend.

---

## Empty States

Todo componente que exibe dados deve ter um empty state elegante e motivador:

| Contexto | Empty State recomendado |
|---|---|
| Sem extras disponíveis | "Nenhum extra disponível no momento. Novos extras são publicados diariamente." |
| Sem histórico financeiro | "Seu histórico de transações aparecerá aqui após seu primeiro extra." |
| Sem indicados | "Compartilhe seu código e comece a construir sua rede de indicações." |
| Sem candidaturas | "Você ainda não se candidatou a nenhum extra. Explore os extras disponíveis." |
| Sem avaliações | "Suas avaliações aparecerão aqui após a conclusão de extras." |
| Dashboard admin sem dados | Mostrar estrutura real com zeros — nunca inventar números |

**Regras de empty state:**
- Nunca preencher com zeros, dashes ou placeholders que pareçam dados reais
- Nunca mostrar gráficos com dados aleatórios para "parecer ativo"
- Sempre incluir um CTA que ajude o usuário a resolver o estado vazio
- Texto deve ser encorajador, não técnico

---

## Auditorias Obrigatórias

Antes de qualquer release ou deploy, verificar:

### Auditoria de Mock Data
- [ ] Nenhuma variável mock/fake/demo está sendo renderizada para usuários comuns
- [ ] Componentes de analytics usam apenas dados da API
- [ ] Gráficos do admin mostram dados reais (ou zero se não houver dados)
- [ ] Nenhum número fixo hard-coded aparece como métrica real

### Auditoria de Contas
- [ ] Contas master não visualizam mock data em nenhuma tela
- [ ] Contas de teste conseguem ver cenários de demonstração quando necessário
- [ ] A ordem de verificação (master → teste → default) está implementada corretamente

### Auditoria de Endpoints de Seed
- [ ] `/api/setup/seed` não está acessível publicamente em produção
- [ ] `/api/setup/admin` está protegido ou desativado em produção
- [ ] Dados de seed não aparecem misturados com dados reais

### Auditoria de Empty States
- [ ] Toda tela com lista ou dado tem empty state implementado
- [ ] Empty states têm CTA relevante
- [ ] Nenhum empty state usa placeholder de número (ex: "0 extras" como se fossem reais)

---

## Diretrizes Permanentes

- A política de isolamento de mock data é inviolável — é uma questão de confiança
- Contas master sempre veem o produto como um usuário real veria
- Simuladores (calculadora de indicações, slider de ganhos) são educativos — sempre rotulados como estimativa
- Dados de seed existem para desenvolvimento — não para demonstração em produção

---

## Regras Obrigatórias

1. Sempre verificar `isMasterAccount()` antes de `canUseMockData()`
2. Nunca renderizar dados fictícios para usuários que não são `TEST_ACCOUNTS`
3. Nunca usar números hard-coded como métricas em dashboards
4. Todo novo componente com dados deve ter empty state implementado
5. Endpoints de seed protegidos ou removidos antes de ir a produção

---

## Boas Práticas

- Escrever helpers de mock data centralizados — nunca inline em componentes
- Testar sempre com conta master antes de fazer deploy
- Documentar aqui qualquer novo source de mock data adicionado
- Preferir dados reais com tratamento de erro a fallback para mock

---

## Restrições

- Não adicionar contas master ou teste sem atualizar este documento
- Não criar cenários de demo sem isolá-los pelos helpers `canUseMockData()`
- Não usar `Math.random()` para gerar métricas em componentes de produção

---

## Checklist de Validação

- [ ] Contas master veem dados reais ou empty states em todas as telas?
- [ ] Contas de teste conseguem ver cenários de demo quando necessário?
- [ ] Usuários comuns nunca veem dados inventados?
- [ ] Todos os componentes com listas têm empty states elegantes?
- [ ] Endpoints de seed estão protegidos para produção?
- [ ] A ordem de verificação (master → teste → default) está correta em novos componentes?
