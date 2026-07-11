/**
 * Centralized BRL currency formatter.
 *
 * IMPORTANT — unit conventions in this codebase:
 *   • Wallet balance, reserved_balance, pending_balance → stored as INTEGER CENTS (e.g. 150000 = R$1.500,00)
 *   • Transaction.amount                               → INTEGER CENTS
 *   • Job.hourlyRate / Job.dailyRate / Job.totalValue  → FLOAT BRL (e.g. 1500.00 = R$1.500,00)
 *
 * Always pass the correct raw value and choose the right helper.
 */

/**
 * Format an INTEGER CENTS value as Brazilian Real.
 * Example: formatBRL(150000) → "R$ 1.500,00"
 */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format a FLOAT BRL value (already in reais, not cents).
 * Example: formatBRLFloat(1500) → "R$ 1.500,00"
 */
export function formatBRLFloat(brl: number): string {
  return brl.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Compact: "R$ 1.500" (no decimal cents, for badges/labels).
 */
export function formatBRLCompact(brl: number): string {
  if (brl >= 1_000_000) return `R$ ${(brl / 1_000_000).toFixed(1)}M`;
  if (brl >= 1_000) return `R$ ${(brl / 1_000).toFixed(0)}K`;
  return `R$ ${brl.toFixed(0)}`;
}
