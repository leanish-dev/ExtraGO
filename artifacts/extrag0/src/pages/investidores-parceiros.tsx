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
  Mail, ChevronDown, Shield, Cpu, Wallet,
  MessageCircle, GitBranch, Network, PieChart,
} from "lucide-react";

/* ─── helpers ─── */

function Rev({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

function Glass({ children, className = "", accentColor = "" }: {
  children: React.ReactNode; className?: string; accentColor?: string;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/8 overflow-hidden ${className}`}
      style={{ background: "rgba(5,9,17,0.82)", backdropFilter: "blur(20px) saturate(150%)" }}>
      {accentColor && (
        <div className="absolute top-0 left-0 right-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
      )}
      {children}
    </div>
  );
}

function Tag({ color, icon, children }: { color: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.12em] uppercase mb-4"
      style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}>
      {icon}{children}
    </span>
  );
}

/* ─── data (PDF-exact) ─── */

const FEES = [
  { name: "Iniciante", fee: 18, color: "#9ca3af", barW: "90%" },
  { name: "Júnior", fee: 16, color: "#fbbf24", barW: "80%" },
  { name: "Intermediário", fee: 14, color: "#7CFC00", barW: "70%" },
  { name: "Sênior", fee: 12, color: "#00E5FF", barW: "60%" },
  { name: "Elite", fee: 10, color: "#a855f7", barW: "50%" },
];

const REFERRAL_TIERS = [
  { label: "Indicador", pct: "5%", color: "#7CFC00", desc: "Primeiras indicações ativas" },
  { label: "Embaixador Regional", pct: "7%", color: "#00E5FF", desc: "Rede regional consolidada" },
  { label: "Embaixador Nacional", pct: "10%", color: "#a855f7", desc: "Impacto em escala nacional" },
];

const FINANCIAL_DIST = [
  { label: "Caixa e Reserva Estratégica", pct: 35, color: "#7CFC00" },
  { label: "Marketing e Crescimento", pct: 20, color: "#00E5FF" },
  { label: "Representantes Estaduais", pct: 15, color: "#fbbf24" },
  { label: "Tecnologia e Infraestrutura", pct: 10, color: "#a855f7" },
  { label: "Equipe e Operações", pct: 10, color: "#f472b6" },
  { label: "Fundo de Expansão", pct: 5, color: "#4ade80" },
  { label: "Programa de Indicações", pct: 5, color: "#22d3ee" },
];

const CAP_TABLE = [
  { name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", pct: 30, color: "#7CFC00" },
  { name: "Jean Carlos Dick", role: "CMO & Co-Founder", pct: 20, color: "#00E5FF" },
  { name: "Qaialla Pereira", role: "CCO & Co-Founder", pct: 10, color: "#a855f7" },
  { name: "Reserva para Investidores Estratégicos", role: "Investidores", pct: 20, color: "#f472b6" },
  { name: "Pool de Talentos e Executivos", role: "Equipe", pct: 10, color: "#fbbf24" },
  { name: "Reserva Estratégica da Companhia", role: "Companhia", pct: 10, color: "#64748b" },
];

const TEAM = [
  {
    name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", photo: "/team-leonardo.jpg",
    pct: "30%", color: "#7CFC00",
    bio: "Responsável pela visão estratégica, produto, operações e expansão nacional da extraGO. Experiência em gestão operacional, hotelaria, liderança de equipes e desenvolvimento de negócios.",
  },
  {
    name: "Jean Carlos Dick", role: "CMO & Co-Founder", photo: "/team-jean.jpg",
    pct: "20%", color: "#00E5FF",
    bio: "Fundador da MyAds. Responsável por branding, marketing, growth, aquisição de usuários e posicionamento estratégico da marca.",
  },
  {
    name: "Qaialla Pereira", role: "CCO & Co-Founder", photo: "/team-qaialla.jpg",
    pct: "10%", color: "#a855f7",
    bio: "Responsável pela expansão comercial, parcerias estratégicas, relacionamento corporativo e desenvolvimento de mercado.",
  },
];

const ROADMAP = [
  { n: "01", title: "Validação Regional", color: "#7CFC00", done: true },
  { n: "02", title: "Expansão Sul", color: "#00E5FF", done: false },
  { n: "03", title: "Expansão Nacional", color: "#fbbf24", done: false },
  { n: "04", title: "Rede Nacional de Representantes", color: "#a855f7", done: false },
  { n: "05", title: "Ecossistema Financeiro Completo", color: "#f472b6", done: false },
  { n: "06", title: "IA para Matching Inteligente", color: "#22d3ee", done: false },
  { n: "07", title: "Liderança Nacional no Mercado de Trabalho Flexível", color: "#4ade80", done: false },
];

const SOLUTIONS = [
  { icon: <Globe size={18} />, label: "Marketplace de Extras", color: "#7CFC00" },
  { icon: <MapPin size={18} />, label: "Geolocalização Inteligente", color: "#00E5FF" },
  { icon: <Target size={18} />, label: "Busca por Raio de Distância", color: "#fbbf24" },
  { icon: <MessageCircle size={18} />, label: "Chat em Tempo Real", color: "#a855f7" },
  { icon: <Star size={18} />, label: "Sistema de Reputação", color: "#f472b6" },
  { icon: <TrendingUp size={18} />, label: "Progressão de Carreira", color: "#4ade80" },
  { icon: <Wallet size={18} />, label: "Carteira Digital", color: "#22d3ee" },
  { icon: <Network size={18} />, label: "Sistema de Indicações", color: "#7CFC00" },
  { icon: <BarChart3 size={18} />, label: "Analytics Operacional", color: "#00E5FF" },
  { icon: <Shield size={18} />, label: "Painel Administrativo Nacional", color: "#fbbf24" },
  { icon: <Globe size={18} />, label: "Gestão Regional por Estado", color: "#a855f7" },
];

const MARKETS = ["Hotelaria", "Gastronomia", "Eventos", "Turismo", "Serviços", "Trabalho Temporário", "Freelancers", "Empresas"];

const ADMIN_ITEMS = [
  "Painel Executivo", "Analytics em Tempo Real", "Gestão Financeira", "Gestão Regional",
  "Monitoramento Operacional", "KPIs Nacionais", "Gestão de Usuários",
  "Gestão de Representantes", "Mapa Interativo do Brasil", "Sistema de Auditoria",
];

const INVESTOR_USES = [
  "Expansão nacional", "Tecnologia e inovação", "Marketing e aquisição",
  "Estruturação operacional", "Rede de representantes",
  "Novos produtos financeiros", "Inteligência artificial e matching inteligente",
];

const CONTACT = "extrago.contato@gmail.com";

/* ─── page ─── */

export default function InvestidoresParceirosPage() {
  const [scrolled, setScrolled] = useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#04080f", color: "#fff" }}>

      {/* ── NAV ── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-white/8 shadow-lg" : "border-b border-white/5"}`}
        style={{ backgroundImage: `url(${navbarBg})`, backgroundSize: "cover", backdropFilter: "blur(22px)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-10 h-14">
          <Link href="/"><img src={logoMain} alt="extraGO" className="h-5.5 object-contain" /></Link>
          <nav className="hidden md:flex items-center gap-6 text-[13px]">
            {["#missao:Missão", "#solucao:Solução", "#modelo:Modelo", "#equipe:Equipe", "#roadmap:Roadmap"].map(s => {
              const [href, label] = s.split(":");
              return <a key={href} href={href} className="text-white/45 hover:text-white/90 transition-colors">{label}</a>;
            })}
            <Link href="/" className="text-white/30 hover:text-white/60 transition-colors text-xs">← Voltar</Link>
          </nav>
          <a href={`mailto:${CONTACT}`}>
            <Button className="rounded-full px-5 h-9 text-[13px] font-bold text-black border-none"
              style={{ background: "linear-gradient(135deg,#7CFC00,#00E5FF)", boxShadow: "0 0 18px rgba(124,252,0,0.28)" }}>
              Contato
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1">

        {/* ════════════════════
            HERO
        ════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>
          <div className="absolute inset-0">
            <motion.div className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/investors-bg.png)" }}
              initial={{ scale: 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
            />
            {/* Strong left-side overlay so text is always readable */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(4,8,15,0.96) 0%, rgba(4,8,15,0.88) 38%, rgba(4,8,15,0.55) 60%, rgba(4,8,15,0.28) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,8,15,0.2) 0%, transparent 50%, rgba(4,8,15,0.9) 100%)" }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 flex items-center" style={{ minHeight: "88vh" }}>
            {/* Content constrained to left 55% */}
            <div style={{ maxWidth: 560 }} className="py-20 sm:py-28">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
                <Tag color="#7CFC00" icon={<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}>
                  Investidores &amp; Parceiros
                </Tag>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38, duration: 0.5 }}
                className="text-[11px] font-bold text-white/35 uppercase tracking-[0.2em] mb-3">
                extraGO Workforce Technology
              </motion.p>

              <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.85 }}
                className="font-black leading-[1.03] mb-5"
                style={{ fontSize: "clamp(36px,5.5vw,62px)" }}>
                A Infraestrutura de<br />Mão de Obra
                <span className="block" style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c 45%,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  do Brasil.
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
                className="text-white/55 text-base leading-relaxed mb-8" style={{ maxWidth: 500 }}>
                Uma plataforma tecnológica que conecta empresas e profissionais para contratação de mão de obra flexível, extras e serviços sob demanda — digitalizando um mercado que ainda opera de forma fragmentada.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72, duration: 0.6 }}
                className="flex flex-wrap gap-3">
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" className="rounded-full font-bold px-7 h-11 text-black border-none"
                    style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)", boxShadow: "0 0 28px rgba(124,252,0,0.38)" }}>
                    Investir na extraGO <ArrowRight size={15} className="ml-1.5" />
                  </Button>
                </a>
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" variant="outline" className="rounded-full font-bold px-7 h-11 border-white/18 text-white hover:bg-white/5">
                    Tornar-se Parceiro
                  </Button>
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                className="mt-10 pt-8 border-t border-white/8">
                <a href="#missao" className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors">
                  <ChevronDown size={14} className="animate-bounce" /> Conhecer o projeto
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Quote strip ── */}
        <div className="py-5 px-6 border-y border-white/6" style={{ background: "rgba(124,252,0,0.03)" }}>
          <p className="text-center text-xs sm:text-sm text-white/40 font-medium max-w-3xl mx-auto leading-relaxed">
            Inspirada em modelos como <span className="text-white/65">Uber, LinkedIn, Airbnb, Stripe e Nubank</span>, a extraGO une marketplace, reputação, geolocalização, pagamentos, gamificação e crescimento em rede em um único ecossistema.
          </p>
        </div>

        {/* ════════════════════
            MISSÃO
        ════════════════════ */}
        <section id="missao" className="px-6 sm:px-10 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <Rev>
                <Tag color="#7CFC00"><Sparkles size={10} /> Nossa Missão</Tag>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-4">
                  Transformar o trabalho<br />flexível no Brasil.
                </h2>
                <p className="text-white/52 text-base leading-relaxed">
                  Criar um ambiente mais eficiente, seguro, transparente e escalável para a conexão entre profissionais e empresas em todo o território nacional.
                </p>
              </Rev>
              <Rev delay={0.1}>
                <Glass className="p-6" accentColor="#7CFC00">
                  <p className="text-xs font-black tracking-widest uppercase text-white/30 mb-4">Mercados Atendidos</p>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map(m => (
                      <span key={m} className="text-xs px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-white/58 font-medium">{m}</span>
                    ))}
                  </div>
                </Glass>
              </Rev>
            </div>
          </div>
        </section>

        {/* ════════════════════
            PROBLEMA
        ════════════════════ */}
        <section id="problema" className="px-6 sm:px-10 py-16 sm:py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-10">
              <Tag color="#f43f5e"><Target size={10} /> O Problema</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
                Milhões operando no escuro.
              </h2>
              <p className="text-white/50 text-base max-w-xl">
                Profissionais e empresas enfrentam diariamente um mercado fragmentado, ineficiente e sem rastreabilidade.
              </p>
            </Rev>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <Building2 size={20} />, title: "Para Empresas", color: "#00E5FF",
                  items: ["Dificuldade para contratar rapidamente", "Falta de profissionais qualificados", "Alto custo operacional", "Ausência de histórico profissional confiável", "Baixa previsibilidade"],
                },
                {
                  icon: <Users size={20} />, title: "Para Profissionais", color: "#7CFC00",
                  items: ["Falta de oportunidades recorrentes", "Dependência de grupos informais", "Ausência de reputação validada", "Pouca valorização profissional", "Crescimento limitado"],
                },
              ].map((side, i) => (
                <Rev key={i} delay={i * 0.08}>
                  <Glass className="p-6 h-full" accentColor={side.color}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${side.color}14`, border: `1px solid ${side.color}26` }}>
                        <span style={{ color: side.color }}>{side.icon}</span>
                      </div>
                      <h3 className="font-bold text-base" style={{ color: side.color }}>{side.title}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {side.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-[13px] text-white/58">
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

        {/* ════════════════════
            SOLUÇÃO — full-width image slice
        ════════════════════ */}
        <section id="solucao" className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url(/investors-bg.png)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04080f 0%, rgba(4,8,15,0.6) 25%, rgba(4,8,15,0.6) 75%, #04080f 100%)" }} />
          </div>
          <div className="relative z-10 px-6 sm:px-10 max-w-6xl mx-auto">
            <Rev className="mb-10">
              <Tag color="#7CFC00"><Zap size={10} /> Nossa Solução</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
                Uma plataforma completa.<br />Um ecossistema escalável.
              </h2>
              <p className="text-white/50 text-base max-w-xl">
                A extraGO centraliza toda a jornada em uma única plataforma.
              </p>
            </Rev>

            {/* Solution grid — pill layout, not heavy cards */}
            <div className="flex flex-wrap gap-3">
              {SOLUTIONS.map((s, i) => (
                <Rev key={i} delay={i * 0.04}>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/8"
                    style={{ background: "rgba(5,9,17,0.7)", backdropFilter: "blur(12px)" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}14` }}>
                      <span style={{ color: s.color, display: "block" }}>{s.icon}</span>
                    </div>
                    <span className="text-[13px] text-white/70 font-medium whitespace-nowrap">{s.label}</span>
                  </div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════
            MODELO DE MONETIZAÇÃO
        ════════════════════ */}
        <section id="modelo" className="px-6 sm:px-10 py-16 sm:py-20 border-t border-white/5"
          style={{ background: "rgba(124,252,0,0.018)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-10">
              <Tag color="#7CFC00"><DollarSign size={10} /> Modelo de Monetização</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
                Receita recorrente com<br />incentivos de qualidade.
              </h2>
              <p className="text-white/50 text-base max-w-xl">
                A receita principal é gerada por taxa de intermediação sobre os extras concluídos. O sistema incentiva qualidade, retenção e crescimento de longo prazo.
              </p>
            </Rev>

            <div className="grid lg:grid-cols-3 gap-5">

              {/* Fee levels */}
              <div className="lg:col-span-1">
                <Rev>
                  <Glass className="p-5 sm:p-6 h-full" accentColor="#7CFC00">
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/35 mb-5">Progressão de Carreira</p>
                    <div className="space-y-3.5">
                      {FEES.map((f, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -14 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          className="flex items-center gap-3"
                        >
                          <span className="w-20 text-[13px] font-semibold text-white/70 flex-shrink-0">{f.name}</span>
                          <div className="flex-1 h-5 rounded-lg bg-white/4 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: f.barW }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.07 + 0.3, duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
                              className="h-full rounded-lg flex items-center justify-end pr-2.5"
                              style={{ background: `linear-gradient(90deg, ${f.color}35, ${f.color}70)`, borderRight: `2px solid ${f.color}` }}
                            >
                              <span className="text-[11px] font-black" style={{ color: f.color }}>{f.fee}%</span>
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/28 mt-4 leading-snug">
                      Quanto mais o profissional avança → menor a taxa → maior a retenção.
                    </p>
                  </Glass>
                </Rev>
              </div>

              {/* Referral tiers */}
              <div className="lg:col-span-1">
                <Rev delay={0.08}>
                  <Glass className="p-5 sm:p-6 h-full" accentColor="#00E5FF">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-secondary/12 border border-secondary/22 flex items-center justify-center">
                        <Network size={15} className="text-secondary" />
                      </div>
                      <p className="text-[10px] font-black tracking-widest uppercase text-white/35">Sistema de Indicações</p>
                    </div>
                    <p className="text-[13px] text-white/55 leading-relaxed mb-5">
                      Cada usuário possui um código e link exclusivos. Quando um indicado realiza trabalhos, o indicador recebe participação recorrente sobre a receita gerada.
                    </p>
                    <div className="space-y-3">
                      {REFERRAL_TIERS.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/6 bg-white/[0.025]">
                          <div>
                            <p className="text-[13px] font-semibold text-white/80">{t.label}</p>
                            <p className="text-[11px] text-white/35">{t.desc}</p>
                          </div>
                          <span className="text-xl font-black ml-3 flex-shrink-0" style={{ color: t.color }}>{t.pct}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3.5 border-t border-white/6">
                      <ul className="space-y-1.5">
                        {["Receita recorrente", "Crescimento orgânico", "Redução do custo de aquisição", "Incentivo à retenção"].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-[12px] text-white/50">
                            <CheckCircle size={11} className="text-primary flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Glass>
                </Rev>
              </div>

              {/* Financial distribution */}
              <div className="lg:col-span-1">
                <Rev delay={0.14}>
                  <Glass className="p-5 sm:p-6 h-full" accentColor="#fbbf24">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                        <PieChart size={15} className="text-yellow-400" />
                      </div>
                      <p className="text-[10px] font-black tracking-widest uppercase text-white/35">Estrutura Financeira</p>
                    </div>
                    <p className="text-[13px] text-white/55 leading-relaxed mb-5">Distribuição da receita operacional:</p>
                    <div className="space-y-2.5">
                      {FINANCIAL_DIST.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-[12px] text-white/62 flex-1 leading-tight">{item.label}</span>
                          <span className="text-[13px] font-black flex-shrink-0" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/28 mt-4 leading-snug">
                      Modelo que garante crescimento sustentável e escalabilidade nacional.
                    </p>
                  </Glass>
                </Rev>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════
            EXPANSÃO — image bg
        ════════════════════ */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-14"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "center 35%" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04080f 0%, rgba(4,8,15,0.55) 20%, rgba(4,8,15,0.55) 80%, #04080f 100%)" }} />
          </div>
          <div className="relative z-10 px-6 sm:px-10 max-w-6xl mx-auto">
            <Rev className="mb-10">
              <Tag color="#fbbf24"><MapPin size={10} /> Expansão Nacional</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
                Um representante<br />por estado.
              </h2>
              <p className="text-white/50 text-base max-w-xl">
                A expansão será conduzida por uma rede de representantes estaduais responsáveis pelo crescimento regional, parcerias estratégicas e fortalecimento da marca.
              </p>
            </Rev>
            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {[
                { num: "27", label: "Representantes", sub: "um por estado", color: "#fbbf24" },
                { num: "5", label: "Pilares de Atuação", sub: "por representante", color: "#7CFC00" },
                { num: "100%", label: "do Território", sub: "nacional coberto", color: "#00E5FF" },
              ].map((s, i) => (
                <Rev key={i} delay={i * 0.07}>
                  <Glass className="p-6 text-center" accentColor={s.color}>
                    <p className="text-5xl sm:text-6xl font-black mb-1" style={{ color: s.color }}>{s.num}</p>
                    <p className="text-sm font-semibold text-white/65">{s.label}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{s.sub}</p>
                  </Glass>
                </Rev>
              ))}
            </div>
            <Rev delay={0.18}>
              <div className="flex flex-wrap gap-3">
                {["Crescimento regional", "Parcerias estratégicas", "Desenvolvimento comercial", "Expansão operacional", "Fortalecimento da marca"].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-full border border-yellow-400/18 text-white/58"
                    style={{ background: "rgba(251,191,36,0.05)" }}>
                    <CheckCircle size={12} className="text-yellow-400" />{item}
                  </span>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ════════════════════
            ECOSSISTEMA ADMIN
        ════════════════════ */}
        <section className="px-6 sm:px-10 py-16 sm:py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <Rev>
                <Tag color="#a855f7"><Cpu size={10} /> Ecossistema Administrativo</Tag>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-4">
                  Governança total.<br />Em tempo real.
                </h2>
                <p className="text-white/50 text-base leading-relaxed">
                  Estrutura completa de governança com controle total sobre cada região, usuário e métrica operacional — preparada para escalar a nível nacional.
                </p>
              </Rev>
              <Rev delay={0.1}>
                <Glass className="p-6" accentColor="#a855f7">
                  <div className="grid grid-cols-2 gap-2.5">
                    {ADMIN_ITEMS.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#a855f7" }} />
                        <span className="text-[12px] text-white/60 leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </Glass>
              </Rev>
            </div>
          </div>
        </section>

        {/* ════════════════════
            EQUIPE
        ════════════════════ */}
        <section id="equipe" className="px-6 sm:px-10 py-16 sm:py-20 border-t border-white/5"
          style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-10 text-center">
              <Tag color="#00E5FF"><Users size={10} /> Liderança</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">Quem está construindo o futuro.</h2>
            </Rev>
            <div className="grid sm:grid-cols-3 gap-5">
              {TEAM.map((m, i) => (
                <Rev key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="rounded-2xl overflow-hidden border border-white/8 h-full"
                    style={{ background: "rgba(5,9,17,0.9)" }}
                  >
                    <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${m.color}, transparent)` }} />
                    <div className="p-6 flex flex-col items-center text-center">
                      <div className="relative w-18 h-18 mb-4">
                        <div className="absolute inset-0 rounded-full blur-md opacity-20" style={{ background: m.color }} />
                        <img
                          src={m.photo}
                          alt={m.name}
                          className="relative w-18 h-18 rounded-full object-cover"
                          style={{ width: 72, height: 72, border: `2px solid ${m.color}40` }}
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=0a1628&color=7CFC00&size=80`;
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full text-black"
                          style={{ background: m.color }}>{m.pct}</span>
                      </div>
                      <h3 className="font-bold text-[15px] leading-tight mb-0.5">{m.name}</h3>
                      <p className="text-[11px] font-bold tracking-wide mb-3" style={{ color: m.color }}>{m.role}</p>
                      <p className="text-[12px] text-white/45 leading-relaxed">{m.bio}</p>
                    </div>
                  </motion.div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════
            CAP TABLE
        ════════════════════ */}
        <section className="px-6 sm:px-10 py-16 sm:py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <Rev className="mb-8">
              <Tag color="#f472b6"><Layers size={10} /> Estrutura Societária</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">Distribuição de participações.</h2>
              <p className="text-white/50 text-base max-w-lg">
                A extraGO possui espaço reservado para investidores estratégicos que desejam participar da construção da principal infraestrutura digital de trabalho flexível do Brasil.
              </p>
            </Rev>
            <Rev delay={0.08}>
              <Glass className="p-6 sm:p-8" accentColor="#f472b6">
                <div className="space-y-4">
                  {CAP_TABLE.map((entry, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}50` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <div className="min-w-0">
                            <span className="text-[13px] font-semibold text-white/80 block truncate">{entry.name}</span>
                            <span className="text-[10px] text-white/30">{entry.role}</span>
                          </div>
                          <span className="text-base font-black flex-shrink-0" style={{ color: entry.color }}>{entry.pct}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${entry.pct * 3.33}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 + 0.3, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: entry.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Glass>
            </Rev>

            {/* Investor uses */}
            <Rev delay={0.15} className="mt-5">
              <Glass className="p-5 sm:p-6" accentColor="#f472b6">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.22)" }}>
                    <Award size={16} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-pink-400 mb-2">Os recursos captados serão direcionados para:</p>
                    <div className="flex flex-wrap gap-2">
                      {INVESTOR_USES.map((use, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded-full border border-pink-400/14 text-white/55"
                          style={{ background: "rgba(244,114,182,0.05)" }}>
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Glass>
            </Rev>
          </div>
        </section>

        {/* ════════════════════
            ROADMAP
        ════════════════════ */}
        <section id="roadmap" className="px-6 sm:px-10 py-16 sm:py-20 border-t border-white/5"
          style={{ background: "rgba(0,229,255,0.015)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-10 text-center">
              <Tag color="#00E5FF"><TrendingUp size={10} /> Roadmap</Tag>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">A jornada rumo à liderança nacional.</h2>
            </Rev>
            <div className="relative">
              {/* connector line */}
              <div className="absolute top-7 left-7 right-7 h-px hidden sm:block"
                style={{ background: "linear-gradient(90deg, rgba(124,252,0,0.4), rgba(0,229,255,0.25), rgba(168,85,247,0.1))" }} />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {ROADMAP.map((step, i) => (
                  <Rev key={i} delay={i * 0.05}>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="relative z-10 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border"
                        style={{
                          background: step.done ? `${step.color}14` : "rgba(255,255,255,0.035)",
                          borderColor: step.done ? `${step.color}45` : "rgba(255,255,255,0.08)",
                          boxShadow: step.done ? `0 0 18px ${step.color}25` : "none",
                        }}>
                        <span className="text-[10px] font-black" style={{ color: step.done ? step.color : "rgba(255,255,255,0.2)" }}>
                          {step.n}
                        </span>
                        {step.done && <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: step.color }} />}
                      </div>
                      <p className="text-[11px] font-semibold text-white/62 leading-tight">{step.title}</p>
                    </div>
                  </Rev>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════
            VISÃO — image bg
        ════════════════════ */}
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-center opacity-16"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "center 40%" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #04080f 0%, rgba(4,8,15,0.5) 20%, rgba(4,8,15,0.5) 80%, #04080f 100%)" }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center">
            <Rev>
              <Tag color="#7CFC00"><Sparkles size={10} /> Visão</Tag>
              <h2 className="font-black leading-tight mb-5"
                style={{ fontSize: "clamp(28px,4.5vw,54px)" }}>
                Somos a infraestrutura que<br />
                <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c 45%,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  o trabalho do futuro está esperando.
                </span>
              </h2>
              <div className="max-w-2xl mx-auto space-y-3 text-white/50 text-base leading-relaxed">
                <p>Uber transformou o transporte. Airbnb transformou a hospedagem. LinkedIn transformou o networking profissional.</p>
                <p className="text-white/80 font-semibold">A extraGO está construindo a infraestrutura nacional de mão de obra do Brasil.</p>
              </div>
            </Rev>
          </div>
        </section>

        {/* ════════════════════
            CTA
        ════════════════════ */}
        <section className="px-6 sm:px-10 pb-20 sm:pb-28">
          <div className="max-w-4xl mx-auto">
            <Rev>
              <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center border border-white/8"
                style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.07), rgba(5,9,17,0.97) 60%, rgba(0,229,255,0.05))" }}>
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(124,252,0,0.45),transparent)" }} />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle,rgba(124,252,0,0.06) 0%,transparent 70%)", filter: "blur(32px)" }} />

                <div className="relative">
                  <Tag color="#7CFC00" icon={<Sparkles size={10} />}>Oportunidade de Investimento</Tag>
                  <h2 className="font-black leading-tight mb-4"
                    style={{ fontSize: "clamp(24px,4vw,44px)" }}>
                    Faça parte da construção<br />
                    <span style={{ background: "linear-gradient(90deg,#7CFC00,#9aff1c,#00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      da infraestrutura do Brasil.
                    </span>
                  </h2>
                  <p className="text-white/48 mb-8 text-base max-w-lg mx-auto leading-relaxed">
                    Conecte-se com nossa equipe para conhecer a oportunidade de investimento, os termos e como participar da expansão nacional da extraGO.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                    <a href={`mailto:${CONTACT}`}>
                      <Button size="lg" className="rounded-full font-bold px-8 h-11 text-black border-none"
                        style={{ background: "linear-gradient(135deg,#7CFC00,#9aff1c)", boxShadow: "0 0 28px rgba(124,252,0,0.38)" }}>
                        <Mail size={16} className="mr-2" /> Investir na extraGO
                      </Button>
                    </a>
                    <a href={`mailto:${CONTACT}`}>
                      <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-11 border-white/16 text-white hover:bg-white/5">
                        <Briefcase size={16} className="mr-2" /> Tornar-se Parceiro
                      </Button>
                    </a>
                    <Link href="/register">
                      <Button size="lg" variant="ghost" className="rounded-full font-bold px-8 h-11 text-white/45 hover:text-white hover:bg-white/5">
                        Explorar a Plataforma <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-[12px] text-white/30 flex items-center justify-center gap-2">
                    <Mail size={11} />
                    <a href={`mailto:${CONTACT}`} className="hover:text-white/60 transition-colors">{CONTACT}</a>
                  </p>
                </div>
              </div>
            </Rev>
          </div>
        </section>
      </main>

      {/* ── footer ── */}
      <footer className="border-t border-white/5 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/28">
          <img src={logoMain} alt="extraGO" className="h-4.5 object-contain opacity-60" />
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white/55 transition-colors">← Página Inicial</Link>
            <Link href="/login" className="hover:text-white/55 transition-colors">Entrar</Link>
            <a href={`mailto:${CONTACT}`} className="hover:text-white/55 transition-colors">Contato</a>
          </div>
          <p>© 2026 extraGO — A Infraestrutura de Mão de Obra do Brasil.</p>
        </div>
      </footer>
    </div>
  );
}
