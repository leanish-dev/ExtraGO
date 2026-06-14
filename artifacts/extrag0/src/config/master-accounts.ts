export const MASTER_ACCOUNTS = [
  "leonardoscheffel2000@gmail.com",
  "extrago.ceo@yahoo.com",
];

export const isMasterAccount = (email?: string): boolean => {
  if (!email) return false;
  return MASTER_ACCOUNTS.includes(email.toLowerCase());
};
