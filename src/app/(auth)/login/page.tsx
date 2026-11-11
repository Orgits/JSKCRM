import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { StaffLoginForm } from "./StaffLoginForm";

export const metadata: Metadata = { title: "Staff login" };

export default function StaffLoginPage() {
  return (
    <AuthShell
      audience="staff"
      title="Welcome back"
      description="Sign in to the staff console with your staff ID and password."
      footer={
        <>
          Are you a member?{" "}
          <Link href="/member-login" className="font-semibold text-brand-600 hover:underline">
            Member login
          </Link>
        </>
      }
    >
      <StaffLoginForm />
    </AuthShell>
  );
}
