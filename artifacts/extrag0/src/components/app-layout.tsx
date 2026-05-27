import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  LayoutDashboard, Briefcase, FileText, Wallet, Settings,
  LogOut, Star, Trophy, Home,
  Shield, UserCheck, CreditCard, BarChart3, Users, PanelLeftClose, PanelLeft,
  ChevronRight, TrendingUp, Bell, Rss, Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useListNotifications } from "@workspace/api-client-react";
import { NotificationBell } from "@/components/notifications-dropdown";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

function getNavItems(role: string): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Painel", icon: <BarChart3 size={18} /> },
      { href: "/admin/users", label: "Usuários", icon: <Users size={18} /> },
      { href: "/admin/jobs", label: "Vagas", icon: <Briefcase size={18} /> },
      { href: "/admin/withdrawals", label: "Saques", icon: <CreditCard size={18} /> },
    ];
  }
  if (role === "company") {
    return [
      { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { href: "/app/jobs", label: "Minhas Vagas", icon: <Briefcase size={18} /> },
      { href: "/app/jobs/new", label: "Publicar Vaga", icon: <FileText size={18} /> },
      { href: "/app/applications", label: "Candidaturas", icon: <UserCheck size={18} /> },
      { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
      { href: "/app/profile", label: "Perfil", icon: <Settings size={18} /> },
    ];
  }
  return [
    { href: "/app/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/app/feed", label: "Feed", icon: <Rss size={18} /> },
    { href: "/app/network", label: "Rede", icon: <Globe size={18} /> },
    { href: "/app/jobs", label: "Buscar Vagas", icon: <Briefcase size={18} /> },
    { href: "/app/applications", label: "Candidaturas", icon: <FileText size={18} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
    { href: "/app/referrals", label: "Indicações", icon: <Trophy size={18} /> },
    { href: "/app/profile", label: "Perfil", icon: <Settings size={18} /> },
  ];
}

function getBottomTabItems(role: string): NavItem[] {
  if (role === "company") {
    return [
      { href: "/app/dashboard", label: "Início", icon: <LayoutDashboard size={21} /> },
      { href: "/app/jobs", label: "Vagas", icon: <Briefcase size={21} /> },
      { href: "/app/applications", label: "Candidatos", icon: <UserCheck size={21} /> },
      { href: "/app/wallet", label: "Carteira", icon: <Wallet size={21} /> },
      { href: "/app/profile", label: "Perfil", icon: <Settings size={21} /> },
    ];
  }
  return [
    { href: "/app/dashboard", label: "Início", icon: <LayoutDashboard size={21} /> },
    { href: "/app/jobs", label: "Vagas", icon: <Briefcase size={21} /> },
    { href: "/app/feed", label: "Feed", icon: <Rss size={21} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={21} /> },
    { href: "/app/profile", label: "Perfil", icon: <Settings size={21} /> },
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
    bronze: { label: "Bronze", color: "text-orange-400 border-orange-400/28 bg-orange-400/8", emoji: "🥉" },
    silver: { label: "Prata", color: "text-slate-300 border-slate-300/28 bg-slate-300/8", emoji: "🥈" },
    gold: { label: "Ouro", color: "text-yellow-400 border-yellow-400/28 bg-yellow-400/8", emoji: "🥇" },
    elite: { label: "Elite", color: "text-primary border-primary/28 bg-primary/8", emoji: "👑" },
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
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: notifs } = useListNotifications(undefined, { query: { queryKey: ["notifications"], enabled: !!user } });
  const unread = notifs?.filter((n: any) => !n.isRead).length ?? 0;

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const bottomItems = getBottomTabItems(user.role);
  const xpProgress = Math.min(100, ((user.completedJobs ?? 0) % 15) / 15 * 100);
  const greeting = getGreeting();
  const firstName = user.name?.split(" ")[0] ?? "Usuário";

  const isActive = (href: string) =>
    location === href || (href !== "/app/dashboard" && href !== "/admin" && location.startsWith(href));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 248 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full border-r border-white/5 bg-[#040608] flex-shrink-0 overflow-hidden"
        style={{ minWidth: collapsed ? 68 : 248 }}
      >
        {/* Logo / collapse */}
        <div className={`flex items-center border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center p-3 h-[60px]" : "justify-between px-4 h-[60px]"}`}>
          {!collapsed && (
            <Link href="/">
              <img src={logoMain} alt="extraGO" className="h-7 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
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
        <div className={`border-b border-white/5 flex-shrink-0 ${collapsed ? "py-4 px-2 flex justify-center" : "px-4 py-4"}`}>
          {collapsed ? (
            <div className="relative">
              <AvatarInitials name={user.name} size="sm" />
              {user.role === "freelancer" && <XPRing progress={xpProgress} size={38} />}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <AvatarInitials name={user.name} />
                  {user.role === "freelancer" && <XPRing progress={xpProgress} size={44} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground/65 font-medium">{greeting}</p>
                  <p className="text-sm font-bold truncate leading-tight mt-0.5">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                {user.role === "freelancer" && <LevelBadge level={user.level ?? "bronze"} />}
                {user.role === "freelancer" && user.reputationScore != null && (
                  <span className="text-[10px] text-yellow-400/75 flex items-center gap-0.5">
                    <Star size={9} className="fill-yellow-400 text-yellow-400" />
                    {(user.reputationScore ?? 0).toFixed(1)}
                  </span>
                )}
                {user.role === "company" && (
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{user.companyName}</span>
                )}
                {user.role === "admin" && (
                  <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                    <Shield size={10} /> Admin
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
                  <span className={`flex-shrink-0 transition-colors ${active ? "text-primary nav-icon-active" : "text-muted-foreground group-hover:text-foreground"}`}>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-3 h-[56px] px-4 lg:px-5 border-b border-white/5 flex-shrink-0 bg-[#040608]/90 backdrop-blur-2xl">
          {/* Mobile: logo */}
          <div className="flex-1 lg:hidden">
            <Link href="/">
              <img src={logoMain} alt="extraGO" className="h-6 object-contain" />
            </Link>
          </div>

          {/* Desktop: greeting */}
          <div className="hidden lg:flex flex-col flex-1">
            <p className="text-xs text-muted-foreground font-medium">{greeting}, <span className="text-foreground font-semibold">{firstName}</span> 👋</p>
          </div>

          <div className="flex items-center gap-1.5">
            {user.role === "freelancer" && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/18 mr-1">
                <TrendingUp size={11} className="text-primary" />
                <span className="text-[11px] font-bold text-primary">{user.completedJobs ?? 0} jobs</span>
              </div>
            )}

            <NotificationBell unread={unread} />

            <Link href="/">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all"
              >
                <Home size={16} />
              </motion.button>
            </Link>

            {/* Mobile avatar */}
            <div className="lg:hidden relative ml-1">
              <div className="relative">
                <AvatarInitials name={user.name} size="sm" />
                {user.role === "freelancer" && <XPRing progress={xpProgress} size={36} />}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-[68px] lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-tab-bar lg:hidden">
        <div className="flex items-stretch h-[58px]">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.86 }}
                  className={`flex flex-col items-center justify-center h-full gap-[3px] transition-all relative ${
                    active ? "text-primary" : "text-muted-foreground/55"
                  }`}
                >
                  {/* Active background glow */}
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

                  {/* Top line indicator */}
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2"
                      style={{
                        width: 28,
                        height: 2,
                        borderRadius: 2,
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
