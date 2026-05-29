import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import heroBanner from "@assets/1779463788546_1779532320944.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, Shield, Star, Users, CheckCircle, Briefcase, Award,
  TrendingUp, Lock, Sparkles, Globe, Clock, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLivePlatformStats } from "@/hooks/use-live-platform-stats";

/* ─────────── Floating particles ─────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
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
  { step: "02", icon: <Briefcase size={24} />, title: "Publique ou candidate-se", desc: "Empresas publicam vagas com detalhes. Freelancers se candidatam com um clique.", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20", glow: "hover:shadow-[0_0_30px_rgba(0,229,255,0.12)]" },
  { step: "03", icon: <CheckCircle size={24} />, title: "Trabalhe e receba", desc: "Conclua o job e receba seu pagamento via PIX direto na carteira.", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", glow: "hover:shadow-[0_0_30px_rgba(250,204,21,0.12)]" },
];

const FEATURES_COMPANY = [
  "Acesso a centenas de profissionais verificados",
  "Publicação de vagas em minutos",
  "Aprovação de candidatos com perfil completo",
  "Pagamento seguro pela plataforma",
  "Histórico e relatórios de contratações",
];

const FEATURES_FREELANCER = [
  "Vagas exclusivas em restaurantes e eventos",
  "Pagamento garantido via PIX",
  "Sistema de reputação e gamificação",
  "Suba de nível e ganhe mais oportunidades",
  "Programa de indicações com bônus",
];

const TESTIMONIALS = [
  { name: "Rodrigo M.", role: "Garçom · Nível Ouro", text: "Já fiz mais de 30 jobs pela extraGO. O pagamento via PIX é imediato e as vagas são ótimas!", stars: 5 },
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

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
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
      label: "Jobs concluídos",
      icon: <CheckCircle size={22} />,
      color: "text-green-400",
    },
    {
      value: statsLoading ? undefined : (platformStats?.activeJobs ?? 0),
      fallback: 0,
      suffix: "",
      label: "Vagas abertas agora",
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
        <AnimatedOrb color="#7CFC00" size={650} left="-8%" top="-12%" duration={20} />
        <AnimatedOrb color="#00E5FF" size={480} left="64%" top="18%" duration={16} delay={3} />
        <AnimatedOrb color="#7CFC00" size={320} left="78%" top="-10%" duration={18} delay={5} />
        <AnimatedOrb color="#00E5FF" size={280} left="8%" top="58%" duration={15} delay={7} />
        <AnimatedOrb color="#7CFC00" size={180} left="52%" top="82%" duration={12} delay={2} />
        <AnimatedOrb color="#00E5FF" size={240} left="30%" top="45%" duration={19} delay={9} />
      </div>

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Noise grain ── */}
      <div className="fixed inset-0 z-0 opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* ── Sticky top navbar ── */}
      <motion.header
        initial={false}
        animate={scrolled ? { backdropFilter: "blur(28px)" } : { backdropFilter: "blur(10px)" }}
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#08111a]/90 border-b border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 max-w-7xl mx-auto">
          <Link href="/">
            <motion.img
              whileHover={{ scale: 1.03 }}
              src={logoMain}
              alt="extraGO"
              className="h-7 object-contain cursor-pointer"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Como funciona
            </a>
            <a href="#para-quem" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Para quem
            </a>
            {user ? (
              <Link href="/app/jobs" className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1">
                <Briefcase size={14} /> Vagas
              </Link>
            ) : (
              <LockedNavLink href="/login">Vagas</LockedNavLink>
            )}
            {user ? (
              <Link href="/app/wallet" className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1">
                <TrendingUp size={14} /> Carteira
              </Link>
            ) : (
              <LockedNavLink href="/login">Carteira</LockedNavLink>
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
                    <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none rounded-full px-5 h-9 text-sm font-bold">
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
              src="/images/backgrounds/bg-main.png"
              alt="extraGO Platform"
              className="w-full object-cover hero-banner-glow"
              style={{ maxHeight: "340px", objectPosition: "center" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08111a]/25 to-[#08111a]" />
          </motion.div>

          <div className="w-full max-w-5xl mx-auto px-5 text-center -mt-16 sm:-mt-28 relative z-10 pb-16 sm:pb-24">
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/12 border border-primary/25 text-xs font-bold text-primary mb-7 tracking-wide"
            >
              <span className="live-dot" />
              {statsLoading ? "Carregando dados ao vivo..." : `${(platformStats?.activeJobs ?? 0)} vagas abertas agora`}
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-4xl sm:text-5xl md:text-[64px] lg:text-7xl font-bold tracking-tight mb-5 leading-[1.04] max-w-4xl mx-auto"
            >
              Talentos que{" "}
              <span className="neon-text-gradient">transformam</span>
              <br className="hidden sm:block" />
              {" "}experiências
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              O marketplace que conecta restaurantes, hotéis, eventos e serviços premium{" "}
              aos melhores profissionais freelancers do Brasil — em tempo real, com pagamento garantido.
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

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="flex items-center gap-5 sm:gap-8 mt-10 text-xs sm:text-sm text-muted-foreground flex-wrap justify-center"
            >
              {[
                { icon: <CheckCircle size={13} className="text-primary" />, text: "Sem mensalidade" },
                { icon: <Shield size={13} className="text-secondary" />, text: "Pagamento garantido" },
                { icon: <Star size={13} className="text-yellow-400" />, text: "Profissionais verificados" },
                { icon: <Globe size={13} className="text-primary" />, text: "Todo o Brasil" },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {item.icon} {item.text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            LIVE STATS — Real database data
        ══════════════════════════════════════════ */}
        <section className="px-5 pb-20">
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
        <section id="como-funciona" className="px-5 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-14">
                <span className="chip-primary mb-4 inline-flex">
                  <Zap size={10} className="fill-primary" /> Como funciona
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 mt-2">Simples como deve ser</h2>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">Do cadastro ao pagamento, tudo em uma só plataforma.</p>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-3 gap-5 relative">
              <div className="hidden sm:block absolute top-12 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px bg-gradient-to-r from-primary/30 via-secondary/20 to-transparent" />
              {HOW_IT_WORKS.map((item, i) => (
                <ScrollSection key={i} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`glass-card rounded-2xl p-6 border ${item.bg} ${item.glow} relative transition-all cursor-default`}
                  >
                    <div className="absolute top-4 right-4 text-[10px] font-bold text-white/12 font-mono tracking-widest">{item.step}</div>
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} border flex items-center justify-center mb-5 ${item.color}`}>
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
        <section id="para-quem" className="px-5 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-14">
                <span className="chip-primary mb-4 inline-flex" style={{ background: "rgba(0,229,255,0.12)", borderColor: "rgba(0,229,255,0.25)", color: "hsl(186,100%,50%)" }}>
                  Para quem é
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 mt-2">Feito para os dois lados</h2>
                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">Empresas que precisam de profissionais e profissionais que buscam mais.</p>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-2 gap-5">
              <ScrollSection delay={0.05}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,229,255,0.08), 0 0 0 1px rgba(0,229,255,0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="glass-card rounded-2xl p-7 border border-secondary/12 h-full cursor-default"
                >
                  <div className="w-13 h-13 rounded-2xl bg-secondary/12 border border-secondary/25 flex items-center justify-center mb-6">
                    <Briefcase size={22} className="text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Para Empresas</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Restaurantes, bares, hotéis e organizadores de eventos.</p>
                  <ul className="space-y-3 mb-7">
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
                  className="glass-card rounded-2xl p-7 border border-primary/12 h-full cursor-default"
                >
                  <div className="w-13 h-13 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center mb-6">
                    <Users size={22} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Para Freelancers</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Garçons, barmans, hostess, cozinheiros e muito mais.</p>
                  <ul className="space-y-3 mb-7">
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
            WHY EXTRAGO
        ══════════════════════════════════════════ */}
        <section className="px-5 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/6" />
                <div className="absolute inset-0 border border-white/8 rounded-3xl" />
                <div className="relative grid sm:grid-cols-3 gap-10 text-center">
                  {[
                    { icon: <Zap size={30} />, title: "Instantâneo", desc: "Match entre empresa e profissional em minutos, não dias.", color: "text-primary", glow: "rgba(124,252,0,0.3)" },
                    { icon: <Shield size={30} />, title: "Seguro", desc: "Perfis verificados, pagamento garantido e avaliações reais.", color: "text-secondary", glow: "rgba(0,229,255,0.3)" },
                    { icon: <Award size={30} />, title: "Premium", desc: "Gamificação, níveis e benefícios exclusivos para os melhores.", color: "text-yellow-400", glow: "rgba(250,204,21,0.3)" },
                  ].map((item, i) => (
                    <ScrollSection key={i} delay={i * 0.1}>
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="flex flex-col items-center cursor-default"
                      >
                        <motion.div
                          className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center ${item.color}`}
                          style={{ background: `rgba(${item.glow.replace("rgba(", "").replace(")", "").split(",").slice(0, 3).join(",")}, 0.1)`, border: `1px solid ${item.glow.replace("rgba(", "rgba(").replace(", 0.3)", ", 0.2)")}` }}
                          whileHover={{ boxShadow: `0 0 30px ${item.glow}` }}
                        >
                          {item.icon}
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{item.desc}</p>
                      </motion.div>
                    </ScrollSection>
                  ))}
                </div>
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTORS
        ══════════════════════════════════════════ */}
        <section className="px-5 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">Presente em todos os setores</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">Da gastronomia ao entretenimento, a extraGO conecta quem precisa com quem faz acontecer.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "🍽️", label: "Gastronomia" },
                  { icon: "🏨", label: "Hotelaria" },
                  { icon: "🎉", label: "Eventos" },
                  { icon: "🍸", label: "Bares & Baladas" },
                  { icon: "✈️", label: "Turismo" },
                  { icon: "🎭", label: "Entretenimento" },
                  { icon: "🏋️", label: "Esportes" },
                  { icon: "🤝", label: "Serviços" },
                ].map((sector, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -3, borderColor: "rgba(124,252,0,0.3)" }}
                    className="glass-card rounded-2xl p-4 border border-white/6 flex flex-col items-center gap-2 text-center cursor-default transition-all"
                  >
                    <span className="text-2xl">{sector.icon}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{sector.label}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════ */}
        <section className="px-5 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-14">
                <span className="chip-primary mb-4 inline-flex">
                  <Sparkles size={10} /> Depoimentos reais
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 mt-2">O que dizem sobre nós</h2>
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
        <section className="px-5 pb-24 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollSection>
              <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-[#08111a] to-secondary/10" />
                <div className="absolute inset-0 border border-primary/18 rounded-3xl" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 tracking-wide">
                    <Clock size={11} /> Comece em menos de 2 minutos
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    Pronto para dar o<br />
                    <span className="neon-text-gradient">próximo passo</span>?
                  </h2>
                  <p className="text-muted-foreground mb-8 text-base max-w-md mx-auto leading-relaxed">
                    Junte-se a milhares de profissionais e empresas que já transformaram a forma de trabalhar.
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
                          <Users size={18} className="mr-2" /> Encontrar Vagas
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollSection>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/6 px-5 py-8 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoMain} alt="extraGO" className="h-6 object-contain opacity-70" />
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
