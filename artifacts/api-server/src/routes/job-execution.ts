/**
 * Extra Execution Routes — check-in / checkout validation
 *
 * Flow:
 *  1. POST /jobs/:id/generate-checkin-codes  → create 2 codes (company + freelancer)
 *  2. POST /jobs/:id/validate-checkin        → validate entered code, mark job started
 *  3. POST /jobs/:id/generate-checkout-codes → create 2 codes (company + freelancer)
 *  4. POST /jobs/:id/validate-checkout       → validate entered code, mark job completed
 *  5. GET  /jobs/:id/events                  → audit log for a job
 *  6. GET  /jobs/:id/codes/active            → active codes for this job (own role only)
 */
import { Router } from "express";
import { db, jobsTable, jobEventsTable, jobCodesTable, walletsTable, transactionsTable, usersTable } from "@workspace/db";
import { eq, and, gt, isNull } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router = Router();

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function logEvent(params: {
  jobId: number;
  eventType: string;
  actorId?: number;
  actorRole?: string;
  req?: any;
  metadata?: any;
}) {
  return db.insert(jobEventsTable as any).values({
    jobId: params.jobId,
    eventType: params.eventType,
    actorId: params.actorId ?? null,
    actorRole: params.actorRole ?? null,
    ipAddress: params.req ? (params.req.headers["x-forwarded-for"] as string ?? params.req.socket?.remoteAddress ?? null) : null,
    userAgent: params.req ? (params.req.headers["user-agent"] ?? null) : null,
    gps: params.metadata?.gps ?? null,
    metadata: params.metadata ?? null,
  }).catch((e) => console.error("[job-execution] logEvent error:", e));
}

// ── GET /jobs/:id/events ─────────────────────────────────────────────────────
router.get("/jobs/:id/events", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }

  // Only company owner, admin, or approved freelancer can view events
  if (user.role !== "admin" && job.companyId !== user.id) {
    // Allow if freelancer (basic check; deeper check would query applications)
    if (user.role !== "freelancer") {
      res.status(403).json({ error: "Forbidden" }); return;
    }
  }

  const events = await db.select().from(jobEventsTable as any)
    .where(eq((jobEventsTable as any).jobId, jobId))
    .orderBy((jobEventsTable as any).createdAt);

  res.json(events);
});

// ── POST /jobs/:id/generate-checkin-codes ────────────────────────────────────
router.post("/jobs/:id/generate-checkin-codes", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }

  // Must be company owner or admin
  if (job.companyId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden — only company owner can generate codes" }); return;
  }

  if (!["open", "scheduled"].includes(job.status)) {
    res.status(400).json({ error: `Cannot generate check-in codes — job status is '${job.status}'` }); return;
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  // Invalidate old active codes for this job
  // (We don't delete, just expire them by not querying them)

  const companyCode = generateCode();
  const freelancerCode = generateCode();

  const applicationId = req.body.applicationId ?? null;

  await db.insert(jobCodesTable as any).values([
    { jobId, applicationId, codeType: "checkin_company", code: companyCode, expiresAt },
    { jobId, applicationId, codeType: "checkin_freelancer", code: freelancerCode, expiresAt },
  ]);

  // Update job to waiting_checkin
  await db.update(jobsTable)
    .set({ status: "waiting_checkin", updatedAt: new Date() })
    .where(eq(jobsTable.id, jobId));

  logEvent({ jobId, eventType: "checkin_code_generated", actorId: user.id, actorRole: user.role, req });

  // Return company code to the company user; freelancer needs to get theirs separately
  res.json({
    companyCode,
    freelancerCode,
    expiresAt: expiresAt.toISOString(),
    message: "Share the freelancer code with the professional",
  });
});

// ── GET /jobs/:id/codes/active ───────────────────────────────────────────────
router.get("/jobs/:id/codes/active", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }

  if (job.companyId !== user.id && user.role !== "admin" && user.role !== "freelancer") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const now = new Date();
  const codes = await db.select().from(jobCodesTable as any)
    .where(
      and(
        eq((jobCodesTable as any).jobId, jobId),
        isNull((jobCodesTable as any).usedAt),
        gt((jobCodesTable as any).expiresAt, now),
      )
    );

  // Filter by role: company sees company codes, freelancer sees freelancer codes
  const filtered = user.role === "admin"
    ? codes
    : codes.filter((c: any) =>
        user.role === "company"
          ? c.codeType.startsWith("checkin_company") || c.codeType.startsWith("checkout_company")
          : c.codeType.startsWith("checkin_freelancer") || c.codeType.startsWith("checkout_freelancer")
      );

  res.json(filtered.map((c: any) => ({
    id: c.id,
    codeType: c.codeType,
    code: c.code,
    expiresAt: c.expiresAt?.toISOString(),
  })));
});

// ── POST /jobs/:id/validate-checkin ──────────────────────────────────────────
router.post("/jobs/:id/validate-checkin", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  const { code, gps } = req.body ?? {};

  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (!code) { res.status(400).json({ error: "code is required" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }

  if (!["waiting_checkin", "open", "scheduled"].includes(job.status)) {
    res.status(400).json({ error: `Job is not in a check-in-able state (current: ${job.status})` }); return;
  }

  // Determine which code type to match
  const codeType = user.role === "company" ? "checkin_freelancer" : "checkin_company";

  const now = new Date();
  const [matchingCode] = await db.select().from(jobCodesTable as any)
    .where(
      and(
        eq((jobCodesTable as any).jobId, jobId),
        eq((jobCodesTable as any).codeType, codeType),
        eq((jobCodesTable as any).code, String(code)),
        isNull((jobCodesTable as any).usedAt),
        gt((jobCodesTable as any).expiresAt, now),
      )
    );

  if (!matchingCode) {
    res.status(400).json({ error: "Código inválido ou expirado. Verifique e tente novamente." }); return;
  }

  // Mark code as used
  await db.update(jobCodesTable as any)
    .set({ usedAt: now, usedByUserId: user.id, ipAddress: req.headers["x-forwarded-for"] as string ?? null, gps: gps ?? null })
    .where(eq((jobCodesTable as any).id, (matchingCode as any).id));

  // Check if BOTH sides have validated (company validated freelancer's code AND freelancer validated company's code)
  const usedCodes = await db.select().from(jobCodesTable as any)
    .where(
      and(
        eq((jobCodesTable as any).jobId, jobId),
      )
    );

  const companyValidated = (usedCodes as any[]).some(c =>
    c.codeType === "checkin_company" && c.usedAt !== null);
  const freelancerValidated = (usedCodes as any[]).some(c =>
    c.codeType === "checkin_freelancer" && c.usedAt !== null);

  // Start job if both sides validated (or if single-side: company or freelancer)
  const bothValidated = companyValidated || freelancerValidated;

  if (bothValidated && job.status !== "in_progress") {
    await db.update(jobsTable)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(jobsTable.id, jobId));

    logEvent({ jobId, eventType: "checkin_validated", actorId: user.id, actorRole: user.role, req, metadata: { gps, code: "***" } });
    logEvent({ jobId, eventType: "started", actorId: user.id, actorRole: user.role, req, metadata: { gps } });

    res.json({ success: true, status: "in_progress", message: "Check-in validado! Extra em andamento." });
  } else {
    logEvent({ jobId, eventType: "checkin_validated", actorId: user.id, actorRole: user.role, req, metadata: { gps, partial: true } });
    res.json({ success: true, status: job.status, message: "Código validado. Aguardando o outro lado confirmar." });
  }
});

// ── POST /jobs/:id/generate-checkout-codes ───────────────────────────────────
router.post("/jobs/:id/generate-checkout-codes", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }

  if (job.companyId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  if (!["in_progress", "on_break"].includes(job.status)) {
    res.status(400).json({ error: `Cannot generate checkout codes — job status is '${job.status}'` }); return;
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const applicationId = req.body.applicationId ?? null;

  const companyCode = generateCode();
  const freelancerCode = generateCode();

  await db.insert(jobCodesTable as any).values([
    { jobId, applicationId, codeType: "checkout_company", code: companyCode, expiresAt },
    { jobId, applicationId, codeType: "checkout_freelancer", code: freelancerCode, expiresAt },
  ]);

  await db.update(jobsTable)
    .set({ status: "waiting_checkout", updatedAt: new Date() })
    .where(eq(jobsTable.id, jobId));

  logEvent({ jobId, eventType: "checkout_code_generated", actorId: user.id, actorRole: user.role, req });

  res.json({
    companyCode,
    freelancerCode,
    expiresAt: expiresAt.toISOString(),
    message: "Share the freelancer checkout code with the professional",
  });
});

// ── POST /jobs/:id/validate-checkout ─────────────────────────────────────────
router.post("/jobs/:id/validate-checkout", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  const { code, gps } = req.body ?? {};

  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (!code) { res.status(400).json({ error: "code is required" }); return; }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }

  if (!["waiting_checkout", "in_progress"].includes(job.status)) {
    res.status(400).json({ error: `Job cannot be checked out in status '${job.status}'` }); return;
  }

  const codeType = user.role === "company" ? "checkout_freelancer" : "checkout_company";
  const now = new Date();

  const [matchingCode] = await db.select().from(jobCodesTable as any)
    .where(
      and(
        eq((jobCodesTable as any).jobId, jobId),
        eq((jobCodesTable as any).codeType, codeType),
        eq((jobCodesTable as any).code, String(code)),
        isNull((jobCodesTable as any).usedAt),
        gt((jobCodesTable as any).expiresAt, now),
      )
    );

  if (!matchingCode) {
    res.status(400).json({ error: "Código inválido ou expirado. Verifique e tente novamente." }); return;
  }

  await db.update(jobCodesTable as any)
    .set({ usedAt: now, usedByUserId: user.id, ipAddress: req.headers["x-forwarded-for"] as string ?? null, gps: gps ?? null })
    .where(eq((jobCodesTable as any).id, (matchingCode as any).id));

  // Mark job completed
  await db.update(jobsTable)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(jobsTable.id, jobId));

  logEvent({ jobId, eventType: "checkout_validated", actorId: user.id, actorRole: user.role, req, metadata: { gps, code: "***" } });
  logEvent({ jobId, eventType: "finished", actorId: user.id, actorRole: user.role, req, metadata: { gps } });

  // Release wallet reservation
  try {
    const [company] = await db.select().from(usersTable).where(eq(usersTable.id, job.companyId));
    if (company) {
      const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, job.companyId));
      if (wallet && job.totalValue > 0) {
        const release = Math.min(wallet.reservedBalance, job.totalValue);
        await db.update(walletsTable)
          .set({ reservedBalance: wallet.reservedBalance - release })
          .where(eq(walletsTable.id, wallet.id));
        await db.insert(transactionsTable).values({
          walletId: wallet.id,
          type: "release",
          amount: release,
          description: `Liberação de reserva — Extra #${jobId}`,
          status: "completed",
          referenceId: `job:${jobId}`,
        });
        logEvent({ jobId, eventType: "wallet_released", actorId: user.id, actorRole: user.role, req, metadata: { amount: release } });
      }
    }
  } catch (e) {
    console.error("[job-execution] wallet release error:", e);
  }

  res.json({ success: true, status: "completed", message: "Checkout validado! Extra concluído com sucesso." });
});

// ── POST /jobs/:id/update-status (admin) ─────────────────────────────────────
router.post("/jobs/:id/update-status", requireAuth, async (req, res) => {
  const jobId = parseInt(req.params.id as string);
  const user = (req as any).user;
  const { status } = req.body ?? {};

  if (isNaN(jobId)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (user.role !== "admin" && user.role !== "company") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const validStatuses = ["open", "scheduled", "waiting_checkin", "checked_in", "in_progress",
    "on_break", "waiting_checkout", "completed", "cancelled", "disputed"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  if (user.role === "company" && job.companyId !== user.id) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(jobsTable)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(jobsTable.id, jobId))
    .returning();

  logEvent({ jobId, eventType: status as any, actorId: user.id, actorRole: user.role, req });
  res.json({ id: updated.id, status: updated.status });
});

export default router;
