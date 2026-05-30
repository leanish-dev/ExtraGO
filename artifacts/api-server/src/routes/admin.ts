import { Router } from "express";
import { db, usersTable, jobsTable, transactionsTable, walletsTable, notificationsTable, applicationsTable } from "@workspace/db";
import { eq, sql, like, or } from "drizzle-orm";
import { requireAdmin, formatUser } from "../lib/auth";
import { AdminListUsersQueryParams, AdminListJobsQueryParams, AdminListWithdrawalsQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req, res) => {
  const parsed = AdminListUsersQueryParams.safeParse(req.query);
  const { role, search } = parsed.data ?? {};

  let users = await db.select().from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`).limit(200);

  if (role) users = users.filter(u => u.role === role);
  if (search) users = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  res.json(users.map(formatUser));
});

// POST /admin/users/:id/ban
router.post("/admin/users/:id/ban", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(usersTable).set({ isBanned: !user.isBanned }).where(eq(usersTable.id, id));
  res.json({ message: user.isBanned ? "User unbanned" : "User banned" });
});

// POST /admin/users/:id/verify
router.post("/admin/users/:id/verify", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.update(usersTable).set({ isVerified: true }).where(eq(usersTable.id, id));

  // Notify user
  await db.insert(notificationsTable).values({
    userId: id,
    type: "verified",
    title: "Perfil verificado!",
    message: "Seu perfil foi verificado pela equipe extraGO",
    isRead: false,
  }).catch(() => {});

  res.json({ message: "User verified" });
});

// GET /admin/jobs
router.get("/admin/jobs", requireAdmin, async (req, res) => {
  const parsed = AdminListJobsQueryParams.safeParse(req.query);
  const { status } = parsed.data ?? {};

  let jobs = await db.select().from(jobsTable).orderBy(sql`${jobsTable.createdAt} DESC`).limit(200);
  if (status) jobs = jobs.filter(j => j.status === status);

  const companyIds = [...new Set(jobs.map(j => j.companyId))];
  const companies = companyIds.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(companyIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
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

// GET /admin/withdrawals
router.get("/admin/withdrawals", requireAdmin, async (req, res) => {
  const parsed = AdminListWithdrawalsQueryParams.safeParse(req.query);
  const { status } = parsed.data ?? {};

  let transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.type, "withdrawal"))
    .orderBy(sql`${transactionsTable.createdAt} DESC`)
    .limit(200);

  if (status) transactions = transactions.filter(t => t.status === status);

  res.json(transactions.map(t => ({
    id: t.id, walletId: t.walletId, type: t.type,
    amount: t.amount, description: t.description, status: t.status,
    pixKey: t.pixKey ?? null, createdAt: t.createdAt?.toISOString(),
  })));
});

// POST /admin/withdrawals/:id/approve
router.post("/admin/withdrawals/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.update(transactionsTable).set({ status: "completed" }).where(eq(transactionsTable.id, id));
  res.json({ message: "Withdrawal approved" });
});

// GET /admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [allUsers, allJobs, creditTransactions, pendingWithdrawals, pendingVerifications] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(jobsTable),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "credit")),
    db.select().from(transactionsTable).where(
      sql`${transactionsTable.type} = 'withdrawal' AND ${transactionsTable.status} = 'pending'`
    ),
    db.select().from(usersTable).where(eq(usersTable.isVerified, false)),
  ]);

  const totalRevenue = creditTransactions.reduce((s, t) => s + t.amount, 0);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const usersThisMonth = allUsers.filter(u => u.createdAt && u.createdAt > oneMonthAgo).length;

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toISOString().slice(0, 7);
    const amount = creditTransactions
      .filter(t => t.createdAt?.toISOString().slice(0, 7) === monthStr)
      .reduce((s, t) => s + t.amount, 0);
    return { month: monthStr, amount };
  });

  const topFreelancers = allUsers
    .filter(u => u.role === "freelancer")
    .sort((a, b) => b.completedJobs - a.completedJobs)
    .slice(0, 5)
    .map(formatUser);

  const freelancerCount = allUsers.filter(u => u.role === "freelancer").length;
  const companyCount = allUsers.filter(u => u.role === "company").length;
  const bannedCount = allUsers.filter(u => u.isBanned).length;
  const verifiedCount = allUsers.filter(u => u.isVerified).length;

  const jobsByStatus = {
    open: allJobs.filter(j => j.status === "open").length,
    in_progress: allJobs.filter(j => j.status === "in_progress").length,
    completed: allJobs.filter(j => j.status === "completed").length,
    cancelled: allJobs.filter(j => j.status === "cancelled").length,
  };

  res.json({
    totalUsers: allUsers.length,
    freelancerCount,
    companyCount,
    bannedCount,
    verifiedCount,
    totalJobs: allJobs.length,
    jobsByStatus,
    totalRevenue,
    pendingWithdrawals: pendingWithdrawals.length,
    pendingVerifications: pendingVerifications.filter(u => u.role === "freelancer").length,
    usersThisMonth,
    revenueByMonth,
    topFreelancers,
  });
});

// DELETE /admin/jobs/:id
router.delete("/admin/jobs/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.json({ message: "Job deleted" });
});

// POST /admin/users/:id/set-role — set or remove admin sub-role
router.post("/admin/users/:id/set-role", requireAdmin, async (req, res) => {
  const requestingUser = (req as any).user;
  if (requestingUser.adminRole !== "super_admin") {
    res.status(403).json({ error: "Only super admins can change roles" });
    return;
  }

  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const { role, adminRole } = req.body;
  const validRoles = ["company", "freelancer", "admin"];
  const validAdminRoles = ["super_admin", "admin", "finance_admin", "operations_admin", "support_admin", "regional_manager", "state_representative", null];

  if (role && !validRoles.includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  if (adminRole !== undefined && !validAdminRoles.includes(adminRole)) {
    res.status(400).json({ error: "Invalid admin role" });
    return;
  }

  const updates: Record<string, any> = {};
  if (role) updates.role = role;
  if (adminRole !== undefined) updates.adminRole = adminRole;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No updates provided" });
    return;
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ message: "Role updated", user: formatUser(updated) });
});

// POST /admin/withdrawals/:id/reject
router.post("/admin/withdrawals/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(transactionsTable).set({ status: "rejected" }).where(eq(transactionsTable.id, id));
  res.json({ message: "Withdrawal rejected" });
});

// GET /admin/analytics — extended analytics for the analytics dashboard
router.get("/admin/analytics", requireAdmin, async (req, res) => {
  const [allUsers, allJobs, allTransactions, allApps, allWallets] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(jobsTable),
    db.select().from(transactionsTable),
    db.select().from(applicationsTable),
    db.select().from(walletsTable),
  ]);

  // Monthly growth (last 12 months)
  const growthByMonth = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    const monthStr = d.toISOString().slice(0, 7);
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const label = months[d.getMonth()];
    const newFreelancers = allUsers.filter(u => u.role === "freelancer" && u.createdAt?.toISOString().slice(0, 7) === monthStr).length;
    const newCompanies = allUsers.filter(u => u.role === "company" && u.createdAt?.toISOString().slice(0, 7) === monthStr).length;
    const revenue = allTransactions.filter(t => t.type === "credit" && t.createdAt?.toISOString().slice(0, 7) === monthStr).reduce((s, t) => s + t.amount, 0);
    const jobs = allJobs.filter(j => j.createdAt?.toISOString().slice(0, 7) === monthStr).length;
    return { month: monthStr, label, newFreelancers, newCompanies, revenue, jobs };
  });

  // Level distribution
  const freelancers = allUsers.filter(u => u.role === "freelancer");
  const levelDistribution = {
    bronze: freelancers.filter(u => u.level === "bronze").length,
    silver: freelancers.filter(u => u.level === "silver").length,
    gold: freelancers.filter(u => u.level === "gold").length,
    elite: freelancers.filter(u => u.level === "elite").length,
  };

  // Top earners (by wallet totalEarned)
  const walletMap = new Map(allWallets.map(w => [w.userId, w]));
  const topEarners = allUsers
    .filter(u => u.role === "freelancer")
    .map(u => ({ ...formatUser(u), totalEarned: walletMap.get(u.id)?.totalEarned ?? 0 }))
    .sort((a, b) => b.totalEarned - a.totalEarned)
    .slice(0, 10);

  // Top companies (by jobs posted)
  const companyJobCount = new Map<number, number>();
  allJobs.forEach(j => companyJobCount.set(j.companyId, (companyJobCount.get(j.companyId) ?? 0) + 1));
  const topCompanies = allUsers
    .filter(u => u.role === "company")
    .map(u => ({ ...formatUser(u), jobsPosted: companyJobCount.get(u.id) ?? 0 }))
    .sort((a, b) => b.jobsPosted - a.jobsPosted)
    .slice(0, 5);

  // Conversion & completion rates
  const totalApps = allApps.length;
  const approvedApps = allApps.filter(a => a.status === "approved" || a.status === "completed").length;
  const completedApps = allApps.filter(a => a.status === "completed").length;
  const conversionRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
  const completionRate = approvedApps > 0 ? Math.round((completedApps / approvedApps) * 100) : 0;

  // Revenue breakdown
  const totalGross = allTransactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalCommissions = allTransactions.filter(t => t.type === "commission").reduce((s, t) => s + t.amount, 0);

  // State/region distribution
  const regionCounts: Record<string, number> = {};
  allUsers.forEach(u => {
    (u.serviceRegions ?? []).forEach((r: string) => {
      regionCounts[r] = (regionCounts[r] ?? 0) + 1;
    });
  });

  res.json({
    growthByMonth,
    levelDistribution,
    topEarners,
    topCompanies,
    conversionRate,
    completionRate,
    totalApplications: totalApps,
    completedJobs: completedApps,
    totalGross,
    totalCommissions,
    regionCounts,
    totalFreelancers: freelancers.length,
    totalCompanies: allUsers.filter(u => u.role === "company").length,
  });
});

// GET /admin/ops — live operational metrics, intended to be polled
router.get("/admin/ops", requireAdmin, async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [allUsers, openJobs, inProgressJobs, todayTx, pendingWith, allApps] = await Promise.all([
    db.select({ id: usersTable.id, createdAt: usersTable.createdAt, role: usersTable.role }).from(usersTable),
    db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.status, "open")),
    db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.status, "in_progress")),
    db.select().from(transactionsTable).where(sql`${transactionsTable.createdAt} >= ${startOfDay}`),
    db.select().from(transactionsTable).where(sql`${transactionsTable.type} = 'withdrawal' AND ${transactionsTable.status} = 'pending'`),
    db.select({ id: applicationsTable.id, status: applicationsTable.status, appliedAt: applicationsTable.appliedAt }).from(applicationsTable).where(sql`${applicationsTable.appliedAt} >= ${startOfDay}`),
  ]);

  const todayPayments = todayTx.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTx.filter(t => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const newUsersToday = allUsers.filter(u => u.createdAt && u.createdAt >= startOfDay).length;
  const pendingWithdrawalsAmount = pendingWith.reduce((s, t) => s + t.amount, 0);

  res.json({
    timestamp: now.toISOString(),
    totalUsers: allUsers.length,
    openJobs: openJobs.length,
    jobsInProgress: inProgressJobs.length,
    pendingWithdrawals: pendingWith.length,
    pendingWithdrawalsAmount,
    todayPayments,
    todayWithdrawals,
    newUsersToday,
    appsToday: allApps.length,
    approvedToday: allApps.filter(a => a.status === "approved").length,
  });
});

export default router;
