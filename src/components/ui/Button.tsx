import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "accent";
export type ButtonSize = "lg" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-text-inverse hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "border border-neutral-border-strong bg-neutral-surface text-text-primary hover:bg-neutral-subtle active:bg-neutral-bg",
  ghost: "text-brand-600 hover:bg-brand-50 active:bg-brand-100",
  accent: "bg-accent-500 text-text-inverse hover:bg-accent-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  // Large 48px — Button 15/20 SemiBold
  lg: "h-12 px-6 gap-2 text-[15px] leading-5",
  // Medium 40px — Button 14/20 SemiBold
  md: "h-10 px-4 gap-2 text-sm leading-5",
};

export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

/**
 * Button classes, exported so a `next/link` can look like a button:
 * `<Link href="/members/new" className={buttonClasses({ variant: "accent" })}>`
 */
export function buttonClasses({
  variant = "primary",
  size = "lg",
  fullWidth,
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-control font-semibold whitespace-nowrap transition-colors",
    "outline-none focus-visible:shadow-focus",
    "disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<ButtonStyleOptions, "className"> & {
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    /** Shows a spinner in place of the leading icon and disables the button. */
    loading?: boolean;
  };

/** Figma "Button" — Type: Primary | Secondary | Ghost | Accent; Size: Large | Medium. */
export function Button({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  type = "button",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? <LoaderCircle size={18} strokeWidth={2} aria-hidden className="animate-spin" /> : leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
