import React, { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import logoMain from "@assets/1779451173221_1779452671733.png";
import navbarBg from "@assets/file_00000000a5a0720e9612b56b01bfe4f0~2_1780139707862.png";
import {
  ArrowRight, TrendingUp, Users, Globe, Zap, Shield, Star,
  Building2, ChevronRight, CheckCircle, BarChart3, Layers,
  DollarSign, MapPin, Award, Briefcase, Target, Sparkles,
  ExternalLink, Mail, Phone, ChevronDown,
} from "lucide-react";

function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.72, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({ children, className = "", glow = "" }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <div
      className={`relative rounded-2xl border border-white/8 overflow-hidden ${className}`}
      style={{
        background: "rgba(8,14,22,0.72)",
        backdropFilter: "blur(24px) saturate(160%)",
        boxShadow: glow || "0 4px 32px rgba(0,0,0,0.35)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Ambient orbs ── */
function AmbientOrb({ color, size, left, top, duration, delay = 0 }: { color: string; size: number; left: string; top: string; duration: number; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left, top, background: color, filter: `blur(${size / 2.2}px)`, opacity: 0.055 }}
      animate={{ x: ["0%", "5%", "-4%", "0%"], y: ["0%", "7%", "3%", "0%"], scale: [1, 1.1, 0.95, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const TEAM = [
  {
    name: "Leonardo Scheffel da Rosa",
    role: "CEO & Founder",
    photo: "/team-leonardo.jpg",
    equity: "30%",
    color: "from-primary/20 to-primary/5",
    border: "border-primary/25",
    glow: "0 0 40px rgba(124,252,0,0.12)",
    bio: "Responsável pela visão estratégica, produto, operações e expansão nacional da extraGO. Experiência em gestão operacional, hotelaria, liderança de equipes e desenvolvimento de negócios.",
    linkedin: "#",
  },
  {
    name: "Jean Carlos Dick",
    role: "CMO & Co-Founder",
    photo: "/team-jean.jpg",
    equity: "20%",
    color: "from-secondary/20 to-secondary/5",
    border: "border-secondary/25",
    glow: "0 0 40px rgba(0,229,255,0.12)",
    bio: "Fundador da MyAds. Responsável por branding, marketing, growth, aquisição de usuários e posicionamento estratégico da marca.",
    linkedin: "#",
  },
  {
    name: "Qaialla Pereira",
    role: "CCO & Co-Founder",
    photo: "/team-qaialla.jpg",
    equity: "10%",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-400/25",
    glow: "0 0 40px rgba(168,85,247,0.12)",
    bio: "Responsável pela expansão comercial, parcerias estratégicas, relacionamento corporativo e desenvolvimento de mercado.",
    linkedin: "#",
  },
];

const CAP_TABLE = [
  { name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", pct: 30, color: "#7CFC00" },
  { name: "Jean Carlos Dick", role: "CMO & Co-Founder", pct: 20, color: "#00E5FF" },
  { name: "Qaialla Pereira", role: "CCO & Co-Founder", pct: 10, color: "#a855f7" },
  { name: "Reserva para Investidores Estratégicos", role: "Investidores", pct: 20, color: "#f59e0b" },
  { name: "Pool de Talentos e Executivos", role: "Equipe", pct: 10, color: "#f472b6" },
  { name: "Reserva Estratégica da Companhia", role: "Companhia", pct: 10, color: "#64748b" },
];

const FINANCIAL_DISTRIBUTION = [
  { label: "Caixa e Reserva Estratégica", pct: 35, color: "#7CFC00" },
  { label: "Marketing e Crescimento", pct: 20, color: "#00E5FF" },
  { label: "Representantes Estaduais", pct: 15, color: "#f59e0b" },
  { label: "Tecnologia e Infraestrutura", pct: 10, color: "#a855f7" },
  { label: "Equipe e Operações", pct: 10, color: "#f472b6" },
  { label: "Fundo de Expansão", pct: 5, color: "#22d3ee" },
  { label: "Programa de Indicações", pct: 5, color: "#4ade80" },
];

const LEVELS = [
  { name: "Iniciante", fee: 18, color: "#cd7f32", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.3)" },
  { name: "Júnior", fee: 16, color: "#c0c0c0", bg: "rgba(192,192,192,0.12)", border: "rgba(192,192,192,0.3)" },
  { name: "Intermediário", fee: 14, color: "#ffd700", bg: "rgba(255,215,0,0.12)", border: "rgba(255,215,0,0.3)" },
  { name: "Sênior", fee: 12, color: "#7CFC00", bg: "rgba(124,252,0,0.12)", border: "rgba(124,252,0,0.3)" },
  { name: "Elite", fee: 10, color: "#00E5FF", bg: "rgba(0,229,255,0.12)", border: "rgba(0,229,255,0.3)" },
];

const REFERRAL_TIERS = [
  { tier: "Indicador", commission: "5%", desc: "Usuários que indicam novos profissionais", color: "#7CFC00" },
  { tier: "Embaixador Regional", commission: "7%", desc: "Presença em múltiplas cidades do estado", color: "#00E5FF" },
  { tier: "Embaixador Nacional", commission: "10%", desc: "Rede nacional de alta performance", color: "#a855f7" },
];

const ROADMAP = [
  { phase: "Fase 1", title: "Validação Regional", desc: "Validação do produto e modelo de negócio nas primeiras regiões.", icon: <Target size={18} />, done: true },
  { phase: "Fase 2", title: "Expansão Sul", desc: "Expansão para os principais mercados do Sul do Brasil.", icon: <MapPin size={18} />, done: false },
  { phase: "Fase 3", title: "Expansão Nacional", desc: "Crescimento acelerado para as principais capitais brasileiras.", icon: <Globe size={18} />, done: false },
  { phase: "Fase 4", title: "Rede de Representantes", desc: "27 representantes estaduais ativos cobrindo todo o território nacional.", icon: <Users size={18} />, done: false },
  { phase: "Fase 5", title: "Ecossistema Financeiro", desc: "Lançamento de produtos financeiros para profissionais e empresas.", icon: <DollarSign size={18} />, done: false },
  { phase: "Fase 6", title: "IA para Matching", desc: "Inteligência artificial para matching inteligente entre profissionais e vagas.", icon: <Zap size={18} />, done: false },
  { phase: "Fase 7", title: "Liderança Nacional", desc: "Liderança consolidada no mercado de trabalho flexível do Brasil.", icon: <Award size={18} />, done: false },
];

const MARKET_PROBLEMS = [
  { side: "Empresas", color: "#00E5FF", items: ["Dificuldade para contratar rapidamente", "Falta de profissionais qualificados", "Alto custo operacional", "Ausência de histórico profissional confiável"] },
  { side: "Profissionais", color: "#7CFC00", items: ["Falta de oportunidades recorrentes", "Dependência de grupos informais", "Ausência de reputação validada", "Crescimento profissional limitado"] },
];

export default function InvestidoresParceirosPage() {
  const [navScrolled, setNavScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: "#050810" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AmbientOrb color="#7CFC00" size={700} left="-10%" top="-15%" duration={26} />
        <AmbientOrb color="#00E5FF" size={500} left="65%" top="8%" duration={20} delay={4} />
        <AmbientOrb color="#a855f7" size={340} left="20%" top="55%" duration={18} delay={8} />
        <AmbientOrb color="#7CFC00" size={280} left="75%" top="65%" duration={22} delay={12} />
      </div>

      {/* ── Navbar ── */}
      <motion.header
        initial={false}
        animate={navScrolled ? { backdropFilter: "blur(28px)" } : { backdropFilter: "blur(18px)" }}
        style={{ backgroundImage: `url(${navbarBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        className={`sticky top-0 z-30 w-full transition-all duration-300 ${navScrolled ? "border-b border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.5)]" : "border-b border-white/[0.055]"}`}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-2.5 max-w-7xl mx-auto">
          <Link href="/" className="flex-shrink-0">
            <img src={logoMain} alt="extraGO" className="h-6 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#oportunidade" className="text-muted-foreground hover:text-foreground transition-colors">Oportunidade</a>
            <a href="#modelo" className="text-muted-foreground hover:text-foreground transition-colors">Modelo de Negócio</a>
            <a href="#equipe" className="text-muted-foreground hover:text-foreground transition-colors">Equipe</a>
            <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">← Voltar</Link>
          </nav>
          <div className="flex items-center gap-2">
            <a href="mailto:contato@extrag0.com.br">
              <Button className="rounded-full px-5 h-9 text-sm font-bold text-black border-none" style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c 50%,#00E5FF)", boxShadow: "0 0 20px rgba(124,252,0,0.3)" }}>
                Falar com a Equipe
              </Button>
            </a>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 relative z-10">

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Hero banner image */}
          <div className="relative w-full" style={{ maxHeight: 520, overflow: "hidden" }}>
            <motion.img
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              src="/investors-banner.png"
              alt="extraGO Investidores & Parceiros"
              className="w-full object-cover object-center"
              style={{ maxHeight: 520 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/20 via-[#050810]/30 to-[#050810]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050810]/60 via-transparent to-[#050810]/20" />
          </div>

          {/* Hero content overlay */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-5"
                style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.25)", color: "#7CFC00" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Investidores & Parceiros
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 tracking-tight"
              >
                A infraestrutura de<br />
                <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c 40%,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  mão de obra do Brasil.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-base sm:text-lg text-white/70 mb-8 max-w-xl leading-relaxed"
              >
                Conectando profissionais, empresas e oportunidades através de tecnologia, reputação, gamificação e crescimento sustentável.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.62 }}
                className="flex flex-wrap gap-3"
              >
                <a href="mailto:contato@extrag0.com.br">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="rounded-full font-bold px-7 h-12 border-none text-black" style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)", boxShadow: "0 0 28px rgba(124,252,0,0.4)" }}>
                      Investir na extraGO <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </motion.div>
                </a>
                <a href="mailto:parcerias@extrag0.com.br">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" variant="outline" className="rounded-full font-bold px-7 h-12 border-white/20 text-white hover:bg-white/6 hover:border-white/35">
                      Tornar-se Parceiro
                    </Button>
                  </motion.div>
                </a>
                <a href="#oportunidade">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" variant="ghost" className="rounded-full font-bold px-7 h-12 text-white/70 hover:text-white hover:bg-white/6">
                      Conhecer o Projeto <ChevronDown size={16} className="ml-1" />
                    </Button>
                  </motion.div>
                </a>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1"
          >
            <span className="text-[10px] text-white/30 tracking-widest uppercase">Explorar</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}>
              <ChevronDown size={16} className="text-white/30" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Vision bar ── */}
        <section className="px-5 py-8">
          <div className="max-w-5xl mx-auto">
            <GlassCard className="px-6 sm:px-10 py-7">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.2)" }}>
                  <Zap size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-white/40 font-medium uppercase tracking-widest mb-1">Nossa Missão</p>
                  <p className="text-lg sm:text-xl font-semibold text-white/90 leading-relaxed">
                    Transformar a forma como profissionais e empresas se conectam no Brasil, criando um ambiente mais eficiente, seguro, transparente e escalável para o trabalho flexível.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MARKET OPPORTUNITY
        ══════════════════════════════════════════ */}
        <section id="oportunidade" className="px-5 py-14 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF" }}>
                  <Target size={11} /> Oportunidade de Mercado
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Um mercado enorme.<br />Ainda sem solução.</h2>
                <p className="text-white/55 max-w-xl mx-auto leading-relaxed">Milhões de profissionais e empresas enfrentam diariamente os mesmos problemas — sem uma plataforma centralizada para resolvê-los.</p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-12">
              {MARKET_PROBLEMS.map((side, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <GlassCard className="p-6 h-full">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${side.color}18`, border: `1px solid ${side.color}30` }}>
                      {i === 0 ? <Building2 size={18} style={{ color: side.color }} /> : <Users size={18} style={{ color: side.color }} />}
                    </div>
                    <h3 className="font-bold text-lg mb-3" style={{ color: side.color }}>{side.side}</h3>
                    <ul className="space-y-2.5">
                      {side.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-white/65">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: side.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>

            {/* Sectors */}
            <ScrollReveal delay={0.15}>
              <GlassCard className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">Mercados Atendidos</h3>
                  <p className="text-white/45 text-sm">A extraGO opera nos setores de maior demanda por trabalho flexível no Brasil.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: "🍽️", label: "Gastronomia" },
                    { icon: "🏨", label: "Hotelaria" },
                    { icon: "🎉", label: "Eventos" },
                    { icon: "✈️", label: "Turismo" },
                    { icon: "🍸", label: "Bares & Baladas" },
                    { icon: "🎭", label: "Entretenimento" },
                    { icon: "🤝", label: "Serviços" },
                    { icon: "💼", label: "Freelancers" },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/7 bg-white/[0.025] hover:bg-white/[0.045] hover:border-primary/25 transition-all text-center"
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-xs font-semibold text-white/75">{s.label}</span>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Inspiration bar */}
            <ScrollReveal delay={0.2} className="mt-8">
              <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 text-center" style={{ background: "rgba(124,252,0,0.04)", border: "1px solid rgba(124,252,0,0.12)" }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.4), transparent)" }} />
                <p className="text-white/50 text-sm mb-4 uppercase tracking-widest font-bold">A mesma transformação que ocorreu em outros mercados</p>
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
                  {[
                    { name: "Uber", desc: "transformou o transporte" },
                    { name: "Airbnb", desc: "transformou a hospedagem" },
                    { name: "LinkedIn", desc: "transformou o networking" },
                    { name: "extraGO", desc: "está construindo a infraestrutura nacional de mão de obra", primary: true },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className={`font-bold text-lg sm:text-xl ${item.primary ? "text-primary" : "text-white/80"}`}>{item.name}</p>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            BUSINESS MODEL
        ══════════════════════════════════════════ */}
        <section id="modelo" className="px-5 py-14 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.2)", color: "#7CFC00" }}>
                  <DollarSign size={11} /> Modelo de Monetização
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Receita recorrente por performance</h2>
                <p className="text-white/55 max-w-xl mx-auto leading-relaxed">A principal fonte de receita é a taxa de intermediação aplicada sobre os extras concluídos. O sistema incentiva qualidade e retenção de longo prazo.</p>
              </div>
            </ScrollReveal>

            {/* Fee levels */}
            <div className="grid sm:grid-cols-5 gap-3 mb-10">
              {LEVELS.map((level, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="relative rounded-2xl p-5 text-center overflow-hidden cursor-default"
                    style={{ background: level.bg, border: `1px solid ${level.border}`, boxShadow: i === 4 ? `0 0 32px ${level.color}22` : "none" }}
                  >
                    {i === 4 && (
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${level.color}70, transparent)` }} />
                    )}
                    <div className="text-2xl font-black mb-1" style={{ color: level.color }}>{level.fee}%</div>
                    <div className="text-xs font-bold text-white/70 mb-0.5">taxa</div>
                    <div className="text-xs font-semibold mt-2" style={{ color: level.color }}>{level.name}</div>
                    {i === 4 && (
                      <div className="absolute -top-1 -right-1">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: level.color, color: "#000" }}>ELITE</span>
                      </div>
                    )}
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            {/* Arrow progression visual */}
            <ScrollReveal delay={0.1}>
              <GlassCard className="p-5 sm:p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="text-sm font-bold text-white/80">Como funciona a progressão</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
                  {LEVELS.map((level, i) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: `${level.color}20`, border: `1.5px solid ${level.color}40`, color: level.color }}>{level.fee}%</div>
                        <span className="text-[9px] text-white/45 text-center leading-tight whitespace-nowrap">{level.name}</span>
                      </div>
                      {i < LEVELS.length - 1 && (
                        <div className="flex-1 h-px min-w-[16px]" style={{ background: `linear-gradient(90deg, ${level.color}40, ${LEVELS[i + 1].color}40)` }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-xs text-white/40 mt-3">Quanto mais o profissional cresce, menor a taxa e maiores os benefícios. Isso incentiva retenção e qualidade.</p>
              </GlassCard>
            </ScrollReveal>

            {/* Referral system */}
            <ScrollReveal delay={0.15}>
              <GlassCard className="p-6 sm:p-8 mb-8" glow="0 0 60px rgba(124,252,0,0.07), 0 4px 32px rgba(0,0,0,0.35)">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.4), transparent)" }} />
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Sistema de Indicações</h3>
                    <p className="text-xs text-white/45">Crescimento orgânico com comissões recorrentes</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {REFERRAL_TIERS.map((tier, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="p-4 rounded-xl border text-center"
                      style={{ background: `${tier.color}08`, borderColor: `${tier.color}25` }}
                    >
                      <div className="text-2xl font-black mb-1" style={{ color: tier.color }}>{tier.commission}</div>
                      <div className="text-xs text-white/40 mb-2">de participação</div>
                      <div className="text-sm font-bold" style={{ color: tier.color }}>{tier.tier}</div>
                      <div className="text-[11px] text-white/40 mt-1 leading-snug">{tier.desc}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: "💰", title: "Receita recorrente", desc: "Por cada extra do indicado" },
                    { icon: "🔄", title: "Vitalício", desc: "Sem prazo de expiração" },
                    { icon: "📉", title: "CAC reduzido", desc: "Aquisição orgânica" },
                    { icon: "🌱", title: "Crescimento em rede", desc: "Efeito de rede composto" },
                  ].map((b, i) => (
                    <div key={i} className="p-3 rounded-xl border border-white/6 bg-white/[0.02] text-center">
                      <span className="text-xl block mb-1.5">{b.icon}</span>
                      <p className="text-[11px] font-bold text-primary mb-0.5">{b.title}</p>
                      <p className="text-[10px] text-white/40">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Financial distribution */}
            <ScrollReveal delay={0.2}>
              <GlassCard className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                    <BarChart3 size={18} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Distribuição da Receita Operacional</h3>
                    <p className="text-xs text-white/45">Modelo sustentável e escalável de alocação de recursos</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {FINANCIAL_DISTRIBUTION.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm text-white/80 font-medium truncate">{item.label}</span>
                          <span className="text-sm font-black flex-shrink-0" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct * 2.5}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: item.color, maxWidth: "100%" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            NATIONAL EXPANSION
        ══════════════════════════════════════════ */}
        <section className="px-5 py-14 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
                  <Globe size={11} /> Expansão Nacional
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Um representante por estado</h2>
                <p className="text-white/55 max-w-xl mx-auto leading-relaxed">A expansão da extraGO será conduzida por uma rede de 27 representantes estaduais, responsáveis pelo crescimento regional e fortalecimento da marca.</p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
              {[
                { icon: <TrendingUp size={20} />, label: "Crescimento Regional", color: "#7CFC00" },
                { icon: <Briefcase size={20} />, label: "Parcerias Estratégicas", color: "#00E5FF" },
                { icon: <Target size={20} />, label: "Desenvolvimento Comercial", color: "#f59e0b" },
                { icon: <Zap size={20} />, label: "Expansão Operacional", color: "#a855f7" },
                { icon: <Star size={20} />, label: "Fortalecimento da Marca", color: "#f472b6" },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-4 rounded-2xl border border-white/8 bg-white/[0.025] text-center hover:border-white/15 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <p className="text-xs font-semibold text-white/70 leading-tight">{item.label}</p>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={0.2}>
              <GlassCard className="p-6 sm:p-10" glow="0 0 60px rgba(245,158,11,0.07), 0 4px 32px rgba(0,0,0,0.4)">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)" }} />
                <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                  <div>
                    <p className="text-6xl sm:text-7xl font-black" style={{ background: "linear-gradient(135deg,#f59e0b,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>27</p>
                    <p className="text-sm text-white/50 mt-1">representantes estaduais</p>
                  </div>
                  <div className="w-px h-16 bg-white/10 hidden sm:block" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Cobertura Nacional Completa</h3>
                    <p className="text-white/55 text-sm leading-relaxed">Cada representante conduz o crescimento regional com autonomia operacional, parcerias locais e desenvolvimento comercial — criando um ecossistema de mão de obra verdadeiramente nacional.</p>
                  </div>
                  <div className="text-5xl flex-shrink-0 hidden md:block">🗺️</div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TEAM
        ══════════════════════════════════════════ */}
        <section id="equipe" className="px-5 py-14 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7" }}>
                  <Users size={11} /> Liderança
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Quem está construindo o futuro</h2>
                <p className="text-white/55 max-w-xl mx-auto leading-relaxed">Uma equipe com experiência multidisciplinar, comprometida com a visão de longo prazo.</p>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-3 gap-5">
              {TEAM.map((member, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className={`relative rounded-2xl overflow-hidden border ${member.border} group cursor-default`}
                    style={{ background: "rgba(8,14,22,0.85)", boxShadow: member.glow }}
                  >
                    {/* Top gradient */}
                    <div className={`h-1 w-full bg-gradient-to-r ${member.color}`} />

                    <div className="p-6">
                      {/* Photo */}
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.color} opacity-30 blur-md`} />
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="relative w-24 h-24 rounded-full object-cover border-2"
                          style={{ borderColor: member.border.replace("border-", "").replace("/25", "") }}
                          onError={e => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0a1628&color=7CFC00&size=96`;
                          }}
                        />
                        {/* Equity badge */}
                        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black text-black" style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)" }}>
                          {member.equity}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-base leading-tight mb-1">{member.name}</h3>
                        <p className="text-xs font-bold tracking-wide" style={{ color: i === 0 ? "#7CFC00" : i === 1 ? "#00E5FF" : "#a855f7" }}>{member.role}</p>
                      </div>

                      <p className="text-xs text-white/55 text-center leading-relaxed">{member.bio}</p>

                      {/* Equity bar */}
                      <div className="mt-4 pt-4 border-t border-white/6">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/40">Participação societária</span>
                          <span className="font-bold text-white/80">{member.equity}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${parseInt(member.equity) * 3.33}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.5, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: i === 0 ? "#7CFC00" : i === 1 ? "#00E5FF" : "#a855f7" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CAP TABLE
        ══════════════════════════════════════════ */}
        <section className="px-5 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <GlassCard className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Layers size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Estrutura Societária</h3>
                    <p className="text-xs text-white/45">Distribuição atual de participações da extraGO</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {CAP_TABLE.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color, boxShadow: `0 0 8px ${entry.color}60` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-white/85 block truncate">{entry.name}</span>
                            <span className="text-[11px] text-white/35">{entry.role}</span>
                          </div>
                          <span className="text-base font-black flex-shrink-0" style={{ color: entry.color }}>{entry.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${entry.pct * 3.33}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: entry.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Investor opportunity highlight */}
                <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)" }}>
                  <div className="flex items-start gap-3">
                    <Star size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-yellow-400 mb-1">20% reservado para investidores estratégicos</p>
                      <p className="text-xs text-white/50 leading-relaxed">A extraGO possui espaço reservado para investidores que desejam participar da construção da principal infraestrutura digital de trabalho flexível do Brasil. Os recursos serão direcionados para expansão nacional, tecnologia, marketing e novos produtos financeiros.</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ROADMAP
        ══════════════════════════════════════════ */}
        <section id="roadmap" className="px-5 py-14 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "#00E5FF" }}>
                  <TrendingUp size={11} /> Roadmap
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">A jornada rumo à liderança nacional</h2>
                <p className="text-white/55 max-w-xl mx-auto">Cada fase é projetada para consolidar o mercado e maximizar o valor entregue a profissionais, empresas e investidores.</p>
              </div>
            </ScrollReveal>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 sm:left-1/2 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, rgba(124,252,0,0.4), rgba(0,229,255,0.3), rgba(168,85,247,0.2))", transform: "translateX(-50%)" }} />

              <div className="space-y-6">
                {ROADMAP.map((item, i) => {
                  const isLeft = i % 2 === 0;
                  return (
                    <ScrollReveal key={i} delay={i * 0.07}>
                      <div className={`relative flex items-center gap-4 sm:gap-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"} pl-14 sm:pl-0`}>
                        {/* Content */}
                        <div className={`sm:w-[calc(50%-32px)] ${isLeft ? "sm:pr-8 sm:text-right" : "sm:pl-8 sm:text-left"}`}>
                          <motion.div
                            whileHover={{ y: -2 }}
                            className={`p-4 sm:p-5 rounded-2xl border cursor-default transition-all ${item.done ? "border-primary/25 bg-primary/5 hover:border-primary/40" : "border-white/8 bg-white/[0.025] hover:border-white/15"}`}
                          >
                            <div className={`flex items-center gap-2 mb-2 ${isLeft ? "sm:justify-end" : "sm:justify-start"}`}>
                              <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full ${item.done ? "bg-primary/15 text-primary" : "bg-white/6 text-white/40"}`}>{item.phase}</span>
                              {item.done && <CheckCircle size={12} className="text-primary" />}
                            </div>
                            <h4 className="font-bold text-sm sm:text-base mb-1">{item.title}</h4>
                            <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                          </motion.div>
                        </div>

                        {/* Center dot */}
                        <div className="absolute left-5 sm:left-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 -translate-x-1/2"
                          style={{ background: item.done ? "rgba(124,252,0,0.2)" : "rgba(255,255,255,0.06)", border: `2px solid ${item.done ? "#7CFC00" : "rgba(255,255,255,0.15)"}`, boxShadow: item.done ? "0 0 16px rgba(124,252,0,0.35)" : "none" }}>
                          <span style={{ color: item.done ? "#7CFC00" : "#ffffff55" }}>{item.icon}</span>
                        </div>

                        <div className="hidden sm:block sm:w-[calc(50%-32px)]" />
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            INVESTOR CTA
        ══════════════════════════════════════════ */}
        <section className="px-5 pb-20 sm:pb-28">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center">
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.08), rgba(8,14,22,0.97) 50%, rgba(0,229,255,0.06))" }} />
                <div className="absolute inset-0 border border-primary/15 rounded-3xl" />
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.5), transparent)" }} />

                {/* Ambient glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,252,0,0.07) 0%, transparent 70%)", filter: "blur(40px)" }} />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-6" style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.25)", color: "#7CFC00" }}>
                    <Sparkles size={11} /> Oportunidade de Investimento
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
                    Faça parte da construção<br />
                    <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      da infraestrutura do Brasil.
                    </span>
                  </h2>
                  <p className="text-white/55 mb-8 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Conecte-se com nossa equipe para conhecer a oportunidade de investimento, os termos e como participar da expansão nacional da extraGO.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                    <a href="mailto:investidores@extrag0.com.br">
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" className="rounded-full font-bold px-8 h-13 border-none text-black text-base" style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)", boxShadow: "0 0 32px rgba(124,252,0,0.4)" }}>
                          <Mail size={18} className="mr-2" /> Investir na extraGO
                        </Button>
                      </motion.div>
                    </a>
                    <a href="mailto:parcerias@extrag0.com.br">
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-13 text-base border-white/20 text-white hover:bg-white/6">
                          <Briefcase size={18} className="mr-2" /> Tornar-se Parceiro
                        </Button>
                      </motion.div>
                    </a>
                    <Link href="/register">
                      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" variant="ghost" className="rounded-full font-bold px-8 h-13 text-base text-white/65 hover:text-white hover:bg-white/6">
                          Conhecer a Plataforma <ExternalLink size={16} className="ml-2" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>

                  {/* Contact info */}
                  <div className="mt-8 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5"><Mail size={12} /> investidores@extrag0.com.br</span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-white/15" />
                    <span className="flex items-center gap-1.5"><Globe size={12} /> extrag0.com.br</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/6 px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoMain} alt="extraGO" className="h-6 object-contain opacity-80" />
          <div className="flex items-center gap-5 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors">← Página Inicial</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar na Plataforma</Link>
            <a href="mailto:contato@extrag0.com.br" className="hover:text-white transition-colors">Contato</a>
          </div>
          <p className="text-xs text-white/30">© 2026 extraGO · A Infraestrutura de Mão de Obra do Brasil</p>
        </div>
      </footer>
    </div>
  );
}
