import React, { useRef, useEffect, useState } from "react";
import { useLiveActivityFeed } from "@/hooks/use-live-platform-stats";
import type { ActivityFeedItem } from "@workspace/api-client-react";
import { Briefcase, User, FileText, DollarSign, CheckCircle, Clock } from "lucide-react";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, React.ReactNode> = {
  briefcase: <Briefcase size={13} />,
  user: <User size={13} />,
  "file-text": <FileText size={13} />,
  "dollar-sign": <DollarSign size={13} />,
  "check-circle": <CheckCircle size={13} />,
};

const TYPE_COLORS: Record<string, string> = {
  job_created: "bg-primary/10 text-primary",
  job_completed: "bg-green-500/10 text-green-400",
  user_joined: "bg-secondary/10 text-secondary",
  application_submitted: "bg-yellow-400/10 text-yellow-400",
  payment_released: "bg-purple-400/10 text-purple-400",
};

function FeedRow({ item, isNew }: { item: ActivityFeedItem; isNew?: boolean }) {
  const colorClass = TYPE_COLORS[item.type] ?? "bg-white/5 text-muted-foreground";
  const icon = ICON_MAP[item.icon] ?? <Clock size={13} />;
  const timeStr = item.timestamp
    ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: ptBR })
    : "";

  return (
    <motion.div
      layout
      initial={isNew ? { opacity: 0, y: -12, backgroundColor: "rgba(124,252,0,0.06)" } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{item.description}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{item.actorName}</p>
      </div>
      <p className="text-[10px] text-muted-foreground flex-shrink-0">{timeStr}</p>
    </motion.div>
  );
}

export function LiveActivityFeed({ className }: { className?: string }) {
  const { data: items = [], isLoading } = useLiveActivityFeed();
  const prevIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!items.length) return;
    const currentIds = new Set(items.map(i => i.id));
    const freshIds = new Set<string>();
    if (prevIdsRef.current.size > 0) {
      currentIds.forEach(id => {
        if (!prevIdsRef.current.has(id)) freshIds.add(id);
      });
    }
    prevIdsRef.current = currentIds;
    if (freshIds.size > 0) {
      setNewIds(freshIds);
      const t = setTimeout(() => setNewIds(new Set()), 2000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [items]);

  return (
    <div className={`glass-card rounded-2xl p-5 ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm">Atividade ao Vivo</h2>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-green-400 font-medium">Live</span>
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {[1, 2, 3, 4].map(i => <SkeletonListRow key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nenhuma atividade recente.</p>
      ) : (
        <AnimatePresence initial={false}>
          {items.slice(0, 8).map(item => (
            <FeedRow key={item.id} item={item} isNew={newIds.has(item.id)} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
