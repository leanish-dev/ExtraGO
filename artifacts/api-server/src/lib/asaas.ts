/**
 * Asaas Integration Foundation — extraGO Financial Infrastructure Layer
 *
 * This module provides the abstraction layer between extraGO's business logic
 * and the Asaas payment infrastructure. All Asaas communication MUST go
 * through this module — never call Asaas directly from business modules.
 *
 * Current status: FOUNDATION ONLY — all methods return not_implemented stubs.
 * No actual Asaas API calls are made. This architecture is prepared for
 * full activation once governance declares readiness.
 *
 * Activation checklist (complete before enabling):
 * 1. Set ASAAS_API_KEY in environment secrets
 * 2. Configure financial.asaas_config in Governance → Financeiro
 * 3. Set asaasConfig.enabled = true in governance settings
 * 4. Test webhook endpoint with Asaas sandbox
 * 5. Verify split calculations match Asaas transfer amounts
 * 6. Enable asaasConfig.environment = "production" only after full sandbox validation
 *
 * Architecture:
 *   Frontend → extraGO API → Business Rules → Split Engine → AsaasService
 *   The frontend NEVER communicates directly with Asaas.
 */

export type AsaasEnvironment = "sandbox" | "production";

export interface AsaasConfig {
  enabled: boolean;
  environment: AsaasEnvironment;
  apiKey?: string;
}

export interface AsaasResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

// ─── Charge Types ──────────────────────────────────────────────────────────────

export interface AsaasChargeRequest {
  customerId: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
}

export interface AsaasChargeResponse {
  id: string;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "CANCELLED";
  value: number;
  netValue: number;
  billingType: string;
  invoiceUrl?: string;
  pixQrCode?: { encodedImage: string; payload: string };
}

// ─── Transfer Types ────────────────────────────────────────────────────────────

export interface AsaasTransferRequest {
  value: number;
  bankAccount?: {
    bank: { code: string };
    accountName: string;
    cpfCnpj: string;
    agency: string;
    account: string;
    accountDigit: string;
    bankAccountType: "CONTA_CORRENTE" | "CONTA_POUPANCA";
  };
  pixAddressKey?: string;
  pixAddressKeyType?: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "EVP";
  description?: string;
  externalReference?: string;
}

export interface AsaasTransferResponse {
  id: string;
  status: "PENDING" | "DONE" | "CANCELLED";
  value: number;
  scheduleDate?: string;
  authorized: boolean;
}

// ─── Webhook Types ─────────────────────────────────────────────────────────────

export interface AsaasWebhookEvent {
  event: string;
  payment?: { id: string; status: string; value: number; externalReference?: string };
  transfer?: { id: string; status: string; value: number; externalReference?: string };
}

// ─── Service Class ─────────────────────────────────────────────────────────────

export class AsaasService {
  private config: AsaasConfig;

  constructor(config: AsaasConfig) {
    this.config = config;
  }

  private get baseUrl(): string {
    return this.config.environment === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
  }

  private isEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey;
  }

  /**
   * Create a payment charge for a company deposit.
   * Returns not_implemented until Asaas integration is activated.
   */
  async createCharge(_request: AsaasChargeRequest): Promise<AsaasResult<AsaasChargeResponse>> {
    if (!this.isEnabled()) {
      return { ok: false, error: "Asaas integration not yet activated", errorCode: "not_implemented" };
    }
    // TODO: implement when activated
    // const response = await fetch(`${this.baseUrl}/payments`, { ... });
    return { ok: false, error: "not_implemented", errorCode: "not_implemented" };
  }

  /**
   * Create a PIX transfer for a freelancer withdrawal.
   * Returns not_implemented until Asaas integration is activated.
   */
  async createTransfer(_request: AsaasTransferRequest): Promise<AsaasResult<AsaasTransferResponse>> {
    if (!this.isEnabled()) {
      return { ok: false, error: "Asaas integration not yet activated", errorCode: "not_implemented" };
    }
    // TODO: implement when activated
    return { ok: false, error: "not_implemented", errorCode: "not_implemented" };
  }

  /**
   * Get the Asaas account balance.
   * Returns not_implemented until Asaas integration is activated.
   */
  async getBalance(): Promise<AsaasResult<{ balance: number; totalBalance: number }>> {
    if (!this.isEnabled()) {
      return { ok: false, error: "Asaas integration not yet activated", errorCode: "not_implemented" };
    }
    // TODO: implement when activated
    return { ok: false, error: "not_implemented", errorCode: "not_implemented" };
  }

  /**
   * Process an incoming webhook from Asaas.
   * Validates signature and maps to internal event types.
   */
  async processWebhook(
    _payload: AsaasWebhookEvent,
    _signature: string,
  ): Promise<AsaasResult<{ eventType: string; referenceId?: string }>> {
    if (!this.isEnabled()) {
      return { ok: false, error: "Asaas integration not yet activated", errorCode: "not_implemented" };
    }
    // TODO: implement signature validation and event mapping
    return { ok: false, error: "not_implemented", errorCode: "not_implemented" };
  }

  /**
   * Sync payment status from Asaas to internal records.
   * Called by polling job or webhook handler.
   */
  async syncPaymentStatus(_asaasChargeId: string): Promise<AsaasResult<{ status: string; confirmedAt?: Date }>> {
    if (!this.isEnabled()) {
      return { ok: false, error: "Asaas integration not yet activated", errorCode: "not_implemented" };
    }
    return { ok: false, error: "not_implemented", errorCode: "not_implemented" };
  }
}

// ─── Singleton Factory ─────────────────────────────────────────────────────────

let _asaasInstance: AsaasService | null = null;

/**
 * Get the singleton Asaas service instance.
 * Config is injected at runtime from governance settings.
 * Call refreshAsaasInstance() after governance config changes.
 */
export function getAsaasService(config?: AsaasConfig): AsaasService {
  if (!_asaasInstance || config) {
    _asaasInstance = new AsaasService(config ?? {
      enabled: false,
      environment: "sandbox",
    });
  }
  return _asaasInstance;
}

export function refreshAsaasInstance(config: AsaasConfig): void {
  _asaasInstance = new AsaasService(config);
}
