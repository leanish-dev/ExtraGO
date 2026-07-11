import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getMyKycDocuments,
  getMyLegalAcceptances,
  type KycDocument,
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
  LEGAL_DOCUMENT_LABELS,
} from "@/lib/verification-api";
import {
  CheckCircle2, Circle, Loader2, Mail, Phone, FileStack,
  ShieldCheck, XCircle, Clock, AlertCircle, ChevronRight,
  FileText, Pen, RefreshCw, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────

const ORDER: AccountStatus[] = [
  "draft", "pending_email", "pending_phone",
  "pending_documents", "pending_review", "verified",
];

const DOC_TYPE_LABELS: Record<string, string> = {
  rg: "RG — Identidade",
  cnh: "CNH",
  cpf_card: "CPF",
  cnpj_card: "CNPJ",
  proof_of_address: "Comprovante de Residência",
  selfie: "Selfie com Documento",
  company_contract: "Contrato Social",
  other: "Documento adicional",
};

const DOC_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:              { label: "Aguardando análise",     className: "bg-yellow-500/15 text-yellow-400" },
  approved:             { label: "Aprovado",               className: "bg-primary/15 text-primary" },
  rejected:             { label: "Rejeitado",              className: "bg-red-500/15 text-red-400" },
  correction_requested: { label: "Correção solicitada",    className: "bg-orange-500/15 text-orange-400" },
};

// ─── Stage config ─────────────────────────────────────────────

interface Stage {
  key: AccountStatus;
  label: string;
  completedLabel: string;
  activeLabel: string;
  description: string;
  icon: React.ReactNode;
  action?: { label: string; href: string };
}

const STAGES: Stage[] = [
  {
    key: "pending_email",
    label: "E-mail",
    completedLabel: "✔ E-mail verificado",
    activeLabel: "Verificação de e-mail pendente",
    description: "Confirme seu endereço de e-mail para continuar o cadastro.",
    icon: <Mail size={16} />,
    action: { label: "Verificar e-mail", href: "/onboarding" },
  },
  {
    key: "pending_phone",
    label: "Telefone",
    completedLabel: "✔ Telefone verificado",
    activeLabel: "Verificação de telefone pendente",
    description: "Confirme seu número de celular via código SMS.",
    icon: <Phone size={16} />,
    action: { label: "Verificar telefone", href: "/onboarding" },
  },
  {
    key: "pending_documents",
    label: "Documentos",
    completedLabel: "✔ Documentos enviados",
    activeLabel: "Envio de documentos pendente",
    description: "Envie seus documentos de identidade, selfie e comprovante de residência.",
    icon: <FileStack size={16} />,
    action: { label: "Enviar documentos", href: "/onboarding" },
  },
  {
    key: "pending_review",
    label: "Em análise",
    completedLabel: "✔ Documentos em análise",
    activeLabel: "Documentos recebidos — em análise",
    description: "Nossa equipe está analisando seus documentos. Prazo estimado: 1–2 dias úteis.",
    icon: <Clock size={16} />,
  },
  {
    key: "verified",
    label: "Verificado",
    completedLabel: "✔ Conta verificada",
    activeLabel: "Conta verificada",
    description: "Sua conta está verificada. Você tem acesso completo à plataforma.",
    icon: <ShieldCheck size={16} />,
    action: { label: "Acessar plataforma", href: "/app/dashboard" },
  },
];

// ─── Status-specific messages ─────────────────────────────────

function statusMessage(status: AccountStatus): {
  heading: string;
  body: string;
  nextStep?: string;
  estimatedTime?: string;
} {
  switch (status) {
    case "pending_email":
      return {
        heading: "Confirme seu e-mail",
        body: "Enviamos um código de verificação para o seu endereço de e-mail. Abra o link ou insira o código de 6 dígitos para continuar.",
        nextStep: "Verificar e-mail",
        estimatedTime: "Imediato",
      };
    case "pending_phone":
      return {
        heading: "Confirme seu telefone",
        body: "Enviamos um código SMS para o seu celular. Insira o código de 6 dígitos para avançar.",
        nextStep: "Verificar telefone",
        estimatedTime: "Imediato",
      };
    case "pending_documents":
      return {
        heading: "Envie seus documentos",
        body: "Para ativar sua conta, precisamos verificar sua identidade. Envie seu documento de identidade (RG ou CNH), uma selfie segurando o documento e um comprovante de residência.",
        nextStep: "Enviar documentos",
        estimatedTime: "5–10 minutos",
      };
    case "pending_review":
      return {
        heading: "Documentos recebidos — em análise",
        body: "Nossa equipe de compliance está analisando seus documentos. Este processo leva normalmente 1 a 2 dias úteis. Você será notificado por e-mail e notificação na plataforma assim que a análise for concluída.",
        estimatedTime: "1–2 dias úteis",
      };
    case "verified":
      return {
        heading: "Conta verificada!",
        body: "Parabéns! Sua conta foi verificada com sucesso. Você agora tem acesso completo a todas as funcionalidades da plataforma extraGO.",
      };
    case "rejected":
      return {
        heading: "Verificação não aprovada",
        body: "Infelizmente um ou mais documentos enviados não foram aprovados. Verifique os detalhes abaixo e reenvie os documentos necessários. Nossa equipe irá analisar novamente.",
        nextStep: "Reenviar documentos",
      };
    case "correction_requested":
      return {
        heading: "Correção de documentos solicitada",
        body: "Nossa equipe solicitou a correção ou reenvio de alguns documentos. Verifique as instruções abaixo e reenvie os itens indicados.",
        nextStep: "Corrigir documentos",
        estimatedTime: "Após correção: 1–2 dias úteis",
      };
    case "blocked":
      return {
        heading: "Verificação suspensa",
        body: "Sua verificação foi temporariamente suspensa pela nossa equipe de compliance. Entre em contato com o suporte para mais informações.",
      };
    default:
      return {
        heading: "Verificação em andamento",
        body: "Complete as etapas abaixo para verificar sua conta.",
      };
  }
}

// ─── Main Component ───────────────────────────────────────────

export default function VerificationCenterPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [docs, setDocs] = useState<KycDocument[] | null>(null);
  const [acceptances, setAcceptances] = useState<any[] | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const status = ((user as any)?.accountStatus ?? "draft") as AccountStatus;
  const currentIndex = ORDER.indexOf(status);

  useEffect(() => {
    Promise.all([
      getMyKycDocuments().catch(() => []),
      getMyLegalAcceptances().catch(() => []),
    ]).then(([d, a]) => {
      setDocs(d);
      setAcceptances(a);
    }).finally(() => setLoadingDocs(false));
  }, []);

  // Progress percentage
  const progressPct = ["blocked", "rejected"].includes(status)
    ? 100
    : status === "verified"
    ? 100
    : Math.max(5, Math.round(((Math.max(currentIndex, 0) + 1) / ORDER.length) * 100));

  const msg = statusMessage(status);
  const isTerminal = ["blocked", "rejected"].includes(status);
  const isVerified = status === "verified";
  const needsAction = ["pending_email", "pending_phone", "pending_documents", "rejected", "correction_requested"].includes(status);

  const hasCorrectionDocs = docs?.some(d => d.status === "rejected" || d.status === "correction_requested");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Central de Verificação"
        subtitle="Acompanhe o status da verificação da sua conta."
      />

      {/* ── Status Card ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-profile-section p-6 mt-6 ${
          isVerified ? "border-primary/30 bg-primary/5" :
          status === "rejected" ? "border-red-500/25 bg-red-500/5" :
          status === "blocked" ? "border-red-500/25 bg-red-500/5" :
          status === "correction_requested" ? "border-orange-500/25 bg-orange-500/5" :
          status === "pending_review" ? "border-yellow-500/20 bg-yellow-500/4" :
          ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isVerified ? "bg-primary/15 text-primary" :
            status === "rejected" ? "bg-red-500/15 text-red-400" :
            status === "blocked" ? "bg-red-500/15 text-red-400" :
            status === "correction_requested" ? "bg-orange-500/15 text-orange-400" :
            status === "pending_review" ? "bg-yellow-500/10 text-yellow-400" :
            "bg-white/8 text-muted-foreground"
          }`}>
            {isVerified ? <ShieldCheck size={22} /> :
             status === "rejected" ? <XCircle size={22} /> :
             status === "blocked" ? <XCircle size={22} /> :
             status === "correction_requested" ? <AlertCircle size={22} /> :
             status === "pending_review" ? <Clock size={22} /> :
             <Loader2 size={22} className="animate-spin" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold mb-1">{msg.heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{msg.body}</p>
            {msg.estimatedTime && (
              <p className="text-xs text-primary/70 font-semibold mt-2 flex items-center gap-1.5">
                <Clock size={11} /> Prazo estimado: {msg.estimatedTime}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!isTerminal && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Progresso</span>
              <span className="text-xs font-bold text-primary">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5" />
          </div>
        )}

        {/* CTA */}
        {needsAction && msg.nextStep && (
          <Button
            onClick={() => setLocation("/onboarding")}
            className="mt-4 w-full h-11 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2"
          >
            {msg.nextStep} <ArrowRight size={16} />
          </Button>
        )}
        {isVerified && (
          <Button
            onClick={() => setLocation("/app/dashboard")}
            className="mt-4 w-full h-11 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2"
          >
            Acessar plataforma <ArrowRight size={16} />
          </Button>
        )}
      </motion.div>

      {/* ── Verification Timeline ────────────────────────────── */}
      {!isTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="card-profile-section p-6 mt-4"
        >
          <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
            Linha do Tempo
          </h3>
          <div className="space-y-3">
            {STAGES.map((stage, i) => {
              const stageIndex = ORDER.indexOf(stage.key);
              const done = currentIndex > stageIndex || isVerified;
              const active = currentIndex === stageIndex && !isVerified;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    active ? "bg-yellow-500/6 border border-yellow-500/15" :
                    done ? "bg-primary/4 border border-primary/10" :
                    "border border-transparent"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 mt-0.5 ${
                    done ? "bg-primary/15 border-primary/40 text-primary" :
                    active ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400" :
                    "bg-white/5 border-white/10 text-muted-foreground/40"
                  }`}>
                    {done ? <CheckCircle2 size={15} /> :
                     active ? <Loader2 size={15} className="animate-spin" /> :
                     stage.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${
                        done ? "text-foreground" :
                        active ? "text-foreground" :
                        "text-muted-foreground/50"
                      }`}>
                        {done ? stage.completedLabel :
                         active ? stage.activeLabel :
                         stage.label}
                      </span>
                      {active && stage.action && (
                        <button
                          onClick={() => setLocation(stage.action!.href)}
                          className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-0.5 flex-shrink-0 ml-2"
                        >
                          {stage.action.label} <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                    {active && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{stage.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Correction requested / rejected banner ───────────── */}
      {(status === "correction_requested" || (status === "rejected" && hasCorrectionDocs)) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card-profile-section p-5 mt-4 border-orange-500/25 bg-orange-500/5"
        >
          <h3 className="font-bold text-sm flex items-center gap-2 text-orange-400 mb-3">
            <AlertCircle size={15} /> Ação necessária nos documentos abaixo
          </h3>
          <div className="space-y-2">
            {docs?.filter(d => ["rejected", "correction_requested"].includes(d.status)).map(doc => (
              <div key={doc.id} className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}</span>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${DOC_STATUS_CONFIG[doc.status]?.className}`}>
                    {DOC_STATUS_CONFIG[doc.status]?.label}
                  </span>
                </div>
                {doc.reviewNotes && (
                  <p className="text-xs text-orange-300/80 mt-1.5 leading-relaxed">
                    ↳ {doc.reviewNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
          <Button
            onClick={() => setLocation("/onboarding")}
            className="mt-4 w-full h-10 font-bold rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/25 hover:bg-orange-500/25 gap-2"
          >
            Corrigir e reenviar documentos <ArrowRight size={15} />
          </Button>
        </motion.div>
      )}

      {/* ── All submitted documents ──────────────────────────── */}
      {docs && docs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="card-profile-section p-6 mt-4"
        >
          <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <FileStack size={14} /> Documentos enviados
          </h3>
          <div className="space-y-2">
            {docs.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/8 bg-white/3 text-sm"
              >
                <div>
                  <span className="font-medium">{DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType}</span>
                  {doc.submittedAt && (
                    <span className="ml-2 text-xs text-muted-foreground/50">
                      {new Date(doc.submittedAt).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {doc.reviewNotes && doc.status !== "approved" && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">{doc.reviewNotes}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${
                  DOC_STATUS_CONFIG[doc.status]?.className ?? "bg-white/10 text-muted-foreground"
                }`}>
                  {DOC_STATUS_CONFIG[doc.status]?.label ?? doc.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Legal acceptances ────────────────────────────────── */}
      {acceptances && acceptances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-profile-section p-6 mt-4"
        >
          <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Pen size={14} /> Assinatura eletrônica
          </h3>
          <div className="space-y-2">
            {acceptances.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/8 bg-white/3 text-sm">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-primary/60 flex-shrink-0" />
                  <span className="font-medium text-sm">
                    {LEGAL_DOCUMENT_LABELS[a.documentType as keyof typeof LEGAL_DOCUMENT_LABELS] ?? a.documentType}
                  </span>
                  {a.version && <span className="text-xs text-muted-foreground/50">v{a.version}</span>}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span className="text-xs text-primary font-semibold">Assinado</span>
                  {a.acceptedAt && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {new Date(a.acceptedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Blocked state ───────────────────────────────────── */}
      {status === "blocked" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-profile-section p-8 text-center mt-6 border-red-500/20 bg-red-500/5"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/10 text-red-400">
            <XCircle size={30} />
          </div>
          <h2 className="text-lg font-bold mb-2">Conta suspensa</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Sua conta foi temporariamente suspensa pela nossa equipe de compliance.
            Entre em contato com o suporte para mais informações.
          </p>
          <Button
            variant="outline"
            className="mt-5 border-white/15 rounded-xl"
            onClick={() => window.open("mailto:suporte@extrago.com.br", "_blank")}
          >
            Contatar suporte
          </Button>
        </motion.div>
      )}

      {/* ── Rejected state ──────────────────────────────────── */}
      {status === "rejected" && !hasCorrectionDocs && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-profile-section p-8 text-center mt-6 border-red-500/20 bg-red-500/5"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/10 text-red-400">
            <XCircle size={30} />
          </div>
          <h2 className="text-lg font-bold mb-2">Verificação não aprovada</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Um ou mais documentos enviados não foram aprovados. Corrija os itens indicados e reenvie para análise.
          </p>
          <Button
            className="mt-5 bg-primary text-black hover:bg-primary/90 rounded-xl h-11 font-bold gap-2"
            onClick={() => setLocation("/onboarding")}
          >
            Reenviar documentos <ArrowRight size={16} />
          </Button>
        </motion.div>
      )}

      {/* ── Loading skeleton for docs ──────────────────────── */}
      {loadingDocs && (
        <div className="card-profile-section p-6 mt-4 animate-pulse">
          <div className="h-3 bg-white/8 rounded-full w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
