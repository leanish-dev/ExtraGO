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

const FA_PAGES = [
  { label: "Intermediação por Performance", href: "/financial-architecture/performance",          icon: <Zap size={13} />,      color: "#16a34a" },
  { label: "Indicações Multinível",          href: "/financial-architecture/referrals",           icon: <Network size={13} />,   color: "#3b82f6" },
  { label: "Assinaturas Profissionais",      href: "/financial-architecture/professional-plans",  icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",       href: "/financial-architecture/business-plans",      icon: <Building2 size={13} />, color: "#d97706" },
  { label: "Estrutura Financeira",           href: "/financial-architecture/revenue-structure",   icon: <BarChart3 size={13} />, color: "#16a34a" },
  { label: "Modelo de Expansão",             href: "/financial-architecture/expansion-model",     icon: <Globe size={13} />,     color: "#3b82f6" },
  { label: "Representantes Estaduais",       href: "/financial-architecture/state-representatives", icon: <MapPin size={13} />,  color: "#d97706" },
];

const DRAWER_SECTIONS = [
  {
    title: "INSTITUCIONAL",
    items: [
      { label: "Home",                   href: "/",                               icon: <Home size={15} /> },
      { label: "Investidores",           href: "/investidores-parceiros",         icon: <TrendingUp size={15} /> },
      { label: "Arquitetura Financeira", href: "/modelo-de-negocio",             icon: <Layers size={15} /> },
      { label: "Contato",                href: "mailto:extrago.contato@gmail.com", icon: <Mail size={15} />, isExternal: true },
    ],
  },
  {
    title: "ARQUITETURA FINANCEIRA",
    items: FA_PAGES.map(p => ({ label: p.label, href: p.href, icon: p.icon })),
  },
];

export default function InstitutionalNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [faOpen, setFaOpen]         = useState(false);
  const [location]                  = useLocation();
  const { user }                    = useAuth();

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".fa-dropdown-root")) setFaOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [location]);

  const activeLink = (href: string) => location === href;

  const textColor = "#1e293b";
  const textHover = "#0f172a";

  return (
    <>
      {/* ── Main Navbar ── */}
      <header
        className="sticky top-0 z-50 w-full overflow-hidden"
        style={{
          height: "92px",
          backgroundImage: "url(/institutional-navbar.png)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Invisible logo click-zone — left ~200px matches image logo area */}
        <Link href="/" aria-label="extraGO Home">
          <span
            className="absolute left-0 top-0 bottom-0"
            style={{ width: "clamp(140px, 18%, 220px)", cursor: "pointer", display: "block" }}
          />
        </Link>

        {/* Nav content layer */}
        <div
          className="relative h-full flex items-center justify-end px-4 sm:px-8"
          style={{ paddingLeft: "clamp(160px, 20%, 240px)" }}
        >
          {/* Desktop nav links — centre */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <NavLink href="/" active={activeLink("/")} textColor={textColor} textHover={textHover}>
              Início
            </NavLink>

            <NavLink href="/investidores-parceiros" active={activeLink("/investidores-parceiros")} textColor={textColor} textHover={textHover}>
              Investidores
            </NavLink>

            {/* Arquitetura Financeira dropdown */}
            <div className="relative fa-dropdown-root">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-150"
                style={{ color: activeLink("/modelo-de-negocio") ? "#16a34a" : textColor }}
                onClick={() => setFaOpen(o => !o)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#16a34a"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = activeLink("/modelo-de-negocio") ? "#16a34a" : textColor; }}
              >
                Arquitetura
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
                      background: "rgba(255,255,255,0.99)",
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

            <NavLink href="/modelo-de-negocio" active={activeLink("/modelo-de-negocio")} textColor={textColor} textHover={textHover}>
              Roadmap
            </NavLink>

            <a
              href="mailto:extrago.contato@gmail.com"
              className="px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-150"
              style={{ color: textColor }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#16a34a"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = textColor; }}
            >
              Contato
            </a>
          </nav>

          {/* Right side — CTA + hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CTA — desktop */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <Link href="/app/dashboard">
                  <button
                    className="rounded-full font-bold text-white border-none cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg,#16c47f 0%,#00c9a7 50%,#00b4d8 100%)",
                      boxShadow: "0 0 20px rgba(0,185,140,0.35)",
                      height: "40px",
                      padding: "0 22px",
                      fontSize: "13px",
                      fontWeight: 700,
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 34px rgba(0,185,140,0.55)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,185,140,0.35)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    Meu Painel <ArrowRight size={13} className="inline ml-1" />
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button
                    className="rounded-full font-bold text-white border-none cursor-pointer flex-shrink-0 flex items-center gap-1.5"
                    style={{
                      background: "linear-gradient(135deg,#16c47f 0%,#00c9a7 50%,#00b4d8 100%)",
                      boxShadow: "0 0 20px rgba(0,185,140,0.35)",
                      height: "40px",
                      padding: "0 22px",
                      fontSize: "13px",
                      fontWeight: 700,
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 34px rgba(0,185,140,0.55)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,185,140,0.35)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <Sparkles size={12} />
                    Entrar <ArrowRight size={12} />
                  </button>
                </Link>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer transition-colors"
              style={{
                color: textColor,
                background: "rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.10)",
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
                      className="w-full rounded-full font-bold text-white border-none cursor-pointer h-11 text-[13px]"
                      style={{ background: "linear-gradient(135deg,#16c47f,#00b4d8)" }}
                    >
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawerOpen(false)}>
                      <button
                        className="w-full rounded-full font-bold text-white border-none cursor-pointer h-10 text-[13px]"
                        style={{ background: "linear-gradient(135deg,#16c47f,#00b4d8)" }}
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

function NavLink({ href, active, textColor, textHover, children }: {
  href: string; active: boolean; textColor: string; textHover: string; children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <span
        className="px-3 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-colors duration-150 block"
        style={{ color: active ? "#16a34a" : textColor }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = active ? "#16a34a" : "#16a34a"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? "#16a34a" : textColor; }}
      >
        {children}
      </span>
    </Link>
  );
}
