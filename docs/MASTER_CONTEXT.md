# extraGO — MASTER CONTEXT

> **Frase Oficial:** "extraGO — A Infraestrutura de Mão de Obra do Brasil."

---

## Objetivo

Este documento é a fonte permanente de identidade estratégica da extraGO.
Qualquer agente, engenheiro ou parceiro que trabalhe no projeto deve ler este arquivo primeiro.
Ele define quem somos, o que fazemos, por que existimos e para onde vamos.

---

## Multi-Replit Development Policy

### Contexto Operacional

O projeto extraGO é desenvolvido ativamente em múltiplas contas Replit.
O proprietário realiza remixes e migrações frequentes entre contas como parte do fluxo normal de desenvolvimento.

### Premissa Fundamental

**A conta Replit atual NÃO é assumida como o ambiente de produção final** a menos que o proprietário declare explicitamente o contrário.

### O que agentes NÃO devem assumir sem declaração explícita do proprietário:

- Que a conta Replit atual é o host final de produção
- Que o banco de dados atual é o banco de produção permanente
- Que a infraestrutura atual é estável de longo prazo
- Que configurações de domínio, SSL ou DNS são permanentes
- Que dados no banco atual serão preservados indefinidamente

### O que agentes DEVEM considerar em qualquer recomendação:

- Possibilidade de migração futura para outra conta Replit
- Portabilidade das configurações de ambiente
- Estratégias de backup que suportem migração
- Compatibilidade de `DATABASE_URL` em novos ambientes
- Configurações de variáveis de ambiente que precisarão ser replicadas

### Ambiente de Produção Final

O proprietário declarará explicitamente quando o ambiente final de hospedagem for atingido.

**Somente após esta declaração, agentes devem:**
- Recomendar arquitetura de deployment permanente
- Recomendar decisões irreversíveis de infraestrutura
- Remover salvaguardas de migração
- Executar hardening de produção
- Travar premissas de infraestrutura de longo prazo
- Assumir estabilidade permanente de hospedagem

**Até então:** assumir que migração permanece possível.

### Checklist antes de qualquer recomendação de deploy / hosting / infraestrutura

- [ ] O proprietário declarou explicitamente que esta é a conta Replit final?

**Se a resposta for desconhecida → assuma NÃO.**

---

## Visão

Ser a infraestrutura operacional que conecta toda a força de trabalho avulsa e eventual do Brasil — empresas, profissionais, representantes, parceiros e investidores — em um único ecossistema nacional integrado.

---

## Missão

Democratizar o acesso ao trabalho qualificado e à contratação eficiente, criando uma rede de reputação, progressão e pagamentos que beneficia todos os participantes do ecossistema.

---

## Posicionamento Oficial

A extraGO **NÃO é**:
- Portal de vagas
- Job board
- Dashboard administrativo
- Marketplace simples de hospitalidade

A extraGO **É**:
- **A Infraestrutura de Mão de Obra do Brasil**
- Workforce Operating System
- Rede Nacional de Reputação e Progressão
- Ecossistema Financeiro para Trabalhadores e Empresas
- Centro Nacional de Operações de Mão de Obra

---

## Narrativa Institucional

A extraGO nasce do diagnóstico de que o mercado de trabalho eventual no Brasil é fragmentado, informal e ineficiente. Milhões de profissionais buscam oportunidades sem reputação portável. Milhares de empresas contratam sem histórico, sem segurança e sem escala.

A extraGO resolve os dois lados: cria uma identidade profissional permanente para freelancers (com níveis, reputação e histórico financeiro) e oferece às empresas um pool qualificado, verificado e rastreável.

O modelo vai além do matching: cada transação gera dados de reputação, cada pagamento fortalece o ecossistema financeiro, cada indicação expande a rede organicamente. O resultado é um flywheel de crescimento auto-sustentável — quanto mais participantes, mais valioso para todos.

A extraGO não compete com portais de vagas. Compete com a informalidade.

---

## Inspirações Estratégicas

| Empresa | O que a extraGO absorve |
|---|---|
| **Uber Operations** | Matching em tempo real, geolocalização, reputação |
| **LinkedIn Workforce Network** | Identidade profissional, rede, progressão de carreira |
| **Stripe Financial Infrastructure** | Confiança financeira, APIs, pagamentos como infraestrutura |
| **Revolut** | Experiência financeira fluida, wallet integrada |
| **Airbnb** | Confiança bilateral, reviews, comunidade |

---

## Tese de Investimento

A extraGO captura valor em **todos os lados** do mercado de trabalho eventual:

1. **Freelancers** pagam taxa de intermediação decrescente por nível (20% → 10%)
2. **Empresas** pagam assinaturas + taxa de posting por volume
3. **Representantes** recebem % da receita regional que constroem
4. **Indicadores** recebem comissão recorrente sobre a rede que formam
5. **Investidores** participam de um ecossistema com múltiplos flywheels

O modelo cria **interdependência**: a combinação de marketplace + reputação + pagamentos + indicações + governança torna a substituição extremamente custosa para todos os participantes.

### Por que agora?

- Crescimento do trabalho gig no Brasil (+40% pós-pandemia)
- PIX como infraestrutura de pagamento instantâneo disponível
- Demanda por qualificação e reputação portável em ascensão
- Inexistência de um player dominante no segmento de força de trabalho eventual

### Barreiras de entrada após escala

- Rede de reputação acumulada (anos de histórico)
- 27 representantes estaduais com território e incentivo financeiro
- Efeito de rede bilateral (mais profissionais → mais empresas → ciclo)
- Dados proprietários de matching e performance por setor/região

---

## Visão 2030

| Marco | Objetivo |
|---|---|
| **Fase 1 — Fundação** | Primeiros 100.000 usuários ativos, 4 estados (SP, RJ, MG, ES) |
| **Fase 2 — Expansão Nacional** | 27 representantes estaduais, cobertura nacional completa |
| **Fase 3 — Infraestrutura** | Produtos financeiros próprios, maior rede de trabalho eventual do Brasil |

---

## Diferenciais Competitivos

1. **Sistema de Níveis e Progressão** — freelancers evoluem e reduzem taxas ao longo do tempo
2. **Programa de Indicações** — rede que cresce e gera renda passiva recorrente
3. **Representantes Estaduais** — presença física descentralizada com incentivo de receita
4. **Centro Nacional de Operações** — visibilidade geográfica em tempo real do ecossistema
5. **Arquitetura Financeira Integrada** — wallet, PIX, Split Engine, ledger, escrow e histórico em uma plataforma

---

## Flywheel do Ecossistema

```
Mais Profissionais
       ↓
Mais Empresas Contratam
       ↓
Mais Extras Concluídos
       ↓
Split Engine distribui receita automaticamente
       ↓
Mais Receita → Mais Representantes → Mais Cobertura
       ↓
Mais Indicações → Rede cresce organicamente
       ↑_____________________________________________|
```

---

## Pilares do Ecossistema

1. **Matching & Operações** — conexão eficiente entre demanda e oferta
2. **Reputação & Progressão** — sistema de níveis que incentiva qualidade
3. **Finanças & Pagamentos** — wallet integrada, Split Engine, ledger, escrow, PIX, Asaas (futuro)
4. **Rede de Indicações** — crescimento orgânico com incentivo financeiro
5. **Representantes Regionais** — expansão descentralizada com accountability local
6. **Governança & Compliance** — CEO Governance Center, auditoria, moderação, configuração financeira

---

## Audiência-Alvo

| Perfil | Necessidade | O que a extraGO entrega |
|---|---|---|
| **Freelancer** | Trabalho recorrente, progressão, renda estável | Extras, níveis, wallet, reputação |
| **Empresa** | Contratação ágil, confiável, com histórico | Pool qualificado, avaliações, gestão |
| **Representante** | Negócio próprio com suporte nacional | Território, comissão, ferramentas |
| **Investidor** | Retorno, tese clara, equipe, escalabilidade | Flywheel comprovável, modelo robusto |
| **Indicador** | Renda passiva sobre a rede construída | Comissão recorrente, leaderboard |

---

## Estrutura Administrativa Oficial

| Nome | Email | Cargo | Badge |
|---|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO | CEO |
| Jean Dick | `jeandick2000@gmail.com` | CMO | CMO |
| Qaialla Pereira | `qaialla.exclusive@gmail.com` | CCO | CCO |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO Master | CEO |

### Hierarquia de Autoridade

```
CEO (Leonardo) — Controle máximo: institucional, financeiro, operacional, de cargos e permissões
    → Pode promover/remover admins, criar/remover cargos, alterar permissões de SuperAdmins
    → Classificação institucional: CEO (não "SuperAdmin")
CMO (Jean Dick) — Marketing, crescimento, branding, expansão de marca
CCO (Qaialla Pereira) — Comercial, expansão, representantes, parcerias, institucional
CEO Master (extrago.ceo@yahoo.com) — Conta master reserva com acesso CEO
```

### Permissões por Cargo

**CEO (Leonardo):**
- Controle máximo da plataforma
- Controle institucional, financeiro, operacional
- Controle de cargos e permissões
- Pode promover/remover administradores
- Pode criar/remover cargos
- Pode alterar permissões de SuperAdmins

**CCO (Qaialla Pereira):**
- Gestão comercial
- Gestão de expansão
- Gestão de representantes
- Gestão de parcerias
- Visualização de analytics
- Gestão institucional
- Acesso administrativo avançado

## Controladores de Governança Financeira

As seguintes contas têm controle exclusivo sobre todos os parâmetros financeiros da plataforma:

| Nome | Email | Role |
|---|---|---|
| Leonardo Scheffel | `leonardoscheffel2000@gmail.com` | CEO / SUPER_ADMIN |
| Jean Dick | `jeandick2000@gmail.com` | CMO / SUPER_ADMIN |
| extraGO CEO | `extrago.ceo@yahoo.com` | CEO Master / SUPER_ADMIN |

Estes 3 controladores têm acesso exclusivo ao CEO Governance Center e podem configurar:
- Split Rules (taxas por nível, comissões de indicação)
- Financial Governance (representante, investidor, fundo de reserva)
- Platform Wallet (visualização de métricas e ledger)
- Escrow Configuration (ativação e parâmetros de custódia)
- Category Governance (CRUD de categorias de extras)
- Asaas Integration Status (visualização — ativação requer variável de ambiente)
- Future Financial Parameters (qualquer novo parâmetro financeiro)

---

## Diretrizes Permanentes

- A identidade extraGO é sempre **infraestrutura**, nunca portal ou job board
- Toda comunicação deve reforçar escala nacional, confiança e progressão
- O posicionamento é premium e institucional — austero, não minimalista
- A terminologia oficial é **Extra** (não "vaga", não "job")
- Trabalhadores são **Profissionais** ou **Freelancers** (não "candidatos")
- Contratantes são **Empresas** (não "clientes" ou "empregadores")

---

## Regras Obrigatórias

1. Nunca usar "marketplace de hospitalidade" em nenhum contexto público
2. Nunca usar o slogan "#1 de hospitalidade" ou variantes
3. Nunca posicionar como produto de hospitalidade — o alcance é multi-setorial
4. Nunca apresentar a plataforma como apenas um job board
5. Toda tela, copy e comunicação deve ser consistente com a narrativa de infraestrutura
6. Nunca assumir que a conta Replit atual é o ambiente de produção final
7. Nunca hardcodar taxas, comissões ou percentuais financeiros — sempre usar o Split Engine
8. Nunca ativar Asaas em produção sem aprovação explícita dos controladores de governança

---

## Boas Práticas

- Ao criar novas features, verificar se reforçam um dos 6 pilares do ecossistema
- Ao redigir copy, usar a frase oficial como âncora de posicionamento
- Ao apresentar para investidores, usar os dados do flywheel como estrutura
- Ao descrever o produto, começar sempre pelo problema de mercado (informalidade)
- Ao recomendar infraestrutura, considerar portabilidade para migração futura
- Ao tocar em qualquer lógica financeira, passar pelo Split Engine

---

## Restrições

- Não alterar o posicionamento sem aprovação dos fundadores
- Não criar novos slogans sem alinhamento com a identidade oficial
- Não descrever a extraGO como "app de freelas" — escopo é infraestrutura nacional
- Não recomendar arquitetura permanente de deployment sem declaração explícita do proprietário
- Não implementar cálculo financeiro fora do Split Engine

---

## Checklist de Validação

- [ ] O posicionamento de infraestrutura está presente na tela/feature?
- [ ] A terminologia oficial (Extra, Profissional, Empresa) está correta?
- [ ] A narrativa é consistente com a Visão 2030?
- [ ] Os 6 pilares do ecossistema são respeitados?
- [ ] A frase oficial pode ser usada como tagline da feature?
- [ ] Não há referência a "vaga", "job board" ou "hospitalidade" no conteúdo?
- [ ] Recomendações de infraestrutura consideram a política Multi-Replit?
- [ ] Lógica financeira usa Split Engine (não hardcode)?
