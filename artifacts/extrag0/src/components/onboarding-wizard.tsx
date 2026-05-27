import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Briefcase, User, CreditCard, Building2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLocation } from "wouter";

import { CATEGORY_NAMES } from "@/lib/categories";
const CATEGORIES = CATEGORY_NAMES;

interface FreelancerData {
  bio: string;
  phone: string;
  categories: string[];
  pixKey: string;
}

interface CompanyData {
  companyName: string;
  phone: string;
}

function FreelancerStep1({ data, onChange, onNext, saving }: {
  data: Pick<FreelancerData, "bio" | "phone">;
  onChange: (d: Partial<FreelancerData>) => void;
  onNext: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <User size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold">Informações Pessoais</h3>
        <p className="text-sm text-muted-foreground mt-1">Vamos começar com o básico sobre você</p>
      </div>
      <div className="space-y-3">
        <Input
          placeholder="Seu telefone"
          value={data.phone}
          onChange={e => onChange({ phone: e.target.value })}
          className="bg-white/5 border-white/10 rounded-xl h-11"
        />
        <textarea
          placeholder="Breve descrição sobre você (bio)"
          value={data.bio}
          onChange={e => onChange({ bio: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <Button
        onClick={onNext}
        disabled={saving}
        className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11 gap-2"
      >
        {saving ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : <>Continuar <ChevronRight size={16} /></>}
      </Button>
    </div>
  );
}

function FreelancerStep2({ data, onChange, onNext, onBack, saving }: {
  data: Pick<FreelancerData, "categories">;
  onChange: (d: Partial<FreelancerData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  const toggle = (cat: string) => {
    const next = data.categories.includes(cat)
      ? data.categories.filter(c => c !== cat)
      : [...data.categories, cat];
    onChange({ categories: next });
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={24} className="text-secondary" />
        </div>
        <h3 className="text-lg font-bold">Categorias & Habilidades</h3>
        <p className="text-sm text-muted-foreground mt-1">Selecione as áreas em que você trabalha</p>
      </div>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => toggle(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              data.categories.includes(cat)
                ? "bg-primary text-black border-primary neon-glow"
                : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 border-white/10 rounded-xl h-11">
          <ChevronLeft size={16} />
        </Button>
        <Button
          onClick={onNext}
          disabled={saving}
          className="flex-1 bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11 gap-2"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : <>Continuar <ChevronRight size={16} /></>}
        </Button>
      </div>
    </div>
  );
}

function FreelancerStep3({ data, onChange, onNext, onBack, saving }: {
  data: Pick<FreelancerData, "pixKey">;
  onChange: (d: Partial<FreelancerData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CreditCard size={24} className="text-green-400" />
        </div>
        <h3 className="text-lg font-bold">Chave PIX</h3>
        <p className="text-sm text-muted-foreground mt-1">Para receber seus pagamentos rapidamente</p>
      </div>
      <div className="space-y-3">
        <Input
          placeholder="CPF, CNPJ, e-mail ou celular"
          value={data.pixKey}
          onChange={e => onChange({ pixKey: e.target.value })}
          className="bg-white/5 border-white/10 rounded-xl h-11"
        />
        <p className="text-xs text-muted-foreground">Você pode configurar sua chave PIX mais tarde na carteira.</p>
      </div>
      <div className="p-3 rounded-xl bg-primary/6 border border-primary/12 text-xs text-muted-foreground">
        🔒 Suas informações são protegidas com criptografia de ponta a ponta.
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 border-white/10 rounded-xl h-11">
          <ChevronLeft size={16} />
        </Button>
        <Button
          onClick={onNext}
          disabled={saving}
          className="flex-1 bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : "Concluir 🎉"}
        </Button>
      </div>
    </div>
  );
}

function CompanyStep1({ data, onChange, onNext, saving }: {
  data: CompanyData;
  onChange: (d: Partial<CompanyData>) => void;
  onNext: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Building2 size={24} className="text-secondary" />
        </div>
        <h3 className="text-lg font-bold">Informações da Empresa</h3>
        <p className="text-sm text-muted-foreground mt-1">Conte-nos sobre seu negócio</p>
      </div>
      <div className="space-y-3">
        <Input
          placeholder="Nome da empresa"
          value={data.companyName}
          onChange={e => onChange({ companyName: e.target.value })}
          className="bg-white/5 border-white/10 rounded-xl h-11"
        />
        <Input
          placeholder="Telefone para contato"
          value={data.phone}
          onChange={e => onChange({ phone: e.target.value })}
          className="bg-white/5 border-white/10 rounded-xl h-11"
        />
      </div>
      <Button
        onClick={onNext}
        disabled={saving}
        className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11 gap-2"
      >
        {saving ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : <>Continuar <ChevronRight size={16} /></>}
      </Button>
    </div>
  );
}

function CompanyStep2({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold">Publique sua Primeira Vaga</h3>
        <p className="text-sm text-muted-foreground mt-1">Encontre os melhores profissionais agora</p>
      </div>
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-2">
        <p className="text-sm font-semibold">Por que publicar agora?</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>✅ Acesso a centenas de profissionais verificados</li>
          <li>✅ Contratação rápida em poucas horas</li>
          <li>✅ Pagamento seguro via plataforma</li>
          <li>✅ Avaliações e histórico de cada profissional</li>
        </ul>
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 border-white/10 rounded-xl h-11">
          <ChevronLeft size={16} />
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
        >
          Publicar Vaga 🚀
        </Button>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const updateUser = useUpdateUser();
  const [, setLocation] = useLocation();

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined" || !user) return false;
    const key = `onboarding-done-${user.id}`;
    if (localStorage.getItem(key)) return false;
    return (user?.profileCompletion ?? 0) < 40;
  });

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [freelancerData, setFreelancerData] = useState<FreelancerData>({
    bio: user?.bio ?? "",
    phone: user?.phone ?? "",
    categories: user?.categories ?? [],
    pixKey: user?.pixKey ?? "",
  });

  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: user?.companyName ?? "",
    phone: user?.phone ?? "",
  });

  if (!user) return null;

  const handleClose = () => {
    localStorage.setItem(`onboarding-done-${user.id}`, "1");
    setOpen(false);
  };

  const saveData = async (payload: Record<string, any>) => {
    setSaving(true);
    try {
      await updateUser.mutateAsync({ id: user.id, data: payload });
      await qc.invalidateQueries({ queryKey: ["me"] });
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
      throw new Error("save failed");
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = user.role === "freelancer" ? 3 : 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = async () => {
    try {
      if (user.role === "freelancer") {
        if (step === 0) {
          await saveData({ bio: freelancerData.bio, phone: freelancerData.phone });
        } else if (step === 1) {
          await saveData({ categories: freelancerData.categories });
        } else if (step === 2) {
          if (freelancerData.pixKey) await saveData({ pixKey: freelancerData.pixKey });
          handleClose();
          return;
        }
      } else {
        if (step === 0) {
          await saveData({ companyName: companyData.companyName, phone: companyData.phone });
        } else if (step === 1) {
          handleClose();
          setLocation("/app/jobs/new");
          return;
        }
      }
      setStep(s => s + 1);
    } catch {
      // error toast already shown in saveData
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="bg-[#0A0C0F] border-white/10 max-w-md p-6 rounded-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Passo {step + 1} de {totalSteps}</p>
            <p className="text-xs font-bold text-primary">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} glow className="h-1.5" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {user.role === "freelancer" ? (
              step === 0 ? (
                <FreelancerStep1
                  data={freelancerData}
                  onChange={d => setFreelancerData(s => ({ ...s, ...d }))}
                  onNext={handleNext}
                  saving={saving}
                />
              ) : step === 1 ? (
                <FreelancerStep2
                  data={freelancerData}
                  onChange={d => setFreelancerData(s => ({ ...s, ...d }))}
                  onNext={handleNext}
                  onBack={handleBack}
                  saving={saving}
                />
              ) : (
                <FreelancerStep3
                  data={freelancerData}
                  onChange={d => setFreelancerData(s => ({ ...s, ...d }))}
                  onNext={handleNext}
                  onBack={handleBack}
                  saving={saving}
                />
              )
            ) : (
              step === 0 ? (
                <CompanyStep1
                  data={companyData}
                  onChange={d => setCompanyData(s => ({ ...s, ...d }))}
                  onNext={handleNext}
                  saving={saving}
                />
              ) : (
                <CompanyStep2 onNext={handleNext} onBack={handleBack} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
