import React, { useState } from "react";
import { useFinancialOverview } from "@/lib/admin-api";
import { useAdminListWithdrawals, useAdminApproveWithdrawal } from "@workspace/api-client-react";
import { useRejectWithdrawal } from "@/lib/admin-api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { DollarSign, TrendingUp, CreditCard, PieChart as PieIcon, CheckCircle, XCircle, Clock, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DIST_COLORS = ["#7CFC00", "#00E5FF", "#a78bfa", "#f59e0b"];

function fmtBrl(cents: number) {
  return `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtMonth(m: string) {
  const [y, mo] = m.split("-");
  return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(mo) - 1] + " " + y.slice(2);
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(8,17,26,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11 },
  labelStyle: { color: "#aaa", fontSize: 10 },
  itemStyle: { color: "#7CFC00" },
};

export default function AdminFinancialPage() {
  const { data: overview, isLoading } = useFinancialOverview();
  const { data: withdrawals = [], refetch: refetchWd } = useAdminListWithdrawals({ status: "pending" });
  const approveMut = useAdminApproveWithdrawal();
  const rejectMut = useRejectWithdrawal();

  const [wdTab, setWdTab] = useState<"pending" | "all">("pending");

  const handleApprove = async (id: number) => {
    try {
      await approveMut.mutateAsync({ id });
      toast.success("Saque aprovado");
      refetchWd();
    } catch { toast.error("Erro ao aprovar saque"); }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMut.mutateAsync({ id });
      toast.success("Saque rejeitado");
      refetchWd();
    } catch { toast.error("Erro ao rejeitar saque"); }
  };

  const distData = overview ? [
    { name: "Representante", value: overview.distribution.representative.pct, amount: overview.distribution.representative.amount },
    { name: "Marketing", value: overview.distribution.marketing.pct, amount: overview.distribution.marketing.amount },
    { name: "Capital Humano", value: overview.distribution.humanCapital.pct, amount: overview.distribution.humanCapital.amount },
    { name: "Plataforma", value: overview.distribution.platform.pct, amount: overview.distribution.platform.amount },
  ] : [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1,2,3].map(i => <div key={i} className="glass-card rounded-2xl h-32 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <DollarSign size={22} className="text-primary" />
          Gestão Financeira
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Receitas, distribuição e saques da plataforma</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Transacionado", value: fmtBrl(overview?.totalTransacted ?? 0),
            icon: <ArrowUpRight size={16} />, color: "text-primary", glow: "stat-glow-green",
          },
          {
            label: "Comissões Geradas", value: fmtBrl(overview?.totalCommissions ?? 0),
            icon: <TrendingUp size={16} />, color: "text-cyan-400", glow: "stat-glow-cyan",
          },
          {
            label: "Saques Realizados", value: fmtBrl(overview?.totalWithdrawn ?? 0),
            icon: <CreditCard size={16} />, color: "text-yellow-400",
          },
          {
            label: "Saques Pendentes", value: overview?.withdrawalsByStatus.pending ?? 0,
            sub: fmtBrl(overview?.withdrawalsByStatus.pendingAmount ?? 0),
            icon: <Clock size={16} />, color: "text-orange-400",
          },
        ].map((kpi, i) => (
          <div key={i} className={`glass-card rounded-2xl p-4 ${kpi.glow ?? ""}`}>
            <div className={`flex items-center gap-2 ${kpi.color} mb-2`}>
              {kpi.icon}
              <p className="text-[11px] font-semibold text-muted-foreground">{kpi.label}</p>
            </div>
            <p className="text-xl font-black">{kpi.value}</p>
            {kpi.sub && <p className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue chart + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Revenue area chart */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Receita Mensal</h3>
            <span className="text-[10px] text-muted-foreground">últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={(overview?.revenueByMonth ?? []).map(m => ({
              ...m,
              month: fmtMonth(m.month),
              revenueFormatted: m.revenue / 100,
              transactedFormatted: m.transacted / 100,
            }))}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7CFC00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7CFC00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: any, n: string) => [fmtBrl(v * 100), n === "revenueFormatted" ? "Comissões" : "Transacionado"]} />
              <Area type="monotone" dataKey="transactedFormatted" stroke="#00E5FF" fill="url(#txGrad)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="revenueFormatted" stroke="#7CFC00" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution pie */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon size={14} className="text-primary" />
            <h3 className="font-bold text-sm">Distribuição de Receita</h3>
          </div>
          <div className="flex justify-center mb-3">
            <PieChart width={160} height={160}>
              <Pie
                data={distData}
                cx={80} cy={80}
                innerRadius={50} outerRadius={75}
                dataKey="value"
                strokeWidth={0}
              >
                {distData.map((_, i) => <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {distData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: DIST_COLORS[i % DIST_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{d.value.toFixed(0)}%</span>
                  <span className="text-muted-foreground ml-2 text-[10px]">{fmtBrl(d.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4">Receita vs Saques por Mês</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={(overview?.revenueByMonth ?? []).map(m => ({
            month: fmtMonth(m.month),
            Comissão: m.revenue / 100,
            Saques: m.withdrawals / 100,
          }))} barGap={4} barCategoryGap="30%">
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [fmtBrl(v * 100), ""]} />
            <Bar dataKey="Comissão" fill="#7CFC00" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="Saques" fill="#00E5FF" radius={[4, 4, 0, 0]} opacity={0.65} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending withdrawals */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Clock size={14} className="text-orange-400" /> Saques Pendentes
          </h3>
          <span className="text-[11px] text-muted-foreground">{withdrawals.length} aguardando aprovação</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={32} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum saque pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(withdrawals as any[]).map((w: any) => (
              <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/4 hover:bg-white/6 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={14} className="text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{w.userName ?? "—"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">PIX: {w.pixKey ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {w.createdAt ? format(new Date(w.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 mr-3">
                  <p className="text-base font-black text-primary">{fmtBrl(w.amount ?? 0)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(w.id)}
                    disabled={approveMut.isPending}
                    className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors disabled:opacity-50"
                    title="Aprovar"
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleReject(w.id)}
                    disabled={rejectMut.isPending}
                    className="w-8 h-8 rounded-xl bg-red-400/10 text-red-400 border border-red-400/20 flex items-center justify-center hover:bg-red-400/20 transition-colors disabled:opacity-50"
                    title="Rejeitar"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
