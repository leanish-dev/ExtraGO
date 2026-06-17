import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  LevelBadgeIcon, LEVEL_LABELS, LEVEL_COLORS,
  UserBadge, UserBadgeIcon,
} from "@/components/level-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/animated-counter";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  useGetFreelancerStats,
  useListApplications,
  useListTransactions,
} from "@workspace/api-client-react";
import type { Application, Transaction } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Star, CheckCircle, Lock, TrendingUp, Zap, Target, Shield,
  Search, Users, MessageSquare, Award, ChevronRight,
  DollarSign, BarChart3, Trophy, Sparkles, Briefcase,
  FileText, Activity, Wallet, Clock, ArrowRight, LayoutDashboard,
} from "lucide-react";

/* ─── Time greeting ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/* ─── Level config ─── */
const LEVELS = [
  {
    key: "bronze", label: "Iniciante", feePercent: 20,
    minJobs: 0, minStars: 0,
    color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30",
    glow: "",
    nextJobsReq: 20, nextStarsReq: 4.5,
  },
  {
    key: "silver", label: "Júnior", feePercent: 18,
    minJobs: 20, minStars: 4.5,
    color: "text-cyan-300", bg: "bg-cyan-300/10", border: "border-cyan-300/30",
    glow: "",
    nextJobsReq: 100, nextStarsReq: 4.7,
  },
  {
    key: "gold", label: "Intermediário", feePercent: 15,
    minJobs: 100, minStars: 4.7,
    color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/30",
    glow: "",
    nextJobsReq: 300, nextStarsReq: 4.8,
  },
  {
    key: "elite", label: "Sênior", feePercent: 12,
    minJobs: 300, minStars: 4.8,
    color: "text-primary", bg: "bg-primary/10", border: "border-primary/30",
    glow: "shadow-[0_0_20px_rgba(124,252,0,0.15)]",
    nextJobsReq: 600, nextStarsReq: 4.9,
  },
  {
    key: "diamond", label: "Elite", feePercent: 10,
    minJobs: 600, minStars: 4.9,
    color: "text-amber-300", bg: "bg-amber-300/10", border: "border-amber-300/30",
    glow: "shadow-[0_0_20px_rgba(252,211,77,0.18)]",
    nextJobsReq: null, nextStarsReq: null,
  },
];

const LEVEL_INDEX: Record<string, number> = {
  bronze: 0, silver: 1, gold: 2, elite: 3, diamond: 4,
};

const LEVEL_FEES: Record<string, number> = {
  bronze: 20, silver: 18, gold: 15, elite: 12, diamond: 10,
};

const LEVEL_NEXT: Record<string, { key: string; label: string; threshold: number; prevThreshold: number; fee: number } | null> = {
  bronze:  { key: "silver",  label: "Júnior",       threshold: 20,  prevThreshold: 0,   fee: 18 },
  silver:  { key: "gold",    label: "Intermediário", threshold: 100, prevThreshold: 20,  fee: 15 },
  gold:    { key: "elite",   label: "Sênior",        threshold: 300, prevThreshold: 100, fee: 12 },
  elite:   { key: "diamond", label: "Elite",         threshold: 600, prevThreshold: 300, fee: 10 },
  diamond: null,
};

/* ─── Achievements ─── */
interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  unlocked: (jobs: number, stars: number, verified: boolean) => boolean;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_extra", label: "Primeiro Extra", desc: "Concluiu o primeiro extra", icon: <Zap size={18} />, unlocked: (j) => j >= 1, color: "text-sky-400" },
  { id: "10_extras",   label: "10 Extras",      desc: "10 extras concluídos",     icon: <Trophy size={18} />, unlocked: (j) => j >= 10,  color: "text-cyan-400" },
  { id: "50_extras",   label: "50 Extras",      desc: "50 extras concluídos",     icon: <Award size={18} />,  unlocked: (j) => j >= 50,  color: "text-teal-400" },
  { id: "100_extras",  label: "100 Extras",     desc: "100 extras concluídos",    icon: <BarChart3 size={18} />, unlocked: (j) => j >= 100, color: "text-primary" },
  { id: "star5",       label: "Avaliação 5★",   desc: "Conquistou nota máxima",   icon: <Star size={18} />,   unlocked: (_, s) => s >= 4.9, color: "text-yellow-400" },
  { id: "verified",    label: "Profissional Verificado", desc: "Documentação validada", icon: <Shield size={18} />, unlocked: (_, __, v) => v, color: "text-green-400" },
  { id: "top_region",  label: "Top da Região",  desc: "Entre os melhores da sua área", icon: <Target size={18} />, unlocked: (j, s) => j >= 50 && s >= 4.7, color: "text-orange-400" },
  { id: "elite_national", label: "Elite Nacional", desc: "Nível Elite alcançado", icon: <Sparkles size={18} />, unlocked: (j, s) => j >= 600 && s >= 4.9, color: "text-amber-300" },
];

const REPUTATION_IMPACTS = [
  { icon: <BarChart3 size={16} />, label: "Ranking",      desc: "Quanto mais alta sua reputação, mais alto você aparece nos rankings da plataforma." },
  { icon: <Search size={16} />,   label: "Busca",         desc: "Profissionais bem avaliados têm prioridade nos resultados de busca das empresas." },
  { icon: <MessageSquare size={16} />, label: "Convites", desc: "Empresas convidam diretamente profissionais com boa reputação para seus extras." },
  { icon: <Users size={16} />,    label: "Contratações",  desc: "Uma avaliação sólida aumenta drasticamente a taxa de conversão de candidaturas." },
  { icon: <TrendingUp size={16} />, label: "Progressão",  desc: "A nota mínima de estrelas é requisito obrigatório para subir de nível." },
];

const APP_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: "Pendente",  color: "text-yellow-400" },
  approved: { label: "Aprovada",  color: "text-primary" },
  rejected: { label: "Recusada", color: "text-destructive" },
};

/* ─── Helper: small reputation ring ─── */
function ReputationRingSmall({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (score / 5) * 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(88,100%,49%)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease", filter: "drop-shadow(0 0 5px rgba(124,252,0,0.45))" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-sm font-bold leading-none">{score.toFixed(1)}</p>
        <div className="flex justify-center gap-px mt-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={7} className={i <= Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-white/15"} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Activity feed item ─── */
function ActivityFeedItem({ title, sub, time, icon, iconBg }: {
  type: string; title: string; sub?: string; time?: string;
  icon: React.ReactNode; iconBg: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {sub && <p className="text-xs text-white/70 mt-0.5 truncate">{sub}</p>}
      </div>
      {time && <p className="text-[11px] text-white/65 flex-shrink-0">{time}</p>}
    </motion.div>
  );
}

/* ─── Activity feed panel ─── */
function ActivityFeed() {
  const { data: apps = [], isLoading: appsLoading } = useListApplications({ status: undefined }, {
    query: { queryKey: ["apps-career"], refetchInterval: 10000, refetchIntervalInBackground: false },
  });
  const { data: txs = [], isLoading: txsLoading } = useListTransactions(undefined, {
    query: { queryKey: ["txs-career"], refetchInterval: 10000, refetchIntervalInBackground: false },
  });

  const loading = appsLoading || txsLoading;
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
          title={`Candidatura ${statusInfo.label.toLowerCase()}`}
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
      <div className="absolute top-2 right-3 pointer-events-none select-none opacity-[0.11]">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <polygon points="28,4 52,28 28,52 4,28" stroke="#22c55e" strokeWidth="1.5" fill="none"/>
          <polygon points="28,12 44,28 28,44 12,28" stroke="#22c55e" strokeWidth="1" fill="none" opacity="0.6"/>
          <polygon points="28,20 36,28 28,36 20,28" stroke="#7cfc00" strokeWidth="0.8" fill="none" opacity="0.4"/>
          <circle cx="28" cy="28" r="2.5" fill="#22c55e" opacity="0.5"/>
        </svg>
      </div>
      <div className="flex items-center gap-2 mb-4 relative">
        <Activity size={14} className="text-white/60" />
        <h2 className="font-semibold text-sm flex-1">Atividade Recente</h2>
        <Link href="/app/feed" className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium mr-1.5">Ver tudo</Link>
        <span className="live-dot" />
      </div>
      {loading ? (
        <div className="space-y-1">{[1, 2, 3].map(i => <SkeletonListRow key={i} />)}</div>
      ) : topItems.length === 0 ? (
        <EmptyState icon={<Clock size={22} />} title="Nenhuma atividade ainda" description="Suas candidaturas e transações aparecerão aqui." className="py-8" />
      ) : (
        <div>{topItems.map((item, i) => <React.Fragment key={i}>{item.node}</React.Fragment>)}</div>
      )}
    </div>
  );
}

/* ─── Career Hero card (greeting + level + progress + stats + actions) ─── */
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
      <div className="absolute top-0 left-6 w-52 h-16 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(34,197,94,0.20) 0%, transparent 70%)", filter: "blur(22px)" }} />
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
          <p className="text-xs text-white/70 font-medium">{greeting}</p>
          <h1 className="text-xl sm:text-2xl font-black leading-tight mt-0.5 truncate neon-text-gradient">{firstName}</h1>
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
          <p className="text-[11px] text-white/75 uppercase tracking-widest font-bold mb-0.5">Taxa atual</p>
          <p className="text-3xl sm:text-4xl font-black text-primary leading-none">{currentFee}%</p>
          {nextInfo && (
            <p className="text-[11px] text-white/70 mt-1">→ <span className="text-foreground font-semibold">{nextInfo.fee}%</span> no próximo</p>
          )}
        </div>
      </div>

      {!isMax && nextInfo && (
        <div className="relative space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">{completed} extras concluídos</span>
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
            <p className="text-[11px] text-white/70">{Math.round(progress)}% do caminho para {nextInfo.label}</p>
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

      <div className="relative pt-4 border-t border-white/6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-5 text-xs">
          {!isLoading && (
            <>
              <div>
                <p className="text-white/70 font-medium leading-none mb-1">Ganhos totais</p>
                <p className="font-bold text-foreground">R$<AnimatedCounter value={(stats?.totalEarned ?? 0) / 100} decimals={0} /></p>
              </div>
              <div className="w-px h-7 bg-white/8" />
              <div>
                <p className="text-white/70 font-medium leading-none mb-1">Extras feitos</p>
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
            <Button size="sm" variant="outline" className="border-white/12 hover:border-yellow-400/25 rounded-xl text-xs h-9 px-3 font-semibold gap-1.5">
              <Star size={12} /> Indicações
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ─── */
export default function CareerPage() {
  const { user } = useAuth();
  const [simValue, setSimValue] = useState(200);

  const { data: stats, isLoading: statsLoading } = useGetFreelancerStats(user?.id ?? 0, {
    query: { queryKey: ["freelancer-stats-career", user?.id], enabled: !!user?.id, refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: myApps, isLoading: appsLoading } = useListApplications({ status: "pending" });
  const pendingApps = myApps?.slice(0, 4) ?? [];

  const level = (user?.level as string) ?? "bronze";
  const levelIdx = LEVEL_INDEX[level] ?? 0;
  const currentLevelData = LEVELS[levelIdx];
  const nextLevelData = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;

  const completedJobs = (user as any)?.completedJobs ?? 0;
  const reputationScore = (user as any)?.reputationScore ?? 0;
  const isVerified = (user as any)?.isVerified ?? false;

  const keepPercent = 100 - (currentLevelData?.feePercent ?? 20);

  let progressPct = 0;
  let jobsLeft = 0;
  let starsLeft = 0;
  if (nextLevelData) {
    const jobsReq = nextLevelData.minJobs;
    const starsReq = nextLevelData.minStars;
    const jobsFrom = currentLevelData?.minJobs ?? 0;
    const jobRange = jobsReq - jobsFrom;
    const jobsDone = Math.min(completedJobs - jobsFrom, jobRange);
    progressPct = jobRange > 0 ? Math.max(0, Math.min(100, (jobsDone / jobRange) * 100)) : 100;
    jobsLeft = Math.max(0, jobsReq - completedJobs);
    starsLeft = Math.max(0, starsReq - reputationScore);
  } else {
    progressPct = 100;
  }

  const simEarnings = LEVELS.map(lv => ({
    ...lv,
    earnings: simValue * (1 - lv.feePercent / 100),
  }));

  const colors = currentLevelData ? LEVEL_COLORS[level] ?? LEVEL_COLORS.bronze : LEVEL_COLORS.bronze;

  return (
    <div className="page-enter pb-24 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "url(/images/backgrounds/bg-dashboard.webp)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.07, mixBlendMode: "screen", filter: "blur(2px)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/60 via-transparent to-[#070a0d]/50 pointer-events-none" />

      {/* Module Hero Banner */}
      <div className="module-hero module-hero-dashboard">
        <div className="absolute right-0 top-0 bottom-0 flex items-end gap-3 pr-8 pb-4 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <TrendingUp size={90} style={{ color: "#22c55e" }} />
          <Star size={70} style={{ color: "#7cfc00" }} />
          <Briefcase size={60} style={{ color: "#22c55e" }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mod-icon-career">
              <LayoutDashboard size={11} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#22c55e" }}>Minha Carreira</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight neon-text-gradient">
            Olá, {user?.name?.split(" ")[0] ?? "Profissional"}
          </h1>
          <p className="text-sm text-white/70 mt-0.5">Acompanhe sua evolução e oportunidades</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

        {/* ── CAREER HERO ── */}
        <CareerHero stats={stats} isLoading={statsLoading} />

        {/* ── SECTION: MISSÕES & ATIVIDADE ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 px-2">Missões & Atividade</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/8 to-transparent" />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Missões em curso */}
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
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="rounded-xl h-14 skeleton" />)}</div>
            ) : pendingApps.length === 0 ? (
              <div className="rounded-2xl border p-6 flex flex-col items-center text-center gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.16) 0%, rgba(8,17,26,0.92) 60%, rgba(0,229,255,0.06) 100%)", borderColor: "rgba(124,252,0,0.28)" }}>
                <div className="absolute top-0 left-0 right-0 h-px opacity-40" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.35), transparent)" }} />
                <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/18 flex items-center justify-center">
                  <Briefcase size={18} className="text-primary/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Nenhuma missão ativa</p>
                  <p className="text-xs text-white/70 mt-0.5">Busque extras e candidate-se agora</p>
                </div>
                <Link href="/app/jobs">
                  <button className="text-xs text-primary border border-primary/25 px-3 py-1.5 rounded-full hover:bg-primary/8 transition-all font-semibold">
                    Buscar Extras
                  </button>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border divide-y divide-white/5 overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.04) 0%, rgba(8,17,26,0.92) 100%)", borderColor: "rgba(124,252,0,0.10)" }}>
                <AnimatePresence>
                  {pendingApps.map((app, i) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{app.job?.title ?? "Extra"}</p>
                        <p className="text-xs text-white/70 mt-0.5">Aguardando resposta</p>
                      </div>
                      <span className="text-[11px] font-bold text-yellow-400/80 flex-shrink-0 tracking-wide">PEND.</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Activity feed */}
          <ActivityFeed />
        </div>

        {/* ── SECTION: PROGRESSÃO ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 px-2">Progressão</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/8 to-transparent" />
        </div>

        {/* Level badge hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`card-career-level-hero border ${colors.border} ${currentLevelData?.glow ?? ""}`}
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 60px rgba(0,0,0,0.60)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-28 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(124,252,0,0.10) 0%, transparent 70%)", filter: "blur(24px)" }} />
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.55), rgba(124,252,0,0.30), transparent)" }} />

          <div className="relative p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.6, type: "spring", stiffness: 150 }}
                className="relative mb-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.1, 0.35] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute inset-0 rounded-full border-2 ${colors.border}`}
                  style={{ margin: "-8px" }}
                />
                <LevelBadgeIcon level={level} size="xl" />
              </motion.div>
              <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold mb-0.5">Nível Atual</p>
              <p className={`text-3xl font-black tracking-wide leading-tight ${colors.text}`}>
                {currentLevelData?.label ?? "Iniciante"}
              </p>
              <p className="text-sm text-white/75 mt-1 font-medium">{user?.name ?? "Profissional"}</p>
              <div className="flex items-center gap-3 mt-3">
                {isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 rounded-full">
                    <CheckCircle size={9} /> Verificado
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                  Taxa {currentLevelData?.feePercent ?? 20}% — você fica {keepPercent}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/6">
              <div className="text-center">
                <ReputationRingSmall score={reputationScore} size={52} />
                <p className="text-[9px] text-white/80 uppercase tracking-widest mt-1">Reputação</p>
              </div>
              <div className="w-px h-14 bg-white/8" />
              <div className="text-center">
                <p className={`text-2xl font-black ${colors.text}`}>{completedJobs}</p>
                <p className="text-[9px] text-white/80 uppercase tracking-widest mt-0.5">Extras feitos</p>
              </div>
              <div className="w-px h-14 bg-white/8" />
              <div className="text-center">
                <p className="text-2xl font-black text-yellow-400">{reputationScore.toFixed(1)}</p>
                <p className="text-[9px] text-white/80 uppercase tracking-widest mt-0.5">Avaliação</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── JORNADA DE CARREIRA (TIMELINE) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(8,17,26,0.92) 60%, rgba(124,252,0,0.06) 100%)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.5), rgba(124,252,0,0.35), transparent)" }} />
          <div className="absolute right-2 bottom-2 pointer-events-none select-none opacity-[0.055]">
            <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
              <circle cx="10" cy="8" r="5" stroke="#22c55e" strokeWidth="1.8"/>
              <circle cx="10" cy="28" r="5" stroke="#22c55e" strokeWidth="1.8"/>
              <circle cx="10" cy="48" r="5" stroke="#22c55e" strokeWidth="1.8"/>
              <line x1="10" y1="13" x2="10" y2="23" stroke="#22c55e" strokeWidth="1.4" strokeDasharray="2 2"/>
              <line x1="10" y1="33" x2="10" y2="43" stroke="#22c55e" strokeWidth="1.4" strokeDasharray="2 2"/>
              <line x1="15" y1="8" x2="46" y2="8" stroke="#22c55e" strokeWidth="1.2" strokeOpacity="0.5"/>
              <line x1="15" y1="28" x2="40" y2="28" stroke="#22c55e" strokeWidth="1.2" strokeOpacity="0.5"/>
              <line x1="15" y1="48" x2="44" y2="48" stroke="#22c55e" strokeWidth="1.2" strokeOpacity="0.5"/>
            </svg>
          </div>
          <div className="flex items-center gap-2 mb-5 relative">
            <TrendingUp size={15} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Jornada de Carreira</h3>
          </div>

          <div className="relative">
            <div className="absolute left-[19px] top-5 bottom-5 w-px bg-white/8" />
            <div className="space-y-0">
              {LEVELS.map((lv, idx) => {
                const isDone = idx < levelIdx;
                const isCurrent = idx === levelIdx;
                const isLocked = idx > levelIdx;
                const lc = LEVEL_COLORS[lv.key] ?? LEVEL_COLORS.bronze;
                return (
                  <div key={lv.key} className="relative flex items-start gap-4 pb-5 last:pb-0">
                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                      ${isDone ? `${lc.bg} ${lc.border}` : ""}
                      ${isCurrent ? `${lc.bg} ${lc.border} ${lv.glow}` : ""}
                      ${isLocked ? "bg-white/[0.03] border-white/12" : ""}
                    `}>
                      {isDone && <CheckCircle size={18} className={lc.text} />}
                      {isCurrent && <LevelBadgeIcon level={lv.key} size="md" />}
                      {isLocked && <Lock size={14} className="text-white/25" />}
                    </div>
                    <div className={`flex-1 min-w-0 pt-1.5 ${isLocked ? "opacity-45" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrent ? lc.text : isDone ? lc.text : "text-white/80"}`}>{lv.label}</span>
                          {isCurrent && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${lc.bg} ${lc.text} border ${lc.border}`}>Atual</span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ${isCurrent ? lc.text : isDone ? "text-white/80" : "text-white/75"}`}>
                          Taxa {lv.feePercent}%
                        </span>
                      </div>
                      {idx > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="text-[10px] text-white/80">{lv.minJobs}+ extras • {lv.minStars}★</span>
                        </div>
                      )}
                      {isCurrent && nextLevelData && (
                        <div className="mt-2.5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-white/80">Progresso para {nextLevelData.label}</span>
                            <span className={`text-[10px] font-bold ${lc.text}`}>{Math.round(progressPct)}%</span>
                          </div>
                          <Progress value={progressPct} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── PRÓXIMO OBJETIVO ── */}
        {nextLevelData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.13) 0%, rgba(8,17,26,0.92) 60%, rgba(124,252,0,0.07) 100%)",
              border: "1px solid rgba(34,197,94,0.20)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.55), rgba(124,252,0,0.3), transparent)" }} />
            <div className="absolute right-3 bottom-3 pointer-events-none select-none opacity-[0.04]">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
                <circle cx="25" cy="25" r="22" stroke="#22c55e" strokeWidth="1.8"/>
                <circle cx="25" cy="25" r="14" stroke="#22c55e" strokeWidth="1.4"/>
                <circle cx="25" cy="25" r="6" stroke="#22c55e" strokeWidth="1.6" fill="#22c55e" fillOpacity="0.3"/>
              </svg>
            </div>
            <div className="flex items-center gap-2 mb-4 relative">
              <Target size={15} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Próximo Objetivo</h3>
            </div>

            <div className={`rounded-xl border p-4 ${LEVEL_COLORS[nextLevelData.key].bg} ${LEVEL_COLORS[nextLevelData.key].border}`}>
              <div className="flex items-center gap-3 mb-3">
                <LevelBadgeIcon level={nextLevelData.key} size="lg" />
                <div>
                  <p className={`text-base font-black ${LEVEL_COLORS[nextLevelData.key].text}`}>{nextLevelData.label}</p>
                  <p className="text-xs text-white/70">Nova taxa: <span className="font-bold text-white/90">{nextLevelData.feePercent}%</span></p>
                </div>
              </div>
              <p className="text-xs text-white/75 mb-3 font-medium uppercase tracking-widest">O que falta</p>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/80 flex items-center gap-1.5"><Zap size={11} />{nextLevelData.minJobs} extras concluídos</span>
                    <span className={`text-xs font-bold ${jobsLeft === 0 ? "text-primary" : "text-white/80"}`}>
                      {jobsLeft === 0 ? "✓ Concluído" : `Faltam ${jobsLeft}`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, (completedJobs / nextLevelData.minJobs) * 100)} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/80 flex items-center gap-1.5"><Star size={11} />Avaliação ≥ {nextLevelData.minStars}★</span>
                    <span className={`text-xs font-bold ${starsLeft <= 0 ? "text-primary" : "text-white/80"}`}>
                      {starsLeft <= 0 ? "✓ Atingido" : `+${starsLeft.toFixed(1)}★`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, (reputationScore / nextLevelData.minStars) * 100)} className="h-1.5" />
                </div>
              </div>
              {jobsLeft === 0 && starsLeft <= 0 && (
                <div className="mt-3 rounded-lg bg-primary/15 border border-primary/30 px-3 py-2 text-center">
                  <p className="text-xs font-bold text-primary">🎉 Requisitos atingidos! Seu nível será atualizado em breve.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── SIMULADOR DE GANHOS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.21 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,252,0,0.11) 0%, rgba(8,17,26,0.90) 55%, rgba(0,229,255,0.05) 100%)",
            border: "1px solid rgba(124,252,0,0.16)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.45), rgba(0,229,255,0.25), transparent)" }} />
          <div className="absolute right-2 bottom-2 pointer-events-none select-none opacity-[0.05]">
            <svg width="50" height="52" viewBox="0 0 50 52" fill="none">
              <rect x="3" y="3" width="44" height="46" rx="6" stroke="#7cfc00" strokeWidth="1.8"/>
              <text x="25" y="32" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#7cfc00" fontFamily="monospace">$</text>
              <line x1="10" y1="42" x2="40" y2="42" stroke="#7cfc00" strokeWidth="1.2" strokeOpacity="0.5"/>
            </svg>
          </div>
          <div className="flex items-center gap-2 mb-1 relative">
            <DollarSign size={15} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Simulador de Ganhos</h3>
          </div>
          <p className="text-xs text-white/75 mb-4">Veja quanto você recebe em cada nível</p>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-white/80 flex-shrink-0">Valor do Extra</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-white/75">R$</span>
              <input
                type="number"
                min={10}
                max={10000}
                step={10}
                value={simValue}
                onChange={e => setSimValue(Math.max(10, Number(e.target.value)))}
                className="w-full bg-white/[0.06] border border-white/12 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            {simEarnings.map(lv => {
              const lc = LEVEL_COLORS[lv.key];
              const isCur = lv.key === level;
              return (
                <div key={lv.key}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${isCur ? `${lc.bg} ${lc.border} ${lv.glow}` : "bg-white/[0.07] border-white/12"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <LevelBadgeIcon level={lv.key} size="sm" />
                    <span className={`text-sm font-semibold ${isCur ? lc.text : "text-white/80"}`}>{lv.label}</span>
                    {isCur && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${lc.bg} ${lc.text} border ${lc.border}`}>Você</span>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isCur ? "text-white" : "text-white/80"}`}>
                      R$ {lv.earnings.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-[9px] text-white/70">{100 - lv.feePercent}% retido</p>
                  </div>
                </div>
              );
            })}
          </div>

          {nextLevelData && (
            <div className="mt-3 rounded-xl bg-white/[0.08] border border-white/12 px-4 py-3">
              <p className="text-xs text-white/80 text-center">
                No nível <span className={`font-bold ${LEVEL_COLORS[nextLevelData.key].text}`}>{nextLevelData.label}</span>, você ganharia{" "}
                <span className="font-bold text-white">
                  R$ {(simValue * (1 - nextLevelData.feePercent / 100)).toFixed(2).replace(".", ",")}
                </span>{" "}
                — <span className="text-primary font-bold">
                  R$ {((simValue * (1 - nextLevelData.feePercent / 100)) - (simValue * (1 - (currentLevelData?.feePercent ?? 20) / 100))).toFixed(2).replace(".", ",")} a mais
                </span> por extra.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── SECTION: CONQUISTAS ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 px-2">Conquistas</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/8 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(8,17,26,0.92) 60%, rgba(34,197,94,0.06) 100%)",
            border: "1px solid rgba(250,204,21,0.16)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.5), rgba(34,197,94,0.25), transparent)" }} />
          <div className="absolute right-2 top-3 pointer-events-none select-none opacity-[0.045]">
            <svg width="44" height="50" viewBox="0 0 44 50" fill="none">
              <path d="M8 4h28v18a14 14 0 01-28 0V4z" stroke="#facc15" strokeWidth="1.8"/>
              <path d="M8 10H2a4 4 0 004 4h2M36 10h6a4 4 0 01-4 4h-2" stroke="#facc15" strokeWidth="1.6"/>
              <line x1="22" y1="36" x2="22" y2="44" stroke="#facc15" strokeWidth="1.6"/>
              <line x1="12" y1="44" x2="32" y2="44" stroke="#facc15" strokeWidth="2"/>
            </svg>
          </div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Conquistas</h3>
            </div>
            <span className="text-xs text-white/75">
              {ACHIEVEMENTS.filter(a => a.unlocked(completedJobs, reputationScore, isVerified)).length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map(a => {
              const unlocked = a.unlocked(completedJobs, reputationScore, isVerified);
              return (
                <div key={a.id}
                  className={`card-career-achievement p-3 flex flex-col gap-2 transition-all ${!unlocked ? "locked" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${unlocked ? `${a.color} bg-white/8` : "text-white/20 bg-white/[0.03]"}`}>
                    {unlocked ? a.icon : <Lock size={14} />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${unlocked ? "text-white/90" : "text-white/30"}`}>{a.label}</p>
                    <p className="text-[10px] text-white/65 mt-0.5 leading-tight">{a.desc}</p>
                  </div>
                  {unlocked && (
                    <div className="flex items-center gap-1">
                      <CheckCircle size={10} className="text-primary" />
                      <span className="text-[9px] text-primary font-semibold">Conquistado</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── IMPACTO DA REPUTAÇÃO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(250,204,21,0.08) 0%, rgba(8,17,26,0.92) 60%, rgba(124,252,0,0.04) 100%)",
            border: "1px solid rgba(250,204,21,0.16)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.5), rgba(124,252,0,0.2), transparent)" }} />
          <div className="absolute right-3 bottom-3 pointer-events-none select-none opacity-[0.04]">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M26 4l5.6 11.3L44 17.1l-9 8.8 2.1 12.3L26 32.4 14.9 38.2 17 25.9l-9-8.8 12.4-1.8z" stroke="#facc15" strokeWidth="2" fill="#facc15" fillOpacity="0.2"/>
            </svg>
          </div>
          <div className="flex items-center gap-2 mb-1 relative">
            <Star size={15} className="text-yellow-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Impacto da Reputação</h3>
          </div>
          <p className="text-xs text-white/75 mb-4">Como sua nota influencia a sua carreira na plataforma</p>
          <div className="space-y-2.5">
            {REPUTATION_IMPACTS.map((item, i) => (
              <div key={i} className="card-summary-career flex items-start gap-3 px-4 py-3.5 relative overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/90">{item.label}</p>
                  <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-white/20 flex-shrink-0 mt-2" />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-primary/[0.07] border border-primary/20 px-4 py-4 text-center">
            <p className="text-xs text-white/80 leading-relaxed">
              Cada extra que você conclui com qualidade<br />
              <span className="text-primary font-bold">constrói sua carreira dentro da extraGO.</span>
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/70 font-semibold">
              <span>↑ Reputação</span>
              <span className="text-white/15">•</span>
              <span>↑ Nível</span>
              <span className="text-white/15">•</span>
              <span>↓ Taxa</span>
              <span className="text-white/15">•</span>
              <span>↑ Ganhos</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
