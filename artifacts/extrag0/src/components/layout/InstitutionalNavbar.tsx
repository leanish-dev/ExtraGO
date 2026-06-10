import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, ChevronRight,
  Home, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Layers,
  LogIn, UserPlus, BookOpen, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ── Brand colours ── */
const G = "#16a34a";
const C = "#00c9a7";

/* ── FA pages ── */
const FA_PAGES = [
  { label: "Intermediação por Performance",  href: "/financial-architecture/performance",            icon: <Zap size={13} />,        color: "#16a34a" },
  { label: "Indicações Multinível",           href: "/financial-architecture/referrals",             icon: <Network size={13} />,    color: "#3b82f6" },
  { label: "Assinaturas Profissionais",       href: "/financial-architecture/professional-plans",    icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",        href: "/financial-architecture/business-plans",        icon: <Building2 size={13} />,  color: "#d97706" },
  { label: "Receita Operacional",             href: "/financial-architecture/revenue-structure",     icon: <BarChart3 size={13} />,  color: "#16a34a" },
  { label: "Modelo de Expansão",              href: "/financial-architecture/expansion-model",       icon: <Globe size={13} />,      color: "#3b82f6" },
  { label: "Representantes Estaduais",        href: "/financial-architecture/state-representatives", icon: <MapPin size={13} />,     color: "#d97706" },
];

/* ── Drawer sections ── */
const DRAWER = [
  { title: "INSTITUCIONAL", items: [
    { label: "Home",                   href: "/",                        icon: <Home size={15} /> },
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

/* ──────────────────────────────────────
   3-line gradient hamburger
────────────────────────────────────── */
function Hamburger() {
  return (
    <svg width="20" height="15" viewBox="0 0 20 15" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="20" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={G} />
          <stop offset="100%" stopColor={C} />
        </linearGradient>
      </defs>
      <rect x="0" y="0"   width="20" height="2.5" rx="1.25" fill="url(#hg)" />
      <rect x="0" y="6.25" width="20" height="2.5" rx="1.25" fill="url(#hg)" />
      <rect x="0" y="12.5" width="20" height="2.5" rx="1.25" fill="url(#hg)" />
    </svg>
  );
}

/* ──────────────────────────────────────
   FA dropdown (desktop)
────────────────────────────────────── */
function FADropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[360px] rounded-2xl overflow-hidden z-50"
          style={{
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
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

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function InstitutionalNavbar() {
  const [drawer, setDrawer] = useState(false);
  const [faOpen, setFaOpen] = useState(false);
  const [location]          = useLocation();
  const { user }            = useAuth();

  /* Close FA dropdown on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".fa-root")) setFaOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* Close on navigation */
  useEffect(() => { setDrawer(false); setFaOpen(false); }, [location]);

  const active = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  /* Shared link text style */
  const linkStyle = (href: string): React.CSSProperties => ({
    color: active(href) ? G : "#1a2a1a",
    fontWeight: active(href) ? 700 : 600,
    transition: "color 0.15s",
    whiteSpace: "nowrap",
    cursor: "pointer",
  });

  /* ─── RENDER ─── */
  return (
    <>
      {/* ════════════════ NAVBAR ════════════════ */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          /*
           * institutional-navbar.png IS the reference artwork:
           * extraGO logo · world-map · candlestick chart · green CTA button.
           * Stretched to fill exactly — no gaps, no crop.
           */
          backgroundImage: "url(/institutional-navbar.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          height: 68,
          /* subtle depth shadow */
          boxShadow: "0 2px 20px rgba(0,0,0,0.10)",
        }}
      >
        {/*
         * Full-width layout row — zero extra padding on right so the green
         * button in the artwork stays flush with our interactive controls.
         */}
        <div className="w-full h-full flex items-center" style={{ paddingLeft: 0, paddingRight: 0 }}>

          {/*
           * ── LEFT: transparent click-area over the baked-in logo.
           *    NO <img> tag — the logo exists only inside institutional-navbar.png.
           *    width ~22 % matches the logo region in the artwork.
           */}
          <Link href="/" aria-label="extraGO — página inicial">
            <div style={{ width: "clamp(110px, 22vw, 200px)", height: 68 }} />
          </Link>

          {/* ── CENTRE: nav links (all screen sizes) ── */}
          <nav className="flex-1 flex items-center justify-center gap-0 sm:gap-1">

            {/* Home */}
            <Link href="/">
              <span
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-[12.5px] block relative"
                style={linkStyle("/")}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = G; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active("/") ? G : "#1a2a1a"; }}
              >
                Home
                {active("/") && (
                  <span className="absolute inset-x-1.5 bottom-0 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg,${G},${C})` }} />
                )}
              </span>
            </Link>

            {/* Investidores */}
            <Link href="/investidores-parceiros">
              <span
                className="px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-[12.5px] block relative"
                style={linkStyle("/investidores-parceiros")}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = G; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active("/investidores-parceiros") ? G : "#1a2a1a"; }}
              >
                Investidores
                {active("/investidores-parceiros") && (
                  <span className="absolute inset-x-1.5 bottom-0 h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg,${G},${C})` }} />
                )}
              </span>
            </Link>

            {/* Arquitetura Financeira — with dropdown on desktop */}
            <div className="relative fa-root">
              <button
                onClick={() => setFaOpen(o => !o)}
                className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-[12.5px] relative"
                style={{
                  ...linkStyle("/modelo-de-negocio"),
                  background: "none",
                  border: "none",
                  color: active("/modelo-de-negocio") || active("/financial-architecture") ? G : "#1a2a1a",
                  fontWeight: active("/modelo-de-negocio") || active("/financial-architecture") ? 700 : 600,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = G; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active("/modelo-de-negocio") || active("/financial-architecture") ? G : "#1a2a1a"; }}
              >
                <span className="hidden sm:inline">Arquitetura Financeira</span>
                <span className="inline sm:hidden">Arq. Financeira</span>
                <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={11} />
                </motion.span>
              </button>
              {(active("/modelo-de-negocio") || active("/financial-architecture")) && (
                <span className="absolute inset-x-1.5 bottom-0 h-[2px] rounded-full"
                  style={{ background: `linear-gradient(90deg,${G},${C})` }} />
              )}
              <FADropdown open={faOpen} onClose={() => setFaOpen(false)} />
            </div>
          </nav>

          {/* ── RIGHT: Entrar + Hamburger ── */}
          <div className="flex items-center flex-shrink-0" style={{ gap: 4 }}>

            {/* Entrar */}
            <Link href="/login">
              <button
                className="flex items-center gap-1 rounded-full font-semibold cursor-pointer transition-all flex-shrink-0"
                style={{
                  fontSize: 11,
                  paddingLeft: 10,
                  paddingRight: 10,
                  height: 30,
                  color: G,
                  border: `1.5px solid ${G}60`,
                  background: "rgba(255,255,255,0.55)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.90)";
                  el.style.borderColor = `${G}`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.55)";
                  el.style.borderColor = `${G}60`;
                }}
              >
                Entrar
              </button>
            </Link>

            {/*
             * Hamburger — sits over the green button region in the artwork.
             * Transparent background so the image's green/teal gradient shows through.
             * The SVG 3-line icon is rendered on top in verde/cyan gradient.
             */}
            <button
              onClick={() => setDrawer(true)}
              aria-label="Abrir menu"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 68,
                height: 68,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Hamburger />
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════ DRAWER ════════════════ */}
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
              style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(4px)" }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[70] flex flex-col"
              style={{
                width: "min(300px, 88vw)",
                background: "#fff",
                borderRight: "1px solid rgba(22,163,74,0.10)",
                boxShadow: "4px 0 40px rgba(0,0,0,0.14)",
              }}
            >
              {/* Drawer header — uses full navbar image as bg strip */}
              <div
                className="flex items-center justify-between px-5 border-b flex-shrink-0"
                style={{
                  height: 60,
                  backgroundImage: "url(/institutional-navbar.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "left center",
                  borderColor: "rgba(22,163,74,0.12)",
                }}
              >
                <div style={{ width: 110 }} /> {/* logo visible via bg */}
                <button
                  onClick={() => setDrawer(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(255,255,255,0.75)", border: "none",
                    color: "#1e293b", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav sections */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {DRAWER.map((section, si) => (
                  <div key={si} className="mb-5">
                    <p className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase"
                      style={{ color: "#94a3b8" }}>
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item, ii) => {
                        const isActive = location === item.href;
                        return (
                          <Link key={ii} href={item.href} onClick={() => setDrawer(false)}>
                            <div
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                              style={{
                                background: isActive ? "rgba(22,163,74,0.09)" : "transparent",
                                color: isActive ? G : "#334155",
                              }}
                              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ color: isActive ? G : "#64748b" }}>{item.icon}</span>
                              <span className="text-[13px] font-medium leading-snug">{item.label}</span>
                              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: G }} />}
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
