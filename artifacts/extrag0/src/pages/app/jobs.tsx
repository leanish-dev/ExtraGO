import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListJobs, useApplyToJob } from "@workspace/api-client-react";
import type { Job } from "@workspace/api-client-react";
import { Search, MapPin, Clock, DollarSign, Users, Briefcase, Filter, X, ChevronDown, ExternalLink, Star, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonCard } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Todos", "Garçom", "Barman", "Recepcionista", "Hostess", "Chef de Cozinha", "Cumim", "Auxiliar de Eventos", "Segurança", "Promoter"];

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  open: { label: "Aberta", class: "bg-primary/20 text-primary border-primary/30" },
  in_progress: { label: "Em andamento", class: "bg-secondary/20 text-secondary border-secondary/30" },
  completed: { label: "Concluída", class: "bg-green-500/20 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelada", class: "bg-destructive/20 text-destructive border-destructive/30" },
};

function getHours(startTime?: string | null, endTime?: string | null): number | null {
  if (!startTime || !endTime) return null;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}

function JobDetailSheet({ job, open, onClose, onApply, isCompany }: {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onApply?: (id: number) => Promise<void>;
  isCompany?: boolean;
}) {
  const [applying, setApplying] = useState(false);
  if (!job) return null;

  const hours = getHours(job.startTime, job.endTime);
  const total = hours ? (job.hourlyRate ?? 0) * hours : null;
  const statusInfo = STATUS_MAP[job.status ?? "open"] ?? STATUS_MAP.open;

  const handleApply = async () => {
    if (!onApply) return;
    setApplying(true);
    try {
      await onApply(job.id!);
      onClose();
    } finally {
      setApplying(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#080A0D] border-white/8 p-0 overflow-y-auto"
      >
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border-b border-white/6 p-6 pt-12 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08]" />
          <SheetHeader className="text-left mb-5 relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
              <span className="text-[10px] text-muted-foreground px-2.5 py-1 rounded-full bg-white/5 border border-white/8">{job.category}</span>
            </div>
            <SheetTitle className="text-xl font-bold leading-snug text-left">{job.title}</SheetTitle>
          </SheetHeader>

          <div className="flex items-end gap-4 relative">
            <div>
              <p className="text-5xl font-bold text-primary leading-none">R$ {(job.hourlyRate ?? 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1.5">por hora</p>
            </div>
            {total && (
              <>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-2xl font-bold text-secondary leading-none">R$ {total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">total ({hours?.toFixed(0)}h)</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <MapPin size={13} className="text-primary" />, label: "Local", value: job.location },
              { icon: <Clock size={13} className="text-secondary" />, label: "Horário", value: `${job.startTime}–${job.endTime}` },
              { icon: <Briefcase size={13} className="text-muted-foreground" />, label: "Data", value: job.date ? format(new Date(job.date), "dd MMM yyyy", { locale: ptBR }) : "—" },
              { icon: <Users size={13} className="text-muted-foreground" />, label: "Vagas", value: `${job.workersApproved}/${job.workersNeeded}` },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-3 rounded-xl bg-white/3 border border-white/6 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-2">{item.icon}<span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{item.label}</span></div>
                <p className="text-sm font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Descrição</p>
              <p className="text-sm leading-relaxed text-foreground/80">{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {(job as any).requirements && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Requisitos</p>
              <p className="text-sm leading-relaxed text-foreground/80">{(job as any).requirements}</p>
            </div>
          )}

          {/* Earnings breakdown */}
          {total && (
            <div className="p-4 rounded-2xl bg-primary/6 border border-primary/12 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={13} className="text-primary" />
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Estimativa de Ganhos</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor/hora</span>
                  <span className="font-semibold">R$ {(job.hourlyRate ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Horas</span>
                  <span className="font-semibold">{hours?.toFixed(1)}h</span>
                </div>
                <div className="h-px bg-white/8 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Total líquido</span>
                  <span className="font-bold text-primary text-base">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            {isCompany ? (
              <Link href={`/app/jobs/${job.id}`} onClick={onClose}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-12">
                    Gerenciar Vaga <ExternalLink size={14} className="ml-2" />
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-12 text-sm"
                  onClick={handleApply}
                  disabled={applying || job.status !== "open"}
                >
                  {applying ? "Enviando candidatura..." : "Candidatar-se agora"}
                </Button>
              </motion.div>
            )}
            <SheetClose asChild>
              <Button variant="outline" className="w-full border-white/10 hover:border-white/25 rounded-xl h-10 text-sm">
                Fechar
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function JobCard({ job, onClick, isCompany, index = 0 }: { job: Job; onClick: (job: Job) => void; isCompany?: boolean; index?: number }) {
  const hours = getHours(job.startTime, job.endTime);
  const statusInfo = STATUS_MAP[job.status ?? "open"] ?? STATUS_MAP.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(job)}
      className="glass-card rounded-2xl p-5 flex flex-col h-full group cursor-pointer border border-white/6 hover:border-primary/22 transition-all"
      style={{ willChange: "transform" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/8 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:border-primary/35 transition-all">
          <Briefcase size={20} className="text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
            <span className="text-[10px] text-muted-foreground/70 px-2 py-0.5 rounded-full bg-white/4 border border-white/6">{job.category}</span>
          </div>
          <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">{job.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-primary leading-none">R$ {(job.hourlyRate ?? 0).toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">/hora</p>
        </div>
      </div>

      {job.description && (
        <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-4 leading-relaxed">{job.description}</p>
      )}

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin size={11} className="text-primary flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-secondary flex-shrink-0" />
          <span className="truncate">{job.startTime}–{job.endTime}{hours ? ` (${hours.toFixed(0)}h)` : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase size={11} className="flex-shrink-0 opacity-60" />
          <span className="truncate">{job.date ? format(new Date(job.date), "dd MMM", { locale: ptBR }) : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={11} className="flex-shrink-0 opacity-60" />
          <span>{job.workersApproved}/{job.workersNeeded} vagas</span>
        </div>
      </div>

      {hours && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-primary/6 border border-primary/12 group-hover:border-primary/20 transition-all"
        >
          <DollarSign size={13} className="text-primary flex-shrink-0" />
          <span className="text-xs font-bold text-primary">Total estimado: R$ {((job.hourlyRate ?? 0) * hours).toFixed(2)}</span>
        </motion.div>
      )}

      <div className="mt-auto">
        <Button
          size="sm"
          className="w-full bg-primary/8 border border-primary/20 text-primary hover:bg-primary hover:text-black font-bold rounded-xl h-10 text-xs transition-all group-hover:bg-primary group-hover:text-black"
        >
          {isCompany ? "Ver detalhes" : "Candidatar-se"} →
        </Button>
      </div>
    </motion.div>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs = [], isLoading } = useListJobs({
    status: user?.role === "company" ? undefined : "open",
    category: category !== "Todos" ? category : undefined,
  });

  const applyMutation = useApplyToJob();

  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async (jobId: number) => {
    await applyMutation.mutateAsync({ data: { jobId, message: "Tenho interesse nessa vaga e acredito que minhas habilidades se encaixam perfeitamente." } });
    toast.success("Candidatura enviada!");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
      <PageHeader
        title={user?.role === "company" ? "Minhas Vagas" : "Buscar Vagas"}
        subtitle={`${filtered.length} vaga${filtered.length !== 1 ? "s" : ""} encontrada${filtered.length !== 1 ? "s" : ""}`}
        action={
          user?.role === "company" ? (
            <Link href="/app/jobs/new">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl text-sm px-4 h-10 gap-1.5">
                  <Star size={14} /> Publicar Vaga
                </Button>
              </motion.div>
            </Link>
          ) : undefined
        }
      />

      {/* Search + filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por título ou local..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-10 bg-white/4 border-white/10 focus:border-primary/50 h-11 rounded-xl text-sm transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 px-4 rounded-xl border-white/10 text-sm gap-2 flex-shrink-0 transition-all ${showFilters ? "border-primary/40 text-primary bg-primary/8" : "hover:border-white/25"}`}
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filtros</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-4 glass-card rounded-xl border border-white/6">
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      category === cat
                        ? "bg-primary text-black border-primary neon-glow"
                        : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="Nenhuma vaga encontrada"
          description="Tente outros filtros ou termos de busca."
          actionLabel={user?.role === "company" ? "Publicar Vaga" : undefined}
          actionHref="/app/jobs/new"
        />
      )}

      {/* Job cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((job, i) => (
          <JobCard
            key={job.id}
            job={job}
            onClick={setSelectedJob}
            isCompany={user?.role === "company"}
            index={i}
          />
        ))}
      </div>

      <JobDetailSheet
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={user?.role !== "company" ? handleApply : undefined}
        isCompany={user?.role === "company"}
      />
    </div>
  );
}
