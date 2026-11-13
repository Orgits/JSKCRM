import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

export type AvatarTone = "brand" | "accent" | "success" | "info" | "warning" | "danger";

const toneClasses: Record<AvatarTone, string> = {
  brand: "bg-brand-50 text-brand-600",
  accent: "bg-accent-50 text-accent-600",
  success: "bg-success-50 text-success-600",
  info: "bg-info-50 text-info-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
};

const tones = Object.keys(toneClasses) as AvatarTone[];

/** Stable tone per person, so the same member always gets the same colour. */
export function toneFor(key: string): AvatarTone {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length];
}

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-10 text-xs",
  xl: "size-16 text-xl",
} as const;

/** Initials avatar — Caption 12/16 SemiBold on a tinted circle. */
export function Avatar({
  name,
  toneKey,
  size = "md",
  className,
}: {
  name: string;
  /** What decides the colour; defaults to the name. Pass the member ID for stability. */
  toneKey?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full leading-4 font-semibold",
        sizeClasses[size],
        toneClasses[toneFor(toneKey ?? name)],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
