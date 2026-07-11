import React, { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, DollarSign, Users, Briefcase, ChevronLeft,
  Calendar, CheckCircle, XCircle, Loader2, Building2, Zap,
  AlertCircle, Send, CheckCircle2, Timer, Star, Shield, UserCheck,
  QrCode, KeyRound, LogIn, LogOut, RefreshCw, Play, Square,
  Activity, ChevronDown, ChevronUp, History, Copy, Share2,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Job, Application } from "@workspace/api-client-react";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  open:             { label: "Aberta",               color: "text-green-400",   bg: "bg-green-400/10 border-green-400/25",    icon: <Zap size={11} /> },
  scheduled:        { label: "Agendada",              color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/25",      icon: <Calendar size={11} /> },
  waiting_checkin:  { label: "Aguardando Check-in",  color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/25",  icon: <LogIn size={11} /> },
  checked_in:       { label: "Check-in Realizado",   color: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/25",      icon: <UserCheck size={11} /> },
  in_progress:      { label: "Em andamento",          color: "text-primary",     bg: "bg-primary/10 border-primary/25",        icon: <Activity size={11} /> },
  on_break:         { label: "Em Pausa",              color: "text-orange-400",  bg: "bg-orange-400/10 border-orange-400/25",  icon: <Timer size={11} /> },
  waiting_checkout: { label: "Aguardando Checkout",  color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/25",  icon: <LogOut size={11} /> },
  completed:        { label: "Concluída",             color: "text-secondary",   bg: "bg-secondary/10 border-secondary/25",   icon: <CheckCircle size={11} /> },
  cancelled:        { label: "Cancelada",             color: "text-red-400",     bg: "bg-red-400/10 border-red-400/25",        icon: <XCircle size={11} /> },
  disputed:         { label: "Em Disputa",            color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/25",    icon: <AlertCircle size={11} /> },
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

const EVENT_LABELS: Record<string, string> = {
  created: "Extra criado",
  edited: "Extra editado",
  accepted: "Candidatura aprovada",
  checkin_code_generated: "Códigos de check-in gerados",
  checkin_validated: "Check-in validado",
  started: "Extra iniciado",
  paused: "Extra pausado",
  resumed: "Extra retomado",
  checkout_code_generated: "Códigos de checkout gerados",
  checkout_validated: "Checkout validado",
  finished: "Extra finalizado",
  cancelled: "Extra cancelado",
  disputed: "Disputa aberta",
  payment_released: "Pagamento liberado",
  wallet_reserved: "Reserva de saldo realizada",
  wallet_released: "Reserva de saldo liberada",
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

// ── Code Validation Panel ── OTP-style, with high visual prominence ──────────

function CodeValidationPanel({
  jobId,
  mode,
  onSuccess,
}: {
  jobId: number;
  mode: "checkin" | "checkout";
  onSuccess: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const qc = useQueryClient();
  const code = digits.join("");
  const isCheckin = mode === "checkin";

  const handleDigit = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      } else {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleValidate = async () => {
    if (code.length !== 6) { toast.error("Insira o código de 6 dígitos"); return; }
    setLoading(true);
    try {
      const endpoint = mode === "checkin" ? "validate-checkin" : "validate-checkout";
      const result = await apiFetch(`/api/jobs/${jobId}/${endpoint}`, {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      toast.success(result.message ?? (isCheckin ? "Check-in realizado!" : "Checkout realizado!"));
      qc.invalidateQueries({ queryKey: ["job-detail", jobId] });
      qc.invalidateQueries({ queryKey: ["job-events", jobId] });
      onSuccess();
    } catch (e: any) {
      toast.error(e?.data?.error ?? e?.message ?? "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const borderColor = isCheckin ? "rgba(250,204,21,0.25)" : "rgba(139,92,246,0.25)";
  const bgColor = isCheckin ? "rgba(250,204,21,0.05)" : "rgba(139,92,246,0.05)";
  const accentClass = isCheckin ? "text-yellow-400" : "text-primary";
  const filledClass = isCheckin ? "bg-yellow-400/12 border-yellow-400/50 text-yellow-300" : "bg-primary/12 border-primary/50 text-primary";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCheckin ? "bg-yellow-400/15" : "bg-primary/15"}`}>
          <KeyRound size={18} className={accentClass} />
        </div>
        <div>
          <p className="font-bold">{isCheckin ? "Validar Check-in" : "Validar Checkout"}</p>
          <p className="text-xs text-white/55 mt-0.5">
            {isCheckin ? "Digite o código de 6 dígitos da empresa" : "Digite o código de 6 dígitos da empresa"}
          </p>
        </div>
      </div>

      {/* OTP digit boxes */}
      <div className="px-5 pb-4" onPaste={handlePaste}>
        <div className="flex gap-2 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={2}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black rounded-xl border-2 transition-all outline-none select-none
                ${d ? filledClass : "bg-white/5 border-white/10 text-foreground focus:border-white/35"}`}
            />
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-5">
        <Button
          onClick={handleValidate}
          disabled={loading || code.length !== 6}
          className={`w-full h-12 rounded-xl font-bold text-sm disabled:opacity-40 ${
            isCheckin ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-primary text-black hover:bg-primary/90 neon-glow"
          }`}
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin mr-2" />Validando...</>
            : <><CheckCircle2 size={15} className="mr-2" />{isCheckin ? "Confirmar Check-in" : "Confirmar Checkout"}</>}
        </Button>
      </div>
    </div>
  );
}

// ── Generate Codes Panel ── Large code display, countdown, copy, share ────────

function GenerateCodesPanel({
  jobId,
  mode,
  onSuccess,
}: {
  jobId: number;
  mode: "checkin" | "checkout";
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<{ companyCode: string; freelancerCode: string; expiresAt: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const qc = useQueryClient();
  const isCheckin = mode === "checkin";

  useEffect(() => {
    if (!codes?.expiresAt) return;
    const tick = () => {
      const diff = new Date(codes.expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [codes?.expiresAt]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const endpoint = mode === "checkin" ? "generate-checkin-codes" : "generate-checkout-codes";
      const result = await apiFetch(`/api/jobs/${jobId}/${endpoint}`, { method: "POST" });
      setCodes(result);
      qc.invalidateQueries({ queryKey: ["job-detail", jobId] });
      qc.invalidateQueries({ queryKey: ["job-events", jobId] });
      onSuccess();
      toast.success("Códigos gerados!");
    } catch (e: any) {
      toast.error(e?.data?.error ?? e?.message ?? "Erro ao gerar códigos");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (c: string) => { navigator.clipboard.writeText(c); toast.success("Código copiado!"); };

  const shareCode = async (c: string) => {
    const text = `Seu código de ${isCheckin ? "check-in" : "checkout"} extraGO: ${c}`;
    if (navigator.share) {
      try { await navigator.share({ text, title: "Código extraGO" }); } catch {}
    } else {
      copyCode(c);
    }
  };

  const borderColor = isCheckin ? "rgba(250,204,21,0.22)" : "rgba(139,92,246,0.22)";
  const bgColor = isCheckin ? "rgba(250,204,21,0.04)" : "rgba(139,92,246,0.04)";
  const accentClass = isCheckin ? "text-yellow-400" : "text-primary";
  const btnBorderClass = isCheckin ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/25 hover:bg-yellow-400/20" : "bg-primary/10 text-primary border-primary/25 hover:bg-primary/20";
  const shareBtnClass = isCheckin ? "bg-yellow-400/12 text-yellow-400 border-yellow-400/25 hover:bg-yellow-400/22" : "bg-primary/12 text-primary border-primary/25 hover:bg-primary/22";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCheckin ? "bg-yellow-400/15" : "bg-primary/15"}`}>
          <QrCode size={18} className={accentClass} />
        </div>
        <div>
          <p className="font-bold">{isCheckin ? "Iniciar Check-in" : "Iniciar Checkout"}</p>
          <p className="text-xs text-white/55 mt-0.5">Gere e compartilhe os códigos de validação</p>
        </div>
      </div>

      {!codes ? (
        <div className="px-5 pb-5 space-y-3">
          <p className="text-xs text-white/60 leading-relaxed">
            {isCheckin
              ? "Gere os códigos de check-in. Envie o código do profissional via WhatsApp, SMS ou chat."
              : "Gere os códigos de checkout para encerrar o Extra. Envie o código do profissional."}
          </p>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full h-12 rounded-xl font-bold text-sm border ${btnBorderClass}`}
          >
            {loading ? <><Loader2 size={14} className="animate-spin mr-2" />Gerando...</> : <><QrCode size={14} className="mr-2" />Gerar Códigos</>}
          </Button>
        </div>
      ) : (
        <div className="px-5 pb-5 space-y-4">
          {/* Countdown */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-white/45">
              <Timer size={12} /> Validade dos códigos
            </div>
            <span className={`font-bold tabular-nums ${timeLeft === "Expirado" ? "text-red-400" : accentClass}`}>
              {timeLeft}
            </span>
          </div>

          {/* Freelancer code — HERO display */}
          <div className="rounded-2xl p-5 bg-white/5 border border-white/10 space-y-3">
            <p className="text-[10px] font-bold text-white/45 uppercase tracking-widest">
              Código do Profissional — Compartilhe este
            </p>
            <p className={`text-6xl font-black tracking-[0.28em] tabular-nums leading-none ${accentClass}`}>
              {codes.freelancerCode}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => copyCode(codes.freelancerCode)}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold bg-white/6 border border-white/12 hover:bg-white/12 text-white/70 hover:text-foreground transition-all"
              >
                <Copy size={13} /> Copiar
              </button>
              <button
                onClick={() => shareCode(codes.freelancerCode)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold border transition-all ${shareBtnClass}`}
              >
                <Share2 size={13} /> Compartilhar
              </button>
            </div>
            <p className="text-[10px] text-white/35 leading-relaxed">
              O profissional deve inserir este código no dispositivo dele.
            </p>
          </div>

          {/* Company's own code */}
          <div className="rounded-xl p-4 bg-white/3 border border-white/8">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
              Seu Código — O profissional digitará este no sistema
            </p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-black tracking-[0.28em] tabular-nums text-white/65">
                {codes.companyCode}
              </p>
              <button
                onClick={() => copyCode(codes.companyCode)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/45 hover:text-white/70 transition-all"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({ job, onClose, onSuccess }: { job: Job; onClose: () => void; onSuccess: () => void }) {
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
        className="w-full max-w-lg rounded-2xl p-6 shadow-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.07) 0%, rgba(8,17,26,0.95) 65%)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Send size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">Candidatar-se</p>
            <p className="text-xs text-white/70 truncate max-w-[260px]">{job.title}</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-white/75 uppercase tracking-wider mb-2 block">
            Mensagem para a empresa <span className="text-white/55 normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Conte por que você é o candidato ideal para este extra…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 resize-none transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onClose} disabled={applyMutation.isPending} className="h-11 border-white/15 font-semibold">
            Cancelar
          </Button>
          <Button
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
            className="h-11 bg-primary text-black hover:bg-primary/90 neon-glow font-bold"
          >
            {applyMutation.isPending ? <><Loader2 size={14} className="animate-spin mr-2" />Enviando…</> : <><Send size={14} className="mr-2" />Candidatar-se</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Applicant Card ────────────────────────────────────────────────────────────

function ApplicantCard({ app, onApprove, onReject, isActing }: {
  app: Application; onApprove: () => void; onReject: () => void; isActing: boolean;
}) {
  const freelancer = app.freelancer;
  const appStatus = APP_STATUS_MAP[app.status] ?? APP_STATUS_MAP.pending;
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(8,17,26,0.90) 65%)",
        border: `1px solid ${app.status === "approved" ? "rgba(124,252,0,0.18)" : app.status === "rejected" ? "rgba(239,68,68,0.14)" : "rgba(139,92,246,0.13)"}`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: app.status === "approved" ? "linear-gradient(90deg,transparent,rgba(124,252,0,0.4),transparent)" : "linear-gradient(90deg,transparent,rgba(139,92,246,0.35),transparent)" }} />
      <div className="flex items-start gap-3 relative">
        {freelancer?.avatarUrl ? (
          <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-black text-black flex-shrink-0">
            {freelancer?.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/app/freelancers/${freelancer?.id}`}>
              <span className="text-sm font-bold hover:text-primary transition-colors cursor-pointer">{freelancer?.name ?? "Freelancer"}</span>
            </Link>
            {freelancer?.isVerified && <CheckCircle size={12} className="text-primary flex-shrink-0" />}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${appStatus.bg} ${appStatus.color}`}>
              {appStatus.icon} {appStatus.label}
            </span>
          </div>
          {app.message && (
            <p className="text-xs text-foreground/70 mt-2 leading-relaxed bg-white/3 rounded-lg p-2 border border-white/5">
              "{app.message}"
            </p>
          )}
          <p className="text-[10px] text-white/60 mt-1.5">
            Candidatou-se {format(parseISO(app.appliedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>
      {app.status === "pending" && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button size="sm" onClick={onReject} disabled={isActing} variant="outline"
            className="h-9 border-red-400/20 text-red-400 hover:bg-red-400/10 hover:border-red-400/30 font-semibold text-xs">
            {isActing ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} className="mr-1" />} Recusar
          </Button>
          <Button size="sm" onClick={onApprove} disabled={isActing}
            className="h-9 bg-green-400/15 border border-green-400/25 text-green-400 hover:bg-green-400/25 font-semibold text-xs">
            {isActing ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} className="mr-1" />} Aprovar
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

function AuditLogPanel({ jobId }: { jobId: number }) {
  const [open, setOpen] = useState(false);
  const { data: events = [], isLoading } = useQuery<any[]>({
    queryKey: ["job-events", jobId],
    queryFn: () => apiFetch(`/api/jobs/${jobId}/events`),
    enabled: open,
  });

  return (
    <div className="rounded-xl overflow-hidden border border-white/8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-2">
          <History size={13} className="text-white/60" />
          <span className="text-xs font-semibold text-white/80">Log de Auditoria</span>
          {events.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/60">{events.length}</span>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2 max-h-72 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 py-2"><Loader2 size={13} className="animate-spin text-white/40" /><span className="text-xs text-white/50">Carregando...</span></div>
              ) : events.length === 0 ? (
                <p className="text-xs text-white/50 py-2">Nenhum evento registrado ainda.</p>
              ) : (
                events.map((ev: any) => (
                  <div key={ev.id} className="flex items-start gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{EVENT_LABELS[ev.eventType] ?? ev.eventType}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {ev.actorRole && <span className="mr-1 capitalize">{ev.actorRole}</span>}
                        {ev.createdAt && format(new Date(ev.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        {ev.ipAddress && <span className="ml-1 text-white/35">· {ev.ipAddress}</span>}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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

  const { data: job, isLoading: jobLoading, refetch: refetchJob } = useQuery<Job>({
    queryKey: ["job-detail", jobId],
    queryFn: () => apiFetch(`/api/jobs/${jobId}`),
    enabled: !!jobId,
    refetchInterval: 10000, // Poll every 10s for status updates
  });

  const { data: myApplications = [] } = useQuery<Application[]>({
    queryKey: ["job-my-application", jobId],
    queryFn: () => apiFetch(`/api/applications?jobId=${jobId}&freelancerId=${me?.id}`),
    enabled: !!jobId && me?.role === "freelancer",
  });

  const isOwner = me?.role === "company" && job?.companyId === me?.id;
  const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ["job-applications", jobId],
    queryFn: () => apiFetch(`/api/applications?jobId=${jobId}`),
    enabled: !!jobId && isOwner,
  });

  const approveMutation = useMutation({
    mutationFn: (appId: number) => apiFetch(`/api/applications/${appId}/approve`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Candidatura aprovada!");
      qc.invalidateQueries({ queryKey: ["job-applications", jobId] });
      qc.invalidateQueries({ queryKey: ["job-detail", jobId] });
      setActingId(null);
    },
    onError: () => { toast.error("Erro ao aprovar"); setActingId(null); },
  });

  const rejectMutation = useMutation({
    mutationFn: (appId: number) => apiFetch(`/api/applications/${appId}/reject`, { method: "POST" }),
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
        <p className="text-sm text-white/70 mb-5">Este Extra não existe ou foi removido.</p>
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
  const shiftType = (job as any).shiftType ?? "hourly";
  const dailyRate = (job as any).dailyRate ?? null;

  let durationLabel = "";
  try {
    if (shiftType === "daily") {
      durationLabel = "7h 20min";
    } else {
      const [sh, sm] = job.startTime.split(":").map(Number);
      const [eh, em] = job.endTime.split(":").map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm);
      const h = Math.floor(Math.abs(mins) / 60);
      const m = Math.abs(mins) % 60;
      durationLabel = `${h}h${m > 0 ? ` ${m}min` : ""}`;
    }
  } catch {}

  const pendingCount = applications.filter(a => a.status === "pending").length;
  const approvedCount = applications.filter(a => a.status === "approved").length;

  // Execution flow states
  const showGenerateCheckin = isOwner && ["open", "scheduled"].includes(job.status);
  const showValidateCheckin = ["waiting_checkin"].includes(job.status);
  const showGenerateCheckout = isOwner && ["in_progress", "on_break"].includes(job.status);
  const showValidateCheckout = ["waiting_checkout", "in_progress"].includes(job.status) && !isOwner;
  const showFreelancerValidateCheckin = me?.role === "freelancer" && myApp?.status === "approved" && ["waiting_checkin", "open"].includes(job.status);

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
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(8,17,26,0.92) 60%, rgba(0,229,255,0.025) 100%)",
              border: "1px solid rgba(139,92,246,0.16)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.45), rgba(0,229,255,0.2), transparent)" }} />
            <div className="absolute top-0 right-0 w-48 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start gap-4 relative">
              {(job as any).companyAvatarUrl ? (
                <img src={(job as any).companyAvatarUrl} alt={(job as any).companyName ?? ""} className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/40 to-primary/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-secondary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-black leading-tight mb-1">{job.title}</h1>
                <Link href={`/app/companies/${job.companyId}`}>
                  <span className="text-sm text-secondary hover:text-secondary/80 transition-colors font-medium cursor-pointer">
                    {(job as any).companyName ?? "Empresa"}
                  </span>
                </Link>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                    {job.category}
                  </span>
                  {shiftType === "daily" && (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-secondary/8 border border-secondary/20 text-secondary">
                      Diária
                    </span>
                  )}
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
                value: shiftType === "daily" && dailyRate
                  ? `R$ ${Number(dailyRate).toFixed(2)}/dia`
                  : `R$ ${hourlyRate.toFixed(2)}/h`,
                sub: shiftType === "daily" ? "Diária 7h20" : (durationLabel ? `~R$ ${(hourlyRate * (Number(durationLabel.replace("h", ".")) || 8)).toFixed(0)} total` : undefined),
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
                sub: durationLabel || undefined,
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
              <div key={item.label} className="rounded-xl p-3.5 flex flex-col gap-1 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(8,17,26,0.90) 70%)", border: "1px solid rgba(139,92,246,0.12)" }}
              >
                <div className="flex items-center gap-1.5">
                  {item.icon}
                  <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider">{item.label}</span>
                </div>
                <p className={`text-sm font-black ${item.accent}`}>{item.value}</p>
                {item.sub && <p className="text-[10px] text-white/65">{item.sub}</p>}
              </div>
            ))}
          </motion.div>

          {/* Location */}
          {job.location && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-xl p-4 flex items-center gap-3 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(8,17,26,0.90) 70%)", border: "1px solid rgba(0,229,255,0.12)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)" }} />
              <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0 relative">
                <MapPin size={13} className="text-secondary" />
              </div>
              <div className="relative">
                <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Localização</p>
                <p className="text-sm font-semibold mt-0.5">{job.location}</p>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(139,92,246,0.12)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.35), rgba(0,229,255,0.15), transparent)" }} />
            <h2 className="font-bold text-sm mb-3 flex items-center gap-2 relative">
              <Briefcase size={14} className="text-primary" /> Descrição do Extra
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </motion.div>

          {/* ── EXECUTION FLOW (company) ── */}
          {(showGenerateCheckin || showGenerateCheckout) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl p-5 space-y-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(250,204,21,0.04) 0%, rgba(8,17,26,0.92) 70%)",
                border: "1px solid rgba(250,204,21,0.12)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
                  <Activity size={13} />
                </div>
                <h2 className="font-bold text-sm">Gerenciamento do Extra</h2>
              </div>
              {showGenerateCheckin && (
                <GenerateCodesPanel jobId={jobId} mode="checkin" onSuccess={() => refetchJob()} />
              )}
              {showGenerateCheckout && (
                <GenerateCodesPanel jobId={jobId} mode="checkout" onSuccess={() => refetchJob()} />
              )}
            </motion.div>
          )}

          {/* ── EXECUTION FLOW (validation — both sides) ── */}
          {(showValidateCheckin || showValidateCheckout || showFreelancerValidateCheckin) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl p-5 space-y-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(124,252,0,0.04) 0%, rgba(8,17,26,0.92) 70%)",
                border: "1px solid rgba(124,252,0,0.12)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <KeyRound size={13} />
                </div>
                <h2 className="font-bold text-sm">Validação de Presença</h2>
              </div>
              {(showValidateCheckin || showFreelancerValidateCheckin) && (
                <CodeValidationPanel jobId={jobId} mode="checkin" onSuccess={() => refetchJob()} />
              )}
              {showValidateCheckout && (
                <CodeValidationPanel jobId={jobId} mode="checkout" onSuccess={() => refetchJob()} />
              )}
            </motion.div>
          )}

          {/* Freelancer: application status or apply CTA */}
          {me?.role === "freelancer" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
              {myApp && myAppStatus ? (
                <div className={`rounded-2xl p-4 border flex items-center gap-3 ${myAppStatus.bg}`}>
                  <div className={`flex-shrink-0 ${myAppStatus.color}`}>{myAppStatus.icon}</div>
                  <div>
                    <p className={`text-sm font-bold ${myAppStatus.color}`}>{myAppStatus.label}</p>
                    {myApp.message && (
                      <p className="text-xs text-white/70 mt-0.5 line-clamp-1">"{myApp.message}"</p>
                    )}
                    <p className="text-[10px] text-white/60 mt-0.5">
                      Enviada em {format(parseISO(myApp.appliedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ) : canApply ? (
                <Button
                  onClick={() => setShowApply(true)}
                  className="w-full bg-primary text-black hover:bg-primary/90 neon-glow font-black text-sm rounded-xl border-none"
                  style={{ height: 52 }}
                >
                  <Zap size={16} className="mr-2" /> Candidatar-se agora
                </Button>
              ) : job.status !== "open" ? (
                <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(8,17,26,0.92)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-sm text-white/70">Este extra não está mais disponível para candidaturas.</p>
                </div>
              ) : spotsLeft === 0 ? (
                <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(8,17,26,0.92)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-sm text-white/70">Todas as posições já foram preenchidas.</p>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Company owner: applicant list */}
          {isOwner && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <UserCheck size={14} className="text-primary" /> Candidatos
                  {applications.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      {applications.length}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3 text-xs text-white/70">
                  {pendingCount > 0 && <span className="flex items-center gap-1"><Clock size={10} className="text-yellow-400" /> {pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>}
                  {approvedCount > 0 && <span className="flex items-center gap-1"><CheckCircle size={10} className="text-green-400" /> {approvedCount} aprovado{approvedCount > 1 ? "s" : ""}</span>}
                </div>
              </div>

              {appsLoading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="glass-card rounded-xl p-4 border border-white/6 h-20 animate-pulse" />)}</div>
              ) : applications.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(8,17,26,0.92)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Users size={28} className="text-white/60 mx-auto mb-2" />
                  <p className="text-sm text-white/70">Ainda não há candidatos para este extra.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    ...applications.filter(a => a.status === "pending"),
                    ...applications.filter(a => a.status !== "pending"),
                  ].map(app => (
                    <ApplicantCard
                      key={app.id}
                      app={app}
                      isActing={actingId === app.id}
                      onApprove={() => { setActingId(app.id); approveMutation.mutate(app.id); }}
                      onReject={() => { setActingId(app.id); rejectMutation.mutate(app.id); }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Audit log (company + admin) */}
          {(isOwner || me?.role === "admin") && (
            <AuditLogPanel jobId={jobId} />
          )}

          {/* Company card at the bottom */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Link href={`/app/companies/${job.companyId}`}>
              <div className="rounded-2xl p-4 hover:border-secondary/30 transition-colors cursor-pointer flex items-center gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.045) 0%, rgba(8,17,26,0.90) 65%)", border: "1px solid rgba(0,229,255,0.12)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)" }} />
                {(job as any).companyAvatarUrl ? (
                  <img src={(job as any).companyAvatarUrl} alt={(job as any).companyName ?? ""} className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/30 to-primary/15 border border-white/8 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-secondary" />
                  </div>
                )}
                <div className="relative flex-1 min-w-0">
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Empresa</p>
                  <p className="text-sm font-bold truncate">{(job as any).companyName ?? "Empresa"}</p>
                </div>
                <ChevronLeft size={14} className="text-secondary/60 rotate-180 flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Apply modal */}
      <AnimatePresence>
        {showApply && (
          <ApplyModal job={job} onClose={() => setShowApply(false)} onSuccess={() => {}} />
        )}
      </AnimatePresence>
    </>
  );
}
