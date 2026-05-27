import { Router } from "express";
import {
  db, usersTable, jobsTable, transactionsTable, walletsTable,
  notificationsTable, applicationsTable,
} from "@workspace/db";
import { eq, sql, desc, and, gte } from "drizzle-orm";
import { requireAdmin, requireAdminRole, formatUser, logAuditAction } from "../lib/auth";
import { AdminListUsersQueryParams, AdminListJobsQueryParams, AdminListWithdrawalsQueryParams } from "@workspace/api-zod";

const router = Router();

// ─── Users ──────────────────────────────────────────────────────────────────

router.get("/admin/users", requireAdmin, async (req, res) => {
  const parsed = AdminListUsersQueryParams.safeParse(req.query);
  const { role, search } = parsed.data ?? {};

  let users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(500);
  if (role) users = users.filter(u => u.role === role);
  if (search) users = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  res.json(users.map(formatUser));
});

router.post("/admin/users/:id/ban", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  const admin = (req as any).user;
  await db.update(usersTable).set({ isBanned: !user.isBanned }).where(eq(usersTable.id, id));
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: user.isBanned ? "unban_user" : "ban_user",
    targetType: "user", targetId: id,
    details: { userName: user.name, email: user.email },
  });
  res.json({ message: user.isBanned ? "User unbanned" : "User banned" });
});

router.post("/admin/users/:id/verify", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const admin = (req as any).user;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(usersTable).set({ isVerified: true }).where(eq(usersTable.id, id));
  await db.insert(notificationsTable).values({
    userId: id, type: "verified",
    title: "Perfil verificado!",
    message: "Seu perfil foi verificado pela equipe extraGO",
    isRead: false,
  }).catch(() => {});
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "verify_user", targetType: "user", targetId: id,
    details: { userName: user.name, email: user.email },
  });
  res.json({ message: "User verified" });
});

router.post("/admin/users/:id/role", requireAdminRole(["super_admin"]), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { adminRole, stateCode } = req.body ?? {};
  const admin = (req as any).user;
  const validRoles = ["super_admin", "financial_admin", "operations_admin", "regional_admin", "support_admin", "state_representative", null];
  if (!validRoles.includes(adminRole)) {
    res.status(400).json({ error: "Invalid admin role" }); return;
  }
  await db.update(usersTable).set({
    adminRole: adminRole ?? null,
    stateCode: stateCode ?? null,
  }).where(eq(usersTable.id, id));
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "assign_admin_role", targetType: "user", targetId: id,
    details: { adminRole, stateCode },
  });
  res.json({ message: "Role updated" });
});

router.post("/admin/users/:id/promote-admin", requireAdminRole(["super_admin"]), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { adminRole, stateCode } = req.body ?? {};
  const admin = (req as any).user;
  await db.update(usersTable).set({
    role: "admin",
    adminRole: adminRole ?? "support_admin",
    stateCode: stateCode ?? null,
  }).where(eq(usersTable.id, id));
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "promote_to_admin", targetType: "user", targetId: id,
    details: { adminRole, stateCode },
  });
  res.json({ message: "User promoted to admin" });
});

// ─── Jobs ───────────────────────────────────────────────────────────────────

router.get("/admin/jobs", requireAdmin, async (req, res) => {
  const parsed = AdminListJobsQueryParams.safeParse(req.query);
  const { status } = parsed.data ?? {};

  let jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(500);
  if (status) jobs = jobs.filter(j => j.status === status);

  const companyIds = [...new Set(jobs.map(j => j.companyId))];
  const companies = companyIds.length > 0
    ? await db.select().from(usersTable).where(
        sql`${usersTable.id} = ANY(ARRAY[${sql.join(companyIds.map(id => sql`${id}`), sql`, `)}]::int[])`
      )
    : [];
  const companyMap = new Map(companies.map(c => [c.id, c]));

  res.json(jobs.map(j => {
    const company = companyMap.get(j.companyId);
    return {
      id: j.id, title: j.title, description: j.description,
      category: j.category, location: j.location, date: j.date,
      startTime: j.startTime, endTime: j.endTime,
      workersNeeded: j.workersNeeded, workersApproved: j.workersApproved,
      hourlyRate: j.hourlyRate, totalValue: j.totalValue,
      status: j.status, companyId: j.companyId,
      companyName: company?.companyName ?? company?.name ?? null,
      companyAvatarUrl: company?.avatarUrl ?? null,
      createdAt: j.createdAt?.toISOString(),
    };
  }));
});

// ─── Withdrawals ─────────────────────────────────────────────────────────────

router.get("/admin/withdrawals", requireAdmin, async (req, res) => {
  const parsed = AdminListWithdrawalsQueryParams.safeParse(req.query);
  const { status } = parsed.data ?? {};

  let transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.type, "withdrawal"))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(500);

  if (status) transactions = transactions.filter(t => t.status === status);

  const walletIds = [...new Set(transactions.map(t => t.walletId))];
  const wallets = walletIds.length > 0
    ? await db.select().from(walletsTable).where(
        sql`${walletsTable.id} = ANY(ARRAY[${sql.join(walletIds.map(id => sql`${id}`), sql`, `)}]::int[])`
      )
    : [];
  const walletToUser = new Map(wallets.map(w => [w.id, w.userId]));
  const userIds = [...new Set(wallets.map(w => w.userId))];
  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(
        sql`${usersTable.id} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::int[])`
      )
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(transactions.map(t => {
    const userId = walletToUser.get(t.walletId);
    const user = userId ? userMap.get(userId) : null;
    return {
      id: t.id, walletId: t.walletId, type: t.type,
      amount: t.amount, description: t.description, status: t.status,
      pixKey: t.pixKey ?? null, createdAt: t.createdAt?.toISOString(),
      userName: user?.name ?? null, userEmail: user?.email ?? null,
    };
  }));
});

router.post("/admin/withdrawals/:id/approve", requireAdminRole(["super_admin", "financial_admin"]), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const admin = (req as any).user;
  await db.update(transactionsTable).set({ status: "completed" }).where(eq(transactionsTable.id, id));
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "approve_withdrawal", targetType: "transaction", targetId: id,
  });
  res.json({ message: "Withdrawal approved" });
});

router.post("/admin/withdrawals/:id/reject", requireAdminRole(["super_admin", "financial_admin"]), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const admin = (req as any).user;
  await db.update(transactionsTable).set({ status: "failed" }).where(eq(transactionsTable.id, id));
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "reject_withdrawal", targetType: "transaction", targetId: id,
  });
  res.json({ message: "Withdrawal rejected" });
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [allUsers, allJobs, allTransactions, allWithdrawals, commissions] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(jobsTable),
    db.select().from(transactionsTable),
    db.select().from(transactionsTable).where(
      and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "pending"))
    ),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "commission")),
  ]);

  const totalRevenue = commissions.reduce((s, t) => s + t.amount, 0);
  const totalTransacted = allTransactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);

  const now = new Date();
  const oneMonthAgo = new Date(now); oneMonthAgo.setMonth(now.getMonth() - 1);
  const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
  const today = new Date(now); today.setHours(0, 0, 0, 0);

  const usersThisMonth = allUsers.filter(u => u.createdAt && u.createdAt > oneMonthAgo).length;
  const usersThisWeek = allUsers.filter(u => u.createdAt && u.createdAt > oneWeekAgo).length;
  const jobsToday = allJobs.filter(j => j.createdAt && j.createdAt >= today).length;

  const revenueByMonth: { month: string; amount: number; transactions: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    const monthCommissions = commissions.filter(t =>
      t.createdAt && t.createdAt.toISOString().slice(0, 7) === monthStr
    );
    revenueByMonth.push({
      month: monthStr,
      amount: monthCommissions.reduce((s, t) => s + t.amount, 0),
      transactions: monthCommissions.length,
    });
  }

  const userGrowthByMonth: { month: string; freelancers: number; companies: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toISOString().slice(0, 7);
    const monthUsers = allUsers.filter(u =>
      u.createdAt && u.createdAt.toISOString().slice(0, 7) === monthStr
    );
    userGrowthByMonth.push({
      month: monthStr,
      freelancers: monthUsers.filter(u => u.role === "freelancer").length,
      companies: monthUsers.filter(u => u.role === "company").length,
    });
  }

  const topFreelancers = allUsers
    .filter(u => u.role === "freelancer")
    .sort((a, b) => b.completedJobs - a.completedJobs)
    .slice(0, 5)
    .map(formatUser);

  const jobsByCategory: { category: string; count: number }[] = [];
  const catMap = new Map<string, number>();
  allJobs.forEach(j => catMap.set(j.category, (catMap.get(j.category) ?? 0) + 1));
  catMap.forEach((count, category) => jobsByCategory.push({ category, count }));
  jobsByCategory.sort((a, b) => b.count - a.count);

  res.json({
    totalUsers: allUsers.length,
    totalFreelancers: allUsers.filter(u => u.role === "freelancer").length,
    totalCompanies: allUsers.filter(u => u.role === "company").length,
    totalAdmins: allUsers.filter(u => u.role === "admin").length,
    totalJobs: allJobs.length,
    activeJobs: allJobs.filter(j => j.status === "open").length,
    completedJobs: allJobs.filter(j => j.status === "completed").length,
    jobsInProgress: allJobs.filter(j => j.status === "in_progress").length,
    jobsToday,
    totalRevenue,
    totalTransacted,
    pendingWithdrawals: allWithdrawals.length,
    pendingWithdrawalsAmount: allWithdrawals.reduce((s, t) => s + t.amount, 0),
    pendingVerifications: allUsers.filter(u => !u.isVerified && u.role === "freelancer").length,
    usersThisMonth,
    usersThisWeek,
    revenueByMonth,
    userGrowthByMonth,
    topFreelancers,
    jobsByCategory: jobsByCategory.slice(0, 8),
  });
});

// ─── Platform Monitoring ─────────────────────────────────────────────────────

router.get("/admin/monitoring", requireAdmin, async (req, res) => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last1h = new Date(Date.now() - 60 * 60 * 1000);

  const [allUsers, activeJobs, recentTx, pendingWithdrawals] = await Promise.all([
    db.select({ id: usersTable.id, role: usersTable.role, createdAt: usersTable.createdAt }).from(usersTable),
    db.select({ id: jobsTable.id, status: jobsTable.status }).from(jobsTable),
    db.select().from(transactionsTable).where(gte(transactionsTable.createdAt, last1h)),
    db.select().from(transactionsTable).where(
      and(eq(transactionsTable.type, "withdrawal"), eq(transactionsTable.status, "pending"))
    ),
  ]);

  res.json({
    onlineUsers: allUsers.filter(u => u.createdAt && u.createdAt > last24h).length,
    activeJobs: activeJobs.filter(j => j.status === "open" || j.status === "in_progress").length,
    jobsInProgress: activeJobs.filter(j => j.status === "in_progress").length,
    paymentsLastHour: recentTx.filter(t => t.type === "credit").length,
    withdrawalsPending: pendingWithdrawals.length,
    withdrawalsPendingAmount: pendingWithdrawals.reduce((s, t) => s + t.amount, 0),
    newUsersToday: allUsers.filter(u => u.createdAt && u.createdAt > new Date(new Date().setHours(0, 0, 0, 0))).length,
  });
});

export default router;
