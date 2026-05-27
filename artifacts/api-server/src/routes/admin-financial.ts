import { Router } from "express";
import { db, usersTable, transactionsTable, walletsTable, representativesTable, platformSettingsTable } from "@workspace/db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { requireAdmin, requireAdminRole, logAuditAction } from "../lib/auth";

const router = Router();

router.get("/admin/financial/overview", requireAdmin, async (req, res) => {
  const [allTx, repRows, settingsRows] = await Promise.all([
    db.select().from(transactionsTable),
    db.select().from(representativesTable),
    db.select().from(platformSettingsTable),
  ]);

  const settings = Object.fromEntries(settingsRows.map(s => [s.key, s.value]));
  const repPct = parseFloat(settings["rep_commission_pct"] ?? "20") / 100;
  const mktPct = parseFloat(settings["marketing_pct"] ?? "20") / 100;
  const hcPct = parseFloat(settings["human_capital_pct"] ?? "10") / 100;

  const commissions = allTx.filter(t => t.type === "commission");
  const withdrawals = allTx.filter(t => t.type === "withdrawal");
  const credits = allTx.filter(t => t.type === "credit");

  const totalCommissions = commissions.reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = withdrawals.filter(t => t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalTransacted = credits.reduce((s, t) => s + t.amount, 0);

  const repShare = totalCommissions * repPct;
  const mktShare = totalCommissions * mktPct;
  const hcShare = totalCommissions * hcPct;
  const platformShare = totalCommissions * (1 - repPct - mktPct - hcPct);

  const revenueByMonth: { month: string; revenue: number; transacted: number; withdrawals: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    const monthComm = commissions.filter(t => t.createdAt?.toISOString().slice(0, 7) === monthStr);
    const monthCredit = credits.filter(t => t.createdAt?.toISOString().slice(0, 7) === monthStr);
    const monthWd = withdrawals.filter(t => t.createdAt?.toISOString().slice(0, 7) === monthStr && t.status === "completed");
    revenueByMonth.push({
      month: monthStr,
      revenue: monthComm.reduce((s, t) => s + t.amount, 0),
      transacted: monthCredit.reduce((s, t) => s + t.amount, 0),
      withdrawals: monthWd.reduce((s, t) => s + t.amount, 0),
    });
  }

  const withdrawalsByStatus = {
    pending: withdrawals.filter(t => t.status === "pending").length,
    completed: withdrawals.filter(t => t.status === "completed").length,
    failed: withdrawals.filter(t => t.status === "failed").length,
    pendingAmount: withdrawals.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0),
  };

  res.json({
    totalCommissions,
    totalTransacted,
    totalWithdrawn,
    distribution: {
      representative: { pct: repPct * 100, amount: repShare },
      marketing: { pct: mktPct * 100, amount: mktShare },
      humanCapital: { pct: hcPct * 100, amount: hcShare },
      platform: { pct: (1 - repPct - mktPct - hcPct) * 100, amount: platformShare },
    },
    revenueByMonth,
    withdrawalsByStatus,
    representatives: repRows.length,
  });
});

// Representatives management
router.get("/admin/representatives", requireAdmin, async (req, res) => {
  const reps = await db.select().from(representativesTable);
  const userIds = reps.map(r => r.userId);
  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(
        sql`${usersTable.id} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::int[])`
      )
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(reps.map(r => {
    const user = userMap.get(r.userId);
    return {
      id: r.id,
      userId: r.userId,
      userName: user?.name ?? "—",
      userEmail: user?.email ?? "—",
      stateCode: r.stateCode,
      stateName: r.stateName,
      commissionRate: r.commissionRate,
      totalEarned: r.totalEarned,
      totalPaid: r.totalPaid,
      isActive: r.isActive === 1,
      createdAt: r.createdAt?.toISOString(),
    };
  }));
});

router.post("/admin/representatives", requireAdminRole(["super_admin"]), async (req, res) => {
  const { userId, stateCode, stateName, commissionRate } = req.body ?? {};
  if (!userId || !stateCode || !stateName) {
    res.status(400).json({ error: "userId, stateCode and stateName required" }); return;
  }
  const admin = (req as any).user;
  await db.update(usersTable).set({
    adminRole: "state_representative",
    stateCode,
  }).where(eq(usersTable.id, parseInt(userId)));

  const existing = await db.select().from(representativesTable).where(eq(representativesTable.userId, parseInt(userId)));
  if (existing.length > 0) {
    await db.update(representativesTable).set({
      stateCode, stateName, commissionRate: commissionRate ?? 0.20, isActive: 1,
    }).where(eq(representativesTable.userId, parseInt(userId)));
  } else {
    await db.insert(representativesTable).values({
      userId: parseInt(userId), stateCode, stateName,
      commissionRate: commissionRate ?? 0.20,
      totalEarned: 0, totalPaid: 0, isActive: 1,
    });
  }
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "assign_representative", targetType: "user", targetId: parseInt(userId),
    details: { stateCode, stateName, commissionRate },
  });
  res.json({ message: "Representative assigned" });
});

router.get("/admin/regional-stats", requireAdmin, async (req, res) => {
  const [users, jobs] = await Promise.all([
    db.select({ id: usersTable.id, role: usersTable.role, serviceRegions: usersTable.serviceRegions, createdAt: usersTable.createdAt }).from(usersTable),
    db.select({ id: jobsTable.id, location: jobsTable.status, totalValue: jobsTable.totalValue, status: jobsTable.status }).from(jobsTable),
  ]);

  const STATES = ["SP","RJ","MG","RS","PR","SC","BA","GO","PE","CE","PA","MA","ES","AM","MT","MS","PB","RN","AL","PI","SE","TO","RO","AC","AP","RR","DF"];
  const stats = STATES.map(code => {
    const stateUsers = users.filter(u => u.serviceRegions?.includes(code));
    const freelancers = stateUsers.filter(u => u.role === "freelancer").length;
    const companies = stateUsers.filter(u => u.role === "company").length;
    return {
      stateCode: code,
      freelancers,
      companies,
      totalUsers: freelancers + companies,
      activeJobs: Math.floor(Math.random() * 20),
      revenue: Math.floor(Math.random() * 50000),
    };
  });

  res.json(stats);
});

export default router;
