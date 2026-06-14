import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LevelBadgeIcon, LEVEL_LABELS, LEVEL_COLORS } from "@/components/level-badge";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Star, CheckCircle, Lock, TrendingUp, Zap, Target, Shield,
  Search, Users, MessageSquare, Award, ChevronRight,
  DollarSign, BarChart3, Trophy, Sparkles,
} from "lucide-react";

/* ─── Level config (mirrors referrals.tsx) ─── */
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
  {
    id: "first_extra",
    label: "Primeiro Extra",
    desc: "Concluiu o primeiro extra",
    icon: <Zap size={18} />,
    unlocked: (j) => j >= 1,
    color: "text-sky-400",
  },
  {
    id: "10_extras",
    label: "10 Extras",
    desc: "10 extras concluídos",
    icon: <Trophy size={18} />,
    unlocked: (j) => j >= 10,
    color: "text-cyan-400",
  },
  {
    id: "50_extras",
    label: "50 Extras",
    desc: "50 extras concluídos",
    icon: <Award size={18} />,
    unlocked: (j) => j >= 50,
    color: "text-teal-400",
  },
  {
    id: "100_extras",
    label: "100 Extras",
    desc: "100 extras concluídos",
    icon: <BarChart3 size={18} />,
    unlocked: (j) => j >= 100,
    color: "text-primary",
  },
  {
    id: "star5",
    label: "Avaliação 5★",
    desc: "Conquistou nota máxima",
    icon: <Star size={18} />,
    unlocked: (_, s) => s >= 4.9,
    color: "text-yellow-400",
  },
  {
    id: "verified",
    label: "Profissional Verificado",
    desc: "Documentação validada",
    icon: <Shield size={18} />,
    unlocked: (_, __, v) => v,
    color: "text-green-400",
  },
  {
    id: "top_region",
    label: "Top da Região",
    desc: "Entre os melhores da sua área",
    icon: <Target size={18} />,
    unlocked: (j, s) => j >= 50 && s >= 4.7,
    color: "text-orange-400",
  },
  {
    id: "elite_national",
    label: "Elite Nacional",
    desc: "Nível Elite alcançado",
    icon: <Sparkles size={18} />,
    unlocked: (j, s) => j >= 600 && s >= 4.9,
    color: "text-amber-300",
  },
];

/* ─── Reputation impact items ─── */
const REPUTATION_IMPACTS = [
  { icon: <BarChart3 size={16} />, label: "Ranking", desc: "Quanto mais alta sua reputação, mais alto você aparece nos rankings da plataforma." },
  { icon: <Search size={16} />, label: "Busca", desc: "Profissionais bem avaliados têm prioridade nos resultados de busca das empresas." },
  { icon: <MessageSquare size={16} />, label: "Convites", desc: "Empresas convidam diretamente profissionais com boa reputação para seus extras." },
  { icon: <Users size={16} />, label: "Contratações", desc: "Uma avaliação sólida aumenta drasticamente a taxa de conversão de candidaturas." },
  { icon: <TrendingUp size={16} />, label: "Progressão", desc: "A nota mínima de estrelas é requisito obrigatório para subir de nível." },
];

/* ─── Helper: reputation ring ─── */
function ReputationRingSmall({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (score / 5) * 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="hsl(88,100%,49%)" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
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

export default function CareerPage() {
  const { user } = useAuth();
  const [simValue, setSimValue] = useState(200);

  const level = (user?.level as string) ?? "bronze";
  const levelIdx = LEVEL_INDEX[level] ?? 0;
  const currentLevelData = LEVELS[levelIdx];
  const nextLevelData = levelIdx < LEVELS.length - 1 ? LEVELS[levelIdx + 1] : null;

  const completedJobs = (user as any)?.completedJobs ?? 0;
  const reputationScore = (user as any)?.reputationScore ?? 0;
  const isVerified = (user as any)?.isVerified ?? false;
  const name = user?.name ?? "Profissional";

  const keepPercent = 100 - (currentLevelData?.feePercent ?? 20);

  /* Progress to next level */
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

  /* Simulator */
  const simEarnings = LEVELS.map(lv => ({
    ...lv,
    earnings: simValue * (1 - lv.feePercent / 100),
  }));

  const colors = currentLevelData ? LEVEL_COLORS[level] ?? LEVEL_COLORS.bronze : LEVEL_COLORS.bronze;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Minha Carreira" />

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative glass-card rounded-2xl border overflow-hidden ${colors.border} ${currentLevelData?.glow ?? ""}`}
        >
          {/* Ambient radial glow matching level color */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(124,252,0,0.06) 0%, transparent 65%)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-24 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(124,252,0,0.09) 0%, transparent 70%)", filter: "blur(20px)" }} />

          <div className="relative p-6">
            {/* Badge centered as hero focal point */}
            <div className="flex flex-col items-center text-center mb-5">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.12, duration: 0.6, type: "spring", stiffness: 150 }}
                className="relative mb-3"
              >
                {/* Pulsing ring behind badge */}
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.1, 0.35] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute inset-0 rounded-full border-2 ${colors.border}`}
                  style={{ margin: "-8px" }}
                />
                <LevelBadgeIcon level={level} size="xl" />
              </motion.div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Nível Atual</p>
              <p className={`text-3xl font-black tracking-wide leading-tight ${colors.text}`}>
                {currentLevelData?.label ?? "Iniciante"}
              </p>
              <p className="text-sm text-white/55 mt-1 font-medium">{name}</p>

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

            {/* Stats strip — reputation + extras + rating inline */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/6">
              <div className="text-center">
                <ReputationRingSmall score={reputationScore} size={52} />
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-1">Reputação</p>
              </div>
              <div className="w-px h-14 bg-white/8" />
              <div className="text-center">
                <p className={`text-2xl font-black ${colors.text}`}>{completedJobs}</p>
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">Extras feitos</p>
              </div>
              <div className="w-px h-14 bg-white/8" />
              <div className="text-center">
                <p className="text-2xl font-black text-yellow-400">{reputationScore.toFixed(1)}</p>
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">Avaliação</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TIMELINE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="glass-card rounded-2xl border border-white/8 p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Jornada de Carreira</h3>
          </div>

          <div className="relative">
            {/* Vertical spine */}
            <div className="absolute left-[19px] top-5 bottom-5 w-px bg-white/8" />

            <div className="space-y-0">
              {LEVELS.map((lv, idx) => {
                const isDone = idx < levelIdx;
                const isCurrent = idx === levelIdx;
                const isLocked = idx > levelIdx;
                const lc = LEVEL_COLORS[lv.key] ?? LEVEL_COLORS.bronze;

                return (
                  <div key={lv.key} className="relative flex items-start gap-4 pb-5 last:pb-0">
                    {/* Node */}
                    <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                      ${isDone ? `${lc.bg} ${lc.border}` : ""}
                      ${isCurrent ? `${lc.bg} ${lc.border} ${lv.glow}` : ""}
                      ${isLocked ? "bg-white/[0.03] border-white/12" : ""}
                    `}>
                      {isDone && <CheckCircle size={18} className={lc.text} />}
                      {isCurrent && <LevelBadgeIcon level={lv.key} size="md" />}
                      {isLocked && <Lock size={14} className="text-white/25" />}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 min-w-0 pt-1.5 ${isLocked ? "opacity-45" : ""}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isCurrent ? lc.text : isDone ? lc.text : "text-white/40"}`}>
                            {lv.label}
                          </span>
                          {isCurrent && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${lc.bg} ${lc.text} border ${lc.border}`}>
                              Atual
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ${isCurrent ? lc.text : isDone ? "text-white/50" : "text-white/25"}`}>
                          Taxa {lv.feePercent}%
                        </span>
                      </div>

                      {/* Requirements */}
                      {idx > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="text-[10px] text-white/35">
                            {lv.minJobs}+ extras • {lv.minStars}★
                          </span>
                        </div>
                      )}

                      {/* Current level progress bar */}
                      {isCurrent && nextLevelData && (
                        <div className="mt-2.5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-white/40">Progresso para {nextLevelData.label}</span>
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
            className="glass-card rounded-2xl border border-white/8 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={15} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Próximo Objetivo</h3>
            </div>

            <div className={`rounded-xl border p-4 ${LEVEL_COLORS[nextLevelData.key].bg} ${LEVEL_COLORS[nextLevelData.key].border}`}>
              <div className="flex items-center gap-3 mb-3">
                <LevelBadgeIcon level={nextLevelData.key} size="lg" />
                <div>
                  <p className={`text-base font-black ${LEVEL_COLORS[nextLevelData.key].text}`}>{nextLevelData.label}</p>
                  <p className="text-xs text-white/50">Nova taxa: <span className="font-bold text-white/80">{nextLevelData.feePercent}%</span></p>
                </div>
              </div>

              <p className="text-xs text-white/50 mb-3 font-medium uppercase tracking-widest">O que falta</p>

              <div className="space-y-2.5">
                {/* Jobs */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/65 flex items-center gap-1.5">
                      <Zap size={11} />
                      {nextLevelData.minJobs} extras concluídos
                    </span>
                    <span className={`text-xs font-bold ${jobsLeft === 0 ? "text-primary" : "text-white/60"}`}>
                      {jobsLeft === 0 ? "✓ Concluído" : `Faltam ${jobsLeft}`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, (completedJobs / nextLevelData.minJobs) * 100)} className="h-1.5" />
                </div>

                {/* Stars */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/65 flex items-center gap-1.5">
                      <Star size={11} />
                      Avaliação ≥ {nextLevelData.minStars}★
                    </span>
                    <span className={`text-xs font-bold ${starsLeft <= 0 ? "text-primary" : "text-white/60"}`}>
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
          className="glass-card rounded-2xl border border-white/8 p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={15} className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Simulador de Ganhos</h3>
          </div>
          <p className="text-xs text-white/40 mb-4">Veja quanto você recebe em cada nível</p>

          {/* Input */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-white/50 flex-shrink-0">Valor do Extra</span>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-white/40">R$</span>
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

          {/* Results */}
          <div className="space-y-2">
            {simEarnings.map(lv => {
              const lc = LEVEL_COLORS[lv.key];
              const isCur = lv.key === level;
              return (
                <div
                  key={lv.key}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all
                    ${isCur ? `${lc.bg} ${lc.border} ${lv.glow}` : "bg-white/[0.03] border-white/8"}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <LevelBadgeIcon level={lv.key} size="sm" />
                    <span className={`text-sm font-semibold ${isCur ? lc.text : "text-white/60"}`}>{lv.label}</span>
                    {isCur && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${lc.bg} ${lc.text} border ${lc.border}`}>Você</span>}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isCur ? "text-white" : "text-white/55"}`}>
                      R$ {lv.earnings.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-[9px] text-white/30">{100 - lv.feePercent}% retido</p>
                  </div>
                </div>
              );
            })}
          </div>

          {nextLevelData && (
            <div className="mt-3 rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3">
              <p className="text-xs text-white/50 text-center">
                No nível <span className={`font-bold ${LEVEL_COLORS[nextLevelData.key].text}`}>{nextLevelData.label}</span>, você ganharia{" "}
                <span className="font-bold text-white">
                  R$ {(simValue * (1 - nextLevelData.feePercent / 100)).toFixed(2).replace(".", ",")}
                </span>{" "}
                — <span className="text-primary font-bold">R$ {((simValue * (1 - nextLevelData.feePercent / 100)) - (simValue * (1 - (currentLevelData?.feePercent ?? 20) / 100))).toFixed(2).replace(".", ",")} a mais</span> por extra.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── CONQUISTAS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
          className="glass-card rounded-2xl border border-white/8 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Conquistas</h3>
            </div>
            <span className="text-xs text-white/40">
              {ACHIEVEMENTS.filter(a => a.unlocked(completedJobs, reputationScore, isVerified)).length}/{ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ACHIEVEMENTS.map(a => {
              const unlocked = a.unlocked(completedJobs, reputationScore, isVerified);
              return (
                <div
                  key={a.id}
                  className={`rounded-xl border p-3 flex flex-col gap-2 transition-all
                    ${unlocked ? "bg-white/[0.05] border-white/12" : "bg-white/[0.02] border-white/6 opacity-40"}
                  `}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${unlocked ? `${a.color} bg-white/8` : "text-white/20 bg-white/[0.03]"}`}>
                    {unlocked ? a.icon : <Lock size={14} />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${unlocked ? "text-white/90" : "text-white/30"}`}>{a.label}</p>
                    <p className="text-[10px] text-white/35 mt-0.5 leading-tight">{a.desc}</p>
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
          className="glass-card rounded-2xl border border-white/8 p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Star size={15} className="text-yellow-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Impacto da Reputação</h3>
          </div>
          <p className="text-xs text-white/40 mb-4">Como sua nota influencia a sua carreira na plataforma</p>

          <div className="space-y-3">
            {REPUTATION_IMPACTS.map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/90">{item.label}</p>
                  <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-white/20 flex-shrink-0 mt-2" />
              </div>
            ))}
          </div>

          {/* Motivational footer */}
          <div className="mt-4 rounded-xl bg-primary/[0.07] border border-primary/20 px-4 py-4 text-center">
            <p className="text-xs text-white/60 leading-relaxed">
              Cada extra que você conclui com qualidade<br />
              <span className="text-primary font-bold">constrói sua carreira dentro da extraGO.</span>
            </p>
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-white/35 font-semibold">
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
