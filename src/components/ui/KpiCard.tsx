import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

export type KpiTone = "brand" | "accent" | "success" | "warning" | "danger" | "info";

const iconToneClasses: Record<KpiTone, string> = {
  brand: "bg-brand-50 text-brand-600",
  accent: "bg-accent-50 text-accent-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-info-50 text-info-600",
};

export type KpiCardProps = {
  label: ReactNode;
  /** Pre-formatted value, e.g. "₹2.86 Cr" or "1,248". */
  value: ReactNode;
  /** Lucide icon element, e.g. `<Users {...iconProps} />`. */
  icon?: ReactNode;
  iconTone?: KpiTone;
  /** Change vs previous period, e.g. { value: "+4.2%", direction: "up" }. */
  delta?: { value: ReactNode; direction: "up" | "down"; positive?: boolean };
  /** Context next to the delta, e.g. "vs last month". */
  caption?: ReactNode;
  className?: string;
};

/** Figma "KPI Card" — white card, label + KPI/Value 28/34 Bold, optional icon and trend. */
export function KpiCard({
  label,
  value,
  icon,
  iconTone = "brand",
  delta,
  caption,
  className,
}: KpiCardProps) {
  // A rise is good by default (e.g. deposits); pass positive={false} for e.g. overdue loans.
  const good = delta ? (delta.positive ?? delta.direction === "up") : false;
  const TrendIcon = delta?.direction === "down" ? TrendingDown : TrendingUp;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-card border border-neutral-border bg-neutral-surface p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] leading-[18px] font-medium text-text-secondary">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-control",
              iconToneClasses[iconTone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="text-[28px] leading-[34px] font-bold tracking-tight text-text-primary tabular-nums">
        {value}
      </p>
      {(delta || caption) && (
        <div className="flex items-center gap-1.5 text-xs leading-4">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold",
                good ? "text-success-600" : "text-danger-600",
              )}
            >
              <TrendIcon size={14} strokeWidth={2} aria-hidden />
              {delta.value}
            </span>
          )}
          {caption && <span className="font-medium text-text-muted">{caption}</span>}
        </div>
      )}
    </div>
  );
}
