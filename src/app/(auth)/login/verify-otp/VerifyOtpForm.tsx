"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { ResendTimer } from "@/components/ui/ResendTimer";
import { iconProps } from "@/components/ui/icon";
import { otpSchema } from "@/lib/validation/auth";

export function VerifyOtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function verify(code: string) {
    const parsed = otpSchema.safeParse({ otp: code });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setVerifying(true);
    // Mock: no auth API yet — any 6-digit code is accepted.
    await new Promise((r) => setTimeout(r, 500));
    router.push("/dashboard");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void verify(otp);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            if (error) setError(null);
          }}
          onComplete={(v) => void verify(v)}
          error={!!error}
          disabled={verifying}
          autoFocus
        />
        {error && (
          <p role="alert" className="text-[13px] leading-[18px] text-danger-600">
            {error}
          </p>
        )}
      </div>

      <ResendTimer
        onResend={() => {
          setOtp("");
          setNotice("A new code has been sent.");
        }}
      />
      {notice && (
        <p className="text-[13px] leading-[18px] text-success-600" aria-live="polite">
          {notice}
        </p>
      )}

      <Button type="submit" fullWidth loading={verifying} leadingIcon={<ShieldCheck {...iconProps} />}>
        Verify &amp; continue
      </Button>
    </form>
  );
}
