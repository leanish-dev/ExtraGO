import React, { useEffect } from "react";
import indicacoesCardImg from "@assets/Indicações-Multinível-card-arqfin_1781330517245.png";
import { Network, Users, Crown, Target, TrendingUp, Globe, Building2, Shield, BarChart3, Layers, Award, Zap } from "lucide-react";
import {
  FABackground, FAHeader, FANavBar, GCard, Pill, Reveal, Divider,
  CheckItem, GA, GC, PageHero,
} from "./_shared";

const PURPLE = "#7c3aed";
const AMBER = "#d97706";
const ROSE = "#e11d48";

export default function ReferralsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "linear-gradient(160deg,#eff6ff 0%,#ecfeff 50%,#f0fdf4 100%)", color: "#0f172a", "--gcard-bg": "rgba(218,234,255,0.92)" } as React.CSSProperties}>
      <FABackground />
      <FANavBar />
      <div className="relative z-10"><FAHeader /></div>

      <main className="relative z-10 flex-1">
        <PageHero
          pill="Camada 2 — Programa de Indicações Multinível"
          pillColor={GC}
          pillIcon={<Network size={10} />}
          title="Como funciona o"
          titleAccent="Programa de Indicações Multinível."
          subtitle="Todos os usuários da extraGO recebem um código e link exclusivo de indicação. Quando um indicado realiza extras através da plataforma, o indicador recebe comissões recorrentes sobre o valor bruto das transações — criando uma rede de renda passiva."
        />

        <Divider />

        {/* Como funciona */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Como funciona" color={GC} icon={<Layers size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Estrutura Operacional do Programa
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-6">
                O programa de indicações funciona de forma automática. Ao se cadastrar, cada usuário recebe seu código e link exclusivos.
                Toda vez que um indicado realiza um extra pago na plataforma, o indicador recebe automaticamente sua comissão proporcional.
              </p>
            </Reveal>

            <Reveal className="mb-8">
              <div
                className="w-full rounded-2xl overflow-hidden p-1"
                style={{
                  boxShadow: "0 8px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,150,255,0.18), 0 0 32px rgba(0,150,255,0.08)",
                  border: "1px solid rgba(59,130,246,0.20)",
                  background: "rgba(240,249,255,0.6)",
                }}
              >
                <img
                  src={indicacoesCardImg}
                  alt="Camada 2 — Programa de Indicações Multinível"
                  className="w-full h-auto block rounded-xl"
                  style={{ display: "block", objectFit: "contain", maxWidth: "100%" }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Referral Network Visual ── */}
        <div className="relative overflow-hidden py-3" aria-hidden="true" style={{ background: "linear-gradient(90deg,rgba(59,130,246,0.025) 0%,rgba(22,163,74,0.025) 100%)" }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-10">
            <svg viewBox="0 0 900 120" className="w-full" style={{ height: "clamp(70px,11vw,120px)", display: "block" }}>
              <defs>
                <linearGradient id="netEdge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ecfeff" stopOpacity="1" />
                  <stop offset="8%" stopColor="#ecfeff" stopOpacity="0" />
                  <stop offset="92%" stopColor="#ecfeff" stopOpacity="0" />
                  <stop offset="100%" stopColor="#ecfeff" stopOpacity="1" />
                </linearGradient>
              </defs>
              {([
                [450,55,  85, 28],[450,55, 145, 28],[450,55, 205, 28],
                [85,28,  50, 92],[85,28,  120,92],
                [145,28, 110,92],[145,28, 180,92],
                [205,28, 170,92],[205,28, 240,92],
                [450,55, 625, 28],[450,55, 695, 28],[450,55, 765, 28],
                [625,28, 590,92],[625,28, 660,92],
                [695,28, 660,92],[695,28, 730,92],
                [765,28, 730,92],[765,28, 800,92],
              ] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={i < 3 ? "rgba(22,163,74,0.35)" : "rgba(59,130,246,0.25)"}
                  strokeWidth="0.7" />
              ))}
              <circle cx={450} cy={55} r={14} fill="rgba(22,163,74,0.12)" stroke="#16a34a" strokeWidth="1.2" />
              <text x={450} y={59} textAnchor="middle" fill="#16a34a" fontSize="9" fontWeight="900">5%</text>
              {[85,145,205,625,695,765].map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={28} r={9} fill="rgba(124,58,237,0.10)" stroke="#7c3aed" strokeWidth="0.9" />
                  <text x={x} y={32} textAnchor="middle" fill="#7c3aed" fontSize="7.5" fontWeight="800">3%</text>
                </g>
              ))}
              {[50,120,110,180,170,240,590,660,660,730,730,800].map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={92} r={6} fill="rgba(59,130,246,0.10)" stroke="#3b82f6" strokeWidth="0.7" />
                  <text x={x} y={96} textAnchor="middle" fill="#3b82f6" fontSize="6.5" fontWeight="700">2%</text>
                </g>
              ))}
              <text x={450} y={112} textAnchor="middle" fill="rgba(100,116,139,0.55)" fontSize="7.5" fontWeight="600">rede de indicações multinível — comissões automáticas por camada</text>
              <rect x="0" y="0" width="900" height="120" fill="url(#netEdge)" />
            </svg>
          </div>
        </div>

        <Divider />

        {/* Benefícios do embaixador */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Benefícios Exclusivos — Embaixador Regional" color={GA} icon={<Crown size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Reconhecimento e Benefícios do Embaixador
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <Award size={16} />, color: GA, title: "Brasão Exclusivo", desc: "Brasão oficial de Embaixador Regional visível no perfil público, sinalizando liderança e reconhecimento da plataforma." },
                { icon: <Globe size={16} />, color: GC, title: "Destaque no Perfil", desc: "Perfil destacado nos resultados de busca regionais, aumentando visibilidade dentro da comunidade local." },
                { icon: <BarChart3 size={16} />, color: PURPLE, title: "Reconhecimento Regional", desc: "Posição oficial reconhecida pela extraGO como referência e liderança dentro de sua região de atuação." },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.09}>
                  <GCard className="p-5" accent={item.color}>
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

        {/* Objetivos do programa */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Objetivos do Programa" color={PURPLE} icon={<Target size={10} />} />
              <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: "clamp(20px,3vw,34px)" }}>
                Impacto Estratégico do Programa de Indicações
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <Reveal>
                <GCard className="p-5 sm:p-7 h-full" accent={GA}>
                  <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Objetivos Principais</p>
                  <div className="space-y-3">
                    {[
                      { title: "Crescimento Orgânico", desc: "Redução significativa do custo de aquisição de usuários ao transformar cada membro em um canal de distribuição ativo." },
                      { title: "Expansão Nacional", desc: "A rede de indicações acelera a penetração em novos mercados e regiões sem necessidade de custo de marketing direto." },
                      { title: "Redução do CAC", desc: "Usuários indicados por pessoas de confiança têm taxas de conversão e retenção superiores aos adquiridos por canais pagos." },
                      { title: "Formação de Lideranças", desc: "Os Embaixadores Regionais se tornam naturalmente líderes comunitários que representam a extraGO em suas regiões." },
                      { title: "Renda Recorrente", desc: "A comissão sobre extras realizados pela rede cria uma fonte de renda passiva recorrente para todos os participantes ativos." },
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
                  <GCard className="p-5 sm:p-6" accent={GC}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Usuários</p>
                    <div className="space-y-2">
                      {[
                        "Renda passiva recorrente proporcional ao crescimento da rede",
                        "Sem necessidade de vendas ativas — a plataforma converte automaticamente",
                        "Comissões automáticas a cada extra realizado pelos indicados",
                        "Progressão de nível que aumenta o percentual de comissão",
                      ].map((p, i) => <CheckItem key={i} text={p} color={GC} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={AMBER}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Para Investidores</p>
                    <div className="space-y-2">
                      {[
                        "Crescimento viral com custo de aquisição próximo de zero",
                        "Rede auto-expansível sem investimento proporcional em marketing",
                        "Dados de rede proprietários com alto valor estratégico",
                        "Efeito de rede exponencial conforme a base cresce",
                      ].map((p, i) => <CheckItem key={i} text={p} color={AMBER} />)}
                    </div>
                  </GCard>

                  <GCard className="p-5 sm:p-6" accent={ROSE}>
                    <p className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-3">Escalabilidade</p>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      Com 10.000 profissionais ativos realizando em média 10 extras por mês de R$200,00,
                      a rede gera R$20.000.000,00 em volume bruto. Um Embaixador com 100 indicados ativos
                      nessa rede recebe <strong className="text-rose-600">R$1.000/mês de renda passiva</strong> sem realizar nenhum extra diretamente.
                    </p>
                  </GCard>
                </div>
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
                A Camada 2 dentro da Arquitetura extraGO
              </h2>
            </Reveal>
            <Reveal>
              <GCard className="p-5 sm:p-7" accent={GA}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Complementa a Camada 1 criando incentivos além da taxa",
                    "Alimenta a Camada 5 de Representantes Estaduais com líderes naturais",
                    "Gera dados de redes sociais profissionais com valor proprietário",
                    "Reduz dependência de publicidade paga para crescimento",
                    "Cria comunidades regionais orgânicas em torno da extraGO",
                    "Transforma usuários em stakeholders do crescimento da plataforma",
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
