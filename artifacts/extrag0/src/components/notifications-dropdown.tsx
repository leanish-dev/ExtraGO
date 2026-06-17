import React, { useState, useRef, useEffect } from "react";
import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, BellOff, Briefcase, DollarSign, FileText, ChevronRight, X, CheckCheck, Zap, Activity } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

const TYPE_META: Record<string, { icon: React.ReactNode; bg: string; text: string; accent: string }> = {
  job_applied:            { icon: <FileText size={13} />,    bg: "bg-yellow-500/12",    text: "text-yellow-400",   accent: "#eab308" },
  application_approved:   { icon: <Briefcase size={13} />,  bg: "bg-primary/12",       text: "text-primary",      accent: "#7CFC00" },
  application_rejected:   { icon: <Briefcase size={13} />,  bg: "bg-red-500/12",       text: "text-red-400",      accent: "#ef4444" },
  job_completed:          { icon: <CheckCheck size={13} />, bg: "bg-emerald-500/12",   text: "text-emerald-400",  accent: "#10b981" },
  payment_received:       { icon: <DollarSign size={13} />, bg: "bg-teal-500/12",      text: "text-teal-400",     accent: "#14b8a6" },
  withdrawal_approved:    { icon: <DollarSign size={13} />, bg: "bg-purple-500/12",    text: "text-purple-400",   accent: "#a855f7" },
  system:                 { icon: <Bell size={13} />,        bg: "bg-white/6",          text: "text-muted-foreground", accent: "rgba(255,255,255,0.20)" },
};
const fallbackMeta = TYPE_META.system;

/* ── Command Center SVG Header ── */
function CommandCenterHeader({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="relative overflow-hidden" style={{ height: 110 }}>
      {/* Dark gradient base */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, rgba(6,12,20,1) 0%, rgba(8,16,26,1) 50%, rgba(5,10,18,1) 100%)",
      }} />

      {/* Module ambient fills */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 60% 80% at 10% 20%, rgba(34,197,94,0.22) 0%, transparent 55%),
          radial-gradient(ellipse 40% 60% at 90% 80%, rgba(59,130,246,0.18) 0%, transparent 50%),
          radial-gradient(ellipse 35% 50% at 50% 50%, rgba(20,184,166,0.10) 0%, transparent 60%)
        `,
      }} />

      {/* SVG: connection network + sparklines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true">
        {/* Connection lines */}
        <line x1="30" y1="35" x2="80" y2="55" stroke="rgba(34,197,94,0.25)" strokeWidth="0.8" strokeDasharray="3,2"/>
        <line x1="80" y1="55" x2="140" y2="40" stroke="rgba(20,184,166,0.22)" strokeWidth="0.8" strokeDasharray="3,2"/>
        <line x1="140" y1="40" x2="200" y2="60" stroke="rgba(59,130,246,0.22)" strokeWidth="0.8" strokeDasharray="3,2"/>
        <line x1="200" y1="60" x2="260" y2="45" stroke="rgba(139,92,246,0.20)" strokeWidth="0.8" strokeDasharray="3,2"/>
        <line x1="260" y1="45" x2="300" y2="65" stroke="rgba(245,158,11,0.20)" strokeWidth="0.8" strokeDasharray="3,2"/>
        <line x1="80" y1="55" x2="80" y2="85" stroke="rgba(34,197,94,0.15)" strokeWidth="0.6"/>
        <line x1="200" y1="60" x2="200" y2="90" stroke="rgba(59,130,246,0.15)" strokeWidth="0.6"/>

        {/* Activity sparkline — growth curve */}
        <path d="M10,95 L30,88 L55,92 L80,78 L105,82 L130,70 L155,75 L180,62 L205,67 L230,55 L255,60 L280,48 L310,52"
          stroke="rgba(124,252,0,0.35)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10,99 L30,94 L55,97 L80,86 L105,89 L130,80 L155,83 L180,72 L205,76 L230,66 L255,70 L280,60 L310,63"
          stroke="rgba(20,184,166,0.20)" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Node dots */}
        <circle cx="30" cy="35" r="3" fill="rgba(34,197,94,0.7)" />
        <circle cx="30" cy="35" r="6" fill="none" stroke="rgba(34,197,94,0.25)" strokeWidth="1"/>
        <circle cx="80" cy="55" r="2.5" fill="rgba(20,184,166,0.7)" />
        <circle cx="140" cy="40" r="3" fill="rgba(59,130,246,0.7)" />
        <circle cx="140" cy="40" r="6" fill="none" stroke="rgba(59,130,246,0.22)" strokeWidth="1"/>
        <circle cx="200" cy="60" r="2.5" fill="rgba(139,92,246,0.7)" />
        <circle cx="260" cy="45" r="3" fill="rgba(245,158,11,0.7)" />
        <circle cx="300" cy="65" r="2.5" fill="rgba(236,72,153,0.6)" />

        {/* Dot grid — bottom left */}
        {[0,1,2,3,4].map(r => [0,1,2,3].map(c => (
          <circle key={`${r}-${c}`} cx={8 + c * 10} cy={75 + r * 8} r="0.9"
            fill={`rgba(34,197,94,${0.12 - r * 0.02})`} />
        )))}

        {/* Dot grid — top right */}
        {[0,1,2].map(r => [0,1,2,3].map(c => (
          <circle key={`tr-${r}-${c}`} cx={288 + c * 9} cy={10 + r * 9} r="0.8"
            fill={`rgba(59,130,246,${0.12 - r * 0.02})`} />
        )))}

        {/* "GO" watermark */}
        <text x="155" y="58" fill="rgba(124,252,0,0.06)" fontSize="38" fontWeight="900"
          fontFamily="system-ui" letterSpacing="-2" textAnchor="middle">GO</text>
      </svg>

      {/* Dark overlay for content readability */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, rgba(6,10,16,0.10) 0%, rgba(6,10,16,0.55) 75%, rgba(6,10,16,0.95) 100%)",
      }} />

      {/* Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Top: label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity size={10} className="text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.20em] text-primary/70">Central de Notificações</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-bold text-green-400/70 uppercase tracking-wide">Live</span>
          </div>
        </div>

        {/* Bottom: module identity dots */}
        <div className="flex items-center gap-2">
          {[
            { color: "#22c55e", label: "Carreira" },
            { color: "#14b8a6", label: "Wallet" },
            { color: "#3b82f6", label: "Rede" },
            { color: "#8b5cf6", label: "Extras" },
            { color: "#f59e0b", label: "Indicações" },
            { color: "#ec4899", label: "Gov" },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color, boxShadow: `0 0 4px ${m.color}` }} />
              <span className="text-[8px] font-semibold hidden sm:block" style={{ color: `${m.color}80` }}>{m.label}</span>
            </div>
          ))}
          <div className="flex-1" />
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.60) 0%, rgba(59,130,246,0.45) 50%, rgba(236,72,153,0.35) 100%)" }} />
    </div>
  );
}

interface NotificationsDropdownProps {
  unread: number;
}

export function NotificationBell({ unread }: NotificationsDropdownProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { data: notifs = [], refetch } = useListNotifications(undefined, {
    query: {
      queryKey: ["notifications-badge"],
      enabled: !!user,
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    },
  });
  const markOne = useMarkNotificationRead();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick as EventListener);
    };
  }, [open]);

  const recent = notifs.filter(n => !n.isRead).slice(0, 5);

  const handleMarkRead = async (id: number) => {
    await markOne.mutateAsync({ id });
    refetch();
  };

  const panelContent = (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.96, y: isMobile ? -4 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: isMobile ? -4 : -6 }}
      transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
      className={
        isMobile
          ? "fixed left-3 right-3 z-[9999] rounded-2xl overflow-hidden"
          : "absolute right-0 top-12 w-80 rounded-2xl z-50 overflow-hidden"
      }
      style={{
        background: "rgba(5,9,15,0.99)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.90), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 60px rgba(34,197,94,0.06)",
        backdropFilter: "blur(32px)",
        ...(isMobile ? { top: "calc(66px + env(safe-area-inset-top, 0px))" } : {}),
      }}
    >
      {/* Command center header */}
      <CommandCenterHeader unreadCount={unread} />

      {/* Panel sub-header with close on mobile */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,12,18,0.95)" }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell size={10} className="text-primary" />
            </div>
            <p className="text-xs font-bold tracking-tight">Notificações</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <X size={13} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Notification list */}
      <div className={isMobile ? "max-h-[52vh] overflow-y-auto overscroll-contain" : "max-h-64 overflow-y-auto"}>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center py-9 px-4 text-center relative overflow-hidden">
            {/* Empty state dot grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.09) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, black 0%, transparent 72%)",
              maskImage: "radial-gradient(ellipse at 50% 50%, black 0%, transparent 72%)",
            }} />
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-3 relative">
              <BellOff size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold relative">Você está em dia</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[180px] relative">
              Sem notificações não lidas no momento.
            </p>
          </div>
        ) : (
          recent.map((n, idx) => {
            const meta = TYPE_META[n.type ?? "system"] ?? fallbackMeta;
            const timeStr = n.createdAt
              ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })
              : "";
            return (
              <button
                key={n.id}
                onClick={() => n.id && handleMarkRead(n.id)}
                className="w-full text-left flex items-start gap-3 px-4 py-3.5 transition-all group relative"
                style={{
                  borderBottom: idx < recent.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                {/* Type accent strip on left edge */}
                <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-70"
                  style={{ background: meta.accent }} />

                {/* Hover bg */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.028)" }} />

                <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg} ${meta.text}`}
                  style={{ border: `1px solid ${meta.accent}22` }}>
                  {meta.icon}
                </div>
                <div className="relative flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] mt-1.5 font-medium" style={{ color: "rgba(255,255,255,0.30)" }}>{timeStr}</p>
                </div>
                {/* Unread dot */}
                <div className="relative w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                  style={{ background: meta.accent, boxShadow: `0 0 5px ${meta.accent}` }} />
              </button>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(6,10,16,0.80)" }}>
        <Link href="/app/notifications" onClick={() => setOpen(false)}>
          <button className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold transition-all group"
            style={{ color: "rgba(124,252,0,0.80)" }}>
            <Zap size={11} className="text-primary" />
            <span className="group-hover:underline underline-offset-2">Ver todas as notificações</span>
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all"
      >
        <Bell size={17} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && panelContent}
      </AnimatePresence>
    </div>
  );
}
