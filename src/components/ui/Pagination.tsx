"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatCount } from "@/lib/format";
import { Select } from "./Select";

const xsIcon = { size: 16, strokeWidth: 1.6, "aria-hidden": true } as const;
const PAGE_SIZES = [10, 25, 50];

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
const outlined = "border border-neutral-border text-text-secondary hover:bg-neutral-subtle";

/** Client-side paging state. Call `reset()` whenever filters change. */
export function usePagination<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  return {
    rows: items.slice(start, start + pageSize),
    page: current,
    pageCount,
    pageSize,
    start,
    total: items.length,
    setPage,
    setPageSize: (n: number) => {
      setPageSize(n);
      setPage(1);
    },
    reset: () => setPage(1),
  };
}

/** Table footer: "Showing 1–10 of 248 loans", rows-per-page and page buttons (Members list pattern). */
export function Pagination({
  pager,
  noun,
}: {
  pager: ReturnType<typeof usePagination<unknown>>;
  /** Plural noun for the summary, e.g. "loans". */
  noun: string;
}) {
  const { page, pageCount, pageSize, start, total, rows, setPage, setPageSize } = pager;
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-neutral-border px-5 py-3.5">
      <p className="flex-1 text-sm leading-5 whitespace-nowrap text-text-secondary">
        {total === 0
          ? `No ${noun}`
          : `Showing ${formatCount(start + 1)}–${formatCount(start + rows.length)} of ${formatCount(total)} ${noun}`}
      </p>
      <label className="flex items-center gap-3">
        <span className="text-xs leading-4 font-medium text-text-muted">Rows per page</span>
        <Select
          size="md"
          value={String(pageSize)}
          onChange={(e) => setPageSize(Number(e.target.value))}
          options={PAGE_SIZES.map((n) => ({ value: String(n), label: String(n) }))}
          containerClassName="shrink-0"
          className="font-medium"
        />
      </label>
      <nav aria-label="Pagination" className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={cn(pageButton, outlined, "disabled:opacity-40 disabled:hover:bg-transparent")}
        >
          <ArrowLeft {...xsIcon} />
        </button>
        {pageItems(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} aria-hidden className={cn(pageButton, "border border-neutral-border text-text-secondary")}>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => setPage(p)}
              className={cn(pageButton, p === page ? "bg-brand-600 text-text-inverse" : outlined)}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page === pageCount}
          onClick={() => setPage(page + 1)}
          className={cn(pageButton, outlined, "disabled:opacity-40 disabled:hover:bg-transparent")}
        >
          <ArrowRight {...xsIcon} />
        </button>
      </nav>
    </div>
  );
}

/** Uppercase table header row styling shared by list tables. */
export const tableHeadRow =
  "border-y border-neutral-border bg-neutral-subtle text-[11px] leading-[14px] font-semibold tracking-[0.06em] text-text-muted uppercase";

/** Empty-state row for a filtered table. */
export function EmptyRow({ colSpan, title, hint }: { colSpan: number; title: string; hint: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center">
        <p className="text-sm leading-5 font-semibold text-text-primary">{title}</p>
        <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">{hint}</p>
      </td>
    </tr>
  );
}
