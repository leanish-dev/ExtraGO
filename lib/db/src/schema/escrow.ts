import { pgTable, serial, integer, real, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const escrowStatusEnum = pgEnum("escrow_status", [
  "draft",
  "open",
  "funded",
  "in_progress",
  "completed",
  "released",
  "cancelled",
  "disputed",
]);

/**
 * Escrow Foundation — holds payment until work completion.
 *
 * Workflow: draft → open → funded → in_progress → completed → released
 *           Any status → cancelled | disputed
 *
 * All fee amounts are calculated by the Split Engine at funding time
 * and stored here for audit purposes.
 *
 * Future: when Asaas integration is active, asaasChargeId and asaasTransferId
 * will be populated with the external payment identifiers.
 */
export const escrowsTable = pgTable("escrows", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id"),
  applicationId: integer("application_id"),
  companyWalletId: integer("company_wallet_id"),
  freelancerWalletId: integer("freelancer_wallet_id"),
  platformWalletId: integer("platform_wallet_id"),

  grossAmount: real("gross_amount").notNull(),
  platformFeeAmount: real("platform_fee_amount").notNull().default(0),
  referralFeeAmount: real("referral_fee_amount").notNull().default(0),
  representativeFeeAmount: real("representative_fee_amount").notNull().default(0),
  reserveFundAmount: real("reserve_fund_amount").notNull().default(0),
  netFreelancerAmount: real("net_freelancer_amount").notNull().default(0),

  feeRateSnapshot: real("fee_rate_snapshot"),
  referralRateSnapshot: real("referral_rate_snapshot"),
  representativeRateSnapshot: real("representative_rate_snapshot"),

  status: escrowStatusEnum("status").notNull().default("draft"),

  fundedAt: timestamp("funded_at"),
  inProgressAt: timestamp("in_progress_at"),
  completedAt: timestamp("completed_at"),
  releasedAt: timestamp("released_at"),
  cancelledAt: timestamp("cancelled_at"),
  disputeReason: text("dispute_reason"),

  asaasChargeId: text("asaas_charge_id"),
  asaasTransferId: text("asaas_transfer_id"),

  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEscrowSchema = createInsertSchema(escrowsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEscrow = z.infer<typeof insertEscrowSchema>;
export type Escrow = typeof escrowsTable.$inferSelect;
