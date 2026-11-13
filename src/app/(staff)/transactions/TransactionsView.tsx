"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { EmptyRow, Pagination, tableHeadRow, usePagination } from "@/components/ui/Pagination";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import {
  isOutflow,
  ledgerStatusTone,
  type LedgerEntry,
  type LedgerStatus,
  type LedgerType,
  type PaymentMode,
} from "@/lib/mock/transactions";

const smIcon = { size: 18, strokeWidth: 1.6, "aria-hidden": true } as const;

type Period = "today" | "7d" | "30d" | "all";

const TYPES: LedgerType[] = ["Deposit", "Withdrawal", "EMI received", "Loan disbursal", "Share capital", "Fees"];
const MODES: PaymentMode[] = ["Cash", "UPI", "Cheque", "Transfer", "Auto-debit"];

function inPeriod(period: Period, at: string, today: string) {
  if (period === "all") return true;
  const days = period === "today" ? 0 : period === "7d" ? 6 : 29;
  const from = new Date(`${today}T00:00:00+05:30`).getTime() - days * 86400000;
  return new Date(at).getTime() >= from;
}

/** Transactions ledger: search, period / type / mode / status filters, CSV export and paging. */
export function TransactionsView({ entries, today }: { entries: LedgerEntry[]; today: string }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<Period>("30d");
  const [type, setType] = useState<"all" | LedgerType>("all");
  const [mode, setMode] = useState<"all" | PaymentMode>("all");
  const [status, setStatus] = useState<"all" | LedgerStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (t) =>
        inPeriod(period, t.at, today) &&
        (type === "all" || t.type === type) &&
        (mode === "all" || t.mode === mode) &&
        (status === "all" || t.status === status) &&
        (!q ||
          t.id.toLowerCase().includes(q) ||
          t.receiptNo.toLowerCase().includes(q) ||
          t.account.toLowerCase().includes(q) ||
          t.memberId.toLowerCase().includes(q) ||
          t.memberName.toLowerCase().includes(q)),
    );
  }, [entries, query, period, type, mode, status, today]);

  const pager = usePagination(filtered);
  const net = filtered
    .filter((t) => t.status === "Completed")
    .reduce((s, t) => s + (isOutflow(t.type) ? -t.amount : t.amount), 0);

  function filter<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v);
      pager.reset();
    };
  }

  return (
    <section aria-label="Transactions" className="min-w-0 overflow-hidden rounded-card border border-neutral-border bg-neutral-surface shadow-card">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <TextField
          size="md"
          type="search"
          aria-label="Search transactions"
          placeholder="Txn / receipt no., account or member"
          value={query}
          onChange={(e) => filter(setQuery)(e.target.value)}
          leadingIcon={<Search {...smIcon} />}
          containerClassName="w-full sm:w-80"
        />
        <FilterSelect
          label="Period"
          value={period}
          onChange={filter(setPeriod)}
          options={[
            { value: "today", label: "Today" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "all", label: "All" },
          ]}
        />
        <FilterSelect label="Type" value={type} onChange={filter(setType)} options={[{ value: "all", label: "All" }, ...TYPES.map((t) => ({ value: t, label: t }))]} />
        <FilterSelect label="Mode" value={mode} onChange={filter(setMode)} options={[{ value: "all", label: "All" }, ...MODES.map((m) => ({ value: m, label: m }))]} />
        <FilterSelect
          label="Status"
          value={status}
          onChange={filter(setStatus)}
          options={[
            { value: "all", label: "All" },
            { value: "Completed", label: "Completed" },
            { value: "Pending", label: "Pending" },
            { value: "Failed", label: "Failed" },
          ]}
        />
        <div className="flex-1" />
        <p className="text-sm leading-5 text-text-secondary">
          Net <span className={cn("font-semibold tabular-nums", net >= 0 ? "text-success-600" : "text-danger-600")}>{net >= 0 ? "+" : "−"}{formatINR(Math.abs(net))}</span>
        </p>
        <Button
          variant="secondary"
          size="md"
          leadingIcon={<Download {...smIcon} />}
          disabled={!filtered.length}
          onClick={() =>
            downloadCsv(
              `transactions-${today}.csv`,
              ["Txn ID", "Receipt no.", "Date", "Time", "Member ID", "Member", "Type", "Account", "Mode", "Amount", "Direction", "Posted by", "Status"],
              filtered.map((t) => [t.id, t.receiptNo, formatDate(t.at), formatTime(t.at), t.memberId, t.memberName, t.type, t.account, t.mode, t.amount, isOutflow(t.type) ? "Debit" : "Credit", t.by, t.status]),
            )
          }
        >
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-left text-sm leading-5">
          <thead>
            <tr className={tableHeadRow}>
              <th scope="col" className="py-2.5 pr-2 pl-5 font-semibold">Date &amp; time</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Transaction</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Member</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Type</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Mode</th>
              <th scope="col" className="px-2 py-2.5 text-right font-semibold">Amount</th>
              <th scope="col" className="py-2.5 pr-5 pl-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {pager.rows.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-subtle">
                <td className="py-3 pr-2 pl-5 whitespace-nowrap text-text-secondary">
                  {formatDate(t.at)}
                  <span className="block text-xs leading-4 text-text-muted">{formatTime(t.at)}</span>
                </td>
                <td className="px-2 py-3">
                  <p className="font-semibold text-text-primary tabular-nums">{t.id}</p>
                  <p className="text-xs leading-4 text-text-muted">
                    {t.account} · by {t.by}
                  </p>
                </td>
                <td className="px-2 py-3">
                  {t.inRegister ? (
                    <Link href={`/members/${t.memberId}`} className="font-semibold text-text-primary outline-none hover:text-brand-700 focus-visible:text-brand-700">
                      {t.memberName}
                    </Link>
                  ) : (
                    <p className="font-semibold text-text-primary">{t.memberName}</p>
                  )}
                  <p className="text-xs leading-4 text-text-muted">{t.memberId}</p>
                </td>
                <td className="px-2 py-3 text-text-secondary">{t.type}</td>
                <td className="px-2 py-3 text-text-secondary">{t.mode}</td>
                <td className={cn("px-2 py-3 text-right font-semibold tabular-nums", isOutflow(t.type) ? "text-text-primary" : "text-success-600")}>
                  {isOutflow(t.type) ? "−" : "+"}
                  {formatINR(t.amount)}
                </td>
                <td className="py-3 pr-5 pl-2">
                  <Badge tone={ledgerStatusTone[t.status]} dot>
                    {t.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {pager.rows.length === 0 && (
              <EmptyRow colSpan={7} title="No transactions match these filters" hint="Widen the period or clear the filters." />
            )}
          </tbody>
        </table>
      </div>

      <Pagination pager={pager} noun="transactions" />
    </section>
  );
}
