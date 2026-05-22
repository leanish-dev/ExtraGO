import React from "react";
import { useGetMyReferral, useGetReferralLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Users, Copy, Share2, Star, Crown, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LEVEL_CONFIG = [
  { level: "bronze", label: "Bronze", min: 0, max: 4, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", icon: "🥉" },
  { level: "silver", label: "Prata", min: 5, max: 14, color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/20", icon: "🥈" },
  { level: "gold", label: "Ouro", min: 15, max: 29, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: "🥇" },
  { level: "elite", label: "Elite", min: 30, max: Infinity, color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: "👑" },
];

export default function ReferralsPage() {
  const { user } = useAuth();
  const { data: referral } = useGetMyReferral();
  const { data: leaderboard = [] } = useGetReferralLeaderboard();

  const code = user?.referralCode ?? "—";
  const referralLink = `${window.location.origin}/register?ref=${code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!");
  };

  const currentLevel = LEVEL_CONFIG.find(l => l.level === (user?.level ?? "bronze")) ?? LEVEL_CONFIG[0];
  const nextLevel = LEVEL_CONFIG.find(l => l.min > currentLevel.min);
  const progress = nextLevel
    ? Math.min(100, ((user?.completedJobs ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100)
    : 100;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Indicações & Gamificação</h1>
        <p className="text-muted-foreground mt-1">Indique amigos e suba de nível na plataforma</p>
      </div>

      {/* Current level */}
      <div className={`glass-card rounded-2xl p-6 border ${currentLevel.bg}`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{currentLevel.icon}</span>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Seu nível atual</p>
            <p className={`text-2xl font-bold ${currentLevel.color}`}>{currentLevel.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{user?.completedJobs ?? 0} jobs concluídos</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Reputação</p>
            <p className="text-2xl font-bold">{(user?.reputationScore ?? 0).toFixed(1)}</p>
            <div className="flex justify-end gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={12} className={i <= Math.round(user?.reputationScore ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
              ))}
            </div>
          </div>
        </div>

        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{currentLevel.label}</span>
              <span>{nextLevel.label} em {nextLevel.min - (user?.completedJobs ?? 0)} jobs</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Level roadmap */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          Roadmap de Níveis
        </h2>
        <div className="space-y-3">
          {LEVEL_CONFIG.map((lvl, i) => (
            <div key={lvl.level} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${lvl.level === (user?.level ?? "bronze") ? lvl.bg : "border-white/5 opacity-60"}`}>
              <span className="text-2xl">{lvl.icon}</span>
              <div className="flex-1">
                <p className={`font-semibold ${lvl.color}`}>{lvl.label}</p>
                <p className="text-xs text-muted-foreground">
                  {lvl.max === Infinity ? `${lvl.min}+ jobs` : `${lvl.min}–${lvl.max} jobs`}
                </p>
              </div>
              {lvl.level === (user?.level ?? "bronze") && (
                <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">Atual</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Referral code */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Share2 size={18} className="text-secondary" />
          Seu Código de Indicação
        </h2>
        <p className="text-sm text-muted-foreground">
          Compartilhe seu código e ganhe bônus quando seus indicados completarem o primeiro job!
        </p>

        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-center">
            <p className="text-2xl font-bold text-primary font-mono tracking-widest">{code}</p>
          </div>
          <Button size="icon" variant="outline" className="w-12 h-12 border-white/10 hover:border-primary/50" onClick={copyCode}>
            <Copy size={16} />
          </Button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Link de indicação:</p>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground truncate">
              {referralLink}
            </div>
            <Button size="sm" className="bg-secondary text-black hover:bg-secondary/90 font-semibold" onClick={copyLink}>
              Copiar Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-xl bg-white/3 border border-white/8">
            <p className="text-2xl font-bold text-primary">{referral?.totalInvited ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Indicações</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/3 border border-white/8">
            <p className="text-2xl font-bold text-secondary">{referral?.totalConverted ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Convertidos</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/3 border border-white/8">
            <p className="text-2xl font-bold text-yellow-400">R$ {((referral?.totalRewardEarned ?? 0) / 100).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Bônus</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Crown size={18} className="text-yellow-400" />
            Top Indicadores do Mês
          </h2>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry: any, i: number) => (
              <div key={entry.userId ?? i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0 ? "bg-yellow-400/20 text-yellow-400" :
                  i === 1 ? "bg-slate-300/20 text-slate-300" :
                  i === 2 ? "bg-orange-400/20 text-orange-400" :
                  "bg-white/5 text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
                <p className="flex-1 text-sm font-medium">{entry.name ?? "Usuário"}</p>
                <span className="text-sm font-semibold text-primary">{entry.totalConverted ?? 0} ind.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
