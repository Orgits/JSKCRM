import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { depositAccountsFor, getMemberProfile, passbookFor } from "@/lib/mock/member-profiles";
import { Passbook } from "./Passbook";

export async function generateMetadata({ params }: PageProps<"/members/[memberId]/passbook">): Promise<Metadata> {
  const { memberId } = await params;
  const member = getMemberProfile(memberId);
  return { title: member ? `Passbook · ${member.name}` : "Passbook" };
}

export default async function MemberPassbookPage({ params }: PageProps<"/members/[memberId]/passbook">) {
  const { memberId } = await params;
  const member = getMemberProfile(memberId);
  if (!member) notFound();

  const books = depositAccountsFor(member).map((account) => ({
    account,
    rows: passbookFor(member, account),
  }));

  return <Passbook memberName={member.name} books={books} />;
}
