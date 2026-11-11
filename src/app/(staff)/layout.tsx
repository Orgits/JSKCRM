import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

/** Staff console shell: 264px sidebar + 72px top bar around every page in (staff). */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
