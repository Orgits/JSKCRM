import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, HandCoins, IdCard, MapPin, PenLine, Receipt, Smartphone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { iconProps } from "@/components/ui/icon";
import { formatDateLong, formatINR, formatMobile, plural } from "@/lib/format";
import {
  depositAccountsFor,
  getMemberProfile,
  guaranteesBy,
  loansFor,
  memberIds,
  shareCapital,
} from "@/lib/mock/member-profiles";
import { kycTone, memberStatusTone } from "@/lib/mock/members";

export function generateStaticParams() {
  return memberIds().map((memberId) => ({ memberId }));
}

/** Member profile shell: identity header, key figures and tabs, shared by every profile tab. */
export default async function MemberProfileLayout({ children, params }: LayoutProps<"/members/[memberId]">) {
  const { memberId } = await params;
  const member = getMemberProfile(memberId);
  if (!member) notFound();

  const accounts = depositAccountsFor(member);
  const own = loansFor(member.id);
  const guaranteed = guaranteesBy(member.id);
  const nextDue = own.map((l) => l.nextDueOn).sort()[0];
  const overdueEmis = own.reduce((s, l) => s + l.overdueEmis, 0);

  const stats = [
    { label: "Total deposits", value: formatINR(member.deposits), note: plural(accounts.length, "account") },
    {
      label: "Loan outstanding",
      value: formatINR(own.reduce((s, l) => s + l.outstanding, 0)),
      note: !own.length
        ? "No active loans"
        : overdueEmis
          ? `${own.length} active · ${plural(overdueEmis, "EMI")} overdue`
          : `${own.length} active · next EMI ${formatDateLong(nextDue)}`,
    },
    { label: "Share capital", value: formatINR(shareCapital(member)), note: `${member.shares} shares` },
    {
      label: "Guaranteeing",
      value: formatINR(guaranteed.reduce((s, l) => s + l.outstanding, 0)),
      note: guaranteed.length ? `for ${plural(guaranteed.length, "member's loan", "members' loans")}` : "Not a guarantor",
    },
  ];

  const base = `/members/${member.id}`;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <Link
        href="/members"
        className="inline-flex w-fit items-center gap-1.5 rounded text-sm leading-5 font-medium text-text-secondary outline-none hover:text-text-primary focus-visible:text-brand-700"
      >
        <ArrowLeft size={16} strokeWidth={1.6} aria-hidden />
        All members
      </Link>

      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar name={member.name} toneKey={member.id} size="xl" className="ring-4 ring-brand-50" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-[28px] leading-9 font-bold tracking-tight text-text-primary">{member.name}</h2>
              <Badge tone={memberStatusTone[member.status]} dot>
                {member.status}
              </Badge>
              <Badge tone={kycTone[member.kyc]}>KYC {member.kyc === "Verified" ? "verified" : member.kyc.toLowerCase()}</Badge>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm leading-5 text-text-secondary">
              <li className="flex items-center gap-1.5">
                <IdCard size={16} strokeWidth={1.6} aria-hidden className="text-text-muted" />
                {member.id}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays size={16} strokeWidth={1.6} aria-hidden className="text-text-muted" />
                Member since {formatDateLong(member.joinedOn)}
              </li>
              <li className="flex items-center gap-1.5 tabular-nums">
                <Smartphone size={16} strokeWidth={1.6} aria-hidden className="text-text-muted" />
                {formatMobile(member.mobile)}
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={1.6} aria-hidden className="text-text-muted" />
                {member.address.locality}, {member.address.city} – {member.address.pinCode}
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href={`${base}/edit`} className={buttonClasses({ variant: "secondary", size: "md" })}>
              <PenLine {...iconProps} />
              Edit
            </Link>
            <Link
              href={`/transactions/new?member=${member.id}`}
             
              className={buttonClasses({ variant: "secondary", size: "md" })}
            >
              <Receipt {...iconProps} />
              Record payment
            </Link>
            {/* Only active members can borrow. */}
            {member.status === "Active" && (
              <Link href={`/loans/new?member=${member.id}`} className={buttonClasses({ size: "md" })}>
                <HandCoins {...iconProps} />
                New loan
              </Link>
            )}
          </div>
        </div>

        {/* gap-px over a border-coloured background draws the dividers at every breakpoint */}
        <dl className="grid gap-px overflow-hidden rounded-control border border-neutral-border bg-neutral-border sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-0.5 bg-neutral-subtle px-4 py-3.5 sm:px-5">
              <dt className="text-xs leading-4 font-medium text-text-muted">{s.label}</dt>
              <dd className="text-lg leading-[26px] font-semibold text-text-primary tabular-nums">{s.value}</dd>
              <dd className="text-xs leading-4 text-text-muted">{s.note}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Tabs
        label="Member profile sections"
        items={[
          { href: base, label: "Overview" },
          { href: `${base}/passbook`, label: "Passbook", count: accounts.length },
        ]}
      />

      {children}
    </div>
  );
}
