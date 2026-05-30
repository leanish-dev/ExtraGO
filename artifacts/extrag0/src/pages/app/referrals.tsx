import React from "react";
import { useGetMyReferral, useGetReferralLeaderboard } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Trophy, Users, Copy, Share2, Star, Crown, TrendingUp, Gift,
  Zap, Lock, CheckCircle, Percent, Info, Smartphone, Link2,
  BarChart3, Target, Shield, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";
import referralsBanner from "@assets/file_00000000b14c720e9386ccbf24ee87f8_1779868067153.png";

const LEVEL_CONFIG = [
  {
    level: "bronze",
    label: "Iniciante",
    min: 0, max: 19,
    feePercent: 18,
    color: "text-sky-400",
    bg: "bg-sky-400/10 border-sky-400/20",
    glow: "",
    icon: "🔵",
    iconClass: "bg-sky-400/15 border border-sky-400/30 text-sky-400",
    requirements: [
      { label: "Nível padrão", met: true },
    ],
    perks: ["Acesso a vagas básicas", "Suporte padrão"],
  },
  {
    level: "silver",
    label: "Júnior",
    min: 20, max: 99,
    feePercent: 16,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    glow: "",
    icon: "⚡",
    iconClass: "bg-cyan-400/15 border border-cyan-400/30 text-cyan-400",
    requirements: [
      { label: "20 extras concluídos", met: false },
      { label: "Avaliação ≥ 4.5 ⭐", met: false },
    ],
    perks: ["Vagas premium desbloqueadas", "Destaque no perfil"],
  },
  {
    level: "gold",
    label: "Intermediário",
    min: 100, max: 299,
    feePercent: 14,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    glow: "",
    icon: "🥇",
    iconClass: "bg-yellow-400/15 border border-yellow-400/30 text-yellow-400",
    requirements: [
      { label: "100 extras concluídos", met: false },
      { label: "6 meses na plataforma", met: false },
      { label: "Avaliação ≥ 4.7 ⭐", met: false },
    ],
    perks: ["Vagas exclusivas", "Bônus automático por job"],
  },
  {
    level: "elite",
    label: "Sênior",
    min: 300, max: Infinity,
    feePercent: 10,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    glow: "shadow-[0_0_24px_rgba(124,252,0,0.12)]",
    icon: "👑",
    iconClass: "bg-primary/15 border border-primary/30 text-primary",
    requirements: [
      { label: "300 extras concluídos", met: false },
      { label: "12 meses na plataforma", met: false },
      { label: "Avaliação ≥ 4.8 ⭐", met: false },
      { label: "Frequência > 98%", met: false },
      { label: "Documentação verificada", met: false },
    ],
    perks: ["Todos os benefícios", "Acesso VIP + suporte prioritário"],
  },
];

const RANK_STYLES = [
  "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 shadow-[0_0_12px_rgba(250,204,21,0.18)]",
  "bg-slate-300/15 text-slate-300 border border-slate-300/25",
  "bg-orange-400/15 text-orange-400 border border-orange-400/25",
];

export default function ReferralsPage() {
  const { user } = useAuth();
  const { data: referral } = useGetMyReferral();
  const { data: leaderboard = [] } = useGetReferralLeaderboard();

  const code = user?.referralCode ?? "—";
  const referralLink = `${window.location.origin}/register?ref=${code}`;

  const copyCode = () => { navigator.clipboard.writeText(code); toast.success("Código copiado!"); };
  const copyLink = () => { navigator.clipboard.writeText(referralLink); toast.success("Link copiado!"); };
  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚀 Venha trabalhar na extraGO! Use meu código *${code}* e ganhe vantagens exclusivas.\n👉 ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

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
    { icon: <Zap size={15} />, value: referral?.totalConverted ?? 0, label: "Convertidos", color: "text-secondary", bg: "bg-secondary/8 border-secondary/15" },
    { icon: <BarChart3 size={15} />, value: `${conversionRate}%`, label: "Conversão", color: "text-yellow-400", bg: "bg-yellow-400/8 border-yellow-400/15" },
    { icon: <Gift size={15} />, value: `R$${(referral?.totalRewardEarned ?? 0).toFixed(0)}`, label: "Ganhos", color: "text-green-400", bg: "bg-green-400/8 border-green-400/15" },
  ];

  return (
    <div className="page-enter pb-20 lg:pb-6 relative">
      {/* Full-page background art */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/backgrounds/bg-referral-page.png)",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          opacity: 0.07,
          mixBlendMode: "screen",
          filter: "blur(1px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/65 via-transparent to-[#070a0d]/55 pointer-events-none" />

      {/* Banner header */}
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
          className="absolute inset-0 opacity-[0.30] bg-cover bg-center mix-blend-screen pointer-events-none"
          style={{ backgroundImage: "url(/images/backgrounds/bg-referral-page.png)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,10,13,0) 0%, rgba(7,10,13,0.25) 55%, rgba(7,10,13,0.92) 100%)" }}
        />
        <div className="absolute inset-0 flex items-end p-4 pb-5">
          <div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Sistema de Indicações</span>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-tight mt-0.5">
              Indique e ganhe <span className="text-primary">comissões</span> para sempre
            </h1>
          </div>
        </div>
      </motion.div>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.04 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className={`glass-card rounded-xl p-3.5 border text-center ${stat.bg}`}
            >
              <div className={`flex justify-center mb-1.5 ${stat.color}`}>{stat.icon}</div>
              <p className={`text-xl font-bold leading-none tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold uppercase tracking-wide leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Current level hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.19, 1, 0.22, 1] }}
          className={`glass-card rounded-2xl p-5 border relative overflow-hidden ${currentLevel.bg} ${currentLevel.glow}`}
        >
          <div
            className="absolute inset-0 opacity-[0.07] bg-cover bg-right mix-blend-screen pointer-events-none blur-[1px]"
            style={{ backgroundImage: "url(/images/backgrounds/bg-referral-page.png)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/4 via-transparent to-cyan-500/4 pointer-events-none" />
          <div className="absolute -right-4 -top-4 text-8xl opacity-[0.06] select-none pointer-events-none">{currentLevel.icon}</div>

          <div className="flex items-start gap-4 relative">
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-4xl flex-shrink-0 block mt-1"
            >{currentLevel.icon}</motion.span>
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
              <Progress value={progress} glow={currentLevel.level === "elite"} />
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
          className="glass-card rounded-2xl p-5 border border-white/6 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.05] bg-cover bg-left mix-blend-screen pointer-events-none"
            style={{ backgroundImage: "url(/images/backgrounds/bg-referral-page.png)" }}
          />
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
              3% por job concluído
            </motion.span>
          </div>

          <p className="text-xs text-muted-foreground mb-4 leading-relaxed relative">
            Cada indicado que concluir um extra gera{" "}
            <strong className="text-primary">3% da taxa de intermediação</strong> para você —
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
          <div className="grid grid-cols-3 gap-2 relative">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500/12 border border-green-500/22 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all"
            >
              <Smartphone size={13} /> WhatsApp
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={copyLink}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/18 transition-all"
            >
              <Link2 size={13} /> Link
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "extraGO — Convite", text: `Use meu código ${code}`, url: referralLink });
                } else {
                  copyLink();
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground text-xs font-bold hover:bg-white/8 transition-all"
            >
              <Share2 size={13} /> Mais
            </motion.button>
          </div>
        </motion.div>

        {/* Commission / career progression table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="glass-card rounded-2xl p-5 border border-white/6 relative overflow-hidden"
        >
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
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${currentLevel.iconClass}`}>
                {currentLevel.icon}
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
                      <span className="text-sm">{lvl.icon}</span>
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
          className="glass-card rounded-2xl p-5 border border-white/6"
        >
          <h2 className="font-bold mb-4 flex items-center gap-2 text-sm">
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
                    <span className="text-2xl flex-shrink-0">{lvl.icon}</span>
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
            className="glass-card rounded-2xl p-5 border border-white/6"
          >
            <div className="flex items-center justify-between mb-4">
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
                      <span className="text-[10px] text-primary font-bold">+3% comissão</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="glass-card rounded-2xl p-5 border border-white/6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold flex items-center gap-2 text-sm">
                <Crown size={14} className="text-yellow-400" />
                Top Indicadores
              </h2>
              <span className="text-[10px] text-muted-foreground bg-white/4 border border-white/8 px-2 py-0.5 rounded-full font-semibold">
                Ranking mensal
              </span>
            </div>
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
          </motion.div>
        )}

        <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed px-2 pb-2">
          Comissões calculadas sobre a taxa de intermediação de cada extra concluído pelo indicado.
          O crédito é aplicado automaticamente na sua carteira.
        </p>
      </div>
    </div>
  );
}
