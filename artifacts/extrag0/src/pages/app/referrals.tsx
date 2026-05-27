import React from "react";
import { useGetMyReferral, useGetReferralLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Users, Copy, Share2, Star, Crown, TrendingUp, Gift, Zap, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import referralsBanner from "@assets/file_00000000b14c720e9386ccbf24ee87f8_1779868067153.png";

const LEVEL_CONFIG = [
  {
    level: "bronze", label: "Bronze", min: 0, max: 4,
    color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20",
    glow: "", icon: "🥉",
    perks: ["Acesso a vagas básicas", "Suporte padrão"],
  },
  {
    level: "silver", label: "Prata", min: 5, max: 14,
    color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/20",
    glow: "", icon: "🥈",
    perks: ["Vagas premium desbloqueadas", "Destaque no perfil"],
  },
  {
    level: "gold", label: "Ouro", min: 15, max: 29,
    color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20",
    glow: "", icon: "🥇",
    perks: ["Vagas exclusivas", "Bônus automático por job"],
  },
  {
    level: "elite", label: "Elite", min: 30, max: Infinity,
    color: "text-primary", bg: "bg-primary/10 border-primary/20",
    glow: "shadow-[0_0_24px_rgba(124,252,0,0.12)]", icon: "👑",
    perks: ["Todos os benefícios", "Acesso VIP + suporte prioritário"],
  },
];

export default function ReferralsPage() {
  const { user } = useAuth();
  const { data: referral } = useGetMyReferral();
  const { data: leaderboard = [] } = useGetReferralLeaderboard();

  const code = user?.referralCode ?? "—";
  const referralLink = `${window.location.origin}/register?ref=${code}`;

  const copyCode = () => { navigator.clipboard.writeText(code); toast.success("Código copiado!"); };
  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); };

  const currentLevel = LEVEL_CONFIG.find(l => l.level === (user?.level ?? "bronze")) ?? LEVEL_CONFIG[0];
  const nextLevel = LEVEL_CONFIG.find(l => l.min > currentLevel.min);
  const progress = nextLevel
    ? Math.min(100, ((user?.completedJobs ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100)
    : 100;

  const RANK_STYLES = [
    "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 shadow-[0_0_12px_rgba(250,204,21,0.18)]",
    "bg-slate-300/15 text-slate-300 border border-slate-300/25",
    "bg-orange-400/15 text-orange-400 border border-orange-400/25",
  ];

  return (
    <div className="page-enter pb-20 lg:pb-6">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full overflow-hidden"
        style={{ borderRadius: "0 0 20px 20px" }}
      >
        <img
          src={referralsBanner}
          alt="Indicações extraGO"
          className="w-full object-cover"
          style={{ maxHeight: 170, objectPosition: "center center" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,10,13,0) 0%, rgba(7,10,13,0.2) 60%, rgba(7,10,13,0.88) 100%)" }}
        />
      </motion.div>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">

        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Indicações & Gamificação</h1>
          <p className="text-sm text-muted-foreground mt-1">Indique amigos e suba de nível na plataforma</p>
        </motion.div>

        {/* Current level hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className={`glass-card rounded-2xl p-6 border relative overflow-hidden ${currentLevel.bg} ${currentLevel.glow}`}
        >
          <div className="absolute -right-4 -top-4 text-8xl opacity-8 select-none pointer-events-none">{currentLevel.icon}</div>

          <div className="flex items-start gap-4 relative">
            <div className="flex-shrink-0">
              <motion.span
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl block"
              >
                {currentLevel.icon}
              </motion.span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Seu nível atual</p>
              <p className={`text-2xl font-bold ${currentLevel.color} leading-tight`}>{currentLevel.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{user?.completedJobs ?? 0} jobs concluídos</p>
              <div className="flex gap-2 mt-2.5 flex-wrap">
                {currentLevel.perks.map((perk, i) => (
                  <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${currentLevel.bg} ${currentLevel.color}`}>
                    <CheckCircle size={9} /> {perk}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Reputação</p>
              <p className="text-2xl font-bold leading-none">{(user?.reputationScore ?? 0).toFixed(1)}</p>
              <div className="flex justify-end gap-0.5 mt-1.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={11} className={i <= Math.round(user?.reputationScore ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-white/12"} />
                ))}
              </div>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-5 pt-5 border-t border-white/8 relative">
              <div className="flex justify-between text-xs text-muted-foreground mb-2.5">
                <span className={`font-bold ${currentLevel.color}`}>{currentLevel.label}</span>
                <span className="font-medium">
                  {nextLevel.label} em {Math.max(0, nextLevel.min - (user?.completedJobs ?? 0))} jobs
                </span>
              </div>
              <Progress value={progress} glow={currentLevel.level === "elite"} />
              <p className="text-[10px] text-muted-foreground mt-2">
                {Math.round(progress)}% concluído para {nextLevel.label}
              </p>
            </div>
          )}
        </motion.div>

        {/* Referral code card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-white/6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/4 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between relative">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Share2 size={15} className="text-secondary" />
              Seu Código de Indicação
            </h2>
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full"
            >
              🎁 Ganhe bônus!
            </motion.span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed relative">
            Compartilhe seu código e ganhe bônus quando seus indicados completarem o primeiro job!
          </p>

          <div className="flex gap-3 relative">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex-1 px-5 py-4 rounded-xl bg-primary/8 border border-primary/22 text-center cursor-pointer select-all"
              onClick={copyCode}
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary font-mono tracking-[0.25em]">{code}</p>
              <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest font-bold">Toque para copiar</p>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
              className="w-14 rounded-xl border border-white/8 hover:border-primary/38 hover:bg-primary/8 flex items-center justify-center text-muted-foreground hover:text-primary transition-all flex-shrink-0"
            >
              <Copy size={18} />
            </motion.button>
          </div>

          <div className="relative">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">Link de indicação:</p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/3 border border-white/7 text-xs text-muted-foreground truncate font-mono">
                {referralLink}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  className="bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan border-none font-bold rounded-xl px-4 h-full flex-shrink-0"
                  onClick={copyLink}
                >
                  Copiar
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 relative">
            {[
              { icon: <Users size={15} />, value: referral?.totalInvited ?? 0, label: "Indicações", color: "text-primary", bg: "bg-primary/8 border-primary/14" },
              { icon: <TrendingUp size={15} />, value: referral?.totalConverted ?? 0, label: "Convertidos", color: "text-secondary", bg: "bg-secondary/8 border-secondary/14" },
              { icon: <Gift size={15} />, value: `R$${((referral?.totalRewardEarned ?? 0) / 100).toFixed(0)}`, label: "Bônus", color: "text-yellow-400", bg: "bg-yellow-400/8 border-yellow-400/14" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ y: -2, scale: 1.03 }}
                className={`text-center p-3.5 rounded-xl border transition-all ${stat.bg}`}
              >
                <div className={`flex justify-center mb-2 ${stat.color}`}>{stat.icon}</div>
                <p className={`text-xl font-bold ${stat.color} leading-none tabular-nums`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Level roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="glass-card rounded-2xl p-5 border border-white/6"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2 text-sm">
            <Trophy size={15} className="text-yellow-400" />
            Roadmap de Níveis
          </h2>
          <div className="space-y-2">
            {LEVEL_CONFIG.map((lvl, i) => {
              const isCurrent = lvl.level === (user?.level ?? "bronze");
              const isPast = LEVEL_CONFIG.indexOf(lvl) < LEVEL_CONFIG.findIndex(l => l.level === (user?.level ?? "bronze"));
              return (
                <motion.div
                  key={lvl.level}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.07 }}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                    isCurrent ? `${lvl.bg} ${lvl.glow}` :
                    isPast ? "border-white/8 bg-white/2 opacity-75" :
                    "border-white/5 opacity-40"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{lvl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${lvl.color}`}>{lvl.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {lvl.max === Infinity ? `${lvl.min}+ jobs` : `${lvl.min}–${lvl.max} jobs`}
                      {" · "}{lvl.perks[0]}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-primary bg-primary/12 px-2.5 py-1 rounded-full border border-primary/22 flex-shrink-0 animate-pulse">
                      Atual
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/18 flex-shrink-0">
                      ✓
                    </span>
                  )}
                  {!isCurrent && !isPast && (
                    <Lock size={12} className="text-muted-foreground/35 flex-shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-2xl p-5 border border-white/6"
          >
            <h2 className="font-bold mb-4 flex items-center gap-2 text-sm">
              <Crown size={15} className="text-yellow-400" />
              Top Indicadores do Mês
            </h2>
            <div className="space-y-1.5">
              {leaderboard.slice(0, 10).map((entry: any, i: number) => (
                <motion.div
                  key={entry.userId ?? i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${i < 3 ? "bg-white/3 border border-white/6" : "hover:bg-white/2"}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < 3 ? RANK_STYLES[i] : "bg-white/5 text-muted-foreground/45"}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/35 to-secondary/35 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-white/8">
                    {(entry.name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <p className="flex-1 text-sm font-medium truncate">{entry.name ?? "Usuário"}</p>
                  <span className={`text-sm font-bold flex-shrink-0 tabular-nums ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-primary"}`}>
                    {entry.totalConverted ?? 0} ind.
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
