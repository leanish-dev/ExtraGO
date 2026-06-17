import React, { useState } from "react";
import { useAdminListRepresentatives, useAdminCreateRepresentative, useAdminDeleteRepresentative } from "@workspace/api-client-react";
import type { StateRepresentative } from "@workspace/api-client-react";
import {
  MapPin, Users, Plus, Trash2, Loader2, Building2,
  Shield, TrendingUp, Star, AlertCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const BR_STATES = [
  { code: "AC", name: "Acre" }, { code: "AL", name: "Alagoas" }, { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" }, { code: "BA", name: "Bahia" }, { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" }, { code: "ES", name: "Espírito Santo" }, { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" }, { code: "MT", name: "Mato Grosso" }, { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" }, { code: "PA", name: "Pará" }, { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" }, { code: "PE", name: "Pernambuco" }, { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" }, { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" }, { code: "RO", name: "Rondônia" }, { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" }, { code: "SP", name: "São Paulo" }, { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
];

const COMMISSION_PRESETS = [
  { label: "1%", value: 0.01 },
  { label: "2%", value: 0.02 },
  { label: "3%", value: 0.03 },
  { label: "5%", value: 0.05 },
];

function RepCard({ rep, onDelete, deleting }: {
  rep: StateRepresentative & { userName?: string; userEmail?: string; userAvatarUrl?: string };
  onDelete: () => void;
  deleting: boolean;
}) {
  const stateName = BR_STATES.find(s => s.code === (rep as any).state)?.name ?? (rep as any).state;
  const commissionPct = ((rep.commissionRate ?? 0) * 100).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base">{stateName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold">
                {(rep as any).state}
              </span>
            </div>
            {(rep as any).userName && (
              <p className="text-sm text-foreground/80 font-medium mt-0.5">{(rep as any).userName}</p>
            )}
            {(rep as any).userEmail && (
              <p className="text-xs text-white/70">{(rep as any).userEmail}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} className="text-secondary" />
                <span className="text-xs font-bold text-secondary">Comissão: {commissionPct}%</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1 text-xs text-white/70">
                <Shield size={11} className="text-green-400" />
                <span>Ativo</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          size="sm" variant="ghost"
          className="text-destructive hover:bg-destructive/10 border border-destructive/15 h-8 gap-1 text-xs flex-shrink-0"
          onClick={onDelete} disabled={deleting}
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Remover
        </Button>
      </div>
    </motion.div>
  );
}

export default function AdminRepresentativesPage() {
  const { data: reps = [], isLoading, refetch } = useAdminListRepresentatives({
    query: { queryKey: ["admin-representatives"] },
  });
  const createMutation = useAdminCreateRepresentative();
  const deleteMutation = useAdminDeleteRepresentative();

  const [showForm, setShowForm] = useState(false);
  const [userId, setUserId] = useState("");
  const [state, setState] = useState("");
  const [commissionRate, setCommissionRate] = useState("0.02");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async () => {
    const uid = parseInt(userId);
    if (!uid || isNaN(uid)) { toast.error("Informe um ID de usuário válido"); return; }
    if (!state) { toast.error("Selecione o estado"); return; }
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 0.20) { toast.error("Taxa de comissão inválida (0% – 20%)"); return; }

    try {
      await createMutation.mutateAsync({
        data: { userId: uid, state, commissionRate: rate } as any,
      });
      toast.success(`Representante do estado ${state} cadastrado com sucesso!`);
      setShowForm(false);
      setUserId(""); setState(""); setCommissionRate("0.02");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao cadastrar representante");
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Representante removido.");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao remover representante");
    } finally {
      setDeletingId(null);
    }
  };

  const coveredStates = new Set((reps as any[]).map((r: any) => r.state));
  const uncoveredCount = 27 - coveredStates.size;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold neon-text-gradient">Representantes Regionais</h1>
          <p className="text-white/70 mt-1 text-sm">
            Gerencie os representantes por estado — recebem comissão das taxas de plataforma dos extras na sua região
          </p>
        </div>
        <Button
          onClick={() => setShowForm(s => !s)}
          className={`gap-2 ${showForm ? "bg-white/10 text-foreground hover:bg-white/15 border border-white/15" : "bg-primary text-black hover:bg-primary/90"}`}
        >
          <Plus size={15} /> {showForm ? "Cancelar" : "Novo Representante"}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-4 border border-white/8">
          <p className="text-xs text-white/70 mb-1">Representantes</p>
          <p className="text-2xl font-bold">{(reps as any[]).length}</p>
          <p className="text-[11px] text-white/60 mt-0.5">estados cobertos</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/8">
          <p className="text-xs text-white/70 mb-1">Sem cobertura</p>
          <p className="text-2xl font-bold text-yellow-400">{uncoveredCount}</p>
          <p className="text-[11px] text-white/60 mt-0.5">de 27 estados</p>
        </div>
        <div className="glass-card rounded-xl p-4 border border-white/8">
          <p className="text-xs text-white/70 mb-1">Cobertura</p>
          <p className="text-2xl font-bold text-primary">
            {Math.round((coveredStates.size / 27) * 100)}%
          </p>
          <p className="text-[11px] text-white/60 mt-0.5">do território nacional</p>
        </div>
      </div>

      {/* How it works banner */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-2">
        <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-3">Como funciona</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "💼", title: "Extra concluído", desc: "Plataforma recebe a taxa do freelancer" },
            { icon: "📍", title: "Estado identificado", desc: "Sistema verifica o estado do extra" },
            { icon: "💰", title: "Comissão automática", desc: "Representante recebe % da taxa regional" },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">{s.icon}</span>
              <div>
                <p className="text-xs font-semibold text-foreground/80">{s.title}</p>
                <p className="text-[11px] text-white/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 space-y-4 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus size={15} className="text-primary" /> Cadastrar Novo Representante
              </h3>
              <p className="text-xs text-white/70 -mt-2">
                O usuário precisa ter conta na plataforma. Informe o ID do usuário.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/75 mb-2 block uppercase tracking-widest">ID do Usuário</label>
                  <Input
                    type="number" placeholder="Ex: 42"
                    value={userId} onChange={e => setUserId(e.target.value)}
                    className="bg-white/5 border-white/12 focus:border-primary/50 rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/75 mb-2 block uppercase tracking-widest">Estado</label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="bg-white/5 border-white/12 rounded-xl h-10 focus:border-primary/50">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {BR_STATES.map(s => (
                        <SelectItem key={s.code} value={s.code} disabled={coveredStates.has(s.code)}>
                          {s.code} — {s.name} {coveredStates.has(s.code) ? "(já tem representante)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/75 mb-2 block uppercase tracking-widest">Comissão (da taxa)</label>
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      {COMMISSION_PRESETS.map(p => (
                        <button key={p.value} type="button"
                          onClick={() => setCommissionRate(String(p.value))}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                            commissionRate === String(p.value)
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-white/12 text-muted-foreground hover:border-white/25"
                          }`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number" min={0} max={0.2} step={0.005}
                      placeholder="0.02"
                      value={commissionRate} onChange={e => setCommissionRate(e.target.value)}
                      className="bg-white/5 border-white/12 focus:border-primary/50 rounded-xl h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-primary text-black hover:bg-primary/90 font-bold gap-2"
                >
                  {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Cadastrar Representante
                </Button>
                {state && commissionRate && (
                  <p className="text-xs text-white/70">
                    Representante do {BR_STATES.find(s => s.code === state)?.name ?? state} receberá{" "}
                    <strong className="text-primary">{(parseFloat(commissionRate) * 100).toFixed(1)}%</strong> da taxa de plataforma dos extras nesse estado.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Representatives list */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}</div>
      ) : (reps as any[]).length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={44} className="text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-foreground/60">Nenhum representante cadastrado</p>
          <p className="text-sm text-white/70 mt-1">Adicione representantes regionais para expandir a cobertura nacional.</p>
          <Button onClick={() => setShowForm(true)} className="mt-4 bg-primary text-black hover:bg-primary/90 gap-2">
            <Plus size={14} /> Cadastrar primeiro representante
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-white/80 uppercase tracking-wider">
              {(reps as any[]).length} representante{(reps as any[]).length !== 1 ? "s" : ""} ativo{(reps as any[]).length !== 1 ? "s" : ""}
            </h2>
          </div>
          <div className="space-y-3">
            {(reps as any[]).map((rep: any) => (
              <RepCard
                key={rep.id}
                rep={rep}
                onDelete={() => handleDelete(rep.id)}
                deleting={deletingId === rep.id}
              />
            ))}
          </div>
        </>
      )}

      {/* Uncovered states */}
      {(reps as any[]).length > 0 && uncoveredCount > 0 && (
        <div className="glass-card rounded-xl p-4 border border-yellow-400/15">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-400">Estados sem cobertura ({uncoveredCount})</p>
              <p className="text-xs text-white/70 mt-0.5">Extras nesses estados não geram comissão regional.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BR_STATES.filter(s => !coveredStates.has(s.code)).map(s => (
              <button key={s.code} onClick={() => { setState(s.code); setShowForm(true); }}
                className="text-[11px] px-2 py-1 rounded-lg border border-yellow-400/20 text-yellow-400/70 hover:border-yellow-400/40 hover:text-yellow-400 transition-all font-medium">
                {s.code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
