import React, { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logoMain from "@assets/Logo-no-text_1781338757912.png";
import modeloExpansaoImg from "@assets/Modelo-Expansão_1781338758063.png";
import visaoLongoPrazoImg from "@assets/Visão-Longo-Prazo_1781338758036.png";
import investidoresHeroImg from "@assets/Investidores-page-hero2_1781247644596.png";
import fundadoresCardsImg from "@assets/Fundadores-cards_1781418740153.png";
import oMercadoImg from "@assets/O-mercado-section_1781247644534.png";
import oProblemaImg from "@assets/O-problema-section-investidores_1781247644565.png";
import estruturaCapitalImg from "@assets/Estrutura-de-capital-section_1781247644390.png";
import porQueAgoraImg from "@assets/Por-Que-Agora-section_1781247644506.png";
import assProfissionaisArqImg from "@assets/Assinaturas-Profissionais-arqfin_1781335479672.png";
import assEmpresariaisInvestImg from "@assets/AssinaturasEmpresariais-invest_1781335479696.png";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";
import { Reveal, GCardDark as GCard, Pill, Divider, CountUp } from "@/lib/institutional-components";
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



/* ─── full-page background ─── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/landing-page-bg.webp)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          filter: "saturate(1.55) contrast(1.12) brightness(1.04)",
        }}
      />
      {/* Overlay — preserves art depth while keeping white text readable */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(4,10,22,0.52)" }}
      />
      {/* Atmospheric depth — soft radial vignette for content legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 100% 80% at 50% 0%, transparent 30%, rgba(4,10,22,0.32) 100%)" }}
      />
    </div>
  );
}

/* ─── data (official) ─── */
const FEES = [
  { name: "Iniciante",     fee: 20, color: "#94a3b8", w: "100%" },
  { name: "Júnior",        fee: 18, color: "#60a5fa", w: "86%"  },
  { name: "Intermediário", fee: 15, color: "#a855f7", w: "70%"  },
  { name: "Sênior",        fee: 12, color: C,         w: "55%"  },
  { name: "Elite",         fee: 10, color: G,         w: "45%"  },
];

const REFERRAL = [
  { label: "Indicador",           pct: "2%", color: C        },
  { label: "Agente de Captação",  pct: "3%", color: "#a855f7" },
  { label: "Embaixador Regional", pct: "5%", color: G        },
];

const FINANCIAL = [
  { label: "Caixa e Reserva Estratégica",        pct: 25, color: G,         purpose: "Solidez operacional e proteção de longo prazo" },
  { label: "Fundadores e Investidores",           pct: 20, color: "#f59e0b", purpose: "Retorno direto proporcional ao crescimento" },
  { label: "Marketing e Expansão",               pct: 20, color: C,         purpose: "Aquisição de usuários e expansão da marca" },
  { label: "Tecnologia e Inovação",              pct: 10, color: "#a855f7", purpose: "Evolução contínua da plataforma" },
  { label: "Operações",                          pct: 10, color: "#60a5fa", purpose: "Estrutura operacional e talentos estratégicos" },
  { label: "Fundo de Crescimento Estratégico",   pct: 10, color: "#f43f5e", purpose: "Novos mercados, produtos e iniciativas" },
  { label: "Representantes Estaduais",           pct:  5, color: "#fb923c", purpose: "Comissão da rede de representantes nacionais" },
];

const TEAM = [
  {
    name: "Leonardo Scheffel da Rosa", role: "CEO & Founder", photo: "/team-leonardo.webp",
    color: G, equity: "Fundador",
    bio: "Responsável pela visão estratégica, produto, operações e expansão nacional da extraGO. Experiência em gestão operacional, hotelaria, liderança de equipes e desenvolvimento de negócios.",
  },
  {
    name: "Jean Carlos Dick", role: "CMO & Co-Founder", photo: "/team-jean.webp",
    color: C, equity: "Co-Fundador",
    bio: "Fundador da MyAds. Responsável por branding, marketing, growth, aquisição de usuários e posicionamento estratégico da marca.",
  },
  {
    name: "Qaialla Pereira", role: "CCO & Co-Founder", photo: "/team-qaialla.webp",
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
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ color: "#fff" }}>
      <Background />

      <InstitutionalNavbar />

      <main className="relative z-10 flex-1">

        {/* ═══════════════════════════════
            01 · HERO
        ═══════════════════════════════ */}
        <section className="relative overflow-hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
            <img
              src={investidoresHeroImg}
              alt="A Infraestrutura de Mão de Obra do Brasil — extraGO Investidores & Parceiros Estratégicos"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </motion.div>
        </section>


        <style>{`
          @keyframes dash-flow { from { stroke-dashoffset: 12; } to { stroke-dashoffset: 0; } }
          @keyframes node-breath { 0%, 100% { opacity: 0.60; } 50% { opacity: 1; } }
          .dash-flow { animation: dash-flow 1.4s linear infinite; }
          .node-breath { animation: node-breath 2.6s ease-in-out infinite; }
        `}</style>

        {/* ═══════════════════════════════
            TRANSITION 1 — Por Que a extraGO Existe
            Hero → The Market
        ═══════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ padding: "clamp(48px,8vw,100px) 0" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.010) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.010) 1px,transparent 1px)", backgroundSize: "72px 72px" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,229,255,0.028) 0%, transparent 65%)" }} />
          {/* Readability depth layer — scrim behind text content */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 75% at 50% 50%, rgba(4,10,22,0.58) 0%, rgba(4,10,22,0.28) 60%, transparent 88%)" }} />
          <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
            <Reveal>
              <div style={{ color: "rgba(0,229,255,0.50)", fontSize: "10px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div style={{ width: "28px", height: "1px", background: "rgba(0,229,255,0.30)" }} />
                Por Que a extraGO Existe
                <div style={{ width: "28px", height: "1px", background: "rgba(0,229,255,0.30)" }} />
              </div>
              <h2 style={{ fontSize: "clamp(22px,3.6vw,44px)", fontWeight: 900, lineHeight: 1.16, color: "#fff", marginBottom: "18px", textShadow: "0 2px 24px rgba(0,0,0,0.80), 0 1px 8px rgba(0,0,0,0.60)" }}>
                O problema não é conectar pessoas.<br />
                <span style={{ background: `linear-gradient(90deg,${C},${G})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>O problema é a ausência<br />de infraestrutura.</span>
              </h2>
              <p style={{ fontSize: "14px", lineHeight: 1.78, maxWidth: "520px", color: "rgba(255,255,255,0.92)", textShadow: "0 1px 14px rgba(0,0,0,0.70)", marginBottom: "16px", marginLeft: "auto", marginRight: "auto" }}>
                Milhões de profissionais e milhares de empresas movimentam diariamente a economia do trabalho flexível no Brasil.
              </p>
              <p style={{ fontSize: "14px", lineHeight: 1.78, maxWidth: "520px", color: "rgba(255,255,255,0.84)", textShadow: "0 1px 14px rgba(0,0,0,0.65)", marginLeft: "auto", marginRight: "auto" }}>
                A extraGO está construindo a camada de infraestrutura que faltava para conectar esse mercado em escala nacional.
              </p>
            </Reveal>

          </div>
        </div>

        {/* ═══════════════════════════════
            02 · THE MARKET
        ═══════════════════════════════ */}
        <section id="mercado" className="py-2 sm:py-4">
          <Reveal>
            <img
              src={oMercadoImg}
              alt="O Mercado — Um mercado imenso operando de forma fragmentada"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </Reveal>
        </section>

        {/* ── Banner institucional — após Mercado, antes de O Problema ── */}
        <div
          className="w-full px-4 sm:px-8"
          style={{ margin: "0 0 4px" }}
        >
          <div
            style={{
              height: "clamp(150px, 20vw, 260px)",
              overflow: "hidden",
              borderRadius: "clamp(10px, 2vw, 18px)",
              border: "1px solid rgba(0,229,255,0.14)",
              boxShadow: "0 0 48px rgba(22,163,74,0.08), 0 10px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            <img
              src="/banner-page.webp"
              alt="extraGO — Infraestrutura nacional conectando empresas e profissionais"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              draggable={false}
            />
          </div>
        </div>

        {/* ═══════════════════════════════
            TRANSITION 2 — Problem → Solution Cascade
            Mercado Fragmentado → Ecossistema extraGO
        ═══════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ padding: "clamp(28px,4.5vw,56px) 20px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(124,252,0,0.022) 0%, transparent 65%)" }} />
          {/* Contrast mask — atmospheric depth behind cascade */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 90% at 50% 50%, rgba(4,10,22,0.62) 0%, rgba(4,10,22,0.30) 55%, transparent 80%)" }} />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <Reveal>
              <div style={{ color: "rgba(124,252,0,0.50)", fontSize: "10px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "1px", background: "rgba(124,252,0,0.28)" }} />
                A Jornada da Transformação
                <div style={{ width: "36px", height: "1px", background: "rgba(124,252,0,0.28)" }} />
              </div>
            </Reveal>
            <div className="flex flex-col items-center gap-0">
              {[
                { label: "Mercado Informal",         dim: true  },
                { label: "Falta de Reputação",        dim: true  },
                { label: "Falta de Tecnologia",       dim: true  },
                { label: "Falta de Pagamentos",       dim: true  },
                { label: "extraGO",                   dim: false, highlight: true },
                { label: "Rede Nacional",             dim: false  },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="flex flex-col items-center">
                    <div
                      style={{
                        padding: step.highlight ? "10px 32px" : "6px 22px",
                        borderRadius: "6px",
                        fontSize: step.highlight ? "clamp(13px,2vw,16px)" : "clamp(11px,1.6vw,13px)",
                        fontWeight: step.highlight ? 900 : step.dim ? 600 : 700,
                        letterSpacing: step.highlight ? "0.04em" : "0.01em",
                        background: step.highlight
                          ? `${G}14`
                          : step.dim
                          ? `linear-gradient(90deg, rgba(124,252,0,0.62), rgba(0,229,255,0.52))`
                          : i === 5
                          ? `linear-gradient(90deg, ${C}, rgba(124,252,0,0.80))`
                          : `${G}14`,
                        WebkitBackgroundClip: step.highlight ? undefined : "text",
                        WebkitTextFillColor: step.highlight ? undefined : "transparent",
                        color: step.highlight ? G : undefined,
                        border: step.highlight ? `1px solid ${G}35` : "none",
                        opacity: step.dim ? 0.88 : 1,
                        transition: "all 0.3s ease",
                        textTransform: step.highlight ? "uppercase" : "none",
                        textShadow: step.highlight ? `0 0 20px ${G}60` : undefined,
                      }}
                    >
                      {step.label}
                    </div>
                    {i < 5 && (
                      <svg width="2" height={i === 4 ? "28" : "22"} viewBox={i === 4 ? "0 0 2 28" : "0 0 2 22"} fill="none" style={{ display: "block", margin: "0" }}>
                        <line x1="1" y1="0" x2={i === 4 ? "1" : "1"} y2={i === 4 ? "22" : "22"}
                          stroke={i >= 3 ? `${G}55` : "rgba(255,255,255,0.14)"}
                          strokeWidth="1"
                          strokeDasharray={i < 4 ? "3 3" : "none"}
                          className={i < 4 ? "dash-flow" : undefined}
                        />
                        {i === 4 && (
                          <>
                            <path d="M -3,22 L 1,28 L 5,22" fill="none" stroke={`${G}65`} strokeWidth="1.2" />
                          </>
                        )}
                      </svg>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* ═══════════════════════════════
            03 · THE PROBLEM
        ═══════════════════════════════ */}
        <section id="problema" className="py-2 sm:py-4">
          <Reveal>
            <img
              src={oProblemaImg}
              alt="O Problema — Dois lados. Uma dor compartilhada."
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </Reveal>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            04 · WHY NOW
        ═══════════════════════════════ */}
        <section className="py-2 sm:py-4">
          <Reveal>
            <img
              src={porQueAgoraImg}
              alt="Por Que Agora — O momento certo para construir isso"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </Reveal>
        </section>

        {/* ═══════════════════════════════
            06 · COMPETITIVE ADVANTAGES
        ═══════════════════════════════ */}
        <section className="relative py-5 sm:py-16" style={{ background: "rgba(124,252,0,0.018)" }}>
          {/* Atmospheric vignette — prevents bright bg bleed into text */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(4,10,22,0.42) 0%, rgba(4,10,22,0.20) 30%, rgba(4,10,22,0.20) 70%, rgba(4,10,22,0.42) 100%)" }} />
          <div className="relative z-10 px-5 sm:px-10 max-w-6xl mx-auto mb-6">
            <Reveal>
              <Pill label="Vantagens Competitivas" color={G} icon={<Shield size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Defensabilidade estrutural.<br />Não apenas funcionalidades.
              </h2>
              <p className="text-[rgba(255,255,255,0.92)] text-[14px] leading-relaxed max-w-xl">
                As vantagens da extraGO não são features que podem ser copiadas — são efeitos de rede e estruturas operacionais que se fortalecem com o tempo e com a escala.
              </p>
            </Reveal>
          </div>

          {/* Arquitetura Financeira — ativo institucional visual */}
          <Reveal className="mb-8 relative z-10">
            <Link href="/modelo-de-negocio">
              <motion.div
                whileHover={{ y: -3, scale: 1.003 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="relative overflow-hidden cursor-pointer group"
                style={{}}
              >
                  <img
                    src="/arquitetura.webp"
                    alt="A Arquitetura Financeira da extraGO — infraestrutura de 4 fontes de receita"
                    className="w-full block h-auto"
                    style={{
                      objectFit: "contain",
                      width: "100%",
                    }}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "rgba(124,252,0,0.04)" }} />
                  <div className="absolute bottom-3 right-3">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                      style={{ background: "linear-gradient(135deg,#16a34a,#00c9a7)", color: "#fff", boxShadow: "0 0 14px rgba(22,163,74,0.35)" }}
                    >
                      Explorar Arquitetura Financeira <ArrowRight size={10} />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                      style={{ background: "rgba(2,8,22,0.78)", border: "1px solid rgba(124,252,0,0.28)", color: "rgba(124,252,0,0.90)", backdropFilter: "blur(8px)" }}
                    >
                      4 Fontes de Receita
                    </div>
                  </div>
                </motion.div>
              </Link>
            </Reveal>

          <div className="relative z-10 px-5 sm:px-10 max-w-6xl mx-auto">
            <div className="divide-y divide-white/6">
              {ADVANTAGES.map((adv, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-5 py-5">
                    <span className="text-[10px] font-black tracking-widest  flex-shrink-0 w-5 pt-1 hidden sm:block" style={{ color: "rgba(255,255,255,0.62)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${adv.color}13`, border: `1px solid ${adv.color}22` }}>
                      <span style={{ color: adv.color }}>{adv.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[14px] font-bold text-[rgba(255,255,255,0.98)] mb-1.5 leading-tight">{adv.title}</h3>
                      <p className="text-[13px] text-[rgba(255,255,255,0.90)] leading-relaxed">{adv.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            TRANSITION 3 — Como a Infraestrutura Gera Valor
            Before Business Model
        ═══════════════════════════════ */}
        <div className="relative overflow-hidden" style={{ padding: "clamp(28px,4.5vw,56px) 20px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.010) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.010) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(0,229,255,0.025) 0%, transparent 65%)" }} />
          {/* Readability depth — strong center vignette for flow visual legibility */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 85% 70% at 50% 50%, rgba(4,10,22,0.55) 0%, rgba(4,10,22,0.26) 60%, transparent 82%)" }} />
          <div className="relative z-10 max-w-5xl mx-auto">
            <Reveal className="text-center mb-7">
              <div style={{ color: "rgba(0,229,255,0.52)", fontSize: "10px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "1px", background: "rgba(0,229,255,0.30)" }} />
                Como a Infraestrutura Gera Valor
                <div style={{ width: "36px", height: "1px", background: "rgba(0,229,255,0.30)" }} />
              </div>
              <h2 style={{ fontSize: "clamp(20px,3.2vw,38px)", fontWeight: 900, lineHeight: 1.18, color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.80)" }}>
                Cada camada da plataforma alimenta<br />
                <span style={{ background: `linear-gradient(90deg,${G},${C})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>a próxima.</span>
              </h2>
            </Reveal>
            {/* Horizontal flow — desktop; vertical — mobile */}
            <div className="hidden sm:flex items-center justify-center gap-0">
              {[
                { label: "Profissionais",       sublabel: "Reputação & Carreira",    color: G        },
                { label: "Empresas",            sublabel: "Contratações & Analytics", color: C        },
                { label: "Operações",           sublabel: "Matching & Pagamentos",   color: "#fbbf24" },
                { label: "Receita Recorrente",  sublabel: "Intermediação & Assinat.", color: "#a855f7" },
                { label: "Expansão Nacional",   sublabel: "27 Estados & Rede",       color: "#22d3ee" },
              ].map((node, i, arr) => (
                <React.Fragment key={i}>
                  <Reveal delay={i * 0.08}>
                    <div className="flex flex-col items-center text-center" style={{ minWidth: "clamp(80px,10vw,120px)" }}>
                      <div className="node-breath" style={{ width: "10px", height: "10px", borderRadius: "50%", background: node.color, boxShadow: `0 0 16px ${node.color}90`, marginBottom: "10px" }} />
                      <span style={{ fontSize: "clamp(10px,1.2vw,13px)", fontWeight: 700, color: node.color, lineHeight: 1.3, marginBottom: "5px" }}>{node.label}</span>
                      <span style={{ fontSize: "clamp(8px,0.9vw,10px)", color: "rgba(255,255,255,0.68)", lineHeight: 1.4 }}>{node.sublabel}</span>
                    </div>
                  </Reveal>
                  {i < arr.length - 1 && (
                    <div className="flex-1" style={{ minWidth: "20px", maxWidth: "60px" }}>
                      <svg width="100%" height="20" viewBox="0 0 60 20" fill="none" preserveAspectRatio="none">
                        <line x1="0" y1="10" x2="48" y2="10" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 2" className="dash-flow" />
                        <path d="M 48,5 L 58,10 L 48,15" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1.2" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            {/* Mobile vertical */}
            <div className="flex sm:hidden flex-col items-center gap-0">
              {[
                { label: "Profissionais",      color: G        },
                { label: "Empresas",           color: C        },
                { label: "Operações",          color: "#fbbf24" },
                { label: "Receita Recorrente", color: "#a855f7" },
                { label: "Expansão Nacional",  color: "#22d3ee" },
              ].map((node, i, arr) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div className="flex flex-col items-center">
                    <div style={{ fontSize: "13px", fontWeight: 700, color: node.color, padding: "6px 20px" }}>{node.label}</div>
                    {i < arr.length - 1 && (
                      <svg width="2" height="18" viewBox="0 0 2 18" fill="none">
                        <line x1="1" y1="0" x2="1" y2="18" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 2" className="dash-flow" />
                      </svg>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════
            08 · BUSINESS MODEL
        ═══════════════════════════════ */}
        <section id="modelo" className="px-5 sm:px-10 py-5 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Modelo de Negócio" color={G} icon={<DollarSign size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Múltiplas camadas de receita.<br />Todas recorrentes.
              </h2>
              <p className="text-[rgba(255,255,255,0.92)] text-[14px] leading-relaxed max-w-xl">
                O modelo financeiro da extraGO combina intermediação por performance, assinaturas mensais e receita de rede — criando previsibilidade e escalabilidade.
              </p>
            </Reveal>

            {/* Camada 1 */}
            <Reveal className="mb-4">
              <div className="w-full rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.28), 0 2px 12px rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <img src="/camada1-card.webp" alt="Camada 1 — Intermediação por Performance" className="w-full h-auto block" />
              </div>
            </Reveal>

            {/* Camada 2 */}
            <Reveal className="mb-4" delay={0.06}>
              <div className="w-full rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.28), 0 2px 12px rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <img src="/camada2-indicacoes-card.webp" alt="Camada 2 — Sistema de Indicações Multinível" className="w-full h-auto block" />
              </div>
            </Reveal>

          </div>
        </section>

        {/* Camada 3 — Assinaturas Profissionais */}
        <section className="py-2">
          <Reveal className="mb-2">
            <img
              src={assProfissionaisArqImg}
              alt="Assinaturas Profissionais — FREE Gratuito, extraGO PRO R$19,90/mês, PREMIUM R$49,90/mês, ELITE R$99,90/mês"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        {/* Camada 4 — Assinaturas Empresariais */}
        <section className="py-2">
          <Reveal className="mb-4">
            <img
              src={assEmpresariaisInvestImg}
              alt="Assinaturas Empresariais — Starter R$99,90/mês, Business R$299,90/mês, Corporate R$799,90/mês, Enterprise sob consulta"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        <section className="px-5 sm:px-10 pb-5 sm:pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Estrutura Financeira */}
            <Reveal delay={0.18}>
              <div className="w-full rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.28), 0 2px 12px rgba(0,0,0,0.18)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <img src="/estrutura-finan-card.webp" alt="Estrutura Financeira — Alocação da Receita Operacional" className="w-full h-auto block" />
              </div>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            08b · 4 MOTORES DE RECEITA
        ═══════════════════════════════ */}
        <section id="camadas" className="py-6 sm:py-20">
          <Reveal className="mb-8">
            <img
              src="/motores-receita-card.webp"
              alt="Os 4 Motores de Receita da extraGO"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
          <div className="px-5 sm:px-10 max-w-6xl mx-auto">
            {/* CTA → dedicated model page */}
            <Reveal delay={0.15} className="flex justify-center">
              <Link href="/modelo-de-negocio">
                <button
                  className="flex items-center gap-2.5 rounded-full font-bold text-black border-none cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg,${G} 0%,#9bff14 50%,${C} 100%)`,
                    boxShadow: `0 0 26px rgba(124,252,0,0.28), 0 4px 14px rgba(0,0,0,0.28)`,
                    height: "48px",
                    padding: "0 28px",
                    fontSize: "14px",
                    letterSpacing: "0.01em",
                    transition: "box-shadow 0.2s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px rgba(124,252,0,0.48), 0 6px 20px rgba(0,0,0,0.36)`;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 0 26px rgba(124,252,0,0.28), 0 4px 14px rgba(0,0,0,0.28)`;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  Ver Arquitetura Completa <ArrowRight size={15} />
                </button>
              </Link>
            </Reveal>

          </div>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            09 · GOVERNANCE & OPS
        ═══════════════════════════════ */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-6 sm:py-24">
          {/* Background — Brazil map network */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0"
              style={{ backgroundImage: "url(/sec-infraestrutura.webp)", backgroundSize: "100% auto", backgroundPosition: "center top", backgroundRepeat: "no-repeat", opacity: 0.88, filter: "saturate(1.75) contrast(1.12)" }} />
            {/* Top and bottom fade — smooth transitions into adjacent sections */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.72) 0%,rgba(5,12,26,0.30) 28%,rgba(5,12,26,0.22) 50%,rgba(5,12,26,0.30) 72%,rgba(5,12,26,0.72) 100%)" }} />
            {/* Radial scrim — deepens behind the text content */}
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(5,12,26,0.48) 0%, transparent 70%)" }} />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Governança & Estrutura Operacional" color="#a855f7" icon={<Cpu size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)", textShadow: "0 2px 32px rgba(0,0,0,0.95), 0 1px 10px rgba(0,0,0,0.70)" }}>
                Infraestrutura de gestão<br />para escala nacional.
              </h2>
              <p className="text-[14px] leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.92)", textShadow: "0 1px 20px rgba(0,0,0,0.90)" }}>
                A extraGO possui uma arquitetura operacional completa, coordenada por cinco pilares que garantem execução nacional, regional e local.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-0">
              {[
                {
                  icon: <Cpu size={17} />, color: G, title: "Plataforma Nacional",
                  items: ["Tecnologia","Produto","Compliance","Estratégia Nacional"],
                },
                {
                  icon: <MapPin size={17} />, color: "#fbbf24", title: "Representantes Estaduais",
                  items: ["Expansão regional","Comunidade","Parcerias","Operação estadual"],
                },
                {
                  icon: <Users size={17} />, color: C, title: "Equipes Regionais",
                  items: ["Comercial","Marketing","Expansão","Operações e Pessoas"],
                },
                {
                  icon: <Building2 size={17} />, color: "#a855f7", title: "Empresas",
                  items: ["Contratações validadas","Analytics corporativo","Gestão operacional","SaaS integrado"],
                },
                {
                  icon: <BadgeCheck size={17} />, color: "#f43f5e", title: "Profissionais",
                  items: ["Reputação acumulada","Progressão de carreira","Renda recorrente","Indicações ativas"],
                },
                {
                  icon: <Network size={17} />, color: "#22d3ee", title: "Ecossistema de Crescimento",
                  items: ["Motor de indicações multinível","Sistema de progressão de carreira","Analytics de crescimento de rede","Expansão autossustentável"],
                },
              ].map((block, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-4 py-5 border-b border-white/5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${block.color}12`, border: `1px solid ${block.color}20` }}>
                      <span style={{ color: block.color }}>{block.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold text-[rgba(255,255,255,0.88)] mb-2 leading-tight">{block.title}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {block.items.map((item, j) => (
                          <span key={j} className="text-[11px] text-[rgba(255,255,255,0.68)]">{item}</span>
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
        <section className="py-2 sm:py-4">
          <Reveal>
            <img
              src={estruturaCapitalImg}
              alt="30% Reservado para Investidores Estratégicos — Estrutura de Capital extraGO"
              className="w-full h-auto block"
              style={{ display: "block" }}
              draggable={false}
            />
          </Reveal>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            09c · WHY THE STRUCTURE SCALES
        ═══════════════════════════════ */}
        <section className="relative px-5 sm:px-10 py-5 sm:py-16" style={{ background: "rgba(124,252,0,0.015)" }}>
          {/* Atmospheric depth layer — subtle vignette for text legibility */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(4,10,22,0.38) 0%, rgba(4,10,22,0.16) 25%, rgba(4,10,22,0.16) 75%, rgba(4,10,22,0.38) 100%)" }} />
          <div className="relative z-10 max-w-6xl mx-auto">

            <Reveal className="mb-8">
              <Pill label="Por Que a Estrutura Escala" color={G} icon={<BarChart3 size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Um modelo desenhado para<br />crescimento sustentável nacional.
              </h2>
              <p className="text-[rgba(255,255,255,0.92)] text-[14px] leading-relaxed max-w-2xl">
                A receita da extraGO é distribuída intencionalmente para financiar cada pilar do crescimento — garantindo que expansão, tecnologia, operação e retorno para parceiros coexistam de forma equilibrada.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-0 divide-y divide-white/5 sm:gap-x-10 sm:divide-y-0">
              {[
                {
                  icon: <Shield size={16} />, color: G, pct: "25%", label: "Caixa e Reserva Estratégica",
                  desc: "Proteção operacional robusta — a empresa permanece sólida em qualquer cenário enquanto financia crescimento acelerado.",
                },
                {
                  icon: <DollarSign size={16} />, color: "#f59e0b", pct: "20%", label: "Fundadores e Investidores",
                  desc: "Retorno direto e proporcional ao crescimento da plataforma — alinhando os interesses de quem constrói com quem investe.",
                },
                {
                  icon: <Globe size={16} />, color: C, pct: "20%", label: "Marketing e Expansão",
                  desc: "Aquisição orgânica e paga de usuários — cresce a rede sem comprometer a reserva de caixa.",
                },
                {
                  icon: <Cpu size={16} />, color: "#a855f7", pct: "10%", label: "Tecnologia e Inovação",
                  desc: "Inovação de produto e infraestrutura escalável — a plataforma se torna mais inteligente a cada ciclo.",
                },
                {
                  icon: <Users size={16} />, color: "#60a5fa", pct: "10%", label: "Operações",
                  desc: "Estrutura operacional enxuta e eficiente, financiada pela própria operação da plataforma.",
                },
                {
                  icon: <Rocket size={16} />, color: "#f43f5e", pct: "10%", label: "Fundo de Crescimento Estratégico",
                  desc: "Reserva para novos mercados, produtos e iniciativas estratégicas — capacidade de escalar com agilidade.",
                },
                {
                  icon: <MapPin size={16} />, color: "#fb923c", pct: "5%", label: "Representantes Estaduais",
                  desc: "27 representantes financiados pela receita — expansão descentralizada sem capital externo.",
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <div className="flex items-start gap-4 py-4">
                    <span className="text-[18px] font-black leading-none flex-shrink-0 w-10 pt-0.5" style={{ color: item.color }}>{item.pct}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span style={{ color: item.color }}>{item.icon}</span>
                        <p className="text-[12px] font-bold text-[rgba(255,255,255,0.96)] leading-tight">{item.label}</p>
                      </div>
                      <p className="text-[11px] text-white/78 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2} className="mt-5">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/6" style={{ background: "rgba(124,252,0,0.04)" }}>
                <Lightbulb size={15} style={{ color: G, flexShrink: 0, marginTop: 2 }} />
                <p className="text-[12px] text-[rgba(255,255,255,0.92)] leading-relaxed">
                  <span className="text-[rgba(255,255,255,0.98)] font-semibold">A estrutura é o produto.</span>{" "}
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
        <section id="equipe" className="py-5 sm:py-16">
          <div className="px-5 sm:px-10 max-w-5xl mx-auto">
            <Reveal className="text-center mb-8">
              <Pill label="Liderança" color={C} icon={<Users size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                As pessoas que estão construindo isso.
              </h2>
              <p className="text-[rgba(255,255,255,0.92)] text-[14px] max-w-lg mx-auto">
                Uma equipe de fundadores com experiência complementar em tecnologia, marketing, operações e expansão comercial.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <img
              src={fundadoresCardsImg}
              alt="Fundadores extraGO — Leonardo Scheffel da Rosa (CEO & Founder), Jean Carlos Dick (CMO & Co-Founder), Qaialla Pereira (CCO & Co-Founder)"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
              draggable={false}
            />
          </Reveal>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            11 · MODELO DE EXPANSÃO
        ═══════════════════════════════ */}
        <section id="roadmap" className="py-0">
          <Reveal>
            <img
              src={modeloExpansaoImg}
              alt="Modelo de Expansão Nacional — 5 Fases do Rio Grande do Sul à cobertura nacional"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        {/* ═══════════════════════════════
            12 · LONG-TERM VISION
        ═══════════════════════════════ */}
        <section className="py-0">
          <Reveal>
            <img
              src={visaoLongoPrazoImg}
              alt="Visão de Longo Prazo — A extraGO como infraestrutura de mão de obra do Brasil"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        <Divider />

        {/* ═══════════════════════════════
            12b · BUILT FOR NATIONAL SCALE
        ═══════════════════════════════ */}
        <section className="px-5 sm:px-10 py-5 sm:py-16">
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
                    style={{ backgroundImage: "url(/sec-escala-nacional.webp)", backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.90, filter: "saturate(1.70) contrast(1.12)" }} />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(145deg,rgba(0,229,255,0.08) 0%,rgba(5,12,26,0.16) 35%,rgba(124,252,0,0.05) 100%)" }} />
                </div>
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg,transparent,#00E5FF 35%,#7CFC00 65%,transparent)" }} />

                <div className="relative z-10 p-8 sm:p-12">
                  <div className="max-w-3xl mx-auto text-center">
                    <Pill label="Oportunidade de Investimento" color={C} icon={<Globe size={10} />} />

                    <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(24px,4vw,48px)", filter: "drop-shadow(0 1px 8px rgba(0,0,0,0.38))" }}>
                      <span style={{
                        background: `linear-gradient(90deg,${C},#9aff1c 50%,${G})`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      }}>Construída para Escala Nacional.</span>
                    </h2>

                    <p className="text-[14px] leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.90)", textShadow: "0 1px 5px rgba(0,0,0,0.28)" }}>
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
                            <p className="text-[13px] font-bold text-[rgba(255,255,255,0.88)] mb-0.5">{p.label}</p>
                            <p className="text-[12px] text-[rgba(255,255,255,0.68)] leading-relaxed">{p.desc}</p>
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
        <section className="relative overflow-hidden px-5 sm:px-10 py-6 sm:py-20">
          <div className="relative z-10 max-w-4xl mx-auto">
            <Reveal>
              <div className="relative rounded-2xl border overflow-hidden"
                style={{
                  borderColor: `${G}45`,
                  boxShadow: `0 0 0 1px ${G}14, 0 0 80px ${G}22, 0 0 160px rgba(0,229,255,0.10), 0 24px 60px rgba(0,0,0,0.32)`,
                  transition: "box-shadow 0.35s ease, transform 0.35s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${G}28, 0 0 120px ${G}40, 0 0 220px rgba(0,229,255,0.20), 0 32px 80px rgba(0,0,0,0.40)`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${G}14, 0 0 80px ${G}22, 0 0 160px rgba(0,229,255,0.10), 0 24px 60px rgba(0,0,0,0.32)`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >

                {/* sec-faca-parte image embedded inside the card */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0"
                    style={{ backgroundImage: "url(/sec-faca-parte.webp)", backgroundSize: "cover", backgroundPosition: "center 35%", opacity: 0.88, filter: "saturate(1.70) contrast(1.10)" }} />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg,rgba(5,12,26,0.40) 0%,rgba(5,12,26,0.10) 40%,rgba(5,12,26,0.28) 100%)" }} />
                  {/* Green atmosphere wash */}
                  <div className="absolute inset-0"
                    style={{ background: `radial-gradient(ellipse 100% 60% at 50% 0%,${G}08 0%,transparent 60%)` }} />
                </div>

                <div className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg,transparent,${G}85,${C}55,transparent)` }} />
                {/* Glow orb */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
                  style={{ background: `radial-gradient(circle,${G}12 0%,transparent 65%)`, filter: "blur(32px)" }} />

                <div className="relative p-6 sm:p-12 text-center">
                  <Pill label="Oportunidade de Investimento" color={G} icon={<Award size={10} />} />

                  <h2 className="font-black leading-tight mb-4"
                    style={{ fontSize: "clamp(22px,3.8vw,44px)", textShadow: "0 1px 10px rgba(0,0,0,0.42)" }}>
                    Pronto para participar da construção
                    <span className="block" style={{
                      background: `linear-gradient(90deg,${G},#9aff1c,${C})`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0 1px 8px rgba(0,0,0,0.36))",
                    }}>da infraestrutura de mão de obra do Brasil?</span>
                  </h2>

                  <p className="text-[14px] max-w-lg mx-auto leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.88)", textShadow: "0 1px 5px rgba(0,0,0,0.26)" }}>
                    A extraGO está estruturando uma rede nacional baseada em tecnologia, reputação, geolocalização e crescimento recorrente.
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
                        <Mail size={15} className="mr-2" /> Quero Investir
                      </Button>
                    </a>
                    <a href={`mailto:${CONTACT}`}>
                      <Button size="lg" variant="outline" className="rounded-full font-bold px-8 h-11 text-[rgba(255,255,255,0.96)] hover:bg-white/5 w-full sm:w-auto"
                        style={{ borderColor: "rgba(255,255,255,0.16)" }}>
                        <Briefcase size={15} className="mr-2" /> Tornar-se Parceiro
                      </Button>
                    </a>
                  </div>

                  <p className="text-[11px] text-white/28 flex items-center justify-center gap-2">
                    <Mail size={10} />
                    <a href={`mailto:${CONTACT}`} className="hover:text-[rgba(255,255,255,0.78)] transition-colors">{CONTACT}</a>
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
          <img src={logoMain} alt="extraGO" className="h-4 object-contain opacity-70" style={{ mixBlendMode: "screen" }} />
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-[rgba(255,255,255,0.78)] transition-colors">← Página Inicial</Link>
            <Link href="/login" className="hover:text-[rgba(255,255,255,0.78)] transition-colors">Entrar</Link>
            <a href={`mailto:${CONTACT}`} className="hover:text-[rgba(255,255,255,0.78)] transition-colors">Contato</a>
          </div>
          <p className="text-center sm:text-right">© 2026 extraGO — A Infraestrutura de Mão de Obra do Brasil.</p>
        </div>
      </footer>
    </div>
  );
}
