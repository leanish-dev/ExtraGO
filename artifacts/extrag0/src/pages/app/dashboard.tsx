import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetCompanyStats, useGetFreelancerStats, useListJobs, useListApplications } from "@workspace/api-client-react";
import { Briefcase, DollarSign, Star, TrendingUp, Clock, CheckCircle, Users, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatCard({ icon, label, value, sub, color = "primary" }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "primary" | "secondary" | "yellow" | "green";
}) {
  const colors = {
    primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/20 text-secondary",
    yellow: "from-yellow-400/20 to-yellow-400/5 border-yellow-400/20 text-yellow-400",
    green: "from-green-500/20 to-green-500/5 border-green-500/20 text-green-500",
  };
  return (
    <div className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-xl bg-current/10`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function JobStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    open: { label: "Aberta", class: "bg-primary/20 text-primary border-primary/30" },
    in_progress: { label: "Em andamento", class: "bg-secondary/20 text-secondary border-secondary/30" },
    completed: { label: "Concluída", class: "bg-green-500/20 text-green-400 border-green-500/30" },
    cancelled: { label: "Cancelada", class: "bg-destructive/20 text-destructive border-destructive/30" },
  };
  const info = map[status] ?? map.open;
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${info.class}`}>{info.label}</span>;
}

function CompanyDashboard() {
  const { user } = useAuth();
  const { data: stats } = useGetCompanyStats(user?.id ?? 0, { query: { queryKey: ["company-stats", user?.id], enabled: !!user?.id } });
  const { data: jobs } = useListJobs({ status: "open" });
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Empresa</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas vagas e contratações.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Briefcase size={20} />} label="Vagas Abertas" value={stats?.activeJobs ?? 0} color="primary" />
        <StatCard icon={<Users size={20} />} label="Candidaturas" value={stats?.totalApplications ?? 0} color="secondary" />
        <StatCard icon={<CheckCircle size={20} />} label="Jobs Concluídos" value={stats?.completedJobs ?? 0} color="green" />
        <StatCard icon={<DollarSign size={20} />} label="Gasto Total" value={`R$ ${((stats?.totalSpent ?? 0) / 100).toFixed(2)}`} color="yellow" sub="histórico" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Vagas Recentes</h2>
          <Link href="/app/jobs">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">Ver todas →</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {recentJobs.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Briefcase size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma vaga ativa.</p>
              <Link href="/app/jobs/new">
                <Button className="mt-4 bg-primary text-black hover:bg-primary/90 neon-glow">Publicar primeira vaga</Button>
              </Link>
            </div>
          )}
          {recentJobs.map((job) => (
            <Link key={job.id} href={`/app/jobs/${job.id}`}>
              <div className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.location} · {job.date ? format(new Date(job.date), "dd 'de' MMM", { locale: ptBR }) : ""}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <JobStatusBadge status={job.status ?? "open"} />
                  <span className="text-xs text-muted-foreground">{job.workersApproved}/{job.workersNeeded} contratados</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FreelancerDashboard() {
  const { user } = useAuth();
  const { data: stats } = useGetFreelancerStats(user?.id ?? 0, { query: { queryKey: ["freelancer-stats", user?.id], enabled: !!user?.id } });
  const { data: myApps } = useListApplications({ status: "pending" });
  const pendingApps = myApps?.slice(0, 4) ?? [];

  const levelMap: Record<string, { next: string; threshold: number }> = {
    bronze: { next: "Prata", threshold: 5 },
    silver: { next: "Ouro", threshold: 15 },
    gold: { next: "Elite", threshold: 30 },
    elite: { next: "Elite", threshold: 100 },
  };
  const currentLevel = user?.level ?? "bronze";
  const levelInfo = levelMap[currentLevel];
  const progress = Math.min(100, ((user?.completedJobs ?? 0) / levelInfo.threshold) * 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bem-vindo, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-muted-foreground mt-1">Aqui está seu desempenho na plataforma.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle size={20} />} label="Jobs Feitos" value={user?.completedJobs ?? 0} color="primary" />
        <StatCard icon={<Star size={20} />} label="Reputação" value={`${(user?.reputationScore ?? 0).toFixed(1)} ★`} color="yellow" />
        <StatCard icon={<DollarSign size={20} />} label="Ganhos Totais" value={`R$ ${((stats?.totalEarned ?? 0) / 100).toFixed(2)}`} color="green" />
        <StatCard icon={<TrendingUp size={20} />} label="Candidaturas" value={stats?.totalApplications ?? 0} color="secondary" />
      </div>

      {/* Level progress */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold">Nível: <span className="neon-text-gradient">{currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}</span></p>
            <p className="text-sm text-muted-foreground">
              {user?.completedJobs ?? 0} / {levelInfo.threshold} jobs para {levelInfo.next}
            </p>
          </div>
          <span className="text-2xl font-bold neon-text-gradient">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Candidaturas Pendentes</h2>
            <Link href="/app/applications">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">Ver todas →</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {pendingApps.length === 0 && (
              <div className="glass-card rounded-xl p-6 text-center">
                <FileText size={28} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sem candidaturas pendentes.</p>
                <Link href="/app/jobs">
                  <Button size="sm" className="mt-3 bg-primary text-black hover:bg-primary/90">Buscar Vagas</Button>
                </Link>
              </div>
            )}
            {pendingApps.map((app) => (
              <div key={app.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{(app as any).jobTitle ?? "Vaga"}</p>
                  <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Pendente</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ações Rápidas</h2>
          </div>
          <div className="space-y-3">
            <Link href="/app/jobs">
              <div className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Briefcase size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Buscar novas vagas</p>
                  <p className="text-xs text-muted-foreground">Ver oportunidades disponíveis</p>
                </div>
                <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
              </div>
            </Link>
            <Link href="/app/wallet">
              <div className="glass-card rounded-xl p-4 hover:border-secondary/30 transition-all cursor-pointer flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                  <DollarSign size={16} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Carteira extraGO</p>
                  <p className="text-xs text-muted-foreground">Saldo e saques</p>
                </div>
                <span className="text-muted-foreground group-hover:text-secondary transition-colors">→</span>
              </div>
            </Link>
            <Link href="/app/referrals">
              <div className="glass-card rounded-xl p-4 hover:border-yellow-400/30 transition-all cursor-pointer flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <Star size={16} className="text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Programa de indicações</p>
                  <p className="text-xs text-muted-foreground">Ganhe bônus indicando amigos</p>
                </div>
                <span className="text-muted-foreground group-hover:text-yellow-400 transition-colors">→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "company" ? <CompanyDashboard /> : <FreelancerDashboard />;
}
