import React, { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  ArrowRight, TrendingUp, Users, Globe, Zap, Building2,
  CheckCircle, BarChart3, Layers, DollarSign, MapPin, Award,
  Briefcase, Sparkles, Mail, ChevronDown, Shield, Cpu, Wallet,
  Network, Crown, BadgeCheck, Rocket, Lock, Clock, Lightbulb,
  Target, GitBranch, Star, LayoutGrid, Repeat,
} from "lucide-react";

/* ─── constants ─── */
const CONTACT = "extrago.contato@gmail.com";
const G = "#7CFC00";   // extraGO green
const C = "#00E5FF";   // cyan
const T = "#0ea5e9";   // teal

/* ─── scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.19, 1, 0.22, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── glass card ─── */
function GCard({ children, className = "", accent = "", glow = false }: {
  children: React.ReactNode; className?: string; accent?: string; glow?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        background: "rgba(7,16,32,0.80)",
        backdropFilter: "blur(26px) saturate(150%)",
        borderColor: accent ? `${accent}20` : "rgba(255,255,255,0.07)",
        boxShadow: glow && accent ? `0 0 40px ${accent}12` : "none",
      }}>
      {accent && (
        <div className="absolute inset-x-0 top-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg,transparent,${accent}65,transparent)` }} />
      )}
      {children}
    </div>
  );
}

/* ─── section label pill ─── */
function Pill({ label, color, icon }: { label: string; color: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[10px] font-black tracking-[0.15em] uppercase"
      style={{ background: `${color}10`, border: `1px solid ${color}28`, color }}>
      {icon}{label}
    </span>
  );
}

/* ─── section divider ─── */
function Divider({ color = "rgba(255,255,255,0.05)" }: { color?: string }) {
  return <div className="w-full h-px" style={{ background: color }} />;
}

/* ─── full-page background: layered CSS + SVG ─── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base petroleum blue */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(155deg,#071e3d 0%,#0a2645 25%,#071f38 55%,#0a2240 100%)" }} />

      {/* Atmospheric radial glows */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 85% 55% at 12% 18%, rgba(14,165,233,0.16) 0%,transparent 55%),
          radial-gradient(ellipse 55% 45% at 88% 12%, rgba(124,252,0,0.09) 0%,transparent 50%),
          radial-gradient(ellipse 70% 40% at 50% 90%, rgba(6,182,212,0.11) 0%,transparent 55%),
          radial-gradient(ellipse 45% 55% at 78% 62%, rgba(14,165,233,0.08) 0%,transparent 55%)
        `,
      }} />

      {/* SVG Brazil network */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ng" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7CFC00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7CFC00" stopOpacity="0" />
          </radialGradient>
          <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
          <filter id="blur5"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>

        {/* Grid */}
        {[0,160,320,480,640,800,960,1120,1280,1440].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" stroke="rgba(14,165,233,0.04)" strokeWidth="1" />
        ))}
        {[0,100,200,300,400,500,600,700,800,900].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y} stroke="rgba(14,165,233,0.04)" strokeWidth="1" />
        ))}

        {/* Brazil corridor lines */}
        {([
          [390,190,450,310],[450,310,480,425],[480,425,512,535],[512,535,530,645],
          [450,310,605,278],[605,278,724,258],[724,258,845,292],
          [480,425,642,402],[642,402,764,382],[764,382,882,342],
          [512,535,682,512],[682,512,822,492],[822,492,962,462],
          [530,645,622,682],[622,682,742,702],[742,702,862,682],
          [845,292,1055,198],[882,342,1105,282],[962,462,1152,402],
          [390,190,218,178],[450,310,198,322],[480,425,188,452],
          [605,278,764,382],[642,402,822,492],[724,258,822,492],
          [300,258,390,190],[330,398,450,310],[280,520,480,425],
        ] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
          <g key={`l${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,0.11)" strokeWidth="1.5" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,0.05)" strokeWidth="4" filter="url(#blur3)" />
          </g>
        ))}

        {/* City nodes */}
        {([
          [390,190,5,"c"],[450,310,6,"c"],[480,425,5,"g"],[512,535,6,"c"],[530,645,4,"c"],
          [605,278,4,"g"],[642,402,5,"c"],[682,512,4,"g"],[622,682,4,"c"],
          [724,258,5,"g"],[764,382,4,"c"],[822,492,5,"c"],[742,702,4,"g"],
          [845,292,4,"c"],[882,342,4,"g"],[962,462,5,"c"],[862,682,3,"c"],
          [1055,198,4,"g"],[1105,282,4,"c"],[1152,402,3,"g"],
          [218,178,4,"c"],[198,322,3,"g"],[188,452,3,"c"],
          [560,348,3,"c"],[700,458,3,"g"],[580,598,3,"c"],
          [300,258,3,"g"],[330,398,3,"c"],
        ] as [number,number,number,string][]).map(([x,y,r,t],i) => {
          const col = t === "g" ? "#7CFC00" : "#00E5FF";
          const grad = t === "g" ? "gg" : "ng";
          return (
            <g key={`n${i}`}>
              <circle cx={x} cy={y} r={Number(r)*3} fill={`url(#${grad})`} opacity="0.55" />
              <circle cx={x} cy={y} r={r} fill={col} opacity="0.85" />
              <circle cx={x} cy={y} r={Number(r)+2} fill="none" stroke={col} strokeWidth="0.8" opacity="0.35" />
            </g>
          );
        })}

        {/* Strategic route dashes */}
        <line x1="0" y1="900" x2="500" y2="390" stroke="rgba(124,252,0,0.05)" strokeWidth="1" strokeDasharray="8 14" />
        <line x1="1440" y1="0" x2="880" y2="510" stroke="rgba(0,229,255,0.05)" strokeWidth="1" strokeDasharray="8 14" />

        {/* Glow halos */}
        <ellipse cx="175" cy="158" rx="210" ry="165" fill="rgba(14,165,233,0.07)" filter="url(#blur5)" />
        <ellipse cx="1270" cy="195" rx="185" ry="145" fill="rgba(124,252,0,0.05)" filter="url(#blur5)" />
        <ellipse cx="720" cy="755" rx="310" ry="125" fill="rgba(6,182,212,0.06)" filter="url(#blur5)" />
        <ellipse cx="450" cy="310" rx="85" ry="62" fill="rgba(0,229,255,0.05)" filter="url(#blur5)" />
        <ellipse cx="720" cy="258" rx="72" ry="58" fill="rgba(124,252,0,0.06)" filter="url(#blur5)" />
      </svg>

      {/* Top glow sweep */}
      <div className="absolute inset-x-0 top-0 h-60"
        style={{ background: "linear-gradient(180deg,rgba(14,165,233,0.10) 0%,transparent 100%)" }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-52"
        style={{ background: "linear-gradient(0deg,rgba(4,10,20,0.96) 0%,transparent 100%)" }} />
    </div>
  );
}

/* ─── data (PDF-exact) ─── */
const FEES = [
  { name: "Iniciante", fee: 18, color: "#94a3b8", w: "90%" },
  { name: "Júnior",    fee: 16, color: "#fbbf24", w: "80%" },
  { name: "Intermediário", fee: 14, color: G, w: "70%" },
  { name: "Sênior",   fee: 12, color: C, w: "60%" },
  { name: "Elite",    fee: 10, color: "#a855f7", w: "50%" },
];

const REFERRAL = [
  { label: "Indicador", pct: "5%", color: G },
  { label: "Embaixador Regional", pct: "7%", color: C },
  { label: "Embaixador Nacional", pct: "10%", color: "#a855f7" },
];

const FINANCIAL = [
  { label: "Caixa e Reserva Estratégica", pct: 35, color: G },
  { label: "Marketing e Crescimento", pct: 20, color: C },
  { label: "Representantes Estaduais", pct: 15, color: "#fbbf24" },
  { label: "Tecnologia e Infraestrutura", pct: 10, color: "#a855f7" },
  { label: "Equipe e Operações", pct: 10, color: "#f472b6" },
  { label: "Fundo de Expansão", pct: 5, color: "#4ade80" },
  { label: "Programa de Indicações", pct: 5, color: "#22d3ee" },
];

const TEAM = [
  {
    name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", photo: "/team-leonardo.jpg",
    color: G, equity: "Fundador",
    bio: "Responsável pela visão estratégica, produto, operações e expansão nacional da extraGO. Experiência em gestão operacional, hotelaria, liderança de equipes e desenvolvimento de negócios.",
  },
  {
    name: "Jean Carlos Dick", role: "CMO & Co-Founder", photo: "/team-jean.jpg",
    color: C, equity: "Co-Fundador",
    bio: "Fundador da MyAds. Responsável por branding, marketing, growth, aquisição de usuários e posicionamento estratégico da marca.",
  },
  {
    name: "Qaialla Pereira", role: "CCO & Co-Founder", photo: "/team-qaialla.jpg",
    color: "#a855f7", equity: "Co-Fundadora",
    bio: "Responsável pela expansão comercial, parcerias estratégicas, relacionamento corporativo e desenvolvimento de mercado.",
  },
];

const ROADMAP_PHASES = [
  { n: "01", title: "Validação Regional",                    color: G,        done: true  },
  { n: "02", title: "Expansão Sul",                          color: C,        done: false },
  { n: "03", title: "Expansão Nacional",                     color: "#fbbf24",done: false },
  { n: "04", title: "Rede Nacional de Representantes",       color: "#a855f7",done: false },
  { n: "05", title: "Ecossistema Financeiro Completo",       color: "#f472b6",done: false },
  { n: "06", title: "IA para Matching Inteligente",          color: "#22d3ee",done: false },
  { n: "07", title: "Liderança Nacional no Trabalho Flexível",color: "#4ade80",done: false },
];

const PLANS = [
  {
    key: "free",   name: "FREE",             price: "Gratuito", period: "",
    color: "#64748b", icon: <Lock size={18} />,    flagship: false,
    items: ["Perfil padrão", "Visibilidade básica", "Acesso às oportunidades"],
  },
  {
    key: "pro",    name: "extraGO PRO",      price: "R$ 19,90", period: "/mês",
    color: G,         icon: <BadgeCheck size={18} />, flagship: false,
    items: ["Maior visibilidade", "Badge PRO", "Estatísticas avançadas", "Alertas antecipados de oportunidades"],
  },
  {
    key: "prem",   name: "extraGO PREMIUM",  price: "R$ 49,90", period: "/mês",
    color: C,         icon: <Rocket size={18} />,    flagship: false,
    items: ["Ranking prioritário", "Perfil premium", "Maior exposição", "Analytics avançado", "Destaque no perfil"],
  },
  {
    key: "elite",  name: "extraGO ELITE",    price: "R$ 99,90", period: "/mês",
    color: "#a855f7", icon: <Crown size={18} />,    flagship: true,
    items: ["Visibilidade máxima", "Badge ELITE", "Suporte VIP", "Oportunidades exclusivas", "Networking estratégico"],
  },
];

const PILLARS = [
  {
    name: "DISCOVERY", color: G, icon: <MapPin size={18} />,
    items: ["Geolocalização inteligente", "Busca por raio de distância", "Matching por perfil e habilidade"],
  },
  {
    name: "TRUST", color: C, icon: <Star size={18} />,
    items: ["Sistema de reputação", "Progressão de carreira validada", "Histórico profissional verificável"],
  },
  {
    name: "OPERATIONS", color: "#fbbf24", icon: <Cpu size={18} />,
    items: ["Chat em tempo real", "Carteira digital integrada", "Gestão de pagamentos"],
  },
  {
    name: "GROWTH", color: "#a855f7", icon: <TrendingUp size={18} />,
    items: ["Sistema de indicações multinível", "Analytics operacional", "Expansão por representantes"],
  },
];

const ADVANTAGES = [
  {
    icon: <Network size={20} />, title: "Rede de Reputação Acumulada", color: G,
    desc: "Cada profissional constrói um histórico verificável que não pode ser transferido para outra plataforma. Quanto mais o profissional cresce, mais ele está ancorado ao ecossistema.",
  },
  {
    icon: <TrendingUp size={20} />, title: "Progressão de Carreira como Retenção", color: C,
    desc: "O sistema de níveis cria incentivo contínuo. Profissionais com menor taxa de intermediação são mais rentáveis — gerando retenção orgânica sem custo de aquisição adicional.",
  },
  {
    icon: <Repeat size={20} />, title: "Referral Flywheel", color: "#fbbf24",
    desc: "Cada usuário que indica novos profissionais ou empresas gera receita recorrente para si e para a plataforma, criando um ciclo de crescimento orgânico e auto-sustentável.",
  },
  {
    icon: <MapPin size={20} />, title: "Rede de Representantes Estaduais", color: "#a855f7",
    desc: "27 representantes ancorados regionalmente criam barreiras de entrada locais, relações comerciais profundas e capacidade de expansão que concorrentes remotos não conseguem replicar.",
  },
  {
    icon: <LayoutGrid size={20} />, title: "Ecossistema Integrado", color: "#f472b6",
    desc: "A combinação de marketplace, reputação, pagamentos, indicações e governança em uma única plataforma cria interdependência que torna a substituição extremamente custosa para todos os participantes.",
  },
  {
    icon: <Shield size={20} />, title: "Inteligência Operacional Nacional", color: "#22d3ee",
    desc: "Painel executivo com analytics em tempo real por estado, KPIs nacionais e gestão regional centralizadas — uma camada de dados que só existe com escala e que se torna mais valiosa com o tempo.",
  },
];

/* ─── main page ─── */
export default function InvestidoresParceirosPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ color: "#fff" }}>
      <Background />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,12,26,0.94)" : "rgba(5,12,26,0.72)",
          borderBottom: `1px solid ${scrolled ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)"}`,
          backdropFilter: "blur(26px)",
        }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-10 h-14">
          <Link href="/"><img src={logoMain} alt="extraGO" className="h-5 object-contain" /></Link>
          <nav className="hidden lg:flex items-center gap-6 text-[12px]">
            {[
              ["#mercado","O Mercado"],["#solucao","Solução"],["#expansao","Expansão"],
              ["#modelo","Modelo"],["#equipe","Equipe"],["#roadmap","Roadmap"],
            ].map(([href,label]) => (
              <a key={href} href={href} className="text-white/40 hover:text-white/85 transition-colors">{label}</a>
            ))}
            <Link href="/" className="text-white/25 hover:text-white/55 transition-colors text-[11px]">← Voltar</Link>
          </nav>
          <a href={`mailto:${CONTACT}`}>
            <Button className="rounded-full px-5 h-9 text-[13px] font-bold text-black border-none"
              style={{ background: `linear-gradient(135deg,${G},#9aff1c 55%,${C})`, boxShadow: "0 0 18px rgba(124,252,0,0.30)" }}>
              Contato
            </Button>
          </a>
        </div>
      </header>

      <main className="relative z-10 flex-1">

        {/* ═══════════════════════════════
            01 · HERO
        ═══════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: "clamp(520px,70vh,780px)" }}>
          {/* Photo layer */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-right opacity-28"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "62% center" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(108deg,rgba(5,12,26,0.99) 0%,rgba(5,12,26,0.95) 38%,rgba(5,12,26,0.72) 62%,rgba(5,12,26,0.32) 100%)" }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 flex items-center"
            style={{ minHeight: "clamp(520px,70vh,780px)" }}>
            <div className="py-14 sm:py-20" style={{ maxWidth: 560 }}>

              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-[10px] font-black tracking-[0.15em] uppercase"
                style={{ background: "rgba(124,252,0,0.10)", border: "1px solid rgba(124,252,0,0.26)", color: G }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G }} />
                Investidores &amp; Parceiros Estratégicos
              </motion.span>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30, duration: 0.80, ease: [0.19,1,0.22,1] }}
                className="font-black leading-[1.04] mb-5"
                style={{ fontSize: "clamp(32px,5vw,58px)" }}>
                A Infraestrutura de<br />Mão de Obra
                <span className="block" style={{
                  background: `linear-gradient(90deg,${G} 0%,#9aff1c 40%,${C} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>do Brasil.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }}
                className="text-white/55 text-[15px] leading-relaxed mb-7" style={{ maxWidth: 480 }}>
                Uma plataforma tecnológica que digitaliza o ecossistema de mão de obra flexível, conectando profissionais, empresas, parceiros e representantes em escala nacional.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.60 }}
                className="flex flex-wrap gap-3 mb-8">
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" className="rounded-full font-bold px-7 h-11 text-black border-none"
                    style={{ background: `linear-gradient(135deg,${G},#9aff1c)`, boxShadow: "0 0 28px rgba(124,252,0,0.35)" }}>
                    Investir na extraGO <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </a>
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" variant="outline" className="rounded-full font-bold px-7 h-11 text-white hover:bg-white/5"
                    style={{ borderColor: "rgba(255,255,255,0.18)" }}>
                    Tornar-se Parceiro
                  </Button>
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
                className="flex items-center flex-wrap gap-x-6 gap-y-2 pt-5 border-t border-white/7 text-[11px] text-white/30">
                {[
                  { dot: G, label: "Infraestrutura Digital" },
                  { dot: C, label: "Expansão Nacional" },
                  { dot: "#a855f7", label: "Receita Recorrente" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.dot }} />
                    {item.label}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex-col items-center gap-1 hidden md:flex">
            <motion.div animate={{ y: [0,5,0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              <ChevronDown size={15} className="text-white/18" />
            </motion.div>
          </motion.div>
        </section>

        {/* Inspiration strip */}
        <div style={{ background: "rgba(14,165,233,0.04)", borderTop: "1px solid rgba(14,165,233,0.10)", borderBottom: "1px solid rgba(14,165,233,0.10)" }}>
          <div className="max-w-4xl mx-auto px-5 py-4 text-center">
            <p className="text-[12px] text-white/40 leading-relaxed">
              Inspirada em{" "}
              <span className="text-white/68 font-semibold">Uber, Airbnb, LinkedIn, Stripe e Nubank</span>
              {" "}— a extraGO une marketplace, reputação, geolocalização, pagamentos, gamificação e crescimento em rede em um único ecossistema.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════
            02 · THE MARKET
        ═══════════════════════════════ */}
        <section id="mercado" className="px-5 sm:px-10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="O Mercado" color={G} icon={<Globe size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Um mercado imenso operando<br />de forma fragmentada.
              </h2>
              <p className="text-white/48 text-[14px] leading-relaxed max-w-2xl">
                O mercado de trabalho flexível no Brasil ainda opera majoritariamente através de grupos de WhatsApp, indicações informais e processos manuais descentralizados. A digitalização desse ecossistema representa uma das maiores oportunidades de infraestrutura da próxima década.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                {
                  icon: <Globe size={20} />, color: G, title: "Fragmentação Total",
                  desc: "Empresas e profissionais operam em canais informais sem rastreabilidade, sem histórico e sem garantias mútuas.",
                },
                {
                  icon: <Zap size={20} />, color: C, title: "Ineficiência Operacional",
                  desc: "A contratação de um extra pode levar dias por canais tradicionais. A urgência operacional exige velocidade que o mercado informal não entrega.",
                },
                {
                  icon: <Target size={20} />, color: "#fbbf24", title: "Ausência de Reputação",
                  desc: "Não existe um histórico profissional confiável para trabalhadores flexíveis no Brasil. Cada contratação começa do zero.",
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-5 h-full" accent={item.color}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${item.color}14`, border: `1px solid ${item.color}25` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <h3 className="text-[14px] font-bold mb-2 text-white/90">{item.title}</h3>
                    <p className="text-[12px] text-white/50 leading-relaxed">{item.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <GCard className="p-5 sm:p-6" accent={G}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(124,252,0,0.12)", border: "1px solid rgba(124,252,0,0.22)" }}>
                    <Lightbulb size={18} style={{ color: G }} />
                  </div>
                  <p className="text-[13px] text-white/60 leading-relaxed">
                    <span className="text-white/85 font-semibold">A oportunidade da extraGO</span>{" "}
                    é criar a camada digital que faltava: um ecossistema onde profissionais acumulam reputação, empresas encontram talentos validados com velocidade, e toda a cadeia opera com rastreabilidade, eficiência e escala nacional.
                  </p>
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            03 · THE PROBLEM
        ═══════════════════════════════ */}
        <section id="problema" className="px-5 sm:px-10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="O Problema" color="#f43f5e" icon={<Target size={10} />} />
              <h2 className="font-black leading-tight" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Dois lados. Uma dor compartilhada.
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  icon: <Building2 size={20} />, title: "Para Empresas", color: C, subtitle: "O lado da demanda",
                  points: [
                    "Contratação lenta e imprevisível",
                    "Profissionais sem histórico verificável",
                    "Alto custo operacional de recrutamento",
                    "Zero rastreabilidade de desempenho",
                    "Dependência de indicações informais",
                  ],
                },
                {
                  icon: <Users size={20} />, title: "Para Profissionais", color: G, subtitle: "O lado da oferta",
                  points: [
                    "Falta de oportunidades recorrentes",
                    "Nenhum sistema de reputação profissional",
                    "Crescimento de carreira limitado",
                    "Dependência de grupos informais",
                    "Renda instável e não escalável",
                  ],
                },
              ].map((side, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 sm:p-6 h-full" accent={side.color}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${side.color}14`, border: `1px solid ${side.color}25` }}>
                        <span style={{ color: side.color }}>{side.icon}</span>
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: side.color }}>{side.title}</p>
                        <p className="text-[10px] text-white/30 tracking-wide uppercase">{side.subtitle}</p>
                      </div>
                    </div>
                    <ul className="space-y-2.5">
                      {side.points.map((pt, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-[13px] text-white/58">
                          <span className="w-1 h-1 rounded-full flex-shrink-0 mt-[7px]" style={{ background: side.color }} />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            04 · WHY NOW
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-12 sm:py-16" style={{ background: "rgba(14,165,233,0.025)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <Reveal>
                <Pill label="Por Que Agora" color={C} icon={<Clock size={10} />} />
                <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                  O momento certo<br />para construir isso.
                </h2>
                <p className="text-white/50 text-[14px] leading-relaxed">
                  Múltiplas forças convergem simultaneamente criando uma janela estratégica única para a digitalização do mercado de trabalho flexível no Brasil.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="space-y-3">
                  {[
                    {
                      icon: <TrendingUp size={16} />, color: G,
                      title: "Crescimento do Trabalho Flexível",
                      desc: "A modalidade de trabalho por demanda cresce consistentemente em todos os setores, de hotelaria a eventos a serviços gerais.",
                    },
                    {
                      icon: <Zap size={16} />, color: C,
                      title: "Transformação Digital Acelerada",
                      desc: "Empresas de todos os tamanhos estão adotando ferramentas digitais para otimizar operações — incluindo o recrutamento de mão de obra.",
                    },
                    {
                      icon: <Shield size={16} />, color: "#fbbf24",
                      title: "Demanda por Eficiência Operacional",
                      desc: "A pressão por custos e velocidade força empresas a substituir processos manuais por plataformas digitais integradas.",
                    },
                    {
                      icon: <Star size={16} />, color: "#a855f7",
                      title: "Profissionais Buscando Consistência",
                      desc: "Trabalhadores flexíveis precisam de uma plataforma que construa sua reputação e garanta acesso contínuo a oportunidades.",
                    },
                  ].map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 p-4 rounded-xl border border-white/6"
                      style={{ background: "rgba(7,16,32,0.65)", backdropFilter: "blur(16px)" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white/85 mb-0.5">{item.title}</p>
                        <p className="text-[11px] text-white/45 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            05 · SOLUTION — 4 pillars
        ═══════════════════════════════ */}
        <section id="solucao" className="px-5 sm:px-10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="A Solução" color={G} icon={<Zap size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Quatro pilares.<br />Um ecossistema completo.
              </h2>
              <p className="text-white/48 text-[14px] leading-relaxed max-w-xl">
                A extraGO não é um app de contratação — é a camada de infraestrutura que conecta todos os participantes do mercado de trabalho flexível em uma única plataforma integrada.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-4">
              {PILLARS.map((p, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-5 sm:p-6 h-full" accent={p.color} glow>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${p.color}14`, border: `1px solid ${p.color}25` }}>
                        <span style={{ color: p.color }}>{p.icon}</span>
                      </div>
                      <span className="text-[11px] font-black tracking-[0.15em] uppercase" style={{ color: p.color }}>{p.name}</span>
                    </div>
                    <ul className="space-y-2">
                      {p.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-[13px] text-white/60">
                          <CheckCircle size={11} style={{ color: p.color, flexShrink: 0 }} />{item}
                        </li>
                      ))}
                    </ul>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            06 · COMPETITIVE ADVANTAGES
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-12 sm:py-16" style={{ background: "rgba(124,252,0,0.018)" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Vantagens Competitivas" color={G} icon={<Shield size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Defensabilidade estrutural.<br />Não apenas funcionalidades.
              </h2>
              <p className="text-white/48 text-[14px] leading-relaxed max-w-xl">
                As vantagens da extraGO não são features que podem ser copiadas — são efeitos de rede e estruturas operacionais que se fortalecem com o tempo e com a escala.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADVANTAGES.map((adv, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <GCard className="p-5 h-full" accent={adv.color}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${adv.color}13`, border: `1px solid ${adv.color}22` }}>
                        <span style={{ color: adv.color }}>{adv.icon}</span>
                      </div>
                      <h3 className="text-[13px] font-bold text-white/88 leading-tight">{adv.title}</h3>
                    </div>
                    <p className="text-[11px] text-white/48 leading-relaxed">{adv.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            07 · NATIONAL EXPANSION
        ═══════════════════════════════ */}
        <section id="expansao" className="relative overflow-hidden py-12 sm:py-16">
          {/* map image accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-12"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "50% 42%" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.97) 0%,rgba(5,12,26,0.58) 25%,rgba(5,12,26,0.58) 75%,rgba(5,12,26,0.97) 100%)" }} />
          </div>

          <div className="relative z-10 px-5 sm:px-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Modelo de Expansão Nacional" color="#fbbf24" icon={<MapPin size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Um representante por estado.<br />
                <span className="text-white/38">27 estados. Todo o Brasil.</span>
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                A estratégia de expansão da extraGO é ancorada em representantes estaduais com profundo conhecimento regional. Cada representante é responsável pelo desenvolvimento comercial, parcerias locais, relacionamento com empresas e crescimento da rede profissional em seu estado.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { num: "27", label: "Estados cobertos", sub: "1 representante por estado", color: "#fbbf24" },
                { num: "15%", label: "da Receita Alocada", sub: "para a rede de representantes", color: G },
                { num: "5", label: "Pilares Regionais", sub: "por representante estadual", color: C },
                { num: "100%", label: "Território Nacional", sub: "cobertura ao completar a rede", color: "#a855f7" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 sm:p-5 text-center" accent={s.color}>
                    <p className="text-[36px] sm:text-[42px] font-black leading-none mb-1" style={{ color: s.color }}>{s.num}</p>
                    <p className="text-[12px] font-semibold text-white/70 mb-0.5">{s.label}</p>
                    <p className="text-[10px] text-white/30 leading-snug">{s.sub}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.25}>
              <div className="flex flex-wrap gap-2.5">
                {["Crescimento regional orgânico","Parcerias empresariais locais","Desenvolvimento comercial estadual","Expansão operacional escalável","Fortalecimento da marca nacional"].map((item, i) => (
                  <span key={i} className="flex items-center gap-2 text-[12px] px-3.5 py-2 rounded-full border text-white/55"
                    style={{ borderColor: "rgba(251,191,36,0.18)", background: "rgba(251,191,36,0.05)" }}>
                    <CheckCircle size={11} className="text-yellow-400 flex-shrink-0" />{item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            08 · BUSINESS MODEL
        ═══════════════════════════════ */}
        <section id="modelo" className="px-5 sm:px-10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Modelo de Negócio" color={G} icon={<DollarSign size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Múltiplas camadas de receita.<br />Todas recorrentes.
              </h2>
              <p className="text-white/48 text-[14px] leading-relaxed max-w-xl">
                O modelo financeiro da extraGO combina intermediação por performance, assinaturas mensais e receita de rede — criando previsibilidade e escalabilidade.
              </p>
            </Reveal>

            {/* Camada 1 — Intermediação */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <Reveal>
                <GCard className="p-5 sm:p-6 h-full" accent={G}>
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Camada 1 — Intermediação por Performance</p>
                  <p className="text-[12px] text-white/50 leading-relaxed mb-4">
                    Taxa cobrada sobre cada extra concluído. Quanto mais o profissional evolui, menor a taxa — incentivando qualidade, retenção e crescimento de longo prazo.
                  </p>
                  <div className="space-y-2.5">
                    {FEES.map((f, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3">
                        <span className="w-[90px] text-[12px] font-medium text-white/60 flex-shrink-0">{f.name}</span>
                        <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: f.w }}
                            viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.3, duration: 0.8, ease: [0.19,1,0.22,1] }}
                            className="h-full rounded-lg flex items-center justify-end pr-2"
                            style={{ background: `linear-gradient(90deg,${f.color}28,${f.color}62)`, borderRight: `2px solid ${f.color}` }}>
                            <span className="text-[10px] font-black" style={{ color: f.color }}>{f.fee}%</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GCard>
              </Reveal>

              <Reveal delay={0.08}>
                <GCard className="p-5 sm:p-6 h-full" accent={C}>
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Camada 2 — Sistema de Indicações Multinível</p>
                  <p className="text-[12px] text-white/50 leading-relaxed mb-4">
                    Receita recorrente gerada por rede. Cada usuário tem um código exclusivo — quando um indicado trabalha, o indicador recebe participação contínua sobre a receita gerada.
                  </p>
                  <div className="space-y-2.5 mb-4">
                    {REFERRAL.map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/6 bg-white/[0.025]">
                        <span className="text-[13px] font-medium text-white/75">{t.label}</span>
                        <span className="text-[18px] font-black" style={{ color: t.color }}>{t.pct}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-white/35 leading-snug">
                    Crescimento orgânico com redução contínua do custo de aquisição de usuários.
                  </p>
                </GCard>
              </Reveal>
            </div>

            {/* Camada 3 — Assinaturas */}
            <Reveal delay={0.12} className="mb-4">
              <GCard className="p-5 sm:p-6" accent="#a855f7">
                <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Camada 3 — Assinaturas Premium (MRR)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PLANS.map((plan, i) => (
                    <motion.div key={plan.key}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      className="relative rounded-xl border p-4 flex flex-col"
                      style={{
                        background: plan.flagship ? `${plan.color}0a` : "rgba(7,16,32,0.55)",
                        borderColor: plan.flagship ? `${plan.color}30` : "rgba(255,255,255,0.07)",
                        boxShadow: plan.flagship ? `0 0 24px ${plan.color}14` : "none",
                      }}>
                      {plan.flagship && (
                        <span className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-full text-black"
                          style={{ background: plan.color }}>FLAGSHIP</span>
                      )}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3 flex-shrink-0"
                        style={{ background: `${plan.color}14` }}>
                        <span style={{ color: plan.color }}>{plan.icon}</span>
                      </div>
                      <p className="text-[10px] font-black tracking-wide uppercase mb-2" style={{ color: plan.color }}>{plan.name}</p>
                      <p className="text-[18px] font-black text-white leading-none">{plan.price}</p>
                      {plan.period && <p className="text-[10px] text-white/30 mb-3">{plan.period}</p>}
                      {!plan.period && <p className="text-[10px] text-white/30 mb-3">&nbsp;</p>}
                      <ul className="space-y-1 mt-auto">
                        {plan.items.slice(0,3).map((item, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-[10px] text-white/45">
                            <span className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: plan.color }} />{item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2.5">
                  <TrendingUp size={13} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Receita mensal recorrente (MRR) que escala proporcionalmente com a base de usuários — criando previsibilidade financeira independente do volume de extras.
                  </p>
                </div>
              </GCard>
            </Reveal>

            {/* Financial distribution */}
            <Reveal delay={0.18}>
              <GCard className="p-5 sm:p-6" accent="#fbbf24">
                <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Estrutura Financeira da Plataforma</p>
                <div className="flex h-8 rounded-xl overflow-hidden w-full mb-4 gap-px">
                  {FINANCIAL.map((item, i) => (
                    <motion.div key={i}
                      initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.2, duration: 0.85, ease: [0.19,1,0.22,1] }}
                      className="h-full flex items-center justify-center"
                      style={{ background: `${item.color}28`, borderRight: `2px solid ${item.color}45` }}
                      title={`${item.label}: ${item.pct}%`}>
                      {item.pct >= 10 && <span className="text-[9px] font-black" style={{ color: item.color }}>{item.pct}%</span>}
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FINANCIAL.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-[10px] text-white/50 leading-tight truncate">{item.label}</span>
                      <span className="text-[10px] font-black flex-shrink-0 ml-auto" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2.5">
                  <Shield size={12} style={{ color: G, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    <span style={{ color: G }} className="font-semibold">35% em caixa e reserva estratégica</span>{" "}
                    garante solidez operacional, suporta crescimento acelerado e protege a operação em cenários adversos.
                  </p>
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            09 · GOVERNANCE & OPS
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-12 sm:py-16" style={{ background: "rgba(14,165,233,0.02)" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Governança & Estrutura Operacional" color="#a855f7" icon={<Cpu size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Infraestrutura de gestão<br />para escala nacional.
              </h2>
              <p className="text-white/48 text-[14px] leading-relaxed max-w-xl">
                A extraGO possui uma arquitetura operacional completa, com visibilidade em tempo real sobre cada estado, usuário e métrica — preparada para governar uma rede nacional de profissionais e empresas.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: <LayoutGrid size={18} />, color: "#a855f7", title: "Centro Administrativo Nacional",
                  items: ["Painel executivo centralizado","Analytics em tempo real","KPIs nacionais e regionais","Mapa interativo do Brasil"],
                },
                {
                  icon: <MapPin size={18} />, color: "#fbbf24", title: "Gestão Regional Descentralizada",
                  items: ["Visão por estado","Performance de representantes","Crescimento regional","Parcerias locais rastreadas"],
                },
                {
                  icon: <Shield size={18} />, color: C, title: "Controles de Plataforma",
                  items: ["Gestão de usuários","Moderação de conteúdo","Sistema de auditoria","Controle financeiro integrado"],
                },
                {
                  icon: <DollarSign size={18} />, color: G, title: "Estrutura Financeira",
                  items: ["Carteira digital por usuário","Processamento de saques PIX","Alocação estratégica de receita","Reserva operacional protegida"],
                },
                {
                  icon: <GitBranch size={18} />, color: "#f472b6", title: "Arquitetura de Dados",
                  items: ["Histórico profissional imutável","Reputação verificável","Métricas de performance","Inteligência de mercado local"],
                },
                {
                  icon: <Network size={18} />, color: "#22d3ee", title: "Ecossistema de Crescimento",
                  items: ["Motor de indicações multinível","Sistema de progressão de carreira","Notificações e engajamento","Analytics de crescimento de rede"],
                },
              ].map((block, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <GCard className="p-5 h-full" accent={block.color}>
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${block.color}13`, border: `1px solid ${block.color}20` }}>
                        <span style={{ color: block.color }}>{block.icon}</span>
                      </div>
                      <h3 className="text-[12px] font-bold text-white/80 leading-tight">{block.title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-[11px] text-white/50">
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: block.color }} />{item}
                        </li>
                      ))}
                    </ul>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            10 · TEAM
        ═══════════════════════════════ */}
        <section id="equipe" className="px-5 sm:px-10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto">
            <Reveal className="text-center mb-8">
              <Pill label="Liderança" color={C} icon={<Users size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                As pessoas que estão construindo isso.
              </h2>
              <p className="text-white/45 text-[14px] max-w-lg mx-auto">
                Uma equipe de fundadores com experiência complementar em tecnologia, marketing, operações e expansão comercial.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5">
              {TEAM.map((m, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="rounded-2xl overflow-hidden border h-full flex flex-col"
                    style={{
                      background: "rgba(7,16,32,0.88)",
                      borderColor: `${m.color}18`,
                      backdropFilter: "blur(22px)",
                    }}>
                    <div className="h-[1.5px]" style={{ background: `linear-gradient(90deg,transparent,${m.color},transparent)` }} />
                    <div className="p-6 flex flex-col items-center text-center flex-1">
                      <div className="relative mb-4 flex-shrink-0" style={{ width: 72, height: 72 }}>
                        <div className="absolute inset-0 rounded-full blur-xl opacity-22 scale-110" style={{ background: m.color }} />
                        <img src={m.photo} alt={m.name}
                          className="relative rounded-full object-cover"
                          style={{ width: 72, height: 72, border: `2px solid ${m.color}38` }}
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=071e3d&color=7CFC00&size=80`;
                          }} />
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full text-black"
                          style={{ background: m.color }}>{m.equity}</span>
                      </div>
                      <h3 className="font-bold text-[14px] leading-tight mb-0.5">{m.name}</h3>
                      <p className="text-[11px] font-bold tracking-wide mb-3" style={{ color: m.color }}>{m.role}</p>
                      <p className="text-[11px] text-white/42 leading-relaxed">{m.bio}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            11 · ROADMAP — timeline
        ═══════════════════════════════ */}
        <section id="roadmap" className="px-5 sm:px-10 py-12 sm:py-16" style={{ background: "rgba(14,165,233,0.02)" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="text-center mb-10">
              <Pill label="Roadmap" color={C} icon={<TrendingUp size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                A jornada rumo à liderança nacional.
              </h2>
              <p className="text-white/45 text-[14px] max-w-lg mx-auto">
                Sete fases estruturadas de validação ao domínio nacional do mercado de trabalho flexível.
              </p>
            </Reveal>

            {/* Vertical timeline on mobile, horizontal on desktop */}
            <div className="relative">
              {/* Desktop connector */}
              <div className="absolute top-[22px] left-[40px] right-[40px] h-px hidden lg:block"
                style={{ background: `linear-gradient(90deg,${G}50,${C}30,rgba(168,85,247,0.12))` }} />

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {ROADMAP_PHASES.map((phase, i) => (
                  <Reveal key={i} delay={i * 0.05}>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="relative z-10 w-11 h-11 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300"
                        style={{
                          background: phase.done ? `${phase.color}15` : "rgba(255,255,255,0.03)",
                          borderColor: phase.done ? `${phase.color}45` : "rgba(255,255,255,0.07)",
                          boxShadow: phase.done ? `0 0 18px ${phase.color}22` : "none",
                        }}>
                        <span className="text-[9px] font-black" style={{ color: phase.done ? phase.color : "rgba(255,255,255,0.18)" }}>
                          {phase.n}
                        </span>
                        {phase.done && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: phase.color }} />}
                      </div>
                      <p className="text-[10px] text-white/52 leading-tight font-medium">{phase.title}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            12 · LONG-TERM VISION
        ═══════════════════════════════ */}
        <section className="relative overflow-hidden py-14 sm:py-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-16"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "50% 50%" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.97) 0%,rgba(5,12,26,0.52) 22%,rgba(5,12,26,0.52) 78%,rgba(5,12,26,0.97) 100%)" }} />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-10 text-center">
            <Reveal>
              <Pill label="Visão de Longo Prazo" color={G} icon={<Sparkles size={10} />} />
              <div className="space-y-1 mb-6">
                {[
                  { company: "Uber",    transformed: "transformou o transporte."     },
                  { company: "Airbnb",  transformed: "transformou a hospedagem."     },
                  { company: "LinkedIn",transformed: "transformou o networking profissional." },
                ].map((item, i) => (
                  <motion.p key={i}
                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                    className="text-white/42 font-semibold"
                    style={{ fontSize: "clamp(14px,2.2vw,20px)" }}>
                    <span className="text-white/75">{item.company}</span> {item.transformed}
                  </motion.p>
                ))}
              </div>
              <motion.p
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.45 }}
                className="font-black leading-tight mb-6"
                style={{
                  fontSize: "clamp(20px,3.8vw,44px)",
                  background: `linear-gradient(90deg,${G},#9aff1c 45%,${C})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                A extraGO está construindo a infraestrutura<br className="hidden sm:block" />
                digital de mão de obra do Brasil.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.62 }}
                className="text-white/45 text-[14px] leading-relaxed max-w-2xl mx-auto">
                Uma camada de tecnologia que conecta profissionais, empresas, parceiros e investidores — criando valor crescente para cada novo participante da rede e tornando o ecossistema mais robusto a cada dia.
              </motion.p>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            13 · FINAL CTA
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-14 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <GCard className="p-8 sm:p-12 text-center" accent={G} glow>
                {/* Glow orb */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle,${G}08 0%,transparent 70%)`, filter: "blur(28px)" }} />

                <div className="relative">
                  <Pill label="Oportunidade de Investimento" color={G} icon={<Award size={10} />} />

                  <h2 className="font-black leading-tight mb-4"
                    style={{ fontSize: "clamp(22px,3.8vw,44px)" }}>
                    Faça parte da construção
                    <span className="block" style={{
                      background: `linear-gradient(90deg,${G},#9aff1c,${C})`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>da infraestrutura do Brasil.</span>
                  </h2>

                  <p className="text-white/45 text-[14px] max-w-lg mx-auto leading-relaxed mb-6">
                    Conecte-se com nossa equipe para conhecer a oportunidade de investimento, os termos e como participar estrategicamente da expansão nacional da extraGO.
                  </p>

                  {/* Audience tags */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {[
                      { label: "Investidores", color: G },
                      { label: "Parceiros Estratégicos", color: C },
                      { label: "Representantes Estaduais", color: "#fbbf24" },
                      { label: "Clientes Corporativos", color: "#a855f7" },
                    ].map((tag, i) => (
                      <span key={i} className="text-[11px] px-3 py-1.5 rounded-full border"
                        style={{ borderColor: `${tag.color}22`, background: `${tag.color}08`, color: tag.color }}>
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <a href={`mailto:${CONTACT}`}>
                      <Button size="lg" className="rounded-full font-bold px-8 h-11 text-black border-none w-full sm:w-auto"
                        style={{ background: `linear-gradient(135deg,${G},#9aff1c)`, boxShadow: `0 0 28px rgba(124,252,0,0.34)` }}>
                        <Mail size={15} className="mr-2" /> Investir na extraGO
                      </Button>
                    </a>
                    <a href={`mailto:${CONTACT}`}>
                      <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-11 text-white hover:bg-white/5 w-full sm:w-auto"
                        style={{ borderColor: "rgba(255,255,255,0.16)" }}>
                        <Briefcase size={15} className="mr-2" /> Tornar-se Parceiro
                      </Button>
                    </a>
                    <Link href="/register">
                      <Button size="lg" variant="ghost"
                        className="rounded-full font-bold px-8 h-11 text-white/35 hover:text-white hover:bg-white/5 w-full sm:w-auto">
                        Explorar a Plataforma <ArrowRight size={13} className="ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <p className="text-[11px] text-white/28 flex items-center justify-center gap-2">
                    <Mail size={10} />
                    <a href={`mailto:${CONTACT}`} className="hover:text-white/55 transition-colors">{CONTACT}</a>
                  </p>
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t px-5 py-5"
        style={{ borderColor: "rgba(14,165,233,0.10)", background: "rgba(4,10,20,0.88)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/28">
          <img src={logoMain} alt="extraGO" className="h-4 object-contain opacity-55" />
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white/55 transition-colors">← Página Inicial</Link>
            <Link href="/login" className="hover:text-white/55 transition-colors">Entrar</Link>
            <a href={`mailto:${CONTACT}`} className="hover:text-white/55 transition-colors">Contato</a>
          </div>
          <p className="text-center sm:text-right">© 2026 extraGO — A Infraestrutura de Mão de Obra do Brasil.</p>
        </div>
      </footer>
    </div>
  );
}
