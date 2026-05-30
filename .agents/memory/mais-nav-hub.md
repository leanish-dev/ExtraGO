---
name: Mais Nav Hub
description: Architecture of the mobile bottom nav "Mais" sheet in app-layout.tsx, and related GlobalSearch/FormLabel gotchas.
---

## MaisNavSheet architecture
- Lives entirely in `artifacts/extrag0/src/components/app-layout.tsx`
- Triggered by the 5th bottom tab item with `isMais: true` flag in `getBottomTabItems`
- Uses Framer Motion `AnimatePresence` + spring slide-up (no Sheet component needed)
- Items are defined in `BASE_MAIS_ITEMS` and `ADMIN_MAIS_ITEMS` constants
- `user?.role === "admin"` selects the admin item list — non-admins never see admin routes
- `onSearchOpen` callback closes the sheet and opens GlobalSearch (state lifted to AppLayout)

## GlobalSearch state lift
- Old: `GlobalSearchButton` owned its own open state
- New: `globalSearchOpen` state lives in `AppLayout`; `<GlobalSearch open={...} onClose={...} />` rendered directly
- ⌘K / Ctrl+K keyboard shortcut handled in `AppLayout` useEffect
- `GlobalSearchButton` is no longer used in app-layout (replaced by inline `<motion.button>`)

## Bottom tab config
- Freelancer: Início, Vagas, Chat, Carteira, Mais
- Company: Início, Vagas, Candidatos, Carteira, Mais
- Admin: Painel, Usuários, Analytics, Ops, Mais (admin Mais sheet shows all 7 admin pages)

## FormLabel gotcha
- `FormLabel` from `@/components/ui/form` calls `useFormField()` internally
- If used outside of a `<FormField>` context it throws: "useFormField should be used within <FormField>"
- Fix: use a plain `<label>` element for any label outside a FormField wrapper (e.g. category selectors in post-job.tsx)

**Why:** FormLabel is a shadcn/radix composition helper tightly coupled to FormField context.
**How to apply:** Any time you need a form label without a FormField wrapper, use `<label className="...">` directly.
