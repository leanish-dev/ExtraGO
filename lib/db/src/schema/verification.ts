import { pgTable, serial, text, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * ═══════════════════════════════════════════════════════════
 * AUTHENTICATION / KYC / LEGAL INFRASTRUCTURE — PHASE 1
 * Architecture prepared for Phase 2 implementation.
 * No table here is temporary — all are production-ready.
 * ═══════════════════════════════════════════════════════════
 */

// ── Account lifecycle ──────────────────────────────────────
export const accountStatusEnum = pgEnum("account_status", [
  "draft",
  "pending_email",
  "pending_phone",
  "pending_documents",
  "pending_review",
  "verified",
  "rejected",
  "blocked",
  "inactive",
]);

// ── Legal documents ─────────────────────────────────────────
export const legalDocumentTypeEnum = pgEnum("legal_document_type", [
  "terms_of_use",
  "privacy_policy",
  "lgpd",
  "freelancer_agreement",
  "company_agreement",
  "payment_policy",
  "cancellation_policy",
  "community_guidelines",
  "anti_fraud_policy",
]);

export const legalDocumentStatusEnum = pgEnum("legal_document_status", [
  "draft",
  "published",
  "archived",
]);

export const legalDocumentsTable = pgTable("legal_documents", {
  id: serial("id").primaryKey(),
  type: legalDocumentTypeEnum("type").notNull(),
  version: text("version").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull(),
  status: legalDocumentStatusEnum("status").notNull().default("draft"),
  publicationDate: timestamp("publication_date"),
  effectiveDate: timestamp("effective_date"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Permanent, append-only audit log of legal acceptances — never overwritten.
export const legalAcceptancesTable = pgTable("legal_acceptances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentId: integer("document_id").notNull(),
  documentType: legalDocumentTypeEnum("document_type").notNull(),
  version: text("version").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  browser: text("browser"),
  operatingSystem: text("operating_system"),
  device: text("device"),
  signatureHash: text("signature_hash").notNull(),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
});

// ── Email verification (also backs password-reset & email-change flows) ──
export const emailVerificationPurposeEnum = pgEnum("email_verification_purpose", [
  "verify_email",
  "password_reset",
  "change_email",
]);

export const emailVerificationsTable = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: text("email").notNull(),
  purpose: emailVerificationPurposeEnum("purpose").notNull().default("verify_email"),
  token: text("token").notNull().unique(),
  otpCode: text("otp_code"),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  resendCount: integer("resend_count").notNull().default(0),
  lastSentAt: timestamp("last_sent_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  deliveryProvider: text("delivery_provider"),
  deliveryError: text("delivery_error"),
});

// ── Phone verification ──────────────────────────────────────
export const phoneVerificationChannelEnum = pgEnum("phone_verification_channel", [
  "sms",
  "whatsapp",
]);

export const phoneVerificationsTable = pgTable("phone_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  channel: phoneVerificationChannelEnum("channel").notNull().default("sms"),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  attempts: integer("attempts").notNull().default(0),
  lastSentAt: timestamp("last_sent_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Document (KYC) system ───────────────────────────────────
export const kycDocumentTypeEnum = pgEnum("kyc_document_type", [
  "rg",
  "cnh",
  "cpf_card",
  "cnpj_card",
  "proof_of_address",
  "selfie",
  "company_contract",
  "other",
]);

export const kycDocumentStatusEnum = pgEnum("kyc_document_status", [
  "pending",
  "approved",
  "rejected",
  "correction_requested",
]);

export const kycDocumentsTable = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: kycDocumentTypeEnum("document_type").notNull(),
  fileUrl: text("file_url").notNull(),
  version: integer("version").notNull().default(1),
  status: kycDocumentStatusEnum("status").notNull().default("pending"),
  reviewerId: integer("reviewer_id"),
  reviewNotes: text("review_notes"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const kycReviewActionEnum = pgEnum("kyc_review_action", [
  "approved",
  "rejected",
  "correction_requested",
  "comment",
]);

// Append-only reviewer history — every action on a KYC document is preserved.
export const kycReviewHistoryTable = pgTable("kyc_review_history", {
  id: serial("id").primaryKey(),
  kycDocumentId: integer("kyc_document_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  action: kycReviewActionEnum("action").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Security / fraud ─────────────────────────────────────────
export const loginAttemptsTable = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fraudLogTypeEnum = pgEnum("fraud_log_type", [
  "duplicate_cpf",
  "duplicate_cnpj",
  "duplicate_email",
  "duplicate_phone",
  "disposable_email",
  "rate_limit_exceeded",
  "account_locked",
  "suspicious_login",
  "other",
]);

export const fraudLogTable = pgTable("fraud_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: fraudLogTypeEnum("type").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── General verification / auth audit log (append-only) ─────
export const verificationAuditLogTable = pgTable("verification_audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Zod / types ───────────────────────────────────────────────
export const insertLegalDocumentSchema = createInsertSchema(legalDocumentsTable).omit({ id: true, createdAt: true });
export type InsertLegalDocument = z.infer<typeof insertLegalDocumentSchema>;
export type LegalDocument = typeof legalDocumentsTable.$inferSelect;

export const insertLegalAcceptanceSchema = createInsertSchema(legalAcceptancesTable).omit({ id: true, acceptedAt: true });
export type InsertLegalAcceptance = z.infer<typeof insertLegalAcceptanceSchema>;
export type LegalAcceptance = typeof legalAcceptancesTable.$inferSelect;

export const insertEmailVerificationSchema = createInsertSchema(emailVerificationsTable).omit({ id: true, createdAt: true });
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerificationsTable.$inferSelect;

export const insertPhoneVerificationSchema = createInsertSchema(phoneVerificationsTable).omit({ id: true, createdAt: true });
export type InsertPhoneVerification = z.infer<typeof insertPhoneVerificationSchema>;
export type PhoneVerification = typeof phoneVerificationsTable.$inferSelect;

export const insertKycDocumentSchema = createInsertSchema(kycDocumentsTable).omit({ id: true, createdAt: true });
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type KycDocument = typeof kycDocumentsTable.$inferSelect;

export const insertKycReviewHistorySchema = createInsertSchema(kycReviewHistoryTable).omit({ id: true, createdAt: true });
export type InsertKycReviewHistory = z.infer<typeof insertKycReviewHistorySchema>;
export type KycReviewHistory = typeof kycReviewHistoryTable.$inferSelect;

export const insertLoginAttemptSchema = createInsertSchema(loginAttemptsTable).omit({ id: true, createdAt: true });
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;
export type LoginAttempt = typeof loginAttemptsTable.$inferSelect;

export const insertFraudLogSchema = createInsertSchema(fraudLogTable).omit({ id: true, createdAt: true });
export type InsertFraudLog = z.infer<typeof insertFraudLogSchema>;
export type FraudLog = typeof fraudLogTable.$inferSelect;

export const insertVerificationAuditLogSchema = createInsertSchema(verificationAuditLogTable).omit({ id: true, createdAt: true });
export type InsertVerificationAuditLog = z.infer<typeof insertVerificationAuditLogSchema>;
export type VerificationAuditLog = typeof verificationAuditLogTable.$inferSelect;
