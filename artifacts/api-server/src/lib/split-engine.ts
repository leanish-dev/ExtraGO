/**
 * Split Engine — extraGO Financial Governance Layer
 *
 * All financial split calculations must flow through this module.
 * Percentages are never hardcoded — they are read from platformConfigTable
 * and cached in memory for performance.
 *
 * Architecture:
 *   Frontend → extraGO API → Business Rules → Split Engine → Wallet Ledger
 *
 * The Split Engine knows nothing about Asaas or any payment provider.
 * It only calculates how money should be distributed according to governance rules.
 */

import { db, platformConfigTable } from "@workspace/db";

// ─── Default Financial Parameters ──────────────────────────────────────────────
// These are fallbacks only. Governance-configured values always take precedence.

export const DEFAULT_SPLIT_CONFIG: SplitConfig = {
  platformFeeByLevel: {
    bronze: 0.20,
    silver: 0.18,
    gold: 0.15,
    elite: 0.12,
    diamond: 0.10,
  },
  referralRates: {
    indicador: 0.02,
    agente: 0.03,
    embaixador: 0.05,
  },
  referralThresholds: {
    agente: { activeReferrals: 25, networkExtras: 100 },
    embaixador: { activeReferrals: 100, networkExtras: 1000 },
  },
  representativeRate: 0.05,
  investorRate: 0.00,
  reserveFundRate: 0.00,
  escrowRules: {
    enabled: false,
    autoReleaseHours: 72,
    disputeWindowHours: 24,
  },
  withdrawalRules: {
    minAmountCents: 2000,
    maxAmountCents: 5000000,
    processingDays: 1,
  },
  asaasConfig: {
    enabled: false,
    environment: "sandbox" as const,
    webhookEnabled: false,
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SplitConfig {
  platformFeeByLevel: Record<string, number>;
  referralRates: {
    indicador: number;
    agente: number;
    embaixador: number;
  };
  referralThresholds: {
    agente: { activeReferrals: number; networkExtras: number };
    embaixador: { activeReferrals: number; networkExtras: number };
  };
  representativeRate: number;
  investorRate: number;
  reserveFundRate: number;
  escrowRules: {
    enabled: boolean;
    autoReleaseHours: number;
    disputeWindowHours: number;
  };
  withdrawalRules: {
    minAmountCents: number;
    maxAmountCents: number;
    processingDays: number;
  };
  asaasConfig: {
    enabled: boolean;
    environment: "sandbox" | "production";
    webhookEnabled: boolean;
  };
}

export interface SplitResult {
  grossAmount: number;
  platformFeeAmount: number;
  platformFeeRate: number;
  referralFeeAmount: number;
  referralFeeRate: number;
  representativeFeeAmount: number;
  representativeFeeRate: number;
  reserveFundAmount: number;
  reserveFundRate: number;
  netFreelancerAmount: number;
  breakdown: {
    label: string;
    amount: number;
    rate: number;
    recipient: string;
  }[];
}

// ─── In-Memory Cache ───────────────────────────────────────────────────────────

let cachedConfig: SplitConfig | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

// ─── Config Loader ─────────────────────────────────────────────────────────────

/**
 * Load the split configuration from platformConfigTable.
 * Results are cached for 60 seconds to avoid DB round-trips on every job completion.
 * Call this BEFORE starting a DB transaction — it must not run inside a transaction.
 */
export async function loadSplitConfig(): Promise<SplitConfig> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiresAt) return cachedConfig;

  const rows = await db.select().from(platformConfigTable);
  const keyMap = new Map(rows.map(r => [r.key, r.value]));

  const config: SplitConfig = {
    platformFeeByLevel: {
      bronze: toNumber(keyMap.get("level_fee_bronze"), DEFAULT_SPLIT_CONFIG.platformFeeByLevel.bronze),
      silver: toNumber(keyMap.get("level_fee_silver"), DEFAULT_SPLIT_CONFIG.platformFeeByLevel.silver),
      gold: toNumber(keyMap.get("level_fee_gold"), DEFAULT_SPLIT_CONFIG.platformFeeByLevel.gold),
      elite: toNumber(keyMap.get("level_fee_elite"), DEFAULT_SPLIT_CONFIG.platformFeeByLevel.elite),
      diamond: toNumber(keyMap.get("level_fee_diamond"), DEFAULT_SPLIT_CONFIG.platformFeeByLevel.diamond),
    },
    referralRates: {
      indicador: toNumber(keyMap.get("referral_rate_indicador"), DEFAULT_SPLIT_CONFIG.referralRates.indicador),
      agente: toNumber(keyMap.get("referral_rate_agente"), DEFAULT_SPLIT_CONFIG.referralRates.agente),
      embaixador: toNumber(keyMap.get("referral_rate_embaixador"), DEFAULT_SPLIT_CONFIG.referralRates.embaixador),
    },
    referralThresholds: toObject(
      keyMap.get("financial.referral_thresholds"),
      DEFAULT_SPLIT_CONFIG.referralThresholds,
    ),
    representativeRate: toNumber(
      keyMap.get("financial.representative_rate"),
      DEFAULT_SPLIT_CONFIG.representativeRate,
    ),
    investorRate: toNumber(
      keyMap.get("financial.investor_rate"),
      DEFAULT_SPLIT_CONFIG.investorRate,
    ),
    reserveFundRate: toNumber(
      keyMap.get("financial.reserve_fund_rate"),
      DEFAULT_SPLIT_CONFIG.reserveFundRate,
    ),
    escrowRules: toObject(keyMap.get("financial.escrow_rules"), DEFAULT_SPLIT_CONFIG.escrowRules),
    withdrawalRules: toObject(keyMap.get("financial.withdrawal_rules"), DEFAULT_SPLIT_CONFIG.withdrawalRules),
    asaasConfig: toObject(keyMap.get("financial.asaas_config"), DEFAULT_SPLIT_CONFIG.asaasConfig),
  };

  cachedConfig = config;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return config;
}

/** Force the cache to expire on the next read (call after governance config changes). */
export function invalidateSplitConfigCache(): void {
  cachedConfig = null;
  cacheExpiresAt = 0;
}

// ─── Referral Rate Calculator ──────────────────────────────────────────────────

export function calculateReferralRate(
  config: SplitConfig,
  activeReferrals: number,
  networkExtras: number,
  ambassadorApproved: boolean,
): number {
  const { referralRates, referralThresholds } = config;
  if (
    activeReferrals >= referralThresholds.embaixador.activeReferrals &&
    networkExtras >= referralThresholds.embaixador.networkExtras &&
    ambassadorApproved
  ) return referralRates.embaixador;
  if (
    activeReferrals >= referralThresholds.agente.activeReferrals &&
    networkExtras >= referralThresholds.agente.networkExtras
  ) return referralRates.agente;
  return referralRates.indicador;
}

export function referralTierLabel(config: SplitConfig, rate: number): string {
  if (rate >= config.referralRates.embaixador) return "Embaixador Regional";
  if (rate >= config.referralRates.agente) return "Agente de Captação";
  return "Indicador";
}

// ─── Split Calculator ──────────────────────────────────────────────────────────

/**
 * Calculate the full financial split for a job completion.
 *
 * @param config      - Loaded split configuration (from loadSplitConfig)
 * @param grossAmount - Total job value in cents
 * @param level       - Freelancer level key (bronze/silver/gold/elite/diamond)
 * @param referralRate - Referral commission rate (0 if no referrer)
 * @param representativeRate - State representative commission rate (0 if no rep)
 */
export function calculateSplit(
  config: SplitConfig,
  grossAmount: number,
  level: string,
  referralRate: number,
  representativeRate: number,
): SplitResult {
  const platformFeeRate = config.platformFeeByLevel[level] ?? config.platformFeeByLevel.bronze;
  const platformFeeAmount = Math.round(grossAmount * platformFeeRate);
  const freelancerGross = grossAmount - platformFeeAmount;

  const referralFeeAmount = Math.round(freelancerGross * referralRate);
  const representativeFeeAmount = Math.round(platformFeeAmount * representativeRate);
  const reserveFundAmount = Math.round(platformFeeAmount * config.reserveFundRate);

  const netFreelancerAmount = freelancerGross - referralFeeAmount;

  const breakdown = [
    { label: "Recebimento líquido (Freelancer)", amount: netFreelancerAmount, rate: 1 - platformFeeRate - referralRate * (1 - platformFeeRate), recipient: "freelancer" },
    { label: `Taxa da plataforma (${(platformFeeRate * 100).toFixed(0)}%)`, amount: platformFeeAmount, rate: platformFeeRate, recipient: "platform" },
  ];

  if (referralFeeAmount > 0) {
    breakdown.push({ label: `Comissão de indicação (${(referralRate * 100).toFixed(0)}%)`, amount: referralFeeAmount, rate: referralRate, recipient: "referrer" });
  }
  if (representativeFeeAmount > 0) {
    breakdown.push({ label: `Comissão regional (${(representativeRate * 100).toFixed(0)}%)`, amount: representativeFeeAmount, rate: representativeRate, recipient: "representative" });
  }
  if (reserveFundAmount > 0) {
    breakdown.push({ label: `Fundo de reserva (${(config.reserveFundRate * 100).toFixed(0)}%)`, amount: reserveFundAmount, rate: config.reserveFundRate, recipient: "reserve" });
  }

  return {
    grossAmount,
    platformFeeAmount,
    platformFeeRate,
    referralFeeAmount,
    referralFeeRate: referralRate,
    representativeFeeAmount,
    representativeFeeRate: representativeRate,
    reserveFundAmount,
    reserveFundRate: config.reserveFundRate,
    netFreelancerAmount,
    breakdown,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

function toObject<T>(value: unknown, fallback: T): T {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return { ...fallback, ...(value as Record<string, unknown>) } as T;
  }
  return fallback;
}
