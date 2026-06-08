import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, TrendingUp, Users, Building2, Target, Layers, Shield, Zap, BarChart3, Network, Star } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const ROSE = "#e11d48";

const PHASES = [
  {
    phase: "Fase 1",
    region: "Rio Grande do Sul",
    color: GA,
    icon: <MapPin size={16} />,
    desc: "Lançamento e validação do modelo operacional completo da extraGO. Primeira região com cobertura total de representante estadual e equipe regional.",
    goals: ["Validar o modelo de matchmaking", "Consolidar primeiras empresas parceiras", "Construir reputação inicial da plataforma", "Treinar e estabelecer o primeiro Representante Estadual"],
  },
  {
    phase: "Fase 2",
    region: "Região Sul",
    color: GC,
    icon: <Globe size={16} />,
    desc: "Expansão para Santa Catarina e Paraná com replicação do modelo validado no RS. Foco em empresas industriais e de varejo.",
    goals: ["Expandir para os três estados da Região Sul", "Estabelecer representantes em SC e PR", "Construir base de profissionais regional", "Criar cases de sucesso replicáveis"],
  },
  {
    phase: "Fase 3",
    region: "Sudeste",
    color: PURPLE,
    icon: <TrendingUp size={16} />,
    desc: "Entrada nos maiores mercados do Brasil: São Paulo, Rio de Janeiro, Minas Gerais e Espírito Santo. Foco em escala e volume.",
    goals: ["Escalar para o maior mercado de trabalho do Brasil", "Atingir primeiros 100.000 usuários ativos", "Estabelecer representantes em SP, RJ, MG e ES", "Lançar planos Enterprise para grandes corporações"],
  },
  {
    phase: "Fase 4",
    region: "Capitais Estratégicas",
    color: AMBER,
    icon: <Star size={16} />,
    desc: "Presença nas principais capitais do Norte, Nordeste e Centro-Oeste com foco em setores com alta demanda de mão de obra temporária.",
    goals: ["Cobertura das capitais de maior PIB regional", "Parcerias com setores agroindustrial e turístico", "Estabelecer presença no agronegócio", "Adaptar modelo para especificidades regionais"],
  },
  {
    phase: "Fase 5",
    region: "Cobertura Nacional",
    color: ROSE,
    icon: <Globe size={16} />,
    desc: "Presença em todos os 27 estados brasileiros com Representante Estadual ativo e equipe regional estruturada. Objetivo final de infraestrutura nacional.",
    goals: ["27 representantes estaduais ativos", "Cobertura de todos os estados e DF", "Infraestrutura de mão de obra nacional completa", "Lançamento de produtos financeiros para o ecossistema"],
    final: true,
  },
];

export default function ExpansionModelPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#f0fdf4", color: "#0f172a" }}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Modelo de Expansão Nacional"
          pillColor={GC}
          pillIcon={<Globe size={10} />}
          title="A estratégia de"
          titleAccent="expansão nacional da extraGO."
          subtitle="A extraGO expande de forma estruturada e progressiva, do Rio Grande do Sul à cobertura nacional em 5 fases. Cada fase valida e replica o modelo operacional anterior, garantindo crescimento sustentável e impacto real em cada região."
        />

        <Divider />

        {/* Fases de expansão */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Fases de Expansão" color={GC} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Roadmap Nacional em 5 Fases
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl">
                Cada fase é construída sobre os aprendizados da anterior, com modelo, processos e representantes validados
                antes de avançar para a próxima região.
              </p>
            </Reveal>

            <div className="space-y-4 mb-8">
              {PHASES.map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 sm:p-6" accent={item.color} glow={item.final}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex items-center gap-3 sm:w-52 sm:flex-shrink-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `${item.color}14`, border: `2px solid ${item.color}40` }}>
                          <span style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-[9px] font-black tracking-widest uppercase mb-0.5" style={{ color: item.color }}>{item.phase}</p>
                          <p className="font-black text-[15px] text-slate-800 leading-tight">{item.region}</p>
                          {item.final && (
                            <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                              style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}25` }}>
                              OBJETIVO FINAL
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{item.desc}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {item.goals.map((g, j) => (
                            <CheckItem key={j} text={g} color={item.color} />
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

        {/* Como funciona */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Como funciona" color={PURPLE} icon={<Zap size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O Modelo de Expansão Descentralizada
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-6">
                A expansão é conduzida por Representantes Estaduais — profissionais locais que conhecem profundamente
                o mercado de trabalho de sua região e são reconhecidos oficialmente pela extraGO.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {[
                {
                  color: GA, icon: <MapPin size={18} />, title: "Representante Estadual",
                  desc: "Cada estado possui um único Representante Estadual oficial. Ele conduz o crescimento regional, desenvolve parcerias com empresas e expande a comunidade local de profissionais.",
                },
                {
                  color: GC, icon: <Users size={18} />, title: "Equipe Regional de até 4 pessoas",
                  desc: "O Representante pode contar com até quatro colaboradores: Comercial & Parcerias, Marketing Regional, Expansão & Comunidade, Operações & Pessoas.",
                },
                {
                  color: AMBER, icon: <BarChart3 size={18} />, title: "Fundo Nacional de Representantes",
                  desc: "5% da receita operacional é distribuído com base em performance regional: empresas ativas, profissionais ativos, extras concluídos, crescimento e metas atingidas.",
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.09}>
                  <GCard className="p-5 h-full" accent={item.color}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}22` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-[14px] mb-2">{item.title}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Impacto e escalabilidade */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Escalabilidade e Impacto" color={AMBER} icon={<TrendingUp size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Potencial de Crescimento Nacional
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { value: "27", label: "Estados com representação oficial", color: GA },
                { value: "108", label: "Colaboradores regionais possíveis (máx.)", color: GC },
                { value: "5%", label: "Da receita no Fundo Nacional de Representantes", color: AMBER },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 text-center" accent={m.color} glow>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(28px,4vw,48px)", color: m.color }}>{m.value}</p>
                    <p className="text-[12px] text-slate-500 leading-snug">{m.label}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Reveal>
                <GCard className="p-5 sm:p-7 h-full" accent={GA}>
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Benefícios para Investidores</p>
                  <div className="space-y-2">
                    {[
                      "Expansão descentralizada reduz o custo de entrada em novos mercados",
                      "Representantes atuam como força de vendas local sem custo de CLT",
                      "O modelo é replicável em qualquer estado com custo marginal decrescente",
                      "Cada novo estado incorporado aumenta o TAM (Total Addressable Market)",
                      "Dados geográficos proprietários criam vantagem competitiva sustentável",
                    ].map((p, i) => <CheckItem key={i} text={p} color={GA} />)}
                  </div>
                </GCard>
              </Reveal>

              <Reveal delay={0.1}>
                <GCard className="p-5 sm:p-7 h-full" accent={GC}>
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Visão de Longo Prazo</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
                    Assim como o Uber transformou o transporte, o Airbnb transformou a hospedagem e o LinkedIn transformou
                    o networking profissional, a extraGO busca transformar a contratação de mão de obra sob demanda no Brasil.
                  </p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Nosso objetivo não é apenas criar uma plataforma. Nosso objetivo é construir a
                    <strong className="text-green-700"> infraestrutura nacional que conecta empresas, profissionais, oportunidades e crescimento econômico</strong> em um único ecossistema.
                  </p>
                </GCard>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* Papel no ecossistema */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-5">
              <Pill label="Papel no Ecossistema" color={GA} icon={<Globe size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O Modelo de Expansão conecta todas as camadas
              </h2>
            </Reveal>
            <Reveal>
              <GCard className="p-5 sm:p-7" accent={GA}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Cada novo estado aumenta o volume de transações da Camada 1",
                    "Representantes ativam o programa de indicações da Camada 2 regionalmente",
                    "A expansão cria demanda por assinaturas empresariais da Camada 4",
                    "O crescimento regional alimenta o Fundo Nacional de Representantes",
                    "Dados regionais melhoram o algoritmo de matching da plataforma",
                    "A cobertura nacional transforma a extraGO na infraestrutura de mão de obra do Brasil",
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
