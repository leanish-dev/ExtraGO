import React, { useState } from "react";
import { useGetMyWallet, useListTransactions, useRequestWithdrawal } from "@workspace/api-client-react";
import type { Transaction } from "@workspace/api-client-react";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, CreditCard, X, Loader2,
  Zap, Shield, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Send, Eye, EyeOff, ArrowRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty";
import { SkeletonListRow, SkeletonStatCard } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/animated-counter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import walletBanner from "@assets/file_000000002e6c720e878a4dbb71de7456_1779877754814.png";

const PAGE_SIZE = 20;

type TxFilter = "all" | "credit" | "debit" | "withdrawal" | "bonus";

const TX_FILTER_LABELS: Record<TxFilter, string> = {
  all: "Todos",
  credit: "Créditos",
  debit: "Débitos",
  withdrawal: "Saques",
  bonus: "Bônus",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={10} />,
  completed: <CheckCircle size={10} />,
  cancelled: <XCircle size={10} />,
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

  const amountColor = isCredit || isBonus ? "text-primary" : isWithdrawal ? "text-yellow-400" : "text-destructive";
  const amountSign = isCredit || isBonus ? "+" : "−";
  const statusChip = STATUS_CHIP[tx.status ?? "completed"] ?? STATUS_CHIP.completed;
  const statusIcon = STATUS_ICONS[tx.status ?? "completed"] ?? STATUS_ICONS.completed;

  const iconConfig = isCredit
    ? { bg: "bg-primary/10 border-primary/20 text-primary", icon: <ArrowDownLeft size={14} /> }
    : isBonus
    ? { bg: "bg-secondary/10 border-secondary/20 text-secondary", icon: <Zap size={14} /> }
    : isWithdrawal
    ? { bg: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400", icon: <Send size={14} /> }
    : { bg: "bg-destructive/10 border-destructive/20 text-destructive", icon: <ArrowUpRight size={14} /> };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.035 }}
      className="flex items-center gap-3 sm:gap-4 py-3.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.015] rounded-lg transition-colors px-1"
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${iconConfig.bg}`}>
        {iconConfig.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-snug">{tx.description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tx.createdAt ? format(new Date(tx.createdAt), "dd MMM 'às' HH:mm", { locale: ptBR }) : "—"}
        </p>
      </div>
      <div className="text-right flex-shrink-0 space-y-1">
        <p className={`text-sm font-bold tabular-nums ${amountColor}`}>
          {amountSign}R$ {((tx.amount ?? 0) / 100).toFixed(2)}
        </p>
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusChip}`}>
          {statusIcon}
          {tx.status === "pending" ? "Pendente" : tx.status === "completed" ? "Concluído" : "Cancelado"}
        </span>
      </div>
    </motion.div>
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
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [optimisticTx, setOptimisticTx] = useState<Transaction | null>(null);
  const [hideBalance, setHideBalance] = useState(false);

  const balance = wallet?.balance ?? 0;
  const pending = wallet?.pendingBalance ?? 0;
  const totalEarned = wallet?.totalEarned ?? 0;

  const rawTxs = optimisticTx ? [optimisticTx, ...allTxs] : allTxs;
  const filteredTxs = txFilter === "all"
    ? rawTxs
    : rawTxs.filter((t: Transaction) => t.type === txFilter);

  const totalPages = Math.ceil(filteredTxs.length / PAGE_SIZE);
  const pageTxs = filteredTxs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const creditTotal = rawTxs
    .filter((t: Transaction) => t.type === "credit" || t.type === "bonus")
    .reduce((s: number, t: Transaction) => s + (t.amount ?? 0), 0) / 100;
  const debitTotal = rawTxs
    .filter((t: Transaction) => t.type === "debit" || t.type === "withdrawal")
    .reduce((s: number, t: Transaction) => s + (t.amount ?? 0), 0) / 100;

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
    <div className="page-enter pb-20 lg:pb-6">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full overflow-hidden"
        style={{ borderRadius: "0 0 20px 20px" }}
      >
        <img
          src={walletBanner}
          alt="Carteira extraGO"
          className="w-full object-cover"
          style={{ maxHeight: 170, objectPosition: "center center" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(7,10,13,0) 0%, rgba(7,10,13,0.2) 60%, rgba(7,10,13,0.88) 100%)" }}
        />
      </motion.div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">

        {/* Hero balance card */}
        {walletLoading ? (
          <div className="h-44 skeleton rounded-3xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
            className="fintech-hero-card p-6 sm:p-8"
          >
            {/* bg-wallet.webp — fintech art layer */}
            <div
              className="absolute inset-0 opacity-[0.09] bg-cover bg-center mix-blend-screen pointer-events-none blur-[1px]"
              style={{ backgroundImage: "url(/images/backgrounds/bg-wallet.webp)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-green-500/6 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/8 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10">
              {/* Top row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Wallet size={15} className="text-primary" />
                  </div>
                  <span className="text-[11px] font-bold text-primary/80 uppercase tracking-widest">Saldo Disponível</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setHideBalance(v => !v)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                </motion.button>
              </div>

              {/* Balance amount */}
              <div className="mb-6">
                {hideBalance ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-foreground/40 tracking-widest">••••••</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-semibold text-foreground/60 mb-1">R$</span>
                    <p className="text-5xl sm:text-6xl font-bold leading-none tabular-nums">
                      <AnimatedCounter value={balance / 100} decimals={2} />
                    </p>
                  </div>
                )}
                <p className="text-sm text-foreground/50 mt-2">Disponível para saque imediato via PIX</p>
              </div>

              {/* CTA row */}
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                  <Button
                    onClick={() => setShowWithdraw(s => !s)}
                    className={`w-full font-bold rounded-xl h-11 border-none text-sm gap-2 ${
                      showWithdraw
                        ? "bg-white/10 text-foreground hover:bg-white/15"
                        : "bg-primary text-black hover:bg-primary/90 neon-glow"
                    }`}
                  >
                    {showWithdraw ? (
                      <><X size={15} /> Cancelar</>
                    ) : (
                      <><Send size={15} /> Sacar via PIX</>
                    )}
                  </Button>
                </motion.div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-muted-foreground font-medium">PIX ativo</span>
                </div>
              </div>
            </div>

            {/* Decorative wallet icon */}
            <Wallet size={130} className="absolute -right-6 -bottom-6 opacity-[0.04] text-primary" style={{ zIndex: 0 }} />
          </motion.div>
        )}

        {/* Secondary balance cards */}
        {walletLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="balance-card-mini p-4"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Pendente</p>
              <p className="text-xl font-bold leading-none tabular-nums">
                {hideBalance ? "••••" : <>R$ <AnimatedCounter value={pending / 100} decimals={2} /></>}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <Clock size={9} className="text-yellow-400" /> Em processamento
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="balance-card-mini p-4"
            >
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">Total Ganho</p>
              <p className="text-xl font-bold leading-none tabular-nums text-secondary">
                {hideBalance ? "••••" : <>R$ <AnimatedCounter value={totalEarned / 100} decimals={2} /></>}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <TrendingUp size={9} className="text-secondary" /> Histórico acumulado
              </p>
            </motion.div>
          </div>
        )}

        {/* Earnings summary pills */}
        {!walletLoading && rawTxs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 overflow-x-auto pb-0.5"
          >
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/8 border border-primary/15 flex-shrink-0">
              <ArrowDownLeft size={12} className="text-primary" />
              <span className="text-[11px] font-bold text-primary">+R$ {creditTotal.toFixed(2)} recebido</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-destructive/8 border border-destructive/15 flex-shrink-0">
              <ArrowUpRight size={12} className="text-destructive" />
              <span className="text-[11px] font-bold text-destructive">−R$ {debitTotal.toFixed(2)} saído</span>
            </div>
          </motion.div>
        )}

        {/* PIX Withdraw form */}
        <AnimatePresence>
          {showWithdraw && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-primary/14 bg-gradient-to-br from-primary/4 to-transparent relative overflow-hidden">
                {/* bg-wallet.webp — PIX section art layer */}
                <div
                  className="absolute inset-0 opacity-[0.07] bg-cover bg-right mix-blend-screen pointer-events-none blur-[1px]"
                  style={{ backgroundImage: "url(/images/backgrounds/bg-wallet.webp)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-green-500/4 pointer-events-none" />
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/6 blur-3xl rounded-full pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/22 flex items-center justify-center flex-shrink-0">
                    <Send size={15} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">Solicitar Saque PIX</h3>
                    <p className="text-xs text-muted-foreground">Saldo disponível: R$ {(balance / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Valor do Saque</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">R$</span>
                      <Input
                        type="number" min={20} step={0.01} max={balance / 100}
                        value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="pl-10 bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11 font-semibold tabular-nums"
                      />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {[20, 50, 100, 200].map(v => (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => setAmount(String(Math.min(v, balance / 100)))}
                          className="flex-1 py-1.5 rounded-lg border border-white/8 text-[10px] font-bold hover:border-primary/35 hover:text-primary hover:bg-primary/6 transition-all"
                        >
                          R${v}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Chave PIX</label>
                    <Input
                      value={pixKey} onChange={e => setPixKey(e.target.value)}
                      placeholder="CPF, CNPJ, e-mail ou celular"
                      className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
                    />
                    {pixKey && (
                      <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                        <CheckCircle size={10} className="text-green-400" /> Chave: {pixKey}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-xs text-muted-foreground space-y-1.5">
                  <p className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                    <Shield size={12} className="text-primary" /> Informações do saque
                  </p>
                  <p className="flex items-center gap-1.5">• Prazo de aprovação: até 2 dias úteis</p>
                  <p className="flex items-center gap-1.5">• Valor mínimo: R$ 20,00</p>
                  <p className="flex items-center gap-1.5">• Transferência via PIX instantâneo após aprovação</p>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending}
                  >
                    {withdrawMutation.isPending ? (
                      <><Loader2 size={15} className="mr-2 animate-spin" />Processando...</>
                    ) : (
                      `Confirmar Saque${amount ? ` de R$ ${parseFloat(amount || "0").toFixed(2)}` : " via PIX"}`
                    )}
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
          transition={{ delay: 0.28 }}
          className="glass-card rounded-2xl p-5 sm:p-6 border border-white/6"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-bold text-base flex-1">Extrato</h2>
            {rawTxs.length > 0 && (
              <span className="text-[10px] text-muted-foreground bg-white/4 border border-white/8 px-2.5 py-1 rounded-full font-semibold">
                {rawTxs.length} transaç{rawTxs.length !== 1 ? "ões" : "ão"}
              </span>
            )}
          </div>

          {/* Filter tabs */}
          {rawTxs.length > 0 && (
            <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
              {(Object.keys(TX_FILTER_LABELS) as TxFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => { setTxFilter(f); setPage(0); }}
                  className={`tx-type-tab ${txFilter === f ? "active" : ""}`}
                >
                  {TX_FILTER_LABELS[f]}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {txsLoading ? (
            <div className="space-y-1">
              {[1,2,3,4].map(i => <SkeletonListRow key={i} />)}
            </div>
          ) : rawTxs.length === 0 ? (
            <EmptyState
              icon={<Wallet size={24} />}
              title="Nenhuma movimentação ainda"
              description="Suas transações aparecerão aqui após a conclusão de jobs aprovados."
              actionLabel="Buscar Vagas"
              actionHref="/app/jobs"
              className="py-10"
            />
          ) : filteredTxs.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma transação nessa categoria.</p>
            </div>
          ) : (
            <>
              <div>
                {pageTxs.map((tx: Transaction, i: number) => (
                  <TransactionRow key={tx.id} tx={tx} index={i} />
                ))}
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
                    <ChevronLeft size={12} /> Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground font-medium">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10 rounded-lg h-8 px-3 text-xs gap-1"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Próxima <ChevronRight size={12} />
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Info footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white/2 border border-white/5"
        >
          <Sparkles size={15} className="text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed flex-1">
            Seu dinheiro está protegido. Saques aprovados são transferidos via PIX em instantes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
