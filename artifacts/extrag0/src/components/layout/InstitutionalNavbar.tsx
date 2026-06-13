import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, ChevronRight,
  Home as HomeIcon, TrendingUp, Zap, Network, BadgeCheck, Building2,
  BarChart3, Globe, MapPin, ArrowRight, Layers, User, Users, Share2,
  LogIn, UserPlus, BookOpen, Shield, MessageCircle, Search, Lock, Star, LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useListNotifications } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { NotificationBell } from "@/components/notifications-dropdown";
import { LevelBadge, LevelBadgeIcon } from "@/components/level-badge";
import { toast } from "sonner";
import { visibleSections, isItemLocked, type Role, type NavItem } from "./nav-config";
import logoMain from "@assets/Logo-no-text_1781338757912.png";

const G = "#16a34a";
const C = "#00c9a7";

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

const PUBLIC_DRAWER_SECTIONS = [
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
function NavItemLink({
  href, icon, label, active, className = "",
}: { href: string; icon: React.ReactNode; label: string; active: boolean; className?: string }) {
  const [hovered, setHovered] = React.useState(false);
  const col = active ? ACTIVE_G : hovered ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.60)";
  return (
    <Link href={href}>
      <div
        className={`relative flex flex-col items-center cursor-pointer ${className}`}
        style={{ padding: "4px clamp(3px,0.7vw,7px)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ color: col, marginBottom: 2, transition: "color 0.15s", lineHeight: 0 }}>{icon}</div>
        <span style={{ fontSize: "clamp(8px,1.5vw,10px)", fontWeight: 600, color: col, whiteSpace: "nowrap", transition: "color 0.15s" }}>
          {label}
        </span>
        {active && (
          <span className="absolute bottom-0 left-1 right-1 rounded-full" style={{ height: 2, background: `linear-gradient(90deg,${G},${C})` }} />
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

/* ── Avatar initials ── */
function AvatarInitials({ name }: { name?: string }) {
  return (
    <div className="rounded-full bg-gradient-to-br from-primary via-[#9aff1c] to-secondary flex items-center justify-center font-bold text-black flex-shrink-0 w-8 h-8 text-sm">
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
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
          <div className="p-3 border-b" style={{ borderColor: "rgba(22,163,74,0.12)" }}>
            <Link href="/modelo-de-negocio" onClick={onClose}>
              <motion.div
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${G} 0%, #00c9a7 100%)`,
                  boxShadow: "0 4px 22px rgba(22,163,74,0.38), 0 2px 8px rgba(0,0,0,0.18)",
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <Layers size={18} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-black text-white tracking-[0.04em] uppercase leading-tight">
                    Ver Documentação Completa
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>
                    Arquitetura financeira completa →
                  </p>
                </div>
                <ChevronRight size={14} color="rgba(255,255,255,0.70)" />
              </motion.div>
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
   UNIFIED NAVBAR — single navbar for public + authenticated areas
════════════════════════════════════════ */
export default function UnifiedNavbar({ onSearchOpen }: { onSearchOpen?: () => void } = {}) {
  const [drawer, setDrawer] = useState(false);
  const [faOpen, setFaOpen] = useState(false);
  const [loc, setLocation]  = useLocation();
  const { user, logout }    = useAuth();
  const faAnchorRef         = React.useRef<HTMLDivElement>(null);

  const role = (user?.role ?? "freelancer") as Role;
  const isAdmin = user?.role === "admin";

  /* ── On institutional/public pages force the public (unauthenticated) nav style ── */
  const INSTITUTIONAL_PATHS = [
    "/investidores-parceiros", "/modelo-de-negocio", "/financial-architecture",
    "/blog", "/seguranca", "/login", "/register",
  ];
  const isInstitutionalPage =
    loc === "/" || INSTITUTIONAL_PATHS.some(p => loc.startsWith(p));
  const effectiveUser = isInstitutionalPage ? null : user;

  /* ── Authenticated badge data (Phase 8) ── */
  const { data: notifs } = useListNotifications(undefined, { query: { queryKey: ["notifications"], enabled: !!user } });
  const unread = notifs?.filter((n: any) => !n.isRead).length ?? 0;

  const { data: unreadMsgsData } = useQuery({
    queryKey: ["chat-unread"],
    queryFn: () => apiFetch("/api/chat/unread"),
    refetchInterval: 30000,
    enabled: !!user && user.role !== "admin",
    staleTime: 15000,
  });
  const unreadMessages: number = unreadMsgsData?.total ?? 0;

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

  const logoHref = effectiveUser ? (isAdmin ? "/admin" : "/app/dashboard") : "/";
  const firstName = effectiveUser?.name?.split(" ")[0] ?? "";
  const isChatPage = loc.startsWith("/app/chat");

  const handleNavItem = (item: NavItem) => {
    setDrawer(false);
    if (item.action === "logout") { logout(); return; }
    if (item.action === "support") { window.open("mailto:suporte@extrag0.com.br", "_blank"); return; }
    if (item.href) setLocation(item.href);
  };

  const handleLocked = (item: NavItem) => {
    toast.message(item.lockMessage ?? "Acesso restrito para o seu tipo de conta.", {
      description: isAdmin ? undefined : "Esta área pertence a outro perfil do ecossistema extraGO.",
    });
  };

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

        <div className="w-full h-full flex items-center px-0 sm:px-1" style={{ gap: 0 }}>

          {/* ── LEFT: Logo ── */}
          <Link href={logoHref} aria-label="extraGO – página inicial">
            <div className="flex items-center flex-shrink-0" style={{ marginRight: "clamp(2px,0.4vw,6px)" }}>
              <img
                src={logoMain}
                alt="extraGO"
                style={{
                  height: "clamp(56px, 8.5vw, 66px)",
                  objectFit: "contain",
                  mixBlendMode: "screen",
                  filter: "drop-shadow(0 0 10px rgba(22,163,74,0.45)) drop-shadow(0 0 3px rgba(0,201,167,0.25))",
                }}
              />
            </div>
          </Link>

          {effectiveUser ? (
            /* ── CENTRE (authenticated): compact welcome summary (Phase 10) ── */
            <div className="flex items-center min-w-0" style={{ flex: "1 1 0" }}>
              <div className="min-w-0">
                <p className="text-[12px] sm:text-[13px] font-bold text-white/90 leading-tight truncate">
                  Olá, <span className="text-primary">{firstName}</span>
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {effectiveUser.role === "freelancer" && <LevelBadge level={effectiveUser.level} size="xs" />}
                  {effectiveUser.role === "freelancer" && effectiveUser.reputationScore != null && (
                    <span className="text-[10px] text-yellow-400/85 flex items-center gap-0.5">
                      <Star size={9} className="fill-yellow-400 text-yellow-400" />
                      {(effectiveUser.reputationScore ?? 0).toFixed(1)}
                    </span>
                  )}
                  {effectiveUser.role === "freelancer" && (
                    <span className="hidden sm:inline text-[10px] text-white/45 font-medium">
                      {effectiveUser.completedJobs ?? 0} extras
                    </span>
                  )}
                  {effectiveUser.role === "company" && effectiveUser.companyName && (
                    <span className="text-[10px] text-white/50 font-medium truncate">{effectiveUser.companyName}</span>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      <Shield size={9} /> {effectiveUser.adminRole === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── CENTRE (public): Nav links with icons ── */
            <nav
              className="flex items-center"
              style={{ flex: "1 1 auto", overflow: "visible", gap: "clamp(0px,0.6vw,6px)" }}
            >
              {/* Investidores — mobile + desktop */}
              <NavItemLink href="/investidores-parceiros" icon={<TrendingUp size={17} />} label="Investidores" active={active("/investidores-parceiros")} className="flex" />

              {/* Arquitetura Financeira — mobile + desktop, plain green style */}
              <div ref={faAnchorRef} className="fa-root relative flex flex-col items-center">
                <button
                  onClick={() => setFaOpen(o => !o)}
                  className="relative flex flex-col items-center cursor-pointer"
                  style={{ background: "none", border: "none", padding: "4px clamp(3px,0.7vw,7px)", boxShadow: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 3, lineHeight: 0, marginBottom: 2 }}>
                    <Layers size={14} style={{ color: ACTIVE_G, flexShrink: 0 }} />
                    <span style={{ fontSize: "clamp(8px,1.5vw,10px)", fontWeight: 600, color: ACTIVE_G, whiteSpace: "nowrap" }}>
                      Arq. Financeira
                    </span>
                    <motion.span
                      animate={{ rotate: faOpen ? 180 : 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ color: ACTIVE_G, display: "flex", alignItems: "center", flexShrink: 0 }}
                    >
                      <ChevronDown size={11} />
                    </motion.span>
                  </div>
                  {(active("/modelo-de-negocio") || active("/financial-architecture")) && (
                    <span className="absolute bottom-0 left-1 right-1 rounded-full" style={{ height: 2, background: `linear-gradient(90deg,${G},${C})` }} />
                  )}
                </button>
                <FADropdown open={faOpen} anchorRef={faAnchorRef} onClose={() => setFaOpen(false)} />
              </div>

              {/* Segurança — desktop only */}
              <NavItemLink href="/seguranca" icon={<Shield size={17} />} label="Segurança" active={active("/seguranca")} className="hidden lg:flex" />

              {/* Indicações — desktop only */}
              <NavItemLink href="/financial-architecture/referrals" icon={<Share2 size={17} />} label="Indicações" active={active("/financial-architecture/referrals")} className="hidden lg:flex" />

              {/* Como Funciona — desktop only */}
              <NavItemLink href="/#como-funciona" icon={<BookOpen size={17} />} label="Como Funciona" active={false} className="hidden lg:flex" />
            </nav>
          )}

          {/* ── RIGHT: actions ── */}
          <div className="flex items-center flex-shrink-0" style={{ gap: "clamp(2px,0.8vw,8px)" }}>

            {effectiveUser ? (
              <>
                {/* Search (authenticated) */}
                {onSearchOpen && (
                  <button
                    onClick={onSearchOpen}
                    aria-label="Buscar"
                    title="Buscar (⌘K)"
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-white/55 hover:text-white/90 hover:bg-white/8 transition-all"
                  >
                    <Search size={18} />
                  </button>
                )}

                {/* Chat (Phase 8 — always visible, non-admin) */}
                {!isAdmin && effectiveUser && (
                  <Link href="/app/chat" aria-label="Mensagens">
                    <button
                      className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                        isChatPage ? "text-primary bg-primary/12" : "text-white/55 hover:text-white/90 hover:bg-white/8"
                      }`}
                      title="Mensagens"
                    >
                      <MessageCircle size={18} />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-black px-0.5 leading-none">
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </button>
                  </Link>
                )}

                {/* Notifications (Phase 8 — authenticated only) */}
                {effectiveUser && <NotificationBell unread={unread} />}

                {/* Avatar → /app/profile (Phase 9 — direct, no dropdown) */}
                <Link href="/app/profile" aria-label="Meu perfil">
                  <button className="relative flex items-center justify-center ml-0.5" title="Meu perfil">
                    <AvatarInitials name={effectiveUser?.name} />
                    {effectiveUser?.role === "freelancer" && effectiveUser?.level && (
                      <span className="absolute -bottom-1 -right-1 pointer-events-none">
                        <LevelBadgeIcon level={effectiveUser?.level} size="xs" />
                      </span>
                    )}
                  </button>
                </Link>
              </>
            ) : (
              <>
                {/* Cadastro — gradient CTA pill (desktop only) */}
                <Link href="/register">
                  <button
                    className="hidden lg:flex items-center rounded-full font-bold cursor-pointer"
                    style={{
                      fontSize: "clamp(10px,2vw,12px)",
                      paddingLeft: "clamp(10px,2vw,16px)",
                      paddingRight: "clamp(10px,2vw,16px)",
                      height: 34,
                      color: "#000",
                      border: "none",
                      background: `linear-gradient(135deg, ${G}, ${C})`,
                      boxShadow: `0 0 14px rgba(22,163,74,0.38)`,
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                      gap: "clamp(4px,0.8vw,6px)",
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 22px rgba(22,163,74,0.58)`; el.style.filter = "brightness(1.08)"; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 0 14px rgba(22,163,74,0.38)`; el.style.filter = "none"; }}
                  >
                    <UserPlus size={13} />
                    Cadastro
                  </button>
                </Link>
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
              </>
            )}

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

            {/* Home — always links to Landing (before Hamburger) */}
            <Link href="/" aria-label="Ir para a página inicial">
              <div
                className="flex items-center justify-center"
                style={{ width: 38, height: H, cursor: "pointer", flexShrink: 0 }}
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

            {/* Hamburger — LAST item */}
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
          </div>
        </div>
      </header>

      {/* ═══════════════════════ DRAWER (Phase 6 hamburger hub) ═══════════════════════ */}
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
              <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(2,8,22,0.82)", zIndex: 0 }} />

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

              {/* Authenticated user card */}
              {effectiveUser && (
                <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "rgba(22,163,74,0.18)" }}>
                  <AvatarInitials name={effectiveUser.name} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-white/95 truncate leading-tight">{effectiveUser.name}</p>
                    <p className="text-[10.5px] text-white/45 truncate">{effectiveUser.email}</p>
                  </div>
                </div>
              )}

              {/* Search (mobile-first access — GlobalSearch trigger) */}
              {effectiveUser && onSearchOpen && (
                <div className="relative z-10 px-3 pt-3 flex-shrink-0">
                  <button
                    onClick={() => { setDrawer(false); onSearchOpen(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-left"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.70)",
                    }}
                  >
                    <Search size={15} style={{ color: "rgba(0,201,167,0.75)" }} />
                    <span className="text-[12.5px] flex-1">Buscar na plataforma</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>⌘K</span>
                  </button>
                </div>
              )}

              {/* Nav sections */}
              <div className="relative z-10 flex-1 overflow-y-auto py-3 px-3">
                {effectiveUser ? (
                  visibleSections(role).map((sec, si) => (
                    <div key={si} className="mb-4">
                      <p className="px-3 pb-1.5 text-[9px] font-black tracking-[0.18em] uppercase" style={{ color: "rgba(0,201,167,0.65)" }}>
                        {sec.title}
                      </p>
                      <div className="space-y-0.5">
                        {sec.items.map((item, ii) => {
                          const locked = isItemLocked(item, role);
                          const on = !locked && item.href ? (item.href === "/" ? loc === "/" : loc === item.href) : false;
                          return (
                            <button
                              key={ii}
                              onClick={() => locked ? handleLocked(item) : handleNavItem(item)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-left"
                              style={{
                                background: on ? "rgba(22,163,74,0.20)" : "transparent",
                                color: locked ? "rgba(255,255,255,0.42)" : on ? "#7CFC00" : "rgba(255,255,255,0.88)",
                                fontWeight: on ? 700 : 500,
                                border: on ? "1px solid rgba(22,163,74,0.30)" : "1px solid transparent",
                                transition: "background 0.12s",
                              }}
                              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                            >
                              <span style={{ color: locked ? "rgba(255,255,255,0.35)" : on ? "#7CFC00" : "rgba(0,201,167,0.70)" }}>{item.icon}</span>
                              <span className="text-[13px] leading-snug flex-1">{item.label}</span>
                              {locked && <Lock size={13} className="ml-auto flex-shrink-0 opacity-70" />}
                              {on && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#7CFC00", boxShadow: "0 0 6px #7CFC00" }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  PUBLIC_DRAWER_SECTIONS.map((sec, si) => (
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
                  ))
                )}
              </div>

              {/* Footer CTAs */}
              <div className="relative z-10 flex-shrink-0 p-4 border-t" style={{ borderColor: "rgba(22,163,74,0.22)", background: "rgba(2,8,22,0.60)", backdropFilter: "blur(8px)" }}>
                {effectiveUser ? (
                  <button
                    onClick={() => { logout(); setDrawer(false); }}
                    className="w-full h-11 rounded-full font-bold text-[13px] cursor-pointer flex items-center justify-center gap-2"
                    style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.30)", background: "rgba(248,113,113,0.10)" }}
                  >
                    <LogOut size={14} /> Sair da conta
                  </button>
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
