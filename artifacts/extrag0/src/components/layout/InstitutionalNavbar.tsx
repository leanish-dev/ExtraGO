import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  Menu, X, ChevronDown, ChevronRight,
  Home, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Sparkles, Mail, Layers,
  Shield, BookOpen, Briefcase, Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─── Dropdown pages ─── */
const FA_PAGES = [
  { label: "Intermediação por Performance", href: "/financial-architecture/performance",           icon: <Zap size={13} />,       color: "#16a34a" },
  { label: "Indicações Multinível",          href: "/financial-architecture/referrals",            icon: <Network size={13} />,   color: "#3b82f6" },
  { label: "Assinaturas Profissionais",      href: "/financial-architecture/professional-plans",   icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",       href: "/financial-architecture/business-plans",       icon: <Building2 size={13} />, color: "#d97706" },
  { label: "Estrutura Financeira",           href: "/financial-architecture/revenue-structure",    icon: <BarChart3 size={13} />, color: "#16a34a" },
  { label: "Modelo de Expansão",             href: "/financial-architecture/expansion-model",      icon: <Globe size={13} />,     color: "#3b82f6" },
  { label: "Representantes Estaduais",       href: "/financial-architecture/state-representatives",icon: <MapPin size={13} />,    color: "#d97706" },
];

/* ─── Main nav items (desktop) ─── */
const DESKTOP_LINKS = [
  { label: "Início",        href: "/" },
  { label: "Empresas",      href: "/register?role=company" },
  { label: "Freelancers",   href: "/register?role=freelancer" },
  { label: "Investidores",  href: "/investidores-parceiros" },
  { label: "Roadmap",       href: "/modelo-de-negocio" },
  { label: "Segurança",     href: "/seguranca" },
  { label: "Blog",          href: "/blog" },
  { label: "Contato",       href: "mailto:extrago.contato@gmail.com", external: true },
];

const DRAWER_SECTIONS = [
  {
    title: "INSTITUCIONAL",
    items: [
      { label: "Home",                   href: "/",                                icon: <Home size={15} /> },
      { label: "Empresas",               href: "/register?role=company",           icon: <Briefcase size={15} /> },
      { label: "Freelancers",            href: "/register?role=freelancer",        icon: <Users size={15} /> },
      { label: "Investidores",           href: "/investidores-parceiros",          icon: <TrendingUp size={15} /> },
      { label: "Arquitetura Financeira", href: "/modelo-de-negocio",              icon: <Layers size={15} /> },
      { label: "Roadmap",                href: "/modelo-de-negocio",              icon: <BarChart3 size={15} /> },
      { label: "Segurança",              href: "/seguranca",                      icon: <Shield size={15} /> },
      { label: "Blog",                   href: "/blog",                           icon: <BookOpen size={15} /> },
      { label: "Contato",                href: "mailto:extrago.contato@gmail.com", icon: <Mail size={15} />, isExternal: true },
    ],
  },
  {
    title: "ARQUITETURA FINANCEIRA",
    items: FA_PAGES.map(p => ({ label: p.label, href: p.href, icon: p.icon })),
  },
];

const GREEN  = "#16a34a";
const CYAN   = "#00c9a7";
const TEXT   = "#1e293b";
const MUTED  = "#64748b";

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
    href.startsWith("mailto") ? false : location === href || (href !== "/" && location.startsWith(href));

  /* ── Visual state ── */
  const headerBg = scrolled
    ? "rgba(255,255,255,0.98)"
    : "rgba(255,255,255,0.96)";
  const headerShadow = scrolled
    ? "0 2px 24px rgba(0,0,0,0.09), 0 1px 0 rgba(22,163,74,0.10)"
    : "0 1px 0 rgba(22,163,74,0.10)";

  return (
    <>
      {/* ═══════════ NAVBAR ═══════════ */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: headerBg,
          boxShadow: headerShadow,
          backdropFilter: "blur(20px) saturate(180%)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8" style={{ height: 64 }}>

          {/* ── Logo ── */}
          <Link href="/" className="flex-shrink-0 mr-6">
            <img
              src={logoMain}
              alt="extraGO"
              style={{ height: 36, objectFit: "contain", display: "block" }}
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden xl:flex items-center gap-0 flex-1 min-w-0">
            {DESKTOP_LINKS.map((link, i) => {
              const active = isActive(link.href);
              if (link.external) {
                return (
                  <a
                    key={i}
                    href={link.href}
                    className="relative px-2.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap"
                    style={{ color: MUTED }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GREEN; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link key={i} href={link.href}>
                  <span
                    className="relative px-2.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer block"
                    style={{ color: active ? GREEN : TEXT }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GREEN; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? GREEN : TEXT; }}
                  >
                    {link.label}
                    {active && (
                      <span
                        className="absolute inset-x-2.5 bottom-0 h-[2px] rounded-full"
                        style={{ background: `linear-gradient(90deg,${GREEN},${CYAN})` }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}

            {/* Arquitetura dropdown */}
            <div className="relative fa-dd-root">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 text-[12.5px] font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap"
                style={{ color: location.startsWith("/financial-architecture") ? GREEN : TEXT, background: "none", border: "none", cursor: "pointer" }}
                onClick={() => setFaOpen(o => !o)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GREEN; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = location.startsWith("/financial-architecture") ? GREEN : TEXT; }}
              >
                Arquitetura
                <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={11} />
                </motion.span>
              </button>

              <AnimatePresence>
                {faOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[420px] rounded-2xl overflow-hidden z-50"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(22,163,74,0.14)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
                      <Link href="/modelo-de-negocio" onClick={() => setFaOpen(false)}>
                        <div className="flex items-center gap-2 group cursor-pointer">
                          <Layers size={13} style={{ color: GREEN }} />
                          <span className="text-[11px] font-black tracking-[0.12em] uppercase" style={{ color: "#94a3b8" }}>
                            Ver documentação completa
                          </span>
                          <ChevronRight size={10} style={{ color: "#cbd5e1" }} />
                        </div>
                      </Link>
                    </div>
                    <div className="p-2">
                      {FA_PAGES.map((page, i) => (
                        <Link key={i} href={page.href} onClick={() => setFaOpen(false)}>
                          <div
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all group"
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${page.color}0c`; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <span style={{ color: page.color }}>{page.icon}</span>
                            <span className="text-[12.5px] font-medium leading-tight" style={{ color: "#334155" }}>
                              {page.label}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {/* CTA — sm and up */}
            <div className="hidden sm:block">
              <Link href={user ? "/app/dashboard" : "/login"}>
                <button
                  style={{
                    height: 36,
                    padding: "0 18px",
                    borderRadius: 999,
                    background: `linear-gradient(135deg,${GREEN} 0%,${CYAN} 100%)`,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: `0 0 18px rgba(0,201,167,0.30)`,
                    transition: "box-shadow 0.2s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(0,201,167,0.52)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(0,201,167,0.30)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  {user ? "Meu Painel" : "Entrar"} <ArrowRight size={13} />
                </button>
              </Link>
            </div>

            {/* Mobile Entrar pill */}
            <div className="flex sm:hidden">
              <Link href={user ? "/app/dashboard" : "/login"}>
                <button
                  style={{
                    height: 32,
                    padding: "0 14px",
                    borderRadius: 999,
                    background: `linear-gradient(135deg,${GREEN},${CYAN})`,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 12,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {user ? "App" : "Entrar"}
                </button>
              </Link>
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(22,163,74,0.07)",
                border: "1px solid rgba(22,163,74,0.16)",
                color: "#16a34a",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.18s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(22,163,74,0.14)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(22,163,74,0.07)"; }}
            >
              <Menu size={17} />
            </button>
          </div>
        </div>

        {/* ── Green accent line ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg,transparent,${GREEN}28,${CYAN}22,transparent)` }} />
      </header>

      {/* ═══════════ DRAWER ═══════════ */}
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
              style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(4px)" }}
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
              {/* Header */}
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
                    background: "rgba(0,0,0,0.05)",
                    border: "none", color: "#64748b", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav list */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {DRAWER_SECTIONS.map((section, si) => (
                  <div key={si} className="mb-5">
                    <p
                      className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase"
                      style={{ color: "#94a3b8" }}
                    >
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item, ii) => {
                        const active = location === item.href;
                        if ("isExternal" in item && item.isExternal) {
                          return (
                            <a key={ii} href={item.href} className="block" onClick={() => setDrawerOpen(false)}>
                              <DrawerItem icon={item.icon} label={item.label} isActive={false} />
                            </a>
                          );
                        }
                        return (
                          <Link key={ii} href={item.href} onClick={() => setDrawerOpen(false)}>
                            <DrawerItem icon={item.icon} label={item.label} isActive={active} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer CTA */}
              <div
                className="flex-shrink-0 p-4 border-t"
                style={{ borderColor: "rgba(22,163,74,0.10)" }}
              >
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

/* ─── Drawer list item ─── */
function DrawerItem({ icon, label, isActive }: { icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
      style={{
        background: isActive ? "rgba(22,163,74,0.09)" : "transparent",
        color: isActive ? GREEN : "#334155",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ color: isActive ? GREEN : "#64748b" }}>{icon}</span>
      <span className="text-[13px] font-medium leading-snug">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />}
    </div>
  );
}

