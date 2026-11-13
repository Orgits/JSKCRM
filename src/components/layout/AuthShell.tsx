import type { ReactNode } from "react";
import { BrandPanel, type Audience } from "./BrandPanel";
import { society } from "@/lib/society";

/** Split login screen: BrandPanel on the left, a centred form card on the right. */
export function AuthShell({
  audience,
  title,
  description,
  children,
  footer,
}: {
  audience: Audience;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Below the card, e.g. "Are you a member? Member login". */
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-neutral-bg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <BrandPanel audience={audience} />

      <main className="flex flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
        {/* Compact brand for small screens, where the panel is hidden */}
        <div className="flex items-center gap-3 lg:hidden">
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-control bg-accent-500 font-serif text-sm font-bold text-text-inverse"
          >
            {society.monogram}
          </span>
          <span className="font-serif text-lg leading-6 font-semibold text-text-primary">
            {society.displayName}
          </span>
        </div>

        <div className="w-full max-w-[440px] rounded-panel border border-neutral-border bg-neutral-surface p-6 shadow-elevated sm:p-8">
          <div className="mb-6 flex flex-col gap-1.5">
            <h1 className="font-serif text-[28px] leading-9 font-bold text-text-primary">{title}</h1>
            {description && (
              <p className="text-sm leading-5 text-text-secondary">{description}</p>
            )}
          </div>
          {children}
        </div>

        {footer && <div className="text-sm leading-5 text-text-secondary">{footer}</div>}
      </main>
    </div>
  );
}
