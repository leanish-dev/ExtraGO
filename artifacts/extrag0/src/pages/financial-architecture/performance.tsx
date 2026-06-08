import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle, TrendingUp, Users, Building2, Globe, BarChart3, Shield, Award, Target, Star, Layers } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const SLATE = "#64748b";

const LEVELS = [
  {
    level: "Iniciante", fee: "20%", color: SLATE,
    reqs: [],
    entry: true,
    desc: "Destinado a novos usuários da plataforma. Nível de entrada — sem requisitos prévios.",
  },
  {
    level: "Júnior", fee: "18%", color: GC,
    reqs: ["20 extras concluídos", "Avaliação mínima de 4,5"],
    entry: false,
    desc: "Profissional que demonstra comprometimento inicial com a plataforma.",
  },
  {
    level: "Intermediário", fee: "15%", color: PURPLE,
    reqs: ["100 extras concluídos", "6 meses de atividade", "Avaliação mínima de 4,7"],
    entry: false,
    desc: "Profissional consolidado, com histórico comprovado e avaliação elevada.",
  },
  {
    level: "Sênior", fee: "12%", color: AMBER,
    reqs: ["300 extras concluídos", "12 meses de atividade", "Avaliação mínima de 4,8", "Comparecimento superior a 98%"],
    entry: false,
    desc: "Profissional experiente com excelência em pontualidade e avaliação.",
  },
  {
    level: "Elite", fee: "10%", color: GA,
    reqs: ["1.000 extras concluídos", "24 meses de atividade", "Avaliação mínima de 4,9", "Comparecimento superior a 99%", "Perfil totalmente validado"],
    entry: false,
    desc: "O mais alto nível da plataforma. Máximo reconhecimento e menor taxa de intermediação.",
    top: true,
  },
];

export default function PerformancePage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#f0fdf4", color: "#0f172a" }}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Camada 1 — Intermediação por Performance"
          pillColor={GA}
          pillIcon={<Zap size={10} />}
          title="Como funciona a"
          titleAccent="Intermediação por Performance."
          subtitle="A extraGO opera por meio de um modelo de progressão profissional. Quanto maior o comprometimento e a reputação do profissional, menor será sua taxa de intermediação — beneficiando diretamente quem se dedica e entrega resultados."
        />

        <Divider />

        {/* Como funciona */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Como funciona" color={GA} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Estrutura Operacional dos Níveis
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl">
                A cada extra concluído com sucesso, o profissional acumula histórico, avaliações e pontuação.
                Ao atingir os requisitos de cada nível, a taxa de intermediação é automaticamente reduzida pela plataforma.
              </p>
            </Reveal>

            <div className="space-y-3 mb-8">
              {LEVELS.map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-5 sm:p-6" accent={item.color} glow={item.top}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="sm:w-44 flex-shrink-0">
                        <p className="text-[10px] font-black tracking-widest uppercase mb-0.5" style={{ color: item.color }}>{item.level}</p>
                        <p className="font-black leading-none" style={{ fontSize: "clamp(32px,4vw,46px)", color: item.color }}>{item.fee}</p>
                        {item.top && (
                          <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}25` }}>
                            NÍVEL MÁXIMO
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-slate-600 mb-3 leading-relaxed">{item.desc}</p>
                        {item.reqs.length > 0 ? (
                          <>
                            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Requisitos</p>
                            <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                              {item.reqs.map((r, j) => (
                                <div key={j} className="flex items-center gap-1.5">
                                  <CheckCircle size={11} style={{ color: item.color, flexShrink: 0 }} />
                                  <span className="text-[12px] text-slate-600">{r}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-[12px] text-slate-400 italic">Nível de entrada — sem requisitos prévios. Disponível imediatamente ao criar a conta.</p>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="hidden sm:flex flex-col justify-center w-24">
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.07)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${100 - i * 20}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 + 0.3, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                            className="h-full rounded-full"
                            style={{ background: item.color }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 text-center">{item.fee} taxa</p>
                      </div>
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Benefícios da progressão */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Benefícios da Progressão" color={GC} icon={<Award size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Por que evoluir de nível importa
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl">
                A progressão não é apenas financeira — ela impacta visibilidade, reconhecimento e acesso a oportunidades exclusivas.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <TrendingUp size={18} />, color: GA, title: "Menores Taxas", desc: "De 20% no início até 10% para profissionais Elite — cada nível representa mais dinheiro no bolso do profissional ao final de cada extra." },
                { icon: <Star size={18} />, color: GC, title: "Maior Visibilidade", desc: "Profissionais de níveis mais altos têm prioridade nas buscas das empresas, aumentando significativamente as chances de contratação." },
                { icon: <Award size={18} />, color: PURPLE, title: "Reconhecimento Profissional", desc: "Cada nível carrega um selo visual no perfil, sinalizando para as empresas o grau de confiabilidade e experiência do profissional." },
                { icon: <Target size={18} />, color: AMBER, title: "Mais Oportunidades", desc: "Empresas buscam ativamente profissionais de nível avançado para extras de maior valor e maior frequência." },
                { icon: <Shield size={18} />, color: GA, title: "Benefícios Exclusivos", desc: "Acesso a extras exclusivos, notificações prioritárias, ferramentas avançadas e programas especiais da plataforma." },
                { icon: <BarChart3 size={18} />, color: GC, title: "Fortalecimento da Reputação", desc: "O histórico acumulado, avaliações e nível constroem uma reputação digital duradoura e verificável dentro do ecossistema extraGO." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
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

        {/* Objetivo estratégico */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Objetivo Estratégico" color={PURPLE} icon={<Target size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Impacto para Usuários, Empresas e Investidores
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-5 mb-8">
              {[
                {
                  role: "Para Profissionais", color: GA, icon: <Users size={18} />,
                  points: [
                    "Renda crescente com menor taxa ao longo do tempo",
                    "Reconhecimento formal da trajetória profissional",
                    "Acesso a extras de maior valor com a progressão",
                    "Motivação contínua para manter qualidade e pontualidade",
                    "Construção de reputação digital verificável",
                  ],
                },
                {
                  role: "Para Empresas", color: GC, icon: <Building2 size={18} />,
                  points: [
                    "Acesso rápido a profissionais verificados e ranqueados",
                    "Redução de risco operacional ao contratar níveis elevados",
                    "Histórico transparente de avaliações e comparecimento",
                    "Maior previsibilidade na qualidade do serviço contratado",
                    "Base crescente de profissionais qualificados disponíveis",
                  ],
                },
                {
                  role: "Para Investidores", color: AMBER, icon: <Globe size={18} />,
                  points: [
                    "Modelo de retenção orgânica: profissionais evoluem e ficam",
                    "Receita crescente com base de profissionais mais experientes",
                    "Diferencial competitivo claro frente a modelos tradicionais",
                    "Dados proprietários de performance e reputação profissional",
                    "Plataforma com efeito de rede e altos custos de saída",
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

        {/* Exemplos práticos */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Exemplos Práticos" color={AMBER} icon={<BarChart3 size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Impacto Financeiro Real por Nível
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl">
                Considerando um profissional que realiza um extra de R$ 200,00, veja o impacto real da progressão de nível:
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-5 gap-3 mb-8">
              {[
                { level: "Iniciante", fee: 20, net: 160, color: SLATE },
                { level: "Júnior", fee: 18, net: 164, color: GC },
                { level: "Intermediário", fee: 15, net: 170, color: PURPLE },
                { level: "Sênior", fee: 12, net: 176, color: AMBER },
                { level: "Elite", fee: 10, net: 180, color: GA },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 text-center" accent={item.color} glow={i === 4}>
                    <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.level}</p>
                    <p className="font-black text-[11px] text-slate-400 mb-1">Taxa: {item.fee}%</p>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(18px,2.5vw,26px)", color: item.color }}>R$ {item.net}</p>
                    <p className="text-[10px] text-slate-400">recebido (extra R$200)</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <GCard className="p-5 sm:p-7" accent={GA}>
                <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Potencial de Crescimento — Escalabilidade</p>
                <p className="text-slate-700 text-[14px] leading-relaxed mb-3">
                  Um profissional Elite que realiza <strong>50 extras por mês</strong> com valor médio de R$ 200,00 recebe <strong>R$ 1.000,00 a mais por mês</strong> do
                  que um profissional Iniciante com o mesmo volume, apenas pela diferença de taxa (20% → 10%).
                </p>
                <p className="text-slate-600 text-[13px] leading-relaxed">
                  Ao longo de 12 meses, isso representa <strong className="text-green-700">R$ 12.000,00 a mais de renda líquida</strong> — sem aumentar o volume de trabalho,
                  apenas por construir reputação e atingir o nível Elite.
                </p>
              </GCard>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* Papel dentro do ecossistema */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-5">
              <Pill label="Papel no Ecossistema" color={GA} icon={<Globe size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Governança e Revisão das Regras
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-3xl">
                A extraGO pode revisar, atualizar ou ajustar os critérios de progressão, taxas e benefícios a qualquer momento,
                sempre buscando a sustentabilidade da plataforma e a proteção do ecossistema.
                As atualizações serão comunicadas com antecedência e visam sempre o equilíbrio entre profissionais, empresas e a plataforma.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <GCard className="p-5 sm:p-7" accent={GC}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "A Camada 1 é a espinha dorsal da monetização direta da plataforma",
                    "Incentiva retenção de longo prazo dos melhores profissionais",
                    "Cria dados proprietários de reputação com valor estratégico",
                    "Alimenta o algoritmo de recomendação com sinais de qualidade",
                    "Garante receita recorrente por transação, independente de assinatura",
                    "Diferencia a extraGO de plataformas com taxa fixa",
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
