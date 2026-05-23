import React, { useState } from "react";
import { useGetMyWallet, useListTransactions, useRequestWithdrawal } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, CreditCard, X, Loader2, Zap, Shield } from "lucide-react";
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
  const typeConfig: Record<string, { icon: React.ReactNode; bg: string; amount: string; label: string }> = {
    credit: { icon: <ArrowDownLeft size={14} />, bg: "bg-primary/10 text-primary", amount: `+R$ ${((tx.amount ?? 0) / 100).toFixed(2)}`, label: "text-primary" },
    debit: { icon: <ArrowUpRight size={14} />, bg: "bg-destructive/10 text-destructive", amount: `-R$ ${((tx.amount ?? 0) / 100).toFixed(2)}`, label: "text-destructive" },
    withdrawal: { icon: <ArrowUpRight size={14} />, bg: "bg-yellow-400/10 text-yellow-400", amount: `-R$ ${((tx.amount ?? 0) / 100).toFixed(2)}`, label: "text-yellow-400" },
    bonus: { icon: <Zap size={14} />, bg: "bg-secondary/10 text-secondary", amount: `+R$ ${((tx.amount ?? 0) / 100).toFixed(2)}`, label: "text-secondary" },
  };
  const config = typeConfig[tx.type ?? "credit"] ?? typeConfig.credit;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0 group hover:bg-white/2 rounded-lg px-1 transition-colors"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${config.bg}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tx.createdAt ? format(new Date(tx.createdAt), "dd MMM 'às' HH:mm", { locale: ptBR }) : ""}
          {tx.status && <span className="ml-2 capitalize opacity-60">· {tx.status}</span>}
        </p>
      </div>
      <p className={`text-sm font-bold flex-shrink-0 ${config.label}`}>
        {config.amount}
      </p>
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
  const debits = txs.filter(t => t.type === "debit" || t.type === "withdrawal").reduce((s, t) => s + (t.amount ?? 0), 0) / 100;

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
      <PageHeader
        title="Carteira extraGO"
        subtitle="Seus ganhos e movimentações financeiras"
      />

      {/* Hero Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="balance-card rounded-3xl p-6 sm:p-8 relative"
      >
        {/* Decorative corner elements */}
        <div className="absolute top-4 right-4 opacity-15 text-7xl font-black text-primary leading-none pointer-events-none select-none">₿</div>

        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-xs text-white/55 uppercase tracking-[0.15em] font-semibold mb-4">Saldo disponível</p>
            {walletLoading ? (
              <div className="h-12 w-44 skeleton rounded-xl" />
            ) : (
              <motion.p
                key={balance}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-6xl font-bold text-primary leading-none tracking-tight"
              >
                R$ {balance.toFixed(2)}
              </motion.p>
            )}
            <p className="text-xs text-white/40 mt-3 flex items-center gap-1.5">
              <Shield size={10} /> Disponível para saque via PIX
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <Wallet size={24} className="text-primary" />
          </div>
        </div>

        <div className="flex items-center gap-5 mt-6 pt-5 border-t border-white/10 flex-wrap">
          <div>
            <p className="text-[10px] text-white/45 uppercase tracking-widest mb-1.5">Pendente</p>
            <p className="text-xl font-bold text-yellow-400">R$ {pending.toFixed(2)}</p>
          </div>
          <div className="w-px h-9 bg-white/10" />
          <div>
            <p className="text-[10px] text-white/45 uppercase tracking-widest mb-1.5">Total recebido</p>
            <p className="text-xl font-bold text-secondary">R$ {credits.toFixed(2)}</p>
          </div>
          <div className="ml-auto">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => setShowWithdraw(!showWithdraw)}
                className={`rounded-xl font-bold text-sm h-10 px-6 border-none transition-all ${showWithdraw ? "bg-white/10 text-foreground hover:bg-white/15" : "bg-primary text-black hover:bg-primary/90 neon-glow"}`}
              >
                {showWithdraw ? "Cancelar" : "Sacar"}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Withdraw form */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-primary/15 bg-gradient-to-br from-primary/4 to-transparent">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <CreditCard size={15} className="text-primary" />
                  Solicitar Saque PIX
                </h3>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowWithdraw(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Valor</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">R$</span>
                    <Input
                      type="number" min={20} step={0.01} max={balance}
                      value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="pl-10 bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[20, 50, 100, 200].map(v => (
                      <motion.button
                        key={v}
                        whileTap={{ scale: 0.93 }}
                        type="button"
                        onClick={() => setAmount(String(Math.min(v, balance)))}
                        className="flex-1 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold hover:border-primary/40 hover:text-primary hover:bg-primary/6 transition-all"
                      >
                        R${v}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Chave PIX</label>
                  <Input
                    value={pixKey} onChange={e => setPixKey(e.target.value)}
                    placeholder="CPF, CNPJ, e-mail ou celular"
                    className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
                  />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? (
                    <><Loader2 size={15} className="mr-2 animate-spin" />Processando...</>
                  ) : "Confirmar Saque via PIX"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <TrendingUp size={16} />, label: "Total de entradas", value: `+R$ ${credits.toFixed(2)}`, color: "text-primary", bg: "from-primary/8 to-primary/2 border-primary/15", iconBg: "bg-primary/12 text-primary" },
          { icon: <ArrowUpRight size={16} />, label: "Total de saques", value: `-R$ ${debits.toFixed(2)}`, color: "text-destructive", bg: "from-destructive/8 to-destructive/2 border-destructive/15", iconBg: "bg-destructive/12 text-destructive" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ y: -2 }}
            className={`glass-card rounded-2xl p-4 flex items-center gap-3 border bg-gradient-to-br ${item.bg} transition-all`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{item.label}</p>
              <p className={`font-bold text-base leading-tight mt-0.5 ${item.color}`}>{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transaction history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5 sm:p-6 border border-white/6"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-semibold text-base flex-1">Extrato</h2>
          <span className="text-[10px] text-muted-foreground bg-white/4 border border-white/8 px-2.5 py-1 rounded-full">
            {txs.length} transações
          </span>
        </div>
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
      </motion.div>
    </div>
  );
}
