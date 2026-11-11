import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HandCoins, PiggyBank, TriangleExclamationPoint, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { iconProps } from "@/components/ui/icon";
import { formatCount, formatDate, formatINR, formatINRCompact, formatTime } from "@/lib/format";
import {
  kpis,
  pendingLoans,
  recentTransactions,
  stageTone,
  statusTone,
  type Transaction,
} from "@/lib/mock/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

const outflow: Transaction["type"][] = ["Withdrawal", "Loan disbursal"];

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={buttonClasses({ variant: "ghost", size: "md", className: "-mr-2 h-8 px-2" })}
    >
      View all
      <ArrowRight size={16} strokeWidth={1.6} aria-hidden />
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm leading-5 text-text-secondary">
          Society overview — members, deposits and loans at a glance.
        </p>
        <Link href="/members/new" className={buttonClasses({ variant: "accent", size: "md" })}>
          <UserPlus {...iconProps} />
          Register member
        </Link>
      </div>

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total members"
          value={formatCount(kpis.members.value)}
          icon={<Users {...iconProps} />}
          iconTone="brand"
          delta={{ value: kpis.members.delta, direction: "up" }}
          caption={kpis.members.caption}
        />
        <KpiCard
          label="Total deposits"
          value={formatINRCompact(kpis.deposits.value)}
          icon={<PiggyBank {...iconProps} />}
          iconTone="success"
          delta={{ value: kpis.deposits.delta, direction: "up" }}
          caption={kpis.deposits.caption}
        />
        <KpiCard
          label="Loans outstanding"
          value={formatINRCompact(kpis.loansOutstanding.value)}
          icon={<HandCoins {...iconProps} />}
          iconTone="accent"
          delta={{ value: kpis.loansOutstanding.delta, direction: "up" }}
          caption={kpis.loansOutstanding.caption}
        />
        <KpiCard
          label="Overdue amount"
          value={formatINRCompact(kpis.overdue.value)}
          icon={<TriangleExclamationPoint {...iconProps} />}
          iconTone="danger"
          delta={{ value: kpis.overdue.delta, direction: "up", positive: false }}
          caption={kpis.overdue.caption}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader
            title="Recent transactions"
            description="Latest activity across all branches"
            action={<ViewAll href="/transactions" />}
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm leading-5">
              <thead>
                <tr className="border-y border-neutral-border bg-neutral-subtle text-xs leading-4 font-semibold text-text-secondary">
                  <th scope="col" className="px-5 py-2.5 font-semibold sm:px-6">Member</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Type</th>
                  <th scope="col" className="px-3 py-2.5 text-right font-semibold">Amount</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Date &amp; time</th>
                  <th scope="col" className="px-5 py-2.5 font-semibold sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-subtle">
                    <td className="px-5 py-3 sm:px-6">
                      <p className="font-semibold text-text-primary">{t.memberName}</p>
                      <p className="text-xs leading-4 text-text-muted">{t.memberId}</p>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{t.type}</td>
                    <td
                      className={`px-3 py-3 text-right font-semibold tabular-nums ${
                        outflow.includes(t.type) ? "text-text-primary" : "text-success-600"
                      }`}
                    >
                      {outflow.includes(t.type) ? "−" : "+"}
                      {formatINR(t.amount)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-text-secondary">
                      {formatDate(t.at)}
                      <span className="block text-xs leading-4 text-text-muted">{formatTime(t.at)}</span>
                    </td>
                    <td className="px-5 py-3 sm:px-6">
                      <Badge tone={statusTone[t.status]} dot>
                        {t.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="min-w-0">
          <CardHeader
            title="Pending loan applications"
            description={`${pendingLoans.length} awaiting action`}
            action={<ViewAll href="/loans" />}
          />
          <ul className="mt-3 divide-y divide-neutral-border px-5 pb-2 sm:px-6">
            {pendingLoans.map((loan) => (
              <li key={loan.loanNo} className="flex items-start justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm leading-5 font-semibold text-text-primary">
                    {loan.memberName}
                  </p>
                  <p className="text-xs leading-4 text-text-muted">
                    {loan.loanNo} · {loan.purpose} · {formatDate(loan.appliedOn)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm leading-5 font-semibold text-text-primary tabular-nums">
                    {formatINR(loan.amount)}
                  </span>
                  <Badge tone={stageTone[loan.stage]}>{loan.stage}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
