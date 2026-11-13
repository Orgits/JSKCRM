/**
 * Loan products and EMI maths (mock rates — confirm with the society's loan policy / bye-laws).
 */
import type { Loan } from "@/lib/mock/member-profiles";

export type LoanPurpose = Loan["purpose"];

export type LoanProduct = {
  purpose: LoanPurpose;
  /** Annual interest, reducing balance */
  rate: number;
  maxAmount: number;
  tenures: number[];
  /** How many member-guarantors the society needs */
  guarantors: number;
  description: string;
};

export const LOAN_PRODUCTS: LoanProduct[] = [
  { purpose: "Personal", rate: 12, maxAmount: 300000, tenures: [12, 24, 36], guarantors: 2, description: "Family needs, festivals, consumer goods" },
  { purpose: "Business", rate: 13, maxAmount: 500000, tenures: [12, 24, 36, 48], guarantors: 2, description: "Working capital, stock, equipment" },
  { purpose: "Education", rate: 10, maxAmount: 400000, tenures: [24, 36, 48], guarantors: 1, description: "Fees, books, hostel for children" },
  { purpose: "Housing", rate: 9.5, maxAmount: 1000000, tenures: [36, 48, 60], guarantors: 2, description: "Construction, repair, purchase" },
  { purpose: "Medical", rate: 11, maxAmount: 200000, tenures: [12, 24], guarantors: 1, description: "Treatment and hospital bills" },
];

export function productFor(purpose: LoanPurpose): LoanProduct {
  return LOAN_PRODUCTS.find((p) => p.purpose === purpose) ?? LOAN_PRODUCTS[0];
}

/** Processing fee: 1% of the loan, minimum ₹250. */
export function processingFee(amount: number): number {
  return Math.max(250, Math.round(amount * 0.01));
}

/** Monthly EMI on a reducing balance, rounded to the rupee. */
export function emiFor(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const f = (1 + r) ** months;
  return Math.round((principal * r * f) / (f - 1));
}

/** EMI, total interest and total repayable for an application. */
export function loanQuote(principal: number, annualRate: number, months: number) {
  const emi = emiFor(principal, annualRate, months);
  const totalPayable = emi * months;
  return { emi, totalPayable, totalInterest: Math.max(0, totalPayable - principal) };
}
