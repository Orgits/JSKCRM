import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

const toneClasses: Record<BadgeTone, { badge: string; dot: string }> = {
  success: { badge: "bg-success-50 text-success-600", dot: "bg-success-600" },
  warning: { badge: "bg-warning-50 text-warning-600", dot: "bg-warning-600" },
  danger: { badge: "bg-danger-50 text-danger-600", dot: "bg-danger-600" },
  info: { badge: "bg-info-50 text-info-600", dot: "bg-info-600" },
  neutral: { badge: "bg-neutral-bg text-text-secondary", dot: "bg-text-muted" },
  brand: { badge: "bg-brand-50 text-brand-600", dot: "bg-brand-600" },
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Leading status dot. */
  dot?: boolean;
  icon?: ReactNode;
};

/** Figma "Badge" — Tone: Success | Warning | Danger | Info | Neutral | Brand. Caption 12/16 SemiBold. */
export function Badge({ tone = "neutral", dot, icon, className, children, ...props }: BadgeProps) {
  const t = toneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-4 font-semibold whitespace-nowrap",
        t.badge,
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", t.dot)} />}
      {icon}
      {children}
    </span>
  );
}
