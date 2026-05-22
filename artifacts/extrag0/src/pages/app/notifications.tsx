import React from "react";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, string> = {
  job_applied: "📋",
  application_approved: "✅",
  application_rejected: "❌",
  job_completed: "🎉",
  payment_received: "💰",
  withdrawal_approved: "💸",
  system: "📢",
};

export default function NotificationsPage() {
  const { data: notifs = [], refetch } = useListNotifications();
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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notificações</h1>
          <p className="text-muted-foreground mt-1">{unread} não lida{unread !== 1 ? "s" : ""}</p>
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

      {notifs.length === 0 && (
        <div className="text-center py-20">
          <BellOff size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">Nenhuma notificação</p>
          <p className="text-sm text-muted-foreground mt-1">Você está em dia!</p>
        </div>
      )}

      <div className="space-y-2">
        {notifs.map(notif => (
          <button
            key={notif.id}
            onClick={() => !notif.isRead && handleMarkOne(notif.id!)}
            className={`w-full text-left glass-card rounded-xl p-4 flex items-start gap-3 transition-all ${
              !notif.isRead ? "border-primary/20 bg-primary/5" : "opacity-60 hover:opacity-80"
            }`}
          >
            <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[notif.type ?? "system"] ?? "🔔"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notif.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notif.createdAt ? format(new Date(notif.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR }) : ""}
              </p>
            </div>
            {!notif.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
