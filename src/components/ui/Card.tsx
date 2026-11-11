import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** White surface card — rounded-card, card shadow, neutral border. */
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "rounded-card border border-neutral-border bg-neutral-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}

/** Card title row (Heading/H4 16/24) with optional description and right-side action. */
export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6", className)}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base leading-6 font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-[13px] leading-[18px] text-text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
