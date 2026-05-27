import React, { useState } from "react";
import { useRepresentatives, useAssignRepresentative } from "@/lib/admin-api";
import { useAdminListUsers } from "@workspace/api-client-react";
import { UserCheck, MapPin, DollarSign, Plus, Search, CheckCircle, X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const BR_STATES: { code: string; name: string }[] = [
  { code: "AC", name: "Acre" }, { code: "AL", name: "Alagoas" }, { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" }, { code: "BA", name: "Bahia" }, { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" }, { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" }, { code: "MA", name: "Maranhão" }, { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" }, { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" }, { code: "PB", name: "Paraíba" }, { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" }, { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" }, { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" }, { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" }, { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" }, { code: "SE", name: "Sergipe" }, { code: "TO", name: "Tocantins" },
];

export default function AdminRepresentativesPage() {
  const { data: reps = [], isLoading, refetch } = useRepresentatives();
  const { data: users = [] } = useAdminListUsers();
  const assignMut = useAssignRepresentative();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ userId: "", stateCode: "", commissionRate: "20" });
  const [userSearch, setUserSearch] = useState("");

  const filtered = reps.filter(r =>
    !search || r.userName.toLowerCase().includes(search.toLowerCase()) || r.stateCode.includes(search.toUpperCase())
  );

  const eligibleUsers = (users as any[])
    .filter((u: any) => !reps.find(r => r.userId === u.id))
    .filter((u: any) =>
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    )
    .slice(0, 8);

  const handleAssign = async () => {
    if (!form.userId || !form.stateCode) { toast.error("Selecione usuário e estado"); return; }
    const state = BR_STATES.find(s => s.code === form.stateCode);
    try {
      await assignMut.mutateAsync({
        userId: parseInt(form.userId),
        stateCode: form.stateCode,
        stateName: state?.name ?? form.stateCode,
        commissionRate: parseFloat(form.commissionRate) / 100,
      });
      toast.success("Representante atribuído com sucesso!");
      setShowForm(false);
      setForm({ userId: "", stateCode: "", commissionRate: "20" });
      refetch();
    } catch { toast.error("Erro ao atribuir representante"); }
  };

  const totalEarned = reps.reduce((s, r) => s + r.totalEarned, 0);
  const totalPaid = reps.reduce((s, r) => s + r.totalPaid, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 page-enter">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <UserCheck size={22} className="text-primary" />
            Representantes Estaduais
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{reps.length} representantes · {BR_STATES.length - reps.length} estados vagos</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary border border-primary/25 text-sm font-bold hover:bg-primary/22 transition-colors"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancelar" : "Novo Representante"}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Representantes Ativos", value: reps.filter(r => r.isActive).length, icon: <UserCheck size={14} />, color: "text-primary" },
          { label: "Estados Cobertos", value: reps.length, sub: `/ ${BR_STATES.length}`, icon: <MapPin size={14} />, color: "text-cyan-400" },
          { label: "Total Gerado", value: `R$ ${(totalEarned / 100).toFixed(0)}`, icon: <TrendingUp size={14} />, color: "text-yellow-400" },
          { label: "Total Pago", value: `R$ ${(totalPaid / 100).toFixed(0)}`, icon: <DollarSign size={14} />, color: "text-green-400" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card rounded-xl p-3.5">
            <div className={`flex items-center gap-1.5 ${kpi.color} mb-1.5`}>{kpi.icon}<span className="text-[10px] font-bold">{kpi.label}</span></div>
            <p className="text-xl font-black">{kpi.value}<span className="text-xs text-muted-foreground">{kpi.sub}</span></p>
          </div>
        ))}
      </div>

      {/* Assignment form */}
      {showForm && (
        <div className="glass-card rounded-2xl p-5 border border-primary/20">
          <h3 className="text-sm font-bold mb-4">Atribuir Representante Estadual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Buscar Usuário</label>
              <Input
                placeholder="Nome ou e-mail..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="h-9 bg-white/5 border-white/10 focus:border-primary rounded-xl text-sm mb-2"
              />
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {eligibleUsers.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => setForm(f => ({ ...f, userId: String(u.id) }))}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      form.userId === String(u.id) ? "bg-primary/15 border border-primary/25 text-primary" : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-cyan-400/30 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {form.userId === String(u.id) && <CheckCircle size={13} className="text-primary flex-shrink-0" />}
                  </button>
                ))}
                {eligibleUsers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum usuário encontrado</p>}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Estado</label>
                <select
                  value={form.stateCode}
                  onChange={e => setForm(f => ({ ...f, stateCode: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Selecione o estado</option>
                  {BR_STATES.filter(s => !reps.find(r => r.stateCode === s.code)).map(s => (
                    <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground font-medium mb-1.5 block">Taxa de Comissão (%)</label>
                <Input
                  type="number" min="0" max="50" step="1"
                  value={form.commissionRate}
                  onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))}
                  className="h-9 bg-white/5 border-white/10 focus:border-primary rounded-xl text-sm"
                />
              </div>
              <button
                onClick={handleAssign}
                disabled={assignMut.isPending || !form.userId || !form.stateCode}
                className="w-full h-9 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {assignMut.isPending ? "Atribuindo..." : "Confirmar Atribuição"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou estado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 bg-white/5 border-white/10 focus:border-primary rounded-xl text-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <UserCheck size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{reps.length === 0 ? "Nenhum representante configurado" : "Nenhum resultado"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(r => (
            <div key={r.id} className="glass-card rounded-2xl p-4 card-hover">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-400/15 border border-primary/20 flex items-center justify-center text-base font-black flex-shrink-0">
                  {r.stateCode}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{r.userName}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${r.isActive ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground bg-white/5 border-white/8"}`}>
                      {r.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground">{r.stateName}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{r.userEmail}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black text-primary">{(r.commissionRate * 100).toFixed(0)}%</p>
                  <p className="text-[9px] text-muted-foreground">comissão</p>
                  <p className="text-[11px] font-bold text-primary/70 mt-1">
                    R$ {(r.totalEarned / 100).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">ganho total</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
