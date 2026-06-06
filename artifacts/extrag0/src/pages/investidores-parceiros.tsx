import React, { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import logoMain from "@assets/1779451173221_1779452671733.png";
import navbarBg from "@assets/file_00000000a5a0720e9612b56b01bfe4f0~2_1780139707862.png";
import {
  ArrowRight, TrendingUp, Users, Globe, Zap, Star,
  Building2, CheckCircle, BarChart3, Layers, DollarSign,
  MapPin, Award, Briefcase, Target, Sparkles, Mail, ChevronDown,
  Shield, Cpu, Wallet, MessageCircle, Network, Crown,
  BadgeCheck, Rocket, Lock,
} from "lucide-react";

/* ─────────── CONSTANTS ─────────── */
const CONTACT = "extrago.contato@gmail.com";
const GREEN = "#7CFC00";
const CYAN = "#00E5FF";
const TEAL = "#0ea5e9";

/* ─────────── HELPERS ─────────── */
function Rev({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >{children}</motion.div>
  );
}

function Card({ children, className = "", glow = "", top = true }: {
  children: React.ReactNode; className?: string; glow?: string; top?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border overflow-hidden ${className}`}
      style={{
        background: "rgba(8,18,36,0.75)",
        backdropFilter: "blur(24px) saturate(160%)",
        borderColor: glow ? `${glow}22` : "rgba(255,255,255,0.07)",
      }}>
      {top && glow && (
        <div className="absolute inset-x-0 top-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg,transparent,${glow}70,transparent)` }} />
      )}
      {children}
    </div>
  );
}

function SectionPill({ color, icon, label }: { color: string; icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.14em] uppercase mb-5"
      style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
      {icon}{label}
    </span>
  );
}

/* ─────────── BACKGROUND LAYERS ─────────── */
function PageBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base gradient — petroleum blue, ~40% brighter than pure black */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg, #071e3d 0%, #0a2240 20%, #082035 40%, #071a2e 60%, #0a1f38 80%, #071e3d 100%)",
      }} />

      {/* Radial atmospheric zones */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 80% 60% at 15% 20%, rgba(14,165,233,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 85% 15%, rgba(124,252,0,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 70% 40% at 50% 85%, rgba(6,182,212,0.10) 0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 75% 60%, rgba(14,165,233,0.09) 0%, transparent 55%)
        `,
      }} />

      {/* SVG network grid — Brazil-inspired connection map */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nodeglow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nodegreen" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7CFC00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7CFC00" stopOpacity="0" />
          </radialGradient>
          <filter id="blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Grid lines — subtle teal */}
        {[0, 180, 360, 540, 720, 900, 1080, 1260, 1440].map(x => (
          <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="900" stroke="rgba(14,165,233,0.05)" strokeWidth="1" />
        ))}
        {[0, 112, 225, 338, 450, 563, 675, 788, 900].map(y => (
          <line key={`hg${y}`} x1="0" y1={y} x2="1440" y2={y} stroke="rgba(14,165,233,0.05)" strokeWidth="1" />
        ))}

        {/* Brazil node map — key cities as connection hubs */}
        {/* Lines between cities */}
        {[
          // North–South corridors
          [390, 200, 450, 310], [450, 310, 480, 420], [480, 420, 510, 530], [510, 530, 530, 640],
          // East connectors
          [450, 310, 600, 280], [600, 280, 720, 260], [720, 260, 840, 290],
          [480, 420, 640, 400], [640, 400, 760, 380], [760, 380, 880, 340],
          [510, 530, 680, 510], [680, 510, 820, 490], [820, 490, 960, 460],
          // South network
          [530, 640, 620, 680], [620, 680, 740, 700], [740, 700, 860, 680],
          // Partner connections — right side business hubs
          [840, 290, 1050, 200], [880, 340, 1100, 280], [960, 460, 1150, 400],
          // Left side investment routes
          [390, 200, 220, 180], [450, 310, 200, 320], [480, 420, 190, 450],
          // Diagonal strategic routes
          [600, 280, 760, 380], [640, 400, 820, 490], [720, 260, 820, 490],
        ].map(([x1, y1, x2, y2], i) => (
          <g key={`line${i}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,0.12)" strokeWidth="1.5" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,229,255,0.06)" strokeWidth="4" filter="url(#blur2)" />
          </g>
        ))}

        {/* City nodes */}
        {[
          // Core Brazil infrastructure nodes
          [390, 200, 5, "cyan"], [450, 310, 6, "cyan"], [480, 420, 5, "green"],
          [510, 530, 6, "cyan"], [530, 640, 5, "cyan"], [600, 280, 4, "green"],
          [640, 400, 5, "cyan"], [680, 510, 4, "green"], [620, 680, 4, "cyan"],
          [720, 260, 5, "green"], [760, 380, 4, "cyan"], [820, 490, 5, "cyan"],
          [740, 700, 4, "green"], [840, 290, 4, "cyan"], [880, 340, 4, "green"],
          [960, 460, 5, "cyan"], [860, 680, 3, "cyan"],
          // Business hub satellites
          [1050, 200, 4, "green"], [1100, 280, 4, "cyan"], [1150, 400, 3, "green"],
          // West nodes
          [220, 180, 4, "cyan"], [200, 320, 3, "green"], [190, 450, 3, "cyan"],
          // Additional detail nodes
          [560, 350, 3, "cyan"], [700, 460, 3, "green"], [580, 600, 3, "cyan"],
          [300, 260, 3, "green"], [330, 400, 3, "cyan"],
        ].map(([x, y, r, type], i) => {
          const color = type === "green" ? "#7CFC00" : "#00E5FF";
          const gradId = type === "green" ? "nodegreen" : "nodeglow";
          return (
            <g key={`node${i}`}>
              <circle cx={x} cy={y} r={Number(r) * 3} fill={`url(#${gradId})`} opacity="0.6" />
              <circle cx={x} cy={y} r={r} fill={color} opacity="0.85" />
              <circle cx={x} cy={y} r={Number(r) + 2} fill="none" stroke={color} strokeWidth="0.8" opacity="0.4" />
            </g>
          );
        })}

        {/* Diagonal route highlights */}
        <line x1="0" y1="900" x2="500" y2="400" stroke="rgba(124,252,0,0.06)" strokeWidth="1" strokeDasharray="8 12" />
        <line x1="1440" y1="0" x2="900" y2="500" stroke="rgba(0,229,255,0.06)" strokeWidth="1" strokeDasharray="8 12" />
        <line x1="200" y1="0" x2="900" y2="600" stroke="rgba(14,165,233,0.04)" strokeWidth="1" strokeDasharray="12 16" />

        {/* Corner glows */}
        <ellipse cx="180" cy="160" rx="200" ry="160" fill="rgba(14,165,233,0.07)" filter="url(#blur4)" />
        <ellipse cx="1260" cy="200" rx="180" ry="140" fill="rgba(124,252,0,0.05)" filter="url(#blur4)" />
        <ellipse cx="720" cy="750" rx="300" ry="120" fill="rgba(6,182,212,0.06)" filter="url(#blur4)" />

        {/* Premium glow orbs */}
        <ellipse cx="450" cy="310" rx="80" ry="60" fill="rgba(0,229,255,0.05)" filter="url(#blur4)" />
        <ellipse cx="720" cy="260" rx="70" ry="55" fill="rgba(124,252,0,0.06)" filter="url(#blur4)" />
        <ellipse cx="820" cy="490" rx="90" ry="65" fill="rgba(0,229,255,0.05)" filter="url(#blur4)" />
      </svg>

      {/* Top premium glow sweep */}
      <div className="absolute inset-x-0 top-0 h-64" style={{
        background: "linear-gradient(180deg, rgba(14,165,233,0.10) 0%, transparent 100%)",
      }} />

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-48" style={{
        background: "linear-gradient(0deg, rgba(5,12,24,0.95) 0%, transparent 100%)",
      }} />
    </div>
  );
}

/* ─────────── DATA (PDF-exact) ─────────── */
const FEES = [
  { name: "Iniciante", fee: 18, color: "#94a3b8", bar: "90%" },
  { name: "Júnior", fee: 16, color: "#fbbf24", bar: "80%" },
  { name: "Intermediário", fee: 14, color: GREEN, bar: "70%" },
  { name: "Sênior", fee: 12, color: CYAN, bar: "60%" },
  { name: "Elite", fee: 10, color: "#a855f7", bar: "50%" },
];

const REFERRAL_TIERS = [
  { label: "Indicador", pct: "5%", color: GREEN },
  { label: "Embaixador Regional", pct: "7%", color: CYAN },
  { label: "Embaixador Nacional", pct: "10%", color: "#a855f7" },
];

const FINANCIAL = [
  { label: "Caixa e Reserva Estratégica", pct: 35, color: GREEN },
  { label: "Marketing e Crescimento", pct: 20, color: CYAN },
  { label: "Representantes Estaduais", pct: 15, color: "#fbbf24" },
  { label: "Tecnologia e Infraestrutura", pct: 10, color: "#a855f7" },
  { label: "Equipe e Operações", pct: 10, color: "#f472b6" },
  { label: "Fundo de Expansão", pct: 5, color: "#4ade80" },
  { label: "Programa de Indicações", pct: 5, color: "#22d3ee" },
];

const CAP_TABLE = [
  { name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", pct: 30, color: GREEN },
  { name: "Jean Carlos Dick", role: "CMO & Co-Founder", pct: 20, color: CYAN },
  { name: "Qaialla Pereira", role: "CCO & Co-Founder", pct: 10, color: "#a855f7" },
  { name: "Reserva para Investidores Estratégicos", role: "Investidores", pct: 20, color: "#f472b6" },
  { name: "Pool de Talentos e Executivos", role: "Equipe", pct: 10, color: "#fbbf24" },
  { name: "Reserva Estratégica da Companhia", role: "Companhia", pct: 10, color: "#64748b" },
];

const TEAM = [
  {
    name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", photo: "/team-leonardo.jpg", pct: "30%", color: GREEN,
    bio: "Responsável pela visão estratégica, produto, operações e expansão nacional da extraGO. Experiência em gestão operacional, hotelaria, liderança de equipes e desenvolvimento de negócios.",
  },
  {
    name: "Jean Carlos Dick", role: "CMO & Co-Founder", photo: "/team-jean.jpg", pct: "20%", color: CYAN,
    bio: "Fundador da MyAds. Responsável por branding, marketing, growth, aquisição de usuários e posicionamento estratégico da marca.",
  },
  {
    name: "Qaialla Pereira", role: "CCO & Co-Founder", photo: "/team-qaialla.jpg", pct: "10%", color: "#a855f7",
    bio: "Responsável pela expansão comercial, parcerias estratégicas, relacionamento corporativo e desenvolvimento de mercado.",
  },
];

const ROADMAP = [
  { n: "01", title: "Validação Regional", color: GREEN, done: true },
  { n: "02", title: "Expansão Sul", color: CYAN, done: false },
  { n: "03", title: "Expansão Nacional", color: "#fbbf24", done: false },
  { n: "04", title: "Rede Nacional de Representantes", color: "#a855f7", done: false },
  { n: "05", title: "Ecossistema Financeiro Completo", color: "#f472b6", done: false },
  { n: "06", title: "IA para Matching Inteligente", color: "#22d3ee", done: false },
  { n: "07", title: "Liderança Nacional no Mercado de Trabalho Flexível", color: "#4ade80", done: false },
];

const SOLUTIONS = [
  { icon: <Globe size={15} />, label: "Marketplace de Extras", color: GREEN },
  { icon: <MapPin size={15} />, label: "Geolocalização Inteligente", color: CYAN },
  { icon: <Target size={15} />, label: "Busca por Raio de Distância", color: "#fbbf24" },
  { icon: <MessageCircle size={15} />, label: "Chat em Tempo Real", color: "#a855f7" },
  { icon: <Star size={15} />, label: "Sistema de Reputação", color: "#f472b6" },
  { icon: <TrendingUp size={15} />, label: "Progressão de Carreira", color: "#4ade80" },
  { icon: <Wallet size={15} />, label: "Carteira Digital", color: "#22d3ee" },
  { icon: <Network size={15} />, label: "Sistema de Indicações", color: GREEN },
  { icon: <BarChart3 size={15} />, label: "Analytics Operacional", color: CYAN },
  { icon: <Shield size={15} />, label: "Painel Administrativo Nacional", color: "#fbbf24" },
  { icon: <Globe size={15} />, label: "Gestão Regional por Estado", color: "#a855f7" },
];

const MARKETS = ["Hotelaria", "Gastronomia", "Eventos", "Turismo", "Serviços", "Trabalho Temporário", "Freelancers", "Empresas"];

const PLANS = [
  {
    name: "FREE", price: "Gratuito", period: "",
    color: "#64748b", border: "rgba(100,116,139,0.2)", bg: "rgba(100,116,139,0.05)",
    icon: <Lock size={20} />,
    items: ["Perfil padrão", "Visibilidade básica", "Acesso às oportunidades"],
    flagship: false,
  },
  {
    name: "extraGO PRO", price: "R$ 19,90", period: "/mês",
    color: GREEN, border: `rgba(124,252,0,0.22)`, bg: "rgba(124,252,0,0.05)",
    icon: <BadgeCheck size={20} />,
    items: ["Maior visibilidade", "Badge PRO no perfil", "Estatísticas avançadas", "Alertas antecipados de oportunidades"],
    flagship: false,
  },
  {
    name: "extraGO PREMIUM", price: "R$ 49,90", period: "/mês",
    color: CYAN, border: `rgba(0,229,255,0.24)`, bg: "rgba(0,229,255,0.06)",
    icon: <Rocket size={20} />,
    items: ["Ranking prioritário", "Perfil premium", "Maior exposição", "Analytics avançado", "Destaque no perfil"],
    flagship: false,
  },
  {
    name: "extraGO ELITE", price: "R$ 99,90", period: "/mês",
    color: "#a855f7", border: "rgba(168,85,247,0.26)", bg: "rgba(168,85,247,0.07)",
    icon: <Crown size={20} />,
    items: ["Visibilidade máxima", "Badge ELITE", "Suporte VIP", "Oportunidades exclusivas", "Benefícios de networking estratégico"],
    flagship: true,
  },
];

/* ─────────── PAGE ─────────── */
export default function InvestidoresParceirosPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ color: "#fff" }}>
      <PageBackground />

      {/* ── NAV ── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "shadow-xl" : ""}`}
        style={{
          background: scrolled ? "rgba(5,14,28,0.92)" : "rgba(5,14,28,0.75)",
          borderBottom: scrolled ? "1px solid rgba(14,165,233,0.15)" : "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-10 h-14">
          <Link href="/"><img src={logoMain} alt="extraGO" className="h-5 object-contain" /></Link>
          <nav className="hidden md:flex items-center gap-7 text-[13px]">
            {[
              ["#missao", "Missão"], ["#modelo", "Modelo"], ["#planos", "Planos"],
              ["#equipe", "Equipe"], ["#roadmap", "Roadmap"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-white/45 hover:text-white/90 transition-colors duration-200">{label}</a>
            ))}
            <Link href="/" className="text-white/25 hover:text-white/55 transition-colors text-xs">← Voltar</Link>
          </nav>
          <a href={`mailto:${CONTACT}`}>
            <Button className="rounded-full px-5 h-9 text-[13px] font-bold text-black border-none"
              style={{ background: `linear-gradient(135deg,${GREEN},#9aff1c 60%,${CYAN})`, boxShadow: "0 0 18px rgba(124,252,0,0.3)" }}>
              Contato
            </Button>
          </a>
        </div>
      </header>

      <main className="relative z-10 flex-1">

        {/* ══════════════════════════════
            HERO — compact, impactful
        ══════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: "72vh" }}>
          {/* Image layer — right side only, blended */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-cover bg-right-top opacity-30"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "60% center" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(105deg, rgba(5,14,28,0.98) 0%, rgba(5,14,28,0.94) 35%, rgba(5,14,28,0.7) 60%, rgba(5,14,28,0.35) 100%)" }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 flex items-center" style={{ minHeight: "72vh" }}>
            <div className="py-16 sm:py-20" style={{ maxWidth: 580 }}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-[0.14em] uppercase mb-5"
                  style={{ background: "rgba(124,252,0,0.11)", border: "1px solid rgba(124,252,0,0.28)", color: GREEN }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
                  Investidores &amp; Parceiros Estratégicos
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.8 }}
                className="font-black leading-[1.04] mb-5" style={{ fontSize: "clamp(34px,5.2vw,60px)" }}>
                A Infraestrutura de<br />Mão de Obra
                <span className="block" style={{
                  background: `linear-gradient(90deg,${GREEN} 0%,#9aff1c 40%,${CYAN} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>do Brasil.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-white/58 text-base leading-relaxed mb-7" style={{ maxWidth: 490 }}>
                Uma plataforma tecnológica que conecta empresas e profissionais para contratação de mão de obra flexível, digitalizando um mercado que ainda opera de forma fragmentada.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62 }}
                className="flex flex-wrap gap-3 mb-8">
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" className="rounded-full font-bold px-7 h-11 text-black border-none"
                    style={{ background: `linear-gradient(135deg,${GREEN},#9aff1c)`, boxShadow: "0 0 26px rgba(124,252,0,0.36)" }}>
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

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="flex items-center gap-6 text-[11px] text-white/30 border-t border-white/7 pt-6">
                {[
                  { label: "Marketplace de Extras" }, { label: "Rede Nacional" }, { label: "Receita Recorrente" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? GREEN : i === 1 ? CYAN : "#a855f7" }} />
                    {item.label}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1">
            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
              <ChevronDown size={16} className="text-white/20" />
            </motion.div>
          </div>
        </section>

        {/* ── Inspiration strip ── */}
        <div className="border-y" style={{ borderColor: "rgba(14,165,233,0.12)", background: "rgba(14,165,233,0.04)" }}>
          <div className="max-w-4xl mx-auto px-6 py-4 text-center">
            <p className="text-[12px] sm:text-[13px] text-white/45 leading-relaxed">
              Inspirada em modelos como{" "}
              <span className="text-white/70 font-semibold">Uber, LinkedIn, Airbnb, Stripe e Nubank</span>
              {" "}— a extraGO une marketplace, reputação, geolocalização, pagamentos, gamificação e crescimento em rede em um único ecossistema.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════
            MISSÃO + MERCADOS
        ══════════════════════════════ */}
        <section id="missao" className="px-6 sm:px-10 py-14 sm:py-18">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-8 items-stretch">
            <Rev>
              <Card className="p-6 sm:p-8 h-full" glow={GREEN}>
                <SectionPill color={GREEN} icon={<Sparkles size={10} />} label="Nossa Missão" />
                <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3">
                  Transformar o trabalho<br />flexível no Brasil.
                </h2>
                <p className="text-white/52 text-[14px] leading-relaxed mb-5">
                  Criar um ambiente mais eficiente, seguro, transparente e escalável para a conexão entre profissionais e empresas em todo o território nacional.
                </p>
                <div className="pt-4 border-t border-white/6">
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/28 mb-3">Mercados Atendidos</p>
                  <div className="flex flex-wrap gap-2">
                    {MARKETS.map(m => (
                      <span key={m} className="text-[11px] px-2.5 py-1 rounded-full border text-white/55"
                        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.025)" }}>{m}</span>
                    ))}
                  </div>
                </div>
              </Card>
            </Rev>

            {/* Problem */}
            <Rev delay={0.07}>
              <div className="grid gap-4 h-full">
                {[
                  {
                    icon: <Building2 size={18} />, title: "Para Empresas", color: CYAN,
                    items: ["Dificuldade para contratar rapidamente", "Falta de profissionais qualificados", "Alto custo operacional", "Ausência de histórico confiável", "Baixa previsibilidade"],
                  },
                  {
                    icon: <Users size={18} />, title: "Para Profissionais", color: GREEN,
                    items: ["Falta de oportunidades recorrentes", "Dependência de grupos informais", "Ausência de reputação validada", "Pouca valorização profissional", "Crescimento limitado"],
                  },
                ].map((side, i) => (
                  <Card key={i} className="p-5 flex-1" glow={side.color}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${side.color}14`, border: `1px solid ${side.color}25` }}>
                        <span style={{ color: side.color }}>{side.icon}</span>
                      </div>
                      <span className="text-[13px] font-bold" style={{ color: side.color }}>{side.title}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {side.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-[11px] text-white/52">
                          <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: side.color }} />
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════
            SOLUÇÃO — pill layout
        ══════════════════════════════ */}
        <section id="solucao" className="px-6 sm:px-10 py-12 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-6">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <SectionPill color={CYAN} icon={<Zap size={10} />} label="Nossa Solução" />
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">Uma plataforma completa. Um ecossistema escalável.</h2>
                </div>
                <p className="text-white/45 text-[13px] max-w-xs leading-relaxed hidden sm:block">
                  A extraGO centraliza toda a jornada em uma única plataforma.
                </p>
              </div>
            </Rev>
            <div className="flex flex-wrap gap-2.5">
              {SOLUTIONS.map((s, i) => (
                <Rev key={i} delay={i * 0.03}>
                  <motion.div
                    whileHover={{ scale: 1.03, borderColor: `${s.color}35` }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full border cursor-default"
                    style={{
                      background: "rgba(8,18,36,0.6)",
                      borderColor: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(12px)",
                    }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                    <span className="text-[12px] text-white/65 font-medium">{s.label}</span>
                  </motion.div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            MODELO — 3 column grid
        ══════════════════════════════ */}
        <section id="modelo" className="px-6 sm:px-10 py-14 sm:py-18 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(14,165,233,0.025)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-8">
              <SectionPill color={GREEN} icon={<DollarSign size={10} />} label="Modelo de Monetização" />
              <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-2">Receita recorrente com incentivos de qualidade.</h2>
              <p className="text-white/45 text-[13px] max-w-xl leading-relaxed">
                A receita principal é gerada por taxa de intermediação sobre os extras concluídos, criando alinhamento entre plataforma, empresas e profissionais.
              </p>
            </Rev>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* Fee progression */}
              <Rev>
                <Card className="p-5 sm:p-6 h-full" glow={GREEN}>
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Progressão de Carreira</p>
                  <div className="space-y-3">
                    {FEES.map((f, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3">
                        <span className="w-24 text-[12px] font-semibold text-white/62 flex-shrink-0">{f.name}</span>
                        <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: f.bar }}
                            viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-lg flex items-center justify-end pr-2"
                            style={{ background: `linear-gradient(90deg,${f.color}30,${f.color}65)`, borderRight: `2px solid ${f.color}` }}>
                            <span className="text-[10px] font-black" style={{ color: f.color }}>{f.fee}%</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/28 mt-4 leading-snug">
                    Quanto mais o profissional evolui → menor a taxa → maior retenção e qualidade.
                  </p>
                </Card>
              </Rev>

              {/* Referral */}
              <Rev delay={0.08}>
                <Card className="p-5 sm:p-6 h-full" glow={CYAN}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${CYAN}14`, border: `1px solid ${CYAN}25` }}>
                      <Network size={15} style={{ color: CYAN }} />
                    </div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/30">Sistema de Indicações</p>
                  </div>
                  <p className="text-[12px] text-white/52 leading-relaxed mb-4">
                    Cada usuário possui um código exclusivo. Quando um indicado realiza trabalhos, o indicador recebe participação recorrente sobre a receita gerada.
                  </p>
                  <div className="space-y-2.5 mb-4">
                    {REFERRAL_TIERS.map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/6 bg-white/[0.025]">
                        <div>
                          <p className="text-[13px] font-semibold text-white/80">{t.label}</p>
                        </div>
                        <span className="text-xl font-black" style={{ color: t.color }}>{t.pct}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/6">
                    {["Receita recorrente", "Crescimento orgânico", "Redução do CAC", "Incentivo à retenção"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-white/48 mb-1.5">
                        <CheckCircle size={10} style={{ color: GREEN, flexShrink: 0 }} />{item}
                      </div>
                    ))}
                  </div>
                </Card>
              </Rev>

              {/* Financial structure */}
              <Rev delay={0.14}>
                <Card className="p-5 sm:p-6 h-full" glow="#fbbf24">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.22)" }}>
                      <BarChart3 size={15} className="text-yellow-400" />
                    </div>
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/30">Estrutura Financeira</p>
                  </div>
                  <div className="space-y-2">
                    {FINANCIAL.map((item, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] text-white/58 leading-tight">{item.label}</span>
                          <span className="text-[12px] font-black ml-2 flex-shrink-0" style={{ color: item.color }}>{item.pct}%</span>
                        </div>
                        <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: `${item.pct * 2.86}%` }}
                            viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.3, duration: 0.75 }}
                            className="h-full rounded-full"
                            style={{ background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/28 mt-4 leading-snug">
                    Modelo estruturado para crescimento sustentável e escalabilidade nacional.
                  </p>
                </Card>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            SUBSCRIPTION PLANS
        ══════════════════════════════ */}
        <section id="planos" className="px-6 sm:px-10 py-14 sm:py-18 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-3">
              <SectionPill color="#a855f7" icon={<Crown size={10} />} label="Planos de Assinatura" />
              <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">Receita recorrente mensal.</h2>
                  <p className="text-white/45 text-[13px] mt-2 max-w-xl leading-relaxed">
                    Cada profissional ativo na plataforma pode assinar um plano premium que amplifica sua visibilidade, acesso e crescimento na rede extraGO.
                  </p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[11px] text-white/30 uppercase tracking-wider">Receita recorrente mensal</p>
                  <p className="text-xs text-white/45 mt-0.5">Escalável com a base de usuários</p>
                </div>
              </div>
            </Rev>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan, i) => (
                <Rev key={i} delay={i * 0.07}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="relative rounded-2xl border overflow-hidden h-full cursor-default flex flex-col"
                    style={{
                      background: plan.flagship
                        ? `linear-gradient(145deg, rgba(168,85,247,0.12), rgba(8,18,36,0.9))`
                        : plan.bg,
                      borderColor: plan.border,
                      boxShadow: plan.flagship ? `0 0 40px rgba(168,85,247,0.18)` : "none",
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[1.5px]"
                      style={{ background: `linear-gradient(90deg,transparent,${plan.color}60,transparent)` }} />

                    {plan.flagship && (
                      <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full text-black"
                        style={{ background: plan.color }}>FLAGSHIP</div>
                    )}

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                        style={{ background: `${plan.color}14`, border: `1px solid ${plan.color}25` }}>
                        <span style={{ color: plan.color }}>{plan.icon}</span>
                      </div>

                      <p className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>
                        {plan.name}
                      </p>

                      <div className="mb-4">
                        <span className="text-2xl font-black text-white">{plan.price}</span>
                        {plan.period && <span className="text-[12px] text-white/35 ml-0.5">{plan.period}</span>}
                      </div>

                      <div className="h-px bg-white/6 mb-4" />

                      <ul className="space-y-2 flex-1">
                        {plan.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-[11px] text-white/55">
                            <span className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: plan.color }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </Rev>
              ))}
            </div>

            {/* Investor note */}
            <Rev delay={0.3} className="mt-4">
              <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-purple-500/14"
                style={{ background: "rgba(168,85,247,0.04)" }}>
                <TrendingUp size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-white/45 leading-relaxed">
                  <span className="text-white/70 font-semibold">Para investidores:</span>{" "}
                  O modelo de assinaturas gera receita recorrente mensal que escala proporcionalmente com a base de usuários ativos, criando previsibilidade financeira independente do volume de extras.
                </p>
              </div>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════
            ESTRUTURA FINANCEIRA — infographic
        ══════════════════════════════ */}
        <section className="px-6 sm:px-10 py-14 sm:py-18 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(124,252,0,0.02)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="mb-8">
              <SectionPill color={GREEN} icon={<BarChart3 size={10} />} label="Estrutura Financeira da Plataforma" />
              <div className="grid sm:grid-cols-2 gap-6 items-end">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-2">Governança, sustentabilidade<br />e escalabilidade.</h2>
                  <p className="text-white/45 text-[13px] leading-relaxed">
                    Este modelo foi estruturado para garantir crescimento sustentável, expansão nacional, fortalecimento da rede de representantes e evolução contínua da plataforma.
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] text-white/28 uppercase tracking-wider">Distribuição da receita operacional</p>
                </div>
              </div>
            </Rev>

            <Rev delay={0.08}>
              <Card className="p-6 sm:p-8" glow={GREEN}>
                {/* Stacked bar visualisation */}
                <div className="mb-6">
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/28 mb-3">Alocação da Receita Operacional</p>
                  <div className="flex h-10 rounded-xl overflow-hidden w-full gap-px">
                    {FINANCIAL.map((item, i) => (
                      <motion.div key={i}
                        initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                        viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.2, duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
                        className="h-full flex items-center justify-center relative group overflow-hidden"
                        style={{ background: `${item.color}30`, borderRight: `2px solid ${item.color}50` }}
                        title={`${item.label}: ${item.pct}%`}
                      >
                        {item.pct >= 10 && (
                          <span className="text-[10px] font-black" style={{ color: item.color }}>{item.pct}%</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Legend grid */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {FINANCIAL.map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                        <span className="text-[11px] font-black" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-[12px] text-white/70 font-medium leading-tight truncate">{item.label}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: `${item.pct * 2.86}%` }}
                            viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.4, duration: 0.75 }}
                            className="h-full rounded-full" style={{ background: item.color }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Highlight box */}
                <div className="mt-5 p-4 rounded-xl border" style={{ background: "rgba(124,252,0,0.05)", borderColor: "rgba(124,252,0,0.18)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(124,252,0,0.14)" }}>
                      <Shield size={13} style={{ color: GREEN }} />
                    </div>
                    <p className="text-[12px] text-white/55 leading-relaxed">
                      <span className="text-primary font-bold">35% em caixa e reserva estratégica</span>{" "}
                      garante solidez operacional, suporta períodos de crescimento acelerado e protege a operação em cenários adversos.
                    </p>
                  </div>
                </div>
              </Card>
            </Rev>
          </div>
        </section>

        {/* ══════════════════════════════
            EXPANSÃO NACIONAL
        ══════════════════════════════ */}
        <section className="relative overflow-hidden py-14 sm:py-18 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {/* Image accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "50% 40%" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,14,28,0.95) 0%,rgba(5,14,28,0.6) 30%,rgba(5,14,28,0.6) 70%,rgba(5,14,28,0.95) 100%)" }} />
          </div>
          <div className="relative z-10 px-6 sm:px-10 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <Rev>
                <SectionPill color="#fbbf24" icon={<MapPin size={10} />} label="Expansão Nacional" />
                <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3">
                  Um representante por estado.<br />
                  <span className="text-white/40">27 estados. Todo o Brasil.</span>
                </h2>
                <p className="text-white/50 text-[13px] leading-relaxed mb-6">
                  A expansão da extraGO será conduzida por uma rede de representantes estaduais responsáveis pelo crescimento regional, parcerias estratégicas e fortalecimento da marca.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Crescimento regional", "Parcerias estratégicas", "Desenvolvimento comercial", "Expansão operacional", "Fortalecimento da marca"].map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border text-white/55"
                      style={{ borderColor: "rgba(251,191,36,0.18)", background: "rgba(251,191,36,0.05)" }}>
                      <CheckCircle size={10} className="text-yellow-400" />{item}
                    </span>
                  ))}
                </div>
              </Rev>

              <Rev delay={0.1}>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { num: "27", label: "Representantes", sub: "um por estado", color: "#fbbf24" },
                    { num: "15%", label: "da Receita", sub: "para representantes", color: GREEN },
                    { num: "100%", label: "do Território", sub: "nacional coberto", color: CYAN },
                  ].map((s, i) => (
                    <Card key={i} className="p-4 text-center" glow={s.color}>
                      <p className="text-3xl sm:text-4xl font-black mb-1" style={{ color: s.color }}>{s.num}</p>
                      <p className="text-[11px] font-semibold text-white/65 leading-tight">{s.label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{s.sub}</p>
                    </Card>
                  ))}
                </div>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            ECOSSISTEMA ADMIN
        ══════════════════════════════ */}
        <section className="px-6 sm:px-10 py-14 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <Rev>
                <SectionPill color="#a855f7" icon={<Cpu size={10} />} label="Ecossistema Administrativo" />
                <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3">Governança total. Em tempo real.</h2>
                <p className="text-white/50 text-[13px] leading-relaxed">
                  Estrutura completa de controle sobre cada região, usuário e métrica operacional — preparada para escalar a nível nacional com rastreabilidade total.
                </p>
              </Rev>
              <Rev delay={0.08}>
                <Card className="p-5" glow="#a855f7">
                  <div className="grid grid-cols-2 gap-2">
                    {["Painel Executivo", "Analytics em Tempo Real", "Gestão Financeira", "Gestão Regional", "Monitoramento Operacional", "KPIs Nacionais", "Gestão de Usuários", "Gestão de Representantes", "Mapa Interativo do Brasil", "Sistema de Auditoria"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#a855f7" }} />
                        <span className="text-[11px] text-white/58 leading-tight">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            EQUIPE
        ══════════════════════════════ */}
        <section id="equipe" className="px-6 sm:px-10 py-14 sm:py-18 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="text-center mb-8">
              <SectionPill color={CYAN} icon={<Users size={10} />} label="Liderança" />
              <h2 className="text-2xl sm:text-3xl font-black leading-tight">Quem está construindo o futuro.</h2>
            </Rev>
            <div className="grid sm:grid-cols-3 gap-5">
              {TEAM.map((m, i) => (
                <Rev key={i} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="rounded-2xl overflow-hidden border h-full flex flex-col"
                    style={{
                      background: "rgba(8,18,36,0.85)",
                      borderColor: `${m.color}18`,
                      backdropFilter: "blur(20px)",
                    }}>
                    <div className="h-[1.5px]" style={{ background: `linear-gradient(90deg,transparent,${m.color},transparent)` }} />
                    <div className="p-6 flex flex-col items-center text-center flex-1">
                      <div className="relative w-[72px] h-[72px] mb-4 flex-shrink-0">
                        <div className="absolute inset-0 rounded-full blur-lg opacity-20 scale-110" style={{ background: m.color }} />
                        <img src={m.photo} alt={m.name}
                          className="relative rounded-full object-cover"
                          style={{ width: 72, height: 72, border: `2px solid ${m.color}40` }}
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=071e3d&color=7CFC00&size=80`; }}
                        />
                        <span className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full text-black"
                          style={{ background: m.color }}>{m.pct}</span>
                      </div>
                      <h3 className="font-bold text-[14px] leading-tight mb-0.5">{m.name}</h3>
                      <p className="text-[11px] font-bold tracking-wide mb-3" style={{ color: m.color }}>{m.role}</p>
                      <p className="text-[11px] text-white/42 leading-relaxed">{m.bio}</p>
                    </div>
                  </motion.div>
                </Rev>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            CAP TABLE
        ══════════════════════════════ */}
        <section className="px-6 sm:px-10 py-14 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="max-w-5xl mx-auto">
            <Rev className="mb-6">
              <SectionPill color="#f472b6" icon={<Layers size={10} />} label="Estrutura Societária" />
              <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-2">Distribuição de participações.</h2>
              <p className="text-white/45 text-[13px] max-w-lg leading-relaxed">
                A extraGO possui espaço reservado para investidores estratégicos que desejam participar da construção da principal infraestrutura digital de trabalho flexível do Brasil.
              </p>
            </Rev>
            <div className="grid sm:grid-cols-2 gap-4">
              <Rev delay={0.05}>
                <Card className="p-5 sm:p-6" glow="#f472b6">
                  <div className="space-y-3.5">
                    {CAP_TABLE.map((entry, i) => (
                      <motion.div key={i}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-white/78 truncate">{entry.name}</p>
                              <p className="text-[10px] text-white/30">{entry.role}</p>
                            </div>
                            <span className="text-[14px] font-black flex-shrink-0" style={{ color: entry.color }}>{entry.pct}%</span>
                          </div>
                          <div className="h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <motion.div
                              initial={{ width: 0 }} whileInView={{ width: `${entry.pct * 3.33}%` }}
                              viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.25, duration: 0.85, ease: [0.19, 1, 0.22, 1] }}
                              className="h-full rounded-full" style={{ background: entry.color }} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </Rev>

              <Rev delay={0.1}>
                <Card className="p-5 sm:p-6 h-full flex flex-col" glow="#f472b6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.22)" }}>
                      <Award size={16} className="text-pink-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-pink-400 mb-0.5">Oportunidade para Investidores</p>
                      <p className="text-[11px] text-white/40">Reserva de 20% para investidores estratégicos</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-white/50 leading-relaxed mb-4">
                    Os recursos captados serão direcionados para:
                  </p>
                  <div className="flex-1 grid gap-2">
                    {["Expansão nacional", "Tecnologia e inovação", "Marketing e aquisição", "Estruturação operacional", "Rede de representantes", "Novos produtos financeiros", "IA e matching inteligente"].map((use, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-white/55">
                        <ArrowRight size={10} className="text-pink-400 flex-shrink-0" />{use}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/6">
                    <a href={`mailto:${CONTACT}`} className="flex items-center gap-2 text-[12px] text-pink-400 hover:text-pink-300 transition-colors font-semibold">
                      <Mail size={12} /> Entrar em contato sobre investimento
                    </a>
                  </div>
                </Card>
              </Rev>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            ROADMAP
        ══════════════════════════════ */}
        <section id="roadmap" className="px-6 sm:px-10 py-14 sm:py-18 border-t"
          style={{ borderColor: "rgba(14,165,233,0.12)", background: "rgba(14,165,233,0.02)" }}>
          <div className="max-w-6xl mx-auto">
            <Rev className="text-center mb-10">
              <SectionPill color={CYAN} icon={<TrendingUp size={10} />} label="Roadmap" />
              <h2 className="text-2xl sm:text-3xl font-black leading-tight">A jornada rumo à liderança nacional.</h2>
            </Rev>
            <div className="relative">
              {/* connector */}
              <div className="absolute top-6 left-6 right-6 h-px hidden sm:block"
                style={{ background: `linear-gradient(90deg,${GREEN}50,${CYAN}30,rgba(168,85,247,0.15))` }} />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {ROADMAP.map((step, i) => (
                  <Rev key={i} delay={i * 0.05}>
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className="relative z-10 w-12 h-12 rounded-2xl flex flex-col items-center justify-center border"
                        style={{
                          background: step.done ? `${step.color}14` : "rgba(255,255,255,0.03)",
                          borderColor: step.done ? `${step.color}45` : "rgba(255,255,255,0.07)",
                          boxShadow: step.done ? `0 0 16px ${step.color}22` : "none",
                        }}>
                        <span className="text-[10px] font-black" style={{ color: step.done ? step.color : "rgba(255,255,255,0.18)" }}>
                          {step.n}
                        </span>
                        {step.done && <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: step.color }} />}
                      </div>
                      <p className="text-[10px] font-medium text-white/55 leading-tight">{step.title}</p>
                    </div>
                  </Rev>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════
            VISÃO + CTA
        ══════════════════════════════ */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-15"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundPosition: "50% 50%" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,14,28,0.95) 0%,rgba(5,14,28,0.55) 20%,rgba(5,14,28,0.55) 80%,rgba(5,14,28,0.98) 100%)" }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 text-center">
            <Rev>
              <SectionPill color={GREEN} icon={<Sparkles size={10} />} label="Visão" />
              <blockquote className="font-black leading-tight mb-4"
                style={{ fontSize: "clamp(24px,4vw,48px)" }}>
                Uber transformou o transporte.<br />
                Airbnb transformou a hospedagem.<br />
                LinkedIn transformou o networking.
              </blockquote>
              <p className="font-black mb-8"
                style={{
                  fontSize: "clamp(20px,3.2vw,38px)",
                  background: `linear-gradient(90deg,${GREEN},#9aff1c 45%,${CYAN})`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                A extraGO está construindo a infraestrutura<br />nacional de mão de obra do Brasil.
              </p>
            </Rev>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 sm:px-10 pb-20 sm:pb-24">
          <div className="max-w-4xl mx-auto">
            <Rev>
              <Card className="p-8 sm:p-12 text-center" glow={GREEN}>
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle,${GREEN}08 0%,transparent 70%)`, filter: "blur(30px)" }} />
                <SectionPill color={GREEN} icon={<Sparkles size={10} />} label="Oportunidade de Investimento" />
                <h2 className="font-black leading-tight mb-4"
                  style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                  Faça parte da construção
                  <span className="block" style={{
                    background: `linear-gradient(90deg,${GREEN},#9aff1c,${CYAN})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>da infraestrutura do Brasil.</span>
                </h2>
                <p className="text-white/45 mb-8 text-[14px] max-w-lg mx-auto leading-relaxed">
                  Conecte-se com nossa equipe para conhecer a oportunidade, os termos e como participar da expansão nacional da extraGO.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                  <a href={`mailto:${CONTACT}`}>
                    <Button size="lg" className="rounded-full font-bold px-8 h-11 text-black border-none"
                      style={{ background: `linear-gradient(135deg,${GREEN},#9aff1c)`, boxShadow: `0 0 28px rgba(124,252,0,0.35)` }}>
                      <Mail size={15} className="mr-2" /> Investir na extraGO
                    </Button>
                  </a>
                  <a href={`mailto:${CONTACT}`}>
                    <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-11 text-white hover:bg-white/5"
                      style={{ borderColor: "rgba(255,255,255,0.16)" }}>
                      <Briefcase size={15} className="mr-2" /> Tornar-se Parceiro
                    </Button>
                  </a>
                  <Link href="/register">
                    <Button size="lg" variant="ghost" className="rounded-full font-bold px-8 h-11 text-white/40 hover:text-white hover:bg-white/5">
                      Explorar a Plataforma <ArrowRight size={13} className="ml-1" />
                    </Button>
                  </Link>
                </div>
                <p className="text-[12px] text-white/28 flex items-center justify-center gap-2">
                  <Mail size={11} />
                  <a href={`mailto:${CONTACT}`} className="hover:text-white/55 transition-colors">{CONTACT}</a>
                </p>
              </Card>
            </Rev>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t px-6 py-5" style={{ borderColor: "rgba(14,165,233,0.1)", background: "rgba(5,14,28,0.85)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/28">
          <img src={logoMain} alt="extraGO" className="h-4 object-contain opacity-55" />
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
