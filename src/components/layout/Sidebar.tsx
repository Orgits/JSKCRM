import Link from "next/link";
import { LogOut } from "lucide-react";
import { NavItem } from "@/components/ui/NavItem";
import { iconProps } from "@/components/ui/icon";
import { footerNav, mainNav, type NavLink } from "./nav";

function NavList({ items, label }: { items: NavLink[]; label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className="px-3 pb-1 text-[11px] leading-[14px] font-bold tracking-[0.08em] text-sidebar-text uppercase opacity-70">
          {label}
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {items.map(({ icon: Icon, ...item }) => (
          <li key={item.href}>
            <NavItem {...item} icon={<Icon {...iconProps} />} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Brand block + navigation. Shared by the desktop sidebar and the mobile drawer. */
export function SidebarContent() {
  return (
    <div className="flex h-full flex-col bg-linear-to-b from-brand-900 to-brand-800">
      <Link
        href="/dashboard"
        className="flex h-18 shrink-0 items-center gap-3 border-b border-sidebar-divider px-5 outline-none focus-visible:shadow-focus"
      >
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-control bg-accent-500 font-serif text-sm font-bold text-text-inverse"
        >
          JSK
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-serif text-base leading-5 font-semibold text-text-inverse">
            Jai Shri Krishna
          </span>
          <span className="truncate text-[11px] leading-[14px] text-sidebar-text">
            Co-op Thrift &amp; Credit Society
          </span>
        </span>
      </Link>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
        <NavList items={mainNav} label="Menu" />
      </nav>

      <div className="flex shrink-0 flex-col gap-1 border-t border-sidebar-divider px-4 py-4">
        <NavList items={footerNav} />
        <Link
          href="/login"
          className="flex h-11 items-center gap-3 rounded-control px-3 text-sm leading-5 font-medium text-sidebar-text transition-colors outline-none hover:bg-sidebar-divider hover:text-text-inverse focus-visible:shadow-focus"
        >
          <LogOut {...iconProps} />
          Log out
        </Link>
      </div>
    </div>
  );
}

/** Desktop sidebar — 264px, sticky, navy gradient. Hidden below lg (see MobileNav). */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-66 shrink-0 lg:block">
      <SidebarContent />
    </aside>
  );
}
