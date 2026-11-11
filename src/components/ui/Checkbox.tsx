import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  error?: boolean;
};

/** Figma "Checkbox" — 18px box, brand fill + white check when checked. */
export function Checkbox({
  label,
  description,
  error,
  id,
  className,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group flex cursor-pointer items-start gap-2.5 has-[:disabled]:cursor-default has-[:disabled]:opacity-60",
        className,
      )}
    >
      <span className="relative mt-px flex size-[18px] shrink-0">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          className={cn(
            "peer size-[18px] cursor-pointer appearance-none rounded-[5px] border bg-neutral-surface transition-colors outline-none",
            "checked:border-brand-600 checked:bg-brand-600 focus-visible:shadow-focus disabled:cursor-default",
            error ? "border-danger-600" : "border-neutral-border-strong hover:border-brand-500",
          )}
          {...props}
        />
        <Check
          size={14}
          strokeWidth={2.5}
          aria-hidden
          className="pointer-events-none absolute inset-0 m-auto text-text-inverse opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-5 text-text-primary">{label}</span>
        {description && (
          <span className="text-[13px] leading-[18px] text-text-secondary">{description}</span>
        )}
      </span>
    </label>
  );
}
