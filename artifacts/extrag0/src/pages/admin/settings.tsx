import React, { useState, useEffect } from "react";
import { useAdminSettings, useUpdateAdminSetting } from "@/lib/admin-api";
import { Settings, Save, RefreshCw, ToggleLeft, ToggleRight, AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  financial: { label: "Financeiro", color: "text-primary", icon: "💰" },
  distribution: { label: "Distribuição", color: "text-cyan-400", icon: "📊" },
  referral: { label: "Indicações", color: "text-yellow-400", icon: "🎯" },
  ranking: { label: "Ranking", color: "text-purple-400", icon: "🏆" },
  features: { label: "Funcionalidades", color: "text-orange-400", icon: "⚙️" },
  system: { label: "Sistema", color: "text-red-400", icon: "🔧" },
  general: { label: "Geral", color: "text-muted-foreground", icon: "📋" },
};

interface EditState {
  [key: string]: string;
}

export default function AdminSettingsPage() {
  const { data: settings = [], isLoading, refetch } = useAdminSettings();
  const updateMut = useUpdateAdminSetting();

  const [edits, setEdits] = useState<EditState>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: EditState = {};
    settings.forEach(s => { initial[s.key] = s.value; });
    setEdits(initial);
  }, [settings]);

  const grouped = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof settings>);

  const handleSave = async (key: string) => {
    const val = edits[key];
    if (val === undefined) return;
    setSaving(s => ({ ...s, [key]: true }));
    try {
      await updateMut.mutateAsync({ key, value: val });
      toast.success("Configuração salva!");
      refetch();
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const isBoolean = (key: string) => edits[key] === "true" || edits[key] === "false";
  const isDirty = (key: string) => {
    const orig = settings.find(s => s.key === key)?.value;
    return orig !== edits[key];
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 page-enter">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Settings size={22} className="text-primary" />
            Configurações da Plataforma
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Parâmetros financeiros, operacionais e de funcionalidades</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/8 border border-white/8 text-xs font-semibold transition-colors"
        >
          <RefreshCw size={13} /> Atualizar
        </button>
      </div>

      {/* System warning */}
      {edits["maintenance_mode"] === "true" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-400/8 border border-red-400/25">
          <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300 font-semibold">
            A plataforma está em <strong>modo de manutenção</strong> — usuários não conseguem acessar.
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([category, categorySettings]) => {
        const meta = CATEGORY_LABELS[category] ?? CATEGORY_LABELS.general;
        return (
          <div key={category} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">{meta.icon}</span>
              <h2 className={`text-sm font-black ${meta.color}`}>{meta.label}</h2>
              <span className="text-[10px] text-muted-foreground">({categorySettings.length} configs)</span>
            </div>

            <div className="space-y-3">
              {categorySettings.map(setting => {
                const val = edits[setting.key] ?? setting.value;
                const dirty = isDirty(setting.key);
                const isBool = isBoolean(setting.key);
                const isSaving = saving[setting.key] ?? false;

                return (
                  <div
                    key={setting.key}
                    className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${dirty ? "bg-primary/5 border border-primary/15" : "bg-white/3 border border-transparent"}`}
                  >
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{setting.label}</p>
                        {dirty && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20">
                            Modificado
                          </span>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{setting.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{setting.key}</p>
                    </div>

                    {/* Control */}
                    {isBool ? (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold ${val === "true" ? "text-primary" : "text-muted-foreground"}`}>
                          {val === "true" ? "Ativo" : "Inativo"}
                        </span>
                        <button
                          onClick={() => setEdits(e => ({ ...e, [setting.key]: val === "true" ? "false" : "true" }))}
                          className={`transition-colors ${val === "true" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          {val === "true"
                            ? <ToggleRight size={28} className="text-primary" />
                            : <ToggleLeft size={28} />
                          }
                        </button>
                        {dirty && (
                          <button
                            onClick={() => handleSave(setting.key)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-black font-bold text-[10px] hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <RefreshCw size={10} className="animate-spin" /> : <Save size={10} />}
                            Salvar
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Input
                          value={val}
                          onChange={e => setEdits(ed => ({ ...ed, [setting.key]: e.target.value }))}
                          className="w-28 h-8 text-xs text-center bg-white/5 border-white/10 focus:border-primary rounded-xl"
                        />
                        {dirty && (
                          <button
                            onClick={() => handleSave(setting.key)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-black font-bold text-[10px] hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <RefreshCw size={10} className="animate-spin" /> : <Save size={10} />}
                            Salvar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-start gap-2 p-3.5 rounded-xl bg-white/3 border border-white/6">
        <Info size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground">
          Alterações são aplicadas imediatamente. O histórico de mudanças é registrado nos <strong>Logs de Auditoria</strong>.
          Configurações marcadas como &quot;Modificado&quot; ainda não foram salvas.
        </p>
      </div>
    </div>
  );
}
