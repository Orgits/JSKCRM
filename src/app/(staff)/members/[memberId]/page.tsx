import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Building2,
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  CreditCard,
  ExternalLink,
  IdCard,
  Info,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { ageOn, formatDate, formatDateLong, formatINR, formatMobile, formatTime, maskAadhaar, plural } from "@/lib/format";
import {
  MAX_GUARANTEES_PER_MEMBER,
  activityFor,
  depositAccountsFor,
  getMemberProfile,
  guaranteesBy,
  loanStatus,
  loansFor,
  memberName,
  type ActivityTone,
  type DepositAccountType,
  type Loan,
  type MemberProfile as Member,
} from "@/lib/mock/member-profiles";
import { MOCK_TODAY } from "@/lib/mock/members";

export async function generateMetadata({ params }: PageProps<"/members/[memberId]">): Promise<Metadata> {
  const { memberId } = await params;
  return { title: getMemberProfile(memberId)?.name ?? "Member" };
}

const accountStyle: Record<DepositAccountType, { label: string; icon: LucideIcon; tone: string }> = {
  Savings: { label: "Savings account", icon: Wallet, tone: "bg-brand-50 text-brand-600" },
  "Compulsory thrift": { label: "Compulsory thrift deposit", icon: CalendarCheck, tone: "bg-success-50 text-success-600" },
  "Recurring deposit": { label: "Recurring deposit", icon: CalendarDays, tone: "bg-accent-50 text-accent-600" },
  "Fixed deposit": { label: "Fixed deposit", icon: Banknote, tone: "bg-info-50 text-info-600" },
};

const dotTone: Record<ActivityTone, string> = {
  brand: "bg-brand-600",
  success: "bg-success-600",
  accent: "bg-accent-600",
  info: "bg-info-600",
  warning: "bg-warning-600",
  danger: "bg-danger-600",
};

export default async function MemberOverviewPage({ params }: PageProps<"/members/[memberId]">) {
  const { memberId } = await params;
  const member = getMemberProfile(memberId);
  if (!member) notFound();

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-5">
        <DepositAccounts member={member} />
        <ActiveLoans member={member} />
        <Guarantees member={member} />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <PersonalDetails member={member} />
        <KycAndBank member={member} />
        <Nominee member={member} />
        <RecentActivity member={member} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Left column

function DepositAccounts({ member }: { member: Member }) {
  const accounts = depositAccountsFor(member);
  return (
    <Card>
      <CardHeader
        title="Deposit accounts"
        description={`${plural(accounts.length, "account")} · ${formatINR(member.deposits)} total`}
        action={<SectionLink href={`/members/${member.id}/passbook`}>Passbook</SectionLink>}
      />
      <ul className="divide-y divide-neutral-border px-5 pt-2 pb-1 sm:px-6">
        {accounts.map((a) => {
          const { label, icon: Icon, tone } = accountStyle[a.type];
          return (
            <li key={a.accountNo} className="flex items-center gap-3.5 py-3.5">
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-control", tone)}>
                <Icon size={20} strokeWidth={1.6} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 font-semibold text-text-primary">{label}</p>
                <p className="text-xs leading-4 text-text-muted">
                  {a.accountNo} · {a.detail}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm leading-5 font-semibold text-text-primary tabular-nums">{formatINR(a.balance)}</p>
                <p className="text-xs leading-4 text-text-muted">{a.note}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ActiveLoans({ member }: { member: Member }) {
  const own = loansFor(member.id);
  if (own.length === 0) {
    return (
      <Card>
        <CardHeader title="Loans" description="No active loans" />
        <p className="px-5 pt-3 pb-5 text-sm leading-5 text-text-secondary sm:px-6">
          {member.loans.closed
            ? `${plural(member.loans.closed, "earlier loan")} closed in full.`
            : "This member hasn't taken a loan from the society yet."}
        </p>
      </Card>
    );
  }
  return (
    <>
      {own.map((loan) => (
        <LoanCard key={loan.loanNo} loan={loan} />
      ))}
    </>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const status = loanStatus(loan);
  const pct = Math.round((loan.emisPaid / loan.tenureMonths) * 100);
  const overdueAmount = loan.overdueEmis * loan.emi;
  const figures = [
    { label: "Sanctioned", value: formatINR(loan.sanctioned) },
    { label: "Monthly EMI", value: formatINR(loan.emi) },
    { label: "Outstanding", value: formatINR(loan.outstanding) },
    { label: loan.overdueEmis ? "Due since" : "Next due", value: formatDate(loan.nextDueOn) },
    { label: "Overdue", value: formatINR(overdueAmount), tone: overdueAmount ? "text-danger-600" : "text-success-600" },
  ];

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            Active loan
            <Badge tone={status === "Overdue" ? "danger" : "success"} dot>
              {status === "Overdue" ? `${loan.overdueEmis} EMI${loan.overdueEmis > 1 ? "s" : ""} overdue` : "Regular"}
            </Badge>
          </span>
        }
        description={`${loan.loanNo} · ${loan.purpose} loan · sanctioned ${formatDateLong(loan.sanctionedOn)}`}
      />
      <div className="flex flex-col gap-4 px-5 pt-4 pb-5 sm:px-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm leading-5">
            <span className="font-medium text-text-secondary">
              {loan.emisPaid} of {loan.tenureMonths} EMIs paid
            </span>
            <span className="font-semibold text-brand-600">{pct}% repaid</span>
          </div>
          <div
            role="progressbar"
            aria-label="Loan repaid"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-neutral-bg"
          >
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {figures.map((f) => (
            <div key={f.label} className="rounded-control bg-neutral-subtle px-3.5 py-3">
              <dt className="text-xs leading-4 text-text-muted">{f.label}</dt>
              <dd className={cn("text-sm leading-5 font-semibold tabular-nums", f.tone ?? "text-text-primary")}>{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs leading-4 font-semibold text-text-muted">Guarantors</span>
          {loan.guarantorIds.map((id) => (
            <Link
              key={id}
              href={`/members/${id}`}
              className="flex items-center gap-2 rounded-full border border-neutral-border py-1 pr-3 pl-1 text-xs leading-4 outline-none hover:border-neutral-border-strong focus-visible:shadow-focus"
            >
              <Avatar name={memberName(id)} toneKey={id} size="xs" />
              <span className="font-semibold text-text-primary">{memberName(id)}</span>
              <span className="text-text-muted">{id}</span>
            </Link>
          ))}
          <span className="ml-auto">
            {loan.locationUrl ? (
              <a
                href={loan.locationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm leading-5 font-semibold text-brand-600 hover:underline"
              >
                <MapPin size={16} strokeWidth={1.6} aria-hidden />
                Open mapped location
                <ExternalLink size={14} strokeWidth={1.6} aria-hidden />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm leading-5 font-semibold text-warning-600">
                <TriangleAlert size={16} strokeWidth={1.6} aria-hidden />
                Location not recorded
              </span>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}

function Guarantees({ member }: { member: Member }) {
  const given = guaranteesBy(member.id);
  return (
    <Card>
      <CardHeader
        title="Guarantees given"
        description={
          given.length
            ? `Guarantor for ${given.length} of ${MAX_GUARANTEES_PER_MEMBER} allowed loans`
            : "Not a guarantor on any active loan"
        }
      />
      {given.length > 0 && (
        <ul className="divide-y divide-neutral-border px-5 pt-2 sm:px-6">
          {given.map((loan) => {
            const borrower = memberName(loan.memberId);
            const overdue = loanStatus(loan) === "Overdue";
            return (
              <li key={loan.loanNo} className="flex items-center gap-3.5 py-3.5">
                <Avatar name={borrower} toneKey={loan.memberId} size="lg" />
                <div className="min-w-0 flex-1">
                  <Link href={`/members/${loan.memberId}`} className="text-sm leading-5 font-semibold text-brand-700 hover:underline">
                    {borrower}
                  </Link>
                  <p className="text-xs leading-4 text-text-muted">
                    {loan.loanNo} · EMI {loan.emisPaid} of {loan.tenureMonths}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm leading-5 font-semibold text-text-primary tabular-nums">{formatINR(loan.outstanding)}</span>
                  <Badge tone={overdue ? "danger" : "success"} dot>
                    {overdue ? "Overdue" : "Regular"}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {given.length > 0 ? (
        <div className="px-5 pt-2 pb-5 sm:px-6">
          <p className="flex items-start gap-2.5 rounded-control bg-info-50 px-3.5 py-3 text-[13px] leading-[18px] text-info-600">
            <ShieldCheck size={18} strokeWidth={1.6} aria-hidden className="shrink-0" />
            If a borrower defaults, the guarantor&apos;s deposits can be adjusted as per the society&apos;s bye-laws.
          </p>
        </div>
      ) : (
        <div className="pb-5" />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- Right column

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <h3 className="text-base leading-6 font-semibold text-text-primary">{title}</h3>
      {children}
    </Card>
  );
}

function PersonalDetails({ member }: { member: Member }) {
  const rows: [string, string][] = [
    [`${member.guardianRelation}'s name`, member.guardianName],
    ["Date of birth", `${formatDateLong(member.dateOfBirth)} · ${ageOn(member.dateOfBirth, MOCK_TODAY)} years`],
    ["Gender · Marital status", `${member.gender} · ${member.maritalStatus}`],
    ["Occupation", member.occupation],
    ["Email", member.email ?? "—"],
    ["Address", `${member.address.line}, ${member.address.locality}, ${member.address.city} – ${member.address.pinCode}`],
    ["Membership", `${member.membership} member`],
  ];
  return (
    <SideCard title="Personal details">
      <dl className="flex flex-col gap-3">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs leading-4 text-text-muted">{k}</dt>
            <dd className="text-sm leading-5 font-medium break-words text-text-primary">{v}</dd>
          </div>
        ))}
      </dl>
    </SideCard>
  );
}

function KycRow({ icon: Icon, label, value, verified }: { icon: LucideIcon; label: string; value: string; verified?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-neutral-bg text-text-secondary">
        <Icon size={18} strokeWidth={1.6} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs leading-4 text-text-muted">{label}</dt>
        <dd className="text-sm leading-5 font-medium break-words text-text-primary tabular-nums">{value}</dd>
      </div>
      {verified && <CircleCheck size={18} strokeWidth={1.6} aria-label="Verified" className="shrink-0 text-success-600" />}
    </div>
  );
}

function KycAndBank({ member }: { member: Member }) {
  const verified = member.kyc === "Verified";
  return (
    <SideCard title="KYC & bank">
      <dl className="flex flex-col gap-3.5">
        <KycRow icon={IdCard} label="Aadhaar" value={maskAadhaar(member.aadhaarLast4)} verified={verified} />
        <KycRow icon={CreditCard} label="PAN" value={member.pan} verified={verified} />
        <KycRow
          icon={Building2}
          label="Bank account"
          value={`${member.bank.name}, ${member.bank.branch} · XXXXXX${member.bank.accountLast4}`}
        />
        <KycRow icon={CreditCard} label="IFSC" value={member.bank.ifsc} />
      </dl>
      {member.kyc === "Verified" && member.kycVerifiedOn && (
        <p className="flex items-center gap-2 rounded-control bg-success-50 px-3 py-2.5 text-xs leading-4 font-semibold text-success-600">
          <CircleCheck size={16} strokeWidth={1.6} aria-hidden className="shrink-0" />
          e-KYC verified on {formatDateLong(member.kycVerifiedOn)}
        </p>
      )}
      {member.kyc === "Re-KYC due" && (
        <p className="flex items-center gap-2 rounded-control bg-warning-50 px-3 py-2.5 text-xs leading-4 font-semibold text-warning-600">
          <TriangleAlert size={16} strokeWidth={1.6} aria-hidden className="shrink-0" />
          Re-KYC due — last verified {member.kycVerifiedOn ? formatDateLong(member.kycVerifiedOn) : "—"}
        </p>
      )}
      {member.kyc === "Pending" && (
        <p className="flex items-center gap-2 rounded-control bg-warning-50 px-3 py-2.5 text-xs leading-4 font-semibold text-warning-600">
          <Info size={16} strokeWidth={1.6} aria-hidden className="shrink-0" />
          KYC verification pending
        </p>
      )}
    </SideCard>
  );
}

function Nominee({ member }: { member: Member }) {
  const n = member.nominee;
  const details = [
    n.relation,
    n.dateOfBirth && `DOB ${formatDate(n.dateOfBirth)}`,
    n.mobile && formatMobile(n.mobile),
  ].filter(Boolean);
  return (
    <SideCard title="Nominee">
      <div className="flex items-center gap-3">
        <Avatar name={n.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 font-semibold text-text-primary">{n.name}</p>
          <p className="text-xs leading-4 text-text-muted">{details.join(" · ")}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm leading-5 font-semibold text-brand-600">{n.share}%</p>
          <p className="text-xs leading-4 text-text-muted">share</p>
        </div>
      </div>
    </SideCard>
  );
}

function RecentActivity({ member }: { member: Member }) {
  const events = activityFor(member);
  return (
    <SideCard title="Recent activity">
      <ol className="flex flex-col">
        {events.map((e, i) => (
          <li key={e.title + e.at} className="flex gap-3">
            <span aria-hidden className="flex flex-col items-center pt-1.5">
              <span className={cn("size-2.5 shrink-0 rounded-full ring-2 ring-neutral-surface", dotTone[e.tone])} />
              {i < events.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-neutral-border" />}
            </span>
            <div className={cn("min-w-0", i < events.length - 1 && "pb-4")}>
              <p className="text-sm leading-5 font-medium text-text-primary">{e.title}</p>
              <p className="text-xs leading-4 text-text-muted">
                {formatDate(e.at)}, {formatTime(e.at)} · {e.by}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </SideCard>
  );
}

function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm leading-5 font-semibold text-brand-600 hover:underline">
      {children}
      <ArrowRight size={16} strokeWidth={1.6} aria-hidden />
    </Link>
  );
}
