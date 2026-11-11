import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { maskMobile } from "@/lib/format";
import { currentStaff } from "@/lib/mock/staff";
import { VerifyOtpForm } from "./VerifyOtpForm";

export const metadata: Metadata = { title: "Verify OTP" };

export default function VerifyOtpPage() {
  return (
    <AuthShell
      audience="staff"
      title="Verify it's you"
      description={
        <>
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-text-primary">{maskMobile(currentStaff.mobile)}</span>.
        </>
      }
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
        >
          <ArrowLeft size={16} strokeWidth={1.6} aria-hidden />
          Back to login.
        </Link>
      }
    >
      <VerifyOtpForm />
    </AuthShell>
  );
}
