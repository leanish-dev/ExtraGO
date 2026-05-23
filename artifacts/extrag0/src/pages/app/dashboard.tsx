import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetCompanyStats, useGetFreelancerStats, useListJobs, useListApplications, useListTransactions } from "@workspace/api-client-react";
import type { Application, Transaction } from "@workspace/api-client-react";
import { Briefcase, DollarSign, Star, TrendingUp, Clock, CheckCircle, Users, FileText, ArrowRight, Wallet, Zap, Plus, Activity } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonStatCard, SkeletonListRow } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { ProfileCompletionBanner } from "@/components/profile-completion-banner";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { AnimatedCounter } from "@/components/animated-counter";
import { useLivePlatformStats } from "@/hooks/use-live-platform-stats";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

type StatColor = "primary" | "secondary" | "yellow" | "green";

const STAT_COLOR_MAP: Record<StatColor, { container: string; icon: string; valueColor: string }> = {
  primary: {
    container: "from-primary/12 to-primary/2 border-primary/15 stat-glow-green",
    icon: "bg-primary/15 border-primary/25 text-primary",
    valueColor: "text-primary",
  },
  secondary: {
    container: "from-secondary/12 to-secondary/2 border-secondary/15 stat-glow-cyan",
    icon: "bg-secondary/15 border-secondary/25 text-secondary",
    valueColor: "text-secondary",
  },
  yellow: {
    container: "from-yellow-400/12 to-yellow-400/2 border-yellow-400/15",
    icon: "bg-yellow-400/15 border-yellow-400/25 text-yellow-400",
    valueColor: "text-yellow-400",
  },
  green: {
    container: "from-green-500/12 to-green-500/2 border-green-500/15",
    icon: "bg-green-500/15 border-green-500/25 text-green-500",
    valueColor: "text-green-400",
  },
};

function StatCard({ icon, label, value, sub, trend, color = "primary", isLoading, delay = 0 }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  color?: StatColor;
  isLoading?: boolean;
  delay?: number;
}) {
  const numValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const c = STAT_COLOR_MAP[color];

  if (isLoading) return <SkeletonStatCard />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.19, 1, 0.22, 1] }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${c.container} border cursor-default transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
            {typeof value === "string" && value.startsWith("R$") ? (
              <>R$ <AnimatedCounter value={numValue} decimals={2} /></>
            ) : (
              <AnimatedCounter value={numValue} decimals={typeof value === "string" && value.includes(".") ? 1 : 0} suffix={typeof value === "string" && value.endsWith("★") ? " ★" : ""} />
            )}
          </p>
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

function ActivityFeedItem({ title, sub, time, icon, iconBg }: {
  type: string;
  title: string;
  sub?: string;
  time?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
      </div>
      {time && <p className="text-[10px] text-muted-foreground flex-shrink-0">{time}</p>}
    </motion.div>
  );
}

function ActivityFeed({ role, isLoading }: { role: string; isLoading?: boolean }) {
  const { data: apps = [], isLoading: appsLoading } = useListApplications({ status: undefined }, {
    query: { queryKey: ["apps-dashboard"], refetchInterval: 10000, refetchIntervalInBackground: false },
  });
  const { data: txs = [], isLoading: txsLoading } = useListTransactions(undefined, {
    query: { queryKey: ["txs-dashboard"], refetchInterval: 10000, refetchIntervalInBackground: false },
  });

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
    <div className="glass-card rounded-2xl p-5 border border-white/6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-semibold text-sm flex-1">Atividade Recente</h2>
        <span className="live-dot" />
      </div>
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

/* ─────────────────────────────────────────────
   GREETING HEADER
───────────────────────────────────────────── */
function GreetingHeader({ name, subtitle, badge, action }: {
  name: string;
  subtitle: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const greeting = getGreeting();
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="flex items-start justify-between gap-4 mb-6 sm:mb-8"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground font-medium mb-0.5">{greeting} 👋</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        {badge && <div className="mt-2">{badge}</div>}
      </div>
      {action && <div className="flex-shrink-0 mt-1">{action}</div>}
    </motion.div>
  );
}

function PlatformStatsBanner() {
  const { data: stats, isLoading } = useLivePlatformStats();

  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1,2,3,4].map(i => <div key={i} className="glass-card rounded-xl p-3 h-16 skeleton" />)}
    </div>
  );

  const items = [
    { label: "Usuários Ativos (24h)", value: stats?.activeUsers24h ?? 0, color: "text-primary" },
    { label: "Vagas Hoje", value: stats?.jobsToday ?? 0, color: "text-secondary" },
    { label: "Em Andamento", value: stats?.jobsInProgress ?? 0, color: "text-green-400" },
    { label: "Total de Extras", value: stats?.totalFreelancers ?? 0, color: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.07 }}
          className="glass-card rounded-xl p-3 flex items-center gap-2.5"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground truncate font-medium">{item.label}</p>
            <p className={`text-xl font-bold leading-tight mt-0.5 ${item.color}`}>
              <AnimatedCounter value={item.value} />
            </p>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPANY DASHBOARD
───────────────────────────────────────────── */
function CompanyDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetCompanyStats(user?.id ?? 0, {
    query: { queryKey: ["company-stats", user?.id], enabled: !!user?.id, refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: jobs, isLoading: jobsLoading } = useListJobs({ status: "open" });
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-7 pb-20 lg:pb-6">
      <OnboardingWizard />
      <GreetingHeader
        name={user?.name?.split(" ")[0] ?? "Empresa"}
        subtitle="Acompanhe suas vagas e contratações."
        action={
          <Link href="/app/jobs/new">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl text-sm px-4 h-10 gap-1.5">
                <Plus size={15} /> Nova Vaga
              </Button>
            </motion.div>
          </Link>
        }
      />

      <ProfileCompletionBanner />

      <PlatformStatsBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <StatCard icon={<Briefcase size={18} />} label="Vagas Abertas" value={stats?.activeJobs ?? 0} color="primary" isLoading={statsLoading} delay={0.05} />
        <StatCard icon={<Users size={18} />} label="Profissionais" value={stats?.totalWorkers ?? 0} color="secondary" isLoading={statsLoading} delay={0.1} />
        <StatCard icon={<CheckCircle size={18} />} label="Jobs Publicados" value={stats?.totalJobsPosted ?? 0} color="green" isLoading={statsLoading} delay={0.15} />
        <StatCard icon={<DollarSign size={18} />} label="Gasto Total" value={`R$ ${((stats?.totalSpent ?? 0) / 100).toFixed(2)}`} sub="histórico" color="yellow" isLoading={statsLoading} delay={0.2} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Vagas Recentes</h2>
            <Link href="/app/jobs">
              <motion.button
                whileHover={{ x: 2 }}
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
              >
                Ver todas <ArrowRight size={13} />
              </motion.button>
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
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    whileHover={{ x: 2 }}
                  >
                    <Link href={`/app/jobs/${job.id}`}>
                      <div className="glass-card rounded-xl p-4 cursor-pointer flex items-center gap-4 border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                          <Briefcase size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.location} · {job.date ? format(new Date(job.date), "dd MMM", { locale: ptBR }) : ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.class}`}>{s.label}</span>
                          <span className="text-[10px] text-muted-foreground">{job.workersApproved}/{job.workersNeeded} vagas</span>
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
              { href: "/app/applications", icon: <Users size={16} />, label: "Candidaturas", sub: "Aprovar ou recusar profissionais", color: "text-secondary", bg: "bg-secondary/8 border-secondary/15 hover:border-secondary/30" },
              { href: "/app/wallet", icon: <DollarSign size={16} />, label: "Carteira", sub: "Pagamentos e histórico", color: "text-green-400", bg: "bg-green-500/8 border-green-500/15 hover:border-green-500/30" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`glass-card rounded-xl p-4 cursor-pointer flex flex-col gap-3 group border transition-all h-full ${action.bg}`}
                >
                  <div className={`w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    {action.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${action.color}`}>{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.sub}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FREELANCER DASHBOARD
───────────────────────────────────────────── */
function FreelancerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetFreelancerStats(user?.id ?? 0, {
    query: { queryKey: ["freelancer-stats", user?.id], enabled: !!user?.id, refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: myApps, isLoading: appsLoading } = useListApplications({ status: "pending" });
  const pendingApps = myApps?.slice(0, 4) ?? [];

  const levelMap: Record<string, { next: string; threshold: number; color: string; emoji: string }> = {
    bronze: { next: "Prata", threshold: 5, color: "text-orange-400", emoji: "🥉" },
    silver: { next: "Ouro", threshold: 15, color: "text-slate-300", emoji: "🥈" },
    gold: { next: "Elite", threshold: 30, color: "text-yellow-400", emoji: "🥇" },
    elite: { next: "Elite", threshold: 100, color: "text-primary", emoji: "👑" },
  };
  const currentLevel = user?.level ?? "bronze";
  const levelInfo = levelMap[currentLevel] ?? levelMap.bronze;
  const progress = Math.min(100, ((user?.completedJobs ?? 0) / levelInfo.threshold) * 100);

  const quickActions = [
    { href: "/app/jobs", icon: <Briefcase size={16} />, label: "Buscar Vagas", sub: "Ver oportunidades disponíveis", iconBg: "bg-primary/10 border-primary/20 text-primary", hoverBorder: "hover:border-primary/30", color: "text-primary" },
    { href: "/app/wallet", icon: <Wallet size={16} />, label: "Carteira", sub: "Saldo e saques via PIX", iconBg: "bg-secondary/10 border-secondary/20 text-secondary", hoverBorder: "hover:border-secondary/30", color: "text-secondary" },
    { href: "/app/referrals", icon: <Star size={16} />, label: "Indicações", sub: "Ganhe bônus indicando amigos", iconBg: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400", hoverBorder: "hover:border-yellow-400/30", color: "text-yellow-400" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-7 pb-20 lg:pb-6">
      <OnboardingWizard />
      <GreetingHeader
        name={user?.name?.split(" ")[0] ?? "Profissional"}
        subtitle="Aqui está seu desempenho na plataforma."
        badge={
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
              currentLevel === "elite" ? "text-primary border-primary/30 bg-primary/10" :
              currentLevel === "gold" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
              currentLevel === "silver" ? "text-slate-300 border-slate-300/30 bg-slate-300/10" :
              "text-orange-400 border-orange-400/30 bg-orange-400/10"
            }`}>
              <span>{levelInfo.emoji}</span>
              Nível {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
            </span>
            {user?.reputationScore != null && user.reputationScore > 0 && (
              <span className="text-[11px] text-yellow-400 flex items-center gap-1 font-semibold">
                <Star size={10} className="fill-yellow-400" />
                {(user.reputationScore ?? 0).toFixed(1)} reputação
              </span>
            )}
          </div>
        }
      />

      <ProfileCompletionBanner />

      <PlatformStatsBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <StatCard icon={<CheckCircle size={18} />} label="Jobs Feitos" value={user?.completedJobs ?? 0} color="primary" isLoading={statsLoading} delay={0.05} />
        <StatCard icon={<Star size={18} />} label="Reputação" value={(user?.reputationScore ?? 0)} sub="/ 5.0" color="yellow" isLoading={statsLoading} delay={0.1} />
        <StatCard icon={<DollarSign size={18} />} label="Ganhos Totais" value={`R$ ${((stats?.totalEarned ?? 0) / 100).toFixed(2)}`} color="green" isLoading={statsLoading} delay={0.15} />
        <StatCard icon={<TrendingUp size={18} />} label="Jobs Concluídos" value={stats?.completedJobs ?? 0} color="secondary" isLoading={statsLoading} delay={0.2} />
      </div>

      {/* Level progress card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="glass-card rounded-2xl p-5 border border-primary/12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Progresso de Nível</p>
            <p className="font-bold text-base flex items-center gap-2">
              <span className={levelInfo.color}>{levelInfo.emoji}</span>
              <span className="neon-text-gradient">{currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}</span>
              <span className="text-muted-foreground font-normal text-sm">→ {levelInfo.next}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.completedJobs ?? 0} / {levelInfo.threshold} jobs para {levelInfo.next}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold neon-text-gradient leading-none">{Math.round(progress)}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">completo</p>
          </div>
        </div>
        <Progress value={progress} glow className="h-2.5" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Pending applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Candidaturas Pendentes</h2>
              <Link href="/app/applications">
                <motion.button whileHover={{ x: 2 }} className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                  Ver todas <ArrowRight size={13} />
                </motion.button>
              </Link>
            </div>
            {appsLoading ? (
              <div className="space-y-2">
                {[1,2].map(i => <div key={i} className="glass-card rounded-xl h-16 skeleton" />)}
              </div>
            ) : pendingApps.length === 0 ? (
              <div className="glass-card rounded-xl border border-white/5">
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
                <AnimatePresence>
                  {pendingApps.map((app, i) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.07 }}
                      className="glass-card rounded-xl p-4 flex items-center gap-3 border border-white/5 hover:border-yellow-400/20 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
                        <Clock size={15} className="text-yellow-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.job?.title ?? "Vaga"}</p>
                        <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-yellow-500/15 text-yellow-400 border-yellow-500/25 flex-shrink-0">Pendente</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`glass-card rounded-xl p-4 cursor-pointer flex items-center gap-3 group border border-white/5 ${action.hoverBorder} transition-all`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${action.iconBg}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${action.color}`}>{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.sub}</p>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ActivityFeed role="freelancer" />

          {/* Motivational tip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4 border border-secondary/15 bg-gradient-to-br from-secondary/6 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 opacity-10 text-6xl leading-none font-black text-secondary">✦</div>
            <div className="flex items-start gap-3 relative">
              <div className="w-9 h-9 rounded-xl bg-secondary/12 border border-secondary/25 flex items-center justify-center flex-shrink-0">
                <Zap size={15} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary mb-0.5">Dica do dia</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {(user?.completedJobs ?? 0) < 5
                    ? "Complete 5 jobs para subir para o nível Prata e receber mais oportunidades!"
                    : (user?.completedJobs ?? 0) < 15
                    ? "Você está quase no nível Ouro! Continue trabalhando para desbloquear vagas exclusivas."
                    : "Você é uma referência na plataforma. Indique amigos e ganhe bônus extras!"}
                </p>
              </div>
            </div>
          </motion.div>

          <LiveActivityFeed />
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
