import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  Menu, X, ChevronDown, ChevronRight,
  Home, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Sparkles, Mail, Layers,
  Shield, BookOpen,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const FA_PAGES = [
  { label: "Intermediação por Performance", href: "/financial-architecture/performance",          icon: <Zap size={13} />,       color: "#16a34a" },
  { label: "Indicações Multinível",          href: "/financial-architecture/referrals",           icon: <Network size={13} />,   color: "#3b82f6" },
  { label: "Assinaturas Profissionais",      href: "/financial-architecture/professional-plans",  icon: <BadgeCheck size={13} />, color: "#7c3aed" },
  { label: "Assinaturas Empresariais",       href: "/financial-architecture/business-plans",      icon: <Building2 size={13} />, color: "#d97706" },
  { label: "Estrutura Financeira",           href: "/financial-architecture/revenue-structure",   icon: <BarChart3 size={13} />, color: "#16a34a" },
  { label: "Modelo de Expansão",             href: "/financial-architecture/expansion-model",     icon: <Globe size={13} />,     color: "#3b82f6" },
  { label: "Representantes Estaduais",       href: "/financial-architecture/state-representatives", icon: <MapPin size={13} />,  color: "#d97706" },
];

const NAV_LINKS = [
  { label: "Início",        href: "/" },
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
      { label: "Home",                   href: "/",                               icon: <Home size={15} /> },
      { label: "Investidores",           href: "/investidores-parceiros",         icon: <TrendingUp size={15} /> },
      { label: "Arquitetura Financeira", href: "/modelo-de-negocio",             icon: <Layers size={15} /> },
      { label: "Roadmap",                href: "/modelo-de-negocio",             icon: <BarChart3 size={15} /> },
      { label: "Segurança",              href: "/seguranca",                     icon: <Shield size={15} /> },
      { label: "Blog",                   href: "/blog",                          icon: <BookOpen size={15} /> },
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
      if (!(e.target as Element).closest(".fa-dd-root")) setFaOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setDrawerOpen(false); setFaOpen(false); }, [location]);

  const active = (href: string) => location === href;
  const CYAN = "#00c9a7";
  const GREEN = "#16a34a";

  return (
    <>
      {/* ── Navbar ── */}
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
        {/* Invisible logo hit-zone (left ~20% matches the logo in the artwork) */}
        <Link href="/">
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "clamp(140px, 19%, 220px)",
              display: "block",
              cursor: "pointer",
            }}
            aria-label="extraGO Home"
          />
        </Link>

        {/* Nav overlay layer */}
        <div
          className="relative h-full flex items-center justify-between"
          style={{
            paddingLeft: "clamp(165px, 20%, 235px)",
            paddingRight: "clamp(8px, 2%, 16px)",
          }}
        >
          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map((link, i) => {
              if (link.external) {
                return (
                  <a
                    key={i}
                    href={link.href}
                    className="px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-colors duration-150"
                    style={{ color: "#1e293b" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#1e293b"; }}
                  >
                    {link.label}
                  </a>
                );
              }
              const isActive = active(link.href);
              return (
                <Link key={i} href={link.href}>
                  <span
                    className="px-3 py-1.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-150 block relative"
                    style={{ color: isActive ? CYAN : "#1e293b" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = isActive ? CYAN : "#1e293b"; }}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                        style={{ background: `linear-gradient(90deg,${CYAN},${GREEN})` }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}

            {/* Arquitetura dropdown */}
            <div className="relative fa-dd-root">
              <button
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-colors duration-150"
                style={{ color: location.startsWith("/financial-architecture") || active("/modelo-de-negocio") ? CYAN : "#1e293b" }}
                onClick={() => setFaOpen(o => !o)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CYAN; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = location.startsWith("/financial-architecture") ? CYAN : "#1e293b"; }}
              >
                Arquitetura
                <motion.span animate={{ rotate: faOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={11} />
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
                      border: "1px solid rgba(0,201,167,0.18)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
                    }}
                  >
                    <div className="px-4 pt-3 pb-1.5 border-b" style={{ borderColor: "rgba(0,201,167,0.12)" }}>
                      <Link href="/modelo-de-negocio" onClick={() => setFaOpen(false)}>
                        <div className="flex items-center gap-2 group cursor-pointer">
                          <Layers size={14} style={{ color: CYAN }} />
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
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${page.color}0d`; }}
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
          </nav>

          {/* Right side — CTA + hamburger */}
          <div className="flex items-center gap-2">
            {/* CTA desktop */}
            <div className="hidden sm:block">
              {user ? (
                <Link href="/app/dashboard">
                  <button
                    style={{
                      background: "linear-gradient(135deg,#16c47f 0%,#00c9a7 100%)",
                      boxShadow: "0 0 18px rgba(0,201,167,0.38)",
                      height: "38px",
                      padding: "0 20px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      border: "none",
                      borderRadius: "999px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,201,167,0.58)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(0,201,167,0.38)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    Meu Painel <ArrowRight size={13} />
                  </button>
                </Link>
              ) : (
                <Link href="/login">
                  <button
                    style={{
                      background: "linear-gradient(135deg,#16c47f 0%,#00c9a7 100%)",
                      boxShadow: "0 0 18px rgba(0,201,167,0.38)",
                      height: "38px",
                      padding: "0 20px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#fff",
                      border: "none",
                      borderRadius: "999px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,201,167,0.58)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 0 18px rgba(0,201,167,0.38)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    <Sparkles size={12} /> Entrar <ArrowRight size={12} />
                  </button>
                </Link>
              )}
            </div>

            {/* Hamburger — integrated with cyan zone on right */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "rgba(0,201,167,0.14)",
                border: "1px solid rgba(0,201,167,0.30)",
                color: "#0f766e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.18s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,201,167,0.24)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,201,167,0.14)"; }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Drawer ── */}
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
              style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
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
                width: "min(300px, 85vw)",
                background: "rgba(255,255,255,0.99)",
                backdropFilter: "blur(28px)",
                borderRight: "1px solid rgba(0,201,167,0.14)",
                boxShadow: "4px 0 40px rgba(0,0,0,0.14)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: "rgba(0,201,167,0.12)" }}>
                <Link href="/" onClick={() => setDrawerOpen(false)}>
                  <img src={logoMain} alt="extraGO" style={{ height: "34px", objectFit: "contain" }} />
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.05)", color: "#475569", border: "none" }}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                {DRAWER_SECTIONS.map((section, si) => (
                  <div key={si} className="mb-4">
                    <p className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: "#94a3b8" }}>
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

              {/* Footer */}
              <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: "rgba(0,201,167,0.10)" }}>
                {user ? (
                  <Link href="/app/dashboard" onClick={() => setDrawerOpen(false)}>
                    <button className="w-full rounded-full font-bold text-white border-none cursor-pointer h-11 text-[13px]"
                      style={{ background: "linear-gradient(135deg,#16c47f,#00c9a7)" }}>
                      Meu Painel <ArrowRight size={13} className="inline ml-1" />
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setDrawerOpen(false)}>
                      <button className="w-full rounded-full font-bold text-white border-none cursor-pointer h-10 text-[13px]"
                        style={{ background: "linear-gradient(135deg,#16c47f,#00c9a7)" }}>
                        Entrar <ArrowRight size={12} className="inline ml-1" />
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setDrawerOpen(false)}>
                      <button className="w-full rounded-full font-bold cursor-pointer h-10 text-[13px] border"
                        style={{ color: "#0d9488", borderColor: "rgba(0,201,167,0.35)", background: "rgba(0,201,167,0.07)" }}>
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
        background: isActive ? "rgba(0,201,167,0.10)" : "transparent",
        color: isActive ? "#0d9488" : "#334155",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ color: isActive ? "#0d9488" : "#64748b" }}>{icon}</span>
      <span className="text-[13px] font-medium leading-snug">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#00c9a7" }} />}
    </div>
  );
}
