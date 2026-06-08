import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Zap, Network, BadgeCheck, Building2,
  DollarSign, MapPin, TrendingUp, Globe,
  Layers, ArrowRight, Shield, BarChart3, Cpu, ChevronRight,
} from "lucide-react";
import {
  FABackground, FAHeader, FANavBar,
  GCard, Pill, Reveal, Divider, SectionCTA, CheckItem, GA, GC,
} from "./financial-architecture/_shared";

const AMBER = "#d97706";
const PURPLE = "#7c3aed";
const ROSE = "#e11d48";

export default function ModeloDeNegocioPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#f0fdf4", color: "#0f172a" }}>
      <FABackground />

      <FANavBar back="/investidores-parceiros" backLabel="← Investidores & Parceiros" />

      <div className="relative z-10">
        <FAHeader />
      </div>

      <main className="relative z-10 flex-1">

        {/* ── INTRO ── */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <p className="text-slate-600 text-[15px] leading-relaxed max-w-3xl mb-8">
                A extraGO conecta empresas e profissionais por meio de uma plataforma de contratação sob demanda.
                Sua arquitetura financeira é formada por <strong className="text-slate-800">múltiplas camadas independentes de receita</strong>,
                garantindo sustentabilidade, escalabilidade e impacto real na infraestrutura de mão de obra do Brasil.
              </p>
            </Reveal>

            {/* Key metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
              {[
                { value: "10%", label: "Menor taxa — nível Elite", color: GA },
                { value: "20%", label: "Maior taxa — Iniciante", color: GC },
                { value: "7", label: "Camadas documentadas", color: PURPLE },
                { value: "27", label: "Representantes estaduais", color: AMBER },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 sm:p-5 text-center" accent={m.color}>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(22px,3vw,36px)", color: m.color }}>{m.value}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{m.label}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 1 ── */}
        <section id="camada-1" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Camada 1" color={GA} icon={<Zap size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Intermediação por Performance
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                A taxa de intermediação da plataforma diminui conforme o profissional constrói reputação, histórico e confiabilidade.
                Cinco níveis progressivos — do Iniciante ao Elite — com taxas que variam de <strong>20% a 10%</strong>.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-5 gap-3 mb-6">
              {[
                { level: "Iniciante", fee: "20%", color: "#64748b" },
                { level: "Júnior", fee: "18%", color: GC },
                { level: "Intermediário", fee: "15%", color: PURPLE },
                { level: "Sênior", fee: "12%", color: AMBER },
                { level: "Elite", fee: "10%", color: GA },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 text-center" accent={item.color} glow={i === 4}>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.level}</p>
                    <p className="font-black leading-none" style={{ fontSize: "clamp(26px,3vw,36px)", color: item.color }}>{item.fee}</p>
                    {i === 4 && (
                      <span className="text-[9px] font-black mt-1 px-2 py-0.5 rounded-full inline-block"
                        style={{ background: `${item.color}12`, color: item.color, border: `1px solid ${item.color}25` }}>
                        MÁXIMO DESCONTO
                      </span>
                    )}
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/performance" label="Entender esta camada" />
              <SectionCTA href="/financial-architecture/performance" label="Ver funcionamento completo" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 2 ── */}
        <section id="camada-2" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Camada 2" color={GC} icon={<Network size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Programa de Indicações Multinível
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                Cada usuário recebe um código e link exclusivo de indicação. Quando indicados realizam extras, o indicador
                recebe comissões recorrentes sobre o valor bruto das transações.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { tier: "Indicador", pct: "2%", color: GC, req: "Conta ativa" },
                { tier: "Agente de Captação", pct: "3%", color: PURPLE, req: "25 indicados ativos · 100 extras na rede" },
                { tier: "Embaixador Regional", pct: "5%", color: GA, req: "100 indicados ativos · 1.000 extras na rede · Aprovação da plataforma" },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.09}>
                  <GCard className="p-5 h-full" accent={item.color} glow={i === 2}>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.tier}</p>
                    <p className="font-black leading-none mb-2" style={{ fontSize: "clamp(30px,4vw,44px)", color: item.color }}>{item.pct}</p>
                    <p className="text-[12px] text-slate-400 leading-snug italic">do valor bruto dos extras realizados pelos indicados</p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Requisito</p>
                      <p className="text-[12px] text-slate-500">{item.req}</p>
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/referrals" label="Explorar detalhes" />
              <SectionCTA href="/financial-architecture/referrals" label="Ver documentação completa" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 3 ── */}
        <section id="camada-3" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Camada 3" color={PURPLE} icon={<BadgeCheck size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Assinaturas Profissionais
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                Planos para profissionais que buscam visibilidade, ferramentas avançadas e crescimento acelerado dentro do ecossistema extraGO.
              </p>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { name: "FREE", price: "Gratuito", color: "#64748b", features: ["Acesso às funcionalidades essenciais da plataforma"] },
                { name: "extraGO PRO", price: "R$ 19,90/mês", color: PURPLE, features: ["Destaque nas buscas", "Estatísticas avançadas", "Selo PRO", "Notificações prioritárias"] },
                { name: "extraGO PREMIUM", price: "R$ 49,90/mês", color: GC, features: ["Todos os benefícios PRO", "Perfil destacado", "Relatórios avançados", "Atendimento prioritário"] },
                { name: "extraGO ELITE", price: "R$ 99,90/mês", color: GA, features: ["Todos os benefícios PREMIUM", "Máxima prioridade", "Benefícios exclusivos", "Recursos avançados"] },
              ].map((plan, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <GCard className="p-4 sm:p-5 h-full" accent={plan.color} glow={i === 3}>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-2" style={{ color: plan.color }}>{plan.name}</p>
                    <p className="font-black text-[15px] sm:text-[17px] mb-3" style={{ color: plan.color }}>{plan.price}</p>
                    <div className="space-y-1.5">
                      {plan.features.map((f, j) => (
                        <CheckItem key={j} text={f} color={plan.color} />
                      ))}
                    </div>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/professional-plans" label="Ver funcionamento completo" />
              <SectionCTA href="/financial-architecture/professional-plans" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 4 ── */}
        <section id="camada-4" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Camada 4" color={AMBER} icon={<Building2 size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Assinaturas Empresariais
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                Soluções SaaS para empresas com dashboards, analytics e gestão operacional.
                Quatro planos que atendem desde pequenas empresas a grandes organizações nacionais.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { tier: "Starter", price: "R$ 99,90/mês", color: "#64748b", ideal: "Ideal para pequenas empresas." },
                { tier: "Business", price: "R$ 299,90/mês", color: AMBER, ideal: "Ideal para empresas com demanda recorrente." },
                { tier: "Corporate", price: "R$ 799,90/mês", color: GC, ideal: "Ideal para operações maiores." },
                { tier: "Enterprise", price: "Sob consulta", color: GA, ideal: "Soluções personalizadas para grandes organizações." },
              ].map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-4 sm:p-5 h-full" accent={plan.color}>
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1" style={{ color: plan.color }}>{plan.tier}</p>
                    <p className="font-black text-[16px] sm:text-[18px] mb-2" style={{ color: plan.color }}>{plan.price}</p>
                    <p className="text-[12px] text-slate-400 leading-snug">{plan.ideal}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/business-plans" label="Entender esta camada" />
              <SectionCTA href="/financial-architecture/business-plans" label="Ver documentação completa" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── ESTRUTURA FINANCEIRA ── */}
        <section id="financeiro" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Estrutura Financeira da Receita Operacional" color={GA} icon={<BarChart3 size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Distribuição da Receita Operacional
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                Cada real gerado pela plataforma é distribuído estrategicamente entre sete destinos,
                garantindo sustentabilidade, crescimento e retorno para fundadores e investidores.
              </p>
            </Reveal>

            <Reveal>
              <GCard className="p-5 sm:p-8 mb-6" accent={GA} glow>
                <div className="space-y-4">
                  {[
                    { label: "Caixa e Reserva Estratégica", pct: 25, color: GA, desc: "Garantia de liquidez, segurança financeira e sustentabilidade." },
                    { label: "Fundadores e Investidores", pct: 20, color: AMBER, desc: "Participação nos resultados e crescimento do ecossistema." },
                    { label: "Marketing e Expansão", pct: 20, color: GC, desc: "Aquisição de usuários e crescimento nacional." },
                    { label: "Tecnologia e Inovação", pct: 10, color: PURPLE, desc: "Infraestrutura, desenvolvimento e inteligência artificial." },
                    { label: "Operações", pct: 10, color: "#0891b2", desc: "Atendimento, suporte, jurídico e gestão." },
                    { label: "Fundo de Crescimento Estratégico", pct: 10, color: ROSE, desc: "Expansão, novos produtos e oportunidades." },
                    { label: "Representantes Estaduais", pct: 5, color: "#ea580c", desc: "Desenvolvimento da rede regional." },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-[13px] font-semibold text-slate-700">{item.label}</span>
                          <span className="ml-2 text-[11px] text-slate-400">{item.desc}</span>
                        </div>
                        <span className="font-black text-[15px] ml-4 flex-shrink-0" style={{ color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.pct * 4}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 + 0.2, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${item.color}60,${item.color})` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-100 flex justify-between">
                    <span className="text-[12px] text-slate-400">Total da receita operacional distribuída</span>
                    <span className="font-black text-[15px]" style={{ color: GA }}>100%</span>
                  </div>
                </div>
              </GCard>
            </Reveal>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/revenue-structure" label="Ver estrutura completa" />
              <SectionCTA href="/financial-architecture/revenue-structure" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── MODELO DE EXPANSÃO ── */}
        <section id="expansao" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Modelo de Expansão" color={GC} icon={<Globe size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Expansão Nacional por Fase
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                Crescimento estruturado e progressivo, do Rio Grande do Sul à cobertura nacional,
                conduzido por representantes estaduais e equipes regionais.
              </p>
            </Reveal>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {[
                { phase: "Fase 1", region: "Rio Grande do Sul", color: GA },
                { phase: "Fase 2", region: "Região Sul", color: GC },
                { phase: "Fase 3", region: "Sudeste", color: PURPLE },
                { phase: "Fase 4", region: "Capitais Estratégicas", color: AMBER },
                { phase: "Fase 5", region: "Cobertura Nacional", color: ROSE },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.07} className="flex-1">
                  <GCard className="p-4 text-center h-full" accent={item.color}>
                    <p className="text-[9px] font-black tracking-widest uppercase mb-1" style={{ color: item.color }}>{item.phase}</p>
                    <p className="text-[13px] font-bold text-slate-700 leading-snug">{item.region}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/expansion-model" label="Ver modelo de expansão" />
              <SectionCTA href="/financial-architecture/expansion-model" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── REPRESENTANTES ESTADUAIS ── */}
        <section id="representantes" className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-6">
              <Pill label="Rede de Representantes Estaduais" color={AMBER} icon={<MapPin size={10} />} />
              <h2 className="font-black leading-tight mb-2 text-slate-900" style={{ fontSize: "clamp(22px,3.5vw,40px)" }}>
                Representantes Estaduais
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mb-5">
                A expansão nacional da extraGO será conduzida por representantes oficiais.
                Cada estado poderá ter apenas um Representante Estadual ativo, apoiado por até quatro colaboradores.
                <strong className="text-slate-700"> 5% da receita operacional</strong> é destinado ao Fundo Nacional de Representantes.
              </p>
            </Reveal>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { value: "1", label: "Representante Oficial por Estado", color: AMBER },
                { value: "27", label: "Estados brasileiros com representação", color: GA },
                { value: "5%", label: "Da receita destinada ao Fundo Nacional", color: GC },
              ].map((m, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-4 sm:p-6 text-center" accent={m.color} glow>
                    <p className="font-black leading-none mb-1" style={{ fontSize: "clamp(26px,3.5vw,42px)", color: m.color }}>{m.value}</p>
                    <p className="text-[11px] sm:text-[12px] text-slate-500 leading-snug">{m.label}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/state-representatives" label="Ver documentação completa" />
              <SectionCTA href="/financial-architecture/state-representatives" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── VISÃO DE LONGO PRAZO ── */}
        <section className="px-5 sm:px-10 py-10 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <GCard className="p-6 sm:p-10" accent={GA} glow>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${GA}12`, border: `1px solid ${GA}25` }}>
                    <TrendingUp size={22} style={{ color: GA }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-widest uppercase mb-2" style={{ color: GA }}>Visão de Longo Prazo</p>
                    <p className="text-slate-800 text-[15px] sm:text-[17px] font-semibold leading-relaxed mb-3">
                      Assim como o Uber transformou o transporte, o Airbnb transformou a hospedagem e o LinkedIn transformou
                      o networking profissional, a extraGO busca <strong>transformar a contratação de mão de obra sob demanda no Brasil.</strong>
                    </p>
                    <p className="text-slate-500 text-[13px] leading-relaxed mb-4">
                      Nosso objetivo não é apenas criar uma plataforma. Nosso objetivo é construir a infraestrutura nacional
                      que conecta empresas, profissionais, oportunidades e crescimento econômico em um único ecossistema.
                    </p>
                    <p className="font-black text-[14px] tracking-wide" style={{ color: GA }}>
                      extraGO — A infraestrutura de mão de obra do Brasil. 🚀
                    </p>
                  </div>
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER NAV ── */}
        <section className="px-5 sm:px-10 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] font-black tracking-[0.14em] uppercase text-slate-400 mb-4">Documentação por camada</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Intermediação por Performance", href: "/financial-architecture/performance", color: GA },
                { label: "Indicações Multinível", href: "/financial-architecture/referrals", color: GC },
                { label: "Assinaturas Profissionais", href: "/financial-architecture/professional-plans", color: PURPLE },
                { label: "Assinaturas Empresariais", href: "/financial-architecture/business-plans", color: AMBER },
                { label: "Estrutura Financeira da Receita", href: "/financial-architecture/revenue-structure", color: GA },
                { label: "Modelo de Expansão", href: "/financial-architecture/expansion-model", color: GC },
                { label: "Representantes Estaduais", href: "/financial-architecture/state-representatives", color: AMBER },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all"
                    style={{ background: "rgba(255,255,255,0.70)", borderColor: `${item.color}22` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${item.color}08`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.70)"; }}>
                    <span className="text-[12px] font-semibold text-slate-600">{item.label}</span>
                    <ChevronRight size={14} style={{ color: item.color }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="h-10" />
      </main>
    </div>
  );
}
