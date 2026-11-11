import type { BadgeTone } from "@/components/ui/Badge";

export const kpis = {
  members: { value: 1248, delta: "+36", caption: "this month" },
  deposits: { value: 28_640_000, delta: "+4.2%", caption: "vs last month" },
  loansOutstanding: { value: 19_215_000, delta: "+2.8%", caption: "vs last month" },
  overdue: { value: 1_840_000, delta: "+0.6%", caption: "vs last month" },
};

export type TransactionType = "Deposit" | "Withdrawal" | "Loan disbursal" | "EMI received";

export type Transaction = {
  id: string;
  memberName: string;
  memberId: string;
  type: TransactionType;
  amount: number;
  /** ISO timestamp */
  at: string;
  status: "Completed" | "Pending" | "Failed";
};

export const statusTone: Record<Transaction["status"], BadgeTone> = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
};

export const recentTransactions: Transaction[] = [
  { id: "TXN-80412", memberName: "Ramesh Kumar Verma", memberId: "JSK-M-0412", type: "Deposit", amount: 25000, at: "2026-11-11T10:42:00+05:30", status: "Completed" },
  { id: "TXN-80411", memberName: "Sunita Devi", memberId: "JSK-M-0877", type: "EMI received", amount: 8450, at: "2026-11-11T10:15:00+05:30", status: "Completed" },
  { id: "TXN-80410", memberName: "Mohd. Arif Khan", memberId: "JSK-M-1023", type: "Loan disbursal", amount: 184500, at: "2026-11-11T09:58:00+05:30", status: "Pending" },
  { id: "TXN-80409", memberName: "Kavita Joshi", memberId: "JSK-M-0331", type: "Withdrawal", amount: 12000, at: "2026-11-10T17:20:00+05:30", status: "Completed" },
  { id: "TXN-80408", memberName: "Harish Chandra Pandey", memberId: "JSK-M-1190", type: "EMI received", amount: 6200, at: "2026-11-10T16:05:00+05:30", status: "Failed" },
  { id: "TXN-80407", memberName: "Meena Kumari", memberId: "JSK-M-0654", type: "Deposit", amount: 5000, at: "2026-11-10T14:41:00+05:30", status: "Completed" },
];

export type LoanApplication = {
  loanNo: string;
  memberName: string;
  memberId: string;
  purpose: string;
  amount: number;
  /** ISO date */
  appliedOn: string;
  stage: "New" | "Verification" | "Committee";
};

export const stageTone: Record<LoanApplication["stage"], BadgeTone> = {
  New: "info",
  Verification: "warning",
  Committee: "brand",
};

export const pendingLoans: LoanApplication[] = [
  { loanNo: "LN-2026-0418", memberName: "Deepak Rawat", memberId: "JSK-M-0998", purpose: "Business", amount: 300000, appliedOn: "2026-11-10", stage: "New" },
  { loanNo: "LN-2026-0415", memberName: "Anjali Mishra", memberId: "JSK-M-0712", purpose: "Education", amount: 150000, appliedOn: "2026-11-08", stage: "Verification" },
  { loanNo: "LN-2026-0411", memberName: "Suresh Yadav", memberId: "JSK-M-0289", purpose: "Housing", amount: 850000, appliedOn: "2026-11-05", stage: "Committee" },
  { loanNo: "LN-2026-0409", memberName: "Pooja Bisht", memberId: "JSK-M-1102", purpose: "Medical", amount: 75000, appliedOn: "2026-11-04", stage: "Verification" },
];

/** Next member number the register form will assign (mock). */
export const nextMemberNumber = 1249;
