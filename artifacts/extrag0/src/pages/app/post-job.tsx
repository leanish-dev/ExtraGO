import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateJob } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Briefcase, MapPin, Clock, DollarSign, Users, ChevronLeft, Loader2, Sparkles, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";

import { CATEGORIES as ALL_CATEGORIES } from "@/lib/categories";
const CATEGORIES = ALL_CATEGORIES.map(c => c.name);

// Daily shift = 7h20min
const DAILY_HOURS = 440 / 60; // 7.333...

const formSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres"),
  description: z.string().min(20, "Descreva melhor o Extra"),
  category: z.string().min(1, "Selecione uma categoria"),
  location: z.string().min(5, "Informe o local completo"),
  date: z.string().min(1, "Informe a data"),
  startTime: z.string().min(1, "Informe o horário de início"),
  endTime: z.string().min(1, "Informe o horário de fim"),
  workersNeeded: z.coerce.number().min(1, "Mínimo 1 profissional"),
  hourlyRate: z.coerce.number().min(20, "Valor mínimo R$ 20/hora"),
  dailyRate: z.coerce.number().optional(),
  shiftType: z.enum(["hourly", "daily"]).default("hourly"),
});

type FormValues = z.infer<typeof formSchema>;

function SectionHeader({ icon, title, color = "primary" }: { icon: React.ReactNode; title: string; color?: string }) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    secondary: "bg-secondary/10 border-secondary/20 text-secondary",
    yellow: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
  };
  return (
    <h2 className="font-semibold flex items-center gap-2 text-sm">
      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      {title}
    </h2>
  );
}

export default function PostJobPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const createJob = useCreateJob();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Load wallet to show available balance
  const { data: wallet } = useQuery<any>({
    queryKey: ["wallet-me"],
    queryFn: () => apiFetch("/api/wallet/me"),
    enabled: !!user,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", category: "", location: "",
      date: "", startTime: "08:00", endTime: "16:20", workersNeeded: 1,
      hourlyRate: 50, dailyRate: undefined, shiftType: "hourly",
    },
  });

  const shiftType = form.watch("shiftType");
  const watchedCalc = (() => {
    const start = form.watch("startTime");
    const end = form.watch("endTime");
    const workers = form.watch("workersNeeded") || 1;
    const rate = form.watch("hourlyRate") || 0;
    const dRate = form.watch("dailyRate");

    if (shiftType === "daily") {
      const dailyPay = dRate ?? (rate * DAILY_HOURS);
      const totalPerWorker = dailyPay;
      const commission = totalPerWorker * 0.15;
      const total = totalPerWorker * workers;
      return { hours: DAILY_HOURS, totalPerWorker, commission, total, isDailyFixed: !!dRate };
    }

    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    const hours = diff / 60;
    const totalPerWorker = hours * rate;
    const commission = totalPerWorker * 0.15;
    const total = totalPerWorker * workers;
    return { hours, totalPerWorker, commission, total, isDailyFixed: false };
  })();

  const reservationAmount = watchedCalc ? Math.round(watchedCalc.total * 1.15 * 100) / 100 : 0;
  const availableBalance = wallet ? Math.max(0, (wallet.balance ?? 0) - (wallet.reservedBalance ?? 0)) : null;
  const hasInsufficientBalance = availableBalance !== null && reservationAmount > 0 && availableBalance < reservationAmount;

  // Auto-fill endTime for daily shift
  const handleShiftTypeChange = (type: "hourly" | "daily") => {
    form.setValue("shiftType", type);
    if (type === "daily") {
      const start = form.getValues("startTime") || "08:00";
      const [sh, sm] = start.split(":").map(Number);
      const totalMin = sh * 60 + sm + 440; // +7h20
      const eh = Math.floor(totalMin / 60) % 24;
      const em = totalMin % 60;
      form.setValue("endTime", `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await createJob.mutateAsync({
        data: {
          ...values,
          shiftType: values.shiftType,
          dailyRate: values.shiftType === "daily" ? (values.dailyRate ?? null) : null,
          totalValue: watchedCalc ? Math.round(watchedCalc.total * 100) : 0,
        } as any
      });
      toast.success("Extra publicado com sucesso!");
      setLocation("/app/jobs");
    } catch (e: any) {
      const msg = e?.data?.error ?? e?.message ?? "Erro ao publicar extra";
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/app/jobs")}
          className="w-9 h-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center border border-white/8"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">Publicar Novo Extra</h1>
          <p className="text-sm text-white/70 mt-0.5">Conecte-se aos melhores profissionais do Brasil</p>
        </div>
      </div>

      {/* Wallet balance indicator */}
      {wallet && (
        <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${hasInsufficientBalance ? "bg-red-500/8 border border-red-500/20" : "bg-white/3 border border-white/8"}`}>
          <DollarSign size={14} className={hasInsufficientBalance ? "text-red-400" : "text-primary"} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70">Saldo disponível na carteira</p>
            <p className={`text-sm font-bold ${hasInsufficientBalance ? "text-red-400" : "text-primary"}`}>
              R$ {(availableBalance ?? 0).toFixed(2)}
            </p>
          </div>
          {hasInsufficientBalance && (
            <button
              type="button"
              onClick={() => setLocation("/app/wallet")}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 font-semibold hover:bg-red-500/25 transition-all"
            >
              Depositar
            </button>
          )}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.065) 0%, rgba(8,17,26,0.92) 65%)",
              border: "1px solid rgba(139,92,246,0.16)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(59,130,246,0.25), transparent)" }} />
            <SectionHeader icon={<Briefcase size={14} />} title="Informações do Extra" color="primary" />

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Garçom para Casamento Premium" {...field} className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-white/75 mb-2 block">Categoria</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); form.setValue("category", cat); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      selectedCategory === cat
                        ? "bg-primary text-black border-primary neon-glow"
                        : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {form.formState.errors.category && (
                <p className="text-destructive text-xs mt-1.5">{form.formState.errors.category.message}</p>
              )}
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Descrição</FormLabel>
                <FormControl>
                  <textarea
                    rows={4}
                    placeholder="Descreva os requisitos, experiência necessária, dress code, etc..."
                    {...field}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/60 focus:outline-none text-sm resize-none transition-colors leading-relaxed"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
          </motion.div>

          {/* Location and time */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07 }}
            className="rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(8,17,26,0.92) 65%)",
              border: "1px solid rgba(0,229,255,0.13)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), rgba(20,184,166,0.25), transparent)" }} />
            <SectionHeader icon={<MapPin size={14} />} title="Local e Horário" color="secondary" />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Local</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: WTC Events, Av. das Nações Unidas, São Paulo" {...field} className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            {/* Shift type toggle */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-white/75 mb-2 block">Tipo de Turno</label>
              <div className="flex gap-2">
                {[
                  { value: "hourly" as const, label: "Por Hora", desc: "Cálculo por hora trabalhada" },
                  { value: "daily" as const, label: "Diária", desc: "7h20min (padrão CLT)" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleShiftTypeChange(opt.value)}
                    className={`flex-1 rounded-xl p-3 text-left transition-all border ${
                      shiftType === opt.value
                        ? "bg-secondary/10 border-secondary/35 text-secondary"
                        : "bg-white/3 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <p className={`text-xs font-bold ${shiftType === opt.value ? "text-secondary" : "text-white/80"}`}>{opt.label}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
              {shiftType === "daily" && (
                <p className="text-[11px] text-secondary/70 mt-2 flex items-center gap-1.5">
                  <Info size={11} /> Jornada diária: 07:20h · Horário de fim calculado automaticamente
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Início</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        if (shiftType === "daily") {
                          const [sh, sm] = e.target.value.split(":").map(Number);
                          const totalMin = sh * 60 + sm + 440;
                          const eh = Math.floor(totalMin / 60) % 24;
                          const em = totalMin % 60;
                          form.setValue("endTime", `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`);
                        }
                      }}
                      className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">
                    Fim {shiftType === "daily" && <span className="text-secondary/60 font-normal lowercase">(auto)</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      readOnly={shiftType === "daily"}
                      className={`bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11 ${shiftType === "daily" ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>
          </motion.div>

          {/* Compensation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.13 }}
            className="rounded-2xl p-5 sm:p-6 space-y-5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(250,204,21,0.05) 0%, rgba(8,17,26,0.92) 65%)",
              border: "1px solid rgba(250,204,21,0.14)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.45), rgba(124,252,0,0.2), transparent)" }} />
            <SectionHeader icon={<DollarSign size={14} />} title="Remuneração e Equipe" color="yellow" />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="workersNeeded" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Profissionais</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} className="bg-white/5 border-white/10 focus:border-yellow-400/60 rounded-xl h-11" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              {shiftType === "hourly" ? (
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">R$/Hora</FormLabel>
                    <FormControl>
                      <Input type="number" min={20} step={5} {...field} className="bg-white/5 border-white/10 focus:border-yellow-400/60 rounded-xl h-11" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              ) : (
                <FormField control={form.control} name="dailyRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-white/75">Valor Diária (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={80}
                        step={10}
                        placeholder={`Ex: ${Math.round(form.watch("hourlyRate") * DAILY_HOURS)}`}
                        {...field}
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        className="bg-white/5 border-white/10 focus:border-yellow-400/60 rounded-xl h-11"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              )}
            </div>

            {shiftType === "daily" && (
              <div className="rounded-xl p-3 bg-secondary/5 border border-secondary/15 flex items-start gap-2">
                <Info size={13} className="text-secondary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/70 leading-relaxed">
                  <span className="text-secondary font-semibold">Diária padrão</span> — 7h20min de trabalho efetivo (sem pausa).
                  Se deixar o valor em branco, será calculado com base no R$/hora configurado.
                </p>
              </div>
            )}

            {watchedCalc && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-4 bg-primary/6 border border-primary/15 space-y-3"
              >
                <p className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles size={12} /> Resumo do Custo
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      label: shiftType === "daily" ? "Jornada" : "Duração",
                      value: shiftType === "daily" ? "7h 20min" : `${watchedCalc.hours.toFixed(1)}h`
                    },
                    { label: "Por profissional", value: `R$ ${watchedCalc.totalPerWorker.toFixed(2)}` },
                    {
                      label: "Comissão plataforma (15%)",
                      value: `R$ ${(watchedCalc.commission * form.watch("workersNeeded")).toFixed(2)}`,
                      color: "text-yellow-400"
                    },
                    {
                      label: "Total a reservar",
                      value: `R$ ${reservationAmount.toFixed(2)}`,
                      color: hasInsufficientBalance ? "text-red-400" : "text-primary",
                      bold: true
                    },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-white/70">{row.label}:</span>
                      <span className={`font-semibold ${(row as any).color ?? ""} ${row.bold ? "text-sm font-bold" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                {hasInsufficientBalance && (
                  <div className="flex items-center gap-2 pt-1 border-t border-red-500/15">
                    <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                    <p className="text-[11px] text-red-400">
                      Saldo insuficiente. Deposite pelo menos R$ {(reservationAmount - (availableBalance ?? 0)).toFixed(2)} na carteira.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          <Button
            type="submit"
            disabled={createJob.isPending || hasInsufficientBalance}
            className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl disabled:opacity-50"
          >
            {createJob.isPending ? (
              <><Loader2 size={15} className="mr-2 animate-spin" />Publicando...</>
            ) : hasInsufficientBalance ? (
              "Saldo insuficiente — deposite para continuar"
            ) : "Publicar Extra"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
