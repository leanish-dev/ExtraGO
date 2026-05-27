import React from "react";
import { useAdminStats, useAdminMonitoring } from "@/lib/admin-api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, Briefcase, DollarSign, TrendingUp, CheckCircle, Clock,
  Activity, UserCheck, Star, ArrowUpRight, Shield, Zap,
} from "lucide-react";
import { Link } from "wouter";

function fmtBrl(cents: number) {
  if (cents >= 100_000_00) return `R$ ${(cents / 100_000_00).toFixed(1)}M`;
  if (cents >= 1_000_00) return `R$ ${(cents / 1_000_00).toFixed(1)}k`;
  return `R$ ${(cents / 100).toFixed(2)}`;
}

function fmtMonth(m: string) {
  const [, mo] = m.split("-");
  return ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][parseInt(mo) - 1] ?? m;
}

const CHART_STYLE = {
  contentStyle: { background: "rgba(4,6,8,0.97)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, fontSize: 11 },
  labelStyle: { color: "#6b7280", fontSize: 10 },
};

function KpiCard({ label, value, sub, icon, color = "text-primary", href }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color?: string; href?: string;
}) {
  const inner = (
    <div className="glass-card rounded-2xl p-4 card-hover cursor-pointer group">
      <div className={`flex items-center gap-2 mb-2.5 ${color}`}>
        <span className="p-1.5 rounded-lg bg-current/10 flex-shrink-0">{icon}</span>
        <p className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors flex-1 truncate">{label}</p>
        {href && <ArrowUpRight size={11} className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />}
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: monitoring } = useAdminMonitoring();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="glass-card rounded-2xl h-24 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const revenueData = (stats?.revenueByMonth ?? []).map(m => ({
    month: fmtMonth(m.month), amount: m.amount / 100, tx: m.transactions,
  }));

  const growthData = (stats?.userGrowthByMonth ?? []).map(m => ({
    month: fmtMonth(m.month), Freelancers: m.freelancers, Empresas: m.companies,
  }));

  const categoryData = (stats?.jobsByCategory ?? []).slice(0, 6).map(c => ({
    name: c.category.length > 12 ? c.category.slice(0, 12) + "…" : c.category,
    value: c.count,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Painel Administrativo</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Visão geral da plataforma extraGO</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[10px] font-bold text-primary">Dados em tempo real</span>
        </div>
      </div>

      {/* Live monitoring strip */}
      {monitoring && (
        <div className="fintech-hero-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={12} className="text-primary" />
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Monitoramento ao Vivo</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: "Usuários hoje", value: monitoring.newUsersToday, color: "text-primary" },
              { label: "Vagas ativas", value: monitoring.activeJobs, color: "text-cyan-400" },
              { label: "Em andamento", value: monitoring.jobsInProgress, color: "text-yellow-400" },
              { label: "Pagamentos/h", value: monitoring.paymentsLastHour, color: "text-green-400" },
              { label: "Saques pend.", value: monitoring.withdrawalsPending, color: "text-orange-400" },
              { label: "Valor pend.", value: fmtBrl(monitoring.withdrawalsPendingAmount), color: "text-red-400" },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total de Usuários" value={stats?.totalUsers ?? 0}
          sub={`+${stats?.usersThisWeek ?? 0} esta semana`}
          icon={<Users size={14} />} href="/admin/users" />
        <KpiCard label="Freelancers" value={stats?.totalFreelancers ?? 0}
          sub={`${stats?.pendingVerifications ?? 0} aguardando verificação`}
          icon={<UserCheck size={14} />} color="text-cyan-400" />
        <KpiCard label="Empresas" value={stats?.totalCompanies ?? 0}
          icon={<Briefcase size={14} />} color="text-yellow-400" />
        <KpiCard label="Administradores" value={stats?.totalAdmins ?? 0}
          icon={<Shield size={14} />} color="text-purple-400" />
        <KpiCard label="Vagas Totais" value={stats?.totalJobs ?? 0}
          sub={`${stats?.activeJobs ?? 0} abertas · ${stats?.jobsInProgress ?? 0} em andamento`}
          icon={<Briefcase size={14} />} color="text-orange-400" href="/admin/jobs" />
        <KpiCard label="Vagas Concluídas" value={stats?.completedJobs ?? 0}
          sub={`${stats?.jobsToday ?? 0} criadas hoje`}
          icon={<CheckCircle size={14} />} color="text-green-400" />
        <KpiCard label="Comissões Geradas" value={fmtBrl(stats?.totalRevenue ?? 0)}
          icon={<DollarSign size={14} />} color="text-primary" href="/admin/financial" />
        <KpiCard label="Saques Pendentes" value={stats?.pendingWithdrawals ?? 0}
          sub={fmtBrl(stats?.pendingWithdrawalsAmount ?? 0)}
          icon={<Clock size={14} />} color="text-red-400" href="/admin/financial" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold">Receita Mensal</h3>
              <p className="text-[10px] text-muted-foreground">comissões por mês</p>
            </div>
            <span className="text-[10px] text-primary font-bold">6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revG2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7CFC00" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7CFC00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip {...CHART_STYLE} formatter={(v: any) => [fmtBrl(v * 100), "Receita"]} />
              <Area type="monotone" dataKey="amount" stroke="#7CFC00" fill="url(#revG2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold">Crescimento de Usuários</h3>
              <p className="text-[10px] text-muted-foreground">freelancers e empresas</p>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Freelancers</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />Empresas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={growthData} barGap={2} barCategoryGap="35%">
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...CHART_STYLE} />
              <Bar dataKey="Freelancers" fill="#7CFC00" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="Empresas" fill="#00E5FF" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Top Freelancers</h3>
            <Link href="/admin/users" className="text-[10px] text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-2.5">
            {(stats?.topFreelancers ?? []).slice(0, 5).map((u: any, i: number) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className={`text-[10px] font-black w-4 flex-shrink-0 ${
                  i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-muted-foreground"
                }`}>#{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-cyan-400/20 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  {u.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">{u.completedJobs} jobs</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 text-yellow-400">
                    <Star size={9} className="fill-yellow-400" />
                    <span className="text-[10px] font-bold">{(u.reputationScore ?? 0).toFixed(1)}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold capitalize ${
                    { elite: "text-primary bg-primary/10", gold: "text-yellow-400 bg-yellow-400/10", silver: "text-slate-300 bg-slate-300/10", bronze: "text-orange-400 bg-orange-400/10" }[u.level ?? "bronze"]
                  }`}>{u.level}</span>
                </div>
              </div>
            ))}
            {(stats?.topFreelancers ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum dado ainda</p>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Vagas por Categoria</h3>
            <Link href="/admin/jobs" className="text-[10px] text-primary hover:underline">Ver vagas →</Link>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} layout="vertical" barCategoryGap="25%">
                <XAxis type="number" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} axisLine={false} tickLine={false} width={85} />
                <Tooltip {...CHART_STYLE} />
                <Bar dataKey="value" fill="#7CFC00" radius={[0, 4, 4, 0]} opacity={0.8} name="Vagas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Briefcase size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhuma vaga cadastrada ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/users", label: "Verificar Usuários", sub: `${stats?.pendingVerifications ?? 0} pendentes`, icon: <UserCheck size={16} />, color: "text-primary" },
          { href: "/admin/financial", label: "Aprovar Saques", sub: `${stats?.pendingWithdrawals ?? 0} aguardando`, icon: <DollarSign size={16} />, color: "text-orange-400" },
          { href: "/admin/map", label: "Mapa Regional", sub: "Distribuição por estado", icon: <Activity size={16} />, color: "text-cyan-400" },
          { href: "/admin/audit", label: "Auditoria", sub: "Ver histórico", icon: <Shield size={16} />, color: "text-purple-400" },
        ].map((a, i) => (
          <Link key={i} href={a.href}>
            <div className="glass-card rounded-2xl p-4 card-hover cursor-pointer group">
              <div className={`${a.color} mb-2`}>{a.icon}</div>
              <p className="text-xs font-bold">{a.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{a.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
