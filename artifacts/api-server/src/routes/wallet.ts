import { Router } from "express";
import { db, walletsTable, transactionsTable, depositRequestsTable, usersTable } from "@workspace/db";
import { eq, sql, and, desc, gte, lte } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { RequestWithdrawalBody, ListTransactionsQueryParams } from "@workspace/api-zod";
import { ensureWallet } from "../lib/ecosystem";

const router = Router();

function formatTransaction(t: any) {
  return {
    id: t.id,
    walletId: t.walletId,
    type: t.type,
    amount: t.amount,
    description: t.description,
    status: t.status,
    pixKey: t.pixKey ?? null,
    referenceId: t.referenceId ?? null,
    createdAt: t.createdAt?.toISOString(),
  };
}

function formatWallet(wallet: any) {
  return {
    id: wallet.id,
    userId: wallet.userId,
    walletType: wallet.walletType,
    balance: wallet.balance,
    reservedBalance: wallet.reservedBalance,
    pendingBalance: wallet.pendingBalance,
    totalEarned: wallet.totalEarned,
    totalWithdrawn: wallet.totalWithdrawn,
    totalFeesPaid: wallet.totalFeesPaid,
    totalSpent: wallet.totalSpent,
  };
}

// GET /wallet/me
router.get("/wallet/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const walletType = user.role === "company" ? "company" : user.role === "admin" ? "platform" : "freelancer";
  const wallet = await ensureWallet(user.id, walletType as any);
  res.json(formatWallet(wallet));
});

// GET /wallet/transactions
router.get("/wallet/transactions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const { type } = parsed.data ?? {};
  const page = parseInt((req.query.page as string) ?? "1") || 1;
  const limit = parseInt((req.query.limit as string) ?? "50") || 50;
  const offset = (page - 1) * limit;

  const walletType = user.role === "company" ? "company" : user.role === "admin" ? "platform" : "freelancer";
  const wallet = await ensureWallet(user.id, walletType as any);

  const conditions = [eq(transactionsTable.walletId, wallet.id)];

  if (type) conditions.push(eq(transactionsTable.type, type as any));

  const statusFilter = req.query.status as string | undefined;
  if (statusFilter) conditions.push(eq(transactionsTable.status, statusFilter as any));

  const fromFilter = req.query.from as string | undefined;
  if (fromFilter) {
    const fromDate = new Date(fromFilter);
    if (!isNaN(fromDate.getTime())) conditions.push(gte(transactionsTable.createdAt, fromDate));
  }

  const toFilter = req.query.to as string | undefined;
  if (toFilter) {
    const toDate = new Date(toFilter);
    if (!isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactionsTable.createdAt, toDate));
    }
  }

  const transactions = await db.select().from(transactionsTable)
    .where(and(...conditions))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(transactions.map(formatTransaction));
});

// POST /wallet/withdraw
router.post("/wallet/withdraw", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "freelancer") {
    res.status(403).json({ error: "Only freelancers can withdraw" });
    return;
  }

  const parsed = RequestWithdrawalBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { amount, pixKey } = parsed.data;

  const wallet = await ensureWallet(user.id, "freelancer");

  if (wallet.balance < amount) {
    res.status(400).json({ error: "Insufficient balance" });
    return;
  }

  if (amount < 20) {
    res.status(400).json({ error: "Minimum withdrawal is R$20" });
    return;
  }

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
    description: `Saque via PIX — ${pixKey}`,
    status: "pending",
    pixKey,
  }).returning();

  res.status(201).json(formatTransaction(transaction));
});

// POST /wallet/deposit-request — companies request a balance top-up
router.post("/wallet/deposit-request", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "company") { res.status(403).json({ error: "Only companies can request deposits" }); return; }

  const { amount, paymentMethod, pixKey } = req.body;
  if (!amount || typeof amount !== "number" || amount < 5000) {
    res.status(400).json({ error: "Minimum deposit is R$50.00" }); return;
  }

  const validMethods = ["pix", "credit_card"];
  if (paymentMethod && !validMethods.includes(paymentMethod)) {
    res.status(400).json({ error: "Invalid payment method" }); return;
  }

  const wallet = await ensureWallet(user.id, "company");

  const [depositRequest] = await db.insert(depositRequestsTable).values({
    walletId: wallet.id,
    userId: user.id,
    amount,
    paymentMethod: (paymentMethod ?? "pix") as any,
    pixKey: pixKey ?? null,
    status: "pending",
  }).returning();

  await db.insert(transactionsTable).values({
    walletId: wallet.id,
    type: "deposit",
    amount,
    description: `Depósito via ${paymentMethod === "credit_card" ? "Cartão de Crédito" : "PIX"} — aguardando confirmação`,
    status: "pending",
    referenceId: `deposit:${depositRequest.id}`,
  }).catch(() => {});

  res.status(201).json({
    id: depositRequest.id,
    walletId: depositRequest.walletId,
    amount: depositRequest.amount,
    paymentMethod: depositRequest.paymentMethod,
    pixKey: depositRequest.pixKey ?? null,
    status: depositRequest.status,
    createdAt: depositRequest.createdAt?.toISOString(),
  });
});

// GET /wallet/deposit-requests — company sees their deposit history
router.get("/wallet/deposit-requests", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "company" && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const deposits = await db.select().from(depositRequestsTable)
    .where(eq(depositRequestsTable.userId, user.id))
    .orderBy(desc(depositRequestsTable.createdAt))
    .limit(100);

  res.json(deposits.map(d => ({
    id: d.id,
    walletId: d.walletId,
    amount: d.amount,
    paymentMethod: d.paymentMethod,
    pixKey: d.pixKey ?? null,
    status: d.status,
    adminNote: d.adminNote ?? null,
    createdAt: d.createdAt?.toISOString(),
    updatedAt: d.updatedAt?.toISOString(),
  })));
});

export default router;
