import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, sql, ilike, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ListNotificationsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    category: n.category,
    priority: n.priority,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    link: n.link ?? null,
    createdAt: n.createdAt?.toISOString(),
  };
}

// GET /notifications
router.get("/notifications", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ListNotificationsQueryParams.safeParse(req.query);
  const { unreadOnly, category, search } = parsed.data ?? {};
  const page = Math.max(1, parsed.data?.page ?? 1);
  const limit = Math.min(100, Math.max(1, parsed.data?.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [eq(notificationsTable.userId, user.id)];
  if (unreadOnly) conditions.push(eq(notificationsTable.isRead, false));
  if (category) conditions.push(eq(notificationsTable.category, category));
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(or(ilike(notificationsTable.title, term), ilike(notificationsTable.message, term))!);
  }
  const whereClause = and(...conditions);

  const [items, [{ total }], [{ unreadCount }]] = await Promise.all([
    db.select().from(notificationsTable)
      .where(whereClause)
      .orderBy(sql`${notificationsTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(notificationsTable).where(whereClause),
    db.select({ unreadCount: sql<number>`count(*)::int` }).from(notificationsTable)
      .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false))),
  ]);

  res.json({
    items: items.map(formatNotification),
    total,
    unreadCount,
    page,
    limit,
    hasMore: offset + items.length < total,
  });
});

// POST /notifications/:id/read
router.post("/notifications/:id/read", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));

  res.json({ message: "Marked as read" });
});

// DELETE /notifications/:id
router.delete("/notifications/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(notificationsTable)
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)));

  res.json({ message: "Notification deleted" });
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
