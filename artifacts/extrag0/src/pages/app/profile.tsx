import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { User, Building2, CreditCard, Star, CheckCircle, AlertCircle, Camera, Loader2, Shield, Award } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["Garçom", "Barman", "Recepcionista", "Hostess", "Chef de Cozinha", "Cumim", "Auxiliar de Eventos", "Segurança", "Promoter"];

const LEVEL_MAP: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/25", icon: "🥉" },
  silver: { label: "Prata", color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/25", icon: "🥈" },
  gold: { label: "Ouro", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/25", icon: "🥇" },
  elite: { label: "Elite", color: "text-primary", bg: "bg-primary/10 border-primary/25", icon: "👑" },
};

function ReputationRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (score / 5) * 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="hsl(88,100%,49%)" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.19,1,0.22,1)", filter: "drop-shadow(0 0 6px rgba(124,252,0,0.5))" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-lg font-bold leading-none">{score.toFixed(1)}</p>
        <div className="flex justify-center gap-0.5 mt-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={8} className={i <= Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-white/15"} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    companyName: user?.companyName ?? "",
    pixKey: user?.pixKey ?? "",
  });
  const [categories, setCategories] = useState<string[]>(user?.categories ?? []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({ id: user!.id!, data: { ...form, categories } as any });
      toast.success("Perfil atualizado!");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao atualizar perfil");
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const completion = user?.profileCompletion ?? 0;
  const levelInfo = LEVEL_MAP[user?.level ?? "bronze"] ?? LEVEL_MAP.bronze;

  const completionColor = completion >= 80 ? "text-primary" : completion >= 50 ? "text-yellow-400" : "text-destructive";

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader title="Meu Perfil" subtitle="Mantenha seus dados atualizados para aumentar suas chances" />

      {/* Profile hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-2xl p-6 border border-white/8"
      >
        <div className="flex items-start gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-[#060809] hover:bg-primary/80 transition-colors shadow-md">
              <Camera size={11} className="text-black" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-bold leading-tight">{user?.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              {user?.role === "freelancer" && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${levelInfo.bg} ${levelInfo.color}`}>
                  <span>{levelInfo.icon}</span>
                  {levelInfo.label}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {user?.isVerified ? (
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-semibold">
                  <CheckCircle size={11} /> Verificado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full font-semibold">
                  <AlertCircle size={11} /> Pendente verificação
                </span>
              )}
              {user?.role === "admin" && (
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-semibold">
                  <Shield size={11} /> Admin
                </span>
              )}
            </div>
          </div>
          {user?.role === "freelancer" && (
            <div className="flex-shrink-0 hidden sm:block">
              <ReputationRing score={user?.reputationScore ?? 0} />
            </div>
          )}
        </div>

        {/* Completion bar */}
        <div className="mt-5 pt-5 border-t border-white/6">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground font-medium">Completude do perfil</span>
            <span className={`font-bold ${completionColor}`}>{completion}%</span>
          </div>
          <Progress value={completion} glow={completion >= 80} />
          {completion < 100 && (
            <p className="text-[11px] text-muted-foreground mt-1.5">Complete seu perfil para aumentar suas chances de contratação</p>
          )}
        </div>

        {/* Freelancer stats inline */}
        {user?.role === "freelancer" && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: "Jobs Feitos", value: user?.completedJobs ?? 0, color: "text-primary" },
              { label: "Reputação", value: `${(user?.reputationScore ?? 0).toFixed(1)} ★`, color: "text-yellow-400" },
              { label: "Nível", value: levelInfo.label, color: levelInfo.color },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-white/3 border border-white/6">
                <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
            Informações Pessoais
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Nome Completo</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Telefone / WhatsApp</label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+55 11 99999-0000"
                className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Bio / Apresentação</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você e sua experiência..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/60 focus:outline-none text-sm resize-none transition-colors leading-relaxed"
            />
          </div>
        </motion.div>

        {user?.role === "company" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                <Building2 size={14} className="text-secondary" />
              </div>
              Dados da Empresa
            </h2>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Nome da Empresa</label>
              <Input
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11"
              />
            </div>
          </motion.div>
        )}

        {user?.role === "freelancer" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                <Award size={14} className="text-yellow-400" />
              </div>
              Minhas Especialidades
            </h2>
            <p className="text-xs text-muted-foreground">Selecione as funções que você exerce</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    categories.includes(cat)
                      ? "bg-primary text-black border-primary neon-glow"
                      : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {user?.role === "freelancer" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-2xl p-5 sm:p-6 space-y-4"
          >
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center">
                <CreditCard size={14} className="text-green-400" />
              </div>
              Chave PIX para Recebimento
            </h2>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Chave PIX</label>
              <Input
                value={form.pixKey}
                onChange={e => setForm(f => ({ ...f, pixKey: e.target.value }))}
                placeholder="CPF, CNPJ, e-mail ou celular"
                className="bg-white/5 border-white/10 focus:border-green-400/60 rounded-xl h-11"
              />
            </div>
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={updateUser.isPending}
          className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl"
        >
          {updateUser.isPending ? (
            <><Loader2 size={15} className="mr-2 animate-spin" />Salvando...</>
          ) : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  );
}
