import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Label/Field — 13/18 SemiBold. Required labels end with a red asterisk. */
export function FieldLabel({
  htmlFor,
  required,
  children,
  className,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-[13px] leading-[18px] font-semibold text-text-primary", className)}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-danger-600">
          *
        </span>
      )}
    </label>
  );
}

/** Helper / error line under a control — Body/Small 13/18. */
export function FieldMessage({
  id,
  error,
  children,
}: {
  id?: string;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      role={error ? "alert" : undefined}
      className={cn(
        "text-[13px] leading-[18px]",
        error ? "text-danger-600" : "text-text-secondary",
      )}
    >
      {children}
    </p>
  );
}

/**
 * Shared shell styles for text-like controls (TextField, Select).
 * Default → neutral border; Focused → brand border + focus ring;
 * Error → danger border; Read-only → subtle fill, secondary text.
 */
export function controlShell({ error, readOnly }: { error?: boolean; readOnly?: boolean }) {
  return cn(
    "flex h-11 w-full items-center gap-2 rounded-control border px-3.5 transition-[border-color,box-shadow]",
    readOnly
      ? "border-neutral-border bg-neutral-subtle"
      : "bg-neutral-surface focus-within:shadow-focus",
    !readOnly &&
      (error
        ? "border-danger-600 focus-within:border-danger-600"
        : "border-neutral-border-strong hover:border-text-muted focus-within:border-brand-600 hover:focus-within:border-brand-600"),
  );
}
