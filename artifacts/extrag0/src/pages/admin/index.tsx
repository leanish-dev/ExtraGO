import React from "react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Users, Briefcase, DollarSign, TrendingUp, Shield, Activity, CheckCircle, AlertCircle, UserCheck, Ban } from "lucide-react";
import { Link } from "wouter";
import { AnimatedCounter } from "@/components/animated-counter";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { useLivePlatformStats } from "@/hooks/use-live-platform-stats";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

function StatCard({ icon, label, value, sub, color = "primary", isLoading }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "primary" | "secondary" | "yellow" | "green" | "red";
  isLoading?: boolean;
}) {
  const colors = {
    primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/20 text-secondary",
    yellow: "from-yellow-400/20 to-yellow-400/5 border-yellow-400/20 text-yellow-400",
    green: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-400",
    red: "from-destructive/20 to-destructive/5 border-destructive/20 text-destructive",
  };

  if (isLoading) return <SkeletonStatCard />;

  const numVal = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${colors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">
            {typeof value === "string" && value.startsWith("R$") ? (
              <>R$ <AnimatedCounter value={numVal} decimals={0} /></>
            ) : (
              <AnimatedCounter value={numVal} />
            )}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </motion.div>
  );
}

function QuickLink({ href, icon, label, sub, color }: { href: string; icon: React.ReactNode; label: string; sub: string; color: string }) {
  return (
    <Link href={href}>
      <div className="glass-card rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer flex items-center gap-4 group">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
        <span className="text-muted-foreground group-hover:text-foreground transition-colors">→</span>
      </div>
    </Link>
  );
}

function RevenueChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.amount), 1);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">Receita por Mês</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
        </div>
        <TrendingUp size={18} className="text-primary opacity-60" />
      </div>
      <div className="flex items-end gap-2 h-28">
        {data.map((d, i) => {
          const pct = max > 0 ? (d.amount / max) * 100 : 0;
          const month = d.month ? months[parseInt(d.month.slice(5, 7)) - 1] : `M${i + 1}`;
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                R${(d.amount / 100).toFixed(0)}
              </span>
              <div className="w-full rounded-t-md relative overflow-hidden" style={{ height: `${Math.max(pct, 4)}%` }}>
                <div className={`absolute inset-0 ${isLast ? "bg-primary" : "bg-primary/40"} transition-all`} />
              </div>
              <span className="text-[10px] text-muted-foreground">{month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserCompositionCard({ stats }: { stats: any }) {
  const total = (stats?.freelancerCount ?? 0) + (stats?.companyCount ?? 0);
  const freelancerPct = total > 0 ? ((stats?.freelancerCount ?? 0) / total) * 100 : 50;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Composição de Usuários</h2>
        <Users size={18} className="text-muted-foreground opacity-60" />
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-primary font-medium">Freelancers</span>
            <span className="text-muted-foreground">{stats?.freelancerCount ?? 0}</span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${freelancerPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-secondary font-medium">Empresas</span>
            <span className="text-muted-foreground">{stats?.companyCount ?? 0}</span>
          </div>
          <div className="h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-secondary transition-all duration-700" style={{ width: `${100 - freelancerPct}%` }} />
          </div>
        </div>
        <div className="pt-2 border-t border-white/8 grid grid-cols-2 gap-3 text-xs">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-muted-foreground mb-0.5">Verificados</p>
            <p className="text-xl font-bold text-green-400">{stats?.verifiedCount ?? 0}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-muted-foreground mb-0.5">Banidos</p>
            <p className="text-xl font-bold text-destructive">{stats?.bannedCount ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobStatusCard({ stats }: { stats: any }) {
  const jobs = stats?.jobsByStatus;
  const items = [
    { label: "Abertas", value: jobs?.open ?? 0, color: "bg-primary" },
    { label: "Em Andamento", value: jobs?.in_progress ?? 0, color: "bg-blue-400" },
    { label: "Concluídas", value: jobs?.completed ?? 0, color: "bg-green-400" },
    { label: "Canceladas", value: jobs?.cancelled ?? 0, color: "bg-destructive" },
  ];
  const total = items.reduce((s, i) => s + i.value, 0) || 1;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Status das Vagas</h2>
        <Briefcase size={18} className="text-muted-foreground opacity-60" />
      </div>
      <div className="h-2 rounded-full overflow-hidden flex mb-4">
        {items.map((item, i) => (
          <div key={i} className={`h-full ${item.color} transition-all duration-700`} style={{ width: `${(item.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
            <span className="text-muted-foreground flex-1">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopFreelancers({ users }: { users: any[] }) {
  if (!users || users.length === 0) return null;
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Top Freelancers</h2>
        <UserCheck size={18} className="text-muted-foreground opacity-60" />
      </div>
      <div className="space-y-2.5">
        {users.slice(0, 5).map((u, i) => (
          <div key={u.id} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-5 text-right font-bold">#{i + 1}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
              ) : (
                u.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.completedJobs ?? 0} jobs · ⭐ {(u.reputationScore ?? 0).toFixed(1)}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary capitalize">{u.level ?? "bronze"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LivePlatformStats() {
  const { data: stats, isLoading } = useLivePlatformStats();

  const liveItems = [
    { label: "Usuários Ativos (24h)", value: stats?.activeUsers24h ?? 0, color: "text-primary" },
    { label: "Vagas Hoje", value: stats?.jobsToday ?? 0, color: "text-secondary" },
    { label: "Em Andamento", value: stats?.jobsInProgress ?? 0, color: "text-green-400" },
    { label: "Total de Extras", value: stats?.totalFreelancers ?? 0, color: "text-yellow-400" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Plataforma ao Vivo</h2>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-semibold">Live</span>
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {liveItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="glass-card rounded-xl p-4"
          >
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-20 skeleton rounded" />
                <div className="h-8 w-16 skeleton rounded" />
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground font-medium mb-1">{item.label}</p>
                <p className={`text-3xl font-bold ${item.color}`}>
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

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: {
      queryKey: ["admin-stats"],
      refetchInterval: 15000,
      refetchIntervalInBackground: false,
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">extraGO — Controle Total da Plataforma</p>
        </div>
      </div>

      <LivePlatformStats />

      {/* Main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Usuários" value={stats?.totalUsers ?? 0} sub={`+${stats?.usersThisMonth ?? 0} este mês`} color="primary" isLoading={isLoading} />
        <StatCard icon={<Briefcase size={22} />} label="Total Vagas" value={stats?.totalJobs ?? 0} sub={`${stats?.jobsByStatus?.open ?? 0} abertas`} color="secondary" isLoading={isLoading} />
        <StatCard icon={<DollarSign size={22} />} label="Receita Total" value={`R$ ${((stats?.totalRevenue ?? 0) / 100).toFixed(0)}`} sub="em transações" color="yellow" isLoading={isLoading} />
        <StatCard icon={<AlertCircle size={22} />} label="Saques Pendentes" value={stats?.pendingWithdrawals ?? 0} sub="aguardando aprovação" color="red" isLoading={isLoading} />
      </div>

      {/* Charts + composition */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {!isLoading && stats?.revenueByMonth && <RevenueChart data={stats.revenueByMonth} />}
          {isLoading && <div className="glass-card rounded-2xl h-48 animate-pulse" />}
        </div>
        <UserCompositionCard stats={stats} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <JobStatusCard stats={stats} />
        <div className="lg:col-span-2">
          {stats?.topFreelancers && <TopFreelancers users={stats.topFreelancers} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickLink href="/admin/users" icon={<Users size={18} className="text-primary" />} label="Gerenciar Usuários" sub={`${stats?.pendingVerifications ?? 0} verificações pendentes`} color="bg-primary/10 border border-primary/20" />
            <QuickLink href="/admin/jobs" icon={<Briefcase size={18} className="text-secondary" />} label="Gerenciar Vagas" sub={`${stats?.jobsByStatus?.open ?? 0} vagas abertas`} color="bg-secondary/10 border border-secondary/20" />
            <QuickLink href="/admin/withdrawals" icon={<DollarSign size={18} className="text-yellow-400" />} label="Aprovar Saques" sub={`${stats?.pendingWithdrawals ?? 0} saques aguardando`} color="bg-yellow-400/10 border border-yellow-400/20" />
            <QuickLink href="/admin/users" icon={<Shield size={18} className="text-green-400" />} label="Verificar Profissionais" sub="Validar documentação de extras" color="bg-green-400/10 border border-green-400/20" />
          </div>
        </div>

        <LiveActivityFeed />
      </div>
    </div>
  );
}
