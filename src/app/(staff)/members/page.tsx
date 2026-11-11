import type { Metadata } from "next";
import { MOCK_TODAY, members } from "@/lib/mock/members";
import { MembersView } from "./MembersView";

export const metadata: Metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <MembersView members={members} today={MOCK_TODAY} />
    </div>
  );
}
