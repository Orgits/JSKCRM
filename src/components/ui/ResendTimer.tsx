"use client";

import { useEffect, useState } from "react";

/** "Resend code in 0:30" countdown, then a Resend button. */
export function ResendTimer({ seconds = 30, onResend }: { seconds?: number; onResend: () => void }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  if (left > 0) {
    return (
      <p className="text-[13px] leading-[18px] text-text-secondary" aria-live="polite">
        Didn&apos;t get the code? Resend in{" "}
        <span className="font-semibold text-text-primary tabular-nums">
          0:{String(left).padStart(2, "0")}
        </span>
      </p>
    );
  }

  return (
    <p className="text-[13px] leading-[18px] text-text-secondary">
      Didn&apos;t get the code?{" "}
      <button
        type="button"
        onClick={() => {
          onResend();
          setLeft(seconds);
        }}
        className="font-semibold text-brand-600 hover:underline"
      >
        Resend code
      </button>
    </p>
  );
}
