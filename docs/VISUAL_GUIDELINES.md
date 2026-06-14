# extraGO — VISUAL GUIDELINES

---

## Objetivo

Garantir consistência visual absoluta em toda a plataforma extraGO. A identidade visual é um ativo estratégico — desvios enfraquecem o posicionamento de infraestrutura nacional. Este documento é a lei visual do projeto.

---

## Fonte da Verdade Visual

A **Landing Page aprovada** (`/`) é a fonte oficial da identidade visual da extraGO.
Toda nova tela deve ser derivada da linguagem visual estabelecida na landing.
Arquivo: `artifacts/extrag0/src/pages/landing.tsx`

---

## Paleta Oficial

| Nome | Uso | Referência CSS |
|---|---|---|
| **Verde extraGO** | Primary action, CTA, destaque | `hsl(var(--primary))` |
| **Cyan extraGO** | Secondary accent, hover, links | `hsl(var(--secondary))` |
| **Azul institucional profundo** | Background base, fundos de seção | `#050b10` / `#05101a` |
| **Branco** | Texto principal, títulos | `#FFFFFF` / `rgba(255,255,255,0.88+)` |
| **Cinzas suaves** | Texto secundário, bordas | `rgba(255,255,255,0.55–0.72)` |

---

## A plataforma deve parecer

| Referência | Atributo visual |
|---|---|
| **Uber Operations** | Sobriedade, escala, mapa nacional |
| **LinkedIn Workforce Network** | Confiança institucional, profissionalismo |
| **Stripe Financial Infrastructure** | Precisão, tipografia, densidade de informação |

---

## O que EVITAR

| Padrão proibido | Por quê |
|---|---|
| Cyberpunk excessivo | Reduz seriedade institucional |
| Discord/Slack UI | Plataforma de trabalho, não chat |
| Dashboard SaaS genérico | Posiciona como ferramenta, não infraestrutura |
| Glassmorphism exagerado | Distrai da informação e parece amador |
| Cards repetitivos empilhados | Fragmenta narrativa, parece portal de vagas |
| Overlays escuros demais (>0.55) | Oculta imagens institucionais de qualidade |

---

## Princípio Visual Principal

**Eliminar:**
```
[card] [card] [card] [card]
```

**Substituir por:**
- Storytelling visual contínuo
- Seções com profundidade e imagem
- Ecossistemas visuais (mapas, redes, fluxos)
- Expansão nacional como narrativa
- Hierarquia editorial clara (manchete → subtítulo → detalhe)

---

## Regras de Overlay e Sombra

Overlays em imagens de fundo devem ser leves o suficiente para mostrar a fotografia:

| Contexto | Opacity máxima recomendada |
|---|---|
| Background hero com texto branco | 0.28–0.42 |
| Seção de conteúdo sobre imagem | 0.16–0.30 |
| Cards sobre imagem | 0.40–0.55 |
| Overlay de cor de acento | ≤ 0.08 |

Sombras de texto (`textShadow`): máximo `rgba(0,0,0,0.42)`
Drop-shadow em títulos: máximo `rgba(0,0,0,0.38)`

> **Regra WCAG AA:** Para texto branco sobre overlay, o overlay mínimo é ~32%. Valores entre 32–55% são seguros. Acima de 55%, oculta a imagem. Abaixo de 32%, texto ilegível.

---

## Tipografia

- **Títulos principais:** `font-black`, clamp responsivo entre ~22px e ~48px
- **Subtítulos:** `font-bold` ou `font-semibold`
- **Corpo:** `text-sm` / `text-[14px]`, `leading-relaxed`
- **Badges/pills:** `text-xs font-bold uppercase tracking-wide`
- **Números de destaque:** `font-black text-2xl+` com cor `text-primary` ou `text-secondary`

---

## Navbar Institucional (UnifiedNavbar)

A `UnifiedNavbar` é a **ÚNICA navbar** de toda a aplicação. Não existe sidebar separada, bottom nav separada ou segunda navbar.

### Comportamento por modo

| Modo | Gatilho | Conteúdo |
|---|---|---|
| **Público** | `isInstitutionalPage === true` OU usuário não autenticado | Links institucionais: Home, Investidores, Modelo de Negócio, Login, Cadastro |
| **Autenticado** | Usuário logado + não em página institucional | Avatar, notificações, menu do papel (freelancer/empresa/admin) |

### Regras de implementação
- `effectiveUser = isInstitutionalPage ? null : user` — páginas institucionais sempre mostram navbar pública mesmo com sessão ativa
- `INSTITUTIONAL_PATHS` definido inline no componente
- Home button sempre vai para `/`
- Não recriar, não duplicar, não adicionar segunda navbar

---

## Backgrounds Aprovados

| Contexto | Asset | Regra |
|---|---|---|
| Área autenticada (todas as telas) | `/app-background.png` (position: fixed, z-index: 0) | Componente `AppBackground` — obrigatório |
| Navbar autenticada | `/navbarBg` (imagem, não logoMain) | Não substituir |
| Landing hero | Imagem institucional de alta qualidade com overlay 32–42% | Não escurecer demais |
| Investidores banner | `/public/investors-banner.png` | Não substituir |

### Regra crítica de background
O `div` wrapper do `App.tsx` **NÃO deve ter** `bg-background` — essa classe bloqueia o `AppBackground`. O `bg-background` em `index.css` é apenas fallback de body.

---

## Sistema de Badges (Sprites)

Arquivo: `artifacts/extrag0/src/components/level-badge.tsx`

| Componente | Sprite | Uso |
|---|---|---|
| `LevelBadge` / `LevelBadgeIcon` | `/badges/freelancer-badges.png` | Nível do freelancer |
| `ReferralBadge` / `ReferralBadgeIcon` | `/badges/indicacoes-badges.png` | Tier de indicação |
| `CorporateBadge` / `CorporateBadgeIcon` | `/badges/corporate-badges.png` | Plano corporativo |

Técnica: CSS `background-position` sprite. Não substituir por ícones inline.

---

## Componentes Aprovados

| Componente | Localização | Uso |
|---|---|---|
| `Pill` | UI primitivo | Badge de seção com ícone + cor de acento |
| `Reveal` / `ScrollSection` | Animação | Entrada ao scroll |
| `LevelBadge` | `components/level-badge.tsx` | Badges de nível sprite |
| `UnifiedNavbar` | `components/unified-navbar.tsx` | ÚNICA navbar |
| `AppBackground` | `components/app-background.tsx` | Fundo fixo área autenticada |
| `FormLabel` (plain `<label>`) | — | Usar `<label>` direto fora de `FormField` context — `FormLabel` fora de context causa crash |

---

## Terminologia Oficial

| ❌ Proibido | ✅ Correto |
|---|---|
| Vaga / Vagas | Extra / Extras |
| Job / Jobs | Extra / Extras |
| Candidato | Profissional / Freelancer |
| Empregador / Cliente | Empresa |
| Marketplace de hospitalidade | Infraestrutura de Mão de Obra |

> **Exceção:** o campo `workersNeeded` (slots de vagas por extra) pode manter "vagas" internamente — é um count de slots, não o nome da oportunidade.

---

## Diretrizes Mobile

- Layout mobile-first em toda a plataforma
- A maioria dos profissionais acessa via smartphone
- Sidebar de admin deve colapsar em menu drawer em mobile
- Tabelas longas no admin: usar cards/lista em mobile, tabela em desktop
- CTAs principais: mínimo 44px de área de toque
- Texto mínimo legível: 14px (text-sm)
- Bottom padding mínimo de `pb-24` em mobile para não esconder conteúdo atrás de nav

---

## Landing Page Aprovada

Arquivo: `artifacts/extrag0/src/pages/landing.tsx`

### Elementos canônicos

| Elemento | Descrição |
|---|---|
| Hero typewriter | Setores rotativos: gastronomia, hotelaria, eventos |
| Frase institucional | "A Infraestrutura de Mão de Obra do Brasil" |
| Seções de ecossistema | Profissional, Empresa, Representante, Investidor |
| Simulador de indicações | Slider interativo de estimativa de ganhos |
| CTA final | WhatsApp waitlist |
| Seção de níveis | Tabela visual com progressão e taxas |

### Regras da landing
- Não transformar em grade de cards
- Manter narrativa contínua de scroll
- Seções devem ter profundidade visual (imagem + texto)
- Não usar tabelas puras como principais elementos de seção

---

## Proibições Absolutas

1. NÃO usar screenshots como fonte da verdade visual
2. NÃO substituir imagens aprovadas sem autorização explícita dos fundadores
3. NÃO criar dashboards genéricos em novas telas
4. NÃO alterar identidade visual aprovada sem aprovação
5. NÃO reconstruir páginas inteiras sem autorização
6. NÃO transformar a extraGO em portal de vagas visualmente
7. NÃO usar o slogan "MARKETPLACE #1 DE HOSPITALIDADE" ou similar
8. NÃO criar segunda navbar, sidebar global ou bottom-tab nav global
9. NÃO adicionar `bg-background` ao wrapper do App.tsx

---

## Diretrizes Permanentes

- A landing aprovada é o espelho visual de toda nova tela
- Toda tela autenticada usa `AppBackground` + sidebar simplificada (≤5 itens por role)
- Paleta de cores não muda sem aprovação — usar variáveis CSS `--primary` e `--secondary`
- O sistema de badges é sprite-based — não substituir por SVG inline sem aprovação

---

## Regras Obrigatórias

1. Toda nova página autenticada usa `AppBackground`
2. Toda nova tela pública usa overlay ≤ 0.55 sobre imagens de fundo
3. `UnifiedNavbar` é a única navbar — não criar componentes de navegação paralelos
4. `FormLabel` fora de contexto de `FormField` deve ser substituído por `<label>` simples
5. Novos componentes de badge devem usar o sprite system existente

---

## Boas Práticas

- Verificar a landing antes de criar qualquer nova seção pública
- Reutilizar `Pill`, `Reveal`, `ScrollSection` antes de criar novos primitivos de UI
- Em mobile: preferir lista/cards a tabelas; preferir drawer a dropdown
- Testar contraste de texto sobre overlay antes de subir (WCAG AA mínimo)
- Manter coerência entre a linguagem visual do produto e a landing institucional

---

## Restrições

- Não usar bibliotecas de chart externas (recharts etc.) — usar CSS-only bars no admin
- Não adicionar fontes externas sem aprovação — fonte padrão do sistema em uso
- Não criar animações pesadas em mobile — `will-change` apenas quando necessário

---

## Checklist de Validação

- [ ] A tela usa `AppBackground` se for área autenticada?
- [ ] Overlays sobre imagens estão entre 0.28 e 0.55?
- [ ] A terminologia oficial (Extra, Profissional, Empresa) está correta?
- [ ] Nenhuma segunda navbar ou sistema de navegação paralelo foi criado?
- [ ] Mobile foi testado (touch targets ≥ 44px, texto ≥ 14px)?
- [ ] `FormLabel` não está sendo usado fora de `FormField` context?
- [ ] Badges de nível usam o sprite system?
- [ ] A linguagem visual é coerente com a landing aprovada?
