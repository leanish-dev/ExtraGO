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

## Contas de Governança / Master Oficiais

| Nome | Email | Role | Cargo | Imagem de Perfil |
|---|---|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO / SUPER_ADMIN | CEO | `Leonardo-profile.jpg` → `team-leonardo.jpg` |
| Jean Dick | `jeandick2000@gmail.com` | CMO / SUPER_ADMIN | CMO | `Jean-profile.jpg` → `team-jean.jpg` |
| Qaialla Pereira | `qaialla.exclusive@gmail.com` | CCO / SUPER_ADMIN | CCO | `Qaialla-profile.jpg` → `team-qaialla.jpg` |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO Master / SUPER_ADMIN | CEO Master | — |

> **Fonte de verdade da implementação:** `artifacts/extrag0/src/config/master-accounts.ts`
> As 4 contas acima estão registradas no array `MASTER_ACCOUNTS` do helper `isMasterAccount()`.
>
> **NOTA:** O seeder (`POST /api/setup/seed`) agora provisiona 6 contas: as 4 de governança + 2 de teste.

---

## Hierarquia de Contas

```
MASTER_ACCOUNTS / GOVERNANÇA (SUPER_ADMIN)
         ↓
   TEST_ACCOUNTS
         ↓
  USUÁRIOS COMUNS
```

---

## Regras por Tier

### Contas MASTER / GOVERNANÇA
- **NUNCA** visualizam mock data, seed data ou métricas fictícias
- **SEMPRE** veem dados reais ou empty states apropriados
- Prioridade máxima — qualquer verificação de mock data deve excluir masters primeiro
- Qualquer bug visto por uma conta master é um bug de produção
- Nunca recebem: dados de demo, seed data, estatísticas simuladas, rankings fabricados,
  oportunidades sintéticas ou métricas artificiais da plataforma

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
  "jeandick2000@gmail.com",
];

export const CEO_GOVERNANCE_EMAILS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];

export const isMasterAccount = (email?: string): boolean => {
  if (!email) return false;
  return MASTER_ACCOUNTS.includes(email.toLowerCase());
};

export const isCEO = (email?: string): boolean => {
  if (!email) return false;
  return CEO_GOVERNANCE_EMAILS.includes(email.toLowerCase());
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

## Profile Asset Policy (Governança de Imagens de Perfil)

As contas de governança possuem imagens de perfil oficiais permanentes que fazem parte da identidade institucional da plataforma.

### Atribuições Oficiais

| Email | Arquivo de Imagem | Caminho Público |
|---|---|---|
| `leonardoscheffel2000@gmail.com` | `Leonardo-profile.jpg` | `/team-leonardo.jpg` |
| `jeandick2000@gmail.com` | `Jean-profile.jpg` | `/team-jean.jpg` |
| `qaialla.exclusive@gmail.com` | `Qaialla-profile.jpg` | `/team-qaialla.jpg` |

### Regras Permanentes

1. **Preservação em migrações:** Sempre que seed, bootstrap, restauração de conta ou provisionamento de governança for executado, estas imagens devem ser atribuídas automaticamente se disponíveis.

2. **Identidade institucional:** Estas imagens são consideradas parte do padrão de identidade de governança da plataforma — não substituir por avatares genéricos.

3. **Responsabilidade dos agentes:** Agentes de IA devem preservar estas atribuições durante:
   - Migrações entre contas Replit
   - Remixes e rebuilds
   - Restauração de banco de dados
   - Workflows de provisionamento de contas
   - Execução do endpoint `/api/setup/seed`

4. **Nunca sobrescrever** as imagens de governança com imagens placeholder, avatares gerados ou imagens genéricas.

---

## Mapeamento de Seed / Endpoints de Setup (Estado Atual)

### API Server — Estado Atual da Implementação

#### `POST /api/setup/seed`

**Comportamento atual (pós-auditoria de dados de produção):**

Este endpoint foi **completamente reescrito** para provisionar SOMENTE as 6 contas aprovadas.

**O endpoint NUNCA:**
- Cria usuários de ecossistema, demo ou seed
- Cria jobs/extras de teste
- Cria transações simuladas
- Cria candidaturas fictícias
- Cria avaliações fabricadas
- Cria notificações sintéticas
- Cria qualquer dado de demonstração ou atividade simulada

**O endpoint APENAS provisiona (idempotente):**
1. `leonardoscheffel2000@gmail.com` — CEO / super_admin (corporateRole: ceo)
2. `jeandick2000@gmail.com` — CMO / super_admin (corporateRole: cmo)
3. `qaialla.exclusive@gmail.com` — CCO / super_admin (corporateRole: cco)
4. `extrago.ceo@yahoo.com` — CEO Master / super_admin
5. `teste.f@extrago.com` — freelancer de teste autorizado
6. `teste.e@extrago.com` — empresa de teste autorizada

Cada conta recebe wallet correspondente com saldo zero.

> **NOTA CRÍTICA:** A documentação anterior descrevia o seeder como criador de "usuários, wallets,
> transações, jobs, aplicações, avaliações e notificações de teste". Isso é **OBSOLETO**.
> O seeder atual NÃO cria nenhum desses dados de ecossistema. A implementação atual
> em `artifacts/api-server/src/routes/seed.ts` é a fonte de verdade.

#### `POST /api/setup/admin`

Bootstrap idempotente do admin principal (`leonardoscheffel2000@gmail.com`).

- Se a conta já existe: promove para admin / super_admin se necessário
- Se não existe: cria com role `admin`, adminRole `super_admin`, corporateRole `ceo`
- Senha: `Gremory26@` (hash pré-computado hardcoded)
- Endpoint separado do seed — foco em garantir a existência do admin principal

#### `GET /api/setup/status`

Verifica se o admin principal existe no banco de dados.
Retorna `{ adminExists: boolean, isAdmin: boolean }`.

### Segurança dos Endpoints de Setup

> **RECOMENDAÇÃO:** Os endpoints `/api/setup/seed` e `/api/setup/admin` devem ser
> protegidos ou removidos antes de ir a produção. Nunca expor em ambiente público sem proteção.
>
> **NOTA MULTI-REPLIT:** Dado que o ambiente atual pode não ser o ambiente de produção final,
> manter estes endpoints ativos é aceitável durante o desenvolvimento. Avaliar remoção
> somente após o proprietário declarar o ambiente de produção final.

### Frontend — Estado Atual

| Tipo | Localização | Descrição |
|---|---|---|
| Números ilustrativos | `financial-architecture/referrals.tsx` | Exemplo numérico em prosa: "10.000 profissionais, 10 extras/mês, R$200" — é texto educativo, não dado exibido como real |
| Calculadora de indicações | `pages/landing.tsx` | Slider interativo de simulação — claramente identificado como estimativa |

### Conclusão da auditoria (estado atual)

Não foram encontradas variáveis `mockData`, `fakeData`, `demoData`, `sampleData`, `mockMetrics` ou `fakeMetrics` injetadas no frontend para usuários comuns. Dados do admin são consumidos de APIs reais (`/api/admin/analytics`, `/api/admin/stats`). O endpoint `POST /api/setup/seed` provisiona apenas as 5 contas aprovadas — nenhum dado de ecossistema.

**Implementação atual:** Modalidade **B — Remoção completa de mock data** para usuários comuns e contas master. Mock data disponível somente via `canUseMockData()` para as 2 contas de teste.

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
- [ ] Contas master (3 contas) não visualizam mock data em nenhuma tela
- [ ] Contas de teste conseguem ver cenários de demonstração quando necessário
- [ ] A ordem de verificação (master → teste → default) está implementada corretamente
- [ ] `jeandick2000@gmail.com` está incluída na verificação de master

### Auditoria de Endpoints de Seed
- [ ] `/api/setup/seed` provisiona apenas as 5 contas aprovadas (sem dados de ecossistema)
- [ ] `/api/setup/admin` está protegido ou desativado em produção
- [ ] Dados de seed não aparecem misturados com dados reais

### Auditoria de Imagens de Governança
- [ ] `leonardoscheffel2000@gmail.com` tem `Leonardo.jpg` atribuída
- [ ] `jeandick2000@gmail.com` tem `Jean.jpg` atribuída
- [ ] Imagens de governança não foram substituídas por avatares genéricos

### Auditoria de Empty States
- [ ] Toda tela com lista ou dado tem empty state implementado
- [ ] Empty states têm CTA relevante
- [ ] Nenhum empty state usa placeholder de número (ex: "0 extras" como se fossem reais)

---

## Diretrizes Permanentes

- A política de isolamento de mock data é inviolável — é uma questão de confiança
- Contas master sempre veem o produto como um usuário real veria
- Simuladores (calculadora de indicações, slider de ganhos) são educativos — sempre rotulados como estimativa
- O endpoint `/api/setup/seed` NUNCA deve criar dados de ecossistema — apenas provisionar contas aprovadas
- As imagens de perfil de governança são parte da identidade institucional — preservar sempre

---

## Regras Obrigatórias

1. Sempre verificar `isMasterAccount()` antes de `canUseMockData()`
2. Nunca renderizar dados fictícios para usuários que não são `TEST_ACCOUNTS`
3. Nunca usar números hard-coded como métricas em dashboards
4. Todo novo componente com dados deve ter empty state implementado
5. Endpoints de seed protegidos ou removidos antes de ir a produção
6. `jeandick2000@gmail.com` deve sempre ser tratada como conta master — incluir em toda verificação
7. Imagens de perfil de governança (`Leonardo.jpg`, `Jean.jpg`) preservadas em toda migração ou rebuild

---

## Boas Práticas

- Escrever helpers de mock data centralizados — nunca inline em componentes
- Testar sempre com conta master antes de fazer deploy
- Documentar aqui qualquer novo source de mock data adicionado
- Preferir dados reais com tratamento de erro a fallback para mock
- Ao executar seed em novo ambiente, verificar se imagens de governança estão disponíveis

---

## Restrições

- Não adicionar contas master ou teste sem atualizar este documento
- Não criar cenários de demo sem isolá-los pelos helpers `canUseMockData()`
- Não usar `Math.random()` para gerar métricas em componentes de produção
- Não reescrever o endpoint `/api/setup/seed` para incluir dados de ecossistema

---

## Checklist de Validação

- [ ] Contas master (3) veem dados reais ou empty states em todas as telas?
- [ ] Contas de teste conseguem ver cenários de demo quando necessário?
- [ ] Usuários comuns nunca veem dados inventados?
- [ ] Todos os componentes com listas têm empty states elegantes?
- [ ] Endpoints de seed estão protegidos para produção?
- [ ] A ordem de verificação (master → teste → default) está correta em novos componentes?
- [ ] Imagens de perfil de governança estão atribuídas corretamente?
