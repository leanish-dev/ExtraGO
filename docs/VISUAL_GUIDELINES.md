# extraGO — VISUAL GUIDELINES

## Fonte da Verdade Visual

A **Landing Page aprovada** (`/`) é a fonte oficial da identidade visual da extraGO.
Toda nova tela deve ser derivada da linguagem visual estabelecida na landing.

---

## Paleta Oficial

| Nome | Uso | Referência |
|---|---|---|
| **Verde extraGO** | Primary action, CTA, destaque | `hsl(var(--primary))` / `#7CFC00`-like |
| **Cyan extraGO** | Secondary accent, hover, links | `hsl(var(--secondary))` / `#00E5FF`-like |
| **Azul institucional profundo** | Background base, fundos de seção | `#050b10` / `#05101a` |
| **Branco** | Texto principal, títulos | `#FFFFFF` / `rgba(255,255,255,0.88+)` |
| **Cinzas suaves** | Texto secundário, bordas | `rgba(255,255,255,0.55–0.72)` |

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

## A plataforma deve parecer:

| Referência | Atributo visual |
|---|---|
| **Uber Operations** | Sobriedade, escala, mapa nacional |
| **LinkedIn Workforce Network** | Confiança institucional, profissionalismo |
| **Stripe Financial Infrastructure** | Precisão, tipografia, densidade de informação |

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

---

## Tipografia

- **Títulos principais:** `font-black`, clamp responsivo entre ~22px e ~48px
- **Subtítulos:** `font-bold` ou `font-semibold`
- **Corpo:** `text-sm` / `text-[14px]`, `leading-relaxed`
- **Badges/pills:** `text-xs font-bold uppercase tracking-wide`

---

## Componentes Aprovados

- `Pill` — badge de seção com ícone + cor de acento
- `Reveal` / `ScrollSection` — animação de entrada ao scroll
- `LevelBadge`, `ReferralBadge`, `CorporateBadge` — sistema de badges sprite
- `UnifiedNavbar` — ÚNICA navbar para toda a aplicação
- `AppBackground` — fundo fixo para área autenticada

---

## Terminologia Oficial

- Trabalho/oportunidade → **Extra** (não "vaga", não "job")
- Trabalhador → **Profissional** ou **Freelancer**
- Contratante → **Empresa**
- Rede de indicação → **Indicados** / **Rede de Indicações**
- NÃO usar: "vagas", "jobs", "marketplace de hospitalidade"

---

## Proibições Absolutas

1. NÃO usar screenshots como fonte da verdade
2. NÃO substituir imagens aprovadas sem autorização explícita
3. NÃO criar dashboards genéricos em novas telas
4. NÃO alterar identidade visual aprovada sem aprovação
5. NÃO reconstruir páginas inteiras sem autorização
6. NÃO transformar a extraGO em portal de vagas visualmente
7. NÃO usar o slogan "MARKETPLACE #1 DE HOSPITALIDADE" ou similar
