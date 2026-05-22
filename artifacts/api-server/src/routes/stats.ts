import { Router } from "express";
import { db, usersTable, jobsTable, applicationsTable, transactionsTable, walletsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";

const router = Router();

// GET /stats/platform
router.get("/stats/platform", async (req, res) => {
  const [freelancers, companies, allJobs, allTransactions] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.role, "freelancer")),
    db.select().from(usersTable).where(eq(usersTable.role, "company")),
    db.select().from(jobsTable),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "credit")),
  ]);

  const activeJobs = allJobs.filter(j => j.status === "open" || j.status === "in_progress").length;
  const completedJobs = allJobs.filter(j => j.status === "completed").length;
  const totalTransacted = allTransactions.reduce((s, t) => s + t.amount, 0);

  const categoryCounts = new Map<string, number>();
  allJobs.forEach(j => categoryCounts.set(j.category, (categoryCounts.get(j.category) ?? 0) + 1));
  const jobsByCategory = Array.from(categoryCounts.entries()).map(([category, count]) => ({ category, count }));

  const recentActivity = [
    ...allJobs.slice(-3).map(j => ({ type: "job_created", description: `Vaga criada: ${j.title}`, timestamp: j.createdAt?.toISOString() ?? "" })),
    ...freelancers.slice(-3).map(u => ({ type: "user_joined", description: `Novo extra: ${u.name}`, timestamp: u.createdAt?.toISOString() ?? "" })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10);

  res.json({
    totalFreelancers: freelancers.length,
    totalCompanies: companies.length,
    totalJobs: allJobs.length,
    activeJobs,
    completedJobs,
    totalTransacted,
    jobsByCategory,
    recentActivity,
  });
});

// GET /stats/company/:id
router.get("/stats/company/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const jobs = await db.select().from(jobsTable).where(eq(jobsTable.companyId, id));
  const activeJobs = jobs.filter(j => j.status === "open" || j.status === "in_progress").length;
  const totalSpent = jobs.reduce((s, j) => s + j.totalValue, 0);
  const totalWorkers = jobs.reduce((s, j) => s + j.workersApproved, 0);

  const monthMap = new Map<string, number>();
  jobs.forEach(j => {
    const month = j.createdAt?.toISOString().slice(0, 7) ?? "";
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
  });
  const jobsByMonth = Array.from(monthMap.entries()).map(([month, count]) => ({ month, count })).slice(-6);

  res.json({
    totalJobsPosted: jobs.length,
    activeJobs,
    totalSpent,
    averageRating: 4.5,
    totalWorkers,
    jobsByMonth,
  });
});

// GET /stats/freelancer/:id
router.get("/stats/freelancer/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, id));
  if (!wallet) wallet = { id: 0, userId: id, balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 };

  const levelMap: Record<string, { next: string; min: number; max: number }> = {
    bronze: { next: "GO Silver", min: 0, max: 5 },
    silver: { next: "GO Gold", min: 5, max: 15 },
    gold: { next: "GO Elite", min: 15, max: 30 },
    elite: { next: "GO Elite", min: 30, max: 30 },
  };
  const lvl = levelMap[user.level] ?? levelMap.bronze;
  const nextLevelProgress = Math.min(Math.round(((user.completedJobs - lvl.min) / (lvl.max - lvl.min)) * 100), 100);

  const badges: string[] = [];
  if (user.completedJobs >= 1) badges.push("Primeira Missão");
  if (user.completedJobs >= 5) badges.push("Veterano");
  if (user.completedJobs >= 10) badges.push("Expert");
  if (user.reputationScore >= 4.5) badges.push("Top Avaliado");
  if (user.isVerified) badges.push("Verificado");

  const earnsByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { month: d.toISOString().slice(0, 7), amount: Math.random() * 500 };
  });

  res.json({
    completedJobs: user.completedJobs,
    totalEarned: wallet.totalEarned,
    pendingEarnings: wallet.pendingBalance,
    averageRating: user.reputationScore,
    level: user.level,
    nextLevelProgress,
    earnsByMonth,
    badges,
  });
});

export default router;
