import React from "react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Users, Briefcase, DollarSign, TrendingUp, Shield, Activity, CheckCircle, AlertCircle } from "lucide-react";
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
      refetchInterval: 10000,
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Usuários" value={stats?.totalUsers ?? 0} color="primary" isLoading={isLoading} />
        <StatCard icon={<Briefcase size={22} />} label="Total Vagas" value={stats?.totalJobs ?? 0} color="secondary" isLoading={isLoading} />
        <StatCard icon={<CheckCircle size={22} />} label="Verificações Pendentes" value={stats?.pendingVerifications ?? 0} color="green" isLoading={isLoading} />
        <StatCard icon={<DollarSign size={22} />} label="Receita Total" value={`R$ ${((stats?.totalRevenue ?? 0) / 100).toFixed(0)}`} color="yellow" sub="em transações" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Novos este mês" value={stats?.usersThisMonth ?? 0} color="secondary" isLoading={isLoading} />
        <StatCard icon={<Activity size={22} />} label="Top Freelancers" value={stats?.topFreelancers?.length ?? 0} color="primary" isLoading={isLoading} />
        <StatCard icon={<AlertCircle size={22} />} label="Saques Pendentes" value={stats?.pendingWithdrawals ?? 0} color="red" isLoading={isLoading} />
        <StatCard icon={<TrendingUp size={22} />} label="Receita Mensal" value={`R$ ${((stats?.revenueByMonth?.[0]?.amount ?? 0) / 100).toFixed(0)}`} color="green" sub="mês atual" isLoading={isLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickLink href="/admin/users" icon={<Users size={18} className="text-primary" />} label="Gerenciar Usuários" sub="Verificar, banir e visualizar usuários" color="bg-primary/10 border border-primary/20" />
            <QuickLink href="/admin/jobs" icon={<Briefcase size={18} className="text-secondary" />} label="Gerenciar Vagas" sub="Visualizar e moderar vagas" color="bg-secondary/10 border border-secondary/20" />
            <QuickLink href="/admin/withdrawals" icon={<DollarSign size={18} className="text-yellow-400" />} label="Aprovar Saques" sub={`${stats?.pendingWithdrawals ?? 0} saques aguardando`} color="bg-yellow-400/10 border border-yellow-400/20" />
            <QuickLink href="/admin/users" icon={<Shield size={18} className="text-green-400" />} label="Verificar Profissionais" sub="Validar documentação de extras" color="bg-green-400/10 border border-green-400/20" />
          </div>
        </div>

        <LiveActivityFeed />
      </div>
    </div>
  );
}
