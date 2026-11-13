"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { EmptyRow, Pagination, tableHeadRow, usePagination } from "@/components/ui/Pagination";
import { TextField } from "@/components/ui/TextField";
import { downloadCsv } from "@/lib/csv";
import { formatINR } from "@/lib/format";
import type { DepositAccount, DepositAccountType } from "@/lib/mock/member-profiles";
import type { MemberStatus } from "@/lib/mock/members";

export type DepositRow = DepositAccount & { memberId: string; memberName: string; memberStatus: MemberStatus };

const smIcon = { size: 18, strokeWidth: 1.6, "aria-hidden": true } as const;

const typeTone: Record<DepositAccountType, BadgeTone> = {
  Savings: "brand",
  "Compulsory thrift": "success",
  "Recurring deposit": "warning",
  "Fixed deposit": "info",
};

type TypeFilter = "all" | DepositAccountType;
type SortKey = "balance" | "member";

/** All deposit accounts with search, type filter, sort, CSV export and paging. */
export function DepositsView({ accounts, today }: { accounts: DepositRow[]; today: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortKey>("balance");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accounts
      .filter(
        (a) =>
          (type === "all" || a.type === type) &&
          (!q || a.accountNo.toLowerCase().includes(q) || a.memberId.toLowerCase().includes(q) || a.memberName.toLowerCase().includes(q)),
      )
      .sort((a, b) => (sort === "balance" ? b.balance - a.balance : a.memberName.localeCompare(b.memberName)));
  }, [accounts, query, type, sort]);

  const pager = usePagination(filtered);
  const filteredTotal = filtered.reduce((s, a) => s + a.balance, 0);

  return (
    <section aria-label="Deposit accounts" className="min-w-0 overflow-hidden rounded-card border border-neutral-border bg-neutral-surface shadow-card">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <TextField
          size="md"
          type="search"
          aria-label="Search deposit accounts"
          placeholder="Account no., member name or ID"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            pager.reset();
          }}
          leadingIcon={<Search {...smIcon} />}
          containerClassName="w-full sm:w-80"
        />
        <FilterSelect
          label="Type"
          value={type}
          onChange={(v) => {
            setType(v);
            pager.reset();
          }}
          options={[
            { value: "all", label: "All" },
            ...(Object.keys(typeTone) as DepositAccountType[]).map((t) => ({ value: t, label: t })),
          ]}
        />
        <FilterSelect
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "balance", label: "Highest balance" },
            { value: "member", label: "Member name" },
          ]}
        />
        <div className="flex-1" />
        <p className="text-sm leading-5 text-text-secondary">
          Total <span className="font-semibold text-text-primary tabular-nums">{formatINR(filteredTotal)}</span>
        </p>
        <Button
          variant="secondary"
          size="md"
          leadingIcon={<Download {...smIcon} />}
          disabled={!filtered.length}
          onClick={() =>
            downloadCsv(
              `deposits-${today}.csv`,
              ["Account no.", "Type", "Member ID", "Member", "Balance", "Terms", "Note"],
              filtered.map((a) => [a.accountNo, a.type, a.memberId, a.memberName, a.balance, a.detail, a.note]),
            )
          }
        >
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm leading-5">
          <thead>
            <tr className={tableHeadRow}>
              <th scope="col" className="py-2.5 pr-2 pl-5 font-semibold">Account</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Member</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Terms</th>
              <th scope="col" className="px-2 py-2.5 font-semibold">Note</th>
              <th scope="col" className="px-2 py-2.5 text-right font-semibold">Balance</th>
              <th scope="col" className="py-2.5 pr-5 pl-2">
                <span className="sr-only">Passbook</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-border">
            {pager.rows.map((a) => (
              <tr key={a.accountNo} className="hover:bg-neutral-subtle">
                <td className="py-3 pr-2 pl-5">
                  <p className="font-semibold text-text-primary tabular-nums">{a.accountNo}</p>
                  <Badge tone={typeTone[a.type]} className="mt-1">
                    {a.type}
                  </Badge>
                </td>
                <td className="px-2 py-3">
                  <Link href={`/members/${a.memberId}`} className="group flex items-center gap-2.5 outline-none">
                    <Avatar name={a.memberName} toneKey={a.memberId} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-text-primary group-hover:text-brand-700 group-focus-visible:text-brand-700">
                        {a.memberName}
                      </span>
                      <span className="block text-xs leading-4 text-text-muted">
                        {a.memberId}
                        {a.memberStatus === "Dormant" && " · Dormant"}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-2 py-3 text-text-secondary">{a.detail}</td>
                <td className="px-2 py-3 text-text-secondary">{a.note}</td>
                <td className="px-2 py-3 text-right font-semibold text-text-primary tabular-nums">{formatINR(a.balance)}</td>
                <td className="py-3 pr-5 pl-2 text-right">
                  <Link
                    href={`/members/${a.memberId}/passbook`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs leading-4 font-semibold text-brand-600 outline-none hover:bg-brand-50 focus-visible:shadow-focus"
                  >
                    <BookOpen size={14} strokeWidth={1.6} aria-hidden />
                    Passbook
                  </Link>
                </td>
              </tr>
            ))}
            {pager.rows.length === 0 && (
              <EmptyRow colSpan={6} title="No accounts match these filters" hint="Try a different account number or member, or clear the filters." />
            )}
          </tbody>
        </table>
      </div>

      <Pagination pager={pager} noun="accounts" />
    </section>
  );
}
