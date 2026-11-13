"use client";

import { BookOpen, Download, FileSpreadsheet, HandCoins, IdCard, PiggyBank, TriangleAlert, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatMobile, formatTime, plural } from "@/lib/format";
import {
  depositAccountsFor,
  getMemberProfile,
  loanStatus,
  loans,
  memberName,
  shareCapital,
} from "@/lib/mock/member-profiles";
import { MOCK_TODAY, members } from "@/lib/mock/members";
import { isOutflow, ledger } from "@/lib/mock/transactions";

type Report = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  rows: number;
  build: () => { header: string[]; rows: (string | number)[][] };
};

const profiles = members.flatMap((m) => getMemberProfile(m.id) ?? []);
const overdueLoans = loans.filter((l) => l.overdueEmis > 0);

const reports: Report[] = [
  {
    id: "day-book",
    title: "Day book",
    description: "Every receipt and payout with mode, account and cashier — for daily cash tally.",
    icon: BookOpen,
    tone: "bg-brand-50 text-brand-600",
    rows: ledger.length,
    build: () => ({
      header: ["Date", "Time", "Txn ID", "Receipt no.", "Member ID", "Member", "Type", "Account", "Mode", "Credit", "Debit", "Posted by", "Status"],
      rows: ledger.map((t) => [formatDate(t.at), formatTime(t.at), t.id, t.receiptNo, t.memberId, t.memberName, t.type, t.account, t.mode, isOutflow(t.type) ? "" : t.amount, isOutflow(t.type) ? t.amount : "", t.by, t.status]),
    }),
  },
  {
    id: "loan-portfolio",
    title: "Loan portfolio",
    description: "All active loans with sanction, EMI, repayments and outstanding principal.",
    icon: HandCoins,
    tone: "bg-accent-50 text-accent-600",
    rows: loans.length,
    build: () => ({
      header: ["Loan no.", "Member ID", "Member", "Purpose", "Sanctioned", "Sanctioned on", "EMI", "EMIs paid", "Tenure", "Outstanding", "Next due", "Status"],
      rows: loans.map((l) => [l.loanNo, l.memberId, memberName(l.memberId), l.purpose, l.sanctioned, formatDate(l.sanctionedOn), l.emi, l.emisPaid, l.tenureMonths, l.outstanding, formatDate(l.nextDueOn), loanStatus(l)]),
    }),
  },
  {
    id: "overdue",
    title: "Overdue & recovery list",
    description: "Borrowers with unpaid EMIs, their guarantors and the recovery-visit location.",
    icon: TriangleAlert,
    tone: "bg-danger-50 text-danger-600",
    rows: overdueLoans.length,
    build: () => ({
      header: ["Loan no.", "Member ID", "Member", "Mobile", "Overdue EMIs", "Overdue amount", "Oldest due", "Guarantors", "Location"],
      rows: overdueLoans.map((l) => {
        const m = members.find((x) => x.id === l.memberId);
        return [l.loanNo, l.memberId, memberName(l.memberId), m ? formatMobile(m.mobile) : "", l.overdueEmis, l.emi * l.overdueEmis, formatDate(l.nextDueOn), l.guarantorIds.map(memberName).join("; "), l.locationUrl ?? ""];
      }),
    }),
  },
  {
    id: "member-register",
    title: "Member register",
    description: "Statutory register: member number, admission date, membership type, KYC and status.",
    icon: IdCard,
    tone: "bg-info-50 text-info-600",
    rows: members.length,
    build: () => ({
      header: ["Member ID", "Name", "Mobile", "Joined on", "Membership", "KYC", "Status"],
      rows: members.map((m) => [m.id, m.name, formatMobile(m.mobile), formatDate(m.joinedOn), m.membership, m.kyc, m.status]),
    }),
  },
  {
    id: "deposits",
    title: "Deposit balances",
    description: "Closing balance of every savings, thrift, RD and FD account.",
    icon: PiggyBank,
    tone: "bg-success-50 text-success-600",
    rows: profiles.reduce((s, p) => s + depositAccountsFor(p).length, 0),
    build: () => ({
      header: ["Account no.", "Type", "Member ID", "Member", "Balance", "Terms"],
      rows: profiles.flatMap((p) => depositAccountsFor(p).map((a) => [a.accountNo, a.type, p.id, p.name, a.balance, a.detail])),
    }),
  },
  {
    id: "share-capital",
    title: "Share capital register",
    description: "Shares held and paid-up share capital per member.",
    icon: FileSpreadsheet,
    tone: "bg-brand-50 text-brand-600",
    rows: profiles.length,
    build: () => ({
      header: ["Member ID", "Member", "Shares", "Share capital"],
      rows: profiles.map((p) => [p.id, p.name, p.shares, shareCapital(p)]),
    }),
  },
];

/** Downloadable registers. Built from the mock data on click; swap for report API endpoints later. */
export function ReportDownloads() {
  return (
    <section aria-label="Downloadable reports" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((r) => (
        <Card key={r.id} className="flex flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-control ${r.tone}`}>
              <r.icon size={20} strokeWidth={1.6} aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h3 className="text-base leading-6 font-semibold text-text-primary">{r.title}</h3>
              <p className="text-[13px] leading-[18px] text-text-secondary">{r.description}</p>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-border pt-4">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">CSV</Badge>
              <span className="text-xs leading-4 text-text-muted">{plural(r.rows, "row")}</span>
            </div>
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<Download size={18} strokeWidth={1.6} aria-hidden />}
              onClick={() => {
                const { header, rows } = r.build();
                downloadCsv(`${r.id}-${MOCK_TODAY}.csv`, header, rows);
              }}
            >
              Download
            </Button>
          </div>
        </Card>
      ))}
    </section>
  );
}
