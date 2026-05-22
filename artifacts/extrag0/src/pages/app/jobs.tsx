import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListJobs, useApplyToJob } from "@workspace/api-client-react";
import type { Job } from "@workspace/api-client-react";
import { Search, MapPin, Clock, DollarSign, Users, Briefcase, Filter, X, ChevronDown, ExternalLink, Star } from "lucide-react";
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
import { motion } from "framer-motion";

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
        className="w-full sm:max-w-md bg-[#0A0C0F] border-white/8 p-0 overflow-y-auto"
      >
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/5 border-b border-white/6 p-6 pt-10">
          <SheetHeader className="text-left mb-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
              <span className="text-[10px] text-muted-foreground px-2.5 py-1 rounded-full bg-white/5 border border-white/8">{job.category}</span>
            </div>
            <SheetTitle className="text-lg font-bold leading-snug text-left">{job.title}</SheetTitle>
          </SheetHeader>

          <div className="flex items-end gap-3">
            <div>
              <p className="text-4xl font-bold text-primary leading-none">R$ {(job.hourlyRate ?? 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-1">/hora</p>
            </div>
            {total && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-xl font-bold text-secondary leading-none">R$ {total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">total ({hours?.toFixed(0)}h)</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <MapPin size={14} className="text-primary" />, label: "Local", value: job.location },
              { icon: <Clock size={14} className="text-secondary" />, label: "Horário", value: `${job.startTime}–${job.endTime}` },
              { icon: <Briefcase size={14} className="text-muted-foreground" />, label: "Data", value: job.date ? format(new Date(job.date), "dd MMM yyyy", { locale: ptBR }) : "—" },
              { icon: <Users size={14} className="text-muted-foreground" />, label: "Vagas", value: `${job.workersApproved}/${job.workersNeeded}` },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/6">
                <div className="flex items-center gap-1.5 mb-1.5">{item.icon}<span className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{item.label}</span></div>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Descrição</p>
              <p className="text-sm leading-relaxed text-foreground/80">{job.description}</p>
            </div>
          )}

          {/* Requirements */}
          {(job as any).requirements && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Requisitos</p>
              <p className="text-sm leading-relaxed text-foreground/80">{(job as any).requirements}</p>
            </div>
          )}

          {/* Earnings breakdown */}
          {total && (
            <div className="p-4 rounded-xl bg-primary/6 border border-primary/12 space-y-2.5">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">Estimativa de Ganhos</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Valor/hora</span><span className="font-semibold">R$ {(job.hourlyRate ?? 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horas</span><span className="font-semibold">{hours?.toFixed(1)}h</span></div>
                <div className="h-px bg-white/6 my-1" />
                <div className="flex justify-between"><span className="text-muted-foreground font-medium">Total líquido</span><span className="font-bold text-primary text-sm">R$ {total.toFixed(2)}</span></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            {isCompany ? (
              <Link href={`/app/jobs/${job.id}`} onClick={onClose}>
                <Button className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-12">
                  Gerenciar Vaga <ExternalLink size={14} className="ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-12 text-sm"
                onClick={handleApply}
                disabled={applying || job.status !== "open"}
              >
                {applying ? "Enviando candidatura..." : "Candidatar-se agora"}
              </Button>
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

function JobCard({ job, onClick, isCompany }: { job: Job; onClick: (job: Job) => void; isCompany?: boolean }) {
  const hours = getHours(job.startTime, job.endTime);
  const statusInfo = STATUS_MAP[job.status ?? "open"] ?? STATUS_MAP.open;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
      onClick={() => onClick(job)}
      className="glass-card card-hover rounded-2xl p-5 flex flex-col h-full group cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Briefcase size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/8">{job.category}</span>
          </div>
          <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">{job.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-primary leading-none">R$ {(job.hourlyRate ?? 0).toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">/hora</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-shrink-0">{job.description}</p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-primary flex-shrink-0" /><span className="truncate">{job.location}</span></div>
        <div className="flex items-center gap-1.5"><Clock size={12} className="text-secondary flex-shrink-0" /><span className="truncate">{job.startTime}–{job.endTime}{hours ? ` (${hours.toFixed(0)}h)` : ""}</span></div>
        <div className="flex items-center gap-1.5"><Briefcase size={12} className="flex-shrink-0" /><span className="truncate">{job.date ? format(new Date(job.date), "dd MMM", { locale: ptBR }) : ""}</span></div>
        <div className="flex items-center gap-1.5"><Users size={12} className="flex-shrink-0" /><span>{job.workersApproved}/{job.workersNeeded} vagas</span></div>
      </div>

      {hours && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-primary/6 border border-primary/12">
          <DollarSign size={13} className="text-primary flex-shrink-0" />
          <span className="text-xs font-bold text-primary">Total estimado: R$ {((job.hourlyRate ?? 0) * hours).toFixed(2)}</span>
        </div>
      )}

      <div className="mt-auto pt-1">
        <Button
          size="sm"
          className="w-full bg-primary/10 border border-primary/25 text-primary hover:bg-primary hover:text-black font-bold rounded-xl h-9 text-xs transition-all group-hover:bg-primary group-hover:text-black"
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
              <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl text-sm px-4 h-9">
                + Publicar Vaga
              </Button>
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
              className="pl-9 pr-10 bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 px-4 rounded-xl border-white/10 text-sm gap-2 flex-shrink-0 ${showFilters ? "border-primary/40 text-primary bg-primary/8" : "hover:border-white/25"}`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filtros</span>
            <ChevronDown size={13} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap gap-2 p-4 glass-card rounded-xl"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  category === cat
                    ? "bg-primary text-black border-primary neon-glow"
                    : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="Nenhuma vaga encontrada"
          description="Tente outros filtros ou termos de busca."
          actionLabel={user?.role === "company" ? "Publicar Vaga" : undefined}
          actionHref="/app/jobs/new"
        />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onClick={setSelectedJob}
            isCompany={user?.role === "company"}
          />
        ))}
      </div>

      {/* Job detail sheet */}
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
