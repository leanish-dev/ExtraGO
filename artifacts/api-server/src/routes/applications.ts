import { Router } from "express";
import { db, applicationsTable, jobsTable, usersTable, walletsTable, transactionsTable, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";
import { ApplyToJobBody, ListApplicationsQueryParams } from "@workspace/api-zod";

const router = Router();

const PLATFORM_COMMISSION = 0.15;

function formatJob(job: any, company?: any) {
  return {
    id: job.id, title: job.title, description: job.description,
    category: job.category, location: job.location, date: job.date,
    startTime: job.startTime, endTime: job.endTime,
    workersNeeded: job.workersNeeded, workersApproved: job.workersApproved,
    hourlyRate: job.hourlyRate, totalValue: job.totalValue,
    status: job.status, companyId: job.companyId,
    companyName: company?.companyName ?? company?.name ?? null,
    companyAvatarUrl: company?.avatarUrl ?? null,
    createdAt: job.createdAt?.toISOString(),
  };
}

function formatApp(app: any, job?: any, freelancer?: any) {
  return {
    id: app.id,
    jobId: app.jobId,
    freelancerId: app.freelancerId,
    status: app.status,
    appliedAt: app.appliedAt?.toISOString(),
    job: job ?? undefined,
    freelancer: freelancer ? formatUser(freelancer) : undefined,
  };
}

// GET /applications
router.get("/applications", requireAuth, async (req, res) => {
  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  const { jobId, freelancerId, status } = parsed.data ?? {};

  let apps = await db.select().from(applicationsTable).orderBy(sql`${applicationsTable.appliedAt} DESC`).limit(100);

  if (jobId) apps = apps.filter(a => a.jobId === Number(jobId));
  if (freelancerId) apps = apps.filter(a => a.freelancerId === Number(freelancerId));
  if (status) apps = apps.filter(a => a.status === status);

  const jobIds = [...new Set(apps.map(a => a.jobId))];
  const freelancerIds = [...new Set(apps.map(a => a.freelancerId))];

  const jobs = jobIds.length > 0
    ? await db.select().from(jobsTable).where(sql`${jobsTable.id} = ANY(ARRAY[${sql.join(jobIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const freelancers = freelancerIds.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(freelancerIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const companies = jobs.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(jobs.map(j => sql`${j.companyId}`), sql`, `)}]::int[])`)
    : [];

  const jobMap = new Map(jobs.map(j => [j.id, j]));
  const freelancerMap = new Map(freelancers.map(f => [f.id, f]));
  const companyMap = new Map(companies.map(c => [c.id, c]));

  res.json(apps.map(a => {
    const job = jobMap.get(a.jobId);
    const company = job ? companyMap.get(job.companyId) : undefined;
    return formatApp(a, job ? formatJob(job, company) : undefined, freelancerMap.get(a.freelancerId));
  }));
});

// POST /applications
router.post("/applications", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "freelancer") {
    res.status(403).json({ error: "Only freelancers can apply" });
    return;
  }

  const parsed = ApplyToJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { jobId, message } = parsed.data;

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job || job.status !== "open") {
    res.status(400).json({ error: "Job not available" });
    return;
  }

  const [existing] = await db.select().from(applicationsTable)
    .where(and(eq(applicationsTable.jobId, jobId), eq(applicationsTable.freelancerId, user.id)));
  if (existing) {
    res.status(400).json({ error: "Already applied" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    jobId,
    freelancerId: user.id,
    message: message ?? null,
  }).returning();

  // Notify the company
  await db.insert(notificationsTable).values({
    userId: job.companyId,
    type: "new_application",
    title: "Nova candidatura",
    message: `${user.name} se candidatou para ${job.title}`,
    link: `/jobs/${job.id}`,
    isRead: false,
  }).catch(() => {});

  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.status(201).json(formatApp(app, formatJob(job, company), user));
});

// GET /applications/:id
router.get("/applications/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  const [freelancer] = await db.select().from(usersTable).where(eq(usersTable.id, app.freelancerId));
  const [company] = job ? await db.select().from(usersTable).where(eq(usersTable.id, job.companyId)) : [undefined];

  res.json(formatApp(app, job ? formatJob(job, company) : undefined, freelancer));
});

// POST /applications/:id/approve
router.post("/applications/:id/approve", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "approved" })
    .where(eq(applicationsTable.id, id))
    .returning();

  await db.update(jobsTable)
    .set({ workersApproved: sql`${jobsTable.workersApproved} + 1` })
    .where(eq(jobsTable.id, job.id));

  // Notify freelancer
  await db.insert(notificationsTable).values({
    userId: app.freelancerId,
    type: "application_approved",
    title: "Candidatura aprovada!",
    message: `Você foi aprovado para ${job.title}`,
    link: `/my-jobs`,
    isRead: false,
  }).catch(() => {});

  const [freelancer] = await db.select().from(usersTable).where(eq(usersTable.id, app.freelancerId));
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), freelancer));
});

// ── Level progression helper ──────────────────────────────────────────────────
function calculateLevel(completedJobs: number, rep: number): "bronze" | "silver" | "gold" | "elite" {
  if (completedJobs >= 300 && rep >= 4.8) return "elite";
  if (completedJobs >= 100 && rep >= 4.7) return "gold";
  if (completedJobs >= 20 && rep >= 4.5) return "silver";
  return "bronze";
}
const LEVEL_FEE: Record<string, number> = { bronze: 0.18, silver: 0.16, gold: 0.14, elite: 0.10 };
const LEVEL_LABELS: Record<string, string> = { bronze: "Iniciante", silver: "Júnior", gold: "Intermediário", elite: "Sênior" };

// POST /applications/:id/complete — marks app done, pays freelancer, runs level progression
router.post("/applications/:id/complete", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (app.status !== "approved") {
    res.status(400).json({ error: "Only approved applications can be completed" }); return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  // Mark application completed
  const [updated] = await db.update(applicationsTable)
    .set({ status: "completed" })
    .where(eq(applicationsTable.id, id))
    .returning();

  // Increment completedJobs on freelancer
  const [freelancer] = await db.update(usersTable)
    .set({ completedJobs: sql`${usersTable.completedJobs} + 1` })
    .where(eq(usersTable.id, app.freelancerId))
    .returning();

  // Auto level-up check
  if (freelancer) {
    const newLevel = calculateLevel(freelancer.completedJobs, freelancer.reputationScore ?? 0);
    if (newLevel !== freelancer.level) {
      await db.update(usersTable).set({ level: newLevel }).where(eq(usersTable.id, app.freelancerId));
      await db.insert(notificationsTable).values({
        userId: app.freelancerId,
        type: "level_up",
        title: "🎉 Você subiu de nível!",
        message: `Parabéns! Você agora é ${LEVEL_LABELS[newLevel]}. Taxa atualizada para ${(LEVEL_FEE[newLevel] * 100).toFixed(0)}%.`,
        isRead: false,
      }).catch(() => {});
    }

    // Credit freelancer wallet based on their current level fee
    if (job.totalValue && job.totalValue > 0) {
      const feeRate = LEVEL_FEE[freelancer.level as string] ?? 0.18;
      const earnings = Math.round(job.totalValue * (1 - feeRate));
      const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, app.freelancerId));
      if (wallet) {
        await db.update(walletsTable).set({
          balance: sql`${walletsTable.balance} + ${earnings}`,
          totalEarned: sql`${walletsTable.totalEarned} + ${earnings}`,
        }).where(eq(walletsTable.userId, app.freelancerId));
        await db.insert(transactionsTable).values({
          walletId: wallet.id, type: "credit", amount: earnings,
          description: `Pagamento: ${job.title}`, status: "completed",
        }).catch(() => {});
      }

      // Referral commission — 3% of freelancer earnings to referrer
      if (freelancer.referredById) {
        const commission = Math.round(earnings * 0.03);
        if (commission > 0) {
          const [refWallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, freelancer.referredById));
          if (refWallet) {
            await db.update(walletsTable).set({
              balance: sql`${walletsTable.balance} + ${commission}`,
              totalEarned: sql`${walletsTable.totalEarned} + ${commission}`,
            }).where(eq(walletsTable.userId, freelancer.referredById));
            await db.insert(transactionsTable).values({
              walletId: refWallet.id, type: "commission", amount: commission,
              description: `Comissão indicação: ${freelancer.name}`, status: "completed",
            }).catch(() => {});
            await db.insert(notificationsTable).values({
              userId: freelancer.referredById, type: "commission_received",
              title: "💰 Comissão de indicação!",
              message: `+R$${(commission / 100).toFixed(2)} pelo job concluído de ${freelancer.name}`,
              isRead: false,
            }).catch(() => {});
          }
        }
      }
    }
  }

  // Notify freelancer
  await db.insert(notificationsTable).values({
    userId: app.freelancerId, type: "job_completed",
    title: "✅ Job concluído!", message: `Seu trabalho em "${job.title}" foi concluído. Pagamento disponível na carteira.`,
    isRead: false,
  }).catch(() => {});

  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), freelancer ?? undefined));
});

// POST /applications/:id/reject
router.post("/applications/:id/reject", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "rejected" })
    .where(eq(applicationsTable.id, id))
    .returning();

  // Notify freelancer
  await db.insert(notificationsTable).values({
    userId: app.freelancerId,
    type: "application_rejected",
    title: "Candidatura não aprovada",
    message: `Sua candidatura para ${job.title} não foi selecionada desta vez`,
    isRead: false,
  }).catch(() => {});

  const [freelancer] = await db.select().from(usersTable).where(eq(usersTable.id, app.freelancerId));
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), freelancer));
});

export default router;
