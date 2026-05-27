import React, { useState } from "react";
import { useAuditLogs } from "@/lib/admin-api";
import { Shield, Search, Filter, ChevronDown, User, Settings, CreditCard, Briefcase, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ban_user: { label: "Banir Usuário", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  unban_user: { label: "Desbanir Usuário", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  verify_user: { label: "Verificar Usuário", color: "text-primary bg-primary/10 border-primary/20" },
  assign_admin_role: { label: "Atribuir Função", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  promote_to_admin: { label: "Promover Admin", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  approve_withdrawal: { label: "Aprovar Saque", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  reject_withdrawal: { label: "Rejeitar Saque", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  update_setting: { label: "Alterar Configuração", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  bulk_update_settings: { label: "Atualização em Lote", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  assign_representative: { label: "Atribuir Representante", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  financial_admin: "Admin Financeiro",
  operations_admin: "Admin Operacional",
  regional_admin: "Admin Regional",
  support_admin: "Admin de Suporte",
  state_representative: "Representante",
  admin: "Admin",
};

function ActionIcon({ action }: { action: string }) {
  if (action.includes("user")) return <User size={13} />;
  if (action.includes("withdrawal")) return <CreditCard size={13} />;
  if (action.includes("setting")) return <Settings size={13} />;
  if (action.includes("representative")) return <Shield size={13} />;
  return <Eye size={13} />;
}

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: logs = [], isLoading } = useAuditLogs({ limit: 200 });

  const actionGroups = [
    { key: "all", label: "Todos" },
    { key: "user", label: "Usuários" },
    { key: "withdrawal", label: "Saques" },
    { key: "setting", label: "Configurações" },
    { key: "representative", label: "Representantes" },
  ];

  const filtered = logs.filter(l => {
    const matchSearch = !search ||
      l.adminName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.targetType ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || l.action.includes(filter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 page-enter">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Shield size={22} className="text-primary" />
            Logs de Auditoria
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {filtered.length} de {logs.length} entradas
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/18">
          <span className="live-dot" />
          <span className="text-[11px] text-primary font-bold">Tempo real</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por admin, ação, tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white/5 border-white/10 focus:border-primary rounded-xl text-sm"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8">
          {actionGroups.map(g => (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === g.key ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log entries */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-14 glass-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum log encontrado</p>
          <p className="text-xs text-muted-foreground/60 mt-1">As ações dos administradores aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(log => {
            const meta = ACTION_LABELS[log.action] ?? { label: log.action, color: "text-muted-foreground bg-white/5 border-white/8" };
            const isOpen = expanded === log.id;
            return (
              <div
                key={log.id}
                className={`glass-card rounded-xl overflow-hidden transition-all ${isOpen ? "border-white/12" : ""}`}
              >
                <div
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-white/3"
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <ActionIcon action={log.action} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">por</span>
                      <span className="text-xs font-semibold truncate">{log.adminName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground font-medium">
                        {ROLE_LABELS[log.adminRole] ?? log.adminRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {log.targetType && (
                        <span className="text-[10px] text-muted-foreground/60">
                          {log.targetType} {log.targetId ? `#${log.targetId}` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {log.createdAt ? format(new Date(log.createdAt), "dd/MM HH:mm", { locale: ptBR }) : "—"}
                    </span>
                    <ChevronDown size={12} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && log.details && (
                  <div className="border-t border-white/5 px-3.5 pb-3.5 pt-2.5">
                    <p className="text-[10px] text-muted-foreground font-semibold mb-1.5 uppercase tracking-wider">Detalhes</p>
                    <pre className="text-[11px] font-mono bg-black/30 rounded-lg p-2.5 overflow-x-auto text-primary/80">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      ID do Log: #{log.id} · Admin ID: {log.adminId} ·{" "}
                      {log.createdAt ? format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR }) : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
