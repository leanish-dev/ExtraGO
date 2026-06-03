import { Router, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { eq, or, and, desc, asc, sql } from "drizzle-orm";
import { requireAuth, getUserIdFromToken } from "../lib/auth";

const router = Router();

/* ── SSE client registry ── */
const sseClients = new Map<number, Set<Response>>();

function notifyUser(userId: number, event: Record<string, unknown>) {
  const clients = sseClients.get(userId);
  if (!clients || clients.size === 0) return;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach(res => {
    try { res.write(payload); } catch { /* client disconnected */ }
  });
}

/* ── GET /chat/sse ── realtime event stream (token via query param, EventSource can't set headers) ── */
router.get("/chat/sse", async (req: any, res: Response) => {
  const queryToken = req.query.token as string | undefined;
  const authHeader = req.headers["authorization"] as string | undefined;
  const token = queryToken || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);

  if (!token) { res.status(401).end(); return; }
  const rawUserId = await getUserIdFromToken(token);
  if (!rawUserId) { res.status(401).end(); return; }

  const [userRow] = await db.select({ id: usersTable.id, isBanned: usersTable.isBanned })
    .from(usersTable).where(eq(usersTable.id, rawUserId)).limit(1);
  if (!userRow || userRow.isBanned) { res.status(401).end(); return; }

  const userId = rawUserId;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-store, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  if (!sseClients.has(userId)) sseClients.set(userId, new Set());
  sseClients.get(userId)!.add(res);

  res.write(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`);

  const heartbeat = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    const set = sseClients.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) sseClients.delete(userId);
    }
  });
});

/* ── GET /chat/unread ── total unread count ── */
router.get("/chat/unread", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;

    const convs = await db.select({ id: conversations.id })
      .from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)));

    if (convs.length === 0) { res.json({ total: 0 }); return; }

    const convIds = convs.map(c => c.id);
    const unread = await db.select({ id: messages.id })
      .from(messages)
      .where(sql`${messages.conversationId} = ANY(ARRAY[${sql.join(convIds.map(id => sql`${id}`), sql`, `)}]::int[])
        AND ${messages.senderId} != ${userId}
        AND ${messages.isRead} = false`);

    res.json({ total: unread.length });
  } catch {
    res.json({ total: 0 });
  }
});

/* ── GET /chat/conversations ── */
router.get("/chat/conversations", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;

    const convs = await db.select()
      .from(conversations)
      .where(or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId)))
      .orderBy(desc(conversations.lastMessageAt));

    if (convs.length === 0) { res.json([]); return; }

    const otherUserIds = [...new Set(convs.map(c =>
      c.participant1Id === userId ? c.participant2Id : c.participant1Id
    ))];

    // Batch: other users
    const otherUsers = await db.select({
      id: usersTable.id, name: usersTable.name, role: usersTable.role,
      avatarUrl: usersTable.avatarUrl, companyName: usersTable.companyName,
    }).from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(otherUserIds.map(id => sql`${id}`), sql`, `)}]::int[])`);
    const userMap = new Map(otherUsers.map(u => [u.id, u]));

    const convIds = convs.map(c => c.id);

    // Batch: last messages via DISTINCT ON
    const lastMsgsRaw = await db.execute(
      sql`SELECT DISTINCT ON (conversation_id) id, conversation_id, sender_id, content, type, is_read, created_at
          FROM messages
          WHERE conversation_id = ANY(ARRAY[${sql.join(convIds.map(id => sql`${id}`), sql`, `)}]::int[])
          ORDER BY conversation_id, created_at DESC`
    );
    const lastMsgMap = new Map<number, { content: string; senderId: number }>();
    (lastMsgsRaw.rows ?? lastMsgsRaw as unknown as any[]).forEach((row: any) => {
      lastMsgMap.set(row.conversation_id, { content: row.content, senderId: row.sender_id });
    });

    // Batch: unread counts
    const unreadMsgs = await db.select({ convId: messages.conversationId, senderId: messages.senderId })
      .from(messages)
      .where(sql`${messages.conversationId} = ANY(ARRAY[${sql.join(convIds.map(id => sql`${id}`), sql`, `)}]::int[])
        AND ${messages.senderId} != ${userId}
        AND ${messages.isRead} = false`);
    const unreadMap = new Map<number, number>();
    unreadMsgs.forEach(m => unreadMap.set(m.convId, (unreadMap.get(m.convId) ?? 0) + 1));

    const enriched = convs.map(conv => {
      const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      return {
        ...conv,
        otherUser: userMap.get(otherId) ?? null,
        lastMessage: lastMsgMap.get(conv.id) ?? null,
        unreadCount: unreadMap.get(conv.id) ?? 0,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error("chat conversations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /chat/conversations ── find or create ── */
router.post("/chat/conversations", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;
    const { participantId } = req.body;

    if (!participantId || participantId === userId) {
      res.status(400).json({ error: "Invalid participantId" }); return;
    }

    const existing = await db.select().from(conversations).where(
      or(
        and(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, participantId)),
        and(eq(conversations.participant1Id, participantId), eq(conversations.participant2Id, userId))
      )
    ).limit(1);

    if (existing.length > 0) { res.json(existing[0]); return; }

    const [created] = await db.insert(conversations).values({
      participant1Id: userId, participant2Id: participantId, lastMessageAt: new Date(),
    }).returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error("create conversation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /chat/conversations/:id/messages ── */
router.get("/chat/conversations/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;
    const convId = parseInt(req.params.id as string);

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }

    const msgs = await db.select().from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(asc(messages.createdAt))
      .limit(100);

    res.json(msgs);
  } catch (err: any) {
    console.error("get messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /chat/conversations/:id/messages ── */
router.post("/chat/conversations/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;
    const convId = parseInt(req.params.id as string);
    const { content, type = "text" } = req.body;

    if (!content?.trim()) { res.status(400).json({ error: "Content is required" }); return; }

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }

    const [msg] = await db.insert(messages).values({
      conversationId: convId, senderId: userId, content: content.trim(), type, isRead: false,
    }).returning();

    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, convId));

    // Push realtime event to both participants
    const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
    const sseEvent = { type: "new_message", conversationId: convId, message: msg };
    notifyUser(userId, sseEvent);
    notifyUser(otherId, sseEvent);

    res.status(201).json(msg);
  } catch (err: any) {
    console.error("send message error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /chat/conversations/:id/typing ── */
router.post("/chat/conversations/:id/typing", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;
    const convId = parseInt(req.params.id as string);
    const { isTyping } = req.body;

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }

    const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
    notifyUser(otherId, { type: "typing", conversationId: convId, userId, isTyping: !!isTyping });
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

/* ── POST /chat/conversations/:id/read ── */
router.post("/chat/conversations/:id/read", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id as number;
    const convId = parseInt(req.params.id as string);

    const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }

    // Batch update: mark all unread messages from the other user as read
    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, convId),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${userId}`
      ));

    // Notify sender their messages were read
    const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
    notifyUser(otherId, { type: "messages_read", conversationId: convId });

    res.json({ ok: true });
  } catch (err: any) {
    console.error("mark read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
