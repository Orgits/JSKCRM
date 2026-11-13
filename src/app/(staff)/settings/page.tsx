import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ADMISSION_FEE, FIRST_COMPULSORY_DEPOSIT, PASSBOOK_FEE, SHARE_VALUE } from "@/lib/fees";
import { LOAN_PRODUCTS } from "@/lib/loan";
import { society } from "@/lib/society";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Settings" description="Society profile, rates, fees, notifications and sign-in security" />
      <SettingsForm
        society={{ legalName: society.legalName, headOffice: society.headOffice }}
        loanProducts={LOAN_PRODUCTS.map(({ purpose, rate, maxAmount }) => ({ purpose, rate, maxAmount }))}
        fees={[
          { id: "admission", label: "Admission fee", amount: ADMISSION_FEE },
          { id: "share", label: "Value of one share", amount: SHARE_VALUE },
          { id: "compulsory", label: "First compulsory deposit", amount: FIRST_COMPULSORY_DEPOSIT },
          { id: "passbook", label: "Passbook & ID card", amount: PASSBOOK_FEE },
        ]}
      />
    </div>
  );
}
