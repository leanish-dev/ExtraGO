import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, ChevronRight,
  Home as HomeIcon, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Layers, User, Users, Share2,
  LogIn, UserPlus, BookOpen, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoMain from "@assets/Logo-new_1781073251550.png";

const G = "#16a34a";
const C = "#00c9a7";
const HOVER = "#00c9a7";

const NAV_BG   = "#080F1E";
const NAV_BG2  = "#0B1528";
const ACTIVE_G = "#4ade80";

const FA_PAGES = [
  { label: "Intermediação por Performance",  href: "/financial-architecture/performance",            icon: <Zap size={13} />,        color: "#16a34a" },
  { label: "Indicações Multinível",           href: "/financial-architecture/referrals",             icon: <Network size={13} />,    color: "#3b82f6" },
  { label: "Assinaturas Profissionais",       href: "/financial-architecture/professional-plans",    icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",        href: "/financial-architecture/business-plans",        icon: <Building2 size={13} />,  color: "#d97706" },
  { label: "Receita Operacional",             href: "/financial-architecture/revenue-structure",     icon: <BarChart3 size={13} />,  color: "#16a34a" },
  { label: "Modelo de Expansão",             href: "/financial-architecture/expansion-model",       icon: <Globe size={13} />,      color: "#3b82f6" },
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

/* ── Reusable nav item with icon + label ── */
function NavItem({
  href, icon, label, active, className = "",
}: { href: string; icon: React.ReactNode; label: string; active: boolean; className?: string }) {
  const [hovered, setHovered] = React.useState(false);
  const col = active ? ACTIVE_G : hovered ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.60)";
  return (
    <Link href={href}>
      <div
        className={`relative flex flex-col items-center cursor-pointer ${className}`}
        style={{ padding: "6px clamp(4px,1vw,10px)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ color: col, marginBottom: 2, transition: "color 0.15s", lineHeight: 0 }}>{icon}</div>
        <span style={{ fontSize: "clamp(9px,1.8vw,11px)", fontWeight: 600, color: col, whiteSpace: "nowrap", transition: "color 0.15s" }}>
          {label}
        </span>
        {active && (
          <span className="absolute bottom-0 left-2 right-2 rounded-full" style={{ height: 2.5, background: `linear-gradient(90deg,${G},${C})` }} />
        )}
      </div>
    </Link>
  );
}

/* ── Premium gradient hamburger ── */
function GradientHamburger() {
  return (
    <svg
      width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true"
      style={{
        display: "block",
        filter: "drop-shadow(0 0 5px rgba(0,201,167,0.5)) drop-shadow(0 0 2px rgba(22,163,74,0.35))",
      }}
    >
      <defs>
        <linearGradient id="hbNav" x1="0" y1="0" x2="22" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#16a34a" />
          <stop offset="100%" stopColor="#00c9a7" />
        </linearGradient>
      </defs>
      <rect x="0" y="0"    width="22" height="3"   rx="1.5" fill="url(#hbNav)" />
      <rect x="2" y="7.5"  width="18" height="3"   rx="1.5" fill="url(#hbNav)" />
      <rect x="0" y="15"   width="22" height="3"   rx="1.5" fill="url(#hbNav)" />
    </svg>
  );
}

/* ── FA dropdown — fixed-position to escape any overflow clips ── */
function FADropdown({ open, anchorRef, onClose }: {
  open: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top:  r.bottom + 6,
        left: Math.max(8, Math.min(r.left + r.width / 2 - 180, window.innerWidth - 368)),
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
            boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
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
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${p.color}14`; }}
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

  const H = 66;

  return (
    <>
      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          height: H,
          background: `linear-gradient(180deg, ${NAV_BG} 0%, ${NAV_BG2} 100%)`,
          borderBottom: "1px solid rgba(0,201,167,0.14)",
          boxShadow: "0 2px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset",
          overflow: "visible",
        }}
      >
        {/* subtle tech-line glow at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(0,201,167,0.35) 30%, rgba(22,163,74,0.40) 50%, rgba(0,201,167,0.35) 70%, transparent 100%)" }}
        />

        <div className="w-full h-full flex items-center px-4 sm:px-6" style={{ gap: 0 }}>

          {/* ── LEFT: Logo ── */}
          <Link href="/" aria-label="extraGO – página inicial">
            <div className="flex items-center flex-shrink-0" style={{ marginRight: "clamp(10px,2.5vw,28px)" }}>
              <img
                src={logoMain}
                alt="extraGO"
                style={{
                  height: "clamp(44px, 5.5vw, 50px)",
                  objectFit: "contain",
                  mixBlendMode: "screen",
                  filter: "drop-shadow(0 0 10px rgba(22,163,74,0.45)) drop-shadow(0 0 3px rgba(0,201,167,0.25))",
                }}
              />
            </div>
          </Link>

          {/* ── CENTRE: Nav links with icons ── */}
          <nav
            className="flex items-center justify-center"
            style={{ flex: "1 1 0", minWidth: 0, gap: "clamp(0px,1.2vw,16px)" }}
          >
            {/* ─── Desktop-only extra links (hidden on mobile) ─── */}
            <NavItem href="/#como-funciona" icon={<Zap size={16} />} label="Como Funciona" active={false} className="hidden lg:flex" />
            <NavItem href="/register?role=company" icon={<Building2 size={16} />} label="Empresas" active={false} className="hidden xl:flex" />
            <NavItem href="/register?role=freelancer" icon={<Users size={16} />} label="Profissionais" active={false} className="hidden xl:flex" />
            <NavItem href="/financial-architecture/referrals" icon={<Share2 size={16} />} label="Indicações" active={active("/financial-architecture/referrals")} className="hidden lg:flex" />
            <NavItem href="/modelo-de-negocio" icon={<BarChart3 size={16} />} label="Plataforma" active={active("/modelo-de-negocio")} className="hidden lg:flex" />

            {/* ─── Always-visible links ─── */}
            <NavItem href="/investidores-parceiros" icon={<TrendingUp size={16} />} label="Investidores" active={active("/investidores-parceiros")} />

            {/* Arquitetura Financeira with dropdown */}
            <div ref={faAnchorRef} className="fa-root relative flex flex-col items-center">
              <button
                onClick={() => setFaOpen(o => !o)}
                className="relative flex flex-col items-center cursor-pointer bg-transparent border-none"
                style={{ padding: "6px clamp(4px,1vw,10px)" }}
              >
                <Layers
                  size={16}
                  style={{
                    color: (active("/modelo-de-negocio") || active("/financial-architecture")) ? ACTIVE_G : "rgba(255,255,255,0.55)",
                    marginBottom: 2,
                    transition: "color 0.15s",
                  }}
                />
                <div className="flex items-center gap-0.5">
                  <span
                    style={{
                      fontSize: "clamp(9px,1.8vw,11px)",
                      fontWeight: 600,
                      color: (active("/modelo-de-negocio") || active("/financial-architecture")) ? ACTIVE_G : "rgba(255,255,255,0.72)",
                      whiteSpace: "nowrap",
                      transition: "color 0.15s",
                    }}
                  >
                    <span className="hidden sm:inline">Arq. Financeira</span>
                    <span className="inline sm:hidden">Arq. Fin.</span>
                  </span>
                  <motion.span
                    animate={{ rotate: faOpen ? 180 : 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ color: "rgba(255,255,255,0.40)", marginLeft: 1 }}
                  >
                    <ChevronDown size={9} />
                  </motion.span>
                </div>
                {(active("/modelo-de-negocio") || active("/financial-architecture")) && (
                  <span
                    className="absolute bottom-0 left-2 right-2 rounded-full"
                    style={{ height: 2.5, background: `linear-gradient(90deg,${G},${C})` }}
                  />
                )}
              </button>
              <FADropdown open={faOpen} anchorRef={faAnchorRef} onClose={() => setFaOpen(false)} />
            </div>
          </nav>

          {/* ── RIGHT: Entrar | divider | Hamburger | Home ── */}
          <div className="flex items-center flex-shrink-0" style={{ gap: "clamp(2px,0.8vw,8px)" }}>

            {/* Entrar — filled green pill */}
            <Link href="/login">
              <button
                className="flex items-center rounded-full font-bold cursor-pointer"
                style={{
                  fontSize: "clamp(10px,2vw,12px)",
                  paddingLeft: "clamp(10px,2vw,18px)",
                  paddingRight: "clamp(10px,2vw,18px)",
                  height: 34,
                  color: "#fff",
                  border: "none",
                  background: `linear-gradient(135deg, ${G}, ${C})`,
                  boxShadow: `0 0 16px rgba(22,163,74,0.35)`,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  gap: "clamp(4px,0.8vw,6px)",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 0 22px rgba(22,163,74,0.55)`;
                  el.style.filter = "brightness(1.08)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 0 16px rgba(22,163,74,0.35)`;
                  el.style.filter = "none";
                }}
              >
                <User size={13} />
                Entrar
              </button>
            </Link>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 22,
                background: "rgba(255,255,255,0.12)",
                flexShrink: 0,
                marginLeft: "clamp(2px,0.5vw,4px)",
                marginRight: "clamp(2px,0.5vw,4px)",
              }}
            />

            {/* Hamburger */}
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

            {/* Home */}
            <Link href="/" aria-label="Ir para a página inicial">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 38,
                  height: H,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <HomeIcon
                  size={20}
                  strokeWidth={2}
                  style={{
                    color: "rgba(255,255,255,0.70)",
                    filter: "drop-shadow(0 0 6px rgba(0,229,255,0.40))",
                    transition: "color 0.15s, filter 0.15s",
                  }}
                  onMouseEnter={(e: React.MouseEvent<SVGSVGElement>) => {
                    const el = e.currentTarget as SVGElement;
                    el.style.color = "rgba(255,255,255,0.95)";
                    el.style.filter = "drop-shadow(0 0 10px rgba(0,229,255,0.65))";
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGSVGElement>) => {
                    const el = e.currentTarget as SVGElement;
                    el.style.color = "rgba(255,255,255,0.70)";
                    el.style.filter = "drop-shadow(0 0 6px rgba(0,229,255,0.40))";
                  }}
                />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════ DRAWER ═══════════════════════ */}
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
              style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)" }}
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
                backgroundImage: "url(/drawer-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRight: "1px solid rgba(22,163,74,0.22)",
                boxShadow: "4px 0 60px rgba(0,0,0,0.55)",
              }}
            >
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(2,8,22,0.78)", zIndex: 0 }} />

              {/* Header strip */}
              <div
                className="relative z-10 flex items-center justify-between px-4 border-b flex-shrink-0"
                style={{
                  height: 62,
                  background: `linear-gradient(180deg, rgba(8,15,30,0.96) 0%, rgba(11,21,40,0.90) 100%)`,
                  borderColor: "rgba(22,163,74,0.22)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <img src={logoMain} alt="extraGO" style={{ height: 38, objectFit: "contain", mixBlendMode: "screen", filter: "drop-shadow(0 0 8px rgba(22,163,74,0.40))" }} />
                <button
                  onClick={() => setDrawer(false)}
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.85)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Fechar"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Nav sections */}
              <div className="relative z-10 flex-1 overflow-y-auto py-3 px-3">
                {DRAWER_SECTIONS.map((sec, si) => (
                  <div key={si} className="mb-5">
                    <p className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: "rgba(0,201,167,0.65)" }}>
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
                                background: on ? "rgba(22,163,74,0.20)" : "transparent",
                                color: on ? "#7CFC00" : "rgba(255,255,255,0.88)",
                                fontWeight: on ? 700 : 500,
                                transition: "background 0.12s",
                                border: on ? "1px solid rgba(22,163,74,0.30)" : "1px solid transparent",
                              }}
                              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ color: on ? "#7CFC00" : "rgba(0,201,167,0.70)" }}>{item.icon}</span>
                              <span className="text-[13px] leading-snug">{item.label}</span>
                              {on && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#7CFC00", boxShadow: "0 0 6px #7CFC00" }} />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer CTAs */}
              <div className="relative z-10 flex-shrink-0 p-4 border-t" style={{ borderColor: "rgba(22,163,74,0.22)", background: "rgba(2,8,22,0.60)", backdropFilter: "blur(8px)" }}>
                {user ? (
                  <Link href="/app/dashboard" onClick={() => setDrawer(false)}>
                    <button
                      className="w-full h-11 rounded-full font-bold text-[13px] border-none cursor-pointer"
                      style={{ background: `linear-gradient(135deg,${G},${C})`, color: "#000", boxShadow: "0 0 20px rgba(22,163,74,0.35)" }}
                    >
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawer(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-[13px] border-none cursor-pointer"
                        style={{ background: `linear-gradient(135deg,${G},${C})`, color: "#000", boxShadow: "0 0 18px rgba(22,163,74,0.35)" }}
                      >
                        Entrar <ArrowRight size={12} className="inline ml-1" />
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setDrawer(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-[13px] cursor-pointer"
                        style={{ color: "#7CFC00", border: "1px solid rgba(124,252,0,0.35)", background: "rgba(124,252,0,0.08)" }}
                      >
                        Criar Conta
                      </button>
                    </Link>
                  </div>
                )}
                <p className="text-center text-[10px] mt-3" style={{ color: "rgba(0,201,167,0.55)" }}>
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
