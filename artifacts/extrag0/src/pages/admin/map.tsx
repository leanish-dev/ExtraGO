import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Briefcase, TrendingUp, Filter, Globe, Award, ChevronUp, Activity } from "lucide-react";

interface AnalyticsData {
  regionCounts: Record<string, number>;
  totalFreelancers: number;
  totalCompanies: number;
}

const BRAZIL_STATES: Array<{
  code: string; name: string; region: string; regionColor: string;
}> = [
  { code: "AC", name: "Acre", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "AP", name: "Amapá", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "AM", name: "Amazonas", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "PA", name: "Pará", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "RO", name: "Rondônia", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "RR", name: "Roraima", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "TO", name: "Tocantins", region: "Norte", regionColor: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" },
  { code: "AL", name: "Alagoas", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "BA", name: "Bahia", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "CE", name: "Ceará", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "MA", name: "Maranhão", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "PB", name: "Paraíba", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "PE", name: "Pernambuco", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "PI", name: "Piauí", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "RN", name: "Rio Grande do Norte", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "SE", name: "Sergipe", region: "Nordeste", regionColor: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { code: "DF", name: "Distrito Federal", region: "Centro-Oeste", regionColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { code: "GO", name: "Goiás", region: "Centro-Oeste", regionColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { code: "MT", name: "Mato Grosso", region: "Centro-Oeste", regionColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { code: "MS", name: "Mato Grosso do Sul", region: "Centro-Oeste", regionColor: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { code: "ES", name: "Espírito Santo", region: "Sudeste", regionColor: "bg-primary/20 border-primary/30 text-primary" },
  { code: "MG", name: "Minas Gerais", region: "Sudeste", regionColor: "bg-primary/20 border-primary/30 text-primary" },
  { code: "RJ", name: "Rio de Janeiro", region: "Sudeste", regionColor: "bg-primary/20 border-primary/30 text-primary" },
  { code: "SP", name: "São Paulo", region: "Sudeste", regionColor: "bg-primary/20 border-primary/30 text-primary" },
  { code: "PR", name: "Paraná", region: "Sul", regionColor: "bg-secondary/20 border-secondary/30 text-secondary" },
  { code: "RS", name: "Rio Grande do Sul", region: "Sul", regionColor: "bg-secondary/20 border-secondary/30 text-secondary" },
  { code: "SC", name: "Santa Catarina", region: "Sul", regionColor: "bg-secondary/20 border-secondary/30 text-secondary" },
];

const REGIONS = ["Todos", "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
const REGION_COLORS: Record<string, string> = {
  Norte: "text-emerald-400",
  Nordeste: "text-orange-400",
  "Centro-Oeste": "text-yellow-400",
  Sudeste: "text-primary",
  Sul: "text-secondary",
};
const REGION_BG_COLORS: Record<string, string> = {
  Norte: "bg-emerald-400",
  Nordeste: "bg-orange-400",
  "Centro-Oeste": "bg-yellow-400",
  Sudeste: "bg-primary",
  Sul: "bg-secondary",
};

function HeatCell({ count, max, region }: { count: number; max: number; region: string }) {
  const intensity = max > 0 ? count / max : 0;
  const color = REGION_BG_COLORS[region] ?? "bg-white";
  const levels = [0.06, 0.12, 0.22, 0.36, 0.55, 0.78, 1.0];
  const level = levels.findIndex(l => intensity <= l);
  const opacity = level === -1 ? 1 : levels[level];
  return (
    <div
      className={`h-3 w-3 rounded-sm ${color} flex-shrink-0`}
      style={{ opacity: count === 0 ? 0.04 : opacity }}
      title={`${count} usuários`}
    />
  );
}

export default function AdminMapPage() {
  const [activeRegion, setActiveRegion] = useState("Todos");
  const [sortBy, setSortBy] = useState<"name" | "users">("users");
  const [tick, setTick] = useState(0);

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: () => apiFetch("/api/admin/analytics"),
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const regionCounts = data?.regionCounts ?? {};
  const maxCount = Math.max(...Object.values(regionCounts), 1);
  const totalFreelancers = data?.totalFreelancers ?? 0;
  const totalCompanies = data?.totalCompanies ?? 0;
  const totalUsers = totalFreelancers + totalCompanies;

  const allStatesWithCount = BRAZIL_STATES.map(s => ({
    ...s,
    count: regionCounts[s.code] ?? regionCounts[s.name] ?? 0,
  }));

  const filteredStates = allStatesWithCount
    .filter(s => activeRegion === "Todos" || s.region === activeRegion)
    .sort((a, b) => sortBy === "users" ? b.count - a.count : a.name.localeCompare(b.name));

  const regionTotals = BRAZIL_STATES.reduce((acc, s) => {
    const count = regionCounts[s.code] ?? regionCounts[s.name] ?? 0;
    acc[s.region] = (acc[s.region] ?? 0) + count;
    return acc;
  }, {} as Record<string, number>);
  const totalWithRegion = Object.values(regionTotals).reduce((s, v) => s + v, 0);

  const top5States = [...allStatesWithCount]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topRegionName = Object.entries(regionTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  if (isLoading) {
    return <div className="p-6 space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold flex items-center gap-2">
            <Globe size={20} className="text-primary" /> Mapa Brasil
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Distribuição geográfica em tempo real
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 flex-shrink-0">
          <div className="glass-card rounded-xl px-3.5 py-2.5 border border-primary/15 text-center">
            <p className="text-lg font-bold text-primary leading-none">{totalFreelancers}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Freelancers</p>
          </div>
          <div className="glass-card rounded-xl px-3.5 py-2.5 border border-secondary/15 text-center">
            <p className="text-lg font-bold text-secondary leading-none">{totalCompanies}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Empresas</p>
          </div>
          <div className="glass-card rounded-xl px-3.5 py-2.5 border border-white/10 text-center">
            <p className="text-lg font-bold leading-none">{totalUsers}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-admin-stat rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Região Líder</p>
            <p className={`text-sm font-bold ${REGION_COLORS[topRegionName] ?? "text-foreground"}`}>{topRegionName}</p>
          </div>
        </div>
        <div className="card-admin-stat rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
            <Award size={15} className="text-secondary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado #1</p>
            <p className="text-sm font-bold text-foreground">{top5States[0]?.name ?? "—"}</p>
          </div>
        </div>
        <div className="card-admin-stat rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <Activity size={15} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cobertura</p>
            <p className="text-sm font-bold text-yellow-400">
              {allStatesWithCount.filter(s => s.count > 0).length}/{BRAZIL_STATES.length} estados
            </p>
          </div>
        </div>
      </div>

      {/* Region summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"].map(region => {
          const total = regionTotals[region] ?? 0;
          const states = BRAZIL_STATES.filter(s => s.region === region);
          const pct = totalWithRegion > 0 ? Math.round((total / totalWithRegion) * 100) : 0;
          const bgColor = REGION_BG_COLORS[region] ?? "bg-white";
          return (
            <motion.button
              key={region}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveRegion(activeRegion === region ? "Todos" : region)}
              className={`glass-card rounded-2xl p-3 text-left transition-all border ${
                activeRegion === region ? "border-primary/40 bg-primary/6" : "border-white/8 hover:border-white/16"
              }`}
            >
              <p className={`text-[11px] font-bold mb-1 ${REGION_COLORS[region] ?? "text-foreground"}`}>{region}</p>
              <p className="text-xl font-bold">{total}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{pct}% · {states.length} estados</p>
              {/* Mini bar */}
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`h-full rounded-full ${bgColor}`}
                  style={{ opacity: 0.7 }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Heatmap grid */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" /> Mapa de Calor — Estados
          </h2>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Menor</span>
            {[0.08, 0.2, 0.4, 0.65, 1.0].map((o, i) => (
              <div key={i} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: o }} />
            ))}
            <span>Maior</span>
          </div>
        </div>

        <div className="space-y-4">
          {["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"].map(region => {
            const regionStates = allStatesWithCount.filter(s => s.region === region);
            const regionMax = Math.max(...regionStates.map(s => s.count), 1);
            const regionColor = REGION_COLORS[region] ?? "text-foreground";
            const bgColor = REGION_BG_COLORS[region] ?? "bg-white";
            return (
              <div key={region}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold ${regionColor}`}>{region}</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-muted-foreground">{regionTotals[region] ?? 0} usuários</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {regionStates.map(s => (
                    <div key={s.code} className="flex flex-col items-center gap-0.5 group relative">
                      <div
                        className={`h-5 w-5 sm:h-6 sm:w-6 rounded-md ${bgColor} border border-white/6 cursor-pointer transition-transform group-hover:scale-125`}
                        style={{ opacity: s.count === 0 ? 0.08 : 0.15 + (s.count / maxCount) * 0.85 }}
                        onClick={() => setActiveRegion(activeRegion === region ? "Todos" : region)}
                      />
                      <span className="text-[8px] text-muted-foreground/60 font-mono">{s.code}</span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-black/95 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] whitespace-nowrap z-20 pointer-events-none flex-col items-center gap-0.5">
                        <span className="font-bold text-white">{s.name}</span>
                        <span className={regionColor}>{s.count} usuários</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Top 5 States ranking */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Award size={14} className="text-yellow-400" /> Top 5 Estados
          </h2>
          {top5States.length === 0 || top5States[0].count === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum dado de localização disponível ainda.</p>
          ) : (
            <div className="space-y-3">
              {top5States.map((state, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                const pct = maxCount > 0 ? Math.round((state.count / maxCount) * 100) : 0;
                const bgColor = REGION_BG_COLORS[state.region] ?? "bg-white";
                return (
                  <motion.div
                    key={state.code}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-base flex-shrink-0 w-8 text-center">{medal}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold truncate">{state.name}</span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0">{state.count}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.06 }}
                          className={`h-full rounded-full ${bgColor}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* State table */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold">
              {activeRegion === "Todos" ? "Todos os Estados" : activeRegion}
              <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">({filteredStates.length})</span>
            </h2>
            <button
              onClick={() => setSortBy(s => s === "users" ? "name" : "users")}
              className="text-[11px] text-muted-foreground hover:text-foreground border border-white/8 rounded-lg px-2.5 py-1 transition-all"
            >
              {sortBy === "users" ? "A–Z" : "# Usuários"}
            </button>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
            {filteredStates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            ) : (
              filteredStates.map((state, i) => {
                const pct = Math.round((state.count / maxCount) * 100);
                const bgColor = REGION_BG_COLORS[state.region] ?? "bg-white";
                return (
                  <motion.div
                    key={state.code}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className="flex items-center gap-3 py-1.5 border-b border-white/4 last:border-0"
                  >
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${state.regionColor}`}>
                      {state.code}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs truncate">{state.name}</span>
                        <span className="text-xs font-bold ml-2 flex-shrink-0 tabular-nums">{state.count}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: state.count === 0 ? "1%" : `${Math.max(4, pct)}%` }}
                          transition={{ duration: 0.4, delay: i * 0.015 }}
                          className={`h-full rounded-full ${bgColor}`}
                          style={{ opacity: state.count === 0 ? 0.1 : 0.8 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {totalWithRegion === 0 && (
            <div className="text-center py-4 mt-2 border-t border-white/5">
              <p className="text-xs text-muted-foreground/60">Os dados regionais aparecem quando freelancers preenchem suas regiões de atuação.</p>
            </div>
          )}
        </div>
      </div>

      {/* Region filter pills (bottom) */}
      <div className="flex gap-2 flex-wrap">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => setActiveRegion(r)}
            className={`text-[11px] px-3 py-1.5 rounded-full font-semibold border transition-all ${
              activeRegion === r
                ? "bg-primary text-black border-primary"
                : `border-white/10 text-muted-foreground hover:border-white/25 ${REGION_COLORS[r] ? `hover:${REGION_COLORS[r]}` : "hover:text-foreground"}`
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
