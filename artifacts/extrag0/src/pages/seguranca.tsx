import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Server, Key, ArrowRight, FileText } from "lucide-react";
import logoMain from "@assets/Logo-no-text_1781338757912.png";
import { Reveal } from "@/lib/institutional-components";

const PILLARS = [
  {
    icon: <Lock size={22} />,
    color: "#16a34a",
    title: "Dados Criptografados",
    desc: "Todos os dados em trânsito são protegidos por TLS 1.3. Senhas são armazenadas com bcrypt de alta entropia. Nenhuma senha é jamais armazenada em texto claro.",
  },
  {
    icon: <Key size={22} />,
    color: "#3b82f6",
    title: "Autenticação Segura",
    desc: "Tokens Bearer com expiração automática. Sessões gerenciadas com revogação instantânea. Proteção contra força bruta com rate limiting progressivo.",
  },
  {
    icon: <Eye size={22} />,
    color: "#7c3aed",
    title: "Privacidade por Padrão",
    desc: "Seguimos os princípios da LGPD. Coletamos apenas os dados necessários para o funcionamento da plataforma. Você tem direito de acesso, correção e exclusão.",
  },
  {
    icon: <Server size={22} />,
    color: "#d97706",
    title: "Infraestrutura Resiliente",
    desc: "Hospedagem em nuvem com redundância geográfica. Backups diários automáticos. Monitoramento 24/7 com alertas em tempo real.",
  },
  {
    icon: <Shield size={22} />,
    color: "#0d9488",
    title: "Prevenção de Fraudes",
    desc: "Verificação de identidade dos freelancers em múltiplas camadas. Monitoramento de atividade suspeita. Pagamentos protegidos pela plataforma — nunca direto entre usuários.",
  },
  {
    icon: <AlertTriangle size={22} />,
    color: "#e11d48",
    title: "Resposta a Incidentes",
    desc: "Plano de resposta a incidentes com tempo de contenção máximo de 72h. Notificação de usuários afetados conforme exigência legal da LGPD.",
  },
];

const LGPD_ITEMS = [
  "Direito de acesso aos seus dados pessoais",
  "Direito de correção de dados incompletos ou incorretos",
  "Direito de exclusão dos seus dados da plataforma",
  "Direito de portabilidade dos dados",
  "Direito de revogar consentimento a qualquer momento",
  "Notificação em caso de incidente de segurança",
];

export default function SegurancaPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>
      <InstitutionalNavbar />

      {/* Hero */}
      <section
        className="relative py-16 sm:py-24 px-5 text-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#eff6ff 100%)",
          borderBottom: "1px solid rgba(22,163,74,0.12)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%,rgba(22,163,74,0.08) 0%,transparent 70%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black tracking-[0.14em] uppercase mb-6"
              style={{ background: "rgba(22,163,74,0.10)", border: "1px solid rgba(22,163,74,0.25)", color: "#16a34a" }}
            >
              <Shield size={11} /> Segurança & Privacidade
            </div>
            <h1 className="font-black text-slate-900 mb-4 leading-tight" style={{ fontSize: "clamp(28px,5vw,54px)" }}>
              Sua segurança é nossa<br />
              <span style={{ color: "#16a34a" }}>prioridade absoluta</span>
            </h1>
            <p className="text-slate-500 text-[16px] leading-relaxed max-w-xl mx-auto">
              A extraGO foi construída com segurança desde o primeiro commit. Cada camada da plataforma é projetada para proteger seus dados e seus ganhos.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto px-5 py-12 sm:py-16 w-full">

        {/* Pilares de segurança */}
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-[11px] font-black tracking-[0.16em] uppercase mb-3" style={{ color: "#16a34a" }}>Pilares de Segurança</p>
            <h2 className="text-slate-900 font-black text-2xl sm:text-3xl mb-3">Proteção em todas as camadas</h2>
            <p className="text-slate-500 text-[14px] max-w-lg mx-auto">De infra a produto, cada decisão de engenharia considera a segurança dos usuários.</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {PILLARS.map((p, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div
                className="p-6 rounded-2xl h-full"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${p.color}12`, border: `1px solid ${p.color}22` }}
                >
                  <span style={{ color: p.color }}>{p.icon}</span>
                </div>
                <h3 className="text-slate-900 font-bold text-[15px] mb-2">{p.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* LGPD */}
        <Reveal>
          <div
            className="rounded-3xl p-8 sm:p-12 mb-16 relative overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid rgba(22,163,74,0.14)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background: "linear-gradient(90deg,#16a34a,#00c9a7)" }}
            />
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4"
                  style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.20)", color: "#16a34a" }}
                >
                  <FileText size={10} /> LGPD
                </div>
                <h3 className="text-slate-900 font-black text-2xl sm:text-3xl mb-3">Conformidade com a LGPD</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                  A extraGO está em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018). Seus direitos como titular de dados são garantidos e exercitáveis a qualquer momento.
                </p>
                <Link href="mailto:extrago.contato@gmail.com">
                  <button
                    className="inline-flex items-center gap-2 rounded-full font-bold text-white text-[13px] px-6 h-10 border-none cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
                  >
                    Falar com DPO <ArrowRight size={13} />
                  </button>
                </Link>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black tracking-[0.14em] uppercase text-slate-400 mb-4">Seus Direitos</p>
                <ul className="space-y-3">
                  {LGPD_ITEMS.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} />
                      <span className="text-slate-600 text-[13px] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Trust badges */}
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-[11px] font-black tracking-[0.16em] uppercase mb-8" style={{ color: "#64748b" }}>
              Tecnologia e padrões de segurança utilizados
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["TLS 1.3","bcrypt","LGPD","Rate Limiting","Bearer Auth","Encrypted Storage","Auto Backup"].map((badge, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-full text-[12px] font-bold"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "#475569",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div
            className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#f0fdf4,#ecfdf5,#f0f9ff)",
              border: "1px solid rgba(0,201,167,0.15)",
            }}
          >
            <h3 className="text-slate-900 font-black text-2xl sm:text-3xl mb-3">Confiança que se traduz em resultados</h3>
            <p className="text-slate-500 text-[14px] mb-6 max-w-md mx-auto">
              Junte-se a milhares de profissionais e empresas que confiam na extraGO para gerir seus extras com segurança.
            </p>
            <Link href="/register">
              <button
                className="inline-flex items-center gap-2 rounded-full font-bold text-white text-[13px] px-7 h-11 border-none cursor-pointer"
                style={{ background: "linear-gradient(135deg,#16c47f,#00c9a7)", boxShadow: "0 0 20px rgba(0,201,167,0.28)" }}
              >
                Criar conta gratuita <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </Reveal>
      </main>

      <footer className="border-t py-6 px-5" style={{ borderColor: "rgba(0,0,0,0.07)", background: "#fff" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={logoMain} alt="extraGO" style={{ height: "28px", objectFit: "contain", mixBlendMode: "screen" }} />
          <p className="text-[12px] text-slate-400">© 2026 extraGO · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}
