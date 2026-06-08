import React, { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  ArrowRight, ArrowLeft, Zap, Network, BadgeCheck, Building2,
  DollarSign, Layers, MapPin, TrendingUp, Shield, Users,
  BarChart3, Repeat, Globe, Cpu, Lock,
  CheckCircle, Wallet, Star, Award, ChevronRight,
  Mail, Rocket,
} from "lucide-react";

/* ─── constants ─── */
const CONTACT = "extrago.contato@gmail.com";
const G = "#7CFC00";
const C = "#00E5FF";
const T = "#0ea5e9";

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
    <div className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: "linear-gradient(160deg,#040c1c 0%,#060f22 35%,#04101e 65%,#030b18 100%)",
      }}>
      <div className="absolute inset-0 opacity-[0.022]"
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
          style={{
            background: scrolled ? "rgba(0,0,0,0.60)" : "rgba(0,0,0,0.40)",
            transition: "background 0.4s ease",
          }} />
        <div className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg,transparent,${G}40 35%,${C}28 65%,transparent)` }} />
        <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-10 h-[74px] lg:h-[94px]">
          <Link href="/investidores-parceiros" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img src={logoMain} alt="extraGO"
              style={{ height: "46px", objectFit: "contain", filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.50))" }} />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {[
              ["#camada-1", "Intermediação"],
              ["#camada-2", "Indicações"],
              ["#camada-3", "Assinaturas"],
              ["#camada-4", "SaaS"],
              ["#financeiro", "Financeiro"],
            ].map(([href, label]) => (
              <a key={href} href={href}
                className="text-[13px] font-medium relative group"
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
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)",
                height: "38px",
                padding: "0 16px",
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

        {/* ── HERO ── */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-14 sm:py-28">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(124,252,0,0.07) 0%,transparent 70%)" }} />
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Pill label="Modelo de Negócio Completo" color={G} icon={<Layers size={10} />} />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.80, ease: [0.19,1,0.22,1] }}
              className="font-black leading-[1.04] mb-5"
              style={{ fontSize: "clamp(28px,5vw,64px)" }}>
              A Arquitetura Financeira<br />
              <span style={{
                background: `linear-gradient(90deg,${G} 0%,${C} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>da extraGO.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.40 }}
              className="text-white/50 text-[14px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto mb-8">
              Um modelo de receita com quatro camadas independentes, projetado para crescimento
              nacional sustentável, resiliência financeira e retorno escalável para investidores.
            </motion.p>
            {/* Summary metric strip */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-8">
              {[
                { label: "Camadas de receita", value: "4" },
                { label: "Fontes recorrentes", value: "3 de 4" },
                { label: "Modelo de distribuição", value: "Multinível" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <p className="font-black text-[24px] sm:text-[30px] leading-none" style={{ color: G }}>{item.value}</p>
                  <p className="text-white/38 text-[11px] mt-1">{item.label}</p>
                </div>
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
                Taxa progressiva cobrada sobre cada extra concluído. Quanto maior a reputação e nível do profissional, menor a taxa — incentivando qualidade, retenção e crescimento de longo prazo.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-4">
              <Reveal>
                <GCard className="p-5 sm:p-6 h-full" accent={G} glow>
                  <p className="text-[11px] font-black tracking-widest uppercase text-white/30 mb-5">Tabela de Taxas por Nível</p>
                  {[
                    { name: "Iniciante (Bronze)", fee: 18, color: "#cd7f32", w: "90%" },
                    { name: "Júnior (Silver)", fee: 16, color: "#94a3b8", w: "80%" },
                    { name: "Intermediário (Gold)", fee: 14, color: "#f59e0b", w: "70%" },
                    { name: "Sênior (Elite)", fee: 10, color: G, w: "50%" },
                  ].map((f, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 mb-2.5">
                      <span className="w-[155px] text-[12px] font-medium text-white/60 flex-shrink-0">{f.name}</span>
                      <div className="flex-1 h-5 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: f.w }}
                          viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: [0.19,1,0.22,1] }}
                          className="h-full rounded-lg flex items-center justify-end pr-2"
                          style={{ background: `linear-gradient(90deg,${f.color}28,${f.color}62)`, borderRight: `2px solid ${f.color}` }}>
                          <span className="text-[10px] font-black" style={{ color: f.color }}>{f.fee}%</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </GCard>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="space-y-4 h-full flex flex-col">
                  {[
                    { icon: <TrendingUp size={16} />, color: G, title: "Incentivo à Progressão", desc: "Taxa reduzida ao subir de nível cria um incentivo natural para que profissionais busquem qualidade e volume." },
                    { icon: <Repeat size={16} />, color: C, title: "Receita Recorrente por Serviço", desc: "Cada extra concluído gera receita imediata, proporcional ao valor do serviço e ao nível do profissional." },
                    { icon: <Shield size={16} />, color: "#a855f7", title: "Modelo Comprovado", desc: "Inspirado em marketplaces globais como Uber, iFood e AirBnB — intermediação por performance com fee decrescente." },
                  ].map((item, i) => (
                    <GCard key={i} className="p-4 flex-1" accent={item.color}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                Cada usuário recebe um código e link exclusivos. A rede cresce organicamente enquanto
                os indicadores ganham comissão recorrente sobre cada extra gerado pelos seus indicados.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              {[
                { label: "Comissão base do indicador", pct: "3%", desc: "Sobre cada extra concluído pelo indicado.", color: C },
                { label: "Alcance viral estimado", pct: "2–5×", desc: "Crescimento de base por efeito de rede.", color: G },
                { label: "Recorrência", pct: "∞", desc: "A comissão é contínua, não tem prazo.", color: "#a855f7" },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 text-center h-full" accent={item.color} glow>
                    <p className="text-[10px] font-black tracking-widest uppercase text-white/30 mb-3">{item.label}</p>
                    <p className="font-black mb-2" style={{ fontSize: "clamp(32px,4vw,48px)", color: item.color }}>{item.pct}</p>
                    <p className="text-[12px] text-white/45">{item.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.18}>
              <GCard className="p-5 sm:p-6" accent={C}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-[11px] font-black tracking-widest uppercase text-white/30 mb-4">Como Funciona</p>
                    {[
                      "Usuário recebe código exclusivo ao criar conta",
                      "Indica amigos, colegas ou empresas",
                      "Cada extra gerado pelo indicado gera comissão automática",
                      "Comissão cai direto na carteira do indicador",
                      "Sem limite de indicados ou de período",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 mb-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                          style={{ background: `${C}18`, border: `1px solid ${C}28`, color: C }}>{i + 1}</span>
                        <p className="text-[12px] text-white/60 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-widest uppercase text-white/30 mb-4">Benefícios Estratégicos</p>
                    {[
                      { icon: <Globe size={13} />, label: "Crescimento orgânico nacional" },
                      { icon: <TrendingUp size={13} />, label: "CAC próximo de zero" },
                      { icon: <Repeat size={13} />, label: "Retenção ativa de usuários" },
                      { icon: <Network size={13} />, label: "Efeito de rede composto" },
                      { icon: <DollarSign size={13} />, label: "Renda recorrente para usuários" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 mb-2.5">
                        <span style={{ color: C }}>{item.icon}</span>
                        <p className="text-[12px] text-white/60">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GCard>
            </Reveal>
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
                Planos mensais opcionais para freelancers que desejam acelerar sua progressão,
                aumentar visibilidade e acessar recursos premium — gerando MRR previsível.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  name: "Básico", price: "R$ 19,90", color: "#94a3b8", flagship: false,
                  features: ["Perfil verificado", "Candidatura prioritária", "Histórico detalhado"],
                },
                {
                  name: "Pro", price: "R$ 49,90", color: "#a855f7", flagship: true,
                  features: ["Tudo do Básico", "Destaque no feed", "Análise de performance", "Suporte dedicado"],
                },
                {
                  name: "Elite", price: "R$ 99,90", color: G, flagship: false,
                  features: ["Tudo do Pro", "Badge Elite", "Acesso antecipado a extras", "Mentoria de crescimento"],
                },
              ].map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className={`p-5 sm:p-6 h-full ${plan.flagship ? "ring-1" : ""}`}
                    accent={plan.color} glow={plan.flagship}
                    style={plan.flagship ? { ringColor: plan.color } as React.CSSProperties : undefined}>
                    {plan.flagship && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}35`, color: plan.color }}>
                          MAIS POPULAR
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.name}</p>
                    <p className="font-black mb-1 leading-none" style={{ fontSize: "clamp(26px,3vw,34px)", color: plan.color }}>{plan.price}</p>
                    <p className="text-[11px] text-white/30 mb-5">/mês</p>
                    <div className="space-y-2">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <CheckCircle size={12} style={{ color: plan.color, flexShrink: 0 }} />
                          <span className="text-[12px] text-white/65">{f}</span>
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
                Soluções SaaS para empresas de todos os portes, desde pequenos negócios até grandes
                corporações — com funcionalidades de gestão, compliance e escala operacional.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  tier: "Starter", price: "R$ 99,90", color: "#94a3b8",
                  features: ["Até 5 vagas/mês", "Painel básico", "Suporte por email"],
                },
                {
                  tier: "Business", price: "R$ 299,90", color: "#f59e0b",
                  features: ["Vagas ilimitadas", "Dashboard analítico", "Gestão de equipe", "Suporte prioritário"],
                },
                {
                  tier: "Corporate", price: "R$ 799,90", color: C,
                  features: ["Multi-unidade", "API integração", "SLA garantido", "Gerente de conta"],
                },
                {
                  tier: "Enterprise", price: "Sob consulta", color: G,
                  features: ["Personalizado", "Integração total", "Compliance nacional", "Equipe dedicada"],
                },
              ].map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 h-full" accent={plan.color}>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.tier}</p>
                    <p className="font-black mb-4 leading-snug" style={{ fontSize: "clamp(16px,2vw,20px)", color: plan.color }}>{plan.price}</p>
                    <div className="space-y-2">
                      {plan.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <ChevronRight size={11} style={{ color: plan.color, flexShrink: 0 }} />
                          <span className="text-[12px] text-white/60">{f}</span>
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
            ESTRUTURA FINANCEIRA
        ══════════════════════════════════════ */}
        <section id="financeiro" className="px-5 sm:px-10 py-10 sm:py-20"
          style={{ background: "rgba(124,252,0,0.018)" }}>
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Estrutura Financeira" color={G} icon={<BarChart3 size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Distribuição de Receita
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Cada real gerado pela plataforma é distribuído de forma estratégica, equilibrando
                crescimento, solidez operacional e retorno para parceiros e investidores.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <Reveal>
                <GCard className="p-5 sm:p-6 h-full" accent={G} glow>
                  <p className="text-[11px] font-black tracking-widest uppercase text-white/30 mb-5">Distribuição por Destino</p>
                  {[
                    { label: "Operação & Infraestrutura", pct: 45, color: T },
                    { label: "Marketing & Crescimento", pct: 15, color: C },
                    { label: "Caixa & Reserva Estratégica", pct: 25, color: G },
                    { label: "Parceiros & Investidores", pct: 15, color: "#f59e0b" },
                  ].map((item, i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] text-white/65">{item.label}</span>
                        <span className="text-[12px] font-bold" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                          viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.3, duration: 0.9, ease: [0.19,1,0.22,1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${item.color}50,${item.color})` }} />
                      </div>
                    </div>
                  ))}
                </GCard>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="space-y-3 h-full flex flex-col">
                  {[
                    { icon: <Shield size={16} />, color: G, title: "25% em Caixa", desc: "Reserva estratégica que garante solidez operacional e suporta crescimento acelerado em cenários adversos." },
                    { icon: <DollarSign size={16} />, color: "#f59e0b", title: "15% para Investidores", desc: "Distribuição direta para parceiros e investidores ativos — retorno proporcional ao crescimento da plataforma." },
                    { icon: <TrendingUp size={16} />, color: C, title: "Modelo Escalável", desc: "Com 4 fontes de receita operando simultaneamente, a receita total cresce de forma não-linear." },
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
                Cada estado tem um representante oficial responsável por expandir a base local,
                apoiar empresas e profissionais, e receber comissão sobre toda a movimentação da região.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              {[
                { icon: <MapPin size={18} />, color: "#f59e0b", title: "Presença Estadual", desc: "Um representante por estado, responsável pelo crescimento local e onboarding de empresas e profissionais." },
                { icon: <DollarSign size={18} />, color: G, title: "Comissão Regional", desc: "O representante recebe comissão sobre cada extra e assinatura gerada dentro do seu território de atuação." },
                { icon: <Users size={18} />, color: C, title: "Suporte à Rede", desc: "Apoio presencial para empresas que precisam de operação urgente e profissionais em início de carreira na plataforma." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 h-full" accent={item.color}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}22` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <h3 className="text-[14px] font-bold mb-2 text-white/88">{item.title}</h3>
                    <p className="text-[12px] text-white/50 leading-relaxed">{item.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <GCard className="p-5 sm:p-6" accent="#f59e0b">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.20)" }}>
                    <Award size={18} style={{ color: "#f59e0b" }} />
                  </div>
                  <p className="text-[13px] text-white/58 leading-relaxed">
                    <span className="text-white/85 font-semibold">A rede de representantes estaduais</span>{" "}
                    é a espinha dorsal da expansão nacional. Ao transformar representantes em parceiros de negócio
                    com participação financeira direta, a extraGO cria um exército de co-fundadores regionais
                    incentivados a crescer.
                  </p>
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
            style={{ background: "radial-gradient(ellipse 60% 50% at 80% 50%,rgba(0,229,255,0.06) 0%,transparent 65%)" }} />
          <div className="relative z-10 max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Expansão Nacional" color={C} icon={<Globe size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Plano de Expansão por Fase
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                Crescimento estruturado em fases, priorizando consolidação de mercado antes de expansão geográfica.
              </p>
            </Reveal>
            <div className="space-y-3">
              {[
                {
                  phase: "Fase 1", period: "2024–2025", color: G, status: "Em andamento",
                  title: "Fundação & MVP",
                  items: ["Lançamento em Goiânia e Brasília", "Primeiros 500 profissionais", "Onboarding de 50 empresas parceiras", "Sistema de reputação ativo"],
                },
                {
                  phase: "Fase 2", period: "2025–2026", color: C, status: "Planejado",
                  title: "Expansão Centro-Oeste",
                  items: ["Representantes em todos os estados do CO", "10.000 profissionais ativos", "Integração com sistemas de RH", "Lançamento de planos Enterprise"],
                },
                {
                  phase: "Fase 3", period: "2026–2027", color: "#a855f7", status: "Projetado",
                  title: "Escala Nacional",
                  items: ["Presença nas 27 unidades federativas", "100.000 profissionais cadastrados", "Parceria com grandes corporações", "Series A e internacionalização"],
                },
                {
                  phase: "Fase 4", period: "2027+", color: "#f59e0b", status: "Visão",
                  title: "Liderança de Mercado",
                  items: ["Referência nacional em workforce flex", "Expansão para América Latina", "Produto financeiro próprio (extraPay)", "IPO ou M&A estratégico"],
                },
              ].map((phase, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-5 sm:p-6" accent={phase.color}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: phase.color }}>{phase.phase}</span>
                        <p className="text-[12px] text-white/38 mt-0.5">{phase.period}</p>
                        <span className="inline-block mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: `${phase.color}14`, border: `1px solid ${phase.color}25`, color: phase.color }}>
                          {phase.status}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold text-white/85 mb-3">{phase.title}</p>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                          {phase.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <CheckCircle size={11} style={{ color: phase.color, flexShrink: 0, marginTop: 2 }} />
                              <span className="text-[12px] text-white/55">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ══════════════════════════════════════
            GOVERNANÇA E CRESCIMENTO
        ══════════════════════════════════════ */}
        <section id="governanca" className="px-5 sm:px-10 py-10 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-8">
              <Pill label="Governança e Crescimento" color="#a855f7" icon={<Cpu size={10} />} />
              <h2 className="font-black leading-tight mb-3" style={{ fontSize: "clamp(22px,3.8vw,42px)" }}>
                Estrutura de Governança
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed max-w-2xl">
                A extraGO opera com controles centralizados, visibilidade em tempo real e
                processos automatizados — preparados para escalar com segurança.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              {[
                { icon: <BarChart3 size={18} />, color: "#a855f7", title: "Dashboard Nacional", desc: "Visibilidade em tempo real de todos os estados, usuários, extras e receita." },
                { icon: <Shield size={18} />, color: G, title: "Compliance Operacional", desc: "Conformidade trabalhista, tributária e de proteção de dados (LGPD)." },
                { icon: <Lock size={18} />, color: C, title: "Controles de Risco", desc: "Sistemas de detecção de fraude, avaliação de reputação e bloqueio automático." },
                { icon: <Wallet size={18} />, color: "#f59e0b", title: "Gestão Financeira", desc: "Carteira digital integrada com PIX, histórico auditável e relatórios automatizados." },
                { icon: <Users size={18} />, color: "#f43f5e", title: "Gestão de Equipe", desc: "Painel admin com controle por representante, estado e segmento de mercado." },
                { icon: <Star size={18} />, color: T, title: "Reputação & Qualidade", desc: "Sistema de avaliação bidirecional que governa acesso, visibilidade e taxas." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <GCard className="p-5 h-full" accent={item.color}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}22` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <h3 className="text-[13px] font-bold mb-2 text-white/88">{item.title}</h3>
                    <p className="text-[12px] text-white/48 leading-relaxed">{item.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── FINAL CTA ── */}
        <section className="relative overflow-hidden px-5 sm:px-10 py-14 sm:py-24">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%,rgba(124,252,0,0.07) 0%,transparent 70%)" }} />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <Reveal>
              <Pill label="Próximo Passo" color={G} icon={<Rocket size={10} />} />
              <h2 className="font-black leading-tight mb-4" style={{ fontSize: "clamp(24px,4vw,48px)" }}>
                Pronto para investir<br />
                <span style={{ background: `linear-gradient(90deg,${G},${C})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  na infraestrutura do Brasil?
                </span>
              </h2>
              <p className="text-white/50 text-[14px] leading-relaxed mb-8">
                Converse com nossa equipe para entender as oportunidades de investimento,
                parceria estratégica ou representação estadual.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={`mailto:${CONTACT}`}>
                  <button className="flex items-center gap-2.5 rounded-full font-bold text-black border-none cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg,${G} 0%,#9bff14 50%,${C} 100%)`,
                      boxShadow: `0 0 28px rgba(124,252,0,0.30)`,
                      height: "48px", padding: "0 28px", fontSize: "14px",
                    }}>
                    <Mail size={15} /> Falar com a Equipe
                  </button>
                </a>
                <Link href="/investidores-parceiros">
                  <button className="flex items-center gap-2 rounded-full font-semibold border cursor-pointer text-[13px]"
                    style={{
                      background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.65)", height: "48px", padding: "0 24px",
                    }}>
                    <ArrowLeft size={13} /> Página de Investidores
                  </button>
                </Link>
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
