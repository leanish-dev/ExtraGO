---
name: Express route prefix
description: app.use("/api", router) strips the /api prefix before handing to the router
---

The main `app.ts` mounts the master router with `app.use("/api", router)`.

**The rule:** Routes registered *inside* the router must NOT include `/api/` prefix. Express strips the mount prefix before matching.

Correct:
```ts
router.get("/chat/conversations", ...)   // accessible at /api/chat/conversations
router.get("/admin/users", ...)          // accessible at /api/admin/users
router.post("/setup/admin", ...)         // accessible at /api/setup/admin
```

Wrong (double-prefix, results in 404):
```ts
router.get("/api/chat/conversations", ...)  // would need /api/api/chat/conversations
```

**Why:** The original chat.ts had double-prefixed routes, silently returning 404s that were swallowed by catch blocks — making chat appear broken/empty even though the server was running.

**How to apply:** Whenever adding a new route file, register paths relative to the mount point (no leading `/api/`). The Vite proxy passes the full `/api/...` path to Express, which strips `/api` before the router sees it.
