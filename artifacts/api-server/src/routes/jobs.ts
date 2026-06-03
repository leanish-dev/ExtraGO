import { Router } from "express";
import { db, jobsTable, usersTable } from "@workspace/db";
import { eq, and, like, or, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateJobBody, UpdateJobBody, ListJobsQueryParams } from "@workspace/api-zod";

const router = Router();

function formatJob(job: any, company?: any) {
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    location: job.location,
    date: job.date,
    startTime: job.startTime,
    endTime: job.endTime,
    workersNeeded: job.workersNeeded,
    workersApproved: job.workersApproved,
    hourlyRate: job.hourlyRate,
    totalValue: job.totalValue,
    status: job.status,
    companyId: job.companyId,
    companyName: company?.companyName ?? company?.name ?? null,
    companyAvatarUrl: company?.avatarUrl ?? null,
    createdAt: job.createdAt?.toISOString(),
  };
}

// GET /jobs
router.get("/jobs", requireAuth, async (req, res) => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  const { status, category, companyId, search } = parsed.data ?? {};

  let jobs = await db.select().from(jobsTable).orderBy(sql`${jobsTable.createdAt} DESC`).limit(100);

  if (status) jobs = jobs.filter(j => j.status === status);
  if (category) jobs = jobs.filter(j => j.category === category);
  if (companyId) jobs = jobs.filter(j => j.companyId === Number(companyId));
  if (search) jobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.description.toLowerCase().includes(search.toLowerCase())
  );

  const companyIds = [...new Set(jobs.map(j => j.companyId))];
  const companies = companyIds.length > 0
    ? await db.select().from(usersTable).where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(companyIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];

  const companyMap = new Map(companies.map(c => [c.id, c]));
  res.json(jobs.map(j => formatJob(j, companyMap.get(j.companyId))));
});

// POST /jobs
router.post("/jobs", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "company") {
    res.status(403).json({ error: "Only companies can create jobs" });
    return;
  }

  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const d = parsed.data;
  // Calculate total value from actual hours (startTime/endTime) or default to 8h
  let shiftHours = 8;
  if (d.startTime && d.endTime) {
    const [sh, sm] = (d.startTime as string).split(":").map(Number);
    const [eh, em] = (d.endTime as string).split(":").map(Number);
    let diffMin = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMin <= 0) diffMin += 24 * 60;
    shiftHours = diffMin / 60;
  }
  const totalValue = Math.round(d.hourlyRate * d.workersNeeded * shiftHours);

  const [job] = await db.insert(jobsTable).values({
    ...d,
    totalValue,
    companyId: user.id,
    workersApproved: 0,
  }).returning();

  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
  res.status(201).json(formatJob(job, company));
});

// GET /jobs/:id
router.get("/jobs/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }

  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
  res.json(formatJob(job, company));
});

// PATCH /jobs/:id
router.patch("/jobs/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  if (job.companyId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db.update(jobsTable).set(parsed.data as any).where(eq(jobsTable.id, id)).returning();
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, updated.companyId));
  res.json(formatJob(updated, company));
});

// DELETE /jobs/:id
router.delete("/jobs/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  if (job.companyId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.json({ message: "Job deleted" });
});

// POST /jobs/:id/cancel
router.post("/jobs/:id/cancel", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  if (job.companyId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [updated] = await db.update(jobsTable)
    .set({ status: "cancelled" })
    .where(eq(jobsTable.id, id))
    .returning();
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, updated.companyId));
  res.json(formatJob(updated, company));
});

export default router;
