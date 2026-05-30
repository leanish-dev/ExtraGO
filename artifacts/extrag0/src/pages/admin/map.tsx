import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { motion } from "framer-motion";
import { MapPin, Users, Briefcase, TrendingUp, Filter } from "lucide-react";

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

export default function AdminMapPage() {
  const [activeRegion, setActiveRegion] = useState("Todos");
  const [sortBy, setSortBy] = useState<"name" | "users">("users");

  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["admin-analytics"],
    queryFn: () => apiFetch("/api/admin/analytics"),
    refetchInterval: 60_000,
  });

  const regionCounts = data?.regionCounts ?? {};
  const maxCount = Math.max(...Object.values(regionCounts), 1);

  const filteredStates = BRAZIL_STATES
    .filter(s => activeRegion === "Todos" || s.region === activeRegion)
    .map(s => ({ ...s, count: regionCounts[s.code] ?? regionCounts[s.name] ?? 0 }))
    .sort((a, b) => sortBy === "users" ? b.count - a.count : a.name.localeCompare(b.name));

  const regionTotals = BRAZIL_STATES.reduce((acc, s) => {
    const count = regionCounts[s.code] ?? regionCounts[s.name] ?? 0;
    acc[s.region] = (acc[s.region] ?? 0) + count;
    return acc;
  }, {} as Record<string, number>);
  const totalWithRegion = Object.values(regionTotals).reduce((s, v) => s + v, 0);

  if (isLoading) {
    return <div className="p-6 space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin size={20} className="text-primary" /> Mapa Brasil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Distribuição geográfica de usuários pela plataforma</p>
      </div>

      {/* Region summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"].map(region => {
          const total = regionTotals[region] ?? 0;
          const states = BRAZIL_STATES.filter(s => s.region === region);
          const pct = totalWithRegion > 0 ? Math.round((total / totalWithRegion) * 100) : 0;
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
              <p className="text-[10px] text-muted-foreground">{pct}% · {states.length} estados</p>
            </motion.button>
          );
        })}
      </div>

      {/* Visual region map (simplified Brazil geography) */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-bold mb-4">Mapa de Densidade por Região</h2>
        <div className="relative bg-[#070a0d] rounded-xl p-4 overflow-hidden" style={{ minHeight: 240 }}>
          <div className="absolute inset-0 opacity-10" style={{
            background: "url('/images/backgrounds/bg-main.png') center/cover no-repeat"
          }} />
          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { region: "Norte", position: "col-span-2 sm:col-span-2", emoji: "🌿" },
              { region: "Nordeste", position: "", emoji: "🏖️" },
              { region: "Centro-Oeste", position: "", emoji: "🌾" },
              { region: "Sudeste", position: "", emoji: "🌆" },
              { region: "Sul", position: "", emoji: "🏔️" },
            ].map(({ region, position, emoji }) => {
              const total = regionTotals[region] ?? 0;
              const intensity = maxCount > 0 ? Math.min(total / maxCount, 1) : 0;
              const color = REGION_COLORS[region] ?? "text-foreground";
              return (
                <motion.div
                  key={region}
                  whileHover={{ scale: 1.03 }}
                  className={`${position} rounded-xl p-4 border cursor-pointer transition-all ${
                    activeRegion === region ? "border-primary/40" : "border-white/8"
                  }`}
                  style={{ background: `rgba(255,255,255,${0.02 + intensity * 0.08})` }}
                  onClick={() => setActiveRegion(activeRegion === region ? "Todos" : region)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-lg">{emoji}</span>
                      <p className={`text-xs font-bold mt-1 ${color}`}>{region}</p>
                      <p className="text-xl font-bold mt-0.5">{total}</p>
                    </div>
                    {total > 0 && (
                      <div className="flex flex-col gap-0.5 items-end">
                        {Array.from({ length: Math.ceil(intensity * 5) }).map((_, i) => (
                          <div key={i} className={`h-1 rounded-full ${color.replace("text-", "bg-").split(" ")[0]}`}
                            style={{ width: `${(i + 1) * 8}px`, opacity: 0.6 + i * 0.08 }} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* State table */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Estados — {activeRegion}</h2>
          <div className="flex items-center gap-2">
            <Filter size={12} className="text-muted-foreground" />
            <button
              onClick={() => setSortBy(s => s === "users" ? "name" : "users")}
              className="text-[11px] text-muted-foreground hover:text-foreground border border-white/8 rounded-lg px-2.5 py-1 transition-all"
            >
              Por {sortBy === "users" ? "nome" : "usuários"}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {filteredStates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
          ) : (
            filteredStates.map((state, i) => {
              const pct = Math.round((state.count / maxCount) * 100);
              return (
                <motion.div
                  key={state.code}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 py-2 border-b border-white/4 last:border-0"
                >
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${state.regionColor}`}>
                    {state.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs truncate">{state.name}</span>
                      <span className="text-xs font-bold ml-2 flex-shrink-0">{state.count}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4, delay: i * 0.02 }}
                        className={`h-full rounded-full ${
                          state.region === "Sul" ? "bg-secondary" :
                          state.region === "Sudeste" ? "bg-primary" :
                          state.region === "Nordeste" ? "bg-orange-400" :
                          state.region === "Norte" ? "bg-emerald-400" : "bg-yellow-400"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-[10px] text-muted-foreground w-12 text-right">
                    {state.region}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {totalWithRegion === 0 && (
          <div className="text-center py-6">
            <MapPin size={24} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Os dados regionais aparecerão quando os usuários preencherem suas regiões de atuação nos perfis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
