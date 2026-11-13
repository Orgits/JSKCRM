/**
 * Admission charges collected at registration (mock values — confirm with the society's bye-laws).
 */
export const ADMISSION_FEE = 100;
export const SHARE_VALUE = 100;
export const FIRST_COMPULSORY_DEPOSIT = 500;
export const PASSBOOK_FEE = 50;

export type FeeLine = { label: string; amount: number };

/** Line items for the registration fee receipt. */
export function registrationFees(shares: number): { lines: FeeLine[]; total: number } {
  const lines: FeeLine[] = [
    { label: "Admission fee", amount: ADMISSION_FEE },
    { label: `Share capital (${shares} × ₹${SHARE_VALUE})`, amount: shares * SHARE_VALUE },
    { label: "First compulsory deposit", amount: FIRST_COMPULSORY_DEPOSIT },
    { label: "Passbook & ID card", amount: PASSBOOK_FEE },
  ];
  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}
