"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/cn";

export type TabItem = { href: string; label: string; count?: number };

function TabLinks({ items, activeHref }: { items: TabItem[]; activeHref?: string }) {
  return (
    <>
      {items.map((t) => {
        const active = t.href === activeHref;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-0.5 py-3.5 text-sm leading-5 transition-colors outline-none focus-visible:text-brand-700",
              active
                ? "border-brand-600 font-semibold text-brand-700"
                : "border-transparent font-medium text-text-secondary hover:border-neutral-border-strong hover:text-text-primary",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs leading-[18px] font-semibold tabular-nums",
                  active ? "bg-brand-100 text-brand-700" : "bg-neutral-bg text-text-secondary",
                )}
              >
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function ActiveTabLinks({ items }: { items: TabItem[] }) {
  return <TabLinks items={items} activeHref={usePathname()} />;
}

/**
 * Figma "Tab" — underlined route tabs. The active tab is the one whose href equals the current
 * path. Suspense: usePathname() can suspend under Cache Components (see NavItem).
 */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-7 overflow-x-auto border-b border-neutral-border">
      <Suspense fallback={<TabLinks items={items} />}>
        <ActiveTabLinks items={items} />
      </Suspense>
    </nav>
  );
}
