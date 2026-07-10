import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Briefcase, Users, CheckCircle, Loader2, Eye, EyeOff, ArrowRight, ArrowLeft,
  Mail, Phone, FileText, PenTool, UploadCloud, PartyPopper, ShieldCheck, X,
  FileCheck2, Building2, User as UserIcon, CreditCard,
} from "lucide-react";
import InstitutionalNavbar from "@/components/layout/InstitutionalNavbar";
import {
  requestEmailVerification, confirmEmailVerification,
  requestPhoneVerification, confirmPhoneVerification,
  getLegalDocument, acceptLegalDocument,
  submitKycDocument, fileToDataUrl,
  LEGAL_DOCUMENT_TYPES, LEGAL_DOCUMENT_LABELS,
  type LegalDocument, type LegalDocumentType,
} from "@/lib/verification-api";

type AccountType = "freelancer" | "company";

const TOTAL_STEPS = 9;
const STEP_LABELS = [
  "Tipo de conta", "Dados básicos", "E-mail", "Telefone", "Documentos legais",
  "Aceite", "Assinatura", "Upload de documentos", "Concluído",
];

function StepShell({ step, title, subtitle, icon, children }: {
  step: number; title: string; subtitle?: string; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
    >
      <div className="mb-7 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/12 border border-primary/22 text-primary mb-4 mx-auto">
          {icon}
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-1.5">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">{subtitle}</p>}
      </div>
      <div className="glass-card p-6 rounded-2xl border border-white/8 shadow-xl backdrop-blur-sm">
        {children}
      </div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const { setToken, user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const refParam = searchParams.get("ref") ?? "";
  const roleParam = searchParams.get("role");

  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(
    roleParam === "company" ? "company" : "freelancer"
  );
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 — basic info
  const [basic, setBasic] = useState({
    name: "", cpf: "", birthDate: "", phone: "", whatsapp: "",
    email: "", password: "", confirmPassword: "",
    companyName: "", tradeName: "", cnpj: "", legalRepName: "", legalRepCpf: "",
    commercialPhone: "",
  });
  const [basicErrors, setBasicErrors] = useState<Record<string, string>>({});

  // If already authenticated but not verified, jump straight into the flow
  // at the right stage instead of re-registering.
  useEffect(() => {
    if (authLoading || !user) return;
    const status = (user as any).accountStatus as string | undefined;
    if (status === "pending_phone") setStep(4);
    else if (status === "pending_documents") setStep(8);
    else if (status === "pending_review" || status === "verified") setLocation("/verification-center");
    else if (status === "pending_email" || !status) setStep(3);
  }, [authLoading, user]);

  const goNext = () => setStep(s => Math.min(TOTAL_STEPS, s + 1));
  const goBack = () => setStep(s => Math.max(1, s - 1));

  // ── STEP 2 submit → create the account ──────────────────────
  const validateBasic = () => {
    const errors: Record<string, string> = {};
    const digits = (s: string) => s.replace(/\D/g, "");
    if (accountType === "freelancer") {
      if (basic.name.trim().length < 3) errors.name = "Informe seu nome completo";
      if (digits(basic.cpf).length !== 11) errors.cpf = "CPF inválido";
      if (!basic.birthDate) errors.birthDate = "Informe sua data de nascimento";
      if (digits(basic.phone).length < 10) errors.phone = "Telefone inválido";
    } else {
      if (basic.companyName.trim().length < 2) errors.companyName = "Informe a razão social";
      if (digits(basic.cnpj).length !== 14) errors.cnpj = "CNPJ inválido";
      if (basic.legalRepName.trim().length < 3) errors.legalRepName = "Informe o responsável legal";
      if (digits(basic.legalRepCpf).length !== 11) errors.legalRepCpf = "CPF do responsável inválido";
      if (digits(basic.commercialPhone).length < 10) errors.commercialPhone = "Telefone inválido";
    }
    if (!/^\S+@\S+\.\S+$/.test(basic.email)) errors.email = "E-mail inválido";
    if (basic.password.length < 8) errors.password = "Mínimo de 8 caracteres";
    if (basic.password !== basic.confirmPassword) errors.confirmPassword = "As senhas não coincidem";
    setBasicErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitBasic = async () => {
    if (!validateBasic()) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        email: basic.email,
        password: basic.password,
        role: accountType,
        name: accountType === "freelancer" ? basic.name : basic.legalRepName,
        cpf: accountType === "freelancer" ? basic.cpf.replace(/\D/g, "") : basic.legalRepCpf.replace(/\D/g, ""),
        phone: (accountType === "freelancer" ? basic.phone : basic.commercialPhone).replace(/\D/g, ""),
      };
      if (accountType === "company") {
        payload.companyName = basic.companyName;
        payload.cnpj = basic.cnpj.replace(/\D/g, "");
      }
      if (refParam) payload.referralCode = refParam;

      const res = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
      setToken(res.token);
      toast.success("Conta criada! Vamos verificar seus dados.");
      goNext();
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      if (msg.toLowerCase().includes("email")) {
        toast.error("Este e-mail já está cadastrado.");
      } else if (msg.toLowerCase().includes("cpf")) {
        toast.error("Este CPF já está cadastrado.");
      } else if (msg.toLowerCase().includes("cnpj")) {
        toast.error("Este CNPJ já está cadastrado.");
      } else {
        toast.error("Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#050b10" }}>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/landing-page-bg-darkblue.webp" alt="" className="w-full h-full object-cover" style={{ opacity: 0.35 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,11,16,0.72) 0%, rgba(5,11,16,0.88) 60%, rgba(5,11,16,0.97) 100%)" }} />
      </div>

      <div className="relative z-50"><InstitutionalNavbar /></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[560px]">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Etapa {step} de {TOTAL_STEPS}</span>
              <span className="text-xs font-semibold text-primary">{STEP_LABELS[step - 1]}</span>
            </div>
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepShell step={1} title="Como você vai usar a extraGO?" icon={<UserIcon size={24} />}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "freelancer" as const, icon: <Users size={22} />, title: "Sou Freelancer", desc: "Garçom, barman, hostess e mais" },
                    { value: "company" as const, icon: <Briefcase size={22} />, title: "Sou Empresa", desc: "Contrato para eventos e hospitality" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAccountType(opt.value)}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        accountType === opt.value ? "border-primary/55 bg-primary/8" : "border-white/8 bg-white/3 hover:border-white/14"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-2.5 ${
                        accountType === opt.value ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                      }`}>{opt.icon}</div>
                      <p className="font-bold text-sm mb-0.5">{opt.title}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{opt.desc}</p>
                      {accountType === opt.value && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle size={11} className="text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Button onClick={goNext} className="w-full h-12 mt-6 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2">
                  Continuar <ArrowRight size={16} />
                </Button>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell step={2} title="Dados básicos" subtitle="Precisamos confirmar quem é você." icon={accountType === "company" ? <Building2 size={24} /> : <UserIcon size={24} />}>
                <div className="space-y-3">
                  {accountType === "freelancer" ? (
                    <>
                      <Field label="Nome Completo" error={basicErrors.name}>
                        <Input value={basic.name} onChange={e => setBasic(b => ({ ...b, name: e.target.value }))} className={inputClass} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="CPF" error={basicErrors.cpf}>
                          <Input value={basic.cpf} onChange={e => setBasic(b => ({ ...b, cpf: e.target.value }))} placeholder="000.000.000-00" className={inputClass} />
                        </Field>
                        <Field label="Data de Nascimento" error={basicErrors.birthDate}>
                          <Input type="date" value={basic.birthDate} onChange={e => setBasic(b => ({ ...b, birthDate: e.target.value }))} className={inputClass} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Telefone" error={basicErrors.phone}>
                          <Input value={basic.phone} onChange={e => setBasic(b => ({ ...b, phone: e.target.value }))} placeholder="(11) 99999-0000" className={inputClass} />
                        </Field>
                        <Field label="WhatsApp">
                          <Input value={basic.whatsapp} onChange={e => setBasic(b => ({ ...b, whatsapp: e.target.value }))} placeholder="Se diferente do telefone" className={inputClass} />
                        </Field>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Razão Social" error={basicErrors.companyName}>
                          <Input value={basic.companyName} onChange={e => setBasic(b => ({ ...b, companyName: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label="Nome Fantasia">
                          <Input value={basic.tradeName} onChange={e => setBasic(b => ({ ...b, tradeName: e.target.value }))} className={inputClass} />
                        </Field>
                      </div>
                      <Field label="CNPJ" error={basicErrors.cnpj}>
                        <Input value={basic.cnpj} onChange={e => setBasic(b => ({ ...b, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" className={inputClass} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Representante Legal" error={basicErrors.legalRepName}>
                          <Input value={basic.legalRepName} onChange={e => setBasic(b => ({ ...b, legalRepName: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label="CPF do Representante" error={basicErrors.legalRepCpf}>
                          <Input value={basic.legalRepCpf} onChange={e => setBasic(b => ({ ...b, legalRepCpf: e.target.value }))} className={inputClass} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Telefone Comercial" error={basicErrors.commercialPhone}>
                          <Input value={basic.commercialPhone} onChange={e => setBasic(b => ({ ...b, commercialPhone: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label="WhatsApp">
                          <Input value={basic.whatsapp} onChange={e => setBasic(b => ({ ...b, whatsapp: e.target.value }))} className={inputClass} />
                        </Field>
                      </div>
                    </>
                  )}

                  <Field label="E-mail" error={basicErrors.email}>
                    <Input type="email" value={basic.email} onChange={e => setBasic(b => ({ ...b, email: e.target.value }))} className={inputClass} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Senha" error={basicErrors.password}>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} value={basic.password} onChange={e => setBasic(b => ({ ...b, password: e.target.value }))} className={inputClass + " pr-9"} />
                        <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </Field>
                    <Field label="Confirmar Senha" error={basicErrors.confirmPassword}>
                      <Input type={showPassword ? "text" : "password"} value={basic.confirmPassword} onChange={e => setBasic(b => ({ ...b, confirmPassword: e.target.value }))} className={inputClass} />
                    </Field>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={goBack} className="h-12 rounded-xl border-white/10 gap-2"><ArrowLeft size={15} />Voltar</Button>
                  <Button onClick={submitBasic} disabled={saving} className="flex-1 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2">
                    {saving ? <><Loader2 size={16} className="animate-spin" />Criando conta...</> : <>Criar Conta <ArrowRight size={16} /></>}
                  </Button>
                </div>
              </StepShell>
            )}

            {step === 3 && <EmailVerifyStep onNext={goNext} />}
            {step === 4 && <PhoneVerifyStep defaultPhone={accountType === "freelancer" ? basic.phone : basic.commercialPhone} onNext={goNext} />}
            {step === 5 && <LegalDocsStep onNext={goNext} onBack={goBack} accountType={accountType}
              onSelectionChange={(sel) => { pendingAcceptanceRef.current = sel; }} />}
            {step === 6 && <SignatureStep accountType={accountType} onNext={goNext} onBack={goBack} pendingAcceptanceRef={pendingAcceptanceRef} />}
            {step === 7 && <DocumentUploadStep accountType={accountType} onNext={goNext} onBack={goBack} />}
            {step === 8 && <CompleteStep />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const inputClass = "bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl";
const pendingAcceptanceRef = { current: [] as { id: number; type: LegalDocumentType }[] };

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground/90">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── STEP 3 — Email verification ─────────────────────────────
function EmailVerifyStep({ onNext }: { onNext: () => void }) {
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const send = async () => {
    setSending(true);
    try {
      await requestEmailVerification();
      toast.success("Código enviado para seu e-mail.");
      setCooldown(60);
    } catch (e: any) {
      toast.error(String(e?.message ?? "Não foi possível enviar o código."));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { send(); }, []);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const confirm = async () => {
    if (otp.length < 4) return;
    setConfirming(true);
    try {
      await confirmEmailVerification({ otpCode: otp });
      toast.success("E-mail verificado!");
      onNext();
    } catch (e: any) {
      toast.error("Código inválido ou expirado.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <StepShell step={3} title="Verifique seu e-mail" subtitle="Enviamos um código de 6 dígitos. Confirme para continuar." icon={<Mail size={24} />}>
      <div className="space-y-4">
        <Input
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="text-center tracking-[0.5em] text-lg font-mono h-14 bg-white/5 border-white/10 rounded-xl"
        />
        <Button onClick={confirm} disabled={confirming || otp.length < 4} className="w-full h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2">
          {confirming ? <><Loader2 size={16} className="animate-spin" />Confirmando...</> : <>Confirmar e-mail <ArrowRight size={16} /></>}
        </Button>
        <button
          type="button"
          disabled={sending || cooldown > 0}
          onClick={send}
          className="w-full text-center text-xs font-semibold text-primary/80 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Reenviar código em ${cooldown}s` : sending ? "Enviando..." : "Reenviar código"}
        </button>
      </div>
    </StepShell>
  );
}

// ── STEP 4 — Phone verification ─────────────────────────────
function PhoneVerifyStep({ defaultPhone, onNext }: { defaultPhone: string; onNext: () => void }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Informe um telefone válido.");
      return;
    }
    setSending(true);
    try {
      await requestPhoneVerification({ phone, channel: "sms" });
      toast.success("Código enviado por SMS.");
      setSent(true);
      setCooldown(60);
    } catch (e: any) {
      toast.error("Não foi possível enviar o código.");
    } finally {
      setSending(false);
    }
  };

  const confirm = async () => {
    setConfirming(true);
    try {
      await confirmPhoneVerification({ code });
      toast.success("Telefone verificado!");
      onNext();
    } catch (e: any) {
      toast.error("Código inválido ou expirado.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <StepShell step={4} title="Verifique seu telefone" subtitle="Confirmamos por SMS para garantir a segurança da sua conta." icon={<Phone size={24} />}>
      <div className="space-y-4">
        <Field label="Telefone">
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-0000" className={inputClass} disabled={sent} />
        </Field>
        {!sent ? (
          <Button onClick={send} disabled={sending} className="w-full h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2">
            {sending ? <><Loader2 size={16} className="animate-spin" />Enviando...</> : <>Enviar código <ArrowRight size={16} /></>}
          </Button>
        ) : (
          <>
            <Input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Código recebido"
              className="text-center tracking-[0.4em] text-lg font-mono h-14 bg-white/5 border-white/10 rounded-xl"
            />
            <Button onClick={confirm} disabled={confirming || code.length < 4} className="w-full h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2">
              {confirming ? <><Loader2 size={16} className="animate-spin" />Confirmando...</> : <>Confirmar telefone <ArrowRight size={16} /></>}
            </Button>
            <button type="button" disabled={sending || cooldown > 0} onClick={send} className="w-full text-center text-xs font-semibold text-primary/80 hover:text-primary disabled:opacity-40">
              {cooldown > 0 ? `Reenviar código em ${cooldown}s` : "Reenviar código"}
            </button>
          </>
        )}
      </div>
    </StepShell>
  );
}

// ── STEP 5 — Legal documents display ─────────────────────────
function LegalDocsStep({ onNext, onBack, onSelectionChange }: {
  onNext: () => void; onBack: () => void; accountType: AccountType;
  onSelectionChange: (sel: { id: number; type: LegalDocumentType }[]) => void;
}) {
  const [docs, setDocs] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDoc, setOpenDoc] = useState<LegalDocument | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const results = await Promise.all(
        LEGAL_DOCUMENT_TYPES.map(t => getLegalDocument(t).catch(() => null))
      );
      setDocs(results.filter((d): d is LegalDocument => !!d));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    onSelectionChange(docs.filter(d => checked[d.type]).map(d => ({ id: d.id, type: d.type })));
  }, [checked, docs]);

  const allChecked = docs.length > 0 && docs.every(d => checked[d.type]);

  return (
    <StepShell step={5} title="Documentos legais" subtitle="Leia e aceite os documentos abaixo para continuar." icon={<FileText size={24} />}>
      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <Checkbox checked={!!checked[doc.type]} onCheckedChange={(v) => setChecked(c => ({ ...c, [doc.type]: !!v }))} />
                <span className="text-sm font-medium">{LEGAL_DOCUMENT_LABELS[doc.type]}</span>
              </label>
              <button type="button" onClick={() => setOpenDoc(doc)} className="text-xs font-semibold text-primary/80 hover:text-primary whitespace-nowrap">
                Ler documento
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/10 gap-2"><ArrowLeft size={15} />Voltar</Button>
        <Button onClick={onNext} disabled={!allChecked} className="flex-1 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2 disabled:opacity-40">
          Continuar <ArrowRight size={16} />
        </Button>
      </div>

      <Dialog open={!!openDoc} onOpenChange={(v) => !v && setOpenDoc(null)}>
        <DialogContent className="max-w-lg bg-[#0a1118] border-white/10">
          <DialogHeader>
            <DialogTitle>{openDoc ? LEGAL_DOCUMENT_LABELS[openDoc.type] : ""}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {openDoc?.content}
          </div>
          <p className="text-[11px] text-muted-foreground/60">Versão {openDoc?.version}</p>
        </DialogContent>
      </Dialog>
    </StepShell>
  );
}

// ── STEP 6 — Electronic signature ─────────────────────────────
function SignatureStep({ accountType, onNext, onBack, pendingAcceptanceRef }: {
  accountType: AccountType; onNext: () => void; onBack: () => void;
  pendingAcceptanceRef: React.MutableRefObject<{ id: number; type: LegalDocumentType }[]>;
}) {
  const { user } = useAuth();
  const [typedName, setTypedName] = useState("");
  const [signing, setSigning] = useState(false);
  const legalName = (user?.name ?? "").trim();
  const matches = typedName.trim().length > 2 && typedName.trim().toLowerCase() === legalName.toLowerCase();

  const sign = async () => {
    if (!matches) return;
    setSigning(true);
    try {
      const pending = pendingAcceptanceRef.current;
      for (const doc of pending) {
        await acceptLegalDocument(doc.id);
      }
      toast.success("Assinatura registrada com sucesso.");
      onNext();
    } catch (e: any) {
      toast.error("Não foi possível registrar sua assinatura.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <StepShell step={6} title="Assinatura eletrônica" subtitle={`Digite seu nome completo (${legalName || "conforme cadastro"}) para assinar os documentos aceitos.`} icon={<PenTool size={24} />}>
      <div className="space-y-4">
        <Input
          value={typedName}
          onChange={e => setTypedName(e.target.value)}
          placeholder={legalName || "Seu nome completo"}
          className={inputClass + " font-serif italic text-base"}
        />
        {typedName.length > 2 && !matches && <p className="text-xs text-red-400">O nome digitado precisa corresponder exatamente ao nome cadastrado.</p>}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/10 gap-2"><ArrowLeft size={15} />Voltar</Button>
          <Button onClick={sign} disabled={!matches || signing} className="flex-1 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2 disabled:opacity-40">
            {signing ? <><Loader2 size={16} className="animate-spin" />Assinando...</> : <>Assinar e continuar <FileCheck2 size={16} /></>}
          </Button>
        </div>
      </div>
    </StepShell>
  );
}

// ── STEP 7 — Document upload ─────────────────────────────────
interface UploadSlot { key: string; label: string; documentType: string; required: boolean; }

const FREELANCER_SLOTS: UploadSlot[] = [
  { key: "id", label: "RG ou CNH", documentType: "rg", required: true },
  { key: "cpf", label: "CPF", documentType: "cpf_card", required: true },
  { key: "selfie", label: "Selfie segurando o documento", documentType: "selfie", required: true },
  { key: "address", label: "Comprovante de Endereço", documentType: "proof_of_address", required: true },
  { key: "cert", label: "Certificados (opcional)", documentType: "other", required: false },
];

const COMPANY_SLOTS: UploadSlot[] = [
  { key: "cnpj", label: "Cartão CNPJ", documentType: "cnpj_card", required: true },
  { key: "contract", label: "Contrato Social / Documentos Corporativos", documentType: "company_contract", required: true },
  { key: "repId", label: "Documento do Representante", documentType: "rg", required: true },
  { key: "address", label: "Comprovante de Endereço", documentType: "proof_of_address", required: true },
  { key: "logo", label: "Logo da Empresa", documentType: "other", required: false },
];

function UploadRow({ slot, onUploaded }: { slot: UploadSlot; onUploaded: (key: string, fileUrl: string) => void }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("uploading");
    setFileName(file.name);
    try {
      const dataUrl = await fileToDataUrl(file);
      if (file.type.startsWith("image/")) setPreview(dataUrl);
      await submitKycDocument({ documentType: slot.documentType, fileUrl: dataUrl });
      setStatus("done");
      onUploaded(slot.key, dataUrl);
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
        status === "done" ? "border-primary/40 bg-primary/5" : status === "error" ? "border-red-500/40 bg-red-500/5" : "border-dashed border-white/15 bg-white/3 hover:border-white/25"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {preview ? (
          <img src={preview} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground flex-shrink-0">
            <UploadCloud size={17} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{slot.label}{!slot.required && <span className="text-muted-foreground font-normal"> (opcional)</span>}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {status === "uploading" && "Enviando..."}
            {status === "done" && `Enviado — ${fileName}`}
            {status === "error" && "Falha no envio — tente novamente"}
            {status === "idle" && "Arraste um arquivo ou clique para selecionar"}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {status === "uploading" ? <Loader2 size={16} className="animate-spin text-primary" /> :
         status === "done" ? <CheckCircle size={18} className="text-primary" /> :
         (
          <Button type="button" size="sm" variant="outline" className="h-8 text-xs border-white/15" onClick={() => inputRef.current?.click()}>
            {status === "error" ? "Repetir" : "Selecionar"}
          </Button>
         )}
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}

function DocumentUploadStep({ accountType, onNext, onBack }: { accountType: AccountType; onNext: () => void; onBack: () => void }) {
  const slots = accountType === "freelancer" ? FREELANCER_SLOTS : COMPANY_SLOTS;
  const [uploaded, setUploaded] = useState<Record<string, string>>({});
  const [pixKey, setPixKey] = useState("");
  const [bankData, setBankData] = useState("");
  const [saving, setSaving] = useState(false);

  const requiredDone = slots.filter(s => s.required).every(s => uploaded[s.key]);

  const finish = async () => {
    setSaving(true);
    try {
      if (pixKey.trim()) {
        await apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify({ pixKey: pixKey.trim() }) }).catch(() => {});
      }
      toast.success("Documentos enviados! Sua conta está em análise.");
      onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepShell step={7} title="Envio de documentos" subtitle="Precisamos verificar sua identidade antes de liberar sua conta." icon={<UploadCloud size={24} />}>
      <div className="space-y-2.5">
        {slots.map(slot => (
          <UploadRow key={slot.key} slot={slot} onUploaded={(k, url) => setUploaded(u => ({ ...u, [k]: url }))} />
        ))}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Field label="Chave PIX">
            <Input value={pixKey} onChange={e => setPixKey(e.target.value)} placeholder="CPF, e-mail ou telefone" className={inputClass} />
          </Field>
          <Field label="Dados Bancários (opcional)">
            <Input value={bankData} onChange={e => setBankData(e.target.value)} placeholder="Banco / Agência / Conta" className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onBack} className="h-12 rounded-xl border-white/10 gap-2"><ArrowLeft size={15} />Voltar</Button>
        <Button onClick={finish} disabled={!requiredDone || saving} className="flex-1 h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2 disabled:opacity-40">
          {saving ? <><Loader2 size={16} className="animate-spin" />Enviando...</> : <>Concluir cadastro <ArrowRight size={16} /></>}
        </Button>
      </div>
    </StepShell>
  );
}

// ── STEP 8 — Complete ──────────────────────────────────────────
function CompleteStep() {
  const [, setLocation] = useLocation();
  return (
    <StepShell step={8} title="Sua conta foi criada!" icon={<PartyPopper size={24} />}>
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-sm font-semibold">
          <ShieldCheck size={15} /> Status: Em Análise
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Nosso time vai revisar seus documentos. O prazo estimado de análise é de até <strong className="text-foreground">24 horas úteis</strong>.
          Você será notificado assim que sua conta for aprovada.
        </p>
        <div className="grid grid-cols-1 gap-2 pt-2">
          <Button onClick={() => setLocation("/verification-center")} className="h-12 font-bold rounded-xl bg-primary text-black hover:bg-primary/90 neon-glow gap-2">
            Acompanhar verificação <ArrowRight size={16} />
          </Button>
          <Button variant="outline" onClick={() => setLocation("/dashboard")} className="h-11 rounded-xl border-white/10">
            Ir para o painel
          </Button>
        </div>
      </div>
    </StepShell>
  );
}
