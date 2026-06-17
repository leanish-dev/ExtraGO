import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListApplications, useApproveApplication, useRejectApplication } from "@workspace/api-client-react";
import type { Application } from "@workspace/api-client-react";
import { CheckCircle, XCircle, Clock, FileText, Loader2, ClipboardList, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonCard } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const STATUS_LABELS: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", class: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", icon: <Clock size={11} /> },
  approved: { label: "Aprovada", class: "bg-primary/15 text-primary border-primary/25", icon: <CheckCircle size={11} /> },
  rejected: { label: "Recusada", class: "bg-destructive/15 text-destructive border-destructive/25", icon: <XCircle size={11} /> },
  withdrawn: { label: "Retirada", class: "bg-white/8 text-muted-foreground border-white/15", icon: <XCircle size={11} /> },
};

function ApplicationCard({ app, isCompany, onApprove, onReject, index }: {
  app: Application;
  isCompany: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  index: number;
}) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const info = STATUS_LABELS[app.status ?? "pending"] ?? STATUS_LABELS.pending;

  const handleApprove = async () => {
    setLoading("approve");
    await onApprove?.(app.id!);
    setLoading(null);
  };
  const handleReject = async () => {
    setLoading("reject");
    await onReject?.(app.id!);
    setLoading(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="rounded-xl p-5 space-y-3 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(8,17,26,0.90) 60%, rgba(59,130,246,0.03) 100%)",
        border: `1px solid ${app.status === "approved" ? "rgba(124,252,0,0.18)" : app.status === "rejected" ? "rgba(239,68,68,0.15)" : "rgba(139,92,246,0.14)"}`,
      }}
    >
      {/* Top accent stripe — status-aware */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: app.status === "approved" ? "linear-gradient(90deg,transparent,rgba(124,252,0,0.45),transparent)" : app.status === "rejected" ? "linear-gradient(90deg,transparent,rgba(239,68,68,0.35),transparent)" : "linear-gradient(90deg,transparent,rgba(139,92,246,0.4),transparent)" }} />
      {/* Extras marketplace watermark — briefcase */}
      <div className="absolute right-2 bottom-1 pointer-events-none select-none opacity-[0.06]">
        <svg width="52" height="48" viewBox="0 0 52 48" fill="none">
          <rect x="4" y="16" width="44" height="30" rx="5" stroke="#8b5cf6" strokeWidth="2"/>
          <path d="M18 16v-4a4 4 0 014-4h8a4 4 0 014 4v4" stroke="#8b5cf6" strokeWidth="2"/>
          <line x1="4" y1="28" x2="48" y2="28" stroke="#8b5cf6" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/25 to-blue-500/15 border border-violet-500/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {(isCompany ? (app.freelancer?.name ?? "P") : (app.job?.title ?? "E")).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">
              {isCompany ? (app.freelancer?.name ?? "Profissional") : (app.job?.title ?? "Extra")}
            </p>
            <p className="text-xs text-white/70 mt-0.5">
              {app.appliedAt ? format(new Date(app.appliedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : ""}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${info.class}`}>
          {info.icon} {info.label}
        </span>
      </div>

      {(app as any).message && (
        <div className="p-3 rounded-xl bg-white/3 border border-white/6">
          <p className="text-[11px] text-white/75 uppercase tracking-wide font-semibold mb-1.5">Mensagem</p>
          <p className="text-xs leading-relaxed line-clamp-3 text-foreground/80">{(app as any).message}</p>
        </div>
      )}

      {isCompany && app.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-primary text-black hover:bg-primary/90 font-bold border-none rounded-xl h-9 text-xs neon-glow"
            onClick={handleApprove}
            disabled={loading !== null}
          >
            {loading === "approve" ? <Loader2 size={13} className="animate-spin mr-1" /> : <CheckCircle size={13} className="mr-1" />}
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 rounded-xl h-9 text-xs border-none font-bold"
            onClick={handleReject}
            disabled={loading !== null}
          >
            {loading === "reject" ? <Loader2 size={13} className="animate-spin mr-1" /> : <XCircle size={13} className="mr-1" />}
            Recusar
          </Button>
        </div>
      )}
    </motion.div>
  );
}

const TABS = ["Todos", "Pendentes", "Aprovadas", "Recusadas"];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Todos");
  const isCompany = user?.role === "company";

  const statusMap: Record<string, string> = {
    "Pendentes": "pending",
    "Aprovadas": "approved",
    "Recusadas": "rejected",
  };

  const { data: apps = [], isLoading, refetch } = useListApplications({
    status: tab !== "Todos" ? statusMap[tab] : undefined,
  });

  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Candidatura aprovada!");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao aprovar");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success("Candidatura recusada");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao recusar");
    }
  };

  return (
    <div className="page-enter relative pb-20 lg:pb-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-purple-500/5 via-primary/2 to-transparent" />
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* Applications Module Hero Banner */}
      <div className="module-hero module-hero-extras">
        <div className="absolute right-0 top-0 bottom-0 flex items-end gap-3 pr-8 pb-4 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <ClipboardList size={90} style={{ color: "#8b5cf6" }} />
          <FileText size={70} style={{ color: "#3b82f6" }} />
          <CheckCircle size={60} style={{ color: "#8b5cf6" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mod-icon-extras">
              <ClipboardList size={11} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#8b5cf6" }}>
              {isCompany ? "Gestão de Equipe" : "Módulo Candidaturas"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight neon-text-gradient">
            {isCompany ? "Candidaturas Recebidas" : "Minhas Candidaturas"}
          </h1>
          <p className="text-sm text-white/70 mt-0.5">
            <span className="font-bold" style={{ color: "#8b5cf6" }}>{apps.length}</span> candidatura{apps.length !== 1 ? "s" : ""} {isCompany ? "recebida" : "enviada"}{apps.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">

      <div className="flex gap-1 p-1 rounded-xl bg-white/4 border border-white/8 w-fit overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t
                ? "bg-primary text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="glass-card rounded-xl h-24 skeleton" />)}
        </div>
      )}

      {!isLoading && apps.length === 0 && (
        <EmptyState
          icon={<FileText size={28} />}
          title="Nenhuma candidatura encontrada"
          description={isCompany ? "Nenhum profissional se candidatou ainda." : "Você ainda não se candidatou a nenhum extra."}
          actionLabel={!isCompany ? "Buscar Extras" : undefined}
          actionHref="/app/jobs"
        />
      )}

      <div className="space-y-3">
        {apps.map((app, i) => (
          <ApplicationCard
            key={app.id}
            app={app}
            isCompany={isCompany}
            onApprove={handleApprove}
            onReject={handleReject}
            index={i}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
