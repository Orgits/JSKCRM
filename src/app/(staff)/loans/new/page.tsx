import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MAX_GUARANTEES_PER_MEMBER, guaranteesBy, loansFor } from "@/lib/mock/member-profiles";
import { members } from "@/lib/mock/members";
import { NewLoanForm, type BorrowerOption } from "./NewLoanForm";

export const metadata: Metadata = { title: "New loan application" };

export default function NewLoanPage() {
  // Only active, KYC-verified members can borrow or stand guarantee.
  const options: BorrowerOption[] = members
    .filter((m) => m.status === "Active")
    .map((m) => ({
      id: m.id,
      name: m.name,
      kycVerified: m.kyc === "Verified",
      deposits: m.deposits,
      loanOutstanding: loansFor(m.id).reduce((s, l) => s + l.outstanding, 0),
      overdueEmis: m.loans.overdueEmis,
      guaranteesGiven: guaranteesBy(m.id).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        back={{ href: "/loans", label: "All loans" }}
        title="New loan application"
        description={`Borrower and guarantors must be active members with verified KYC. A member can guarantee at most ${MAX_GUARANTEES_PER_MEMBER} loans.`}
      />
      {/* The form reads ?member= from the URL, which needs a Suspense boundary under Cache Components. */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-neutral-surface" />}>
        <NewLoanForm members={options} />
      </Suspense>
    </div>
  );
}
