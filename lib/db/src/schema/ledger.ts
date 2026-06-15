import { pgTable, serial, integer, real, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Wallet Ledger — double-entry audit trail for every financial movement.
 *
 * Every balance mutation in walletsTable must produce a corresponding ledger entry.
 * Any balance can be reconstructed by replaying ledger entries from the beginning.
 *
 * referenceType: "job" | "application" | "withdrawal" | "deposit" | "commission" |
 *                "escrow_fund" | "escrow_release" | "escrow_cancel" | "platform_fee" |
 *                "referral_commission" | "representative_commission" | "reserve_fund"
 */
export const walletLedgerTable = pgTable("wallet_ledger", {
  id: serial("id").primaryKey(),
  debitWalletId: integer("debit_wallet_id"),
  creditWalletId: integer("credit_wallet_id"),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  referenceType: text("reference_type"),
  referenceId: text("reference_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by"),
});

export const insertWalletLedgerSchema = createInsertSchema(walletLedgerTable).omit({ id: true, createdAt: true });
export type InsertWalletLedger = z.infer<typeof insertWalletLedgerSchema>;
export type WalletLedger = typeof walletLedgerTable.$inferSelect;
