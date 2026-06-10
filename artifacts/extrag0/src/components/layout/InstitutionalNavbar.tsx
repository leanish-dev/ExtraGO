import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, ChevronRight,
  Home as HomeIcon, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Layers,
  LogIn, UserPlus, BookOpen, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const G = "#16a34a";
const C = "#00c9a7";

const FA_PAGES = [
  { label: "Intermediação por Performance",  href: "/financial-architecture/performance",            icon: <Zap size={13} />,        color: "#16a34a" },
  { label: "Indicações Multinível",           href: "/financial-architecture/referrals",             icon: <Network size={13} />,    color: "#3b82f6" },
  { label: "Assinaturas Profissionais",       href: "/financial-architecture/professional-plans",    icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",        href: "/financial-architecture/business-plans",        icon: <Building2 size={13} />,  color: "#d97706" },
  { label: "Receita Operacional",             href: "/financial-architecture/revenue-structure",     icon: <BarChart3 size={13} />,  color: "#16a34a" },
  { label: "Modelo de Expansão",              href: "/financial-architecture/expansion-model",       icon: <Globe size={13} />,      color: "#3b82f6" },
  { label: "Representantes Estaduais",        href: "/financial-architecture/state-representatives", icon: <MapPin size={13} />,     color: "#d97706" },
];

const DRAWER_SECTIONS = [
  { title: "INSTITUCIONAL", items: [
    { label: "Home",                   href: "/",                        icon: <HomeIcon size={15} /> },
    { label: "Investidores",           href: "/investidores-parceiros",  icon: <TrendingUp size={15} /> },
    { label: "Arquitetura Financeira", href: "/modelo-de-negocio",       icon: <Layers size={15} /> },
  ]},
  { title: "ARQUITETURA", items: FA_PAGES.map(p => ({ label: p.label, href: p.href, icon: p.icon })) },
  { title: "CONTEÚDO", items: [
    { label: "Blog",      href: "/blog",      icon: <BookOpen size={15} /> },
    { label: "Segurança", href: "/seguranca", icon: <Shield size={15} /> },
  ]},
  { title: "PLATAFORMA", items: [
    { label: "Login",    href: "/login",    icon: <LogIn size={15} /> },
    { label: "Cadastro", href: "/register", icon: <UserPlus size={15} /> },
  ]},
];

/* ── Premium 3-line gradient hamburger ── */
function GradientHamburger() {
  return (
    <svg width="24" height="18" viewBox="0 0 24 18" fill="none" aria-hidden="true" style={{ display: "block", filter: "drop-shadow(0 0 4px rgba(0,201,167,0.35))" }}>
      <defs>
        <linearGradient id="hbg" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={G} />
          <stop offset="100%" stopColor={C} />
        </linearGradient>
      </defs>
      <rect x="0" y="0"   width="24" height="3" rx="1.5" fill="url(#hbg)" />
      <rect x="0" y="7.5" width="24" height="3" rx="1.5" fill="url(#hbg)" />
      <rect x="0" y="15"  width="24" height="3" rx="1.5" fill="url(#hbg)" />
    </svg>
  );
}

/* ── FA dropdown ── */
function FADropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 rounded-2xl overflow-hidden z-50"
          style={{
            width: 360,
            background: "#fff",
            border: "1px solid rgba(22,163,74,0.14)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
          }}
        >
          <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
            <Link href="/modelo-de-negocio" onClick={onClose}>
              <div className="flex items-center gap-2 cursor-pointer">
                <Layers size={12} color={G} />
                <span className="text-[10px] font-black tracking-[0.12em] uppercase" style={{ color: "#94a3b8" }}>
                  Ver documentação completa
                </span>
                <ChevronRight size={10} color="#cbd5e1" />
              </div>
            </Link>
          </div>
          <div className="p-2">
            {FA_PAGES.map((p, i) => (
              <Link key={i} href={p.href} onClick={onClose}>
                <div
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer"
                  style={{ transition: "background 0.12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${p.color}12`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{ color: p.color }}>{p.icon}</span>
                  <span className="text-[12.5px] font-medium" style={{ color: "#334155" }}>{p.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ════════════════════════════════════════
   MAIN NAVBAR
════════════════════════════════════════ */
export default function InstitutionalNavbar() {
  const [drawer, setDrawer] = useState(false);
  const [faOpen, setFaOpen] = useState(false);
  const [loc]               = useLocation();
  const { user }            = useAuth();

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".fa-root")) setFaOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setDrawer(false); setFaOpen(false); }, [loc]);

  const active = (href: string) =>
    href === "/" ? loc === "/" : loc.startsWith(href);

  const linkColor = (href: string) =>
    active(href) ? G : "#1e2d1e";

  const H = 68; // navbar height

  return (
    <>
      {/* ═══════════════════════════════════ HEADER ═══════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full overflow-hidden"
        style={{
          height: H,
          backgroundImage: "url(/institutional-navbar.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow: "0 2px 16px rgba(0,0,0,0.09)",
        }}
      >
        <div
          className="w-full h-full flex items-center"
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >

          {/* ── LEFT: transparent click-area over baked-in logo ─────────────────── */}
          {/* The logo lives INSIDE institutional-navbar.png. No <img> in DOM. */}
          <Link href="/" aria-label="extraGO – página inicial">
            <div style={{ width: "clamp(100px, 21vw, 195px)", height: H }} />
          </Link>

          {/* ── CENTRE: Investidores + Arquitetura Financeira (all screen sizes) ── */}
          <nav className="flex flex-1 items-center justify-center" style={{ gap: 0 }}>

            {/* Investidores */}
            <Link href="/investidores-parceiros">
              <span
                className="relative px-1.5 sm:px-2.5 py-1 rounded-lg block"
                style={{
                  fontSize: "clamp(9px, 2.4vw, 12.5px)",
                  fontWeight: active("/investidores-parceiros") ? 700 : 600,
                  color: linkColor("/investidores-parceiros"),
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = G; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = linkColor("/investidores-parceiros"); }}
              >
                Investidores
                {active("/investidores-parceiros") && (
                  <span className="absolute inset-x-1.5 bottom-0 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg,${G},${C})` }} />
                )}
              </span>
            </Link>

            {/* Arquitetura Financeira — with dropdown */}
            <div className="relative fa-root">
              <button
                onClick={() => setFaOpen(o => !o)}
                className="flex items-center rounded-lg"
                style={{
                  gap: "clamp(2px,0.5vw,4px)",
                  paddingLeft: "clamp(4px,1.5vw,10px)",
                  paddingRight: "clamp(4px,1.5vw,10px)",
                  paddingTop: 4,
                  paddingBottom: 4,
                  fontSize: "clamp(9px,2.4vw,12.5px)",
                  fontWeight: active("/modelo-de-negocio") || active("/financial-architecture") ? 700 : 600,
                  color: active("/modelo-de-negocio") || active("/financial-architecture") ? G : "#1e2d1e",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = G; }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    active("/modelo-de-negocio") || active("/financial-architecture") ? G : "#1e2d1e";
                }}
              >
                <span className="hidden sm:inline">Arquitetura Financeira</span>
                <span className="inline sm:hidden">Arq. Fin.</span>
                <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={10} />
                </motion.span>
              </button>
              {(active("/modelo-de-negocio") || active("/financial-architecture")) && (
                <span className="absolute inset-x-1.5 bottom-0 h-[2px] rounded-full"
                  style={{ background: `linear-gradient(90deg,${G},${C})` }} />
              )}
              <FADropdown open={faOpen} onClose={() => setFaOpen(false)} />
            </div>
          </nav>

          {/* ── RIGHT: Entrar + Hamburger (drawer) + Home-arrow (artwork green btn) ── */}
          <div className="flex items-center flex-shrink-0" style={{ gap: 0 }}>

            {/* Entrar pill */}
            <Link href="/login">
              <button
                className="flex items-center rounded-full font-semibold cursor-pointer"
                style={{
                  fontSize: "clamp(9px,2.2vw,12px)",
                  paddingLeft: "clamp(6px,1.8vw,12px)",
                  paddingRight: "clamp(6px,1.8vw,12px)",
                  height: 28,
                  marginRight: "clamp(2px,1vw,8px)",
                  color: G,
                  border: `1.5px solid ${G}55`,
                  background: "rgba(255,255,255,0.58)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.92)";
                  el.style.borderColor = G;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.58)";
                  el.style.borderColor = `${G}55`;
                }}
              >
                Entrar
              </button>
            </Link>

            {/*
             * Hamburger button — transparent so the background artwork shows through.
             * Opens drawer. Positioned BEFORE the green artwork arrow button.
             * 3 gradient lines rendered in SVG.
             */}
            <button
              onClick={() => setDrawer(true)}
              aria-label="Abrir menu"
              className="flex items-center justify-center"
              style={{
                width: 38,
                height: H,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <GradientHamburger />
            </button>

            {/*
             * Green-arrow Home button — transparent overlay positioned OVER the
             * green/teal button that is baked into institutional-navbar.png artwork.
             * Width matches the green CTA area in the reference image (~68 px).
             * Clicking navigates to the landing page ("/").
             */}
            <Link href="/" aria-label="Ir para a página inicial">
              <div
                style={{
                  width: H,
                  height: H,
                  background: "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════ DRAWER ═══════════════════════════════════ */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(4px)" }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.26, ease: [0.19, 1, 0.22, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[70] flex flex-col"
              style={{
                width: "min(300px, 88vw)",
                background: "#fff",
                borderRight: "1px solid rgba(22,163,74,0.10)",
                boxShadow: "4px 0 40px rgba(0,0,0,0.12)",
              }}
            >
              {/* Header strip — same artwork so logo appears naturally */}
              <div
                className="flex items-center justify-between px-4 border-b flex-shrink-0"
                style={{
                  height: 58,
                  backgroundImage: "url(/institutional-navbar.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "left center",
                  borderColor: "rgba(22,163,74,0.12)",
                }}
              >
                <div style={{ width: 110 }} />
                <button
                  onClick={() => setDrawer(false)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(255,255,255,0.78)",
                    border: "none", color: "#1e293b",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Fechar"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Nav sections */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {DRAWER_SECTIONS.map((sec, si) => (
                  <div key={si} className="mb-5">
                    <p
                      className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase"
                      style={{ color: "#94a3b8" }}
                    >
                      {sec.title}
                    </p>
                    <div className="space-y-0.5">
                      {sec.items.map((item, ii) => {
                        const on = loc === item.href;
                        return (
                          <Link key={ii} href={item.href} onClick={() => setDrawer(false)}>
                            <div
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
                              style={{
                                background: on ? `${G}12` : "transparent",
                                color: on ? G : "#334155",
                                transition: "background 0.12s",
                              }}
                              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ color: on ? G : "#64748b" }}>{item.icon}</span>
                              <span className="text-[13px] font-medium leading-snug">{item.label}</span>
                              {on && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: G }} />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer CTAs */}
              <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
                {user ? (
                  <Link href="/app/dashboard" onClick={() => setDrawer(false)}>
                    <button
                      className="w-full h-11 rounded-full font-bold text-white text-[13px] border-none cursor-pointer"
                      style={{ background: `linear-gradient(135deg,${G},${C})` }}
                    >
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawer(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-white text-[13px] border-none cursor-pointer"
                        style={{ background: `linear-gradient(135deg,${G},${C})` }}
                      >
                        Entrar <ArrowRight size={12} className="inline ml-1" />
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setDrawer(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-[13px] cursor-pointer border"
                        style={{ color: G, borderColor: `${G}40`, background: `${G}08` }}
                      >
                        Criar Conta
                      </button>
                    </Link>
                  </div>
                )}
                <p className="text-center text-[10px] mt-3" style={{ color: "#94a3b8" }}>
                  extraGO · A Infraestrutura de Mão de Obra do Brasil
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
