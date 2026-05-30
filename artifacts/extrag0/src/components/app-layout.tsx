import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import navbarBg from "@assets/file_00000000a5a0720e9612b56b01bfe4f0~2_1780139707862.png";
import {
  LayoutDashboard, Briefcase, FileText, Wallet, Settings,
  LogOut, Star, Trophy, Home,
  Shield, UserCheck, CreditCard, BarChart3, Users, PanelLeftClose, PanelLeft,
  ChevronRight, TrendingUp, Bell, Rss, Globe, MessageCircle, Layers,
  Activity, MapPin, LineChart, MoreHorizontal, HelpCircle, X, Search,
  User as UserIcon, BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useListNotifications } from "@workspace/api-client-react";
import { NotificationBell } from "@/components/notifications-dropdown";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalSearch } from "@/components/global-search";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isMais?: boolean;
}

function getNavItems(role: string): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Painel Admin", icon: <BarChart3 size={18} /> },
      { href: "/admin/users", label: "Usuários", icon: <Users size={18} /> },
      { href: "/admin/jobs", label: "Extras", icon: <Briefcase size={18} /> },
      { href: "/admin/withdrawals", label: "Saques", icon: <CreditCard size={18} /> },
      { href: "/admin/analytics", label: "Analytics", icon: <LineChart size={18} /> },
      { href: "/admin/ops", label: "Operações", icon: <Activity size={18} /> },
      { href: "/admin/map", label: "Mapa Brasil", icon: <MapPin size={18} /> },
    ];
  }
  if (role === "company") {
    return [
      { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { href: "/app/jobs", label: "Meus Extras", icon: <Briefcase size={18} /> },
      { href: "/app/jobs/new", label: "Publicar Extra", icon: <FileText size={18} /> },
      { href: "/app/applications", label: "Candidaturas", icon: <UserCheck size={18} /> },
      { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
      { href: "/app/profile", label: "Perfil", icon: <Settings size={18} /> },
    ];
  }
  return [
    { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/app/feed", label: "Feed", icon: <Rss size={18} /> },
    { href: "/app/network", label: "Rede", icon: <Globe size={18} /> },
    { href: "/app/jobs", label: "Buscar Extras", icon: <Briefcase size={18} /> },
    { href: "/app/applications", label: "Candidaturas", icon: <FileText size={18} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
    { href: "/app/referrals", label: "Indicações", icon: <Trophy size={18} /> },
    { href: "/app/profile", label: "Perfil", icon: <Settings size={18} /> },
  ];
}

function getAdminPlatformItems(): NavItem[] {
  return [
    { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/app/jobs", label: "Extras", icon: <Briefcase size={18} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
  ];
}

function getBottomTabItems(role: string): NavItem[] {
  const homeItem: NavItem = role === "admin"
    ? { href: "/admin", label: "Home", icon: <Home size={21} /> }
    : { href: "/app/dashboard", label: "Home", icon: <Home size={21} /> };

  return [
    homeItem,
    { href: "/app/jobs", label: "Buscar Extras", icon: <Briefcase size={21} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={21} /> },
    { href: "/app/profile", label: "Perfil", icon: <UserIcon size={21} /> },
    { href: "#mais", label: "Menu", icon: <MoreHorizontal size={21} />, isMais: true },
  ];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function LevelBadge({ level }: { level?: string }) {
  const map: Record<string, { label: string; color: string; emoji: string }> = {
    bronze: { label: "Iniciante", color: "text-sky-400 border-sky-400/28 bg-sky-400/8", emoji: "🔵" },
    silver: { label: "Júnior", color: "text-cyan-400 border-cyan-400/28 bg-cyan-400/8", emoji: "⚡" },
    gold: { label: "Intermediário", color: "text-yellow-400 border-yellow-400/28 bg-yellow-400/8", emoji: "🥇" },
    elite: { label: "Sênior", color: "text-primary border-primary/28 bg-primary/8", emoji: "👑" },
  };
  const info = map[level ?? "bronze"] ?? map.bronze;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide inline-flex items-center gap-1 ${info.color}`}>
      <span>{info.emoji}</span>{info.label}
    </span>
  );
}

function XPRing({ progress, size = 44 }: { progress: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="absolute -inset-[3px]" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(88, 100%, 49%)" strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 1s cubic-bezier(0.19, 1, 0.22, 1)",
          filter: "drop-shadow(0 0 3px rgba(124,252,0,0.65))"
        }}
      />
    </svg>
  );
}

function AvatarInitials({ name, size = "md" }: { name?: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-11 h-11 text-base",
  };
  return (
    <div className={`rounded-full bg-gradient-to-br from-primary via-[#9aff1c] to-secondary flex items-center justify-center font-bold text-black flex-shrink-0 ${sizeMap[size]}`}>
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}

/* Lightweight ambient orbs for the authenticated layout */
function AppAmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600, left: "-8%", top: "-15%",
          background: "radial-gradient(circle, rgba(124,252,0,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: ["0%", "4%", "-3%", "0%"], y: ["0%", "5%", "-3%", "0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500, right: "-6%", bottom: "-10%",
          background: "radial-gradient(circle, rgba(0,229,255,0.055) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: ["0%", "-5%", "3%", "0%"], y: ["0%", "-6%", "4%", "0%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 320, height: 320, left: "45%", top: "35%",
          background: "radial-gradient(circle, rgba(124,252,0,0.03) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: ["0%", "6%", "-4%", "0%"], y: ["0%", "-5%", "7%", "0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── Mais Navigation Hub ── */
type MaisItem = { icon: React.ReactNode; label: string; href?: string; action?: string; color: string; bg: string };

const BASE_MAIS_ITEMS: MaisItem[] = [
  { icon: <Rss size={19} />, label: "Feed", href: "/app/feed", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { icon: <Globe size={19} />, label: "Rede", href: "/app/network", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  { icon: <FileText size={19} />, label: "Candidaturas", href: "/app/applications", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: <Trophy size={19} />, label: "Indicações", href: "/app/referrals", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: <MessageCircle size={19} />, label: "Chat", href: "/app/chat", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { icon: <Bell size={19} />, label: "Notificações", href: "/app/notifications", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { icon: <Settings size={19} />, label: "Configurações", href: "/app/profile", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <HelpCircle size={19} />, label: "Suporte", action: "support", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <BookOpen size={19} />, label: "Central de Ajuda", action: "support", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
];

const ADMIN_MAIS_ITEMS: MaisItem[] = [
  { icon: <BarChart3 size={19} />, label: "Painel Admin", href: "/admin", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { icon: <Users size={19} />, label: "Usuários", href: "/admin/users", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  { icon: <Briefcase size={19} />, label: "Extras", href: "/admin/jobs", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { icon: <CreditCard size={19} />, label: "Saques", href: "/admin/withdrawals", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  { icon: <LineChart size={19} />, label: "Analytics", href: "/admin/analytics", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { icon: <Activity size={19} />, label: "Operações", href: "/admin/ops", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: <MapPin size={19} />, label: "Mapa Brasil", href: "/admin/map", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: <Bell size={19} />, label: "Notificações", href: "/app/notifications", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { icon: <Settings size={19} />, label: "Configurações", href: "/app/profile", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <HelpCircle size={19} />, label: "Suporte", action: "support", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <BookOpen size={19} />, label: "Central de Ajuda", action: "support", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
];

function MaisNavSheet({ open, onClose, user, logout, onSearchOpen }: {
  open: boolean;
  onClose: () => void;
  user: any;
  logout: () => void;
  onSearchOpen: () => void;
}) {
  const [, setLocation] = useLocation();
  const go = (href: string) => { setLocation(href); onClose(); };

  const items = user?.role === "admin" ? ADMIN_MAIS_ITEMS : BASE_MAIS_ITEMS;

  const handleItem = (item: MaisItem) => {
    if (item.action === "search") { onSearchOpen(); onClose(); }
    else if (item.action === "support") { window.open("mailto:suporte@extrag0.com.br", "_blank"); onClose(); }
    else if (item.href) go(item.href);
  };

  const xpProgress = Math.min(100, ((user?.completedJobs ?? 0) % 15) / 15 * 100);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[35]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[36] rounded-t-[24px] overflow-hidden"
            style={{
              background: "rgba(5, 8, 12, 0.97)",
              backdropFilter: "blur(40px) saturate(180%)",
              borderTop: "1px solid rgba(255,255,255,0.09)",
              maxHeight: "88vh",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3.5 pb-1">
              <div className="w-9 h-[3px] rounded-full bg-white/18" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/7">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <AvatarInitials name={user?.name} size="sm" />
                  {user?.role === "freelancer" && <XPRing progress={xpProgress} size={36} />}
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* Nav grid */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(88vh - 110px)" }}>
              <div className="p-4 grid grid-cols-3 gap-2.5">
                {items.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.025, type: "spring", stiffness: 400, damping: 24 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleItem(item)}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border transition-all active:bg-white/10 ${item.bg}`}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-[11px] font-semibold text-center leading-tight text-foreground/85">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <div className="px-4 pb-8">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { logout(); onClose(); }}
                  className="w-full py-3.5 rounded-2xl bg-red-500/8 border border-red-500/18 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/14 transition-all"
                >
                  <LogOut size={16} /> Sair da conta
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [maisOpen, setMaisOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

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

  /* ⌘K / Ctrl+K shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setGlobalSearchOpen(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const bottomItems = getBottomTabItems(user.role);
  const adminPlatformItems = getAdminPlatformItems();
  const xpProgress = Math.min(100, ((user.completedJobs ?? 0) % 15) / 15 * 100);
  const greeting = getGreeting();
  const firstName = user.name?.split(" ")[0] ?? "Usuário";
  const isAdmin = user.role === "admin";
  const adminRoleLabel = (user as any).adminRole === "super_admin" ? "Super Admin" : (user as any).adminRole ?? "Admin";

  const isActive = (href: string) =>
    location === href || (href !== "/app/dashboard" && href !== "/admin" && location.startsWith(href));

  const isChatPage = location === "/app/chat" || location.startsWith("/app/chat");

  const PAGE_TITLES: Record<string, string> = {
    "/app/dashboard": "Dashboard",
    "/app/feed": "Feed",
    "/app/network": "Rede",
    "/app/jobs": "Buscar Extras",
    "/app/jobs/new": "Publicar Extra",
    "/app/applications": "Candidaturas",
    "/app/wallet": "Carteira",
    "/app/referrals": "Indicações",
    "/app/profile": "Perfil",
    "/app/notifications": "Notificações",
    "/app/chat": "Chat",
    "/admin": "Painel Admin",
    "/admin/users": "Usuários",
    "/admin/jobs": "Extras",
    "/admin/withdrawals": "Saques",
    "/admin/analytics": "Analytics",
    "/admin/ops": "Operações",
    "/admin/map": "Mapa Brasil",
  };
  const currentPageTitle =
    PAGE_TITLES[location] ??
    PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => k !== "/app/dashboard" && k !== "/admin" && location.startsWith(k)) ?? ""] ??
    "extraGO";

  return (
    <div className="flex h-screen overflow-hidden relative">
      <AppAmbientBackground />

      {/* Global search */}
      <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />

      {/* Mais nav hub */}
      <MaisNavSheet
        open={maisOpen}
        onClose={() => setMaisOpen(false)}
        user={user}
        logout={logout}
        onSearchOpen={() => setGlobalSearchOpen(true)}
      />

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full border-r border-white/5 bg-[#040608]/92 backdrop-blur-2xl flex-shrink-0 overflow-hidden z-10"
        style={{ minWidth: collapsed ? 68 : 260 }}
      >
        {/* Brand / collapse */}
        <div className={`flex items-center border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center p-3 h-[60px]" : "justify-between px-4 h-[60px]"}`}>
          {!collapsed && (
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-black text-primary leading-none">xG</span>
                </div>
                <span className="text-sm font-bold text-foreground/85 tracking-tight">extraGO</span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/7 transition-all flex-shrink-0"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* User section */}
        <div className={`border-b border-white/5 flex-shrink-0 ${collapsed ? "py-4 px-2 flex justify-center" : "px-3 py-3"}`}>
          {collapsed ? (
            <div className="relative">
              <AvatarInitials name={user.name} size="sm" />
              {user.role === "freelancer" && <XPRing progress={xpProgress} size={38} />}
            </div>
          ) : (
            <div className="rounded-xl p-2.5 relative"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
              {/* Subtle gradient border effect */}
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(124,252,0,0.06) 0%, transparent 50%, rgba(0,229,255,0.04) 100%)",
                }} />
              <div className="flex items-center gap-3 relative">
                <div className="relative flex-shrink-0">
                  <AvatarInitials name={user.name} />
                  {user.role === "freelancer" && <XPRing progress={xpProgress} size={44} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-widest">{greeting}</p>
                  <p className="text-sm font-bold truncate leading-tight mt-0.5">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground/65 truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap relative">
                {user.role === "freelancer" && <LevelBadge level={user.level ?? "bronze"} />}
                {user.role === "freelancer" && user.reputationScore != null && (
                  <span className="text-[10px] text-yellow-400/75 flex items-center gap-0.5">
                    <Star size={9} className="fill-yellow-400 text-yellow-400" />
                    {(user.reputationScore ?? 0).toFixed(1)}
                  </span>
                )}
                {user.role === "freelancer" && (
                  <span className="text-[10px] text-muted-foreground/50 ml-auto">
                    {Math.round(xpProgress)}% XP
                  </span>
                )}
                {user.role === "company" && (
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{user.companyName}</span>
                )}
                {isAdmin && (
                  <span className="flex items-center gap-1 text-[10px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <Shield size={9} /> {adminRoleLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer group relative overflow-hidden ${
                    collapsed ? "justify-center px-0 py-3 mx-1" : "gap-3 px-3 py-2.5"
                  } ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {active && !collapsed && (
                    <motion.div
                      layoutId="nav-active-bar"
                      className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full"
                      style={{ boxShadow: "0 0 8px rgba(124,252,0,0.65)" }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}
                  <span className={`flex-shrink-0 transition-all ${
                    active
                      ? "text-primary nav-icon-active"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                    style={active ? {
                      filter: "drop-shadow(0 0 6px rgba(124,252,0,0.8))",
                    } : undefined}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/18 text-primary border-0 px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                      {active && (
                        <ChevronRight size={12} className="ml-auto flex-shrink-0 opacity-45" />
                      )}
                    </>
                  )}
                </motion.div>
              </Link>
            );
          })}

          {/* Admin also gets quick access to platform routes */}
          {isAdmin && !collapsed && (
            <div className="pt-2">
              <button
                onClick={() => setAdminExpanded(v => !v)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded-lg hover:bg-white/3"
              >
                <Layers size={11} />
                <span className="flex-1 text-left">Plataforma</span>
                <motion.span
                  animate={{ rotate: adminExpanded ? 90 : 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <ChevronRight size={11} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {adminExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    {adminPlatformItems.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href}>
                          <motion.div
                            whileTap={{ scale: 0.97 }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer group relative overflow-hidden ${
                              active ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            }`}
                          >
                            <span className={`flex-shrink-0 ${active ? "text-secondary" : "text-muted-foreground group-hover:text-foreground"}`}>
                              {item.icon}
                            </span>
                            <span className="flex-1 truncate">{item.label}</span>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className={`border-t border-white/5 p-2 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={logout}
            title={collapsed ? "Sair" : undefined}
            className={`flex items-center rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-400/7 transition-all ${
              collapsed ? "justify-center w-10 h-10" : "gap-3 w-full px-3 py-2.5"
            }`}
          >
            <LogOut size={16} />
            {!collapsed && "Sair da conta"}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Top header — matches landing page navbar style */}
        <header
          className="flex items-center gap-3 h-[60px] px-4 lg:px-5 border-b border-white/8 flex-shrink-0 relative"
          style={{
            backgroundImage: `url(${navbarBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.45)",
          }}
        >
          {/* Left: page title (desktop) / greeting (mobile) */}
          <div className="flex-1 min-w-0">
            <div className="lg:hidden">
              <p className="text-sm font-semibold truncate">
                {greeting}, <span className="text-primary font-bold">{firstName}</span>
              </p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[15px] font-bold leading-tight truncate">{currentPageTitle}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{greeting}, {firstName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {user.role === "freelancer" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/18 mr-1">
                <TrendingUp size={11} className="text-primary" />
                <span className="text-[11px] font-bold text-primary">{user.completedJobs ?? 0} extras</span>
              </div>
            )}

            {/* Search button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setGlobalSearchOpen(true)}
              title="Buscar (⌘K)"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all"
            >
              <Search size={17} />
            </motion.button>

            <NotificationBell unread={unread} />

            {/* Chat icon with unread badge — only for non-admin */}
            {user.role !== "admin" && (
              <Link href="/app/chat">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isChatPage ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/6"
                  }`}
                  title="Mensagens"
                >
                  <MessageCircle size={17} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-black px-0.5 leading-none">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </motion.button>
              </Link>
            )}

            {/* Logout button in header for quick access */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="hidden lg:flex w-9 h-9 rounded-xl items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/8 transition-all"
              title="Sair da conta"
            >
              <LogOut size={16} />
            </motion.button>

            {/* Mobile avatar */}
            <div className="lg:hidden relative ml-1">
              <div className="relative">
                <AvatarInitials name={user.name} size="sm" />
                {user.role === "freelancer" && <XPRing progress={xpProgress} size={36} />}
              </div>
            </div>
          </div>
        </header>

        {/* Main scroll area — chat page gets full height without extra padding */}
        <main className={`flex-1 overflow-hidden relative ${isChatPage ? "flex flex-col" : "overflow-y-auto pb-[68px] lg:pb-0"}`}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-tab-bar lg:hidden z-20">
        <div className="flex items-stretch h-[58px]">
          {bottomItems.map((item) => {
            if (item.isMais) {
              return (
                <motion.button
                  key="mais"
                  whileTap={{ scale: 0.86 }}
                  onClick={() => setMaisOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center h-full gap-[3px] transition-all relative ${
                    maisOpen ? "text-primary" : "text-muted-foreground/55"
                  }`}
                >
                  {maisOpen && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-x-2 inset-y-1.5 rounded-xl"
                      style={{ background: "rgba(124, 252, 0, 0.07)", boxShadow: "0 0 16px rgba(124,252,0,0.06)" }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    />
                  )}
                  {maisOpen && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                      style={{ width: 28, height: 2, borderRadius: 2, background: "hsl(88, 100%, 49%)", boxShadow: "0 0 8px rgba(124,252,0,0.75)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={maisOpen ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`relative ${maisOpen ? "nav-icon-active" : ""}`}
                  >
                    <MoreHorizontal size={21} />
                  </motion.div>
                  <span className={`text-[9px] font-bold leading-none tracking-wide ${maisOpen ? "text-primary" : "text-muted-foreground/45"}`}>
                    Mais
                  </span>
                </motion.button>
              );
            }

            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.86 }}
                  className={`flex flex-col items-center justify-center h-full gap-[3px] transition-all relative ${
                    active ? "text-primary" : "text-muted-foreground/55"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-x-2 inset-y-1.5 rounded-xl"
                      style={{
                        background: "rgba(124, 252, 0, 0.07)",
                        boxShadow: "0 0 16px rgba(124,252,0,0.06)"
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    />
                  )}

                  {active && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                      style={{
                        width: 28, height: 2, borderRadius: 2,
                        background: "hsl(88, 100%, 49%)",
                        boxShadow: "0 0 8px rgba(124,252,0,0.75)"
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`relative ${active ? "nav-icon-active" : ""}`}
                  >
                    {item.icon}
                    {/* Unread chat badge */}
                    {item.href === "/app/chat" && unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-black px-0.5 leading-none">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                    {/* Unread notifications badge */}
                    {item.href === "/app/notifications" && unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white px-0.5 leading-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </motion.div>
                  <span className={`text-[9px] font-bold leading-none tracking-wide ${active ? "text-primary" : "text-muted-foreground/45"}`}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
