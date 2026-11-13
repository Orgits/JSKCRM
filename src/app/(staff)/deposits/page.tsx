import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CalendarCheck, CalendarDays, Plus, Wallet, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { KpiCard, type KpiTone } from "@/components/ui/KpiCard";
import { iconProps } from "@/components/ui/icon";
import { formatINRCompact, plural } from "@/lib/format";
import { depositAccountsFor, getMemberProfile, type DepositAccountType } from "@/lib/mock/member-profiles";
import { MOCK_TODAY, members } from "@/lib/mock/members";
import { DepositsView, type DepositRow } from "./DepositsView";

export const metadata: Metadata = { title: "Deposits" };

const types: { type: DepositAccountType; label: string; icon: LucideIcon; tone: KpiTone }[] = [
  { type: "Savings", label: "Savings", icon: Wallet, tone: "brand" },
  { type: "Compulsory thrift", label: "Compulsory thrift", icon: CalendarCheck, tone: "success" },
  { type: "Recurring deposit", label: "Recurring deposits", icon: CalendarDays, tone: "accent" },
  { type: "Fixed deposit", label: "Fixed deposits", icon: Banknote, tone: "info" },
];

export default function DepositsPage() {
  const rows: DepositRow[] = members.flatMap((m) => {
    const profile = getMemberProfile(m.id);
    if (!profile) return [];
    return depositAccountsFor(profile).map((a) => ({ ...a, memberId: m.id, memberName: m.name, memberStatus: m.status }));
  });
  const total = rows.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader
        title="Deposits"
        description={`${plural(rows.length, "account")} holding ${formatINRCompact(total)} across savings, thrift, RD and FD`}
        actions={
          <Link href="/transactions/new?type=deposit" className={buttonClasses({ size: "md" })}>
            <Plus {...iconProps} />
            Record deposit
          </Link>
        }
      />

      <section aria-label="Deposits by account type" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {types.map(({ type, label, icon: Icon, tone }) => {
          const accounts = rows.filter((r) => r.type === type);
          const sum = accounts.reduce((s, r) => s + r.balance, 0);
          return (
            <KpiCard
              key={type}
              label={label}
              value={formatINRCompact(sum)}
              icon={<Icon {...iconProps} />}
              iconTone={tone}
              caption={`${plural(accounts.length, "account")} · ${total ? Math.round((sum / total) * 100) : 0}% of deposits`}
            />
          );
        })}
      </section>

      <DepositsView accounts={rows} today={MOCK_TODAY} />
    </div>
  );
}
