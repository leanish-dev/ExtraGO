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
import { Briefcase, MapPin, Clock, DollarSign, Users, ChevronLeft, Calendar } from "lucide-react";

const CATEGORIES = ["Garçom", "Barman", "Recepcionista", "Hostess", "Chef de Cozinha", "Cumim", "Auxiliar de Eventos", "Segurança", "Promoter", "Mestre de Cerimônias", "DJ", "Outro"];

const formSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres"),
  description: z.string().min(20, "Descreva melhor a vaga"),
  category: z.string().min(1, "Selecione uma categoria"),
  location: z.string().min(5, "Informe o local completo"),
  date: z.string().min(1, "Informe a data"),
  startTime: z.string().min(1, "Informe o horário de início"),
  endTime: z.string().min(1, "Informe o horário de fim"),
  workersNeeded: z.coerce.number().min(1, "Mínimo 1 profissional"),
  hourlyRate: z.coerce.number().min(20, "Valor mínimo R$ 20/hora"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostJobPage() {
  const [, setLocation] = useLocation();
  const createJob = useCreateJob();
  const [selectedCategory, setSelectedCategory] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      date: "",
      startTime: "",
      endTime: "",
      workersNeeded: 1,
      hourlyRate: 50,
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
      toast.success("Vaga publicada com sucesso!");
      setLocation("/app/jobs");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao publicar vaga");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setLocation("/app/jobs")} className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Publicar Nova Vaga</h1>
          <p className="text-muted-foreground">Conecte-se aos melhores profissionais do Brasil</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic info */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Briefcase size={18} className="text-primary" />
              Informações da Vaga
            </h2>

            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Vaga</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Garçom para Casamento Premium" {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div>
              <FormLabel className="text-sm font-medium">Categoria</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      form.setValue("category", cat);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      selectedCategory === cat
                        ? "bg-primary text-black border-primary neon-glow"
                        : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {form.formState.errors.category && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <textarea
                    rows={4}
                    placeholder="Descreva os requisitos, experiência necessária, dress code, etc..."
                    {...field}
                    className="w-full px-3 py-2 rounded-xl bg-background/50 border border-white/10 focus:border-primary focus:outline-none text-sm resize-none transition-colors"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Location and time */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <MapPin size={18} className="text-secondary" />
              Local e Horário
            </h2>

            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem>
                <FormLabel>Local</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: WTC Events, Av. das Nações Unidas, São Paulo" {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Início</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fim</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* Compensation */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <DollarSign size={18} className="text-yellow-400" />
              Remuneração e Equipe
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="workersNeeded" render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissionais Necessários</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor por Hora (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" min={20} step={5} {...field} className="bg-background/50 border-white/10 focus:border-primary rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {watchedHours && (
              <div className="rounded-xl p-4 bg-primary/5 border border-primary/20 space-y-2">
                <p className="text-sm font-semibold text-primary">Resumo do Custo</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{watchedHours.hours.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Por profissional:</span>
                    <span className="font-medium">R$ {watchedHours.totalPerWorker.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comissão (15%):</span>
                    <span className="font-medium text-yellow-400">R$ {(watchedHours.commission * form.watch("workersNeeded")).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-semibold">Total estimado:</span>
                    <span className="font-bold text-primary">R$ {(watchedHours.total * 1.15).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={createJob.isPending}
            className="w-full bg-primary text-black hover:bg-primary/90 neon-glow font-bold h-12 text-base rounded-xl"
          >
            {createJob.isPending ? "Publicando..." : "Publicar Vaga"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
