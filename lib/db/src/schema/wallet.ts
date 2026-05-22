import { pgTable, serial, integer, real, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionTypeEnum = pgEnum("transaction_type", ["credit", "debit", "withdrawal", "commission", "refund"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balance: real("balance").notNull().default(0),
  pendingBalance: real("pending_balance").notNull().default(0),
  totalEarned: real("total_earned").notNull().default(0),
  totalWithdrawn: real("total_withdrawn").notNull().default(0),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  pixKey: text("pix_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof walletsTable.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
