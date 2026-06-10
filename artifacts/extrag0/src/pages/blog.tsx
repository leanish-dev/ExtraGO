import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import logoMain from "@assets/Logo-new_1781073251550.png";
import { Reveal } from "@/lib/institutional-components";

const POSTS = [
  {
    tag: "Mercado",
    tagColor: "#16a34a",
    title: "O futuro do trabalho temporário no Brasil",
    excerpt: "Como a digitalização está transformando o mercado de freelancers na hotelaria, gastronomia e eventos — e por que a extraGO está na vanguarda dessa mudança.",
    date: "Jun 2026",
    readTime: "5 min",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
  {
    tag: "Tecnologia",
    tagColor: "#3b82f6",
    title: "Gamificação no trabalho: como níveis e pontos aumentam a produtividade",
    excerpt: "Profissionais de nível Elite ganham 10% a mais por extra. Entenda como o sistema de progressão da extraGO motiva resultados reais.",
    date: "Mai 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    tag: "Empresas",
    tagColor: "#d97706",
    title: "Como reduzir custos com mão de obra temporária em eventos",
    excerpt: "Empresas que usam a extraGO economizam em média 30% em processos seletivos e garantem profissionais verificados em menos de 24 horas.",
    date: "Mai 2026",
    readTime: "6 min",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    tag: "Indicações",
    tagColor: "#7c3aed",
    title: "3% de comissão vitalícia: como funciona o programa de indicações",
    excerpt: "Cada profissional que você indica gera renda passiva para você enquanto ele trabalhar na plataforma. Sem limite de tempo, sem limite de ganhos.",
    date: "Abr 2026",
    readTime: "3 min",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  },
  {
    tag: "Expansão",
    tagColor: "#16a34a",
    title: "extraGO chega a 27 estados: a infraestrutura de mão de obra do Brasil",
    excerpt: "Nossa rede de representantes estaduais garante presença local com escala nacional. Veja como estamos construindo o maior marketplace de trabalho do setor.",
    date: "Abr 2026",
    readTime: "7 min",
    img: "https://images.unsplash.com/photo-1529928520614-7e8571b8b50e?w=800&q=80",
  },
  {
    tag: "PIX",
    tagColor: "#0d9488",
    title: "Pagamento via PIX: por que a extraGO paga mais rápido que qualquer agência",
    excerpt: "Trabalhadores recebem via PIX direto na carteira digital. Sem espera, sem burocracia, sem desconto de agência intermediária.",
    date: "Mar 2026",
    readTime: "4 min",
    img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>
      <InstitutionalNavbar />

      {/* Hero */}
      <section
        className="relative py-16 sm:py-24 px-5 text-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)",
          borderBottom: "1px solid rgba(0,201,167,0.12)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%,rgba(0,201,167,0.10) 0%,transparent 70%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black tracking-[0.14em] uppercase mb-6"
              style={{ background: "rgba(0,201,167,0.10)", border: "1px solid rgba(0,201,167,0.25)", color: "#0d9488" }}
            >
              <BookOpen size={11} /> Blog extraGO
            </div>
            <h1 className="font-black text-slate-900 mb-4 leading-tight" style={{ fontSize: "clamp(28px,5vw,54px)" }}>
              Insights sobre o futuro<br />
              <span style={{ color: "#00c9a7" }}>do trabalho</span>
            </h1>
            <p className="text-slate-500 text-[16px] leading-relaxed max-w-xl mx-auto">
              Tendências, estratégias e histórias de quem está transformando o mercado de trabalho no Brasil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts grid */}
      <main className="flex-1 max-w-6xl mx-auto px-5 py-12 sm:py-16 w-full">
        {/* Featured post */}
        <Reveal>
          <div className="mb-10">
            <Link href="#">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="relative overflow-hidden rounded-3xl cursor-pointer group"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
                }}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-[55%] relative overflow-hidden" style={{ minHeight: 260 }}>
                    <img
                      src={POSTS[0].img}
                      alt={POSTS[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      style={{ minHeight: 260 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 md:to-white hidden md:block" />
                  </div>
                  <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 self-start"
                      style={{ background: `${POSTS[0].tagColor}12`, border: `1px solid ${POSTS[0].tagColor}28`, color: POSTS[0].tagColor }}
                    >
                      <Tag size={9} /> {POSTS[0].tag}
                    </div>
                    <h2 className="text-slate-900 font-black mb-3 leading-tight" style={{ fontSize: "clamp(18px,2.5vw,28px)" }}>
                      {POSTS[0].title}
                    </h2>
                    <p className="text-slate-500 text-[14px] leading-relaxed mb-5">{POSTS[0].excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[12px] text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={11} /> {POSTS[0].readTime}</span>
                        <span>{POSTS[0].date}</span>
                      </div>
                      <span
                        className="flex items-center gap-1.5 text-[13px] font-bold"
                        style={{ color: "#00c9a7" }}
                      >
                        Ler artigo <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.slice(1).map((post, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <Link href="#">
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="h-full overflow-hidden rounded-2xl cursor-pointer group"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="relative overflow-hidden" style={{ height: 180 }}>
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="p-5">
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase mb-3"
                      style={{ background: `${post.tagColor}12`, border: `1px solid ${post.tagColor}25`, color: post.tagColor }}
                    >
                      {post.tag}
                    </div>
                    <h3 className="text-slate-900 font-bold text-[14px] leading-snug mb-2 group-hover:text-teal-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-[12px] leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* Newsletter CTA */}
        <Reveal>
          <div
            className="mt-16 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 50%,#f0f9ff 100%)",
              border: "1px solid rgba(0,201,167,0.18)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(0,201,167,0.10) 0%,transparent 70%)" }}
            />
            <div className="relative z-10">
              <p className="text-[11px] font-black tracking-[0.16em] uppercase mb-3" style={{ color: "#0d9488" }}>Newsletter</p>
              <h3 className="text-slate-900 font-black text-2xl sm:text-3xl mb-3">Receba os melhores conteúdos</h3>
              <p className="text-slate-500 text-[14px] mb-6 max-w-md mx-auto">Insights semanais sobre mercado de trabalho, tecnologia e crescimento profissional.</p>
              <Link href="/register">
                <button
                  className="inline-flex items-center gap-2 rounded-full font-bold text-white text-[13px] px-7 h-11 border-none cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg,#16c47f,#00c9a7)",
                    boxShadow: "0 0 20px rgba(0,201,167,0.28)",
                  }}
                >
                  Criar conta gratuita <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 px-5" style={{ borderColor: "rgba(0,0,0,0.07)", background: "#fff" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoMain} alt="extraGO" style={{ height: "28px", objectFit: "contain", mixBlendMode: "screen" }} />
          <p className="text-[12px] text-slate-400">© 2026 extraGO · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
