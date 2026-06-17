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

  const isOpen = (job.status ?? "open") === "open";
  const accentColor = isOpen ? "rgba(139,92,246,0.22)" : (job.status === "completed") ? "rgba(34,197,94,0.15)" : (job.status === "cancelled") ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.15)";
  const stripeColor = isOpen ? "rgba(139,92,246,0.5)" : (job.status === "completed") ? "rgba(34,197,94,0.45)" : (job.status === "cancelled") ? "rgba(239,68,68,0.35)" : "rgba(59,130,246,0.4)";

  return (
    <div className="rounded-xl p-4 space-y-2 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.055) 0%, rgba(8,17,26,0.90) 60%, rgba(59,130,246,0.025) 100%)",
        border: `1px solid ${accentColor}`,
      }}
    >
      {/* Top accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${stripeColor}, transparent)` }} />
      {/* Extras marketplace watermark */}
      <div className="absolute right-2 bottom-1 pointer-events-none select-none opacity-[0.055]">
        <svg width="44" height="40" viewBox="0 0 44 40" fill="none">
          <rect x="2" y="12" width="40" height="26" rx="4" stroke="#8b5cf6" strokeWidth="1.8"/>
          <path d="M14 12v-3a4 4 0 014-4h8a4 4 0 014 4v3" stroke="#8b5cf6" strokeWidth="1.8"/>
          <line x1="2" y1="22" x2="42" y2="22" stroke="#8b5cf6" strokeWidth="1.4"/>
        </svg>
      </div>
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{job.title}</p>
          <p className="text-xs text-white/70 mt-0.5">{job.category}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[job.status ?? "open"]}`}>
          {statusLabels[job.status ?? "open"]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs text-white/70 relative">
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
        <h1 className="text-[22px] font-bold neon-text-gradient">Gerenciar Extras</h1>
        <p className="text-white/70 mt-1">{filtered.length} extra{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
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
          <Briefcase size={40} className="text-white/60 mx-auto mb-3" />
          <p className="text-white/70">Nenhum extra encontrado</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map(job => <JobRow key={job.id} job={job} />)}
      </div>
    </div>
  );
}
