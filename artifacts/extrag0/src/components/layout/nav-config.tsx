import React from "react";
import {
  LayoutDashboard, Briefcase, FileText, Wallet, Trophy, Globe, Rss,
  User as UserIcon, Settings, Mail, Home, LogOut, BarChart3, Users,
  CreditCard, LineChart, Activity, TrendingUp, MapPin, Shield,
} from "lucide-react";

export type Role = "company" | "freelancer" | "admin";
export type NavAction = "logout" | "support" | "search";

export interface NavItem {
  label: string;
  href?: string;
  action?: NavAction;
  icon: React.ReactNode;
  /** roles that have full (unlocked) access to this item */
  unlocked: Role[];
  /** roles that see this item but locked (Phase 7 — locked ecosystem visibility) */
  locked?: Role[];
  /** message shown when a locked item is tapped */
  lockMessage?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const ALL: Role[] = ["company", "freelancer", "admin"];

/**
 * Single source of truth for the authenticated hamburger menu (Phase 6).
 * Phase 7 locked visibility is data-driven via `locked` + `lockMessage`.
 */
export const APP_NAV_SECTIONS: NavSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      { label: "Dashboard", href: "/app/dashboard", icon: <LayoutDashboard size={16} />, unlocked: ALL },
      { label: "Buscar Extras", href: "/app/jobs", icon: <Briefcase size={16} />, unlocked: ALL },
      { label: "Candidaturas", href: "/app/applications", icon: <FileText size={16} />, unlocked: ALL },
      { label: "Rede", href: "/app/network", icon: <Globe size={16} />, unlocked: ALL },
      { label: "Feed", href: "/app/feed", icon: <Rss size={16} />, unlocked: ALL },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { label: "Carteira", href: "/app/wallet", icon: <Wallet size={16} />, unlocked: ALL },
      {
        label: "Indicações", href: "/app/referrals", icon: <Trophy size={16} />,
        unlocked: ["freelancer", "admin"], locked: ["company"],
        lockMessage: "Indicações são exclusivas para profissionais.",
      },
    ],
  },
  {
    title: "CARREIRA",
    items: [
      {
        label: "Minha Carreira", href: "/app/career", icon: <TrendingUp size={16} />,
        unlocked: ["freelancer", "admin"], locked: ["company"],
        lockMessage: "A progressão de carreira é exclusiva para profissionais.",
      },
    ],
  },
  {
    title: "CONTA",
    items: [
      { label: "Perfil", href: "/app/profile", icon: <UserIcon size={16} />, unlocked: ALL },
      { label: "Configurações", href: "/app/settings", icon: <Settings size={16} />, unlocked: ALL },
      { label: "Central de Ajuda", action: "support", icon: <Mail size={16} />, unlocked: ALL },
    ],
  },
  {
    title: "ADMINISTRAÇÃO",
    items: [
      { label: "Painel Administrativo", href: "/admin", icon: <BarChart3 size={16} />, unlocked: ["admin"] },
      { label: "Usuários", href: "/admin/users", icon: <Users size={16} />, unlocked: ["admin"] },
      { label: "Moderação de Extras", href: "/admin/jobs", icon: <Briefcase size={16} />, unlocked: ["admin"] },
      { label: "Financeiro", href: "/admin/withdrawals", icon: <CreditCard size={16} />, unlocked: ["admin"] },
      { label: "Analytics", href: "/admin/analytics", icon: <LineChart size={16} />, unlocked: ["admin"] },
      { label: "Mapa Brasil", href: "/admin/map", icon: <MapPin size={16} />, unlocked: ["admin"] },
      { label: "Representantes", href: "/admin/representatives", icon: <Globe size={16} />, unlocked: ["admin"] },
      { label: "Centro Nacional de Operações", href: "/admin/ops", icon: <Activity size={16} />, unlocked: ["admin"] },
      { label: "Centro de Governança", href: "/admin/governance", icon: <Shield size={16} />, unlocked: ["admin"] },
    ],
  },
  {
    title: "NAVEGAÇÃO",
    items: [
      { label: "Landing Page", href: "/", icon: <Home size={16} />, unlocked: ALL },
      { label: "Sair da conta", action: "logout", icon: <LogOut size={16} />, unlocked: ALL },
    ],
  },
];

export function isItemLocked(item: NavItem, role: Role): boolean {
  if (role === "admin") return false;
  return !item.unlocked.includes(role) && !!item.locked?.includes(role);
}

function itemVisible(item: NavItem, role: Role): boolean {
  return item.unlocked.includes(role) || !!item.locked?.includes(role);
}

/** Sections (with items) visible to a given role, empty sections removed. */
export function visibleSections(role: Role): NavSection[] {
  return APP_NAV_SECTIONS
    .map(s => ({ ...s, items: s.items.filter(it => itemVisible(it, role)) }))
    .filter(s => s.items.length > 0);
}
