"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type NavItemProps = {
  href: string;
  label: string;
  /** Lucide icon element, e.g. `<LayoutDashboard {...iconProps} />`. */
  icon?: ReactNode;
  /** Small count pill on the right, e.g. pending approvals. */
  count?: number;
  /** Only mark active on an exact path match (default: also active on sub-routes). */
  exact?: boolean;
};

function NavItemLink({ href, label, icon, count, active }: NavItemProps & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-control px-3 text-sm leading-5 transition-colors outline-none",
        "focus-visible:shadow-focus",
        active
          ? "bg-brand-600 font-semibold text-text-inverse"
          : "font-medium text-sidebar-text hover:bg-sidebar-divider hover:text-text-inverse",
      )}
    >
      {icon && <span className="flex shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="min-w-5 rounded-full bg-accent-500 px-1.5 text-center text-[11px] leading-5 font-bold text-text-inverse">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function ActiveNavItem(props: NavItemProps) {
  const pathname = usePathname();
  const { href, exact } = props;
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return <NavItemLink {...props} active={active} />;
}

/**
 * Figma "Nav Item" — sidebar link on the navy gradient; active state from the current path.
 * With Cache Components, usePathname() suspends on routes with unknown dynamic params, so the
 * read sits behind Suspense and the inactive link is the prerendered fallback.
 */
export function NavItem(props: NavItemProps) {
  return (
    <Suspense fallback={<NavItemLink {...props} active={false} />}>
      <ActiveNavItem {...props} />
    </Suspense>
  );
}
