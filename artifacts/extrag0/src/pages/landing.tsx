import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import logoMain from "@assets/1779451173221_1779452671733.png";
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

/* ─────────── Trust ticker ─────────── */
const TICKER_ITEMS = [
  { icon: "✓", text: "Sem mensalidade" },
  { icon: "🔒", text: "Pagamento garantido" },
  { icon: "⭐", text: "Profissionais verificados" },
  { icon: "🌎", text: "Todo o Brasil" },
  { icon: "🎮", text: "Gamificação e níveis" },
  { icon: "⚡", text: "Extras confirmados em 24h" },
  { icon: "💳", text: "PIX imediato" },
  { icon: "🏆", text: "Top freelancers" },
];

function TrustTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden w-full mt-10 mask-x-fade" style={{ maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)" }}>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
            <span className="text-sm">{item.icon}</span>
            <span>{item.text}</span>
            <span className="w-1 h-1 rounded-full bg-white/15 ml-2" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Floating particles ─────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.8,
    duration: Math.random() * 14 + 10,
    delay: Math.random() * 8,
    color: i % 3 === 0 ? "rgba(124,252,0,0.55)" : i % 3 === 1 ? "rgba(0,229,255,0.45)" : "rgba(255,255,255,0.25)",
    drift: (Math.random() - 0.5) * 60,
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [-20, p.drift - 40, -20],
            x: [0, (Math.random() - 0.5) * 30, 0],
            opacity: [0, 0.8, 0.4, 0.8, 0],
            scale: [0.5, 1, 0.7, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────── Referral Simulator ─────────── */
function ReferralSimulator() {
  const [indicados, setIndicados] = useState(10);
  const [extrasPorMes, setExtrasPorMes] = useState(12);
  const [valorMedio, setValorMedio] = useState(220);

  const volume = indicados * extrasPorMes * valorMedio;
  const indicador = volume * 0.02;
  const agente = volume * 0.03;
  const embaixador = volume * 0.05;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

  const SliderField = ({
    label, value, min, max, step, onChange, prefix,
  }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; prefix?: string;
  }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(0,229,255,0.75)" }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: "#7CFC00" }}>{prefix}{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full cursor-pointer appearance-none"
        style={{
          background: `linear-gradient(90deg, #7CFC00 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.12) 0%)`,
          accentColor: "#7CFC00",
        }}
      />
      <div className="flex justify-between text-[9px]" style={{ color: "rgba(255,255,255,0.28)" }}>
        <span>{prefix}{min}</span><span>{prefix}{max}</span>
      </div>
    </div>
  );

  return (
    <div
      className="relative overflow-hidden rounded-b-3xl"
      style={{
        borderTop: "1px solid rgba(124,252,0,0.10)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/indicacoes-counter-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(2,6,16,0.18) 0%, rgba(0,10,6,0.14) 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.4) 40%, rgba(0,229,255,0.35) 60%, transparent)" }} />

      <div className="relative z-10 px-4 py-4 sm:px-8 sm:py-6">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: "linear-gradient(180deg, #7CFC00, #00e5ff)" }} />
          <p className="text-xs font-black tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Simule seus ganhos com indicações</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Left — sliders */}
          <div className="flex flex-col gap-4">
            <SliderField label="Indicados ativos" value={indicados} min={1} max={50} step={1} onChange={setIndicados} />
            <SliderField label="Extras/mês por indicado" value={extrasPorMes} min={1} max={30} step={1} onChange={setExtrasPorMes} />
            <SliderField label="Valor médio por extra" value={valorMedio} min={100} max={350} step={10} onChange={setValorMedio} prefix="R$ " />
          </div>

          {/* Right — results grid */}
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-black tracking-[0.14em] uppercase" style={{ color: "rgba(255,255,255,0.38)" }}>Sua renda passiva/mês</p>
            <div className="grid grid-cols-3 gap-2">
              {/* Indicador */}
              <div className="rounded-xl p-2.5 border text-center" style={{ background: "rgba(124,252,0,0.06)", borderColor: "rgba(124,252,0,0.2)" }}>
                <p className="text-[9px] font-bold mb-1" style={{ color: "#7CFC00" }}>Indicador</p>
                <p className="text-[9px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>2%</p>
                <p className="text-sm font-black leading-tight" style={{ color: "#7CFC00" }}>{fmt(indicador)}</p>
                <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>por mês</p>
              </div>
              {/* Agente */}
              <div className="rounded-xl p-2.5 border text-center" style={{ background: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.2)" }}>
                <p className="text-[9px] font-bold mb-1" style={{ color: "#00e5ff" }}>Agente</p>
                <p className="text-[9px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>3%</p>
                <p className="text-sm font-black leading-tight" style={{ color: "#00e5ff" }}>{fmt(agente)}</p>
                <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>por mês</p>
              </div>
              {/* Embaixador */}
              <div className="rounded-xl p-2.5 border text-center" style={{ background: "rgba(250,204,21,0.06)", borderColor: "rgba(250,204,21,0.2)" }}>
                <p className="text-[9px] font-bold mb-1" style={{ color: "#facc15" }}>Embaixador</p>
                <p className="text-[9px] mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>5%</p>
                <p className="text-sm font-black leading-tight" style={{ color: "#facc15" }}>{fmt(embaixador)}</p>
                <p className="text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>por mês</p>
              </div>
            </div>
            <Link href="/register?role=freelancer">
              <button
                className="w-full h-9 rounded-full font-bold text-black text-xs border-none cursor-pointer mt-1"
                style={{ background: "linear-gradient(135deg, #7CFC00, #9aff1c)", boxShadow: "0 3px 14px rgba(124,252,0,0.3)" }}
              >
                Construir minha rede <ArrowRight size={12} className="inline ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
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

const TESTIMONIALS = [
  { name: "Rodrigo M.", role: "Garçom · Nível Ouro", text: "Já fiz mais de 30 extras pela extraGO. O pagamento via PIX é imediato e os extras são ótimos!", stars: 5 },
  { name: "Marina K.", role: "Bar São Paulo", text: "Contratamos freelancers em menos de 24h. A plataforma é incrível para eventos de última hora.", stars: 5 },
  { name: "Felipe S.", role: "Barman · Nível Elite", text: "O sistema de gamificação me motiva a sempre buscar mais. Já subi para Elite e as ofertas melhoraram muito.", stars: 5 },
];


export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 400], [0, -50]);
  const bannerOpacity = useTransform(scrollY, [0, 280], [1, 0.65]);
  const { user } = useAuth();

  const { data: platformStats, isLoading: statsLoading } = useLivePlatformStats();

  const STATS = [
    {
      value: statsLoading ? undefined : (platformStats?.totalFreelancers ?? 0),
      fallback: 0,
      suffix: "+",
      label: "Profissionais ativos",
      icon: <Users size={22} />,
      color: "text-primary",
    },
    {
      value: statsLoading ? undefined : (platformStats?.totalCompanies ?? 0),
      fallback: 0,
      suffix: "+",
      label: "Empresas parceiras",
      icon: <Briefcase size={22} />,
      color: "text-secondary",
    },
    {
      value: statsLoading ? undefined : (platformStats?.completedJobs ?? 0),
      fallback: 0,
      suffix: "+",
      label: "Extras concluídos",
      icon: <CheckCircle size={22} />,
      color: "text-green-400",
    },
    {
      value: statsLoading ? undefined : (platformStats?.activeJobs ?? 0),
      fallback: 0,
      suffix: "",
      label: "Extras abertos agora",
      icon: <TrendingUp size={22} />,
      color: "text-yellow-400",
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
            backgroundImage: "url(/landing-page-bg-darkblue.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* ── Floating particles (for visual life) ── */}
      <FloatingParticles />

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
              src="/landing-hero2.png"
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
          <div className="w-full relative z-10 -mt-12 sm:-mt-16 px-5 pb-4 sm:pb-6">
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
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-full font-black text-black border-none cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7CFC00, #00e5ff)",
                  boxShadow: "0 0 32px rgba(124,252,0,0.45), 0 4px 24px rgba(0,0,0,0.35)",
                  fontSize: "clamp(13px, 3vw, 16px)",
                  paddingLeft: "clamp(20px, 5vw, 36px)",
                  paddingRight: "clamp(20px, 5vw, 36px)",
                  height: "clamp(46px, 7vw, 54px)",
                  letterSpacing: "0.04em",
                  textDecoration: "none",
                }}
              >
                ENTRAR NA FILA DE ESPERA
                <ArrowRight size={17} />
              </motion.a>
            </motion.div>

            {/* Trust signals — scrolling ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-6"
            >
              <TrustTicker />
            </motion.div>
          </div>

          {/* Banner-hero — institutional strip below CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full relative z-10"
            style={{
              height: "clamp(120px, 22vw, 220px)",
              overflow: "hidden",
            }}
          >
            <img
              src="/banner-hero.jpg"
              alt="extraGO — Rede que Cresce. Comissões automáticas. Bônus. Evolua."
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
              draggable={false}
            />
          </motion.div>
        </section>


        {/* ── Content bg art — from below hero to footer ── */}
        <div className="relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/images/backgrounds/bg-main.png)",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
              opacity: 0.38,
              mixBlendMode: "screen",
            }}
          />

        {/* ══════════════════════════════════════════
            LIVE STATS — Real database data
        ══════════════════════════════════════════ */}
        <section className="px-5 pb-12">
          <ScrollSection>
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: 180 }}>
                {/* Real-time stats premium background */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "url(/real-time-stats.png)",
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat",
                  }}
                />
                <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(1,5,20,0.08)" }} />
                <div className="absolute inset-0 border border-cyan-400/20 rounded-3xl" />
                {/* Live indicator */}
                <div className="absolute top-4 right-5 flex items-center gap-1.5">
                  <span className="live-dot" />
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(0,229,255,0.80)" }}>Ao vivo</span>
                </div>
                <div className="relative px-6 sm:px-10 py-10 sm:py-14">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {STATS.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                        className="text-center group"
                      >
                        <div className={`flex items-center justify-center mb-3 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                          {stat.icon}
                        </div>
                        <p className={`text-3xl sm:text-4xl font-bold ${stat.color} leading-none`}>
                          {statsLoading ? (
                            <span className="inline-block w-12 h-8 rounded-lg skeleton" />
                          ) : (
                            <CountUp target={stat.value ?? stat.fallback} suffix={stat.suffix} />
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollSection>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section id="como-funciona" className="px-5 py-7 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <span className="chip-primary mb-3 inline-flex">
                  <Zap size={10} className="fill-primary" /> Como funciona
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2" style={{ color: "#EAF7FF" }}>Simples como deve ser</h2>
                <p className="max-w-lg mx-auto leading-relaxed" style={{ color: "#D7E7F3" }}>Do cadastro ao pagamento, tudo em uma só plataforma.</p>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-3 gap-5 relative">
              <div className="hidden sm:block absolute top-14 left-[calc(33%+32px)] right-[calc(33%+32px)] h-px"
                style={{ background: "linear-gradient(90deg, rgba(124,252,0,0.4), rgba(0,229,255,0.3))" }} />
              {HOW_IT_WORKS.map((item, i) => (
                <ScrollSection key={i} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`glass-card rounded-2xl p-6 border ${item.bg} ${item.glow} relative transition-all cursor-default overflow-hidden`}
                  >
                    {/* Large step number watermark */}
                    <div className="absolute -top-2 -right-1 text-[72px] font-black leading-none select-none pointer-events-none"
                      style={{ color: "rgba(255,255,255,0.025)", fontFamily: "var(--font-display)" }}>
                      {item.step}
                    </div>
                    {/* Step indicator pill */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-4 ${item.bg} border ${item.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Passo {item.step}
                    </div>
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} border flex items-center justify-center mb-4 ${item.color}`}
                      style={i === 0 ? { boxShadow: "0 0 18px rgba(124,252,0,0.25)" } :
                             i === 1 ? { boxShadow: "0 0 18px rgba(0,229,255,0.25)" } :
                             { boxShadow: "0 0 18px rgba(250,204,21,0.25)" }}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOR WHOM
        ══════════════════════════════════════════ */}
        <section id="para-quem" className="px-5 py-7 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <span className="chip-primary mb-3 inline-flex" style={{ background: "rgba(0,229,255,0.12)", borderColor: "rgba(0,229,255,0.25)", color: "hsl(186,100%,50%)" }}>
                  Para quem é
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2" style={{ color: "#EAF7FF" }}>Feito para os dois lados</h2>
                <p className="max-w-lg mx-auto leading-relaxed" style={{ color: "#D7E7F3" }}>Empresas que precisam de profissionais. Profissionais que buscam mais.</p>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-2 gap-5">
              <ScrollSection delay={0.05}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,229,255,0.08), 0 0 0 1px rgba(0,229,255,0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="glass-card rounded-2xl p-5 border border-secondary/12 h-full cursor-default"
                >
                  <div className="w-11 h-11 rounded-2xl bg-secondary/12 border border-secondary/25 flex items-center justify-center mb-4">
                    <Briefcase size={20} className="text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">Para Empresas</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Restaurantes, bares, hotéis e organizadores de eventos.</p>
                  <ul className="space-y-2.5 mb-5">
                    {FEATURES_COMPANY.map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link href="/register?role=company">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button className="w-full bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan rounded-xl font-bold border-none h-11">
                        Começar como Empresa <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </ScrollSection>

              <ScrollSection delay={0.12}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(124,252,0,0.08), 0 0 0 1px rgba(124,252,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="glass-card rounded-2xl p-5 border border-primary/12 h-full cursor-default"
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center mb-4">
                    <Users size={20} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">Para Freelancers</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">Garçons, barmans, hostess, cozinheiros e muito mais.</p>
                  <ul className="space-y-2.5 mb-5">
                    {FEATURES_FREELANCER.map((f, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link href="/register?role=freelancer">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button className="w-full bg-primary text-black hover:bg-primary/90 neon-glow rounded-xl font-bold border-none h-11">
                        Quero Trabalhar <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </ScrollSection>
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════
            SEÇÃO DE INDICAÇÕES — Banner + Simulador
        ══════════════════════════════════════════ */}
        <section
          className="relative"
          style={{
            backgroundImage: "url(/indicacoes-bg-sec.jpg)",
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
                      src="/simulacao-indicacoes.png"
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

        {/* ══════════════════════════════════════════
            SECTORS
        ══════════════════════════════════════════ */}
        <section className="px-5 py-5 sm:py-12">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#EAF7FF" }}>Presente em todos os setores</h2>
                <p className="text-sm max-w-md mx-auto" style={{ color: "#D7E7F3" }}>Da gastronomia ao entretenimento, a extraGO conecta quem precisa com quem faz acontecer.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: "🍽️",
                    label: "Gastronomia",
                    sub: "Chefs & Cozinha",
                    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
                    glow: "from-orange-500/25 to-amber-500/15",
                    border: "hover:border-orange-500/40",
                    dot: "bg-orange-400",
                  },
                  {
                    icon: "🏨",
                    label: "Hotelaria",
                    sub: "Recepção & Concierge",
                    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
                    glow: "from-cyan-500/25 to-blue-500/15",
                    border: "hover:border-cyan-500/40",
                    dot: "bg-cyan-400",
                  },
                  {
                    icon: "🎉",
                    label: "Eventos",
                    sub: "Produção & Staff",
                    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
                    glow: "from-purple-500/25 to-pink-500/15",
                    border: "hover:border-purple-500/40",
                    dot: "bg-purple-400",
                  },
                  {
                    icon: "🍸",
                    label: "Bares & Baladas",
                    sub: "Bartenders & Equipe",
                    img: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
                    glow: "from-pink-500/25 to-red-500/15",
                    border: "hover:border-pink-500/40",
                    dot: "bg-pink-400",
                  },
                  {
                    icon: "✈️",
                    label: "Turismo",
                    sub: "Guias & Receptivo",
                    img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
                    glow: "from-sky-500/25 to-cyan-500/15",
                    border: "hover:border-sky-500/40",
                    dot: "bg-sky-400",
                  },
                  {
                    icon: "🎭",
                    label: "Entretenimento",
                    sub: "Shows & Produção",
                    img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&q=80",
                    glow: "from-yellow-500/25 to-orange-500/15",
                    border: "hover:border-yellow-500/40",
                    dot: "bg-yellow-400",
                  },
                  {
                    icon: "🏋️",
                    label: "Esportes",
                    sub: "Fitness & Arenas",
                    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
                    glow: "from-green-500/25 to-emerald-500/15",
                    border: "hover:border-green-500/40",
                    dot: "bg-green-400",
                  },
                  {
                    icon: "🤝",
                    label: "Serviços",
                    sub: "Suporte & Equipe",
                    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
                    glow: "from-primary/25 to-secondary/15",
                    border: "hover:border-primary/40",
                    dot: "bg-primary",
                  },
                ].map((sector, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                    whileHover={{ y: -4, transition: { duration: 0.25 } }}
                    className={`relative overflow-hidden rounded-2xl group cursor-default border border-white/8 ${sector.border} transition-colors duration-500`}
                    style={{ minHeight: 148 }}
                  >
                    {/* Background image — zoom on hover */}
                    <div
                      className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                      style={{ backgroundImage: `url(${sector.img})` }}
                    />
                    {/* Base dark overlay */}
                    <div className="absolute inset-0 bg-black/72 group-hover:bg-black/55 transition-all duration-500" />
                    {/* Neon glow — appears on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${sector.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    {/* Bottom gradient for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {/* Top-left live dot */}
                    <div className={`absolute top-3 left-3 w-1.5 h-1.5 rounded-full ${sector.dot} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_6px_currentColor]`} />
                    {/* Content */}
                    <div className="relative z-10 p-4 flex flex-col items-center justify-end h-full gap-1.5 text-center" style={{ minHeight: 148 }}>
                      <motion.span
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                        className="text-2xl drop-shadow-lg mb-0.5"
                      >
                        {sector.icon}
                      </motion.span>
                      <span className="text-sm font-bold leading-tight drop-shadow-md" style={{ color: "rgba(255,255,255,0.96)" }}>{sector.label}</span>
                      <span className="text-[10px] font-medium transition-colors duration-300" style={{ color: "rgba(255,255,255,0.72)" }}>{sector.sub}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════ */}
        <section className="px-5 py-7 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <span className="chip-primary mb-3 inline-flex">
                  <Sparkles size={10} /> Depoimentos reais
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2" style={{ color: "#EAF7FF" }}>O que dizem sobre nós</h2>
              </div>
            </ScrollSection>
            <div className="grid sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <ScrollSection key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="glass-card rounded-2xl p-6 border border-white/8 h-full"
                  >
                    <div className="flex mb-3 gap-0.5">
                      {Array.from({ length: t.stars }).map((_, si) => (
                        <Star key={si} size={13} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed mb-5">"{t.text}"</p>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                    </div>
                  </motion.div>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>


        {/* ══════════════════════════════════════════
            INVESTIDORES & PARCEIROS BANNER
        ══════════════════════════════════════════ */}
        <section className="px-5 py-5 sm:py-12">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <Link href="/investidores-parceiros">
                <motion.div
                  whileHover={{ y: -4, scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className="relative overflow-hidden rounded-3xl cursor-pointer group"
                  style={{
                    background: "rgba(4,7,12,0.0)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
                  }}
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    style={{ backgroundImage: "url(/investors-bg.png)" }}
                  />
                  {/* Dark overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050810]/90 via-[#050810]/65 to-[#050810]/25" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050810]/60 via-transparent to-transparent" />
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/50 via-secondary/40 to-transparent" />

                  <div className="relative z-10 p-7 sm:p-10 lg:py-12 lg:px-12">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-5"
                      style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.28)", color: "#7CFC00" }}>
                      <TrendingUp size={11} /> Investidores & Parceiros
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 max-w-lg">
                      A infraestrutura de mão de obra<br />
                      <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c 40%,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        do Brasil.
                      </span>
                    </h2>

                    <p className="text-sm sm:text-base mb-7 max-w-md leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                      Conectamos empresas e profissionais. Movimentamos negócios. Impulsionamos o Brasil.
                    </p>

                    {/* 5 key metrics */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 mb-8">
                      {[
                        { icon: <Users size={14} />, label: "Marketplace de Talentos" },
                        { icon: <Globe size={14} />, label: "Presença nacional, conexão local" },
                        { icon: <BarChart3 size={14} />, label: "Plataforma escalável" },
                        { icon: <DollarSign size={14} />, label: "Parcerias que geram impacto" },
                        { icon: <MapPin size={14} />, label: "27 estados cobertos" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs transition-colors" style={{ color: "rgba(255,255,255,0.72)" }}>
                          <span className="text-primary/70 group-hover:text-primary transition-colors">{item.icon}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>

                    {/* CTA row */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-black transition-all group-hover:shadow-[0_0_32px_rgba(124,252,0,0.45)]"
                        style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)" }}
                      >
                        Conheça a Oportunidade <ArrowRight size={14} />
                      </div>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Conectamos empresas e profissionais · Movimentamos negócios · Impulsionamos o Brasil</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </ScrollSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section className="px-5 pb-16 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollSection>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-[#08111a] to-secondary/10" />
                <div className="absolute inset-0 border border-primary/18 rounded-3xl" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 tracking-wide">
                    <Clock size={11} /> Cadastro em menos de 2 minutos
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    A workforce do futuro<br />
                    <span className="neon-text-gradient">começa aqui</span>
                  </h2>
                  <p className="text-muted-foreground mb-8 text-base max-w-md mx-auto leading-relaxed">
                    Empresas líderes e profissionais de elite escolhem a extraGO para transformar como o trabalho acontece.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/register?role=company">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" className="bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan rounded-full font-bold px-8 border-none">
                          <Briefcase size={18} className="mr-2" /> Contratar Profissionais
                        </Button>
                      </motion.div>
                    </Link>
                    <Link href="/register?role=freelancer">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" className="bg-primary text-black hover:bg-primary/90 neon-glow rounded-full font-bold px-8 border-none">
                          <Users size={18} className="mr-2" /> Encontrar Extras
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollSection>
          </div>
        </section>
        </div>{/* /bg wrapper */}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 overflow-hidden border-t border-white/6">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/backgrounds/bg-mobile-hero.png')",
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
          <img src={logoMain} alt="extraGO" className="h-6 object-contain opacity-80" />
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para quem</a>
            <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 extraGO · Plataforma Premium de Hospitalidade</p>
        </div>
      </footer>
    </div>
  );
}
