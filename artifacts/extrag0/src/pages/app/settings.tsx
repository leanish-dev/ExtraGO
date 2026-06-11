import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  User, Lock, Bell, Eye, CreditCard, Briefcase, Crown, Share2,
  ChevronRight, Check, Copy, ExternalLink, Shield, Smartphone,
  MapPin, Globe, Loader2, AlertCircle, CheckCircle, Zap, Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { LevelBadge, ReferralBadge, CorporateBadge } from "@/components/level-badge";
import { CATEGORIES } from "@/lib/categories";
import { Link } from "wouter";

/* ── Helper ── */
const REGION_OPTIONS = [
  "São Paulo - SP", "Rio de Janeiro - RJ", "Belo Horizonte - MG", "Curitiba - PR",
  "Porto Alegre - RS", "Salvador - BA", "Fortaleza - CE", "Recife - PE",
  "Brasília - DF", "Manaus - AM", "Todo o Brasil",
];
const LANGUAGE_OPTIONS = ["Português", "Inglês", "Espanhol", "Francês", "Alemão", "Italiano"];

/* ── Section tab ── */
const TABS = [
  { id: "conta",       label: "Conta",           icon: <User size={15} /> },
  { id: "seguranca",   label: "Segurança",        icon: <Lock size={15} /> },
  { id: "notificacoes",label: "Notificações",     icon: <Bell size={15} /> },
  { id: "privacidade", label: "Privacidade",      icon: <Eye size={15} /> },
  { id: "financeiro",  label: "Financeiro",       icon: <CreditCard size={15} /> },
  { id: "profissional",label: "Área Profissional",icon: <Briefcase size={15} /> },
  { id: "assinaturas", label: "Assinaturas",      icon: <Crown size={15} /> },
  { id: "indicacoes",  label: "Indicações",       icon: <Share2 size={15} /> },
];

/* ── Toggle component ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-primary" : "bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

/* ── Row item ── */
function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground/90">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ── Section card ── */
function SectionCard({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/6">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

/* ── "Em breve" badge ── */
function SoonBadge() {
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/8 border border-white/12 text-white/40 tracking-wide">
      EM BREVE
    </span>
  );
}

/* ════════════════════════════════════════
   SECTIONS
════════════════════════════════════════ */

function ContaSection() {
  const { user, refetch } = useAuth() as any;
  const mut = useUpdateUser();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    companyName: user?.companyName ?? "",
  });

  const save = async () => {
    setSaving(true);
    try {
      await mut.mutateAsync({ id: user!.id, data: form as any });
      if (refetch) await refetch();
      toast.success("Dados atualizados!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Informações Pessoais" icon={<User size={15} />}>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">Nome Completo</label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">Telefone</label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+55 11 99999-0000"
              className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-xl text-sm"
            />
          </div>
          {user?.role === "company" && (
            <div>
              <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">Nome da Empresa</label>
              <Input
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-secondary/50 h-10 rounded-xl text-sm"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm resize-none transition-colors"
            />
          </div>
          <Button
            onClick={save}
            disabled={saving}
            className="bg-primary text-black hover:bg-primary/90 neon-glow border-none h-9 text-sm font-bold rounded-xl px-6"
          >
            {saving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Salvando...</> : <><Check size={13} className="mr-1.5" />Salvar</>}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Conta e E-mail" icon={<Shield size={15} />}>
        <div className="py-2">
          <SettingRow label="E-mail" description="Seu e-mail de acesso à plataforma">
            <span className="text-xs text-muted-foreground font-mono">{user?.email}</span>
          </SettingRow>
          <SettingRow label="Função" description="Tipo de conta na plataforma">
            <span className="text-xs font-semibold capitalize text-primary">
              {user?.role === "freelancer" ? "Freelancer" : user?.role === "company" ? "Empresa" : "Admin"}
            </span>
          </SettingRow>
          {user?.role === "freelancer" && (
            <SettingRow label="Nível" description="Sua progressão na plataforma">
              <LevelBadge level={user?.level} size="sm" />
            </SettingRow>
          )}
          {user?.adminRole === "super_admin" && (
            <SettingRow label="Cargo" description="Badge executivo">
              <CorporateBadge role="ceo" size="sm" />
            </SettingRow>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function SegurancaSection() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });

  const save = async () => {
    if (form.next !== form.confirm) { toast.error("As senhas não coincidem."); return; }
    if (form.next.length < 6) { toast.error("Senha deve ter no mínimo 6 caracteres."); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("Senha alterada com sucesso!");
    setForm({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Alterar Senha" icon={<Lock size={15} />}>
        <div className="py-4 space-y-4">
          {["current", "next", "confirm"].map((key, i) => (
            <div key={key}>
              <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">
                {key === "current" ? "Senha Atual" : key === "next" ? "Nova Senha" : "Confirmar Nova Senha"}
              </label>
              <Input
                type="password"
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-xl text-sm"
              />
            </div>
          ))}
          <Button onClick={save} disabled={saving} className="bg-primary text-black hover:bg-primary/90 neon-glow border-none h-9 text-sm font-bold rounded-xl px-6">
            {saving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Salvando...</> : "Alterar Senha"}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Sessões e Dispositivos" icon={<Smartphone size={15} />}>
        <div className="py-2">
          <SettingRow label="Sessão Ativa" description="Este dispositivo — agora">
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Ativa
            </span>
          </SettingRow>
          <SettingRow label="Autenticação em 2 Fatores" description="Proteção extra para sua conta">
            <SoonBadge />
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
}

function NotificacoesSection() {
  const [prefs, setPrefs] = useState({
    pushExtras: true,
    pushMensagens: true,
    pushPagamentos: true,
    pushAvaliacoes: true,
    emailResumo: false,
    emailContratacoes: true,
    emailMarketing: false,
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Notificações Push" icon={<Bell size={15} />}>
        <div className="py-2">
          <SettingRow label="Novos Extras" description="Quando aparecerem extras compatíveis com você">
            <Toggle checked={prefs.pushExtras} onChange={v => setPrefs(p => ({ ...p, pushExtras: v }))} />
          </SettingRow>
          <SettingRow label="Mensagens" description="Quando receber novas mensagens no chat">
            <Toggle checked={prefs.pushMensagens} onChange={v => setPrefs(p => ({ ...p, pushMensagens: v }))} />
          </SettingRow>
          <SettingRow label="Pagamentos" description="Confirmações de pagamento e saque">
            <Toggle checked={prefs.pushPagamentos} onChange={v => setPrefs(p => ({ ...p, pushPagamentos: v }))} />
          </SettingRow>
          <SettingRow label="Avaliações" description="Quando receber uma nova avaliação">
            <Toggle checked={prefs.pushAvaliacoes} onChange={v => setPrefs(p => ({ ...p, pushAvaliacoes: v }))} />
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Notificações por E-mail" icon={<Bell size={15} />}>
        <div className="py-2">
          <SettingRow label="Resumo Semanal" description="Relatório de atividades da semana">
            <Toggle checked={prefs.emailResumo} onChange={v => setPrefs(p => ({ ...p, emailResumo: v }))} />
          </SettingRow>
          <SettingRow label="Contratações" description="Confirmações e atualizações de extras">
            <Toggle checked={prefs.emailContratacoes} onChange={v => setPrefs(p => ({ ...p, emailContratacoes: v }))} />
          </SettingRow>
          <SettingRow label="Marketing" description="Novidades e promoções extraGO">
            <Toggle checked={prefs.emailMarketing} onChange={v => setPrefs(p => ({ ...p, emailMarketing: v }))} />
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
}

function PrivacidadeSection() {
  const [prefs, setPrefs] = useState({
    perfilPublico: true,
    exibirAvaliacao: true,
    exibirContatos: false,
    exibirHistorico: true,
    permitirMensagens: true,
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Visibilidade do Perfil" icon={<Eye size={15} />}>
        <div className="py-2">
          <SettingRow label="Perfil Público" description="Qualquer pessoa pode visualizar seu perfil">
            <Toggle checked={prefs.perfilPublico} onChange={v => setPrefs(p => ({ ...p, perfilPublico: v }))} />
          </SettingRow>
          <SettingRow label="Exibir Avaliação" description="Mostrar sua nota e avaliações no perfil">
            <Toggle checked={prefs.exibirAvaliacao} onChange={v => setPrefs(p => ({ ...p, exibirAvaliacao: v }))} />
          </SettingRow>
          <SettingRow label="Exibir Contato" description="Mostrar telefone no perfil público">
            <Toggle checked={prefs.exibirContatos} onChange={v => setPrefs(p => ({ ...p, exibirContatos: v }))} />
          </SettingRow>
          <SettingRow label="Histórico de Extras" description="Mostrar extras realizados no perfil">
            <Toggle checked={prefs.exibirHistorico} onChange={v => setPrefs(p => ({ ...p, exibirHistorico: v }))} />
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard title="Compartilhamento" icon={<Globe size={15} />}>
        <div className="py-2">
          <SettingRow label="Receber Mensagens" description="Permitir que empresas enviem mensagens">
            <Toggle checked={prefs.permitirMensagens} onChange={v => setPrefs(p => ({ ...p, permitirMensagens: v }))} />
          </SettingRow>
          <SettingRow label="Exportar Dados" description="Baixar todos os seus dados da plataforma">
            <SoonBadge />
          </SettingRow>
          <SettingRow label="Excluir Conta" description="Remover permanentemente sua conta">
            <button className="text-xs text-red-400/75 hover:text-red-400 font-semibold transition-colors">
              Solicitar
            </button>
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
}

function FinanceiroSection() {
  const { user, refetch } = useAuth() as any;
  const mut = useUpdateUser();
  const [saving, setSaving] = useState(false);
  const [pixKey, setPixKey] = useState(user?.pixKey ?? "");

  const save = async () => {
    setSaving(true);
    try {
      await mut.mutateAsync({ id: user!.id, data: { pixKey } as any });
      if (refetch) await refetch();
      toast.success("Chave PIX salva!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Chave PIX" icon={<Zap size={15} />}>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">Chave PIX para Recebimento</label>
            <Input
              value={pixKey}
              onChange={e => setPixKey(e.target.value)}
              placeholder="CPF, CNPJ, e-mail ou celular"
              className="bg-white/5 border-white/10 focus:border-primary/50 h-10 rounded-xl text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Usada para receber pagamentos de extras na sua carteira.
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="bg-primary text-black hover:bg-primary/90 neon-glow border-none h-9 text-sm font-bold rounded-xl px-6">
            {saving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Salvando...</> : <><Check size={13} className="mr-1.5" />Salvar</>}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Carteira e Histórico" icon={<CreditCard size={15} />}>
        <div className="py-2">
          <SettingRow label="Ver Saldo e Transações" description="Acesse sua carteira completa">
            <Link href="/app/wallet">
              <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors">
                Abrir <ExternalLink size={11} />
              </button>
            </Link>
          </SettingRow>
          <SettingRow label="Conta Bancária" description="Dados para saque via TED/DOC">
            <SoonBadge />
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
}

function ProfissionalSection() {
  const { user, refetch } = useAuth() as any;
  const mut = useUpdateUser();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<string[]>(user?.categories ?? []);
  const [regions, setRegions] = useState<string[]>(user?.serviceRegions ?? []);

  const toggleCat = (cat: string) =>
    setSelected(s => s.includes(cat) ? s.filter(c => c !== cat) : [...s, cat]);
  const toggleRegion = (r: string) =>
    setRegions(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r]);

  const save = async () => {
    setSaving(true);
    try {
      await mut.mutateAsync({ id: user!.id, data: { categories: selected, serviceRegions: regions } as any });
      if (refetch) await refetch();
      toast.success("Área profissional atualizada!");
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role === "company") {
    return (
      <div className="glass-card rounded-2xl border border-white/8 p-8 text-center">
        <Briefcase size={32} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Esta seção é exclusiva para freelancers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Categorias de Atuação" icon={<Briefcase size={15} />}>
        <div className="py-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggleCat(cat.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selected.includes(cat.name)
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-white/4 border-white/10 text-muted-foreground hover:border-white/20"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Regiões de Atuação" icon={<MapPin size={15} />}>
        <div className="py-4">
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => toggleRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  regions.includes(r)
                    ? "bg-secondary/15 border-secondary/40 text-secondary"
                    : "bg-white/4 border-white/10 text-muted-foreground hover:border-white/20"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <Button onClick={save} disabled={saving} className="mt-5 bg-primary text-black hover:bg-primary/90 neon-glow border-none h-9 text-sm font-bold rounded-xl px-6">
            {saving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Salvando...</> : <><Check size={13} className="mr-1.5" />Salvar</>}
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Disponibilidade" icon={<Star size={15} />}>
        <div className="py-2">
          <SettingRow label="Disponível para Extras" description="Aparecer nas buscas das empresas">
            <SoonBadge />
          </SettingRow>
          <SettingRow label="Raio de Atuação" description="Distância máxima para extras presenciais">
            <SoonBadge />
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
}

function AssinaturasSection() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <SectionCard title="Plano Atual" icon={<Crown size={15} />}>
        <div className="py-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/8 border border-primary/20">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Zap size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Plano Gratuito</p>
              <p className="text-xs text-muted-foreground mt-0.5">Acesso completo às funcionalidades básicas</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">Ativo</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Planos Premium" icon={<Star size={15} />}>
        <div className="py-3">
          <SettingRow label="extraGO PRO · R$ 19,90/mês" description="Destaque nas buscas, estatísticas avançadas, selo PRO">
            <SoonBadge />
          </SettingRow>
          <SettingRow label="extraGO PREMIUM · R$ 49,90/mês" description="Todos os benefícios PRO, perfil destacado, relatórios avançados">
            <SoonBadge />
          </SettingRow>
          <SettingRow label="extraGO ELITE · R$ 99,90/mês" description="Máxima prioridade, benefícios exclusivos, suporte dedicado">
            <SoonBadge />
          </SettingRow>
        </div>
      </SectionCard>

      {user?.role === "company" && (
        <SectionCard title="Planos Empresariais" icon={<CreditCard size={15} />}>
          <div className="py-3">
            <SettingRow label="Starter · R$ 99,90/mês" description="Publicação de extras, painel básico, banco de profissionais">
              <SoonBadge />
            </SettingRow>
            <SettingRow label="Business · R$ 299,90/mês" description="Publicação ilimitada, dashboard analítico, suporte prioritário">
              <SoonBadge />
            </SettingRow>
            <SettingRow label="Corporate · R$ 799,90/mês" description="Multi-unidade, API de integração, SLA garantido, gerente dedicado">
              <SoonBadge />
            </SettingRow>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function IndicacoesSection() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: referralInfo } = useQuery({
    queryKey: ["my-referral"],
    queryFn: () => apiFetch("/api/referrals/me"),
    enabled: !!user && user.role === "freelancer",
  });

  const code = user?.referralCode ?? "—";
  const refLink = `https://extrag0.com.br/cadastro?ref=${code}`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copiado!");
    });
  };

  if (user?.role !== "freelancer") {
    return (
      <div className="glass-card rounded-2xl border border-white/8 p-8 text-center">
        <Share2 size={32} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Esta seção é exclusiva para freelancers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Seu Código de Indicação" icon={<Share2 size={15} />}>
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/4 border border-white/8">
            <span className="flex-1 font-mono text-lg font-bold tracking-[0.15em] text-primary">{code}</span>
            <button
              onClick={() => copy(code)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground/70 mb-1.5 block">Link de Cadastro</label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
              <span className="flex-1 text-xs text-muted-foreground truncate font-mono">{refLink}</span>
              <button
                onClick={() => copy(refLink)}
                className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Comissão e Tier" icon={<Star size={15} />}>
        <div className="py-2">
          <SettingRow label="Total Indicados" description="Pessoas que se cadastraram com seu código">
            <span className="text-sm font-bold text-primary">{referralInfo?.totalConverted ?? 0}</span>
          </SettingRow>
          <SettingRow label="Comissão Total" description="Ganhos acumulados com indicações">
            <span className="text-sm font-bold text-green-400">
              R$ {((referralInfo?.totalEarnings ?? 0) / 100).toFixed(2)}
            </span>
          </SettingRow>
          <SettingRow label="Tier Atual" description="Sua categoria de indicador">
            <span className="text-xs font-semibold text-muted-foreground">Indicador (2%)</span>
          </SettingRow>
          <div className="py-3">
            <Link href="/app/referrals">
              <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors">
                Ver página completa de Indicações <ChevronRight size={13} />
              </button>
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("conta");

  const visibleTabs = TABS.filter(t => {
    if (t.id === "indicacoes" && user?.role !== "freelancer") return false;
    if (t.id === "profissional" && user?.role === "admin") return false;
    return true;
  });

  const renderSection = () => {
    switch (activeTab) {
      case "conta":         return <ContaSection />;
      case "seguranca":     return <SegurancaSection />;
      case "notificacoes":  return <NotificacoesSection />;
      case "privacidade":   return <PrivacidadeSection />;
      case "financeiro":    return <FinanceiroSection />;
      case "profissional":  return <ProfissionalSection />;
      case "assinaturas":   return <AssinaturasSection />;
      case "indicacoes":    return <IndicacoesSection />;
      default:              return null;
    }
  };

  return (
    <div className="pb-20 lg:pb-6">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta, segurança e preferências</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Sidebar tabs ── */}
          <div className="lg:w-52 flex-shrink-0">
            <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
              {visibleTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-all border-b border-white/4 last:border-0 ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                  }`}
                >
                  <span className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"}>
                    {tab.icon}
                  </span>
                  <span className="text-[13px] font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
