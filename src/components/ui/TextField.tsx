import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FieldLabel, FieldMessage, controlShell } from "./Field";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: ReactNode;
  /** Helper text under the field. Replaced by `error` when present. */
  helperText?: ReactNode;
  /** Error message — puts the field in the Error state. */
  error?: ReactNode;
  /** Lucide icon element, e.g. `<Phone {...iconProps} />`. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Text shown before the value, e.g. "+91". */
  prefix?: ReactNode;
  containerClassName?: string;
};

/**
 * Figma "Input" — State: Default | Focused | Filled | Error | Read-only.
 * Focused/Filled come from the native input; pass `error` or `readOnly` for the others.
 * Works with react-hook-form: `<TextField {...register("mobile")} error={errors.mobile?.message} />`.
 */
export function TextField({
  label,
  helperText,
  error,
  leadingIcon,
  trailingIcon,
  prefix,
  required,
  readOnly,
  id,
  className,
  containerClassName,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error || helperText;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className={controlShell({ error: !!error, readOnly })}>
        {leadingIcon && <span className="flex shrink-0 text-text-muted">{leadingIcon}</span>}
        {prefix && (
          <span className="shrink-0 text-sm leading-5 font-medium text-text-secondary">{prefix}</span>
        )}
        <input
          id={inputId}
          required={required}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-sm leading-5 outline-none placeholder:text-text-muted",
            readOnly ? "text-text-secondary" : "text-text-primary",
            className,
          )}
          {...props}
        />
        {trailingIcon && <span className="flex shrink-0 text-text-muted">{trailingIcon}</span>}
      </div>
      {message && (
        <FieldMessage id={messageId} error={!!error}>
          {message}
        </FieldMessage>
      )}
    </div>
  );
}
