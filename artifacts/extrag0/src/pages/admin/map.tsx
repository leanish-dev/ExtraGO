import React, { useState } from "react";
import { useRegionalStats, useRepresentatives } from "@/lib/admin-api";
import { MapPin, Users, Briefcase, TrendingUp, X } from "lucide-react";

interface StateInfo {
  name: string;
  region: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

const STATES: Record<string, StateInfo> = {
  RR: { name: "Roraima", region: "Norte", x: 26, y: 3 },
  AP: { name: "Amapá", region: "Norte", x: 50, y: 3 },
  AM: { name: "Amazonas", region: "Norte", x: 16, y: 14, w: 3 },
  PA: { name: "Pará", region: "Norte", x: 40, y: 13, w: 3 },
  AC: { name: "Acre", region: "Norte", x: 8, y: 24 },
  RO: { name: "Rondônia", region: "Norte", x: 19, y: 26 },
  TO: { name: "Tocantins", region: "Norte", x: 47, y: 27 },
  MA: { name: "Maranhão", region: "Nordeste", x: 57, y: 16 },
  PI: { name: "Piauí", region: "Nordeste", x: 64, y: 21 },
  CE: { name: "Ceará", region: "Nordeste", x: 73, y: 17 },
  RN: { name: "R. G. do Norte", region: "Nordeste", x: 82, y: 19 },
  PB: { name: "Paraíba", region: "Nordeste", x: 82, y: 26 },
  PE: { name: "Pernambuco", region: "Nordeste", x: 76, y: 29, w: 2.5 },
  AL: { name: "Alagoas", region: "Nordeste", x: 84, y: 33 },
  SE: { name: "Sergipe", region: "Nordeste", x: 80, y: 37 },
  BA: { name: "Bahia", region: "Nordeste", x: 68, y: 38, w: 3 },
  MT: { name: "Mato Grosso", region: "Centro-Oeste", x: 30, y: 33, w: 3 },
  GO: { name: "Goiás", region: "Centro-Oeste", x: 48, y: 41 },
  DF: { name: "Distrito Federal", region: "Centro-Oeste", x: 55, y: 44 },
  MS: { name: "Mato Grosso do Sul", region: "Centro-Oeste", x: 34, y: 49, w: 2.5 },
  MG: { name: "Minas Gerais", region: "Sudeste", x: 59, y: 48, w: 3 },
  ES: { name: "Espírito Santo", region: "Sudeste", x: 72, y: 49 },
  RJ: { name: "Rio de Janeiro", region: "Sudeste", x: 67, y: 56 },
  SP: { name: "São Paulo", region: "Sudeste", x: 52, y: 57, w: 3 },
  PR: { name: "Paraná", region: "Sul", x: 46, y: 64, w: 2.5 },
  SC: { name: "Santa Catarina", region: "Sul", x: 49, y: 69 },
  RS: { name: "Rio Grande do Sul", region: "Sul", x: 43, y: 76, w: 3 },
};

const REGION_COLORS: Record<string, string> = {
  "Norte": "from-emerald-500/60 to-emerald-600/40 border-emerald-500/30",
  "Nordeste": "from-orange-500/60 to-amber-600/40 border-orange-500/30",
  "Centro-Oeste": "from-blue-500/60 to-blue-600/40 border-blue-500/30",
  "Sudeste": "from-primary/70 to-primary/40 border-primary/30",
  "Sul": "from-purple-500/60 to-purple-600/40 border-purple-500/30",
};

const REGION_BADGE_COLORS: Record<string, string> = {
  "Norte": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Nordeste": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Centro-Oeste": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Sudeste": "text-primary bg-primary/10 border-primary/20",
  "Sul": "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

export default function AdminBrazilMapPage() {
  const { data: stats = [], isLoading } = useRegionalStats();
  const { data: reps = [] } = useRepresentatives();
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const statMap = new Map(stats.map(s => [s.stateCode, s]));
  const repMap = new Map(reps.map(r => [r.stateCode, r]));

  const maxUsers = Math.max(...stats.map(s => s.totalUsers), 1);

  const selectedStat = selected ? statMap.get(selected) : null;
  const selectedRep = selected ? repMap.get(selected) : null;
  const selectedInfo = selected ? STATES[selected] : null;

  const regionSummary = Object.entries(
    Object.entries(STATES).reduce((acc, [code, info]) => {
      if (!acc[info.region]) acc[info.region] = { users: 0, jobs: 0, states: 0, hasRep: 0 };
      const s = statMap.get(code);
      const r = repMap.get(code);
      if (s) { acc[info.region].users += s.totalUsers; acc[info.region].jobs += s.activeJobs; }
      acc[info.region].states++;
      if (r) acc[info.region].hasRep++;
      return acc;
    }, {} as Record<string, { users: number; jobs: number; states: number; hasRep: number }>)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 page-enter">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <MapPin size={22} className="text-primary" />
            Mapa Regional do Brasil
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Distribuição de usuários e operações por estado</p>
        </div>
      </div>

      {/* Region legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(REGION_BADGE_COLORS).map(([region, cls]) => (
          <button
            key={region}
            onClick={() => setHoveredRegion(hoveredRegion === region ? null : region)}
            className={`text-[10px] px-2.5 py-1 rounded-full border font-bold transition-all ${cls} ${
              hoveredRegion === region ? "scale-105 shadow-lg" : "opacity-80 hover:opacity-100"
            }`}
          >
            {region}
          </button>
        ))}
        <span className="text-[10px] text-muted-foreground self-center ml-2">Clique nos estados para detalhes</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Map */}
        <div className="glass-card rounded-2xl p-4 relative" style={{ minHeight: 500 }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: "100%", maxWidth: 640, margin: "0 auto" }}>
              <div className="absolute inset-0">
                {/* Brazil outline hint */}
                <div
                  className="absolute rounded-3xl border border-white/3 pointer-events-none"
                  style={{ left: "5%", top: "2%", right: "12%", bottom: "18%", background: "rgba(124,252,0,0.01)" }}
                />

                {Object.entries(STATES).map(([code, info]) => {
                  const stat = statMap.get(code);
                  const hasRep = repMap.has(code);
                  const intensity = stat ? stat.totalUsers / maxUsers : 0;
                  const isRegionHighlighted = !hoveredRegion || hoveredRegion === info.region;
                  const isSelected = selected === code;
                  const w = info.w ?? 1.8;
                  const h = 1.8;

                  return (
                    <button
                      key={code}
                      onClick={() => setSelected(isSelected ? null : code)}
                      className="absolute group"
                      style={{
                        left: `${info.x}%`,
                        top: `${info.y}%`,
                        width: `${w * 3.5}%`,
                        height: `${h * 3.5}%`,
                        minWidth: 28,
                        minHeight: 28,
                        transform: "translate(-50%, -50%)",
                        opacity: isRegionHighlighted ? 1 : 0.25,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        className={`
                          w-full h-full rounded-lg flex items-center justify-center relative
                          border transition-all duration-200
                          ${isSelected ? `bg-gradient-to-br ${REGION_COLORS[info.region]} shadow-lg scale-110` :
                            `bg-gradient-to-br ${REGION_COLORS[info.region]} hover:scale-110 hover:shadow-md`}
                          ${intensity > 0.5 ? "shadow-sm" : ""}
                        `}
                        style={{
                          boxShadow: isSelected
                            ? `0 0 16px rgba(124,252,0,0.4), 0 0 6px rgba(124,252,0,0.2)`
                            : intensity > 0.3
                              ? `0 0 ${Math.floor(intensity * 12)}px rgba(124,252,0,${intensity * 0.3})`
                              : undefined,
                        }}
                      >
                        <span className="text-[7px] font-black text-white leading-none">{code}</span>
                        {hasRep && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border border-black" />
                        )}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 w-max">
                        <div className="glass-card rounded-lg px-2.5 py-1.5 text-left border border-white/15 shadow-xl">
                          <p className="text-[11px] font-bold text-white">{info.name}</p>
                          <p className="text-[9px] text-muted-foreground">{stat?.totalUsers ?? 0} usuários</p>
                          {hasRep && <p className="text-[9px] text-primary font-semibold">✓ Representante</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-[9px] text-muted-foreground">Tem representante</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm" style={{ background: "rgba(124,252,0,0.5)" }} />
              <span className="text-[9px] text-muted-foreground">Alta atividade</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {/* Selected state detail */}
          {selected && selectedInfo && (
            <div className="glass-card rounded-2xl p-4 border border-primary/20 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black bg-gradient-to-br ${REGION_COLORS[selectedInfo.region]}`}>
                      {selected}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{selectedInfo.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${REGION_BADGE_COLORS[selectedInfo.region]}`}>
                        {selectedInfo.region}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Freelancers", value: selectedStat?.freelancers ?? 0, icon: <Users size={11} />, color: "text-primary" },
                  { label: "Empresas", value: selectedStat?.companies ?? 0, icon: <Briefcase size={11} />, color: "text-cyan-400" },
                  { label: "Vagas Ativas", value: selectedStat?.activeJobs ?? 0, icon: <TrendingUp size={11} />, color: "text-yellow-400" },
                  { label: "Receita", value: `R$ ${((selectedStat?.revenue ?? 0) / 100).toFixed(0)}`, icon: <TrendingUp size={11} />, color: "text-green-400" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/4 rounded-xl p-2.5">
                    <div className={`flex items-center gap-1 ${item.color} mb-1`}>{item.icon}<span className="text-[9px] font-bold">{item.label}</span></div>
                    <p className="text-base font-black">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedRep ? (
                <div className="bg-primary/8 border border-primary/15 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-primary mb-1">Representante Estadual</p>
                  <p className="text-sm font-bold">{selectedRep.userName}</p>
                  <p className="text-[10px] text-muted-foreground">{selectedRep.userEmail}</p>
                  <p className="text-[10px] text-primary font-semibold mt-1">{(selectedRep.commissionRate * 100).toFixed(0)}% comissão</p>
                </div>
              ) : (
                <div className="bg-white/3 border border-white/8 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-muted-foreground">Nenhum representante neste estado</p>
                </div>
              )}
            </div>
          )}

          {/* Region summaries */}
          <div className="space-y-2">
            {regionSummary.map(([region, data]) => (
              <div
                key={region}
                onClick={() => setHoveredRegion(hoveredRegion === region ? null : region)}
                className={`glass-card rounded-xl p-3 cursor-pointer transition-all hover:border-white/12 ${hoveredRegion === region ? "border-primary/25" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${REGION_BADGE_COLORS[region]}`}>
                    {region}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{data.states} estados · {data.hasRep} reps</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><Users size={10} className="text-primary" /> {data.users} usuários</span>
                  <span className="flex items-center gap-1"><Briefcase size={10} className="text-cyan-400" /> {data.jobs} vagas</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${REGION_COLORS[region].split(" ")[0]} ${REGION_COLORS[region].split(" ")[1]}`}
                    style={{ width: `${Math.min(100, (data.users / Math.max(...regionSummary.map(([, d]) => d.users), 1)) * 100)}%`, transition: "width 0.6s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
