import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import logoMain from "@assets/1779451173221_1779452671733.png";
import {
  LayoutDashboard, Briefcase, FileText, Wallet, Users, Settings,
  LogOut, Bell, Menu, X, ChevronRight, Star, Trophy, Home,
  Shield, UserCheck, CreditCard, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListNotifications } from "@workspace/api-client-react";

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
    { href: "/app/applications", label: "Minhas Candidaturas", icon: <FileText size={18} /> },
    { href: "/app/wallet", label: "Carteira", icon: <Wallet size={18} /> },
    { href: "/app/referrals", label: "Indicações", icon: <Trophy size={18} /> },
    { href: "/app/profile", label: "Perfil", icon: <Settings size={18} /> },
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
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${info.color}`}>
      <Star size={10} className="inline mr-1" />{info.label}
    </span>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: notifs } = useListNotifications(undefined, { query: { queryKey: ["notifications"], enabled: !!user } });
  const unread = notifs?.filter(n => !n.isRead).length ?? 0;

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 border-r border-white/5 bg-[#080A0D] flex-shrink-0">
      <div className="p-5 border-b border-white/5">
        <Link href="/">
          <img src={logoMain} alt="extraGO" className="h-7 object-contain" />
        </Link>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        {user.role === "freelancer" && (
          <div className="mt-3">
            <LevelBadge level={user.level ?? "bronze"} />
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((user.completedJobs ?? 0) % 15) / 15 * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{user.completedJobs ?? 0} jobs</span>
            </div>
          </div>
        )}
        {user.role === "company" && (
          <p className="text-xs text-muted-foreground mt-1">{user.companyName}</p>
        )}
        {user.role === "admin" && (
          <div className="flex items-center gap-1 mt-1">
            <Shield size={11} className="text-primary" />
            <span className="text-xs text-primary font-medium">Administrador</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location === item.href || (item.href !== "/app/dashboard" && item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}>
                  {item.icon}
                </span>
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs bg-primary/20 text-primary border-0">
                    {item.badge}
                  </Badge>
                )}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut size={18} />
          Sair da conta
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 flex h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 h-14 px-4 lg:px-6 border-b border-white/5 flex-shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Link href="/app/notifications">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                <Home size={18} />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
