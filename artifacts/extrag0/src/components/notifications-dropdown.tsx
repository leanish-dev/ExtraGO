import React, { useState, useRef, useEffect } from "react";
import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, BellOff, Briefcase, DollarSign, FileText, ChevronRight, X, CheckCheck } from "lucide-react";
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
        background: "linear-gradient(160deg, rgba(10,14,20,0.99) 0%, rgba(6,9,14,0.99) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04) inset",
        backdropFilter: "blur(24px)",
        ...(isMobile ? { top: "calc(66px + env(safe-area-inset-top, 0px))" } : {}),
      }}
    >
      {/* Top accent — matches notification identity color */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 5%, rgba(124,252,0,0.50) 35%, rgba(0,229,255,0.30) 65%, transparent 95%)" }} />

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bell size={12} className="text-primary" />
          </div>
          <p className="text-sm font-bold tracking-tight">Notificações</p>
          {unread > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              {unread} nova{unread !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <X size={13} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className={isMobile ? "max-h-[62vh] overflow-y-auto overscroll-contain" : "max-h-72 overflow-y-auto"}>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center py-10 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-3">
              <BellOff size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">Você está em dia</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[180px]">
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
                <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-60"
                  style={{ background: meta.accent }} />

                {/* Hover bg */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(255,255,255,0.030)" }} />

                <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg} ${meta.text}`}>
                  {meta.icon}
                </div>
                <div className="relative flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug">{n.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] mt-1.5 font-medium" style={{ color: "rgba(255,255,255,0.30)" }}>{timeStr}</p>
                </div>
                {/* Unread dot */}
                <div className="relative w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                  style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }} />
              </button>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/app/notifications" onClick={() => setOpen(false)}>
          <button className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-xs font-bold transition-all group"
            style={{ color: "rgba(124,252,0,0.80)" }}>
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
            style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(3px)" }}
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
