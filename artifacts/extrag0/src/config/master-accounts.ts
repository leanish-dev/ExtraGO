export const MASTER_ACCOUNTS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];

export const CEO_GOVERNANCE_EMAILS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
  "jeandick2000@gmail.com",
];

export const isMasterAccount = (email?: string): boolean => {
  if (!email) return false;
  return MASTER_ACCOUNTS.includes(email.toLowerCase());
};

export const isCEO = (email?: string): boolean => {
  if (!email) return false;
  return CEO_GOVERNANCE_EMAILS.includes(email.toLowerCase());
};
