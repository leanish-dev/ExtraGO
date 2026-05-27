import React from "react";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, CheckCheck, BellOff, Briefcase, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion } from "framer-motion";

const TYPE_ICONS: Record<string, string> = {
  job_applied: "📋",
  application_approved: "✅",
  application_rejected: "❌",
  job_completed: "🎉",
  payment_received: "💰",
  withdrawal_approved: "💸",
  system: "📢",
};

const TYPE_GROUPS: Record<string, string> = {
  job_applied: "Vagas",
  application_approved: "Vagas",
  application_rejected: "Vagas",
  job_completed: "Vagas",
  payment_received: "Pagamentos",
  withdrawal_approved: "Pagamentos",
  system: "Sistema",
};

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
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {unread > 0 ? `${unread} não lida${unread !== 1 ? "s" : ""}` : "Tudo em dia!"}
          </p>
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary"
            onClick={handleMarkAll}
            disabled={markAll.isPending}
          >
            <CheckCheck size={14} className="mr-1" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card rounded-xl p-4">
              <SkeletonListRow />
            </div>
          ))}
        </div>
      )}

      {!isLoading && notifs.length === 0 && (
        <div className="glass-card rounded-2xl">
          <EmptyState
            icon={<BellOff size={28} />}
            title="Nenhuma notificação"
            description="Você está em dia! Novas notificações sobre vagas, candidaturas e pagamentos aparecerão aqui."
            actionLabel="Buscar Vagas"
            actionHref="/app/jobs"
          />
        </div>
      )}

      <div className="space-y-2">
        {notifs.map((notif, i) => (
          <motion.button
            key={notif.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            onClick={() => !notif.isRead && handleMarkOne(notif.id!)}
            className={`w-full text-left glass-card rounded-xl p-4 flex items-start gap-3 transition-all ${
              !notif.isRead ? "border-primary/20 bg-primary/5 hover:bg-primary/8" : "opacity-60 hover:opacity-80"
            }`}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type ?? "system"] ?? "🔔"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-medium">{notif.title}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground">
                  {TYPE_GROUPS[notif.type ?? "system"] ?? "Sistema"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notif.createdAt ? format(new Date(notif.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR }) : ""}
              </p>
            </div>
            {!notif.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
