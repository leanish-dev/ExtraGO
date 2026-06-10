import React, { useEffect } from "react";
import { MapPin, Users, TrendingUp, Globe, Building2, Target, Layers, Shield, BarChart3, Award, Zap, Star, Network } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const ROSE = "#e11d48";

const TEAM_ROLES = [
  {
    role: "Comercial e Parcerias",
    color: AMBER,
    icon: <Building2 size={16} />,
    desc: "Responsável pela captação de empresas parceiras na região. Prospecta negócios locais, apresenta a extraGO e fecha acordos de parceria comercial com estabelecimentos, redes e grupos empresariais.",
  },
  {
    role: "Marketing Regional",
    color: GC,
    icon: <Star size={16} />,
    desc: "Fortalece a presença da marca extraGO na região. Produz conteúdo local, gerencia redes sociais regionais, articula eventos e ações de presença da marca nos principais centros urbanos do estado.",
  },
  {
    role: "Expansão e Comunidade",
    color: PURPLE,
    icon: <Network size={16} />,
    desc: "Responsável pelo crescimento da rede de profissionais. Recruta, engaja e acompanha profissionais da região, organizando meetups, treinamentos e iniciativas comunitárias para fortalecer o ecossistema local.",
  },
  {
    role: "Operações e Pessoas",
    color: GA,
    icon: <Users size={16} />,
    desc: "Garante a qualidade operacional da região. Responsável por suporte a profissionais e empresas locais, treinamentos, onboarding de novos usuários e acompanhamento de indicadores operacionais estaduais.",
  },
];

export default function StateRepresentativesPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#f0fdf4", color: "#0f172a" }}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Rede de Representantes Estaduais"
          pillColor={AMBER}
          pillIcon={<MapPin size={10} />}
          title="Como funciona a Rede de"
          titleAccent="Representantes Estaduais."
          subtitle="A expansão nacional da extraGO é conduzida por representantes oficiais. Cada estado poderá possuir apenas um Representante Estadual ativo, responsável pelo crescimento regional, desenvolvimento de empresas parceiras e expansão da comunidade local."
        />

        <Divider />

        {/* Estrutura */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Estrutura Operacional" color={AMBER} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O Representante Estadual e sua Equipe
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-6">
                Cada Representante Estadual é um empreendedor local oficialmente reconhecido pela extraGO.
                Ele pode estruturar uma equipe de até quatro colaboradores, cada um com uma função estratégica específica.
              </p>
            </Reveal>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "1", label: "Representante Estadual por Estado", color: AMBER },
                { value: "27", label: "Estados Brasileiros + DF", color: GA },
                { value: "4", label: "Colaboradores Máximos por Estado", color: GC },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-4 sm:p-6 text-center" accent={m.color} glow>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(26px,3.5vw,44px)", color: m.color }}>{m.value}</p>
                    <p className="text-[11px] sm:text-[12px] text-slate-500 leading-snug">{m.label}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            {/* Equipe regional */}
            <Reveal className="mb-8">
              <h3 className="font-bold text-slate-700 text-[16px] mb-4">Estrutura da Equipe Regional</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {TEAM_ROLES.map((role, i) => (
                  <GCard key={i} className="p-5" accent={role.color}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${role.color}12`, border: `1px solid ${role.color}22` }}>
                        <span style={{ color: role.color }}>{role.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[13px] mb-1.5">{role.role}</p>
                        <p className="text-[12px] text-slate-500 leading-relaxed">{role.desc}</p>
                      </div>
                    </div>
                  </GCard>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Brazil Network Visual ── */}
        <div className="relative overflow-hidden py-3" aria-hidden="true" style={{ background: "linear-gradient(90deg,rgba(217,119,6,0.025) 0%,rgba(22,163,74,0.025) 100%)" }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-10">
            <svg viewBox="0 0 900 110" className="w-full" style={{ height: "clamp(65px,10vw,110px)", display: "block" }}>
              <defs>
                <linearGradient id="repEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f0fdf4" stopOpacity="1" />
                  <stop offset="7%" stopColor="#f0fdf4" stopOpacity="0" />
                  <stop offset="93%" stopColor="#f0fdf4" stopOpacity="0" />
                  <stop offset="100%" stopColor="#f0fdf4" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Center hub — platform */}
              <circle cx={450} cy={55} r={16} fill="rgba(22,163,74,0.10)" stroke="#16a34a" strokeWidth="1.2" />
              <circle cx={450} cy={55} r={24} fill="none" stroke="rgba(22,163,74,0.15)" strokeWidth="0.6" strokeDasharray="3 5" />
              <text x={450} y={59} textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="900">27 UF</text>
              {/* State nodes — spaced around center in two arcs */}
              {[
                {x:110,y:28,c:AMBER,l:"SP"},{x:195,y:18,c:GC,l:"RJ"},{x:280,y:32,c:AMBER,l:"MG"},
                {x:355,y:20,c:GC,l:"RS"},{x:370,y:85,c:AMBER,l:"PR"},{x:285,y:88,c:GC,l:"SC"},
                {x:550,y:20,c:AMBER,l:"BA"},{x:625,y:32,c:GC,l:"PE"},{x:700,y:18,c:AMBER,l:"CE"},
                {x:780,y:28,c:GC,l:"PA"},{x:540,y:88,c:AMBER,l:"GO"},{x:620,y:90,c:GC,l:"MA"},
              ].map((n, i) => (
                <g key={i}>
                  <line x1={n.x} y1={n.y} x2={450} y2={55} stroke="rgba(22,163,74,0.20)" strokeWidth="0.6" />
                  <circle cx={n.x} cy={n.y} r={7} fill={`${n.c}14`} stroke={n.c} strokeWidth="0.8" />
                  <text x={n.x} y={n.y+3} textAnchor="middle" fill={n.c} fontSize="6" fontWeight="800">{n.l}</text>
                </g>
              ))}
              <text x={450} y={102} textAnchor="middle" fill="rgba(100,116,139,0.50)" fontSize="7.5" fontWeight="600">rede de representantes estaduais — 1 por estado · expansão nacional</text>
              <rect x="0" y="0" width="900" height="110" fill="url(#repEdge)" />
            </svg>
          </div>
        </div>

        <Divider />

        {/* Responsabilidades */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Responsabilidades" color={GC} icon={<Target size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O que é responsabilidade do Representante Estadual
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Reveal>
                <GCard className="p-5 sm:p-7 h-full" accent={AMBER}>
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-4">Responsabilidades Oficiais</p>
                  <div className="space-y-3">
                    {[
                      { title: "Crescimento Regional", desc: "Aumentar o número de profissionais e empresas ativas no estado, com metas periódicas definidas pela plataforma." },
                      { title: "Desenvolvimento de Empresas Parceiras", desc: "Prospectar, apresentar e integrar empresas locais à extraGO, garantindo um pipeline ativo de oportunidades para profissionais." },
                      { title: "Expansão da Comunidade Local", desc: "Organizar eventos, meetups e iniciativas que fortaleçam a comunidade de profissionais da extraGO na região." },
                      { title: "Divulgação da Marca", desc: "Representar oficialmente a extraGO na região, em eventos, mídias locais e iniciativas de posicionamento de marca." },
                      { title: "Relacionamento Institucional", desc: "Desenvolver relacionamentos com entidades representativas, sindicatos, prefeituras e instituições de ensino relevantes para o ecossistema." },
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
                  <GCard className="p-5 sm:p-6" accent={GA}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Benefícios do Representante</p>
                    <div className="space-y-2">
                      {[
                        "Perfil verificado com brasão de Representante Estadual",
                        "Destaque oficial no perfil da plataforma",
                        "Participação no Fundo Nacional de Representantes",
                        "Painel regional com dados exclusivos do estado",
                        "Participação estratégica nas decisões da plataforma",
                        "Reconhecimento como liderança regional oficial",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GA} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={GC}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Critérios de Seleção</p>
                    <p className="text-[12px] text-slate-600 leading-relaxed mb-2">
                      O processo de seleção de Representantes Estaduais considera:
                    </p>
                    <div className="space-y-1.5">
                      {[
                        "Conhecimento do mercado de trabalho local",
                        "Capacidade empreendedora e liderança comprovada",
                        "Rede de relacionamentos regional relevante",
                        "Alinhamento com os valores da extraGO",
                        "Aprovação formal pela plataforma",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GC} />)}
                    </div>
                  </GCard>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* Fundo Nacional */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Fundo Nacional de Representantes" color={GA} icon={<BarChart3 size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Como funciona a remuneração do Representante
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-6">
                <strong className="text-slate-700">5% da receita operacional da plataforma</strong> é destinado ao Fundo Nacional de Representantes.
                A distribuição entre os estados é baseada em múltiplos critérios de performance regional.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Reveal>
                <GCard className="p-5 sm:p-7" accent={GA} glow>
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-4">Critérios de Distribuição do Fundo</p>
                  <div className="space-y-3">
                    {[
                      { title: "Empresas Ativas", desc: "Quantidade de empresas com atividade recente na região, pesada pelo volume de extras publicados." },
                      { title: "Profissionais Ativos", desc: "Número de profissionais com extras realizados no período, considerando qualidade e avaliações." },
                      { title: "Extras Concluídos", desc: "Volume total de extras finalizados com sucesso no estado, diretamente ligado à receita operacional regional." },
                      { title: "Crescimento Regional", desc: "Taxa de crescimento mês a mês dos indicadores regionais, premiando estados em aceleração." },
                      { title: "Metas Atingidas", desc: "Cumprimento das metas periódicas definidas pela plataforma para cada Representante Estadual." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${GA}15`, border: `1px solid ${GA}30` }}>
                          <span className="text-[10px] font-black" style={{ color: GA }}>{i + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 text-[13px] mb-0.5">{item.title}</p>
                          <p className="text-[12px] text-slate-500 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GCard>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="space-y-4">
                  <GCard className="p-5 sm:p-6" accent={AMBER}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Potencial de Ganhos</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
                      Em uma plataforma com <strong>R$ 10.000.000,00/mês</strong> de receita operacional,
                      o Fundo Nacional de Representantes acumula <strong className="text-amber-600">R$ 500.000,00/mês</strong>.
                    </p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      Um Representante Estadual ativo com excelente performance pode receber um valor significativamente superior
                      à média de distribuição proporcional, dada a ponderação por crescimento e metas atingidas.
                    </p>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={PURPLE}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Escalabilidade do Fundo</p>
                    <div className="space-y-2">
                      {[
                        "O fundo cresce proporcionalmente à receita operacional",
                        "Representantes com melhor performance recebem fatia maior",
                        "O modelo cria competição saudável entre estados",
                        "Quanto mais a plataforma cresce, mais o Representante ganha",
                      ].map((p, i) => <CheckItem key={i} text={p} color={PURPLE} />)}
                    </div>
                  </GCard>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* Impacto para os públicos */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Impacto por Público" color={PURPLE} icon={<Target size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                O que a Rede de Representantes representa para cada público
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {[
                {
                  role: "Para Profissionais", color: GA, icon: <Users size={18} />,
                  points: [
                    "Suporte humano localizado no próprio estado",
                    "Representante como ponto de contato e apoio regional",
                    "Eventos e treinamentos organizados localmente",
                    "Comunidade regional ativa e engajada",
                    "Maior sensação de pertencimento ao ecossistema",
                  ],
                },
                {
                  role: "Para Empresas", color: GC, icon: <Building2 size={18} />,
                  points: [
                    "Interlocutor local para dúvidas e negociações",
                    "Onboarding presencial para empresas que precisam",
                    "Parcerias regionais com condições diferenciadas",
                    "Representante como gerente de relacionamento regional",
                    "Presença física em cidades fora dos grandes centros",
                  ],
                },
                {
                  role: "Para Investidores", color: AMBER, icon: <Globe size={18} />,
                  points: [
                    "Expansão com baixo CAPEX — Representantes são empreendedores autônomos",
                    "Modelo de crescimento descentralizado e auto-sustentável",
                    "27 times regionais motivados financeiramente pelo crescimento",
                    "Dados granulares por estado para tomada de decisão",
                    "Cobertura nacional sem custo de CLT proporcional",
                  ],
                },
              ].map((col, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <GCard className="p-5 sm:p-6 h-full" accent={col.color}>
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

        {/* Papel no ecossistema */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-5">
              <Pill label="Papel no Ecossistema" color={GA} icon={<Globe size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                A Rede de Representantes dentro da Arquitetura extraGO
              </h2>
            </Reveal>
            <Reveal>
              <GCard className="p-5 sm:p-7" accent={GA}>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Os Representantes são o braço operacional da expansão nacional",
                    "Naturalmente identificam os Embaixadores Regionais da Camada 2",
                    "Aumentam o volume de empresas ativas, alimentando a Camada 4",
                    "Criam comunidade que reduz churn de profissionais na plataforma",
                    "Geram inteligência local impossível de obter remotamente",
                    "São parte fundamental da visão de se tornar a infraestrutura nacional",
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
