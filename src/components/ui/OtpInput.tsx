"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible name for the group, e.g. "One-time password". */
  label?: string;
  /** Fired once every box is filled. */
  onComplete?: (value: string) => void;
};

/** Six single-digit boxes: auto-advance, backspace to previous, arrow keys, paste a full code. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  disabled,
  autoFocus,
  label = "One-time password",
  onComplete,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function focus(i: number) {
    refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();
  }

  function update(next: string[]) {
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && !next.includes("")) onComplete?.(joined);
  }

  function setDigit(i: number, raw: string) {
    const d = raw.replace(/\D/g, "").slice(-1);
    if (!d) return;
    const next = [...digits];
    next[i] = d;
    update(next);
    if (i < length - 1) focus(i + 1);
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
      } else if (i > 0) {
        next[i - 1] = "";
        focus(i - 1);
      }
      update(next);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focus(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focus(i + 1);
    }
  }

  function onPaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    for (let k = 0; k < pasted.length && i + k < length; k++) next[i + k] = pasted[k];
    update(next);
    focus(Math.min(i + pasted.length, length - 1));
  }

  return (
    <div role="group" aria-label={label} className="flex gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={error || undefined}
          className={cn(
            "size-12 min-w-0 flex-1 rounded-control border bg-neutral-surface text-center text-xl leading-7 font-semibold text-text-primary tabular-nums outline-none transition-[border-color,box-shadow] sm:size-13 sm:flex-none",
            "focus:border-brand-600 focus:shadow-focus disabled:bg-neutral-subtle disabled:text-text-secondary",
            error ? "border-danger-600" : d ? "border-brand-500" : "border-neutral-border-strong",
          )}
        />
      ))}
    </div>
  );
}
