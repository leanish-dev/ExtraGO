import React from "react";
import { useTilt } from "@/hooks/use-tilt";
import { useAuth } from "@/hooks/use-auth";
import { useGetCompanyStats, useGetFreelancerStats, useListJobs, useListApplications, useListTransactions } from "@workspace/api-client-react";
import type { Application, Transaction } from "@workspace/api-client-react";
import { Briefcase, DollarSign, Star, Clock, CheckCircle, Users, FileText, ArrowRight, Wallet, Plus, Activity, TrendingUp, Building2, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { LiveActivityFeed } from "@/components/live-activity-feed";
import { AnimatedCounter } from "@/components/animated-counter";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LevelBadgeIcon, UserBadge, UserBadgeIcon } from "@/components/level-badge";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}


const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  open: { label: "Aberta", class: "bg-primary/20 text-primary border-primary/30" },
  in_progress: { label: "Em andamento", class: "bg-secondary/20 text-secondary border-secondary/30" },
  completed: { label: "Concluída", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelada", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

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
      {time && <p className="text-[11px] text-muted-foreground flex-shrink-0">{time}</p>}
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
    const timeStr = app.appliedAt ? formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true, locale: ptBR }) : "";
    items.push({
      ts,
      node: (
        <ActivityFeedItem
          key={`app-${app.id}`}
          type="application"
          title={role === "company" ? `${app.freelancer?.name ?? "Profissional"} se candidatou` : `Candidatura ${statusInfo.label.toLowerCase()}`}
          sub={app.job?.title ?? "Extra"}
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
    const timeStr = tx.createdAt ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ptBR }) : "";
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
    <div className="card-activity-feed p-5">
      {/* Career diamond watermark top-right */}
      <div className="absolute top-2 right-3 pointer-events-none select-none opacity-[0.11]">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <polygon points="28,4 52,28 28,52 4,28" stroke="#22c55e" strokeWidth="1.5" fill="none"/>
          <polygon points="28,12 44,28 28,44 12,28" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.6"/>
          <polygon points="28,20 36,28 28,36 20,28" stroke="#7cfc00" strokeWidth="0.8" fill="none" opacity="0.4"/>
          <circle cx="28" cy="28" r="2.5" fill="#22c55e" opacity="0.5"/>
        </svg>
      </div>
      <div className="flex items-center gap-2 mb-4 relative">
        <Activity size={14} className="text-muted-foreground" />
        <h2 className="font-semibold text-sm flex-1">Atividade Recente</h2>
        <Link href="/app/feed" className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium mr-1.5">Ver tudo</Link>
        <span className="live-dot" />
      </div>
      {loading ? (
        <div className="space-y-1">{[1,2,3].map(i => <SkeletonListRow key={i} />)}</div>
      ) : topItems.length === 0 ? (
        <EmptyState icon={<Clock size={22} />} title="Nenhuma atividade ainda" description="Suas candidaturas e transações aparecerão aqui." className="py-8" />
      ) : (
        <div>{topItems.map((item, i) => <React.Fragment key={i}>{item.node}</React.Fragment>)}</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CAREER HERO — replaces: greeting + platform stats + 4 stat cards +
   level progress card + 3 quick action cards + feed preview widget
──────────────────────────────────────────────────────────────────────────*/
const LEVEL_FEES: Record<string, number> = { bronze: 20, silver: 18, gold: 15, elite: 12, diamond: 10 };
const LEVEL_NEXT: Record<string, { key: string; label: string; threshold: number; prevThreshold: number; fee: number } | null> = {
  bronze:  { key: "silver",  label: "Júnior",        threshold: 20,  prevThreshold: 0,   fee: 18 },
  silver:  { key: "gold",    label: "Intermediário",  threshold: 100, prevThreshold: 20,  fee: 15 },
  gold:    { key: "elite",   label: "Sênior",         threshold: 300, prevThreshold: 100, fee: 12 },
  elite:   { key: "diamond", label: "Elite",          threshold: 600, prevThreshold: 300, fee: 10 },
  diamond: null,
};

function CareerHero({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  const { user } = useAuth();
  const currentLevel = user?.level ?? "bronze";
  const currentFee = LEVEL_FEES[currentLevel] ?? 20;
  const nextInfo = LEVEL_NEXT[currentLevel] ?? null;
  const completed = user?.completedJobs ?? 0;
  const isMax = currentLevel === "diamond";

  const remaining = nextInfo ? Math.max(0, nextInfo.threshold - completed) : 0;
  const progress = nextInfo
    ? Math.min(100, Math.max(0, ((completed - nextInfo.prevThreshold) / (nextInfo.threshold - nextInfo.prevThreshold)) * 100))
    : 100;

  // Savings estimate: avg R$250 extra × 4/month × fee delta
  const savingsPerExtra = nextInfo ? ((currentFee - nextInfo.fee) / 100) * 250 : 0;
  const monthlySavings = Math.round(savingsPerExtra * 4);

  const greeting = getGreeting();
  const firstName = user?.name?.split(" ")[0] ?? "Profissional";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className="card-career-hero p-5 sm:p-6"
    >
      {/* Ambient top glow */}
      <div className="absolute top-0 left-6 w-52 h-16 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.20) 0%, transparent 70%)", filter: "blur(22px)" }} />
      {/* Freelancer badge watermark */}
      <div className="absolute right-4 -bottom-2 pointer-events-none select-none"
        style={{
          width: 120, height: 120,
          backgroundImage: "url(/badges/freelancer-badges.png)",
          backgroundSize: "500% auto",
          backgroundPosition: "100% center",
          backgroundRepeat: "no-repeat",
          opacity: 0.18,
          mixBlendMode: "screen",
        }}
      />

      {/* Row 1: Badge + Identity + Fee */}
      <div className="relative flex items-start gap-4 mb-5">
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 180 }}
          className="flex-shrink-0 mt-1"
        >
          <UserBadgeIcon user={user} size="xl" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{greeting}</p>
          <h1 className="text-xl sm:text-2xl font-black leading-tight mt-0.5 truncate">{firstName}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <UserBadge user={user} size="sm" />
            {user?.isVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/8 border border-primary/18 px-2 py-0.5 rounded-full">
                <CheckCircle size={8} /> Verificado
              </span>
            )}
            {(user?.reputationScore ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-400">
                <Star size={9} className="fill-yellow-400" /> {(user?.reputationScore ?? 0).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Taxa atual</p>
          <p className="text-3xl sm:text-4xl font-black text-primary leading-none">{currentFee}%</p>
          {nextInfo && (
            <p className="text-[11px] text-muted-foreground mt-1">→ <span className="text-foreground font-semibold">{nextInfo.fee}%</span> no próximo</p>
          )}
        </div>
      </div>

      {/* Row 2: Progress (if not max) */}
      {!isMax && nextInfo && (
        <div className="relative space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{completed} extras concluídos</span>
            <span className="font-semibold text-foreground">
              {remaining === 0
                ? <span className="text-primary font-bold">✓ Pronto para subir de nível!</span>
                : <>{remaining} para <span className="text-foreground">{nextInfo.label}</span></>
              }
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/6 overflow-hidden border border-white/4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(progress, 1.5)}%` }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
              className="h-full rounded-full relative overflow-hidden"
              style={{ background: "linear-gradient(90deg, hsl(88,100%,44%), hsl(88,100%,56%))", boxShadow: "0 0 10px rgba(124,252,0,0.30)" }}
            >
              <div className="absolute inset-0 opacity-25"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)", animation: "shimmer 2.5s ease-in-out infinite" }} />
            </motion.div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">{Math.round(progress)}% do caminho para {nextInfo.label}</p>
            {monthlySavings > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="text-[11px] font-bold text-primary bg-primary/8 border border-primary/18 px-2.5 py-1 rounded-full"
              >
                Economize ~R${monthlySavings}/mês
              </motion.span>
            )}
          </div>
        </div>
      )}

      {isMax && (
        <div className="relative flex items-center gap-2 text-sm mb-5">
          <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={10} className="text-primary" />
          </div>
          <span className="text-sm font-bold text-primary">Nível Elite — taxa mínima de 10% conquistada para sempre</span>
        </div>
      )}

      {/* Row 3: Inline stats + Actions */}
      <div className="relative pt-4 border-t border-white/6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-5 text-xs">
          {!isLoading && (
            <>
              <div>
                <p className="text-muted-foreground font-medium leading-none mb-1">Ganhos totais</p>
                <p className="font-bold text-foreground">R$<AnimatedCounter value={(stats?.totalEarned ?? 0) / 100} decimals={0} /></p>
              </div>
              <div className="w-px h-7 bg-white/8" />
              <div>
                <p className="text-muted-foreground font-medium leading-none mb-1">Extras feitos</p>
                <p className="font-bold text-primary"><AnimatedCounter value={completed} /></p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/app/jobs">
            <Button size="sm" className="bg-primary text-black hover:bg-primary/90 border-none font-bold rounded-xl text-xs h-9 px-4 neon-glow gap-1.5">
              <Briefcase size={12} /> Buscar Extras
            </Button>
          </Link>
          <Link href="/app/wallet">
            <Button size="sm" variant="outline" className="border-white/12 hover:border-white/25 rounded-xl text-xs h-9 px-3 font-semibold gap-1.5">
              <Wallet size={12} /> Carteira
            </Button>
          </Link>
          <Link href="/app/referrals">
            <Button size="sm" variant="outline" className="border-white/12 hover:border-yellow-400/25 rounded-xl text-xs h-9 px-3 font-semibold gap-1.5 flex">
              <Star size={12} /> Indicações
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPANY HERO — replaces: greeting + platform stats + 4 stat cards
──────────────────────────────────────────────────────────────────────────*/
function CompanyHero({ stats, isLoading }: { stats: any; isLoading: boolean }) {
  const { user } = useAuth();
  const greeting = getGreeting();
  const displayName = (user as any)?.companyName || user?.name?.split(" ")[0] || "Empresa";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      className="relative rounded-2xl overflow-hidden p-5 sm:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(20,184,166,0.16) 0%, rgba(8,17,26,0.96) 50%, rgba(0,229,255,0.08) 100%)",
        border: "1px solid rgba(20,184,166,0.24)",
        boxShadow: "0 0 0 1px rgba(20,184,166,0.05) inset, 0 0 40px rgba(20,184,166,0.09), 0 20px 60px rgba(0,0,0,0.50)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.50), rgba(0,229,255,0.22), transparent)" }} />
      <div className="absolute top-0 right-8 w-40 h-14 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(20,184,166,0.18) 0%, transparent 70%)", filter: "blur(20px)" }} />
      {/* Corporate badge watermark */}
      <div className="absolute right-4 -bottom-2 pointer-events-none select-none"
        style={{
          width: 110, height: 110,
          backgroundImage: "url(/badges/corporate-badges.png)",
          backgroundSize: "400% auto",
          backgroundPosition: "0% center",
          backgroundRepeat: "no-repeat",
          opacity: 0.14,
          mixBlendMode: "screen",
        }}
      />
      {/* Circuit/grid SVG pattern top-right */}
      <div className="absolute top-0 right-0 pointer-events-none select-none opacity-[0.07]">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
          <line x1="20" y1="0" x2="20" y2="80" stroke="#14b8a6" strokeWidth="0.8"/>
          <line x1="50" y1="0" x2="50" y2="80" stroke="#14b8a6" strokeWidth="0.8"/>
          <line x1="80" y1="0" x2="80" y2="80" stroke="#14b8a6" strokeWidth="0.8"/>
          <line x1="110" y1="0" x2="110" y2="80" stroke="#14b8a6" strokeWidth="0.8"/>
          <line x1="0" y1="20" x2="120" y2="20" stroke="#14b8a6" strokeWidth="0.8"/>
          <line x1="0" y1="50" x2="120" y2="50" stroke="#14b8a6" strokeWidth="0.8"/>
          <circle cx="20" cy="20" r="2" fill="#14b8a6"/>
          <circle cx="50" cy="50" r="2" fill="#00e5ff"/>
          <circle cx="80" cy="20" r="1.5" fill="#14b8a6"/>
          <circle cx="110" cy="50" r="1.5" fill="#00e5ff"/>
          <circle cx="20" cy="50" r="1.5" fill="#14b8a6" opacity="0.6"/>
          <circle cx="80" cy="50" r="2" fill="#14b8a6"/>
        </svg>
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{greeting} 👋</p>
          <h1 className="text-xl sm:text-2xl font-black leading-tight mt-0.5 truncate">{displayName}</h1>
          {user?.isVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/8 border border-primary/18 px-2 py-0.5 rounded-full mt-2">
              <CheckCircle size={8} /> Empresa Verificada
            </span>
          )}

          {/* Inline stats — no cards, just data */}
          <div className="flex items-center gap-5 mt-4 text-xs flex-wrap">
            <div>
              <p className="text-muted-foreground font-medium leading-none mb-1">Extras abertos</p>
              <p className="font-bold text-secondary text-lg leading-none">
                {isLoading ? "—" : <AnimatedCounter value={stats?.activeJobs ?? 0} />}
              </p>
            </div>
            <div className="w-px h-8 bg-white/8" />
            <div>
              <p className="text-muted-foreground font-medium leading-none mb-1">Profissionais</p>
              <p className="font-bold text-foreground text-lg leading-none">
                {isLoading ? "—" : <AnimatedCounter value={stats?.totalWorkers ?? 0} />}
              </p>
            </div>
            <div className="w-px h-8 bg-white/8" />
            <div>
              <p className="text-muted-foreground font-medium leading-none mb-1">Investido</p>
              <p className="font-bold text-foreground text-lg leading-none">
                {isLoading ? "—" : <>R$<AnimatedCounter value={(stats?.totalSpent ?? 0) / 100} decimals={0} /></>}
              </p>
            </div>
            <div className="w-px h-8 bg-white/8 hidden sm:block" />
            <div className="hidden sm:block">
              <p className="text-muted-foreground font-medium leading-none mb-1">Publicados</p>
              <p className="font-bold text-foreground text-lg leading-none">
                {isLoading ? "—" : <AnimatedCounter value={stats?.totalJobsPosted ?? 0} />}
              </p>
            </div>
          </div>
        </div>

        <Link href="/app/jobs/new">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl text-sm px-4 h-10 gap-1.5 flex-shrink-0">
              <Plus size={15} /> Novo Extra
            </Button>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPANY DASHBOARD
──────────────────────────────────────────────────────────────────────────*/
function CompanyDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetCompanyStats(user?.id ?? 0, {
    query: { queryKey: ["company-stats", user?.id], enabled: !!user?.id, refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: jobs, isLoading: jobsLoading } = useListJobs({ status: "open" });
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <div className="page-enter pb-20 lg:pb-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url(/images/backgrounds/bg-dashboard.webp)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.07, mixBlendMode: "screen", filter: "blur(2px)" }}
      />
      <div className="mod-wallet-ambient absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/60 via-transparent to-[#070a0d]/50 pointer-events-none" />

      {/* Dashboard Module Hero Banner — Company */}
      <div className="module-hero module-hero-dashboard">
        <div className="absolute right-0 top-0 bottom-0 flex items-end gap-3 pr-8 pb-4 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <Building2 size={90} style={{ color: "#22c55e" }} />
          <Briefcase size={70} style={{ color: "#7cfc00" }} />
          <TrendingUp size={60} style={{ color: "#22c55e" }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mod-icon-career">
              <LayoutDashboard size={11} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#22c55e" }}>Painel Empresa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Olá, {user?.name?.split(" ")[0] ?? "Empresa"}
          </h1>
          <p className="text-sm text-white/70 mt-0.5">Gerencie seus extras e contratações</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Hero: greeting + inline stats + CTA */}
        <CompanyHero stats={stats} isLoading={statsLoading} />

        {/* Section divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 px-2">Operações</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/8 to-transparent" />
        </div>

        {/* Extras recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Extras Recentes</h2>
            <Link href="/app/jobs">
              <motion.button whileHover={{ x: 2 }} className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors">
                Ver todos <ArrowRight size={12} />
              </motion.button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="rounded-xl h-16 skeleton" />)}</div>
          ) : recentJobs.length === 0 ? (
            <EmptyState
              icon={<Briefcase size={28} />}
              title="Nenhum extra ativo"
              description="Publique seu primeiro extra e encontre os melhores profissionais."
              actionLabel="Publicar primeiro extra"
              actionHref="/app/jobs/new"
            />
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job, i) => {
                const s = STATUS_BADGE[job.status ?? "open"] ?? STATUS_BADGE.open;
                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    whileHover={{ x: 2 }}
                  >
                    <Link href="/app/jobs">
                      <div className="rounded-xl p-4 cursor-pointer flex items-center gap-4 border border-primary/28 hover:border-primary/45 transition-all group relative overflow-hidden"
                        style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.16) 0%, rgba(8,17,26,0.85) 60%, rgba(0,229,255,0.06) 100%)" }}>
                        <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/18 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/14 transition-colors">
                          <Briefcase size={15} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.location} · {job.date ? format(new Date(job.date), "dd MMM", { locale: ptBR }) : ""}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${s.class}`}>{s.label}</span>
                          <span className="text-[11px] text-muted-foreground">{job.workersApproved}/{job.workersNeeded} vagas</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 px-2">Atividade</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/8 to-transparent" />
        </div>

        {/* Activity + quick links */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ActivityFeed role="company" />
          </div>
          <div className="space-y-3">
            {[
              { href: "/app/applications", icon: <Users size={16} />, label: "Candidaturas", sub: "Aprovar ou recusar profissionais", color: "text-secondary", accentRgb: "0,229,255", borderHover: "rgba(0,229,255,0.48)" },
              { href: "/app/wallet", icon: <DollarSign size={16} />, label: "Carteira", sub: "Pagamentos e histórico", color: "text-teal-400", accentRgb: "20,184,166", borderHover: "rgba(20,184,166,0.48)" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl p-4 cursor-pointer flex items-center gap-3 border transition-all group relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, rgba(${action.accentRgb},0.20) 0%, rgba(8,17,26,0.90) 60%, rgba(${action.accentRgb},0.08) 100%)`,
                    borderColor: `rgba(${action.accentRgb},0.32)`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = action.borderHover)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(${action.accentRgb},0.32)`)}
                >
                  <div className="absolute top-0 left-0 right-0 h-px opacity-50"
                    style={{ background: `linear-gradient(90deg, transparent, rgba(${action.accentRgb},0.40), transparent)` }} />
                  <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color}`}
                    style={{ background: `rgba(${action.accentRgb},0.10)`, border: `1px solid rgba(${action.accentRgb},0.20)` }}>
                    {action.icon}
                  </div>
                  <div className="relative">
                    <p className={`text-sm font-bold ${action.color}`}>{action.label}</p>
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

/* ─────────────────────────────────────────────────────────────────────────
   FREELANCER DASHBOARD
──────────────────────────────────────────────────────────────────────────*/
function FreelancerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetFreelancerStats(user?.id ?? 0, {
    query: { queryKey: ["freelancer-stats", user?.id], enabled: !!user?.id, refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: myApps, isLoading: appsLoading } = useListApplications({ status: "pending" });
  const pendingApps = myApps?.slice(0, 4) ?? [];

  return (
    <div className="page-enter pb-20 lg:pb-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url(/images/backgrounds/bg-dashboard.webp)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.07, mixBlendMode: "screen", filter: "blur(2px)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/60 via-transparent to-[#070a0d]/50 pointer-events-none" />

      {/* Dashboard Module Hero Banner — Freelancer */}
      <div className="module-hero module-hero-dashboard">
        <div className="absolute right-0 top-0 bottom-0 flex items-end gap-3 pr-8 pb-4 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <Briefcase size={90} style={{ color: "#22c55e" }} />
          <Star size={70} style={{ color: "#7cfc00" }} />
          <TrendingUp size={60} style={{ color: "#22c55e" }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mod-icon-career">
              <LayoutDashboard size={11} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#22c55e" }}>Painel Carreira</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Olá, {user?.name?.split(" ")[0] ?? "Freelancer"}
          </h1>
          <p className="text-sm text-white/70 mt-0.5">Acompanhe sua evolução e oportunidades</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* CAREER HERO — the single most important element on this page */}
        <CareerHero stats={stats} isLoading={statsLoading} />

        {/* Section divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 px-2">Missões & Atividade</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/8 to-transparent" />
        </div>

        {/* Operações + Atividade */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Status das missões */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/70">Missões em Curso</h2>
              </div>
              <Link href="/app/applications">
                <motion.button whileHover={{ x: 2 }} className="text-xs text-primary font-semibold flex items-center gap-1">
                  Ver todas <ArrowRight size={12} />
                </motion.button>
              </Link>
            </div>
            {appsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="rounded-xl h-14 skeleton" />)}</div>
            ) : pendingApps.length === 0 ? (
              <div className="rounded-2xl border p-6 flex flex-col items-center text-center gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.16) 0%, rgba(8,17,26,0.92) 60%, rgba(0,229,255,0.06) 100%)", borderColor: "rgba(124,252,0,0.28)" }}>
                <div className="absolute top-0 left-0 right-0 h-px opacity-40" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.35), transparent)" }} />
                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/18 flex items-center justify-center">
                  <Briefcase size={18} className="text-primary/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Nenhuma missão ativa</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Busque extras e candidate-se agora</p>
                </div>
                <Link href="/app/jobs">
                  <button className="text-xs text-primary border border-primary/25 px-3 py-1.5 rounded-full hover:bg-primary/8 transition-all font-semibold">
                    Buscar Extras
                  </button>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border divide-y divide-white/5 overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.04) 0%, rgba(8,17,26,0.92) 100%)", borderColor: "rgba(124,252,0,0.10)", boxShadow: "0 0 0 1px rgba(124,252,0,0.04) inset" }}>
                <AnimatePresence>
                  {pendingApps.map((app, i) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="w-1.5 h-full self-stretch flex-shrink-0 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{app.job?.title ?? "Extra"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Aguardando resposta</p>
                      </div>
                      <span className="text-[11px] font-bold text-yellow-400/80 flex-shrink-0 tracking-wide">PEND.</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <ActivityFeed role="freelancer" />
        </div>
      </div>
    </div>
  );
}

/* ── Root export ── */
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "company") return <CompanyDashboard />;
  return <FreelancerDashboard />;
}
