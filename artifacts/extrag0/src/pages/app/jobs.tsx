import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListJobs, useApplyToJob } from "@workspace/api-client-react";
import type { Job } from "@workspace/api-client-react";
import { Search, MapPin, Clock, DollarSign, Users, Briefcase, Filter, X, ChevronDown, ExternalLink, Star, Zap, Timer, CheckCircle2, LocateFixed, Loader2, Radio } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonCard } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import jobsBanner from "@assets/file_00000000311071f98244eb8a979d0597_1779868067126.png";

import { CATEGORY_NAMES } from "@/lib/categories";
const CATEGORIES = ["Todos", ...CATEGORY_NAMES];

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

type LiveStatus = "happening" | "soon" | "finished" | "normal";

function getLiveStatus(job: Job): LiveStatus {
  if (!job.date || !job.startTime || !job.endTime) return "normal";
  if (job.status === "completed" || job.status === "cancelled") return "finished";
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const jobDate = job.date.slice(0, 10);
  if (jobDate !== todayStr) {
    if (jobDate < todayStr) return "finished";
    return "normal";
  }
  const [sh, sm] = job.startTime.split(":").map(Number);
  const [eh, em] = job.endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes >= startMinutes && nowMinutes < endMinutes) return "happening";
  if (nowMinutes < startMinutes && startMinutes - nowMinutes <= 120) return "soon";
  if (nowMinutes >= endMinutes) return "finished";
  return "normal";
}

function useCountdown(job: Job): string {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const compute = () => {
      if (!job.date || !job.startTime) { setCountdown(""); return; }
      const now = new Date();
      const jobDate = job.date.slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      if (jobDate !== todayStr) { setCountdown(""); return; }
      const [sh, sm] = job.startTime.split(":").map(Number);
      const startMs = new Date().setHours(sh, sm, 0, 0);
      const diffMs = startMs - Date.now();
      if (diffMs <= 0) { setCountdown(""); return; }
      const totalSec = Math.floor(diffMs / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      if (h > 0) setCountdown(`${h}h ${m}m`);
      else if (m > 0) setCountdown(`${m}m ${s}s`);
      else setCountdown(`${s}s`);
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [job.date, job.startTime]);
  return countdown;
}

function LiveStatusBadge({ job, size = "sm" }: { job: Job; size?: "sm" | "md" }) {
  const liveStatus = getLiveStatus(job);
  const countdown = useCountdown(job);
  if (liveStatus === "normal") return null;
  if (liveStatus === "happening") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-full border ${size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"} bg-green-500/15 text-green-400 border-green-500/30`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
        Acontecendo Agora
      </span>
    );
  }
  if (liveStatus === "soon") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-full border ${size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"} bg-amber-500/15 text-amber-400 border-amber-500/30`}>
        <Timer size={size === "md" ? 12 : 10} />
        {countdown ? `Começa em ${countdown}` : "Começando em Breve"}
      </span>
    );
  }
  if (liveStatus === "finished") {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"} bg-white/5 text-muted-foreground border-white/10`}>
        <CheckCircle2 size={size === "md" ? 12 : 10} />
        Finalizado
      </span>
    );
  }
  return null;
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
  const liveStatus = getLiveStatus(job);

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
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#080A0D] border-white/8 p-0 overflow-y-auto">
        <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border-b border-white/6 p-6 pt-12 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08]" />
          <SheetHeader className="text-left mb-5 relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
              <span className="text-[10px] text-muted-foreground px-2.5 py-1 rounded-full bg-white/5 border border-white/8">{job.category}</span>
              <LiveStatusBadge job={job} size="sm" />
            </div>
            <SheetTitle className="text-xl font-bold leading-snug text-left">{job.title}</SheetTitle>
          </SheetHeader>
          {liveStatus === "happening" && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <Zap size={14} className="text-green-400 flex-shrink-0" />
              <p className="text-xs text-green-400 font-semibold">Este evento está acontecendo agora mesmo!</p>
            </div>
          )}
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
          {job.description && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Descrição</p>
              <p className="text-sm leading-relaxed text-foreground/80">{job.description}</p>
            </div>
          )}
          {(job as any).requirements && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Requisitos</p>
              <p className="text-sm leading-relaxed text-foreground/80">{(job as any).requirements}</p>
            </div>
          )}
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
                  disabled={applying || job.status !== "open" || liveStatus === "finished"}
                >
                  {applying ? "Enviando candidatura..." : liveStatus === "finished" ? "Vaga encerrada" : "Candidatar-se agora"}
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
  const liveStatus = getLiveStatus(job);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.19, 1, 0.22, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(job)}
      className={`glass-card card-hover rounded-2xl p-5 flex flex-col h-full group cursor-pointer border transition-all relative overflow-hidden ${
        liveStatus === "happening" ? "border-green-500/25" :
        liveStatus === "soon" ? "border-amber-500/20" :
        "border-white/6 hover:border-primary/20"
      }`}
      style={{ willChange: "transform" }}
    >
      {liveStatus === "happening" && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent" />
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-all ${
          liveStatus === "happening" ? "bg-green-500/10 border-green-500/20" :
          liveStatus === "soon" ? "bg-amber-500/10 border-amber-500/20" :
          "bg-gradient-to-br from-primary/12 to-secondary/6 border-primary/18 group-hover:border-primary/32"
        }`}>
          {liveStatus === "happening" ? <Zap size={20} className="text-green-400 animate-pulse" /> :
           liveStatus === "soon" ? <Timer size={20} className="text-amber-400" /> :
           <Briefcase size={20} className="text-primary group-hover:scale-110 transition-transform" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.class}`}>{statusInfo.label}</span>
            <span className="text-[10px] text-muted-foreground/65 px-2 py-0.5 rounded-full bg-white/4 border border-white/5">{job.category}</span>
          </div>
          <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">{job.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-primary leading-none">R$ {(job.hourlyRate ?? 0).toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">/hora</p>
        </div>
      </div>

      {liveStatus !== "normal" && (
        <div className="mb-3">
          <LiveStatusBadge job={job} size="sm" />
        </div>
      )}

      {job.description && (
        <p className="text-xs text-muted-foreground/75 line-clamp-2 mb-4 leading-relaxed flex-shrink-0">{job.description}</p>
      )}

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
          <Briefcase size={11} className="flex-shrink-0 opacity-55" />
          <span className="truncate">{job.date ? format(new Date(job.date), "dd MMM", { locale: ptBR }) : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={11} className="flex-shrink-0 opacity-55" />
          <span>{job.workersApproved}/{job.workersNeeded} vagas</span>
        </div>
      </div>

      {hours && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10 group-hover:border-primary/18 transition-all"
        >
          <DollarSign size={13} className="text-primary flex-shrink-0" />
          <span className="text-xs font-bold text-primary">Total estimado: R$ {((job.hourlyRate ?? 0) * hours).toFixed(2)}</span>
        </motion.div>
      )}

      <div className="mt-auto">
        <Button
          size="sm"
          className="w-full bg-primary/8 border border-primary/18 text-primary hover:bg-primary hover:text-black font-bold rounded-xl h-10 text-xs transition-all group-hover:bg-primary group-hover:text-black"
        >
          {isCompany ? "Ver detalhes" : "Candidatar-se"} →
        </Button>
      </div>
    </motion.div>
  );
}

const POPULAR_CITIES = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba",
  "Porto Alegre", "Salvador", "Brasília", "Fortaleza", "Recife", "Campinas",
];

const RADIUS_OPTIONS = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "25 km", value: 25 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
  { label: "Qualquer", value: 9999 },
];

export default function JobsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [radius, setRadius] = useState(9999);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const { data: jobs = [], isLoading } = useListJobs({
    status: user?.role === "company" ? undefined : "open",
    category: category !== "Todos" ? category : undefined,
  }, {
    query: {
      queryKey: ["jobs-list", category, user?.role],
      refetchInterval: 10000,
      refetchIntervalInBackground: false,
    },
  });

  const applyMutation = useApplyToJob();

  const handleGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste dispositivo.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.municipality ||
            data?.address?.county ||
            "";
          if (city) {
            setCityFilter(city);
            setCityInput(city);
            toast.success(`Localização detectada: ${city}`);
          } else {
            toast.error("Não foi possível identificar sua cidade.");
          }
        } catch {
          toast.error("Erro ao buscar localização.");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        toast.error("Permissão de localização negada.");
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const handleClearCity = useCallback(() => {
    setCityFilter("");
    setCityInput("");
    setRadius(9999);
    setShowCitySuggestions(false);
  }, []);

  const filtered = jobs.filter((j: Job) => {
    const q = search.toLowerCase();
    const matchesSearch = !search || j.title?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
    const cityQ = cityFilter.toLowerCase();
    const matchesCity = !cityFilter || (
      j.city?.toLowerCase().includes(cityQ) ||
      j.location?.toLowerCase().includes(cityQ) ||
      j.title?.toLowerCase().includes(cityQ)
    );
    return matchesSearch && matchesCity;
  });

  const citySuggestions = cityInput.trim().length > 0
    ? POPULAR_CITIES.filter(c => c.toLowerCase().includes(cityInput.toLowerCase()) && c.toLowerCase() !== cityFilter.toLowerCase())
    : POPULAR_CITIES.filter(c => c.toLowerCase() !== cityFilter.toLowerCase()).slice(0, 6);

  const handleApply = async (jobId: number) => {
    await applyMutation.mutateAsync({ data: { jobId, message: "Tenho interesse nessa vaga e acredito que minhas habilidades se encaixam perfeitamente." } });
    toast.success("Candidatura enviada!");
  };

  return (
    <div className="page-enter pb-20 lg:pb-6 relative">
      {/* ── Full-page background art ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/backgrounds/bg-jobs.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.09,
          mixBlendMode: "screen",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/60 via-transparent to-[#070a0d]/50 pointer-events-none" />
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full overflow-hidden"
        style={{ borderRadius: "0 0 20px 20px" }}
      >
        <img
          src={jobsBanner}
          alt="Buscar Vagas extraGO"
          className="w-full object-cover"
          style={{ maxHeight: 170, objectPosition: "center center" }}
        />
        {/* bg-jobs.webp — city map / discovery art layer */}
        <div
          className="absolute inset-0 opacity-[0.30] bg-cover bg-right mix-blend-screen pointer-events-none"
          style={{ backgroundImage: "url(/images/backgrounds/bg-jobs.webp)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,10,13,0) 0%, rgba(7,10,13,0.2) 60%, rgba(7,10,13,0.88) 100%)" }}
        />
      </motion.div>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5">
        {/* Page title + action */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {user?.role === "company" ? "Minhas Vagas" : "Buscar Vagas"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="text-primary font-semibold">{filtered.length}</span> vaga{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          {user?.role === "company" && (
            <Link href="/app/jobs/new">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button className="bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl text-sm px-4 h-10 gap-1.5">
                  <Star size={14} /> Publicar Vaga
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>

        {/* Search + filter bar */}
        <div className="space-y-3">
          {/* Row 1: search + filter toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar por título ou cargo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-10 bg-white/4 border-white/8 focus:border-primary/50 h-11 rounded-xl text-sm transition-all"
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
                className={`h-11 px-4 rounded-xl border-white/8 text-sm gap-2 flex-shrink-0 transition-all ${showFilters ? "border-primary/40 text-primary bg-primary/8" : "hover:border-white/22"}`}
              >
                <Filter size={14} />
                <span className="hidden sm:inline">Filtros</span>
                {(category !== "Todos" || cityFilter) && (
                  <span className="w-4 h-4 rounded-full bg-primary text-black text-[9px] font-bold flex items-center justify-center">
                    {(category !== "Todos" ? 1 : 0) + (cityFilter ? 1 : 0)}
                  </span>
                )}
                <ChevronDown size={13} className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </motion.div>
          </div>

          {/* Row 2: Location filter bar */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/60 pointer-events-none flex-shrink-0" />
              <Input
                placeholder="Filtrar por cidade (ex: São Paulo)"
                value={cityInput}
                onChange={e => {
                  setCityInput(e.target.value);
                  setShowCitySuggestions(true);
                  if (!e.target.value.trim()) { setCityFilter(""); }
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    setCityFilter(cityInput.trim());
                    setShowCitySuggestions(false);
                  }
                  if (e.key === "Escape") {
                    setShowCitySuggestions(false);
                  }
                }}
                className={`pl-9 pr-8 bg-white/4 h-10 rounded-xl text-sm transition-all ${
                  cityFilter ? "border-secondary/40 bg-secondary/5 text-foreground" : "border-white/8 focus:border-secondary/40"
                }`}
              />
              {cityFilter && (
                <button
                  onClick={handleClearCity}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={13} />
                </button>
              )}

              {/* City suggestions dropdown */}
              <AnimatePresence>
                {showCitySuggestions && citySuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-xl border border-white/10 overflow-hidden shadow-2xl"
                    style={{ background: "rgba(8,14,22,0.97)", backdropFilter: "blur(24px)" }}
                  >
                    {citySuggestions.slice(0, 6).map((city) => (
                      <button
                        key={city}
                        onMouseDown={() => {
                          setCityFilter(city);
                          setCityInput(city);
                          setShowCitySuggestions(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 hover:bg-white/6 transition-all text-left text-sm"
                      >
                        <MapPin size={12} className="text-secondary/60 flex-shrink-0" />
                        <span className="font-medium">{city}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GPS button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleGPS}
              disabled={gpsLoading}
              title="Detectar localização"
              className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${
                cityFilter
                  ? "border-secondary/40 bg-secondary/10 text-secondary"
                  : "border-white/8 text-muted-foreground hover:text-secondary hover:border-secondary/30 hover:bg-secondary/6"
              }`}
            >
              {gpsLoading ? <Loader2 size={15} className="animate-spin" /> : <LocateFixed size={15} />}
            </motion.button>
          </div>

          {/* Active city + radius chips */}
          <AnimatePresence>
            {cityFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/25 text-xs font-bold text-secondary">
                    <MapPin size={11} />
                    {cityFilter}
                    <button onClick={handleClearCity} className="ml-1 hover:text-white transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mr-1">
                    <Radio size={10} /> Raio:
                  </div>
                  {RADIUS_OPTIONS.map(opt => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setRadius(opt.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                        radius === opt.value
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : "border-white/8 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <p className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Categoria</p>
                  {CATEGORIES.map(cat => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        category === cat
                          ? "bg-primary text-black border-primary neon-glow"
                          : "border-white/8 text-muted-foreground hover:border-white/22 hover:text-foreground"
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

        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="glass-card rounded-2xl">
            <EmptyState
              icon={<Briefcase size={28} />}
              title="Nenhuma vaga encontrada"
              description="Tente outros filtros ou termos de busca para encontrar oportunidades."
            />
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((job: Job, i: number) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={setSelectedJob}
                isCompany={user?.role === "company"}
                index={i}
              />
            ))}
          </div>
        )}
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
