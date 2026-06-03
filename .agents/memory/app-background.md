---
name: App background system
description: How the authenticated area background image works, sidebar simplification, and account menu structure.
---

## Background image

- File: `artifacts/extrag0/public/app-background.png` (served as `/app-background.png`)
- Applied via `AppBackground` component in `app-layout.tsx` using `position: fixed; z-index: 0; inset: 0`
- Dark overlay on top: `linear-gradient(180deg, rgba(2,5,9,0.58) 0%, rgba(2,5,9,0.48) 40%, rgba(2,5,9,0.65) 100%)`
- `App.tsx` wrapper div must NOT have `bg-background` class — it blocks the fixed background image. The class was removed.

**Why:** `position: fixed; z-index: 0` paints above non-positioned elements, so the body's `bg-background` (in index.css) acts as a fallback for unauthenticated pages while the image covers authenticated pages.

## Sidebar

- Sidebar: `bg: rgba(2, 5, 10, 0.72)` with `backdrop-filter: blur(32px)` — glass effect over the background image.
- Simplified to 5 primary items max per role:
  - Freelancer: Dashboard, Buscar Extras, Carteira, Indicações, Perfil
  - Company: Dashboard, Buscar Extras, Candidaturas, Carteira
  - Admin: Painel Admin, Usuários, Extras, Financeiro, Analytics
- Sidebar footer: Landing Page link + Logout (both always visible)
- `getNavItems()` was renamed to `getSidebarItems()` — no external callers

## Account menu (avatar button)

The account menu is the full navigation hub. Items per role:
- **Admin:** All 8 admin pages + Notificações + Configurações + Landing Page + Central de Ajuda
- **Company:** Dashboard + Perfil + Buscar/Publicar Extras + Candidaturas + Carteira + Chat + Notificações + Configurações + Landing Page + Central de Ajuda  
- **Freelancer:** Dashboard + Perfil + Rede + Feed + Buscar Extras + Candidaturas + Carteira + Indicações + Chat + Notificações + Configurações + Landing Page + Central de Ajuda
- "Central de Ajuda" is an `action: "support"` item (opens `mailto:suporte@extrag0.com.br`)
- Dividers are objects with `{ divider: true }` in the items array

## Bottom tab bar

- CSS class `.bottom-tab-bar` in `index.css`: `background: rgba(3, 7, 13, 0.88)` — slightly transparent to let image show
- Height: 56px (reduced from 58px for cleaner Android look)
