export const TEST_EMAILS = [
  "teste.freelancer@extrago.com",
  "teste.empresa@extrago.com",
  "teste.f@extrago.com",
  "teste.e@extrago.com",
] as const;

export const SEED_EMAIL_DOMAIN = "seed.extrago.com";

export function isTestAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return (TEST_EMAILS as readonly string[]).includes(email);
}

export function isSeedAccount(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.endsWith(`@${SEED_EMAIL_DOMAIN}`);
}
