import React, { useState } from "react";
import { useAdminListJobs } from "@workspace/api-client-react";
import type { Job } from "@workspace/api-client-react";
import { Briefcase, Search, MapPin, Clock, Users, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_TABS = ["Todos", "Abertas", "Em Andamento", "Concluídas", "Canceladas"];
const STATUS_MAP: Record<string, string> = {
  "Abertas": "open",
  "Em Andamento": "in_progress",
  "Concluídas": "completed",
  "Canceladas": "cancelled",
};

function JobRow({ job }: { job: Job }) {
  const statusColors: Record<string, string> = {
    open: "text-primary bg-primary/10 border-primary/20",
    in_progress: "text-secondary bg-secondary/10 border-secondary/20",
    completed: "text-green-400 bg-green-400/10 border-green-400/20",
    cancelled: "text-destructive bg-destructive/10 border-destructive/20",
  };
  const statusLabels: Record<string, string> = {
    open: "Aberta", in_progress: "Em andamento", completed: "Concluída", cancelled: "Cancelada",
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{job.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{job.category}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[job.status ?? "open"]}`}>
          {statusLabels[job.status ?? "open"]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
        <span className="flex items-center gap-1"><Clock size={11} /> {job.date ? format(new Date(job.date), "dd/MM/yyyy", { locale: ptBR }) : ""}</span>
        <span className="flex items-center gap-1"><Users size={11} /> {job.workersApproved}/{job.workersNeeded} contratados</span>
        <span className="flex items-center gap-1"><DollarSign size={11} /> R$ {(job.hourlyRate ?? 0).toFixed(2)}/h</span>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("Todos");

  const { data: jobs = [], isLoading } = useAdminListJobs({
    status: statusTab !== "Todos" ? STATUS_MAP[statusTab] : undefined,
  });

  const filtered = jobs.filter(j =>
    !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="text-[22px] font-bold">Gerenciar Extras</h1>
        <p className="text-muted-foreground mt-1">{filtered.length} extra{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-primary h-11 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
          {STATUS_TABS.map(t => (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusTab === t ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Briefcase size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum extra encontrado</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map(job => <JobRow key={job.id} job={job} />)}
      </div>
    </div>
  );
}
