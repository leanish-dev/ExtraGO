import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListApplications, useApproveApplication, useRejectApplication } from "@workspace/api-client-react";
import type { Application } from "@workspace/api-client-react";
import { CheckCircle, XCircle, Clock, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABELS: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock size={13} /> },
  approved: { label: "Aprovada", class: "bg-primary/20 text-primary border-primary/30", icon: <CheckCircle size={13} /> },
  rejected: { label: "Recusada", class: "bg-destructive/20 text-destructive border-destructive/30", icon: <XCircle size={13} /> },
  withdrawn: { label: "Retirada", class: "bg-white/10 text-muted-foreground border-white/20", icon: <XCircle size={13} /> },
};

function ApplicationCard({ app, isCompany, onApprove, onReject }: {
  app: Application;
  isCompany: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}) {
  const info = STATUS_LABELS[app.status ?? "pending"] ?? STATUS_LABELS.pending;

  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{isCompany ? (app as any).freelancerName ?? "Profissional" : (app as any).jobTitle ?? "Vaga"}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {app.appliedAt ? format(new Date(app.appliedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : ""}
          </p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${info.class}`}>
          {info.icon} {info.label}
        </span>
      </div>

      {(app as any).message && (
        <div className="p-3 rounded-lg bg-white/3 border border-white/8">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Mensagem de apresentação</p>
          <p className="text-sm line-clamp-3">{(app as any).message}</p>
        </div>
      )}

      {isCompany && app.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-primary text-black hover:bg-primary/90 font-semibold"
            onClick={() => onApprove?.(app.id!)}
          >
            <CheckCircle size={14} className="mr-1" /> Aprovar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1"
            onClick={() => onReject?.(app.id!)}
          >
            <XCircle size={14} className="mr-1" /> Recusar
          </Button>
        </div>
      )}
    </div>
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isCompany ? "Candidaturas Recebidas" : "Minhas Candidaturas"}
        </h1>
        <p className="text-muted-foreground mt-1">{apps.length} candidatura{apps.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
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
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-xl h-28 animate-pulse" />)}
        </div>
      )}

      {!isLoading && apps.length === 0 && (
        <div className="text-center py-16">
          <FileText size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">Nenhuma candidatura encontrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            {isCompany ? "Nenhum profissional se candidatou ainda." : "Você ainda não se candidatou a nenhuma vaga."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {apps.map(app => (
          <ApplicationCard
            key={app.id}
            app={app}
            isCompany={isCompany}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
