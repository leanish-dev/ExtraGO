import React, { useState } from "react";
import { useAdminListUsers, useAdminBanUser, useAdminVerifyUser } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { Users, Search, Shield, Ban, CheckCircle, AlertCircle, Star, Briefcase, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROLE_TABS = ["Todos", "Freelancers", "Empresas"];

function UserRow({ user, onVerify, onBan }: { user: User; onVerify: (id: number) => void; onBan: (id: number) => void }) {
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

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {user.name?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm truncate">{user.name}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role ?? "freelancer"]}`}>
            {roleLabels[user.role ?? "freelancer"]}
          </span>
          {user.isVerified && (
            <span className="text-xs text-primary flex items-center gap-0.5">
              <CheckCircle size={11} /> Verificado
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        {user.role === "freelancer" && (
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Briefcase size={11} /> {user.completedJobs ?? 0} jobs</span>
            <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" /> {(user.reputationScore ?? 0).toFixed(1)}</span>
            <span className="capitalize">{user.level ?? "bronze"}</span>
          </div>
        )}
        {user.role === "company" && user.companyName && (
          <p className="text-xs text-muted-foreground mt-0.5">{user.companyName}</p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {!user.isVerified && user.role !== "admin" && (
          <Button
            size="sm"
            className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 text-xs"
            onClick={() => onVerify(user.id!)}
          >
            <CheckCircle size={13} className="mr-1" /> Verificar
          </Button>
        )}
        {user.role !== "admin" && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 text-xs"
            onClick={() => onBan(user.id!)}
          >
            <Ban size={13} className="mr-1" /> Banir
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState("Todos");
  const roleMap: Record<string, string> = { "Freelancers": "freelancer", "Empresas": "company" };

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
      toast.success("Usuário banido");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao banir");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} usuário{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
      </div>

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
          <UserRow key={user.id} user={user} onVerify={handleVerify} onBan={handleBan} />
        ))}
      </div>
    </div>
  );
}
