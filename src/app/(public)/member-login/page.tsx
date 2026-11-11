import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { MemberLoginForm } from "./MemberLoginForm";

export const metadata: Metadata = { title: "Member login" };

export default function MemberLoginPage() {
  return (
    <AuthShell
      audience="member"
      title="Member login"
      description="Sign in with your member ID and the mobile number registered with the society."
      footer={
        <>
          Society staff?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Staff login
          </Link>
        </>
      }
    >
      <MemberLoginForm />
    </AuthShell>
  );
}
