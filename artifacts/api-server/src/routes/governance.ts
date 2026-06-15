import { Router } from "express";
import { db, usersTable, platformConfigTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, formatUser } from "../lib/auth";

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

// GET /admin/governance/config
router.get("/admin/governance/config", requireAuth, requireCEO, async (req, res) => {
  const stored = await db.select().from(platformConfigTable);
  const config: Record<string, any> = { ...DEFAULTS };
  stored.forEach(c => { if (c.key in DEFAULTS) config[c.key] = c.value; });

  const lastUpdated = stored.length > 0
    ? stored.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b).updatedAt
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
  res.json({ message: "Configurações salvas com sucesso" });
});

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

// POST /admin/governance/badges/grant
router.post("/admin/governance/badges/grant", requireAuth, requireCEO, async (req, res) => {
  const { userId, badge, description } = req.body;
  if (!userId || !badge) { res.status(400).json({ error: "userId e badge são obrigatórios" }); return; }
  const key = `badge:${userId}:${String(badge).replace(/\s+/g, "_").toLowerCase()}`;
  const [existing] = await db.select({ id: platformConfigTable.id })
    .from(platformConfigTable).where(eq(platformConfigTable.key, key)).limit(1);
  if (existing) { res.status(409).json({ error: "Badge já concedido" }); return; }
  await db.insert(platformConfigTable).values({
    key,
    value: { userId, badge, description: description ?? "", grantedAt: new Date().toISOString() } as any,
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
router.get("/admin/governance/badges", requireAuth, requireCEO, async (req, res) => {
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
      userName: userMap.get(v.userId)?.name ?? null,
      userEmail: userMap.get(v.userId)?.email ?? null,
    };
  }));
});

export default router;
