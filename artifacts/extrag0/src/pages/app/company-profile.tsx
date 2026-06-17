import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Briefcase, MapPin, Building2, ChevronLeft,
  UserPlus, UserMinus, Users, Shield, Loader2, Globe, MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { AnimatedCounter } from "@/components/animated-counter";

function StatBadge({ value, label, color = "text-primary" }: { value: React.ReactNode; label: string; color?: string }) {
  return (
    <div className="text-center px-3 py-3 rounded-xl bg-white/3 border border-white/6 flex flex-col items-center justify-center gap-0.5">
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-white/70 leading-tight">{label}</p>
    </div>
  );
}

function MessageButton({ recipientId, setLocation }: { recipientId: number; setLocation: (path: string) => void }) {
  const [loading, setLoading] = useState(false);
  const handleOpen = async () => {
    setLoading(true);
    try {
      const conv = await apiFetch("/api/chat/conversations", { method: "POST", body: JSON.stringify({ participantId: recipientId }) });
      setLocation(conv?.id ? `/app/chat?conv=${conv.id}` : "/app/chat");
    } catch {
      setLocation("/app/chat");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      onClick={handleOpen}
      disabled={loading}
      className="w-full h-12 font-bold text-sm rounded-xl bg-white/8 border border-white/15 text-foreground hover:bg-white/12"
    >
      {loading ? <Loader2 size={15} className="mr-2 animate-spin" /> : <MessageCircle size={15} className="mr-2" />}
      Mensagem
    </Button>
  );
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
        <div className="h-36 rounded-2xl bg-white/5 animate-pulse" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6 text-center">
        <p className="text-white/70">Empresa não encontrada.</p>
        <Button onClick={() => window.history.back()} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const isMe = me?.id === userId;
  const isFreelancer = me?.role === "freelancer";
  const followersCount = company.followersCount ?? 0;
  const displayFollowers = following !== null
    ? (following
        ? followersCount + (company.isFollowedByMe ? 0 : 1)
        : followersCount - (company.isFollowedByMe ? 1 : 0))
    : followersCount;

  const companyName = company.companyName || company.name;

  return (
    <div className="page-enter pb-24 lg:pb-8">
      {/* Hero banner */}
      <div className="relative w-full h-36 sm:h-48 overflow-hidden">
        {company.bannerUrl ? (
          <img src={company.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/25 via-primary/10 to-transparent" />
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
        <div className="relative -mt-14 sm:-mt-16 mb-4">
          <div className="flex items-end gap-4">
            <div className="relative flex-shrink-0">
              {company.avatarUrl ? (
                <img
                  src={company.avatarUrl}
                  alt={companyName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#060809] shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-3xl font-black text-black border-4 border-[#060809] shadow-xl">
                  {companyName?.charAt(0).toUpperCase()}
                </div>
              )}
              {company.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-[#060809]"
                  style={{ boxShadow: "0 0 12px rgba(124,252,0,0.6)" }}
                >
                  <Shield size={13} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black truncate">{companyName}</h1>
                {company.isVerified && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex-shrink-0">
                    Verificada
                  </span>
                )}
              </div>
              {company.name !== companyName && (
                <p className="text-xs text-white/70 mt-0.5">{company.name}</p>
              )}
              {company.industry && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">{company.industry}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatBadge
            value={<AnimatedCounter value={stats?.totalJobsPosted ?? 0} />}
            label="Extras Postados"
            color="text-secondary"
          />
          <StatBadge
            value={<AnimatedCounter value={displayFollowers ?? 0} />}
            label="Seguidores"
            color="text-primary"
          />
          <StatBadge
            value={stats?.averageRating ? `${Number(stats.averageRating).toFixed(1)} ★` : "—"}
            label="Avaliação"
            color="text-yellow-400"
          />
        </div>

        {/* CTAs */}
        {!isMe && (
          <div className={`grid gap-3 mb-6 ${isFreelancer ? "grid-cols-2" : "grid-cols-1"}`}>
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
                <Loader2 size={15} className="animate-spin mr-2" />
              ) : following ? (
                <UserMinus size={15} className="mr-2" />
              ) : (
                <UserPlus size={15} className="mr-2" />
              )}
              {following ? "Deixar de Seguir" : "Seguir Empresa"}
            </Button>

            {isFreelancer && (
              <MessageButton recipientId={userId} setLocation={setLocation} />
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="sticky top-0 z-20 bg-[#060809]/95 backdrop-blur-xl border-b border-white/6 mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {[
              { key: "sobre", label: "Sobre" },
              { key: "extras", label: `Extras Abertos (${jobs.length})` },
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
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(0,229,255,0.11)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.32), transparent)" }} />
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 relative">
                    <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Building2 size={12} className="text-secondary" />
                    </div>
                    Sobre a Empresa
                  </h2>
                  <p className="text-sm text-foreground/80 leading-relaxed">{company.bio}</p>
                </div>
              )}

              <div className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.045) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(124,252,0,0.1)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.28), rgba(0,229,255,0.15), transparent)" }} />
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2 relative">
                  <Users size={13} className="text-primary" /> Estatísticas
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Extras publicados", value: stats?.totalJobsPosted ?? 0 },
                    { label: "Extras ativos", value: stats?.activeJobs ?? 0 },
                    { label: "Trabalhadores contratados", value: stats?.totalWorkers ?? 0 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.label}</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {company.serviceRegions && company.serviceRegions.length > 0 && (
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(0,229,255,0.1)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.28), transparent)" }} />
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 relative">
                    <MapPin size={13} className="text-secondary" /> Regiões de Atuação
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {company.serviceRegions.map((r: string) => (
                      <span key={r} className="text-xs px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {company.website && (
                <div className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(124,252,0,0.04) 0%, rgba(8,17,26,0.92) 65%)", border: "1px solid rgba(124,252,0,0.1)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.25), transparent)" }} />
                  <h2 className="font-semibold text-sm mb-3 flex items-center gap-2 relative">
                    <Globe size={13} className="text-primary" /> Website
                  </h2>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "extras" && (
            <motion.div
              key="extras"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {jobs.length === 0 ? (
                <div className="rounded-2xl p-8 text-center relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.03) 0%, rgba(8,17,26,0.92) 70%)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Briefcase size={28} className="text-white/60 mx-auto mb-2" />
                  <p className="text-sm text-white/70">Nenhum extra aberto no momento.</p>
                  {isFreelancer && (
                    <Link href="/app/jobs">
                      <Button variant="outline" className="mt-4 border-white/15 text-sm">
                        Ver todos os Extras
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                jobs.map((job: any) => (
                  <Link key={job.id} href="/app/jobs">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-2xl p-4 cursor-pointer hover:border-primary/30 transition-all card-hover relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(8,17,26,0.90) 65%)", border: "1px solid rgba(139,92,246,0.12)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={14} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{job.title}</p>
                          <p className="text-xs text-white/70 mt-0.5">{job.category}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-primary font-bold">
                              R$ {Number(job.hourlyRate ?? 0).toFixed(2)}/h
                            </span>
                            {job.location && (
                              <span className="text-[10px] text-white/70 flex items-center gap-0.5">
                                <MapPin size={9} /> {job.location}
                              </span>
                            )}
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
