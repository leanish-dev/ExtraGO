import React, { useEffect } from "react";
import { Building2, BarChart3, Shield, Globe, TrendingUp, Users, Layers, Target, Zap, CheckCircle } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";
import assEmpresariaisArqImg from "@assets/Assinaturas-Empresariais-arqfin_1781335479732.png";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const ROSE = "#e11d48";

export default function BusinessPlansPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const plans = [
    {
      tier: "Starter",
      price: "R$ 99,90",
      sub: "/mês",
      color: "#64748b",
      flagship: false,
      ideal: "Ideal para pequenas empresas.",
      desc: "Para empresas que estão começando a usar a extraGO ou têm demanda ocasional de profissionais.",
      features: [
        "Publicação de extras",
        "Painel básico de gestão",
        "Acesso ao banco de profissionais",
        "Suporte por email",
      ],
    },
    {
      tier: "Business",
      price: "R$ 299,90",
      sub: "/mês",
      color: AMBER,
      flagship: false,
      ideal: "Ideal para empresas com demanda recorrente.",
      desc: "Para empresas que utilizam a plataforma regularmente e precisam de ferramentas de gestão mais robustas.",
      features: [
        "Publicação ilimitada de extras",
        "Dashboard analítico completo",
        "Gestão de equipe e histórico",
        "Suporte prioritário",
      ],
    },
    {
      tier: "Corporate",
      price: "R$ 799,90",
      sub: "/mês",
      color: GC,
      flagship: true,
      ideal: "Ideal para operações maiores.",
      desc: "Para empresas de médio e grande porte com múltiplas operações e alto volume de contratação.",
      features: [
        "Multi-unidade e filiais",
        "API de integração com sistemas",
        "SLA de atendimento garantido",
        "Gerente de conta dedicado",
      ],
    },
    {
      tier: "Enterprise",
      price: "Sob consulta",
      sub: "",
      color: GA,
      flagship: false,
      ideal: "Soluções personalizadas para grandes organizações.",
      desc: "Contrato personalizado para grandes organizações com necessidades específicas de escala, compliance e integração.",
      features: [
        "Personalização total da plataforma",
        "Integração total com ERPs e HRs",
        "Compliance nacional e jurídico",
        "Equipe dedicada exclusiva",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "linear-gradient(160deg,#eff6ff 0%,#eef2ff 50%,#f0fdf4 100%)", color: "#0f172a", "--gcard-bg": "rgba(215,226,255,0.92)" } as React.CSSProperties}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Camada 4 — Assinaturas Empresariais"
          pillColor={AMBER}
          pillIcon={<Building2 size={10} />}
          title="Planos de Assinatura"
          titleAccent="para Empresas."
          subtitle="Quatro planos SaaS desenvolvidos para empresas de todos os portes que utilizam a extraGO para contratar profissionais sob demanda. Do Starter ao Enterprise, cada plano oferece ferramentas progressivamente mais sofisticadas de gestão, analytics e integração operacional."
        />

        <Divider />

        {/* Visual institucional */}
        <section className="py-2">
          <Reveal className="mb-4">
            <img
              src={assEmpresariaisArqImg}
              alt="Assinaturas Empresariais — Starter R$99,90/mês, Business R$299,90/mês, Corporate R$799,90/mês, Enterprise sob consulta"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        {/* Planos */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Estrutura dos Planos" color={AMBER} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Comparativo Completo dos Planos Empresariais
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {plans.map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 sm:p-6 h-full" accent={plan.color} glow={plan.flagship} bgVariant="default">
                    {plan.flagship && (
                      <span className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${plan.color}14`, border: `1px solid ${plan.color}28`, color: plan.color }}>
                        MAIS UTILIZADO
                      </span>
                    )}
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: plan.color }}>{plan.tier}</p>
                    <div className="flex items-baseline gap-1 mb-1">
                      <p className="font-black leading-none" style={{ fontSize: "clamp(18px,2.2vw,24px)", color: plan.color }}>{plan.price}</p>
                      {plan.sub && <span className="text-[11px] text-slate-400">{plan.sub}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 italic mb-3 leading-snug">{plan.ideal}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed mb-4">{plan.desc}</p>
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

        {/* ── Corporate Operations Visual ── */}
        <div className="relative overflow-hidden py-2" aria-hidden="true" style={{ background: "linear-gradient(90deg,rgba(217,119,6,0.025) 0%,rgba(59,130,246,0.025) 100%)" }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-10">
            <svg viewBox="0 0 900 90" className="w-full" style={{ height: "clamp(55px,8vw,90px)", display: "block" }}>
              <defs>
                <linearGradient id="bizFlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="33%" stopColor="#d97706" />
                  <stop offset="66%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="bizEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#eef2ff" stopOpacity="1" />
                  <stop offset="8%" stopColor="#eef2ff" stopOpacity="0" />
                  <stop offset="92%" stopColor="#eef2ff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#eef2ff" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path d="M 70 52 L 295 52 L 320 36 L 545 36 L 570 22 L 795 22 L 820 36 L 840 22"
                fill="none" stroke="url(#bizFlow)" strokeWidth="1.8" strokeLinecap="round" />
              {[
                {x:70, y:52, c:"#64748b", l:"STARTER",  s:"R$ 99,90"},
                {x:308,y:36, c:"#d97706", l:"BUSINESS", s:"R$ 299,90"},
                {x:558,y:22, c:"#3b82f6", l:"CORPORATE",s:"R$ 799,90"},
                {x:840,y:22, c:"#7c3aed", l:"ENTERPRISE",s:"Sob consulta"},
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r={i===3?7:5} fill={pt.c} />
                  <circle cx={pt.x} cy={pt.y} r={i===3?12:8} fill={pt.c} fillOpacity="0.11" />
                  <text x={pt.x} y={pt.y-11} textAnchor="middle" fill={pt.c} fontSize="7.5" fontWeight="800">{pt.l}</text>
                  <text x={pt.x} y={pt.y+20} textAnchor="middle" fill={pt.c} fontSize="7" opacity="0.60">{pt.s}</text>
                </g>
              ))}
              <text x={450} y={82} textAnchor="middle" fill="rgba(100,116,139,0.50)" fontSize="7.5" fontWeight="600">planos empresariais → escala de operação corporativa integrada</text>
              <rect x="0" y="0" width="900" height="90" fill="url(#bizEdge)" />
            </svg>
          </div>
        </div>

        <Divider />

        {/* Objetivo estratégico */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Objetivo Estratégico" color={PURPLE} icon={<Target size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Por que a Camada 4 é estratégica para a extraGO
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Reveal>
                <GCard className="p-5 sm:p-7 h-full" accent={AMBER} bgVariant="default">
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-4">Benefícios para Empresas</p>
                  <div className="space-y-3">
                    {[
                      { title: "Centralização Operacional", desc: "Todas as contratações, avaliações, pagamentos e histórico em uma única plataforma integrada." },
                      { title: "Relatórios Financeiros", desc: "Controle total de custos com mão de obra, tendências de contratação e projeções por período." },
                      { title: "Menos Burocracia", desc: "Contratos digitais, pagamentos automatizados e compliance operacional diretamente na plataforma." },
                      { title: "Acesso Rápido", desc: "Banco de profissionais qualificados e verificados disponível 24/7, com filtros avançados por habilidade e região." },
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
                  <GCard className="p-5 sm:p-6" accent={GC} bgVariant="default">
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Profissionais</p>
                    <div className="space-y-2">
                      {[
                        "Empresas com planos ativos tendem a contratar com maior frequência",
                        "Qualidade superior de briefing e clareza nos extras publicados",
                        "Maior seriedade e compromisso das empresas assinantes",
                        "Histórico de contratação transparente e verificável",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GC} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={GA} bgVariant="default">
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Investidores</p>
                    <div className="space-y-2">
                      {[
                        "ARR (Annual Recurring Revenue) de alto valor com planos Corporate e Enterprise",
                        "Churn baixo: empresas integradas têm alto custo de saída",
                        "Receita diversificada: profissionais + empresas = duas fontes SaaS",
                        "Enterprise é o gateway para contratos de larga escala nacionais",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GA} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={ROSE} bgVariant="default">
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Escalabilidade</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      Com 500 empresas no plano Business e 100 no Corporate, a extraGO gera
                      <strong className="text-rose-600"> R$ 229.840,00/mês</strong> apenas em assinaturas empresariais,
                      independentemente do volume de extras realizados no período.
                    </p>
                  </GCard>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* Casos de uso */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Casos de Uso" color={GC} icon={<Zap size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Exemplos Práticos por Segmento
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { sector: "Varejo e Retail", plan: "Business / Corporate", color: AMBER, example: "Redes de lojas que precisam de profissionais para reforço em datas sazonais (Black Friday, Natal) com gestão centralizada de todas as unidades." },
                { sector: "Eventos e Entretenimento", plan: "Starter / Business", color: GC, example: "Produtoras e casas de eventos que necessitam de equipes temporárias de segurança, produção e operações para eventos pontuais." },
                { sector: "Logística e Transporte", plan: "Business / Corporate", color: PURPLE, example: "Empresas de logística com picos de demanda que precisam de reforço de equipe em galpões, centros de distribuição e operações." },
                { sector: "Indústria e Manufatura", plan: "Corporate / Enterprise", color: GA, example: "Indústrias que precisam de profissionais qualificados para linhas de produção, manutenção e operações especializadas sob demanda." },
                { sector: "Hospitalidade e Gastronomia", plan: "Starter / Business", color: "#0891b2", example: "Hotéis, restaurantes e buffets que reforçam equipe em alta temporada sem manter quadro fixo desnecessário no período de baixa." },
                { sector: "Construção Civil", plan: "Business / Corporate", color: ROSE, example: "Construtoras e incorporadoras que precisam de mão de obra especializada para fases específicas de obras sem vínculo empregatício permanente." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 sm:p-5 h-full" accent={item.color} bgVariant="default">
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.sector}</p>
                    <p className="text-[11px] font-semibold text-slate-500 mb-3">Plano recomendado: {item.plan}</p>
                    <p className="text-[12px] text-slate-600 leading-relaxed">{item.example}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <GCard className="p-5 sm:p-7" accent={GA} bgVariant="default">
                <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Papel no Ecossistema extraGO</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Empresas assinantes publicam extras com maior qualidade e frequência",
                    "A Camada 4 alimenta diretamente a Camada 1 com volume de transações",
                    "Empresas Corporate/Enterprise impulsionam a demanda por profissionais Elite",
                    "O Enterprise é o canal de expansão para contratos públicos e institucionais",
                    "Dados de uso empresarial informam o desenvolvimento de novos produtos",
                    "A fidelização empresarial é o maior ativo de longo prazo da plataforma",
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
