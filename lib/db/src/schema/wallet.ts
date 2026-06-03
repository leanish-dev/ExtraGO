import { pgTable, serial, integer, real, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletTypeEnum = pgEnum("wallet_type", ["freelancer", "company", "representative", "platform"]);
export const transactionTypeEnum = pgEnum("transaction_type", [
  "credit", "debit", "withdrawal", "commission", "refund",
  "deposit", "platform_fee", "reservation", "release",
]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "rejected"]);
export const depositMethodEnum = pgEnum("deposit_method", ["pix", "credit_card", "bank_transfer"]);
export const depositStatusEnum = pgEnum("deposit_status", ["pending", "confirmed", "rejected", "credited"]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  walletType: walletTypeEnum("wallet_type").notNull().default("freelancer"),
  balance: real("balance").notNull().default(0),
  reservedBalance: real("reserved_balance").notNull().default(0),
  pendingBalance: real("pending_balance").notNull().default(0),
  totalEarned: real("total_earned").notNull().default(0),
  totalWithdrawn: real("total_withdrawn").notNull().default(0),
  totalFeesPaid: real("total_fees_paid").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  pixKey: text("pix_key"),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const depositRequestsTable = pgTable("deposit_requests", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  paymentMethod: depositMethodEnum("payment_method").notNull().default("pix"),
  pixKey: text("pix_key"),
  status: depositStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  approvedById: integer("approved_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export const insertDepositRequestSchema = createInsertSchema(depositRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof walletsTable.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertDepositRequest = z.infer<typeof insertDepositRequestSchema>;
export type DepositRequest = typeof depositRequestsTable.$inferSelect;
