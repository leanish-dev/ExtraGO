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
        background: "rgba(8,18,36,0.72)",
        backdropFilter: "blur(28px) saturate(160%)",
        borderColor: accent ? `${accent}28` : "rgba(255,255,255,0.09)",
        boxShadow: glow && accent
          ? `0 0 0 1px ${accent}12, 0 0 32px ${accent}18, 0 8px 40px rgba(0,0,0,0.45)`
          : "0 4px 24px rgba(0,0,0,0.35)",
      }}>
      {accent && (
        <div className="absolute inset-x-0 top-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg,transparent,${accent}80,transparent)` }} />
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

/* ─── full-page background: single image, no legacy layers ─── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* New page background — sole image, rendered exactly once */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/investors-page-bg-new.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />
      {/* Dark overlay — calibrated for dark-premium, not dark-heavy */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(4,10,22,0.60)" }}
      />
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
  { label: "Caixa e Reserva Estratégica",   pct: 25, color: G,         purpose: "Solidez operacional e proteção a longo prazo" },
  { label: "Marketing e Crescimento",        pct: 20, color: C,         purpose: "Aquisição de usuários e expansão da marca" },
  { label: "Tecnologia e Infraestrutura",    pct: 15, color: "#a855f7", purpose: "Evolução da plataforma e inovação contínua" },
  { label: "Distribuição de Lucro — Parceiros", pct: 15, color: "#f472b6", purpose: "Retorno para parceiros e investidores ativos" },
  { label: "Equipe e Operações",             pct: 10, color: "#fbbf24", purpose: "Estrutura operacional e talentos estratégicos" },
  { label: "Representantes Estaduais",       pct:  5, color: "#4ade80", purpose: "Comissão da rede de representantes nacionais" },
  { label: "Programa de Indicações",         pct:  5, color: "#22d3ee", purpose: "Recompensas do sistema de referral multinível" },
  { label: "Fundo de Expansão",              pct:  5, color: "#fb923c", purpose: "Novos mercados, produtos e iniciativas estratégicas" },
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
        <section className="relative overflow-hidden">

          {/* ── Institutional header banner — new branded image ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.95, ease: "easeOut" }}
            className="relative w-full overflow-hidden"
          >
            <img
              src="/investors-banner-header.png"
              alt="extraGO — Investidores, Parceiros e Equipe"
              className="w-full block object-cover"
              style={{
                height: "clamp(120px, 19vw, 230px)",
                objectPosition: "center center",
              }}
            />
            {/* Bottom vignette — blends into dark hero text area */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(5,12,26,0.08) 0%, rgba(5,12,26,0.50) 60%, rgba(5,12,26,0.98) 100%)" }} />
            {/* Edge vignette */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(90deg, rgba(5,12,26,0.52) 0%, transparent 20%, transparent 80%, rgba(5,12,26,0.52) 100%)" }} />
          </motion.div>

          {/* ── Dark photo composite — right side, desktop ── */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <div className="absolute inset-0"
              style={{
                backgroundImage: "url(/investors-bg.png)",
                backgroundSize: "auto 90%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "96% center",
                opacity: 0.58,
                filter: "saturate(1.30)",
              }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(108deg, rgba(5,12,26,1) 0%, rgba(5,12,26,0.92) 32%, rgba(5,12,26,0.45) 62%, rgba(5,12,26,0.05) 100%)" }} />
          </div>

          {/* ── Text content — overlaps banner bottom ── */}
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 -mt-8 sm:-mt-14 pb-12 sm:pb-18">
            <div className="py-6 sm:py-10" style={{ maxWidth: 560 }}>

              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5 text-[10px] font-black tracking-[0.15em] uppercase"
                style={{ background: "rgba(124,252,0,0.10)", border: "1px solid rgba(124,252,0,0.28)", color: G }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G }} />
                Investidores &amp; Parceiros Estratégicos
              </motion.span>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.30, duration: 0.80, ease: [0.19,1,0.22,1] }}
                className="font-black leading-[1.04] mb-5"
                style={{ fontSize: "clamp(32px,5vw,58px)", textShadow: "0 2px 18px rgba(0,0,0,0.65)" }}>
                A Infraestrutura de<br />Mão de Obra
                <span className="block" style={{
                  background: `linear-gradient(90deg,${G} 0%,#9aff1c 40%,${C} 100%)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>do Brasil.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }}
                className="text-white/65 text-[15px] leading-relaxed mb-7"
                style={{ maxWidth: 480, textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                Uma plataforma tecnológica que digitaliza o ecossistema de mão de obra flexível, conectando profissionais, empresas, parceiros e representantes em escala nacional.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.60 }}
                className="flex flex-wrap gap-3 mb-8">
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" className="rounded-full font-bold px-7 h-11 text-black border-none"
                    style={{ background: `linear-gradient(135deg,${G},#9aff1c)`, boxShadow: "0 0 28px rgba(124,252,0,0.38)" }}>
                    Investir na extraGO <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </a>
                <a href={`mailto:${CONTACT}`}>
                  <Button size="lg" variant="outline" className="rounded-full font-bold px-7 h-11 text-white hover:bg-white/5"
                    style={{ borderColor: "rgba(255,255,255,0.22)" }}>
                    Tornar-se Parceiro
                  </Button>
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
                className="flex items-center flex-wrap gap-x-6 gap-y-2 pt-5 border-t border-white/10 text-[11px] text-white/40">
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
                <div className="divide-y divide-white/6">
                  {[
                    {
                      icon: <TrendingUp size={15} />, color: G,
                      title: "Crescimento do Trabalho Flexível",
                      desc: "A modalidade por demanda cresce em todos os setores — de hotelaria a eventos a serviços gerais.",
                    },
                    {
                      icon: <Zap size={15} />, color: C,
                      title: "Transformação Digital Acelerada",
                      desc: "Empresas estão adotando ferramentas digitais para cada etapa da operação — incluindo recrutamento.",
                    },
                    {
                      icon: <Shield size={15} />, color: "#fbbf24",
                      title: "Demanda por Eficiência Operacional",
                      desc: "Pressão por custo e velocidade força a substituição de processos manuais por plataformas integradas.",
                    },
                    {
                      icon: <Star size={15} />, color: "#a855f7",
                      title: "Profissionais Buscando Consistência",
                      desc: "Trabalhadores flexíveis precisam de uma plataforma que construa sua reputação e garanta acesso contínuo.",
                    },
                  ].map((item, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-4 py-4">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${item.color}12` }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white/82 mb-0.5">{item.title}</p>
                        <p className="text-[12px] text-white/42 leading-relaxed">{item.desc}</p>
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
        <section id="solucao" className="relative overflow-hidden px-5 sm:px-10 py-16 sm:py-24">
          {/* Background — network/ecosystem */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0"
              style={{ backgroundImage: "url(/sec-pilares.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.48, filter: "saturate(1.45) contrast(1.10)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg,rgba(5,12,26,0.82) 0%,rgba(5,12,26,0.38) 50%,rgba(5,12,26,0.82) 100%)" }} />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="A Solução" color={G} icon={<Zap size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)", textShadow: "0 2px 16px rgba(0,0,0,0.70)" }}>
                Quatro pilares.<br />Um ecossistema completo.
              </h2>
              <p className="text-white/65 text-[14px] leading-relaxed max-w-xl" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                A extraGO não é um app de contratação — é a camada de infraestrutura que conecta todos os participantes do mercado de trabalho flexível em uma única plataforma integrada.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
              {PILLARS.map((p, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div className="pl-5 border-l-2" style={{ borderColor: `${p.color}60` }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <span style={{ color: p.color }}>{p.icon}</span>
                      <span className="text-[11px] font-black tracking-[0.15em] uppercase" style={{ color: p.color }}>{p.name}</span>
                    </div>
                    <ul className="space-y-2">
                      {p.items.map((item, j) => (
                        <li key={j} className="text-[14px] text-white/60 leading-snug">{item}</li>
                      ))}
                    </ul>
                  </div>
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

            <div className="divide-y divide-white/6">
              {ADVANTAGES.map((adv, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-5 py-5">
                    <span className="text-[10px] font-black tracking-widest text-white/18 flex-shrink-0 w-5 pt-1 hidden sm:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${adv.color}13`, border: `1px solid ${adv.color}22` }}>
                      <span style={{ color: adv.color }}>{adv.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-bold text-white/88 mb-1.5 leading-tight">{adv.title}</h3>
                      <p className="text-[13px] text-white/48 leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
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
            <div className="absolute inset-0"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundSize: "cover", backgroundPosition: "center 42%", opacity: 0.48, filter: "saturate(1.35) contrast(1.06)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.88) 0%,rgba(5,12,26,0.28) 25%,rgba(5,12,26,0.28) 75%,rgba(5,12,26,0.88) 100%)" }} />
          </div>

          <div className="relative z-10 px-5 sm:px-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Modelo de Expansão Nacional" color="#fbbf24" icon={<MapPin size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)", textShadow: "0 2px 16px rgba(0,0,0,0.70)" }}>
                Um representante por estado.<br />
                <span className="text-white/50">27 estados. Todo o Brasil.</span>
              </h2>
              <p className="text-white/65 text-[14px] leading-relaxed max-w-2xl" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                A estratégia de expansão da extraGO é ancorada em representantes estaduais com profundo conhecimento regional. Cada representante é responsável pelo desenvolvimento comercial, parcerias locais, relacionamento com empresas e crescimento da rede profissional em seu estado.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { num: "27", label: "Estados cobertos", sub: "1 representante por estado", color: "#fbbf24" },
                { num: "5%", label: "da Receita Alocada", sub: "para a rede de representantes", color: G },
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
                  <p className="text-[12px] text-white/50 leading-relaxed mb-3">
                    Cada usuário recebe um <span className="text-white/70 font-semibold">código exclusivo</span> e um <span className="text-white/70 font-semibold">link exclusivo</span>. Quando um indicado realiza extras, o indicador recebe <span className="text-white/70 font-semibold">5% das taxas de intermediação</span> geradas — de forma contínua e recorrente.
                  </p>
                  <div className="space-y-2.5 mb-4">
                    {REFERRAL.map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/6 bg-white/[0.025]">
                        <span className="text-[13px] font-medium text-white/75">{t.label}</span>
                        <span className="text-[18px] font-black" style={{ color: t.color }}>{t.pct}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Crescimento orgânico","Expansão viral","Retenção ativa","Renda recorrente","Efeitos de rede nacionais"].map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-white/7 text-white/38"
                        style={{ background: "rgba(0,229,255,0.05)" }}>{tag}</span>
                    ))}
                  </div>
                </GCard>
              </Reveal>
            </div>

            {/* Camada 3 — Assinaturas */}
            <Reveal delay={0.12} className="mb-4">
              <GCard className="p-5 sm:p-6" accent="#a855f7">
                <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Camada 3 — Assinaturas Premium (MRR)</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {PLANS.map((plan) => (
                    <div key={plan.key} className="flex items-center justify-between py-3 px-4 rounded-xl border"
                      style={{
                        background: plan.flagship ? `${plan.color}08` : "rgba(255,255,255,0.02)",
                        borderColor: plan.flagship ? `${plan.color}22` : "rgba(255,255,255,0.05)",
                      }}>
                      <div className="flex items-center gap-2.5">
                        <span style={{ color: plan.color }}>{plan.icon}</span>
                        <span className="text-[12px] font-bold" style={{ color: plan.color }}>{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[14px] font-black text-white">{plan.price}</span>
                        {plan.period && <span className="text-[10px] text-white/35 ml-0.5">{plan.period}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2.5">
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
                <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-4">Estrutura Financeira da Plataforma — Alocação da Receita Operacional</p>
                {/* Stacked bar */}
                <div className="flex h-8 rounded-xl overflow-hidden w-full mb-5 gap-px">
                  {FINANCIAL.map((item, i) => (
                    <motion.div key={i}
                      initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                      viewport={{ once: true }} transition={{ delay: i * 0.06 + 0.2, duration: 0.85, ease: [0.19,1,0.22,1] }}
                      className="h-full flex items-center justify-center relative group"
                      style={{ background: `${item.color}30`, borderRight: `2px solid ${item.color}50` }}
                      title={`${item.label}: ${item.pct}%`}>
                      {item.pct >= 15 && <span className="text-[9px] font-black" style={{ color: item.color }}>{item.pct}%</span>}
                    </motion.div>
                  ))}
                </div>
                {/* Legend — editorial rows */}
                <div className="grid sm:grid-cols-2 gap-0 sm:gap-x-6">
                  {[FINANCIAL.slice(0,4), FINANCIAL.slice(4)].map((col, ci) => (
                    <div key={ci} className="divide-y divide-white/5">
                      {col.map((item, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: -4 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ delay: (ci * 4 + i) * 0.04 }}
                          className="flex items-center gap-3 py-3">
                          <span className="w-9 text-right text-[15px] font-black flex-shrink-0 leading-none" style={{ color: item.color }}>{item.pct}%</span>
                          <div className="w-px h-5 flex-shrink-0 rounded-full" style={{ background: `${item.color}35` }} />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-white/72 leading-tight">{item.label}</p>
                            <p className="text-[10px] text-white/35 leading-snug truncate">{item.purpose}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2.5">
                  <Shield size={12} style={{ color: G, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    <span style={{ color: G }} className="font-semibold">25% em caixa e reserva estratégica</span>{" "}
                    garante solidez operacional, suporta crescimento acelerado e protege a operação em cenários adversos — enquanto 15% é distribuído diretamente a parceiros e investidores ativos.
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
        <section className="relative overflow-hidden px-5 sm:px-10 py-16 sm:py-24">
          {/* Background — Brazil map network */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0"
              style={{ backgroundImage: "url(/sec-infraestrutura.png)", backgroundSize: "cover", backgroundPosition: "center 35%", opacity: 0.58, filter: "saturate(1.40) contrast(1.08)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.82) 0%,rgba(5,12,26,0.32) 50%,rgba(5,12,26,0.82) 100%)" }} />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Governança & Estrutura Operacional" color="#a855f7" icon={<Cpu size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)", textShadow: "0 2px 16px rgba(0,0,0,0.70)" }}>
                Infraestrutura de gestão<br />para escala nacional.
              </h2>
              <p className="text-white/65 text-[14px] leading-relaxed max-w-xl" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                A extraGO possui uma arquitetura operacional completa, com visibilidade em tempo real sobre cada estado, usuário e métrica — preparada para governar uma rede nacional de profissionais e empresas.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-0">
              {[
                {
                  icon: <LayoutGrid size={17} />, color: "#a855f7", title: "Centro Administrativo Nacional",
                  items: ["Painel executivo centralizado","Analytics em tempo real","KPIs nacionais e regionais","Mapa interativo do Brasil"],
                },
                {
                  icon: <MapPin size={17} />, color: "#fbbf24", title: "Gestão Regional Descentralizada",
                  items: ["Visão por estado","Performance de representantes","Crescimento regional","Parcerias locais rastreadas"],
                },
                {
                  icon: <Shield size={17} />, color: C, title: "Controles de Plataforma",
                  items: ["Gestão de usuários","Moderação de conteúdo","Sistema de auditoria","Controle financeiro integrado"],
                },
                {
                  icon: <DollarSign size={17} />, color: G, title: "Estrutura Financeira",
                  items: ["Carteira digital por usuário","Processamento de saques PIX","Alocação estratégica de receita","Reserva operacional protegida"],
                },
                {
                  icon: <GitBranch size={17} />, color: "#f472b6", title: "Arquitetura de Dados",
                  items: ["Histórico profissional imutável","Reputação verificável","Métricas de performance","Inteligência de mercado local"],
                },
                {
                  icon: <Network size={17} />, color: "#22d3ee", title: "Ecossistema de Crescimento",
                  items: ["Motor de indicações multinível","Sistema de progressão de carreira","Notificações e engajamento","Analytics de crescimento de rede"],
                },
              ].map((block, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-4 py-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${block.color}12`, border: `1px solid ${block.color}20` }}>
                      <span style={{ color: block.color }}>{block.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold text-white/80 mb-2 leading-tight">{block.title}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {block.items.map((item, j) => (
                          <span key={j} className="text-[11px] text-white/42">{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            09b · CAPITAL STRUCTURE — 30% investor block
        ═══════════════════════════════ */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-16 sm:py-24">
          <div className="relative z-10 max-w-6xl mx-auto">

            <Reveal className="mb-10">
              <Pill label="Estrutura de Capital" color="#f43f5e" icon={<Layers size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Estrutura de Capital para<br />Crescimento de Longo Prazo.
              </h2>
              <p className="text-white/55 text-[14px] leading-relaxed max-w-2xl">
                A extraGO foi estruturada intencionalmente para suportar participação estratégica de investidores, parceiros institucionais e iniciativas de expansão — preservando a capacidade de crescimento e a solidez operacional de longo prazo.
              </p>
            </Reveal>

            {/* ── FLAGSHIP 30% Investor Block ── */}
            <Reveal className="mb-6">
              <div className="relative rounded-3xl overflow-hidden"
                style={{
                  border: "1px solid rgba(244,63,94,0.50)",
                  boxShadow: [
                    "0 0 0 1px rgba(244,63,94,0.12)",
                    "0 0 80px rgba(244,63,94,0.22)",
                    "0 0 160px rgba(124,252,0,0.08)",
                    "0 24px 80px rgba(0,0,0,0.60)",
                  ].join(", "),
                }}>

                {/* Card image background — sec-governanca embedded inside */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0"
                    style={{ backgroundImage: "url(/sec-governanca.png)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.32, filter: "saturate(1.50) contrast(1.10)" }} />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg,rgba(10,4,20,0.92) 0%,rgba(15,6,30,0.72) 40%,rgba(8,20,16,0.82) 100%)" }} />
                  {/* Atmospheric color wash */}
                  <div className="absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 120% 80% at 15% 30%,rgba(244,63,94,0.14) 0%,transparent 55%), radial-gradient(ellipse 80% 60% at 85% 75%,rgba(124,252,0,0.10) 0%,transparent 55%)" }} />
                </div>

                {/* Top premium accent line */}
                <div className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg,transparent,#f43f5e 25%,#fb7185 50%,#7CFC00 75%,transparent)" }} />
                {/* Bottom subtle accent */}
                <div className="absolute inset-x-0 bottom-0 h-px"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(244,63,94,0.25),transparent)" }} />

                {/* Glow halo top */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse,rgba(244,63,94,0.18) 0%,transparent 65%)", filter: "blur(40px)" }} />
                {/* Glow halo bottom-right */}
                <div className="absolute -bottom-20 right-0 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle,rgba(124,252,0,0.12) 0%,transparent 65%)", filter: "blur(40px)" }} />

                <div className="relative z-10 p-8 sm:p-14 flex flex-col lg:flex-row items-center lg:items-start gap-10 text-center lg:text-left">

                  {/* Big Number — flagship scale */}
                  <div className="flex-shrink-0 flex flex-col items-center lg:items-start">
                    {/* Outer ring decoration */}
                    <div className="relative mb-2">
                      <div className="absolute inset-0 rounded-full blur-2xl opacity-40 scale-125"
                        style={{ background: "radial-gradient(circle,#f43f5e,transparent)" }} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }} transition={{ duration: 0.85, ease: [0.19,1,0.22,1] }}
                        className="relative font-black leading-none"
                        style={{
                          fontSize: "clamp(80px,11vw,136px)",
                          background: "linear-gradient(135deg,#f43f5e 0%,#ff6b84 45%,#fbbf24 75%,#7CFC00 100%)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                          filter: "drop-shadow(0 0 32px rgba(244,63,94,0.45))",
                        }}>
                        30%
                      </motion.div>
                    </div>
                    <p className="text-[11px] font-black tracking-[0.18em] uppercase"
                      style={{ color: "rgba(244,63,94,0.65)" }}>da Estrutura</p>

                    {/* Exclusivity badge */}
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.30)" }}>
                      <Crown size={10} style={{ color: "#f43f5e" }} />
                      <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white/55">Acesso Exclusivo</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-black text-white leading-tight mb-4"
                      style={{ fontSize: "clamp(20px,3vw,36px)" }}>
                      Reservado para{" "}
                      <span style={{
                        background: "linear-gradient(90deg,#f43f5e,#ff6b84 40%,#fbbf24 70%,#7CFC00)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>Investidores Estratégicos</span>
                    </h3>
                    <p className="text-white/62 text-[14px] leading-relaxed mb-8 max-w-xl">
                      A extraGO mantém uma alocação dedicada reservada para investidores estratégicos, parceiros institucionais e iniciativas futuras de expansão — permitindo participação de capital enquanto preserva a capacidade de crescimento de longo prazo.
                    </p>

                    {/* Three pillars — upgraded */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        {
                          icon: <Crown size={15} />, color: "#f43f5e", label: "Investidores Estratégicos",
                          desc: "Participação direta na estrutura e no crescimento da plataforma",
                        },
                        {
                          icon: <Building2 size={15} />, color: C, label: "Parceiros Institucionais",
                          desc: "Estrutura preparada para acordos com fundos e parceiros corporativos",
                        },
                        {
                          icon: <Rocket size={15} />, color: G, label: "Expansão Futura",
                          desc: "Capacidade de rounds de crescimento sem comprometer a operação",
                        },
                      ].map((p, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                          className="rounded-2xl p-4"
                          style={{
                            background: `linear-gradient(135deg,${p.color}10 0%,${p.color}04 100%)`,
                            border: `1px solid ${p.color}28`,
                            backdropFilter: "blur(12px)",
                            boxShadow: `0 0 20px ${p.color}08`,
                          }}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                              style={{ background: `${p.color}18`, border: `1px solid ${p.color}30` }}>
                              <span style={{ color: p.color }}>{p.icon}</span>
                            </div>
                            <span className="text-[11px] font-bold text-white/80">{p.label}</span>
                          </div>
                          <p className="text-[10px] text-white/45 leading-relaxed">{p.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Structure overview — 3 pillars in horizontal editorial strip */}
            <Reveal delay={0.1}>
              <div className="grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/8 border border-white/10 rounded-2xl overflow-hidden"
                style={{ background: "rgba(8,18,36,0.55)", backdropFilter: "blur(24px)" }}>
                {[
                  { label: "Pool Executivo",            desc: "Liderança fundadora e time estratégico",                                color: G        },
                  { label: "Reserva Estratégica",        desc: "Estrutura de incentivo, retenção e proteção operacional",              color: C        },
                  { label: "Alocação para Investidores", desc: "Até 30% reservado para parceiros e investidores estratégicos",         color: "#f43f5e" },
                ].map((s, i) => (
                  <div key={i} className="px-6 py-6"
                    style={{ background: i === 2 ? "rgba(244,63,94,0.06)" : "transparent" }}>
                    <div className="w-2.5 h-2.5 rounded-full mb-3" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
                    <p className="text-[13px] font-bold mb-1 leading-tight"
                      style={{ color: i === 2 ? s.color : "rgba(255,255,255,0.85)" }}>{s.label}</p>
                    <p className="text-[11px] text-white/42 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            09c · WHY THE STRUCTURE SCALES
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-12 sm:py-16" style={{ background: "rgba(124,252,0,0.015)" }}>
          <div className="max-w-6xl mx-auto">

            <Reveal className="mb-8">
              <Pill label="Por Que a Estrutura Escala" color={G} icon={<BarChart3 size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Um modelo desenhado para<br />crescimento sustentável nacional.
              </h2>
              <p className="text-white/48 text-[14px] leading-relaxed max-w-2xl">
                A receita da extraGO é distribuída intencionalmente para financiar cada pilar do crescimento — garantindo que expansão, tecnologia, operação e retorno para parceiros coexistam de forma equilibrada.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-0 divide-y divide-white/5 sm:gap-x-10 sm:divide-y-0">
              {[
                {
                  icon: <Shield size={16} />, color: G, pct: "25%", label: "Reserva Estratégica",
                  desc: "Proteção operacional robusta — a empresa permanece sólida em qualquer cenário enquanto financia crescimento acelerado.",
                },
                {
                  icon: <Globe size={16} />, color: C, pct: "20%", label: "Expansão e Marketing",
                  desc: "Aquisição orgânica e paga de usuários — cresce a rede sem comprometer a reserva de caixa.",
                },
                {
                  icon: <DollarSign size={16} />, color: "#f472b6", pct: "15%", label: "Retorno para Parceiros",
                  desc: "Distribuição direta de lucro para parceiros e investidores ativos — retorno tangível e proporcional ao crescimento.",
                },
                {
                  icon: <Cpu size={16} />, color: "#a855f7", pct: "15%", label: "Tecnologia Contínua",
                  desc: "Inovação de produto e infraestrutura escalável — a plataforma se torna mais inteligente a cada ciclo.",
                },
                {
                  icon: <Users size={16} />, color: "#fbbf24", pct: "10%", label: "Equipe e Operações",
                  desc: "Estrutura operacional enxuta e eficiente, financiada pela própria operação da plataforma.",
                },
                {
                  icon: <MapPin size={16} />, color: "#4ade80", pct: "5%", label: "Representantes Estaduais",
                  desc: "27 representantes financiados pela receita — expansão descentralizada sem capital externo.",
                },
                {
                  icon: <Repeat size={16} />, color: "#22d3ee", pct: "5%", label: "Motor de Indicações",
                  desc: "O referral é autossustentado — cresce proporcionalmente à receita, ampliando o flywheel orgânico.",
                },
                {
                  icon: <Rocket size={16} />, color: "#fb923c", pct: "5%", label: "Fundo de Expansão",
                  desc: "Reserva para novos mercados, produtos e iniciativas estratégicas — capacidade de escalar com agilidade.",
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-4 py-4">
                    <span className="text-[18px] font-black leading-none flex-shrink-0 w-10 pt-0.5" style={{ color: item.color }}>{item.pct}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ color: item.color }}>{item.icon}</span>
                        <p className="text-[12px] font-bold text-white/80 leading-tight">{item.label}</p>
                      </div>
                      <p className="text-[11px] text-white/42 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2} className="mt-5">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/6" style={{ background: "rgba(124,252,0,0.04)" }}>
                <Lightbulb size={15} style={{ color: G, flexShrink: 0, marginTop: 2 }} />
                <p className="text-[12px] text-white/55 leading-relaxed">
                  <span className="text-white/82 font-semibold">A estrutura é o produto.</span>{" "}
                  Cada percentual foi projetado para que a extraGO cresça sem depender de capital externo contínuo — criando um modelo que se autofinancia, escala e distribui valor a cada ciclo.
                </p>
              </div>
            </Reveal>

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
            <div className="absolute inset-0"
              style={{ backgroundImage: "url(/investors-bg.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.52, filter: "saturate(1.30) contrast(1.05)" }} />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.85) 0%,rgba(5,12,26,0.20) 22%,rgba(5,12,26,0.20) 78%,rgba(5,12,26,0.85) 100%)" }} />
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
                  filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.70))",
                }}>
                A extraGO está construindo a infraestrutura<br className="hidden sm:block" />
                digital de mão de obra do Brasil.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: 0.62 }}
                className="text-white/62 text-[14px] leading-relaxed max-w-2xl mx-auto"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}>
                Uma camada de tecnologia que conecta profissionais, empresas, parceiros e investidores — criando valor crescente para cada novo participante da rede e tornando o ecossistema mais robusto a cada dia.
              </motion.p>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            12b · BUILT FOR NATIONAL SCALE
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="relative rounded-2xl overflow-hidden border"
                style={{
                  borderColor: "rgba(0,229,255,0.22)",
                  boxShadow: "0 0 80px rgba(0,229,255,0.08), inset 0 0 60px rgba(0,0,0,0.3)",
                }}>
                {/* City skyline background */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0"
                    style={{ backgroundImage: "url(/sec-escala-nacional.png)", backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.72, filter: "saturate(1.40) contrast(1.08)" }} />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(145deg,rgba(0,229,255,0.10) 0%,rgba(5,12,26,0.58) 35%,rgba(124,252,0,0.06) 100%)" }} />
                </div>
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg,transparent,#00E5FF 35%,#7CFC00 65%,transparent)" }} />

                <div className="relative z-10 p-8 sm:p-12">
                  <div className="max-w-3xl mx-auto text-center">
                    <Pill label="Oportunidade de Investimento" color={C} icon={<Globe size={10} />} />

                    <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(24px,4vw,48px)" }}>
                      <span style={{
                        background: `linear-gradient(90deg,${C},#9aff1c 50%,${G})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>Construída para Escala Nacional.</span>
                    </h2>

                    <p className="text-white/50 text-[14px] leading-relaxed mb-8 max-w-2xl mx-auto">
                      A extraGO foi estruturada desde o primeiro dia para suportar expansão nacional, parcerias estratégicas e participação de investidores de longo prazo.
                    </p>

                    {/* Three proof points — editorial */}
                    <div className="divide-y divide-white/8 text-left max-w-xl mx-auto w-full">
                      {[
                        { icon: <Shield size={15} />, color: G,        label: "Governança Sólida",         desc: "Estrutura operacional completa com analytics em tempo real por estado e KPIs nacionais centralizados." },
                        { icon: <TrendingUp size={15} />, color: C,    label: "Planejamento Sustentável",  desc: "Receita distribuída intencionalmente para suportar cada pilar do crescimento sem dependência de capital externo." },
                        { icon: <Globe size={15} />, color: "#a855f7", label: "Escalabilidade Nacional",   desc: "27 estados, rede de representantes, infraestrutura tecnológica e modelo de expansão preparados para o Brasil." },
                      ].map((p, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 py-4">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `${p.color}14` }}>
                            <span style={{ color: p.color }}>{p.icon}</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-white/80 mb-0.5">{p.label}</p>
                            <p className="text-[12px] text-white/42 leading-relaxed">{p.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            13 · FINAL CTA
        ═══════════════════════════════ */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-14 sm:py-20">
          <div className="relative z-10 max-w-4xl mx-auto">
            <Reveal>
              <div className="relative rounded-2xl border overflow-hidden"
                style={{
                  borderColor: `${G}32`,
                  boxShadow: `0 0 0 1px ${G}10, 0 0 60px ${G}14, 0 20px 60px rgba(0,0,0,0.55)`,
                }}>

                {/* sec-faca-parte image embedded inside the card */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0"
                    style={{ backgroundImage: "url(/sec-faca-parte.png)", backgroundSize: "cover", backgroundPosition: "center 35%", opacity: 0.68, filter: "saturate(1.35) contrast(1.06)" }} />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.82) 0%,rgba(5,12,26,0.50) 40%,rgba(5,12,26,0.65) 100%)" }} />
                  {/* Green atmosphere wash */}
                  <div className="absolute inset-0"
                    style={{ background: `radial-gradient(ellipse 100% 60% at 50% 0%,${G}08 0%,transparent 60%)` }} />
                </div>

                <div className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg,transparent,${G}85,${C}55,transparent)` }} />
                {/* Glow orb */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle,${G}12 0%,transparent 65%)`, filter: "blur(32px)" }} />

                <div className="relative p-8 sm:p-12 text-center">
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
              </div>
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
