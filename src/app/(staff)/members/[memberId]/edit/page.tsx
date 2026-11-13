import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDate, maskAadhaar } from "@/lib/format";
import { getMemberProfile } from "@/lib/mock/member-profiles";
import { EditMemberForm } from "./EditMemberForm";

export async function generateMetadata({ params }: PageProps<"/members/[memberId]/edit">): Promise<Metadata> {
  const { memberId } = await params;
  const member = getMemberProfile(memberId);
  return { title: member ? `Edit · ${member.name}` : "Edit member" };
}

export default async function EditMemberPage({ params }: PageProps<"/members/[memberId]/edit">) {
  const { memberId } = await params;
  const m = getMemberProfile(memberId);
  if (!m) notFound();

  return (
    <EditMemberForm
      memberId={m.id}
      identity={[
        { label: "Full name", value: m.name },
        { label: m.guardianRelation === "Husband" ? "Husband's name" : "Father's name", value: m.guardianName },
        { label: "Date of birth", value: formatDate(m.dateOfBirth) },
        { label: "Aadhaar", value: maskAadhaar(m.aadhaarLast4) },
        { label: "PAN", value: m.pan },
      ]}
      accountLast4={m.bank.accountLast4}
      defaults={{
        mobile: m.mobile,
        email: m.email ?? "",
        occupation: m.occupation,
        addressLine: m.address.line,
        locality: m.address.locality,
        city: m.address.city,
        pinCode: m.address.pinCode,
        nomineeName: m.nominee.name,
        nomineeRelation: m.nominee.relation,
        bankName: m.bank.name,
        bankBranch: m.bank.branch,
        ifsc: m.bank.ifsc,
        newBankAccount: "",
        reason: "",
      }}
    />
  );
}
