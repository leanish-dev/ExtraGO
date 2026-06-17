import React from "react";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, CheckCheck, BellOff, Briefcase, DollarSign, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; accent: string; group: string }> = {
  job_applied:          { icon: <FileText size={14} />,   color: "text-yellow-400",  bg: "bg-yellow-500/12",  accent: "#eab308", group: "Vagas" },
  application_approved: { icon: <CheckCheck size={14} />, color: "text-primary",     bg: "bg-primary/12",     accent: "#7CFC00", group: "Vagas" },
  application_rejected: { icon: <AlertCircle size={14} />,color: "text-red-400",     bg: "bg-red-500/12",     accent: "#ef4444", group: "Vagas" },
  job_completed:        { icon: <Briefcase size={14} />,  color: "text-emerald-400", bg: "bg-emerald-500/12", accent: "#10b981", group: "Vagas" },
  payment_received:     { icon: <DollarSign size={14} />, color: "text-teal-400",    bg: "bg-teal-500/12",    accent: "#14b8a6", group: "Pagamentos" },
  withdrawal_approved:  { icon: <DollarSign size={14} />, color: "text-purple-400",  bg: "bg-purple-500/12",  accent: "#a855f7", group: "Pagamentos" },
  system:               { icon: <Bell size={14} />,       color: "text-blue-400",    bg: "bg-blue-500/10",    accent: "#3b82f6", group: "Sistema" },
};
const fallbackMeta = TYPE_META.system;

function getCardClass(type: string | null | undefined): string {
  const group = TYPE_META[type ?? "system"]?.group ?? "Sistema";
  if (group === "Vagas") return "notif-card notif-card-jobs";
  if (group === "Pagamentos") return "notif-card notif-card-payment";
  return "notif-card notif-card-system";
}

/* ── Inline SVG Bell Watermark ── */
function BellWatermark() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute pointer-events-none select-none"
      style={{ top: -10, right: -10, width: 140, height: 140 }}
      aria-hidden="true"
    >
      <path
        d="M60 10C44 10 31 23 31 39v3C21 46 14 54 14 64v4h92v-4c0-10-7-18-17-22v-3c0-16-13-29-29-29z"
        stroke="rgba(59,130,246,0.22)" strokeWidth="2.5" fill="none"
      />
      <path d="M50 68c0 6 4 10 10 10s10-4 10-10" stroke="rgba(59,130,246,0.22)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="28" r="12" stroke="rgba(34,197,94,0.28)" strokeWidth="2" fill="none" />
      <text x="84" y="33" fill="rgba(34,197,94,0.40)" fontSize="11" fontWeight="bold" fontFamily="system-ui">1</text>
    </svg>
  );
}

/* ── Inline SVG Wave Lines — bottom of page ── */
function WaveLines() {
  return (
    <svg
      viewBox="0 0 600 80"
      preserveAspectRatio="none"
      className="absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none"
      style={{ height: 80 }}
      aria-hidden="true"
    >
      {/* Green wave */}
      <path
        d="M0,60 C80,40 160,70 240,55 C320,40 400,65 480,50 C540,38 580,55 600,48"
        stroke="rgba(34,197,94,0.18)" strokeWidth="1.5" fill="none"
      />
      <path
        d="M0,68 C70,52 150,72 230,62 C310,50 390,68 470,58 C530,48 570,62 600,56"
        stroke="rgba(34,197,94,0.10)" strokeWidth="1" fill="none"
      />
      {/* Blue wave */}
      <path
        d="M0,72 C100,58 200,76 300,65 C400,54 500,70 600,62"
        stroke="rgba(59,130,246,0.18)" strokeWidth="1.5" fill="none"
      />
      <path
        d="M0,78 C120,66 220,78 320,70 C420,62 520,74 600,68"
        stroke="rgba(0,229,255,0.10)" strokeWidth="1" fill="none"
      />
      {/* Glow dots on waves */}
      <circle cx="240" cy="55" r="2" fill="rgba(34,197,94,0.45)" />
      <circle cx="470" cy="58" r="1.5" fill="rgba(34,197,94,0.35)" />
      <circle cx="300" cy="65" r="2" fill="rgba(59,130,246,0.40)" />
    </svg>
  );
}

/* ── Dot grid — top-left corner ── */
function DotGrid() {
  return (
    <div
      className="absolute top-0 left-0 pointer-events-none select-none"
      style={{
        width: 120, height: 100,
        backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.22) 1.5px, transparent 1.5px)",
        backgroundSize: "12px 12px",
        WebkitMaskImage: "radial-gradient(ellipse at 0% 0%, black 0%, transparent 75%)",
        maskImage: "radial-gradient(ellipse at 0% 0%, black 0%, transparent 75%)",
      }}
      aria-hidden="true"
    />
  );
}

export default function NotificationsPage() {
  const { data: notifs = [], isLoading, refetch } = useListNotifications(undefined, {
    query: {
      queryKey: ["notifications-page"],
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    },
  });
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      refetch();
      toast.success("Todas as notificações marcadas como lidas");
    } catch {}
  };

  const handleMarkOne = async (id: number) => {
    await markOne.mutateAsync({ id });
    refetch();
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div className="relative p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-28 lg:pb-8">
      {/* ── Page ambient background ── */}
      <div className="mod-notif-ambient absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <DotGrid />
        <WaveLines />
        {/* Bell watermark top-right */}
        <div className="absolute top-0 right-0 pointer-events-none select-none">
          <BellWatermark />
        </div>
        {/* Soft green left glow */}
        <div className="absolute top-24 left-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)", filter: "blur(48px)" }} />
        {/* Soft blue right glow */}
        <div className="absolute top-8 right-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", filter: "blur(48px)" }} />
      </div>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(59,130,246,0.12) 100%)",
              border: "1px solid rgba(34,197,94,0.25)",
              boxShadow: "0 0 20px rgba(34,197,94,0.15)",
            }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.50), rgba(59,130,246,0.30))" }} />
            <Bell size={16} className="text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Notificações</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unread > 0
                ? <span className="text-primary font-semibold">{unread} não lida{unread !== 1 ? "s" : ""}</span>
                : <span>Tudo em dia</span>}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:border-primary/50 text-primary/70 hover:text-primary text-xs gap-1.5 rounded-xl h-8"
            onClick={handleMarkAll}
            disabled={markAll.isPending}
          >
            <CheckCheck size={12} /> Marcar todas lidas
          </Button>
        )}
      </div>

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-notif-page rounded-xl p-4">
              <SkeletonListRow />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && notifs.length === 0 && (
        <div className="card-notif-page rounded-2xl overflow-hidden">
          <div className="flex flex-col items-center py-14 px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(59,130,246,0.10) 100%)",
                border: "1px solid rgba(34,197,94,0.20)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, rgba(34,197,94,0.45), rgba(59,130,246,0.30))" }} />
              <BellOff size={22} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Tudo em dia!</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                Novas notificações sobre Extras, candidaturas e pagamentos aparecerão aqui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification list ── */}
      <div className="space-y-2">
        <AnimatePresence>
          {notifs.map((notif, i) => {
            const meta = TYPE_META[notif.type ?? "system"] ?? fallbackMeta;
            const isUnread = !notif.isRead;
            return (
              <motion.button
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28, delay: i * 0.04 }}
                onClick={() => isUnread && handleMarkOne(notif.id!)}
                className={`w-full text-left rounded-xl p-4 flex items-start gap-3.5 transition-all ${getCardClass(notif.type)} ${
                  isUnread ? "hover:opacity-95 cursor-pointer" : "opacity-55 hover:opacity-70 cursor-default"
                }`}
              >
                {/* Type icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg} ${meta.color}`}>
                  {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold leading-snug">{notif.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: `${meta.accent}18`, color: meta.accent, border: `1px solid ${meta.accent}30` }}>
                      {meta.group}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">
                    {notif.createdAt ? format(new Date(notif.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR }) : ""}
                  </p>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }} />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
