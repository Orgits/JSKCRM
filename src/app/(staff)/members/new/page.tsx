import type { Metadata } from "next";
import { RegisterMemberForm } from "./RegisterMemberForm";

export const metadata: Metadata = { title: "Register new member" };

export default function RegisterMemberPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <p className="text-sm leading-5 text-text-secondary">
        Enter the applicant&apos;s details exactly as they appear on their KYC documents. Fields
        marked <span className="text-danger-600">*</span> are required.
      </p>
      <RegisterMemberForm />
    </div>
  );
}
