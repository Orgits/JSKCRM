/**
 * Transactions ledger (mock): every receipt and payout across members, newest first.
 * The first rows are the dashboard's "Recent transactions"; the rest are generated deterministically
 * from the member register so server and client agree. Replace with the transactions API.
 */
import type { BadgeTone } from "@/components/ui/Badge";
import { recentTransactions, type Transaction } from "./dashboard";
import { loans } from "./member-profiles";
import { MOCK_TODAY, members } from "./members";

export type LedgerType = Transaction["type"] | "Share capital" | "Fees";
export type PaymentMode = "Cash" | "UPI" | "Cheque" | "Transfer" | "Auto-debit";
export type LedgerStatus = Transaction["status"];

export type LedgerEntry = {
  id: string;
  receiptNo: string;
  memberId: string;
  memberName: string;
  type: LedgerType;
  /** Account or loan the money moved against: SB-0412, CD-0877, LN-2026-0418 */
  account: string;
  amount: number;
  mode: PaymentMode;
  /** ISO timestamp */
  at: string;
  /** Staff member who posted it */
  by: string;
  status: LedgerStatus;
  /** False when the member isn't in the register mock (some dashboard rows), so the UI doesn't link to a 404. */
  inRegister: boolean;
};

export const ledgerStatusTone: Record<LedgerStatus, BadgeTone> = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
};

/** Money leaving the society (shown with a minus sign). */
export const OUTFLOW_TYPES: LedgerType[] = ["Withdrawal", "Loan disbursal"];

export function isOutflow(type: LedgerType) {
  return OUTFLOW_TYPES.includes(type);
}

const STAFF = ["Meena (Cashier)", "Krishna Verma", "Priya Sharma"];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function receiptFor(id: string) {
  return `RCPT-${id.replace("TXN-", "")}`;
}

function accountFor(type: LedgerType, memberId: string, rand: () => number) {
  const n = memberId.slice(-4);
  if (type === "EMI received" || type === "Loan disbursal") {
    const own = loans.filter((l) => l.memberId === memberId);
    return own.length ? own[Math.floor(rand() * own.length)].loanNo : `LN-2026-${n}`;
  }
  if (type === "Share capital") return `SH-${n}`;
  if (type === "Fees") return `FEE-${n}`;
  return rand() < 0.75 ? `SB-${n}` : `CD-${n}`;
}

function generated(count: number): LedgerEntry[] {
  const rand = seeded(7);
  const active = members.filter((m) => m.status === "Active");
  const borrowers = new Set(loans.map((l) => l.memberId));
  const end = new Date(`${MOCK_TODAY}T18:00:00+05:30`).getTime();
  const out: LedgerEntry[] = [];

  for (let n = 0; n < count; n++) {
    const m = active[Math.floor(rand() * active.length)];
    const roll = rand();
    const type: LedgerType = borrowers.has(m.id) && roll < 0.35
      ? (roll < 0.04 ? "Loan disbursal" : "EMI received")
      : roll < 0.7 ? "Deposit" : roll < 0.9 ? "Withdrawal" : roll < 0.96 ? "Share capital" : "Fees";
    const amount =
      type === "Loan disbursal" ? 50000 + Math.round(rand() * 25) * 10000
      : type === "EMI received" ? 2000 + Math.round(rand() * 80) * 100
      : type === "Share capital" ? 100 * (1 + Math.floor(rand() * 10))
      : type === "Fees" ? [50, 100, 250][Math.floor(rand() * 3)]
      : 500 + Math.round(rand() * 59) * 500;
    const mode: PaymentMode =
      type === "Loan disbursal" ? "Transfer"
      : rand() < 0.45 ? "Cash" : rand() < 0.75 ? "UPI" : rand() < 0.9 ? "Cheque" : "Auto-debit";
    // Spread across the 30 days before today, in branch hours (9:30 AM – 5:30 PM IST).
    const day = Math.floor(rand() * 30) + 1;
    const minutes = 30 + Math.floor(rand() * 480);
    const at = new Date(end - day * 86400000 - (18 * 60 - 9 * 60 - minutes) * 60000);
    const statusRoll = rand();
    const status: LedgerStatus = statusRoll < 0.03 ? "Failed" : statusRoll < 0.07 ? "Pending" : "Completed";
    out.push({
      id: "",
      receiptNo: "",
      memberId: m.id,
      memberName: m.name,
      type,
      account: accountFor(type, m.id, rand),
      amount,
      mode,
      at: at.toISOString(),
      by: STAFF[Math.floor(rand() * STAFF.length)],
      status,
      inRegister: true,
    });
  }
  // Number them in time order so receipt numbers rise with time (older than the dashboard rows).
  return out
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((e, i) => {
      const id = `TXN-${80406 - i}`;
      return { ...e, id, receiptNo: receiptFor(id) };
    });
}

const recent: LedgerEntry[] = recentTransactions.map((t, i) => {
  const member = members.find((m) => m.id === t.memberId);
  const loan = loans.find((l) => l.memberId === t.memberId);
  const isLoan = t.type === "EMI received" || t.type === "Loan disbursal";
  return {
    ...t,
    // The register is the source of truth for names.
    memberName: member?.name ?? t.memberName,
    receiptNo: receiptFor(t.id),
    account: isLoan ? (loan?.loanNo ?? `LN-2026-${t.memberId.slice(-4)}`) : `SB-${t.memberId.slice(-4)}`,
    mode: (["Cash", "UPI", "Transfer", "Cash", "UPI", "Cash"] as const)[i % 6],
    by: STAFF[i % STAFF.length],
    inRegister: !!member,
  };
});

/** Full ledger, newest first. */
export const ledger: LedgerEntry[] = [...recent, ...generated(160)].sort((a, b) => b.at.localeCompare(a.at));

/** Next receipt number the cashier screen will issue (mock). */
export const nextTxnNumber = 80413;
