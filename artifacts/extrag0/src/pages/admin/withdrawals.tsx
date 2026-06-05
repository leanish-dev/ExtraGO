import React, { useState } from "react";
import {
  useAdminListWithdrawals, useAdminApproveWithdrawal, useAdminListDepositRequests,
  useAdminConfirmDepositRequest, useAdminApproveDepositRequest, useAdminRejectDepositRequest,
} from "@workspace/api-client-react";
import type { Transaction, DepositRequest } from "@workspace/api-client-react";
import {
  CreditCard, CheckCircle, Clock, Search, XCircle, Building2,
  Send, ArrowDownLeft, Loader2, AlertTriangle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch } from "@/lib/api-fetch";
import { motion } from "framer-motion";

type MainTab = "withdrawals" | "deposits";
type WithdrawFilter = "pending" | "completed" | "rejected";
type DepositFilter = "pending" | "confirmed" | "credited" | "rejected";

const DEPOSIT_STATUS_LABELS: Record<string, { label: string; chip: string }> = {
  pending: { label: "Aguardando", chip: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  confirmed: { label: "Recebido", chip: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  credited: { label: "Creditado", chip: "text-primary bg-primary/10 border-primary/30" },
  rejected: { label: "Rejeitado", chip: "text-destructive bg-destructive/10 border-destructive/30" },
};

function WithdrawalCard({ w, onApprove, onReject, approving, rejecting }: {
  w: Transaction & { userName?: string; userEmail?: string };
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
  rejecting: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            w.status === "pending" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
            : w.status === "rejected" ? "bg-destructive/10 text-destructive border border-destructive/20"
            : "bg-primary/10 text-primary border border-primary/20"
          }`}>
            {w.status === "pending" ? <Clock size={16} /> : w.status === "rejected" ? <XCircle size={16} /> : <CheckCircle size={16} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">Saque #{w.id}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                w.status === "pending" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                : w.status === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30"
                : "text-primary bg-primary/10 border-primary/30"
              }`}>
                {w.status === "pending" ? "Pendente" : w.status === "rejected" ? "Recusado" : "Processado"}
              </span>
            </div>
            {(w as any).userName && (
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{(w as any).userName}</p>
            )}
            {(w as any).userEmail && (
              <p className="text-[11px] text-muted-foreground/70">{(w as any).userEmail}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {w.createdAt ? format(new Date(w.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ""}
            </p>
            {w.pixKey && (
              <div className="flex items-center gap-1.5 mt-1">
                <Send size={10} className="text-muted-foreground" />
                <p className="text-xs font-mono text-muted-foreground">{w.pixKey}</p>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0 space-y-2">
          <p className="text-xl font-bold text-yellow-400 tabular-nums">R$ {((w.amount ?? 0) / 100).toFixed(2)}</p>
          {w.status === "pending" && (
            <div className="flex gap-1.5 justify-end">
              <Button
                size="sm" variant="ghost"
                className="text-xs h-8 text-destructive hover:bg-destructive/10 border border-destructive/20 gap-1"
                onClick={onReject} disabled={rejecting}
              >
                {rejecting ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={10} />} Recusar
              </Button>
              <Button
                size="sm"
                className="bg-primary text-black hover:bg-primary/90 font-semibold text-xs h-8 gap-1"
                onClick={onApprove} disabled={approving}
              >
                {approving ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Aprovar PIX
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DepositCard({ d, onConfirm, onApprove, onReject, loading }: {
  d: DepositRequest & { userName?: string; userEmail?: string; companyName?: string };
  onConfirm: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const meta = DEPOSIT_STATUS_LABELS[d.status ?? "pending"] ?? DEPOSIT_STATUS_LABELS.pending;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            d.status === "pending" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
            : d.status === "confirmed" ? "bg-blue-400/10 text-blue-400 border border-blue-400/20"
            : d.status === "credited" ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}>
            {d.status === "pending" ? <Clock size={16} />
             : d.status === "confirmed" ? <ArrowDownLeft size={16} />
             : d.status === "credited" ? <CheckCircle size={16} />
             : <XCircle size={16} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">Depósito #{d.id}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${meta.chip}`}>{meta.label}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-muted-foreground font-medium">
                {d.paymentMethod === "pix" ? "PIX" : d.paymentMethod === "credit_card" ? "Cartão" : "Transferência"}
              </span>
            </div>
            {(d as any).companyName && (
              <p className="text-xs text-muted-foreground mt-0.5 font-medium flex items-center gap-1">
                <Building2 size={11} /> {(d as any).companyName}
              </p>
            )}
            {(d as any).userName && !(d as any).companyName && (
              <p className="text-xs text-muted-foreground mt-0.5">{(d as any).userName}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {d.createdAt ? format(new Date(d.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ""}
            </p>
            {d.adminNote && (
              <p className="text-[11px] text-muted-foreground/70 mt-1 italic">Nota: {d.adminNote}</p>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0 space-y-2">
          <p className="text-xl font-bold text-primary tabular-nums">+R$ {((d.amount ?? 0) / 100).toFixed(2)}</p>
          {d.status === "pending" && (
            <div className="flex flex-col gap-1.5 items-end">
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost"
                  className="text-xs h-7 text-destructive hover:bg-destructive/10 border border-destructive/20 gap-1"
                  onClick={onReject} disabled={loading}>
                  <XCircle size={10} /> Rejeitar
                </Button>
                <Button size="sm"
                  className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-400/30 text-xs h-7 gap-1"
                  onClick={onConfirm} disabled={loading}>
                  <ArrowDownLeft size={10} /> Confirmar Recebimento
                </Button>
              </div>
            </div>
          )}
          {d.status === "confirmed" && (
            <div className="flex gap-1.5 justify-end">
              <Button size="sm"
                className="bg-primary text-black hover:bg-primary/90 font-semibold text-xs h-7 gap-1"
                onClick={onApprove} disabled={loading}>
                {loading ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Creditar Saldo
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminWithdrawalsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("withdrawals");
  const [withdrawFilter, setWithdrawFilter] = useState<WithdrawFilter>("pending");
  const [depositFilter, setDepositFilter] = useState<DepositFilter>("pending");
  const [search, setSearch] = useState("");
  const [loadingDepositId, setLoadingDepositId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const { data: withdrawals = [], isLoading: wLoading, refetch: refetchW } = useAdminListWithdrawals({ status: withdrawFilter });
  const { data: deposits = [], isLoading: dLoading, refetch: refetchD } = useAdminListDepositRequests(
    { status: depositFilter },
    { query: { queryKey: ["admin-deposits", depositFilter] } }
  );

  const approveMutation = useAdminApproveWithdrawal();
  const confirmDepositMutation = useAdminConfirmDepositRequest();
  const approveDepositMutation = useAdminApproveDepositRequest();
  const rejectDepositMutation = useAdminRejectDepositRequest();

  const handleApproveWithdrawal = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Saque aprovado — PIX enviado!");
      refetchW();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao aprovar saque");
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    setRejectingId(id);
    try {
      await apiFetch(`/api/admin/withdrawals/${id}/reject`, { method: "POST" });
      toast.success("Saque recusado e saldo estornado.");
      refetchW();
    } catch (e: any) {
      let msg = "Erro ao recusar saque";
      try { msg = JSON.parse(e.message)?.error ?? msg; } catch {}
      toast.error(msg);
    } finally {
      setRejectingId(null);
    }
  };

  const handleConfirmDeposit = async (id: number) => {
    setLoadingDepositId(id);
    try {
      await confirmDepositMutation.mutateAsync({ id });
      toast.success("Recebimento confirmado — empresa notificada.");
      refetchD();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao confirmar depósito");
    } finally {
      setLoadingDepositId(null);
    }
  };

  const handleApproveDeposit = async (id: number) => {
    setLoadingDepositId(id);
    try {
      await approveDepositMutation.mutateAsync({ id, data: {} });
      toast.success("Depósito aprovado — saldo creditado na carteira da empresa!");
      refetchD();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao aprovar depósito");
    } finally {
      setLoadingDepositId(null);
    }
  };

  const handleRejectDeposit = async (id: number) => {
    setLoadingDepositId(id);
    try {
      await rejectDepositMutation.mutateAsync({ id, data: {} });
      toast.success("Depósito rejeitado — empresa notificada.");
      refetchD();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao rejeitar depósito");
    } finally {
      setLoadingDepositId(null);
    }
  };

  const filteredWithdrawals = (withdrawals as any[]).filter(w =>
    !search || String(w.id).includes(search) || w.pixKey?.includes(search) || w.userName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDeposits = (deposits as any[]).filter(d =>
    !search || String(d.id).includes(search) || d.companyName?.toLowerCase().includes(search.toLowerCase()) || d.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingWithdrawTotal = (withdrawals as any[]).filter((w: any) => w.status === "pending").reduce((s: number, w: any) => s + (w.amount ?? 0), 0) / 100;
  const pendingDepositTotal = (deposits as any[]).filter((d: any) => d.status === "pending" || d.status === "confirmed").reduce((s: number, d: any) => s + (d.amount ?? 0), 0) / 100;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold">Financeiro — Aprovações</h1>
        <p className="text-muted-foreground mt-1 text-sm">Gerencie saques de freelancers e depósitos de empresas</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`glass-card rounded-xl p-4 border cursor-pointer transition-all ${mainTab === "withdrawals" ? "border-yellow-400/30 bg-yellow-400/5" : "border-white/8 hover:border-white/15"}`}
          onClick={() => setMainTab("withdrawals")}>
          <div className="flex items-center gap-2 mb-2">
            <Send size={15} className="text-yellow-400" />
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Saques</p>
          </div>
          <p className="text-2xl font-bold tabular-nums">R$ {pendingWithdrawTotal.toFixed(0)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {(withdrawals as any[]).filter((w: any) => w.status === "pending").length} pendentes
          </p>
        </div>
        <div className={`glass-card rounded-xl p-4 border cursor-pointer transition-all ${mainTab === "deposits" ? "border-primary/30 bg-primary/5" : "border-white/8 hover:border-white/15"}`}
          onClick={() => setMainTab("deposits")}>
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft size={15} className="text-primary" />
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Depósitos</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-primary">R$ {pendingDepositTotal.toFixed(0)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {(deposits as any[]).filter((d: any) => d.status === "pending" || d.status === "confirmed").length} para processar
          </p>
        </div>
      </div>

      {/* Main tab selector */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
        {([["withdrawals", "Saques de Freelancers", Send], ["deposits", "Depósitos de Empresas", ArrowDownLeft]] as const).map(([tab, label, Icon]) => (
          <button key={tab} onClick={() => { setMainTab(tab); setSearch(""); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === tab ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
            }`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={mainTab === "withdrawals" ? "Buscar por ID, chave PIX ou nome..." : "Buscar por ID ou empresa..."}
          value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 focus:border-primary h-10 rounded-xl text-sm"
        />
      </div>

      {/* ─── WITHDRAWALS TAB ─── */}
      {mainTab === "withdrawals" && (
        <>
          {/* Status filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
            {([["pending", "Pendentes"], ["completed", "Processados"], ["rejected", "Recusados"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setWithdrawFilter(val)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  withdrawFilter === val ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {withdrawFilter === "pending" && filteredWithdrawals.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-400/6 border border-yellow-400/20">
              <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-400 font-medium">
                {filteredWithdrawals.length} saque{filteredWithdrawals.length !== 1 ? "s" : ""} aguardando — Total: R$ {pendingWithdrawTotal.toFixed(2)}
              </p>
            </div>
          )}

          {wLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}</div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-16">
              <Send size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">Nenhum saque {withdrawFilter === "pending" ? "pendente" : withdrawFilter === "completed" ? "processado" : "recusado"}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWithdrawals.map((w: any) => (
                <WithdrawalCard
                  key={w.id} w={w}
                  onApprove={() => handleApproveWithdrawal(w.id)}
                  onReject={() => handleRejectWithdrawal(w.id)}
                  approving={approveMutation.isPending}
                  rejecting={rejectingId === w.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── DEPOSITS TAB ─── */}
      {mainTab === "deposits" && (
        <>
          {/* Status filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit flex-wrap">
            {([["pending", "Aguardando"], ["confirmed", "Recebidos"], ["credited", "Creditados"], ["rejected", "Rejeitados"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setDepositFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  depositFilter === val ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {(depositFilter === "pending" || depositFilter === "confirmed") && filteredDeposits.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/6 border border-primary/20">
              <ArrowDownLeft size={16} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-primary font-medium">
                  {depositFilter === "pending"
                    ? `${filteredDeposits.length} depósito${filteredDeposits.length !== 1 ? "s" : ""} aguardando confirmação de recebimento`
                    : `${filteredDeposits.length} depósito${filteredDeposits.length !== 1 ? "s" : ""} recebidos — aguardando crédito na carteira`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total: R$ {pendingDepositTotal.toFixed(2)}</p>
              </div>
            </div>
          )}

          {dLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}</div>
          ) : filteredDeposits.length === 0 ? (
            <div className="text-center py-16">
              <ArrowDownLeft size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">Nenhum depósito {depositFilter === "pending" ? "aguardando" : depositFilter === "confirmed" ? "recebido" : depositFilter === "credited" ? "creditado" : "rejeitado"}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeposits.map((d: any) => (
                <DepositCard
                  key={d.id} d={d}
                  onConfirm={() => handleConfirmDeposit(d.id)}
                  onApprove={() => handleApproveDeposit(d.id)}
                  onReject={() => handleRejectDeposit(d.id)}
                  loading={loadingDepositId === d.id}
                />
              ))}
            </div>
          )}

          {/* Flow explanation */}
          <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-2">
            <p className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-3">Fluxo de aprovação de depósito</p>
            {[
              { step: "1", label: "Empresa solicita depósito", status: "pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/25" },
              { step: "2", label: "Admin confirma que o pagamento foi recebido", status: "confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/25" },
              { step: "3", label: "Admin credita o saldo na carteira da empresa", status: "credited", color: "text-primary bg-primary/10 border-primary/20" },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border flex-shrink-0 ${s.color}`}>{s.step}</span>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
