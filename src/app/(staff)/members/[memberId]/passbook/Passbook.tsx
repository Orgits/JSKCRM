"use client";

import { useMemo, useState } from "react";
import { Banknote, CalendarCheck, CalendarDays, Download, FileSearch, Wallet, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import { type DepositAccount, type DepositAccountType, type PassbookRow } from "@/lib/mock/member-profiles";
import { MOCK_TODAY } from "@/lib/mock/members";
import { society } from "@/lib/society";

type Book = { account: DepositAccount; rows: PassbookRow[] };
type Period = "all" | "fy" | "3m" | "30d";
type Kind = "all" | "credit" | "debit";

const accountStyle: Record<DepositAccountType, { label: string; icon: LucideIcon; tone: string }> = {
  Savings: { label: "Savings", icon: Wallet, tone: "bg-brand-50 text-brand-600" },
  "Compulsory thrift": { label: "Compulsory thrift", icon: CalendarCheck, tone: "bg-success-50 text-success-600" },
  "Recurring deposit": { label: "Recurring deposit", icon: CalendarDays, tone: "bg-accent-50 text-accent-600" },
  "Fixed deposit": { label: "Fixed deposit", icon: Banknote, tone: "bg-info-50 text-info-600" },
};

const periods: { value: Period; label: string }[] = [
  { value: "fy", label: "This FY" },
  { value: "3m", label: "Last 3 months" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

const kinds: { value: Kind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "credit", label: "Credits" },
  { value: "debit", label: "Debits" },
];

/** ISO date (YYYY-MM-DD) where the period starts, relative to the mock "today". */
function periodStart(period: Period): string {
  const today = new Date(`${MOCK_TODAY}T00:00:00Z`);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  switch (period) {
    case "fy": {
      // Indian financial year starts 1 April.
      const year = today.getUTCMonth() >= 3 ? today.getUTCFullYear() : today.getUTCFullYear() - 1;
      return `${year}-04-01`;
    }
    case "3m": {
      const d = new Date(today);
      d.setUTCMonth(d.getUTCMonth() - 3);
      return iso(d);
    }
    case "30d": {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - 30);
      return iso(d);
    }
    default:
      return "0000-01-01";
  }
}

function downloadCsv(book: Book, rows: PassbookRow[]) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["Date", "Time", "Txn ID", "Particulars", "Note", "Mode", "Debit (₹)", "Credit (₹)", "Balance (₹)"];
  const lines = rows.map((r) =>
    [formatDate(r.at), formatTime(r.at), r.txnId, r.particulars, r.note, r.mode, r.amount < 0 ? -r.amount : "", r.amount > 0 ? r.amount : "", r.balance]
      .map(escape)
      .join(","),
  );
  const blob = new Blob([[header.map(escape).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `passbook-${book.account.accountNo}-${MOCK_TODAY}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-full border px-3 text-xs leading-4 transition-colors outline-none focus-visible:shadow-focus",
        active
          ? "border-brand-100 bg-brand-50 font-semibold text-brand-700"
          : "border-neutral-border bg-neutral-surface font-medium text-text-secondary hover:border-neutral-border-strong",
      )}
    >
      {children}
    </button>
  );
}

export function Passbook({ memberName, books }: { memberName: string; books: Book[] }) {
  const [accountNo, setAccountNo] = useState(books[0]?.account.accountNo);
  const [period, setPeriod] = useState<Period>("fy");
  const [kind, setKind] = useState<Kind>("all");

  const book = books.find((b) => b.account.accountNo === accountNo) ?? books[0];

  const view = useMemo(() => {
    const from = periodStart(period);
    const inRange = book.rows.filter((r) => r.at.slice(0, 10) >= from);
    const closing = book.rows[0]?.balance ?? book.account.balance;
    const oldest = inRange[inRange.length - 1];
    const opening = oldest ? oldest.balance - oldest.amount : closing;
    const credits = inRange.filter((r) => r.amount > 0);
    const debits = inRange.filter((r) => r.amount < 0);
    const shown = inRange.filter((r) => kind === "all" || (kind === "credit" ? r.amount > 0 : r.amount < 0));
    return {
      shown,
      opening,
      closing,
      credits: { total: credits.reduce((s, r) => s + r.amount, 0), count: credits.length },
      debits: { total: -debits.reduce((s, r) => s + r.amount, 0), count: debits.length },
    };
  }, [book, period, kind]);

  const style = accountStyle[book.account.type];

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Choose account" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {books.map(({ account }) => {
          const s = accountStyle[account.type];
          const Icon = s.icon;
          const active = account.accountNo === book.account.accountNo;
          return (
            <button
              key={account.accountNo}
              type="button"
              aria-pressed={active}
              onClick={() => setAccountNo(account.accountNo)}
              className={cn(
                "flex items-center gap-3 rounded-card border p-4 text-left transition-colors outline-none focus-visible:shadow-focus",
                active
                  ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600"
                  : "border-neutral-border bg-neutral-surface shadow-card hover:border-neutral-border-strong",
              )}
            >
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-control", active ? "bg-neutral-surface text-brand-600" : s.tone)}>
                <Icon size={20} strokeWidth={1.6} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className={cn("block truncate text-xs leading-4", active ? "font-semibold text-brand-700" : "text-text-muted")}>
                  {s.label} · {account.accountNo}
                </span>
                <span className="block text-base leading-6 font-semibold text-text-primary tabular-nums">
                  {formatINR(account.balance)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-6">
          <div>
            <h2 className="text-base leading-6 font-semibold text-text-primary">{style.label} passbook</h2>
            <p className="text-[13px] leading-[18px] text-text-secondary">
              {book.account.accountNo} · {memberName} · {society.headOffice}
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => downloadCsv(book, view.shown)}
            disabled={view.shown.length === 0}
            leadingIcon={<Download {...iconProps} />}
          >
            Export CSV
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-5 pt-4 pb-4 sm:px-6">
          <div role="group" aria-label="Period" className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <Chip key={p.value} active={period === p.value} onClick={() => setPeriod(p.value)}>
                {p.label}
              </Chip>
            ))}
          </div>
          <div role="group" aria-label="Entry type" className="flex gap-0.5 rounded-control bg-neutral-bg p-[3px] sm:ml-auto">
            {kinds.map((k) => (
              <button
                key={k.value}
                type="button"
                aria-pressed={kind === k.value}
                onClick={() => setKind(k.value)}
                className={cn(
                  "h-7 rounded-[8px] px-3.5 text-xs leading-4 transition-colors outline-none focus-visible:shadow-focus",
                  kind === k.value ? "bg-neutral-surface font-semibold text-text-primary shadow-card" : "font-medium text-text-secondary hover:text-text-primary",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <dl className="grid gap-px border-y border-neutral-border bg-neutral-border sm:grid-cols-2 xl:grid-cols-4">
          <Summary label="Opening balance" value={formatINR(view.opening)} />
          <Summary
            label="Total credits"
            value={`+ ${formatINR(view.credits.total)}`}
            tone="text-success-600"
            note={`${view.credits.count} ${view.credits.count === 1 ? "entry" : "entries"}`}
          />
          <Summary
            label="Total debits"
            value={`− ${formatINR(view.debits.total)}`}
            tone="text-danger-600"
            note={`${view.debits.count} ${view.debits.count === 1 ? "entry" : "entries"}`}
          />
          <Summary label="Closing balance" value={formatINR(view.closing)} tone="text-brand-700" note={`As on ${formatDate(MOCK_TODAY)}`} />
        </dl>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm leading-5">
            <thead>
              <tr className="border-b border-neutral-border text-[11px] leading-[14px] font-semibold tracking-[0.06em] text-text-muted uppercase">
                <th scope="col" className="py-2.5 pr-3 pl-5 font-semibold sm:pl-6">Date</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Txn ID</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Particulars</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Mode</th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">Debit</th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">Credit</th>
                <th scope="col" className="py-2.5 pr-5 pl-3 text-right font-semibold sm:pr-6">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border">
              {view.shown.map((r) => (
                <tr key={r.txnId} className="hover:bg-neutral-subtle">
                  <td className="py-3 pr-3 pl-5 whitespace-nowrap sm:pl-6">
                    <p className="font-medium text-text-primary">{formatDate(r.at)}</p>
                    <p className="text-xs leading-4 text-text-muted">{formatTime(r.at)}</p>
                  </td>
                  <td className="px-3 py-3 text-xs leading-4 whitespace-nowrap text-text-secondary">{r.txnId}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-text-primary">{r.particulars}</p>
                    <p className="text-xs leading-4 text-text-muted">{r.note}</p>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">{r.mode}</td>
                  <td className={cn("px-3 py-3 text-right font-medium tabular-nums", r.amount < 0 ? "text-danger-600" : "text-text-muted")}>
                    {r.amount < 0 ? formatINR(-r.amount) : "—"}
                  </td>
                  <td className={cn("px-3 py-3 text-right font-medium tabular-nums", r.amount > 0 ? "text-success-600" : "text-text-muted")}>
                    {r.amount > 0 ? formatINR(r.amount) : "—"}
                  </td>
                  <td className="py-3 pr-5 pl-3 text-right font-semibold text-text-primary tabular-nums sm:pr-6">{formatINR(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {view.shown.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-neutral-bg text-text-muted">
                <FileSearch {...iconProps} />
              </span>
              <p className="text-sm leading-5 font-semibold text-text-primary">No entries in this period</p>
              <p className="text-[13px] leading-[18px] text-text-secondary">Choose a longer period or a different account.</p>
            </div>
          )}
        </div>

        <p className="border-t border-neutral-border px-5 py-3.5 text-[13px] leading-[18px] text-text-secondary sm:px-6">
          Showing {view.shown.length} of {book.rows.length} entries · Savings interest is credited quarterly.
        </p>
      </Card>
    </div>
  );
}

function Summary({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-neutral-subtle px-5 py-3.5 sm:px-6">
      <dt className="text-xs leading-4 text-text-muted">{label}</dt>
      <dd className={cn("text-lg leading-[26px] font-semibold tabular-nums", tone ?? "text-text-primary")}>{value}</dd>
      <dd className="text-xs leading-4 text-text-muted">{note ?? " "}</dd>
    </div>
  );
}
