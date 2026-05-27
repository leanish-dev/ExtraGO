import React, { useState } from "react";
import { useAdminListWithdrawals, useAdminApproveWithdrawal } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";
import { CreditCard, CheckCircle, Clock, DollarSign, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch } from "@/lib/api-fetch";

export default function AdminWithdrawalsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");

  const { data: withdrawals = [], isLoading, refetch } = useAdminListWithdrawals({
    status: filter,
  });

  const approveMutation = useAdminApproveWithdrawal();
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success("Saque aprovado e PIX enviado!");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao aprovar saque");
    }
  };

  const handleReject = async (id: number) => {
    setRejectingId(id);
    try {
      await apiFetch(`/api/admin/withdrawals/${id}/reject`, { method: "POST" });
      toast.success("Saque recusado.");
      refetch();
    } catch (e: any) {
      let msg = "Erro ao recusar saque";
      try { msg = JSON.parse(e.message)?.error ?? msg; } catch {}
      toast.error(msg);
    } finally {
      setRejectingId(null);
    }
  };

  const filtered = withdrawals.filter(w =>
    !search || String(w.id).includes(search) || w.pixKey?.includes(search)
  );

  const pendingTotal = withdrawals
    .filter(w => w.status === "pending")
    .reduce((s, w) => s + (w.amount ?? 0), 0) / 100;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saques Pendentes</h1>
        <p className="text-muted-foreground mt-1">
          {filter === "pending" ? `Total a pagar: R$ ${pendingTotal.toFixed(2)}` : `${filtered.length} saque${filtered.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
        {[
          { value: "pending", label: "Pendentes" },
          { value: "completed", label: "Processados" },
          { value: "rejected", label: "Recusados" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.value ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID ou chave PIX..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-white/5 border-white/10 focus:border-primary h-11 rounded-xl"
        />
      </div>

      {filter === "pending" && filtered.length > 0 && (
        <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
          <p className="text-sm text-yellow-400 font-medium">
            ⚠️ {filtered.length} saque{filtered.length !== 1 ? "s" : ""} aguardando aprovação — Total: R$ {pendingTotal.toFixed(2)}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-xl h-24 animate-pulse" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <CreditCard size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {filter === "pending" ? "Nenhum saque pendente. " : "Nenhum saque processado."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(w => {
          const walletId = w.walletId;
          return (
            <div key={w.id} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    w.status === "pending" ? "bg-yellow-400/10 text-yellow-400" : "bg-primary/10 text-primary"
                  }`}>
                    {w.status === "pending" ? <Clock size={18} /> : <CheckCircle size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">Saque #{w.id}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        w.status === "pending"
                          ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
                          : "text-primary bg-primary/10 border-primary/30"
                      }`}>
                        {w.status === "pending" ? "Pendente" : "Processado"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Carteira #{walletId} · {w.createdAt ? format(new Date(w.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ""}
                    </p>
                    {w.pixKey && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">PIX: {w.pixKey}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-2">
                  <p className="text-xl font-bold text-destructive">-R$ {((w.amount ?? 0) / 100).toFixed(2)}</p>
                  {w.status === "pending" && (
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 text-destructive hover:bg-destructive/10 border border-destructive/20"
                        onClick={() => handleReject(w.id!)}
                        disabled={rejectingId === w.id}
                      >
                        <XCircle size={12} className="mr-1" /> Recusar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-black hover:bg-primary/90 font-semibold text-xs h-8"
                        onClick={() => handleApprove(w.id!)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle size={12} className="mr-1" /> Aprovar PIX
                      </Button>
                    </div>
                  )}
                  {w.status === "rejected" && (
                    <span className="text-xs text-destructive/70 flex items-center gap-1 justify-end">
                      <XCircle size={11} /> Recusado
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
