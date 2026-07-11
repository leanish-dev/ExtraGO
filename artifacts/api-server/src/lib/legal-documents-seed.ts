/**
 * Re-exports from legal-documents.ts for use in seed.ts.
 * Also exports hashDocumentContent so seed.ts doesn't import from verification.ts
 * (which has heavier dependencies).
 */
import crypto from "crypto";
export { LEGAL_DOCUMENTS } from "./legal-documents";

export function hashDocumentContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
