import React, { useState } from "react";
import { useAdminListUsers, useAdminBanUser, useAdminVerifyUser } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useAssignAdminRole, usePromoteToAdmin } from "@/lib/admin-api";
import { Users, Search, Shield, Ban, CheckCircle, AlertCircle, Star, Briefcase, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_TABS = ["Todos", "Freelancers", "Empresas", "Admins"];

const ADMIN_ROLES = [
  { value: null, label: "Sem função admin" },
  { value: "super_admin", label: "Super Admin" },
  { value: "financial_admin", label: "Admin Financeiro" },
  { value: "operations_admin", label: "Admin Operacional" },
  { value: "regional_admin", label: "Admin Regional" },
  { value: "support_admin", label: "Admin de Suporte" },
  { value: "state_representative", label: "Representante Estadual" },
];

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const ADMIN_ROLE_COLORS: Record<string, string> = {
  super_admin: "text-primary bg-primary/10 border-primary/20",
  financial_admin: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  operations_admin: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  regional_admin: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  support_admin: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  state_representative: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

function RoleMenu({ user, onClose, onRefetch }: { user: User; onClose: () => void; onRefetch: () => void }) {
  const assignRoleMut = useAssignAdminRole();
  const promoteMut = usePromoteToAdmin();
  const [adminRole, setAdminRole] = useState<string | null>((user as any).adminRole ?? null);
  const [stateCode, setStateCode] = useState<string>((user as any).stateCode ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user.role !== "admin" && adminRole !== null) {
        await promoteMut.mutateAsync({ id: user.id!, adminRole, stateCode: stateCode || undefined });
        toast.success("Usuário promovido a administrador!");
      } else {
        await assignRoleMut.mutateAsync({ id: user.id!, adminRole, stateCode: stateCode || undefined });
        toast.success("Função atualizada!");
      }
      onRefetch();
      onClose();
    } catch {
      toast.error("Erro ao atualizar função");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="absolute right-0 top-full mt-2 w-72 z-50 glass-card rounded-2xl p-4 shadow-2xl border border-white/12"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold">Atribuir Função Admin</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={13} /></button>
      </div>

      <div className="space-y-2 mb-3">
        {ADMIN_ROLES.map(r => (
          <button
            key={String(r.value)}
            onClick={() => setAdminRole(r.value)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
              adminRole === r.value
                ? `${r.value ? ADMIN_ROLE_COLORS[r.value] : "text-muted-foreground bg-white/8 border-white/12"} border`
                : "text-muted-foreground hover:bg-white/5 border border-transparent"
            }`}
          >
            <Shield size={11} />
            {r.label}
          </button>
        ))}
      </div>

      {(adminRole === "regional_admin" || adminRole === "state_representative") && (
        <div className="mb-3">
          <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Estado</label>
          <select
            value={stateCode}
            onChange={e => setStateCode(e.target.value)}
            className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">Selecione</option>
            {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-8 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Confirmar"}
      </button>
    </motion.div>
  );
}

function UserRow({ user, onVerify, onBan, onRefetch }: {
  user: User; onVerify: (id: number) => void; onBan: (id: number) => void; onRefetch: () => void;
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleColors: Record<string, string> = {
    freelancer: "text-primary bg-primary/10 border-primary/20",
    company: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    admin: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };
  const roleLabels: Record<string, string> = {
    freelancer: "Freelancer", company: "Empresa", admin: "Admin",
  };

  const adminRole = (user as any).adminRole as string | null;
  const stateCode = (user as any).stateCode as string | null;

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4 card-hover relative">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {user.name?.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm truncate">{user.name}</p>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${roleColors[user.role ?? "freelancer"]}`}>
            {roleLabels[user.role ?? "freelancer"]}
          </span>
          {adminRole && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${ADMIN_ROLE_COLORS[adminRole] ?? ""}`}>
              {ADMIN_ROLES.find(r => r.value === adminRole)?.label ?? adminRole}
            </span>
          )}
          {stateCode && (
            <span className="text-[9px] px-1 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/8 font-mono">{stateCode}</span>
          )}
          {user.isVerified && (
            <span className="text-[9px] text-primary flex items-center gap-0.5"><CheckCircle size={10} /> Verificado</span>
          )}
          {user.isBanned && (
            <span className="text-[9px] text-red-400 flex items-center gap-0.5"><AlertCircle size={10} /> Banido</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        {user.role === "freelancer" && (
          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Briefcase size={10} /> {user.completedJobs ?? 0} jobs</span>
            <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400" /> {(user.reputationScore ?? 0).toFixed(1)}</span>
            <span className="capitalize">{user.level ?? "bronze"}</span>
          </div>
        )}
        {user.role === "company" && user.companyName && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{user.companyName}</p>
        )}
        {user.createdAt && (
          <p className="text-[9px] text-muted-foreground/50 mt-0.5">
            Criado em {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
      </div>

      <div className="flex gap-1.5 flex-shrink-0 relative">
        {!user.isVerified && user.role !== "admin" && (
          <button
            className="h-8 px-2.5 rounded-xl bg-primary/8 text-primary hover:bg-primary/15 border border-primary/15 text-[10px] font-bold flex items-center gap-1 transition-colors"
            onClick={() => onVerify(user.id!)}
          >
            <CheckCircle size={11} /> Verificar
          </button>
        )}
        <button
          className={`h-8 px-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 transition-colors ${
            user.isBanned
              ? "bg-yellow-400/8 text-yellow-400 border-yellow-400/15 hover:bg-yellow-400/15"
              : "bg-red-400/8 text-red-400 border-red-400/15 hover:bg-red-400/15"
          }`}
          onClick={() => onBan(user.id!)}
        >
          <Ban size={11} /> {user.isBanned ? "Desbanir" : "Banir"}
        </button>
        <button
          className="h-8 px-2 rounded-xl bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8 border border-white/8 text-[10px] font-bold flex items-center gap-1 transition-colors"
          onClick={() => setShowRoleMenu(s => !s)}
          title="Atribuir função"
        >
          <Shield size={11} />
          <ChevronDown size={9} />
        </button>

        <AnimatePresence>
          {showRoleMenu && (
            <RoleMenu user={user} onClose={() => setShowRoleMenu(false)} onRefetch={onRefetch} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState("Todos");
  const roleMap: Record<string, string> = { "Freelancers": "freelancer", "Empresas": "company", "Admins": "admin" };

  const { data: users = [], isLoading, refetch } = useAdminListUsers({
    role: roleTab !== "Todos" ? roleMap[roleTab] : undefined,
  });

  const banMutation = useAdminBanUser();
  const verifyMutation = useAdminVerifyUser();

  const filtered = (users as User[]).filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

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
    try {
      await banMutation.mutateAsync({ id });
      toast.success("Status do usuário atualizado");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao banir");
    }
  };

  const total = (users as User[]).length;
  const verified = (users as User[]).filter(u => u.isVerified).length;
  const banned = (users as User[]).filter(u => u.isBanned).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Users size={22} className="text-primary" />
          Gerenciar Usuários
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">{filtered.length} usuário{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xl font-black text-primary">{total}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xl font-black text-green-400">{verified}</p>
          <p className="text-[10px] text-muted-foreground">Verificados</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xl font-black text-red-400">{banned}</p>
          <p className="text-[10px] text-muted-foreground">Banidos</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-primary h-10 rounded-xl text-sm"
          />
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
          {ROLE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setRoleTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
          {[1, 2, 3, 4].map(i => <div key={i} className="glass-card rounded-xl h-20 animate-pulse" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Users size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum usuário encontrado</p>
        </div>
      )}

      <div className="space-y-2.5">
        {filtered.map(user => (
          <UserRow
            key={user.id}
            user={user}
            onVerify={handleVerify}
            onBan={handleBan}
            onRefetch={refetch}
          />
        ))}
      </div>
    </div>
  );
}
