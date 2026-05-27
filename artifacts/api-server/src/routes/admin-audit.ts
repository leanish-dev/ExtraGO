import { Router } from "express";
import { db, auditLogsTable, usersTable } from "@workspace/db";
import { desc, eq, gte, like, or } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router = Router();

router.get("/admin/audit-logs", requireAdmin, async (req, res) => {
  const { limit = "100", offset = "0", action, adminId } = req.query as Record<string, string>;

  let logs = await db.select().from(auditLogsTable)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(Math.min(parseInt(limit) || 100, 500))
    .offset(parseInt(offset) || 0);

  if (action) logs = logs.filter(l => l.action.includes(action));
  if (adminId) logs = logs.filter(l => l.adminId === parseInt(adminId));

  res.json(logs.map(l => ({
    id: l.id,
    adminId: l.adminId,
    adminName: l.adminName,
    adminRole: l.adminRole,
    action: l.action,
    targetType: l.targetType,
    targetId: l.targetId,
    details: l.details,
    createdAt: l.createdAt?.toISOString(),
  })));
});

export default router;
