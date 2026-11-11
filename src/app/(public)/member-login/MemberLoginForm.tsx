"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, IdCard, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/ui/OtpInput";
import { ResendTimer } from "@/components/ui/ResendTimer";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { maskMobile } from "@/lib/format";
import { memberLoginSchema, otpSchema, type MemberLoginValues } from "@/lib/validation/auth";

/** Where members land after signing in. The member portal isn't built yet. */
const MEMBER_HOME = "/member";

export function MemberLoginForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return sentTo ? (
    <OtpStep mobile={sentTo} onChangeDetails={() => setSentTo(null)} />
  ) : (
    <DetailsStep onSent={setSentTo} />
  );
}

function DetailsStep({ onSent }: { onSent: (mobile: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberLoginValues>({
    resolver: zodResolver(memberLoginSchema),
    defaultValues: { memberId: "", mobile: "" },
  });

  async function onSubmit(values: MemberLoginValues) {
    // Mock: no API yet — pretend the OTP was sent to the registered mobile.
    await new Promise((r) => setTimeout(r, 500));
    onSent(values.mobile);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <TextField
        label="Member ID"
        required
        placeholder="JSK-M-0000"
        autoComplete="username"
        className="uppercase placeholder:normal-case"
        leadingIcon={<IdCard {...iconProps} />}
        helperText="Printed on your passbook and membership card"
        error={errors.memberId?.message}
        {...register("memberId")}
      />
      <TextField
        label="Registered mobile number"
        required
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={10}
        placeholder="98110 45672"
        prefix="+91"
        leadingIcon={<Smartphone {...iconProps} />}
        error={errors.mobile?.message}
        {...register("mobile")}
      />
      <Button
        type="submit"
        fullWidth
        loading={isSubmitting}
        trailingIcon={<ArrowRight {...iconProps} />}
      >
        Send OTP
      </Button>
    </form>
  );
}

function OtpStep({ mobile, onChangeDetails }: { mobile: string; onChangeDetails: () => void }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  async function verify(code: string) {
    const parsed = otpSchema.safeParse({ otp: code });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setVerifying(true);
    // Mock: any 6-digit code is accepted.
    await new Promise((r) => setTimeout(r, 500));
    router.push(MEMBER_HOME);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void verify(otp);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-control bg-brand-50 px-3.5 py-3 text-[13px] leading-[18px] text-text-secondary">
        <span>
          Code sent to <span className="font-semibold text-text-primary">{maskMobile(mobile)}</span>
        </span>
        <button
          type="button"
          onClick={onChangeDetails}
          className="shrink-0 font-semibold text-brand-600 hover:underline"
        >
          Change
        </button>
      </div>

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

      <ResendTimer onResend={() => setOtp("")} />

      <Button type="submit" fullWidth loading={verifying} leadingIcon={<ShieldCheck {...iconProps} />}>
        Verify &amp; sign in
      </Button>
    </form>
  );
}
