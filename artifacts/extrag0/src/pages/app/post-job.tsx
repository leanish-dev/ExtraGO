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
import { Briefcase, MapPin, Clock, DollarSign, Users, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { CATEGORIES as ALL_CATEGORIES } from "@/lib/categories";
const CATEGORIES = ALL_CATEGORIES.map(c => c.name);

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
  const createJob = useCreateJob();
  const [selectedCategory, setSelectedCategory] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", category: "", location: "",
      date: "", startTime: "", endTime: "", workersNeeded: 1, hourlyRate: 50,
    },
  });

  const watchedHours = (() => {
    const start = form.watch("startTime");
    const end = form.watch("endTime");
    const workers = form.watch("workersNeeded") || 1;
    const rate = form.watch("hourlyRate") || 0;
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;
    const hours = diff / 60;
    const totalPerWorker = hours * rate;
    const commission = totalPerWorker * 0.15;
    const total = totalPerWorker * workers;
    return { hours, totalPerWorker, commission, total };
  })();

  const onSubmit = async (values: FormValues) => {
    try {
      await createJob.mutateAsync({
        data: {
          ...values,
          totalValue: watchedHours ? Math.round(watchedHours.total * 100) : 0,
        } as any
      });
      toast.success("Extra publicado com sucesso!");
      setLocation("/app/jobs");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao publicar extra");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocation("/app/jobs")}
          className="w-9 h-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center border border-white/8"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">Publicar Novo Extra</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Conecte-se aos melhores profissionais do Brasil</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-2xl p-5 sm:p-6 space-y-5"
          >
            <SectionHeader icon={<Briefcase size={14} />} title="Informações do Extra" color="primary" />

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Título</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Garçom para Casamento Premium" {...field} className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">Categoria</label>
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
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição</FormLabel>
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
            className="glass-card rounded-2xl p-5 sm:p-6 space-y-5"
          >
            <SectionHeader icon={<MapPin size={14} />} title="Local e Horário" color="secondary" />

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Local</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: WTC Events, Av. das Nações Unidas, São Paulo" {...field} className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "date" as const, label: "Data", type: "date" },
                { name: "startTime" as const, label: "Início", type: "time" },
                { name: "endTime" as const, label: "Fim", type: "time" },
              ].map(({ name, label, type }) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</FormLabel>
                    <FormControl>
                      <Input type={type} {...field} className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              ))}
            </div>
          </motion.div>

          {/* Compensation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.13 }}
            className="glass-card rounded-2xl p-5 sm:p-6 space-y-5"
          >
            <SectionHeader icon={<DollarSign size={14} />} title="Remuneração e Equipe" color="yellow" />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="workersNeeded" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profissionais</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} className="bg-white/5 border-white/10 focus:border-yellow-400/60 rounded-xl h-11" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
              <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">R$/Hora</FormLabel>
                  <FormControl>
                    <Input type="number" min={20} step={5} {...field} className="bg-white/5 border-white/10 focus:border-yellow-400/60 rounded-xl h-11" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            {watchedHours && (
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
                    { label: "Duração", value: `${watchedHours.hours.toFixed(1)}h` },
                    { label: "Por profissional", value: `R$ ${watchedHours.totalPerWorker.toFixed(2)}` },
                    { label: "Comissão (15%)", value: `R$ ${(watchedHours.commission * form.watch("workersNeeded")).toFixed(2)}`, color: "text-yellow-400" },
                    { label: "Total estimado", value: `R$ ${(watchedHours.total * 1.15).toFixed(2)}`, color: "text-primary", bold: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{row.label}:</span>
                      <span className={`font-semibold ${row.color ?? ""} ${row.bold ? "text-sm font-bold" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          <Button
            type="submit"
            disabled={createJob.isPending}
            className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl"
          >
            {createJob.isPending ? (
              <><Loader2 size={15} className="mr-2 animate-spin" />Publicando...</>
            ) : "Publicar Extra"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
