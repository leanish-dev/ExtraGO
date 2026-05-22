import { Router } from "express";
import { db, usersTable, jobsTable, transactionsTable, walletsTable, notificationsTable } from "@workspace/db";
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
  const [allUsers, allJobs, allTransactions, pendingWithdrawals, pendingVerifications] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(jobsTable),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "commission")),
    db.select().from(transactionsTable).where(eq(transactionsTable.status, "pending")),
    db.select().from(usersTable).where(eq(usersTable.isVerified, false)),
  ]);

  const totalRevenue = allTransactions.reduce((s, t) => s + t.amount, 0);
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const usersThisMonth = allUsers.filter(u => u.createdAt && u.createdAt > oneMonthAgo).length;

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toISOString().slice(0, 7), amount: Math.random() * 2000 + 500 };
  });

  const topFreelancers = allUsers
    .filter(u => u.role === "freelancer")
    .sort((a, b) => b.completedJobs - a.completedJobs)
    .slice(0, 5)
    .map(formatUser);

  res.json({
    totalUsers: allUsers.length,
    totalJobs: allJobs.length,
    totalRevenue,
    pendingWithdrawals: pendingWithdrawals.filter(t => t.type === "withdrawal").length,
    pendingVerifications: pendingVerifications.filter(u => u.role === "freelancer").length,
    usersThisMonth,
    revenueByMonth,
    topFreelancers,
  });
});

export default router;
