import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Briefcase, User, CreditCard, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Garçom", "Barman", "Recepcionista", "Hostess", "Chef de Cozinha", "Cumim", "Auxiliar de Eventos", "Segurança", "Promoter"];

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  isLast?: boolean;
}

function FreelancerStep1({ onNext, onBack }: StepProps) {
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
        <Input placeholder="Seu nome completo" className="bg-white/5 border-white/10 rounded-xl h-11" />
        <Input placeholder="Seu telefone" className="bg-white/5 border-white/10 rounded-xl h-11" />
        <textarea
          placeholder="Breve descrição sobre você (bio)"
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <Button onClick={onNext} className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11 gap-2">
        Continuar <ChevronRight size={16} />
      </Button>
    </div>
  );
}

function FreelancerStep2({ onNext, onBack }: StepProps) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={24} className="text-secondary" />
        </div>
        <h3 className="text-lg font-bold">Categorias & Habilidades</h3>
        <p className="text-sm text-muted-foreground mt-1">Selecione as áreas em que você trabalha</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelected(s => s.includes(cat) ? s.filter(c => c !== cat) : [...s, cat])}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              selected.includes(cat)
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
        <Button onClick={onNext} className="flex-1 bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11 gap-2">
          Continuar <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

function FreelancerStep3({ onNext, onBack }: StepProps) {
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
        <Input placeholder="CPF, CNPJ, e-mail ou celular" className="bg-white/5 border-white/10 rounded-xl h-11" />
        <p className="text-xs text-muted-foreground">Você pode configurar sua chave PIX mais tarde na carteira.</p>
      </div>
      <div className="p-3 rounded-xl bg-primary/6 border border-primary/12 text-xs text-muted-foreground">
        🔒 Suas informações são protegidas com criptografia de ponta a ponta.
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1 border-white/10 rounded-xl h-11">
          <ChevronLeft size={16} />
        </Button>
        <Button onClick={onNext} className="flex-1 bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11">
          Concluir 🎉
        </Button>
      </div>
    </div>
  );
}

function CompanyStep1({ onNext }: StepProps) {
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
        <Input placeholder="Nome da empresa" className="bg-white/5 border-white/10 rounded-xl h-11" />
        <Input placeholder="CNPJ" className="bg-white/5 border-white/10 rounded-xl h-11" />
        <Input placeholder="Telefone para contato" className="bg-white/5 border-white/10 rounded-xl h-11" />
      </div>
      <Button onClick={onNext} className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11 gap-2">
        Continuar <ChevronRight size={16} />
      </Button>
    </div>
  );
}

function CompanyStep2({ onNext, onBack }: StepProps) {
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
        <Button onClick={onNext} className="flex-1 bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11">
          Publicar Vaga 🚀
        </Button>
      </div>
    </div>
  );
}

export function OnboardingWizard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const key = user ? `onboarding-done-${user.id}` : null;
    if (!key) return false;
    const done = sessionStorage.getItem(key);
    if (done) return false;
    return (user?.profileCompletion ?? 0) < 40;
  });
  const [step, setStep] = useState(0);

  if (!user) return null;

  const handleClose = () => {
    const key = `onboarding-done-${user.id}`;
    sessionStorage.setItem(key, "1");
    setOpen(false);
  };

  const totalSteps = user.role === "freelancer" ? 3 : 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      handleClose();
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
              step === 0 ? <FreelancerStep1 onNext={handleNext} /> :
              step === 1 ? <FreelancerStep2 onNext={handleNext} onBack={handleBack} /> :
              <FreelancerStep3 onNext={handleNext} onBack={handleBack} isLast />
            ) : (
              step === 0 ? <CompanyStep1 onNext={handleNext} /> :
              <CompanyStep2 onNext={handleNext} onBack={handleBack} isLast />
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
