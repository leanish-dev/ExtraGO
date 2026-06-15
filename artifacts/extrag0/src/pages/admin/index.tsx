import React from "react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Users, Briefcase, DollarSign, TrendingUp, Shield, CheckCircle, AlertCircle, UserCheck, MapPin, Globe, Activity, Radio } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/animated-counter";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { useLivePlatformStats } from "@/hooks/use-live-platform-stats";
import { motion } from "framer-motion";

/* ── Revenue sparkline ── */
function RevenueChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.amount), 1);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Receita por Mês</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
        </div>
        <TrendingUp size={15} className="text-primary opacity-60" />
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => {
          const pct = max > 0 ? (d.amount / max) * 100 : 0;
          const month = d.month ? months[parseInt(d.month.slice(5, 7)) - 1] : `M${i + 1}`;
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                R${(d.amount / 100).toFixed(0)}
              </span>
              <div className="w-full rounded-t-sm relative overflow-hidden" style={{ height: `${Math.max(pct, 4)}%` }}>
                <div className={`absolute inset-0 ${isLast ? "bg-primary" : "bg-primary/35"} transition-all`} />
              </div>
              <span className="text-[9px] text-muted-foreground">{month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Metric row item (no card box) ── */
function MetricItem({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">{label}</p>
      <p className={`text-2xl sm:text-3xl font-black leading-none ${color ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

/* ── Live operations strip ── */
function LiveOperationsStrip() {
  const { data: stats, isLoading } = useLivePlatformStats();

  const items = [
    { label: "Usuários Ativos (24h)", value: stats?.activeUsers24h ?? 0, color: "text-primary", dot: "bg-primary" },
    { label: "Extras Hoje", value: stats?.jobsToday ?? 0, color: "text-secondary", dot: "bg-secondary" },
    { label: "Em Andamento", value: stats?.jobsInProgress ?? 0, color: "text-green-400", dot: "bg-green-400" },
    { label: "Total Extras", value: stats?.totalJobs ?? 0, color: "text-yellow-400", dot: "bg-yellow-400" },
  ];

  return (
    <div className="rounded-2xl border border-white/6 p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.03) 0%, rgba(0,229,255,0.015) 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.3), rgba(0,229,255,0.2), transparent)" }} />

      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-400/8 border border-green-400/18">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Operação ao vivo</span>
        </div>
        <Radio size={13} className="text-muted-foreground opacity-50" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-2 w-16 skeleton rounded" />
                <div className="h-8 w-12 skeleton rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot} opacity-70`} />
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">{item.label}</p>
                </div>
                <p className={`text-2xl sm:text-3xl font-black leading-none ${item.color}`}>
                  <AnimatedCounter value={item.value} />
                </p>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Main KPI section (typographic, no colored cards) ── */
function MainKPIs({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-2 w-20 skeleton rounded" />
            <div className="h-8 w-16 skeleton rounded" />
            <div className="h-2 w-24 skeleton rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-2">
      <MetricItem
        label="Total Usuários"
        value={<AnimatedCounter value={stats?.totalUsers ?? 0} />}
        sub={`+${stats?.usersThisMonth ?? 0} este mês`}
        color="text-foreground"
      />
      <MetricItem
        label="Total Extras"
        value={<AnimatedCounter value={stats?.totalJobs ?? 0} />}
        sub="publicados na plataforma"
        color="text-foreground"
      />
      <MetricItem
        label="Receita Total"
        value={<>R$<AnimatedCounter value={(stats?.totalRevenue ?? 0) / 100} decimals={0} /></>}
        sub="em transações processadas"
        color="text-primary"
      />
      <MetricItem
        label="Saques Pendentes"
        value={<AnimatedCounter value={stats?.pendingWithdrawals ?? 0} />}
        sub="aguardando aprovação"
        color={(stats?.pendingWithdrawals ?? 0) > 0 ? "text-yellow-400" : "text-foreground"}
      />
    </div>
  );
}

/* ── Ecosystem breakdown ── */
function EcosystemBreakdown({ stats }: { stats: any }) {
  const total = (stats?.freelancerCount ?? 0) + (stats?.companyCount ?? 0);
  const freelancerPct = total > 0 ? ((stats?.freelancerCount ?? 0) / total) * 100 : 50;

  const jobs = stats?.jobsByStatus;
  const jobItems = [
    { label: "Abertas", value: jobs?.open ?? 0, color: "bg-primary" },
    { label: "Em Andamento", value: jobs?.in_progress ?? 0, color: "bg-blue-400" },
    { label: "Concluídas", value: jobs?.completed ?? 0, color: "bg-green-400" },
    { label: "Canceladas", value: jobs?.cancelled ?? 0, color: "bg-destructive" },
  ];
  const totalJobs = jobItems.reduce((s, i) => s + i.value, 0) || 1;

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {/* Composição de usuários */}
      <div className="rounded-2xl border border-white/6 p-5" style={{ background: "rgba(255,255,255,0.055)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Composição de Usuários</h2>
          <Users size={15} className="text-muted-foreground opacity-50" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-primary font-semibold">Freelancers</span>
              <span className="text-muted-foreground font-bold">{stats?.freelancerCount ?? 0}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${freelancerPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-secondary font-semibold">Empresas</span>
              <span className="text-muted-foreground font-bold">{stats?.companyCount ?? 0}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${100 - freelancerPct}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Verificados: <span className="font-bold text-green-400">{stats?.verifiedCount ?? 0}</span></span>
          <span className="text-muted-foreground">Banidos: <span className="font-bold text-destructive">{stats?.bannedCount ?? 0}</span></span>
        </div>
      </div>

      {/* Status dos extras */}
      <div className="rounded-2xl border border-white/6 p-5" style={{ background: "rgba(255,255,255,0.055)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Status dos Extras</h2>
          <Briefcase size={15} className="text-muted-foreground opacity-50" />
        </div>
        <div className="h-2 rounded-full overflow-hidden flex mb-4">
          {jobItems.map((item, i) => (
            <div key={i} className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${(item.value / totalJobs) * 100}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {jobItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
              <span className="text-muted-foreground flex-1">{item.label}</span>
              <span className="font-bold tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Top freelancers ── */
function TopFreelancers({ users }: { users: any[] }) {
  if (!users || users.length === 0) return null;
  return (
    <div className="rounded-2xl border border-white/6 p-5" style={{ background: "rgba(255,255,255,0.055)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Top Freelancers</h2>
        <UserCheck size={15} className="text-muted-foreground opacity-50" />
      </div>
      <div className="space-y-3">
        {users.slice(0, 5).map((u, i) => (
          <div key={u.id} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-5 text-right font-bold tabular-nums">#{i + 1}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
              {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.completedJobs ?? 0} extras · ⭐ {(u.reputationScore ?? 0).toFixed(1)}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/8 border border-primary/18 text-primary capitalize">{u.level ?? "bronze"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Operations navigation ── */
function OperationsNav({ stats }: { stats: any }) {
  const links = [
    { href: "/admin/users",           icon: <Users size={16} />,        label: "Usuários",                sub: `${stats?.pendingVerifications ?? 0} verificações pendentes`,    color: "text-primary",    border: "hover:border-primary/25" },
    { href: "/admin/jobs",            icon: <Briefcase size={16} />,    label: "Extras",                  sub: `${stats?.totalJobs ?? 0} extras publicados`,                   color: "text-secondary",  border: "hover:border-secondary/25" },
    { href: "/admin/withdrawals",     icon: <DollarSign size={16} />,   label: "Saques & Depósitos",      sub: `${stats?.pendingWithdrawals ?? 0} saques aguardando`,          color: "text-yellow-400", border: "hover:border-yellow-400/25" },
    { href: "/admin/analytics",       icon: <TrendingUp size={16} />,   label: "Analytics",               sub: "Métricas do ecossistema",                                      color: "text-green-400",  border: "hover:border-green-400/25" },
    { href: "/admin/map",             icon: <MapPin size={16} />,       label: "Mapa Nacional",           sub: "Distribuição geográfica",                                      color: "text-cyan-400",   border: "hover:border-cyan-400/25" },
    { href: "/admin/representatives", icon: <Globe size={16} />,        label: "Representantes",          sub: "Rede de 27 estados",                                           color: "text-purple-400", border: "hover:border-purple-400/25" },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">Módulos de Operação</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {links.map((link, i) => (
          <Link key={link.href} href={link.href}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -1 }}
              className={`rounded-xl p-4 flex items-center gap-3 border border-white/6 ${link.border} transition-all cursor-pointer group`}
              style={{ background: "rgba(255,255,255,0.060)" }}
            >
              <div className={`w-9 h-9 rounded-xl border border-white/8 flex items-center justify-center flex-shrink-0 ${link.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                {link.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${link.color} truncate`}>{link.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{link.sub}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: ["admin-stats"], refetchInterval: 15000, refetchIntervalInBackground: false },
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-primary opacity-70" />
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">extraGO Admin</span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight">Centro Nacional de Operações</h1>
          <p className="text-sm text-muted-foreground mt-1">Infraestrutura de Mão de Obra do Brasil</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-400/20 bg-green-400/5 flex-shrink-0">
          <Activity size={11} className="text-green-400" />
          <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Sistema Ativo</span>
        </div>
      </div>

      {/* 1st — Live operations strip (most important, hero position) */}
      <LiveOperationsStrip />

      {/* 2nd — Main KPIs as typography, not colored cards */}
      <div className="rounded-2xl border border-white/6 p-5 space-y-2" style={{ background: "rgba(255,255,255,0.055)" }}>
        <h2 className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4">Indicadores Gerais</h2>
        <MainKPIs stats={stats} isLoading={isLoading} />
      </div>

      {/* 3rd — Revenue + Ecosystem */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-white/6 p-5" style={{ background: "rgba(255,255,255,0.055)" }}>
          {!isLoading && stats?.revenueByMonth ? (
            <RevenueChart data={stats.revenueByMonth} />
          ) : (
            <div className="h-32 animate-pulse rounded-xl bg-white/4" />
          )}
        </div>
        <div className="space-y-5">
          <EcosystemBreakdown stats={stats} />
        </div>
      </div>

      {/* 4th — Top freelancers + Activity */}
      <div className="grid lg:grid-cols-2 gap-5">
        {stats?.topFreelancers && <TopFreelancers users={stats.topFreelancers} />}
        <LiveActivityFeed />
      </div>

      {/* 5th — Operations navigation */}
      <OperationsNav stats={stats} />
    </div>
  );
}
