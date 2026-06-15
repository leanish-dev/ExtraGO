import React, { useState, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import {
  User, Building2, CreditCard, Star, CheckCircle, AlertCircle, Camera, Loader2,
  Shield, Award, Plus, Trash2, Globe, MapPin, Briefcase, Zap, ChevronDown, ChevronUp,
  Edit3, Save, X, BookOpen, Languages, TrendingUp, Lock, Crown, Trophy, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/hooks/use-categories";

import { apiFetch } from "@/lib/api-fetch";
import { LevelBadge, LevelBadgeIcon, LEVEL_LABELS, LEVEL_COLORS, UserBadge, UserBadgeIcon, CorporateBadge, CorporateBadgeIcon, CORPORATE_ROLE_LABELS } from "@/components/level-badge";

const LANGUAGE_OPTIONS = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Mandarim", "Japonês", "Árabe"];
const REGION_OPTIONS = ["São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR", "Porto Alegre - RS", "Salvador - BA", "Fortaleza - CE", "Recife - PE", "Brasília - DF", "Manaus - AM", "Todo o Brasil"];

function ReputationRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (score / 5) * 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute", inset: 0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="hsl(88,100%,49%)" strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.19,1,0.22,1)", filter: "drop-shadow(0 0 6px rgba(124,252,0,0.5))" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-lg font-bold leading-none">{score.toFixed(1)}</p>
        <div className="flex justify-center gap-0.5 mt-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={8} className={i <= Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-white/15"} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExperienceSection({ userId }: { userId: number }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", startDate: "", endDate: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: experiences = [], isLoading } = useQuery<any[]>({
    queryKey: ["profile-experience", userId],
    queryFn: () => apiFetch("/api/profile/experience"),
  });

  const addExp = useMutation({
    mutationFn: (data: any) => apiFetch("/api/profile/experience", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile-experience", userId] }); setAdding(false); setForm({ company: "", role: "", startDate: "", endDate: "", description: "" }); toast.success("Experiência adicionada!"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteExp = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/profile/experience/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile-experience", userId] }); toast.success("Removido!"); },
  });

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="h-16 rounded-xl bg-white/4 animate-pulse" />
      ) : experiences.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">Nenhuma experiência adicionada ainda.</p>
      ) : (
        experiences.map((exp: any) => (
          <div key={exp.id} className="flex gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
              <Briefcase size={14} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{exp.role}</p>
              <p className="text-xs text-muted-foreground">{exp.company}</p>
              <p className="text-xs text-muted-foreground/65 mt-0.5">{exp.startDate} — {exp.endDate ?? "Atual"}</p>
              {exp.description && <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{exp.description}</p>}
            </div>
            <button onClick={() => deleteExp.mutate(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
        ))
      )}

      {adding && (
        <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Empresa</label>
              <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Nome da empresa" className="bg-white/5 border-white/10 rounded-xl h-10 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Cargo</label>
              <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Seu cargo" className="bg-white/5 border-white/10 rounded-xl h-10 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Início</label>
              <Input type="month" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="bg-white/5 border-white/10 rounded-xl h-10 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Fim (opcional)</label>
              <Input type="month" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="bg-white/5 border-white/10 rounded-xl h-10 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Descrição</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descreva suas responsabilidades..." className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm resize-none transition-colors" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => addExp.mutate(form)} disabled={!form.company || !form.role || !form.startDate || addExp.isPending} className="bg-primary text-black hover:bg-primary/90 rounded-xl h-9 text-xs">
              {addExp.isPending ? <Loader2 size={13} className="animate-spin" /> : "Salvar"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAdding(false)} className="border-white/10 rounded-xl h-9 text-xs">Cancelar</Button>
          </div>
        </div>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 font-semibold transition-colors mt-1">
          <Plus size={13} /> Adicionar Experiência
        </button>
      )}
    </div>
  );
}

function SkillsSection({ userId }: { userId: number }) {
  const qc = useQueryClient();
  const [newSkill, setNewSkill] = useState("");

  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ["profile-skills", userId],
    queryFn: () => apiFetch("/api/profile/skills"),
  });

  const addSkill = useMutation({
    mutationFn: (skill: string) => apiFetch("/api/profile/skills", { method: "POST", body: JSON.stringify({ skill }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile-skills", userId] }); setNewSkill(""); },
    onError: () => toast.error("Erro ao adicionar"),
  });

  const removeSkill = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/profile/skills/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile-skills", userId] }),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((s: any) => (
          <span key={s.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/8 border border-primary/18 text-primary font-medium group">
            {s.skill}
            {s.endorsements > 0 && <span className="font-bold">+{s.endorsements}</span>}
            <button onClick={() => removeSkill.mutate(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
        {skills.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma habilidade adicionada.</p>}
      </div>
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newSkill.trim()) { e.preventDefault(); addSkill.mutate(newSkill.trim()); } }}
          placeholder="Adicionar habilidade..."
          className="bg-white/5 border-white/10 rounded-xl h-9 text-sm"
        />
        <Button size="sm" disabled={!newSkill.trim() || addSkill.isPending} onClick={() => addSkill.mutate(newSkill.trim())} className="bg-primary text-black hover:bg-primary/90 rounded-xl h-9 px-4 text-xs">
          <Plus size={13} />
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth() as any;
  const updateUser = useUpdateUser();
  const qc = useQueryClient();
  const { categories: CATEGORIES } = useCategories();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    professionalSummary: (user as any)?.professionalSummary ?? "",
    companyName: user?.companyName ?? "",
    pixKey: user?.pixKey ?? "",
  });
  const [categories, setCategories] = useState<string[]>(user?.categories ?? []);
  const [languages, setLanguages] = useState<string[]>((user as any)?.languages ?? []);
  const [serviceRegions, setServiceRegions] = useState<string[]>((user as any)?.serviceRegions ?? []);
  const [activeTab, setActiveTab] = useState("perfil");

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 4MB."); return; }
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      try {
        await updateUser.mutateAsync({ id: user!.id!, data: { avatarUrl: dataUrl } as any });
        toast.success("Foto atualizada!");
      } catch {
        toast.error("Erro ao salvar foto.");
        setAvatarPreview(user?.avatarUrl ?? null);
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setBannerPreview(dataUrl);
      setUploadingBanner(true);
      try {
        await apiFetch("/api/profile/banner", {
          method: "POST",
          body: JSON.stringify({ dataUrl }),
        });
        toast.success("Banner atualizado!");
        qc.invalidateQueries({ queryKey: ["me"] });
      } catch {
        toast.error("Erro ao fazer upload do banner");
        setBannerPreview(null);
      } finally {
        setUploadingBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({
        id: user!.id!,
        data: { ...form, categories, languages, serviceRegions } as any,
      });
      toast.success("Perfil atualizado!");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao atualizar perfil");
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const toggleRegion = (reg: string) => {
    setServiceRegions(prev => prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]);
  };

  const completion = user?.profileCompletion ?? 0;
  const completionColor = completion >= 80 ? "text-primary" : completion >= 50 ? "text-yellow-400" : "text-destructive";

  const TABS = user?.role === "freelancer"
    ? [
        { key: "perfil", label: "Perfil" },
        { key: "especialidades", label: "Especialidades" },
        { key: "experiencia", label: "Experiência" },
        { key: "habilidades", label: "Habilidades" },
        { key: "progressão", label: "Progressão" },
        { key: "config", label: "Config." },
      ]
    : [
        { key: "perfil", label: "Perfil" },
        { key: "config", label: "Config." },
      ];

  return (
    <div className="page-enter pb-24 relative">
      {/* ── Full-page background art ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/backgrounds/bg-profile.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.09,
          mixBlendMode: "screen",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/60 via-transparent to-[#070a0d]/50 pointer-events-none" />
      {/* Banner area — clickable upload, full-width cinematic hero */}
      <div className="relative w-full h-36 sm:h-44 overflow-hidden group cursor-pointer" onClick={() => bannerInputRef.current?.click()}>
        {bannerPreview || (user as any)?.bannerUrl ? (
          <img src={bannerPreview || (user as any)?.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative">
            {/* Blurred avatar initial as cinematic banner backdrop */}
            <div
              className="absolute inset-0 profile-banner-blur"
              style={{
                background: `linear-gradient(135deg, rgba(124,252,0,0.22) 0%, rgba(0,229,255,0.14) 40%, rgba(124,252,0,0.08) 70%, rgba(0,229,255,0.18) 100%)`,
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.28] bg-cover bg-center mix-blend-screen pointer-events-none"
              style={{ backgroundImage: "url(/images/backgrounds/bg-profile.webp)" }}
            />
            {/* Animated shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
                animation: "shimmer 4s ease-in-out infinite",
              }} />
            {/* Large blurred avatar initial centered */}
            <div className="absolute inset-0 flex items-center justify-center opacity-8 pointer-events-none select-none">
              <span className="text-[200px] font-black leading-none"
                style={{
                  color: "rgba(124,252,0,0.08)",
                  fontFamily: "var(--font-display)",
                  filter: "blur(8px)",
                  textShadow: "0 0 80px rgba(124,252,0,0.3)",
                }}>
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Neon scan line at top */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(124,252,0,0.55), rgba(0,229,255,0.4), transparent)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111a] via-[#08111a]/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="flex items-center gap-2 bg-black/60 px-3 py-2 rounded-xl text-xs font-semibold text-white">
            <Camera size={13} /> Alterar banner
          </div>
        </div>
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
      </div>

      <div className="px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Hero section */}
        <div className="relative -mt-10 mb-5">
          <div className="flex items-end gap-4">
            {/* ── Clickable avatar with upload ── */}
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={handleAvatarClick}>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-[#08111a] avatar-upload-ring"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-[#9aff1c] to-secondary flex items-center justify-center text-3xl font-bold text-black border-4 border-[#08111a] avatar-upload-ring">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Upload overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                {avatarUploading ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
              {user?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-[#08111a]"
                  style={{ boxShadow: "0 0 10px rgba(124,252,0,0.6)" }}>
                  <CheckCircle size={11} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-xl font-bold leading-tight">{user?.name}</h1>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {user?.role === "freelancer" && (
                  <LevelBadge level={user?.level} size="md" />
                )}
                {(user as any)?.corporateRole && (
                  <CorporateBadge role={(user as any).corporateRole} size="md" />
                )}
                {user?.role === "admin" && !(user as any)?.corporateRole && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400/12 border border-amber-400/30 text-amber-400">
                    <Crown size={11} /> Admin
                  </span>
                )}
                {user?.isVerified ? (
                  <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle size={9} /> Verificado
                  </span>
                ) : (
                  <span className="text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <AlertCircle size={9} /> Pendente verificação
                  </span>
                )}
              </div>
            </div>
            {user?.role === "freelancer" && (
              <div className="flex-shrink-0 hidden sm:block">
                <ReputationRing score={user?.reputationScore ?? 0} />
              </div>
            )}
          </div>

          {/* Profile completion — subtle strip, not a card */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${completion}%`, background: completion >= 80 ? "hsl(88,100%,49%)" : completion >= 50 ? "hsl(45,100%,50%)" : "hsl(180,100%,50%)" }}
              />
            </div>
            <span className={`text-[10px] font-bold flex-shrink-0 ${completion >= 80 ? "text-primary" : completion >= 50 ? "text-yellow-400" : "text-secondary"}`}>
              {completion}% completo
            </span>
          </div>

          {/* Inline stats — no boxes */}
          {user?.role === "freelancer" && (
            <div className="flex items-center gap-4 mt-4 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <UserBadgeIcon user={user as any} size="md" />
                <div>
                  <p className="text-muted-foreground font-medium leading-none mb-0.5">Nível</p>
                  <p className={`font-bold text-sm ${LEVEL_COLORS[user?.level ?? "bronze"]?.text ?? "text-primary"}`}>{LEVEL_LABELS[user?.level ?? "bronze"]}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/8" />
              <div>
                <p className="text-muted-foreground font-medium leading-none mb-1">Extras feitos</p>
                <p className="font-bold text-primary text-base">{user?.completedJobs ?? 0}</p>
              </div>
              <div className="w-px h-8 bg-white/8" />
              <div>
                <p className="text-muted-foreground font-medium leading-none mb-1">Reputação</p>
                <p className="font-bold text-yellow-400 text-base">{(user?.reputationScore ?? 0).toFixed(1)} ★</p>
              </div>
            </div>
          )}
          {(user as any)?.corporateRole && (
            <div className="flex items-center gap-4 mt-4 text-xs flex-wrap">
              <div className="flex items-center gap-2">
                <CorporateBadgeIcon role={(user as any).corporateRole} size="md" />
                <div>
                  <p className="text-muted-foreground font-medium leading-none mb-0.5">Cargo</p>
                  <p className="font-bold text-sm text-yellow-400">{CORPORATE_ROLE_LABELS[(user as any).corporateRole] ?? (user as any).corporateRole}</p>
                </div>
              </div>
              <div className="w-px h-8 bg-white/8" />
              <div>
                <p className="text-muted-foreground font-medium leading-none mb-0.5">Permissão</p>
                <p className="font-bold text-sm text-amber-400">Super Admin</p>
              </div>
            </div>
          )}

          {/* Progression strip — freelancers only */}
          {user?.role === "freelancer" && (() => {
            const FEE_MAP: Record<string, number> = { bronze: 20, silver: 18, gold: 15, elite: 12, diamond: 10 };
            const NEXT_LEVEL_MAP: Record<string, { label: string; jobsNeeded: number; prevThreshold: number } | null> = {
              bronze: { label: "Júnior", jobsNeeded: 20, prevThreshold: 0 },
              silver: { label: "Intermediário", jobsNeeded: 100, prevThreshold: 20 },
              gold:   { label: "Sênior", jobsNeeded: 300, prevThreshold: 100 },
              elite:  { label: "Elite", jobsNeeded: 600, prevThreshold: 300 },
              diamond: null,
            };
            const currentFee = FEE_MAP[user?.level ?? "bronze"] ?? 20;
            const nextLvl = NEXT_LEVEL_MAP[user?.level ?? "bronze"];
            const jobsDone = user?.completedJobs ?? 0;
            const jobsToNext = nextLvl ? Math.max(0, nextLvl.jobsNeeded - jobsDone) : 0;
            const progressPct = nextLvl
              ? Math.min(100, Math.max(0, ((jobsDone - nextLvl.prevThreshold) / (nextLvl.jobsNeeded - nextLvl.prevThreshold)) * 100))
              : 100;
            return (
              <div className="mt-4 space-y-3">
                {/* Progression bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-muted-foreground">{jobsDone} extras concluídos · taxa {currentFee}%</span>
                    {nextLvl
                      ? <span className="text-primary font-semibold">+{jobsToNext} para {nextLvl.label}</span>
                      : <span className="text-primary font-bold">Nível máximo conquistado</span>
                    }
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(progressPct, 1.5)}%` }}
                      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, hsl(88,100%,44%), hsl(88,100%,56%))", boxShadow: "0 0 8px rgba(124,252,0,0.25)" }}
                    />
                  </div>
                </div>
                <Link href="/app/career">
                  <button className="w-full text-xs text-primary/70 hover:text-primary border border-primary/12 hover:border-primary/25 rounded-xl px-4 py-2.5 transition-all text-left flex items-center gap-2 group">
                    <TrendingUp size={12} className="flex-shrink-0" />
                    <span>Ver jornada de carreira completa</span>
                    <ArrowRight size={11} className="ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
            );
          })()}
        </div>

        {/* Sticky tabs */}
        <div className="sticky top-0 z-20 bg-[#060809]/95 backdrop-blur-xl border-b border-white/6 mb-5 -mx-4 sm:-mx-6 px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {TABS.map(tab => (
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
          {/* PERFIL TAB */}
          {activeTab === "perfil" && (
            <motion.form
              key="perfil"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <SectionCard
                title="Informações Pessoais"
                icon={<div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><User size={12} className="text-primary" /></div>}
              >
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Nome Completo</label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Telefone / WhatsApp</label>
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+55 11 99999-0000" className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Bio / Apresentação</label>
                    <textarea rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Conte um pouco sobre você..." className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/60 focus:outline-none text-sm resize-none transition-colors leading-relaxed" />
                  </div>
                  {user?.role === "freelancer" && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Resumo Profissional</label>
                      <textarea rows={4} value={form.professionalSummary} onChange={e => setForm(f => ({ ...f, professionalSummary: e.target.value }))} placeholder="Descreva sua trajetória profissional, diferenciais e objetivos..." className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/60 focus:outline-none text-sm resize-none transition-colors leading-relaxed" />
                    </div>
                  )}
                </div>
              </SectionCard>

              {user?.role === "company" && (
                <SectionCard title="Dados da Empresa" icon={<Building2 size={13} className="text-secondary" />}>
                  <Input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Nome da empresa" className="bg-white/5 border-white/10 focus:border-secondary/60 rounded-xl h-11" />
                </SectionCard>
              )}

              {user?.role === "freelancer" && (
                <>
                  <SectionCard title="Regiões de Atendimento" icon={<MapPin size={13} className="text-secondary" />} defaultOpen={false}>
                    <div className="flex flex-wrap gap-2">
                      {REGION_OPTIONS.map(reg => (
                        <button type="button" key={reg} onClick={() => toggleRegion(reg)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${serviceRegions.includes(reg) ? "bg-secondary text-black border-secondary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}>
                          {reg}
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Idiomas" icon={<Languages size={13} className="text-yellow-400" />} defaultOpen={false}>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map(lang => (
                        <button type="button" key={lang} onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${languages.includes(lang) ? "bg-yellow-400 text-black border-yellow-400" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"}`}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Chave PIX" icon={<CreditCard size={13} className="text-green-400" />} defaultOpen={false}>
                    <Input value={form.pixKey} onChange={e => setForm(f => ({ ...f, pixKey: e.target.value }))} placeholder="CPF, CNPJ, e-mail ou celular" className="bg-white/5 border-white/10 focus:border-green-400/60 rounded-xl h-11" />
                  </SectionCard>
                </>
              )}

              <Button type="submit" disabled={updateUser.isPending} className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl">
                {updateUser.isPending ? <><Loader2 size={15} className="mr-2 animate-spin" />Salvando...</> : "Salvar Alterações"}
              </Button>
            </motion.form>
          )}

          {/* ESPECIALIDADES TAB */}
          {activeTab === "especialidades" && user?.role === "freelancer" && (
            <motion.div key="especialidades" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="glass-card rounded-2xl p-5 border border-white/8">
                <h2 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <Award size={14} className="text-yellow-400" /> Minhas Especialidades
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Selecione as funções que você exerce</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat, i) => {
                    const isSelected = categories.includes(cat.name);
                    return (
                      <motion.button
                        key={cat.slug}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02, type: "spring", stiffness: 400, damping: 24 }}
                        onClick={() => toggleCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border skill-tag ${
                          isSelected
                            ? "bg-primary text-black border-primary neon-glow"
                            : "border-white/10 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                        }`}
                        style={isSelected ? {
                          textShadow: "0 0 8px rgba(0,0,0,0.5)",
                          boxShadow: "0 0 12px rgba(124,252,0,0.35), 0 0 0 1px rgba(124,252,0,0.5)",
                        } : undefined}
                      >
                        {cat.name}
                      </motion.button>
                    );
                  })}
                </div>
                {categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/6">
                    <p className="text-xs text-muted-foreground font-semibold mb-2">Selecionadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat, i) => (
                        <motion.span
                          key={cat}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary skill-tag"
                        >
                          {cat}
                          <button onClick={() => toggleCategory(cat)} className="hover:text-primary/70 transition-colors"><X size={9} /></button>
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => updateUser.mutateAsync({ id: user!.id!, data: { categories } as any }).then(() => { toast.success("Especialidades salvas!"); })}
                disabled={updateUser.isPending}
                className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold h-12 text-sm rounded-xl"
              >
                {updateUser.isPending ? <><Loader2 size={15} className="mr-2 animate-spin" />Salvando...</> : "Salvar Especialidades"}
              </Button>
            </motion.div>
          )}

          {/* EXPERIÊNCIA TAB */}
          {activeTab === "experiencia" && user?.role === "freelancer" && (
            <motion.div key="experiencia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8">
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Briefcase size={14} className="text-secondary" /> Experiência Profissional
                </h2>
                <ExperienceSection userId={user.id!} />
              </div>
            </motion.div>
          )}

          {/* HABILIDADES TAB */}
          {activeTab === "habilidades" && user?.role === "freelancer" && (
            <motion.div key="habilidades" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8">
                <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Zap size={14} className="text-primary" /> Habilidades
                </h2>
                <SkillsSection userId={user.id!} />
              </div>
            </motion.div>
          )}

          {/* PROGRESSÃO TAB */}
          {activeTab === "progressão" && user?.role === "freelancer" && (() => {
            const lvl = user?.level ?? "bronze";
            const jobs = user?.completedJobs ?? 0;
            const rep = user?.reputationScore ?? 0;

            const LEVELS = [
              {
                key: "bronze", label: "Iniciante", min: 0, max: 19, fee: 20, net: 80,
                color: "text-sky-400", border: "border-sky-400/30", bg: "bg-sky-400/8",
                glow: "", icon: "🔵",
                perks: ["Acesso a extras básicos", "Suporte padrão da plataforma"],
                reqs: [{ label: "Nível de entrada — sem requisitos", met: true }],
              },
              {
                key: "silver", label: "Júnior", min: 20, max: 99, fee: 18, net: 82,
                color: "text-cyan-400", border: "border-cyan-400/30", bg: "bg-cyan-400/8",
                glow: "shadow-[0_0_16px_rgba(0,229,255,0.12)]", icon: "⚡",
                perks: ["Extras premium desbloqueados", "Destaque no perfil"],
                reqs: [
                  { label: "20 extras concluídos", met: jobs >= 20 },
                  { label: "Avaliação ≥ 4.5 ⭐", met: rep >= 4.5 },
                ],
              },
              {
                key: "gold", label: "Intermediário", min: 100, max: 299, fee: 15, net: 85,
                color: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/8",
                glow: "shadow-[0_0_16px_rgba(250,204,21,0.12)]", icon: "🥇",
                perks: ["Extras exclusivos", "Bônus automático por extra"],
                reqs: [
                  { label: "100 extras concluídos", met: jobs >= 100 },
                  { label: "Avaliação ≥ 4.7 ⭐", met: rep >= 4.7 },
                ],
              },
              {
                key: "elite", label: "Sênior", min: 300, max: 599, fee: 12, net: 88,
                color: "text-primary", border: "border-primary/30", bg: "bg-primary/8",
                glow: "shadow-[0_0_20px_rgba(124,252,0,0.15)]", icon: "👑",
                perks: ["Benefícios premium da plataforma", "Suporte prioritário"],
                reqs: [
                  { label: "300 extras concluídos", met: jobs >= 300 },
                  { label: "Avaliação ≥ 4.8 ⭐", met: rep >= 4.8 },
                ],
              },
              {
                key: "diamond", label: "Elite", min: 600, max: Infinity, fee: 10, net: 90,
                color: "text-amber-300", border: "border-amber-300/30", bg: "bg-amber-300/8",
                glow: "shadow-[0_0_22px_rgba(252,211,77,0.18)]", icon: "💎",
                perks: ["Todos os benefícios", "Acesso VIP + suporte dedicado"],
                reqs: [
                  { label: "600 extras concluídos", met: jobs >= 600 },
                  { label: "Avaliação ≥ 4.9 ⭐", met: rep >= 4.9 },
                ],
              },
            ];

            const currentIdx = LEVELS.findIndex(l => l.key === lvl);
            const current = LEVELS[currentIdx] ?? LEVELS[0];
            const next = LEVELS[currentIdx + 1];
            const progress = next
              ? Math.min(100, ((jobs - current.min) / (next.min - current.min)) * 100)
              : 100;

            return (
              <motion.div key="progressão" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                {/* Current level hero */}
                <div className={`glass-card rounded-2xl p-5 border ${current.border} ${current.bg} ${current.glow}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border ${current.border} ${current.bg} flex-shrink-0`}>
                      {current.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Nível Atual</p>
                      <p className={`text-2xl font-bold ${current.color}`}>{current.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Taxa da plataforma: <span className="font-bold text-foreground">{current.fee}%</span> · Você fica: <span className="font-bold text-green-400">{current.net}%</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-3xl font-bold tabular-nums ${current.color}`}>{jobs}</p>
                      <p className="text-[10px] text-muted-foreground">extras feitos</p>
                    </div>
                  </div>

                  {next && (
                    <div className="mt-5">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-muted-foreground font-medium">Progresso para {next.label}</span>
                        <span className={`font-bold ${current.color}`}>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2.5 bg-white/6 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
                          className={`h-full rounded-full`}
                          style={{ background: current.key === "bronze" ? "#22d3ee" : current.key === "silver" ? "#facc15" : current.key === "gold" ? "#7CFC00" : "#7CFC00" }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {next.min - jobs > 0 ? `Faltam ${next.min - jobs} extras para ${next.label}` : `Nível ${next.label} desbloqueado!`}
                      </p>
                    </div>
                  )}
                  {!next && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-primary">
                      <Crown size={13} /> Você atingiu o nível máximo da plataforma!
                    </div>
                  )}
                </div>

                {/* Next level requirements */}
                {next && (
                  <div className={`glass-card rounded-2xl p-5 border ${next.border}`}>
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <Trophy size={14} className={next.color} /> Requisitos para {next.label}
                    </h3>
                    <div className="space-y-3">
                      {next.reqs.map((req, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${req.met ? "bg-green-400/20 border border-green-400/40" : "bg-white/5 border border-white/12"}`}>
                            {req.met
                              ? <CheckCircle size={11} className="text-green-400" />
                              : <Lock size={10} className="text-muted-foreground/50" />
                            }
                          </div>
                          <span className={`text-sm ${req.met ? "text-foreground" : "text-muted-foreground"}`}>{req.label}</span>
                          {req.met && <span className="ml-auto text-[10px] text-green-400 font-bold">✓ OK</span>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/6">
                      <p className="text-[10px] text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Benefícios desbloqueados em {next.label}</p>
                      {next.perks.map((perk, i) => (
                        <p key={i} className={`text-xs ${next.color} flex items-center gap-1.5 mt-1`}>
                          <Zap size={10} /> {perk}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reputation score */}
                <div className="glass-card rounded-2xl p-5 border border-white/8">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> Reputação
                  </h3>
                  <div className="flex items-center gap-5">
                    <div className="flex-shrink-0">
                      <ReputationRing score={rep} size={80} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                      {rep > 0 ? (
                        <>
                          <p className="text-2xl font-black text-yellow-400 leading-none">{rep.toFixed(1)}</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={11}
                                className={s <= Math.round(rep) ? "text-yellow-400 fill-yellow-400" : "text-white/20"} />
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground">Nota média consolidada</p>
                        </>
                      ) : (
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          Nenhuma avaliação<br />recebida ainda.
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-3">Baseado em avaliações reais de empresas contratantes</p>
                </div>

                {/* All levels timeline */}
                <div className="glass-card rounded-2xl p-5 border border-white/8">
                  <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-secondary" /> Todos os Níveis
                  </h3>
                  <div className="space-y-3">
                    {LEVELS.map((lvlItem, i) => {
                      const isCurrentLvl = lvlItem.key === lvl;
                      const isPast = currentIdx > i;
                      const isFuture = currentIdx < i;
                      return (
                        <div key={lvlItem.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isCurrentLvl ? `${lvlItem.border} ${lvlItem.bg} ${lvlItem.glow}` :
                          isPast ? "border-green-400/15 bg-green-400/4" :
                          "border-white/6 bg-white/2 opacity-50"
                        }`}>
                          <div className="text-xl flex-shrink-0">{lvlItem.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-bold ${isCurrentLvl ? lvlItem.color : isPast ? "text-green-400" : "text-muted-foreground"}`}>{lvlItem.label}</p>
                              {isCurrentLvl && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-full font-bold">ATUAL</span>}
                              {isPast && <CheckCircle size={10} className="text-green-400" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{lvlItem.min === 0 ? "0–19" : lvlItem.max === Infinity ? `${lvlItem.min}+` : `${lvlItem.min}–${lvlItem.max}`} extras · Taxa {lvlItem.fee}%</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-lg font-bold ${isCurrentLvl ? lvlItem.color : isPast ? "text-green-400" : "text-muted-foreground/40"}`}>{lvlItem.net}%</p>
                            <p className="text-[9px] text-muted-foreground">você fica</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* CONFIG TAB */}
          {activeTab === "config" && (
            <motion.div key="config" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <h2 className="font-semibold text-sm flex items-center gap-2">
                  <Shield size={14} className="text-muted-foreground" /> Configurações
                </h2>
                <div className="p-3 rounded-xl bg-white/3 border border-white/6">
                  <p className="text-xs font-semibold">Email</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/6">
                  <p className="text-xs font-semibold">Função</p>
                  <p className="text-sm text-muted-foreground mt-0.5 capitalize">{user?.role}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/3 border border-white/6">
                  <p className="text-xs font-semibold">Código de Referência</p>
                  <p className="text-sm font-mono text-primary mt-0.5">{user?.referralCode}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
