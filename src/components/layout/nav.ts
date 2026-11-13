import {
  ArrowLeftRight,
  ChartColumn,
  HandCoins,
  LayoutDashboard,
  LifeBuoy,
  PiggyBank,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon; exact?: boolean };

/** Main staff navigation, top to bottom. */
export const mainNav: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: Users },
  { href: "/loans", label: "Loans", icon: HandCoins },
  { href: "/deposits", label: "Deposits", icon: PiggyBank },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: ChartColumn },
];

/** Pinned to the bottom of the sidebar. */
export const footerNav: NavLink[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & support", icon: LifeBuoy },
];

/** TopBar titles for routes that aren't top-level nav items. */
const pageTitles: Record<string, string> = {
  "/members/new": "Register New Member",
  "/loans/new": "New Loan Application",
  "/transactions/new": "Record Payment",
};

/** Title for the TopBar: exact match first, then the nav section the path sits under. */
export function titleForPath(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/^\/members\/JSK-M-\d{4}\/edit$/.test(pathname)) return "Edit member";
  if (/^\/members\/JSK-M-\d{4}(\/|$)/.test(pathname)) return "Member profile";
  const section = [...mainNav, ...footerNav].find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
  );
  return section?.label ?? "";
}
