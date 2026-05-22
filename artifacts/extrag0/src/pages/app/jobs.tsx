import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListJobs, useApplyToJob } from "@workspace/api-client-react";
import type { Job } from "@workspace/api-client-react";
import { Search, MapPin, Clock, DollarSign, Users, Briefcase, Filter, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const CATEGORIES = ["Todos", "Garçom", "Barman", "Recepcionista", "Hostess", "Chef de Cozinha", "Cumim", "Auxiliar de Eventos", "Segurança", "Promoter"];

function JobCard({ job, onApply, isCompany }: { job: Job; onApply?: (id: number) => void; isCompany?: boolean }) {
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!onApply) return;
    setApplying(true);
    try {
      await onApply(job.id!);
      toast.success("Candidatura enviada com sucesso!");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao se candidatar");
    } finally {
      setApplying(false);
    }
  };

  const statusMap: Record<string, { label: string; class: string }> = {
    open: { label: "Aberta", class: "bg-primary/20 text-primary border-primary/30" },
    in_progress: { label: "Em andamento", class: "bg-secondary/20 text-secondary border-secondary/30" },
    completed: { label: "Concluída", class: "bg-green-500/20 text-green-400 border-green-500/30" },
    cancelled: { label: "Cancelada", class: "bg-destructive/20 text-destructive border-destructive/30" },
  };
  const statusInfo = statusMap[job.status ?? "open"] ?? statusMap.open;

  const hoursWorked = job.startTime && job.endTime ? (() => {
    const [sh, sm] = job.startTime.split(":").map(Number);
    const [eh, em] = job.endTime.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? diff / 60 : (24 * 60 + diff) / 60;
  })() : null;

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{job.category}</span>
          </div>
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">{job.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-bold text-primary">R$ {((job.hourlyRate ?? 0)).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">/hora</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="text-primary flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-secondary flex-shrink-0" />
          <span>{job.startTime} – {job.endTime}{hoursWorked ? ` (${hoursWorked.toFixed(0)}h)` : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase size={13} className="flex-shrink-0" />
          <span>{job.date ? format(new Date(job.date), "dd 'de' MMMM", { locale: ptBR }) : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={13} className="flex-shrink-0" />
          <span>{job.workersApproved}/{job.workersNeeded} vagas</span>
        </div>
      </div>

      {hoursWorked && (
        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <DollarSign size={14} className="text-primary" />
          <span className="text-sm font-semibold text-primary">
            Total estimado: R$ {((job.hourlyRate ?? 0) * hoursWorked).toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        {isCompany ? (
          <Link href={`/app/jobs/${job.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full border-white/10 hover:border-primary/50">
              Gerenciar
            </Button>
          </Link>
        ) : (
          <>
            <Button
              size="sm"
              className="flex-1 bg-primary text-black hover:bg-primary/90 font-semibold neon-glow"
              onClick={handleApply}
              disabled={applying || job.status !== "open"}
            >
              {applying ? "Enviando..." : "Candidatar-se"}
            </Button>
            <Link href={`/app/jobs/${job.id}`}>
              <Button variant="outline" size="sm" className="border-white/10 hover:border-white/30">
                Ver mais
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

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
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {user?.role === "company" ? "Minhas Vagas" : "Buscar Vagas"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} vaga{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        {user?.role === "company" && (
          <Link href="/app/jobs/new">
            <Button className="bg-primary text-black hover:bg-primary/90 neon-glow font-semibold">
              + Publicar Vaga
            </Button>
          </Link>
        )}
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou local..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-primary h-11 rounded-xl"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={15} className="mr-1" />
            Filtros
            <ChevronDown size={14} className={`ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  category === cat
                    ? "bg-primary text-black border-primary neon-glow"
                    : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card rounded-2xl h-52 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Briefcase size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">Nenhuma vaga encontrada</p>
          <p className="text-muted-foreground mt-1">Tente outros filtros ou termos de busca</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onApply={user?.role !== "company" ? handleApply : undefined}
            isCompany={user?.role === "company"}
          />
        ))}
      </div>
    </div>
  );
}
