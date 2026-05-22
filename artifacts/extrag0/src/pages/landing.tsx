import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import logoBanner from "@assets/file_00000000a6a0720ebf53cbf894c13554_1779452671810.png";
import logoMain from "@assets/1779451173221_1779452671733.png";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Zap, Shield, Star, Users, TrendingUp, Clock,
  ChevronRight, CheckCircle, Briefcase, Smartphone, Award
} from "lucide-react";

function AnimatedOrb({
  color, size, left, top, duration, delay = 0
}: { color: string; size: number; left: string; top: string; duration: number; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left, top,
        background: color,
        filter: `blur(${size / 3}px)`,
        opacity: 0.12,
      }}
      animate={{ x: ["0%", "6%", "-4%", "5%", "0%"], y: ["0%", "8%", "4%", "-5%", "0%"], scale: [1, 1.1, 0.95, 1.08, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function CountUp({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function ScrollSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  { step: "01", icon: <Users size={24} />, title: "Crie sua conta", desc: "Cadastre-se como empresa ou freelancer em menos de 2 minutos.", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { step: "02", icon: <Briefcase size={24} />, title: "Publique ou candidate-se", desc: "Empresas publicam vagas com detalhes. Freelancers se candidatam com um clique.", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  { step: "03", icon: <CheckCircle size={24} />, title: "Trabalhe e receba", desc: "Conclua o job e receba seu pagamento via PIX direto na carteira.", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
];

const FEATURES_COMPANY = [
  "Acesso a centenas de profissionais verificados",
  "Publicação de vagas em minutos",
  "Aprovação de candidatos com perfil completo",
  "Pagamento seguro pela plataforma",
  "Histórico e relatórios de contratações",
];

const FEATURES_FREELANCER = [
  "Vagas exclusivas em restaurantes e eventos",
  "Pagamento garantido via PIX",
  "Sistema de reputação e gamificação",
  "Suba de nível e ganhe mais oportunidades",
  "Programa de indicações com bônus",
];

const STATS = [
  { value: 12000, suffix: "+", label: "Profissionais ativos", icon: <Users size={20} /> },
  { value: 850, suffix: "+", label: "Empresas parceiras", icon: <Briefcase size={20} /> },
  { value: 45000, suffix: "+", label: "Jobs concluídos", icon: <CheckCircle size={20} /> },
  { value: 98, suffix: "%", label: "Taxa de satisfação", icon: <Star size={20} /> },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatedOrb color="#7CFC00" size={600} left="-8%" top="-10%" duration={16} />
        <AnimatedOrb color="#00E5FF" size={480} left="65%" top="25%" duration={13} delay={2} />
        <AnimatedOrb color="#7CFC00" size={320} left="78%" top="-8%" duration={15} delay={4} />
        <AnimatedOrb color="#00E5FF" size={280} left="15%" top="65%" duration={12} delay={6} />
      </div>

      <div className="fixed inset-0 z-0 opacity-[0.12] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <header className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#060809]/90 backdrop-blur-xl border-b border-white/8 shadow-lg"
          : "bg-transparent backdrop-blur-sm"
      }`}>
        <div className="flex items-center justify-between px-5 sm:px-8 py-3 max-w-7xl mx-auto">
          <Link href="/">
            <img src={logoMain} alt="extraGO" className="h-7 object-contain cursor-pointer" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none rounded-full px-5 h-9 text-sm font-bold">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center px-5 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="mb-6 w-full max-w-[460px] mx-auto"
          >
            <img
              src={logoBanner}
              alt="extraGO Banner"
              className="w-full h-auto drop-shadow-[0_0_40px_rgba(124,252,0,0.4)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary mb-6"
          >
            <Zap size={12} className="fill-primary" />
            A plataforma #1 de extras em hospitalidade no Brasil
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 leading-[1.08] max-w-4xl"
          >
            A revolução dos <span className="neon-text-gradient">extras</span> na hospitalidade
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Conectamos restaurantes, bares e eventos aos melhores profissionais freelancers do Brasil — em tempo real. Rápido, seguro e premium.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-sm sm:max-w-none"
          >
            <Link href="/register?role=company" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan rounded-full font-bold text-base h-13 px-8 border-none"
              >
                <Briefcase size={18} className="mr-2" />
                Sou Empresa
              </Button>
            </Link>
            <Link href="/register?role=freelancer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full font-bold text-base h-13 px-8 border-primary/40 text-primary hover:bg-primary/8 hover:border-primary/60"
              >
                <Users size={18} className="mr-2" />
                Quero Trabalhar
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-4 sm:gap-8 mt-12 text-xs sm:text-sm text-muted-foreground flex-wrap justify-center"
          >
            {["Sem mensalidade", "Pagamento garantido", "Profissionais verificados"].map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-primary" />
                {item}
              </span>
            ))}
          </motion.div>
        </section>

        {/* Stats strip */}
        <section className="px-5 pb-16">
          <ScrollSection>
            <div className="max-w-5xl mx-auto">
              <div className="gradient-border p-px rounded-2xl">
                <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl px-6 py-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {STATS.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="flex items-center justify-center mb-2 text-primary opacity-60">{stat.icon}</div>
                        <p className="text-2xl sm:text-3xl font-bold neon-text-gradient">
                          <CountUp target={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollSection>
        </section>

        {/* How it works */}
        <section className="px-5 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-12">
                <span className="text-xs font-bold text-primary tracking-widest uppercase mb-3 block">Como funciona</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simples como deve ser</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">Do cadastro ao pagamento, tudo em uma só plataforma.</p>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-3 gap-6 relative">
              <div className="hidden sm:block absolute top-12 left-[calc(33%+20px)] right-[calc(33%+20px)] h-px bg-gradient-to-r from-primary/30 via-secondary/30 to-transparent" />
              {HOW_IT_WORKS.map((item, i) => (
                <ScrollSection key={i} delay={i * 0.1}>
                  <div className={`glass-card card-hover rounded-2xl p-6 border ${item.bg} relative`}>
                    <div className="absolute top-4 right-4 text-[11px] font-bold text-white/20 font-mono">{item.step}</div>
                    <div className={`w-12 h-12 rounded-xl ${item.bg} border flex items-center justify-center mb-4 ${item.color}`}>
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </ScrollSection>
              ))}
            </div>
          </div>
        </section>

        {/* For whom */}
        <section className="px-5 py-16 sm:py-24">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="text-center mb-12">
                <span className="text-xs font-bold text-secondary tracking-widest uppercase mb-3 block">Para quem é</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Feito para os dois lados</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">Empresas que precisam de profissionais e profissionais que buscam mais.</p>
              </div>
            </ScrollSection>

            <div className="grid sm:grid-cols-2 gap-6">
              <ScrollSection delay={0.05}>
                <div className="glass-card rounded-2xl p-7 border border-secondary/15 h-full">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center mb-5">
                    <Briefcase size={22} className="text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Para Empresas</h3>
                  <p className="text-muted-foreground text-sm mb-5">Restaurantes, bares, hotéis e organizadores de eventos.</p>
                  <ul className="space-y-2.5">
                    {FEATURES_COMPANY.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?role=company" className="mt-6 block">
                    <Button className="w-full bg-secondary text-black hover:bg-secondary/90 neon-glow-cyan rounded-xl font-bold border-none">
                      Começar como Empresa <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </ScrollSection>

              <ScrollSection delay={0.12}>
                <div className="glass-card rounded-2xl p-7 border border-primary/15 h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-5">
                    <Users size={22} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Para Freelancers</h3>
                  <p className="text-muted-foreground text-sm mb-5">Garçons, barmans, hostess, cozinheiros e muito mais.</p>
                  <ul className="space-y-2.5">
                    {FEATURES_FREELANCER.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle size={14} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?role=freelancer" className="mt-6 block">
                    <Button className="w-full bg-primary text-black hover:bg-primary/90 neon-glow rounded-xl font-bold border-none">
                      Quero Trabalhar <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </ScrollSection>
            </div>
          </div>
        </section>

        {/* Why extraGO */}
        <section className="px-5 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <ScrollSection>
              <div className="gradient-border rounded-3xl p-px">
                <div className="bg-[rgba(255,255,255,0.03)] rounded-3xl p-8 sm:p-12">
                  <div className="grid sm:grid-cols-3 gap-8 text-center">
                    {[
                      { icon: <Zap size={28} />, title: "Instantâneo", desc: "Match entre empresa e profissional em minutos, não dias.", color: "text-primary" },
                      { icon: <Shield size={28} />, title: "Seguro", desc: "Perfis verificados, pagamento garantido e avaliações reais.", color: "text-secondary" },
                      { icon: <Award size={28} />, title: "Premium", desc: "Gamificação, níveis e benefícios exclusivos para os melhores.", color: "text-yellow-400" },
                    ].map((item, i) => (
                      <ScrollSection key={i} delay={i * 0.08}>
                        <div className="flex flex-col items-center">
                          <div className={`${item.color} mb-3 opacity-90`}>{item.icon}</div>
                          <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </ScrollSection>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-20 sm:py-28 text-center">
          <ScrollSection>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
                Pronto para <span className="neon-text-gradient">começar</span>?
              </h2>
              <p className="text-muted-foreground mb-8 text-base sm:text-lg">
                Junte-se a mais de 12.000 profissionais e 850 empresas que já transformaram o mercado de hospitalidade.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-primary text-black hover:bg-primary/90 neon-glow rounded-full font-bold text-base h-13 px-10 border-none"
                  >
                    Criar Conta Grátis <ChevronRight size={18} className="ml-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full font-bold text-base h-13 px-8 text-muted-foreground hover:text-foreground"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollSection>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <img src={logoMain} alt="extraGO" className="h-5 opacity-60" />
          <p>© 2026 extraGO. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
