import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import navbarBg from "@assets/file_00000000a5a0720e9612b56b01bfe4f0~2_1780139707862.png";
import {
  LayoutDashboard, Briefcase, FileText, Wallet, Settings,
  LogOut, Trophy, Home,
  Shield, UserCheck, CreditCard, BarChart3, Users, PanelLeftClose, PanelLeft,
  ChevronRight, TrendingUp, Bell, Rss, Globe, MessageCircle,
  Activity, MapPin, LineChart, MoreHorizontal, X, Search,
  User as UserIcon, Mail, Star, Building,
} from "lucide-react";
import { useListNotifications } from "@workspace/api-client-react";
import { NotificationBell } from "@/components/notifications-dropdown";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalSearch } from "@/components/global-search";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { LevelBadge, LevelBadgeIcon } from "@/components/level-badge";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isMais?: boolean;
}

/* ── Sidebar: Only primary actions (5 max per role) ── */
function getSidebarItems(role: string): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Painel Admin", icon: <BarChart3 size={18} /> },
      { href: "/admin/users", label: "Usuários", icon: <Users size={18} /> },
      { href: "/admin/jobs", label: "Extras", icon: <Briefcase size={18} /> },
      { href: "/admin/withdrawals", label: "Financeiro", icon: <CreditCard size={18} /> },
      { href: "/admin/analytics", label: "Analytics", icon: <LineChart size={18} /> },
    ];
  }
  if (role === "company") {
    return [
      { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { href: "/app/jobs", label: "Buscar Extras", icon: <Briefcase size={18} /> },
      { href: "/app/applications", label: "Candidaturas", icon: <UserCheck size={18} /> },
      { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
    ];
  }
  return [
    { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/app/jobs", label: "Buscar Extras", icon: <Briefcase size={18} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
    { href: "/app/referrals", label: "Indicações", icon: <Trophy size={18} /> },
    { href: "/app/profile", label: "Perfil", icon: <UserIcon size={18} /> },
  ];
}

function getBottomTabItems(role: string): NavItem[] {
  const homeItem: NavItem = role === "admin"
    ? { href: "/admin", label: "Home", icon: <Home size={20} /> }
    : { href: "/app/dashboard", label: "Home", icon: <Home size={20} /> };

  return [
    homeItem,
    { href: "/app/jobs", label: "Buscar", icon: <Briefcase size={20} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={20} /> },
    { href: "/app/profile", label: "Perfil", icon: <UserIcon size={20} /> },
    { href: "#mais", label: "Menu", icon: <MoreHorizontal size={20} />, isMais: true },
  ];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
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
  const sizeMap = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-11 h-11 text-base" };
  return (
    <div className={`rounded-full bg-gradient-to-br from-primary via-[#9aff1c] to-secondary flex items-center justify-center font-bold text-black flex-shrink-0 ${sizeMap[size]}`}>
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}

/* ── New premium background using the attached artwork ── */
function AppBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/app-background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay for readability — graduated top to bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(2,5,9,0.58) 0%, rgba(2,5,9,0.48) 40%, rgba(2,5,9,0.65) 100%)",
        }}
      />
    </div>
  );
}

/* ── Mais Navigation Sheet (mobile) ── */
type MaisItem = { icon: React.ReactNode; label: string; href?: string; action?: string; color: string; bg: string };

const BASE_MAIS_ITEMS: MaisItem[] = [
  { icon: <Rss size={19} />, label: "Feed", href: "/app/feed", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { icon: <Globe size={19} />, label: "Rede", href: "/app/network", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  { icon: <FileText size={19} />, label: "Candidaturas", href: "/app/applications", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: <Trophy size={19} />, label: "Indicações", href: "/app/referrals", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: <MessageCircle size={19} />, label: "Chat", href: "/app/chat", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { icon: <Bell size={19} />, label: "Notificações", href: "/app/notifications", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { icon: <Settings size={19} />, label: "Configurações", href: "/app/profile", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <Home size={19} />, label: "Landing Page", href: "/", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <TrendingUp size={19} />, label: "Investidores", href: "/investidores-parceiros", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { icon: <Mail size={19} />, label: "Central de Ajuda", action: "support", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
];

const ADMIN_MAIS_ITEMS: MaisItem[] = [
  { icon: <BarChart3 size={19} />, label: "Painel Admin", href: "/admin", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  { icon: <Users size={19} />, label: "Usuários", href: "/admin/users", color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
  { icon: <Briefcase size={19} />, label: "Extras", href: "/admin/jobs", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { icon: <CreditCard size={19} />, label: "Financeiro", href: "/admin/withdrawals", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  { icon: <LineChart size={19} />, label: "Analytics", href: "/admin/analytics", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  { icon: <Activity size={19} />, label: "Operações", href: "/admin/ops", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: <MapPin size={19} />, label: "Mapa Brasil", href: "/admin/map", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: <Globe size={19} />, label: "Representantes", href: "/admin/representatives", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  { icon: <Bell size={19} />, label: "Notificações", href: "/app/notifications", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  { icon: <Settings size={19} />, label: "Configurações", href: "/app/profile", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <Home size={19} />, label: "Landing Page", href: "/", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
  { icon: <TrendingUp size={19} />, label: "Investidores", href: "/investidores-parceiros", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { icon: <Mail size={19} />, label: "Central de Ajuda", action: "support", color: "text-muted-foreground", bg: "bg-white/6 border-white/10" },
];

function MaisNavSheet({ open, onClose, user, logout, onSearchOpen }: {
  open: boolean; onClose: () => void; user: any; logout: () => void; onSearchOpen: () => void;
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[35]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[36] rounded-t-[22px] overflow-hidden"
            style={{
              background: "rgba(4, 7, 12, 0.97)",
              backdropFilter: "blur(40px) saturate(180%)",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "88vh",
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-[3px] rounded-full bg-white/15" />
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/7">
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
                className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={15} />
              </motion.button>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(88vh - 100px)" }}>
              <div className="p-3.5 grid grid-cols-3 gap-2">
                {items.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.93 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.022, type: "spring", stiffness: 400, damping: 24 }}
                    whileTap={{ scale: 0.91 }}
                    onClick={() => handleItem(item)}
                    className={`flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-2xl border transition-all active:bg-white/10 ${item.bg}`}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-[10px] font-semibold text-center leading-tight text-foreground/85">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="px-3.5 pb-8 pt-1">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { logout(); onClose(); }}
                  className="w-full py-3 rounded-2xl bg-red-500/8 border border-red-500/15 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/12 transition-all"
                >
                  <LogOut size={15} /> Sair da conta
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
  const [maisOpen, setMaisOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

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
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setGlobalSearchOpen(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [accountMenuOpen]);

  if (!user) return null;

  const sidebarItems = getSidebarItems(user.role);
  const bottomItems = getBottomTabItems(user.role);
  const xpProgress = Math.min(100, ((user.completedJobs ?? 0) % 15) / 15 * 100);
  const greeting = getGreeting();
  const firstName = user.name?.split(" ")[0] ?? "Usuário";
  const isAdmin = user.role === "admin";
  const adminRoleLabel = (user as any).adminRole === "super_admin" ? "Super Admin" : (user as any).adminRole ?? "Admin";

  const isActive = (href: string) =>
    location === href || (href !== "/app/dashboard" && href !== "/admin" && href !== "/" && location.startsWith(href));

  const isChatPage = location.startsWith("/app/chat");

  /* ── Account hub — complete navigation per role ── */
  type AccountMenuItem = { href?: string; icon: React.ReactNode; label: string; action?: string; divider?: boolean };

  const accountMenuItems: AccountMenuItem[] = isAdmin ? [
    { href: "/admin", icon: <BarChart3 size={14} />, label: "Painel Administrativo" },
    { href: "/admin/users", icon: <Users size={14} />, label: "Usuários" },
    { href: "/admin/representatives", icon: <Globe size={14} />, label: "Representantes" },
    { href: "/admin/withdrawals", icon: <CreditCard size={14} />, label: "Financeiro" },
    { href: "/admin/analytics", icon: <LineChart size={14} />, label: "Analytics" },
    { href: "/admin/ops", icon: <Activity size={14} />, label: "Centro Nac. de Operações" },
    { href: "/admin/map", icon: <MapPin size={14} />, label: "Mapa Brasil" },
    { href: "/admin/jobs", icon: <Briefcase size={14} />, label: "Gestão de Extras" },
    { divider: true } as any,
    { href: "/app/notifications", icon: <Bell size={14} />, label: "Notificações" },
    { href: "/app/profile", icon: <Settings size={14} />, label: "Configurações" },
    { divider: true } as any,
    { href: "/", icon: <Home size={14} />, label: "Landing Page" },
    { href: "/investidores-parceiros", icon: <TrendingUp size={14} />, label: "Investidores & Parceiros" },
    { action: "support", icon: <Mail size={14} />, label: "Central de Ajuda" },
  ] : user.role === "company" ? [
    { href: "/app/dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard" },
    { href: "/app/profile", icon: <UserIcon size={14} />, label: "Perfil da Empresa" },
    { href: "/app/jobs", icon: <Briefcase size={14} />, label: "Buscar Extras" },
    { href: "/app/jobs/new", icon: <FileText size={14} />, label: "Publicar Extra" },
    { href: "/app/applications", icon: <UserCheck size={14} />, label: "Candidaturas" },
    { href: "/app/wallet", icon: <Wallet size={14} />, label: "Carteira" },
    { href: "/app/chat", icon: <MessageCircle size={14} />, label: "Chat" },
    { href: "/app/notifications", icon: <Bell size={14} />, label: "Notificações" },
    { href: "/app/profile", icon: <Settings size={14} />, label: "Configurações" },
    { divider: true } as any,
    { href: "/", icon: <Home size={14} />, label: "Landing Page" },
    { href: "/investidores-parceiros", icon: <TrendingUp size={14} />, label: "Investidores & Parceiros" },
    { action: "support", icon: <Mail size={14} />, label: "Central de Ajuda" },
  ] : [
    { href: "/app/dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard" },
    { href: "/app/profile", icon: <UserIcon size={14} />, label: "Perfil" },
    { href: "/app/network", icon: <Globe size={14} />, label: "Rede" },
    { href: "/app/feed", icon: <Rss size={14} />, label: "Feed" },
    { href: "/app/jobs", icon: <Briefcase size={14} />, label: "Buscar Extras" },
    { href: "/app/applications", icon: <FileText size={14} />, label: "Candidaturas" },
    { href: "/app/wallet", icon: <Wallet size={14} />, label: "Carteira" },
    { href: "/app/referrals", icon: <Trophy size={14} />, label: "Indicações" },
    { href: "/app/chat", icon: <MessageCircle size={14} />, label: "Chat" },
    { href: "/app/notifications", icon: <Bell size={14} />, label: "Notificações" },
    { href: "/app/profile", icon: <Settings size={14} />, label: "Configurações" },
    { divider: true } as any,
    { href: "/", icon: <Home size={14} />, label: "Landing Page" },
    { href: "/investidores-parceiros", icon: <TrendingUp size={14} />, label: "Investidores & Parceiros" },
    { action: "support", icon: <Mail size={14} />, label: "Central de Ajuda" },
  ];

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
    "/admin/withdrawals": "Financeiro",
    "/admin/analytics": "Analytics",
    "/admin/ops": "Operações",
    "/admin/map": "Mapa Brasil",
    "/admin/representatives": "Representantes",
  };

  const currentPageTitle =
    PAGE_TITLES[location] ??
    PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => k !== "/app/dashboard" && k !== "/admin" && location.startsWith(k)) ?? ""] ??
    "extraGO";

  return (
    <div className="dark flex h-screen overflow-hidden relative">
      {/* New premium background */}
      <AppBackground />

      <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />

      <MaisNavSheet
        open={maisOpen}
        onClose={() => setMaisOpen(false)}
        user={user}
        logout={logout}
        onSearchOpen={() => setGlobalSearchOpen(true)}
      />

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full border-r flex-shrink-0 overflow-hidden z-10"
        style={{
          minWidth: collapsed ? 64 : 240,
          borderColor: "rgba(255,255,255,0.07)",
          background: "rgba(2, 5, 10, 0.72)",
          backdropFilter: "blur(32px) saturate(160%)",
          WebkitBackdropFilter: "blur(32px) saturate(160%)",
        }}
      >
        {/* Brand header */}
        <div className={`flex items-center border-b flex-shrink-0 ${collapsed ? "justify-center p-3 h-[58px]" : "justify-between px-4 h-[58px]"}`}
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {!collapsed && (
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] font-black text-primary leading-none">xG</span>
                </div>
                <span className="text-[13px] font-bold text-white/85 tracking-tight">extraGO</span>
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/35 hover:text-white/75 hover:bg-white/6 transition-all flex-shrink-0"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        {/* User card */}
        <div className={`border-b flex-shrink-0 ${collapsed ? "py-3 px-2 flex justify-center" : "px-3 py-3"}`}
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {collapsed ? (
            <div className="relative">
              <AvatarInitials name={user.name} size="sm" />
              {user.role === "freelancer" && <XPRing progress={xpProgress} size={38} />}
            </div>
          ) : (
            <div className="rounded-xl p-2.5 relative"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
              <div className="flex items-center gap-2.5 relative">
                <div className="relative flex-shrink-0">
                  <AvatarInitials name={user.name} />
                  {user.role === "freelancer" && <XPRing progress={xpProgress} size={44} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-white/35 font-medium uppercase tracking-widest">{greeting}</p>
                  <p className="text-[13px] font-bold truncate leading-tight text-white/90 mt-0.5">{user.name}</p>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                {user.role === "freelancer" && <LevelBadge level={user.level ?? "bronze"} />}
                {user.role === "freelancer" && user.reputationScore != null && (
                  <span className="text-[10px] text-yellow-400/80 flex items-center gap-0.5">
                    <Star size={9} className="fill-yellow-400 text-yellow-400" />
                    {(user.reputationScore ?? 0).toFixed(1)}
                  </span>
                )}
                {user.role === "freelancer" && (
                  <span className="text-[10px] text-white/30 ml-auto">{Math.round(xpProgress)}% XP</span>
                )}
                {user.role === "company" && (
                  <span className="text-[10px] text-white/45 font-medium truncate">{user.companyName}</span>
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
        <nav className="flex-1 p-1.5 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.96 }}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer group relative overflow-hidden ${
                    collapsed ? "justify-center py-3 mx-0.5" : "gap-3 px-3 py-2.5"
                  } ${
                    active
                      ? "bg-primary/12 text-primary"
                      : "text-white/65 hover:text-white/90 hover:bg-white/6"
                  }`}
                >
                  {active && !collapsed && (
                    <motion.div
                      layoutId="nav-active-bar"
                      className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full"
                      style={{ boxShadow: "0 0 8px rgba(124,252,0,0.6)" }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    />
                  )}
                  <span className={`flex-shrink-0 transition-all ${
                    active ? "text-primary" : "text-white/55 group-hover:text-white/80"
                  }`}
                    style={active ? { filter: "drop-shadow(0 0 5px rgba(124,252,0,0.75))" } : undefined}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate font-[500]">{item.label}</span>
                      {active && <ChevronRight size={11} className="ml-auto flex-shrink-0 opacity-40" />}
                    </>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer — Landing Page + Logout */}
        <div className="border-t p-1.5 flex-shrink-0 space-y-0.5" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {/* Landing Page */}
          <Link href="/">
            <motion.div
              whileTap={{ scale: 0.96 }}
              title={collapsed ? "Landing Page" : undefined}
              className={`flex items-center rounded-xl text-sm transition-all cursor-pointer group ${
                collapsed ? "justify-center py-3 mx-0.5" : "gap-3 px-3 py-2.5"
              } text-white/55 hover:text-white/80 hover:bg-white/5`}
            >
              <Home size={16} className="flex-shrink-0 text-white/50 group-hover:text-white/70 transition-colors" />
              {!collapsed && <span className="flex-1 truncate font-[500]">Landing Page</span>}
            </motion.div>
          </Link>

          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={logout}
            title={collapsed ? "Sair" : undefined}
            className={`flex items-center rounded-xl text-sm text-white/55 hover:text-red-400 hover:bg-red-400/7 transition-all w-full ${
              collapsed ? "justify-center py-3" : "gap-3 px-3 py-2.5"
            }`}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-left font-[500]">Sair da conta</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Top header — approved navbar background maintained */}
        <header
          className="flex items-center gap-3 h-[58px] px-4 lg:px-5 border-b flex-shrink-0 relative"
          style={{
            backgroundImage: `url(${navbarBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderColor: "rgba(255,255,255,0.08)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Left: page title (desktop) / greeting (mobile) */}
          <div className="flex-1 min-w-0">
            <div className="lg:hidden">
              <p className="text-[13px] font-semibold truncate text-white/90">
                {greeting}, <span className="text-primary font-bold">{firstName}</span>
              </p>
            </div>
            <div className="hidden lg:block">
              <p className="text-[15px] font-bold leading-tight truncate text-white/90">{currentPageTitle}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{greeting}, {firstName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {user.role === "freelancer" && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/8 border border-primary/18 mr-1">
                <TrendingUp size={10} className="text-primary" />
                <span className="text-[11px] font-bold text-primary">{user.completedJobs ?? 0} extras</span>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.91 }}
              onClick={() => setGlobalSearchOpen(true)}
              title="Buscar (⌘K)"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/45 hover:text-white/85 hover:bg-white/6 transition-all"
            >
              <Search size={16} />
            </motion.button>

            <NotificationBell unread={unread} />

            {user.role !== "admin" && (
              <Link href="/app/chat">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isChatPage ? "text-primary bg-primary/10" : "text-white/45 hover:text-white/85 hover:bg-white/6"
                  }`}
                  title="Mensagens"
                >
                  <MessageCircle size={16} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-black px-0.5 leading-none">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </motion.button>
              </Link>
            )}

            {/* Account hub */}
            <div className="relative ml-0.5" ref={accountMenuRef}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setAccountMenuOpen(v => !v)}
                className={`relative rounded-xl flex items-center justify-center transition-all outline-none ${
                  accountMenuOpen ? "ring-2 ring-primary/45 ring-offset-1 ring-offset-transparent" : ""
                }`}
                title="Minha conta"
              >
                <AvatarInitials name={user.name} size="sm" />
                {user.role === "freelancer" && <XPRing progress={xpProgress} size={36} />}
                {user.role === "freelancer" && (
                  <span className="absolute -bottom-1 -right-1 pointer-events-none" style={{ zIndex: 1 }}>
                    <LevelBadgeIcon level={user.level} size="xs" />
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -6 }}
                    transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl z-50 overflow-hidden"
                    style={{
                      background: "rgba(3, 6, 11, 0.97)",
                      backdropFilter: "blur(40px) saturate(180%)",
                      borderColor: "rgba(255,255,255,0.1)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05) inset",
                    }}
                  >
                    {/* User info */}
                    <div className="p-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <AvatarInitials name={user.name} />
                          {user.role === "freelancer" && <XPRing progress={xpProgress} size={44} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate leading-tight text-white/90">{user.name}</p>
                          <p className="text-[11px] text-white/40 truncate mt-0.5">{user.email}</p>
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            {user.role === "freelancer" && <LevelBadge level={user.level} size="xs" />}
                            {isAdmin && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                <Shield size={9} /> {adminRoleLabel}
                              </span>
                            )}
                            {user.role === "company" && user.companyName && (
                              <span className="text-[10px] text-white/40 truncate">{user.companyName}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nav items */}
                    <div className="p-1.5 max-h-[56vh] overflow-y-auto">
                      {accountMenuItems.map((item: any, i) => {
                        if (item.divider) {
                          return <div key={i} className="my-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />;
                        }
                        const active = item.href && isActive(item.href) && item.href !== "/";
                        if (item.action === "support") {
                          return (
                            <motion.button
                              key={i}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => { window.open("mailto:suporte@extrag0.com.br", "_blank"); setAccountMenuOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer group text-white/60 hover:text-white/85 hover:bg-white/5 font-medium"
                            >
                              <span className="flex-shrink-0 text-white/50 group-hover:text-white/75 transition-colors">{item.icon}</span>
                              {item.label}
                            </motion.button>
                          );
                        }
                        return (
                          <Link key={i} href={item.href!}>
                            <motion.div
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setAccountMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer group ${
                                active
                                  ? "text-primary bg-primary/8 font-semibold"
                                  : "text-white/70 hover:text-white/95 hover:bg-white/5 font-medium"
                              }`}
                            >
                              <span className={`flex-shrink-0 transition-colors ${active ? "text-primary" : "text-white/50 group-hover:text-white/75"}`}>
                                {item.icon}
                              </span>
                              {item.label}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { logout(); setAccountMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/8 transition-all font-medium"
                      >
                        <LogOut size={14} className="flex-shrink-0" /> Sair da conta
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main scroll area */}
        <main className={`flex-1 overflow-hidden relative ${isChatPage ? "flex flex-col" : "overflow-y-auto pb-[64px] lg:pb-0"}`}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-tab-bar lg:hidden z-20">
        <div className="flex items-stretch h-[56px]">
          {bottomItems.map((item) => {
            if (item.isMais) {
              return (
                <motion.button
                  key="mais"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setMaisOpen(true)}
                  className={`flex-1 flex flex-col items-center justify-center h-full gap-[3px] transition-all relative ${
                    maisOpen ? "text-primary" : "text-white/40"
                  }`}
                >
                  {maisOpen && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-x-2 inset-y-1.5 rounded-xl"
                      style={{ background: "rgba(124, 252, 0, 0.07)" }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    />
                  )}
                  {maisOpen && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                      style={{ width: 24, height: 2, borderRadius: 2, background: "hsl(88, 100%, 49%)", boxShadow: "0 0 8px rgba(124,252,0,0.75)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={maisOpen ? { scale: 1.08 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`relative ${maisOpen ? "nav-icon-active" : ""}`}
                  >
                    <MoreHorizontal size={20} />
                  </motion.div>
                  <span className={`text-[9px] font-bold leading-none tracking-wide ${maisOpen ? "text-primary" : "text-white/50"}`}>
                    Mais
                  </span>
                </motion.button>
              );
            }

            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`flex flex-col items-center justify-center h-full gap-[3px] transition-all relative ${
                    active ? "text-primary" : "text-white/40"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-bg"
                      className="absolute inset-x-2 inset-y-1.5 rounded-xl"
                      style={{ background: "rgba(124, 252, 0, 0.07)" }}
                      transition={{ type: "spring", stiffness: 450, damping: 28 }}
                    />
                  )}
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                      style={{ width: 24, height: 2, borderRadius: 2, background: "hsl(88, 100%, 49%)", boxShadow: "0 0 8px rgba(124,252,0,0.75)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={active ? { scale: 1.08 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`relative ${active ? "nav-icon-active" : ""}`}
                  >
                    {item.icon}
                    {item.href === "/app/chat" && unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[13px] h-[13px] rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-black px-0.5 leading-none">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                    {item.href === "/app/notifications" && unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[13px] h-[13px] rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white px-0.5 leading-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </motion.div>
                  <span className={`text-[9px] font-bold leading-none tracking-wide ${active ? "text-primary" : "text-white/50"}`}>
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
