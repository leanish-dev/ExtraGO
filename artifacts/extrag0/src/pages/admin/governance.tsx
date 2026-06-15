import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Settings, Users, Award, Save, RotateCcw, ChevronRight,
  Crown, AlertTriangle, Loader2, CheckCircle, Trash2, Search,
  Lock, Unlock, RefreshCw, Star, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CEO_EMAILS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];

interface PlatformConfig {
  config: Record<string, number>;
  defaults: Record<string, number>;
  lastUpdatedAt: string | null;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  adminRole?: string;
  corporateRole?: string;
  level: string;
  createdAt?: string;
}

interface BadgeGrant {
  id: number;
  key: string;
  userId: number;
  badge: string;
  description: string;
  grantedAt: string;
  userName: string | null;
  userEmail: string | null;
}

function SliderField({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : String(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-primary tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(90deg, hsl(var(--primary)) ${pct}%, rgba(255,255,255,0.1) 0%)`,
          accentColor: "hsl(var(--primary))",
        }}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/40">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

function CorporateRoleBadge({ role }: { role?: string }) {
  const map: Record<string, { label: string; color: string }> = {
    ceo: { label: "CEO", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    cmo: { label: "CMO", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    cco: { label: "CCO", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    cto: { label: "CTO", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  };
  if (!role) return null;
  const info = map[role] ?? { label: role.toUpperCase(), color: "bg-white/10 text-white/60 border-white/15" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${info.color}`}>
      <Crown size={9} />{info.label}
    </span>
  );
}

export default function GovernancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"config" | "team" | "badges">("config");
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [localConfig, setLocalConfig] = useState<Record<string, number>>({});
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [badges, setBadges] = useState<BadgeGrant[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgeForm, setBadgeForm] = useState({ userId: "", badge: "", description: "" });
  const [badgeGranting, setBadgeGranting] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const isCEO = CEO_EMAILS.includes((user?.email ?? "").toLowerCase());

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const data: PlatformConfig = await apiFetch("/api/admin/governance/config");
      setConfig(data);
      setLocalConfig({ ...data.config });
    } catch { /* noop */ }
    finally { setConfigLoading(false); }
  }, []);

  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const data: AdminUser[] = await apiFetch("/api/admin/governance/admins");
      setAdmins(data);
    } catch { /* noop */ }
    finally { setAdminsLoading(false); }
  }, []);

  const fetchBadges = useCallback(async () => {
    setBadgesLoading(true);
    try {
      const data: BadgeGrant[] = await apiFetch("/api/admin/governance/badges");
      setBadges(data);
    } catch { /* noop */ }
    finally { setBadgesLoading(false); }
  }, []);

  useEffect(() => {
    if (!isCEO) return;
    fetchConfig();
  }, [isCEO, fetchConfig]);

  useEffect(() => {
    if (activeTab === "team" && isCEO) fetchAdmins();
    if (activeTab === "badges" && isCEO) fetchBadges();
  }, [activeTab, isCEO, fetchAdmins, fetchBadges]);

  const handleSaveConfig = async () => {
    setConfigSaving(true);
    try {
      await apiFetch("/api/admin/governance/config", {
        method: "PUT",
        body: JSON.stringify(localConfig),
      });
      toast.success("Configurações salvas com sucesso");
      fetchConfig();
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setConfigSaving(false);
    }
  };

  const handleGrantBadge = async () => {
    if (!badgeForm.userId || !badgeForm.badge) {
      toast.error("Informe o ID do usuário e o nome do badge");
      return;
    }
    setBadgeGranting(true);
    try {
      await apiFetch("/api/admin/governance/badges/grant", {
        method: "POST",
        body: JSON.stringify({
          userId: parseInt(badgeForm.userId),
          badge: badgeForm.badge,
          description: badgeForm.description,
        }),
      });
      toast.success("Badge concedido com sucesso");
      setBadgeForm({ userId: "", badge: "", description: "" });
      fetchBadges();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao conceder badge");
    } finally {
      setBadgeGranting(false);
    }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      await apiFetch(`/api/admin/governance/badges/${id}`, { method: "DELETE" });
      toast.success("Badge removido");
      fetchBadges();
    } catch {
      toast.error("Erro ao remover badge");
    }
  };

  const pctFormat = (v: number) => `${(v * 100).toFixed(0)}%`;

  const hasConfigChanges = config && JSON.stringify(localConfig) !== JSON.stringify(config.config);
  const filteredAdmins = admins.filter(a =>
    !userSearch || a.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (!isCEO) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Lock size={32} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            O Centro de Governança é acessível apenas ao CEO da plataforma.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.2), rgba(0,229,255,0.1))", border: "1px solid rgba(124,252,0,0.25)" }}
          >
            <Shield size={22} style={{ color: "#7CFC00" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Centro de Governança</h1>
            <p className="text-xs text-muted-foreground">Controles exclusivos do CEO · Acesso verificado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold"
            style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.25)", color: "#7CFC00" }}
          >
            <CheckCircle size={12} />
            {user?.name ?? user?.email}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { id: "config", label: "Configurações", icon: <Settings size={14} /> },
          { id: "team", label: "Equipe Admin", icon: <Users size={14} /> },
          { id: "badges", label: "Badges", icon: <Award size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-black"
                : "text-muted-foreground hover:text-foreground hover:bg-white/4"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONFIG TAB */}
      <AnimatePresence mode="wait">
        {activeTab === "config" && (
          <motion.div key="config" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {configLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary/60" /></div>
            ) : (
              <>
                {/* Level Fees */}
                <div
                  className="rounded-2xl p-5 space-y-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-primary" />
                    <h3 className="text-sm font-bold">Taxas por Nível</h3>
                    <span className="text-[10px] text-muted-foreground ml-auto">descontado do profissional por extra concluído</span>
                  </div>
                  {[
                    { key: "level_fee_bronze", label: "Iniciante (Bronze)" },
                    { key: "level_fee_silver", label: "Júnior (Prata)" },
                    { key: "level_fee_gold", label: "Intermediário (Ouro)" },
                    { key: "level_fee_elite", label: "Sênior (Elite)" },
                    { key: "level_fee_diamond", label: "Elite (Diamante)" },
                  ].map(({ key, label }) => (
                    <SliderField
                      key={key}
                      label={label}
                      value={localConfig[key] ?? config?.defaults[key] ?? 0}
                      min={0.05} max={0.30} step={0.01}
                      onChange={v => setLocalConfig(prev => ({ ...prev, [key]: v }))}
                      format={pctFormat}
                    />
                  ))}
                </div>

                {/* Referral Rates */}
                <div
                  className="rounded-2xl p-5 space-y-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Star size={16} className="text-primary" />
                    <h3 className="text-sm font-bold">Comissões de Indicação</h3>
                    <span className="text-[10px] text-muted-foreground ml-auto">% pago ao indicador sobre cada extra</span>
                  </div>
                  {[
                    { key: "referral_rate_indicador", label: "Indicador" },
                    { key: "referral_rate_agente", label: "Agente de Captação" },
                    { key: "referral_rate_embaixador", label: "Embaixador Regional" },
                  ].map(({ key, label }) => (
                    <SliderField
                      key={key}
                      label={label}
                      value={localConfig[key] ?? config?.defaults[key] ?? 0}
                      min={0.005} max={0.10} step={0.005}
                      onChange={v => setLocalConfig(prev => ({ ...prev, [key]: v }))}
                      format={pctFormat}
                    />
                  ))}
                </div>

                {/* Level Thresholds */}
                <div
                  className="rounded-2xl p-5 space-y-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-primary" />
                    <h3 className="text-sm font-bold">Requisitos de Evolução</h3>
                    <span className="text-[10px] text-muted-foreground ml-auto">mínimo de extras + reputação para subir de nível</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { jobsKey: "level_threshold_silver_jobs", repKey: "level_threshold_silver_rep", label: "Júnior" },
                      { jobsKey: "level_threshold_gold_jobs", repKey: "level_threshold_gold_rep", label: "Intermediário" },
                      { jobsKey: "level_threshold_elite_jobs", repKey: "level_threshold_elite_rep", label: "Sênior" },
                      { jobsKey: "level_threshold_diamond_jobs", repKey: "level_threshold_diamond_rep", label: "Elite" },
                    ].map(({ jobsKey, repKey, label }) => (
                      <div key={label} className="space-y-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-xs font-bold text-primary/80">{label}</p>
                        <SliderField
                          label="Extras concluídos"
                          value={localConfig[jobsKey] ?? config?.defaults[jobsKey] ?? 0}
                          min={5} max={1000} step={5}
                          onChange={v => setLocalConfig(prev => ({ ...prev, [jobsKey]: v }))}
                        />
                        <SliderField
                          label="Reputação mínima"
                          value={localConfig[repKey] ?? config?.defaults[repKey] ?? 0}
                          min={3.0} max={5.0} step={0.05}
                          onChange={v => setLocalConfig(prev => ({ ...prev, [repKey]: v }))}
                          format={v => v.toFixed(2)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="text-xs text-muted-foreground">
                    {config?.lastUpdatedAt
                      ? `Salvo em ${new Date(config.lastUpdatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                      : "Usando padrões do sistema"}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasConfigChanges && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocalConfig({ ...config!.config })}
                        className="text-muted-foreground h-9"
                      >
                        <RotateCcw size={14} className="mr-1.5" />
                        Reverter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleSaveConfig}
                      disabled={configSaving || !hasConfigChanges}
                      className="h-9 bg-primary text-black font-bold hover:bg-primary/90"
                    >
                      {configSaving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                      Salvar Configurações
                    </Button>
                  </div>
                </div>

                {hasConfigChanges && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-xs text-yellow-400/80" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.15)" }}>
                    <AlertTriangle size={13} />
                    Alterações pendentes. Após salvar, reinicie o servidor API para que as mudanças de taxa entrem em vigor.
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* TEAM TAB */}
        {activeTab === "team" && (
          <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <Input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9 bg-white/5 border-white/10 h-10"
              />
            </div>

            {adminsLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary/60" /></div>
            ) : filteredAdmins.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">Nenhum administrador encontrado.</div>
            ) : (
              <div className="space-y-2">
                {filteredAdmins.map(admin => (
                  <div
                    key={admin.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {admin.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold truncate">{admin.name}</p>
                        <CorporateRoleBadge role={admin.corporateRole} />
                        {CEO_EMAILS.includes(admin.email?.toLowerCase()) && (
                          <span className="text-[10px] text-primary/60 font-semibold">CEO Access</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                        {admin.adminRole ?? "admin"}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(124,252,0,0.1)", color: "#7CFC00" }}>
                        {admin.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* BADGES TAB */}
        {activeTab === "badges" && (
          <motion.div key="badges" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Grant form */}
            <div
              className="p-5 rounded-2xl space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-primary" />
                <h3 className="text-sm font-bold">Conceder Badge</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="ID do usuário"
                  value={badgeForm.userId}
                  onChange={e => setBadgeForm(f => ({ ...f, userId: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10"
                  type="number"
                />
                <Input
                  placeholder="Nome do badge (ex: Pioneiro)"
                  value={badgeForm.badge}
                  onChange={e => setBadgeForm(f => ({ ...f, badge: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10"
                />
                <Input
                  placeholder="Descrição (opcional)"
                  value={badgeForm.description}
                  onChange={e => setBadgeForm(f => ({ ...f, description: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleGrantBadge}
                  disabled={badgeGranting || !badgeForm.userId || !badgeForm.badge}
                  className="h-9 bg-primary text-black font-bold"
                >
                  {badgeGranting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Award size={14} className="mr-1.5" />}
                  Conceder Badge
                </Button>
              </div>
            </div>

            {/* Badge list */}
            {badgesLoading ? (
              <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-primary/60" /></div>
            ) : badges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Nenhum badge concedido ainda.</div>
            ) : (
              <div className="space-y-2">
                {badges.map(b => (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Award size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{b.badge}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 font-semibold">
                          User #{b.userId}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.userName ? `${b.userName} · ` : ""}{b.description || "Sem descrição"}
                      </p>
                      {b.grantedAt && (
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                          {new Date(b.grantedAt).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteBadge(b.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
