import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  Menu, X, ChevronDown, ChevronRight,
  Home, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Sparkles, Mail, Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

/* ─── route groups ─── */
const FA_PAGES = [
  { label: "Intermediação por Performance", href: "/financial-architecture/performance", icon: <Zap size={13} />, color: "#16a34a" },
  { label: "Indicações Multinível",          href: "/financial-architecture/referrals",          icon: <Network size={13} />, color: "#3b82f6" },
  { label: "Assinaturas Profissionais",      href: "/financial-architecture/professional-plans", icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",       href: "/financial-architecture/business-plans",     icon: <Building2 size={13} />, color: "#d97706" },
  { label: "Estrutura Financeira",           href: "/financial-architecture/revenue-structure",  icon: <BarChart3 size={13} />, color: "#16a34a" },
  { label: "Modelo de Expansão",             href: "/financial-architecture/expansion-model",    icon: <Globe size={13} />, color: "#3b82f6" },
  { label: "Representantes Estaduais",       href: "/financial-architecture/state-representatives", icon: <MapPin size={13} />, color: "#d97706" },
];

const DRAWER_SECTIONS = [
  {
    title: "INSTITUCIONAL",
    items: [
      { label: "Home",              href: "/",                        icon: <Home size={15} /> },
      { label: "Investidores",      href: "/investidores-parceiros",  icon: <TrendingUp size={15} /> },
      { label: "Arquitetura Financeira", href: "/modelo-de-negocio", icon: <Layers size={15} /> },
      { label: "Contato",           href: "mailto:extrago.contato@gmail.com", icon: <Mail size={15} />, isExternal: true },
    ],
  },
  {
    title: "ARQUITETURA FINANCEIRA",
    items: FA_PAGES.map(p => ({ label: p.label, href: p.href, icon: p.icon })),
  },
];

/* ─── props ─── */
interface PublicNavbarProps {
  variant?: "light" | "dark";
}

export default function PublicNavbar({ variant = "light" }: PublicNavbarProps) {
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [faOpen, setFaOpen]           = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [location]                    = useLocation();
  const { user }                      = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".fa-dropdown-root")) setFaOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* close drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const isDark = variant === "dark";
  const navBg = isDark
    ? scrolled ? "rgba(4,12,24,0.96)" : "rgba(4,12,24,0.82)"
    : scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.92)";
  const borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(22,163,74,0.12)";
  const textColor   = isDark ? "rgba(255,255,255,0.82)" : "#334155";
  const textHover   = isDark ? "#ffffff" : "#0f172a";
  const logoFilter  = isDark ? "brightness(1.1)" : "none";

  const activeLink = (href: string) => location === href;

  return (
    <>
      {/* ── Main Navbar ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: navBg,
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: `1px solid ${borderColor}`,
          boxShadow: scrolled
            ? isDark
              ? "0 4px 32px rgba(0,0,0,0.55)"
              : "0 4px 24px rgba(0,0,0,0.07)"
            : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 h-[64px] sm:h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 mr-4">
            <img
              src={logoMain}
              alt="extraGO"
              style={{
                height: "40px",
                objectFit: "contain",
                filter: logoFilter,
              }}
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {/* Home */}
            <NavLink href="/" active={activeLink("/")} textColor={textColor} textHover={textHover}>
              Home
            </NavLink>

            {/* Investidores */}
            <NavLink href="/investidores-parceiros" active={activeLink("/investidores-parceiros")} textColor={textColor} textHover={textHover}>
              Investidores
            </NavLink>

            {/* Arquitetura Financeira — dropdown */}
            <div className="relative fa-dropdown-root">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150"
                style={{ color: activeLink("/modelo-de-negocio") ? "#16a34a" : textColor }}
                onClick={() => setFaOpen(o => !o)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#16a34a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = activeLink("/modelo-de-negocio") ? "#16a34a" : textColor; }}
              >
                Arquitetura Financeira
                <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={12} />
                </motion.span>
              </button>

              <AnimatePresence>
                {faOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[420px] rounded-2xl overflow-hidden z-50"
                    style={{
                      background: "rgba(255,255,255,0.98)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(22,163,74,0.14)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(22,163,74,0.06)",
                    }}
                  >
                    <div className="px-4 pt-3 pb-1.5 border-b" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
                      <Link href="/modelo-de-negocio" onClick={() => setFaOpen(false)}>
                        <div className="flex items-center gap-2 group cursor-pointer">
                          <Layers size={14} style={{ color: "#16a34a" }} />
                          <span className="text-[11px] font-black tracking-[0.13em] uppercase text-slate-400 group-hover:text-slate-600 transition-colors">
                            Ver documentação completa
                          </span>
                          <ChevronRight size={10} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </Link>
                    </div>
                    <div className="p-2">
                      {FA_PAGES.map((page, i) => (
                        <Link key={i} href={page.href} onClick={() => setFaOpen(false)}>
                          <div
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all group"
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${page.color}08`; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                          >
                            <span style={{ color: page.color }}>{page.icon}</span>
                            <span className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors leading-tight">
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

            {/* Contato */}
            <a
              href="mailto:extrago.contato@gmail.com"
              className="px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150"
              style={{ color: textColor }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = textHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textColor; }}
            >
              Contato
            </a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 ml-4">

            {/* Auth CTA — desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <Link href="/app/dashboard">
                  <button
                    className="rounded-full font-bold text-black border-none cursor-pointer flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#7CFC00 0%,#9bff14 50%,#00E5FF 100%)",
                      boxShadow: "0 0 20px rgba(124,252,0,0.28)",
                      height: "38px",
                      padding: "0 20px",
                      fontSize: "13px",
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 34px rgba(124,252,0,0.50)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(124,252,0,0.28)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    Meu Painel <ArrowRight size={13} className="inline ml-1" />
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button
                    className="rounded-full font-bold text-black border-none cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg,#16a34a 0%,#22c55e 50%,#16a34a 100%)",
                      boxShadow: "0 0 18px rgba(22,163,74,0.30)",
                      height: "38px",
                      padding: "0 20px",
                      fontSize: "13px",
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(22,163,74,0.50)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(22,163,74,0.30)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <Sparkles size={12} />
                    Acessar
                    <ArrowRight size={12} />
                  </button>
                </Link>
              )}
            </div>

            {/* Hamburger — always visible */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer transition-colors"
              style={{
                color: textColor,
                background: "transparent",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
              }}
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(4px)" }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
              className="fixed left-0 top-0 bottom-0 z-[70] flex flex-col"
              style={{
                width: "min(300px, 85vw)",
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(28px)",
                borderRight: "1px solid rgba(22,163,74,0.12)",
                boxShadow: "4px 0 40px rgba(0,0,0,0.16)",
              }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: "rgba(22,163,74,0.10)" }}
              >
                <Link href="/" onClick={() => setDrawerOpen(false)}>
                  <img src={logoMain} alt="extraGO" style={{ height: "34px", objectFit: "contain" }} />
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer transition-colors"
                  style={{ background: "rgba(0,0,0,0.05)", color: "#475569" }}
                  aria-label="Fechar menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer nav */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {DRAWER_SECTIONS.map((section, si) => (
                  <div key={si} className="mb-4">
                    <p
                      className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase"
                      style={{ color: "#94a3b8" }}
                    >
                      {section.title}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item, ii) => {
                        const isActive = location === item.href;
                        if ("isExternal" in item && item.isExternal) {
                          return (
                            <a key={ii} href={item.href} className="block">
                              <DrawerItem icon={item.icon} label={item.label} isActive={false} />
                            </a>
                          );
                        }
                        return (
                          <Link key={ii} href={item.href} onClick={() => setDrawerOpen(false)}>
                            <DrawerItem icon={item.icon} label={item.label} isActive={isActive} />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer footer */}
              <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: "rgba(22,163,74,0.10)" }}>
                {user ? (
                  <Link href="/app/dashboard" onClick={() => setDrawerOpen(false)}>
                    <button
                      className="w-full rounded-full font-bold text-black border-none cursor-pointer h-11 text-[13px]"
                      style={{ background: "linear-gradient(135deg,#7CFC00,#9bff14)" }}
                    >
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawerOpen(false)}>
                      <button
                        className="w-full rounded-full font-bold text-black border-none cursor-pointer h-10 text-[13px]"
                        style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}
                      >
                        Entrar <ArrowRight size={12} className="inline ml-1" />
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setDrawerOpen(false)}>
                      <button
                        className="w-full rounded-full font-bold cursor-pointer h-10 text-[13px] border"
                        style={{ color: "#16a34a", borderColor: "rgba(22,163,74,0.30)", background: "rgba(22,163,74,0.06)" }}
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

/* ─── Drawer item ─── */
function DrawerItem({ icon, label, isActive }: { icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
      style={{
        background: isActive ? "rgba(22,163,74,0.10)" : "transparent",
        color: isActive ? "#16a34a" : "#334155",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ color: isActive ? "#16a34a" : "#64748b" }}>{icon}</span>
      <span className="text-[13px] font-medium leading-snug">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} />}
    </div>
  );
}

/* ─── Desktop nav link ─── */
function NavLink({ href, active, textColor, textHover, children }: {
  href: string; active: boolean; textColor: string; textHover: string; children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <span
        className="px-3 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-colors duration-150 block"
        style={{ color: active ? "#16a34a" : textColor }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = active ? "#16a34a" : textHover; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? "#16a34a" : textColor; }}
      >
        {children}
      </span>
    </Link>
  );
}
