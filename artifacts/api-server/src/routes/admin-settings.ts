import { Router } from "express";
import { db, platformSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAdminRole, logAuditAction } from "../lib/auth";

const router = Router();

const DEFAULT_SETTINGS = [
  { key: "platform_fee_pct", value: "10", label: "Taxa da Plataforma (%)", description: "Percentual cobrado sobre cada transação", category: "financial" },
  { key: "referral_bonus_brl", value: "5000", label: "Bônus de Indicação (centavos)", description: "Valor em centavos creditado ao indicador", category: "referral" },
  { key: "referral_discount_pct", value: "5", label: "Desconto Indicado (%)", description: "Desconto concedido ao usuário indicado", category: "referral" },
  { key: "min_withdrawal_brl", value: "5000", label: "Saque Mínimo (centavos)", description: "Valor mínimo para solicitação de saque", category: "financial" },
  { key: "max_withdrawal_daily_brl", value: "500000", label: "Saque Máximo Diário (centavos)", description: "Limite diário de saques por usuário", category: "financial" },
  { key: "rep_commission_pct", value: "20", label: "Comissão Representante (%)", description: "Percentual destinado ao representante estadual", category: "distribution" },
  { key: "marketing_pct", value: "20", label: "Marketing & Operações (%)", description: "Percentual destinado a marketing e operações", category: "distribution" },
  { key: "human_capital_pct", value: "10", label: "Capital Humano (%)", description: "Percentual destinado a capital humano", category: "distribution" },
  { key: "bronze_jobs_required", value: "0", label: "Jobs p/ Bronze", description: "Jobs concluídos necessários para Bronze", category: "ranking" },
  { key: "silver_jobs_required", value: "5", label: "Jobs p/ Silver", description: "Jobs concluídos necessários para Silver", category: "ranking" },
  { key: "gold_jobs_required", value: "15", label: "Jobs p/ Gold", description: "Jobs concluídos necessários para Gold", category: "ranking" },
  { key: "elite_jobs_required", value: "30", label: "Jobs p/ Elite", description: "Jobs concluídos necessários para Elite", category: "ranking" },
  { key: "enable_referrals", value: "true", label: "Indicações Ativas", description: "Habilitar sistema de indicações", category: "features" },
  { key: "enable_feed", value: "true", label: "Feed Social Ativo", description: "Habilitar feed social da plataforma", category: "features" },
  { key: "enable_chat", value: "true", label: "Chat Ativo", description: "Habilitar sistema de mensagens", category: "features" },
  { key: "maintenance_mode", value: "false", label: "Modo de Manutenção", description: "Colocar plataforma em manutenção", category: "system" },
];

async function ensureDefaults() {
  const existing = await db.select().from(platformSettingsTable);
  const existingKeys = new Set(existing.map(s => s.key));
  const missing = DEFAULT_SETTINGS.filter(s => !existingKeys.has(s.key));
  if (missing.length > 0) {
    await db.insert(platformSettingsTable).values(missing);
  }
}

router.get("/admin/settings", requireAdmin, async (req, res) => {
  await ensureDefaults();
  const settings = await db.select().from(platformSettingsTable).orderBy(platformSettingsTable.category, platformSettingsTable.key);
  res.json(settings);
});

router.put("/admin/settings/:key", requireAdminRole(["super_admin", "financial_admin"]), async (req, res) => {
  const { key } = req.params;
  const { value } = req.body ?? {};
  if (value === undefined || value === null) {
    res.status(400).json({ error: "Value required" }); return;
  }
  const admin = (req as any).user;
  await db.update(platformSettingsTable)
    .set({ value: String(value), updatedBy: admin.id, updatedAt: new Date() })
    .where(eq(platformSettingsTable.key, key));
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "update_setting", targetType: "setting",
    details: { key, value },
  });
  res.json({ message: "Setting updated" });
});

router.post("/admin/settings/bulk", requireAdminRole(["super_admin"]), async (req, res) => {
  const { settings } = req.body ?? {};
  if (!Array.isArray(settings)) { res.status(400).json({ error: "settings array required" }); return; }
  const admin = (req as any).user;
  for (const { key, value } of settings) {
    if (!key) continue;
    await db.update(platformSettingsTable)
      .set({ value: String(value), updatedBy: admin.id, updatedAt: new Date() })
      .where(eq(platformSettingsTable.key, key));
  }
  await logAuditAction({
    adminId: admin.id, adminName: admin.name, adminRole: admin.adminRole,
    action: "bulk_update_settings",
    details: { count: settings.length },
  });
  res.json({ message: "Settings updated" });
});

export default router;
