import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getMyKycDocuments, type KycDocument, ACCOUNT_STATUS_LABELS, type AccountStatus } from "@/lib/verification-api";
import { CheckCircle2, Circle, Loader2, Mail, Phone, FileStack, ShieldCheck, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const STAGES: { key: AccountStatus; label: string; icon: React.ReactNode }[] = [
  { key: "pending_email", label: "E-mail verificado", icon: <Mail size={16} /> },
  { key: "pending_phone", label: "Telefone verificado", icon: <Phone size={16} /> },
  { key: "pending_documents", label: "Documentos enviados", icon: <FileStack size={16} /> },
  { key: "pending_review", label: "Em análise pela equipe", icon: <Clock size={16} /> },
  { key: "verified", label: "Conta verificada", icon: <ShieldCheck size={16} /> },
];

const ORDER: AccountStatus[] = ["draft", "pending_email", "pending_phone", "pending_documents", "pending_review", "verified"];

export default function VerificationCenterPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [docs, setDocs] = useState<KycDocument[] | null>(null);
  const status = ((user as any)?.accountStatus ?? "draft") as AccountStatus;
  const currentIndex = ORDER.indexOf(status);

  useEffect(() => {
    getMyKycDocuments().then(setDocs).catch(() => setDocs([]));
  }, []);

  const progressPct = status === "blocked" || status === "rejected" ? 100 : Math.round(((currentIndex + 1) / ORDER.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader title="Central de Verificação" subtitle="Acompanhe o status da verificação da sua conta." />

      {(status === "blocked" || status === "rejected") ? (
        <div className="card-profile-section p-8 text-center mt-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${status === "blocked" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"}`}>
            <XCircle size={30} />
          </div>
          <h2 className="text-xl font-bold mb-2">{status === "blocked" ? "Conta bloqueada" : "Verificação rejeitada"}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {status === "blocked"
              ? "Sua conta foi bloqueada por nossa equipe de segurança. Entre em contato com o suporte para mais informações."
              : "Um ou mais documentos enviados não foram aprovados. Reenvie seus documentos ou fale com o suporte."}
          </p>
          {status === "rejected" && (
            <Button className="mt-5 bg-primary text-black hover:bg-primary/90 rounded-xl h-11 font-bold" onClick={() => setLocation("/onboarding?step=documents")}>
              Reenviar documentos
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="card-profile-section p-6 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">{ACCOUNT_STATUS_LABELS[status]}</span>
              <span className="text-sm font-bold text-primary">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          <div className="card-profile-section p-6 mt-4">
            <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Linha do tempo</h3>
            <div className="space-y-4">
              {STAGES.map((stage, i) => {
                const stageIndex = ORDER.indexOf(stage.key);
                const done = currentIndex > stageIndex || status === "verified";
                const active = currentIndex === stageIndex;
                return (
                  <motion.div key={stage.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                      done ? "bg-primary/15 border-primary/40 text-primary" : active ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400" : "bg-white/5 border-white/10 text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} className="animate-spin" /> : stage.icon}
                    </div>
                    <span className={`text-sm ${done ? "text-foreground font-medium" : active ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{stage.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {docs && docs.length > 0 && (
            <div className="card-profile-section p-6 mt-4">
              <h3 className="font-bold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Documentos enviados</h3>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-white/8 bg-white/3 text-sm">
                    <span className="font-medium">{doc.documentType}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      doc.status === "approved" ? "bg-primary/15 text-primary" :
                      doc.status === "rejected" ? "bg-red-500/15 text-red-400" :
                      "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {doc.status === "approved" ? "Aprovado" : doc.status === "rejected" ? "Rejeitado" : doc.status === "correction_requested" ? "Correção solicitada" : "Pendente"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status !== "verified" && status !== "pending_review" && (
            <Button className="w-full mt-5 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow" onClick={() => setLocation("/onboarding")}>
              Continuar verificação
            </Button>
          )}
          {status === "verified" && (
            <Button className="w-full mt-5 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow" onClick={() => setLocation("/dashboard")}>
              Ir para o painel
            </Button>
          )}
        </>
      )}
    </div>
  );
}
