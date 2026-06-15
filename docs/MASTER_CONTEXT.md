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
5. **Arquitetura Financeira Integrada** — wallet, PIX, histórico, reputação em uma plataforma

---

## Flywheel do Ecossistema

```
Mais Profissionais
       ↓
Mais Empresas Contratam
       ↓
Mais Extras Concluídos
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
3. **Finanças & Pagamentos** — wallet integrada, PIX, histórico financeiro
4. **Rede de Indicações** — crescimento orgânico com incentivo financeiro
5. **Representantes Regionais** — expansão descentralizada com accountability local
6. **Governança & Compliance** — painel administrativo, auditoria, moderação

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

---

## Boas Práticas

- Ao criar novas features, verificar se reforçam um dos 6 pilares do ecossistema
- Ao redigir copy, usar a frase oficial como âncora de posicionamento
- Ao apresentar para investidores, usar os dados do flywheel como estrutura
- Ao descrever o produto, começar sempre pelo problema de mercado (informalidade)
- Ao recomendar infraestrutura, considerar portabilidade para migração futura

---

## Restrições

- Não alterar o posicionamento sem aprovação dos fundadores
- Não criar novos slogans sem alinhamento com a identidade oficial
- Não descrever a extraGO como "app de freelas" — escopo é infraestrutura nacional
- Não recomendar arquitetura permanente de deployment sem declaração explícita do proprietário

---

## Checklist de Validação

- [ ] O posicionamento de infraestrutura está presente na tela/feature?
- [ ] A terminologia oficial (Extra, Profissional, Empresa) está correta?
- [ ] A narrativa é consistente com a Visão 2030?
- [ ] Os 6 pilares do ecossistema são respeitados?
- [ ] A frase oficial pode ser usada como tagline da feature?
- [ ] Não há referência a "vaga", "job board" ou "hospitalidade" no conteúdo?
- [ ] Recomendações de infraestrutura consideram a política Multi-Replit?
