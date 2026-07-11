import { Router } from "express";
import { db, jobsTable, usersTable, walletsTable, transactionsTable, jobEventsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { CreateJobBody, UpdateJobBody, ListJobsQueryParams } from "@workspace/api-zod";
import { ensureWallet } from "../lib/ecosystem";

const router = Router();

const TEST_ACCOUNTS_JOBS = ["teste.f@extrago.com", "teste.e@extrago.com"];

// Daily shift = 7h20min = 440 minutes
const DAILY_SHIFT_MINUTES = 440;

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
    dailyRate: job.dailyRate ?? null,
    shiftType: job.shiftType ?? "hourly",
    totalValue: job.totalValue,
    status: job.status,
    companyId: job.companyId,
    companyName: company?.companyName ?? company?.name ?? null,
    companyAvatarUrl: company?.avatarUrl ?? null,
    walletReservationId: job.walletReservationId ?? null,
    createdAt: job.createdAt?.toISOString(),
    updatedAt: job.updatedAt?.toISOString(),
  };
}

async function logJobEvent(params: {
  jobId: number;
  eventType: string;
  actorId?: number;
  actorRole?: string;
  req?: any;
  metadata?: any;
}) {
  try {
    await db.insert(jobEventsTable as any).values({
      jobId: params.jobId,
      eventType: params.eventType,
      actorId: params.actorId ?? null,
      actorRole: params.actorRole ?? null,
      ipAddress: params.req
        ? ((params.req.headers["x-forwarded-for"] as string) ?? params.req.socket?.remoteAddress ?? null)
        : null,
      userAgent: params.req ? (params.req.headers["user-agent"] ?? null) : null,
      gps: null,
      metadata: params.metadata ?? null,
    });
  } catch (e) {
    console.error("[jobs] logJobEvent error:", e);
  }
}

// GET /jobs
router.get("/jobs", requireAuth, async (req, res) => {
  const requestingUser = (req as any).user;
  const canSeeDemoData = TEST_ACCOUNTS_JOBS.includes((requestingUser?.email ?? "").toLowerCase());

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

  const demoCompanyIds = canSeeDemoData ? new Set<number>() : new Set(companies.filter(c => c.isDemo).map(c => c.id));
  const filteredJobs = canSeeDemoData ? jobs : jobs.filter(j => !demoCompanyIds.has(j.companyId));

  const companyMap = new Map(companies.map(c => [c.id, c]));
  res.json(filteredJobs.map(j => formatJob(j, companyMap.get(j.companyId))));
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
  const shiftType: "hourly" | "daily" = (d as any).shiftType ?? "hourly";

  // Calculate total value
  let totalValue: number;
  let shiftHours: number;

  if (shiftType === "daily") {
    // Daily = 7h20min per worker
    shiftHours = DAILY_SHIFT_MINUTES / 60;
    const dailyRate = (d as any).dailyRate ?? (d.hourlyRate * shiftHours);
    totalValue = Math.round(dailyRate * d.workersNeeded * 100) / 100;
  } else {
    // Hourly: derive from startTime/endTime
    shiftHours = 8;
    if (d.startTime && d.endTime) {
      const [sh, sm] = (d.startTime as string).split(":").map(Number);
      const [eh, em] = (d.endTime as string).split(":").map(Number);
      let diffMin = (eh * 60 + em) - (sh * 60 + sm);
      if (diffMin <= 0) diffMin += 24 * 60;
      shiftHours = diffMin / 60;
    }
    totalValue = Math.round(d.hourlyRate * d.workersNeeded * shiftHours * 100) / 100;
  }

  // ── Wallet reservation ───────────────────────────────────────────────────
  // Wallet balance / transactions are stored in INTEGER CENTS.
  // Job rates (hourlyRate, dailyRate, totalValue) are stored in BRL (float).
  const platformFeeRate = 0.15;
  const reservationBRL = Math.round(totalValue * (1 + platformFeeRate) * 100) / 100;
  const reservationCents = Math.round(reservationBRL * 100); // convert to cents for wallet

  const wallet = await ensureWallet(user.id, "company");
  const reservationRef = `job_reservation:${Date.now()}_${user.id}`;

  // ── Reserve funds + create job atomically ──────────────────────────────────
  // A single DB transaction guarantees exactly ONE reservation is ever created
  // per Extra: if any step fails (insufficient balance, job insert failure,
  // etc.) the whole operation rolls back and no reservation/transaction/job
  // row is left behind — preventing the "phantom reservation from a failed
  // request that gets retried" class of bug.
  let job: any;
  try {
    job = await db.transaction(async (tx) => {
      // Re-read the wallet inside the transaction to get a consistent balance.
      const [freshWallet] = await tx.select().from(walletsTable).where(eq(walletsTable.id, wallet.id));
      const availableBalance = freshWallet.balance - freshWallet.reservedBalance; // both in cents

      if (availableBalance < reservationCents) {
        const err: any = new Error("insufficient_balance");
        err.availableBalance = availableBalance;
        throw err;
      }

      // Reserve the amount (in cents)
      await tx.update(walletsTable)
        .set({ reservedBalance: sql`${walletsTable.reservedBalance} + ${reservationCents}` })
        .where(eq(walletsTable.id, freshWallet.id));

      await tx.insert(transactionsTable).values({
        walletId: freshWallet.id,
        type: "reservation",
        amount: reservationCents,
        description: `Reserva para Extra — ${d.title}`,
        status: "completed",
        referenceId: reservationRef,
      });

      // ── Create job ──────────────────────────────────────────────────────────
      const [insertedJob] = await tx.insert(jobsTable).values({
        ...d,
        shiftType,
        dailyRate: shiftType === "daily" ? ((d as any).dailyRate ?? null) : null,
        totalValue,
        companyId: user.id,
        workersApproved: 0,
        walletReservationId: reservationRef,
      } as any).returning();

      return insertedJob;
    });
  } catch (e: any) {
    if (e?.message === "insufficient_balance") {
      const availableBRL = e.availableBalance / 100;
      res.status(402).json({
        error: `Saldo insuficiente. Necessário: R$ ${reservationBRL.toFixed(2)}, Disponível: R$ ${availableBRL.toFixed(2)}. Por favor, faça um depósito antes de publicar um Extra.`,
        required: reservationCents,
        available: e.availableBalance,
      });
      return;
    }
    console.error("[jobs] create job error:", e);
    res.status(500).json({ error: "Erro ao publicar Extra. Nenhuma reserva foi criada." });
    return;
  }

  // Log creation event (best-effort, never throws — logJobEvent already
  // swallows its own errors internally)
  await logJobEvent({ jobId: job.id, eventType: "created", actorId: user.id, actorRole: user.role, req, metadata: { totalValue, reservationAmount: reservationCents, shiftType } });
  await logJobEvent({ jobId: job.id, eventType: "wallet_reserved", actorId: user.id, actorRole: user.role, req, metadata: { amount: reservationCents, ref: reservationRef } });

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

  const [updated] = await db.update(jobsTable)
    .set({ ...(parsed.data as any), updatedAt: new Date() })
    .where(eq(jobsTable.id, id))
    .returning();

  await logJobEvent({ jobId: id, eventType: "edited", actorId: user.id, actorRole: user.role, req });
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

  // Release any reserved balance (wallet in cents, job.totalValue in BRL)
  if (job.walletReservationId) {
    try {
      const wallet = await ensureWallet(job.companyId, "company");
      const releaseCents = Math.round(job.totalValue * 1.15 * 100);
      const actualRelease = Math.min(wallet.reservedBalance, releaseCents);
      if (actualRelease > 0) {
        await db.update(walletsTable)
          .set({ reservedBalance: Math.max(0, wallet.reservedBalance - actualRelease) })
          .where(eq(walletsTable.id, wallet.id));
      }
    } catch {}
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

  // Release wallet reservation on cancel (wallet in cents, job.totalValue in BRL)
  if (job.walletReservationId && job.totalValue > 0) {
    try {
      const wallet = await ensureWallet(job.companyId, "company");
      const releaseCents = Math.round(job.totalValue * 1.15 * 100);
      const release = Math.min(wallet.reservedBalance, releaseCents);
      await db.update(walletsTable)
        .set({ reservedBalance: Math.max(0, wallet.reservedBalance - release) })
        .where(eq(walletsTable.id, wallet.id));
      await db.insert(transactionsTable).values({
        walletId: wallet.id,
        type: "release",
        amount: release,
        description: `Estorno de reserva — Extra cancelado #${id}`,
        status: "completed",
        referenceId: `cancel:${id}`,
      }).catch(() => {});
    } catch {}
  }

  const [updated] = await db.update(jobsTable)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(jobsTable.id, id))
    .returning();

  await logJobEvent({ jobId: id, eventType: "cancelled", actorId: user.id, actorRole: user.role, req });
  const [company] = await db.select().from(usersTable).where(eq(usersTable.id, updated.companyId));
  res.json(formatJob(updated, company));
});

export default router;
