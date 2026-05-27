import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, UserMinus, CheckCircle, Shield, Users, Loader2, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-fetch";

const LEVEL_COLORS: Record<string, { color: string; label: string; emoji: string }> = {
  bronze: { color: "text-orange-400 border-orange-400/25 bg-orange-400/8", label: "Bronze", emoji: "🥉" },
  silver: { color: "text-slate-300 border-slate-300/25 bg-slate-300/8", label: "Prata", emoji: "🥈" },
  gold: { color: "text-yellow-400 border-yellow-400/25 bg-yellow-400/8", label: "Ouro", emoji: "🥇" },
  elite: { color: "text-primary border-primary/25 bg-primary/8", label: "Elite", emoji: "👑" },
};

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

  const levelInfo = user.level ? LEVEL_COLORS[user.level] : null;
  const displayName = type === "company" ? (user.companyName || user.name) : user.name;
  const subName = type === "company" ? user.name : (user.categories?.[0] || "Freelancer");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 border border-white/6 hover:border-white/12 transition-all"
    >
      <div className="flex items-start gap-3">
        <Link href={type === "freelancer" ? `/app/freelancers/${user.id}` : `/app/companies/${user.id}`}>
          <div className="flex-shrink-0 cursor-pointer">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/8"
              />
            ) : (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-black border-2 border-white/8 ${
                type === "company"
                  ? "bg-gradient-to-br from-secondary to-primary"
                  : "bg-gradient-to-br from-primary to-secondary"
              }`}>
                {displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={type === "freelancer" ? `/app/freelancers/${user.id}` : `/app/companies/${user.id}`}>
            <div className="cursor-pointer">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-bold truncate hover:text-primary transition-colors">{displayName}</p>
                {user.isVerified && (
                  type === "company"
                    ? <Shield size={12} className="text-primary flex-shrink-0" />
                    : <CheckCircle size={12} className="text-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{subName}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {type === "freelancer" && levelInfo && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-0.5 ${levelInfo.color}`}>
                {levelInfo.emoji} {levelInfo.label}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Users size={9} /> {user.followersCount ?? 0} seguidores
            </span>
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
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#060809]/95 backdrop-blur-xl border-b border-white/6">
        <div className="px-4 sm:px-6 pt-4 pb-3 max-w-3xl mx-auto">
          <h1 className="text-lg font-bold mb-3">Descobrir Pessoas</h1>

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
                    ? "bg-primary text-black border-primary"
                    : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
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
