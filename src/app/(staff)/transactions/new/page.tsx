import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { depositAccountsFor, getMemberProfile, loansFor } from "@/lib/mock/member-profiles";
import { members } from "@/lib/mock/members";
import { RecordPaymentForm, type PayerOption } from "./RecordPaymentForm";

export const metadata: Metadata = { title: "Record payment" };

export default function RecordPaymentPage() {
  // Dormant members can't transact until reactivated.
  const options: PayerOption[] = members
    .filter((m) => m.status !== "Dormant")
    .flatMap((m) => {
      const profile = getMemberProfile(m.id);
      if (!profile) return [];
      return [
        {
          id: m.id,
          name: m.name,
          accounts: depositAccountsFor(profile).map((a) => ({ accountNo: a.accountNo, type: a.type, balance: a.balance })),
          loans: loansFor(m.id).map((l) => ({ loanNo: l.loanNo, purpose: l.purpose, emi: l.emi, outstanding: l.outstanding, overdueEmis: l.overdueEmis })),
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        back={{ href: "/transactions", label: "All transactions" }}
        title="Record payment"
        description="Post a deposit, withdrawal or EMI and print the receipt for the member"
      />
      {/* Reads ?member= and ?type= from the URL — needs a Suspense boundary under Cache Components. */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-neutral-surface" />}>
        <RecordPaymentForm members={options} />
      </Suspense>
    </div>
  );
}
