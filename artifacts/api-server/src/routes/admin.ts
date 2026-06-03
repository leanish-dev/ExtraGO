import { Router } from "express";
import { db, usersTable, jobsTable, transactionsTable, walletsTable, notificationsTable, applicationsTable, depositRequestsTable, stateRepresentativesTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAdmin, formatUser } from "../lib/auth";
import { AdminListUsersQueryParams, AdminListJobsQueryParams, AdminListWithdrawalsQueryParams } from "@workspace/api-zod";
import { ensureWallet } from "../lib/ecosystem";

const router = Router();

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req, res) => {
  const parsed = AdminListUsersQueryParams.safeParse(req.query);
  const { role, search } = parsed.data ?? {};

  let users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(200);

  if (role) users = users.filter(u => u.role === role);
  if (search) users = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  res.json(users.map(formatUser));
});

// POST /admin/users/:id/ban
router.post("/admin/users/:id/ban", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(usersTable).set({ isBanned: !user.isBanned }).where(eq(usersTable.id, id));
  res.json({ message: user.isBanned ? "User unbanned" : "User banned" });
});

// POST /admin/users/:id/verify
router.post("/admin/users/:id/verify", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.update(usersTable).set({ isVerified: true }).where(eq(usersTable.id, id));
  await db.insert(notificationsTable).values({
    userId: id, type: "verified", title: "Perfil verificado!",
    message: "Seu perfil foi verificado pela equipe extraGO", isRead: false,
  }).catch(() => {});
  res.json({ message: "User verified" });
});

// POST /admin/users/:id/set-role
router.post("/admin/users/:id/set-role", requireAdmin, async (req, res) => {
  const requestingUser = (req as any).user;
  if (requestingUser.adminRole !== "super_admin") {
    res.status(403).json({ error: "Only super admins can change roles" }); return;
  }
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const { role, adminRole } = req.body;
  const validRoles = ["company", "freelancer", "admin"];
  const validAdminRoles = ["super_admin", "admin", "finance_admin", "operations_admin", "support_admin", "regional_manager", "state_representative", null];

  if (role && !validRoles.includes(role)) { res.status(400).json({ error: "Invalid role" }); return; }
  if (adminRole !== undefined && !validAdminRoles.includes(adminRole)) { res.status(400).json({ error: "Invalid admin role" }); return; }

  const updates: Record<string, any> = {};
  if (role) updates.role = role;
  if (adminRole !== undefined) updates.adminRole = adminRole;
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "No updates provided" }); return; }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ message: "Role updated", user: formatUser(updated) });
});

// GET /admin/jobs
router.get("/admin/jobs", requireAdmin, async (req, res) => {
  const parsed = AdminListJobsQueryParams.safeParse(req.query);
  const { status } = parsed.data ?? {};

  let jobs = await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(200);
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

// DELETE /admin/jobs/:id
router.delete("/admin/jobs/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.json({ message: "Job deleted" });
});

// GET /admin/withdrawals
router.get("/admin/withdrawals", requireAdmin, async (req, res) => {
  const parsed = AdminListWithdrawalsQueryParams.safeParse(req.query);
  const { status } = parsed.data ?? {};

  let transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.type, "withdrawal"))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(200);

  if (status) transactions = transactions.filter(t => t.status === status);

  const walletIds = [...new Set(transactions.map(t => t.walletId))];
  const wallets = walletIds.length > 0
    ? await db.select().from(walletsTable).where(sql`${walletsTable.id} = ANY(ARRAY[${sql.join(walletIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const walletMap = new Map(wallets.map(w => [w.id, w]));
  const userIds = [...new Set(wallets.map(w => w.userId))];
  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(transactions.map(t => {
    const wallet = walletMap.get(t.walletId);
    const user = wallet ? userMap.get(wallet.userId) : undefined;
    return {
      id: t.id, walletId: t.walletId, type: t.type,
      amount: t.amount, description: t.description, status: t.status,
      pixKey: t.pixKey ?? null, createdAt: t.createdAt?.toISOString(),
      userName: user?.name ?? null, userEmail: user?.email ?? null,
    };
  }));
});

// POST /admin/withdrawals/:id/approve
router.post("/admin/withdrawals/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(transactionsTable).set({ status: "completed" }).where(eq(transactionsTable.id, id));
  res.json({ message: "Withdrawal approved" });
});

// POST /admin/withdrawals/:id/reject
router.post("/admin/withdrawals/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id));
  if (!tx) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(transactionsTable).set({ status: "rejected" }).where(eq(transactionsTable.id, id));

  // Refund balance to wallet
  await db.update(walletsTable).set({
    balance: sql`${walletsTable.balance} + ${tx.amount}`,
    totalWithdrawn: sql`GREATEST(${walletsTable.totalWithdrawn} - ${tx.amount}, 0)`,
  }).where(eq(walletsTable.id, tx.walletId));

  res.json({ message: "Withdrawal rejected and balance refunded" });
});

// GET /admin/deposit-requests
router.get("/admin/deposit-requests", requireAdmin, async (req, res) => {
  const { status } = req.query;

  let deposits = await db.select().from(depositRequestsTable)
    .orderBy(desc(depositRequestsTable.createdAt))
    .limit(200);

  if (status) deposits = deposits.filter(d => d.status === status);

  const userIds = [...new Set(deposits.map(d => d.userId))];
  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(deposits.map(d => ({
    id: d.id, walletId: d.walletId, userId: d.userId,
    amount: d.amount, paymentMethod: d.paymentMethod,
    pixKey: d.pixKey ?? null, status: d.status,
    adminNote: d.adminNote ?? null,
    userName: userMap.get(d.userId)?.name ?? null,
    userEmail: userMap.get(d.userId)?.email ?? null,
    companyName: userMap.get(d.userId)?.companyName ?? null,
    createdAt: d.createdAt?.toISOString(),
    updatedAt: d.updatedAt?.toISOString(),
  })));
});

// POST /admin/deposit-requests/:id/approve
router.post("/admin/deposit-requests/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const adminUser = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [deposit] = await db.select().from(depositRequestsTable).where(eq(depositRequestsTable.id, id));
  if (!deposit) { res.status(404).json({ error: "Not found" }); return; }
  if (deposit.status !== "pending") { res.status(400).json({ error: "Deposit not in pending state" }); return; }

  const { adminNote } = req.body;

  await db.update(depositRequestsTable).set({
    status: "credited",
    adminNote: adminNote ?? null,
    approvedById: adminUser.id,
    updatedAt: new Date(),
  }).where(eq(depositRequestsTable.id, id));

  // Credit the company wallet
  await db.update(walletsTable).set({
    balance: sql`${walletsTable.balance} + ${deposit.amount}`,
    totalEarned: sql`${walletsTable.totalEarned} + ${deposit.amount}`,
  }).where(eq(walletsTable.id, deposit.walletId));

  // Update the pending transaction to completed
  await db.update(transactionsTable).set({ status: "completed" })
    .where(eq(transactionsTable.referenceId, `deposit:${id}`))
    .catch(() => {});

  // Notify user
  await db.insert(notificationsTable).values({
    userId: deposit.userId,
    type: "deposit_confirmed",
    title: "✅ Depósito confirmado!",
    message: `R$${(deposit.amount / 100).toFixed(2)} creditado na sua carteira.`,
    isRead: false,
  }).catch(() => {});

  res.json({ message: "Deposit approved and credited" });
});

// POST /admin/deposit-requests/:id/reject
router.post("/admin/deposit-requests/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [deposit] = await db.select().from(depositRequestsTable).where(eq(depositRequestsTable.id, id));
  if (!deposit) { res.status(404).json({ error: "Not found" }); return; }
  if (deposit.status !== "pending") { res.status(400).json({ error: "Deposit not in pending state" }); return; }

  const { adminNote } = req.body;

  await db.update(depositRequestsTable).set({
    status: "rejected",
    adminNote: adminNote ?? null,
    updatedAt: new Date(),
  }).where(eq(depositRequestsTable.id, id));

  await db.update(transactionsTable).set({ status: "rejected" })
    .where(eq(transactionsTable.referenceId, `deposit:${id}`))
    .catch(() => {});

  await db.insert(notificationsTable).values({
    userId: deposit.userId,
    type: "deposit_rejected",
    title: "Depósito não confirmado",
    message: `Sua solicitação de depósito de R$${(deposit.amount / 100).toFixed(2)} não foi aprovada.${adminNote ? ` Motivo: ${adminNote}` : ""}`,
    isRead: false,
  }).catch(() => {});

  res.json({ message: "Deposit rejected" });
});

// GET /admin/representatives
router.get("/admin/representatives", requireAdmin, async (req, res) => {
  const reps = await db.select().from(stateRepresentativesTable).orderBy(stateRepresentativesTable.stateCode);
  const userIds = [...new Set(reps.map(r => r.userId))];
  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(reps.map(r => {
    const u = userMap.get(r.userId);
    return {
      id: r.id,
      userId: r.userId,
      state: r.stateCode,
      commissionRate: r.commissionRate,
      isActive: true,
      userName: u?.name ?? null,
      userEmail: u?.email ?? null,
      userAvatarUrl: u?.avatarUrl ?? null,
      createdAt: r.createdAt?.toISOString(),
    };
  }));
});

// POST /admin/representatives
router.post("/admin/representatives", requireAdmin, async (req, res) => {
  const { userId, commissionRate } = req.body;
  const stateCode = req.body.state ?? req.body.stateCode;
  if (!userId || !stateCode) { res.status(400).json({ error: "userId and state required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [rep] = await db.insert(stateRepresentativesTable).values({
    userId,
    stateCode: stateCode.toUpperCase().slice(0, 2),
    commissionRate: commissionRate ?? 0.02,
  }).returning();

  await ensureWallet(userId, "representative");

  res.status(201).json({
    id: rep.id,
    userId: rep.userId,
    state: rep.stateCode,
    commissionRate: rep.commissionRate,
    isActive: true,
    userName: user.name ?? null,
    userEmail: user.email ?? null,
    userAvatarUrl: user.avatarUrl ?? null,
    createdAt: rep.createdAt?.toISOString(),
  });
});

// DELETE /admin/representatives/:id
router.delete("/admin/representatives/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(stateRepresentativesTable).where(eq(stateRepresentativesTable.id, id));
  res.json({ message: "Representative removed" });
});

// GET /admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
  const [allUsers, allJobs, creditTransactions, pendingWithdrawals] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(jobsTable),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "credit")),
    db.select().from(transactionsTable).where(
      sql`${transactionsTable.type} = 'withdrawal' AND ${transactionsTable.status} = 'pending'`
    ),
  ]);

  const totalRevenue = creditTransactions.reduce((s, t) => s + t.amount, 0);
  const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const usersThisMonth = allUsers.filter(u => u.createdAt && u.createdAt > oneMonthAgo).length;

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toISOString().slice(0, 7);
    const amount = creditTransactions.filter(t => t.createdAt?.toISOString().slice(0, 7) === monthStr).reduce((s, t) => s + t.amount, 0);
    return { month: monthStr, amount };
  });

  const topFreelancers = allUsers.filter(u => u.role === "freelancer").sort((a, b) => b.completedJobs - a.completedJobs).slice(0, 5).map(formatUser);
  const freelancerCount = allUsers.filter(u => u.role === "freelancer").length;
  const companyCount = allUsers.filter(u => u.role === "company").length;
  const bannedCount = allUsers.filter(u => u.isBanned).length;
  const verifiedCount = allUsers.filter(u => u.isVerified).length;
  const jobsByStatus = { open: allJobs.filter(j => j.status === "open").length, in_progress: allJobs.filter(j => j.status === "in_progress").length, completed: allJobs.filter(j => j.status === "completed").length, cancelled: allJobs.filter(j => j.status === "cancelled").length };

  res.json({ totalUsers: allUsers.length, freelancerCount, companyCount, bannedCount, verifiedCount, totalJobs: allJobs.length, jobsByStatus, totalRevenue, pendingWithdrawals: pendingWithdrawals.length, pendingVerifications: allUsers.filter(u => !u.isVerified && u.role === "freelancer").length, usersThisMonth, revenueByMonth, topFreelancers });
});

// GET /admin/analytics — real aggregated data by state
router.get("/admin/analytics", requireAdmin, async (req, res) => {
  const [allUsers, allJobs, allTransactions, allApps, allWallets] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(jobsTable),
    db.select().from(transactionsTable),
    db.select().from(applicationsTable),
    db.select().from(walletsTable),
  ]);

  const growthByMonth = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    const monthStr = d.toISOString().slice(0, 7);
    const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const label = months[d.getMonth()];
    const newFreelancers = allUsers.filter(u => u.role === "freelancer" && u.createdAt?.toISOString().slice(0, 7) === monthStr).length;
    const newCompanies = allUsers.filter(u => u.role === "company" && u.createdAt?.toISOString().slice(0, 7) === monthStr).length;
    const revenue = allTransactions.filter(t => t.type === "credit" && t.createdAt?.toISOString().slice(0, 7) === monthStr).reduce((s, t) => s + t.amount, 0);
    const jobs = allJobs.filter(j => j.createdAt?.toISOString().slice(0, 7) === monthStr).length;
    return { month: monthStr, label, newFreelancers, newCompanies, revenue, jobs };
  });

  const freelancers = allUsers.filter(u => u.role === "freelancer");
  const levelDistribution = { bronze: freelancers.filter(u => u.level === "bronze").length, silver: freelancers.filter(u => u.level === "silver").length, gold: freelancers.filter(u => u.level === "gold").length, elite: freelancers.filter(u => u.level === "elite").length };

  const walletMap = new Map(allWallets.map(w => [w.userId, w]));
  const topEarners = allUsers.filter(u => u.role === "freelancer").map(u => ({ ...formatUser(u), totalEarned: walletMap.get(u.id)?.totalEarned ?? 0 })).sort((a, b) => b.totalEarned - a.totalEarned).slice(0, 10);

  const companyJobCount = new Map<number, number>();
  allJobs.forEach(j => companyJobCount.set(j.companyId, (companyJobCount.get(j.companyId) ?? 0) + 1));
  const topCompanies = allUsers.filter(u => u.role === "company").map(u => ({ ...formatUser(u), jobsPosted: companyJobCount.get(u.id) ?? 0 })).sort((a, b) => b.jobsPosted - a.jobsPosted).slice(0, 5);

  const totalApps = allApps.length;
  const approvedApps = allApps.filter(a => ["approved", "completed", "counter_accepted"].includes(a.status)).length;
  const completedApps = allApps.filter(a => a.status === "completed").length;
  const conversionRate = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
  const completionRate = approvedApps > 0 ? Math.round((completedApps / approvedApps) * 100) : 0;

  const totalGross = allTransactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalCommissions = allTransactions.filter(t => t.type === "commission").reduce((s, t) => s + t.amount, 0);
  const totalPlatformFees = allTransactions.filter(t => t.type === "platform_fee").reduce((s, t) => s + t.amount, 0);

  // State-level aggregation from serviceRegions
  const stateData = new Map<string, { users: number; freelancers: number; companies: number; revenue: number; jobs: number }>();
  const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
  BR_STATES.forEach(s => stateData.set(s, { users: 0, freelancers: 0, companies: 0, revenue: 0, jobs: 0 }));

  allUsers.forEach(u => {
    (u.serviceRegions ?? []).forEach((region: string) => {
      const code = region.toUpperCase().slice(0, 2);
      if (stateData.has(code)) {
        const entry = stateData.get(code)!;
        entry.users += 1;
        if (u.role === "freelancer") entry.freelancers += 1;
        if (u.role === "company") entry.companies += 1;
        const wallet = walletMap.get(u.id);
        if (wallet) entry.revenue += wallet.totalEarned;
      }
    });
  });

  allJobs.forEach(j => {
    const state = (j.location ?? "").toUpperCase().slice(0, 2);
    if (stateData.has(state)) stateData.get(state)!.jobs += 1;
  });

  // byState as array matching OpenAPI StateStats schema
  const byState = Array.from(stateData.entries()).map(([state, data]) => ({
    state,
    totalFreelancers: data.freelancers,
    totalJobs: data.jobs,
    totalRevenue: data.revenue,
    representative: null as string | null,
  }));

  // Level distribution as array matching schema
  const levelDistributionArray = Object.entries(levelDistribution).map(([level, count]) => {
    const levelFreelancers = freelancers.filter(u => u.level === level);
    const avgReputation = levelFreelancers.length > 0
      ? +(levelFreelancers.reduce((s, u) => s + (u.reputationScore ?? 0), 0) / levelFreelancers.length).toFixed(2)
      : 0;
    return { level, count, avgReputation };
  });

  // Revenue by month as array matching MonthAmount schema
  const revenueByMonth = growthByMonth.map(g => ({ month: g.month, amount: g.revenue }));

  // Fees by level
  const feesByLevel = ["bronze", "silver", "gold", "elite"].map(level => {
    const feeRate = { bronze: 0.18, silver: 0.16, gold: 0.14, elite: 0.10 }[level] ?? 0;
    const levelFreelancerCount = freelancers.filter(u => u.level === level).length;
    const totalFees = Math.round(totalGross * feeRate * (levelFreelancerCount / Math.max(freelancers.length, 1)));
    return { level, totalFees, avgFee: feeRate, count: levelFreelancerCount };
  });

  res.json({ byState, levelDistribution: levelDistributionArray, revenueByMonth, feesByLevel, growthByMonth, topEarners, topCompanies, conversionRate, completionRate, totalApplications: totalApps, completedJobs: completedApps, totalGross, totalCommissions, totalPlatformFees, totalFreelancers: freelancers.length, totalCompanies: allUsers.filter(u => u.role === "company").length });
});

// GET /admin/ops
router.get("/admin/ops", requireAdmin, async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [allUsers, openJobs, inProgressJobs, todayTx, pendingWith, allApps, pendingDeposits] = await Promise.all([
    db.select({ id: usersTable.id, createdAt: usersTable.createdAt, role: usersTable.role }).from(usersTable),
    db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.status, "open")),
    db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.status, "in_progress")),
    db.select().from(transactionsTable).where(sql`${transactionsTable.createdAt} >= ${startOfDay}`),
    db.select().from(transactionsTable).where(sql`${transactionsTable.type} = 'withdrawal' AND ${transactionsTable.status} = 'pending'`),
    db.select({ id: applicationsTable.id, status: applicationsTable.status, appliedAt: applicationsTable.appliedAt }).from(applicationsTable).where(sql`${applicationsTable.appliedAt} >= ${startOfDay}`),
    db.select().from(depositRequestsTable).where(eq(depositRequestsTable.status, "pending")),
  ]);

  const todayPayments = todayTx.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const todayWithdrawals = todayTx.filter(t => t.type === "withdrawal").reduce((s, t) => s + t.amount, 0);
  const newUsersToday = allUsers.filter(u => u.createdAt && u.createdAt >= startOfDay).length;
  const pendingWithdrawalsAmount = pendingWith.reduce((s, t) => s + t.amount, 0);
  const pendingDepositsAmount = pendingDeposits.reduce((s, d) => s + d.amount, 0);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeFreelancers24h = allUsers.filter(u => u.role === "freelancer" && u.createdAt && u.createdAt >= twentyFourHoursAgo).length;
  const activeCompanies24h = allUsers.filter(u => u.role === "company" && u.createdAt && u.createdAt >= twentyFourHoursAgo).length;

  const [platformWallet] = await db.select({ balance: walletsTable.balance }).from(walletsTable).where(eq(walletsTable.userId, 0));

  res.json({
    openJobs: openJobs.length,
    jobsInProgress: inProgressJobs.length,
    pendingApplications: allApps.length,
    pendingWithdrawals: pendingWith.length,
    pendingWithdrawalAmount: pendingWith.reduce((s, t) => s + t.amount, 0),
    pendingDeposits: pendingDeposits.length,
    pendingDepositAmount: pendingDeposits.reduce((s, d) => s + d.amount, 0),
    unreadNotifications: 0,
    platformWalletBalance: platformWallet?.balance ?? 0,
    activeFreelancers24h,
    activeCompanies24h,
  });
});

export default router;
