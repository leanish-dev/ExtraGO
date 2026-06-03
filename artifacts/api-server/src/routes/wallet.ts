import { Router } from "express";
import { db, walletsTable, transactionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { RequestWithdrawalBody, ListTransactionsQueryParams } from "@workspace/api-zod";

const router = Router();

// GET /wallet/me
router.get("/wallet/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));

  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId: user.id }).returning();
  }

  res.json({
    id: wallet.id,
    userId: wallet.userId,
    balance: wallet.balance,
    pendingBalance: wallet.pendingBalance,
    totalEarned: wallet.totalEarned,
    totalWithdrawn: wallet.totalWithdrawn,
  });
});

// GET /wallet/transactions
router.get("/wallet/transactions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const { type } = parsed.data ?? {};

  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId: user.id }).returning();
  }

  let transactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.walletId, wallet.id))
    .orderBy(sql`${transactionsTable.createdAt} DESC`)
    .limit(100);

  if (type) transactions = transactions.filter(t => t.type === type);

  res.json(transactions.map(t => ({
    id: t.id,
    walletId: t.walletId,
    type: t.type,
    amount: t.amount,
    description: t.description,
    status: t.status,
    pixKey: t.pixKey ?? null,
    createdAt: t.createdAt?.toISOString(),
  })));
});

// POST /wallet/withdraw
router.post("/wallet/withdraw", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { amount, pixKey } = parsed.data;

  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
  if (!wallet) { res.status(400).json({ error: "Wallet not found" }); return; }

  if (wallet.balance < amount) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  if (amount < 20) {
    res.status(400).json({ error: "Minimum withdrawal is R$20" });
    return;
  }

  // Deduct balance and record transaction
  await db.update(walletsTable)
    .set({
      balance: wallet.balance - amount,
      totalWithdrawn: wallet.totalWithdrawn + amount,
    })
    .where(eq(walletsTable.id, wallet.id));

  const [transaction] = await db.insert(transactionsTable).values({
    walletId: wallet.id,
    type: "withdrawal",
    amount,
    description: `Saque via Pix — ${pixKey}`,
    status: "pending",
    pixKey,
  }).returning();

  res.status(201).json({
    id: transaction.id,
    walletId: transaction.walletId,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    status: transaction.status,
    pixKey: transaction.pixKey ?? null,
    createdAt: transaction.createdAt?.toISOString(),
  });
});

// POST /wallet/deposit-request — companies request a balance top-up
router.post("/wallet/deposit-request", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "company") { res.status(403).json({ error: "Only companies can request deposits" }); return; }

  const { amount, method } = req.body;
  if (!amount || amount < 5000) { res.status(400).json({ error: "Minimum deposit is R$50" }); return; }

  let [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
  if (!wallet) {
    [wallet] = await db.insert(walletsTable).values({ userId: user.id }).returning();
  }

  const [transaction] = await db.insert(transactionsTable).values({
    walletId: wallet.id,
    type: "credit",
    amount,
    description: `Depósito via ${method === "pix" ? "PIX" : "Transferência"} — aguardando confirmação`,
    status: "pending",
  }).returning();

  res.status(201).json({
    id: transaction.id,
    walletId: transaction.walletId,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    status: transaction.status,
    createdAt: transaction.createdAt?.toISOString(),
  });
});

export default router;
