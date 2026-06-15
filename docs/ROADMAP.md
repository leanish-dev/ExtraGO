# extraGO — PRODUCT ROADMAP

> **Status:** Documento vivo — atualizar conforme itens forem concluídos ou priorizados.
> **Última revisão:** Junho 2026

---

## Objetivo

Registrar as prioridades estratégicas do produto, marcos de expansão e visão de longo prazo. Este documento orienta decisões de priorização e garante alinhamento entre produto, tecnologia e negócio.

---

## ⚠️ Nota sobre Ambiente de Desenvolvimento

O projeto extraGO é desenvolvido em múltiplas contas Replit. O proprietário realiza remixes e migrações frequentes como parte do fluxo normal de desenvolvimento.

**Itens de roadmap relacionados a deployment, hosting e infraestrutura de produção** devem ser planejados considerando migração futura. O proprietário declarará explicitamente quando o ambiente final de produção for atingido — somente então devem ser executadas ações irreversíveis de infraestrutura.

Ver `docs/MASTER_CONTEXT.md` seção "Multi-Replit Development Policy" para regras completas.

---

## Princípios para Priorização

1. **Dados reais antes de novas features** — nenhum usuário deve ver mock data
2. **Mobile first** — maioria dos profissionais acessa via smartphone
3. **Confiança antes de funcionalidade** — reputação e pagamentos são críticos
4. **Expansão pela rede** — indicações e representantes antes de paid marketing
5. **Infraestrutura antes de features periféricas** — core sólido sustenta o flywheel

---

## Status dos Itens

| Status | Significado |
|---|---|
| ✅ Concluído | Feature implementada e validada |
| 🔄 Em progresso | Trabalho ativo em andamento |
| 📋 Planejado | Priorizado para próxima sprint |
| 🔮 Futuro | Roadmap de médio/longo prazo |
| ⏸ Pausado | Deprioritizado temporariamente |

---

## Fase 1 — Fundação (atual)

### ✅ 1. Plataforma Core
MVP completo com as funcionalidades essenciais de todos os perfis:
- Autenticação (login, cadastro, sessão)
- Área do Freelancer (dashboard, extras, candidaturas, wallet, indicações)
- Área da Empresa (dashboard, publicação de extras, gestão de candidatos, wallet)
- Admin (dashboard, usuários, extras, saques, analytics, ops, mapa, representantes, governance)
- Landing institucional com posicionamento de infraestrutura
- Página de investidores completa
- Sistema de badges de nível (sprite-based)
- Notificações SSE em tempo real
- Wallet com fluxo de depósito (empresa) e saque PIX (freelancer)

---

### ✅ 2. Identidade Visual
Refinamento da identidade visual alinhada com posicionamento de infraestrutura nacional:
- Landing page aprovada como fonte visual canônica
- UnifiedNavbar (única navbar em toda a plataforma)
- AppBackground (fundo fixo área autenticada)
- Terminologia oficial (Extra, Profissional, Empresa)
- Eliminação de overlays excessivos

---

### ✅ 3. Test Data Isolation
Política documentada e helpers implementados:
- `canUseMockData()` — isolamento de dados de demonstração
- `isMasterAccount()` — proteção de 3 contas de governança
- Contas de teste oficiais registradas (2 contas)
- Contas master oficiais registradas (3 contas: Leonardo, Jean Dick, extrago.ceo)
- Seeder reescrito para provisionar apenas 5 contas aprovadas — sem dados de ecossistema

---

### ✅ 4. Limpeza de Dados de Produção
O banco de dados foi completamente limpo. Apenas 5 contas aprovadas permanecem:
- `leonardoscheffel2000@gmail.com` (CEO)
- `jeandick2000@gmail.com` (CMO)
- `extrago.ceo@yahoo.com` (CEO Master)
- `teste.f@extrago.com` (freelancer de teste)
- `teste.e@extrago.com` (empresa de teste)

---

### ✅ 5. CEO Governance Center
Painel de controle executivo em `/admin/governance`:
- Configurações da plataforma com sliders por seção
- Confirmação antes de salvar alterações
- Overrides por usuário (fee customizada, taxa de indicação, notas)
- Badge management com badges predefinidos e categorias
- Backend em `routes/governance.ts`

---

### 🔄 6. Motor de Progressão de Nível
Calcular nível do freelancer automaticamente com base em extras concluídos + avaliações + tempo na plataforma:
- Notificação ao subir de nível
- Exibir progresso até o próximo nível com barra visual
- Histórico de progressão

**Critérios de progressão definidos em `BUSINESS_MODEL.md`**

---

### 📋 7. Centro Financeiro para Empresas
Dashboard financeiro corporativo completo:
- Histórico completo de depósitos
- Saldo disponível, reservado e pendente em destaque
- Extrato de pagamentos por extra concluído
- Relatório exportável (CSV/PDF)

---

### 📋 8. Transições de Página Fluidas
Transições de rota com fade ou slide:
- Entrada/saída consistente com a linguagem visual da landing
- Performance otimizada (não bloquear interação)
- Respeitar preferências de `prefers-reduced-motion`

---

### 📋 9. Hero Sections Distintas por Perfil
Cada área da plataforma tem um hero/header que reforça o posicionamento daquela audiência:
- Freelancer: foco em progressão, renda, reputação
- Empresa: foco em eficiência, confiança, pool qualificado
- Admin: foco em escala nacional, operações, controle

---

### 📋 10. Admin Mobile Responsiveness
Painel administrativo totalmente responsivo:
- Tabelas adaptadas para cards/lista em mobile
- Ações acessíveis em telas pequenas
- Drawer de navegação em mobile

---

### 📋 11. Perfil Menu & Notificações
Garantir funcionamento correto em todas as plataformas e roles:
- Menu de perfil (avatar dropdown) funcional em mobile e desktop
- Centro de notificações com marcação de leitura em tempo real
- Badge de contador de não lidos

---

### 📋 12. Feed de Atividade de Indicações (Real-Time)
Atividade em tempo real da rede de indicações:
- Novo indicado se cadastrou
- Indicado concluiu primeiro extra
- Comissão recebida (valor + quem gerou)
- Notificação push in-app

---

## Fase 2 — Expansão Nacional

### 🔮 13. Onboarding por Representante Estadual
Fluxo de captação regional:
- Landing page personalizada por estado
- Onboarding guiado com representante como padrinho
- Métricas de performance do representante em tempo real

---

### 🔮 14. Motor de Matching Inteligente
Matching automático empresa ↔ profissional:
- Baseado em histórico, avaliações, localização, disponibilidade
- Score de compatibilidade visível para ambos os lados
- Sugestões proativas ("Extras para você esta semana")

---

### 🔮 15. Verificação de Identidade
Background check integrado:
- CPF, antecedentes criminais, validação de documentos
- Badge "Verificado" com data e método
- Integração com parceiros de background check

---

### 🔮 16. Avaliações Bilaterais Completas
Sistema de reputação bilateral:
- Freelancer avalia empresa e vice-versa
- Score público de reputação
- Histórico de avaliações no perfil

---

### 🔮 17. Centro Nacional de Operações — Fase 2
Expansão do mapa e ops:
- Distribuição de extras em tempo real por geolocalização
- Heatmap de demanda por setor (gastronomia, hotelaria, eventos)
- Alertas de concentração de demanda

---

## Fase 3 — Infraestrutura Financeira

### 🔮 18. Produtos Financeiros Próprios
Expansão do ecossistema financeiro:
- Antecipação de recebíveis para freelancers (desconto sobre próximos extras)
- Crédito para empresas (contratação parcelada)
- Cartão extraGO (futura possibilidade)

---

### 🔮 19. Assinaturas Profissionais e Empresariais
Planos pagos com benefícios diferenciados:
- Freelancer PRO: maior visibilidade no feed, analytics avançados, badge verificado
- Empresa Premium: pool premium, reporting, posting ilimitado

---

### 🔮 20. Integrações Ecossistema
Integrações com plataformas complementares:
- Escolas de qualificação (certificados verificados)
- Sistemas de ERP para empresas grandes
- Plataformas de background check
- Parceiros de benefícios para freelancers

---

## Visão de Expansão

```
2026 (Fase 1 — Fundação)
├── SP, RJ, MG, ES operacionais
├── 100.000 usuários cadastrados
├── Motor de progressão ativo
└── Wallet e PIX consolidados

2027 (Fase 2 — Expansão Nacional)
├── 27 representantes estaduais ativos
├── Cobertura nacional completa
├── Motor de matching inteligente
└── Verificação de identidade

2028-2030 (Fase 3 — Infraestrutura)
├── Produtos financeiros próprios
├── Maior rede de trabalho eventual do Brasil
├── Parceria com ERPs e sistemas corporativos
└── Dados proprietários de matching como ativo
```

---

## Marcos Estratégicos

| Marco | Métrica | Fase |
|---|---|---|
| Primeiros 1.000 extras concluídos | Volume transacional real | Fase 1 |
| 10 representantes estaduais ativos | Cobertura regional inicial | Fase 1-2 |
| 100.000 usuários cadastrados | Escala de rede | Fase 2 |
| 27 representantes (cobertura nacional) | Infraestrutura nacional | Fase 2 |
| R$ 1M em volume transacional mensal | Validação do modelo | Fase 2 |
| Produtos financeiros próprios | Diferenciação como infraestrutura | Fase 3 |

---

## Diretrizes Permanentes

- Prioridade sempre ao que sustenta o flywheel (matching + reputação + pagamentos)
- Expansão pela rede — indicações e representantes têm custo de aquisição ≈ 0
- Nunca sacrificar confiança por velocidade de entrega
- Mobile first em toda nova feature

---

## Regras Obrigatórias

1. Atualizar o status dos itens neste documento quando concluídos
2. Qualquer nova feature planejada deve ser adicionada aqui antes de implementar
3. Features de Fase 3 não entram em desenvolvimento enquanto Fase 1 tiver itens pendentes
4. Todo item concluído deve ter o checklist de validação dos docs relevantes marcado
5. Items de infraestrutura de produção devem aguardar declaração do ambiente final pelo proprietário

---

## Boas Práticas

- Vincular novos itens do roadmap ao(s) pilar(es) do ecossistema que reforçam
- Itens de UX/mobile devem ser priorizados junto com a feature correspondente
- Não criar features para "parecer completo" — cada feature serve ao flywheel

---

## Restrições

- Não iniciar Fase 2 sem validar motor de progressão e wallet consolidados
- Não lançar produtos financeiros sem estrutura legal adequada
- Não implementar matching automático sem dados reais suficientes para treinar

---

## Checklist de Validação

- [ ] O item implementado foi marcado como ✅ Concluído neste doc?
- [ ] A feature reforça pelo menos um dos 6 pilares do ecossistema?
- [ ] O impacto no flywheel de receita está claro?
- [ ] Mobile foi considerado no escopo da feature?
- [ ] O item está alinhado com a fase correta (não queimando etapas)?
