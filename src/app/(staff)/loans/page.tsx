import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, HandCoins, Plus, TriangleAlert, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { iconProps } from "@/components/ui/icon";
import { formatCount, formatDate, formatINR, formatINRCompact, plural } from "@/lib/format";
import { pendingLoans, stageTone, type LoanApplication } from "@/lib/mock/dashboard";
import { loanStatus, loans, memberName } from "@/lib/mock/member-profiles";
import { MOCK_TODAY } from "@/lib/mock/members";
import { LoansView, type LoanRow } from "./LoansView";

export const metadata: Metadata = { title: "Loans" };

const stages: LoanApplication["stage"][] = ["New", "Verification", "Committee"];

export default function LoansPage() {
  const rows: LoanRow[] = loans.map((l) => ({ ...l, memberName: memberName(l.memberId), status: loanStatus(l) }));
  const outstanding = rows.reduce((s, l) => s + l.outstanding, 0);
  const overdue = rows.filter((l) => l.overdueEmis > 0);
  const overdueAmount = overdue.reduce((s, l) => s + l.emi * l.overdueEmis, 0);
  const month = MOCK_TODAY.slice(0, 7);
  const dueThisMonth = rows.filter((l) => l.nextDueOn.startsWith(month));

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader
        title="Loans"
        description="Loan portfolio, repayments and applications awaiting approval"
        actions={
          <Link href="/loans/new" className={buttonClasses({ size: "md" })}>
            <Plus {...iconProps} />
            New loan application
          </Link>
        }
      />

      <section aria-label="Loan figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Loans outstanding"
          value={formatINRCompact(outstanding)}
          icon={<HandCoins {...iconProps} />}
          iconTone="accent"
          caption={`across ${plural(rows.length, "active loan")}`}
        />
        <KpiCard
          label="EMIs due this month"
          value={formatINRCompact(dueThisMonth.reduce((s, l) => s + l.emi, 0))}
          icon={<CalendarClock {...iconProps} />}
          iconTone="info"
          caption={plural(dueThisMonth.length, "instalment")}
        />
        <KpiCard
          label="Overdue EMIs"
          value={formatINR(overdueAmount)}
          icon={<TriangleAlert {...iconProps} />}
          iconTone="danger"
          caption={`${plural(overdue.length, "loan")} · ${formatCount(Math.round((overdue.length / Math.max(1, rows.length)) * 100))}% of portfolio`}
        />
        <KpiCard
          label="Applications pending"
          value={formatCount(pendingLoans.length)}
          icon={<Wallet {...iconProps} />}
          iconTone="brand"
          caption={formatINR(pendingLoans.reduce((s, l) => s + l.amount, 0)) + " requested"}
        />
      </section>

      <Card>
        <CardHeader title="Applications in progress" description="New → document verification → loan committee" />
        <div className="grid gap-4 p-5 sm:px-6 lg:grid-cols-3">
          {stages.map((stage) => {
            const items = pendingLoans.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="flex flex-col gap-3 rounded-control border border-neutral-border bg-neutral-subtle p-4">
                <div className="flex items-center justify-between">
                  <Badge tone={stageTone[stage]} dot>
                    {stage}
                  </Badge>
                  <span className="text-xs leading-4 font-semibold text-text-muted">{items.length}</span>
                </div>
                {items.length === 0 && <p className="text-[13px] leading-[18px] text-text-muted">Nothing at this stage</p>}
                {items.map((l) => (
                  <Link
                    key={l.loanNo}
                    href={`/members/${l.memberId}`}
                    className="flex flex-col gap-1 rounded-control border border-neutral-border bg-neutral-surface p-3 outline-none hover:border-neutral-border-strong focus-visible:shadow-focus"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm leading-5 font-semibold text-text-primary">{l.memberName}</span>
                      <span className="text-sm leading-5 font-semibold text-text-primary tabular-nums">{formatINR(l.amount)}</span>
                    </span>
                    <span className="text-xs leading-4 text-text-muted">
                      {l.loanNo} · {l.purpose} · applied {formatDate(l.appliedOn)}
                    </span>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      <LoansView loans={rows} today={MOCK_TODAY} />
    </div>
  );
}
