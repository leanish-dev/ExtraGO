/**
 * KYC Admin Review Center
 * All routes require admin authentication.
 *
 * Queue endpoints:
 *   GET  /admin/kyc/queue           — list accounts in a given review state
 *   GET  /admin/kyc/users/:id       — full profile + docs + audit + acceptances
 *
 * Account-level actions:
 *   POST /admin/kyc/users/:id/approve           — approve → verified
 *   POST /admin/kyc/users/:id/reject            — reject with reason
 *   POST /admin/kyc/users/:id/request-documents — request new documents
 *   POST /admin/kyc/users/:id/request-selfie    — request new selfie specifically
 *   POST /admin/kyc/users/:id/note              — leave internal / public note
 *   POST /admin/kyc/users/:id/suspend           — suspend verification
 *   POST /admin/kyc/users/:id/resume            — resume suspended verification
 *
 * Every action creates an audit log entry and a user notification.
 */

import { Router } from "express";
import { eq, desc, and, inArray } from "drizzle-orm";
import { z } from "zod/v4";
import {
  db,
  usersTable,
  kycDocumentsTable,
  kycReviewHistoryTable,
  verificationAuditLogTable,
  legalAcceptancesTable,
  legalDocumentsTable,
  notificationsTable,
} from "@workspace/db";
import { requireAdmin, formatUser } from "../lib/auth";
import { recordAuditLog } from "../lib/verification";
import { createNotification } from "../lib/notifications";

const router = Router();

// ── Helpers ────────────────────────────────────────────────────

/** States relevant for the KYC review queue */
const QUEUE_STATUSES = ["pending_review", "verified", "rejected", "correction_requested", "blocked"] as const;
type QueueStatus = (typeof QUEUE_STATUSES)[number];

async function notify(userId: number, type: string, title: string, message: string, link?: string) {
  await createNotification({ userId, type, title, message, link: link ?? null }, db).catch(() => {});
}

async function kycAudit(
  userId: number,
  action: string,
  reviewerId: number,
  details?: Record<string, unknown>,
  req?: any,
) {
  await recordAuditLog({ userId, action, details: { reviewerId, ...details }, req });
}

// ── GET /admin/kyc/queue ───────────────────────────────────────
router.get("/admin/kyc/queue", requireAdmin, async (req, res) => {
  const statusParam = (req.query.status as string) ?? "pending_review";
  const validStatus = QUEUE_STATUSES.includes(statusParam as QueueStatus)
    ? (statusParam as QueueStatus)
    : "pending_review";

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.accountStatus, validStatus as any))
    .orderBy(desc(usersTable.createdAt))
    .limit(200);

  // Attach KYC document counts per user in one query
  const userIds = users.map((u) => u.id);
  const docs =
    userIds.length > 0
      ? await db
          .select()
          .from(kycDocumentsTable)
          .where(inArray(kycDocumentsTable.userId, userIds))
      : [];

  const docMap = new Map<number, typeof docs>();
  docs.forEach((d) => {
    if (!docMap.has(d.userId)) docMap.set(d.userId, []);
    docMap.get(d.userId)!.push(d);
  });

  res.json(
    users.map((u) => {
      const userDocs = docMap.get(u.id) ?? [];
      return {
        ...formatUser(u),
        cpf: u.cpf ?? null,
        cnpj: u.cnpj ?? null,
        pixKey: u.pixKey ?? null,
        accountStatus: u.accountStatus,
        createdAt: u.createdAt?.toISOString() ?? null,
        documents: {
          total: userDocs.length,
          pending: userDocs.filter((d) => d.status === "pending").length,
          approved: userDocs.filter((d) => d.status === "approved").length,
          rejected: userDocs.filter((d) => d.status === "rejected").length,
          correctionRequested: userDocs.filter((d) => d.status === "correction_requested").length,
        },
      };
    }),
  );
});

// ── GET /admin/kyc/users/:id ───────────────────────────────────
router.get("/admin/kyc/users/:id", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  // Load everything in parallel
  const [docs, auditLogs, acceptances] = await Promise.all([
    db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, userId)).orderBy(desc(kycDocumentsTable.submittedAt)),
    db.select().from(verificationAuditLogTable).where(eq(verificationAuditLogTable.userId, userId)).orderBy(desc(verificationAuditLogTable.createdAt)).limit(100),
    db.select().from(legalAcceptancesTable).where(eq(legalAcceptancesTable.userId, userId)),
  ]);

  // Load accepted document metadata
  const docIds = acceptances.map((a) => a.documentId).filter(Boolean);
  const legalDocs =
    docIds.length > 0
      ? await db.select().from(legalDocumentsTable).where(inArray(legalDocumentsTable.id, docIds))
      : [];
  const legalDocMap = new Map(legalDocs.map((d) => [d.id, d]));

  // Load KYC review history per document
  const kycDocIds = docs.map((d) => d.id);
  const reviewHistory =
    kycDocIds.length > 0
      ? await db.select().from(kycReviewHistoryTable).where(inArray(kycReviewHistoryTable.kycDocumentId, kycDocIds)).orderBy(desc(kycReviewHistoryTable.createdAt))
      : [];
  const historyMap = new Map<number, typeof reviewHistory>();
  reviewHistory.forEach((h) => {
    if (!historyMap.has(h.kycDocumentId)) historyMap.set(h.kycDocumentId, []);
    historyMap.get(h.kycDocumentId)!.push(h);
  });

  res.json({
    profile: {
      ...formatUser(user),
      cpf: user.cpf ?? null,
      cnpj: user.cnpj ?? null,
      pixKey: user.pixKey ?? null,
      accountStatus: user.accountStatus,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      phoneVerifiedAt: user.phoneVerifiedAt?.toISOString() ?? null,
      createdAt: user.createdAt?.toISOString() ?? null,
    },
    documents: docs.map((d) => ({
      id: d.id,
      documentType: d.documentType,
      fileUrl: d.fileUrl,
      version: d.version,
      status: d.status,
      reviewNotes: d.reviewNotes,
      submittedAt: d.submittedAt?.toISOString() ?? null,
      reviewedAt: d.reviewedAt?.toISOString() ?? null,
      reviewHistory: historyMap.get(d.id) ?? [],
    })),
    auditLogs: auditLogs.map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt?.toISOString() ?? null,
    })),
    legalAcceptances: acceptances.map((a) => ({
      id: a.id,
      documentId: a.documentId,
      documentType: a.documentType,
      version: a.version,
      signatureHash: a.signatureHash,
      acceptedAt: a.acceptedAt?.toISOString() ?? null,
      documentTitle: legalDocMap.get(a.documentId!)?.title ?? null,
    })),
  });
});

// ── POST /admin/kyc/users/:id/approve ─────────────────────────
router.post("/admin/kyc/users/:id/approve", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const { notes } = req.body ?? {};

  await db.update(usersTable).set({
    accountStatus: "verified",
    isVerified: true,
  }).where(eq(usersTable.id, userId));

  await kycAudit(userId, "account_approved", reviewer.id, { notes }, req);

  await notify(
    userId,
    "account_approved",
    "✅ Conta verificada!",
    "Sua conta foi aprovada pela equipe extraGO. Você já pode acessar todas as funcionalidades da plataforma.",
    "/app/dashboard",
  );

  res.json({ message: "Account approved and set to verified" });
});

// ── POST /admin/kyc/users/:id/reject ──────────────────────────
router.post("/admin/kyc/users/:id/reject", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;

  const parsed = z.object({
    reason: z.string().min(1, "Reason is required"),
    notes: z.string().optional(),
    publicMessage: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "reason is required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await db.update(usersTable).set({ accountStatus: "rejected" }).where(eq(usersTable.id, userId));

  await kycAudit(userId, "account_rejected", reviewer.id, {
    reason: parsed.data.reason,
    notes: parsed.data.notes,
    publicMessage: parsed.data.publicMessage,
  }, req);

  const publicMsg = parsed.data.publicMessage ?? parsed.data.reason;
  await notify(
    userId,
    "account_rejected",
    "Verificação não aprovada",
    `Sua verificação não foi aprovada. Motivo: ${publicMsg}. Você pode corrigir os documentos e reenviar.`,
    "/verification-center",
  );

  res.json({ message: "Account rejected" });
});

// ── POST /admin/kyc/users/:id/request-documents ───────────────
router.post("/admin/kyc/users/:id/request-documents", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;

  const parsed = z.object({
    documentTypes: z.array(z.string()).min(1),
    message: z.string().optional(),
    notes: z.string().optional(),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "documentTypes array required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await db.update(usersTable).set({ accountStatus: "correction_requested" }).where(eq(usersTable.id, userId));

  // Mark requested document types as correction_requested
  for (const docType of parsed.data.documentTypes) {
    const [existing] = await db.select().from(kycDocumentsTable)
      .where(and(eq(kycDocumentsTable.userId, userId), eq(kycDocumentsTable.documentType, docType as any)))
      .limit(1);
    if (existing) {
      await db.update(kycDocumentsTable).set({
        status: "correction_requested",
        reviewNotes: parsed.data.message ?? null,
        reviewerId: reviewer.id,
        reviewedAt: new Date(),
      }).where(eq(kycDocumentsTable.id, existing.id));
    }
  }

  await kycAudit(userId, "documents_requested", reviewer.id, {
    documentTypes: parsed.data.documentTypes,
    message: parsed.data.message,
    notes: parsed.data.notes,
  }, req);

  const docLabel = parsed.data.documentTypes.join(", ");
  const msg = parsed.data.message
    ? `${parsed.data.message} (Documentos: ${docLabel})`
    : `Por favor, reenvie os seguintes documentos: ${docLabel}`;

  await notify(
    userId,
    "documents_requested",
    "📋 Documentos solicitados",
    msg,
    "/verification-center",
  );

  res.json({ message: "Document request sent", requestedTypes: parsed.data.documentTypes });
});

// ── POST /admin/kyc/users/:id/request-selfie ──────────────────
router.post("/admin/kyc/users/:id/request-selfie", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;

  const { message, notes } = req.body ?? {};

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  // Mark selfie document as correction_requested if it exists
  const [selfie] = await db.select().from(kycDocumentsTable)
    .where(and(eq(kycDocumentsTable.userId, userId), eq(kycDocumentsTable.documentType, "selfie")))
    .limit(1);
  if (selfie) {
    await db.update(kycDocumentsTable).set({
      status: "correction_requested",
      reviewNotes: message ?? "Por favor, envie uma nova selfie com documento.",
      reviewerId: reviewer.id,
      reviewedAt: new Date(),
    }).where(eq(kycDocumentsTable.id, selfie.id));
  }

  await db.update(usersTable).set({ accountStatus: "correction_requested" }).where(eq(usersTable.id, userId));

  await kycAudit(userId, "selfie_requested", reviewer.id, { message, notes }, req);

  await notify(
    userId,
    "selfie_requested",
    "📸 Nova selfie solicitada",
    message ?? "Por favor, envie uma nova selfie segurando seu documento de identificação.",
    "/verification-center",
  );

  res.json({ message: "Selfie request sent" });
});

// ── POST /admin/kyc/users/:id/note ────────────────────────────
router.post("/admin/kyc/users/:id/note", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;

  const parsed = z.object({
    content: z.string().min(1),
    isPublic: z.boolean().default(false),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "content is required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await kycAudit(userId, parsed.data.isPublic ? "public_note_added" : "internal_note_added", reviewer.id, {
    content: parsed.data.content,
    isPublic: parsed.data.isPublic,
  }, req);

  // Only notify user if public note
  if (parsed.data.isPublic) {
    await notify(userId, "admin_note", "Mensagem da equipe extraGO", parsed.data.content, "/verification-center");
  }

  res.json({ message: "Note saved" });
});

// ── POST /admin/kyc/users/:id/suspend ─────────────────────────
router.post("/admin/kyc/users/:id/suspend", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;
  const { reason, notes } = req.body ?? {};

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await db.update(usersTable).set({ accountStatus: "blocked" }).where(eq(usersTable.id, userId));
  await kycAudit(userId, "verification_suspended", reviewer.id, { reason, notes }, req);

  await notify(
    userId,
    "verification_suspended",
    "Verificação suspensa",
    reason ?? "Sua verificação foi temporariamente suspensa pela equipe de compliance.",
    "/verification-center",
  );

  res.json({ message: "Verification suspended" });
});

// ── POST /admin/kyc/users/:id/resume ──────────────────────────
router.post("/admin/kyc/users/:id/resume", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id as string);
  if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const reviewer = (req as any).user;
  const { notes } = req.body ?? {};

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  // Resume to pending_review so it re-enters the queue
  await db.update(usersTable).set({ accountStatus: "pending_review" }).where(eq(usersTable.id, userId));
  await kycAudit(userId, "verification_resumed", reviewer.id, { notes }, req);

  await notify(
    userId,
    "verification_resumed",
    "Verificação retomada",
    "Sua verificação foi retomada. Nossa equipe irá analisar seus documentos em breve.",
    "/verification-center",
  );

  res.json({ message: "Verification resumed" });
});

// ── GET /admin/kyc/stats ───────────────────────────────────────
router.get("/admin/kyc/stats", requireAdmin, async (_req, res) => {
  const allUsers = await db.select({ id: usersTable.id, accountStatus: usersTable.accountStatus }).from(usersTable);

  const counts = {
    pending_review: 0,
    verified: 0,
    rejected: 0,
    correction_requested: 0,
    blocked: 0,
  };

  allUsers.forEach((u) => {
    if (u.accountStatus in counts) {
      counts[u.accountStatus as keyof typeof counts]++;
    }
  });

  res.json(counts);
});

export default router;
