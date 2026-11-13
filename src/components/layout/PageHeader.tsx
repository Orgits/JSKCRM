import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Page heading row used at the top of staff pages: H1 28/36 Bold + description + actions. */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Optional "← All loans" style link above the title. */
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3 print:hidden">
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 rounded text-sm leading-5 font-medium text-text-secondary outline-none hover:text-text-primary focus-visible:text-brand-700"
        >
          <ArrowLeft size={16} strokeWidth={1.6} aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-64 flex-1 flex-col gap-1">
          <h2 className="text-[28px] leading-9 font-bold tracking-[-0.01em] text-text-primary">{title}</h2>
          {description && <p className="text-sm leading-5 text-text-secondary">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
