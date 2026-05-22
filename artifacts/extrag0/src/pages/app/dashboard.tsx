import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetCompanyStats, useGetFreelancerStats, useListJobs, useListApplications, useListTransactions } from "@workspace/api-client-react";
import type { Application, Transaction } from "@workspace/api-client-react";
import { Briefcase, DollarSign, Star, TrendingUp, Clock, CheckCircle, Users, FileText, ArrowRight, Wallet } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonStatCard, SkeletonListRow } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) { setCount(target); return; }
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

type StatColor = "primary" | "secondary" | "yellow" | "green";

const STAT_COLOR_MAP: Record<StatColor, { container: string; icon: string; glow: string }> = {
  primary: { container: "from-primary/15 to-primary/3 border-primary/20", icon: "bg-primary/15 border-primary/25 text-primary", glow: "shadow-[0_0_20px_rgba(124,252,0,0.08)]" },
  secondary: { container: "from-secondary/15 to-secondary/3 border-secondary/20", icon: "bg-secondary/15 border-secondary/25 text-secondary", glow: "shadow-[0_0_20px_rgba(0,229,255,0.08)]" },
  yellow: { container: "from-yellow-400/15 to-yellow-400/3 border-yellow-400/20", icon: "bg-yellow-400/15 border-yellow-400/25 text-yellow-400", glow: "" },
  green: { container: "from-green-500/15 to-green-500/3 border-green-500/20", icon: "bg-green-500/15 border-green-500/25 text-green-500", glow: "" },
};

function StatCard({ icon, label, value, sub, trend, color = "primary", isLoading }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  color?: StatColor;
  isLoading?: boolean;
}) {
  const numValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const counted = useCountUp(numValue);
  const displayValue = typeof value === "string"
    ? value.replace(/\d+(\.\d+)?/, counted.toFixed(String(value).includes(".") ? 2 : 0))
    : counted;

  const c = STAT_COLOR_MAP[color];

  if (isLoading) return <SkeletonStatCard />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className={`glass-card card-hover rounded-2xl p-5 bg-gradient-to-br ${c.container} ${c.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">{displayValue}</p>
          {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
          {trend && <p className="text-xs text-green-400 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

const APP_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-yellow-400" },
  approved: { label: "Aprovada", color: "text-primary" },
  rejected: { label: "Recusada", color: "text-destructive" },
};

function ActivityFeedItem({ type, title, sub, time, icon, iconBg }: {
  type: string;
  title: string;
  sub?: string;
  time?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {time && <p className="text-[10px] text-muted-foreground flex-shrink-0">{time}</p>}
    </div>
  );
}

function ActivityFeed({ role, isLoading }: { role: string; isLoading?: boolean }) {
  const { data: apps = [], isLoading: appsLoading } = useListApplications({ status: undefined });
  const { data: txs = [], isLoading: txsLoading } = useListTransactions();

  const loading = isLoading || appsLoading || txsLoading;

  type FeedItem = { ts: number; node: React.ReactNode };

  const items: FeedItem[] = [];

  apps.slice(0, 5).forEach((app: Application) => {
    const statusInfo = APP_STATUS_LABELS[app.status ?? "pending"] ?? APP_STATUS_LABELS.pending;
    const ts = app.appliedAt ? new Date(app.appliedAt).getTime() : 0;
    const timeStr = app.appliedAt
      ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true, locale: ptBR })
      : "";
    items.push({
      ts,
      node: (
        <ActivityFeedItem
          key={`app-${app.id}`}
          type="application"
          title={role === "company"
            ? `${app.freelancer?.name ?? "Profissional"} se candidatou`
            : `Candidatura ${statusInfo.label.toLowerCase()}`
          }
          sub={app.job?.title ?? "Vaga"}
          time={timeStr}
          icon={<FileText size={13} />}
          iconBg="bg-yellow-400/10 text-yellow-400"
        />
      ),
    });
  });

  txs.slice(0, 5).forEach((tx: Transaction) => {
    const ts = tx.createdAt ? new Date(tx.createdAt).getTime() : 0;
    const isCredit = tx.type === "credit";
    const timeStr = tx.createdAt
      ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ptBR })
      : "";
    items.push({
      ts,
      node: (
        <ActivityFeedItem
          key={`tx-${tx.id}`}
          type="transaction"
          title={tx.description}
          sub={`${isCredit ? "+" : "-"}R$ ${((tx.amount ?? 0) / 100).toFixed(2)}`}
          time={timeStr}
          icon={<DollarSign size={13} />}
          iconBg={isCredit ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}
        />
      ),
    });
  });

  items.sort((a, b) => b.ts - a.ts);
  const topItems = items.slice(0, 6);

  return (
    <div className="glass-card rounded-2xl p-5">
      <h2 className="font-semibold text-sm mb-4">Atividade Recente</h2>
      {loading ? (
        <div className="space-y-1">
          {[1,2,3].map(i => <SkeletonListRow key={i} />)}
        </div>
      ) : topItems.length === 0 ? (
        <EmptyState
          icon={<Clock size={22} />}
          title="Nenhuma atividade ainda"
          description="Suas candidaturas e transações aparecerão aqui."
          className="py-8"
        />
      ) : (
        <div>
          {topItems.map((item, i) => (
            <React.Fragment key={i}>{item.node}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  open: { label: "Aberta", class: "bg-primary/20 text-primary border-primary/30" },
  in_progress: { label: "Em andamento", class: "bg-secondary/20 text-secondary border-secondary/30" },
  completed: { label: "Concluída", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelada", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

const QUICK_ACTION_STYLES = {
  secondary: "bg-secondary/10 border-secondary/20 text-secondary hover:border-secondary/35",
  green: "bg-green-500/10 border-green-500/20 text-green-400 hover:border-green-500/35",
};

function CompanyDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetCompanyStats(user?.id ?? 0, { query: { queryKey: ["company-stats", user?.id], enabled: !!user?.id } });
  const { data: jobs, isLoading: jobsLoading } = useListJobs({ status: "open" });
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-7 pb-20 lg:pb-6">
      <PageHeader
        title={`Olá, ${user?.name?.split(" ")[0]}! 👋`}
        subtitle="Acompanhe suas vagas e contratações."
        action={
          <Link href="/app/jobs/new">
            <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl text-sm px-4 h-9">
              + Nova Vaga
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <StatCard icon={<Briefcase size={18} />} label="Vagas Abertas" value={stats?.activeJobs ?? 0} color="primary" isLoading={statsLoading} />
        <StatCard icon={<Users size={18} />} label="Profissionais" value={stats?.totalWorkers ?? 0} color="secondary" isLoading={statsLoading} />
        <StatCard icon={<CheckCircle size={18} />} label="Jobs Publicados" value={stats?.totalJobsPosted ?? 0} color="green" isLoading={statsLoading} />
        <StatCard icon={<DollarSign size={18} />} label="Gasto Total" value={`R$ ${((stats?.totalSpent ?? 0) / 100).toFixed(2)}`} sub="histórico" color="yellow" isLoading={statsLoading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Vagas Recentes</h2>
            <Link href="/app/jobs">
              <button className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                Ver todas <ArrowRight size={13} />
              </button>
            </Link>
          </div>
          {jobsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="glass-card rounded-xl h-16 skeleton" />)}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="glass-card rounded-2xl">
              <EmptyState
                icon={<Briefcase size={28} />}
                title="Nenhuma vaga ativa"
                description="Publique sua primeira vaga e encontre os melhores profissionais."
                actionLabel="Publicar primeira vaga"
                actionHref="/app/jobs/new"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job, i) => {
                const s = STATUS_BADGE[job.status ?? "open"] ?? STATUS_BADGE.open;
                return (
                  <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.06 }}>
                    <Link href={`/app/jobs/${job.id}`}>
                      <div className="glass-card card-hover rounded-xl p-4 cursor-pointer flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.location} · {job.date ? format(new Date(job.date), "dd MMM", { locale: ptBR }) : ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.class}`}>{s.label}</span>
                          <span className="text-[10px] text-muted-foreground">{job.workersApproved}/{job.workersNeeded}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ActivityFeed role="company" />

          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/app/applications", icon: <Users size={16} />, label: "Ver candidaturas", sub: "Aprovar ou recusar profissionais", style: QUICK_ACTION_STYLES.secondary },
              { href: "/app/wallet", icon: <DollarSign size={16} />, label: "Carteira", sub: "Pagamentos e histórico", style: QUICK_ACTION_STYLES.green },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className={`glass-card card-hover rounded-xl p-4 cursor-pointer flex flex-col gap-3 group border transition-all h-full ${action.style}`}>
                  <div className="w-9 h-9 rounded-lg border flex items-center justify-center opacity-70 border-white/10">
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.sub}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FreelancerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetFreelancerStats(user?.id ?? 0, { query: { queryKey: ["freelancer-stats", user?.id], enabled: !!user?.id } });
  const { data: myApps, isLoading: appsLoading } = useListApplications({ status: "pending" });
  const pendingApps = myApps?.slice(0, 4) ?? [];

  const levelMap: Record<string, { next: string; threshold: number }> = {
    bronze: { next: "Prata", threshold: 5 },
    silver: { next: "Ouro", threshold: 15 },
    gold: { next: "Elite", threshold: 30 },
    elite: { next: "Elite", threshold: 100 },
  };
  const currentLevel = user?.level ?? "bronze";
  const levelInfo = levelMap[currentLevel] ?? levelMap.bronze;
  const progress = Math.min(100, ((user?.completedJobs ?? 0) / levelInfo.threshold) * 100);

  const quickActions = [
    { href: "/app/jobs", icon: <Briefcase size={16} />, label: "Buscar Vagas", sub: "Ver oportunidades disponíveis", iconBg: "bg-primary/10 border-primary/20 text-primary", hoverBorder: "hover:border-primary/35" },
    { href: "/app/wallet", icon: <Wallet size={16} />, label: "Carteira", sub: "Saldo e saques via PIX", iconBg: "bg-secondary/10 border-secondary/20 text-secondary", hoverBorder: "hover:border-secondary/35" },
    { href: "/app/referrals", icon: <Star size={16} />, label: "Indicações", sub: "Ganhe bônus indicando amigos", iconBg: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400", hoverBorder: "hover:border-yellow-400/35" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-7 pb-20 lg:pb-6">
      <PageHeader
        title={`Bem-vindo, ${user?.name?.split(" ")[0]}! 👋`}
        subtitle="Aqui está seu desempenho na plataforma."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <StatCard icon={<CheckCircle size={18} />} label="Jobs Feitos" value={user?.completedJobs ?? 0} color="primary" isLoading={statsLoading} />
        <StatCard icon={<Star size={18} />} label="Reputação" value={`${(user?.reputationScore ?? 0).toFixed(1)} ★`} color="yellow" isLoading={statsLoading} />
        <StatCard icon={<DollarSign size={18} />} label="Ganhos Totais" value={`R$ ${((stats?.totalEarned ?? 0) / 100).toFixed(2)}`} color="green" isLoading={statsLoading} />
        <StatCard icon={<TrendingUp size={18} />} label="Jobs Concluídos" value={stats?.completedJobs ?? 0} color="secondary" isLoading={statsLoading} />
      </div>

      {/* Level progress card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-card rounded-2xl p-5 border border-primary/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Progresso de Nível</p>
            <p className="font-bold text-base">
              Nível: <span className="neon-text-gradient">{currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}</span>
              <span className="text-muted-foreground font-normal text-sm ml-2">→ {levelInfo.next}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.completedJobs ?? 0} / {levelInfo.threshold} jobs para {levelInfo.next}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold neon-text-gradient leading-none">{Math.round(progress)}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">completo</p>
          </div>
        </div>
        <Progress value={progress} glow className="h-2.5" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Candidaturas Pendentes</h2>
              <Link href="/app/applications">
                <button className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                  Ver todas <ArrowRight size={13} />
                </button>
              </Link>
            </div>
            {appsLoading ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="glass-card rounded-xl h-16 skeleton" />)}
              </div>
            ) : pendingApps.length === 0 ? (
              <div className="glass-card rounded-xl">
                <EmptyState
                  icon={<FileText size={24} />}
                  title="Sem candidaturas pendentes"
                  description="Candidate-se a vagas e acompanhe aqui."
                  actionLabel="Buscar Vagas"
                  actionHref="/app/jobs"
                  className="py-10"
                />
              </div>
            ) : (
              <div className="space-y-2">
                {pendingApps.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                      <Clock size={15} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{app.job?.title ?? "Vaga"}</p>
                      <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-yellow-500/15 text-yellow-400 border-yellow-500/25 flex-shrink-0">Pendente</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <div className={`glass-card card-hover rounded-xl p-4 cursor-pointer flex items-center gap-3 group border border-white/5 ${action.hoverBorder} transition-all`}>
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.sub}</p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <ActivityFeed role="freelancer" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "company" ? <CompanyDashboard /> : <FreelancerDashboard />;
}
