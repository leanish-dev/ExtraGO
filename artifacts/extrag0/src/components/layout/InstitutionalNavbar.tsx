import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  Menu, X, ChevronDown, ChevronRight,
  Home, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Layers,
  LogIn, UserPlus, BookOpen, Shield,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const FA_PAGES = [
  { label: "Intermediação por Performance",  href: "/financial-architecture/performance",            icon: <Zap size={13} />,        color: "#16a34a" },
  { label: "Indicações Multinível",           href: "/financial-architecture/referrals",             icon: <Network size={13} />,    color: "#3b82f6" },
  { label: "Assinaturas Profissionais",       href: "/financial-architecture/professional-plans",    icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",        href: "/financial-architecture/business-plans",        icon: <Building2 size={13} />,  color: "#d97706" },
  { label: "Receita Operacional",             href: "/financial-architecture/revenue-structure",     icon: <BarChart3 size={13} />,  color: "#16a34a" },
  { label: "Modelo de Expansão",              href: "/financial-architecture/expansion-model",       icon: <Globe size={13} />,      color: "#3b82f6" },
  { label: "Representantes Estaduais",        href: "/financial-architecture/state-representatives", icon: <MapPin size={13} />,     color: "#d97706" },
];

const CENTER_LINKS = [
  { label: "Home",                   href: "/" },
  { label: "Investidores",           href: "/investidores-parceiros" },
  { label: "Arquitetura Financeira", href: "/modelo-de-negocio", hasDropdown: true },
];

const DRAWER_SECTIONS = [
  {
    title: "INSTITUCIONAL",
    items: [
      { label: "Home",                   href: "/",                        icon: <Home size={15} /> },
      { label: "Investidores",           href: "/investidores-parceiros",  icon: <TrendingUp size={15} /> },
      { label: "Arquitetura Financeira", href: "/modelo-de-negocio",       icon: <Layers size={15} /> },
    ],
  },
  {
    title: "ARQUITETURA",
    items: FA_PAGES.map(p => ({ label: p.label, href: p.href, icon: p.icon })),
  },
  {
    title: "CONTEÚDO",
    items: [
      { label: "Blog",      href: "/blog",      icon: <BookOpen size={15} /> },
      { label: "Segurança", href: "/seguranca", icon: <Shield size={15} /> },
    ],
  },
  {
    title: "PLATAFORMA",
    items: [
      { label: "Login",    href: "/login",    icon: <LogIn size={15} /> },
      { label: "Cadastro", href: "/register", icon: <UserPlus size={15} /> },
    ],
  },
];

const GREEN = "#16a34a";
const CYAN  = "#00c9a7";
const TEXT  = "#1e293b";
const MUTED = "#64748b";

export default function InstitutionalNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [faOpen, setFaOpen]         = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [location]                  = useLocation();
  const { user }                    = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".fa-dd-root")) setFaOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setDrawerOpen(false); setFaOpen(false); }, [location]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const navBg     = scrolled ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.97)";
  const navShadow = scrolled
    ? "0 2px 20px rgba(0,0,0,0.08), 0 1px 0 rgba(22,163,74,0.12)"
    : "0 1px 0 rgba(22,163,74,0.10)";

  return (
    <>
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: navBg,
          boxShadow: navShadow,
          transition: "background 0.25s ease, box-shadow 0.25s ease",
        }}
      >
        {/* Decorative center artwork — world map + chart */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          <img
            src="/institutional-navbar.png"
            alt=""
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "65%",
              objectFit: "cover",
              objectPosition: "left center",
              opacity: 0.13,
            }}
          />
          {/* Fade left edge so logo stays clean */}
          <div style={{
            position: "absolute", inset: 0, left: 0, width: "30%",
            background: "linear-gradient(to right, rgba(255,255,255,1) 0%, transparent 100%)",
          }} />
          {/* Fade right edge */}
          <div style={{
            position: "absolute", inset: 0, left: "auto", right: 0, width: "15%",
            background: "linear-gradient(to left, rgba(255,255,255,1) 0%, transparent 100%)",
          }} />
        </div>

        <div
          className="relative mx-auto flex items-center px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 1280, height: 64 }}
        >
          {/* ── LEFT: Logo ── */}
          <Link href="/" className="flex-shrink-0 flex items-center" style={{ minWidth: 120 }}>
            <img
              src={logoMain}
              alt="extraGO"
              style={{ height: 38, objectFit: "contain", display: "block" }}
            />
          </Link>

          {/* ── CENTER: Nav links (desktop) ── */}
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-1">
            {CENTER_LINKS.map((link, i) => {
              const active = isActive(link.href);
              if (link.hasDropdown) {
                return (
                  <div key={i} className="relative fa-dd-root">
                    <button
                      onClick={() => setFaOpen(o => !o)}
                      className="flex items-center gap-1 px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                      style={{
                        color: active || location.startsWith("/financial-architecture") ? GREEN : TEXT,
                        background: "none",
                        border: "none",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GREEN; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active || location.startsWith("/financial-architecture") ? GREEN : TEXT; }}
                    >
                      {link.label}
                      <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                        <ChevronDown size={12} />
                      </motion.span>
                    </button>
                    {(active || location.startsWith("/financial-architecture")) && (
                      <span className="absolute inset-x-3 bottom-1 h-[2px] rounded-full" style={{ background: `linear-gradient(90deg,${GREEN},${CYAN})` }} />
                    )}

                    <AnimatePresence>
                      {faOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.16 }}
                          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[380px] rounded-2xl overflow-hidden z-50"
                          style={{
                            background: "#fff",
                            border: "1px solid rgba(22,163,74,0.14)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
                            <Link href="/modelo-de-negocio" onClick={() => setFaOpen(false)}>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <Layers size={12} style={{ color: GREEN }} />
                                <span className="text-[10px] font-black tracking-[0.12em] uppercase" style={{ color: "#94a3b8" }}>Ver documentação completa</span>
                                <ChevronRight size={10} style={{ color: "#cbd5e1" }} />
                              </div>
                            </Link>
                          </div>
                          <div className="p-2">
                            {FA_PAGES.map((page, j) => (
                              <Link key={j} href={page.href} onClick={() => setFaOpen(false)}>
                                <div
                                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${page.color}0c`; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                >
                                  <span style={{ color: page.color }}>{page.icon}</span>
                                  <span className="text-[12.5px] font-medium" style={{ color: "#334155" }}>{page.label}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              return (
                <Link key={i} href={link.href}>
                  <span
                    className="relative px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer block"
                    style={{ color: active ? GREEN : TEXT }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GREEN; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? GREEN : TEXT; }}
                  >
                    {link.label}
                    {active && (
                      <span
                        className="absolute inset-x-3 bottom-1 h-[2px] rounded-full"
                        style={{ background: `linear-gradient(90deg,${GREEN},${CYAN})` }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ── RIGHT: Entrar + Hamburger ── */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0" style={{ minWidth: 120, justifyContent: "flex-end" }}>
            {/* Entrar — visible sm+ */}
            <Link href="/login">
              <button
                className="hidden sm:flex items-center gap-1.5 px-4 h-9 rounded-full text-[12.5px] font-semibold border cursor-pointer transition-all flex-shrink-0"
                style={{
                  color: GREEN,
                  borderColor: `${GREEN}38`,
                  background: `${GREEN}08`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = `${GREEN}15`;
                  el.style.borderColor = `${GREEN}60`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = `${GREEN}08`;
                  el.style.borderColor = `${GREEN}38`;
                }}
              >
                <LogIn size={13} /> Entrar
              </button>
            </Link>

            {/* Hamburger — green/cyan gradient */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(145deg, ${GREEN} 0%, ${CYAN} 100%)`,
                border: "none",
                cursor: "pointer",
                color: "#fff",
                boxShadow: `0 4px 18px rgba(0,201,167,0.36), inset 0 1px 0 rgba(255,255,255,0.18)`,
                transition: "transform 0.14s ease, box-shadow 0.16s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "scale(1.05)";
                el.style.boxShadow = `0 6px 26px rgba(0,201,167,0.52), inset 0 1px 0 rgba(255,255,255,0.18)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "scale(1)";
                el.style.boxShadow = `0 4px 18px rgba(0,201,167,0.36), inset 0 1px 0 rgba(255,255,255,0.18)`;
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <ArrowRight size={16} />
                <Sparkles size={12} />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${GREEN}2a, ${CYAN}22, transparent)` }}
        />
      </header>

      {/* ═══════════════════ DRAWER ═══════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(4px)" }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
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
                boxShadow: "4px 0 40px rgba(0,0,0,0.12)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: "rgba(22,163,74,0.10)" }}
              >
                <Link href="/" onClick={() => setDrawerOpen(false)}>
                  <img src={logoMain} alt="extraGO" style={{ height: 32, objectFit: "contain" }} />
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(0,0,0,0.05)", border: "none",
                    color: "#64748b", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 px-3">
                {DRAWER_SECTIONS.map((section, si) => (
                  <div key={si} className="mb-5">
                    <p className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: "#94a3b8" }}>
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item, ii) => {
                        const active = location === item.href;
                        return (
                          <Link key={ii} href={item.href} onClick={() => setDrawerOpen(false)}>
                            <div
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                              style={{
                                background: active ? "rgba(22,163,74,0.09)" : "transparent",
                                color: active ? GREEN : "#334155",
                              }}
                              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
                              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ color: active ? GREEN : "#64748b" }}>{item.icon}</span>
                              <span className="text-[13px] font-medium leading-snug">{item.label}</span>
                              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
                {user ? (
                  <Link href="/app/dashboard" onClick={() => setDrawerOpen(false)}>
                    <button
                      className="w-full h-11 rounded-full font-bold text-white text-[13px] border-none cursor-pointer"
                      style={{ background: `linear-gradient(135deg,${GREEN},${CYAN})` }}
                    >
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawerOpen(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-white text-[13px] border-none cursor-pointer"
                        style={{ background: `linear-gradient(135deg,${GREEN},${CYAN})` }}
                      >
                        Entrar <ArrowRight size={12} className="inline ml-1" />
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setDrawerOpen(false)}>
                      <button
                        className="w-full h-10 rounded-full font-bold text-[13px] cursor-pointer border"
                        style={{ color: GREEN, borderColor: "rgba(22,163,74,0.30)", background: "rgba(22,163,74,0.05)" }}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
