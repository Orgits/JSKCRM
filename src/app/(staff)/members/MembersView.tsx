"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Ellipsis,
  Funnel,
  Search,
  Smartphone,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/csv";
import { formatCount, formatDate, formatINR, formatMobile, formatMonthYear, initials } from "@/lib/format";
import {
  kycTone,
  memberStatusTone,
  type KycStatus,
  type Member,
  type MembershipType,
} from "@/lib/mock/members";

const smIcon = { size: 18, strokeWidth: 1.6, "aria-hidden": true } as const;
const xsIcon = { size: 16, strokeWidth: 1.6, "aria-hidden": true } as const;

// ─── Filters ────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "pending" | "inactive";
type JoinedFilter = "any" | "30d" | "12m" | "older";
type LoanFilter = "any" | "active" | "overdue" | "none";

type Filters = {
  query: string;
  status: StatusFilter;
  kyc: "all" | KycStatus;
  membership: "all" | MembershipType;
  joined: JoinedFilter;
  loans: LoanFilter;
};

const defaultFilters: Filters = {
  query: "",
  status: "all",
  kyc: "all",
  membership: "all",
  joined: "any",
  loans: "any",
};

const statusMatches: Record<StatusFilter, (m: Member) => boolean> = {
  all: () => true,
  active: (m) => m.status === "Active",
  pending: (m) => m.status === "Pending approval",
  inactive: (m) => m.status === "Dormant",
};

const loanMatches: Record<LoanFilter, (m: Member) => boolean> = {
  any: () => true,
  active: (m) => m.loans.active > 0,
  overdue: (m) => m.loans.overdueEmis > 0,
  none: (m) => m.loans.active === 0,
};

const DAY = 86_400_000;

/** Whole days between two ISO dates (both treated as UTC midnight). */
function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / DAY);
}

function joinedMatches(filter: JoinedFilter, joinedOn: string, today: string) {
  const age = daysBetween(joinedOn, today);
  if (filter === "30d") return age <= 30;
  if (filter === "12m") return age <= 365;
  if (filter === "older") return age > 365;
  return true;
}

function searchMatches(m: Member, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)) return true;
  const digits = q.replace(/\D/g, "");
  return digits.length >= 3 && `91${m.mobile}`.includes(digits);
}

// ─── Small pieces ───────────────────────────────────────────────────────────

const avatarTones = [
  "bg-brand-50 text-brand-600",
  "bg-accent-50 text-accent-600",
  "bg-info-50 text-info-600",
  "bg-success-50 text-success-600",
  "bg-warning-50 text-warning-600",
  "bg-danger-50 text-danger-600",
];

function avatarTone(id: string) {
  const n = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return avatarTones[n % avatarTones.length];
}

/** 18px table checkbox — same look as the Figma Checkbox, plus the "some selected" dash. */
function RowCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <span className="relative flex size-[18px] shrink-0">
      <input
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
        type="checkbox"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "peer size-[18px] cursor-pointer appearance-none rounded-[5px] border-[1.5px] border-neutral-border-strong bg-neutral-surface transition-colors outline-none",
          "hover:border-brand-500 focus-visible:shadow-focus",
          "checked:border-brand-600 checked:bg-brand-600 indeterminate:border-brand-600 indeterminate:bg-brand-600",
        )}
      />
      <Check
        size={12}
        strokeWidth={2.5}
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto text-text-inverse opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto h-0.5 w-2 rounded-[1px] bg-text-inverse opacity-0 peer-indeterminate:opacity-100"
      />
    </span>
  );
}

function SummaryCard({
  label,
  value,
  caption,
  dot,
  selected,
  onSelect,
}: {
  label: string;
  value: number;
  caption: string;
  dot: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-1 rounded-[14px] px-[18px] py-4 text-left transition-colors outline-none focus-visible:shadow-focus",
        selected
          ? "border-[1.5px] border-brand-600 bg-brand-50"
          : "border border-neutral-border bg-neutral-surface hover:border-neutral-border-strong",
      )}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden className={cn("size-2 rounded-full", dot)} />
        <span
          className={cn(
            "text-sm leading-5 font-medium",
            selected ? "text-brand-700" : "text-text-secondary",
          )}
        >
          {label}
        </span>
      </span>
      <span className="text-[22px] leading-[30px] font-bold tracking-[-0.005em] text-text-primary tabular-nums">
        {formatCount(value)}
      </span>
      <span className="text-xs leading-4 font-medium text-text-muted">{caption}</span>
    </button>
  );
}

/** Toolbar dropdown: "Status: All ▾" — a native select with a muted inline label. */
function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Select
      size="md"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      options={options}
      leadingIcon={<span className="text-sm leading-5 font-medium">{label}:</span>}
      containerClassName="shrink-0"
      // Size to the chosen option ("All"), not the longest one; browsers without
      // field-sizing fall back to the native width.
      className="field-sizing-content font-medium"
    />
  );
}

function BulkButton({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-neutral-surface px-2.5 py-1.5 text-xs leading-4 font-semibold text-brand-700 outline-none hover:bg-brand-50 focus-visible:shadow-focus"
    >
      {icon}
      {children}
    </button>
  );
}

/** 1 2 3 … 125 — first, last, and the pages around the current one. */
function pageItems(current: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 2) pages.add(3);
  if (current >= total - 1) pages.add(total - 2);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) items.push(prev + 1);
    else if (prev !== undefined && p - prev > 2) items.push("gap");
    items.push(p);
  });
  return items;
}

const pageButton =
  "flex size-[34px] items-center justify-center rounded-lg text-sm leading-5 font-medium outline-none focus-visible:shadow-focus";

function exportMembers(rows: Member[], filename: string) {
  downloadCsv(
    filename,
    ["Member ID", "Name", "Mobile", "Joined on", "Membership", "KYC", "Status", "Active loans", "Loan outstanding (INR)", "Overdue EMIs", "Deposits (INR)"],
    rows.map((m) => [
      m.id,
      m.name,
      formatMobile(m.mobile),
      formatDate(m.joinedOn),
      m.membership,
      m.kyc,
      m.status,
      m.loans.active,
      m.loans.outstanding,
      m.loans.overdueEmis,
      m.deposits,
    ]),
  );
}

// ─── Row ────────────────────────────────────────────────────────────────────

function MemberRow({
  member: m,
  today,
  selected,
  onSelect,
}: {
  member: Member;
  today: string;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}) {
  const age = daysBetween(m.joinedOn, today);
  const joined =
    age <= 0 ? "registered today" : age < 7 ? `registered ${age} day${age === 1 ? "" : "s"} ago` : `since ${formatMonthYear(m.joinedOn)}`;

  return (
    <tr className={cn("align-middle", selected ? "bg-brand-50/70" : "hover:bg-neutral-subtle")}>
      <td className="py-3 pr-2 pl-5">
        <RowCheckbox checked={selected} onChange={onSelect} label={`Select ${m.name}`} />
      </td>
      <td className="px-2 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-xs leading-4 font-semibold",
              avatarTone(m.id),
            )}
          >
            {initials(m.name)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/members/${m.id}`}
                className="truncate text-sm leading-5 font-semibold text-brand-700 outline-none hover:underline focus-visible:underline"
              >
                {m.name}
              </Link>
              {age < 7 && (
                <Badge tone="brand" dot>
                  New
                </Badge>
              )}
            </div>
            <p className="truncate text-xs leading-4 font-medium text-text-muted">
              {m.id} · {joined}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-sm leading-5 whitespace-nowrap text-text-secondary">
        {formatMobile(m.mobile)}
      </td>
      <td className="px-2 py-3">
        <Badge tone={kycTone[m.kyc]} dot>
          {m.kyc}
        </Badge>
      </td>
      <td className="px-2 py-3 font-medium whitespace-nowrap">
        {m.loans.active > 0 ? (
          <>
            <p className="text-sm leading-5 text-text-primary">{m.loans.active} active</p>
            {m.loans.overdueEmis > 0 ? (
              <p className="mt-0.5 text-xs leading-4 text-danger-600">
                {m.loans.overdueEmis} EMI{m.loans.overdueEmis > 1 ? "s" : ""} overdue ·{" "}
                {formatINR(m.loans.outstanding)}
              </p>
            ) : (
              <p className="mt-0.5 text-xs leading-4 text-text-muted">
                {formatINR(m.loans.outstanding)} outstanding
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm leading-5 text-text-muted">No active loans</p>
            {m.loans.closed > 0 && (
              <p className="mt-0.5 text-xs leading-4 text-text-muted">{m.loans.closed} closed</p>
            )}
          </>
        )}
      </td>
      <td className="px-2 py-3 text-right text-sm leading-5 font-semibold text-text-primary tabular-nums">
        {formatINR(m.deposits)}
      </td>
      <td className="px-2 py-3">
        <Badge tone={memberStatusTone[m.status]} dot>
          {m.status}
        </Badge>
      </td>
      <td className="py-3 pr-5 pl-2">
        {/* TODO: row menu (record deposit, new loan…) once those modules exist. Profile: click the name. */}
        <button
          type="button"
          aria-label={`More actions for ${m.name}`}
          className="flex size-6 items-center justify-center rounded-md text-text-muted outline-none hover:bg-neutral-bg hover:text-text-secondary focus-visible:shadow-focus"
        >
          <Ellipsis size={20} strokeWidth={1.6} aria-hidden />
        </button>
      </td>
    </tr>
  );
}

// ─── View ───────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 25, 50];

/** Members — List (Figma 23-944): summary tabs, filter toolbar, selectable table, pagination. */
export function MembersView({ members, today }: { members: Member[]; today: string }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [moreFilters, setMoreFilters] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  const summary = useMemo(() => {
    const month = today.slice(0, 7);
    const count = (f: StatusFilter) => members.filter(statusMatches[f]).length;
    const all = members.length;
    const active = count("active");
    return {
      all,
      active,
      pending: count("pending"),
      inactive: count("inactive"),
      joinedThisMonth: members.filter((m) => m.joinedOn.startsWith(month)).length,
      activePct: all ? Math.round((active / all) * 100) : 0,
    };
  }, [members, today]);

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          statusMatches[filters.status](m) &&
          (filters.kyc === "all" || m.kyc === filters.kyc) &&
          (filters.membership === "all" || m.membership === filters.membership) &&
          joinedMatches(filters.joined, m.joinedOn, today) &&
          loanMatches[filters.loans](m) &&
          searchMatches(m, filters.query),
      ),
    [members, filters, today],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const pageSelected = rows.filter((m) => selected.has(m.id)).length;
  const allFilteredSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const filtersActive =
    filters.status !== "all" ||
    filters.kyc !== "all" ||
    filters.membership !== "all" ||
    filters.joined !== "any" ||
    filters.loans !== "any" ||
    filters.query.trim() !== "";

  function toggle(ids: string[], on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });
  }

  const statusCards: { key: StatusFilter; label: string; value: number; caption: string; dot: string }[] = [
    { key: "all", label: "All members", value: summary.all, caption: `+${formatCount(summary.joinedThisMonth)} joined this month`, dot: "bg-brand-600" },
    { key: "active", label: "Active", value: summary.active, caption: `${summary.activePct}% of all members`, dot: "bg-success-600" },
    { key: "pending", label: "Pending KYC / approval", value: summary.pending, caption: "Needs staff action", dot: "bg-warning-600" },
    { key: "inactive", label: "Inactive / dormant", value: summary.inactive, caption: "No activity in 12+ months", dot: "bg-text-muted" },
  ];

  return (
    <>
      {/* Page header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-64 flex-1 flex-col gap-1">
          <h2 className="text-[28px] leading-9 font-bold tracking-[-0.01em] text-text-primary">Members</h2>
          <p className="text-sm leading-5 text-text-secondary">
            Manage member profiles, KYC, accounts and membership records
          </p>
        </div>
        {/* TODO: bulk import (CSV upload) once the members API exists. */}
        <Button variant="secondary" size="md" leadingIcon={<Upload {...smIcon} />}>
          Import
        </Button>
        <Button
          variant="secondary"
          size="md"
          leadingIcon={<Download {...smIcon} />}
          onClick={() => exportMembers(filtered, `members-${today}.csv`)}
          disabled={filtered.length === 0}
        >
          Export
        </Button>
        <Link href="/members/new" className={buttonClasses({ variant: "primary", size: "md" })}>
          <UserPlus {...smIcon} />
          Register New Member
        </Link>
      </div>

      {/* Status summary — doubles as the status filter */}
      <section aria-label="Members by status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((c) => (
          <SummaryCard
            key={c.key}
            label={c.label}
            value={c.value}
            caption={c.caption}
            dot={c.dot}
            selected={filters.status === c.key}
            onSelect={() => setFilter("status", c.key)}
          />
        ))}
      </section>

      {/* Members table */}
      <section
        aria-label="Members"
        className="min-w-0 overflow-hidden rounded-card border border-neutral-border bg-neutral-surface shadow-card"
      >
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          <TextField
            size="md"
            type="search"
            aria-label="Search members"
            placeholder="Name, member ID or mobile"
            value={filters.query}
            onChange={(e) => setFilter("query", e.target.value)}
            leadingIcon={<Search {...smIcon} />}
            containerClassName="w-full sm:w-80"
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(v) => setFilter("status", v)}
            options={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending approval" },
              { value: "inactive", label: "Dormant" },
            ]}
          />
          <FilterSelect
            label="KYC"
            value={filters.kyc}
            onChange={(v) => setFilter("kyc", v)}
            options={[
              { value: "all", label: "All" },
              { value: "Verified", label: "Verified" },
              { value: "Pending", label: "Pending" },
              { value: "Re-KYC due", label: "Re-KYC due" },
            ]}
          />
          <FilterSelect
            label="Membership"
            value={filters.membership}
            onChange={(v) => setFilter("membership", v)}
            options={[
              { value: "all", label: "All" },
              { value: "Ordinary", label: "Ordinary" },
              { value: "Nominal", label: "Nominal" },
            ]}
          />
          <FilterSelect
            label="Joined"
            value={filters.joined}
            onChange={(v) => setFilter("joined", v)}
            options={[
              { value: "any", label: "Any time" },
              { value: "30d", label: "Last 30 days" },
              { value: "12m", label: "Last 12 months" },
              { value: "older", label: "Over a year ago" },
            ]}
          />
          {moreFilters && (
            <FilterSelect
              label="Loans"
              value={filters.loans}
              onChange={(v) => setFilter("loans", v)}
              options={[
                { value: "any", label: "Any" },
                { value: "active", label: "Has active loan" },
                { value: "overdue", label: "EMI overdue" },
                { value: "none", label: "No active loans" },
              ]}
            />
          )}
          <button
            type="button"
            aria-expanded={moreFilters}
            onClick={() => {
              if (moreFilters) setFilter("loans", "any");
              setMoreFilters(!moreFilters);
            }}
            className={buttonClasses({ variant: "ghost", size: "md", className: "gap-1.5 px-3" })}
          >
            <Funnel {...xsIcon} />
            {moreFilters ? "Fewer filters" : "More filters"}
          </button>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setFilters(defaultFilters);
                setPage(1);
              }}
              className="text-sm leading-5 font-medium text-text-secondary underline-offset-2 outline-none hover:text-text-primary hover:underline focus-visible:shadow-focus"
            >
              Clear filters
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 border-t border-brand-100 bg-brand-50 px-5 py-2.5">
            <RowCheckbox
              checked={false}
              indeterminate
              onChange={() => setSelected(new Set())}
              label="Clear selection"
            />
            <p className="text-sm leading-5 font-semibold text-brand-700">
              {formatCount(selected.size)} member{selected.size === 1 ? "" : "s"} selected
            </p>
            {!allFilteredSelected && (
              <>
                <span aria-hidden className="text-sm leading-5 text-text-muted">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => toggle(filtered.map((m) => m.id), true)}
                  className="text-sm leading-5 font-semibold text-brand-600 outline-none hover:underline focus-visible:shadow-focus"
                >
                  Select all {formatCount(filtered.length)}
                </button>
              </>
            )}
            <div className="flex flex-1 flex-wrap justify-end gap-2.5">
              {/* TODO: wire to the SMS gateway. */}
              <BulkButton icon={<Smartphone {...xsIcon} />}>Send SMS</BulkButton>
              <BulkButton
                icon={<Download {...xsIcon} />}
                onClick={() =>
                  exportMembers(
                    members.filter((m) => selected.has(m.id)),
                    `members-selected-${today}.csv`,
                  )
                }
              >
                Export selected
              </BulkButton>
              <BulkButton icon={<X {...xsIcon} />} onClick={() => setSelected(new Set())}>
                Clear
              </BulkButton>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] table-fixed text-left">
            <colgroup>
              <col className="w-[46px]" />
              <col />
              <col className="w-[146px]" />
              <col className="w-[126px]" />
              <col className="w-[166px]" />
              <col className="w-[126px]" />
              <col className="w-[148px]" />
              <col className="w-[52px]" />
            </colgroup>
            <thead>
              <tr className="border-y border-neutral-border bg-neutral-subtle text-[11px] leading-[14px] font-semibold tracking-[0.06em] text-text-muted uppercase">
                <th scope="col" className="py-2.5 pr-2 pl-5">
                  <RowCheckbox
                    checked={rows.length > 0 && pageSelected === rows.length}
                    indeterminate={pageSelected > 0 && pageSelected < rows.length}
                    onChange={(on) => toggle(rows.map((m) => m.id), on)}
                    label="Select all members on this page"
                  />
                </th>
                <th scope="col" className="px-2 py-2.5 font-semibold">Member</th>
                <th scope="col" className="px-2 py-2.5 font-semibold">Mobile</th>
                <th scope="col" className="px-2 py-2.5 font-semibold">KYC</th>
                <th scope="col" className="px-2 py-2.5 font-semibold">Loans</th>
                <th scope="col" className="px-2 py-2.5 text-right font-semibold">Deposits</th>
                <th scope="col" className="px-2 py-2.5 font-semibold">Status</th>
                <th scope="col" className="py-2.5 pr-5 pl-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-border">
              {rows.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  today={today}
                  selected={selected.has(m.id)}
                  onSelect={(on) => toggle([m.id], on)}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <p className="text-sm leading-5 font-semibold text-text-primary">
                      No members match these filters
                    </p>
                    <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">
                      Try a different name, member ID or mobile number, or clear the filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-neutral-border px-5 py-3.5">
          <p className="flex-1 text-sm leading-5 whitespace-nowrap text-text-secondary">
            {filtered.length === 0
              ? "No members"
              : `Showing ${formatCount(start + 1)}–${formatCount(start + rows.length)} of ${formatCount(filtered.length)} members`}
          </p>
          <label className="flex items-center gap-3">
            <span className="text-xs leading-4 font-medium text-text-muted">Rows per page</span>
            <Select
              size="md"
              value={String(pageSize)}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
              containerClassName="shrink-0"
              className="font-medium"
            />
          </label>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className={cn(pageButton, "border border-neutral-border text-text-secondary hover:bg-neutral-subtle disabled:opacity-40 disabled:hover:bg-transparent")}
            >
              <ArrowLeft {...xsIcon} />
            </button>
            {pageItems(currentPage, pageCount).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} aria-hidden className={cn(pageButton, "border border-neutral-border text-text-secondary")}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  aria-label={`Page ${p}`}
                  aria-current={p === currentPage ? "page" : undefined}
                  onClick={() => setPage(p)}
                  className={cn(
                    pageButton,
                    p === currentPage
                      ? "bg-brand-600 text-text-inverse"
                      : "border border-neutral-border text-text-secondary hover:bg-neutral-subtle",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
              className={cn(pageButton, "border border-neutral-border text-text-secondary hover:bg-neutral-subtle disabled:opacity-40 disabled:hover:bg-transparent")}
            >
              <ArrowRight {...xsIcon} />
            </button>
          </nav>
        </div>
      </section>
    </>
  );
}
