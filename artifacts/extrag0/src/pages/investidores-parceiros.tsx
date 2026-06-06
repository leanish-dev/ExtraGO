import React, { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import logoMain from "@assets/1779451173221_1779452671733.png";
import navbarBg from "@assets/file_00000000a5a0720e9612b56b01bfe4f0~2_1780139707862.png";
import {
  ArrowRight, TrendingUp, Users, Globe, Zap, Star,
  Building2, CheckCircle, BarChart3, Layers,
  DollarSign, MapPin, Award, Briefcase, Target, Sparkles,
  Mail, ChevronDown, Shield, Lock, Cpu, Wallet,
  MessageCircle, GitBranch, Network,
} from "lucide-react";

/* ─────────────── helpers ─────────────── */

function Rev({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.68, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

function Glass({ children, className = "", accent = "" }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/8 overflow-hidden ${className}`}
      style={{ background: "rgba(6,11,18,0.78)", backdropFilter: "blur(24px) saturate(160%)" }}>
      {accent && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: accent }} />}
      {children}
    </div>
  );
}

function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-[0.12em] uppercase mb-5"
      style={{ background: `${color}12`, border: `1px solid ${color}28`, color }}>
      {children}
    </span>
  );
}

/* ─────────────── data ─────────────── */

const LEVELS = [
  { name: "Iniciante", fee: 20, req: "Sem requisito mínimo", color: "#cd7f32", w: "20%" },
  { name: "Júnior", fee: 18, req: "20 extras · Avaliação 4,5", color: "#9ca3af", w: "18%" },
  { name: "Intermediário", fee: 16, req: "100 extras · 6 meses · Avaliação 4,7", color: "#fbbf24", w: "16%" },
  { name: "Sênior", fee: 12, req: "300 extras · 12 meses · Avaliação 4,8+", color: "#7CFC00", w: "12%" },
  { name: "Elite", fee: 10, req: "Perfil validado · Comparecimento 98%+", color: "#00E5FF", w: "10%" },
];

const SUBSCRIPTIONS = [
  {
    name: "PRO", price: "R$ 19,90", period: "/mês",
    color: "#7CFC00", bg: "rgba(124,252,0,0.06)", border: "rgba(124,252,0,0.2)",
    items: ["Maior visibilidade na busca", "Badge PRO no perfil", "Estatísticas avançadas", "Alertas antecipados de extras"],
  },
  {
    name: "PREMIUM", price: "R$ 49,90", period: "/mês",
    color: "#00E5FF", bg: "rgba(0,229,255,0.07)", border: "rgba(0,229,255,0.22)",
    featured: true,
    items: ["Tudo do PRO", "Destaque prioritário", "Analytics detalhado", "Acesso a extras exclusivos", "Suporte dedicado"],
  },
  {
    name: "ELITE", price: "R$ 99,90", period: "/mês",
    color: "#a855f7", bg: "rgba(168,85,247,0.07)", border: "rgba(168,85,247,0.22)",
    items: ["Tudo do PREMIUM", "Badge ELITE", "Matching inteligente", "Gestão de agenda", "Account manager"],
  },
];

const CAP_TABLE = [
  { name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", pct: 30, color: "#7CFC00" },
  { name: "Jean Carlos Dick", role: "CMO & Co-Founder", pct: 20, color: "#00E5FF" },
  { name: "Qaialla Pereira", role: "CCO & Co-Founder", pct: 10, color: "#a855f7" },
  { name: "Pool de Executivos e Talentos", role: "Equipe", pct: 5, color: "#f59e0b" },
  { name: "Reserva Estratégica", role: "Companhia", pct: 5, color: "#64748b" },
  { name: "Pool de Investidores", role: "Investidores Estratégicos", pct: 30, color: "#f472b6" },
];

const ROADMAP = [
  { phase: "01", title: "Validação Regional", desc: "MVP validado, primeiros usuários e parceiros ativos.", color: "#7CFC00", done: true },
  { phase: "02", title: "Expansão Sul", desc: "Crescimento para os principais mercados do Sul do Brasil.", color: "#00E5FF", done: false },
  { phase: "03", title: "Expansão Nacional", desc: "Abertura acelerada para capitais e grandes cidades.", color: "#fbbf24", done: false },
  { phase: "04", title: "Rede de Representantes", desc: "27 representantes estaduais ativos em todo o território.", color: "#a855f7", done: false },
  { phase: "05", title: "Ecossistema Financeiro", desc: "Produtos financeiros, cartão e conta para profissionais.", color: "#f472b6", done: false },
  { phase: "06", title: "IA para Matching", desc: "Inteligência artificial para matching preciso e previsivo.", color: "#22d3ee", done: false },
  { phase: "07", title: "Liderança Nacional", desc: "Posição consolidada como infraestrutura de mão de obra do Brasil.", color: "#4ade80", done: false },
];

const TEAM = [
  {
    name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", photo: "/team-leonardo.jpg",
    equity: "30%", color: "#7CFC00",
    bio: "Responsável pela visão estratégica, produto, operações e expansão nacional. Experiência em gestão operacional, hotelaria, liderança de equipes e desenvolvimento de negócios.",
  },
  {
    name: "Jean Carlos Dick", role: "CMO & Co-Founder", photo: "/team-jean.jpg",
    equity: "20%", color: "#00E5FF",
    bio: "Fundador da MyAds. Responsável por branding, marketing, growth, aquisição de usuários e posicionamento estratégico da marca.",
  },
  {
    name: "Qaialla Pereira", role: "CCO & Co-Founder", photo: "/team-qaialla.jpg",
    equity: "10%", color: "#a855f7",
    bio: "Responsável pela expansão comercial, parcerias estratégicas, relacionamento corporativo e desenvolvimento de mercado.",
  },
];

const COMPETITIVE = [
  { label: "Reputação Validada", wpp: false, agency: "partial", site: false, generic: "partial", extrag0: true },
  { label: "Geolocalização Real", wpp: false, agency: false, site: false, generic: "partial", extrag0: true },
  { label: "Progressão de Carreira", wpp: false, agency: false, site: false, generic: false, extrag0: true },
  { label: "Sistema de Indicações", wpp: false, agency: false, site: false, generic: false, extrag0: true },
  { label: "Analytics & KPIs", wpp: false, agency: "partial", site: false, generic: "partial", extrag0: true },
  { label: "Gestão Financeira", wpp: false, agency: false, site: false, generic: false, extrag0: true },
  { label: "Ecossistema Completo", wpp: false, agency: false, site: false, generic: false, extrag0: true },
];

const SOLUTION_FEATURES = [
  { icon: <MapPin size={20} />, title: "Geolocalização em Tempo Real", desc: "Busca por raio de distância conectando empresas aos profissionais mais próximos com disponibilidade imediata.", color: "#7CFC00" },
  { icon: <Star size={20} />, title: "Sistema de Reputação", desc: "Avaliações verificadas e histórico profissional que geram confiança real entre todas as partes do ecossistema.", color: "#00E5FF" },
  { icon: <TrendingUp size={20} />, title: "Progressão de Carreira", desc: "Níveis de Iniciante a Elite com benefícios crescentes, incentivando qualidade e fidelização de longo prazo.", color: "#fbbf24" },
  { icon: <Wallet size={20} />, title: "Carteira Digital & Financeiro", desc: "Gestão financeira integrada, pagamentos via PIX e analytics operacional para decisões baseadas em dados.", color: "#a855f7" },
  { icon: <MessageCircle size={20} />, title: "Chat em Tempo Real", desc: "Comunicação instantânea entre empresas e profissionais com histórico completo de interações.", color: "#f472b6" },
  { icon: <GitBranch size={20} />, title: "Sistema de Indicações", desc: "Links e códigos exclusivos que geram receita recorrente para usuários que indicam novos profissionais.", color: "#4ade80" },
];

export default function InvestidoresParceirosPage() {
  const [navScrolled, setNavScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden" style={{ background: "#04080f" }}>

      {/* ── Sticky Navbar ── */}
      <motion.header
        style={{ backgroundImage: `url(${navbarBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${navScrolled ? "border-b border-white/8 shadow-[0_4px_32px_rgba(0,0,0,0.6)]" : "border-b border-white/[0.05]"}`}
        animate={{ backdropFilter: navScrolled ? "blur(28px)" : "blur(18px)" }}
      >
        <div className="flex items-center justify-between px-5 sm:px-10 py-3 max-w-7xl mx-auto">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-6 object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {[
              { href: "#problema", label: "Problema" },
              { href: "#solucao", label: "Solução" },
              { href: "#modelo", label: "Modelo" },
              { href: "#equipe", label: "Equipe" },
              { href: "#roadmap", label: "Roadmap" },
            ].map(item => (
              <a key={item.href} href={item.href} className="text-white/50 hover:text-white transition-colors duration-200">{item.label}</a>
            ))}
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-xs">← Voltar</Link>
          </nav>
          <a href="mailto:investidores@extrag0.com.br">
            <Button className="rounded-full px-5 h-9 text-sm font-bold text-black border-none"
              style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c 55%,#00E5FF)", boxShadow: "0 0 20px rgba(124,252,0,0.3)" }}>
              Falar com a Equipe
            </Button>
          </a>
        </div>
      </motion.header>

      <main className="flex-1">

        {/* ══════════════════════════════════════════
            HERO — Full bleed background
        ══════════════════════════════════════════ */}
        <section className="relative min-h-[92vh] flex items-center overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.06, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/investors-bg.png)" }}
            />
            {/* Layered overlays for readability without killing the image */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(4,8,15,0.92) 0%, rgba(4,8,15,0.75) 45%, rgba(4,8,15,0.45) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,8,15,0.3) 0%, transparent 40%, rgba(4,8,15,0.85) 100%)" }} />
          </div>

          {/* Hero content — left-aligned so it never overlaps the map */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-24 w-full">
            <div className="max-w-[580px]">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.14em] uppercase mb-7"
                style={{ background: "rgba(124,252,0,0.12)", border: "1px solid rgba(124,252,0,0.3)", color: "#7CFC00" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Pitch Deck · Série Seed 2025
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.42 }}
                className="text-xs sm:text-sm font-bold text-white/40 uppercase tracking-[0.18em] mb-4"
              >
                extraGO Workforce Technology
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.5 }}
                className="text-[42px] sm:text-[58px] lg:text-[68px] font-black leading-[1.0] tracking-tight mb-6"
              >
                A Infraestrutura<br />
                de Mão de Obra<br />
                <span style={{ background: "linear-gradient(90deg,#7CFC00 0%,#9aff1c 40%,#00E5FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  do Brasil.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
                className="text-base sm:text-lg text-white/60 mb-10 leading-relaxed max-w-[500px]"
              >
                Uma plataforma inteligente que conecta empresas e profissionais, centralizando todo o ecossistema de contratação temporária em uma única infraestrutura escalável.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.78 }}
                className="flex flex-wrap gap-3"
              >
                <a href="mailto:investidores@extrag0.com.br">
                  <Button size="lg" className="rounded-full font-bold px-8 h-12 border-none text-black"
                    style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)", boxShadow: "0 0 32px rgba(124,252,0,0.45)" }}>
                    Investir na extraGO <ArrowRight size={16} className="ml-1" />
                  </Button>
                </a>
                <a href="mailto:parcerias@extrag0.com.br">
                  <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-12 border-white/20 text-white hover:bg-white/6 hover:border-white/35">
                    Tornar-se Parceiro
                  </Button>
                </a>
                <a href="#problema">
                  <Button size="lg" variant="ghost" className="rounded-full font-bold px-6 h-12 text-white/50 hover:text-white hover:bg-white/5">
                    Ver o Projeto <ChevronDown size={15} className="ml-1" />
                  </Button>
                </a>
              </motion.div>

              {/* Key stats row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.92 }}
                className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/8"
              >
                {[
                  { value: "74M", label: "Trabalhadores flexíveis no Brasil" },
                  { value: "R$ 300Bi", label: "TAM estimado do setor" },
                  { value: "85%", label: "Contratações ainda informais" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                    <p className="text-[11px] text-white/40 mt-0.5 leading-tight max-w-[130px]">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 hidden md:flex"
          >
            <span className="text-[9px] text-white/25 tracking-widest uppercase">Rolar</span>
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}>
              <ChevronDown size={14} className="text-white/25" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Vision strip ── */}
        <div className="relative overflow-hidden" style={{ background: "rgba(124,252,0,0.04)", borderTop: "1px solid rgba(124,252,0,0.1)", borderBottom: "1px solid rgba(124,252,0,0.08)" }}>
          <div className="max-w-5xl mx-auto px-6 py-5">
            <p className="text-center text-xs sm:text-sm font-semibold text-white/50 leading-relaxed">
              "Uber transformou o transporte.&nbsp; Airbnb transformou a hospedagem.&nbsp; LinkedIn transformou o networking profissional.&nbsp;
              <span className="text-primary font-bold">A extraGO está construindo a infraestrutura nacional de mão de obra do Brasil.</span>"
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            PROBLEMA
        ══════════════════════════════════════════ */}
        <section id="problema" className="px-6 sm:px-10 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <Rev className="text-center mb-16">
              <SectionLabel color="#f43f5e"><Target size={10} /> O Problema</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-black mb-5 leading-tight">
                Um Mercado de Bilhões<br />
                <span className="text-white/40">Operando no Escuro</span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
                Milhões de contratações temporárias acontecem de forma informal no Brasil — via WhatsApp, indicações manuais e processos descentralizados. O resultado é um mercado fragmentado, ineficiente e sem rastreabilidade.
              </p>
            </Rev>

            {/* Market stats — 3 big numbers */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-16">
              {[
                { value: "74M", label: "Trabalhadores flexíveis no Brasil", color: "#7CFC00" },
                { value: "R$30Bi+", label: "Mercado potencial endereçável", color: "#00E5FF" },
                { value: "85%", label: "Das contratações ainda informais", color: "#f43f5e" },
              ].map((s, i) => (
                <Rev key={i} delay={i * 0.08}>
                  <Glass className="p-5 sm:p-8 text-center h-full">
                    <p className="text-3xl sm:text-5xl lg:text-6xl font-black mb-2" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs sm:text-sm text-white/45 leading-snug">{s.label}</p>
                  </Glass>
                </Rev>
              ))}
            </div>

            {/* Problem split */}
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <Building2 size={22} />, title: "Para Empresas", color: "#00E5FF",
                  items: [
                    "Dificuldade para encontrar profissionais qualificados rapidamente",
                    "Ausência de histórico e reputação confiável",
                    "Baixa previsibilidade operacional",
                    "Processos manuais e lentos",
                    "Custos elevados de recrutamento tradicional",
                  ],
                },
                {
                  icon: <Users size={22} />, title: "Para Profissionais", color: "#7CFC00",
                  items: [
                    "Falta de oportunidades recorrentes e previsíveis",
                    "Baixa valorização e reconhecimento profissional",
                    "Ausência de reputação validada digitalmente",
                    "Pouca previsibilidade financeira",
                    "Dificuldade de crescimento de carreira estruturado",
                  ],
                },
              ].map((side, i) => (
                <Rev key={i} delay={i * 0.1}>
                  <Glass className="p-6 sm:p-8 h-full" accent={`linear-gradient(90deg, transparent, ${side.color}30, transparent)`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${side.color}15`, border: `1px solid ${side.color}28` }}>
                        <span style={{ color: side.color }}>{side.icon}</span>
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: side.color }}>{side.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {side.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: side.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Glass>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SOLUÇÃO
        ══════════════════════════════════════════ */}
        <section id="solucao" className="relative overflow-hidden">
          {/* Background slice with the investors image */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-12" style={{ backgroundImage: "url(/investors-bg.png)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04080f 0%, rgba(4,8,15,0.7) 30%, rgba(4,8,15,0.7) 70%, #04080f 100%)" }} />
          </div>
          <div className="relative z-10 px-6 sm:px-10 py-20 sm:py-28">
            <div className="max-w-6xl mx-auto">
              <Rev className="text-center mb-16">
                <SectionLabel color="#7CFC00"><Zap size={10} /> A Solução</SectionLabel>
                <h2 className="text-3xl sm:text-5xl font-black mb-5 leading-tight">
                  Uma Plataforma Completa.<br />
                  <span style={{ background: "linear-gradient(90deg,#7CFC00,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Um Ecossistema Escalável.
                  </span>
                </h2>
                <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">
                  A extraGO centraliza todo o ecossistema de contratação temporária em uma única plataforma inteligente — eliminando a informalidade e criando previsibilidade para empresas e profissionais em todo o Brasil.
                </p>
              </Rev>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SOLUTION_FEATURES.map((f, i) => (
                  <Rev key={i} delay={i * 0.07}>
                    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="p-5 rounded-2xl border border-white/8 h-full cursor-default group"
                      style={{ background: "rgba(6,11,18,0.7)", backdropFilter: "blur(16px)" }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                        style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                        <span style={{ color: f.color }}>{f.icon}</span>
                      </div>
                      <h4 className="font-bold text-sm mb-2 text-white/90">{f.title}</h4>
                      <p className="text-xs text-white/48 leading-relaxed">{f.desc}</p>
                    </motion.div>
                  </Rev>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MERCADO — TAM SAM SOM
        ══════════════════════════════════════════ */}
        <section className="px-6 sm:px-10 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Rev>
                <SectionLabel color="#fbbf24"><Globe size={10} /> Mercado</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight">
                  Um Oceano Azul<br />de Oportunidades
                </h2>
                <p className="text-white/50 text-base leading-relaxed mb-8">
                  A extraGO atua em múltiplos setores com alta demanda por mão de obra flexível. O mercado de trabalho temporário no Brasil cresce consistentemente, impulsionado pela digitalização e pela economia sob demanda.
                </p>
                {/* Sectors */}
                <div className="flex flex-wrap gap-2">
                  {["🏨 Hotelaria", "🍽️ Gastronomia", "🎉 Eventos", "✈️ Turismo", "🍸 Bares", "🎭 Entretenimento", "🤝 Serviços", "💼 Freelancers"].map((s, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-white/55 font-medium">{s}</span>
                  ))}
                </div>
              </Rev>

              <div className="space-y-4">
                {[
                  { label: "TAM", sub: "Trabalho flexível total no Brasil", value: "R$ 300 Bi", w: "100%", color: "#7CFC00" },
                  { label: "SAM", sub: "Setores atendidos pela plataforma", value: "R$ 90 Bi", w: "65%", color: "#00E5FF" },
                  { label: "SOM", sub: "Meta de captura em 5 anos", value: "R$ 9 Bi", w: "25%", color: "#fbbf24" },
                ].map((item, i) => (
                  <Rev key={i} delay={i * 0.1}>
                    <Glass className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-xs font-black tracking-widest uppercase" style={{ color: item.color }}>{item.label}</span>
                          <p className="text-xs text-white/40 mt-0.5">{item.sub}</p>
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-white whitespace-nowrap">{item.value}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: item.w }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 + 0.4, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
                        />
                      </div>
                    </Glass>
                  </Rev>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MODELO DE NEGÓCIO
        ══════════════════════════════════════════ */}
        <section id="modelo" className="px-6 sm:px-10 py-20 sm:py-28" style={{ background: "rgba(124,252,0,0.025)", borderTop: "1px solid rgba(124,252,0,0.07)", borderBottom: "1px solid rgba(124,252,0,0.07)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="text-center mb-16">
              <SectionLabel color="#7CFC00"><DollarSign size={10} /> Modelo de Negócio</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-black mb-5">Receita Recorrente<br />com Incentivos de Qualidade</h2>
              <p className="text-white/50 max-w-2xl mx-auto text-base leading-relaxed">
                Taxa de intermediação sobre serviços concluídos, criando alinhamento de incentivos entre plataforma, empresas e profissionais. O modelo de níveis progressivos reduz a taxa conforme o profissional avança.
              </p>
            </Rev>

            {/* Career levels — horizontal bars */}
            <Rev delay={0.1} className="mb-14">
              <Glass className="p-6 sm:p-8" accent="linear-gradient(90deg, transparent, rgba(124,252,0,0.35), transparent)">
                <p className="text-xs font-black tracking-widest uppercase text-white/35 mb-6">Taxa de Intermediação por Nível</p>
                <div className="space-y-4">
                  {LEVELS.map((level, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-28 sm:w-36 flex-shrink-0">
                        <p className="text-sm font-bold leading-tight" style={{ color: level.color }}>{level.name}</p>
                        <p className="text-[10px] text-white/30 leading-tight mt-0.5 hidden sm:block">{level.req}</p>
                      </div>
                      <div className="flex-1 h-8 rounded-xl bg-white/4 overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: level.w }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 + 0.3, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                          className="h-full rounded-xl flex items-center justify-end pr-3"
                          style={{ background: `linear-gradient(90deg, ${level.color}40, ${level.color}80)`, borderRight: `2px solid ${level.color}` }}
                        >
                          <span className="text-xs font-black" style={{ color: level.color }}>{level.fee}%</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="text-[11px] text-white/30 mt-5">Quanto mais o profissional cresce → menor a taxa → maior a retenção → melhor qualidade para as empresas.</p>
              </Glass>
            </Rev>

            {/* Referral + Subscriptions side by side */}
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              {/* Referral */}
              <Rev delay={0.05}>
                <Glass className="p-6 sm:p-8 h-full" accent="linear-gradient(90deg, transparent, rgba(124,252,0,0.3), transparent)">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/22 flex items-center justify-center">
                      <Network size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Sistema de Indicações</h3>
                      <p className="text-[11px] text-white/40">Crescimento orgânico recorrente</p>
                    </div>
                  </div>
                  <div className="text-center py-5 mb-5 rounded-xl" style={{ background: "rgba(124,252,0,0.07)", border: "1px solid rgba(124,252,0,0.15)" }}>
                    <p className="text-5xl font-black text-primary">3%</p>
                    <p className="text-xs text-white/45 mt-1">de participação recorrente<br />sobre cada serviço do indicado</p>
                  </div>
                  <ul className="space-y-2.5">
                    {["Crescimento viral orgânico", "CAC progressivamente reduzido", "Receita recorrente para usuários", "Efeito de rede acelerado"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-white/55">
                        <CheckCircle size={12} className="text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Glass>
              </Rev>

              {/* Financial distribution */}
              <Rev delay={0.1}>
                <Glass className="p-6 sm:p-8 h-full" accent="linear-gradient(90deg, transparent, rgba(0,229,255,0.25), transparent)">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-secondary/12 border border-secondary/22 flex items-center justify-center">
                      <BarChart3 size={18} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Distribuição Operacional</h3>
                      <p className="text-[11px] text-white/40">Alocação da receita gerada</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Caixa e Reserva", pct: 35, color: "#7CFC00" },
                      { label: "Marketing e Crescimento", pct: 20, color: "#00E5FF" },
                      { label: "Representantes Estaduais", pct: 15, color: "#fbbf24" },
                      { label: "Tecnologia e Infra", pct: 10, color: "#a855f7" },
                      { label: "Equipe e Operações", pct: 10, color: "#f472b6" },
                      { label: "Fundo de Expansão + Indicações", pct: 10, color: "#4ade80" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                        <span className="text-xs text-white/65 flex-1 truncate">{item.label}</span>
                        <span className="text-xs font-black flex-shrink-0" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              </Rev>
            </div>

            {/* Subscription plans */}
            <Rev delay={0.15}>
              <p className="text-xs font-black tracking-widest uppercase text-white/30 text-center mb-5">Planos de Assinatura (Receita Recorrente Adicional)</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {SUBSCRIPTIONS.map((plan, i) => (
                  <motion.div key={i}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                    className="relative rounded-2xl p-6 border cursor-default overflow-hidden"
                    style={{ background: plan.bg, borderColor: plan.border, boxShadow: plan.featured ? `0 0 40px ${plan.color}20` : "none" }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${plan.color}50, transparent)` }} />
                    {plan.featured && (
                      <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full text-black" style={{ background: plan.color }}>POPULAR</div>
                    )}
                    <p className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: plan.color }}>{plan.name}</p>
                    <p className="text-3xl font-black text-white mb-0.5">{plan.price}<span className="text-sm font-normal text-white/40">{plan.period}</span></p>
                    <div className="h-px bg-white/6 my-4" />
                    <ul className="space-y-2">
                      {plan.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-white/55">
                          <span className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: plan.color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            COMPETITIVE ADVANTAGE
        ══════════════════════════════════════════ */}
        <section className="px-6 sm:px-10 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto">
            <Rev className="text-center mb-12">
              <SectionLabel color="#00E5FF"><Shield size={10} /> Diferenciais</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-black mb-5">Por Que a extraGO Vence</h2>
              <p className="text-white/50 max-w-xl mx-auto text-base leading-relaxed">
                Enquanto o mercado ainda opera de forma fragmentada, a extraGO oferece o primeiro ecossistema completo e integrado para contratação de mão de obra flexível no Brasil.
              </p>
            </Rev>
            <Rev delay={0.1}>
              <Glass className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-xs">
                    <thead>
                      <tr className="border-b border-white/6">
                        <th className="text-left px-5 py-4 text-white/40 font-semibold text-[11px] uppercase tracking-wider">Recurso</th>
                        {["WhatsApp", "Agências", "Sites", "Genéricas", "extraGO"].map((col, i) => (
                          <th key={i} className={`px-4 py-4 text-center font-bold text-[11px] uppercase tracking-wider ${col === "extraGO" ? "text-primary" : "text-white/30"}`}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPETITIVE.map((row, i) => (
                        <tr key={i} className="border-b border-white/4 hover:bg-white/[0.015] transition-colors">
                          <td className="px-5 py-3.5 text-white/65 font-medium">{row.label}</td>
                          {[row.wpp, row.agency, row.site, row.generic, row.extrag0].map((val, j) => (
                            <td key={j} className="px-4 py-3.5 text-center">
                              {val === true ? (
                                <span className={j === 4 ? "text-primary font-black text-sm" : "text-green-400"}>✓</span>
                              ) : val === "partial" ? (
                                <span className="text-yellow-400/60 text-[10px]">Parcial</span>
                              ) : (
                                <span className="text-white/15">✕</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-white/5">
                  <p className="text-[11px] text-white/35">A extraGO é a única plataforma que combina todos esses recursos em um único ecossistema integrado.</p>
                </div>
              </Glass>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            EXPANSÃO NACIONAL — image background slice
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-18" style={{ backgroundImage: "url(/investors-bg.png)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04080f 0%, rgba(4,8,15,0.55) 30%, rgba(4,8,15,0.55) 70%, #04080f 100%)" }} />
          </div>
          <div className="relative z-10 px-6 sm:px-10">
            <div className="max-w-6xl mx-auto">
              <Rev className="text-center mb-16">
                <SectionLabel color="#fbbf24"><MapPin size={10} /> Expansão Nacional</SectionLabel>
                <h2 className="text-3xl sm:text-5xl font-black mb-5">
                  Um Representante<br />
                  <span className="text-white/40">por Estado</span>
                </h2>
                <p className="text-white/50 max-w-xl mx-auto text-base leading-relaxed">
                  A expansão da extraGO será conduzida por uma rede de representantes estaduais responsáveis pelo crescimento regional, parcerias estratégicas e fortalecimento da marca.
                </p>
              </Rev>

              <div className="grid sm:grid-cols-3 gap-5 mb-10">
                <Rev>
                  <Glass className="p-8 text-center" accent="linear-gradient(90deg,transparent,rgba(251,191,36,0.3),transparent)">
                    <p className="text-7xl font-black mb-2" style={{ background: "linear-gradient(135deg,#fbbf24,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>27</p>
                    <p className="text-sm text-white/50">estados cobertos</p>
                    <p className="text-xs text-white/30 mt-1">todo o território nacional</p>
                  </Glass>
                </Rev>
                <Rev delay={0.08}>
                  <Glass className="p-8 text-center">
                    <p className="text-7xl font-black mb-2 text-primary">1</p>
                    <p className="text-sm text-white/50">representante</p>
                    <p className="text-xs text-white/30 mt-1">exclusivo por estado</p>
                  </Glass>
                </Rev>
                <Rev delay={0.16}>
                  <Glass className="p-8 text-center" accent="linear-gradient(90deg,transparent,rgba(0,229,255,0.25),transparent)">
                    <p className="text-7xl font-black mb-2 text-secondary">15%</p>
                    <p className="text-sm text-white/50">da receita operacional</p>
                    <p className="text-xs text-white/30 mt-1">para representantes estaduais</p>
                  </Glass>
                </Rev>
              </div>

              <Rev delay={0.2}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { icon: <TrendingUp size={18} />, label: "Crescimento Regional", color: "#7CFC00" },
                    { icon: <Briefcase size={18} />, label: "Parcerias Estratégicas", color: "#00E5FF" },
                    { icon: <Target size={18} />, label: "Desenvolvimento Comercial", color: "#fbbf24" },
                    { icon: <Zap size={18} />, label: "Expansão Operacional", color: "#a855f7" },
                    { icon: <Star size={18} />, label: "Fortalecimento da Marca", color: "#f472b6" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/7 bg-white/[0.02] text-center hover:border-white/14 transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-white/60 leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ADMIN ECOSYSTEM
        ══════════════════════════════════════════ */}
        <section className="px-6 sm:px-10 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Rev>
                <SectionLabel color="#a855f7"><Cpu size={10} /> Ecossistema Administrativo</SectionLabel>
                <h2 className="text-3xl sm:text-4xl font-black mb-5">Governança Total.<br />Em Tempo Real.</h2>
                <p className="text-white/50 text-base leading-relaxed mb-6">
                  A plataforma possui uma estrutura completa de governança com controle total sobre cada região, usuário e métrica operacional — construída para escalar para milhões de usuários.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <BarChart3 size={15} />, label: "Analytics em Tempo Real", color: "#7CFC00" },
                    { icon: <Globe size={15} />, label: "Gestão Regional", color: "#00E5FF" },
                    { icon: <DollarSign size={15} />, label: "Gestão Financeira", color: "#fbbf24" },
                    { icon: <Users size={15} />, label: "Gestão de Usuários", color: "#a855f7" },
                    { icon: <MapPin size={15} />, label: "Mapa Interativo Brasil", color: "#f472b6" },
                    { icon: <Shield size={15} />, label: "Sistema de Auditoria", color: "#4ade80" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-white/6 bg-white/[0.025]">
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <span className="text-xs text-white/60 font-medium leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </Rev>
              <Rev delay={0.12}>
                <Glass className="p-6 sm:p-8" accent="linear-gradient(90deg,transparent,rgba(168,85,247,0.3),transparent)">
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-5">Stack Tecnológico</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { tech: "React + TypeScript", desc: "Frontend moderno e performático", color: "#00E5FF" },
                      { tech: "PostgreSQL", desc: "Backend escalável com dados em tempo real", color: "#7CFC00" },
                      { tech: "Cloud Nativo", desc: "Infraestrutura elástica e de alta disponibilidade", color: "#fbbf24" },
                      { tech: "Mobile First", desc: "Experiência otimizada para dispositivos móveis", color: "#a855f7" },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border border-white/6 bg-white/[0.02]">
                        <p className="text-sm font-bold mb-1" style={{ color: item.color }}>{item.tech}</p>
                        <p className="text-[11px] text-white/40 leading-snug">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </Glass>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            LEADERSHIP
        ══════════════════════════════════════════ */}
        <section id="equipe" className="px-6 sm:px-10 py-20 sm:py-28" style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="text-center mb-16">
              <SectionLabel color="#a855f7"><Users size={10} /> Liderança</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-black mb-5">Quem Está Construindo<br />o Futuro</h2>
              <p className="text-white/45 max-w-lg mx-auto text-base leading-relaxed">Uma equipe com experiência multidisciplinar, comprometida com a visão de longo prazo da extraGO.</p>
            </Rev>

            <div className="grid sm:grid-cols-3 gap-6">
              {TEAM.map((member, i) => (
                <Rev key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="relative rounded-2xl overflow-hidden border border-white/8 group cursor-default"
                    style={{ background: "rgba(6,11,18,0.9)" }}
                  >
                    {/* Top color line */}
                    <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${member.color}, transparent)` }} />

                    <div className="p-6 sm:p-7">
                      {/* Photo */}
                      <div className="relative w-20 h-20 mx-auto mb-5">
                        <div className="absolute inset-0 rounded-full blur-lg opacity-25 scale-110" style={{ background: member.color }} />
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="relative w-20 h-20 rounded-full object-cover ring-2"
                          style={{ ringColor: `${member.color}50` }}
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0a1628&color=7CFC00&size=80`; }}
                        />
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black text-black" style={{ background: `linear-gradient(135deg,${member.color},${member.color}aa)` }}>
                          {member.equity}
                        </div>
                      </div>

                      <div className="text-center mb-4">
                        <h3 className="font-bold text-base mb-1 leading-tight">{member.name}</h3>
                        <p className="text-xs font-bold tracking-wide" style={{ color: member.color }}>{member.role}</p>
                      </div>

                      <p className="text-xs text-white/48 text-center leading-relaxed">{member.bio}</p>

                      {/* Equity bar */}
                      <div className="mt-5 pt-4 border-t border-white/6">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-white/35">Participação</span>
                          <span className="font-bold" style={{ color: member.color }}>{member.equity}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${parseInt(member.equity) * 3.33}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 0.5, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: member.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CAP TABLE
        ══════════════════════════════════════════ */}
        <section className="px-6 sm:px-10 py-20 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <Rev className="text-center mb-12">
              <SectionLabel color="#fbbf24"><Layers size={10} /> Estrutura Societária</SectionLabel>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Distribuição de Participações</h2>
              <p className="text-white/45 max-w-lg mx-auto text-sm leading-relaxed">A extraGO reserva até 30% do capital para investidores estratégicos que desejam participar da construção da principal infraestrutura digital de trabalho flexível do Brasil.</p>
            </Rev>
            <Rev delay={0.1}>
              <Glass className="p-6 sm:p-10">
                <div className="space-y-5">
                  {CAP_TABLE.map((entry, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color, boxShadow: `0 0 8px ${entry.color}55` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-1.5">
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-white/85 block truncate">{entry.name}</span>
                            <span className="text-[10px] text-white/30">{entry.role}</span>
                          </div>
                          <span className="text-base font-black flex-shrink-0" style={{ color: entry.color }}>{entry.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${entry.pct * 3.33}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 + 0.3, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: entry.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Investor callout */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mt-7 p-5 rounded-xl"
                  style={{ background: "rgba(244,114,182,0.07)", border: "1px solid rgba(244,114,182,0.2)" }}
                >
                  <div className="flex items-start gap-3">
                    <Award size={16} className="text-pink-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-pink-400 mb-1">Até 30% reservado para investidores estratégicos</p>
                      <p className="text-xs text-white/45 leading-relaxed">Os recursos captados serão direcionados para expansão nacional, tecnologia e inovação, marketing e aquisição, estruturação operacional, rede de representantes, novos produtos financeiros e inteligência artificial para matching inteligente.</p>
                    </div>
                  </div>
                </motion.div>
              </Glass>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ROADMAP
        ══════════════════════════════════════════ */}
        <section id="roadmap" className="px-6 sm:px-10 py-20 sm:py-28" style={{ background: "rgba(0,229,255,0.018)", borderTop: "1px solid rgba(0,229,255,0.07)", borderBottom: "1px solid rgba(0,229,255,0.07)" }}>
          <div className="max-w-5xl mx-auto">
            <Rev className="text-center mb-16">
              <SectionLabel color="#00E5FF"><TrendingUp size={10} /> Roadmap</SectionLabel>
              <h2 className="text-3xl sm:text-5xl font-black mb-5">A Jornada Rumo<br />à Liderança Nacional</h2>
              <p className="text-white/45 max-w-xl mx-auto text-base leading-relaxed">Cada fase consolida o mercado e maximiza o valor entregue a profissionais, empresas e investidores.</p>
            </Rev>

            {/* Timeline — horizontal scroll on mobile */}
            <div className="relative">
              {/* Horizontal connector */}
              <div className="absolute top-8 left-8 right-8 h-px hidden sm:block" style={{ background: "linear-gradient(90deg, rgba(124,252,0,0.4), rgba(0,229,255,0.3), rgba(168,85,247,0.2))" }} />

              <div className="grid sm:grid-cols-7 gap-4">
                {ROADMAP.map((item, i) => (
                  <Rev key={i} delay={i * 0.06}>
                    <div className="flex flex-col items-center text-center">
                      {/* Phase dot */}
                      <div className="relative z-10 w-16 h-16 rounded-2xl flex flex-col items-center justify-center mb-4 border transition-all"
                        style={{
                          background: item.done ? `${item.color}18` : "rgba(255,255,255,0.04)",
                          borderColor: item.done ? `${item.color}50` : "rgba(255,255,255,0.1)",
                          boxShadow: item.done ? `0 0 20px ${item.color}30` : "none",
                        }}>
                        <span className="text-[10px] font-black" style={{ color: item.done ? item.color : "#ffffff30" }}>{item.phase}</span>
                        {item.done && <CheckCircle size={10} style={{ color: item.color }} className="mt-0.5" />}
                      </div>
                      <p className="text-[11px] font-bold text-white/75 leading-tight mb-1">{item.title}</p>
                      <p className="text-[10px] text-white/35 leading-tight hidden sm:block">{item.desc}</p>
                    </div>
                  </Rev>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            VISION — full bleed background
        ══════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-22" style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "center 30%" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04080f 0%, rgba(4,8,15,0.6) 30%, rgba(4,8,15,0.55) 70%, #04080f 100%)" }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center">
            <Rev>
              <SectionLabel color="#7CFC00"><Sparkles size={10} /> Visão</SectionLabel>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                Somos a infraestrutura<br />
                <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c 40%,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  que o trabalho do futuro
                </span><br />
                está esperando.
              </h2>
              <p className="text-base sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
                Uber transformou o transporte. Airbnb transformou a hospedagem. LinkedIn transformou o networking profissional. <strong className="text-white/80">A extraGO está construindo a infraestrutura nacional de mão de obra do Brasil.</strong>
              </p>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            INVESTOR CTA
        ══════════════════════════════════════════ */}
        <section className="px-6 sm:px-10 pb-24 sm:pb-32">
          <div className="max-w-4xl mx-auto">
            <Rev>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center">
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(124,252,0,0.09),rgba(4,8,15,0.98) 55%,rgba(0,229,255,0.06))" }} />
                <div className="absolute inset-0 border border-primary/14 rounded-3xl" />
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(124,252,0,0.5),transparent)" }} />
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(124,252,0,0.07) 0%,transparent 70%)", filter: "blur(40px)" }} />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.14em] uppercase mb-6"
                    style={{ background: "rgba(124,252,0,0.1)", border: "1px solid rgba(124,252,0,0.25)", color: "#7CFC00" }}>
                    <Sparkles size={10} /> Oportunidade de Investimento · Série Seed
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black mb-5 leading-tight">
                    Faça parte da construção<br />
                    <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      da infraestrutura do Brasil.
                    </span>
                  </h2>
                  <p className="text-white/50 mb-10 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                    Conecte-se com nossa equipe para conhecer a oportunidade de investimento, os termos e como participar da expansão nacional da extraGO.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap mb-10">
                    <a href="mailto:investidores@extrag0.com.br">
                      <Button size="lg" className="rounded-full font-bold px-9 h-13 border-none text-black text-base"
                        style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)", boxShadow: "0 0 36px rgba(124,252,0,0.42)" }}>
                        <Mail size={18} className="mr-2" /> Investir na extraGO
                      </Button>
                    </a>
                    <a href="mailto:parcerias@extrag0.com.br">
                      <Button size="lg" variant="outline" className="rounded-full font-bold px-9 h-13 text-base border-white/18 text-white hover:bg-white/5">
                        <Briefcase size={18} className="mr-2" /> Tornar-se Parceiro
                      </Button>
                    </a>
                    <Link href="/register">
                      <Button size="lg" variant="ghost" className="rounded-full font-bold px-9 h-13 text-base text-white/50 hover:text-white hover:bg-white/5">
                        Explorar a Plataforma <ArrowRight size={15} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-white/30">
                    <span className="flex items-center gap-1.5"><Mail size={11} /> investidores@extrag0.com.br</span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-white/15" />
                    <span className="flex items-center gap-1.5"><Globe size={11} /> extrag0.com.br</span>
                  </div>
                </div>
              </div>
            </Rev>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoMain} alt="extraGO" className="h-5 object-contain opacity-70" />
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/" className="hover:text-white/60 transition-colors">← Página Inicial</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Entrar na Plataforma</Link>
            <a href="mailto:contato@extrag0.com.br" className="hover:text-white/60 transition-colors">Contato</a>
          </div>
          <p className="text-[11px] text-white/20">© 2026 extraGO · A Infraestrutura de Mão de Obra do Brasil</p>
        </div>
      </footer>
    </div>
  );
}
