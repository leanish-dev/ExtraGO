import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import logoMain from "@assets/Logo-no-text_1781338757912.png";
import painelCentroBgImg from "@assets/Painel-centro-bg_1781330517500.png";
import intermediacaoCardLandingImg from "@assets/Intermediação-card-landing_1781331775567.png";
import simplesComoDeveSerImg from "@assets/Simples-como-deve-ser-card_1781247644621.png";
import feitoParaOsDoisLadosImg from "@assets/Feito-para-os-dois-lados_1781247644430.png";
import presenteEmTodosOsSetoresImg from "@assets/Presente-em-todos_-os-setores_1781250617174.png";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";
import referralArt from "@assets/file_00000000f534720e8e4eab1278948eb7_1780142932397.png";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, Shield, Star, Users, CheckCircle, Briefcase, Award,
  TrendingUp, Sparkles, Globe, Clock, ChevronRight, Gift, Trophy,
  Home, Building2, UserCheck, Share2, BarChart3, MapPin, DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLivePlatformStats } from "@/hooks/use-live-platform-stats";
import { CountUp, ScrollSection } from "@/lib/institutional-components";
import { ReferralSimulator } from "@/components/referral-simulator";

/* ─────────── Typewriter word swap ─────────── */
const TYPEWRITER_WORDS = ["gastronomia", "hotelaria", "eventos"];

function TypewriterWord() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"show" | "hide">("show");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "show") {
      t = setTimeout(() => setPhase("hide"), 2200);
    } else {
      t = setTimeout(() => {
        setIdx(i => (i + 1) % TYPEWRITER_WORDS.length);
        setPhase("show");
      }, 380);
    }
    return () => clearTimeout(t);
  }, [phase, idx]);

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
          transition={{ duration: 0.36, ease: [0.19, 1, 0.22, 1] }}
          className="neon-text-gradient inline-block"
        >
          {TYPEWRITER_WORDS[idx]}
        </motion.span>
      </AnimatePresence>
      <span className="typewriter-cursor" />
    </span>
  );
}



const HOW_IT_WORKS = [
  { step: "01", icon: <Users size={24} />, title: "Crie sua conta", desc: "Cadastre-se como empresa ou freelancer em menos de 2 minutos.", color: "text-primary", bg: "bg-primary/10 border-primary/20", glow: "hover:shadow-[0_0_30px_rgba(124,252,0,0.12)]" },
  { step: "02", icon: <Briefcase size={24} />, title: "Publique ou candidate-se", desc: "Empresas publicam extras com detalhes. Freelancers se candidatam com um clique.", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20", glow: "hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]" },
  { step: "03", icon: <CheckCircle size={24} />, title: "Trabalhe e receba", desc: "Conclua o extra e receba seu pagamento via PIX direto na carteira.", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", glow: "hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]" },
];

const FEATURES_COMPANY = [
  "Profissionais verificados em menos de 24h",
  "Pagamento seguro pela plataforma",
  "Histórico e relatórios de contratações",
];

const FEATURES_FREELANCER = [
  "Extras exclusivos em gastronomia e eventos",
  "Pagamento garantido via PIX",
  "Sistema de níveis e indicações com bônus",
];


export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 400], [0, -50]);
  const bannerOpacity = useTransform(scrollY, [0, 280], [1, 0.65]);
  const { user } = useAuth();

  const { data: platformStats, isLoading: statsLoading } = useLivePlatformStats();

  const STATS_ROW1 = [
    {
      value: statsLoading ? undefined : (platformStats?.totalFreelancers ?? 0),
      fallback: 0,
      suffix: "+",
      label: "Profissionais Ativos",
      icon: <Users size={20} />,
      color: "text-primary",
    },
    {
      value: statsLoading ? undefined : (platformStats?.totalCompanies ?? 0),
      fallback: 0,
      suffix: "+",
      label: "Empresas Parceiras",
      icon: <Briefcase size={20} />,
      color: "text-secondary",
    },
    {
      value: statsLoading ? undefined : (platformStats?.completedJobs ?? 0),
      fallback: 0,
      suffix: "+",
      label: "Extras Concluídos",
      icon: <CheckCircle size={20} />,
      color: "text-green-400",
    },
  ];

  const STATS_ROW2 = [
    {
      value: statsLoading ? undefined : (platformStats?.activeUsers24h ?? 0),
      fallback: 0,
      suffix: "",
      label: "Usuários Ativos Hoje",
      icon: <UserCheck size={20} />,
      color: "text-yellow-400",
    },
    {
      value: statsLoading ? undefined : (platformStats?.activeJobs ?? 0),
      fallback: 0,
      suffix: "",
      label: "Extras Ativos",
      icon: <Share2 size={20} />,
      color: "text-purple-400",
    },
    {
      value: statsLoading ? undefined : (platformStats?.jobsToday ?? 0),
      fallback: 0,
      suffix: "",
      label: "Extras Hoje",
      icon: <MapPin size={20} />,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* ── Landing page background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/landing-page-bg-darkblue.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* ── Unified navbar ── */}
      <InstitutionalNavbar />

      <main className="flex-1 relative z-10">

        {/* ══════════════════════════════════════════
            HERO — Landing-hero2 image
        ══════════════════════════════════════════ */}
        <section ref={heroRef} className="relative flex flex-col items-center justify-center overflow-hidden">
          {/* Hero image — full-width, no parallax distortion */}
          <motion.div
            style={{ opacity: bannerOpacity }}
            className="w-full relative z-0"
          >
            <img
              src="/landing-hero2.webp"
              alt="extraGO — O ecossistema que conecta talentos, empresas e oportunidades em todo o Brasil"
              className="w-full block"
              style={{
                objectFit: "cover",
                objectPosition: "center top",
                maxHeight: "clamp(340px, 60vw, 680px)",
                width: "100%",
              }}
              draggable={false}
            />
            {/* bottom fade so CTAs blend naturally into the page */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{ height: "38%", background: "linear-gradient(to bottom, transparent, rgba(2,6,23,0.82))" }}
            />
          </motion.div>

          {/* CTA — single waitlist conversion */}
          <div className="w-full relative z-10 px-5 pt-5 pb-2 sm:pt-6 sm:pb-2">

            {/* ── Authenticated return-to-app strip — shown only when logged in ── */}
            <AnimatePresence>
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                  className="flex items-center justify-center mb-4"
                >
                  <Link href={user.role === "admin" ? "/admin" : "/app/dashboard"}>
                    <motion.div
                      whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(124,252,0,0.35), 0 4px 20px rgba(0,0,0,0.40)" }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, rgba(124,252,0,0.10) 0%, rgba(0,229,255,0.07) 100%)",
                        border: "1px solid rgba(124,252,0,0.30)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "100px",
                        paddingLeft: "clamp(14px,3vw,22px)",
                        paddingRight: "clamp(10px,2vw,16px)",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        gap: "clamp(8px,1.5vw,12px)",
                        boxShadow: "0 0 16px rgba(124,252,0,0.18), 0 2px 12px rgba(0,0,0,0.35)",
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-black text-black text-xs flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #7CFC00, #00e5ff)" }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p style={{ fontSize: "clamp(11px,2vw,13px)", fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                          Olá, {user.name?.split(" ")[0]} — bem-vindo de volta!
                        </p>
                        <p style={{ fontSize: "clamp(9px,1.5vw,11px)", color: "rgba(124,252,0,0.75)", fontWeight: 600, marginTop: 1 }}>
                          Continuar para o {user.role === "admin" ? "Painel Admin" : "Dashboard"} →
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
                        style={{ background: "rgba(124,252,0,0.15)", border: "1px solid rgba(124,252,0,0.28)" }}
                      >
                        <ArrowRight size={13} style={{ color: "#7CFC00" }} />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center justify-center"
            >
              <motion.a
                href="https://chat.whatsapp.com/LYrqZthU0Ce1c5PnG6O7zS?s=cl&p=a&mlu=1"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04, boxShadow: "0 0 36px rgba(124,252,0,0.55), 0 4px 20px rgba(0,0,0,0.40)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center rounded-full font-black text-black border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7CFC00, #00e5ff)",
                  boxShadow: "0 0 24px rgba(124,252,0,0.40), 0 3px 16px rgba(0,0,0,0.35)",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  paddingLeft: "clamp(16px, 3.5vw, 26px)",
                  paddingRight: "clamp(16px, 3.5vw, 26px)",
                  height: "clamp(38px, 5.5vw, 44px)",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                  gap: "clamp(7px, 1.2vw, 10px)",
                }}
              >
                {/* WhatsApp official icon */}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(0,0,0,0.85)" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                ENTRAR NA FILA DE ESPERA
                <ArrowRight size={13} style={{ opacity: 0.7 }} />
              </motion.a>
            </motion.div>

            {/* ── Benefits ticker — animated marquee ── */}
            <style>{`
              @keyframes benefits-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              .btr { animation: benefits-ticker 22s linear infinite; }
              .btr:hover { animation-play-state: paused; }
              @keyframes dash-flow { from { stroke-dashoffset: 12; } to { stroke-dashoffset: 0; } }
              @keyframes node-breath { 0%, 100% { opacity: 0.60; } 50% { opacity: 1; } }
              .dash-flow { animation: dash-flow 1.4s linear infinite; }
              .node-breath { animation: node-breath 2.6s ease-in-out infinite; }
            `}</style>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-4 max-w-5xl mx-auto overflow-hidden rounded-xl"
              style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="py-2.5 overflow-hidden">
                <div className="btr" style={{ display: "flex", width: "max-content" }}>
                  {[
                    { icon: <UserCheck size={13} />, label: "Profissionais Verificados" },
                    { icon: <Shield size={13} />,    label: "Pagamento Garantido"       },
                    { icon: <Star size={13} />,      label: "Reputação Profissional"    },
                    { icon: <TrendingUp size={13} />, label: "Sistema de Níveis"        },
                    { icon: <UserCheck size={13} />, label: "Profissionais Verificados" },
                    { icon: <Shield size={13} />,    label: "Pagamento Garantido"       },
                    { icon: <Star size={13} />,      label: "Reputação Profissional"    },
                    { icon: <TrendingUp size={13} />, label: "Sistema de Níveis"        },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 mx-5" style={{ flexShrink: 0 }}>
                      <span style={{ color: "#7CFC00", opacity: 0.80, lineHeight: 0 }}>{b.icon}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>{b.label}</span>
                      <span style={{ color: "rgba(255,255,255,0.18)", marginLeft: "6px", fontSize: "14px", lineHeight: "1" }}>·</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>

        </section>


        {/* ── Content bg art — from below hero to footer ── */}
        <div className="relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/images/backgrounds/bg-main.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
              opacity: 0.38,
              mixBlendMode: "screen",
            }}
          />

        {/* ══════════════════════════════════════════
            TRANSITION 1 — Infrastructure Bridge
            Hero → Painel em Tempo Real
        ══════════════════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ padding: "clamp(40px,7vw,88px) 0" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.012) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(124,252,0,0.035) 0%, transparent 68%)" }} />
          {/* Depth vignette — strong dark core for text legibility over network art */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(4,10,22,0.75) 0%, rgba(4,10,22,0.42) 55%, transparent 80%)" }} />
          <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: [0.19, 1, 0.22, 1] }}
              className="max-w-xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 mb-4" style={{ color: "rgba(0,229,255,0.48)", fontSize: "10px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                <div style={{ width: "28px", height: "1px", background: "rgba(0,229,255,0.30)" }} />
                Infraestrutura Nacional
                <div style={{ width: "28px", height: "1px", background: "rgba(0,229,255,0.30)" }} />
              </div>
              <h2 style={{ fontSize: "clamp(22px,3.4vw,40px)", fontWeight: 900, lineHeight: 1.18, marginBottom: "16px", color: "#fff", textShadow: "0 2px 28px rgba(0,0,0,0.85)" }}>
                A infraestrutura que conecta<br />
                <span style={{ background: "linear-gradient(90deg,#7CFC00,#00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>empresas e profissionais</span><br />
                em escala nacional.
              </h2>
              <p style={{ fontSize: "14px", lineHeight: 1.78, maxWidth: "460px", color: "rgba(255,255,255,0.88)", textShadow: "0 1px 22px rgba(0,0,0,0.85)", margin: "0 auto" }}>
                Uma rede de dados, reputação e operações que cresce com cada novo usuário — conectando o Brasil de Norte a Sul em tempo real.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            PAINEL EM TEMPO REAL — image-integrated
        ══════════════════════════════════════════ */}
        <section className="px-5 pb-8">
          <ScrollSection>
            <div className="max-w-5xl mx-auto">
              {/* Panel — image IS the frame */}
              <div className="relative overflow-hidden rounded-2xl"
                style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.70), 0 0 60px rgba(0,100,255,0.08)" }}
              >
                {/* Full-bleed background image — Brazil map on right half */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url(/painel-centro-bg.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center right",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                {/* Desktop: left-to-right gradient — opaque where KPIs are, transparent where map is */}
                <div className="absolute inset-0 hidden sm:block" style={{
                  background: "linear-gradient(100deg, rgba(3,8,18,0.97) 0%, rgba(3,8,18,0.92) 32%, rgba(3,8,18,0.72) 48%, rgba(3,8,18,0.25) 62%, rgba(3,8,18,0.06) 78%, transparent 94%)",
                }} />
                {/* Mobile: uniform dark overlay — full readability over the image */}
                <div className="absolute inset-0 sm:hidden" style={{ background: "rgba(3,8,18,0.78)" }} />

                {/* Brand glows — left zone */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: "radial-gradient(ellipse 55% 70% at 4% 50%, rgba(22,163,74,0.13) 0%, transparent 60%), radial-gradient(ellipse 35% 55% at 28% 90%, rgba(124,252,0,0.07) 0%, transparent 65%)",
                }} />

                {/* Subtle HUD grid — fades to right before map */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: "linear-gradient(rgba(0,229,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.018) 1px,transparent 1px)",
                  backgroundSize: "44px 44px",
                  WebkitMaskImage: "linear-gradient(90deg, black 0%, black 38%, rgba(0,0,0,0.3) 52%, transparent 66%)",
                  maskImage: "linear-gradient(90deg, black 0%, black 38%, rgba(0,0,0,0.3) 52%, transparent 66%)",
                }} />

                {/* Top neon accent line */}
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.55), rgba(124,252,0,0.35) 40%, rgba(0,229,255,0.12) 65%, transparent 85%)" }} />

                {/* CONTENT — left half on desktop, full width on mobile */}
                <div className="relative px-5 sm:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 sm:w-[52%]">
                  {/* Header row with Live indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[9px] font-black tracking-[0.20em] uppercase" style={{ color: "rgba(0,201,167,0.80)" }}>Painel em Tempo Real</p>
                      <div className="h-px w-16 mt-0.5" style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.60), transparent)" }} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="live-dot" />
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(0,229,255,0.85)" }}>Ao vivo</span>
                    </div>
                  </div>

                  {/* Row 1 — three primary KPIs */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-2.5">
                    {STATS_ROW1.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                        className="text-center group"
                      >
                        <div className={`flex items-center justify-center mb-1.5 ${stat.color} opacity-55 group-hover:opacity-100 transition-opacity`} style={{ transform: "scale(0.82)" }}>
                          {stat.icon}
                        </div>
                        <p className={`text-xl sm:text-[26px] font-black ${stat.color} leading-none tabular-nums`}>
                          {statsLoading ? (
                            <span className="inline-block w-10 h-6 rounded skeleton" />
                          ) : (
                            <CountUp target={stat.value ?? stat.fallback} suffix={stat.suffix} />
                          )}
                        </p>
                        <p className="text-[9px] sm:text-[10px] mt-1 font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.52)" }}>{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px mb-2.5" style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.22), rgba(124,252,0,0.16), transparent)" }} />

                  {/* Row 2 — secondary KPIs */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-3">
                    {STATS_ROW2.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.22 + i * 0.08, duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
                        className="text-center group"
                      >
                        <div className={`flex items-center justify-center mb-1.5 ${stat.color} opacity-55 group-hover:opacity-100 transition-opacity`} style={{ transform: "scale(0.82)" }}>
                          {stat.icon}
                        </div>
                        <p className={`text-xl sm:text-[26px] font-black ${stat.color} leading-none tabular-nums`}>
                          {statsLoading ? (
                            <span className="inline-block w-10 h-6 rounded skeleton" />
                          ) : (
                            <CountUp target={stat.value ?? stat.fallback} suffix={stat.suffix} />
                          )}
                        </p>
                        <p className="text-[9px] sm:text-[10px] mt-1 font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.52)" }}>{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer — Sistema Online */}
                  <div className="pt-2.5 border-t" style={{ borderColor: "rgba(0,229,255,0.12)" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#7CFC00", boxShadow: "0 0 6px #7CFC00" }} />
                      <span className="text-[9px] font-bold tracking-wide" style={{ color: "rgba(124,252,0,0.90)" }}>Sistema Online</span>
                      <span className="hidden sm:inline text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>·</span>
                      <span className="hidden sm:inline text-[9px]" style={{ color: "rgba(255,255,255,0.44)" }}>Brasil conectado em tempo real.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollSection>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section id="como-funciona" className="py-0">
          <ScrollSection>
            <img
              src={simplesComoDeveSerImg}
              alt="Simples como deve ser — Do cadastro ao pagamento, tudo em uma só plataforma"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </ScrollSection>
        </section>

        {/* ══════════════════════════════════════════
            FOR WHOM
        ══════════════════════════════════════════ */}
        <section id="para-quem" className="py-0">
          <ScrollSection>
            <img
              src={feitoParaOsDoisLadosImg}
              alt="Feito para os dois lados — Para Empresas e Para Profissionais"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </ScrollSection>
        </section>

        {/* ══════════════════════════════════════════
            MODELO DE RECEITA
        ══════════════════════════════════════════ */}
        <section className="py-0">
          <ScrollSection>
            <Link href="/arquitetura-financeira">
              <img
                src={intermediacaoCardLandingImg}
                alt="Modelo de Receita — Intermediação por Performance: do Iniciante 20% ao Elite 10%"
                className="w-full h-auto block"
                style={{ display: "block", objectFit: "contain", width: "100%", cursor: "pointer" }}
                draggable={false}
              />
            </Link>
          </ScrollSection>
        </section>

        {/* ══════════════════════════════════════════
            TRANSITION 2 — Network Effect Bridge
            Simples como deve ser → Sistema de Indicações
        ══════════════════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ padding: "clamp(28px,4.5vw,56px) 20px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 50%, rgba(124,252,0,0.028) 0%, transparent 65%)" }} />
          {/* Depth scrim — atmospheric layer for text legibility */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 80% at 50% 50%, rgba(4,10,22,0.65) 0%, rgba(4,10,22,0.32) 55%, transparent 82%)" }} />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="inline-flex items-center gap-2 mb-5" style={{ color: "rgba(124,252,0,0.45)", fontSize: "10px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                <div style={{ width: "32px", height: "1px", background: "rgba(124,252,0,0.28)" }} />
                Efeito de Rede
                <div style={{ width: "32px", height: "1px", background: "rgba(124,252,0,0.28)" }} />
              </div>
              <h2 style={{ fontSize: "clamp(20px,3vw,36px)", fontWeight: 900, lineHeight: 1.2, color: "#fff", marginBottom: "18px", textShadow: "0 2px 24px rgba(0,0,0,0.80)" }}>
                Cada nova conexão fortalece<br />
                <span style={{ background: "linear-gradient(90deg,#7CFC00,#00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>todo o ecossistema.</span>
              </h2>
            </motion.div>
            {/* Flow visual — horizontal expansion lines */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="flex items-center justify-center gap-0 mt-4 flex-wrap"
            >
              {[
                { label: "Profissional", color: "#7CFC00" },
                { label: "Indica", isConnector: true },
                { label: "Nova Rede", color: "#00e5ff" },
                { label: "Gera Receita", isConnector: true },
                { label: "Ecossistema", color: "#a855f7" },
              ].map((node, i) =>
                node.isConnector ? (
                  <div key={i} className="flex items-center" style={{ margin: "0 8px" }}>
                    <svg width="40" height="12" viewBox="0 0 40 12" fill="none">
                      <path d="M 0,6 L 32,6" stroke="rgba(0,229,255,0.32)" strokeWidth="1" strokeDasharray="3 2" className="dash-flow" />
                      <path d="M 32,2 L 40,6 L 32,10" fill="none" stroke="rgba(124,252,0,0.45)" strokeWidth="1.2" />
                    </svg>
                    <span style={{
                      fontSize: "9px", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginLeft: "6px",
                      background: "linear-gradient(90deg, #7CFC00, #00e5ff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>{node.label}</span>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col items-center" style={{ margin: "0 4px" }}>
                    <div className="node-breath" style={{ width: "9px", height: "9px", borderRadius: "50%", background: node.color, boxShadow: `0 0 12px ${node.color}90` }} />
                    <span style={{ fontSize: "10px", fontWeight: 700, color: node.color, marginTop: "6px", letterSpacing: "0.04em" }}>{node.label}</span>
                  </div>
                )
              )}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.45 }}
              style={{
                fontSize: "12px", marginTop: "20px", letterSpacing: "0.02em", fontWeight: 700,
                textShadow: "0 1px 14px rgba(0,0,0,0.70)",
                background: "linear-gradient(90deg, rgba(124,252,0,0.95), rgba(0,229,255,0.90))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Crescimento orgânico e autossustentável — sem custo de aquisição adicional.
            </motion.p>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SEÇÃO DE INDICAÇÕES — Banner + Simulador
        ══════════════════════════════════════════ */}
        <section
          className="relative"
          style={{
            backgroundImage: "url(/indicacoes-bg-sec.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Section overlay for readability */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(1,4,14,0.14)" }} />

          <div className="relative z-10 px-3 pt-6 pb-8 sm:px-5 sm:pt-10 sm:pb-12">
            {/* Section header */}
            <div className="max-w-5xl mx-auto mb-4 sm:mb-6">
              <ScrollSection>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-2 text-[11px] font-bold tracking-widest uppercase"
                      style={{ background: "rgba(124,252,0,0.10)", borderColor: "rgba(124,252,0,0.28)", color: "#7CFC00" }}>
                      <Users size={11} /> Sistema de Indicações
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight" style={{ color: "#EAF7FF" }}>
                      Indique, conecte e ganhe{" "}
                      <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>comissões vitalícias</span>
                    </h2>
                    <p className="text-sm mt-1 max-w-lg" style={{ color: "#D7E7F3" }}>
                      Cada extra do seu indicado gera comissão para você — para sempre, sem limite.
                    </p>
                  </div>
                  <Link href="/financial-architecture/referrals">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black border-none cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #7CFC00, #9aff1c)", boxShadow: "0 4px 20px rgba(124,252,0,0.38)" }}
                    >
                      Como funciona o Programa de Indicações <ArrowRight size={14} />
                    </motion.button>
                  </Link>
                </div>
              </ScrollSection>
            </div>

            <div className="max-w-5xl mx-auto">
              <ScrollSection delay={0.08}>
                {/* Banner image — no broken /indicacoes route */}
                <Link href="/financial-architecture/referrals">
                  <motion.div
                    whileHover={{ y: -2, scale: 1.002 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="relative overflow-hidden rounded-t-2xl sm:rounded-t-3xl cursor-pointer group"
                    style={{
                      border: "1px solid rgba(124,252,0,0.25)",
                      borderBottom: "none",
                      boxShadow: "0 0 40px rgba(124,252,0,0.08)",
                    }}
                  >
                    <img
                      src="/simulacao-indicacoes.webp"
                      alt="Simulação de Indicações extraGO"
                      className="w-full h-auto block"
                      style={{ display: "block", maxWidth: "100%" }}
                    />
                  </motion.div>
                </Link>
                {/* Simulator — seamlessly attached */}
                <ReferralSimulator />
              </ScrollSection>
            </div>
          </div>
        </section>

        {/* ── Banner hero + Arquitetura — mesmo sistema visual ── */}
        <div className="px-5 pt-5 sm:pt-6">
          <div className="max-w-5xl mx-auto overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 6px 36px rgba(0,0,0,0.38)" }}>
            <img
              src="/banner-hero.jpg"
              alt="extraGO — Rede que Cresce. Comissões automáticas. Bônus. Evolua."
              style={{ width: "100%", display: "block", objectFit: "cover", objectPosition: "center" }}
              draggable={false}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════
            ARQUITETURA FINANCEIRA — Institucional (Pos. 1)
        ══════════════════════════════════════════ */}
        <section className="px-5 pt-3 pb-5 sm:pt-4 sm:pb-8">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <Link href="/modelo-de-negocio">
                <motion.div
                  whileHover={{ y: -3, scale: 1.003 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className="relative overflow-hidden rounded-2xl cursor-pointer group"
                  style={{
                    border: "1px solid rgba(0,201,167,0.22)",
                    boxShadow: "0 0 30px rgba(0,201,167,0.08), 0 6px 32px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.03) inset",
                  }}
                >
                  <img
                    src="/arquitetura.webp"
                    alt="A Arquitetura Financeira da extraGO — 4 fontes independentes de receita"
                    className="w-full block"
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                      maxHeight: "clamp(180px, 32vw, 360px)",
                      background: "rgba(2,6,20,0.60)",
                    }}
                    draggable={false}
                  />
                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "rgba(0,201,167,0.04)" }} />
                  {/* CTA chip */}
                  <div className="absolute bottom-3 right-3">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                      style={{ background: "linear-gradient(135deg,#16a34a,#00c9a7)", color: "#fff", boxShadow: "0 0 14px rgba(22,163,74,0.35)" }}
                    >
                      Ver Arquitetura Financeira <ArrowRight size={10} />
                    </div>
                  </div>
                  {/* Top label */}
                  <div className="absolute top-3 left-3">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                      style={{ background: "rgba(2,8,22,0.70)", border: "1px solid rgba(0,201,167,0.25)", color: "rgba(0,201,167,0.90)", backdropFilter: "blur(8px)" }}
                    >
                      Modelo de Receita
                    </div>
                  </div>
                </motion.div>
              </Link>
            </ScrollSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTORS
        ══════════════════════════════════════════ */}
        <section id="setores" className="py-2 sm:py-4">
          <ScrollSection>
            <img
              src={presenteEmTodosOsSetoresImg}
              alt="Presente em Todos os Setores — Da gastronomia ao entretenimento, a extraGO conecta quem precisa com quem faz acontecer"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </ScrollSection>
        </section>

                {/* ══════════════════════════════════════════
            CTA FINAL — banner institucional
        ══════════════════════════════════════════ */}
        <section className="w-full">
          <img
            src="/landing-end.png"
            alt="extraGO — Para freelancers, empresas, investidores e indicadores"
            className="w-full h-auto block"
            style={{ display: "block" }}
            draggable={false}
          />
        </section>
        </div>{/* /bg wrapper */}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 overflow-hidden border-t border-white/6">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/backgrounds/bg-mobile-hero.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(7,10,13,0.82)" }} />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0" style={{ height: "48px", background: "linear-gradient(to bottom, #08111a 0%, transparent 100%)" }} />
        {/* Cyan/green atmosphere */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(124,252,0,0.07) 0%, rgba(0,229,255,0.05) 40%, transparent 70%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoMain} alt="extraGO" className="h-6 object-contain opacity-90" style={{ mixBlendMode: "screen" }} />
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para quem</a>
            {user ? (
              <Link href={user.role === "admin" ? "/admin" : "/app/dashboard"} className="hover:text-foreground transition-colors font-semibold" style={{ color: "rgba(124,252,0,0.75)" }}>
                Dashboard →
              </Link>
            ) : (
              <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
            )}
          </div>
          <p className="text-xs text-muted-foreground">© 2026 extraGO · Plataforma Premium de Hospitalidade</p>
        </div>
      </footer>
    </div>
  );
}
