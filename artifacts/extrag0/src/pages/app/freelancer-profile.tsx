import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Star, Briefcase, MapPin, Award, Globe, Shield, ChevronLeft, Zap, Calendar, Building2, Plus, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { SkeletonCard } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string) {
  const token = localStorage.getItem("extragO_token");
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const LEVEL_MAP: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/25", emoji: "🥉" },
  silver: { label: "Prata", color: "text-slate-300", bg: "bg-slate-300/10 border-slate-300/25", emoji: "🥈" },
  gold: { label: "Ouro", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/25", emoji: "🥇" },
  elite: { label: "Elite", color: "text-primary", bg: "bg-primary/10 border-primary/25", emoji: "👑" },
};

function StatBadge({ value, label, color = "text-primary" }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="text-center px-4 py-3 rounded-xl bg-white/3 border border-white/6">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function FreelancerProfilePage() {
  const [, params] = useRoute("/app/freelancers/:id");
  const [, setLocation] = useLocation();
  const userId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("sobre");

  const { data: user, isLoading } = useQuery({
    queryKey: ["freelancer-profile", userId],
    queryFn: () => apiFetch(`/api/users/${userId}`),
    enabled: !!userId,
  });

  const { data: experience = [] } = useQuery<any[]>({
    queryKey: ["public-experience", userId],
    queryFn: () => apiFetch(`/api/users/${userId}/experience`),
    enabled: !!userId,
  });

  const { data: skills = [] } = useQuery<{ id: number; skill: string; endorsements: number }[]>({
    queryKey: ["public-skills", userId],
    queryFn: () => apiFetch(`/api/users/${userId}/skills`),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Freelancer não encontrado.</p>
        <Button onClick={() => setLocation("/app/jobs")} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const levelInfo = LEVEL_MAP[user.level ?? "bronze"] ?? LEVEL_MAP.bronze;

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="relative w-full h-36 sm:h-48 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent overflow-hidden">
        {user.bannerUrl ? (
          <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060809] via-transparent to-transparent" />
      </div>

      <div className="px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => setLocation(-1 as any)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 mt-2 transition-colors"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {/* Avatar + name */}
        <div className="relative -mt-12 sm:-mt-16 mb-4">
          <div className="flex items-end gap-4">
            <div className="relative flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#060809]"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-black border-4 border-[#060809]">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-[#060809]"
                  style={{ boxShadow: "0 0 12px rgba(124,252,0,0.6)" }}>
                  <CheckCircle size={13} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
                {user.isVerified && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    Verificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border inline-flex items-center gap-1 ${levelInfo.bg} ${levelInfo.color}`}>
                  {levelInfo.emoji} {levelInfo.label}
                </span>
                {user.categories && user.categories.length > 0 && (
                  <span className="text-xs text-muted-foreground">{user.categories[0]}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBadge value={user.completedJobs ?? 0} label="Jobs Feitos" color="text-primary" />
          <StatBadge value={`${(user.reputationScore ?? 0).toFixed(1)} ★`} label="Reputação" color="text-yellow-400" />
          <StatBadge value={`${user.responseRate ?? 0}%`} label="Resposta" color="text-secondary" />
        </div>

        {/* CTA */}
        <Link href={`/app/jobs/new?freelancer=${userId}`}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl mb-6">
              <Zap size={15} className="mr-2" /> Contratar Agora
            </Button>
          </motion.div>
        </Link>

        {/* Sticky tabs */}
        <div className="sticky top-0 z-20 bg-[#060809]/95 backdrop-blur-xl border-b border-white/6 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {[
              { key: "sobre", label: "Sobre" },
              { key: "categorias", label: "Especialidades" },
              { key: "experiencia", label: "Experiência" },
              { key: "skills", label: "Habilidades" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/6"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "sobre" && (
            <motion.div
              key="sobre"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {(user.bio || user.professionalSummary) && (
                <div className="glass-card rounded-2xl p-5 border border-white/6">
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageCircle size={12} className="text-primary" />
                    </div>
                    Sobre
                  </h2>
                  {user.professionalSummary && (
                    <p className="text-sm text-foreground/80 leading-relaxed mb-2">{user.professionalSummary}</p>
                  )}
                  {user.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                  )}
                </div>
              )}

              {user.serviceRegions && user.serviceRegions.length > 0 && (
                <div className="glass-card rounded-2xl p-5 border border-white/6">
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin size={14} className="text-secondary" /> Regiões de Atendimento
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.serviceRegions.map((region: string) => (
                      <span key={region} className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-medium">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.languages && user.languages.length > 0 && (
                <div className="glass-card rounded-2xl p-5 border border-white/6">
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Globe size={14} className="text-yellow-400" /> Idiomas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {user.languages.map((lang: string) => (
                      <span key={lang} className="text-xs px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "experiencia" && (
            <motion.div
              key="experiencia"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card rounded-2xl p-5 border border-white/6"
            >
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Briefcase size={14} className="text-secondary" /> Experiência Profissional
              </h2>
              {experience.length > 0 ? (
                <div className="space-y-4">
                  {experience.map((exp: any) => (
                    <div key={exp.id} className="flex gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 size={13} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{exp.role}</p>
                        <p className="text-xs text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground/65 mt-0.5">{exp.startDate} — {exp.endDate ?? "Atual"}</p>
                        {exp.description && <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{exp.description}</p>}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {exp.achievements.map((a: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-primary mt-0.5">•</span> {a}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma experiência cadastrada.</p>
              )}
            </motion.div>
          )}

          {activeTab === "categorias" && (
            <motion.div
              key="categorias"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card rounded-2xl p-5 border border-white/6"
            >
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Award size={14} className="text-yellow-400" /> Especialidades
              </h2>
              {user.categories && user.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.categories.map((cat: string) => (
                    <span key={cat} className="text-sm px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                      {cat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma especialidade cadastrada.</p>
              )}
            </motion.div>
          )}

          {activeTab === "skills" && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-card rounded-2xl p-5 border border-white/6"
            >
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Zap size={14} className="text-primary" /> Habilidades
              </h2>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any) => (
                    <span key={s.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-medium">
                      {s.skill}
                      {s.endorsements > 0 && (
                        <span className="text-primary font-bold">+{s.endorsements}</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma habilidade cadastrada.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
