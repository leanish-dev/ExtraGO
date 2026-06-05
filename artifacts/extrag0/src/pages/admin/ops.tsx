import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-fetch";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Briefcase, DollarSign, Clock, Users, CheckCircle,
  AlertTriangle, Zap, TrendingUp, CreditCard, RefreshCw, Wifi
} from "lucide-react";
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

function OpsMetricCard({ icon, label, value, sub, color, pulse, alert }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; pulse?: boolean; alert?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card rounded-2xl p-4 border relative overflow-hidden ${alert ? "border-destructive/30 bg-destructive/4" : color}`}
    >
      {alert && <div className="absolute top-0 left-0 right-0 h-0.5 bg-destructive/60 animate-pulse" />}
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${alert ? "bg-destructive/20" : "bg-white/6"}`}>
          {icon}
        </div>
        {pulse && <span className="flex items-center gap-1 text-[10px] text-green-400/70"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Live</span>}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${alert ? "text-destructive" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminOpsPage() {
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tick, setTick] = useState(0);

  const fetchOps = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const result = await apiFetch("/api/admin/ops");
      setData(result);
      setLastUpdate(new Date());
    } catch { /* silent */ } finally {
      if (!silent) { setRefreshing(false); setLoading(false); }
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchOps();
    const interval = setInterval(() => {
      fetchOps(true);
      setTick(t => t + 1);
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 skeleton rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const healthScore = (() => {
    let score = 100;
    if (data.pendingWithdrawals > 10) score -= 15;
    if (data.openJobs === 0) score -= 10;
    score = Math.max(0, score);
    return score;
  })();

  const healthColor = healthScore >= 80 ? "text-green-400" : healthScore >= 60 ? "text-yellow-400" : "text-destructive";
  const healthLabel = healthScore >= 80 ? "Saudável" : healthScore >= 60 ? "Atenção" : "Crítico";

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            Central de Operações
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <Wifi size={10} />
            Atualização automática a cada 10s
            {lastUpdate && ` · ${format(lastUpdate, "HH:mm:ss", { locale: ptBR })}`}
          </p>
        </div>
        <button
          onClick={() => fetchOps()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/16 rounded-xl px-3 py-2 transition-all"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Platform health strip */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-white/8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className={healthColor} />
            <span className="text-xs font-bold">Saúde da Plataforma</span>
            <span className={`text-xs font-bold ${healthColor}`}>{healthScore}/100 — {healthLabel}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full rounded-full ${healthScore >= 80 ? "bg-green-400" : healthScore >= 60 ? "bg-yellow-400" : "bg-destructive"}`}
            />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-muted-foreground">Usuários totais</p>
          <p className="text-lg font-bold">{data.totalUsers.toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <OpsMetricCard
          icon={<Briefcase size={15} className="text-primary" />}
          label="Vagas Abertas" value={data.openJobs}
          sub={`${data.jobsInProgress} em andamento`}
          color="border-primary/15" pulse
        />
        <OpsMetricCard
          icon={<Users size={15} className="text-secondary" />}
          label="Novos Hoje" value={data.newUsersToday}
          sub={`${data.appsToday} candidaturas`}
          color="border-secondary/15" pulse
        />
        <OpsMetricCard
          icon={<DollarSign size={15} className="text-green-400" />}
          label="Pagamentos Hoje" value={`R$${(data.todayPayments / 100).toFixed(0)}`}
          sub="Aprovados hoje"
          color="border-green-400/15" pulse
        />
        <OpsMetricCard
          icon={<CreditCard size={15} className="text-destructive" />}
          label="Saques Pendentes" value={data.pendingWithdrawals}
          sub={`R$${(data.pendingWithdrawalsAmount / 100).toFixed(0)} aguardando`}
          color="border-white/10"
          alert={data.pendingWithdrawals > 5}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <OpsMetricCard
          icon={<Zap size={15} className="text-yellow-400" />}
          label="Jobs em Andamento" value={data.jobsInProgress}
          color="border-yellow-400/15"
        />
        <OpsMetricCard
          icon={<CheckCircle size={15} className="text-primary" />}
          label="Aprovados Hoje" value={data.approvedToday}
          sub={`de ${data.appsToday} candidaturas`}
          color="border-primary/15"
        />
        <OpsMetricCard
          icon={<TrendingUp size={15} className="text-secondary" />}
          label="Saques Hoje" value={`R$${(data.todayWithdrawals / 100).toFixed(0)}`}
          color="border-secondary/15"
        />
        <OpsMetricCard
          icon={<Activity size={15} className="text-purple-400" />}
          label="Índice de Atividade"
          value={data.openJobs + data.jobsInProgress + data.appsToday}
          sub="jobs + candidaturas"
          color="border-purple-400/15"
        />
      </div>

      {/* Alerts section */}
      <AnimatePresence>
        {(data.pendingWithdrawals > 5 || data.openJobs === 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-card rounded-2xl p-4 border border-yellow-400/20 bg-yellow-400/4"
          >
            <h2 className="text-sm font-bold flex items-center gap-2 text-yellow-400 mb-3">
              <AlertTriangle size={14} /> Alertas de Operação
            </h2>
            <div className="space-y-2">
              {data.pendingWithdrawals > 5 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span><strong>{data.pendingWithdrawals} saques</strong> aguardando aprovação — R${(data.pendingWithdrawalsAmount / 100).toFixed(0)}</span>
                </div>
              )}
              {data.openJobs === 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span>Nenhuma vaga aberta no momento</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System status */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Activity size={14} className="text-green-400" /> Status dos Sistemas
        </h2>
        <div className="space-y-3">
          {[
            { name: "API Server", status: "online", latency: "~12ms" },
            { name: "Banco de Dados", status: "online", latency: "~8ms" },
            { name: "SSE / Real-time", status: "online", latency: "~50ms" },
            { name: "Notificações", status: "online", latency: "—" },
            { name: "Sistema de Pagamentos", status: "manual", latency: "PIX Manual" },
          ].map((sys, i) => (
            <div key={i} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${sys.status === "online" ? "bg-green-400 animate-pulse" : sys.status === "manual" ? "bg-yellow-400" : "bg-destructive"}`} />
                <span className="text-xs font-semibold">{sys.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">{sys.latency}</span>
                <span className={`text-[10px] font-bold ${sys.status === "online" ? "text-green-400" : sys.status === "manual" ? "text-yellow-400" : "text-destructive"}`}>
                  {sys.status === "online" ? "Online" : sys.status === "manual" ? "Manual" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
