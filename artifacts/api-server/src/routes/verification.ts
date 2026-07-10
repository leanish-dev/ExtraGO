import { Router } from "express";
import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import {
  db,
  usersTable,
  kycDocumentsTable,
  kycReviewHistoryTable,
  legalAcceptancesTable,
  legalDocumentsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin, hashPassword, formatUser } from "../lib/auth";
import { rateLimit } from "../lib/rate-limit";
import {
  createEmailVerification,
  consumeEmailVerification,
  createPhoneVerification,
  confirmPhoneVerification,
  getLatestPublishedDocument,
  recordLegalAcceptance,
  submitKycDocument,
  reviewKycDocument,
  sendEmail,
  sendSms,
  recordAuditLog,
  computeAccountStatus,
} from "../lib/verification";

const router = Router();

const otpLimiter = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "otp" });
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "auth-sensitive" });

async function bumpAccountStatusAfterVerification(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return;
  // Only auto-advance the natural pending_* chain; never touch admin-set
  // terminal states (verified/rejected/blocked) or documents-review stage.
  if (["pending_email", "pending_phone", "draft"].includes(user.accountStatus)) {
    const next = computeAccountStatus(user);
    if (next !== user.accountStatus) {
      await db.update(usersTable).set({ accountStatus: next }).where(eq(usersTable.id, userId));
    }
  }
}

// ── Email verification ────────────────────────────────────────
router.post("/auth/verify-email/request", requireAuth, otpLimiter, async (req, res) => {
  const user = (req as any).user;
  if (user.emailVerifiedAt) {
    res.status(400).json({ error: "Email already verified" });
    return;
  }
  const result = await createEmailVerification({ userId: user.id, email: user.email, purpose: "verify_email" });
  if (!result.throttled) {
    await sendEmail(user.email, "Confirme seu e-mail", `Seu código de verificação é ${result.record.otpCode}`);
  }
  res.json({ message: result.throttled ? "Verification already sent recently" : "Verification email sent" });
});

router.post("/auth/verify-email/confirm", requireAuth, authLimiter, async (req, res) => {
  const parsed = z.object({ token: z.string().optional(), otpCode: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const result = await consumeEmailVerification({ ...parsed.data, purpose: "verify_email" });
  if (!result || result.status !== "ok") {
    res.status(400).json({ error: result?.status ?? "invalid_request" });
    return;
  }
  if (result.record.userId !== user.id) {
    res.status(403).json({ error: "Token does not belong to this account" });
    return;
  }
  await db.update(usersTable).set({ emailVerifiedAt: new Date() }).where(eq(usersTable.id, user.id));
  await bumpAccountStatusAfterVerification(user.id);
  await recordAuditLog({ userId: user.id, action: "email_verified", req });
  res.json({ message: "Email verified" });
});

// ── Phone verification ────────────────────────────────────────
router.post("/auth/verify-phone/request", requireAuth, otpLimiter, async (req, res) => {
  const parsed = z.object({ phone: z.string().min(8), channel: z.enum(["sms", "whatsapp"]).default("sms") }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const { phone, channel } = parsed.data;
  const result = await createPhoneVerification({ userId: user.id, phone, channel });
  if (!result.throttled) {
    await sendSms(phone, channel, `Seu código extraGO é ${result.record.code}`);
  }
  res.json({ message: result.throttled ? "Code already sent recently" : "Verification code sent" });
});

router.post("/auth/verify-phone/confirm", requireAuth, authLimiter, async (req, res) => {
  const parsed = z.object({ code: z.string().min(4) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const result = await confirmPhoneVerification({ userId: user.id, code: parsed.data.code });
  if (result.status !== "ok") {
    res.status(400).json({ error: result.status });
    return;
  }
  await db.update(usersTable).set({ phone: result.record.phone, phoneVerifiedAt: new Date() }).where(eq(usersTable.id, user.id));
  await bumpAccountStatusAfterVerification(user.id);
  await recordAuditLog({ userId: user.id, action: "phone_verified", req });
  res.json({ message: "Phone verified" });
});

// ── Forgot / reset password ─────────────────────────────────────
router.post("/auth/forgot-password", authLimiter, async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email)).limit(1);
  // Always respond 200 regardless of whether the account exists, to avoid
  // leaking which emails are registered.
  if (user) {
    const result = await createEmailVerification({ userId: user.id, email: user.email, purpose: "password_reset" });
    if (!result.throttled) {
      await sendEmail(user.email, "Redefinição de senha", `Use este token para redefinir sua senha: ${result.record.token}`);
    }
    await recordAuditLog({ userId: user.id, action: "password_reset_requested", req });
  }
  res.json({ message: "If the email exists, a reset link was sent" });
});

router.post("/auth/reset-password", authLimiter, async (req, res) => {
  const parsed = z.object({ token: z.string(), newPassword: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const result = await consumeEmailVerification({ token: parsed.data.token, purpose: "password_reset" });
  if (!result || result.status !== "ok") {
    res.status(400).json({ error: result?.status ?? "invalid_request" });
    return;
  }
  await db.update(usersTable).set({
    passwordHash: hashPassword(parsed.data.newPassword),
    failedLoginAttempts: 0,
    lockedUntil: null,
  }).where(eq(usersTable.id, result.record.userId));
  await recordAuditLog({ userId: result.record.userId, action: "password_reset_completed", req });
  res.json({ message: "Password updated" });
});

// ── Legal documents & acceptance ────────────────────────────────
const legalDocTypeSchema = z.enum([
  "terms_of_use", "privacy_policy", "lgpd", "freelancer_agreement", "company_agreement",
  "payment_policy", "cancellation_policy", "community_guidelines", "anti_fraud_policy",
]);

router.get("/legal/documents/:type", async (req, res) => {
  const parsed = legalDocTypeSchema.safeParse(req.params.type);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid document type" });
    return;
  }
  const doc = await getLatestPublishedDocument(parsed.data);
  if (!doc) {
    res.status(404).json({ error: "No published document of this type" });
    return;
  }
  res.json(doc);
});

router.post("/legal/accept", requireAuth, async (req, res) => {
  const parsed = z.object({ documentId: z.number() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const [document] = await db.select().from(legalDocumentsTable)
    .where(eq(legalDocumentsTable.id, parsed.data.documentId)).limit(1);
  if (!document || document.status !== "published") {
    res.status(404).json({ error: "Document not found or not published" });
    return;
  }
  const record = await recordLegalAcceptance({ userId: user.id, document, req });
  res.status(201).json(record);
});

router.get("/legal/acceptances/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const rows = await db.select().from(legalAcceptancesTable).where(eq(legalAcceptancesTable.userId, user.id));
  res.json(rows);
});

// ── KYC documents ────────────────────────────────────────────────
const kycDocTypeSchema = z.enum(["rg", "cnh", "cpf_card", "cnpj_card", "proof_of_address", "selfie", "company_contract", "other"]);

router.post("/kyc/documents", requireAuth, async (req, res) => {
  const parsed = z.object({ documentType: kycDocTypeSchema, fileUrl: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const user = (req as any).user;
  const record = await submitKycDocument({ userId: user.id, documentType: parsed.data.documentType, fileUrl: parsed.data.fileUrl });
  await recordAuditLog({ userId: user.id, action: "kyc_document_submitted", details: { documentType: parsed.data.documentType }, req });

  // Once documents are pending review, move the account state forward.
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
  if (dbUser && dbUser.accountStatus === "pending_documents") {
    await db.update(usersTable).set({ accountStatus: "pending_review" }).where(eq(usersTable.id, user.id));
  }
  res.status(201).json(record);
});

router.get("/kyc/documents/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const rows = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, user.id));
  res.json(rows);
});

// ── Admin review ───────────────────────────────────────────────
router.get("/admin/kyc/documents", requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const rows = status
    ? await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.status, status as any))
    : await db.select().from(kycDocumentsTable);
  res.json(rows);
});

router.get("/admin/kyc/documents/:id/history", requireAdmin, async (req, res) => {
  const documentId = Number(req.params.id);
  if (!Number.isInteger(documentId)) {
    res.status(400).json({ error: "Invalid document id" });
    return;
  }
  const rows = await db.select().from(kycReviewHistoryTable).where(eq(kycReviewHistoryTable.kycDocumentId, documentId));
  res.json(rows);
});

router.post("/admin/kyc/documents/:id/review", requireAdmin, async (req, res) => {
  const documentId = Number(req.params.id);
  const parsed = z.object({
    action: z.enum(["approved", "rejected", "correction_requested", "comment"]),
    notes: z.string().optional(),
  }).safeParse(req.body);
  if (!Number.isInteger(documentId) || !parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const reviewer = (req as any).user;
  const result = await reviewKycDocument({ documentId, reviewerId: reviewer.id, ...parsed.data });
  if (!result) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  await recordAuditLog({
    userId: result.document.userId,
    action: "kyc_document_reviewed",
    details: { documentId, reviewerId: reviewer.id, action: parsed.data.action, notes: parsed.data.notes },
    req,
  });
  res.json(result);
});

export default router;
