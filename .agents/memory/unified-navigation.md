---
name: Unified navigation system
description: How authenticated + public navigation works after the single-navbar unification; the sidebar/bottom-tabs/Mais-sheet are gone.
---

# Unified navigation

All navigation (public AND authenticated) goes through ONE component:
`components/layout/InstitutionalNavbar.tsx` (default export `UnifiedNavbar`).
The filename was kept so the ~5 public-page imports keep working.

- Logged OUT → renders the approved landing navbar (links, Arq. Financeira dropdown, Entrar pill).
- Logged IN → compact welcome (name/level/reputation/company/admin badge) + always-visible right actions: Search (desktop button + drawer item for mobile), Chat (unread badge, non-admin only), NotificationBell, Avatar that links directly to `/app/profile` (no dropdown).
- The hamburger drawer is the primary nav on every screen size; on mobile it is the ONLY way to reach search/sections.

REMOVED entirely: the authenticated sidebar, the mobile bottom-tab bar, the "Mais" bottom-sheet (`MaisNavSheet`), and the avatar account-dropdown. `app-layout.tsx` is now a thin shell: AppBackground + GlobalSearch (⌘K, state lifted here, passed via `onSearchOpen`) + `<UnifiedNavbar/>` + scrollable `<main>`.

## nav-config.tsx is the single source of truth
`components/layout/nav-config.tsx` declares `APP_NAV_SECTIONS` for the authenticated drawer. Locks are data-driven: each item has `unlocked: Role[]`, optional `locked: Role[]`, and `lockMessage`. `isItemLocked()` returns false for admin always (admin sees everything unlocked); a locked item shows a lock icon + toast instead of navigating. `visibleSections(role)` drops empty sections.

## Gotcha: admin in `unlocked[]` vs. route guards
**Do NOT** put `admin` in an item's `unlocked[]` if its route is `ProtectedRoute allowedRoles={[<single non-admin role>]}` — the drawer link will render but ProtectedRoute silently bounces admin to `/admin`. Example: `/app/referrals` is freelancer-only, so Indicações must NOT list admin.
**Why:** lock gating is cosmetic; real authorization is in `ProtectedRoute` (App.tsx) + server middleware. The two must agree or you get dead links.
**How to apply:** before adding a role to `unlocked[]`, confirm that role passes the route's `allowedRoles` in App.tsx.

## Known acceptable aliasing
Some drawer items point at shared routes because no dedicated page exists yet: Relatórios→/app/dashboard, Centro Financeiro Empresarial→/app/wallet, Buscar Profissionais→/app/network, Configurações→/app/profile. This causes two items to highlight at once on those routes (exact-match active detection). Cosmetic, intentional for now.
