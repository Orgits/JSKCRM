import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { FieldLabel, FieldMessage, controlShell, type ControlSize } from "./Field";
import { iconProps } from "./icon";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  /** "lg" 44px (default) | "md" 40px. */
  size?: ControlSize;
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  /** Shown as an empty, unselectable first option. */
  placeholder?: string;
  /** Alternatively pass `<option>` children. */
  options?: SelectOption[];
  leadingIcon?: ReactNode;
  containerClassName?: string;
};

/** Figma "Input with chevron" — a native select styled like TextField. */
export function Select({
  label,
  helperText,
  error,
  placeholder,
  options,
  leadingIcon,
  size,
  required,
  disabled,
  id,
  className,
  containerClassName,
  children,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-message`;
  const message = error || helperText;

  // Show placeholder styling until a value is chosen (uncontrolled selects default to "").
  const hasPlaceholder = placeholder !== undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <FieldLabel htmlFor={selectId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className={cn(controlShell({ error: !!error, readOnly: disabled, size }), "relative pr-0")}>
        {leadingIcon && <span className="flex shrink-0 text-text-muted">{leadingIcon}</span>}
        <select
          id={selectId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          defaultValue={props.value === undefined && hasPlaceholder ? "" : undefined}
          className={cn(
            "h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-sm leading-5 outline-none",
            size === "md" ? "pr-8" : "pr-10",
            "disabled:cursor-default disabled:text-text-secondary",
            hasPlaceholder ? "text-text-primary invalid:text-text-muted" : "text-text-primary",
            className,
          )}
          {...props}
        >
          {hasPlaceholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown
          {...iconProps}
          size={size === "md" ? 16 : iconProps.size}
          className={cn(
            "pointer-events-none absolute text-text-muted",
            size === "md" ? "right-3" : "right-3.5",
          )}
        />
      </div>
      {message && (
        <FieldMessage id={messageId} error={!!error}>
          {message}
        </FieldMessage>
      )}
    </div>
  );
}
