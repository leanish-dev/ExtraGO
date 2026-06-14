import React, { useEffect } from "react";
import { BadgeCheck, Star, BarChart3, Zap, Users, TrendingUp, Globe, Building2, Shield, Target, Layers, Award } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";
import { motion } from "framer-motion";
import assProfissionaisArqImg from "@assets/Assinaturas-Profissionais-arqfin_1781335479672.png";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const ROSE = "#e11d48";

export default function ProfessionalPlansPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const plans = [
    {
      name: "FREE",
      price: "Gratuito",
      sub: "",
      color: "#64748b",
      flagship: false,
      target: "Novos usuários, quem está explorando a plataforma.",
      features: [
        "Acesso às funcionalidades essenciais da plataforma",
        "Criação de perfil profissional",
        "Candidatura a extras disponíveis",
        "Histórico básico de extras realizados",
      ],
    },
    {
      name: "extraGO PRO",
      price: "R$ 19,90",
      sub: "/mês",
      color: PURPLE,
      flagship: false,
      target: "Profissionais que querem crescer mais rápido.",
      features: [
        "Destaque nas buscas das empresas",
        "Estatísticas avançadas de performance",
        "Selo PRO visível no perfil",
        "Notificações prioritárias de novas oportunidades",
      ],
    },
    {
      name: "extraGO PREMIUM",
      price: "R$ 49,90",
      sub: "/mês",
      color: GC,
      flagship: true,
      target: "Profissionais ativos com foco em resultados.",
      features: [
        "Todos os benefícios do plano PRO",
        "Perfil destacado no topo das buscas",
        "Relatórios avançados de desempenho",
        "Atendimento prioritário pela equipe extraGO",
      ],
    },
    {
      name: "extraGO ELITE",
      price: "R$ 99,90",
      sub: "/mês",
      color: GA,
      flagship: false,
      target: "Os melhores profissionais que buscam o máximo da plataforma.",
      features: [
        "Todos os benefícios do plano PREMIUM",
        "Máxima prioridade em todos os recursos",
        "Benefícios exclusivos da plataforma",
        "Acesso a recursos avançados e lançamentos",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "linear-gradient(160deg,#ecfeff 0%,#fffbeb 40%,#f0fdf4 100%)", color: "#0f172a", "--gcard-bg": "rgba(222,246,255,0.92)" } as React.CSSProperties}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Camada 3 — Assinaturas Profissionais"
          pillColor={PURPLE}
          pillIcon={<BadgeCheck size={10} />}
          title="Planos de Assinatura"
          titleAccent="para Profissionais."
          subtitle="Quatro planos criados para atender profissionais em diferentes estágios de carreira dentro do ecossistema extraGO. Do acesso gratuito às ferramentas essenciais até a experiência máxima com o plano Elite."
        />

        <Divider />

        {/* Visual institucional */}
        <section className="py-2">
          <Reveal className="mb-4">
            <img
              src={assProfissionaisArqImg}
              alt="Assinaturas Profissionais — FREE Gratuito, extraGO PRO R$19,90/mês, PREMIUM R$49,90/mês, ELITE R$99,90/mês"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        {/* Planos */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Estrutura dos Planos" color={PURPLE} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Comparativo Completo dos Planos
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {plans.map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 sm:p-6 h-full" accent={plan.color} glow={plan.flagship} bgVariant="default">
                    {plan.flagship && (
                      <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${plan.color}14`, border: `1px solid ${plan.color}28`, color: plan.color }}>
                        MAIS POPULAR
                      </span>
                    )}
                    <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.name}</p>
                    <div className="flex items-baseline gap-0.5 mb-1">
                      <p className="font-black leading-none" style={{ fontSize: "clamp(20px,2.5vw,28px)", color: plan.color }}>{plan.price}</p>
                      {plan.sub && <span className="text-[12px] text-slate-400 ml-1">{plan.sub}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 italic mb-4 leading-snug">{plan.target}</p>
                    <div className="space-y-2">
                      {plan.features.map((f, j) => (
                        <CheckItem key={j} text={f} color={plan.color} />
                      ))}
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Career Evolution Visual ── */}
        <div className="relative overflow-hidden py-2" aria-hidden="true" style={{ background: "linear-gradient(90deg,rgba(124,58,237,0.025) 0%,rgba(22,163,74,0.025) 100%)" }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-10">
            <svg viewBox="0 0 900 90" className="w-full" style={{ height: "clamp(55px,8vw,90px)", display: "block" }}>
              <defs>
                <linearGradient id="planFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="33%" stopColor="#7c3aed" />
                  <stop offset="66%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="planEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
                  <stop offset="8%" stopColor="#fffbeb" stopOpacity="0" />
                  <stop offset="92%" stopColor="#fffbeb" stopOpacity="0" />
                  <stop offset="100%" stopColor="#fffbeb" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path d="M 70 52 L 310 52 L 330 38 L 560 38 L 580 24 L 840 24"
                fill="none" stroke="url(#planFlow)" strokeWidth="1.8" strokeLinecap="round" />
              {[
                {x:70, y:52, c:"#64748b", l:"FREE",    s:"Gratuito"},
                {x:320,y:38, c:"#7c3aed", l:"PRO",     s:"R$ 19,90"},
                {x:570,y:24, c:"#3b82f6", l:"PREMIUM", s:"R$ 49,90"},
                {x:840,y:24, c:"#16a34a", l:"ELITE",   s:"R$ 99,90"},
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r={i===3?7:5} fill={pt.c} />
                  <circle cx={pt.x} cy={pt.y} r={i===3?12:8} fill={pt.c} fillOpacity="0.11" />
                  <text x={pt.x} y={pt.y-11} textAnchor="middle" fill={pt.c} fontSize="8.5" fontWeight="800">{pt.l}</text>
                  <text x={pt.x} y={pt.y+20} textAnchor="middle" fill={pt.c} fontSize="7" opacity="0.60">{pt.s}</text>
                </g>
              ))}
              <text x={450} y={82} textAnchor="middle" fill="rgba(100,116,139,0.50)" fontSize="7.5" fontWeight="600">evolução de plano → maior visibilidade e aceleração de carreira</text>
              <rect x="0" y="0" width="900" height="90" fill="url(#planEdge)" />
            </svg>
          </div>
        </div>

        <Divider />

        {/* Como funciona */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Como funciona" color={GC} icon={<Zap size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Operação e Objetivo Estratégico
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-6">
                As assinaturas profissionais são cobradas mensalmente via cartão de crédito, débito ou PIX.
                O upgrade entre planos pode ser realizado a qualquer momento dentro da plataforma, com efeito imediato.
                O downgrade segue o ciclo de faturamento vigente.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Reveal>
                <GCard className="p-5 sm:p-7 h-full" accent={PURPLE} bgVariant="default">
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Objetivo Estratégico</p>
                  <div className="space-y-3">
                    {[
                      { title: "Receita Recorrente Previsível", desc: "As assinaturas criam uma base de receita estável e previsível que não depende do volume de extras realizados no mês." },
                      { title: "Segmentação Inteligente", desc: "Cada plano atende uma necessidade específica, maximizando a conversão em todos os segmentos de usuários." },
                      { title: "Upsell Natural", desc: "A evolução de nível (Camada 1) naturalmente incentiva o upgrade de plano para aproveitar os benefícios avançados." },
                      { title: "Diferenciação Competitiva", desc: "Ferramentas exclusivas para assinantes criam uma vantagem real frente a profissionais no plano gratuito." },
                    ].map((item, i) => (
                      <div key={i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <p className="font-semibold text-slate-700 text-[13px] mb-1">{item.title}</p>
                        <p className="text-[12px] text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </GCard>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="space-y-4">
                  <GCard className="p-5 sm:p-6" accent={GA} bgVariant="default">
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Profissionais</p>
                    <div className="space-y-2">
                      {[
                        "Visibilidade superior frente aos concorrentes não assinantes",
                        "Ferramentas que aceleram a conquista de novos contratos",
                        "Dados e estatísticas para otimizar a performance",
                        "Suporte dedicado para resolução de problemas",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GA} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={GC} bgVariant="default">
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Empresas</p>
                    <div className="space-y-2">
                      {[
                        "Acesso a profissionais diferenciados e comprometidos",
                        "Profissionais PRO e Elite têm histórico verificado",
                        "Base de talentos qualificados e ranqueados disponível",
                        "Confiança adicional ao contratar assinantes ativos",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GC} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={AMBER} bgVariant="default">
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Investidores</p>
                    <div className="space-y-2">
                      {[
                        "MRR (Monthly Recurring Revenue) previsível e escalável",
                        "Baixo churn com planos integrados ao crescimento profissional",
                        "Margem elevada em receita de assinatura SaaS",
                        "Camada adicional sobre a receita de intermediação",
                      ].map((p, i) => <CheckItem key={i} text={p} color={AMBER} />)}
                    </div>
                  </GCard>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* Potencial de crescimento */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Potencial de Crescimento" color={AMBER} icon={<TrendingUp size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Escalabilidade e Impacto Financeiro
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { scenario: "1.000 assinantes PRO", mrr: "R$ 19.900", color: PURPLE },
                { scenario: "1.000 assinantes PREMIUM", mrr: "R$ 49.900", color: GC },
                { scenario: "1.000 assinantes ELITE", mrr: "R$ 99.900", color: GA },
                { scenario: "Mix de 10.000 assinantes", mrr: "R$ 350.000+", color: AMBER },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 sm:p-5 text-center" accent={item.color} bgVariant="default">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 leading-snug">{item.scenario}</p>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(16px,2vw,22px)", color: item.color }}>{item.mrr}</p>
                    <p className="text-[10px] text-slate-400">MRR estimado</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <GCard className="p-5 sm:p-7" accent={GA} bgVariant="default">
                <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Papel no Ecossistema extraGO</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "A Camada 3 complementa a Camada 1, criando receita além das taxas por transação",
                    "Profissionais com planos pagos tendem a ser mais ativos e comprometidos",
                    "O modelo freemium garante acessibilidade sem sacrificar monetização",
                    "Assinantes geram dados mais ricos e completos para o algoritmo da plataforma",
                    "A base de assinantes é um ativo de alta fidelização e baixo custo de manutenção",
                    "A receita de assinatura sustenta a infraestrutura independentemente do volume de transações",
                  ].map((point, i) => (
                    <CheckItem key={i} text={point} color={GA} />
                  ))}
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>

        <div className="h-12" />
      </main>
    </div>
  );
}
