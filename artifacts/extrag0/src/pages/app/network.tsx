import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, UserMinus, CheckCircle, Shield, Users, Loader2, Building2, Star } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-fetch";
import { LevelBadge, LevelBadgeIcon } from "@/components/level-badge";

function UserCard({ user, type }: { user: any; type: "freelancer" | "company" }) {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [following, setFollowing] = useState(user.isFollowedByMe ?? false);
  const [pending, setPending] = useState(false);

  if (me?.id === user.id) return null;

  const handleFollow = async () => {
    setPending(true);
    try {
      if (following) {
        await apiFetch(`/api/users/${user.id}/follow`, { method: "DELETE" });
        setFollowing(false);
        toast.success("Deixou de seguir");
      } else {
        await apiFetch(`/api/users/${user.id}/follow`, { method: "POST" });
        setFollowing(true);
        toast.success("Seguindo!");
      }
      qc.invalidateQueries({ queryKey: ["network-freelancers"] });
      qc.invalidateQueries({ queryKey: ["network-companies"] });
    } catch {
      toast.error("Erro ao seguir");
    } finally {
      setPending(false);
    }
  };

  const displayName = type === "company" ? (user.companyName || user.name) : user.name;
  const subName = type === "company" ? user.name : (user.categories?.[0] || "Freelancer");

  const categories: string[] = user.categories ?? [];
  const rep: number = user.reputationScore ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="user-card-network-v2 rounded-2xl p-4 transition-all group"
    >
      <div className="flex items-start gap-3">
        <Link href={type === "freelancer" ? `/app/freelancers/${user.id}` : `/app/companies/${user.id}`}>
          <div className="flex-shrink-0 cursor-pointer relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-primary/25 transition-colors"
              />
            ) : (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-black border border-white/10 group-hover:border-primary/25 transition-colors ${
                type === "company"
                  ? "bg-gradient-to-br from-secondary to-primary"
                  : "bg-gradient-to-br from-primary to-secondary"
              }`}>
                {displayName?.charAt(0).toUpperCase()}
              </div>
            )}
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#080A0D] border border-white/10 flex items-center justify-center">
                {type === "company"
                  ? <Shield size={9} className="text-primary" />
                  : <CheckCircle size={9} className="text-primary" />
                }
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={type === "freelancer" ? `/app/freelancers/${user.id}` : `/app/companies/${user.id}`}>
            <div className="cursor-pointer">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{displayName}</p>
                {type === "freelancer" && rep > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-400">
                    <Star size={9} className="fill-yellow-400" /> {rep.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Primary identity line */}
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {type === "freelancer" && categories.length > 0 ? categories[0] : subName}
              </p>
            </div>
          </Link>

          {/* Secondary info row */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {type === "freelancer" && user.level && (
              <>
                <LevelBadgeIcon level={user.level} size="md" />
                <LevelBadge level={user.level} size="sm" />
              </>
            )}
            {type === "freelancer" && categories.length > 1 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/8 text-muted-foreground">
                +{categories.length - 1}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Users size={9} /> {user.followersCount ?? 0}
            </span>
            {type === "freelancer" && user.completedJobs != null && user.completedJobs > 0 && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <CheckCircle size={9} className="text-primary/60" /> {user.completedJobs} extras
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleFollow}
          disabled={pending}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            following
              ? "border-white/15 text-muted-foreground bg-white/5 hover:border-destructive/40 hover:text-red-400"
              : "border-primary/30 text-primary bg-primary/8 hover:bg-primary/15"
          }`}
        >
          {pending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : following ? (
            <UserMinus size={12} />
          ) : (
            <UserPlus size={12} />
          )}
          {following ? "Seguindo" : "Seguir"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-4 border border-white/6 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/6 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-lg bg-white/6 w-2/3" />
          <div className="h-3 rounded-lg bg-white/4 w-1/2" />
        </div>
        <div className="w-16 h-7 rounded-xl bg-white/6" />
      </div>
    </div>
  );
}

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<"freelancers" | "companies">("freelancers");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: freelancers = [], isLoading: loadingFreelancers } = useQuery<any[]>({
    queryKey: ["network-freelancers", debouncedSearch],
    queryFn: () => apiFetch(`/api/users/freelancers?search=${encodeURIComponent(debouncedSearch)}`),
  });

  const { data: companies = [], isLoading: loadingCompanies } = useQuery<any[]>({
    queryKey: ["network-companies", debouncedSearch],
    queryFn: () => apiFetch(`/api/users/companies?search=${encodeURIComponent(debouncedSearch)}`),
  });

  const isLoading = activeTab === "freelancers" ? loadingFreelancers : loadingCompanies;
  const items = activeTab === "freelancers" ? freelancers : companies;

  return (
    <div className="pb-24 lg:pb-6 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="mod-network-ambient absolute inset-0" />
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-blue-500/8 via-primary/2 to-transparent" />
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.11) 0%, transparent 70%)", filter: "blur(65px)" }} />
        <div className="absolute bottom-40 right-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl" style={{ background: "rgba(5,9,15,0.97)", borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
        {/* Network identity banner */}
        <div className="network-hero-banner">
          {/* SVG: connection network visualization */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-90" viewBox="0 0 600 56" preserveAspectRatio="none" aria-hidden="true">
            <line x1="40" y1="12" x2="120" y2="38" stroke="rgba(59,130,246,0.20)" strokeWidth="0.8" strokeDasharray="4,3"/>
            <line x1="120" y1="38" x2="220" y2="18" stroke="rgba(59,130,246,0.18)" strokeWidth="0.8" strokeDasharray="4,3"/>
            <line x1="220" y1="18" x2="340" y2="42" stroke="rgba(139,92,246,0.16)" strokeWidth="0.8" strokeDasharray="4,3"/>
            <line x1="340" y1="42" x2="460" y2="20" stroke="rgba(59,130,246,0.15)" strokeWidth="0.8" strokeDasharray="4,3"/>
            <line x1="460" y1="20" x2="560" y2="38" stroke="rgba(139,92,246,0.14)" strokeWidth="0.8" strokeDasharray="4,3"/>
            <line x1="120" y1="38" x2="340" y2="42" stroke="rgba(59,130,246,0.09)" strokeWidth="0.6"/>
            <line x1="220" y1="18" x2="460" y2="20" stroke="rgba(139,92,246,0.09)" strokeWidth="0.6"/>
            <circle cx="40" cy="12" r="3" fill="rgba(59,130,246,0.65)"/>
            <circle cx="40" cy="12" r="7" fill="none" stroke="rgba(59,130,246,0.20)" strokeWidth="1"/>
            <circle cx="120" cy="38" r="2.5" fill="rgba(59,130,246,0.55)"/>
            <circle cx="220" cy="18" r="3.5" fill="rgba(124,252,0,0.55)"/>
            <circle cx="220" cy="18" r="7" fill="none" stroke="rgba(124,252,0,0.15)" strokeWidth="1"/>
            <circle cx="340" cy="42" r="2.5" fill="rgba(139,92,246,0.55)"/>
            <circle cx="460" cy="20" r="3" fill="rgba(59,130,246,0.55)"/>
            <circle cx="560" cy="38" r="2.5" fill="rgba(139,92,246,0.50)"/>
          </svg>

          <div className="relative z-10 px-4 sm:px-6 py-3 max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mod-icon-network">
                <Users size={13} />
              </div>
              <div>
                <h1 className="text-base font-bold leading-none">Descobrir Pessoas</h1>
                <p className="text-[10px] mt-0.5 font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(59,130,246,0.60)" }}>Comunidade extraGO</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: "0 0 5px #3b82f6" }} />
                <span className="text-[10px] font-bold" style={{ color: "rgba(59,130,246,0.65)" }}>Freelancers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#8b5cf6", boxShadow: "0 0 5px #8b5cf6" }} />
                <span className="text-[10px] font-bold" style={{ color: "rgba(139,92,246,0.65)" }}>Empresas</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-3 pb-3 max-w-3xl mx-auto">
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === "freelancers" ? "Buscar freelancers..." : "Buscar empresas..."}
              className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-10 text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {([
              { key: "freelancers", label: "Freelancers", icon: <Users size={13} /> },
              { key: "companies", label: "Empresas", icon: <Building2 size={13} /> },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  activeTab === tab.key
                    ? "text-black border-primary"
                    : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
                style={activeTab === tab.key ? { background: "linear-gradient(135deg, #7CFC00, #22c55e)" } : {}}
              >
                {tab.icon}
                {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${
                  activeTab === tab.key ? "bg-black/20" : "bg-white/8"
                }`}>
                  {tab.key === "freelancers" ? freelancers.length : companies.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-4 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                  {activeTab === "freelancers" ? <Users size={22} className="text-muted-foreground" /> : <Building2 size={22} className="text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch ? `Nenhum resultado para "${debouncedSearch}"` : "Nenhum encontrado."}
                </p>
              </div>
            ) : (
              items.map((user: any) => (
                <UserCard key={user.id} user={user} type={activeTab === "freelancers" ? "freelancer" : "company"} />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
