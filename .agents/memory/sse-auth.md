---
name: SSE auth pattern
description: How to authenticate SSE (EventSource) connections that can't set custom headers
---

Browser's `EventSource` API does not support custom request headers. The standard `requireAuth` middleware reads from `Authorization: Bearer <token>`, which EventSource cannot provide.

**The pattern:** Accept the token via query param `?token=` on the SSE endpoint, falling back to the Authorization header.

Backend:
```ts
router.get("/chat/sse", async (req: any, res: Response) => {
  const queryToken = req.query.token as string | undefined;
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = queryToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);
  if (!token) { res.status(401).end(); return; }
  const userId = getUserIdFromToken(token);
  ...
});
```

Frontend:
```ts
const token = localStorage.getItem("extragO_token") || "";
const es = new EventSource(`${BASE}/api/chat/sse?token=${encodeURIComponent(token)}`);
```

**Why:** Without this, SSE connections are rejected with 401 and the chat falls back to polling indefinitely.

**How to apply:** Any new SSE endpoint must do inline auth with this dual-source token pattern, not `requireAuth` middleware.
