import React, { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, DollarSign, Users, Briefcase, ChevronLeft,
  Calendar, CheckCircle, XCircle, Loader2, Building2, Zap,
  AlertCircle, Send, CheckCircle2, Timer, Star, Shield, UserCheck
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Job, Application } from "@workspace/api-client-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open:        { label: "Aberta",       color: "text-green-400",  bg: "bg-green-400/10 border-green-400/25",  icon: <Zap size={11} /> },
  in_progress: { label: "Em andamento", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/25", icon: <Timer size={11} /> },
  completed:   { label: "Concluída",    color: "text-secondary",  bg: "bg-secondary/10 border-secondary/25",  icon: <CheckCircle size={11} /> },
  cancelled:   { label: "Cancelada",    color: "text-red-400",    bg: "bg-red-400/10 border-red-400/25",      icon: <XCircle size={11} /> },
};

const APP_STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:          { label: "Candidatura enviada",    color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/25", icon: <Clock size={13} /> },
  approved:         { label: "Candidatura aprovada!",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/25",  icon: <CheckCircle size={13} /> },
  rejected:         { label: "Não selecionado",        color: "text-red-400",    bg: "bg-red-400/10 border-red-400/25",      icon: <XCircle size={13} /> },
  completed:        { label: "Extra concluído",        color: "text-secondary",  bg: "bg-secondary/10 border-secondary/25",  icon: <CheckCircle2 size={13} /> },
  counter_offered:  { label: "Contraproposta enviada", color: "text-primary",    bg: "bg-primary/10 border-primary/25",      icon: <DollarSign size={13} /> },
  counter_accepted: { label: "Contraproposta aceita",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/25",  icon: <CheckCircle size={13} /> },
  counter_rejected: { label: "Contraproposta recusada",color: "text-red-400",    bg: "bg-red-400/10 border-red-400/25",      icon: <XCircle size={13} /> },
  cancelled:        { label: "Cancelada",              color: "text-muted-foreground", bg: "bg-white/5 border-white/10",     icon: <XCircle size={13} /> },
};

function formatDate(dateStr: string) {
  try { return format(parseISO(dateStr), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }); }
  catch { return dateStr; }
}

function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}

// ── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({
  job,
  onClose,
  onSuccess,
}: {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState("");
  const qc = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: job.id, message: message.trim() || null }),
      }),
    onSuccess: () => {
      toast.success("Candidatura enviada com sucesso!");
      qc.invalidateQueries({ queryKey: ["job-my-application", job.id] });
      qc.invalidateQueries({ queryKey: ["job-detail", job.id] });
      onSuccess();
      onClose();
    },
    onError: (e: any) => {
      toast.error(e?.message ?? "Erro ao enviar candidatura");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg glass-card rounded-2xl border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Send size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">Candidatar-se</p>
            <p className="text-xs text-muted-foreground truncate max-w-[260px]">{job.title}</p>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Mensagem para a empresa <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Conte por que você é o candidato ideal para este extra…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none transition-colors"
          />
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
            Uma boa mensagem aumenta suas chances de ser selecionado.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={applyMutation.isPending}
            className="h-11 border-white/15 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
            className="h-11 bg-primary text-black hover:bg-primary/90 neon-glow font-bold"
          >
            {applyMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" /> Enviando…</>
            ) : (
              <><Send size={14} className="mr-2" /> Candidatar-se</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Applicant Card (company view) ────────────────────────────────────────────

function ApplicantCard({ app, onApprove, onReject, isActing }: {
  app: Application;
  onApprove: () => void;
  onReject: () => void;
  isActing: boolean;
}) {
  const freelancer = app.freelancer;
  const appStatus = APP_STATUS_MAP[app.status] ?? APP_STATUS_MAP.pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 border border-white/6"
    >
      <div className="flex items-start gap-3">
        {freelancer?.avatarUrl ? (
          <img
            src={freelancer.avatarUrl}
            alt={freelancer.name}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-black text-black flex-shrink-0">
            {freelancer?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/app/freelancers/${freelancer?.id}`}>
              <span className="text-sm font-bold hover:text-primary transition-colors cursor-pointer">
                {freelancer?.name ?? "Freelancer"}
              </span>
            </Link>
            {freelancer?.isVerified && (
              <CheckCircle size={12} className="text-primary flex-shrink-0" />
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${appStatus.bg} ${appStatus.color}`}>
              {appStatus.icon} {appStatus.label}
            </span>
          </div>
          {freelancer?.categories && freelancer.categories.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{freelancer.categories[0]}</p>
          )}
          {app.message && (
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed bg-white/3 rounded-lg p-2 border border-white/5">
              "{app.message}"
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/60 mt-1.5">
            Candidatou-se {format(parseISO(app.appliedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>

      {app.status === "pending" && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            size="sm"
            onClick={onReject}
            disabled={isActing}
            variant="outline"
            className="h-9 border-red-400/20 text-red-400 hover:bg-red-400/10 hover:border-red-400/30 font-semibold text-xs"
          >
            {isActing ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} className="mr-1" />}
            Recusar
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isActing}
            className="h-9 bg-green-400/15 border border-green-400/25 text-green-400 hover:bg-green-400/25 font-semibold text-xs"
          >
            {isActing ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} className="mr-1" />}
            Aprovar
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const [, params] = useRoute("/app/jobs/:id");
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const jobId = params?.id ? parseInt(params.id) : 0;
  const [showApply, setShowApply] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);

  const { data: job, isLoading: jobLoading } = useQuery<Job>({
    queryKey: ["job-detail", jobId],
    queryFn: () => apiFetch(`/api/jobs/${jobId}`),
    enabled: !!jobId,
  });

  // Freelancer's own application for this job
  const { data: myApplications = [] } = useQuery<Application[]>({
    queryKey: ["job-my-application", jobId],
    queryFn: () => apiFetch(`/api/applications?jobId=${jobId}&freelancerId=${me?.id}`),
    enabled: !!jobId && me?.role === "freelancer",
  });

  // Company: all applications for this job (only if they own it)
  const isOwner = me?.role === "company" && job?.companyId === me?.id;
  const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["job-applications", jobId],
    queryFn: () => apiFetch(`/api/applications?jobId=${jobId}`),
    enabled: !!jobId && isOwner,
  });

  const approveMutation = useMutation({
    mutationFn: (appId: number) =>
      apiFetch(`/api/applications/${appId}/approve`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Candidatura aprovada!");
      qc.invalidateQueries({ queryKey: ["job-applications", jobId] });
      qc.invalidateQueries({ queryKey: ["job-detail", jobId] });
      setActingId(null);
    },
    onError: () => { toast.error("Erro ao aprovar"); setActingId(null); },
  });

  const rejectMutation = useMutation({
    mutationFn: (appId: number) =>
      apiFetch(`/api/applications/${appId}/reject`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Candidatura recusada");
      qc.invalidateQueries({ queryKey: ["job-applications", jobId] });
      setActingId(null);
    },
    onError: () => { toast.error("Erro ao recusar"); setActingId(null); },
  });

  if (jobLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center max-w-sm mx-auto mt-12">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={22} className="text-destructive" />
        </div>
        <p className="font-bold text-foreground mb-1">Extra não encontrado</p>
        <p className="text-sm text-muted-foreground mb-5">Esta vaga não existe ou foi removida.</p>
        <Link href="/app/jobs">
          <Button variant="outline" className="border-white/15">Ver todos os Extras</Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_MAP[job.status] ?? STATUS_MAP.open;
  const myApp = myApplications[0];
  const myAppStatus = myApp ? (APP_STATUS_MAP[myApp.status] ?? APP_STATUS_MAP.pending) : null;
  const canApply = me?.role === "freelancer" && job.status === "open" && !myApp;
  const spotsLeft = Math.max(0, job.workersNeeded - (job.workersApproved ?? 0));

  const hourlyRate = Number(job.hourlyRate ?? 0);
  const totalValue = Number(job.totalValue ?? 0);

  // Duration in hours (approx from startTime/endTime)
  let durationHours: number | null = null;
  try {
    const [sh, sm] = job.startTime.split(":").map(Number);
    const [eh, em] = job.endTime.split(":").map(Number);
    durationHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
  } catch {}

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;

  return (
    <>
      <div className="page-enter pb-24 lg:pb-8">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 bg-[#060809]/90 backdrop-blur-xl border-b border-white/6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ChevronLeft size={16} /> Voltar
          </button>
          <div className="flex-1" />
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${status.bg} ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="px-4 sm:px-6 max-w-3xl mx-auto py-6 space-y-5">

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl border border-white/8 p-5 relative overflow-hidden"
          >
            {/* Subtle category-colored glow */}
            <div className="absolute top-0 right-0 w-48 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 relative">
              {job.companyAvatarUrl ? (
                <img
                  src={job.companyAvatarUrl}
                  alt={job.companyName ?? ""}
                  className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/40 to-primary/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-secondary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-black leading-tight mb-1">{job.title}</h1>
                <Link href={`/app/companies/${job.companyId}`}>
                  <span className="text-sm text-secondary hover:text-secondary/80 transition-colors font-medium cursor-pointer">
                    {job.companyName ?? "Empresa"}
                  </span>
                </Link>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                    {job.category}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key info grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              {
                icon: <DollarSign size={14} className="text-primary" />,
                label: "Remuneração",
                value: `R$ ${hourlyRate.toFixed(2)}/h`,
                sub: durationHours ? `~R$ ${(hourlyRate * durationHours).toFixed(0)} total` : undefined,
                accent: "text-primary",
              },
              {
                icon: <Calendar size={14} className="text-secondary" />,
                label: "Data",
                value: formatDate(job.date).split(",")[0],
                sub: formatDate(job.date).split(",")[1]?.trim(),
                accent: "text-secondary",
              },
              {
                icon: <Clock size={14} className="text-yellow-400" />,
                label: "Horário",
                value: `${formatTime(job.startTime)} – ${formatTime(job.endTime)}`,
                sub: durationHours ? `${durationHours}h de duração` : undefined,
                accent: "text-yellow-400",
              },
              {
                icon: <Users size={14} className="text-cyan-400" />,
                label: "Vagas",
                value: `${job.workersApproved ?? 0} / ${job.workersNeeded}`,
                sub: spotsLeft > 0 ? `${spotsLeft} disponíve${spotsLeft === 1 ? "l" : "is"}` : "Preenchida",
                accent: spotsLeft > 0 ? "text-cyan-400" : "text-red-400",
              },
            ].map((item) => (
              <div key={item.label} className="glass-card rounded-xl p-3.5 border border-white/6 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                </div>
                <p className={`text-sm font-black ${item.accent}`}>{item.value}</p>
                {item.sub && <p className="text-[10px] text-muted-foreground/70">{item.sub}</p>}
              </div>
            ))}
          </motion.div>

          {/* Location */}
          {job.location && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="glass-card rounded-xl p-4 border border-white/6 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                <MapPin size={13} className="text-secondary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Localização</p>
                <p className="text-sm font-semibold mt-0.5">{job.location}</p>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 border border-white/6"
          >
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Briefcase size={14} className="text-primary" /> Descrição do Extra
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </motion.div>

          {/* Freelancer: application status or apply CTA */}
          {me?.role === "freelancer" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
            >
              {myApp && myAppStatus ? (
                <div className={`rounded-2xl p-4 border flex items-center gap-3 ${myAppStatus.bg}`}>
                  <div className={`flex-shrink-0 ${myAppStatus.color}`}>{myAppStatus.icon}</div>
                  <div>
                    <p className={`text-sm font-bold ${myAppStatus.color}`}>{myAppStatus.label}</p>
                    {myApp.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">"{myApp.message}"</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      Enviada em {format(parseISO(myApp.appliedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ) : canApply ? (
                <Button
                  onClick={() => setShowApply(true)}
                  className="w-full h-13 bg-primary text-black hover:bg-primary/90 neon-glow font-black text-sm rounded-xl border-none"
                  style={{ height: 52 }}
                >
                  <Zap size={16} className="mr-2" /> Candidatar-se agora
                </Button>
              ) : job.status !== "open" ? (
                <div className="glass-card rounded-2xl p-4 border border-white/6 text-center">
                  <p className="text-sm text-muted-foreground">Este extra não está mais disponível para candidaturas.</p>
                </div>
              ) : spotsLeft === 0 ? (
                <div className="glass-card rounded-2xl p-4 border border-white/6 text-center">
                  <p className="text-sm text-muted-foreground">Todas as vagas já foram preenchidas.</p>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Company owner: applicant list */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <UserCheck size={14} className="text-primary" /> Candidatos
                  {applications.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      {applications.length}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} className="text-yellow-400" /> {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {approvedCount > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={10} className="text-green-400" /> {approvedCount} aprovado{approvedCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {appsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="glass-card rounded-xl p-4 border border-white/6 h-20 animate-pulse" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 border border-white/6 text-center">
                  <Users size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Ainda não há candidatos para este extra.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pending first */}
                  {[
                    ...applications.filter(a => a.status === "pending"),
                    ...applications.filter(a => a.status !== "pending"),
                  ].map(app => (
                    <ApplicantCard
                      key={app.id}
                      app={app}
                      isActing={actingId === app.id}
                      onApprove={() => {
                        setActingId(app.id);
                        approveMutation.mutate(app.id);
                      }}
                      onReject={() => {
                        setActingId(app.id);
                        rejectMutation.mutate(app.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Company card at the bottom */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <Link href={`/app/companies/${job.companyId}`}>
              <div className="glass-card rounded-2xl p-4 border border-white/6 hover:border-secondary/25 transition-colors cursor-pointer card-hover flex items-center gap-3">
                {job.companyAvatarUrl ? (
                  <img
                    src={job.companyAvatarUrl}
                    alt={job.companyName ?? ""}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/40 to-primary/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-secondary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Empresa</p>
                  <p className="text-sm font-bold truncate">{job.companyName ?? "Empresa"}</p>
                  <p className="text-xs text-secondary">Ver perfil da empresa →</p>
                </div>
                <Shield size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Apply modal */}
      <AnimatePresence>
        {showApply && (
          <ApplyModal
            job={job}
            onClose={() => setShowApply(false)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </>
  );
}
