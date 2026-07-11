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
  | "correction_requested"
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

/** Dev-only: retrieves the last email sent to the current user's address
 *  when no real email provider (RESEND_API_KEY) is configured.
 *  Returns null in production or when no email has been sent yet. */
export const getDevLastEmail = (): Promise<{
  provider: "resend" | "dev-console";
  subject: string;
  html: string;
  text: string;
  sentAt: string;
} | null> =>
  apiFetch("/api/dev/last-email").catch(() => null);

/** Dev-only: retrieves the last SMS sent to the given phone number
 *  when no real SMS provider (TWILIO_*) is configured.
 *  Returns null in production or when no SMS has been sent yet. */
export const getDevLastSms = (phone?: string): Promise<{
  provider: "twilio" | "dev-console";
  body: string;
  channel: string;
  sentAt: string;
} | null> => {
  const qs = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return apiFetch(`/api/dev/last-sms${qs}`).catch(() => null);
};

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
export const submitKycDocument = (input: { documentType: string; fileUrl: string; captureMetadata?: string }): Promise<KycDocument> =>
  apiFetch("/api/kyc/documents", { method: "POST", body: JSON.stringify(input) });

/** Gathers non-sensitive client capture context for FaceScan/selfie submissions (timestamp, device, camera). */
export function buildCaptureMetadata(extra?: { cameraLabel?: string; facingMode?: string }): string {
  return JSON.stringify({
    capturedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: (navigator as any).userAgentData?.platform ?? navigator.platform,
    screen: { width: window.screen.width, height: window.screen.height },
    language: navigator.language,
    cameraLabel: extra?.cameraLabel ?? null,
    facingMode: extra?.facingMode ?? null,
    source: extra?.cameraLabel !== undefined ? "camera" : "file_upload",
  });
}

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
  correction_requested: "Correção de documentos solicitada",
  blocked: "Conta bloqueada",
  inactive: "Inativa",
};

// ── Admin KYC API ──────────────────────────────────────────────

export const getAdminKycQueue = (status: string): Promise<any[]> =>
  apiFetch(`/api/admin/kyc/queue?status=${status}`);

export const getAdminKycUser = (userId: number): Promise<any> =>
  apiFetch(`/api/admin/kyc/users/${userId}`);

export const getAdminKycStats = (): Promise<Record<string, number>> =>
  apiFetch("/api/admin/kyc/stats");

export const approveKycAccount = (userId: number, notes?: string) =>
  apiFetch(`/api/admin/kyc/users/${userId}/approve`, { method: "POST", body: JSON.stringify({ notes }) });

export const rejectKycAccount = (userId: number, reason: string, notes?: string, publicMessage?: string) =>
  apiFetch(`/api/admin/kyc/users/${userId}/reject`, { method: "POST", body: JSON.stringify({ reason, notes, publicMessage }) });

export const requestKycDocuments = (userId: number, documentTypes: string[], message?: string) =>
  apiFetch(`/api/admin/kyc/users/${userId}/request-documents`, { method: "POST", body: JSON.stringify({ documentTypes, message }) });

export const requestKycSelfie = (userId: number, message?: string) =>
  apiFetch(`/api/admin/kyc/users/${userId}/request-selfie`, { method: "POST", body: JSON.stringify({ message }) });

export const addKycNote = (userId: number, content: string, isPublic: boolean) =>
  apiFetch(`/api/admin/kyc/users/${userId}/note`, { method: "POST", body: JSON.stringify({ content, isPublic }) });

export const suspendKycVerification = (userId: number, reason?: string) =>
  apiFetch(`/api/admin/kyc/users/${userId}/suspend`, { method: "POST", body: JSON.stringify({ reason }) });

export const resumeKycVerification = (userId: number) =>
  apiFetch(`/api/admin/kyc/users/${userId}/resume`, { method: "POST" });

export function nextOnboardingRoute(status: AccountStatus): string | null {
  switch (status) {
    case "draft":
    case "pending_email":
    case "pending_phone":
    case "pending_documents":
    case "rejected":
    case "correction_requested":
      // The onboarding wizard is a single route that resumes at the right
      // internal step based on the user's accountStatus — there are no
      // separate sub-routes per stage.
      return "/onboarding";
    case "pending_review":
      return "/verification-center";
    case "blocked":
      return "/verification-center";
    default:
      return null; // verified / inactive — no forced redirect
  }
}
