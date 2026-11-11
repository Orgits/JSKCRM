import { Bell, Search } from "lucide-react";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { currentStaff } from "@/lib/mock/staff";
import { MobileNav } from "./MobileNav";
import { PageTitle } from "./PageTitle";
import { SidebarContent } from "./Sidebar";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** 72px white bar: page title, search, notifications, signed-in staff. */
export function TopBar() {
  const staff = currentStaff;

  return (
    <header className="sticky top-0 z-10 flex h-18 shrink-0 items-center gap-4 border-b border-neutral-border bg-neutral-surface px-4 sm:px-6 lg:px-8">
      <MobileNav>
        <SidebarContent />
      </MobileNav>

      <div className="min-w-0 flex-1">
        <PageTitle />
      </div>

      <TextField
        type="search"
        aria-label="Search"
        placeholder="Search members, loans, receipts…"
        leadingIcon={<Search {...iconProps} />}
        containerClassName="hidden w-80 md:flex"
      />

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex size-10 shrink-0 items-center justify-center rounded-control border border-neutral-border text-text-secondary outline-none hover:bg-neutral-subtle focus-visible:shadow-focus"
      >
        <Bell {...iconProps} />
        <span
          aria-hidden
          className="absolute top-2 right-2.5 size-2 rounded-full bg-accent-500 ring-2 ring-neutral-surface"
        />
      </button>

      <div className="flex shrink-0 items-center gap-3 border-l border-neutral-border pl-4">
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
        >
          {initials(staff.name)}
        </span>
        <span className="hidden flex-col sm:flex">
          <span className="text-sm leading-5 font-semibold text-text-primary">{staff.name}</span>
          <span className="text-xs leading-4 font-medium text-text-secondary">
            {staff.role} · {staff.branch}
          </span>
        </span>
      </div>
    </header>
  );
}
