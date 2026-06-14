export const TEST_ACCOUNTS = [
  "teste.f@extrago.com",
  "teste.e@extrago.com",
];

export const canUseMockData = (email?: string): boolean => {
  if (!email) return false;
  return TEST_ACCOUNTS.includes(email.toLowerCase());
};
