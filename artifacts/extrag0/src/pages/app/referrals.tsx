import React from "react";
import { useGetMyReferral, useGetReferralLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Users, Copy, Share2, Star, Crown, TrendingUp, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LEVEL_CONFIG = [
  { level: "bronze", label: "Bronze", min: 0, max: 4, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", glow: "", icon: "🥉" },
  { level: "silver", label: "Prata", min: 5, max: 14, color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/20", glow: "", icon: "🥈" },
  { level: "gold", label: "Ouro", min: 15, max: 29, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", glow: "", icon: "🥇" },
  { level: "elite", label: "Elite", min: 30, max: Infinity, color: "text-primary", bg: "bg-primary/10 border-primary/20", glow: "shadow-[0_0_15px_rgba(124,252,0,0.12)]", icon: "👑" },
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
    "bg-yellow-400/20 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]",
    "bg-slate-300/20 text-slate-300",
    "bg-orange-400/20 text-orange-400",
  ];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader title="Indicações & Gamificação" subtitle="Indique amigos e suba de nível na plataforma" />

      {/* Current level hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className={`glass-card rounded-2xl p-6 border ${currentLevel.bg} ${currentLevel.glow}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <span className="text-5xl">{currentLevel.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Seu nível atual</p>
            <p className={`text-2xl font-bold ${currentLevel.color} leading-tight`}>{currentLevel.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.completedJobs ?? 0} jobs concluídos</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-1">Reputação</p>
            <p className="text-2xl font-bold leading-none">{(user?.reputationScore ?? 0).toFixed(1)}</p>
            <div className="flex justify-end gap-0.5 mt-1.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={11} className={i <= Math.round(user?.reputationScore ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-white/15"} />
              ))}
            </div>
          </div>
        </div>

        {nextLevel && (
          <div className="mt-5 pt-5 border-t border-white/8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{currentLevel.label}</span>
              <span className="font-medium">{nextLevel.label} em {Math.max(0, nextLevel.min - (user?.completedJobs ?? 0))} jobs</span>
            </div>
            <Progress value={progress} glow={currentLevel.level === "elite"} />
          </div>
        )}
      </motion.div>

      {/* Level roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="glass-card rounded-2xl p-5"
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
          <Trophy size={16} className="text-yellow-400" />
          Roadmap de Níveis
        </h2>
        <div className="space-y-2">
          {LEVEL_CONFIG.map((lvl) => {
            const isCurrent = lvl.level === (user?.level ?? "bronze");
            return (
              <div
                key={lvl.level}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isCurrent ? `${lvl.bg}` : "border-white/5 opacity-50"}`}
              >
                <span className="text-xl flex-shrink-0">{lvl.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${lvl.color}`}>{lvl.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {lvl.max === Infinity ? `${lvl.min}+ jobs` : `${lvl.min}–${lvl.max} jobs`}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full border border-primary/25 flex-shrink-0">
                    Atual
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Referral hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="glass-card rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <Share2 size={16} className="text-secondary" />
            Seu Código de Indicação
          </h2>
          <span className="text-[10px] font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-full">
            Ganhe bônus!
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Compartilhe seu código e ganhe bônus quando seus indicados completarem o primeiro job!
        </p>

        <div className="flex gap-3">
          <div className="flex-1 px-5 py-4 rounded-xl bg-primary/10 border border-primary/25 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary font-mono tracking-[0.2em]">{code}</p>
          </div>
          <button
            onClick={copyCode}
            className="w-14 h-14 rounded-xl border border-white/10 hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all flex-shrink-0"
          >
            <Copy size={18} />
          </button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">Link de indicação:</p>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/4 border border-white/8 text-xs text-muted-foreground truncate">
              {referralLink}
            </div>
            <Button
              size="sm"
              className="bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan border-none font-bold rounded-xl px-4 flex-shrink-0"
              onClick={copyLink}
            >
              Copiar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Users size={14} />, value: referral?.totalInvited ?? 0, label: "Indicações", color: "text-primary" },
            { icon: <TrendingUp size={14} />, value: referral?.totalConverted ?? 0, label: "Convertidos", color: "text-secondary" },
            { icon: <Gift size={14} />, value: `R$${((referral?.totalRewardEarned ?? 0) / 100).toFixed(0)}`, label: "Bônus", color: "text-yellow-400" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-white/3 border border-white/6">
              <div className={`flex justify-center mb-1.5 ${stat.color} opacity-70`}>{stat.icon}</div>
              <p className={`text-xl font-bold ${stat.color} leading-none`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm">
            <Crown size={16} className="text-yellow-400" />
            Top Indicadores do Mês
          </h2>
          <div className="space-y-1.5">
            {leaderboard.slice(0, 10).map((entry: any, i: number) => (
              <div
                key={entry.userId ?? i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${i < 3 ? "bg-white/3 border border-white/6" : "hover:bg-white/3"}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < 3 ? RANK_STYLES[i] : "bg-white/5 text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {(entry.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-sm font-medium truncate">{entry.name ?? "Usuário"}</p>
                <span className="text-sm font-bold text-primary flex-shrink-0">{entry.totalConverted ?? 0} ind.</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
