import React from "react";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Users, Briefcase, DollarSign, TrendingUp, Shield, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

function StatCard({ icon, label, value, sub, color = "primary" }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "primary" | "secondary" | "yellow" | "green" | "red";
}) {
  const colors = {
    primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/20 text-secondary",
    yellow: "from-yellow-400/20 to-yellow-400/5 border-yellow-400/20 text-yellow-400",
    green: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-400",
    red: "from-destructive/20 to-destructive/5 border-destructive/20 text-destructive",
  };
  return (
    <div className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
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

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Usuários" value={stats?.totalUsers ?? 0} color="primary" />
        <StatCard icon={<Briefcase size={22} />} label="Total Vagas" value={stats?.totalJobs ?? 0} color="secondary" />
        <StatCard icon={<CheckCircle size={22} />} label="Verificações Pendentes" value={stats?.pendingVerifications ?? 0} color="green" />
        <StatCard icon={<DollarSign size={22} />} label="Receita Total" value={`R$ ${((stats?.totalRevenue ?? 0) / 100).toFixed(0)}`} color="yellow" sub="em transações" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Novos este mês" value={stats?.usersThisMonth ?? 0} color="secondary" />
        <StatCard icon={<Activity size={22} />} label="Top Freelancers" value={stats?.topFreelancers?.length ?? 0} color="primary" />
        <StatCard icon={<AlertCircle size={22} />} label="Saques Pendentes" value={stats?.pendingWithdrawals ?? 0} color="red" />
        <StatCard icon={<TrendingUp size={22} />} label="Jobs no Mês" value={stats?.revenueByMonth?.[0]?.amount ? `R$ ${(stats.revenueByMonth[0].amount / 100).toFixed(0)}` : "R$ 0"} color="green" sub="receita mensal" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Acesso Rápido</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <QuickLink href="/admin/users" icon={<Users size={18} className="text-primary" />} label="Gerenciar Usuários" sub="Verificar, banir e visualizar usuários" color="bg-primary/10 border border-primary/20" />
          <QuickLink href="/admin/jobs" icon={<Briefcase size={18} className="text-secondary" />} label="Gerenciar Vagas" sub="Visualizar e moderar vagas" color="bg-secondary/10 border border-secondary/20" />
          <QuickLink href="/admin/withdrawals" icon={<DollarSign size={18} className="text-yellow-400" />} label="Aprovar Saques" sub={`${stats?.pendingWithdrawals ?? 0} saques aguardando`} color="bg-yellow-400/10 border border-yellow-400/20" />
          <QuickLink href="/admin/users" icon={<Shield size={18} className="text-green-400" />} label="Verificar Profissionais" sub="Validar documentação de extras" color="bg-green-400/10 border border-green-400/20" />
        </div>
      </div>
    </div>
  );
}
