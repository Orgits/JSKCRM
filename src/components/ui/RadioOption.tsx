import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type RadioOptionProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
  /** Optional icon shown before the text, e.g. `<User {...iconProps} />`. */
  icon?: ReactNode;
};

/**
 * Figma "Radio Option" — a bordered, selectable tile with a radio dot.
 * Selected: brand border + brand-50 fill. Group several with the same `name`.
 */
export function RadioOption({
  label,
  description,
  icon,
  id,
  className,
  ...props
}: RadioOptionProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-control border border-neutral-border bg-neutral-surface p-3.5 transition-colors",
        "hover:border-neutral-border-strong",
        "has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50",
        "has-[:focus-visible]:shadow-focus",
        "has-[:disabled]:cursor-default has-[:disabled]:opacity-60",
        className,
      )}
    >
      <input
        id={inputId}
        type="radio"
        className={cn(
          "mt-0.5 size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-neutral-border-strong bg-neutral-surface outline-none transition-[border]",
          "checked:border-[5px] checked:border-brand-600 disabled:cursor-default",
        )}
        {...props}
      />
      {icon && <span className="flex shrink-0 text-brand-600">{icon}</span>}
      <span className="flex flex-col gap-0.5">
        <span className="text-sm leading-5 font-semibold text-text-primary">{label}</span>
        {description && (
          <span className="text-[13px] leading-[18px] text-text-secondary">{description}</span>
        )}
      </span>
    </label>
  );
}
