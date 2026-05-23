import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import heroBanner from "@assets/1779463788546_1779532320944.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, Shield, Star, Users, CheckCircle, Briefcase, Award,
  TrendingUp, ChevronRight, Play
} from "lucide-react";

function AnimatedOrb({
  color, size, left, top, duration, delay = 0
}: { color: string; size: number; left: string; top: string; duration: number; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left, top,
        background: color,
        filter: `blur(${size / 2.5}px)`,
        opacity: 0.1,
      }}
      animate={{ x: ["0%", "8%", "-5%", "6%", "0%"], y: ["0%", "10%", "5%", "-6%", "0%"], scale: [1, 1.15, 0.92, 1.1, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function CountUp({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
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
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

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

const STATS = [
  { value: 12000, suffix: "+", label: "Profissionais ativos", icon: <Users size={22} />, color: "text-primary" },
  { value: 850, suffix: "+", label: "Empresas parceiras", icon: <Briefcase size={22} />, color: "text-secondary" },
  { value: 45000, suffix: "+", label: "Jobs concluídos", icon: <CheckCircle size={22} />, color: "text-green-400" },
  { value: 98, suffix: "%", label: "Taxa de satisfação", icon: <Star size={22} />, color: "text-yellow-400" },
];

const TESTIMONIALS = [
  { name: "Rodrigo M.", role: "Garçom · Nível Ouro", text: "Já fiz mais de 30 jobs pela extraGO. O pagamento via PIX é imediato e as vagas são ótimas!", stars: 5 },
  { name: "Marina K.", role: "Bar São Paulo", text: "Contratamos freelancers em menos de 24h. A plataforma é incrível para eventos de última hora.", stars: 5 },
  { name: "Felipe S.", role: "Barman · Nível Elite", text: "O sistema de gamificação me motiva a sempre buscar mais. Já subi para Elite e as ofertas melhoraram muito.", stars: 5 },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 400], [0, -60]);
  const bannerOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedOrb color="#7CFC00" size={700} left="-10%" top="-15%" duration={18} />
        <AnimatedOrb color="#00E5FF" size={500} left="62%" top="20%" duration={14} delay={3} />
        <AnimatedOrb color="#7CFC00" size={350} left="75%" top="-12%" duration={16} delay={5} />
        <AnimatedOrb color="#00E5FF" size={300} left="10%" top="60%" duration={13} delay={7} />
        <AnimatedOrb color="#7CFC00" size={200} left="50%" top="85%" duration={11} delay={2} />
      </div>

      <div className="fixed inset-0 z-0 opacity-[0.1] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Sticky top navbar */}
      <motion.header
        initial={false}
        animate={scrolled ? { backdropFilter: "blur(24px)" } : { backdropFilter: "blur(8px)" }}
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#050708]/92 border-b border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
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

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para quem</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
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
          </div>
        </div>
      </motion.header>

      <main className="flex-1 relative z-10">

        {/* ═══════════════════════════════════════════
            HERO — Banner image + CTAs
        ═══════════════════════════════════════════ */}
        <section ref={heroRef} className="relative flex flex-col items-center justify-center overflow-hidden">
          {/* Full-width banner image */}
          <motion.div
            style={{ y: bannerY, opacity: bannerOpacity }}
            className="w-full relative"
          >
            <motion.img
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              src={heroBanner}
              alt="extraGO Platform"
              className="w-full object-cover hero-banner-glow"
              style={{ maxHeight: "320px", objectPosition: "center" }}
            />
            {/* Gradient overlay fading banner into content */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050708]/20 to-[#050708]" />
          </motion.div>

          {/* Hero content below banner */}
          <div className="w-full max-w-5xl mx-auto px-5 text-center -mt-16 sm:-mt-24 relative z-10 pb-16 sm:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/12 border border-primary/25 text-xs font-semibold text-primary mb-6"
            >
              <span className="live-dot" />
              A plataforma #1 de extras em hospitalidade no Brasil
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 leading-[1.06] max-w-4xl mx-auto"
            >
              A revolução dos{" "}
              <span className="neon-text-gradient">extras</span>{" "}
              na hospitalidade
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Conectamos restaurantes, bares e eventos aos melhores profissionais freelancers do Brasil — em tempo real. Rápido, seguro e premium.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-sm sm:max-w-none mx-auto"
            >
              <Link href="/register?role=company" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan rounded-full font-bold text-base h-13 px-8 border-none"
                  >
                    <Briefcase size={18} className="mr-2" />
                    Sou Empresa
                  </Button>
                </motion.div>
              </Link>
              <Link href="/register?role=freelancer" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full font-bold text-base h-13 px-8 border-primary/40 text-primary hover:bg-primary/8 hover:border-primary/60"
                  >
                    <Users size={18} className="mr-2" />
                    Quero Trabalhar
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="flex items-center gap-5 sm:gap-8 mt-10 text-xs sm:text-sm text-muted-foreground flex-wrap justify-center"
            >
              {["Sem mensalidade", "Pagamento garantido", "Profissionais verificados"].map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-primary" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            STATS STRIP
        ═══════════════════════════════════════════ */}
        <section className="px-5 pb-20">
          <ScrollSection>
            <div className="max-w-5xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/6 rounded-3xl" />
                <div className="absolute inset-0 border border-white/8 rounded-3xl" />
                <div className="relative px-6 sm:px-10 py-8 sm:py-10">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {STATS.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: [0.19,1,0.22,1] }}
                        className="text-center group"
                      >
                        <div className={`flex items-center justify-center mb-3 ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                          {stat.icon}
                        </div>
                        <p className={`text-3xl sm:text-4xl font-bold ${stat.color} leading-none`}>
                          <CountUp target={stat.value} suffix={stat.suffix} />
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

        {/* ═══════════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════════ */}
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
              {/* connector line */}
              <div className="hidden sm:block absolute top-12 left-[calc(33%+24px)] right-[calc(33%+24px)] h-px bg-gradient-to-r from-primary/30 via-secondary/20 to-transparent" />

              {HOW_IT_WORKS.map((item, i) => (
                <ScrollSection key={i} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`glass-card rounded-2xl p-6 border ${item.bg} ${item.glow} relative transition-all cursor-default`}
                  >
                    <div className="absolute top-4 right-4 text-[10px] font-bold text-white/15 font-mono tracking-widest">{item.step}</div>
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

        {/* ═══════════════════════════════════════════
            FOR WHOM
        ═══════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════
            WHY EXTRAGO  
        ═══════════════════════════════════════════ */}
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
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`${item.color} mb-4 icon-float`} style={{ filter: `drop-shadow(0 0 12px ${item.glow})` }}>
                          {item.icon}
                        </div>
                        <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </motion.div>
                    </ScrollSection>
                  ))}
                </div>
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            TESTIMONIALS
        ═══════════════════════════════════════════ */}
        <section className="px-5 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-12">
                <span className="chip-primary mb-4 inline-flex">
                  <Star size={10} className="fill-primary" /> Depoimentos
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-2">O que dizem sobre nós</h2>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <ScrollSection key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -4, borderColor: "rgba(124,252,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="glass-card rounded-2xl p-6 border border-white/6 h-full flex flex-col"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.stars }).map((_, s) => (
                        <Star key={s} size={13} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed flex-1 italic">"{t.text}"</p>
                    <div className="mt-5 pt-4 border-t border-white/6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{t.name}</p>
                        <p className="text-[11px] text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════ */}
        <section className="px-5 py-20 sm:py-32 text-center">
          <ScrollSection>
            <div className="max-w-2xl mx-auto relative">
              {/* Background glow */}
              <div className="absolute -inset-20 bg-gradient-radial from-primary/8 to-transparent rounded-full pointer-events-none blur-2xl" />
              <div className="relative">
                <span className="chip-primary mb-6 inline-flex">
                  <TrendingUp size={10} /> Comece hoje
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight mt-2">
                  Pronto para <span className="neon-text-gradient">começar</span>?
                </h2>
                <p className="text-muted-foreground mb-10 text-base sm:text-lg leading-relaxed">
                  Junte-se a mais de 12.000 profissionais e 850 empresas que já transformaram o mercado de hospitalidade.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/register">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        size="lg"
                        className="bg-primary text-black hover:bg-primary/90 neon-glow rounded-full font-bold text-base h-13 px-10 border-none"
                      >
                        Criar Conta Grátis <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/login">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="rounded-full font-bold text-base h-13 px-8 text-muted-foreground hover:text-foreground"
                      >
                        Já tenho conta
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollSection>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <img src={logoMain} alt="extraGO" className="h-5 opacity-50" />
          <p>© 2026 extraGO. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
