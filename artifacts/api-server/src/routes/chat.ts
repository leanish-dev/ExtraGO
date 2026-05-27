import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { eq, or, and, desc, asc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

/* ── GET /api/chat/conversations ── */
router.get("/api/chat/conversations", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const convs = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // Enrich with other user info + last message
    const { users } = await import("@workspace/db/schema");
    const enriched = await Promise.all(
      convs.map(async (conv) => {
        const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

        const [otherUser] = await db
          .select({
            id: users.id,
            name: users.name,
            role: users.role,
            avatarUrl: users.avatarUrl,
            companyName: users.companyName,
          })
          .from(users)
          .where(eq(users.id, otherId));

        const [lastMsg] = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const unreadCount = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              eq(messages.isRead, false),
            )
          )
          .then((rows) => rows.filter((m) => m.senderId !== userId).length);

        return {
          ...conv,
          otherUser,
          lastMessage: lastMsg ? { content: lastMsg.content, senderId: lastMsg.senderId } : null,
          unreadCount,
        };
      })
    );

    res.json(enriched);
  } catch (err: any) {
    console.error("chat conversations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /api/chat/conversations ── find or create */
router.post("/api/chat/conversations", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { participantId } = req.body;

    if (!participantId || participantId === userId) {
      return res.status(400).json({ error: "Invalid participantId" });
    }

    // Check if conversation already exists
    const existing = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, userId),
            eq(conversations.participant2Id, participantId)
          ),
          and(
            eq(conversations.participant1Id, participantId),
            eq(conversations.participant2Id, userId)
          )
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    const [created] = await db
      .insert(conversations)
      .values({
        participant1Id: userId,
        participant2Id: participantId,
        lastMessageAt: new Date(),
      })
      .returning();

    res.status(201).json(created);
  } catch (err: any) {
    console.error("create conversation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /api/chat/conversations/:id/messages ── */
router.get("/api/chat/conversations/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const convId = parseInt(req.params.id);

    // Verify access
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .limit(1);

    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(asc(messages.createdAt))
      .limit(100);

    res.json(msgs);
  } catch (err: any) {
    console.error("get messages error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /api/chat/conversations/:id/messages ── */
router.post("/api/chat/conversations/:id/messages", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const convId = parseInt(req.params.id);
    const { content, type = "text" } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Verify access
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .limit(1);

    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId: convId,
        senderId: userId,
        content: content.trim(),
        type,
        isRead: false,
      })
      .returning();

    // Update conversation lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, convId));

    res.status(201).json(msg);
  } catch (err: any) {
    console.error("send message error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── POST /api/chat/conversations/:id/read ── mark messages as read */
router.post("/api/chat/conversations/:id/read", requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const convId = parseInt(req.params.id);

    // Verify access
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .limit(1);

    if (!conv || (conv.participant1Id !== userId && conv.participant2Id !== userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Mark all messages from the other user as read
    const allMsgs = await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, convId), eq(messages.isRead, false)));

    for (const m of allMsgs) {
      if (m.senderId !== userId) {
        await db
          .update(messages)
          .set({ isRead: true })
          .where(eq(messages.id, m.id));
      }
    }

    res.json({ ok: true });
  } catch (err: any) {
    console.error("mark read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
