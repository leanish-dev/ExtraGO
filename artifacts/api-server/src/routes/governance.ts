import { Router } from "express";
import { db, usersTable, platformConfigTable, walletsTable, transactionsTable, categoriesTable, walletLedgerTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";
import { invalidateSplitConfigCache, loadSplitConfig, DEFAULT_SPLIT_CONFIG } from "../lib/split-engine";

const router = Router();

const CEO_EMAILS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];

function requireCEO(req: any, res: any, next: any) {
  const user = req.user;
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!CEO_EMAILS.includes((user.email ?? "").toLowerCase())) {
    res.status(403).json({ error: "Acesso restrito ao CEO" }); return;
  }
  next();
}

const DEFAULTS: Record<string, number> = {
  level_fee_bronze: 0.20,
  level_fee_silver: 0.18,
  level_fee_gold: 0.15,
  level_fee_elite: 0.12,
  level_fee_diamond: 0.10,
  referral_rate_indicador: 0.02,
  referral_rate_agente: 0.03,
  referral_rate_embaixador: 0.05,
  level_threshold_silver_jobs: 20,
  level_threshold_silver_rep: 4.5,
  level_threshold_gold_jobs: 100,
  level_threshold_gold_rep: 4.7,
  level_threshold_elite_jobs: 300,
  level_threshold_elite_rep: 4.8,
  level_threshold_diamond_jobs: 600,
  level_threshold_diamond_rep: 4.9,
};

// ─── Config (existing fees & thresholds) ──────────────────────────────────────

// GET /admin/governance/config
router.get("/admin/governance/config", requireAuth, requireCEO, async (req, res) => {
  const stored = await db.select().from(platformConfigTable);
  const config: Record<string, any> = { ...DEFAULTS };
  stored.forEach(c => { if (c.key in DEFAULTS) config[c.key] = c.value; });

  const lastUpdated = stored.filter(c => c.key in DEFAULTS).length > 0
    ? stored.filter(c => c.key in DEFAULTS).reduce((a, b) => a.updatedAt > b.updatedAt ? a : b).updatedAt
    : null;

  res.json({ config, defaults: DEFAULTS, lastUpdatedAt: lastUpdated });
});

// PUT /admin/governance/config
router.put("/admin/governance/config", requireAuth, requireCEO, async (req, res) => {
  const updates = req.body as Record<string, number>;
  const userId = (req as any).user.id;
  if (!updates || typeof updates !== "object") {
    res.status(400).json({ error: "Invalid body" }); return;
  }
  for (const [key, value] of Object.entries(updates)) {
    if (!(key in DEFAULTS)) continue;
    const [existing] = await db.select({ id: platformConfigTable.id })
      .from(platformConfigTable).where(eq(platformConfigTable.key, key)).limit(1);
    if (existing) {
      await db.update(platformConfigTable)
        .set({ value: value as any, updatedAt: new Date(), updatedBy: userId })
        .where(eq(platformConfigTable.key, key));
    } else {
      await db.insert(platformConfigTable)
        .values({ key, value: value as any, updatedBy: userId });
    }
  }
  invalidateSplitConfigCache();
  res.json({ message: "Configurações salvas com sucesso" });
});

// ─── Financial Governance (Split Engine config) ───────────────────────────────

// GET /admin/governance/financial
router.get("/admin/governance/financial", requireAuth, requireCEO, async (_req, res) => {
  try {
    const config = await loadSplitConfig();
    res.json({
      config,
      defaults: DEFAULT_SPLIT_CONFIG,
      description: {
        representativeRate: "Comissão regional — percentual da taxa da plataforma destinado ao representante estadual",
        investorRate: "Participação de investidores — percentual da taxa da plataforma reservado para investidores parceiros",
        reserveFundRate: "Fundo de reserva — percentual da taxa da plataforma retido como reserva operacional",
        escrowRules: "Regras de escrow — comportamento do sistema de custódia de pagamentos",
        withdrawalRules: "Regras de saque — limites e prazos para saques PIX",
        asaasConfig: "Configuração Asaas — status e ambiente da integração financeira",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar configuração financeira", detail: err.message });
  }
});

// PUT /admin/governance/financial
router.put("/admin/governance/financial", requireAuth, requireCEO, async (req, res) => {
  const body = req.body as Record<string, any>;
  const userId = (req as any).user.id;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid body" }); return;
  }

  const FINANCIAL_KEYS = [
    "financial.representative_rate",
    "financial.investor_rate",
    "financial.reserve_fund_rate",
    "financial.escrow_rules",
    "financial.withdrawal_rules",
    "financial.asaas_config",
    "financial.referral_thresholds",
  ];

  const updates: Record<string, any> = {};
  if (body.representativeRate !== undefined) updates["financial.representative_rate"] = Number(body.representativeRate);
  if (body.investorRate !== undefined) updates["financial.investor_rate"] = Number(body.investorRate);
  if (body.reserveFundRate !== undefined) updates["financial.reserve_fund_rate"] = Number(body.reserveFundRate);
  if (body.escrowRules !== undefined) updates["financial.escrow_rules"] = body.escrowRules;
  if (body.withdrawalRules !== undefined) updates["financial.withdrawal_rules"] = body.withdrawalRules;
  if (body.asaasConfig !== undefined) updates["financial.asaas_config"] = body.asaasConfig;
  if (body.referralThresholds !== undefined) updates["financial.referral_thresholds"] = body.referralThresholds;

  if (!Object.keys(updates).length) {
    res.status(400).json({ error: "Nenhuma configuração válida fornecida" }); return;
  }

  for (const [key, value] of Object.entries(updates)) {
    const [existing] = await db.select({ id: platformConfigTable.id })
      .from(platformConfigTable).where(eq(platformConfigTable.key, key)).limit(1);
    if (existing) {
      await db.update(platformConfigTable)
        .set({ value: value as any, updatedAt: new Date(), updatedBy: userId })
        .where(eq(platformConfigTable.key, key));
    } else {
      await db.insert(platformConfigTable)
        .values({ key, value: value as any, description: `Financial governance: ${key}`, updatedBy: userId });
    }
  }

  invalidateSplitConfigCache();
  res.json({ message: "Configuração financeira salva com sucesso" });
});

// ─── Categories Management ────────────────────────────────────────────────────

// GET /admin/governance/categories
router.get("/admin/governance/categories", requireAuth, requireCEO, async (req, res) => {
  try {
    const includeArchived = (req.query.includeArchived as string) === "true";
    const rows = await db.select().from(categoriesTable)
      .where(includeArchived ? undefined : eq(categoriesTable.status, "active"))
      .orderBy(categoriesTable.displayOrder, categoriesTable.name);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao listar categorias", detail: err.message });
  }
});

// POST /admin/governance/categories
router.post("/admin/governance/categories", requireAuth, requireCEO, async (req, res) => {
  const { name, description, icon, displayOrder, rules } = req.body;
  const userId = (req as any).user.id;
  if (!name?.trim()) { res.status(400).json({ error: "Nome é obrigatório" }); return; }
  const slug = String(name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  try {
    const [created] = await db.insert(categoriesTable).values({
      name: String(name).trim(),
      slug,
      description: description ?? null,
      icon: icon ?? null,
      displayOrder: Number(displayOrder ?? 0),
      rules: rules ?? null,
      status: "active",
      createdBy: userId,
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    if (err.message?.includes("unique")) {
      res.status(409).json({ error: "Já existe uma categoria com este nome" }); return;
    }
    res.status(500).json({ error: "Erro ao criar categoria", detail: err.message });
  }
});

// PUT /admin/governance/categories/:id
router.put("/admin/governance/categories/:id", requireAuth, requireCEO, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { name, description, icon, displayOrder, rules, status } = req.body;
  const update: Record<string, any> = { updatedAt: new Date() };
  if (name !== undefined) {
    update.name = String(name).trim();
    update.slug = String(name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  if (description !== undefined) update.description = description;
  if (icon !== undefined) update.icon = icon;
  if (displayOrder !== undefined) update.displayOrder = Number(displayOrder);
  if (rules !== undefined) update.rules = rules;
  if (status !== undefined && ["active", "archived"].includes(status)) update.status = status;
  const [updated] = await db.update(categoriesTable).set(update).where(eq(categoriesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Categoria não encontrada" }); return; }
  res.json(updated);
});

// DELETE /admin/governance/categories/:id  (archives, never hard-deletes)
router.delete("/admin/governance/categories/:id", requireAuth, requireCEO, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.update(categoriesTable)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(categoriesTable.id, id));
  res.json({ message: "Categoria arquivada" });
});

// PUT /admin/governance/categories/reorder  — batch update display order
router.put("/admin/governance/categories/reorder", requireAuth, requireCEO, async (req, res) => {
  const items = req.body as Array<{ id: number; displayOrder: number }>;
  if (!Array.isArray(items)) { res.status(400).json({ error: "Invalid body" }); return; }
  for (const { id, displayOrder } of items) {
    await db.update(categoriesTable)
      .set({ displayOrder: Number(displayOrder), updatedAt: new Date() })
      .where(eq(categoriesTable.id, id));
  }
  res.json({ message: "Ordem atualizada" });
});

// ─── Platform Wallet ──────────────────────────────────────────────────────────

const PLATFORM_USER_ID = 1;

// GET /admin/governance/platform-wallet
router.get("/admin/governance/platform-wallet", requireAuth, requireCEO, async (_req, res) => {
  try {
    const [platformWallet] = await db.select().from(walletsTable)
      .where(eq(walletsTable.walletType, "platform")).limit(1);

    // Sum of platform_fee transactions = total fees collected
    const [feeSum] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.type, "platform_fee" as any),
        eq(transactionsTable.status, "completed"),
      ));

    // Sum of commission transactions (referral liabilities paid)
    const [commissionSum] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.type, "commission" as any),
        eq(transactionsTable.status, "completed"),
      ));

    // Pending withdrawals (freelancer liabilities)
    const [withdrawalPending] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.type, "withdrawal" as any),
        eq(transactionsTable.status, "pending"),
      ));

    // Recent platform transactions (last 20)
    const recentTx = await db.select().from(transactionsTable)
      .where(sql`wallet_id = (SELECT id FROM wallets WHERE wallet_type = 'platform' LIMIT 1)`)
      .orderBy(desc(transactionsTable.createdAt))
      .limit(20);

    res.json({
      wallet: platformWallet ?? null,
      metrics: {
        totalFeesCollected: feeSum?.total ?? 0,
        referralCommissionsPaid: commissionSum?.total ?? 0,
        pendingWithdrawals: withdrawalPending?.total ?? 0,
        balance: platformWallet?.balance ?? 0,
        totalEarned: platformWallet?.totalEarned ?? 0,
        totalWithdrawn: platformWallet?.totalWithdrawn ?? 0,
      },
      recentTransactions: recentTx,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar carteira da plataforma", detail: err.message });
  }
});

// ─── Ledger ────────────────────────────────────────────────────────────────────

// GET /admin/governance/ledger
router.get("/admin/governance/ledger", requireAuth, requireCEO, async (req, res) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? "50")));
    const offset = (page - 1) * limit;
    const type = req.query.type as string | undefined;

    const where = type ? eq(walletLedgerTable.type, type) : undefined;

    const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(walletLedgerTable)
      .where(where);

    const rows = await db.select().from(walletLedgerTable)
      .where(where)
      .orderBy(desc(walletLedgerTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      entries: rows,
      pagination: { page, limit, total: Number(count), pages: Math.ceil(Number(count) / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao carregar ledger", detail: err.message });
  }
});

// ─── Admin Users ──────────────────────────────────────────────────────────────

// GET /admin/governance/admins
router.get("/admin/governance/admins", requireAuth, requireCEO, async (req, res) => {
  const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  res.json(admins.map(u => formatUser(u)));
});

// POST /admin/governance/users/:id/promote
router.post("/admin/governance/users/:id/promote", requireAuth, requireCEO, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { adminRole, corporateRole } = req.body;
  const update: Record<string, any> = {};
  if (adminRole) update.adminRole = adminRole;
  if (corporateRole !== undefined) update.corporateRole = corporateRole;
  if (!Object.keys(update).length) { res.status(400).json({ error: "No changes" }); return; }
  await db.update(usersTable).set(update).where(eq(usersTable.id, id));
  res.json({ message: "Usuário atualizado" });
});

// GET /admin/governance/users/:id/overrides
router.get("/admin/governance/users/:id/overrides", requireAuth, requireCEO, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [user] = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, level: usersTable.level,
    customFee: usersTable.customFee, customReferralRate: usersTable.customReferralRate,
    governanceNotes: usersTable.governanceNotes,
  }).from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Usuário não encontrado" }); return; }
  res.json(user);
});

// PUT /admin/governance/users/:id/overrides
router.put("/admin/governance/users/:id/overrides", requireAuth, requireCEO, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { customFee, customReferralRate, governanceNotes } = req.body;
  const update: Record<string, any> = {};
  if (customFee !== undefined) update.customFee = customFee === null ? null : Number(customFee);
  if (customReferralRate !== undefined) update.customReferralRate = customReferralRate === null ? null : Number(customReferralRate);
  if (governanceNotes !== undefined) update.governanceNotes = governanceNotes ?? null;
  if (!Object.keys(update).length) { res.status(400).json({ error: "No changes provided" }); return; }
  await db.update(usersTable).set(update).where(eq(usersTable.id, id));
  res.json({ message: "Overrides salvos com sucesso" });
});

// GET /admin/governance/overrides
router.get("/admin/governance/overrides", requireAuth, requireCEO, async (_req, res) => {
  const users = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    role: usersTable.role, level: usersTable.level,
    customFee: usersTable.customFee, customReferralRate: usersTable.customReferralRate,
    governanceNotes: usersTable.governanceNotes,
  }).from(usersTable).where(
    sql`${usersTable.customFee} IS NOT NULL OR ${usersTable.customReferralRate} IS NOT NULL OR ${usersTable.governanceNotes} IS NOT NULL`
  );
  res.json(users);
});

// ─── Badges ───────────────────────────────────────────────────────────────────

// POST /admin/governance/badges/grant
router.post("/admin/governance/badges/grant", requireAuth, requireCEO, async (req, res) => {
  const { userId, badge, description, icon, color, category } = req.body;
  if (!userId || !badge) { res.status(400).json({ error: "userId e badge são obrigatórios" }); return; }
  const key = `badge:${userId}:${String(badge).replace(/\s+/g, "_").toLowerCase()}`;
  const [existing] = await db.select({ id: platformConfigTable.id })
    .from(platformConfigTable).where(eq(platformConfigTable.key, key)).limit(1);
  if (existing) { res.status(409).json({ error: "Badge já concedido" }); return; }
  await db.insert(platformConfigTable).values({
    key,
    value: {
      userId, badge,
      description: description ?? "",
      icon: icon ?? "award",
      color: color ?? "primary",
      category: category ?? "special",
      grantedAt: new Date().toISOString(),
    } as any,
    description: `Badge: ${badge} → user ${userId}`,
    updatedBy: (req as any).user.id,
  });
  res.json({ message: "Badge concedido" });
});

// DELETE /admin/governance/badges/:id
router.delete("/admin/governance/badges/:id", requireAuth, requireCEO, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(platformConfigTable).where(eq(platformConfigTable.id, id));
  res.json({ message: "Badge removido" });
});

// GET /admin/governance/badges
router.get("/admin/governance/badges", requireAuth, requireCEO, async (_req, res) => {
  const all = await db.select().from(platformConfigTable);
  const badgeEntries = all.filter(c => c.key.startsWith("badge:"));
  if (!badgeEntries.length) { res.json([]); return; }

  const userIds = [...new Set(
    badgeEntries.map(b => (b.value as any)?.userId as number).filter(Boolean)
  )];
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(sql`${usersTable.id} = ANY(ARRAY[${sql.join(userIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    : [];
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(badgeEntries.map(b => {
    const v = (typeof b.value === "object" && b.value !== null ? b.value : {}) as any;
    return {
      id: b.id, key: b.key,
      userId: v.userId, badge: v.badge,
      description: v.description, grantedAt: v.grantedAt,
      icon: v.icon ?? "award",
      color: v.color ?? "primary",
      category: v.category ?? "special",
      userName: userMap.get(v.userId)?.name ?? null,
      userEmail: userMap.get(v.userId)?.email ?? null,
    };
  }));
});

export default router;
