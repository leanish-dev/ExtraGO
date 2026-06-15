import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, Briefcase, DollarSign, Star, CheckCircle,
  BarChart3, Trophy, Building2, Percent, Crown, ArrowUp, Award, AlertTriangle
} from "lucide-react";

interface AnalyticsData {
  growthByMonth: Array<{ month: string; label: string; newFreelancers: number; newCompanies: number; revenue: number; jobs: number }>;
  levelDistribution: Array<{ level: string; count: number; avgReputation: number }>;
  topEarners: Array<{ id: number; name: string; totalEarned: number; completedJobs: number; level: string; reputationScore: number }>;
  topCompanies: Array<{ id: number; name: string; companyName?: string; jobsPosted: number }>;
  conversionRate: number;
  completionRate: number;
  totalApplications: number;
  completedJobs: number;
  totalGross: number;
  totalCommissions: number;
  totalFreelancers: number;
  totalCompanies: number;
}

function BarChart({ data, valueKey, labelKey, color = "#7CFC00", maxBars = 12, suffix = "" }: {
  data: any[]; valueKey: string; labelKey: string; color?: string; maxBars?: number; suffix?: string;
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 mt-2">
      {data.slice(-maxBars).map((d, i) => {
        const h = Math.max(4, (d[valueKey] / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-black/90 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
              {d[labelKey]}: {suffix === "R$" ? `R$${(d[valueKey]/100).toFixed(0)}` : `${d[valueKey]}${suffix}`}
            </div>
            <div
              className="w-full rounded-t-md transition-all duration-300"
              style={{ height: `${h}%`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }}
            />
            <span className="text-[9px] text-muted-foreground/50 truncate w-full text-center">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color, gradientFrom = "rgba(124,252,0,0.06)" }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; gradientFrom?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 relative overflow-hidden border ${color}`}
      style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, rgba(8,17,26,0.92) 70%)` }}
    >
      {/* Top accent stripe derived from the icon color */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
      <div className="flex items-start justify-between mb-3">
        <div className="opacity-80">{icon}</div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

const LEVEL_META: Record<string, { label: string; color: string; icon: string }> = {
  bronze: { label: "Iniciante", color: "text-sky-400 bg-sky-400/10 border-sky-400/20", icon: "🔵" },
  silver: { label: "Júnior", color: "text-slate-300 bg-slate-300/10 border-slate-300/20", icon: "⚪" },
  gold: { label: "Intermediário", color: "text-teal-400 bg-teal-400/10 border-teal-400/20", icon: "🥇" },
  elite: { label: "Sênior", color: "text-primary bg-primary/10 border-primary/20", icon: "👑" },
  diamond: { label: "Elite", color: "text-amber-300 bg-amber-300/10 border-amber-300/20", icon: "💎" },
};

export default function AdminAnalyticsPage() {
  const [activeChart, setActiveChart] = useState<"users" | "revenue" | "jobs">("users");

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: () => apiFetch("/api/admin/analytics"),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-40 skeleton rounded-2xl" />)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-64">
        <AlertTriangle size={36} className="text-yellow-400/60" />
        <div className="text-center">
          <p className="font-semibold text-sm">Erro ao carregar analytics</p>
          <p className="text-xs text-muted-foreground mt-1">Tente recarregar a página</p>
        </div>
      </div>
    );
  }

  const d = data;
  const totalLevels = d.levelDistribution.reduce((s, l) => s + l.count, 0) || 1;

  const chartConfigs = {
    users: { key: "newFreelancers", label: "Novos Freelancers", color: "#7CFC00", suffix: "" },
    revenue: { key: "revenue", label: "Receita", color: "#00E5FF", suffix: "R$" },
    jobs: { key: "jobs", label: "Novos Extras", color: "#a78bfa", suffix: "" },
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visão executiva da plataforma extraGO</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard icon={<Users size={18} className="text-primary" />} label="Freelancers" value={d.totalFreelancers} color="border-primary/15" gradientFrom="rgba(124,252,0,0.06)" />
        <MetricCard icon={<Building2 size={18} className="text-secondary" />} label="Empresas" value={d.totalCompanies} color="border-secondary/15" gradientFrom="rgba(0,229,255,0.055)" />
        <MetricCard icon={<CheckCircle size={18} className="text-green-400" />} label="Extras Concluídos" value={d.completedJobs} color="border-green-400/15" gradientFrom="rgba(34,197,94,0.055)" />
        <MetricCard
          icon={<DollarSign size={18} className="text-yellow-400" />}
          label="Volume Total"
          value={`R$${(d.totalGross / 100).toFixed(0)}`}
          color="border-yellow-400/15"
          gradientFrom="rgba(250,204,21,0.055)"
        />
      </div>

      {/* Growth Chart */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.04) 0%, rgba(8,17,26,0.92) 60%)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.3), rgba(0,229,255,0.2), transparent)" }} />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Crescimento — Últimos 12 meses</h2>
          <div className="flex gap-1.5">
            {(["users", "revenue", "jobs"] as const).map(k => (
              <button key={k} onClick={() => setActiveChart(k)}
                className={`text-[11px] px-3 py-1 rounded-full font-semibold transition-all ${
                  activeChart === k ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:bg-white/8"
                }`}>
                {k === "users" ? "Usuários" : k === "revenue" ? "Receita" : "Extras"}
              </button>
            ))}
          </div>
        </div>
        <BarChart
          data={d.growthByMonth}
          valueKey={chartConfigs[activeChart].key}
          labelKey="label"
          color={chartConfigs[activeChart].color}
          suffix={chartConfigs[activeChart].suffix}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Level Distribution */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.045) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(124,252,0,0.1)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.35), transparent)" }} />
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2 relative"><Trophy size={14} className="text-primary" /> Distribuição de Níveis</h2>
          <div className="space-y-3">
            {d.levelDistribution.map(({ level, count }) => {
              const meta = LEVEL_META[level] ?? LEVEL_META.bronze;
              const pct = Math.round((count / totalLevels) * 100);
              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <span>{meta.icon}</span> {meta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className={`h-full rounded-full ${
                        level === "diamond" ? "bg-amber-300" : level === "elite" ? "bg-primary" : level === "gold" ? "bg-teal-400" : level === "silver" ? "bg-slate-300" : "bg-sky-400"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(0,229,255,0.1)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)" }} />
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2 relative"><BarChart3 size={14} className="text-secondary" /> Funil de Conversão</h2>
          <div className="space-y-4">
            {[
              { label: "Candidaturas Totais", value: d.totalApplications, color: "bg-primary/20 border-primary/20", pct: 100 },
              { label: "Taxa de Aprovação", value: `${d.conversionRate}%`, color: "bg-secondary/20 border-secondary/20", pct: d.conversionRate },
              { label: "Taxa de Conclusão", value: `${d.completionRate}%`, color: "bg-green-400/20 border-green-400/20", pct: d.completionRate },
              { label: "Extras Concluídos", value: d.completedJobs, color: "bg-yellow-400/20 border-yellow-400/20", pct: d.totalApplications > 0 ? Math.round((d.completedJobs / d.totalApplications) * 100) : 0 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-1 h-8 rounded-full ${item.color.split(" ")[0].replace("/20", "")}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-bold">{item.value}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                      className={`h-full rounded-full ${item.color.split(" ")[0]}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Earners */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.04) 0%, rgba(8,17,26,0.93) 65%)", border: "1px solid rgba(124,252,0,0.1)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.35), rgba(0,229,255,0.18), transparent)" }} />
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 relative"><Crown size={14} className="text-primary" /> Top Freelancers por Ganhos</h2>
        <div className="space-y-2">
          {d.topEarners.slice(0, 8).map((f, i) => {
            const meta = LEVEL_META[f.level] ?? LEVEL_META.bronze;
            const maxEarned = d.topEarners[0]?.totalEarned ?? 1;
            const pct = Math.round((f.totalEarned / maxEarned) * 100);
            return (
              <div key={f.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
                <div className="w-6 text-[11px] font-bold text-muted-foreground/50 text-center flex-shrink-0">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold truncate">{f.name}</span>
                    <span className="text-xs font-bold text-primary flex-shrink-0 ml-2">R${(f.totalEarned / 100).toFixed(0)}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: i * 0.06 }}
                      className="h-full rounded-full bg-primary/60" />
                  </div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0 ${meta.color}`}>{meta.icon}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Companies */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(8,17,26,0.93) 65%)", border: "1px solid rgba(0,229,255,0.1)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), rgba(124,252,0,0.18), transparent)" }} />
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2 relative"><Building2 size={14} className="text-secondary" /> Top Empresas por Extras</h2>
        <div className="space-y-2">
          {d.topCompanies.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0">
              <div className="w-6 text-[11px] font-bold text-muted-foreground/50 text-center flex-shrink-0">{i + 1}</div>
              <div className="w-8 h-8 rounded-lg bg-secondary/15 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                <Building2 size={14} className="text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{c.companyName || c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.jobsPosted} extras publicados</p>
              </div>
              <span className="text-xs font-bold text-secondary">{c.jobsPosted}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
