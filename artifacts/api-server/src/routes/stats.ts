import { Router } from "express";
import { db, usersTable, jobsTable, applicationsTable, transactionsTable, walletsTable, ratingsTable, stateRepresentativesTable } from "@workspace/db";
import { eq, sql, and, desc } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";
import { calculateLevel, getLevelProgress, LEVEL_FEE, LEVEL_LABELS } from "../lib/ecosystem";

const router = Router();

// GET /stats/platform
router.get("/stats/platform", async (req, res) => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [freelancers, companies, allJobs, allTransactions, repsResult] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.role, "freelancer")),
    db.select().from(usersTable).where(eq(usersTable.role, "company")),
    db.select().from(jobsTable),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "credit")),
    db.select({ id: stateRepresentativesTable.id }).from(stateRepresentativesTable),
  ]);

  const activeJobs = allJobs.filter(j => j.status === "open" || j.status === "in_progress").length;
  const completedJobs = allJobs.filter(j => j.status === "completed").length;
  const jobsInProgress = allJobs.filter(j => j.status === "in_progress").length;
  const jobsToday = allJobs.filter(j => j.createdAt?.toISOString().slice(0, 10) === todayStr).length;
  const totalTransacted = allTransactions.reduce((s, t) => s + t.amount, 0);

  const allUsers = [...freelancers, ...companies];
  const activeUsers24h = allUsers.filter(u => u.createdAt && u.createdAt.getTime() > yesterday.getTime()).length;

  const categoryCounts = new Map<string, number>();
  allJobs.forEach(j => categoryCounts.set(j.category, (categoryCounts.get(j.category) ?? 0) + 1));
  const jobsByCategory = Array.from(categoryCounts.entries()).map(([category, count]) => ({ category, count }));

  const recentActivity = [
    ...allJobs.slice(-3).map(j => ({ type: "job_created", description: `Extra criado: ${j.title}`, timestamp: j.createdAt?.toISOString() ?? "" })),
    ...freelancers.slice(-3).map(u => ({ type: "user_joined", description: `Novo extra: ${u.name}`, timestamp: u.createdAt?.toISOString() ?? "" })),
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 10);

  res.json({
    totalFreelancers: freelancers.length,
    totalCompanies: companies.length,
    totalJobs: allJobs.length,
    activeJobs,
    completedJobs,
    totalTransacted,
    activeUsers24h,
    jobsInProgress,
    jobsToday,
    jobsByCategory,
    recentActivity,
    activeRepresentatives: repsResult.length,
  });
});

// GET /stats/activity-feed
router.get("/stats/activity-feed", async (req, res) => {
  const [recentJobs, recentUsers, recentApps, recentTxs] = await Promise.all([
    db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt)).limit(8),
    db.select().from(usersTable).where(eq(usersTable.role, "freelancer")).orderBy(desc(usersTable.createdAt)).limit(5),
    db.select().from(applicationsTable).orderBy(desc(applicationsTable.appliedAt)).limit(8),
    db.select().from(transactionsTable).where(eq(transactionsTable.type, "credit")).orderBy(desc(transactionsTable.createdAt)).limit(5),
  ]);

  type FeedItem = { id: string; type: string; actorName: string; description: string; timestamp: string; icon: string };
  const items: FeedItem[] = [];

  recentJobs.forEach(j => {
    items.push({ id: `job-${j.id}`, type: "job_created", actorName: "Empresa", description: `Extra publicado: ${j.title}`, timestamp: j.createdAt?.toISOString() ?? "", icon: "briefcase" });
    if (j.status === "completed") items.push({ id: `job-done-${j.id}`, type: "job_completed", actorName: "Plataforma", description: `Extra concluído: ${j.title}`, timestamp: j.createdAt?.toISOString() ?? "", icon: "check-circle" });
  });
  recentUsers.forEach(u => { items.push({ id: `user-${u.id}`, type: "user_joined", actorName: u.name, description: `${u.name} entrou na plataforma`, timestamp: u.createdAt?.toISOString() ?? "", icon: "user" }); });
  recentApps.forEach(a => { items.push({ id: `app-${a.id}`, type: "application_submitted", actorName: "Profissional", description: `Nova candidatura enviada`, timestamp: a.appliedAt?.toISOString() ?? "", icon: "file-text" }); });
  recentTxs.forEach(t => { items.push({ id: `tx-${t.id}`, type: "payment_released", actorName: "Sistema", description: `Pagamento de R$ ${(t.amount / 100).toFixed(2)} processado`, timestamp: t.createdAt?.toISOString() ?? "", icon: "dollar-sign" }); });

  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  res.json(items.slice(0, 20));
});

// GET /stats/company/:id
router.get("/stats/company/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [companyUser] = await db.select().from(usersTable).where(eq(usersTable.id, id));
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

  res.json({ totalJobsPosted: jobs.length, activeJobs, totalSpent, averageRating: companyUser?.reputationScore ?? 0, totalWorkers, jobsByMonth });
});

// GET /stats/freelancer/:id
router.get("/stats/freelancer/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, id));
  if (!wallet) wallet = { id: 0, userId: id, walletType: "freelancer", balance: 0, reservedBalance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0, totalFeesPaid: 0, totalSpent: 0 } as any;

  const allApps = await db.select().from(applicationsTable).where(eq(applicationsTable.freelancerId, id));
  const completedAppsCount = allApps.filter(a => a.status === "completed").length;
  const cancelledAppsCount = allApps.filter(a => a.status === "cancelled").length;
  const completionRate = allApps.length > 0 ? +(completedAppsCount / allApps.length * 100).toFixed(1) : 0;
  const cancellationRate = allApps.length > 0 ? +(cancelledAppsCount / allApps.length * 100).toFixed(1) : 0;

  const ratings = wallet.id > 0
    ? await db.select().from(ratingsTable).where(eq(ratingsTable.ratedId, id))
    : [];
  const ratingAvg = ratings.length > 0 ? +(ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(2) : 0;

  const levelProgress = getLevelProgress(user.completedJobs, user.reputationScore ?? 0, user.level);

  const currentFee = LEVEL_FEE[user.level] ?? 0.18;
  const nextLevelKey = levelProgress.nextLevel;
  const nextLevelFee = nextLevelKey ? (LEVEL_FEE[nextLevelKey] ?? currentFee) : currentFee;
  const feeReduction = +(currentFee - nextLevelFee).toFixed(2);

  const creditTxs = wallet.id > 0
    ? await db.select().from(transactionsTable)
        .where(and(eq(transactionsTable.walletId, wallet.id), eq(transactionsTable.type, "credit")))
    : [];

  const earnsByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toISOString().slice(0, 7);
    const amount = creditTxs.filter(t => t.createdAt?.toISOString().slice(0, 7) === monthStr).reduce((s, t) => s + t.amount, 0);
    return { month: monthStr, amount };
  });

  const badges: string[] = [];
  if (user.completedJobs >= 1) badges.push("Primeira Missão");
  if (user.completedJobs >= 5) badges.push("Veterano");
  if (user.completedJobs >= 10) badges.push("Expert");
  if (user.reputationScore >= 4.5) badges.push("Top Avaliado");
  if (user.isVerified) badges.push("Verificado");

  const reputationBreakdown = {
    overall: user.reputationScore,
    ratingAvg,
    completionRate,
    cancellationRate,
    responseRate: user.responseRate ?? 0,
    totalRatings: ratings.length,
  };

  res.json({
    completedJobs: user.completedJobs,
    totalEarned: wallet.totalEarned,
    totalFeesPaid: wallet.totalFeesPaid,
    pendingEarnings: wallet.pendingBalance,
    averageRating: user.reputationScore,
    level: user.level,
    levelLabel: LEVEL_LABELS[user.level],
    currentFee: currentFee * 100,
    nextLevelFee: nextLevelFee * 100,
    feeReductionAtNextLevel: feeReduction * 100,
    ...levelProgress,
    reputationBreakdown,
    earnsByMonth,
    badges,
  });
});

export default router;
