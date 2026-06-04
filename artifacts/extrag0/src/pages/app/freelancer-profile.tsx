import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Briefcase, MapPin, Award, Globe, ChevronLeft,
  Zap, Building2, MessageCircle, UserPlus, UserMinus, Users, Loader2, Star
} from "lucide-react";
import { Link } from "wouter";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { AnimatedCounter } from "@/components/animated-counter";
import { LevelBadge } from "@/components/level-badge";

function StatBadge({ value, label, color = "text-primary" }: { value: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="text-center px-3 py-3 rounded-xl bg-white/3 border border-white/6 flex flex-col items-center justify-center gap-0.5">
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

const BADGE_DEFS = [
  { key: "first_job", label: "Primeiro Extra", emoji: "🎯", threshold: 1, field: "completedJobs" },
  { key: "ten_jobs", label: "10 Extras", emoji: "🔟", threshold: 10, field: "completedJobs" },
  { key: "top_rated", label: "Top Avaliado", emoji: "⭐", threshold: 4, field: "reputationScore" },
  { key: "verified", label: "Verificado", emoji: "✅", threshold: true, field: "isVerified" },
];

export default function FreelancerProfilePage() {
  const [, params] = useRoute("/app/freelancers/:id");
  const [, setLocation] = useLocation();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const userId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("sobre");

  const { data: user, isLoading } = useQuery({
    queryKey: ["freelancer-profile", userId],
    queryFn: () => apiFetch(`/api/users/${userId}`),
    enabled: !!userId,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["freelancer-stats", userId],
    queryFn: () => apiFetch(`/api/stats/freelancer/${userId}`),
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

  const [following, setFollowing] = useState<boolean>(false);
  useEffect(() => {
    if (user?.isFollowedByMe !== undefined) {
      setFollowing(user.isFollowedByMe);
    }
  }, [user?.isFollowedByMe]);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (following) {
        await apiFetch(`/api/users/${userId}/follow`, { method: "DELETE" });
      } else {
        await apiFetch(`/api/users/${userId}/follow`, { method: "POST" });
      }
    },
    onMutate: () => setFollowing(f => !f),
    onError: () => {
      setFollowing(f => !f);
      toast.error("Erro ao seguir");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["freelancer-profile", userId] });
      toast.success(following ? "Deixou de seguir" : "Seguindo!");
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4">
        <div className="h-36 rounded-2xl bg-white/5 animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Freelancer não encontrado.</p>
        <Button onClick={() => setLocation("/app/network")} className="mt-4">Voltar à Rede</Button>
      </div>
    );
  }

  const isMe = me?.id === userId;
  const isCompany = me?.role === "company";

  const followersCount = user.followersCount ?? 0;
  const displayFollowers = following
    ? followersCount + (user.isFollowedByMe ? 0 : 1)
    : followersCount - (user.isFollowedByMe ? 1 : 0);

  const earnedBadges = BADGE_DEFS.filter(b => {
    if (b.field === "isVerified") return user.isVerified;
    const val = user[b.field] ?? 0;
    return typeof b.threshold === "boolean" ? !!val : val >= b.threshold;
  });

  const totalEarnings = stats?.totalEarnings ?? 0;
  const completedJobs = stats?.completedJobs ?? user.completedJobs ?? 0;
  const avgRating = stats?.averageRating ?? user.reputationScore ?? 0;
  const responseRate = stats?.responseRate ?? user.responseRate ?? 0;

  return (
    <div className="page-enter pb-24 lg:pb-8">
      {/* Hero banner */}
      <div className="relative w-full h-36 sm:h-48 overflow-hidden">
        {user.bannerUrl ? (
          <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/25 via-secondary/10 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060809] via-[#060809]/10 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-3 left-4 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
        >
          <ChevronLeft size={15} /> Voltar
        </button>
      </div>

      <div className="px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Avatar + name */}
        <div className="relative -mt-12 sm:-mt-14 mb-4">
          <div className="flex items-end gap-4">
            <div className="relative flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#060809] shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-black text-black border-4 border-[#060809] shadow-xl">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {user.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-[#060809]"
                  style={{ boxShadow: "0 0 12px rgba(124,252,0,0.6)" }}
                >
                  <CheckCircle size={13} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black truncate">{user.name}</h1>
                {user.isVerified && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    Verificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <LevelBadge level={user.level ?? "bronze"} size="sm" />
                {user.categories && user.categories.length > 0 && (
                  <span className="text-xs text-muted-foreground truncate">{user.categories[0]}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {earnedBadges.map(b => (
              <span key={b.key} className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <StatBadge
            value={<AnimatedCounter value={completedJobs} />}
            label="Extras"
            color="text-primary"
          />
          <StatBadge
            value={<><AnimatedCounter value={avgRating} decimals={1} /> ★</>}
            label="Avaliação"
            color="text-yellow-400"
          />
          <StatBadge
            value={<AnimatedCounter value={displayFollowers} />}
            label="Seguidores"
            color="text-secondary"
          />
          <StatBadge
            value={`${responseRate}%`}
            label="Resposta"
            color="text-muted-foreground"
          />
        </div>

        {/* CTAs */}
        {!isMe && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              variant="outline"
              className={`h-12 font-bold text-sm rounded-xl border-white/15 ${
                following
                  ? "bg-white/5 text-foreground hover:bg-destructive/10 hover:text-red-400 hover:border-destructive/30"
                  : "bg-secondary/10 border-secondary/30 text-secondary hover:bg-secondary/20"
              }`}
            >
              {followMutation.isPending ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : following ? (
                <UserMinus size={14} className="mr-2" />
              ) : (
                <UserPlus size={14} className="mr-2" />
              )}
              {following ? "Seguindo" : "Seguir"}
            </Button>

            {isCompany ? (
              <Link href={`/app/jobs/new?freelancer=${userId}`}>
                <Button className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl">
                  <Zap size={15} className="mr-2" /> Contratar
                </Button>
              </Link>
            ) : (
              <Link href={`/app/chat`}>
                <Button className="w-full bg-white/8 border border-white/15 text-foreground hover:bg-white/12 font-bold h-12 text-sm rounded-xl">
                  <MessageCircle size={15} className="mr-2" /> Mensagem
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Tabs */}
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

              {/* Earnings & stats card — visible to everyone */}
              <div className="glass-card rounded-2xl p-5 border border-white/6">
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Star size={13} className="text-yellow-400" /> Desempenho
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Extras concluídos</span>
                    <span className="font-bold text-primary">{completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avaliação média</span>
                    <span className="font-bold text-yellow-400">{avgRating.toFixed(1)} ★</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de resposta</span>
                    <span className="font-bold">{responseRate}%</span>
                  </div>
                  {totalEarnings > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total ganho</span>
                      <span className="font-bold text-green-400">
                        R$ {(totalEarnings / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

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

              {/* Social */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-2xl p-4 border border-white/6 text-center">
                  <p className="text-2xl font-black text-primary">
                    <AnimatedCounter value={user.followersCount ?? 0} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Users size={10} /> Seguidores
                  </p>
                </div>
                <div className="glass-card rounded-2xl p-4 border border-white/6 text-center">
                  <p className="text-2xl font-black text-secondary">
                    <AnimatedCounter value={user.followingCount ?? 0} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Seguindo</p>
                </div>
              </div>
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
                        <p className="text-xs text-muted-foreground/65 mt-0.5">
                          {exp.startDate} — {exp.endDate ?? "Atual"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{exp.description}</p>
                        )}
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
