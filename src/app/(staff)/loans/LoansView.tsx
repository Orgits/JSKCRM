"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { EmptyRow, Pagination, tableHeadRow, usePagination } from "@/components/ui/Pagination";
import { TextField } from "@/components/ui/TextField";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatINR } from "@/lib/format";
import type { Loan, LoanStatus } from "@/lib/mock/member-profiles";

export type LoanRow = Loan & { memberName: string; status: LoanStatus };

const smIcon = { size: 18, strokeWidth: 1.6, "aria-hidden": true } as const;

type StatusFilter = "all" | LoanStatus;
type PurposeFilter = "all" | Loan["purpose"];

/** Loans table with search, status / purpose filters, CSV export and paging. */
export function LoansView({ loans, today }: { loans: LoanRow[]; today: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return loans
      .filter(
        (l) =>
          (status === "all" || l.status === status) &&
          (purpose === "all" || l.purpose === purpose) &&
          (!q || l.loanNo.toLowerCase().includes(q) || l.memberId.toLowerCase().includes(q) || l.memberName.toLowerCase().includes(q)),
      )
      // Overdue first, then by next due date.
      .sort((a, b) => b.overdueEmis - a.overdueEmis || a.nextDueOn.localeCompare(b.nextDueOn));
  }, [loans, query, status, purpose]);

  const pager = usePagination(filtered);

  function exportCsv() {
    downloadCsv(
      `loans-${today}.csv`,
      ["Loan no.", "Member ID", "Member", "Purpose", "Sanctioned", "Sanctioned on", "EMI", "EMIs paid", "Tenure (months)", "Outstanding", "Next due", "Overdue EMIs", "Status"],
      filtered.map((l) => [l.loanNo, l.memberId, l.memberName, l.purpose, l.sanctioned, formatDate(l.sanctionedOn), l.emi, l.emisPaid, l.tenureMonths, l.outstanding, formatDate(l.nextDueOn), l.overdueEmis, l.status]),
    );
  }

  return (
    <section aria-label="Active loans" className="min-w-0 overflow-hidden rounded-card border border-neutral-border bg-neutral-surface shadow-card">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <TextField
          size="md"
          type="search"
          aria-label="Search loans"
          placeholder="Loan no., member name or ID"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            pager.reset();
          }}
          leadingIcon={<Search {...smIcon} />}
          containerClassName="w-full sm:w-80"
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            pager.reset();
          }}
          options={[
            { value: "all", label: "All" },
            { value: "Regular", label: "Regular" },
            { value: "Overdue", label: "Overdue" },
          ]}
        />
        <FilterSelect
          label="Purpose"
          value={purpose}
          onChange={(v) => {
            setPurpose(v);
            pager.reset();
          }}
          options={[
            { value: "all", label: "All" },
            ...(["Personal", "Business", "Education", "Housing", "Medical"] as const).map((p) => ({ value: p, label: p })),
          ]}
        />
        <div className="flex-1" />
        <Button variant="secondary" size="md" leadingIcon={<Download {...smIcon} />} onClick={exportCsv} disabled={!filtered.length}>
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm leading-5">
          <thead>
            <tr className={tableHeadRow}>
              <th scope="col" className="py-2.5 pr-2 pl-5 font-semibold">Loan</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Borrower</th>
              <th scope="col" className="px-2 py-2.5 text-right font-semibold">Sanctioned</th>
              <th scope="col" className="px-2 py-2.5 text-right font-semibold">EMI</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Repaid</th>
              <th scope="col" className="px-2 py-2.5 text-right font-semibold">Outstanding</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Next due</th>
              <th scope="col" className="py-2.5 pr-5 pl-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {pager.rows.map((l) => {
              const pct = Math.round((l.emisPaid / l.tenureMonths) * 100);
              return (
                <tr key={l.loanNo} className="hover:bg-neutral-subtle">
                  <td className="py-3 pr-2 pl-5">
                    <p className="font-semibold text-text-primary tabular-nums">{l.loanNo}</p>
                    <p className="text-xs leading-4 text-text-muted">
                      {l.purpose} · {formatDate(l.sanctionedOn)}
                    </p>
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/members/${l.memberId}`} className="group flex items-center gap-2.5 outline-none">
                      <Avatar name={l.memberName} toneKey={l.memberId} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-text-primary group-hover:text-brand-700 group-focus-visible:text-brand-700">
                          {l.memberName}
                        </span>
                        <span className="block text-xs leading-4 text-text-muted">{l.memberId}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-right text-text-secondary tabular-nums">{formatINR(l.sanctioned)}</td>
                  <td className="px-2 py-3 text-right text-text-secondary tabular-nums">{formatINR(l.emi)}</td>
                  <td className="px-2 py-3">
                    <div className="flex w-32 flex-col gap-1">
                      <span className="text-xs leading-4 text-text-secondary tabular-nums">
                        {l.emisPaid} of {l.tenureMonths} EMIs
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-neutral-bg">
                        <span className="block h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right font-semibold text-text-primary tabular-nums">{formatINR(l.outstanding)}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-text-secondary">{formatDate(l.nextDueOn)}</td>
                  <td className="py-3 pr-5 pl-2">
                    <Badge tone={l.status === "Overdue" ? "danger" : "success"} dot>
                      {l.status === "Overdue" ? `${l.overdueEmis} EMI${l.overdueEmis > 1 ? "s" : ""} overdue` : "Regular"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {pager.rows.length === 0 && (
              <EmptyRow colSpan={8} title="No loans match these filters" hint="Try a different loan number or member, or clear the filters." />
            )}
          </tbody>
        </table>
      </div>

      <Pagination pager={pager} noun="loans" />
    </section>
  );
}
