import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import heroBanner from "@assets/1779463788546_1779532320944.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import navbarBg from "@assets/file_00000000a5a0720e9612b56b01bfe4f0~2_1780139707862.png";
import referralArt from "@assets/file_00000000f534720e8e4eab1278948eb7_1780142932397.png";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, Shield, Star, Users, CheckCircle, Briefcase, Award,
  TrendingUp, Lock, Sparkles, Globe, Clock, ChevronRight, Gift, Trophy,
  ChevronDown, Home, Building2, UserCheck, Share2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLivePlatformStats } from "@/hooks/use-live-platform-stats";

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

/* ─────────── Deep background particles (slower, larger) ─────────── */
function BackgroundParticlesDeep() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: [10, 25, 45, 60, 72, 82, 90, 35][i],
    y: [15, 55, 25, 75, 40, 10, 65, 85][i],
    size: 4 + (i % 3) * 2.5,
    duration: 28 + i * 5,
    delay: i * 3,
    color: i % 2 === 0 ? "rgba(124,252,0,0.12)" : "rgba(0,229,255,0.1)",
  }));

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            filter: "blur(1px)",
          }}
          animate={{
            y: [-30, 30, -30],
            x: [0, 20, -10, 0],
            opacity: [0.4, 0.8, 0.3, 0.8, 0.4],
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
  const particles = Array.from({ length: 14 }, (_, i) => ({
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

/* ─────────── Animated orb ─────────── */
function AnimatedOrb({ color, size, left, top, duration, delay = 0 }: {
  color: string; size: number; left: string; top: string; duration: number; delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left, top,
        background: color,
        filter: `blur(${size / 2.2}px)`,
        opacity: 0.065,
      }}
      animate={{ x: ["0%", "6%", "-4%", "5%", "0%"], y: ["0%", "8%", "4%", "-5%", "0%"], scale: [1, 1.12, 0.94, 1.08, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─────────── Live count-up with real data ─────────── */
function CountUp({ target, prefix = "", suffix = "", duration = 2200, fallback = 0 }: {
  target?: number; prefix?: string; suffix?: string; duration?: number; fallback?: number;
}) {
  const value = target ?? fallback;
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function ScrollSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >
      {children}
    </motion.div>
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

/* ─────────── Locked nav item ─────────── */
function LockedNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => setLocation("/login")}
      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/50 cursor-pointer hover:text-muted-foreground transition-colors group relative"
    >
      {children}
      <Lock size={11} className="opacity-60 group-hover:opacity-90 transition-opacity" />
    </motion.button>
  );
}

const EXPLORAR_ITEMS = [
  { icon: <Home size={15} />, label: "Início", desc: "Página principal", href: "/" },
  { icon: <Building2 size={15} />, label: "Para Empresas", desc: "Contrate profissionais", href: "/register?role=company" },
  { icon: <Users size={15} />, label: "Para Freelancers", desc: "Encontre vagas extras", href: "/register?role=freelancer" },
  { icon: <Briefcase size={15} />, label: "Extras Abertos", desc: "Explore oportunidades", href: "/login" },
  { icon: <Zap size={15} />, label: "Como Funciona", desc: "Entenda a plataforma", href: "#como-funciona" },
  { icon: <Globe size={15} />, label: "Setores", desc: "Gastronomia, Hotelaria e +", href: "#para-quem" },
  { icon: <Trophy size={15} />, label: "Indicações", desc: "Ganhe comissões", href: "/register" },
  { icon: <Gift size={15} />, label: "Quero Contratar", desc: "Publique uma vaga agora", href: "/register?role=company" },
  { icon: <Share2 size={15} />, label: "Quero Trabalhar", desc: "Cadastre-se como freelancer", href: "/register?role=freelancer" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [explorarOpen, setExplorarOpen] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* ── Background orbs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedOrb color="#7CFC00" size={580} left="-8%" top="-12%" duration={22} />
        <AnimatedOrb color="#00E5FF" size={420} left="66%" top="14%" duration={18} delay={4} />
        <AnimatedOrb color="#7CFC00" size={260} left="8%" top="62%" duration={16} delay={8} />
      </div>

      {/* ── Background deep particles (slower, larger) ── */}
      <BackgroundParticlesDeep />

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Sticky top navbar ── */}
      <motion.header
        initial={false}
        animate={scrolled ? { backdropFilter: "blur(28px)" } : { backdropFilter: "blur(18px)" }}
        style={{ backgroundImage: `url(${navbarBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
            : "border-b border-white/[0.055] shadow-[0_1px_0_rgba(255,255,255,0.03)]"
        }`}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-2.5 sm:py-2 max-w-7xl mx-auto">

          <Link href="/" className="flex-shrink-0 mr-2">
            <img src={logoMain} alt="extraGO" className="h-6 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {/* Explorar mega dropdown */}
            <div className="relative">
              <motion.button
                onClick={() => setExplorarOpen(o => !o)}
                onBlur={() => setTimeout(() => setExplorarOpen(false), 150)}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-200 py-1"
              >
                Explorar
                <motion.span animate={{ rotate: explorarOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {explorarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
                    className="absolute left-0 top-full mt-2 w-[480px] rounded-2xl border border-white/10 overflow-hidden z-50"
                    style={{ background: "rgba(8,14,20,0.96)", backdropFilter: "blur(24px)", boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)" }}
                  >
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 pb-2">Explorar a plataforma</p>
                      <div className="grid grid-cols-3 gap-1">
                        {EXPLORAR_ITEMS.map((item, i) => (
                          <Link
                            key={i}
                            href={item.href}
                            onClick={() => setExplorarOpen(false)}
                            className="flex flex-col gap-1 p-2.5 rounded-xl hover:bg-white/6 transition-all group cursor-pointer"
                          >
                            <span className="text-primary/70 group-hover:text-primary transition-colors">{item.icon}</span>
                            <span className="text-xs font-semibold text-foreground/85 group-hover:text-foreground transition-colors leading-tight">{item.label}</span>
                            <span className="text-[10px] text-muted-foreground/60 leading-tight">{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-white/6 px-4 py-2.5 flex items-center justify-between bg-white/2">
                      <span className="text-[10px] text-muted-foreground">extraGO · Workforce Marketplace</span>
                      <Link href="/register" className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1" onClick={() => setExplorarOpen(false)}>
                        Começar grátis <ChevronRight size={10} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Como funciona
            </a>
            <a href="#para-quem" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Para quem
            </a>
            {user ? (
              <Link href="/app/jobs" className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1">
                <Briefcase size={14} /> Extras
              </Link>
            ) : (
              <LockedNavLink href="/login">Extras</LockedNavLink>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link href="/app/dashboard">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none rounded-full px-5 h-9 text-sm font-bold">
                    Meu Painel <ChevronRight size={14} className="ml-1" />
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                  Entrar
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      className="border-none rounded-full px-5 h-9 text-sm font-bold text-black"
                      style={{
                        background: "linear-gradient(135deg, #7CFC00 0%, #9aff1c 50%, #00E5FF 100%)",
                        boxShadow: "0 0 20px rgba(124,252,0,0.35), 0 0 40px rgba(124,252,0,0.1)",
                      }}
                    >
                      Criar Conta
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <main className="flex-1 relative z-10">

        {/* ══════════════════════════════════════════
            HERO — Banner + Premium Headline
        ══════════════════════════════════════════ */}
        <section ref={heroRef} className="relative flex flex-col items-center justify-center overflow-hidden">
          <motion.div
            style={{ y: bannerY, opacity: bannerOpacity }}
            className="w-full relative"
          >
            <motion.img
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
              src={heroBanner}
              alt="extraGO Platform"
              className="w-full object-cover hero-banner-glow"
              style={{ maxHeight: "340px", objectPosition: "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08111a]/25 to-[#08111a]" />
          </motion.div>

          <div className="w-full max-w-5xl mx-auto px-5 text-center -mt-10 sm:-mt-20 relative z-10 pb-8 sm:pb-14">
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/12 border border-primary/25 text-xs font-bold text-primary mb-7 tracking-wide"
            >
              <span className="live-dot" />
              {statsLoading ? "Carregando dados ao vivo..." : `${(platformStats?.activeJobs ?? 0)} extras abertos agora`}
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-4xl sm:text-5xl md:text-[64px] lg:text-7xl font-bold tracking-tight mb-5 leading-[1.04] max-w-4xl mx-auto"
            >
              O marketplace de{" "}
              <TypewriterWord />
              <br className="hidden sm:block" />
              {" "}do Brasil
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Profissionais verificados. Empresas confiantes. Pagamento garantido.{" "}
              A infraestrutura definitiva para gastronomia, hotelaria e eventos — em escala nacional.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-sm sm:max-w-none mx-auto"
            >
              <Link href="/register?role=company" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan rounded-full font-bold text-base h-13 px-8 border-none">
                    <Briefcase size={18} className="mr-2" /> Sou Empresa
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=freelancer" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-bold text-base h-13 px-8 border-primary/40 text-primary hover:bg-primary/8 hover:border-primary/60">
                    <Users size={18} className="mr-2" /> Quero Trabalhar
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust signals — scrolling ticker */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
            >
              <TrustTicker />
            </motion.div>
          </div>
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
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/6 rounded-3xl" />
                <div className="absolute inset-0 border border-white/8 rounded-3xl" />
                {/* Live indicator */}
                <div className="absolute top-4 right-5 flex items-center gap-1.5">
                  <span className="live-dot" />
                  <span className="text-[10px] font-bold text-primary/70 tracking-widest uppercase">Ao vivo</span>
                </div>
                <div className="relative px-6 sm:px-10 py-8 sm:py-10">
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
                            <CountUp target={stat.value} suffix={stat.suffix} fallback={stat.fallback} />
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
        <section id="como-funciona" className="px-5 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <span className="chip-primary mb-3 inline-flex">
                  <Zap size={10} className="fill-primary" /> Como funciona
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2">Simples como deve ser</h2>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">Do cadastro ao pagamento, tudo em uma só plataforma.</p>
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
        <section id="para-quem" className="px-5 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <span className="chip-primary mb-3 inline-flex" style={{ background: "rgba(0,229,255,0.12)", borderColor: "rgba(0,229,255,0.25)", color: "hsl(186,100%,50%)" }}>
                  Para quem é
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2">Feito para os dois lados</h2>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">Empresas que precisam de profissionais. Profissionais que buscam mais.</p>
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
            REFERRAL HERO BANNER
        ══════════════════════════════════════════ */}
        <section className="px-5 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <Link href="/indicacoes">
                <motion.div
                  whileHover={{ y: -4, scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="relative overflow-hidden rounded-3xl cursor-pointer group"
                  style={{
                    background: "linear-gradient(135deg, rgba(5,8,12,0.97) 0%, rgba(8,18,10,0.97) 100%)",
                    border: "1px solid rgba(124,252,0,0.18)",
                    boxShadow: "0 0 60px rgba(124,252,0,0.07), 0 24px 80px rgba(0,0,0,0.55)",
                  }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
                  {/* Ambient glow */}
                  <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(124,252,0,0.07) 0%, transparent 70%)", filter: "blur(40px)" }} />

                  <div className="flex flex-col lg:flex-row items-stretch">
                    {/* Left: text content */}
                    <div className="flex-1 p-7 sm:p-10 lg:py-12 relative z-10">
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/22 text-[11px] font-bold text-primary mb-5 tracking-widest uppercase">
                        <Users size={11} /> Sistema de Indicações
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
                        Indique profissionais e<br />
                        ganhe <span style={{ background: "linear-gradient(90deg, #7CFC00, #9aff1c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>comissões para sempre</span>
                      </h2>

                      <p className="text-muted-foreground text-sm sm:text-base mb-7 max-w-lg leading-relaxed">
                        Convide novos profissionais para a <strong className="text-foreground">extraGO</strong> e receba{" "}
                        <strong className="text-primary">3% de comissão</strong> sobre cada extra concluído por eles na plataforma — para sempre, sem limite.
                      </p>

                      {/* 4 benefit tiles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
                        {[
                          { icon: "💰", title: "3% de comissão", desc: "Por extra concluído pelo indicado" },
                          { icon: "🔄", title: "Ganhos vitalícios", desc: "Comissão enquanto ele trabalhar" },
                          { icon: "👥", title: "Rede que cresce", desc: "Quanto mais indica, mais ganha" },
                          { icon: "🎮", title: "Gamificação", desc: "Top indicadores ganham recompensas" },
                        ].map((b, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="p-3 rounded-2xl border border-white/7 bg-white/[0.025] hover:border-primary/22 hover:bg-primary/[0.04] transition-all"
                          >
                            <span className="text-lg mb-1.5 block">{b.icon}</span>
                            <p className="text-[11px] font-bold text-primary mb-0.5 leading-tight">{b.title}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">{b.desc}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-black transition-all group-hover:shadow-[0_0_28px_rgba(124,252,0,0.45)]"
                          style={{ background: "linear-gradient(135deg, #7CFC00, #9aff1c)" }}
                        >
                          Começar a indicar <ArrowRight size={14} />
                        </div>
                        <span className="text-xs text-muted-foreground">Sem limite de ganhos</span>
                      </div>
                    </div>

                    {/* Right: artwork */}
                    <div className="lg:w-[400px] xl:w-[460px] flex-shrink-0 relative min-h-[200px] lg:min-h-0 overflow-hidden rounded-b-3xl lg:rounded-r-3xl lg:rounded-bl-none">
                      <img
                        src={referralArt}
                        alt="Sistema de Indicações extraGO"
                        className="w-full h-full object-cover object-left-top opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
                        style={{ minHeight: 200 }}
                      />
                      {/* Blend edges */}
                      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#05080c] to-transparent hidden lg:block" />
                      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#05080c] to-transparent lg:hidden" />
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#050808] to-transparent" />
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
        <section className="px-5 py-8 sm:py-12">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Presente em todos os setores</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">Da gastronomia ao entretenimento, a extraGO conecta quem precisa com quem faz acontecer.</p>
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
                      <span className="text-sm font-bold text-white leading-tight drop-shadow-md">{sector.label}</span>
                      <span className="text-[10px] text-white/50 font-medium group-hover:text-white/75 transition-colors duration-300">{sector.sub}</span>
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
        <section className="px-5 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <span className="chip-primary mb-3 inline-flex">
                  <Sparkles size={10} /> Depoimentos reais
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2">O que dizem sobre nós</h2>
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
