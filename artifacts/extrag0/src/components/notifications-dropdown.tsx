import React, { useState, useRef, useEffect } from "react";
import { useListNotifications, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, BellOff, Briefcase, DollarSign, FileText, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  job_applied: <FileText size={13} />,
  application_approved: <Briefcase size={13} />,
  application_rejected: <Briefcase size={13} />,
  job_completed: <Briefcase size={13} />,
  payment_received: <DollarSign size={13} />,
  withdrawal_approved: <DollarSign size={13} />,
  system: <Bell size={13} />,
};

const TYPE_COLORS: Record<string, string> = {
  job_applied: "bg-yellow-400/10 text-yellow-400",
  application_approved: "bg-primary/10 text-primary",
  application_rejected: "bg-destructive/10 text-destructive",
  job_completed: "bg-green-500/10 text-green-400",
  payment_received: "bg-secondary/10 text-secondary",
  withdrawal_approved: "bg-purple-400/10 text-purple-400",
  system: "bg-white/5 text-muted-foreground",
};

interface NotificationsDropdownProps {
  unread: number;
}

export function NotificationBell({ unread }: NotificationsDropdownProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const recent = notifs.filter(n => !n.isRead).slice(0, 5);

  const handleMarkRead = async (id: number) => {
    await markOne.mutateAsync({ id });
    refetch();
  };

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

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-12 w-80 bg-[#0A0C0F] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <p className="text-sm font-semibold">Notificações</p>
              {unread > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">
                  {unread} nova{unread !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center py-10 px-4 text-center">
                  <BellOff size={24} className="text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Você está em dia!</p>
                  <p className="text-xs text-muted-foreground mt-1">Nenhuma notificação não lida.</p>
                </div>
              ) : (
                recent.map(n => {
                  const iconBg = TYPE_COLORS[n.type ?? "system"] ?? TYPE_COLORS.system;
                  const icon = TYPE_ICONS[n.type ?? "system"] ?? <Bell size={13} />;
                  const timeStr = n.createdAt
                    ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })
                    : "";
                  return (
                    <button
                      key={n.id}
                      onClick={() => n.id && handleMarkRead(n.id)}
                      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/4 transition-colors border-b border-white/5 last:border-0 group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeStr}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/8 px-4 py-2.5">
              <Link href="/app/notifications" onClick={() => setOpen(false)}>
                <button className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1">
                  Ver todas as notificações <ChevronRight size={12} />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
