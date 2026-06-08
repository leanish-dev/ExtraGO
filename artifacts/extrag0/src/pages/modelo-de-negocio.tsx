import React, { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  ArrowLeft, Zap, Network, BadgeCheck, Building2,
  DollarSign, Layers, MapPin, TrendingUp, Shield, Users,
  BarChart3, Globe, Cpu, CheckCircle, Award, ChevronRight,
  Mail, Rocket, Star, Crown,
} from "lucide-react";

/* ─── constants ─── */
const CONTACT = "extrago.contato@gmail.com";
const G = "#7CFC00";
const C = "#00E5FF";

/* ─── Reveal ─── */
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

/* ─── GCard ─── */
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

/* ─── Pill ─── */
function Pill({ label, color, icon }: { label: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 text-[10px] font-black tracking-[0.14em] uppercase"
      style={{ background: `${color}12`, border: `1px solid ${color}28`, color }}>
      {icon}
      {label}
    </div>
  );
}

/* ─── Divider ─── */
function Divider() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-10">
      <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)" }} />
    </div>
  );
}

/* ─── Background ─── */
function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0"
        style={{
          backgroundImage: "url(/finance-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }} />
      {/* Preserve existing card/text contrast — same transparency as before */}
      <div className="absolute inset-0"
        style={{ background: "rgba(4,10,22,0.62)" }} />
      <div className="absolute inset-0 opacity-[0.018]"
        style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
    </div>
  );
}

export default function ModeloDeNegocioPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ color: "#fff" }}>
      <Background />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full overflow-hidden"
        style={{
          backgroundImage: "url('/investors-logo-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.55)" : "0 2px 12px rgba(0,0,0,0.30)",
          transition: "box-shadow 0.4s ease",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: scrolled ? "rgba(0,0,0,0.60)" : "rgba(0,0,0,0.40)", transition: "background 0.4s ease" }} />
        <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg,transparent,${G}40 35%,${C}28 65%,transparent)` }} />
        <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-10 h-[74px] lg:h-[94px]">
          <Link href="/investidores-parceiros" className="flex items-center flex-shrink-0">
            <img src={logoMain} alt="extraGO"
              style={{ height: "46px", objectFit: "contain", filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.50))" }} />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {[
              ["#camada-1", "Intermediação"],
              ["#camada-2", "Indicações"],
              ["#camada-3", "Profissionais"],
              ["#camada-4", "Empresas"],
              ["#financeiro", "Financeiro"],
              ["#expansao", "Expansão"],
            ].map(([href, label]) => (
              <a key={href} href={href}
                className="text-[13px] font-medium"
                style={{ color: "rgba(255,255,255,0.60)", transition: "color 0.18s ease" }}
                onMouseEnter={e => (e.currentTarget.style.color = G)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.60)")}>
                {label}
              </a>
            ))}
          </nav>
          <Link href="/investidores-parceiros">
            <button className="flex items-center gap-2 rounded-full font-semibold border cursor-pointer text-[13px] flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)", height: "38px", padding: "0 16px",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
              }}>
              <ArrowLeft size={13} />
              <span className="sm:hidden">Voltar</span>
              <span className="hidden sm:inline">← Investidores</span>
            </button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-14 sm:py-28">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(124,252,0,0.07) 0%,transparent 70%)" }} />
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }}>
              <Pill label="Arquitetura Financeira Oficial" color={G} icon={<Layers size={10} />} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.80, ease: [0.19,1,0.22,1] }}
              className="font-black leading-[1.04] mb-5"
              style={{ fontSize: "clamp(26px,5vw,62px)" }}>
              A Arquitetura Financeira<br />
              <span style={{ background: `linear-gradient(90deg,${G} 0%,${C} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                da extraGO.
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.40 }}
              className="text-white/50 text-[14px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto mb-10">
              Quatro fontes independentes de receita formando a infraestrutura de mão de obra do Brasil.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { value: "10%", label: "Menor taxa operacional", color: G },
                { value: "20%", label: "Maior taxa operacional", color: C },
                { value: "4",   label: "Fontes de receita",      color: "#a855f7" },
                { value: "27",  label: "Representantes estaduais", color: "#f59e0b" },
              ].map((m, i) => (
                <GCard key={i} className="p-4 text-center" accent={m.color}>
                  <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(24px,3vw,36px)", color: m.color }}>{m.value}</p>
                  <p className="text-[11px] text-white/45 leading-snug">{m.label}</p>
                </GCard>
              ))}
            </motion.div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            CAMADA 1 — INTERMEDIAÇÃO
        ══════════════════════════════════════ */}
        <section id="camada-1" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Camada 1" color={G} icon={<Zap size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Intermediação por Performance
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                A taxa da plataforma diminui conforme o profissional constrói reputação, histórico e confiabilidade dentro do ecossistema.
              </p>
            </Reveal>

            <div className="space-y-3">
              {[
                {
                  level: "Iniciante", fee: 20, color: "#94a3b8", bar: "100%",
                  reqs: [],
                },
                {
                  level: "Júnior", fee: 18, color: "#60a5fa", bar: "86%",
                  reqs: ["20 extras concluídos", "Avaliação mínima 4,5"],
                },
                {
                  level: "Intermediário", fee: 15, color: "#a855f7", bar: "70%",
                  reqs: ["100 extras concluídos", "6 meses de atividade", "Avaliação mínima 4,7"],
                },
                {
                  level: "Sênior", fee: 12, color: C, bar: "55%",
                  reqs: ["300 extras concluídos", "12 meses de atividade", "Avaliação mínima 4,8", "Comparecimento superior a 98%"],
                },
                {
                  level: "Elite", fee: 10, color: G, bar: "45%",
                  reqs: ["1.000 extras concluídos", "24 meses de atividade", "Avaliação mínima 4,9", "Comparecimento superior a 99%", "Perfil totalmente validado", "Selo Elite extraGO"],
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-5 sm:p-6" accent={item.color}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Level + fee */}
                      <div className="flex items-center gap-4 sm:w-48 flex-shrink-0">
                        <div>
                          <p className="text-[11px] font-black tracking-widest uppercase mb-0.5" style={{ color: item.color }}>{item.level}</p>
                          <p className="font-black leading-none" style={{ fontSize: "clamp(28px,3.5vw,40px)", color: item.color }}>{item.fee}%</p>
                        </div>
                        {/* Bar */}
                        <div className="hidden sm:block flex-1 h-6 rounded-lg overflow-hidden ml-2" style={{ background: "rgba(255,255,255,0.04)", minWidth: 60 }}>
                          <motion.div
                            initial={{ width: 0 }} whileInView={{ width: item.bar }}
                            viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.3, duration: 0.9, ease: [0.19,1,0.22,1] }}
                            className="h-full rounded-lg"
                            style={{ background: `linear-gradient(90deg,${item.color}30,${item.color}70)`, borderRight: `2px solid ${item.color}` }} />
                        </div>
                      </div>
                      {/* Requirements */}
                      {item.reqs.length > 0 ? (
                        <div className="flex-1">
                          <p className="text-[10px] font-black tracking-widest uppercase text-white/28 mb-2">Requisitos para este nível</p>
                          <div className="flex flex-wrap gap-x-5 gap-y-1">
                            {item.reqs.map((r, j) => (
                              <div key={j} className="flex items-center gap-1.5">
                                <CheckCircle size={10} style={{ color: item.color, flexShrink: 0 }} />
                                <span className="text-[12px] text-white/60">{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-[12px] text-white/38 italic">Nível de entrada — sem requisitos prévios.</p>
                        </div>
                      )}
                    </div>
                    {/* Mobile bar */}
                    <div className="mt-3 h-2 rounded-full sm:hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div
                        initial={{ width: 0 }} whileInView={{ width: item.bar }}
                        viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.9, ease: [0.19,1,0.22,1] }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${item.color}40,${item.color})` }} />
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            CAMADA 2 — INDICAÇÕES MULTINÍVEL
        ══════════════════════════════════════ */}
        <section id="camada-2" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Camada 2" color={C} icon={<Network size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Indicações Multinível
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Cada usuário recebe um código exclusivo e participa diretamente da expansão da plataforma.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  tier: "Indicador", pct: "2%", color: C, icon: <Users size={16} />,
                  desc: "do valor bruto dos extras realizados pelos indicados.",
                  reqs: [],
                },
                {
                  tier: "Agente de Captação", pct: "3%", color: "#a855f7", icon: <Network size={16} />,
                  desc: "do valor bruto dos extras realizados pelos indicados.",
                  reqs: ["25 indicados ativos", "100 extras concluídos pela rede"],
                },
                {
                  tier: "Embaixador Regional", pct: "5%", color: G, icon: <Crown size={16} />,
                  desc: "do valor bruto dos extras realizados pelos indicados.",
                  reqs: [
                    "100 indicados ativos",
                    "1.000 extras concluídos pela rede",
                    "Aprovação da plataforma",
                    "Atuação comprovada na região",
                    "Brasão exclusivo no perfil",
                  ],
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.09}>
                  <GCard className="p-5 sm:p-6 h-full" accent={item.color} glow={i === 2}>
                    {i === 2 && (
                      <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${item.color}18`, border: `1px solid ${item.color}30`, color: item.color }}>
                        NÍVEL MÁXIMO
                      </span>
                    )}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}22` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <p className="text-[11px] font-black tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.tier}</p>
                    <p className="font-black mb-1 leading-none" style={{ fontSize: "clamp(32px,4vw,48px)", color: item.color }}>{item.pct}</p>
                    <p className="text-[12px] text-white/48 mb-4 leading-relaxed">{item.desc}</p>
                    {item.reqs.length > 0 && (
                      <>
                        <p className="text-[10px] font-black tracking-widest uppercase text-white/28 mb-2">Requisitos</p>
                        <div className="space-y-1.5">
                          {item.reqs.map((r, j) => (
                            <div key={j} className="flex items-start gap-1.5">
                              <CheckCircle size={10} style={{ color: item.color, flexShrink: 0, marginTop: 2 }} />
                              <span className="text-[12px] text-white/58 leading-snug">{r}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {item.reqs.length === 0 && (
                      <p className="text-[12px] text-white/38 italic">Disponível para todos os usuários.</p>
                    )}
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            CAMADA 3 — ASSINATURAS PROFISSIONAIS
        ══════════════════════════════════════ */}
        <section id="camada-3" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Camada 3" color="#a855f7" icon={<BadgeCheck size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Assinaturas Profissionais
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Planos voltados para crescimento profissional, visibilidade e ferramentas avançadas.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: "Free", price: "R$ 0,00", sub: "gratuito", color: "#94a3b8", flagship: false,
                  features: ["Perfil básico", "Candidatura padrão", "Acesso ao marketplace"],
                },
                {
                  name: "Pro", price: "R$ 19,90", sub: "/mês", color: "#a855f7", flagship: false,
                  features: ["Perfil verificado", "Candidatura prioritária", "Histórico detalhado", "Suporte por chat"],
                },
                {
                  name: "Premium", price: "R$ 49,90", sub: "/mês", color: C, flagship: true,
                  features: ["Tudo do Pro", "Destaque no feed", "Análise de performance", "Suporte dedicado"],
                },
                {
                  name: "Elite", price: "R$ 99,90", sub: "/mês", color: G, flagship: false,
                  features: ["Tudo do Premium", "Badge Elite", "Acesso antecipado", "Mentoria de crescimento"],
                },
              ].map((plan, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-5 h-full" accent={plan.color} glow={plan.flagship}>
                    {plan.flagship && (
                      <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30`, color: plan.color }}>
                        POPULAR
                      </span>
                    )}
                    <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.name}</p>
                    <p className="font-black leading-none mb-0.5"
                      style={{ fontSize: "clamp(18px,2.5vw,28px)", color: plan.color }}>{plan.price}</p>
                    <p className="text-[11px] text-white/30 mb-4">{plan.sub}</p>
                    <div className="space-y-1.5">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <CheckCircle size={10} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} />
                          <span className="text-[11px] text-white/60 leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            CAMADA 4 — ASSINATURAS EMPRESARIAIS
        ══════════════════════════════════════ */}
        <section id="camada-4" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Camada 4" color="#f59e0b" icon={<Building2 size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Assinaturas Empresariais
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Soluções SaaS para empresas com dashboards, analytics, gestão operacional e ferramentas corporativas.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  tier: "Starter", price: "R$ 99,90", sub: "/mês", color: "#94a3b8",
                  features: ["Até 5 vagas/mês", "Painel básico", "Suporte por email"],
                },
                {
                  tier: "Business", price: "R$ 299,90", sub: "/mês", color: "#f59e0b",
                  features: ["Vagas ilimitadas", "Dashboard analítico", "Gestão de equipe", "Suporte prioritário"],
                },
                {
                  tier: "Corporate", price: "R$ 799,90", sub: "/mês", color: C,
                  features: ["Multi-unidade", "API de integração", "SLA garantido", "Gerente de conta"],
                },
                {
                  tier: "Enterprise", price: "Sob consulta", sub: "", color: G,
                  features: ["Personalizado", "Integração total", "Compliance nacional", "Equipe dedicada"],
                },
              ].map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 h-full" accent={plan.color}>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.tier}</p>
                    <p className="font-black leading-none mb-0.5"
                      style={{ fontSize: "clamp(16px,2vw,22px)", color: plan.color }}>{plan.price}</p>
                    {plan.sub && <p className="text-[11px] text-white/30 mb-4">{plan.sub}</p>}
                    {!plan.sub && <div className="mb-4" />}
                    <div className="space-y-1.5">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-start gap-1.5">
                          <ChevronRight size={11} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} />
                          <span className="text-[12px] text-white/60 leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            DISTRIBUIÇÃO DA RECEITA
        ══════════════════════════════════════ */}
        <section id="financeiro" className="px-5 sm:px-10 py-10 sm:py-20"
          style={{ background: "rgba(124,252,0,0.018)" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Distribuição da Receita" color={G} icon={<BarChart3 size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Para onde vai cada real gerado
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Distribuição estratégica que equilibra crescimento, solidez operacional e retorno para fundadores, parceiros e investidores.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Bar chart */}
              <Reveal>
                <GCard className="p-5 sm:p-6 h-full" accent={G} glow>
                  <p className="text-[11px] font-black tracking-widest uppercase text-white/30 mb-5">Distribuição por Destino</p>
                  {[
                    { label: "Caixa e Reserva Estratégica",      pct: 25, color: G },
                    { label: "Fundadores e Investidores",         pct: 20, color: "#f59e0b" },
                    { label: "Marketing e Expansão",              pct: 20, color: C },
                    { label: "Tecnologia e Inovação",             pct: 10, color: "#a855f7" },
                    { label: "Operações",                         pct: 10, color: "#60a5fa" },
                    { label: "Fundo de Crescimento Estratégico",  pct: 10, color: "#f43f5e" },
                    { label: "Representantes Estaduais",          pct:  5, color: "#fb923c" },
                  ].map((item, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] text-white/65 leading-snug">{item.label}</span>
                        <span className="text-[13px] font-black ml-3 flex-shrink-0" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${item.pct * 4}%` }}
                          viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.3, duration: 0.9, ease: [0.19,1,0.22,1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${item.color}50,${item.color})` }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t border-white/6 flex items-center justify-between">
                    <span className="text-[11px] text-white/35">Total</span>
                    <span className="text-[14px] font-black" style={{ color: G }}>100%</span>
                  </div>
                </GCard>
              </Reveal>

              {/* Key highlights */}
              <Reveal delay={0.1}>
                <div className="space-y-3 h-full flex flex-col">
                  {[
                    {
                      icon: <Shield size={16} />, color: G, title: "25% em Caixa",
                      desc: "Reserva estratégica que garante solidez operacional e suporta crescimento acelerado mesmo em cenários adversos.",
                    },
                    {
                      icon: <DollarSign size={16} />, color: "#f59e0b", title: "20% para Fundadores e Investidores",
                      desc: "Retorno direto e proporcional ao crescimento da plataforma — alinhando os interesses de quem constrói com quem investe.",
                    },
                    {
                      icon: <TrendingUp size={16} />, color: C, title: "20% em Marketing e Expansão",
                      desc: "Combustível para crescimento nacional: aquisição de usuários, representantes estaduais e novos mercados.",
                    },
                    {
                      icon: <MapPin size={16} />, color: "#fb923c", title: "5% para Representantes",
                      desc: "Remuneração direta dos representantes estaduais, incentivando expansão regional descentralizada.",
                    },
                  ].map((item, i) => (
                    <GCard key={i} className="p-4 flex-1" accent={item.color}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}12`, border: `1px solid ${item.color}22` }}>
                          <span style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-white/85 mb-1">{item.title}</p>
                          <p className="text-[12px] text-white/48 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </GCard>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            REPRESENTANTES ESTADUAIS
        ══════════════════════════════════════ */}
        <section id="representantes" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Representantes Estaduais" color="#f59e0b" icon={<MapPin size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Rede de Representantes por Estado
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Cada estado tem um representante oficial responsável pela expansão local, apoiado por até 4 líderes regionais.
              </p>
            </Reveal>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { value: "1", label: "Representante Oficial por Estado", color: "#f59e0b" },
                { value: "27", label: "Representantes Estaduais", color: G },
                { value: "108", label: "Líderes Regionais de Apoio (máx.)", color: C },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-4 sm:p-6 text-center" accent={m.color} glow>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(28px,4vw,52px)", color: m.color }}>{m.value}</p>
                    <p className="text-[11px] sm:text-[12px] text-white/48 leading-snug">{m.label}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            {/* Benefits */}
            <Reveal delay={0.2}>
              <GCard className="p-5 sm:p-6" accent="#f59e0b" glow>
                <p className="text-[11px] font-black tracking-widest uppercase text-white/30 mb-4">Benefícios do Representante</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: <BadgeCheck size={14} />, label: "Perfil verificado", color: "#f59e0b" },
                    { icon: <Award size={14} />, label: "Brasão oficial", color: G },
                    { icon: <BarChart3 size={14} />, label: "Painel regional", color: C },
                    { icon: <Star size={14} />, label: "Participação estratégica", color: "#a855f7" },
                    { icon: <DollarSign size={14} />, label: "Participação no Fundo Nacional", color: "#f43f5e" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl border border-white/6"
                      style={{ background: "rgba(255,255,255,0.025)" }}>
                      <span style={{ color: b.color }}>{b.icon}</span>
                      <span className="text-[13px] text-white/72 font-medium">{b.label}</span>
                    </div>
                  ))}
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            EXPANSÃO NACIONAL
        ══════════════════════════════════════ */}
        <section id="expansao" className="relative overflow-hidden px-5 sm:px-10 py-10 sm:py-20">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 80% 50%,rgba(0,229,255,0.05) 0%,transparent 65%)" }} />
          <div className="relative z-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Modelo de Expansão" color={C} icon={<Globe size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Expansão Nacional por Fase
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                {["Crescimento baseado em rede","Operação escalável","Gestão regional descentralizada","Expansão nacional progressiva"].map((tag, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: C }} />
                    <span className="text-[12px] text-white/50">{tag}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <div className="relative">
              {/* Vertical line — desktop */}
              <div className="absolute left-6 top-0 bottom-0 w-px hidden sm:block"
                style={{ background: "linear-gradient(180deg,transparent,rgba(255,255,255,0.08) 10%,rgba(255,255,255,0.08) 90%,transparent)" }} />

              <div className="space-y-4">
                {[
                  { phase: "Fase 1", region: "Rio Grande do Sul", color: G, icon: <MapPin size={14} /> },
                  { phase: "Fase 2", region: "Região Sul", color: C, icon: <Globe size={14} /> },
                  { phase: "Fase 3", region: "Sudeste", color: "#a855f7", icon: <TrendingUp size={14} /> },
                  { phase: "Fase 4", region: "Capitais Estratégicas", color: "#f59e0b", icon: <Star size={14} /> },
                  { phase: "Fase 5", region: "Cobertura Nacional", color: "#f43f5e", icon: <Rocket size={14} /> },
                ].map((item, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="flex items-center gap-4 sm:gap-6">
                      {/* Node */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                        style={{ background: `${item.color}14`, border: `2px solid ${item.color}40` }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      {/* Card */}
                      <GCard className="flex-1 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6" accent={item.color}>
                        <span className="text-[10px] font-black tracking-widest uppercase flex-shrink-0"
                          style={{ color: item.color }}>{item.phase}</span>
                        <p className="text-[15px] sm:text-[17px] font-black text-white/88">{item.region}</p>
                        {i === 4 && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full ml-auto"
                            style={{ background: `${item.color}14`, border: `1px solid ${item.color}25`, color: item.color }}>
                            OBJETIVO FINAL
                          </span>
                        )}
                      </GCard>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            GOVERNANÇA
        ══════════════════════════════════════ */}
        <section id="governanca" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Governança e Crescimento" color="#a855f7" icon={<Cpu size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Estrutura de Governança
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Três pilares de governança que garantem coordenação nacional, execução regional e crescimento sustentável.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  entity: "Plataforma", color: G, icon: <Cpu size={20} />,
                  label: "Responsável por",
                  items: ["Tecnologia", "Produto", "Compliance", "Estratégia Nacional"],
                },
                {
                  entity: "Representantes Estaduais", color: "#f59e0b", icon: <MapPin size={20} />,
                  label: "Responsáveis por",
                  items: ["Expansão regional", "Comunidade", "Parcerias", "Operação estadual"],
                },
                {
                  entity: "Equipes Regionais", color: C, icon: <Users size={20} />,
                  label: "Responsáveis por",
                  items: ["Comercial", "Marketing", "Expansão", "Operações e Pessoas"],
                },
              ].map((pillar, i) => (
                <Reveal key={i} delay={i * 0.10}>
                  <GCard className="p-6 h-full" accent={pillar.color} glow>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: `${pillar.color}12`, border: `1px solid ${pillar.color}22` }}>
                      <span style={{ color: pillar.color }}>{pillar.icon}</span>
                    </div>
                    <h3 className="text-[16px] font-black text-white/90 mb-1">{pillar.entity}</h3>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-4" style={{ color: pillar.color }}>{pillar.label}</p>
                    <div className="space-y-2">
                      {pillar.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2.5 py-2 px-3 rounded-xl border border-white/5"
                          style={{ background: "rgba(255,255,255,0.025)" }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pillar.color }} />
                          <span className="text-[13px] text-white/70 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-14 sm:py-24">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%,rgba(124,252,0,0.08) 0%,transparent 70%)" }} />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <Reveal>
              <Pill label="Próximo Passo" color={G} icon={<Rocket size={10} />} />
              <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(22px,4vw,46px)" }}>
                Pronto para investir na infraestrutura<br />
                <span style={{ background: `linear-gradient(90deg,${G},${C})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  de mão de obra do Brasil?
                </span>
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed mb-8 max-w-xl mx-auto">
                A extraGO está construindo a camada operacional que conecta empresas, profissionais e representantes em escala nacional.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={`mailto:${CONTACT}`}>
                  <button className="flex items-center gap-2.5 rounded-full font-bold text-black border-none cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg,${G} 0%,#9bff14 50%,${C} 100%)`,
                      boxShadow: `0 0 28px rgba(124,252,0,0.30), 0 4px 14px rgba(0,0,0,0.30)`,
                      height: "48px", padding: "0 28px", fontSize: "14px",
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 42px rgba(124,252,0,0.50), 0 6px 20px rgba(0,0,0,0.36)`;
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 28px rgba(124,252,0,0.30), 0 4px 14px rgba(0,0,0,0.30)`;
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}>
                    <Mail size={15} /> Quero investir
                  </button>
                </a>
                <a href={`mailto:${CONTACT}`}>
                  <button className="flex items-center gap-2 rounded-full font-semibold border cursor-pointer text-[13px]"
                    style={{
                      background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.72)", height: "48px", padding: "0 24px",
                      transition: "background 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.24)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)";
                    }}>
                    Tornar-se parceiro
                  </button>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t px-5 sm:px-10 py-6"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(4,9,20,0.60)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src={logoMain} alt="extraGO" style={{ height: "28px", objectFit: "contain" }} />
            <span className="text-[11px] text-white/28">Modelo de Negócio</span>
          </div>
          <p className="text-[11px] text-white/25">© {new Date().getFullYear()} extraGO · Todos os direitos reservados</p>
          <a href={`mailto:${CONTACT}`} className="text-[11px] text-white/35 hover:text-white/65 transition-colors">{CONTACT}</a>
        </div>
      </footer>
    </div>
  );
}
