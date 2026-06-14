import React, { useEffect } from "react";
import estruturaCapitalImg from "@assets/Estrutura-de-capital-section_1781247644390.png";
import distribuicaoReceitaCardImg from "@assets/Distribuição-da-Receita-card-arqfin_1781330533244.png";
import { motion } from "framer-motion";
import { DollarSign, Shield, TrendingUp, Cpu, BarChart3, MapPin, Globe, Users, Target, Layers, Building2 } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const ROSE = "#e11d48";
const CYAN = "#0891b2";
const ORANGE = "#ea580c";

const DISTRIBUTION = [
  {
    pct: 25,
    label: "Caixa e Reserva Estratégica",
    color: GA,
    icon: <Shield size={18} />,
    desc: "Garantia de liquidez, segurança financeira e sustentabilidade.",
    detail: "A maior fatia da receita é destinada ao caixa operacional e à reserva estratégica. Isso garante que a plataforma mantenha capacidade de operar mesmo em períodos de baixa demanda, financiar crescimento acelerado sem depender de capital externo e proteger o ecossistema de choques externos.",
  },
  {
    pct: 20,
    label: "Fundadores e Investidores",
    color: AMBER,
    icon: <DollarSign size={18} />,
    desc: "Participação nos resultados e crescimento do ecossistema.",
    detail: "Retorno direto e proporcional ao crescimento da plataforma. A distribuição para fundadores e investidores é alinhada ao crescimento real da receita operacional, garantindo que os interesses de quem constrói e de quem investe estejam sempre sincronizados.",
  },
  {
    pct: 20,
    label: "Marketing e Expansão",
    color: GC,
    icon: <TrendingUp size={18} />,
    desc: "Aquisição de usuários e crescimento nacional.",
    detail: "Combustível para crescimento nacional: aquisição de profissionais e empresas, campanhas de marketing digital, presença regional e suporte às iniciativas dos Representantes Estaduais. A estratégia de marketing é orientada por dados proprietários da plataforma.",
  },
  {
    pct: 10,
    label: "Tecnologia e Inovação",
    color: PURPLE,
    icon: <Cpu size={18} />,
    desc: "Infraestrutura, desenvolvimento e inteligência artificial.",
    detail: "Investimento contínuo em infraestrutura técnica, desenvolvimento de novas funcionalidades, segurança, escalabilidade e pesquisa em inteligência artificial aplicada ao matching de profissionais e empresas. A tecnologia é o diferencial competitivo central da extraGO.",
  },
  {
    pct: 10,
    label: "Operações",
    color: CYAN,
    icon: <BarChart3 size={18} />,
    desc: "Atendimento, suporte, jurídico e gestão.",
    detail: "Estrutura operacional que garante a qualidade da experiência de usuários e empresas: equipe de suporte, jurídico, compliance, relações com representantes estaduais e gestão executiva da plataforma.",
  },
  {
    pct: 10,
    label: "Fundo de Crescimento Estratégico",
    color: ROSE,
    icon: <Target size={18} />,
    desc: "Expansão, novos produtos e oportunidades.",
    detail: "Reserva estratégica dedicada a oportunidades de crescimento não planejadas: aquisições, novos produtos, expansão internacional futura, parcerias estratégicas de grande escala e iniciativas de impacto social.",
  },
  {
    pct: 5,
    label: "Representantes Estaduais",
    color: ORANGE,
    icon: <MapPin size={18} />,
    desc: "Desenvolvimento da rede regional.",
    detail: "5% da receita operacional forma o Fundo Nacional de Representantes, distribuído com base em empresas ativas, profissionais ativos, extras concluídos, crescimento regional e metas atingidas. Incentiva a expansão descentralizada por todo o território brasileiro.",
  },
];

export default function RevenueStructurePage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "linear-gradient(160deg,#eff6ff 0%,#f0f9ff 50%,#f0fdf4 100%)", color: "#0f172a", "--gcard-bg": "rgba(218,232,255,0.92)" } as React.CSSProperties}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Estrutura Financeira da Receita Operacional"
          pillColor={GA}
          pillIcon={<DollarSign size={10} />}
          title="Como a extraGO distribui"
          titleAccent="cada real gerado."
          subtitle="A receita operacional da extraGO é distribuída estrategicamente entre sete destinos, garantindo sustentabilidade, crescimento nacional, retorno para investidores e desenvolvimento da rede de representantes estaduais."
        />

        <Divider />

        {/* Distribuição visual */}
        <section className="py-10 sm:py-16">
          <div className="px-5 sm:px-10 max-w-6xl mx-auto mb-6">
            <Reveal>
              <Pill label="Distribuição da Receita" color={GA} icon={<BarChart3 size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Estrutura Operacional Financeira
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-2">
                Total: 100% da receita operacional. Cada percentual é revisto periodicamente pela governança da plataforma
                para manter equilíbrio entre crescimento, sustentabilidade e retorno.
              </p>
            </Reveal>
          </div>
          <Reveal className="mb-8">
            <img
              src={distribuicaoReceitaCardImg}
              alt="Distribuição da Receita — Alocação da Receita Operacional"
              className="w-full h-auto block"
              style={{ display: "block", objectFit: "contain", width: "100%" }}
            />
          </Reveal>
        </section>

        {/* Estrutura de Capital — 30% Investidores */}
        <section className="pt-0 pb-4 sm:pb-8">
          <Reveal>
            <img
              src={estruturaCapitalImg}
              alt="30% Reservado para Investidores Estratégicos — Estrutura de Capital extraGO"
              className="w-full h-auto block"
              style={{ display: "block" }}
            />
          </Reveal>
        </section>

        <Divider />

        {/* Detalhamento por destino */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Detalhamento por Destino" color={GC} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O que cada destinação representa
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              {DISTRIBUTION.map((item, i) => (
                <Reveal key={i} delay={(i % 2) * 0.1}>
                  <GCard className="p-5 h-full" accent={item.color}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}12`, border: `1px solid ${item.color}22` }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div>
                        <span className="font-black text-[22px] leading-none mr-2" style={{ color: item.color }}>{item.pct}%</span>
                        <span className="font-bold text-slate-700 text-[13px]">{item.label}</span>
                      </div>
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-slate-600 leading-relaxed">{item.detail}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Impacto para stakeholders */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Impacto por Público" color={AMBER} icon={<Target size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O que esta estrutura significa para cada público
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {[
                {
                  role: "Para Profissionais", color: GA, icon: <Users size={18} />,
                  points: [
                    "25% em caixa garante pagamentos pontuais e sem atrasos",
                    "10% em tecnologia resulta em plataforma mais rápida e estável",
                    "20% em marketing aumenta o volume de empresas e extras disponíveis",
                    "5% em representantes fortalece a comunidade regional",
                  ],
                },
                {
                  role: "Para Empresas", color: GC, icon: <Building2 size={18} />,
                  points: [
                    "10% em operações garante suporte de qualidade contínuo",
                    "10% em tecnologia traz integrações e ferramentas mais poderosas",
                    "20% em expansão aumenta o banco de profissionais disponíveis",
                    "25% em caixa garante solidez e continuidade da plataforma",
                  ],
                },
                {
                  role: "Para Investidores", color: AMBER, icon: <Globe size={18} />,
                  points: [
                    "20% de retorno direto alinhado ao crescimento da receita",
                    "Distribuição clara e auditável protege interesses dos investidores",
                    "10% em crescimento estratégico abre portas para novas verticais",
                    "Governança revisável garante adaptação a diferentes cenários",
                  ],
                },
              ].map((col, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <GCard className="p-5 sm:p-6 h-full" accent={col.color} bgVariant="default">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${col.color}12`, border: `1px solid ${col.color}22` }}>
                        <span style={{ color: col.color }}>{col.icon}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-[14px]">{col.role}</p>
                    </div>
                    <div className="space-y-2.5">
                      {col.points.map((p, j) => (
                        <CheckItem key={j} text={p} color={col.color} />
                      ))}
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Governança */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-5">
              <Pill label="Governança" color={PURPLE} icon={<Shield size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Revisão e Ajuste da Distribuição
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl">
                A extraGO poderá revisar, atualizar ou ajustar os percentuais de distribuição da receita operacional a qualquer momento,
                sempre buscando a sustentabilidade da plataforma e a proteção de todo o ecossistema.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <GCard className="p-5 sm:p-7" accent={GA}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "A estrutura pode ser ajustada em resposta ao crescimento acelerado",
                    "Revisões priorizarão sempre a sustentabilidade do ecossistema",
                    "Investidores recebem comunicação antecipada sobre mudanças relevantes",
                    "Aumentos no caixa protegem operações em cenários adversos",
                    "O fundo de crescimento estratégico pode ser ativado em oportunidades",
                    "A estrutura é auditável e transparente para todos os stakeholders",
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
