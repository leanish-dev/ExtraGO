import React from "react";
import { useGetMyReferral, useGetReferralLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { LevelBadgeIcon, ReferralBadge, ReferralBadgeIcon } from "@/components/level-badge";
import {
  Trophy, Users, Copy, Share2, Star, Crown, TrendingUp, Gift,
  Zap, Lock, CheckCircle, Percent, Info, Smartphone, Link2,
  BarChart3, Target, Shield, ChevronRight, Send,
  Calendar, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ReferralSimulator } from "@/components/referral-simulator";

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

function buildLevelConfig(completedJobs: number, reputationScore: number, isVerified: boolean) {
  return [
    {
      level: "bronze",
      label: "Iniciante",
      min: 0, max: 19,
      feePercent: 20,
      color: "text-sky-400",
      bg: "bg-sky-400/10 border-sky-400/20",
      glow: "",
      icon: "🔵",
      iconClass: "bg-sky-400/15 border border-sky-400/30 text-sky-400",
      requirements: [
        { label: "Nível de entrada — sem requisitos", met: true },
      ],
      perks: ["Acesso a extras básicos", "Suporte padrão"],
    },
    {
      level: "silver",
      label: "Júnior",
      min: 20, max: 99,
      feePercent: 18,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10 border-cyan-400/20",
      glow: "",
      icon: "⚡",
      iconClass: "bg-cyan-400/15 border border-cyan-400/30 text-cyan-400",
      requirements: [
        { label: "20 extras concluídos", met: completedJobs >= 20 },
        { label: "Avaliação ≥ 4.5 ⭐", met: reputationScore >= 4.5 },
      ],
      perks: ["Extras premium desbloqueados", "Destaque no perfil"],
    },
    {
      level: "gold",
      label: "Intermediário",
      min: 100, max: 299,
      feePercent: 15,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/20",
      glow: "",
      icon: "🥇",
      iconClass: "bg-yellow-400/15 border border-yellow-400/30 text-yellow-400",
      requirements: [
        { label: "100 extras concluídos", met: completedJobs >= 100 },
        { label: "Avaliação ≥ 4.7 ⭐", met: reputationScore >= 4.7 },
        { label: "Documentação verificada", met: isVerified },
      ],
      perks: ["Extras exclusivos", "Bônus automático por extra"],
    },
    {
      level: "elite",
      label: "Sênior",
      min: 300, max: 599,
      feePercent: 12,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      glow: "shadow-[0_0_24px_rgba(124,252,0,0.12)]",
      icon: "👑",
      iconClass: "bg-primary/15 border border-primary/30 text-primary",
      requirements: [
        { label: "300 extras concluídos", met: completedJobs >= 300 },
        { label: "Avaliação ≥ 4.8 ⭐", met: reputationScore >= 4.8 },
        { label: "Documentação verificada", met: isVerified },
      ],
      perks: ["Benefícios premium da plataforma", "Suporte prioritário"],
    },
    {
      level: "diamond",
      label: "Elite",
      min: 600, max: Infinity,
      feePercent: 10,
      color: "text-amber-300",
      bg: "bg-amber-300/10 border-amber-300/20",
      glow: "shadow-[0_0_24px_rgba(252,211,77,0.15)]",
      icon: "💎",
      iconClass: "bg-amber-300/15 border border-amber-300/30 text-amber-300",
      requirements: [
        { label: "600 extras concluídos", met: completedJobs >= 600 },
        { label: "Avaliação ≥ 4.9 ⭐", met: reputationScore >= 4.9 },
        { label: "Documentação verificada", met: isVerified },
      ],
      perks: ["Todos os benefícios", "Acesso VIP + suporte dedicado"],
    },
  ];
}

const RANK_STYLES = [
  "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 shadow-[0_0_12px_rgba(250,204,21,0.18)]",
  "bg-slate-300/15 text-slate-300 border border-slate-300/25",
  "bg-orange-400/15 text-orange-400 border border-orange-400/25",
];


export default function ReferralsPage() {
  const { user } = useAuth();
  const { data: referral, isLoading: referralLoading } = useGetMyReferral();
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useGetReferralLeaderboard();
  const isLoading = referralLoading || leaderboardLoading;

  const code = user?.referralCode ?? "—";
  const referralLink = `${window.location.origin}/register?ref=${code}`;

  const copyCode = () => { navigator.clipboard.writeText(code); toast.success("Código copiado!"); };
  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); };
  const shareText = encodeURIComponent(`🚀 Venha trabalhar na extraGO! Use meu código *${code}* e ganhe vantagens exclusivas.\n👉 ${referralLink}`);
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${shareText}`, "_blank");
  const shareTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`🚀 Venha trabalhar na extraGO! Use meu código ${code} e ganhe vantagens exclusivas.`)}`, "_blank");
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
  const shareInstagram = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado! Abra o Instagram e cole nos Stories ou Bio.");
  };

  const monthlyEarnings = (referral?.totalRewardEarned ?? 0) / Math.max(1, 3);
  const projectedAnnual = (referral?.totalRewardEarned ?? 0) * 4;
  const activeReferrals = referral?.activeReferrals ?? referral?.totalConverted ?? 0;
  const inactiveReferrals = Math.max(0, (referral?.totalInvited ?? 0) - activeReferrals);
  const networkExtras = referral?.networkExtras ?? 0;
  const referralRate = referral?.commissionRate ?? 0.02;
  const referralPct = Math.round(referralRate * 100);
  const REFERRAL_TIERS = [
    { key: "indicador", label: "Indicador", rate: 2, emoji: "🌱", reqs: "Disponível para todos os indicadores" },
    { key: "agente", label: "Agente de Captação", rate: 3, emoji: "⚡", reqs: "25+ indicados ativos e 100+ extras na rede" },
    { key: "embaixador", label: "Embaixador Regional", rate: 5, emoji: "👑", reqs: "100+ ativos, 1000+ extras na rede e aprovação" },
  ];
  const currentReferralTierIdx = referralPct >= 5 ? 2 : referralPct >= 3 ? 1 : 0;

  const LEVEL_CONFIG = buildLevelConfig(user?.completedJobs ?? 0, user?.reputationScore ?? 0, user?.isVerified ?? false);
  const currentLevel = LEVEL_CONFIG.find(l => l.level === (user?.level ?? "bronze")) ?? LEVEL_CONFIG[0];
  const currentIdx = LEVEL_CONFIG.findIndex(l => l.level === (user?.level ?? "bronze"));
  const nextLevel = LEVEL_CONFIG[currentIdx + 1];
  const progress = nextLevel
    ? Math.min(100, ((user?.completedJobs ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100)
    : 100;

  const conversionRate = (referral?.totalInvited ?? 0) > 0
    ? Math.round(((referral?.totalConverted ?? 0) / (referral?.totalInvited ?? 1)) * 100)
    : 0;

  const STATS = [
    { icon: <Users size={15} />, value: referral?.totalInvited ?? 0, label: "Indicações", color: "text-primary", bg: "bg-primary/8 border-primary/15" },
    { icon: <Zap size={15} />, value: activeReferrals, label: "Ativos", color: "text-secondary", bg: "bg-secondary/8 border-secondary/15" },
    { icon: <BarChart3 size={15} />, value: `${conversionRate}%`, label: "Conversão", color: "text-yellow-400", bg: "bg-yellow-400/8 border-yellow-400/15" },
    { icon: <Gift size={15} />, value: `R$${(referral?.totalRewardEarned ?? 0).toFixed(0)}`, label: "Ganhos Totais", color: "text-green-400", bg: "bg-green-400/8 border-green-400/15" },
    { icon: <Calendar size={15} />, value: `R$${monthlyEarnings.toFixed(0)}`, label: "Ganhos/Mês", color: "text-cyan-400", bg: "bg-cyan-400/8 border-cyan-400/15" },
    { icon: <TrendingUp size={15} />, value: `R$${projectedAnnual.toFixed(0)}`, label: "Proj. Anual", color: "text-purple-400", bg: "bg-purple-400/8 border-purple-400/15" },
    { icon: <Zap size={15} />, value: referral?.totalConverted ?? 0, label: "Convertidos", color: "text-orange-400", bg: "bg-orange-400/8 border-orange-400/15" },
    { icon: <Users size={15} />, value: inactiveReferrals, label: "Inativos", color: "text-muted-foreground", bg: "bg-white/5 border-white/8" },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4 pb-20 lg:pb-6">
        <div className="h-32 skeleton rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
        <div className="h-48 skeleton rounded-2xl" />
        <div className="h-40 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-enter pb-20 lg:pb-6 relative">
      {/* Full-page background art */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/backgrounds/bg-referral-page.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: 0.07,
          mixBlendMode: "screen",
          filter: "blur(1px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/65 via-transparent to-[#070a0d]/55 pointer-events-none" />

      {/* Referrals Module Hero Banner */}
      <div className="module-hero module-hero-referrals">
        <div className="absolute right-0 top-0 bottom-0 flex items-end gap-3 pr-8 pb-4 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <Gift size={90} style={{ color: "#f59e0b" }} />
          <TrendingUp size={72} style={{ color: "#ef4444" }} />
          <Trophy size={60} style={{ color: "#f59e0b" }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mod-icon-referral">
              <Gift size={11} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#f59e0b" }}>Rede de Expansão</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Indicações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Expanda sua rede. <span style={{ color: "#f59e0b" }} className="font-semibold">Cresça junto.</span></p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">

        {/* Compact stats strip — replaces the 8-card grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.04 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Indicações", value: referral?.totalInvited ?? 0, color: "text-primary", sub: `${activeReferrals} ativos`, border: "border-primary/35", bg: "rgba(124,252,0,0.18)" },
            { label: "Conversão", value: `${conversionRate}%`, color: "text-secondary", sub: `${referral?.totalConverted ?? 0} convertidos`, border: "border-secondary/35", bg: "rgba(0,229,255,0.16)" },
            { label: "Ganhos Totais", value: `R$${(referral?.totalRewardEarned ?? 0).toFixed(0)}`, color: "text-yellow-400", sub: `~R$${monthlyEarnings.toFixed(0)}/mês`, border: "border-yellow-400/35", bg: "rgba(245,158,11,0.18)" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.05 }}
              className={`card-referral-stat border ${item.border} p-4 text-center`}
              style={{ background: item.bg }}
            >
              <p className={`text-2xl font-black leading-none tabular-nums ${item.color}`}>{item.value}</p>
              <p className="text-[11px] font-bold text-foreground mt-1.5">{item.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Referral Tier Journey */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="rounded-2xl border border-amber-500/35 p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.22) 0%, rgba(8,17,26,0.90) 55%, rgba(239,68,68,0.08) 100%)" }}
        >
          {/* Referral network tree SVG watermark */}
          <div className="absolute right-3 bottom-2 pointer-events-none select-none opacity-[0.09]">
            <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
              <circle cx="45" cy="14" r="6" stroke="#f59e0b" strokeWidth="1.5"/>
              <circle cx="18" cy="50" r="5" stroke="#f59e0b" strokeWidth="1.2"/>
              <circle cx="45" cy="50" r="5" stroke="#f59e0b" strokeWidth="1.2"/>
              <circle cx="72" cy="50" r="5" stroke="#f59e0b" strokeWidth="1.2"/>
              <circle cx="8" cy="74" r="3.5" stroke="#f59e0b" strokeWidth="1"/>
              <circle cx="28" cy="74" r="3.5" stroke="#f59e0b" strokeWidth="1"/>
              <circle cx="62" cy="74" r="3.5" stroke="#f59e0b" strokeWidth="1"/>
              <circle cx="82" cy="74" r="3.5" stroke="#f59e0b" strokeWidth="1"/>
              <line x1="45" y1="20" x2="18" y2="45" stroke="#f59e0b" strokeWidth="1" opacity="0.7"/>
              <line x1="45" y1="20" x2="45" y2="45" stroke="#f59e0b" strokeWidth="1" opacity="0.7"/>
              <line x1="45" y1="20" x2="72" y2="45" stroke="#f59e0b" strokeWidth="1" opacity="0.7"/>
              <line x1="18" y1="55" x2="8" y2="70" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5"/>
              <line x1="18" y1="55" x2="28" y2="70" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5"/>
              <line x1="72" y1="55" x2="62" y2="70" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5"/>
              <line x1="72" y1="55" x2="82" y2="70" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5"/>
            </svg>
          </div>
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.45), transparent)" }} />
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4">Progressão na Rede</p>
          <div className="flex items-stretch gap-0 relative">
            {/* connector line */}
            <div className="absolute top-7 left-[calc(16.67%+1px)] right-[calc(16.67%+1px)] h-px bg-white/10 z-0" />
            {REFERRAL_TIERS.map((tier, i) => {
              const isActive = i === currentReferralTierIdx;
              const isPast = i < currentReferralTierIdx;
              const tierKey = tier.key === "indicador" ? "indicador" : tier.key === "agente" ? "agente_captacao" : "embaixador_regional";
              return (
                <div key={tier.key} className="flex-1 flex flex-col items-center text-center relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all border ${
                    isActive ? "border-primary/40 bg-primary/10 shadow-[0_0_20px_rgba(124,252,0,0.25)]" :
                    isPast ? "border-green-400/25 bg-green-400/8" :
                    "border-white/8 bg-white/3 opacity-40"
                  }`}>
                    <ReferralBadgeIcon tier={tierKey} size="lg" />
                  </div>
                  <p className={`text-xs font-bold leading-tight ${isActive ? "text-primary" : isPast ? "text-green-400" : "text-muted-foreground/50"}`}>
                    {tier.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 font-bold ${isActive ? "text-primary/70" : isPast ? "text-green-400/70" : "text-muted-foreground/30"}`}>
                    {tier.rate}% retorno
                  </p>
                  {isActive && (
                    <span className="text-[8px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full mt-1">Atual</span>
                  )}
                  {isPast && (
                    <span className="text-[8px] font-bold text-green-400 bg-green-400/8 border border-green-400/15 px-1.5 py-0.5 rounded-full mt-1">Conquistado</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
            <strong className="text-foreground">{REFERRAL_TIERS[currentReferralTierIdx].reqs}</strong>
          </p>
        </motion.div>

        {/* Current level hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.19, 1, 0.22, 1] }}
          className={`glass-card rounded-2xl p-5 border relative overflow-hidden ${currentLevel.bg} ${currentLevel.glow}`}
        >
          <div
            className="absolute inset-0 opacity-[0.10] bg-cover bg-right mix-blend-screen pointer-events-none blur-[1px]"
            style={{ backgroundImage: "url(/images/backgrounds/bg-referral-page.webp)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/5 pointer-events-none" />
          {/* Referral badge watermark */}
          <div className="absolute right-4 -bottom-2 pointer-events-none select-none"
            style={{
              width: 110, height: 110,
              backgroundImage: "url(/badges/indicacoes-badges.png)",
              backgroundSize: "300% auto",
              backgroundPosition: "100% center",
              backgroundRepeat: "no-repeat",
              opacity: 0.22,
              mixBlendMode: "screen",
            }}
          />
          <div className="flex items-start gap-4 relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex-shrink-0 mt-1"
            ><LevelBadgeIcon level={currentLevel.level} size="lg" /></motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">Seu nível atual</p>
              <p className={`text-2xl font-bold ${currentLevel.color} leading-tight`}>{currentLevel.label}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{user?.completedJobs ?? 0} extras concluídos</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentLevel.bg} ${currentLevel.color}`}>
                  Taxa {currentLevel.feePercent}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {currentLevel.perks.map((perk, i) => (
                  <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${currentLevel.bg} ${currentLevel.color}`}>
                    <CheckCircle size={9} /> {perk}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-1">Avaliação</p>
              <p className="text-2xl font-bold leading-none">{(user?.reputationScore ?? 0).toFixed(1)}</p>
              <div className="flex justify-end gap-0.5 mt-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={10} className={i <= Math.round(user?.reputationScore ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-white/12"} />
                ))}
              </div>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-4 pt-4 border-t border-white/8 relative">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span className={`font-bold ${currentLevel.color}`}>{currentLevel.label}</span>
                <span className="font-medium text-white/70">
                  {Math.max(0, nextLevel.min - (user?.completedJobs ?? 0))} extras para {nextLevel.label}
                </span>
              </div>
              <Progress value={progress} glow={currentLevel.level === "diamond"} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-muted-foreground">{Math.round(progress)}% completo</p>
                <p className={`text-[10px] font-bold ${nextLevel.color}`}>
                  {nextLevel.label} → {nextLevel.feePercent}% taxa
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Share card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-5 border border-primary/35 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.20) 0%, rgba(8,17,26,0.92) 50%, rgba(0,229,255,0.08) 100%)" }}
        >
          {/* Top stripe */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.45), rgba(0,229,255,0.22), transparent)" }} />
          {/* Social share node SVG — bottom right */}
          <div className="absolute right-3 bottom-3 pointer-events-none select-none opacity-[0.09]">
            <svg width="80" height="70" viewBox="0 0 80 70" fill="none">
              <circle cx="40" cy="10" r="7" stroke="#7cfc00" strokeWidth="1.5"/>
              <circle cx="12" cy="55" r="6" stroke="#7cfc00" strokeWidth="1.2"/>
              <circle cx="68" cy="55" r="6" stroke="#00e5ff" strokeWidth="1.2"/>
              <line x1="40" y1="17" x2="14" y2="49" stroke="#7cfc00" strokeWidth="1" opacity="0.7"/>
              <line x1="40" y1="17" x2="66" y2="49" stroke="#00e5ff" strokeWidth="1" opacity="0.7"/>
              <line x1="18" y1="55" x2="62" y2="55" stroke="#7cfc00" strokeWidth="0.8" opacity="0.35"/>
              <circle cx="40" cy="35" r="3" fill="#7cfc00" opacity="0.25"/>
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-secondary/4 pointer-events-none" />

          <div className="flex items-center justify-between mb-3 relative">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Share2 size={14} className="text-secondary" />
              Seu Código de Indicação
            </h2>
            <motion.span
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full"
            >
              {referralPct}% por extra concluído
            </motion.span>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed relative">
            Cada indicado que concluir um extra gera{" "}
            <strong className="text-primary">{referralPct}% da taxa de intermediação</strong> para você —
            de forma recorrente, enquanto ele estiver ativo na plataforma.
          </p>

          {/* Code display */}
          <div className="flex gap-2 mb-3 relative">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex-1 px-4 py-3.5 rounded-xl bg-primary/8 border border-primary/22 text-center cursor-pointer select-all"
              onClick={copyCode}
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary font-mono tracking-[0.25em]">{code}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-widest font-bold">Toque para copiar</p>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
              className="w-12 rounded-xl border border-white/8 hover:border-primary/38 hover:bg-primary/8 flex items-center justify-center text-muted-foreground hover:text-primary transition-all flex-shrink-0"
            >
              <Copy size={16} />
            </motion.button>
          </div>

          {/* Link row */}
          <div className="flex gap-2 mb-4 relative">
            <div className="flex-1 px-3 py-2.5 rounded-xl bg-white/3 border border-white/7 text-[11px] text-muted-foreground truncate font-mono">
              {referralLink}
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="sm"
                className="bg-secondary text-black hover:bg-secondary/90 border-none font-bold rounded-xl px-3 h-full flex-shrink-0"
                onClick={copyLink}
              >
                <Copy size={12} className="mr-1" /> Copiar
              </Button>
            </motion.div>
          </div>

          {/* Share buttons */}
          <div className="space-y-2 relative">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Compartilhar via</p>
            <div className="grid grid-cols-5 gap-2">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareWhatsApp}
                title="WhatsApp"
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-green-500/12 border border-green-500/22 text-green-400 text-[10px] font-bold hover:bg-green-500/22 transition-all"
              >
                <Smartphone size={16} />
                <span className="hidden sm:block">WhatsApp</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareTelegram}
                title="Telegram"
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-sky-500/12 border border-sky-500/22 text-sky-400 text-[10px] font-bold hover:bg-sky-500/22 transition-all"
              >
                <Send size={16} />
                <span className="hidden sm:block">Telegram</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareFacebook}
                title="Facebook"
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-blue-600/12 border border-blue-600/22 text-blue-400 text-[10px] font-bold hover:bg-blue-600/22 transition-all"
              >
                <FacebookIcon />
                <span className="hidden sm:block">Facebook</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={shareInstagram}
                title="Instagram"
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-pink-500/12 border border-pink-500/22 text-pink-400 text-[10px] font-bold hover:bg-pink-500/22 transition-all"
              >
                <InstagramIcon />
                <span className="hidden sm:block">Instagram</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                title="Copiar link"
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold hover:bg-primary/18 transition-all"
              >
                <Link2 size={16} />
                <span className="hidden sm:block">Copiar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Commission / career progression table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,252,0,0.18) 0%, rgba(8,17,26,0.92) 60%, rgba(0,229,255,0.06) 100%)",
            border: "1px solid rgba(124,252,0,0.32)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.4), rgba(0,229,255,0.2), transparent)" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-secondary/3 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold flex items-center gap-2 text-sm">
                <Percent size={14} className="text-primary" />
                Progressão de Carreira
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Suba de nível para reduzir a taxa da plataforma e aumentar seus ganhos líquidos por extra.
            </p>

            {/* Current rate highlight */}
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border mb-4 ${currentLevel.bg} ${currentLevel.glow}`}>
              <div className="flex-shrink-0">
                <LevelBadgeIcon level={currentLevel.level} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">Sua taxa atual — {currentLevel.label}</p>
                <p className={`text-xl font-bold leading-tight ${currentLevel.color}`}>
                  {currentLevel.feePercent}% de comissão
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted-foreground mb-0.5">Você recebe</p>
                <p className={`text-2xl font-bold leading-none ${currentLevel.color}`}>
                  {100 - currentLevel.feePercent}%
                </p>
              </div>
            </div>

            {/* Level table */}
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <div className="grid grid-cols-4 gap-0 bg-white/4 border-b border-white/6">
                <div className="px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Nível</div>
                <div className="px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center">Extras</div>
                <div className="px-2 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center">Taxa</div>
                <div className="px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right">Recebe</div>
              </div>
              {LEVEL_CONFIG.map((lvl, i) => {
                const isCurrent = lvl.level === (user?.level ?? "bronze");
                return (
                  <motion.div
                    key={lvl.level}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className={`grid grid-cols-4 gap-0 border-b last:border-b-0 border-white/5 transition-all ${isCurrent ? lvl.bg : "hover:bg-white/2"}`}
                  >
                    <div className="px-3 py-3 flex items-center gap-1.5">
                      <LevelBadgeIcon level={lvl.level} size="xs" />
                      <div>
                        <span className={`text-xs font-bold block leading-tight ${isCurrent ? lvl.color : "text-muted-foreground/70"}`}>{lvl.label}</span>
                        {isCurrent && <span className={`text-[8px] font-bold ${lvl.color}`}>Atual</span>}
                      </div>
                    </div>
                    <div className={`px-2 py-3 text-[10px] text-center flex items-center justify-center ${isCurrent ? lvl.color : "text-muted-foreground/50"}`}>
                      {lvl.max === Infinity ? `${lvl.min}+` : `${lvl.min}–${lvl.max}`}
                    </div>
                    <div className="px-2 py-3 text-center flex items-center justify-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isCurrent ? `${lvl.bg} ${lvl.color} border border-current/25` : "text-muted-foreground/50 bg-white/3 border border-white/6"
                      }`}>
                        {lvl.feePercent}%
                      </span>
                    </div>
                    <div className={`px-3 py-3 text-right flex items-center justify-end ${isCurrent ? lvl.color : "text-muted-foreground/50"}`}>
                      <span className={`text-sm font-bold ${isCurrent ? "" : "opacity-50"}`}>{100 - lvl.feePercent}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground/50 mt-3 flex items-start gap-1.5 leading-relaxed">
              <Info size={10} className="flex-shrink-0 mt-0.5" />
              A comissão é descontada automaticamente do pagamento por extra. Quanto mais você trabalha, menor a taxa.
            </p>
          </div>
        </motion.div>

        {/* Level roadmap with requirements */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(250,204,21,0.045) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(250,204,21,0.11)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.35), rgba(124,252,0,0.15), transparent)" }} />
          <h2 className="font-bold mb-4 flex items-center gap-2 text-sm relative">
            <Trophy size={14} className="text-yellow-400" />
            Roadmap de Níveis
          </h2>
          <div className="space-y-2.5">
            {LEVEL_CONFIG.map((lvl, i) => {
              const isCurrent = lvl.level === (user?.level ?? "bronze");
              const isPast = i < currentIdx;
              return (
                <motion.div
                  key={lvl.level}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.07 }}
                  className={`rounded-xl border p-3.5 transition-all ${
                    isCurrent ? `${lvl.bg} ${lvl.glow}` :
                    isPast ? "border-green-400/15 bg-green-400/4 opacity-80" :
                    "border-white/5 opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <LevelBadgeIcon level={lvl.level} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${lvl.color}`}>{lvl.label}</p>
                        {isCurrent && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${lvl.bg} ${lvl.color} border border-current/20 animate-pulse`}>
                            Atual
                          </span>
                        )}
                        {isPast && (
                          <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full border border-green-400/18">
                            ✓ Concluído
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Taxa {lvl.feePercent}% · {lvl.perks[0]}
                      </p>
                    </div>
                    {!isCurrent && !isPast && <Lock size={12} className="text-muted-foreground/35 flex-shrink-0" />}
                    {isPast && <CheckCircle size={14} className="text-green-400 flex-shrink-0" />}
                  </div>

                  {/* Requirements */}
                  <div className="flex flex-wrap gap-1.5 pl-9">
                    {lvl.requirements.map((req, ri) => {
                      const met = isPast || (isCurrent && ri === 0);
                      return (
                        <span
                          key={ri}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            met
                              ? "bg-green-400/10 border-green-400/20 text-green-400"
                              : isCurrent
                              ? `${lvl.bg} ${lvl.color} border-current/20`
                              : "bg-white/3 border-white/7 text-muted-foreground/50"
                          }`}
                        >
                          {met ? <CheckCircle size={8} /> : <Target size={8} />}
                          {req.label}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Invitees list */}
        {(referral?.invitees?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.20) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(245,158,11,0.32)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), rgba(0,229,255,0.25), transparent)" }} />
            <div className="flex items-center justify-between mb-4 relative">
              <h2 className="font-bold flex items-center gap-2 text-sm">
                <Users size={14} className="text-secondary" />
                Minha Rede de Indicados
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                {referral?.totalInvited ?? 0} total
              </span>
            </div>
            <div className="space-y-2">
              {(referral?.invitees ?? []).map((inv: any, i: number) => (
                <motion.div
                  key={inv.id ?? i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    inv.status === "converted"
                      ? "bg-green-400/5 border-green-400/15"
                      : "bg-white/2 border-white/6 hover:bg-white/4"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/35 to-secondary/35 flex items-center justify-center text-sm font-bold border border-white/10 flex-shrink-0">
                    {(inv.name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{inv.name ?? "Indicado"}</p>
                    <p className="text-[11px] text-muted-foreground">{inv.completedJobs ?? 0} extras concluídos</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      inv.status === "converted"
                        ? "bg-green-400/10 border-green-400/22 text-green-400"
                        : "bg-yellow-400/10 border-yellow-400/22 text-yellow-400"
                    }`}>
                      {inv.status === "converted" ? "✓ Ativo" : "Em progresso"}
                    </span>
                    {inv.status === "converted" && (
                      <span className="text-[10px] text-primary font-bold">+{referralPct}% comissão</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Referral commission tiers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.20) 0%, rgba(8,17,26,0.92) 60%, rgba(124,252,0,0.06) 100%)", border: "1px solid rgba(245,158,11,0.32)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.58), rgba(124,252,0,0.28), transparent)" }} />
          <div className="flex items-center justify-between mb-1 relative">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Gift size={14} className="text-primary" />
              Níveis de Comissão por Indicação
            </h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
              Você: {referralPct}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Quanto maior sua rede de indicados ativos, maior a comissão recorrente sobre cada extra que eles concluem.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-secondary/35 bg-secondary/18 p-3 text-center">
              <p className="text-lg font-bold text-secondary">{activeReferrals}</p>
              <p className="text-[10px] text-muted-foreground">Indicados ativos</p>
            </div>
            <div className="rounded-xl border border-primary/35 bg-primary/18 p-3 text-center">
              <p className="text-lg font-bold text-primary">{networkExtras}</p>
              <p className="text-[10px] text-muted-foreground">Extras na sua rede</p>
            </div>
          </div>

          <div className="space-y-2">
            {REFERRAL_TIERS.map((t, i) => {
              const isCurrent = i === currentReferralTierIdx;
              return (
                <div
                  key={t.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isCurrent ? "bg-primary/8 border-primary/25" : "bg-white/2 border-white/6"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isCurrent ? "bg-primary/15 border border-primary/30" : "bg-white/4 border border-white/8"}`}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${isCurrent ? "text-primary" : "text-foreground/80"}`}>
                      {t.label}{isCurrent && <span className="text-[9px] font-bold text-primary ml-1">· Atual</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{t.reqs}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xl font-bold leading-none ${isCurrent ? "text-primary" : "text-muted-foreground/60"}`}>{t.rate}%</p>
                    <p className="text-[9px] text-muted-foreground">por extra</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-3 flex items-start gap-1.5 leading-relaxed">
            <Info size={10} className="flex-shrink-0 mt-0.5" />
            O nível Embaixador (5%) requer aprovação da equipe extraGO.
          </p>
        </motion.div>

        {/* Earnings Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.17 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.18) 0%, rgba(8,17,26,0.92) 60%, rgba(0,229,255,0.06) 100%)", border: "1px solid rgba(124,252,0,0.30)" }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,252,0,0.06) 0%, transparent 70%)", filter: "blur(30px)" }} />
          <h2 className="font-bold mb-4 flex items-center gap-2 text-sm">
            <DollarSign size={14} className="text-primary" />
            Simulador de Ganhos com Indicações
          </h2>

          <ReferralSimulator variant="app" showCta={true} />
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(245,158,11,0.30)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), rgba(124,252,0,0.12), transparent)" }} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <Crown size={14} className="text-yellow-400" />
              Top Indicadores
            </h2>
            <span className="text-[10px] text-muted-foreground bg-white/4 border border-white/8 px-2 py-0.5 rounded-full font-semibold">
              Ranking mensal
            </span>
          </div>
          {leaderboard.length === 0 ? (
            <EmptyState
              icon={<Trophy size={22} />}
              title="Ainda não há indicadores no ranking"
              description="Seja o primeiro! Indique amigos e profissionais usando seu código e apareça aqui."
              actionLabel="Copiar meu código"
              onAction={copyCode}
              className="py-8"
            />
          ) : (
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
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/35 to-secondary/35 flex items-center justify-center text-xs font-bold flex-shrink-0 border border-white/8">
                    {(entry.name ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <p className="flex-1 text-sm font-medium truncate">{entry.name ?? "Usuário"}</p>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-sm font-bold tabular-nums ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-primary"}`}>
                      {entry.totalConverted ?? 0}
                    </span>
                    <p className="text-[10px] text-muted-foreground">indicações</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed px-2 pb-2">
          Comissões calculadas sobre a taxa de intermediação de cada extra concluído pelo indicado.
          O crédito é aplicado automaticamente na sua carteira.
        </p>
      </div>
    </div>
  );
}
