import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  LayoutDashboard, Users, Briefcase, CreditCard, DollarSign,
  MapPin, Settings, Shield, FileText, UserCheck,
  LogOut, PanelLeftClose, PanelLeft, ChevronRight, Activity,
  Home, TrendingUp, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavGroup {
  label: string;
  items: { href: string; label: string; icon: React.ReactNode; roles?: string[] }[];
}

const ADMIN_ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  financial_admin: "Admin Financeiro",
  operations_admin: "Admin Operacional",
  regional_admin: "Admin Regional",
  support_admin: "Admin de Suporte",
  state_representative: "Representante",
};

const ADMIN_ROLE_COLORS: Record<string, string> = {
  super_admin: "text-primary",
  financial_admin: "text-cyan-400",
  operations_admin: "text-yellow-400",
  regional_admin: "text-blue-400",
  support_admin: "text-purple-400",
  state_representative: "text-orange-400",
};

function getNavGroups(): NavGroup[] {
  return [
    {
      label: "Visão Geral",
      items: [
        { href: "/admin", label: "Painel", icon: <LayoutDashboard size={16} /> },
        { href: "/admin/monitoring", label: "Monitoramento", icon: <Activity size={16} /> },
      ],
    },
    {
      label: "Financeiro",
      items: [
        { href: "/admin/financial", label: "Finanças", icon: <DollarSign size={16} />, roles: ["super_admin", "financial_admin"] },
        { href: "/admin/withdrawals", label: "Saques", icon: <CreditCard size={16} />, roles: ["super_admin", "financial_admin"] },
        { href: "/admin/representatives", label: "Representantes", icon: <UserCheck size={16} />, roles: ["super_admin"] },
      ],
    },
    {
      label: "Operacional",
      items: [
        { href: "/admin/users", label: "Usuários", icon: <Users size={16} /> },
        { href: "/admin/jobs", label: "Vagas", icon: <Briefcase size={16} /> },
        { href: "/admin/map", label: "Mapa Regional", icon: <MapPin size={16} /> },
      ],
    },
    {
      label: "Administração",
      items: [
        { href: "/admin/settings", label: "Configurações", icon: <Settings size={16} />, roles: ["super_admin", "financial_admin"] },
        { href: "/admin/audit", label: "Auditoria", icon: <Shield size={16} />, roles: ["super_admin"] },
      ],
    },
  ];
}

function canSeeItem(item: { roles?: string[] }, adminRole: string | null) {
  if (!item.roles) return true;
  const role = adminRole ?? "super_admin";
  return role === "super_admin" || item.roles.includes(role);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const adminRole = (user as any).adminRole ?? null;
  const navGroups = getNavGroups();

  const isActive = (href: string) =>
    href === "/admin" ? location === "/admin" : location.startsWith(href);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 60 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col h-full flex-shrink-0 overflow-hidden"
        style={{
          background: "rgba(4,6,8,0.98)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          minWidth: collapsed ? 60 : 240,
        }}
      >
        {/* Logo + collapse */}
        <div className={`flex items-center border-b flex-shrink-0 ${collapsed ? "justify-center h-[56px] px-2" : "justify-between h-[56px] px-4"}`}
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <Link href="/">
                <img src={logoMain} alt="extraGO" className="h-6 object-contain cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
              <span className="text-[9px] font-black text-primary/70 tracking-widest uppercase mt-0.5 flex-shrink-0">Admin</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/7 transition-all flex-shrink-0"
          >
            {collapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        {/* User identity */}
        <div className={`border-b flex-shrink-0 ${collapsed ? "py-3 flex justify-center" : "px-4 py-3"}`}
          style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/40 to-cyan-400/30 flex items-center justify-center text-xs font-black text-black">
              {user.name?.charAt(0)}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/40 to-cyan-400/30 border border-primary/20 flex items-center justify-center text-sm font-black text-black flex-shrink-0">
                  {user.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                  ADMIN_ROLE_COLORS[adminRole ?? "super_admin"] ?? "text-primary"
                } bg-white/4 border-white/8`}>
                  <Shield size={8} />
                  {ADMIN_ROLE_LABELS[adminRole ?? "super_admin"] ?? "Admin"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden space-y-0.5">
          {navGroups.map(group => {
            const visibleItems = group.items.filter(item => canSeeItem(item, adminRole));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="mb-1">
                {!collapsed && (
                  <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest px-3 pt-3 pb-1">
                    {group.label}
                  </p>
                )}
                {visibleItems.map(item => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer relative overflow-hidden ${
                          collapsed ? "justify-center px-0 py-2.5 mx-0.5" : "gap-2.5 px-2.5 py-2"
                        } ${active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {active && !collapsed && (
                          <motion.div
                            layoutId="admin-nav-bar"
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                            style={{ background: "hsl(88, 100%, 49%)", boxShadow: "0 0 8px rgba(124,252,0,0.65)" }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                        <span className={`flex-shrink-0 ${active ? "text-primary" : ""}`}>{item.icon}</span>
                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {active && <ChevronRight size={10} className="opacity-40" />}
                          </>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className={`border-t p-2 flex-shrink-0 space-y-0.5`} style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <Link href="/">
            <div className={`flex items-center rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer ${
              collapsed ? "justify-center py-2" : "gap-2.5 px-2.5 py-2"
            }`}>
              <Home size={14} />
              {!collapsed && "Voltar ao site"}
            </div>
          </Link>
          <button
            onClick={logout}
            className={`flex items-center rounded-xl text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/7 transition-all w-full ${
              collapsed ? "justify-center py-2" : "gap-2.5 px-2.5 py-2"
            }`}
          >
            <LogOut size={14} />
            {!collapsed && "Sair da conta"}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-3 h-[56px] px-5 flex-shrink-0"
          style={{
            background: "rgba(4,6,8,0.92)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden">
            <Link href="/">
              <img src={logoMain} alt="extraGO" className="h-6 object-contain" />
            </Link>
          </div>

          <div className="flex-1 hidden lg:block">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground">extraGO</p>
              <span className="text-muted-foreground/30">/</span>
              <p className="text-xs font-bold text-foreground">Admin</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15">
              <span className="live-dot" style={{ width: 5, height: 5 }} />
              <span className="text-[9px] font-black text-primary">LIVE</span>
            </div>

            {/* Role badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/4 border border-white/8">
              <Shield size={10} className={ADMIN_ROLE_COLORS[adminRole ?? "super_admin"] ?? "text-primary"} />
              <span className={`text-[9px] font-black ${ADMIN_ROLE_COLORS[adminRole ?? "super_admin"] ?? "text-primary"}`}>
                {ADMIN_ROLE_LABELS[adminRole ?? "super_admin"] ?? "Admin"}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/40 to-cyan-400/30 border border-primary/20 flex items-center justify-center text-xs font-black text-black">
              {user.name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={{
        background: "rgba(4,6,8,0.97)",
        backdropFilter: "blur(30px)",
        borderTop: "1px solid rgba(255,255,255,0.065)",
      }}>
        <div className="flex items-stretch h-[56px]">
          {[
            { href: "/admin", label: "Painel", icon: <LayoutDashboard size={20} /> },
            { href: "/admin/users", label: "Usuários", icon: <Users size={20} /> },
            { href: "/admin/financial", label: "Finanças", icon: <DollarSign size={20} /> },
            { href: "/admin/map", label: "Mapa", icon: <MapPin size={20} /> },
            { href: "/admin/settings", label: "Config", icon: <Settings size={20} /> },
          ].map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all ${
                  active ? "text-primary" : "text-muted-foreground/50"
                }`}>
                  {active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                  )}
                  {item.icon}
                  <span className="text-[8px] font-bold">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
