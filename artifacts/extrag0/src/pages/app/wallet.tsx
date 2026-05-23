import React, { useState } from "react";
import { useGetMyWallet, useListTransactions, useRequestWithdrawal } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, CreditCard, X, Loader2, Zap, Shield, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonListRow, SkeletonStatCard } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { AnimatedCounter } from "@/components/animated-counter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 20;

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={11} />,
  completed: <CheckCircle size={11} />,
  cancelled: <XCircle size={11} />,
};

const STATUS_CHIP: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const isCredit = tx.type === "credit";
  const isWithdrawal = tx.type === "withdrawal";
  const isBonus = tx.type === "bonus";
  const typeColors: Record<string, string> = {
    credit: "border-l-primary",
    debit: "border-l-destructive",
    withdrawal: "border-l-yellow-400",
    bonus: "border-l-secondary",
  };
  const borderColor = typeColors[tx.type ?? "credit"] ?? "border-l-white/20";
  const statusChip = STATUS_CHIP[tx.status ?? "completed"] ?? STATUS_CHIP.completed;
  const statusIcon = STATUS_ICONS[tx.status ?? "completed"] ?? STATUS_ICONS.completed;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0 border-l-2 pl-3 ${borderColor} group hover:bg-white/2 rounded-lg transition-colors`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
        isCredit ? "bg-primary/10 text-primary" :
        isBonus ? "bg-secondary/10 text-secondary" :
        isWithdrawal ? "bg-yellow-400/10 text-yellow-400" :
        "bg-destructive/10 text-destructive"
      }`}>
        {isCredit ? <ArrowDownLeft size={14} /> :
         isBonus ? <Zap size={14} /> :
         isWithdrawal ? <CreditCard size={14} /> :
         <ArrowUpRight size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tx.createdAt ? format(new Date(tx.createdAt), "dd MMM 'às' HH:mm", { locale: ptBR }) : ""}
        </p>
      </div>
      <div className="text-right flex-shrink-0 space-y-1">
        <p className={`text-sm font-bold ${isCredit || isBonus ? "text-primary" : isWithdrawal ? "text-yellow-400" : "text-destructive"}`}>
          {isCredit || isBonus ? "+" : "-"}R$ {((tx.amount ?? 0) / 100).toFixed(2)}
        </p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${statusChip}`}>
          {statusIcon}
          {tx.status === "pending" ? "Pendente" : tx.status === "completed" ? "Concluído" : "Cancelado"}
        </span>
      </div>
    </motion.div>
  );
}

function BalanceCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  const displayValue = value / 100;
  return (
    <div className={`glass-card rounded-2xl p-5 border ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold leading-none`}>
        R$ <AnimatedCounter value={displayValue} decimals={2} />
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
    </div>
  );
}

export default function WalletPage() {
  const queryClient = useQueryClient();
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetMyWallet({
    query: { queryKey: ["wallet"], refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: allTxs = [], isLoading: txsLoading, refetch: refetchTxs } = useListTransactions(undefined, {
    query: { queryKey: ["transactions"], refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const withdrawMutation = useRequestWithdrawal();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [page, setPage] = useState(0);
  const [optimisticTx, setOptimisticTx] = useState<Transaction | null>(null);

  const balance = wallet?.balance ?? 0;
  const pending = wallet?.pendingBalance ?? 0;
  const totalEarned = wallet?.totalEarned ?? 0;

  const txs = optimisticTx ? [optimisticTx, ...allTxs] : allTxs;
  const totalPages = Math.ceil(txs.length / PAGE_SIZE);
  const pageTxs = txs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleWithdraw = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 2000) { toast.error("Valor mínimo para saque: R$ 20,00"); return; }
    if (!pixKey.trim()) { toast.error("Informe sua chave PIX"); return; }

    const fakeId = Date.now();
    const optimistic: Transaction = {
      id: fakeId,
      walletId: 0,
      type: "withdrawal",
      amount: cents,
      description: `Saque PIX — Chave: ${pixKey}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setOptimisticTx(optimistic);
    setShowWithdraw(false);
    setAmount("");
    setPixKey("");
    toast.success("Saque solicitado! Aguardando aprovação.");

    try {
      await withdrawMutation.mutateAsync({ data: { amount: cents, pixKey } });
      refetchWallet();
      refetchTxs();
    } catch (e: any) {
      setOptimisticTx(null);
      toast.error(e?.data?.error ?? "Erro ao solicitar saque");
    } finally {
      setTimeout(() => setOptimisticTx(null), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Carteira extraGO"
        subtitle="Seus ganhos e movimentações financeiras"
      />

      {/* Three balance buckets */}
      {walletLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <BalanceCard
            label="Disponível"
            value={balance}
            color="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/3"
            sub="Para saque via PIX"
          />
          <BalanceCard
            label="Pendente"
            value={pending}
            color="border-yellow-400/20 bg-gradient-to-br from-yellow-400/8 to-yellow-400/3"
            sub="Em processamento"
          />
          <BalanceCard
            label="Total Ganho"
            value={totalEarned}
            color="border-secondary/20 bg-gradient-to-br from-secondary/8 to-secondary/3"
            sub="Histórico acumulado"
          />
        </div>
      )}

      {/* Withdraw button */}
      <div className="flex justify-end">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className={`rounded-xl font-bold text-sm h-10 px-6 border-none transition-all ${
              showWithdraw
                ? "bg-white/10 text-foreground hover:bg-white/15"
                : "bg-primary text-black hover:bg-primary/90 neon-glow"
            }`}
          >
            {showWithdraw ? "Cancelar" : "Solicitar Saque PIX"}
          </Button>
        </motion.div>
      </div>

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
                  <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Valor do Saque</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">R$</span>
                    <Input
                      type="number" min={20} step={0.01} max={balance / 100}
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
                        onClick={() => setAmount(String(Math.min(v, balance / 100)))}
                        className="flex-1 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold hover:border-primary/40 hover:text-primary hover:bg-primary/6 transition-all"
                      >
                        R${v}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Chave PIX de Destino</label>
                  <Input
                    value={pixKey} onChange={e => setPixKey(e.target.value)}
                    placeholder="CPF, CNPJ, e-mail ou celular"
                    className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
                  />
                  {pixKey && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <CheckCircle size={11} className="text-green-400" />
                      Chave: {pixKey}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Shield size={12} className="text-primary" /> Informações do saque
                </p>
                <p>• Prazo de aprovação: até 2 dias úteis</p>
                <p>• Valor mínimo: R$ 20,00</p>
                <p>• Processamento via PIX instantâneo após aprovação</p>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? (
                    <><Loader2 size={15} className="mr-2 animate-spin" />Processando...</>
                  ) : `Confirmar Saque${amount ? ` de R$ ${parseFloat(amount || "0").toFixed(2)}` : " via PIX"}`}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5 sm:p-6 border border-white/6"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-semibold text-base flex-1">Extrato</h2>
          {txs.length > 0 && (
            <span className="text-[10px] text-muted-foreground bg-white/4 border border-white/8 px-2.5 py-1 rounded-full">
              {txs.length} transação{txs.length !== 1 ? "ões" : ""}
            </span>
          )}
        </div>

        {txsLoading ? (
          <div className="space-y-1">
            {[1,2,3,4].map(i => <SkeletonListRow key={i} />)}
          </div>
        ) : txs.length === 0 ? (
          <EmptyState
            icon={<Wallet size={24} />}
            title="Nenhuma movimentação ainda"
            description="Suas transações aparecerão aqui após a conclusão de jobs aprovados."
            actionLabel="Buscar Vagas"
            actionHref="/app/jobs"
            className="py-10"
          />
        ) : (
          <>
            <div>
              {pageTxs.map((tx, i) => <TransactionRow key={tx.id} tx={tx} index={i} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 rounded-lg h-8 px-3 text-xs gap-1"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft size={13} /> Anterior
                </Button>
                <span className="text-xs text-muted-foreground">
                  Página {page + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 rounded-lg h-8 px-3 text-xs gap-1"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Próxima <ChevronRight size={13} />
                </Button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
