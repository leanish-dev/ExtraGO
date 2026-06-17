import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutDashboard, Briefcase, Globe, Wallet, User, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

const FREELANCER_NAV: BottomNavItem[] = [
  {
    label: "Carreira",
    href: "/app/career",
    icon: <TrendingUp size={22} strokeWidth={1.8} />,
    activeIcon: <TrendingUp size={22} strokeWidth={2.4} />,
  },
  {
    label: "Extras",
    href: "/app/jobs",
    icon: <Briefcase size={22} strokeWidth={1.8} />,
    activeIcon: <Briefcase size={22} strokeWidth={2.4} />,
  },
  {
    label: "Rede",
    href: "/app/network",
    icon: <Globe size={22} strokeWidth={1.8} />,
    activeIcon: <Globe size={22} strokeWidth={2.4} />,
  },
  {
    label: "Carteira",
    href: "/app/wallet",
    icon: <Wallet size={22} strokeWidth={1.8} />,
    activeIcon: <Wallet size={22} strokeWidth={2.4} />,
  },
  {
    label: "Perfil",
    href: "/app/profile",
    icon: <User size={22} strokeWidth={1.8} />,
    activeIcon: <User size={22} strokeWidth={2.4} />,
  },
];

const COMPANY_NAV: BottomNavItem[] = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
    icon: <LayoutDashboard size={22} strokeWidth={1.8} />,
    activeIcon: <LayoutDashboard size={22} strokeWidth={2.4} />,
  },
  {
    label: "Extras",
    href: "/app/jobs",
    icon: <Briefcase size={22} strokeWidth={1.8} />,
    activeIcon: <Briefcase size={22} strokeWidth={2.4} />,
  },
  {
    label: "Rede",
    href: "/app/network",
    icon: <Globe size={22} strokeWidth={1.8} />,
    activeIcon: <Globe size={22} strokeWidth={2.4} />,
  },
  {
    label: "Carteira",
    href: "/app/wallet",
    icon: <Wallet size={22} strokeWidth={1.8} />,
    activeIcon: <Wallet size={22} strokeWidth={2.4} />,
  },
  {
    label: "Perfil",
    href: "/app/profile",
    icon: <User size={22} strokeWidth={1.8} />,
    activeIcon: <User size={22} strokeWidth={2.4} />,
  },
];

export default function BottomNav() {
  const [loc] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const NAV_ITEMS = user.role === "freelancer" ? FREELANCER_NAV : COMPANY_NAV;

  const isActive = (href: string) =>
    href === "/app/dashboard" || href === "/app/career"
      ? loc === href
      : loc.startsWith(href);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: "linear-gradient(180deg, rgba(6,9,14,0.88) 0%, rgba(8,11,18,0.97) 100%)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderTop: "1px solid rgba(0,201,167,0.13)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.03) inset",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,201,167,0.30) 30%, rgba(22,163,74,0.35) 50%, rgba(0,201,167,0.30) 70%, transparent 100%)" }}
      />

      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.12, type: "spring", stiffness: 500, damping: 30 }}
                className="relative flex flex-col items-center justify-center h-full gap-1 cursor-pointer select-none"
                style={{ minWidth: 0 }}
              >
                {active && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: 32,
                      height: 3,
                      background: "linear-gradient(90deg, #16a34a, #00c9a7)",
                      boxShadow: "0 0 10px rgba(22,163,74,0.55)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 36 }}
                  />
                )}
                <div
                  style={{
                    color: active ? "#4ade80" : "rgba(255,255,255,0.42)",
                    filter: active ? "drop-shadow(0 0 6px rgba(74,222,128,0.45))" : "none",
                    transition: "color 0.15s, filter 0.15s",
                    lineHeight: 0,
                  }}
                >
                  {active ? (item.activeIcon ?? item.icon) : item.icon}
                </div>
                <span
                  className="text-[10px] font-semibold leading-none truncate"
                  style={{
                    color: active ? "#4ade80" : "rgba(255,255,255,0.38)",
                    transition: "color 0.15s",
                    maxWidth: 56,
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
