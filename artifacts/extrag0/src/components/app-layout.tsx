import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  LayoutDashboard, Briefcase, FileText, Wallet, Settings,
  LogOut, Bell, Star, Trophy, Home,
  Shield, UserCheck, CreditCard, BarChart3, ChevronLeft, Users, PanelLeftClose, PanelLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useListNotifications } from "@workspace/api-client-react";
import { motion } from "framer-motion";

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
      { href: "/app/dashboard", label: "Início", icon: <LayoutDashboard size={20} /> },
      { href: "/app/jobs", label: "Vagas", icon: <Briefcase size={20} /> },
      { href: "/app/applications", label: "Candidatos", icon: <UserCheck size={20} /> },
      { href: "/app/wallet", label: "Carteira", icon: <Wallet size={20} /> },
      { href: "/app/profile", label: "Perfil", icon: <Settings size={20} /> },
    ];
  }
  return [
    { href: "/app/dashboard", label: "Início", icon: <LayoutDashboard size={20} /> },
    { href: "/app/jobs", label: "Vagas", icon: <Briefcase size={20} /> },
    { href: "/app/applications", label: "Minhas", icon: <FileText size={20} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={20} /> },
    { href: "/app/profile", label: "Perfil", icon: <Settings size={20} /> },
  ];
}

function LevelBadge({ level }: { level?: string }) {
  const map: Record<string, { label: string; color: string }> = {
    bronze: { label: "Bronze", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
    silver: { label: "Prata", color: "text-slate-300 border-slate-300/30 bg-slate-300/10" },
    gold: { label: "Ouro", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
    elite: { label: "Elite", color: "text-primary border-primary/30 bg-primary/10" },
  };
  const info = map[level ?? "bronze"] ?? map.bronze;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide ${info.color}`}>
      <Star size={9} className="inline mr-1" />{info.label}
    </span>
  );
}

function XPRing({ progress, size = 44 }: { progress: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="absolute -inset-[3px]" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="hsl(88, 100%, 49%)" strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.19, 1, 0.22, 1)" }}
      />
    </svg>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { data: notifs } = useListNotifications(undefined, { query: { queryKey: ["notifications"], enabled: !!user } });
  const unread = notifs?.filter(n => !n.isRead).length ?? 0;

  if (!user) return null;

  const navItems = getNavItems(user.role);
  const bottomItems = getBottomTabItems(user.role);
  const xpProgress = Math.min(100, ((user.completedJobs ?? 0) % 15) / 15 * 100);

  const isActive = (href: string) =>
    location === href || (href !== "/app/dashboard" && href !== "/admin" && location.startsWith(href));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar — collapsible 240px ↔ 72px */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full border-r border-white/5 bg-[#060809] flex-shrink-0 overflow-hidden"
        style={{ minWidth: collapsed ? 72 : 240 }}
      >
        {/* Logo / collapse button */}
        <div className={`flex items-center border-b border-white/5 flex-shrink-0 ${collapsed ? "justify-center p-4 h-[60px]" : "justify-between px-5 h-[60px]"}`}>
          {!collapsed && (
            <Link href="/">
              <img src={logoMain} alt="extraGO" className="h-7 object-contain" />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all flex-shrink-0"
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* User section */}
        <div className={`border-b border-white/5 flex-shrink-0 ${collapsed ? "py-4 px-2 flex justify-center" : "px-4 py-4"}`}>
          {collapsed ? (
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-black">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              {user.role === "freelancer" && <XPRing progress={xpProgress} size={41} />}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.role === "freelancer" && <XPRing progress={xpProgress} size={44} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {user.role === "freelancer" && <LevelBadge level={user.level ?? "bronze"} />}
                {user.role === "company" && (
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{user.companyName}</span>
                )}
                {user.role === "admin" && (
                  <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                    <Shield size={10} /> Administrador
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
                <div
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all cursor-pointer group border-l-2 ${
                    collapsed ? "justify-center px-0 py-3 mx-1" : "gap-3 px-3 py-2.5"
                  } ${
                    active
                      ? "bg-primary/10 text-primary border-l-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-transparent"
                  }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-[10px] bg-primary/20 text-primary border-0 px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                      {active && <ChevronLeft size={13} className="ml-auto flex-shrink-0 opacity-60 rotate-180" />}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`border-t border-white/5 p-2 flex-shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={logout}
            title={collapsed ? "Sair" : undefined}
            className={`flex items-center rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-400/8 transition-all ${
              collapsed ? "justify-center w-10 h-10" : "gap-3 w-full px-3 py-2.5"
            }`}
          >
            <LogOut size={16} />
            {!collapsed && "Sair da conta"}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header — desktop only (no hamburger) */}
        <header className="flex items-center gap-3 h-[60px] px-4 lg:px-5 border-b border-white/5 flex-shrink-0 bg-[#060809]/80 backdrop-blur-sm">
          {/* Page breadcrumb placeholder — keeps header from being totally empty on mobile */}
          <div className="flex-1 lg:hidden">
            <img src={logoMain} alt="extraGO" className="h-6 object-contain" />
          </div>
          <div className="hidden lg:block flex-1" />

          <div className="flex items-center gap-1.5">
            <Link href="/app/notifications">
              <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                <Bell size={17} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-black text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                <Home size={17} />
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar — the ONLY mobile nav (no hamburger/drawer) */}
      <nav className="bottom-tab-bar lg:hidden">
        <div className="flex items-stretch h-16">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center justify-center h-full gap-1 transition-all ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}>
                  <div className={`transition-transform duration-150 ${active ? "scale-110" : ""}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  {active && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
