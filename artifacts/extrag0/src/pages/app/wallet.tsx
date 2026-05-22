import React, { useState } from "react";
import { useGetMyWallet, useListTransactions, useRequestWithdrawal } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";
import { Wallet, ArrowDownLeft, ArrowUpRight, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.type === "credit";
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground">{tx.createdAt ? format(new Date(tx.createdAt), "dd 'de' MMM 'às' HH:mm", { locale: ptBR }) : ""}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-semibold ${isCredit ? "text-primary" : "text-destructive"}`}>
          {isCredit ? "+" : "-"}R$ {((tx.amount ?? 0) / 100).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { data: wallet, refetch: refetchWallet } = useGetMyWallet();
  const { data: txs = [], refetch: refetchTxs } = useListTransactions();
  const withdrawMutation = useRequestWithdrawal();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const balance = (wallet?.balance ?? 0) / 100;
  const pending = (wallet?.pendingBalance ?? 0) / 100;

  const handleWithdraw = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 2000) {
      toast.error("Valor mínimo para saque: R$ 20,00");
      return;
    }
    if (!pixKey.trim()) {
      toast.error("Informe sua chave PIX");
      return;
    }
    try {
      await withdrawMutation.mutateAsync({ data: { amount: cents, pixKey } });
      toast.success("Saque solicitado com sucesso!");
      setShowWithdraw(false);
      setAmount("");
      setPixKey("");
      refetchWallet();
      refetchTxs();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao solicitar saque");
    }
  };

  const credits = txs.filter(t => t.type === "credit").reduce((s, t) => s + (t.amount ?? 0), 0) / 100;
  const debits = txs.filter(t => t.type === "debit").reduce((s, t) => s + (t.amount ?? 0), 0) / 100;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carteira extraGO</h1>
        <p className="text-muted-foreground mt-1">Seus ganhos e movimentações financeiras</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 col-span-1 sm:col-span-1 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">Saldo Disponível</p>
          <p className="text-4xl font-bold text-primary">R$ {balance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">Disponível para saque</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-muted-foreground mb-2">Pendente</p>
          <p className="text-2xl font-bold text-yellow-400">R$ {pending.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">Aguardando liberação</p>
        </div>
        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/20">
          <p className="text-sm text-muted-foreground mb-2">Total Recebido</p>
          <p className="text-2xl font-bold text-secondary">R$ {credits.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">Histórico completo</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="font-semibold text-primary">+R$ {credits.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <ArrowUpRight size={16} className="text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saques</p>
            <p className="font-semibold text-destructive">-R$ {debits.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Withdraw */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            Solicitar Saque PIX
          </h2>
          <Button
            size="sm"
            variant={showWithdraw ? "destructive" : "outline"}
            onClick={() => setShowWithdraw(!showWithdraw)}
            className={showWithdraw ? "" : "border-primary/40 text-primary hover:bg-primary/10"}
          >
            {showWithdraw ? "Cancelar" : "Sacar"}
          </Button>
        </div>

        {showWithdraw && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Valor (mínimo R$ 20,00)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                <Input
                  type="number"
                  min={20}
                  step={0.01}
                  max={balance}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="pl-10 bg-background/50 border-white/10 focus:border-primary rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Chave PIX</label>
              <Input
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="CPF, CNPJ, e-mail ou celular"
                className="bg-background/50 border-white/10 focus:border-primary rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              {[20, 50, 100, 200].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(Math.min(v, balance)))}
                  className="flex-1 py-1.5 rounded-lg border border-white/10 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
                >
                  R$ {v}
                </button>
              ))}
            </div>
            <Button
              className="w-full bg-primary text-black hover:bg-primary/90 neon-glow font-semibold rounded-xl"
              onClick={handleWithdraw}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "Processando..." : "Confirmar Saque"}
            </Button>
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Extrato</h2>
        {txs.length === 0 && (
          <div className="text-center py-8">
            <Wallet size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda</p>
          </div>
        )}
        {txs.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
      </div>
    </div>
  );
}
