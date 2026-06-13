import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import motoresReceitaCardImg from "@assets/Motores-receita-arqfin_1781330517476.png";
import {
  Zap, Network, BadgeCheck, Building2,
  DollarSign, MapPin, TrendingUp, Globe,
  Layers, ArrowRight, Shield, BarChart3, Cpu, ChevronRight,
  Lightbulb, Users, Repeat, RefreshCw,
} from "lucide-react";
import {
  FABackground, FAHeader, FANavBar,
  GCard, Pill, Reveal, Divider, SectionCTA, CheckItem, GA, GC,
} from "./financial-architecture/_shared";

const AMBER = "#d97706";
const PURPLE = "#7c3aed";
const ROSE = "#e11d48";

/* ─── reusable "Por que existe" block ─── */
function WhyBlock({ text }: { text: string }) {
  return (
    <Reveal delay={0.15} className="mb-4">
      <GCard className="p-5 sm:p-6" accent={GA}>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${GA}14`, border: `1px solid ${GA}25` }}>
            <Lightbulb size={16} style={{ color: GA }} />
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.14em] uppercase mb-2" style={{ color: GA }}>
              Por que esta camada existe?
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed">{text}</p>
          </div>
        </div>
      </GCard>
    </Reveal>
  );
}

/* ─── reusable "Impacto para Investidores" block ─── */
function ImpactBlock({ text }: { text: string }) {
  return (
    <Reveal delay={0.20} className="mb-6">
      <GCard className="p-5 sm:p-6" accent={GC} glow>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${GC}14`, border: `1px solid ${GC}25` }}>
            <TrendingUp size={16} style={{ color: GC }} />
          </div>
          <div>
            <p className="text-[11px] font-black tracking-[0.14em] uppercase mb-2" style={{ color: GC }}>
              Impacto para Investidores
            </p>
            <p className="text-[13px] text-slate-600 leading-relaxed">{text}</p>
          </div>
        </div>
      </GCard>
    </Reveal>
  );
}

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
        <section className="px-5 sm:px-10 py-6 sm:py-16">
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
        <section id="camada-1" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="A Camada 1 é a base da monetização. Cada extra concluído gera receita direta para a plataforma. O sistema de progressão de taxas incentiva qualidade e cria retenção natural: profissionais que constroem reputação pagam menos e permanecem na plataforma por mais tempo — alinhando o sucesso da plataforma com o sucesso do profissional." />
            <ImpactBlock text="Receita diretamente proporcional ao volume de extras concluídos — quanto mais a plataforma cresce, mais esta camada produz. Estimada como a maior fonte de receita no early stage. A estrutura de taxas progressivas garante retenção orgânica sem custo de aquisição adicional." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/performance" label="Entender esta camada" />
              <SectionCTA href="/financial-architecture/performance" label="Ver funcionamento completo" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 2 ── */}
        <section id="camada-2" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="Transforma cada usuário em um agente de crescimento. Em vez de depender exclusivamente de marketing pago, a plataforma cria uma rede de incentivo onde cada novo profissional traz mais profissionais — reduzindo o CAC estruturalmente e criando crescimento orgânico exponencial com efeitos de rede autossustentáveis." />
            <ImpactBlock text="Reduz o custo de aquisição de clientes (CAC) de forma estrutural. A rede de indicações torna o crescimento autossustentável, aumenta o LTV por usuário e cria barreiras de saída para quem está ativo na rede de referrals. Cada Embaixador Regional potencialmente move centenas de profissionais novos para a plataforma." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/referrals" label="Explorar detalhes" />
              <SectionCTA href="/financial-architecture/referrals" label="Ver documentação completa" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 3 ── */}
        <section id="camada-3" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="Cria previsibilidade financeira independente do volume de extras. O MRR (Monthly Recurring Revenue) estabiliza a receita da plataforma e permite planejamento de longo prazo, reduzindo a exposição à sazonalidade operacional e complementando a receita transacional da Camada 1." />
            <ImpactBlock text="Receita mensal recorrente (MRR) que escala diretamente com a base de usuários. Cada novo profissional que assina um plano aumenta o MRR sem custo marginal significativo — criando alavancagem financeira real. Com 10.000 assinantes no plano médio, a Camada 3 gera mais de R$ 350.000/mês de receita previsível." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/professional-plans" label="Ver funcionamento completo" />
              <SectionCTA href="/financial-architecture/professional-plans" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── CAMADA 4 ── */}
        <section id="camada-4" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="Posiciona a extraGO como uma solução SaaS B2B — criando receita recorrente de alto ticket. Empresas com planos ativos têm maior retenção, maior volume de contratações e maior LTV. Ao resolver a dor operacional das empresas com ferramentas de gestão, a plataforma se torna indispensável no dia a dia corporativo." />
            <ImpactBlock text="Receita recorrente B2B com tickets superiores às assinaturas profissionais. A combinação das Camadas 3 e 4 cria um MRR robusto que sustenta a operação independente do volume transacional. Uma única empresa no plano Corporate equivale a mais de 16 profissionais no plano PRO." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/business-plans" label="Entender esta camada" />
              <SectionCTA href="/financial-architecture/business-plans" label="Ver documentação completa" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── ESTRUTURA FINANCEIRA ── */}
        <section id="financeiro" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="A distribuição estratégica da receita garante que crescimento, tecnologia, expansão e retorno para fundadores e investidores coexistam de forma equilibrada — sem depender de capital externo contínuo para sustentar a operação. Cada percentual foi calculado para que a extraGO financie seu próprio crescimento a partir da receita gerada." />
            <ImpactBlock text="20% da receita operacional vai diretamente para fundadores e investidores — automaticamente e em proporção ao crescimento da plataforma. Quanto mais a extraGO cresce, maior é o retorno distribuído. A reserva de caixa de 25% garante solidez operacional mesmo em cenários adversos, protegendo o investimento a longo prazo." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/revenue-structure" label="Ver estrutura completa" />
              <SectionCTA href="/financial-architecture/revenue-structure" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── MODELO DE EXPANSÃO ── */}
        <section id="expansao" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="A expansão em fases permite crescimento nacional sem necessidade de estrutura física centralizada. Cada representante estadual é um multiplicador de mercado — desenvolvendo relacionamentos locais, parcerias regionais e crescimento de rede de forma descentralizada e economicamente eficiente." />
            <ImpactBlock text="Expansão nacional com capital eficiente: cada estado ativado multiplica as fontes de receita sem aumento proporcional de custos fixos. O modelo de representantes cria barreiras competitivas regionais que fortalecem a posição da extraGO e são difíceis de replicar por concorrentes sem presença local." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/expansion-model" label="Ver modelo de expansão" />
              <SectionCTA href="/financial-architecture/expansion-model" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── REPRESENTANTES ESTADUAIS ── */}
        <section id="representantes" className="px-5 sm:px-10 py-6 sm:py-16">
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

            <WhyBlock text="Uma rede de representantes regionais cria presença local escalável sem necessidade de escritórios físicos em cada estado. Cada representante é responsável pelo desenvolvimento comercial, parcerias e crescimento da rede em sua região — atuando como extensão da plataforma no território, com conhecimento e relacionamentos que a tecnologia sozinha não substitui." />
            <ImpactBlock text="27 multiplicadores de mercado financiados pela própria receita operacional. A rede de representantes acelera a penetração estadual e cria defensabilidade regional de difícil replicação. Cada representante ativo potencialmente ativa dezenas de empresas e centenas de profissionais em seu estado." />

            <div className="flex flex-wrap gap-3">
              <SectionCTA href="/financial-architecture/state-representatives" label="Ver documentação completa" />
              <SectionCTA href="/financial-architecture/state-representatives" label="Explorar detalhes" variant="outline" />
            </div>
          </div>
        </section>

        <Divider />

        {/* ── COMO OS MOTORES SE CONECTAM ── */}
        <section id="motores" className="px-5 sm:px-10 py-6 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <Reveal className="mb-10 text-center">
              <Pill label="Arquitetura de Receita" color={GA} icon={<Layers size={10} />} />
              <h2 className="font-black leading-tight mb-3 text-slate-900" style={{ fontSize: "clamp(24px,3.8vw,44px)" }}>
                Como os Motores se Conectam
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mx-auto">
                Cada camada de receita alimenta as demais — criando um ecossistema integrado onde o crescimento em uma frente impulsiona todas as outras.
              </p>
            </Reveal>

            <Reveal className="mb-10">
              <div
                className="w-full rounded-2xl overflow-hidden p-1"
                style={{
                  boxShadow: "0 8px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(22,163,74,0.18), 0 0 32px rgba(22,163,74,0.07)",
                  border: "1px solid rgba(22,163,74,0.20)",
                  background: "rgba(240,253,244,0.6)",
                }}
              >
                <img
                  src={motoresReceitaCardImg}
                  alt="Os 4 Motores de Receita da extraGO"
                  className="w-full h-auto block rounded-xl"
                  style={{ display: "block", objectFit: "contain", maxWidth: "100%" }}
                />
              </div>
            </Reveal>

            {/* Flow — horizontal on desktop, vertical on mobile */}
            <div className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {[
                  { num: "01", title: "Empresa publica Extra", sub: "Demanda gerada pela empresa", color: GA, icon: <Building2 size={14} /> },
                  { num: "02", title: "Profissional executa", sub: "Camada 1 gera receita de intermediação", color: GC, icon: <Users size={14} /> },
                  { num: "03", title: "Indicações ativam C2", sub: "Novos usuários via rede multinível", color: PURPLE, icon: <Network size={14} /> },
                  { num: "04", title: "Assinaturas crescem", sub: "C3 e C4 geram MRR recorrente", color: AMBER, icon: <BadgeCheck size={14} /> },
                  { num: "05", title: "Receita reinvestida", sub: "Expansão, tech e representantes", color: ROSE, icon: <RefreshCw size={14} /> },
                ].map((step, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="relative">
                      {i < 4 && (
                        <div className="hidden lg:flex absolute -right-1.5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-3 h-3">
                          <ChevronRight size={12} className="text-slate-300" />
                        </div>
                      )}
                      <GCard className="p-4 sm:p-5 h-full text-center" accent={step.color}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-3"
                          style={{ background: `${step.color}14`, border: `1px solid ${step.color}25` }}>
                          <span style={{ color: step.color }}>{step.icon}</span>
                        </div>
                        <span className="text-[9px] font-black tracking-[0.16em] uppercase" style={{ color: `${step.color}80` }}>Passo {step.num}</span>
                        <p className="text-[12px] font-bold text-slate-800 mt-1 mb-1 leading-snug">{step.title}</p>
                        <p className="text-[11px] text-slate-400 leading-snug">{step.sub}</p>
                      </GCard>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Connection summary */}
              <Reveal delay={0.3}>
                <GCard className="p-5 sm:p-8" accent={GA} glow>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-black tracking-[0.14em] uppercase mb-3" style={{ color: GA }}>Fluxo de Valor Completo</p>
                      <div className="space-y-2.5">
                        {[
                          { step: "Empresa publica Extra", effect: "→ Camada 1 gera receita de intermediação", color: GA },
                          { step: "Profissional conclui Extra", effect: "→ Reputação cresce, taxa diminui", color: GC },
                          { step: "Novos usuários via indicações", effect: "→ Camada 2 gera comissões recorrentes", color: PURPLE },
                          { step: "Profissionais assinam planos", effect: "→ Camada 3 aumenta o MRR", color: AMBER },
                          { step: "Empresas adotam SaaS", effect: "→ Camada 4 aumenta o MRR B2B", color: ROSE },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-[12px]">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: item.color }} />
                            <span className="text-slate-700 font-medium">{item.step}</span>
                            <span className="text-slate-400 ml-auto pl-2 flex-shrink-0 hidden sm:block">{item.effect}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-6 pt-4 sm:pt-0">
                      <p className="text-[11px] font-black tracking-[0.14em] uppercase mb-3" style={{ color: GC }}>Resultado para Investidores</p>
                      <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
                        Quatro camadas de receita operam em paralelo e se reforçam mutuamente. O crescimento em volume transacional (C1) expande a base de usuários para indicações (C2) e assinaturas (C3+C4) — multiplicando o retorno sem necessidade de capital externo adicional.
                      </p>
                      <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: `${GA}08`, border: `1px solid ${GA}18` }}>
                        <Shield size={14} style={{ color: GA }} />
                        <p className="text-[12px] text-slate-600"><strong className="text-slate-800">Resiliência integrada:</strong> se uma camada reduz, as outras mantêm a operação.</p>
                      </div>
                    </div>
                  </div>
                </GCard>
              </Reveal>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── FLYWHEEL extragO ── */}
        <section id="flywheel" className="px-5 sm:px-10 py-6 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <Reveal className="mb-10 text-center">
              <Pill label="Efeito de Rede" color={GC} icon={<Repeat size={10} />} />
              <h2 className="font-black leading-tight mb-3 text-slate-900" style={{ fontSize: "clamp(24px,3.8vw,44px)" }}>
                Flywheel extraGO
              </h2>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-2xl mx-auto">
                Um ciclo autossustentável onde cada elemento impulsiona o próximo — tornando o crescimento cada vez mais eficiente à medida que a plataforma escala.
              </p>
            </Reveal>

            {/* Circular flywheel visual */}
            <Reveal delay={0.1} className="mb-10">
              <div className="relative">
                {/* Central circle */}
                <div className="relative mx-auto" style={{ maxWidth: 520 }}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Mais Empresas", sub: "publicam Extras na plataforma", color: GA, icon: <Building2 size={18} />, arrow: "→" },
                      { label: "Mais Extras", sub: "concluídos geram receita C1", color: GC, icon: <Zap size={18} />, arrow: "↓" },
                      { label: "Mais Indicações", sub: "ativam crescimento orgânico C2", color: ROSE, icon: <Network size={18} />, arrow: "↑" },
                      { label: "Mais Profissionais", sub: "se cadastram e assinam C3", color: PURPLE, icon: <Users size={18} />, arrow: "←" },
                    ].map((node, i) => (
                      <Reveal key={i} delay={i * 0.10}>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 300, damping: 24 }}
                          className="rounded-2xl p-4 sm:p-5 text-center cursor-default"
                          style={{
                            background: `linear-gradient(135deg,${node.color}10 0%,${node.color}05 100%)`,
                            border: `1.5px solid ${node.color}25`,
                            boxShadow: `0 4px 20px ${node.color}10`,
                          }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                            style={{ background: `${node.color}14`, border: `1px solid ${node.color}22` }}>
                            <span style={{ color: node.color }}>{node.icon}</span>
                          </div>
                          <p className="text-[14px] font-black text-slate-800 mb-1 leading-tight">{node.label}</p>
                          <p className="text-[11px] text-slate-400 leading-snug">{node.sub}</p>
                        </motion.div>
                      </Reveal>
                    ))}
                  </div>

                  {/* Center label */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-full flex flex-col items-center justify-center text-center"
                      style={{
                        width: 88, height: 88,
                        background: `linear-gradient(135deg,${GA}18,${GC}12)`,
                        border: `2px solid ${GA}30`,
                        boxShadow: `0 0 32px ${GA}20`,
                      }}>
                      <Repeat size={16} style={{ color: GA }} />
                      <p className="text-[8px] font-black tracking-wide uppercase mt-1" style={{ color: GA }}>Flywheel</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Why it compounds */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  color: GA, icon: <TrendingUp size={16} />, title: "Crescimento Composto",
                  desc: "Cada novo usuário aumenta o valor da rede para todos os participantes existentes — efeito de rede clássico que torna a plataforma mais valiosa com a escala.",
                },
                {
                  color: GC, icon: <Shield size={16} />, title: "CAC Decrescente",
                  desc: "À medida que a rede de indicações cresce, o custo de aquisição de novos usuários cai — tornando o crescimento progressivamente mais eficiente e lucrativo.",
                },
                {
                  color: PURPLE, icon: <Layers size={16} />, title: "Receita Multicamada",
                  desc: "Cada usuário ativo pode gerar receita por mais de uma camada simultaneamente — via transações, assinatura e indicações — aumentando o LTV médio.",
                },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <GCard className="p-5 h-full" accent={item.color}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-800 mb-2 leading-tight">{item.title}</p>
                    <p className="text-[12px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </GCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.25}>
              <GCard className="p-5 sm:p-8" accent={GA} glow>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${GA}14`, border: `1px solid ${GA}25` }}>
                    <Repeat size={20} style={{ color: GA }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black tracking-[0.14em] uppercase mb-2" style={{ color: GA }}>Por que o Flywheel importa para Investidores</p>
                    <p className="text-[14px] text-slate-700 font-semibold leading-relaxed mb-2">
                      Uma vez que o flywheel ganha velocidade, o crescimento se torna autossustentável.
                    </p>
                    <p className="text-[13px] text-slate-500 leading-relaxed">
                      Empresas como Uber, Airbnb e LinkedIn dominaram seus mercados não porque tinham mais capital, mas porque seus flywheels giraram mais rápido. A extraGO está construindo o mesmo mecanismo para o mercado de trabalho flexível no Brasil — um ecossistema onde mais usuários significam mais valor, mais receita e mais crescimento.
                    </p>
                  </div>
                </div>
              </GCard>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* ── VISÃO DE LONGO PRAZO ── */}
        <section className="px-5 sm:px-10 py-6 sm:py-16">
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
        <section className="px-5 sm:px-10 py-5 sm:py-12">
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
                    <span className="text-[12px] font-semibold text-slate-700">{item.label}</span>
                    <ChevronRight size={13} className="flex-shrink-0" style={{ color: item.color }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
