import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Clock, Plus, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { KpiCard } from "@/components/ui/KpiCard";
import { iconProps } from "@/components/ui/icon";
import { formatCount, formatINRCompact, plural } from "@/lib/format";
import { MOCK_TODAY } from "@/lib/mock/members";
import { isOutflow, ledger } from "@/lib/mock/transactions";
import { TransactionsView } from "./TransactionsView";

export const metadata: Metadata = { title: "Transactions" };

/** Same window as the table's default "Last 30 days" filter, so the cards and table agree. */
const windowStart = new Date(`${MOCK_TODAY}T00:00:00+05:30`).getTime() - 29 * 86400000;

export default function TransactionsPage() {
  const recent = ledger.filter((t) => new Date(t.at).getTime() >= windowStart);
  const done = recent.filter((t) => t.status === "Completed");
  const inflow = done.filter((t) => !isOutflow(t.type)).reduce((s, t) => s + t.amount, 0);
  const outflow = done.filter((t) => isOutflow(t.type)).reduce((s, t) => s + t.amount, 0);
  const attention = recent.filter((t) => t.status !== "Completed");

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Every receipt and payout at the counter, by UPI, cheque and auto-debit"
        actions={
          <Link href="/transactions/new" className={buttonClasses({ size: "md" })}>
            <Plus {...iconProps} />
            Record payment
          </Link>
        }
      />

      <section aria-label="Last 30 days" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Collections · 30 days" value={formatINRCompact(inflow)} icon={<ArrowDownLeft {...iconProps} />} iconTone="success" caption="Deposits, EMIs, shares and fees" />
        <KpiCard label="Payouts · 30 days" value={formatINRCompact(outflow)} icon={<ArrowUpRight {...iconProps} />} iconTone="accent" caption="Withdrawals and loan disbursals" />
        <KpiCard label="Net inflow" value={formatINRCompact(inflow - outflow)} icon={<Scale {...iconProps} />} iconTone="brand" caption={plural(done.length, "completed transaction")} />
        <KpiCard label="Needs attention" value={formatCount(attention.length)} icon={<Clock {...iconProps} />} iconTone="warning" caption="Pending or failed" />
      </section>

      <TransactionsView entries={ledger} today={MOCK_TODAY} />
    </div>
  );
}
