import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCount, formatDateLong, formatINR } from "@/lib/format";
import {
  depositAccountsFor,
  getMemberProfile,
  loans,
  shareCapital,
  type DepositAccountType,
} from "@/lib/mock/member-profiles";
import { MOCK_TODAY, members } from "@/lib/mock/members";
import { ReportDownloads } from "./ReportDownloads";

export const metadata: Metadata = { title: "Reports" };

function Line({ label, value, strong, indent }: { label: string; value: string; strong?: boolean; indent?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 px-5 py-2.5 text-sm leading-5 sm:px-6 ${strong ? "bg-neutral-subtle font-semibold text-text-primary" : "text-text-secondary"}`}>
      <dt className={indent ? "pl-4" : undefined}>{label}</dt>
      <dd className="text-text-primary tabular-nums">{value}</dd>
    </div>
  );
}

export default function ReportsPage() {
  const profiles = members.flatMap((m) => getMemberProfile(m.id) ?? []);
  const accounts = profiles.flatMap(depositAccountsFor);
  const byType = (t: DepositAccountType) => accounts.filter((a) => a.type === t).reduce((s, a) => s + a.balance, 0);
  const depositTypes: DepositAccountType[] = ["Savings", "Compulsory thrift", "Recurring deposit", "Fixed deposit"];
  const shares = profiles.reduce((s, p) => s + shareCapital(p), 0);
  const deposits = accounts.reduce((s, a) => s + a.balance, 0);
  const outstanding = loans.reduce((s, l) => s + l.outstanding, 0);
  const overdue = loans.filter((l) => l.overdueEmis > 0);
  const overdueOutstanding = overdue.reduce((s, l) => s + l.outstanding, 0);
  const active = members.filter((m) => m.status === "Active").length;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader title="Reports" description={`Society position as on ${formatDateLong(MOCK_TODAY)} and downloadable registers`} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Funds position" description="Liabilities to members and loans given out" />
          <dl className="mt-4 divide-y divide-neutral-border border-t border-neutral-border pb-2">
            <Line label="Share capital" value={formatINR(shares)} />
            {depositTypes.map((t) => (
              <Line key={t} label={t} value={formatINR(byType(t))} indent />
            ))}
            <Line label="Total member funds" value={formatINR(shares + deposits)} strong />
            <Line label="Loans outstanding" value={formatINR(outstanding)} />
            <Line label="Credit–deposit ratio" value={`${deposits ? Math.round((outstanding / deposits) * 100) : 0}%`} strong />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Membership & loan quality" description="For the monthly committee meeting" />
          <dl className="mt-4 divide-y divide-neutral-border border-t border-neutral-border pb-2">
            <Line label="Members on register" value={formatCount(members.length)} />
            <Line label="Active" value={formatCount(active)} indent />
            <Line label="Pending approval / dormant" value={formatCount(members.length - active)} indent />
            <Line label="Active loans" value={formatCount(loans.length)} strong />
            <Line label="Loans with overdue EMIs" value={formatCount(overdue.length)} indent />
            <Line label="Outstanding on overdue loans" value={formatINR(overdueOutstanding)} indent />
            <Line label="Portfolio at risk" value={`${outstanding ? ((overdueOutstanding / outstanding) * 100).toFixed(1) : "0.0"}%`} strong />
          </dl>
        </Card>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-lg leading-[26px] font-semibold text-text-primary">Registers &amp; statements</h2>
        <p className="text-[13px] leading-[18px] text-text-secondary">Download as CSV — opens in Excel with ₹ and Hindi names intact.</p>
      </div>
      <ReportDownloads />
    </div>
  );
}
