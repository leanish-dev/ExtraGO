import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, X, ShieldCheck, CreditCard, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function TrustChip({ icon, label, done }: { icon: React.ReactNode; label: string; done: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-all ${
      done
        ? "bg-primary/10 border-primary/25 text-primary"
        : "bg-white/5 border-white/10 text-muted-foreground"
    }`}>
      {icon}
      {label}
    </span>
  );
}

export function ProfileCompletionBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;
  const completion = user.profileCompletion ?? 0;
  if (completion >= 100) return null;

  const hasPixKey = !!user.pixKey;
  const hasCategories = (user.categories?.length ?? 0) > 0;
  const isVerified = user.isVerified ?? false;

  const nextAction =
    !user.bio ? { label: "Completar perfil", href: "/app/profile" } :
    user.role === "freelancer" && !hasPixKey ? { label: "Adicionar chave PIX", href: "/app/wallet" } :
    user.role === "freelancer" && !hasCategories ? { label: "Adicionar categorias", href: "/app/profile" } :
    { label: "Ver perfil", href: "/app/profile" };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(8,17,26,0.96) 55%, rgba(124,252,0,0.08) 100%)", borderColor: "rgba(34,197,94,0.28)", boxShadow: "0 4px 24px rgba(34,197,94,0.10)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-4 pr-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <User size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">Complete seu perfil</p>
              <span className="text-sm font-bold text-primary">{completion}%</span>
            </div>
            <Progress value={completion} glow className="h-1.5 mb-3" />

            <div className="flex flex-wrap gap-1.5 mb-3">
              <TrustChip icon={<User size={9} />} label="Perfil completo" done={completion >= 80} />
              {user.role === "freelancer" && (
                <>
                  <TrustChip icon={<CreditCard size={9} />} label="PIX configurado" done={hasPixKey} />
                  <TrustChip icon={<ShieldCheck size={9} />} label="Conta verificada" done={isVerified} />
                </>
              )}
            </div>

            <Link href={nextAction.href}>
              <Button
                size="sm"
                className="h-8 px-4 bg-primary/10 border border-primary/25 text-primary hover:bg-primary hover:text-black font-semibold rounded-lg text-xs transition-all gap-1"
              >
                {nextAction.label} <ChevronRight size={12} />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
