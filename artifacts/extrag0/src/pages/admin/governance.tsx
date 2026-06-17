import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Shield, Settings, Users, Award, Save, RotateCcw, ChevronRight,
  Crown, AlertTriangle, Loader2, CheckCircle, Trash2, Search,
  Lock, Unlock, RefreshCw, Star, TrendingUp, Edit2, X, UserCog,
  Percent, DollarSign, Plus, Info, Layers, Wallet, Tag, BarChart2,
  Server, Archive, GripVertical, ToggleLeft, ToggleRight, Circle,
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
  avatarUrl?: string | null;
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
  icon: string;
  color: string;
  category: string;
  grantedAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface UserOverride {
  id: number;
  name: string;
  email: string;
  role: string;
  level: string;
  customFee: number | null;
  customReferralRate: number | null;
  governanceNotes: string | null;
}

interface SplitConfig {
  platformFeeByLevel: Record<string, number>;
  representativeRate: number;
  investorRate: number;
  reserveFundRate: number;
  escrowRules: { enabled: boolean; autoReleaseHours: number; disputeWindowHours: number };
  withdrawalRules: { minAmountCents: number; maxAmountCents: number; processingDays: number };
  asaasConfig: { enabled: boolean; environment: string; webhookEnabled: boolean };
  referralThresholds: { agent: number; ambassador: number };
}

interface FinancialConfig {
  config: SplitConfig;
  defaults: SplitConfig;
  description: Record<string, string>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  status: "active" | "archived";
  rules: Record<string, any> | null;
}

interface PlatformWalletMetrics {
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalFeesCollected: number;
  referralCommissionsPaid: number;
  pendingWithdrawals: number;
}

interface LedgerEntry {
  id: number;
  walletId: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  referenceId: number | null;
  referenceType: string | null;
  createdAt: string;
}

const PREDEFINED_BADGES = [
  { name: "Fundador", icon: "crown", color: "amber", category: "founding" },
  { name: "Investidor", icon: "trending-up", color: "emerald", category: "investor" },
  { name: "Parceiro Estratégico", icon: "handshake", color: "blue", category: "partner" },
  { name: "Embaixador Nacional", icon: "map", color: "purple", category: "ambassador" },
  { name: "Conselho Executivo", icon: "shield", color: "yellow", category: "executive" },
  { name: "Top Performer", icon: "star", color: "orange", category: "performance" },
  { name: "Growth Leader", icon: "trending-up", color: "green", category: "performance" },
  { name: "Pioneiro", icon: "zap", color: "cyan", category: "special" },
];

function SliderField({
  label, value, min, max, step, onChange, format, locked,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string; locked?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : String(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/75 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-primary tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => !locked && onChange(Number(e.target.value))}
        disabled={locked}
        className={`w-full h-1.5 rounded-full appearance-none ${locked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
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

function ConfirmDialog({
  open, title, description, onConfirm, onCancel, loading,
}: {
  open: boolean; title: string; description: string;
  onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: "rgba(10,16,26,0.97)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="ghost" size="sm" onClick={onCancel} className="flex-1 h-10 text-muted-foreground hover:text-foreground">
            Cancelar
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={loading} className="flex-1 h-10 bg-primary text-black font-bold hover:bg-primary/90">
            {loading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
            Confirmar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function GovernancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"config" | "users" | "team" | "badges" | "financial" | "categories" | "wallet">("config");

  // Config state
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [localConfig, setLocalConfig] = useState<Record<string, number>>({});
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  // Lock state per section (all locked by default)
  const [unlockedSections, setUnlockedSections] = useState<Set<string>>(new Set());
  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Team state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Badges state
  const [badges, setBadges] = useState<BadgeGrant[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgeForm, setBadgeForm] = useState({ userId: "", badge: "", description: "", icon: "award", color: "primary", category: "special" });
  const [badgeGranting, setBadgeGranting] = useState(false);

  // User overrides state
  const [overrides, setOverrides] = useState<UserOverride[]>([]);
  const [overridesLoading, setOverridesLoading] = useState(false);
  const [overrideSearch, setOverrideSearch] = useState("");
  const [overrideForm, setOverrideForm] = useState<{
    userId: string; customFee: string; customReferralRate: string; governanceNotes: string;
  }>({ userId: "", customFee: "", customReferralRate: "", governanceNotes: "" });
  const [overrideSaving, setOverrideSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOverride | null>(null);
  const [searchResults, setSearchResults] = useState<UserOverride[]>([]);
  const [searching, setSearching] = useState(false);

  // Financial governance state
  const [financialConfig, setFinancialConfig] = useState<FinancialConfig | null>(null);
  const [localFinancial, setLocalFinancial] = useState<Partial<SplitConfig>>({});
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialSaving, setFinancialSaving] = useState(false);
  const [financialUnlocked, setFinancialUnlocked] = useState<Set<string>>(new Set());

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "", icon: "", displayOrder: "0" });
  const [catSaving, setCatSaving] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Platform wallet state
  const [walletMetrics, setWalletMetrics] = useState<PlatformWalletMetrics | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotal, setLedgerTotal] = useState(0);

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

  const fetchOverrides = useCallback(async () => {
    setOverridesLoading(true);
    try {
      const data: UserOverride[] = await apiFetch("/api/admin/governance/overrides");
      setOverrides(data);
    } catch { /* noop */ }
    finally { setOverridesLoading(false); }
  }, []);

  const fetchFinancial = useCallback(async () => {
    setFinancialLoading(true);
    try {
      const data: FinancialConfig = await apiFetch("/api/admin/governance/financial");
      setFinancialConfig(data);
      setLocalFinancial({ ...data.config });
    } catch { /* noop */ }
    finally { setFinancialLoading(false); }
  }, []);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const data: Category[] = await apiFetch(`/api/admin/governance/categories?includeArchived=${showArchived}`);
      setCategories(data);
    } catch { /* noop */ }
    finally { setCategoriesLoading(false); }
  }, [showArchived]);

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const data = await apiFetch("/api/admin/governance/platform-wallet");
      setWalletMetrics(data.metrics);
    } catch { /* noop */ }
    finally { setWalletLoading(false); }
  }, []);

  const fetchLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const data = await apiFetch(`/api/admin/governance/ledger?page=${ledgerPage}&limit=20`);
      setLedgerEntries(data.entries);
      setLedgerTotal(data.pagination.total);
    } catch { /* noop */ }
    finally { setLedgerLoading(false); }
  }, [ledgerPage]);

  useEffect(() => {
    if (!isCEO) return;
    fetchConfig();
  }, [isCEO, fetchConfig]);

  useEffect(() => {
    if (!isCEO) return;
    if (activeTab === "team") fetchAdmins();
    if (activeTab === "badges") fetchBadges();
    if (activeTab === "users") fetchOverrides();
    if (activeTab === "financial") fetchFinancial();
    if (activeTab === "categories") fetchCategories();
    if (activeTab === "wallet") { fetchWallet(); fetchLedger(); }
  }, [activeTab, isCEO, fetchAdmins, fetchBadges, fetchOverrides, fetchFinancial, fetchCategories, fetchWallet, fetchLedger]);

  const handleSaveConfig = async () => {
    setConfirmOpen(false);
    setConfigSaving(true);
    try {
      await apiFetch("/api/admin/governance/config", {
        method: "PUT",
        body: JSON.stringify(localConfig),
      });
      toast.success("Configurações salvas com sucesso");
      setUnlockedSections(new Set());
      fetchConfig();
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setConfigSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setUnlockedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
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
          icon: badgeForm.icon,
          color: badgeForm.color,
          category: badgeForm.category,
        }),
      });
      toast.success("Badge concedido com sucesso");
      setBadgeForm({ userId: "", badge: "", description: "", icon: "award", color: "primary", category: "special" });
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

  const handleSearchUser = async () => {
    if (!overrideSearch.trim()) return;
    setSearching(true);
    try {
      const id = parseInt(overrideSearch);
      if (!isNaN(id)) {
        const data: UserOverride = await apiFetch(`/api/admin/governance/users/${id}/overrides`);
        setSearchResults([data]);
      } else {
        toast.error("Informe um ID numérico válido");
      }
    } catch (e: any) {
      toast.error("Usuário não encontrado");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUserForOverride = (u: UserOverride) => {
    setSelectedUser(u);
    setOverrideForm({
      userId: String(u.id),
      customFee: u.customFee !== null && u.customFee !== undefined ? String((u.customFee * 100).toFixed(1)) : "",
      customReferralRate: u.customReferralRate !== null && u.customReferralRate !== undefined ? String((u.customReferralRate * 100).toFixed(1)) : "",
      governanceNotes: u.governanceNotes ?? "",
    });
  };

  const handleSaveOverride = async () => {
    if (!overrideForm.userId) { toast.error("Selecione um usuário"); return; }
    setOverrideSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (overrideForm.customFee !== "") {
        payload.customFee = parseFloat(overrideForm.customFee) / 100;
      } else {
        payload.customFee = null;
      }
      if (overrideForm.customReferralRate !== "") {
        payload.customReferralRate = parseFloat(overrideForm.customReferralRate) / 100;
      } else {
        payload.customReferralRate = null;
      }
      payload.governanceNotes = overrideForm.governanceNotes || null;

      await apiFetch(`/api/admin/governance/users/${overrideForm.userId}/overrides`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Overrides salvos com sucesso");
      setSelectedUser(null);
      setOverrideForm({ userId: "", customFee: "", customReferralRate: "", governanceNotes: "" });
      setSearchResults([]);
      setOverrideSearch("");
      fetchOverrides();
    } catch {
      toast.error("Erro ao salvar overrides");
    } finally {
      setOverrideSaving(false);
    }
  };

  const handleSaveFinancial = async () => {
    setFinancialSaving(true);
    try {
      await apiFetch("/api/admin/governance/financial", {
        method: "PUT",
        body: JSON.stringify({
          representativeRate: localFinancial.representativeRate,
          investorRate: localFinancial.investorRate,
          reserveFundRate: localFinancial.reserveFundRate,
          escrowRules: localFinancial.escrowRules,
          withdrawalRules: localFinancial.withdrawalRules,
        }),
      });
      toast.success("Configuração financeira salva");
      setFinancialUnlocked(new Set());
      fetchFinancial();
    } catch {
      toast.error("Erro ao salvar configuração financeira");
    } finally {
      setFinancialSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) { toast.error("Nome da categoria é obrigatório"); return; }
    setCatSaving(true);
    try {
      if (editingCat) {
        await apiFetch(`/api/admin/governance/categories/${editingCat.id}`, {
          method: "PUT",
          body: JSON.stringify(catForm),
        });
        toast.success("Categoria atualizada");
      } else {
        await apiFetch("/api/admin/governance/categories", {
          method: "POST",
          body: JSON.stringify(catForm),
        });
        toast.success("Categoria criada");
      }
      setCatForm({ name: "", description: "", icon: "", displayOrder: "0" });
      setEditingCat(null);
      fetchCategories();
    } catch {
      toast.error("Erro ao salvar categoria");
    } finally {
      setCatSaving(false);
    }
  };

  const handleArchiveCategory = async (id: number) => {
    try {
      await apiFetch(`/api/admin/governance/categories/${id}`, { method: "DELETE" });
      toast.success("Categoria arquivada");
      fetchCategories();
    } catch {
      toast.error("Erro ao arquivar categoria");
    }
  };

  const currFormat = (v: number) => `R$ ${(v / 100).toFixed(2).replace(".", ",")}`;
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

  const SECTIONS = [
    { id: "fees", label: "Taxas por Nível" },
    { id: "referral", label: "Comissões de Indicação" },
    { id: "thresholds", label: "Requisitos de Evolução" },
  ];

  const currentFeeBronze = localConfig["level_fee_bronze"] ?? config?.config["level_fee_bronze"] ?? null;
  const currentFeeDiamond = localConfig["level_fee_diamond"] ?? config?.config["level_fee_diamond"] ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-8">
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar alterações de governança"
        description="Essas mudanças afetam todas as taxas e comissões da plataforma. Tem certeza que deseja salvar?"
        onConfirm={handleSaveConfig}
        onCancel={() => setConfirmOpen(false)}
        loading={configSaving}
      />

      {/* Executive Header */}
      <div className="card-governance-hero p-5 sm:p-6">
        {/* ambient glow */}
        <div className="absolute top-0 right-0 w-56 h-28 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(236,72,153,0.20) 0%, transparent 70%)", filter: "blur(24px)" }} />
        {/* Crown watermark */}
        <div className="absolute right-4 -bottom-2 pointer-events-none select-none"
          style={{
            width: 120, height: 120,
            backgroundImage: "url(/badges/corporate-badges.png)",
            backgroundSize: "400% auto",
            backgroundPosition: "0% center",
            backgroundRepeat: "no-repeat",
            opacity: 0.22,
            mixBlendMode: "screen",
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.22), rgba(245,158,11,0.12))", border: "1px solid rgba(236,72,153,0.28)" }}
            >
              <Shield size={22} style={{ color: "#ec4899" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold">Centro de Governança</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.30)", color: "#ec4899" }}>
                  <CheckCircle size={9} /> CEO
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Acesso verificado · <span className="text-white/60">{user?.email}</span></p>
            </div>
          </div>

          {/* Quick-view platform config stats */}
          {!configLoading && config && (
            <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
              {[
                { label: "Taxa Iniciante", value: currentFeeBronze !== null ? `${(currentFeeBronze * 100).toFixed(0)}%` : "—", color: "#ec4899" },
                { label: "Taxa Elite", value: currentFeeDiamond !== null ? `${(currentFeeDiamond * 100).toFixed(0)}%` : "—", color: "#f59e0b" },
                { label: "Módulos ativos", value: "7", color: "rgba(255,255,255,0.55)" },
              ].map((stat) => (
                <div key={stat.label} className="text-center min-w-[52px]">
                  <p className="text-lg font-black leading-none" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-white/65 mt-0.5 whitespace-nowrap">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Config last-saved indicator */}
        {config?.lastUpdatedAt && (
          <div className="relative mt-3 pt-3 border-t flex items-center gap-1.5" style={{ borderColor: "rgba(236,72,153,0.12)" }}>
            <Circle size={6} style={{ color: "#ec4899", fill: "#ec4899" }} />
            <span className="text-[10px] text-muted-foreground">
              Última alteração: {new Date(config.lastUpdatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}
      </div>

      {/* Tabs — scrollable on mobile, full labels on desktop */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { id: "config", label: "Configuração", shortLabel: "Config", icon: <Settings size={13} /> },
          { id: "financial", label: "Financeiro", shortLabel: "Fin.", icon: <Layers size={13} /> },
          { id: "categories", label: "Categorias", shortLabel: "Cat.", icon: <Tag size={13} /> },
          { id: "wallet", label: "Carteira Plataforma", shortLabel: "Carteira", icon: <Wallet size={13} /> },
          { id: "users", label: "Usuários", shortLabel: "Users", icon: <UserCog size={13} /> },
          { id: "team", label: "Equipe", shortLabel: "Equipe", icon: <Users size={13} /> },
          { id: "badges", label: "Badges", shortLabel: "Badges", icon: <Award size={13} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-w-[40px] ${
              activeTab === tab.id
                ? "bg-primary text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
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
                {/* Level Fees — locked by default */}
                {[
                  {
                    sectionId: "fees",
                    icon: <TrendingUp size={16} className="text-primary" />,
                    title: "Taxas por Nível",
                    subtitle: "descontado do profissional por extra concluído",
                    fields: [
                      { key: "level_fee_bronze", label: "Iniciante (Bronze)" },
                      { key: "level_fee_silver", label: "Júnior (Prata)" },
                      { key: "level_fee_gold", label: "Intermediário (Ouro)" },
                      { key: "level_fee_elite", label: "Sênior (Elite)" },
                      { key: "level_fee_diamond", label: "Elite (Diamante)" },
                    ],
                    sliderProps: { min: 0.05, max: 0.30, step: 0.01, format: pctFormat },
                  },
                  {
                    sectionId: "referral",
                    icon: <Star size={16} className="text-primary" />,
                    title: "Comissões de Indicação",
                    subtitle: "% pago ao indicador sobre cada extra",
                    fields: [
                      { key: "referral_rate_indicador", label: "Indicador" },
                      { key: "referral_rate_agente", label: "Agente de Captação" },
                      { key: "referral_rate_embaixador", label: "Embaixador Regional" },
                    ],
                    sliderProps: { min: 0.005, max: 0.10, step: 0.005, format: pctFormat },
                  },
                ].map(section => {
                  const isUnlocked = unlockedSections.has(section.sectionId);
                  return (
                    <div
                      key={section.sectionId}
                      className="rounded-2xl p-5 space-y-5 relative overflow-hidden"
                      style={{
                        background: isUnlocked
                          ? "linear-gradient(135deg, rgba(124,252,0,0.055) 0%, rgba(8,17,26,0.92) 100%)"
                          : "linear-gradient(135deg, rgba(236,72,153,0.03) 0%, rgba(8,17,26,0.88) 100%)",
                        border: `1px solid ${isUnlocked ? "rgba(124,252,0,0.22)" : "rgba(236,72,153,0.12)"}`,
                      }}
                    >
                      {/* Top accent stripe */}
                      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                        style={{ background: isUnlocked ? "linear-gradient(90deg,transparent,rgba(124,252,0,0.4),transparent)" : "linear-gradient(90deg,transparent,rgba(236,72,153,0.22),transparent)" }} />
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <h3 className="text-sm font-bold">{section.title}</h3>
                        <span className="text-[10px] text-muted-foreground ml-auto hidden sm:inline">{section.subtitle}</span>
                        <button
                          onClick={() => toggleSection(section.sectionId)}
                          className={`ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isUnlocked
                              ? "bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20"
                              : "bg-white/6 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-foreground"
                          }`}
                        >
                          {isUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
                          {isUnlocked ? "Bloqueiar" : "Editar"}
                        </button>
                      </div>
                      {section.fields.map(({ key, label }) => (
                        <SliderField
                          key={key}
                          label={label}
                          value={localConfig[key] ?? config?.defaults[key] ?? 0}
                          {...section.sliderProps}
                          onChange={v => setLocalConfig(prev => ({ ...prev, [key]: v }))}
                          locked={!isUnlocked}
                        />
                      ))}
                    </div>
                  );
                })}

                {/* Level Thresholds */}
                {(() => {
                  const isUnlocked = unlockedSections.has("thresholds");
                  return (
                    <div
                      className="rounded-2xl p-5 space-y-4 relative overflow-hidden"
                      style={{
                        background: isUnlocked
                          ? "linear-gradient(135deg, rgba(124,252,0,0.055) 0%, rgba(8,17,26,0.92) 100%)"
                          : "linear-gradient(135deg, rgba(236,72,153,0.03) 0%, rgba(8,17,26,0.88) 100%)",
                        border: `1px solid ${isUnlocked ? "rgba(124,252,0,0.22)" : "rgba(236,72,153,0.12)"}`,
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                        style={{ background: isUnlocked ? "linear-gradient(90deg,transparent,rgba(124,252,0,0.4),transparent)" : "linear-gradient(90deg,transparent,rgba(236,72,153,0.22),transparent)" }} />
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        <h3 className="text-sm font-bold">Requisitos de Evolução</h3>
                        <span className="text-[10px] text-muted-foreground ml-auto hidden sm:inline">mínimo de extras + reputação para subir de nível</span>
                        <button
                          onClick={() => toggleSection("thresholds")}
                          className={`ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isUnlocked
                              ? "bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20"
                              : "bg-white/6 text-muted-foreground border border-white/10 hover:bg-white/10 hover:text-foreground"
                          }`}
                        >
                          {isUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
                          {isUnlocked ? "Bloquear" : "Editar"}
                        </button>
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
                              locked={!isUnlocked}
                            />
                            <SliderField
                              label="Reputação mínima"
                              value={localConfig[repKey] ?? config?.defaults[repKey] ?? 0}
                              min={3.0} max={5.0} step={0.05}
                              onChange={v => setLocalConfig(prev => ({ ...prev, [repKey]: v }))}
                              format={v => v.toFixed(2)}
                              locked={!isUnlocked}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

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
                        onClick={() => { setLocalConfig({ ...config!.config }); setUnlockedSections(new Set()); }}
                        className="text-muted-foreground h-9"
                      >
                        <RotateCcw size={14} className="mr-1.5" />
                        Reverter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => setConfirmOpen(true)}
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

        {/* USERS TAB — individual overrides */}
        {activeTab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Search user by ID */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <UserCog size={16} className="text-primary" />
                <h3 className="text-sm font-bold">Configuração Individual</h3>
              </div>
              <p className="text-xs text-muted-foreground">Busque um usuário por ID para configurar taxa personalizada, comissão de indicação e notas de governança.</p>
              <div className="flex gap-2">
                <Input
                  value={overrideSearch}
                  onChange={e => setOverrideSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearchUser()}
                  placeholder="ID do usuário (ex: 42)"
                  className="bg-white/5 border-white/10 h-10 flex-1"
                  type="number"
                />
                <Button size="sm" onClick={handleSearchUser} disabled={searching} className="h-10 bg-white/8 border border-white/12 hover:bg-white/14">
                  {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </Button>
              </div>

              {/* Search results */}
              {searchResults.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUserForOverride(u)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/6"
                  style={{ background: selectedUser?.id === u.id ? "rgba(124,252,0,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedUser?.id === u.id ? "rgba(124,252,0,0.20)" : "rgba(255,255,255,0.06)"}` }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email} · ID {u.id} · {u.level}</p>
                  </div>
                  {(u.customFee !== null || u.customReferralRate !== null) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(124,252,0,0.1)", color: "#7CFC00", border: "1px solid rgba(124,252,0,0.2)" }}>
                      Override ativo
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Override form */}
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5 space-y-4"
                style={{ background: "rgba(124,252,0,0.03)", border: "1px solid rgba(124,252,0,0.15)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => { setSelectedUser(null); setSearchResults([]); setOverrideSearch(""); }} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Percent size={11} />
                      Taxa Personalizada (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={overrideForm.customFee}
                        onChange={e => setOverrideForm(f => ({ ...f, customFee: e.target.value }))}
                        placeholder={`Padrão: ${((config?.defaults[`level_fee_${selectedUser.level}`] ?? 0.18) * 100).toFixed(0)}%`}
                        className="bg-white/5 border-white/10 h-10"
                        type="number" min={0} max={100} step={0.1}
                      />
                      {overrideForm.customFee && (
                        <button onClick={() => setOverrideForm(f => ({ ...f, customFee: "" }))} className="text-muted-foreground hover:text-destructive p-1">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Deixe vazio para usar a taxa padrão do nível</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign size={11} />
                      Comissão de Indicação (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={overrideForm.customReferralRate}
                        onChange={e => setOverrideForm(f => ({ ...f, customReferralRate: e.target.value }))}
                        placeholder="Padrão da plataforma"
                        className="bg-white/5 border-white/10 h-10"
                        type="number" min={0} max={100} step={0.1}
                      />
                      {overrideForm.customReferralRate && (
                        <button onClick={() => setOverrideForm(f => ({ ...f, customReferralRate: "" }))} className="text-muted-foreground hover:text-destructive p-1">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Deixe vazio para usar a comissão padrão</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notas de Governança
                  </label>
                  <textarea
                    value={overrideForm.governanceNotes}
                    onChange={e => setOverrideForm(f => ({ ...f, governanceNotes: e.target.value }))}
                    placeholder="Ex: Parceiro Estratégico — acordo comercial aprovado em Jun/2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/40"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleSaveOverride}
                    disabled={overrideSaving}
                    className="h-9 bg-primary text-black font-bold hover:bg-primary/90"
                  >
                    {overrideSaving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                    Salvar Override
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Active overrides list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider">Overrides Ativos</h4>
                <button onClick={fetchOverrides} className="text-muted-foreground hover:text-foreground p-1">
                  <RefreshCw size={12} />
                </button>
              </div>
              {overridesLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-primary/60" /></div>
              ) : overrides.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum override configurado.
                </div>
              ) : (
                overrides.map(u => (
                  <div
                    key={u.id}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/4"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onClick={() => { setSearchResults([u]); handleSelectUserForOverride(u); }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        {u.customFee !== null && <span className="text-primary font-medium">Taxa: {(u.customFee * 100).toFixed(1)}%</span>}
                        {u.customReferralRate !== null && <span className="text-secondary font-medium">Comissão: {(u.customReferralRate * 100).toFixed(1)}%</span>}
                        {u.governanceNotes && <span className="truncate max-w-[180px]">{u.governanceNotes}</span>}
                      </div>
                    </div>
                    <Edit2 size={13} className="text-muted-foreground flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
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
                    {admin.avatarUrl ? (
                      <img
                        src={admin.avatarUrl}
                        alt={admin.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/12 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.35), rgba(245,158,11,0.25))" }}>
                        {admin.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                    )}
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
            {/* Predefined badge types */}
            <div
              className="p-4 rounded-2xl space-y-3"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Badges Predefinidos</p>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_BADGES.map(b => (
                  <button
                    key={b.name}
                    onClick={() => setBadgeForm(f => ({ ...f, badge: b.name, icon: b.icon, color: b.color, category: b.category }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      badgeForm.badge === b.name
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-foreground"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Grant form */}
            <div
              className="p-5 rounded-2xl space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-primary" />
                <h3 className="text-sm font-bold">Conceder Badge</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="ID do usuário"
                  value={badgeForm.userId}
                  onChange={e => setBadgeForm(f => ({ ...f, userId: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10"
                  type="number"
                />
                <Input
                  placeholder="Nome do badge"
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
                <Input
                  placeholder="Categoria (ex: investor, partner)"
                  value={badgeForm.category}
                  onChange={e => setBadgeForm(f => ({ ...f, category: e.target.value }))}
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
                  {badgeGranting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" />}
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
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Award size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold">{b.badge}</p>
                        {b.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-muted-foreground">{b.category}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.userName ?? `User #${b.userId}`} · {b.userEmail}
                      </p>
                      {b.description && <p className="text-xs text-muted-foreground/70 mt-0.5">{b.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteBadge(b.id)}
                      className="text-destructive/50 hover:text-destructive transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === "financial" && (
          <motion.div key="financial" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {financialLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary/60" /></div>
            ) : (
              <>
                {/* Split Rates */}
                {[
                  {
                    sectionId: "split",
                    icon: <Layers size={16} className="text-primary" />,
                    title: "Distribuição da Taxa da Plataforma",
                    subtitle: "como a taxa coletada é distribuída internamente",
                    fields: [
                      { key: "representativeRate", label: "Comissão do Representante Estadual" },
                      { key: "investorRate", label: "Participação de Investidores Parceiros" },
                      { key: "reserveFundRate", label: "Fundo de Reserva Operacional" },
                    ],
                    sliderProps: { min: 0, max: 0.20, step: 0.005, format: pctFormat },
                  },
                  {
                    sectionId: "escrow",
                    icon: <Server size={16} className="text-primary" />,
                    title: "Escrow — Custódia de Pagamentos",
                    subtitle: "comportamento do sistema de custódia",
                    fields: [
                      { key: "escrow.autoReleaseHours", label: "Liberação automática após (horas)" },
                      { key: "escrow.disputeWindowHours", label: "Janela de disputa (horas)" },
                    ],
                    sliderProps: { min: 1, max: 168, step: 1, format: (v: number) => `${v}h` },
                  },
                  {
                    sectionId: "withdrawal",
                    icon: <DollarSign size={16} className="text-primary" />,
                    title: "Regras de Saque PIX",
                    subtitle: "limites e prazos de processamento",
                    fields: [
                      { key: "withdrawal.minAmount", label: "Valor mínimo (R$)", min: 100, max: 5000, step: 50, format: (v: number) => `R$ ${v}` },
                      { key: "withdrawal.processingDays", label: "Prazo de processamento (dias úteis)", min: 1, max: 14, step: 1, format: (v: number) => `${v}d` },
                    ],
                    sliderProps: { min: 100, max: 5000, step: 50, format: (v: number) => `R$ ${v}` },
                  },
                ].map(({ sectionId, icon, title, subtitle, fields, sliderProps }) => {
                  const unlocked = financialUnlocked.has(sectionId);
                  return (
                    <div key={sectionId} className="p-5 rounded-2xl space-y-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {icon}
                          <div>
                            <h3 className="text-sm font-bold">{title}</h3>
                            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFinancialUnlocked(prev => {
                              const next = new Set(prev);
                              if (next.has(sectionId)) next.delete(sectionId);
                              else next.add(sectionId);
                              return next;
                            });
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            unlocked
                              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                              : "border-white/10 bg-white/4 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {unlocked ? <Unlock size={11} /> : <Lock size={11} />}
                          {unlocked ? "Bloqueado" : "Editar"}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {sectionId === "split" && fields.map(({ key, label }) => (
                          <SliderField
                            key={key}
                            label={label}
                            value={(localFinancial as any)[key] ?? 0}
                            min={sliderProps.min}
                            max={sliderProps.max}
                            step={sliderProps.step}
                            format={sliderProps.format}
                            locked={!unlocked}
                            onChange={v => setLocalFinancial(f => ({ ...f, [key]: v }))}
                          />
                        ))}
                        {sectionId === "escrow" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escrow ativo</span>
                              <button
                                disabled={!unlocked}
                                onClick={() => setLocalFinancial(f => ({
                                  ...f,
                                  escrowRules: { ...(f.escrowRules ?? { autoReleaseHours: 48, disputeWindowHours: 24 }), enabled: !(f.escrowRules?.enabled ?? false) },
                                }))}
                                className={`${!unlocked ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                {localFinancial.escrowRules?.enabled
                                  ? <ToggleRight size={24} className="text-primary" />
                                  : <ToggleLeft size={24} className="text-muted-foreground" />}
                              </button>
                            </div>
                            {["autoReleaseHours", "disputeWindowHours"].map(k => (
                              <SliderField
                                key={k}
                                label={k === "autoReleaseHours" ? "Liberação automática (h)" : "Janela de disputa (h)"}
                                value={(localFinancial.escrowRules as any)?.[k] ?? (k === "autoReleaseHours" ? 48 : 24)}
                                min={1} max={168} step={1}
                                format={v => `${v}h`}
                                locked={!unlocked}
                                onChange={v => setLocalFinancial(f => ({
                                  ...f,
                                  escrowRules: { ...(f.escrowRules ?? { enabled: false, autoReleaseHours: 48, disputeWindowHours: 24 }), [k]: v },
                                }))}
                              />
                            ))}
                          </div>
                        )}
                        {sectionId === "withdrawal" && (
                          <div className="space-y-3">
                            <SliderField
                              label="Valor mínimo de saque"
                              value={Math.round((localFinancial.withdrawalRules?.minAmountCents ?? 5000) / 100)}
                              min={5} max={500} step={5}
                              format={v => `R$ ${v}`}
                              locked={!unlocked}
                              onChange={v => setLocalFinancial(f => ({
                                ...f,
                                withdrawalRules: { ...(f.withdrawalRules ?? { minAmountCents: 5000, maxAmountCents: 1000000, processingDays: 3 }), minAmountCents: v * 100 },
                              }))}
                            />
                            <SliderField
                              label="Prazo de processamento (dias úteis)"
                              value={localFinancial.withdrawalRules?.processingDays ?? 3}
                              min={1} max={14} step={1}
                              format={v => `${v}d`}
                              locked={!unlocked}
                              onChange={v => setLocalFinancial(f => ({
                                ...f,
                                withdrawalRules: { ...(f.withdrawalRules ?? { minAmountCents: 5000, maxAmountCents: 1000000, processingDays: 3 }), processingDays: v },
                              }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Asaas Status — read-only */}
                <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Server size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-bold">Status Asaas</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-muted-foreground border border-white/10">Somente leitura</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        label: "Integração",
                        value: localFinancial.asaasConfig?.enabled ? "Ativa" : "Desativada",
                        ok: localFinancial.asaasConfig?.enabled,
                      },
                      {
                        label: "Ambiente",
                        value: localFinancial.asaasConfig?.environment === "production" ? "Produção" : "Sandbox",
                        ok: localFinancial.asaasConfig?.environment === "production",
                      },
                      {
                        label: "Webhook",
                        value: localFinancial.asaasConfig?.webhookEnabled ? "Configurado" : "Pendente",
                        ok: localFinancial.asaasConfig?.webhookEnabled,
                      },
                    ].map(({ label, value, ok }) => (
                      <div key={label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1">{label}</p>
                        <div className="flex items-center justify-center gap-1.5">
                          <Circle size={7} className={ok ? "text-emerald-400 fill-emerald-400" : "text-red-400 fill-red-400"} />
                          <span className="text-xs font-bold">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 text-center">
                    A integração Asaas é configurada via variáveis de ambiente pelo time de engenharia.
                  </p>
                </div>

                {/* Save button */}
                {financialUnlocked.size > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handleSaveFinancial} disabled={financialSaving} className="h-10 px-6 bg-primary text-black font-bold hover:bg-primary/90">
                      {financialSaving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                      Salvar Configuração Financeira
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <motion.div key="categories" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Add / Edit Form */}
            <div className="p-5 rounded-2xl space-y-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary" />
                <h3 className="text-sm font-bold">{editingCat ? "Editar Categoria" : "Nova Categoria"}</h3>
                {editingCat && (
                  <button onClick={() => { setEditingCat(null); setCatForm({ name: "", description: "", icon: "", displayOrder: "0" }); }}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Nome da categoria *" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10 h-10" />
                <Input placeholder="Ícone (ex: briefcase, star)" value={catForm.icon} onChange={e => setCatForm(f => ({ ...f, icon: e.target.value }))} className="bg-white/5 border-white/10 h-10" />
                <Input placeholder="Descrição" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} className="bg-white/5 border-white/10 h-10" />
                <Input placeholder="Ordem de exibição" type="number" value={catForm.displayOrder} onChange={e => setCatForm(f => ({ ...f, displayOrder: e.target.value }))} className="bg-white/5 border-white/10 h-10" />
              </div>
              <Button onClick={handleSaveCategory} disabled={catSaving} className="h-10 px-6 bg-primary text-black font-bold hover:bg-primary/90">
                {catSaving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
                {editingCat ? "Salvar Edição" : "Criar Categoria"}
              </Button>
            </div>

            {/* List */}
            <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">
                  {categories.length} categoria{categories.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Archive size={12} />
                  {showArchived ? "Ocultar arquivadas" : "Ver arquivadas"}
                </button>
              </div>
              {categoriesLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-primary/60" /></div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">Nenhuma categoria cadastrada</div>
              ) : (
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold">{cat.name}</span>
                          {cat.icon && <span className="text-[10px] text-muted-foreground">{cat.icon}</span>}
                          {cat.status === "archived" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-muted-foreground border border-white/10">Arquivada</span>
                          )}
                        </div>
                        {cat.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.description}</p>}
                        <p className="text-[10px] text-muted-foreground/50">{cat.slug} · ordem {cat.displayOrder}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, description: cat.description ?? "", icon: cat.icon ?? "", displayOrder: String(cat.displayOrder) }); }}
                          className="text-muted-foreground/50 hover:text-primary transition-colors p-1"
                        >
                          <Edit2 size={13} />
                        </button>
                        {cat.status === "active" && (
                          <button onClick={() => handleArchiveCategory(cat.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors p-1">
                            <Archive size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* WALLET / LEDGER TAB */}
        {activeTab === "wallet" && (
          <motion.div key="wallet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Metrics */}
            {walletLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-primary/60" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Saldo Plataforma", value: walletMetrics?.balance ?? 0, icon: <Wallet size={16} />, accent: "text-primary", bg: "rgba(124,252,0,0.05)", border: "rgba(124,252,0,0.14)", stripe: "#7cfc00" },
                    { label: "Total em Taxas", value: walletMetrics?.totalFeesCollected ?? 0, icon: <DollarSign size={16} />, accent: "text-emerald-400", bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.14)", stripe: "#34d399" },
                    { label: "Total Recebido", value: walletMetrics?.totalEarned ?? 0, icon: <TrendingUp size={16} />, accent: "text-cyan-400", bg: "rgba(0,229,255,0.045)", border: "rgba(0,229,255,0.14)", stripe: "#00e5ff" },
                    { label: "Total Sacado", value: walletMetrics?.totalWithdrawn ?? 0, icon: <BarChart2 size={16} />, accent: "text-blue-400", bg: "rgba(59,130,246,0.045)", border: "rgba(59,130,246,0.14)", stripe: "#3b82f6" },
                    { label: "Comissões Pagas", value: walletMetrics?.referralCommissionsPaid ?? 0, icon: <Percent size={16} />, accent: "text-purple-400", bg: "rgba(139,92,246,0.045)", border: "rgba(139,92,246,0.14)", stripe: "#8b5cf6" },
                    { label: "Saques Pendentes", value: walletMetrics?.pendingWithdrawals ?? 0, icon: <AlertTriangle size={16} />, accent: "text-yellow-400", bg: "rgba(245,158,11,0.045)", border: "rgba(245,158,11,0.14)", stripe: "#f59e0b" },
                  ].map(({ label, value, icon, accent, bg, border, stripe }) => (
                    <div key={label} className="p-4 rounded-2xl space-y-2 relative overflow-hidden" style={{ background: bg, border: `1px solid ${border}` }}>
                      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                        style={{ background: `linear-gradient(90deg,transparent,${stripe}55,transparent)` }} />
                      <div className={`flex items-center gap-1.5 ${accent}`}>{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div>
                      <p className="text-lg font-bold tabular-nums">{currFormat(value)}</p>
                    </div>
                  ))}
                </div>

                {/* Ledger */}
                <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-primary" />
                      <p className="text-sm font-bold">Ledger da Plataforma</p>
                    </div>
                    <button onClick={fetchLedger} className="text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw size={14} className={ledgerLoading ? "animate-spin" : ""} />
                    </button>
                  </div>
                  {ledgerLoading ? (
                    <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-primary/60" /></div>
                  ) : ledgerEntries.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">Nenhuma entrada no ledger ainda</div>
                  ) : (
                    <div className="space-y-1.5">
                      {ledgerEntries.map(entry => (
                        <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl text-xs" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.amount >= 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{entry.description ?? entry.type}</p>
                            <p className="text-muted-foreground/60 text-[10px]">
                              {new Date(entry.createdAt).toLocaleString("pt-BR")}
                              {entry.referenceType && ` · ${entry.referenceType}`}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`font-bold tabular-nums ${entry.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {entry.amount >= 0 ? "+" : ""}{currFormat(entry.amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground/50">{currFormat(entry.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                      {ledgerTotal > 20 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button disabled={ledgerPage <= 1} onClick={() => setLedgerPage(p => p - 1)} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                            ← Anterior
                          </button>
                          <span className="text-xs text-muted-foreground">Pág. {ledgerPage} · {ledgerTotal} total</span>
                          <button disabled={ledgerPage * 20 >= ledgerTotal} onClick={() => setLedgerPage(p => p + 1)} className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
                            Próxima →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
