import { Router } from "express";
import { db, applicationsTable, jobsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";
import { ApplyToJobBody, ListApplicationsQueryParams } from "@workspace/api-zod";
import { calculateLevel, LEVEL_FEE, LEVEL_LABELS, completeJobCascade, reserveCompanyFunds } from "../lib/ecosystem";

const router = Router();

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
    message: app.message ?? null,
    proposedRate: app.proposedRate ?? null,
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
  const id = parseInt(req.params.id as string);
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
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!["pending", "counter_offered", "counter_rejected"].includes(app.status)) {
    res.status(400).json({ error: "Application cannot be approved in its current state" });
    return;
  }

  const jobValue = app.proposedRate ?? job.totalValue ?? 0;

  // Reserve company funds at approval time (soft check — skip if company has no wallet yet)
  if (jobValue > 0) {
    try {
      await reserveCompanyFunds(job.companyId, jobValue, job.title, id);
    } catch {
      // Reservation failed (e.g. insufficient balance) — approve anyway, warn via notification
      db.insert(notificationsTable).values({
        userId: job.companyId,
        type: "wallet_warning",
        title: "⚠️ Saldo insuficiente",
        message: `Você aprovou ${job.title} mas não há saldo suficiente reservado. Adicione fundos antes da conclusão.`,
        isRead: false,
      }).catch(() => {});
    }
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "approved" })
    .where(eq(applicationsTable.id, id))
    .returning();

  await db.update(jobsTable)
    .set({ workersApproved: sql`${jobsTable.workersApproved} + 1` })
    .where(eq(jobsTable.id, job.id));

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

// POST /applications/:id/reject
router.post("/applications/:id/reject", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
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

// POST /applications/:id/complete — full ecosystem cascade
router.post("/applications/:id/complete", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (!["approved", "counter_accepted"].includes(app.status)) {
    res.status(400).json({ error: "Only approved applications can be completed" }); return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "completed" })
    .where(eq(applicationsTable.id, id))
    .returning();

  const jobValue = app.proposedRate ?? job.totalValue ?? 0;

  if (jobValue > 0) {
    await completeJobCascade(
      id,
      job.id,
      app.freelancerId,
      job.companyId,
      job.title,
      jobValue,
    );
  }

  const [freelancer] = await db.select().from(usersTable).where(eq(usersTable.id, app.freelancerId));
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), freelancer));
});

// PATCH /applications/:id/counter-offer — gold/elite freelancers only
router.patch("/applications/:id/counter-offer", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  if (user.role !== "freelancer") {
    res.status(403).json({ error: "Only freelancers can propose a counter-offer" }); return;
  }
  if (!["gold", "elite"].includes(user.level)) {
    res.status(403).json({ error: "Only Gold or Sênior freelancers can propose counter-offers" }); return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (app.freelancerId !== user.id) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!["pending", "approved"].includes(app.status)) {
    res.status(400).json({ error: "Cannot counter-offer in current state" }); return;
  }

  const { proposedRate } = req.body;
  if (!proposedRate || typeof proposedRate !== "number" || proposedRate <= 0) {
    res.status(400).json({ error: "Invalid proposed rate" }); return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "counter_offered", proposedRate })
    .where(eq(applicationsTable.id, id))
    .returning();

  await db.insert(notificationsTable).values({
    userId: job.companyId,
    type: "counter_offer",
    title: "💼 Proposta de valor recebida",
    message: `${user.name} propôs R$${(proposedRate / 100).toFixed(2)} para ${job.title}`,
    link: `/applications/${id}`,
    isRead: false,
  }).catch(() => {});

  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), user));
});

// POST /applications/:id/accept-counter — company accepts freelancer counter-offer
router.post("/applications/:id/accept-counter", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  if (user.role !== "company" && user.role !== "admin") {
    res.status(403).json({ error: "Only companies can accept counter-offers" }); return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (app.status !== "counter_offered") {
    res.status(400).json({ error: "No pending counter-offer" }); return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "counter_accepted" })
    .where(eq(applicationsTable.id, id))
    .returning();

  await db.insert(notificationsTable).values({
    userId: app.freelancerId,
    type: "counter_accepted",
    title: "✅ Proposta aceita!",
    message: `A empresa aceitou seu valor proposto para ${job.title}`,
    isRead: false,
  }).catch(() => {});

  const [freelancer] = await db.select().from(usersTable).where(eq(usersTable.id, app.freelancerId));
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), freelancer));
});

// POST /applications/:id/reject-counter — company rejects freelancer counter-offer
router.post("/applications/:id/reject-counter", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  if (user.role !== "company" && user.role !== "admin") {
    res.status(403).json({ error: "Only companies can reject counter-offers" }); return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  if (app.status !== "counter_offered") {
    res.status(400).json({ error: "No pending counter-offer" }); return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
  if (!job || (job.companyId !== user.id && user.role !== "admin")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(applicationsTable)
    .set({ status: "counter_rejected", proposedRate: null })
    .where(eq(applicationsTable.id, id))
    .returning();

  await db.insert(notificationsTable).values({
    userId: app.freelancerId,
    type: "counter_rejected",
    title: "Proposta não aceita",
    message: `A empresa não aceitou o valor proposto para ${job.title}`,
    isRead: false,
  }).catch(() => {});

  const [freelancer] = await db.select().from(usersTable).where(eq(usersTable.id, app.freelancerId));
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatApp(updated, formatJob(job, company), freelancer));
});

export default router;
