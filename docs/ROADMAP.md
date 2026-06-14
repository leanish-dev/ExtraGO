# extraGO — PRODUCT ROADMAP

> Status: documento vivo — atualizar conforme itens forem concluídos.

---

## Itens em Progresso / Planejados

### 1. Visual & UX Professionalization
Refinar a identidade visual em toda a plataforma para estar alinhada com o posicionamento de infraestrutura nacional. Eliminar overlays excessivos, padronizar tipografia, substituir padrões de card repetitivo por storytelling visual.

**Status:** Em progresso

---

### 2. Test Data Isolation
Garantir que mock data, seed data e métricas artificiais sejam visíveis apenas para `TEST_ACCOUNTS`. Todos os demais usuários devem ver dados reais ou empty states. Ver `TEST_DATA_POLICY.md`.

**Status:** Política documentada, implementação de guards pendente

---

### 3. Company Financial Center
Centro financeiro completo para empresas: histórico de depósitos, saldo disponível, reservado e pendente, extrato de pagamentos por extra, dashboard financeiro corporativo.

**Status:** Planejado

---

### 4. Level & Reputation Progression
Motor de progressão automático: calcular nível do freelancer com base em extras concluídos + avaliações + tempo na plataforma. Notificar ao subir de nível. Exibir progresso até o próximo nível.

**Status:** Planejado

---

### 5. Brazil National Operations Center
Centro de operações com visão geográfica em tempo real: distribuição de extras por estado, freelancers ativos por região, heatmap de demanda, representantes por estado.

**Status:** Parcialmente implementado (mapa admin)

---

### 6. Smooth Page Transitions
Transições de página fluidas entre rotas — entrada/saída com fade ou slide. Manter identidade de movimento consistente com a landing page.

**Status:** Planejado

---

### 7. Distinct Hero Sections
Cada área da plataforma (freelancer, empresa, admin) deve ter um hero/header distinto que reforce o posicionamento daquela audiência. Evitar dashboard genérico como primeira tela.

**Status:** Planejado

---

### 8. Admin Mobile Responsiveness
Painel administrativo totalmente responsivo em mobile/tablet. Tabelas adaptadas, ações acessíveis em telas pequenas.

**Status:** Planejado

---

### 9. System Health Monitoring
Dashboard de ops com health check de todos os serviços críticos: banco de dados, API, SSE, jobs em fila. Alertas visuais de degradação.

**Status:** Parcialmente implementado (página Ops no admin)

---

### 10. Real-Time Referral Activity
Feed de atividade em tempo real das indicações: novo indicado se cadastrou, indicado concluiu primeiro extra, comissão recebida. Notificação push in-app.

**Status:** Planejado

---

### 11. Profile Menu & Notifications Fix
Garantir que o menu de perfil e o centro de notificações funcionem corretamente em todas as plataformas (mobile/desktop) e roles (freelancer/company/admin).

**Status:** Planejado

---

### 12. Ecosystem Integration
Integrações com plataformas complementares: escolas de qualificação, plataformas de background check, sistemas de ERP para empresas grandes.

**Status:** Futuro

---

## Princípios para Priorização

1. **Dados reais antes de novas features** — nenhum usuário deve ver mock data
2. **Mobile first** — maioria dos profissionais acessa via smartphone
3. **Confiança antes de funcionalidade** — reputação e pagamentos são críticos
4. **Expansão pela rede** — indicações e representantes antes de paid marketing
