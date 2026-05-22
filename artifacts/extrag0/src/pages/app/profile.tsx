import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, Building2, Phone, MapPin, CreditCard, Star, CheckCircle, AlertCircle, Camera } from "lucide-react";

const CATEGORIES = ["Garçom", "Barman", "Recepcionista", "Hostess", "Chef de Cozinha", "Cumim", "Auxiliar de Eventos", "Segurança", "Promoter"];

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
      await updateUser.mutateAsync({
        id: user!.id!,
        data: { ...form, categories } as any,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao atualizar perfil");
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const completion = user?.profileCompletion ?? 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Mantenha seus dados atualizados</p>
      </div>

      {/* Profile header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-black">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background hover:bg-primary/80 transition-colors">
              <Camera size={12} className="text-black" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user?.isVerified ? (
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <CheckCircle size={11} /> Verificado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                  <AlertCircle size={11} /> Pendente verificação
                </span>
              )}
              {user?.role === "freelancer" && (
                <span className="flex items-center gap-1 text-xs text-yellow-400">
                  <Star size={11} className="fill-yellow-400" /> {(user?.reputationScore ?? 0).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Completion bar */}
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Completude do perfil</span>
            <span className={`font-semibold ${completion >= 80 ? "text-primary" : completion >= 50 ? "text-yellow-400" : "text-destructive"}`}>
              {completion}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          {completion < 100 && (
            <p className="text-xs text-muted-foreground mt-1.5">Complete seu perfil para aumentar suas chances de contratação</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <User size={18} className="text-primary" />
            Informações Pessoais
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome Completo</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-background/50 border-white/10 focus:border-primary rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Telefone / WhatsApp</label>
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+55 11 99999-0000"
                className="bg-background/50 border-white/10 focus:border-primary rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Bio / Apresentação</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você e sua experiência..."
              className="w-full px-3 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary focus:outline-none text-sm resize-none transition-colors"
            />
          </div>
        </div>

        {/* Company-specific */}
        {user?.role === "company" && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Building2 size={18} className="text-secondary" />
              Dados da Empresa
            </h2>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Nome da Empresa</label>
              <Input
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="bg-background/50 border-white/10 focus:border-primary rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Freelancer categories */}
        {user?.role === "freelancer" && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Star size={18} className="text-yellow-400" />
              Minhas Categorias
            </h2>
            <p className="text-sm text-muted-foreground">Selecione as funções que você exerce</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    categories.includes(cat)
                      ? "bg-primary text-black border-primary neon-glow"
                      : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PIX key for freelancers */}
        {user?.role === "freelancer" && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard size={18} className="text-green-400" />
              Chave PIX para Recebimento
            </h2>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Chave PIX</label>
              <Input
                value={form.pixKey}
                onChange={e => setForm(f => ({ ...f, pixKey: e.target.value }))}
                placeholder="CPF, CNPJ, e-mail ou celular"
                className="bg-background/50 border-white/10 focus:border-primary rounded-xl"
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={updateUser.isPending}
          className="w-full bg-primary text-black hover:bg-primary/90 neon-glow font-bold h-12 text-base rounded-xl"
        >
          {updateUser.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </div>
  );
}
