import React, { useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getListNotificationsQueryOptions,
  listNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDeleteNotification,
  type NotificationCategory,
  type Notification,
} from "@workspace/api-client-react";
import {
  Bell, CheckCheck, BellOff, Briefcase, DollarSign, FileText, AlertCircle,
  MessageCircle, ShieldCheck, ShieldAlert, Settings2, Search, Trash2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 20;

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; accent: string }> = {
  new_application:      { icon: <FileText size={14} />,    color: "text-yellow-400",  bg: "bg-yellow-500/12",  accent: "#eab308" },
  application_submitted:{ icon: <FileText size={14} />,    color: "text-yellow-400",  bg: "bg-yellow-500/12",  accent: "#eab308" },
  application_approved: { icon: <CheckCheck size={14} />,  color: "text-primary",     bg: "bg-primary/12",     accent: "#7CFC00" },
  application_rejected: { icon: <AlertCircle size={14} />, color: "text-red-400",     bg: "bg-red-500/12",     accent: "#ef4444" },
  counter_offer:        { icon: <Briefcase size={14} />,   color: "text-blue-400",    bg: "bg-blue-500/10",    accent: "#3b82f6" },
  counter_accepted:     { icon: <CheckCheck size={14} />,  color: "text-primary",     bg: "bg-primary/12",     accent: "#7CFC00" },
  counter_rejected:     { icon: <AlertCircle size={14} />, color: "text-red-400",     bg: "bg-red-500/12",     accent: "#ef4444" },
  job_completed:        { icon: <Briefcase size={14} />,   color: "text-emerald-400", bg: "bg-emerald-500/12", accent: "#10b981" },
  level_up:             { icon: <CheckCheck size={14} />,  color: "text-purple-400",  bg: "bg-purple-500/12",  accent: "#a855f7" },
  commission_received:  { icon: <DollarSign size={14} />,  color: "text-teal-400",    bg: "bg-teal-500/12",    accent: "#14b8a6" },
  payment_received:     { icon: <DollarSign size={14} />,  color: "text-teal-400",    bg: "bg-teal-500/12",    accent: "#14b8a6" },
  deposit_confirmed:    { icon: <DollarSign size={14} />,  color: "text-teal-400",    bg: "bg-teal-500/12",    accent: "#14b8a6" },
  deposit_rejected:     { icon: <AlertCircle size={14} />, color: "text-red-400",     bg: "bg-red-500/12",     accent: "#ef4444" },
  withdrawal_approved:  { icon: <DollarSign size={14} />,  color: "text-purple-400",  bg: "bg-purple-500/12",  accent: "#a855f7" },
  new_message:          { icon: <MessageCircle size={14} />, color: "text-blue-400",  bg: "bg-blue-500/10",    accent: "#3b82f6" },
  account_approved:     { icon: <ShieldCheck size={14} />, color: "text-primary",     bg: "bg-primary/12",     accent: "#7CFC00" },
  account_rejected:     { icon: <ShieldAlert size={14} />, color: "text-red-400",     bg: "bg-red-500/12",     accent: "#ef4444" },
  documents_requested:  { icon: <ShieldAlert size={14} />, color: "text-amber-400",   bg: "bg-amber-500/12",   accent: "#f59e0b" },
  selfie_requested:      { icon: <ShieldAlert size={14} />, color: "text-amber-400",   bg: "bg-amber-500/12",   accent: "#f59e0b" },
  verification_suspended:{ icon: <ShieldAlert size={14} />, color: "text-red-400",    bg: "bg-red-500/12",     accent: "#ef4444" },
  verification_resumed: { icon: <ShieldCheck size={14} />, color: "text-primary",     bg: "bg-primary/12",     accent: "#7CFC00" },
  system:                { icon: <Bell size={14} />,        color: "text-blue-400",   bg: "bg-blue-500/10",    accent: "#3b82f6" },
};
const fallbackMeta = TYPE_META.system;

const CATEGORIES: { value: NotificationCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all",           label: "Todas",         icon: <Bell size={13} /> },
  { value: "applications",  label: "Extras",        icon: <Briefcase size={13} /> },
  { value: "messages",      label: "Mensagens",     icon: <MessageCircle size={13} /> },
  { value: "payments",      label: "Pagamentos",    icon: <DollarSign size={13} /> },
  { value: "verification",  label: "Verificação",   icon: <ShieldCheck size={13} /> },
  { value: "security",      label: "Segurança",     icon: <ShieldAlert size={13} /> },
  { value: "admin",         label: "Admin",         icon: <Settings2 size={13} /> },
  { value: "system",        label: "Sistema",       icon: <Bell size={13} /> },
];

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  urgent: { label: "Urgente", color: "#ef4444" },
  high:   { label: "Alta",    color: "#f59e0b" },
  normal: { label: "Normal",  color: "#3b82f6" },
  low:    { label: "Baixa",   color: "rgba(255,255,255,0.35)" },
};

type ReadFilter = "all" | "unread" | "read";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const queryKey = ["notifications-center", category, readFilter, search];

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => listNotifications({
      page: pageParam,
      limit: PAGE_SIZE,
      ...(category !== "all" ? { category } : {}),
      ...(readFilter === "unread" ? { unreadOnly: true } : {}),
      ...(search ? { search } : {}),
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const deleteOne = useDeleteNotification();

  const pages = data?.pages ?? [];
  const allItems = useMemo(() => pages.flatMap(p => p.items), [pages]);
  const items = readFilter === "read" ? allItems.filter(n => n.isRead) : allItems;
  const total = pages[0]?.total ?? 0;
  const unreadCount = pages[0]?.unreadCount ?? 0;

  React.useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications-badge"] });
      toast.success("Todas as notificações marcadas como lidas");
    } catch {
      toast.error("Não foi possível marcar as notificações");
    }
  };

  const handleMarkOne = async (id: number) => {
    await markOne.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
    await queryClient.invalidateQueries({ queryKey: ["notifications-badge"] });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOne.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: ["notifications-center"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications-badge"] });
      toast.success("Notificação removida");
    } catch {
      toast.error("Não foi possível remover a notificação");
    }
  };

  return (
    <div className="relative p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-28 lg:pb-8">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(59,130,246,0.12) 100%)",
              border: "1px solid rgba(34,197,94,0.25)",
              boxShadow: "0 0 20px rgba(34,197,94,0.15)",
            }}>
            <Bell size={16} className="text-primary relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight neon-text-gradient">Central de Notificações</h1>
            <p className="text-xs text-white/70 mt-0.5">
              {unreadCount > 0
                ? <span className="text-primary font-semibold">{unreadCount} não lida{unreadCount !== 1 ? "s" : ""}</span>
                : <span>Tudo em dia</span>}
              {total > 0 && <span className="text-white/40"> · {total} no total</span>}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
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

      {/* ── Search ── */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar notificações..."
          className="pl-9 pr-9 h-9 text-sm rounded-xl bg-white/5 border-white/10"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => { setSearchInput(""); setSearch(""); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* ── Read filter tabs ── */}
      <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 w-fit">
        {([
          { value: "all", label: "Todas" },
          { value: "unread", label: "Não lidas" },
          { value: "read", label: "Lidas" },
        ] as { value: ReadFilter; label: string }[]).map(tab => (
          <button
            key={tab.value}
            onClick={() => setReadFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              readFilter === tab.value ? "bg-primary/20 text-primary" : "text-white/55 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Category filter chips ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              category === cat.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-white/5 text-white/55 border border-transparent hover:text-white/80"
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
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
      {!isLoading && items.length === 0 && (
        <div className="card-notif-page rounded-2xl overflow-hidden">
          <div className="flex flex-col items-center py-14 px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(59,130,246,0.10) 100%)",
                border: "1px solid rgba(34,197,94,0.20)",
              }}>
              <BellOff size={22} className="text-white/60" />
            </div>
            <div>
              <p className="font-semibold">
                {search || category !== "all" || readFilter !== "all" ? "Nenhum resultado" : "Tudo em dia!"}
              </p>
              <p className="text-xs text-white/70 mt-1 max-w-[220px] leading-relaxed">
                {search || category !== "all" || readFilter !== "all"
                  ? "Ajuste os filtros ou busque por outro termo."
                  : "Novas notificações sobre Extras, candidaturas, pagamentos e verificação aparecerão aqui."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification list ── */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((notif: Notification, i) => {
            const meta = TYPE_META[notif.type ?? "system"] ?? fallbackMeta;
            const priority = PRIORITY_META[notif.priority ?? "normal"] ?? PRIORITY_META.normal;
            const isUnread = !notif.isRead;
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22 }}
                className={`group relative w-full text-left rounded-xl p-4 flex items-start gap-3.5 transition-all card-notif-page ${
                  isUnread ? "hover:opacity-95" : "opacity-60 hover:opacity-80"
                }`}
              >
                <button
                  onClick={() => isUnread && handleMarkOne(notif.id!)}
                  className="flex items-start gap-3.5 flex-1 min-w-0 text-left"
                  disabled={!isUnread}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg} ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold leading-snug">{notif.title}</p>
                      {notif.priority && notif.priority !== "normal" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                          style={{ background: `${priority.color}18`, color: priority.color, border: `1px solid ${priority.color}30` }}>
                          {priority.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-white/60 mt-1.5 font-medium">
                      {notif.createdAt ? format(new Date(notif.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR }) : ""}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                      style={{ background: meta.accent, boxShadow: `0 0 6px ${meta.accent}` }} />
                  )}
                </button>

                <button
                  onClick={() => handleDelete(notif.id!)}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Remover notificação"
                  disabled={deleteOne.isPending}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Infinite scroll sentinel ── */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage && <SkeletonListRow />}
        </div>
      )}
    </div>
  );
}
