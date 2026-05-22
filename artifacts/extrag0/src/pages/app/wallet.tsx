import React, { useState } from "react";
import { useGetMyWallet, useListTransactions, useRequestWithdrawal } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, CreditCard, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonListRow } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const isCredit = tx.type === "credit";
  const typeColors: Record<string, string> = {
    credit: "border-l-primary",
    debit: "border-l-destructive",
    withdrawal: "border-l-yellow-400",
    bonus: "border-l-secondary",
  };
  const borderColor = typeColors[tx.type ?? "credit"] ?? "border-l-white/20";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0 border-l-2 pl-3 ${borderColor}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
        {isCredit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{tx.createdAt ? format(new Date(tx.createdAt), "dd MMM 'às' HH:mm", { locale: ptBR }) : ""}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${isCredit ? "text-primary" : "text-destructive"}`}>
          {isCredit ? "+" : "-"}R$ {((tx.amount ?? 0) / 100).toFixed(2)}
        </p>
        <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{tx.status}</p>
      </div>
    </motion.div>
  );
}

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetMyWallet();
  const { data: txs = [], isLoading: txsLoading, refetch: refetchTxs } = useListTransactions();
  const withdrawMutation = useRequestWithdrawal();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const balance = (wallet?.balance ?? 0) / 100;
  const pending = (wallet?.pendingBalance ?? 0) / 100;
  const credits = txs.filter(t => t.type === "credit").reduce((s, t) => s + (t.amount ?? 0), 0) / 100;
  const debits = txs.filter(t => t.type === "debit").reduce((s, t) => s + (t.amount ?? 0), 0) / 100;

  const handleWithdraw = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 2000) { toast.error("Valor mínimo para saque: R$ 20,00"); return; }
    if (!pixKey.trim()) { toast.error("Informe sua chave PIX"); return; }
    try {
      await withdrawMutation.mutateAsync({ data: { amount: cents, pixKey } });
      toast.success("Saque solicitado com sucesso!");
      setShowWithdraw(false); setAmount(""); setPixKey("");
      refetchWallet(); refetchTxs();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao solicitar saque");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader title="Carteira extraGO" subtitle="Seus ganhos e movimentações financeiras" />

      {/* Hero Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="balance-card rounded-2xl p-6 sm:p-7"
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-3">Saldo disponível</p>
            {walletLoading ? (
              <div className="h-10 w-40 skeleton rounded-lg" />
            ) : (
              <p className="text-4xl sm:text-5xl font-bold text-primary leading-none">
                R$ {balance.toFixed(2)}
              </p>
            )}
            <p className="text-xs text-white/50 mt-2">Disponível para saque via PIX</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Wallet size={22} className="text-primary" />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/10">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Pendente</p>
            <p className="text-lg font-bold text-yellow-400">R$ {pending.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Total recebido</p>
            <p className="text-lg font-bold text-secondary">R$ {credits.toFixed(2)}</p>
          </div>
          <div className="ml-auto">
            <Button
              onClick={() => setShowWithdraw(!showWithdraw)}
              className={`rounded-xl font-bold text-sm h-9 px-5 border-none ${showWithdraw ? "bg-white/10 text-foreground hover:bg-white/15" : "bg-primary text-black hover:bg-primary/90 neon-glow"}`}
            >
              {showWithdraw ? "Cancelar" : "Sacar"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Withdraw form */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-primary/15">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <CreditCard size={16} className="text-primary" />
                  Solicitar Saque PIX
                </h3>
                <button onClick={() => setShowWithdraw(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                    <Input
                      type="number" min={20} step={0.01} max={balance}
                      value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="pl-10 bg-background/50 border-white/10 focus:border-primary/60 rounded-xl h-11"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[20, 50, 100, 200].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmount(String(Math.min(v, balance)))}
                        className="flex-1 py-1 rounded-lg border border-white/10 text-[10px] font-semibold hover:border-primary/40 hover:text-primary transition-colors"
                      >
                        R${v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">Chave PIX</label>
                  <Input
                    value={pixKey} onChange={e => setPixKey(e.target.value)}
                    placeholder="CPF, CNPJ, e-mail ou celular"
                    className="bg-background/50 border-white/10 focus:border-primary/60 rounded-xl h-11"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? (
                  <><Loader2 size={15} className="mr-2 animate-spin" />Processando...</>
                ) : "Confirmar Saque"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <TrendingUp size={15} />, label: "Entradas", value: `+R$ ${credits.toFixed(2)}`, color: "text-primary", bg: "bg-primary/8 border-primary/15" },
          { icon: <ArrowUpRight size={15} />, label: "Saques", value: `-R$ ${debits.toFixed(2)}`, color: "text-destructive", bg: "bg-destructive/8 border-destructive/15" },
        ].map((item, i) => (
          <div key={i} className={`glass-card rounded-xl p-4 flex items-center gap-3 border ${item.bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold mb-5 text-sm">Extrato</h2>
        {txsLoading ? (
          <div className="space-y-1">
            {[1,2,3,4].map(i => <SkeletonListRow key={i} />)}
          </div>
        ) : txs.length === 0 ? (
          <EmptyState
            icon={<Wallet size={24} />}
            title="Nenhuma movimentação ainda"
            description="Suas transações aparecerão aqui."
            className="py-10"
          />
        ) : (
          <div>
            {txs.map((tx, i) => <TransactionRow key={tx.id} tx={tx} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
