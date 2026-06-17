import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetMyWallet, useListTransactions, useRequestWithdrawal, useRequestDeposit, useListDepositRequests } from "@workspace/api-client-react";
import type { Transaction, DepositRequest } from "@workspace/api-client-react";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, X, Loader2,
  Zap, Shield, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight,
  Send, Eye, EyeOff, ArrowRight, Lock, CreditCard, Building2
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
const PAGE_SIZE = 20;

type TxFilter = "all" | "credit" | "debit" | "withdrawal" | "commission";

const TX_FILTER_LABELS: Record<TxFilter, string> = {
  all: "Todos",
  credit: "Créditos",
  debit: "Débitos",
  withdrawal: "Saques",
  commission: "Comissões",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={10} />,
  completed: <CheckCircle size={10} />,
  cancelled: <XCircle size={10} />,
  rejected: <XCircle size={10} />,
};

const STATUS_CHIP: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const DEPOSIT_STATUS_LABELS: Record<string, { label: string; chip: string }> = {
  pending: { label: "Aguardando", chip: "bg-yellow-400/10 text-yellow-400 border-yellow-400/25" },
  confirmed: { label: "Recebido", chip: "bg-blue-400/10 text-blue-400 border-blue-400/25" },
  credited: { label: "Creditado", chip: "bg-primary/10 text-primary border-primary/20" },
  rejected: { label: "Rejeitado", chip: "bg-destructive/10 text-destructive border-destructive/20" },
};

function TransactionRow({ tx, index }: { tx: Transaction; index: number }) {
  const isCredit = tx.type === "credit";
  const isCommission = tx.type === "commission";
  const isWithdrawal = tx.type === "withdrawal";
  const isReservation = tx.type === "reservation";
  const isRelease = tx.type === "release";
  const isDeposit = tx.type === "deposit";

  const amountColor = (isCredit || isCommission || isRelease || isDeposit)
    ? "text-primary"
    : isWithdrawal ? "text-yellow-400"
    : isReservation ? "text-blue-400"
    : "text-destructive";
  const amountSign = (isCredit || isCommission || isRelease || isDeposit) ? "+" : "−";

  const statusChip = STATUS_CHIP[tx.status ?? "completed"] ?? STATUS_CHIP.completed;
  const statusIcon = STATUS_ICONS[tx.status ?? "completed"] ?? STATUS_ICONS.completed;

  const iconConfig = isCredit || isDeposit
    ? { bg: "bg-primary/10 border-primary/20 text-primary", icon: <ArrowDownLeft size={14} /> }
    : isCommission
    ? { bg: "bg-secondary/10 border-secondary/20 text-secondary", icon: <Zap size={14} /> }
    : isWithdrawal
    ? { bg: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400", icon: <Send size={14} /> }
    : isReservation
    ? { bg: "bg-blue-400/10 border-blue-400/20 text-blue-400", icon: <Lock size={14} /> }
    : isRelease
    ? { bg: "bg-green-400/10 border-green-400/20 text-green-400", icon: <ArrowRight size={14} /> }
    : { bg: "bg-destructive/10 border-destructive/20 text-destructive", icon: <ArrowUpRight size={14} /> };

  const dotColor = isCredit || isDeposit
    ? { background: "hsl(88,100%,49%)", boxShadow: "0 0 6px rgba(124,252,0,0.7)" }
    : isCommission
    ? { background: "hsl(186,100%,50%)", boxShadow: "0 0 6px rgba(0,229,255,0.7)" }
    : isWithdrawal
    ? { background: "hsl(42,100%,55%)", boxShadow: "0 0 6px rgba(250,195,0,0.7)" }
    : { background: "hsl(0,80%,55%)", boxShadow: "0 0 6px rgba(200,50,50,0.6)" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.035 }}
      className="flex items-center gap-3 sm:gap-4 py-3.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.040] rounded-lg transition-colors px-1 relative"
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full flex-shrink-0" style={dotColor} />
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ml-2 ${iconConfig.bg}`}>
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
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full border ${statusChip}`}>
          {statusIcon}
          {tx.status === "pending" ? "Pendente" : tx.status === "completed" ? "Concluído" : "Cancelado"}
        </span>
      </div>
    </motion.div>
  );
}

function DepositRow({ dep, index }: { dep: DepositRequest; index: number }) {
  const meta = DEPOSIT_STATUS_LABELS[dep.status ?? "pending"] ?? DEPOSIT_STATUS_LABELS.pending;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex items-center gap-3 py-3.5 border-b border-white/5 last:border-0 px-1"
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${
        dep.status === "credited" ? "bg-primary/10 border-primary/20 text-primary"
        : dep.status === "confirmed" ? "bg-blue-400/10 border-blue-400/20 text-blue-400"
        : dep.status === "rejected" ? "bg-destructive/10 border-destructive/20 text-destructive"
        : "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
      }`}>
        {dep.status === "credited" ? <CheckCircle size={14} />
         : dep.status === "confirmed" ? <CreditCard size={14} />
         : dep.status === "rejected" ? <XCircle size={14} />
         : <Clock size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          Depósito via {dep.paymentMethod === "pix" ? "PIX" : dep.paymentMethod === "credit_card" ? "Cartão" : "Transferência"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dep.createdAt ? format(new Date(dep.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—"}
          {dep.adminNote ? ` · ${dep.adminNote}` : ""}
        </p>
      </div>
      <div className="text-right flex-shrink-0 space-y-1">
        <p className="text-sm font-bold text-primary tabular-nums">+R$ {((dep.amount ?? 0) / 100).toFixed(2)}</p>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full border ${meta.chip}`}>
          {meta.label}
        </span>
      </div>
    </motion.div>
  );
}

export default function WalletPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isCompany = user?.role === "company";

  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetMyWallet({
    query: { queryKey: ["wallet"], refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: allTxs = [], isLoading: txsLoading, refetch: refetchTxs } = useListTransactions(undefined, {
    query: { queryKey: ["transactions"], refetchInterval: 30000, refetchIntervalInBackground: false },
  });
  const { data: depositRequests = [], refetch: refetchDeposits } = useListDepositRequests({
    query: { queryKey: ["deposit-requests"], enabled: isCompany, refetchInterval: 30000 },
  });

  const withdrawMutation = useRequestWithdrawal();
  const depositMutation = useRequestDeposit();

  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"pix" | "credit_card">("pix");
  const [page, setPage] = useState(0);
  const [txFilter, setTxFilter] = useState<TxFilter>("all");
  const [hideBalance, setHideBalance] = useState(false);
  const [activeTab, setActiveTab] = useState<"transactions" | "deposits">("transactions");

  const PLATFORM_PIX_KEY = "pagamentos@extrag0.com.br";
  const PLATFORM_BANK = "Banco extraGO — Ag. 0001 / Cc. 123456-7";

  const handleDeposit = async () => {
    const cents = Math.round(parseFloat(depositAmount) * 100);
    if (!cents || cents < 5000) { toast.error("Valor mínimo para depósito: R$ 50,00"); return; }
    try {
      await depositMutation.mutateAsync({
        data: { amount: cents, paymentMethod: depositMethod, pixKey: depositMethod === "pix" ? PLATFORM_PIX_KEY : undefined },
      });
      setShowDeposit(false);
      setDepositAmount("");
      toast.success("Solicitação de depósito registrada! Nossa equipe confirma em até 1 dia útil.");
      refetchWallet();
      refetchDeposits();
      setActiveTab("deposits");
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao solicitar depósito");
    }
  };

  const balance = wallet?.balance ?? 0;
  const pending = wallet?.pendingBalance ?? 0;
  const reserved = wallet?.reservedBalance ?? 0;
  const totalEarned = wallet?.totalEarned ?? 0;
  const pendingDeposits = (wallet as any)?.pendingDeposits ?? 0;

  const filteredTxs = txFilter === "all"
    ? allTxs
    : allTxs.filter((t: Transaction) => t.type === txFilter);

  const totalPages = Math.ceil(filteredTxs.length / PAGE_SIZE);
  const pageTxs = filteredTxs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const creditTotal = allTxs
    .filter((t: Transaction) => t.type === "credit" || t.type === "commission")
    .reduce((s: number, t: Transaction) => s + (t.amount ?? 0), 0) / 100;
  const debitTotal = allTxs
    .filter((t: Transaction) => t.type === "debit" || t.type === "withdrawal")
    .reduce((s: number, t: Transaction) => s + (t.amount ?? 0), 0) / 100;

  const handleWithdraw = async () => {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!cents || cents < 2000) { toast.error("Valor mínimo para saque: R$ 20,00"); return; }
    if (!pixKey.trim()) { toast.error("Informe sua chave PIX"); return; }
    try {
      await withdrawMutation.mutateAsync({ data: { amount: cents, pixKey } });
      setShowWithdraw(false);
      setAmount("");
      setPixKey("");
      toast.success("Saque solicitado! Aguardando aprovação em até 2 dias úteis.");
      refetchWallet();
      refetchTxs();
    } catch (e: any) {
      toast.error(e?.data?.error ?? "Erro ao solicitar saque");
    }
  };

  return (
    <div className="page-enter pb-20 lg:pb-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/images/backgrounds/bg-wallet.webp)",
          backgroundSize: "cover", backgroundPosition: "center",
          backgroundRepeat: "no-repeat", opacity: 0.09,
          mixBlendMode: "screen", filter: "blur(2px)",
        }}
      />
      <div className="mod-wallet-ambient absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a0d]/60 via-transparent to-[#070a0d]/50 pointer-events-none" />

      {/* Wallet Module Hero Banner */}
      <div className="module-hero module-hero-wallet">
        <div className="absolute right-0 top-0 bottom-0 flex items-end gap-3 pr-8 pb-4 pointer-events-none select-none" style={{ opacity: 0.07 }}>
          <Wallet size={90} style={{ color: "#14b8a6" }} />
          <CreditCard size={72} style={{ color: "#00e5ff" }} />
          <TrendingUp size={64} style={{ color: "#14b8a6" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center mod-icon-wallet flex-shrink-0">
              <Wallet size={12} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#14b8a6" }}>Módulo Financeiro</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Carteira</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{isCompany ? "Gerencie o saldo da empresa" : "Seus ganhos e saques via PIX"}</p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">

        {/* Hero balance card */}
        {walletLoading ? (
          <div className="h-44 skeleton rounded-3xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
            className="card-wallet-hero p-6 sm:p-8"
          >
            <div className="absolute inset-0 opacity-[0.09] bg-cover bg-center mix-blend-screen pointer-events-none blur-[1px]" style={{ backgroundImage: "url(/images/backgrounds/bg-wallet.webp)" }} />
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/6 via-transparent to-cyan-500/5 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
            {/* Financial wave watermark */}
            <div className="absolute right-0 bottom-0 pointer-events-none select-none opacity-[0.10]">
              <svg width="180" height="110" viewBox="0 0 180 110" fill="none">
                <path d="M0 55 Q22 33 44 55 Q66 77 88 55 Q110 33 132 55 Q154 77 180 55" stroke="#14B8A6" strokeWidth="2.5" fill="none"/>
                <path d="M0 72 Q22 50 44 72 Q66 94 88 72 Q110 50 132 72 Q154 94 180 72" stroke="#14B8A6" strokeWidth="1.8" fill="none" opacity="0.7"/>
                <path d="M0 38 Q22 16 44 38 Q66 60 88 38 Q110 16 132 38 Q154 60 180 38" stroke="#14B8A6" strokeWidth="1.2" fill="none" opacity="0.5"/>
                <path d="M0 88 Q22 66 44 88 Q66 110 88 88 Q110 66 132 88 Q154 110 180 88" stroke="#14B8A6" strokeWidth="1" fill="none" opacity="0.35"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mod-icon-wallet">
                    <Wallet size={15} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#14b8a6" }}>
                    {isCompany ? "Saldo da Empresa" : "Saldo Disponível"}
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setHideBalance(v => !v)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                </motion.button>
              </div>

              <div className="mb-6">
                {hideBalance ? (
                  <span className="text-3xl font-bold text-foreground/40 tracking-widest">••••••</span>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-semibold text-foreground/60 mb-1">R$</span>
                    <p className="text-5xl sm:text-6xl font-bold leading-none tabular-nums">
                      <AnimatedCounter value={balance / 100} decimals={2} />
                    </p>
                  </div>
                )}
                <p className="text-sm text-foreground/50 mt-2">
                  {isCompany ? "Disponível para contratações na plataforma" : "Disponível para saque imediato via PIX"}
                </p>
              </div>

              {/* CTA row */}
              <div className="flex items-center gap-3">
                {isCompany ? (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                      <Button
                        onClick={() => setShowDeposit(s => !s)}
                        className={`w-full font-bold rounded-xl h-11 border-none text-sm gap-2 ${
                          showDeposit ? "bg-white/10 text-foreground hover:bg-white/15" : "bg-primary text-black hover:bg-primary/90 neon-glow"
                        }`}
                      >
                        {showDeposit ? <><X size={15} /> Cancelar</> : <><ArrowDownLeft size={15} /> Adicionar Saldo</>}
                      </Button>
                    </motion.div>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 flex-shrink-0" title="Depósitos confirmados manualmente em até 1 dia útil">
                      <Clock size={11} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground font-medium">Aprovação manual</span>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                      <Button
                        onClick={() => setShowWithdraw(s => !s)}
                        className={`w-full font-bold rounded-xl h-11 border-none text-sm gap-2 ${
                          showWithdraw ? "bg-white/10 text-foreground hover:bg-white/15" : "bg-primary text-black hover:bg-primary/90 neon-glow"
                        }`}
                      >
                        {showWithdraw ? <><X size={15} /> Cancelar</> : <><Send size={15} /> Sacar via PIX</>}
                      </Button>
                    </motion.div>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/8 flex-shrink-0" title="Saques aprovados pela equipe em até 2 dias úteis">
                      <Clock size={11} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground font-medium">Aprovação manual</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Wallet size={130} className="absolute -right-6 -bottom-6 opacity-[0.04] text-primary" style={{ zIndex: 0 }} />
          </motion.div>
        )}

        {/* Secondary balance cards — 3-metric summary */}
        {walletLoading ? (
          <div className="grid grid-cols-3 gap-2.5"><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Resumo Financeiro</span>
              <div className="h-px flex-1 bg-white/6" />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="balance-card-mini p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 leading-tight">
                  {isCompany ? "Reservado" : "Pendente"}
                </p>
                <p className="text-base sm:text-xl font-bold leading-none tabular-nums">
                  {hideBalance ? "••••" : <>R$ <AnimatedCounter value={(isCompany ? reserved : pending) / 100} decimals={2} /></>}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  {isCompany
                    ? <><Lock size={8} className="text-blue-400" /> Em andamento</>
                    : <><Clock size={8} className="text-yellow-400" /> Processando</>
                  }
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="balance-card-mini p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 leading-tight">
                  {isCompany ? "Total Investido" : "Total Ganho"}
                </p>
                <p className="text-base sm:text-xl font-bold leading-none tabular-nums text-secondary">
                  {hideBalance ? "••••" : <>R$ <AnimatedCounter value={totalEarned / 100} decimals={2} /></>}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <TrendingUp size={8} className="text-secondary" /> Histórico total
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="balance-card-mini p-3 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 leading-tight">
                  Entradas
                </p>
                <p className="text-base sm:text-xl font-bold leading-none tabular-nums text-primary">
                  {hideBalance ? "••••" : <>R$ <AnimatedCounter value={creditTotal} decimals={2} /></>}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <ArrowDownLeft size={8} className="text-primary" /> Créditos totais
                </p>
              </motion.div>
            </div>
          </>
        )}

        {/* Company pending deposits alert */}
        {isCompany && pendingDeposits > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-yellow-400/8 border border-yellow-400/20"
          >
            <Clock size={16} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-yellow-400">Depósito em análise</p>
              <p className="text-[11px] text-muted-foreground">R$ {(pendingDeposits / 100).toFixed(2)} aguardando confirmação da equipe</p>
            </div>
            <button onClick={() => setActiveTab("deposits")} className="text-[11px] text-yellow-400 font-bold flex-shrink-0 border border-yellow-400/30 rounded-lg px-2 py-1">Ver</button>
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
              <div className="card-wallet-secondary p-5 sm:p-6 space-y-5 rounded-2xl">
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.45), rgba(0,229,255,0.22) 50%, transparent)" }} />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-400/12 border border-teal-400/22 flex items-center justify-center flex-shrink-0">
                    <Send size={15} className="text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">Solicitar Saque PIX</h3>
                    <p className="text-xs text-muted-foreground">Saldo disponível: R$ {(balance / 100).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Valor do Saque</label>
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
                        <motion.button key={v} whileTap={{ scale: 0.93 }} type="button"
                          onClick={() => setAmount(String(Math.min(v, balance / 100)))}
                          className="flex-1 py-1.5 rounded-lg border border-white/8 text-[11px] font-bold hover:border-primary/35 hover:text-primary hover:bg-primary/6 transition-all">
                          R${v}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Chave PIX</label>
                    <Input
                      value={pixKey} onChange={e => setPixKey(e.target.value)}
                      placeholder="CPF, CNPJ, e-mail ou celular"
                      className="bg-white/5 border-white/10 focus:border-primary/60 rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl text-xs text-muted-foreground space-y-1.5" style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.24)" }}>
                  <p className="font-bold text-foreground flex items-center gap-1.5 mb-1"><Shield size={12} className="text-primary" /> Informações do saque</p>
                  <p>• Prazo de aprovação: até 2 dias úteis</p>
                  <p>• Valor mínimo: R$ 20,00</p>
                  <p>• Transferência via PIX instantâneo após aprovação</p>
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

        {/* Company deposit form */}
        <AnimatePresence>
          {showDeposit && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="card-wallet-secondary p-5 sm:p-6 space-y-5 rounded-2xl">
                <div className="absolute top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.45), rgba(0,229,255,0.22) 50%, transparent)" }} />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-400/12 border border-teal-400/22 flex items-center justify-center flex-shrink-0">
                    <Building2 size={15} className="text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">Adicionar Saldo</h3>
                    <p className="text-xs text-muted-foreground">Valor mínimo R$ 50,00 · Confirmação em até 1 dia útil</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {(["pix", "credit_card"] as const).map(method => (
                    <button key={method} onClick={() => setDepositMethod(method)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        depositMethod === method
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/20"
                      }`}>
                      {method === "pix" ? "⚡ PIX" : "💳 Cartão de Crédito"}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-widest">Valor do Depósito</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">R$</span>
                    <Input
                      type="number" placeholder="0,00"
                      value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                      className="pl-10 bg-white/5 border-white/12 focus:border-primary/50 rounded-xl h-12 text-base font-bold"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[50, 100, 250, 500].map(v => (
                      <motion.button key={v} whileTap={{ scale: 0.93 }} type="button"
                        onClick={() => setDepositAmount(String(v))}
                        className="flex-1 py-1.5 rounded-lg border border-white/8 text-[11px] font-bold hover:border-primary/35 hover:text-primary hover:bg-primary/6 transition-all">
                        R${v}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl space-y-2" style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.24)" }}>
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Shield size={11} className="text-primary" />
                    {depositMethod === "pix" ? "Dados para PIX" : "Dados do Cartão"}
                  </p>
                  {depositMethod === "pix" ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Realize o PIX para a chave abaixo e depois confirme:</p>
                      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(20,184,166,0.14)", border: "1px solid rgba(20,184,166,0.28)" }}>
                        <code className="text-xs font-mono text-primary flex-1">{PLATFORM_PIX_KEY}</code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(PLATFORM_PIX_KEY); toast.success("Chave copiada!"); }}
                          className="text-[11px] text-muted-foreground hover:text-foreground border border-white/10 rounded-md px-2 py-0.5 transition-colors">
                          Copiar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Nossa equipe entrará em contato com o link de pagamento após confirmar sua solicitação.</p>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Após realizar o pagamento, clique em confirmar. Saldo creditado em até 1 dia útil.
                  </p>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-primary text-black hover:bg-primary/90 neon-glow border-none font-bold rounded-xl h-11"
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending || !depositAmount}
                  >
                    {depositMutation.isPending ? (
                      <><Loader2 size={15} className="mr-2 animate-spin" />Registrando solicitação...</>
                    ) : (
                      `Confirmar Depósito${depositAmount ? ` de R$ ${parseFloat(depositAmount || "0").toFixed(2)}` : ""}`
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab selector */}
        {isCompany && (
          <div className="flex gap-1 p-1 rounded-xl bg-white/4 border border-white/8">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "transactions" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Extrato
            </button>
            <button
              onClick={() => setActiveTab("deposits")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "deposits" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Depósitos {depositRequests.length > 0 && `(${depositRequests.length})`}
            </button>
          </div>
        )}

        {/* Deposit requests history (company) */}
        {isCompany && activeTab === "deposits" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,184,166,0.18) 0%, rgba(8,17,26,0.92) 65%)",
            border: "1px solid rgba(20,184,166,0.30)",
          }}
          >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.65), rgba(0,229,255,0.35), transparent)" }} />
            <div className="flex items-center gap-3 mb-5 relative">
              <h2 className="font-bold text-base flex-1">Histórico de Depósitos</h2>
              {depositRequests.length > 0 && (
                <span className="text-[11px] text-muted-foreground bg-white/4 border border-white/8 px-2.5 py-1 rounded-full font-semibold">
                  {depositRequests.length} {depositRequests.length !== 1 ? "solicitações" : "solicitação"}
                </span>
              )}
            </div>
            {depositRequests.length === 0 ? (
              <EmptyState
                icon={<Building2 size={36} className="text-muted-foreground/40" />}
                title="Nenhum depósito ainda"
                description="Adicione saldo para começar a contratar."
              />
            ) : (
              <div>
                {depositRequests.map((dep, i) => <DepositRow key={dep.id} dep={dep} index={i} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* Transaction history */}
        {(!isCompany || activeTab === "transactions") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,184,166,0.18) 0%, rgba(8,17,26,0.92) 65%)",
            border: "1px solid rgba(20,184,166,0.30)",
          }}
          >
          <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(20,184,166,0.65), rgba(0,229,255,0.35), transparent)" }} />
            <div className="flex items-center gap-3 mb-2 relative">
              <div className="w-7 h-7 rounded-lg bg-secondary/12 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft size={13} className="text-secondary" />
              </div>
              <h2 className="font-bold text-base flex-1">Extrato</h2>
              {allTxs.length > 0 && (
                <span className="text-[11px] text-muted-foreground bg-white/4 border border-white/8 px-2.5 py-1 rounded-full font-semibold">
                  {allTxs.length} transaç{allTxs.length !== 1 ? "ões" : "ão"}
                </span>
              )}
            </div>
            {allTxs.length > 0 && (
              <div className="flex items-center gap-3 py-2 mb-3 border-b border-white/5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ArrowDownLeft size={9} className="text-primary" />
                  Entradas: <span className="text-primary font-bold ml-0.5">R$ {creditTotal.toFixed(2)}</span>
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight size={9} className="text-destructive" />
                  Saídas: <span className="text-destructive font-bold ml-0.5">R$ {debitTotal.toFixed(2)}</span>
                </span>
              </div>
            )}
            <div className="mt-1" />

            {/* Filter pills */}
            {allTxs.length > 0 && (
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                {(Object.keys(TX_FILTER_LABELS) as TxFilter[]).map(f => (
                  <button key={f} onClick={() => { setTxFilter(f); setPage(0); }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex-shrink-0 transition-all ${
                      txFilter === f ? "bg-primary text-black" : "border border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}>
                    {TX_FILTER_LABELS[f]}
                  </button>
                ))}
              </div>
            )}

            {txsLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <SkeletonListRow key={i} />)}</div>
            ) : pageTxs.length === 0 ? (
              <EmptyState
                icon={<Wallet size={36} className="text-muted-foreground/40" />}
                title="Nenhuma transação"
                description="Suas movimentações financeiras aparecem aqui."
              />
            ) : (
              <>
                <div>
                  {pageTxs.map((tx, i) => <TransactionRow key={tx.id} tx={tx} index={i} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                      Próximo <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
