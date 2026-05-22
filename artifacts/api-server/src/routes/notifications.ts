import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ListNotificationsQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /notifications
router.get("/notifications", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ListNotificationsQueryParams.safeParse(req.query);
  const { unreadOnly } = parsed.data ?? {};

  let notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(sql`${notificationsTable.createdAt} DESC`)
    .limit(50);

  if (unreadOnly) notifications = notifications.filter(n => !n.isRead);

  res.json(notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    link: n.link ?? null,
    createdAt: n.createdAt?.toISOString(),
  })));
});

// POST /notifications/:id/read
router.post("/notifications/:id/read", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));

  res.json({ message: "Marked as read" });
});

// POST /notifications/read-all
router.post("/notifications/read-all", requireAuth, async (req, res) => {
  const user = (req as any).user;
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, user.id));
  res.json({ message: "All marked as read" });
});

export default router;
