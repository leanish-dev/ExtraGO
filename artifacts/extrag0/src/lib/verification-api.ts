import { apiFetch } from "./api-fetch";

/**
 * Thin typed wrappers around the Phase 1 verification/KYC/legal endpoints.
 * These are not part of the generated api-client (no OpenAPI spec yet for
 * them), so they go through the shared apiFetch helper directly.
 */

export type AccountStatus =
  | "draft"
  | "pending_email"
  | "pending_phone"
  | "pending_documents"
  | "pending_review"
  | "verified"
  | "rejected"
  | "blocked"
  | "inactive";

export type LegalDocumentType =
  | "terms_of_use"
  | "privacy_policy"
  | "lgpd"
  | "freelancer_agreement"
  | "company_agreement"
  | "payment_policy"
  | "cancellation_policy"
  | "community_guidelines"
  | "anti_fraud_policy";

export interface LegalDocument {
  id: number;
  type: LegalDocumentType;
  version: string;
  title: string;
  content: string;
  status: string;
  publicationDate: string | null;
  effectiveDate: string | null;
}

export interface KycDocument {
  id: number;
  userId: number;
  documentType: string;
  fileUrl: string;
  version: number;
  status: "pending" | "approved" | "rejected" | "correction_requested";
  reviewNotes: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

// ── Email verification ──────────────────────────────────────
export const requestEmailVerification = () =>
  apiFetch("/api/auth/verify-email/request", { method: "POST" });

export const confirmEmailVerification = (input: { token?: string; otpCode?: string }) =>
  apiFetch("/api/auth/verify-email/confirm", { method: "POST", body: JSON.stringify(input) });

// ── Phone verification ──────────────────────────────────────
export const requestPhoneVerification = (input: { phone: string; channel?: "sms" | "whatsapp" }) =>
  apiFetch("/api/auth/verify-phone/request", { method: "POST", body: JSON.stringify(input) });

export const confirmPhoneVerification = (input: { code: string }) =>
  apiFetch("/api/auth/verify-phone/confirm", { method: "POST", body: JSON.stringify(input) });

// ── Forgot / reset password ──────────────────────────────────
export const requestPasswordReset = (email: string) =>
  apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (input: { token: string; newPassword: string }) =>
  apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify(input) });

// ── Legal documents ──────────────────────────────────────────
export const LEGAL_DOCUMENT_TYPES: LegalDocumentType[] = [
  "terms_of_use",
  "privacy_policy",
  "lgpd",
  "freelancer_agreement",
  "company_agreement",
  "payment_policy",
  "cancellation_policy",
  "community_guidelines",
  "anti_fraud_policy",
];

export const LEGAL_DOCUMENT_LABELS: Record<LegalDocumentType, string> = {
  terms_of_use: "Termos de Uso",
  privacy_policy: "Política de Privacidade",
  lgpd: "LGPD — Proteção de Dados",
  freelancer_agreement: "Contrato de Profissional Independente",
  company_agreement: "Contrato de Empresa Parceira",
  payment_policy: "Política de Pagamentos",
  cancellation_policy: "Política de Cancelamento",
  community_guidelines: "Diretrizes da Comunidade",
  anti_fraud_policy: "Política Antifraude",
};

export const getLegalDocument = (type: LegalDocumentType): Promise<LegalDocument> =>
  apiFetch(`/api/legal/documents/${type}`);

export const acceptLegalDocument = (documentId: number) =>
  apiFetch("/api/legal/accept", { method: "POST", body: JSON.stringify({ documentId }) });

export const getMyLegalAcceptances = (): Promise<any[]> => apiFetch("/api/legal/acceptances/me");

// ── KYC documents ─────────────────────────────────────────────
export const submitKycDocument = (input: { documentType: string; fileUrl: string }): Promise<KycDocument> =>
  apiFetch("/api/kyc/documents", { method: "POST", body: JSON.stringify(input) });

export const getMyKycDocuments = (): Promise<KycDocument[]> => apiFetch("/api/kyc/documents/me");

// ── File → data URL (base64) helper, used for the drag-and-drop uploader ──
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  draft: "Rascunho",
  pending_email: "Verificação de e-mail pendente",
  pending_phone: "Verificação de telefone pendente",
  pending_documents: "Envio de documentos pendente",
  pending_review: "Em análise",
  verified: "Verificado",
  rejected: "Verificação rejeitada",
  blocked: "Conta bloqueada",
  inactive: "Inativa",
};

export function nextOnboardingRoute(status: AccountStatus): string | null {
  switch (status) {
    case "draft":
    case "pending_email":
      return "/onboarding/verify-email";
    case "pending_phone":
      return "/onboarding/verify-phone";
    case "pending_documents":
      return "/onboarding/documents";
    case "pending_review":
      return "/verification-center";
    case "blocked":
      return "/onboarding/blocked";
    case "rejected":
      return "/onboarding/rejected";
    default:
      return null; // verified / inactive — no forced redirect
  }
}
