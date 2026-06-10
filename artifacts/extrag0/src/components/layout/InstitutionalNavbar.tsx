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
const HOVER = "#00c9a7";
const DEFAULT_LINK = "#0B1220";

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
    <svg
      width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true"
      style={{
        display: "block",
        filter: [
          "drop-shadow(0 0 5px rgba(0,201,167,0.55))",
          "drop-shadow(0 0 2px rgba(22,163,74,0.40))",
          "drop-shadow(0 1px 3px rgba(0,0,0,0.22))",
        ].join(" "),
      }}
    >
      <defs>
        <linearGradient id="hbg2" x1="0" y1="0" x2="26" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={G} />
          <stop offset="100%" stopColor={C} />
        </linearGradient>
      </defs>
      {/* Top line — full width */}
      <rect x="0" y="0"    width="26" height="3.5" rx="1.75" fill="url(#hbg2)" />
      {/* Middle line — slightly shorter for premium look */}
      <rect x="2" y="8.25" width="22" height="3.5" rx="1.75" fill="url(#hbg2)" />
      {/* Bottom line — full width */}
      <rect x="0" y="16.5" width="26" height="3.5" rx="1.75" fill="url(#hbg2)" />
    </svg>
  );
}

/* ── FA dropdown — rendered via portal-like fixed positioning to escape overflow:hidden ── */
function FADropdown({ open, anchorRef, onClose }: {
  open: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: Math.max(8, rect.left + rect.width / 2 - 180),
      });
    }
  }, [open, anchorRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.16 }}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 360,
            maxWidth: "calc(100vw - 16px)",
            background: "#fff",
            border: "1px solid rgba(22,163,74,0.14)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            borderRadius: 16,
            overflow: "hidden",
            zIndex: 9999,
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
  const faAnchorRef         = React.useRef<HTMLDivElement>(null);

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

  const linkColor = (href: string) => active(href) ? G : DEFAULT_LINK;

  const H = 68;

  return (
    <>
      {/* ═══════════════════════════════════ HEADER ═══════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          height: H,
          backgroundImage: "url(/institutional-navbar.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
          overflow: "visible",
        }}
      >
        <div className="w-full h-full flex items-center" style={{ paddingLeft: 0, paddingRight: 0 }}>

          {/* ── LEFT: transparent click-area over baked-in logo ─────────────────── */}
          <Link href="/" aria-label="extraGO – página inicial">
            <div style={{ width: "clamp(100px, 21vw, 195px)", height: H, flexShrink: 0 }} />
          </Link>

          {/* ── CENTRE: Investidores + Arquitetura Financeira ──────────────────── */}
          <nav
            className="flex items-center justify-center"
            style={{ flex: "1 1 0", minWidth: 0, gap: "clamp(2px,1.5vw,20px)", padding: "0 4px" }}
          >
            {/* Investidores */}
            <Link href="/investidores-parceiros">
              <span
                className="relative py-1 rounded-lg block"
                style={{
                  fontSize: "clamp(11px, 2.5vw, 13px)",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: linkColor("/investidores-parceiros"),
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  textShadow: "0 1px 2px rgba(255,255,255,0.60)",
                  paddingLeft: "clamp(5px,1.6vw,12px)",
                  paddingRight: "clamp(5px,1.6vw,12px)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = HOVER; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = linkColor("/investidores-parceiros"); }}
              >
                Investidores
                {active("/investidores-parceiros") && (
                  <span className="absolute inset-x-1.5 bottom-0 h-[2.5px] rounded-full"
                    style={{ background: `linear-gradient(90deg,${G},${C})` }} />
                )}
              </span>
            </Link>

            {/* Arquitetura Financeira — dropdown via fixed positioning */}
            <div ref={faAnchorRef} className="relative fa-root flex-shrink-0">
              <button
                onClick={() => setFaOpen(o => !o)}
                className="flex items-center rounded-lg"
                style={{
                  gap: "clamp(2px,0.4vw,4px)",
                  paddingLeft: "clamp(5px,1.6vw,12px)",
                  paddingRight: "clamp(5px,1.6vw,12px)",
                  paddingTop: 4,
                  paddingBottom: 4,
                  fontSize: "clamp(11px,2.5vw,13px)",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: active("/modelo-de-negocio") || active("/financial-architecture") ? G : DEFAULT_LINK,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                  textShadow: "0 1px 2px rgba(255,255,255,0.60)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = HOVER; }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color =
                    active("/modelo-de-negocio") || active("/financial-architecture") ? G : DEFAULT_LINK;
                }}
              >
                <span className="hidden sm:inline">Arquitetura Financeira</span>
                <span className="inline sm:hidden">Arq. Fin.</span>
                <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={11} />
                </motion.span>
              </button>
              {(active("/modelo-de-negocio") || active("/financial-architecture")) && (
                <span className="absolute inset-x-1.5 bottom-0 h-[2.5px] rounded-full"
                  style={{ background: `linear-gradient(90deg,${G},${C})` }} />
              )}
              <FADropdown open={faOpen} anchorRef={faAnchorRef} onClose={() => setFaOpen(false)} />
            </div>
          </nav>

          {/* ── RIGHT: Entrar + Hamburger + Home ────────────────────────────────── */}
          <div className="flex items-center flex-shrink-0" style={{ gap: "clamp(0px,0.5vw,4px)" }}>

            {/* Entrar pill */}
            <Link href="/login">
              <button
                className="flex items-center rounded-full font-bold cursor-pointer"
                style={{
                  fontSize: "clamp(10px,2.2vw,12px)",
                  paddingLeft: "clamp(10px,2vw,16px)",
                  paddingRight: "clamp(10px,2vw,16px)",
                  height: 32,
                  color: G,
                  border: `1.5px solid ${G}66`,
                  background: "rgba(255,255,255,0.68)",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.96)";
                  el.style.borderColor = G;
                  el.style.boxShadow = `0 0 12px ${G}30`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.68)";
                  el.style.borderColor = `${G}66`;
                  el.style.boxShadow = "none";
                }}
              >
                Entrar
              </button>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setDrawer(true)}
              aria-label="Abrir menu"
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: H,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <GradientHamburger />
            </button>

            {/* Home — occupies the green/teal artwork area at far right */}
            <Link href="/" aria-label="Ir para a página inicial">
              <div
                className="flex items-center justify-center"
                style={{
                  width: H,
                  height: H,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <HomeIcon
                  size={24}
                  strokeWidth={2}
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    filter: [
                      "drop-shadow(0 1px 4px rgba(0,0,0,0.32))",
                      "drop-shadow(0 0 10px rgba(0,229,255,0.50))",
                      "drop-shadow(0 0 3px rgba(124,252,0,0.30))",
                    ].join(" "),
                  }}
                />
              </div>
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
              {/* Header strip */}
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
                                color: on ? G : "#1E293B",
                                fontWeight: on ? 700 : 500,
                                transition: "background 0.12s",
                              }}
                              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ color: on ? G : "#64748b" }}>{item.icon}</span>
                              <span className="text-[13px] leading-snug">{item.label}</span>
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
                      className="w-full h-11 rounded-full font-bold text-[13px] border-none cursor-pointer"
                      style={{ background: `linear-gradient(135deg,${G},${C})`, color: "#fff" }}
                    >
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawer(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-[13px] border-none cursor-pointer"
                        style={{ background: `linear-gradient(135deg,${G},${C})`, color: "#fff" }}
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
