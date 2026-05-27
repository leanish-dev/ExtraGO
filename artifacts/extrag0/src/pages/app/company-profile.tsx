import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Briefcase, MapPin, Building2, ChevronLeft,
  UserPlus, UserMinus, Star, Users, Shield, Loader2
} from "lucide-react";
import { Link } from "wouter";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("extragO_token");
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function StatBadge({ value, label, color = "text-primary" }: { value: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="text-center px-4 py-3 rounded-xl bg-white/3 border border-white/6">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (target === 0) return;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
      setCount(c => {
        if (c + step >= target) { clearInterval(timer); return target; }
        return c + step;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}</>;
}

export default function CompanyProfilePage() {
  const [, params] = useRoute("/app/companies/:id");
  const [, setLocation] = useLocation();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const userId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("sobre");

  const { data: company, isLoading } = useQuery({
    queryKey: ["company-profile", userId],
    queryFn: () => apiFetch(`/api/users/${userId}`),
    enabled: !!userId,
  });

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["company-jobs", userId],
    queryFn: () => apiFetch(`/api/jobs?companyId=${userId}&status=open`),
    enabled: !!userId,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["company-stats", userId],
    queryFn: () => apiFetch(`/api/stats/company/${userId}`),
    enabled: !!userId,
  });

  const [following, setFollowing] = useState<boolean | null>(null);
  React.useEffect(() => {
    if (company?.isFollowedByMe !== undefined) {
      setFollowing(company.isFollowedByMe);
    }
  }, [company?.isFollowedByMe]);

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
      qc.invalidateQueries({ queryKey: ["company-profile", userId] });
      toast.success(following ? "Deixou de seguir" : "Seguindo!");
    },
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

  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Empresa não encontrada.</p>
        <Button onClick={() => setLocation(-1 as any)} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const isMe = me?.id === userId;
  const followersCount = company.followersCount ?? 0;
  const displayFollowers = following !== null
    ? (following ? followersCount + (company.isFollowedByMe ? 0 : 1) : followersCount - (company.isFollowedByMe ? 1 : 0))
    : followersCount;

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="relative w-full h-36 sm:h-48 overflow-hidden">
        {company.bannerUrl ? (
          <img src={company.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/20 via-primary/10 to-transparent">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060809] via-transparent to-transparent" />
      </div>

      <div className="px-4 sm:px-6 max-w-3xl mx-auto">
        <button
          onClick={() => setLocation(-1 as any)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 mt-2 transition-colors"
        >
          <ChevronLeft size={16} /> Voltar
        </button>

        {/* Avatar + name */}
        <div className="relative -mt-14 sm:-mt-16 mb-4">
          <div className="flex items-end gap-4">
            <div className="relative flex-shrink-0">
              {company.avatarUrl ? (
                <img
                  src={company.avatarUrl}
                  alt={company.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#060809]"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-3xl font-bold text-black border-4 border-[#060809]">
                  {(company.companyName || company.name)?.charAt(0).toUpperCase()}
                </div>
              )}
              {company.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-[#060809]"
                  style={{ boxShadow: "0 0 12px rgba(124,252,0,0.6)" }}>
                  <Shield size={13} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold">{company.companyName || company.name}</h1>
                {company.isVerified && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    Verificada
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{company.name}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatBadge
            value={<AnimatedCounter target={stats?.totalJobsPosted ?? 0} />}
            label="Vagas Postadas"
            color="text-secondary"
          />
          <StatBadge
            value={<AnimatedCounter target={displayFollowers} />}
            label="Seguidores"
            color="text-primary"
          />
          <StatBadge
            value={stats?.averageRating ? `${stats.averageRating.toFixed(1)} ★` : "—"}
            label="Avaliação"
            color="text-yellow-400"
          />
        </div>

        {/* Follow CTA */}
        {!isMe && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mb-6">
            <Button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={`w-full h-12 font-bold text-sm rounded-xl border-none ${
                following
                  ? "bg-white/8 border border-white/15 text-foreground hover:bg-destructive/15 hover:text-red-400"
                  : "bg-secondary text-black hover:bg-secondary/90"
              }`}
              style={!following ? { boxShadow: "0 0 18px rgba(0,200,200,0.25)" } : {}}
            >
              {followMutation.isPending ? (
                <Loader2 size={15} className="animate-spin mr-2" />
              ) : following ? (
                <UserMinus size={15} className="mr-2" />
              ) : (
                <UserPlus size={15} className="mr-2" />
              )}
              {following ? "Deixar de Seguir" : "Seguir Empresa"}
            </Button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="sticky top-0 z-20 bg-[#060809]/95 backdrop-blur-xl border-b border-white/6 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {[
              { key: "sobre", label: "Sobre" },
              { key: "vagas", label: `Vagas Abertas (${jobs.length})` },
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

        <AnimatePresence mode="wait">
          {activeTab === "sobre" && (
            <motion.div
              key="sobre"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {company.bio && (
                <div className="glass-card rounded-2xl p-5 border border-white/6">
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Building2 size={12} className="text-secondary" />
                    </div>
                    Sobre a Empresa
                  </h2>
                  <p className="text-sm text-foreground/80 leading-relaxed">{company.bio}</p>
                </div>
              )}

              <div className="glass-card rounded-2xl p-5 border border-white/6">
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Users size={13} className="text-primary" /> Estatísticas
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Vagas publicadas", value: stats?.totalJobsPosted ?? 0 },
                    { label: "Vagas ativas", value: stats?.activeJobs ?? 0 },
                    { label: "Trabalhadores contratados", value: stats?.totalWorkers ?? 0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {company.serviceRegions && company.serviceRegions.length > 0 && (
                <div className="glass-card rounded-2xl p-5 border border-white/6">
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin size={13} className="text-secondary" /> Regiões
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {company.serviceRegions.map((r: string) => (
                      <span key={r} className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-medium">{r}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "vagas" && (
            <motion.div
              key="vagas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {jobs.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 border border-white/6 text-center">
                  <Briefcase size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma vaga aberta no momento.</p>
                </div>
              ) : (
                jobs.map((job: any) => (
                  <Link key={job.id} href={`/app/jobs`}>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className="glass-card rounded-2xl p-4 border border-white/6 cursor-pointer hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={14} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{job.category}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-primary font-bold">R$ {job.hourlyRate}/h</span>
                            <span className="text-[10px] text-muted-foreground">{job.location}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-400/10 border border-green-400/20 text-green-400 font-bold flex-shrink-0">
                          Aberta
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
