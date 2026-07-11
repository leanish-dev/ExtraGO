import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Shield, CheckCircle2, XCircle, AlertCircle, Clock, Search,
  ChevronRight, User, FileText, History, MessageSquare, Loader2,
  Eye, EyeOff, RefreshCw, Camera, Ban, Play, FileCheck2,
  ArrowLeft, X, ZoomIn, ZoomOut, RotateCw, Columns2, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────

type QueueStatus = "pending_review" | "verified" | "rejected" | "correction_requested" | "blocked";

interface QueueUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  cpf: string | null;
  cnpj: string | null;
  pixKey: string | null;
  accountStatus: QueueStatus;
  createdAt: string | null;
  documents: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    correctionRequested: number;
  };
}

interface KycDocument {
  id: number;
  documentType: string;
  fileUrl: string;
  captureMetadata?: string | null;
  version: number;
  status: "pending" | "approved" | "rejected" | "correction_requested";
  reviewNotes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewHistory: { id: number; action: string; notes: string | null; createdAt: string | null }[];
}

interface AuditLog {
  id: number;
  action: string;
  details: any;
  ipAddress: string | null;
  createdAt: string | null;
}

interface LegalAcceptance {
  id: number;
  documentType: string;
  version: string;
  signatureHash: string | null;
  acceptedAt: string | null;
  documentTitle: string | null;
}

interface FullProfile {
  profile: QueueUser;
  documents: KycDocument[];
  auditLogs: AuditLog[];
  legalAcceptances: LegalAcceptance[];
}

interface KycStats {
  pending_review: number;
  verified: number;
  rejected: number;
  correction_requested: number;
  blocked: number;
}

// ─── Constants ────────────────────────────────────────────────

const TABS: { key: QueueStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "pending_review", label: "Pendentes", icon: <Clock size={14} />, color: "text-yellow-400" },
  { key: "verified", label: "Aprovados", icon: <CheckCircle2 size={14} />, color: "text-primary" },
  { key: "rejected", label: "Rejeitados", icon: <XCircle size={14} />, color: "text-red-400" },
  { key: "correction_requested", label: "Correção", icon: <AlertCircle size={14} />, color: "text-orange-400" },
  { key: "blocked", label: "Suspensos", icon: <Ban size={14} />, color: "text-muted-foreground" },
];

const DOC_TYPE_LABELS: Record<string, string> = {
  rg: "RG — Identidade",
  cnh: "CNH",
  cpf_card: "CPF (cartão)",
  cnpj_card: "CNPJ (cartão)",
  proof_of_address: "Comprovante de Residência",
  selfie: "Selfie com Documento",
  company_contract: "Contrato Social",
  other: "Outro",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-red-500/15 text-red-400",
  correction_requested: "bg-orange-500/15 text-orange-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  correction_requested: "Correção solicitada",
};

const AUDIT_ACTION_LABEL: Record<string, string> = {
  account_approved: "✅ Conta aprovada",
  account_rejected: "❌ Conta rejeitada",
  documents_requested: "📋 Documentos solicitados",
  selfie_requested: "📸 Selfie solicitada",
  public_note_added: "💬 Nota pública adicionada",
  internal_note_added: "🔒 Nota interna adicionada",
  verification_suspended: "🚫 Verificação suspensa",
  verification_resumed: "▶️ Verificação retomada",
  email_verified: "✉️ E-mail verificado",
  phone_verified: "📱 Telefone verificado",
  kyc_document_submitted: "📄 Documento enviado",
  kyc_document_reviewed: "🔍 Documento revisado",
};

// ─── API helpers ──────────────────────────────────────────────

const kycApi = {
  stats: (): Promise<KycStats> => apiFetch("/api/admin/kyc/stats"),
  queue: (status: QueueStatus): Promise<QueueUser[]> => apiFetch(`/api/admin/kyc/queue?status=${status}`),
  user: (id: number): Promise<FullProfile> => apiFetch(`/api/admin/kyc/users/${id}`),
  approve: (id: number, notes?: string) => apiFetch(`/api/admin/kyc/users/${id}/approve`, { method: "POST", body: JSON.stringify({ notes }) }),
  reject: (id: number, reason: string, notes?: string, publicMessage?: string) => apiFetch(`/api/admin/kyc/users/${id}/reject`, { method: "POST", body: JSON.stringify({ reason, notes, publicMessage }) }),
  requestDocuments: (id: number, documentTypes: string[], message?: string) => apiFetch(`/api/admin/kyc/users/${id}/request-documents`, { method: "POST", body: JSON.stringify({ documentTypes, message }) }),
  requestSelfie: (id: number, message?: string) => apiFetch(`/api/admin/kyc/users/${id}/request-selfie`, { method: "POST", body: JSON.stringify({ message }) }),
  addNote: (id: number, content: string, isPublic: boolean) => apiFetch(`/api/admin/kyc/users/${id}/note`, { method: "POST", body: JSON.stringify({ content, isPublic }) }),
  suspend: (id: number, reason?: string) => apiFetch(`/api/admin/kyc/users/${id}/suspend`, { method: "POST", body: JSON.stringify({ reason }) }),
  resume: (id: number) => apiFetch(`/api/admin/kyc/users/${id}/resume`, { method: "POST" }),
};

// ─── Document Viewer (image / PDF / HEIC, with zoom + rotate) ──

function isPdfUrl(url: string) {
  return /\.pdf($|\?)/i.test(url) || url.startsWith("data:application/pdf");
}
function isHeicUrl(url: string) {
  return /\.hei[cf]($|\?)/i.test(url) || url.startsWith("data:image/heic") || url.startsWith("data:image/heif");
}

function DocumentSurface({ url, zoom, rotation }: { url: string; zoom: number; rotation: number }) {
  if (isPdfUrl(url)) {
    return (
      <iframe
        src={url}
        title="Documento PDF"
        className="w-full h-full rounded-xl border border-white/10 bg-white"
        style={{ minHeight: 480 }}
      />
    );
  }
  if (isHeicUrl(url)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-8">
        <FileText size={32} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Este arquivo está em formato HEIC/HEIF, que não é suportado para pré-visualização direta no navegador.
        </p>
        <a href={url} download className="text-xs font-semibold text-primary hover:underline">Baixar arquivo original</a>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Documento"
      className="max-h-full max-w-full object-contain transition-transform"
      style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
    />
  );
}

function ZoomRotateControls({ zoom, setZoom, rotation, setRotation }: {
  zoom: number; setZoom: (v: number) => void; rotation: number; setRotation: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-black/60 rounded-xl border border-white/10 px-1.5 py-1" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"><ZoomOut size={15} /></button>
      <span className="text-xs text-white/60 w-10 text-center">{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"><ZoomIn size={15} /></button>
      <div className="w-px h-4 bg-white/15 mx-0.5" />
      <button onClick={() => setRotation((rotation + 90) % 360)} className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"><RotateCw size={15} /></button>
    </div>
  );
}

function ImageViewer({ url, onClose, compareUrl, compareLabel, captureMetadata }: {
  url: string; onClose: () => void; compareUrl?: string | null; compareLabel?: string; captureMetadata?: string | null;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [compareZoom, setCompareZoom] = useState(1);
  const [compareRotation, setCompareRotation] = useState(0);
  const [showCompare, setShowCompare] = useState(!!compareUrl);
  const [showMeta, setShowMeta] = useState(false);

  let parsedMeta: Record<string, any> | null = null;
  if (captureMetadata) {
    try { parsedMeta = JSON.parse(captureMetadata); } catch { parsedMeta = null; }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {compareUrl && (
            <button
              onClick={() => setShowCompare(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${showCompare ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-white/60 border-white/10"}`}
            >
              <Columns2 size={13} /> Comparar com {compareLabel ?? "documento"}
            </button>
          )}
          {parsedMeta && (
            <button
              onClick={() => setShowMeta(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${showMeta ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-white/60 border-white/10"}`}
            >
              <Info size={13} /> Metadados da captura
            </button>
          )}
        </div>
        <button className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10" onClick={onClose}><X size={22} /></button>
      </div>

      {showMeta && parsedMeta && (
        <div className="mx-4 mb-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70 grid grid-cols-2 gap-x-6 gap-y-1" onClick={(e) => e.stopPropagation()}>
          <span><strong className="text-white/90">Capturado em:</strong> {parsedMeta.capturedAt ? new Date(parsedMeta.capturedAt).toLocaleString("pt-BR") : "—"}</span>
          <span><strong className="text-white/90">Origem:</strong> {parsedMeta.source === "camera" ? "Câmera em tempo real" : "Upload de arquivo"}</span>
          <span><strong className="text-white/90">Dispositivo:</strong> {parsedMeta.platform ?? "—"}</span>
          <span><strong className="text-white/90">Câmera:</strong> {parsedMeta.cameraLabel ?? "—"}</span>
          <span><strong className="text-white/90">Resolução da tela:</strong> {parsedMeta.screen ? `${parsedMeta.screen.width}×${parsedMeta.screen.height}` : "—"}</span>
          <span><strong className="text-white/90">Navegador:</strong> {parsedMeta.userAgent ?? "—"}</span>
        </div>
      )}

      <div className={`flex-1 flex ${showCompare && compareUrl ? "flex-row gap-3 px-4" : "items-center justify-center"} overflow-hidden`} onClick={showCompare && compareUrl ? undefined : onClose}>
        {showCompare && compareUrl ? (
          <>
            <div className="flex-1 flex flex-col gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">Selfie / FaceScan</span>
                <ZoomRotateControls zoom={zoom} setZoom={setZoom} rotation={rotation} setRotation={setRotation} />
              </div>
              <div className="flex-1 rounded-xl border border-white/10 bg-white/3 flex items-center justify-center overflow-hidden">
                <DocumentSurface url={url} zoom={zoom} rotation={rotation} />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/70">{compareLabel ?? "Documento de identidade"}</span>
                <ZoomRotateControls zoom={compareZoom} setZoom={setCompareZoom} rotation={compareRotation} setRotation={setCompareRotation} />
              </div>
              <div className="flex-1 rounded-xl border border-white/10 bg-white/3 flex items-center justify-center overflow-hidden">
                <DocumentSurface url={compareUrl} zoom={compareZoom} rotation={compareRotation} />
              </div>
            </div>
          </>
        ) : (
          <div className="relative max-h-[85vh] max-w-[90vw] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <DocumentSurface url={url} zoom={zoom} rotation={rotation} />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <ZoomRotateControls zoom={zoom} setZoom={setZoom} rotation={rotation} setRotation={setRotation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action Dialog ─────────────────────────────────────────────

type ActionType = "approve" | "reject" | "request-documents" | "request-selfie" | "note" | "suspend" | "resume";

function ActionDialog({
  userId,
  action,
  onClose,
  onSuccess,
}: {
  userId: number;
  action: ActionType;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const DOC_OPTIONS = ["rg", "cnh", "cpf_card", "cnpj_card", "proof_of_address", "selfie", "company_contract"];

  const toggleDoc = (t: string) =>
    setDocTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      switch (action) {
        case "approve":
          await kycApi.approve(userId, notes || undefined);
          toast.success("Conta aprovada com sucesso!");
          break;
        case "reject":
          if (!reason.trim()) { toast.error("Informe o motivo da rejeição."); setLoading(false); return; }
          await kycApi.reject(userId, reason, notes || undefined, publicMessage || undefined);
          toast.success("Conta rejeitada.");
          break;
        case "request-documents":
          if (docTypes.length === 0) { toast.error("Selecione ao menos um documento."); setLoading(false); return; }
          await kycApi.requestDocuments(userId, docTypes, message || undefined);
          toast.success("Solicitação de documentos enviada.");
          break;
        case "request-selfie":
          await kycApi.requestSelfie(userId, message || undefined);
          toast.success("Solicitação de selfie enviada.");
          break;
        case "note":
          if (!content.trim()) { toast.error("Escreva a nota."); setLoading(false); return; }
          await kycApi.addNote(userId, content, isPublic);
          toast.success("Nota salva.");
          break;
        case "suspend":
          await kycApi.suspend(userId, reason || undefined);
          toast.success("Verificação suspensa.");
          break;
        case "resume":
          await kycApi.resume(userId);
          toast.success("Verificação retomada.");
          break;
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error("Erro ao executar ação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<ActionType, string> = {
    approve: "✅ Aprovar Conta",
    reject: "❌ Rejeitar Conta",
    "request-documents": "📋 Solicitar Documentos",
    "request-selfie": "📸 Solicitar Nova Selfie",
    note: "💬 Adicionar Nota",
    suspend: "🚫 Suspender Verificação",
    resume: "▶️ Retomar Verificação",
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0a0f1c] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">{titles[action]}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          {action === "approve" && (
            <>
              <p className="text-sm text-muted-foreground">Confirma a aprovação? O usuário será notificado e terá acesso completo à plataforma.</p>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Notas internas (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observações internas sobre a aprovação..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
            </>
          )}

          {action === "reject" && (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Motivo (interno) *</label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo técnico da rejeição..." className="mt-1 bg-white/5 border-white/10 rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mensagem pública ao usuário</label>
                <textarea value={publicMessage} onChange={(e) => setPublicMessage(e.target.value)} rows={2} placeholder="O que o usuário verá (se vazio, usa o motivo interno)..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Notas internas (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Detalhes adicionais para a equipe..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
            </>
          )}

          {action === "request-documents" && (
            <>
              <p className="text-xs text-muted-foreground mb-2">Selecione os documentos a reenviar:</p>
              <div className="grid grid-cols-2 gap-2">
                {DOC_OPTIONS.map((t) => (
                  <button key={t} type="button" onClick={() => toggleDoc(t)}
                    className={`text-xs px-3 py-2 rounded-xl border font-medium transition-colors ${docTypes.includes(t) ? "border-primary bg-primary/15 text-primary" : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20"}`}>
                    {DOC_TYPE_LABELS[t] ?? t}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mensagem ao usuário</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Explique o que está errado ou o que precisa ser corrigido..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
            </>
          )}

          {action === "request-selfie" && (
            <>
              <p className="text-sm text-muted-foreground">Solicite ao usuário uma nova selfie segurando o documento de identificação.</p>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Instruções adicionais (opcional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Ex: Verifique se o rosto está bem iluminado e o documento legível..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
            </>
          )}

          {action === "note" && (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Conteúdo da nota *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder="Escreva sua nota aqui..." className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
                <span className="text-sm text-muted-foreground">Nota pública (visível ao usuário)</span>
              </label>
            </>
          )}

          {action === "suspend" && (
            <>
              <p className="text-sm text-muted-foreground">A verificação será suspensa e o usuário será notificado.</p>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Motivo</label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo da suspensão..." className="mt-1 bg-white/5 border-white/10 rounded-xl" />
              </div>
            </>
          )}

          {action === "resume" && (
            <p className="text-sm text-muted-foreground">A conta voltará para a fila de análise. O usuário será notificado.</p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <Button variant="outline" className="flex-1 rounded-xl border-white/10" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            className={`flex-1 rounded-xl font-bold ${action === "approve" ? "bg-primary text-black hover:bg-primary/90" : action === "reject" || action === "suspend" ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" : "bg-white/10 text-foreground hover:bg-white/15"}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Panel ────────────────────────────────────────

function UserDetailPanel({
  userId,
  onClose,
  onRefresh,
}: {
  userId: number;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"docs" | "audit" | "legal">("docs");
  const [action, setAction] = useState<ActionType | null>(null);
  const [viewingImage, setViewingImage] = useState<{ url: string; compareUrl?: string | null; compareLabel?: string; captureMetadata?: string | null } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await kycApi.user(userId);
      setProfile(data);
    } catch {
      toast.error("Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary/60" />
      </div>
    );
  }

  if (!profile) return null;

  const { profile: user, documents, auditLogs, legalAcceptances } = profile;
  const status = user.accountStatus;

  const handleActionSuccess = () => {
    load();
    onRefresh();
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url) || url.startsWith("data:image");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {viewingImage && <ImageViewer url={viewingImage.url} compareUrl={viewingImage.compareUrl} compareLabel={viewingImage.compareLabel} captureMetadata={viewingImage.captureMetadata} onClose={() => setViewingImage(null)} />}
      {action && (
        <ActionDialog
          userId={userId}
          action={action}
          onClose={() => setAction(null)}
          onSuccess={handleActionSuccess}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-white/5">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
            )}
            <div>
              <h2 className="font-bold text-base">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.email} · {user.role === "freelancer" ? "Profissional" : "Empresa"}</p>
            </div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          status === "verified" ? "bg-primary/15 text-primary" :
          status === "pending_review" ? "bg-yellow-500/15 text-yellow-400" :
          status === "rejected" ? "bg-red-500/15 text-red-400" :
          status === "correction_requested" ? "bg-orange-500/15 text-orange-400" :
          "bg-white/10 text-muted-foreground"
        }`}>{
          status === "verified" ? "Verificado" :
          status === "pending_review" ? "Em análise" :
          status === "rejected" ? "Rejeitado" :
          status === "correction_requested" ? "Correção" :
          "Suspenso"
        }</span>
      </div>

      {/* Profile info */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "CPF", value: user.cpf },
          { label: "CNPJ", value: user.cnpj },
          { label: "Telefone", value: user.phone },
          { label: "PIX", value: user.pixKey },
          { label: "Cadastro", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : null },
        ].filter(f => f.value).map(f => (
          <div key={f.label} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">{f.label}</p>
            <p className="text-sm font-medium mt-0.5">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {status === "pending_review" && (
          <Button size="sm" onClick={() => setAction("approve")} className="bg-primary text-black hover:bg-primary/90 rounded-xl font-bold gap-1.5 text-xs h-8">
            <CheckCircle2 size={13} /> Aprovar
          </Button>
        )}
        {(status === "pending_review" || status === "correction_requested") && (
          <Button size="sm" onClick={() => setAction("reject")} className="bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 rounded-xl font-bold gap-1.5 text-xs h-8">
            <XCircle size={13} /> Rejeitar
          </Button>
        )}
        {status !== "verified" && status !== "blocked" && (
          <>
            <Button size="sm" onClick={() => setAction("request-documents")} className="bg-white/8 text-foreground border border-white/12 hover:bg-white/15 rounded-xl font-bold gap-1.5 text-xs h-8">
              <FileCheck2 size={13} /> Pedir Documentos
            </Button>
            <Button size="sm" onClick={() => setAction("request-selfie")} className="bg-white/8 text-foreground border border-white/12 hover:bg-white/15 rounded-xl font-bold gap-1.5 text-xs h-8">
              <Camera size={13} /> Pedir Selfie
            </Button>
          </>
        )}
        <Button size="sm" onClick={() => setAction("note")} className="bg-white/8 text-foreground border border-white/12 hover:bg-white/15 rounded-xl font-bold gap-1.5 text-xs h-8">
          <MessageSquare size={13} /> Nota
        </Button>
        {status !== "blocked" && (
          <Button size="sm" onClick={() => setAction("suspend")} className="bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 rounded-xl font-bold gap-1.5 text-xs h-8">
            <Ban size={13} /> Suspender
          </Button>
        )}
        {status === "blocked" && (
          <Button size="sm" onClick={() => setAction("resume")} className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl font-bold gap-1.5 text-xs h-8">
            <Play size={13} /> Retomar
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[
          { key: "docs" as const, label: `Documentos (${documents.length})`, icon: <FileText size={12} /> },
          { key: "audit" as const, label: `Histórico (${auditLogs.length})`, icon: <History size={12} /> },
          { key: "legal" as const, label: `Assinaturas (${legalAcceptances.length})`, icon: <Shield size={12} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${tab === t.key ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Documents tab */}
      {tab === "docs" && (
        <div className="space-y-3">
          {documents.length === 0 && (
            <div className="rounded-xl border border-white/8 p-6 text-center text-sm text-muted-foreground">Nenhum documento enviado</div>
          )}
          {documents.map(doc => (
            <div key={doc.id} className="rounded-xl border border-white/8 bg-white/3">
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold">{DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enviado em {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString("pt-BR") : "—"}
                    {doc.version > 1 && ` · v${doc.version}`}
                  </p>
                  {doc.reviewNotes && (
                    <p className="text-xs text-orange-400/80 mt-1">Nota: {doc.reviewNotes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isImage(doc.fileUrl) && (
                    <button onClick={() => setViewingImage({ url: doc.fileUrl, captureMetadata: doc.captureMetadata })}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                      <Eye size={15} />
                    </button>
                  )}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[doc.status]}`}>
                    {STATUS_LABEL[doc.status]}
                  </span>
                </div>
              </div>
              {doc.reviewHistory.length > 0 && (
                <div className="border-t border-white/6 px-3 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Histórico de revisão</p>
                  <div className="space-y-1">
                    {doc.reviewHistory.map(h => (
                      <div key={h.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/70">{h.action}</span>
                        {h.notes && <span>— {h.notes}</span>}
                        <span className="ml-auto whitespace-nowrap">{h.createdAt ? new Date(h.createdAt).toLocaleDateString("pt-BR") : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Audit log tab */}
      {tab === "audit" && (
        <div className="space-y-2">
          {auditLogs.length === 0 && (
            <div className="rounded-xl border border-white/8 p-6 text-center text-sm text-muted-foreground">Nenhum registro de auditoria</div>
          )}
          {auditLogs.map(log => (
            <div key={log.id} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{AUDIT_ACTION_LABEL[log.action] ?? log.action}</span>
                <span className="text-[11px] text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString("pt-BR") : ""}</span>
              </div>
              {log.details && Object.keys(log.details).length > 0 && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                  {Object.entries(log.details)
                    .filter(([k]) => !["reviewerId"].includes(k))
                    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legal acceptances tab */}
      {tab === "legal" && (
        <div className="space-y-2">
          {legalAcceptances.length === 0 && (
            <div className="rounded-xl border border-white/8 p-6 text-center text-sm text-muted-foreground">Nenhuma assinatura registrada</div>
          )}
          {legalAcceptances.map(a => (
            <div key={a.id} className="rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
              <p className="text-sm font-medium">{a.documentTitle ?? a.documentType}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">v{a.version}</span>
                <span className="text-xs text-muted-foreground">{a.acceptedAt ? new Date(a.acceptedAt).toLocaleDateString("pt-BR") : "—"}</span>
              </div>
              {a.signatureHash && (
                <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-mono truncate">Hash: {a.signatureHash.slice(0, 32)}…</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function AdminKycPage() {
  const [activeTab, setActiveTab] = useState<QueueStatus>("pending_review");
  const [users, setUsers] = useState<QueueUser[]>([]);
  const [stats, setStats] = useState<KycStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const [queueData, statsData] = await Promise.all([
        kycApi.queue(activeTab),
        kycApi.stats(),
      ]);
      setUsers(queueData);
      setStats(statsData);
    } catch {
      toast.error("Erro ao carregar fila de verificação.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const filtered = users.filter(u =>
    !search.trim() ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.cpf ?? "").includes(search) ||
    (u.cnpj ?? "").includes(search)
  );

  return (
    <div className="flex h-full" style={{ minHeight: "calc(100vh - 60px)" }}>
      {/* Left pane — queue list */}
      <div className={`flex flex-col border-r border-white/8 ${selectedUserId ? "hidden lg:flex w-80 xl:w-96" : "flex-1 lg:w-96"}`}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold flex items-center gap-2"><Shield size={20} className="text-primary" /> Fila KYC</h1>
            <button onClick={loadQueue} disabled={loading} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF…" className="pl-8 h-8 text-xs bg-white/5 border-white/10 rounded-xl" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-white/8 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedUserId(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${activeTab === tab.key ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <span className={tab.color}>{tab.icon}</span>
              {tab.label}
              {stats && (
                <span className={`ml-1 font-bold ${activeTab === tab.key ? "text-primary" : "text-muted-foreground"}`}>
                  {stats[tab.key] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary/60" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 px-4">
              <Shield size={28} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum usuário nesta fila</p>
            </div>
          )}
          {filtered.map(u => (
            <motion.button
              key={u.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedUserId(u.id)}
              className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/4 transition-colors ${selectedUserId === u.id ? "bg-white/6 border-l-2 border-l-primary" : ""}`}
            >
              <div className="flex items-center gap-3">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  {u.cpf && <p className="text-[10px] text-muted-foreground/60 mt-0.5">CPF: {u.cpf}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex gap-1 text-[10px]">
                    {u.documents.pending > 0 && <span className="bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded-md font-semibold">{u.documents.pending} pend.</span>}
                    {u.documents.approved > 0 && <span className="bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-semibold">{u.documents.approved} ap.</span>}
                    {u.documents.rejected > 0 && <span className="bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-md font-semibold">{u.documents.rejected} rej.</span>}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right pane — detail panel */}
      {selectedUserId ? (
        <UserDetailPanel
          key={selectedUserId}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={loadQueue}
        />
      ) : (
        <div className="flex-1 hidden lg:flex items-center justify-center">
          <div className="text-center">
            <Shield size={40} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">Selecione um usuário para revisar</p>
          </div>
        </div>
      )}
    </div>
  );
}
