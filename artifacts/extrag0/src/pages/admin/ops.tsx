import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OpsData {
  timestamp: string;
  totalUsers: number;
  openJobs: number;
  jobsInProgress: number;
  pendingWithdrawals: number;
  pendingWithdrawalsAmount: number;
  todayPayments: number;
  todayWithdrawals: number;
  newUsersToday: number;
  appsToday: number;
  approvedToday: number;
}

interface ServiceLatency {
  name: string;
  latency: number | null;
  status: "online" | "slow" | "offline" | "manual";
}

const BRAZIL_NODES = [
  { sigla: "SP", name: "São Paulo",         primary: true },
  { sigla: "RJ", name: "Rio de Janeiro",    primary: true },
  { sigla: "MG", name: "Minas Gerais",      primary: true },
  { sigla: "PR", name: "Paraná",            primary: true },
  { sigla: "RS", name: "Rio Grande do Sul", primary: false },
  { sigla: "BA", name: "Bahia",             primary: false },
  { sigla: "SC", name: "Santa Catarina",    primary: false },
  { sigla: "PE", name: "Pernambuco",        primary: false },
  { sigla: "CE", name: "Ceará",             primary: false },
  { sigla: "GO", name: "Goiás",             primary: false },
  { sigla: "AM", name: "Amazonas",          primary: false },
  { sigla: "DF", name: "Brasília",          primary: false },
  { sigla: "PA", name: "Pará",              primary: false },
  { sigla: "ES", name: "Espírito Santo",    primary: false },
  { sigla: "MT", name: "Mato Grosso",       primary: false },
  { sigla: "MS", name: "Mato Grosso do Sul", primary: false },
];

export default function AdminOpsPage() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [latencies, setLatencies] = useState<Record<string, ServiceLatency>>({
    api:      { name: "API",  latency: null, status: "online" },
    db:       { name: "DB",   latency: null, status: "online" },
    sse:      { name: "SSE",  latency: null, status: "online" },
    payments: { name: "PIX",  latency: null, status: "manual" },
  });

  const fetchOps = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const result = await apiFetch("/api/admin/ops");
      setData(result);
      setLastUpdate(new Date());
    } catch { /* noop */ }
    finally { setRefreshing(false); setLoading(false); }
  };

  const measureLatencies = async () => {
    const ping = async (key: string, endpoint: string) => {
      const start = performance.now();
      try {
        await apiFetch(endpoint);
        const ms = Math.round(performance.now() - start);
        setLatencies(prev => ({
          ...prev,
          [key]: { ...prev[key], latency: ms, status: ms < 300 ? "online" : ms < 800 ? "slow" : "offline" },
        }));
      } catch {
        setLatencies(prev => ({ ...prev, [key]: { ...prev[key], latency: null, status: "offline" } }));
      }
    };
    await Promise.allSettled([ping("api", "/api/admin/ops"), ping("db", "/api/admin/analytics")]);
    setLatencies(prev => ({
      ...prev,
      sse:      { ...prev.sse,      latency: null, status: "online" },
      payments: { ...prev.payments, latency: null, status: "manual" },
    }));
  };

  useEffect(() => {
    fetchOps();
    measureLatencies();
    const interval        = setInterval(() => fetchOps(true), 10_000);
    const latencyInterval = setInterval(measureLatencies, 30_000);
    return () => { clearInterval(interval); clearInterval(latencyInterval); };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-5 font-mono">
        <div className="h-12 rounded-xl bg-white/4 animate-pulse" />
        <div className="h-16 rounded-xl bg-white/3 animate-pulse" />
        <div className="h-56 rounded-xl bg-white/3 animate-pulse" />
        <div className="h-10 rounded-xl bg-white/2 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-64 font-mono">
        <AlertTriangle size={36} className="text-yellow-400/60" />
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest">SISTEMA OFFLINE</p>
          <p className="text-xs text-muted-foreground mt-1">Conexão com o servidor perdida</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchOps(); }}
          className="text-xs text-primary border border-primary/30 rounded-xl px-4 py-2 hover:bg-primary/8 transition-all tracking-widest"
        >
          RECONECTAR
        </button>
      </div>
    );
  }

  const healthScore = Math.max(0, 100 - (data.pendingWithdrawals > 10 ? 15 : 0) - (data.openJobs === 0 ? 10 : 0));
  const healthLabel = healthScore >= 80 ? "OPERACIONAL" : healthScore >= 60 ? "ATENÇÃO" : "CRÍTICO";
  const healthColor = healthScore >= 80 ? "text-green-400" : healthScore >= 60 ? "text-yellow-400" : "text-destructive";
  const healthDot   = healthScore >= 80 ? "bg-green-400" : healthScore >= 60 ? "bg-yellow-400" : "bg-destructive";

  const METRICS = [
    { label: "EXTRAS ATIVOS",    value: data.openJobs,                                          color: "text-primary" },
    { label: "EM ANDAMENTO",     value: data.jobsInProgress,                                    color: "text-secondary" },
    { label: "NOVOS HOJE",       value: data.newUsersToday,                                     color: "text-cyan-400" },
    { label: "CANDIDATURAS",     value: data.appsToday,                                         color: "text-yellow-400" },
    { label: "APROVADOS",        value: data.approvedToday,                                     color: "text-green-400" },
    { label: "SAQUES PEND.",     value: data.pendingWithdrawals,                                color: data.pendingWithdrawals > 5 ? "text-destructive" : "text-muted-foreground" },
    { label: "PAGAMENTOS HOJE",  value: `R$${(data.todayPayments / 100).toFixed(0)}`,           color: "text-green-400" },
    { label: "PROFISSIONAIS",    value: data.totalUsers.toLocaleString("pt-BR"),                color: "text-foreground" },
  ];

  return (
    <div className="pb-20 lg:pb-6" style={{ fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace" }}>

      {/* ══════════════════════════════════
          SISTEMA NACIONAL — sticky header
      ══════════════════════════════════ */}
      <div
        className="sticky top-0 z-20 border-b border-white/6 px-4 sm:px-6 py-3 flex items-center justify-between"
        style={{ background: "rgba(6,8,9,0.97)", backdropFilter: "blur(24px)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${healthDot} animate-pulse`} />
            <span className={`text-[10px] font-bold tracking-widest ${healthColor}`}>{healthLabel}</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-white/10" />
          <span className="text-[11px] font-bold tracking-widest text-white/70 truncate hidden sm:block">
            SISTEMA NACIONAL · EXTRAG0
          </span>
          {lastUpdate && (
            <>
              <span className="hidden md:block w-px h-4 bg-white/10" />
              <span className="text-[10px] text-muted-foreground/50 hidden md:block">
                {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}
              </span>
            </>
          )}
        </div>
        <button
          onClick={() => fetchOps()}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary border border-white/8 hover:border-primary/30 rounded-lg px-2.5 py-1.5 transition-all tracking-widest"
        >
          <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
          SYNC
        </button>
      </div>

      <div className="px-4 sm:px-6 max-w-6xl mx-auto">

        {/* ══════════════════════════════════
            FLUXO OPERACIONAL
        ══════════════════════════════════ */}
        <div className="py-6 border-b border-white/5">
          <p className="text-[9px] text-muted-foreground/40 tracking-[0.25em] uppercase font-bold mb-5">
            Fluxo Operacional · atualiza 10s
          </p>
          <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
            <div className="grid grid-cols-4 lg:grid-cols-8 divide-x divide-white/5 min-w-[520px]">
              {METRICS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035 }}
                  className="px-3 py-2 first:pl-0"
                >
                  <p className="text-[8px] text-muted-foreground/40 tracking-[0.2em] mb-2 leading-none">{m.label}</p>
                  <p className={`text-2xl font-black tabular-nums leading-none ${m.color}`}>{m.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            REDE NACIONAL
        ══════════════════════════════════ */}
        <div className="py-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[9px] text-muted-foreground/40 tracking-[0.25em] uppercase font-bold">
              Rede Nacional · {BRAZIL_NODES.length} regiões
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-green-400/70 tracking-widest">COBERTURA NACIONAL</span>
            </div>
          </div>

          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-white/5">
              {BRAZIL_NODES.map((node) => (
                <div
                  key={node.sigla}
                  className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.040] transition-colors group"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all ${node.primary ? "bg-green-400 animate-pulse group-hover:shadow-[0_0_6px_rgba(74,222,128,0.8)]" : "bg-primary/50"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate leading-tight">{node.name}</p>
                    <p className={`text-[8px] tracking-[0.15em] mt-0.5 ${node.primary ? "text-green-400/60" : "text-primary/40"}`}>
                      {node.primary ? "NODO ATIVO" : "EXPANSÃO"}
                    </p>
                  </div>
                  <span className="text-[9px] text-muted-foreground/25 font-bold">{node.sigla}</span>
                </div>
              ))}
            </div>

            {/* Network health strip */}
            <div className="border-t border-white/5 px-4 py-3 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-white/4 overflow-hidden">
                <motion.div
                  animate={{ width: `${healthScore}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${healthScore >= 80 ? "bg-green-400" : healthScore >= 60 ? "bg-yellow-400" : "bg-destructive"}`}
                />
              </div>
              <span className={`text-[9px] font-bold tracking-widest flex-shrink-0 ${healthColor}`}>
                SAÚDE {healthScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            ALERTAS OPERACIONAIS
        ══════════════════════════════════ */}
        <AnimatePresence>
          {(data.pendingWithdrawals > 5 || data.openJobs === 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="py-4 border-b border-white/5">
                <p className="text-[9px] text-muted-foreground/40 tracking-[0.25em] uppercase font-bold mb-3">
                  Alertas Operacionais
                </p>
                <div className="space-y-2">
                  {data.pendingWithdrawals > 5 && (
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle size={11} className="text-yellow-400 flex-shrink-0" />
                      <p className="text-xs text-yellow-400">
                        {data.pendingWithdrawals} saques aguardando · R${(data.pendingWithdrawalsAmount / 100).toFixed(0)}
                      </p>
                    </div>
                  )}
                  {data.openJobs === 0 && (
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle size={11} className="text-yellow-400 flex-shrink-0" />
                      <p className="text-xs text-yellow-400">Nenhum extra disponível no momento</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════
            INFRAESTRUTURA
        ══════════════════════════════════ */}
        <div className="py-6">
          <p className="text-[9px] text-muted-foreground/40 tracking-[0.25em] uppercase font-bold mb-4">
            Infraestrutura · atualiza 30s
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {Object.values(latencies).map((sys, i) => {
              const isOnline  = sys.status === "online";
              const isSlow    = sys.status === "slow";
              const isManual  = sys.status === "manual";
              const dot   = isOnline ? "bg-green-400 animate-pulse" : isSlow ? "bg-yellow-400" : isManual ? "bg-yellow-400/50" : "bg-destructive";
              const label = isOnline ? "ONLINE" : isSlow ? "LENTO" : isManual ? "MANUAL" : "OFFLINE";
              const clr   = isOnline ? "text-green-400/70" : isSlow ? "text-yellow-400/70" : isManual ? "text-yellow-400/40" : "text-destructive/70";
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="text-[11px] font-bold">{sys.name}</span>
                  {sys.latency !== null && (
                    <span className={`text-[10px] tabular-nums ${sys.latency < 150 ? "text-green-400/60" : sys.latency < 400 ? "text-yellow-400/60" : "text-destructive/60"}`}>
                      {sys.latency}ms
                    </span>
                  )}
                  <span className={`text-[9px] tracking-widest ${clr}`}>{label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[8px] text-muted-foreground/20 tracking-[0.2em] mt-6">
            EXTRAG0 SISTEMAS NACIONAIS · OPERAÇÕES EM TEMPO REAL
          </p>
        </div>

      </div>
    </div>
  );
}
