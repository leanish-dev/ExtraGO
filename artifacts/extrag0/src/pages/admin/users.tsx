import React, { useState } from "react";
import { useAdminListUsers, useAdminBanUser, useAdminVerifyUser } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { Users, Search, Shield, Ban, CheckCircle, Star, Briefcase, ChevronDown, Crown, X } from "lucide-react";
import { LevelBadgeIcon, CorporateBadge, CorporateBadgeIcon } from "@/components/level-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-fetch";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_TABS = ["Todos", "Freelancers", "Empresas", "Admins"];

const ADMIN_ROLE_OPTIONS = [
  { value: null, label: "Remover admin" },
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "finance_admin", label: "Financeiro" },
  { value: "operations_admin", label: "Operações" },
  { value: "support_admin", label: "Suporte" },
  { value: "regional_manager", label: "Gerente Regional" },
  { value: "state_representative", label: "Representante Estadual" },
];

const ADMIN_ROLE_COLORS: Record<string, string> = {
  super_admin: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  admin: "text-primary bg-primary/10 border-primary/30",
  finance_admin: "text-green-400 bg-green-400/10 border-green-400/30",
  operations_admin: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  support_admin: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  regional_manager: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  state_representative: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
};

// Mobile-friendly governance modal — replaces the floating dropdown
function GovernanceModal({
  user,
  open,
  onClose,
  onSetRole,
}: {
  user: User;
  open: boolean;
  onClose: () => void;
  onSetRole: (id: number, role: string, adminRole: string | null) => void;
}) {
  const adminRole = (user as any).adminRole as string | null;

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full sm:w-auto sm:min-w-[320px] rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ background: "rgba(10,16,26,0.97)", border: "1px solid rgba(255,255,255,0.10)", maxWidth: "480px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
          <div>
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-white/8 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Current role info */}
        <div className="px-5 py-3 border-b border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Cargo atual</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
              adminRole ? (ADMIN_ROLE_COLORS[adminRole] ?? "text-primary bg-primary/10 border-primary/20") : "text-muted-foreground bg-white/5 border-white/10"
            }`}>
              {adminRole ? (ADMIN_ROLE_OPTIONS.find(o => o.value === adminRole)?.label ?? adminRole) : "Sem cargo admin"}
            </span>
          </div>
        </div>

        {/* Role options */}
        <div className="px-3 py-3 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-2">Atribuir cargo</p>
          {ADMIN_ROLE_OPTIONS.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => {
                onSetRole(user.id!, opt.value === null ? user.role ?? "freelancer" : "admin", opt.value);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-left transition-all hover:bg-white/6 ${
                opt.value === adminRole ? "bg-primary/8 text-primary font-semibold" : "text-foreground/80"
              }`}
            >
              {opt.value === "super_admin" && <Crown size={14} className="text-yellow-400 flex-shrink-0" />}
              {opt.value !== "super_admin" && opt.value !== null && <Shield size={14} className="text-muted-foreground flex-shrink-0" />}
              {opt.value === null && <Ban size={14} className="text-destructive/60 flex-shrink-0" />}
              <span className="flex-1">{opt.label}</span>
              {opt.value === adminRole && <CheckCircle size={12} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>

        {/* Safe area for mobile */}
        <div className="h-4 sm:h-2" />
      </motion.div>
    </div>
  );
}

function UserRow({
  user, onVerify, onBan, onSetRole, isSuperAdmin,
}: {
  user: User;
  onVerify: (id: number) => void;
  onBan: (id: number) => void;
  onSetRole: (id: number, role: string, adminRole: string | null) => void;
  isSuperAdmin: boolean;
}) {
  const [showGovernanceModal, setShowGovernanceModal] = useState(false);

  const roleColors: Record<string, string> = {
    freelancer: "text-primary bg-primary/10 border-primary/20",
    company: "text-secondary bg-secondary/10 border-secondary/20",
    admin: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };
  const roleLabels: Record<string, string> = {
    freelancer: "Freelancer",
    company: "Empresa",
    admin: "Admin",
  };

  const isBanned = (user as any).isBanned;
  const adminRole = (user as any).adminRole as string | null;
  const joinDate = (user as any).createdAt
    ? format(new Date((user as any).createdAt), "dd MMM yyyy", { locale: ptBR })
    : null;

  return (
    <>
      <AnimatePresence>
        {showGovernanceModal && (
          <GovernanceModal
            user={user}
            open={showGovernanceModal}
            onClose={() => setShowGovernanceModal(false)}
            onSetRole={onSetRole}
          />
        )}
      </AnimatePresence>

      <div className={`glass-card rounded-xl p-4 flex items-center gap-4 transition-all ${isBanned ? "opacity-60 border-destructive/30" : ""}`}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
          {(user as any).avatarUrl ? (
            <img src={(user as any).avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <span className="text-[10px] font-mono text-white/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 flex-shrink-0">
              ID #{user.id}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role ?? "freelancer"]}`}>
              {roleLabels[user.role ?? "freelancer"]}
            </span>
            {adminRole && (
              <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${ADMIN_ROLE_COLORS[adminRole] ?? "text-primary bg-primary/10 border-primary/20"}`}>
                {(user as any).corporateRole
                  ? <CorporateBadgeIcon role={(user as any).corporateRole} size="xs" />
                  : adminRole === "super_admin" && <Crown size={9} />
                }
                {(user as any).corporateRole
                  ? ((user as any).corporateRole.toUpperCase())
                  : (ADMIN_ROLE_OPTIONS.find(o => o.value === adminRole)?.label ?? adminRole)
                }
              </span>
            )}
            {user.isVerified && (
              <span className="text-xs text-green-400 flex items-center gap-0.5">
                <CheckCircle size={11} /> Verificado
              </span>
            )}
            {isBanned && (
              <span className="text-xs text-destructive flex items-center gap-0.5 bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded-full">
                <Ban size={10} /> Banido
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            {user.role === "freelancer" && (
              <>
                <span className="flex items-center gap-1"><Briefcase size={10} /> {user.completedJobs ?? 0} jobs</span>
                <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" /> {(user.reputationScore ?? 0).toFixed(1)}</span>
                <span className="flex items-center gap-1"><LevelBadgeIcon level={user.level} size="sm" /><span className="capitalize">{user.level ?? "bronze"}</span></span>
              </>
            )}
            {user.role === "admin" && (user as any).corporateRole && (
              <span className="flex items-center gap-1">
                <CorporateBadgeIcon role={(user as any).corporateRole} size="sm" />
                <span className="uppercase text-[10px] font-bold">{(user as any).corporateRole}</span>
              </span>
            )}
            {user.role === "company" && user.companyName && (
              <span>{user.companyName}</span>
            )}
            {joinDate && <span>Desde {joinDate}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0 items-center">
          {!user.isVerified && user.role !== "admin" && !isBanned && (
            <Button
              size="sm"
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs h-8"
              onClick={() => onVerify(user.id!)}
            >
              <CheckCircle size={12} className="mr-1" /> Verificar
            </Button>
          )}

          {/* Role assignment — opens full-screen modal instead of floating dropdown */}
          {isSuperAdmin && adminRole !== "super_admin" && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8 text-muted-foreground hover:text-foreground hover:bg-white/8 gap-1"
              onClick={() => setShowGovernanceModal(true)}
            >
              <Shield size={12} />
              <span className="hidden sm:inline">{user.role === "admin" ? "Cargo" : "Promover"}</span>
              <ChevronDown size={10} />
            </Button>
          )}

          {user.role !== "admin" && (
            <Button
              size="sm"
              variant="ghost"
              className={`text-xs h-8 ${isBanned ? "text-green-400 hover:bg-green-400/10" : "text-destructive hover:bg-destructive/10"}`}
              onClick={() => onBan(user.id!)}
            >
              {isBanned ? (
                <><CheckCircle size={12} className="mr-1" /> Desbanir</>
              ) : (
                <><Ban size={12} className="mr-1" /> Banir</>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState("Todos");
  const roleMap: Record<string, string> = { "Freelancers": "freelancer", "Empresas": "company", "Admins": "admin" };
  const isSuperAdmin = (currentUser as any)?.adminRole === "super_admin";

  const { data: users = [], isLoading, refetch } = useAdminListUsers({
    role: roleTab !== "Todos" ? roleMap[roleTab] : undefined,
  });

  const banMutation = useAdminBanUser();
  const verifyMutation = useAdminVerifyUser();

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const bannedCount = users.filter(u => (u as any).isBanned).length;
  const verifiedCount = users.filter(u => u.isVerified).length;
  const adminCount = users.filter(u => u.role === "admin").length;

  const handleVerify = async (id: number) => {
    try {
      await verifyMutation.mutateAsync({ id });
      toast.success("Usuário verificado!");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao verificar");
    }
  };

  const handleBan = async (id: number) => {
    const user = users.find(u => u.id === id);
    const isBanned = (user as any)?.isBanned;
    try {
      await banMutation.mutateAsync({ id });
      toast.success(isBanned ? "Usuário desbanido" : "Usuário banido");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao banir/desbanir");
    }
  };

  const handleSetRole = async (id: number, role: string, adminRole: string | null) => {
    try {
      await apiFetch(`/api/admin/users/${id}/set-role`, {
        method: "POST",
        body: JSON.stringify({ role, adminRole }),
      });
      toast.success("Cargo atualizado!");
      refetch();
    } catch (e: any) {
      let msg = "Erro ao atualizar cargo";
      try { msg = JSON.parse(e.message)?.error ?? msg; } catch {}
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[22px] font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} usuário{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <div className="glass-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Verificados</p>
            <p className="text-lg sm:text-xl font-bold text-green-400">{verifiedCount}</p>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Admins</p>
            <p className="text-lg sm:text-xl font-bold text-yellow-400">{adminCount}</p>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Banidos</p>
            <p className="text-lg sm:text-xl font-bold text-destructive">{bannedCount}</p>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{users.length}</p>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
          <Crown size={14} className="text-yellow-400" />
          <p className="text-xs text-yellow-400/80 font-medium">
            Você é Super Admin — pode promover e remover cargos de outros usuários.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-primary h-11 rounded-xl"
          />
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
          {ROLE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setRoleTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                roleTab === t ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="glass-card rounded-xl h-20 animate-pulse" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Users size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum usuário encontrado</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(user => (
          <UserRow
            key={user.id}
            user={user}
            onVerify={handleVerify}
            onBan={handleBan}
            onSetRole={handleSetRole}
            isSuperAdmin={isSuperAdmin}
          />
        ))}
      </div>
    </div>
  );
}
