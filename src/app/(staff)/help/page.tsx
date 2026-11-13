import type { Metadata } from "next";
import Link from "next/link";
import { ChartColumn, ChevronDown, Clock, HandCoins, MapPin, Receipt, UserPlus, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { MAX_GUARANTEES_PER_MEMBER } from "@/lib/mock/member-profiles";
import { society } from "@/lib/society";
import { SupportTicketForm } from "./SupportTicketForm";

export const metadata: Metadata = { title: "Help & support" };

const guides: { href: string; title: string; description: string; icon: LucideIcon; tone: string }[] = [
  { href: "/members/new", title: "Register a member", description: "KYC, nominee, bank and admission fees", icon: UserPlus, tone: "bg-brand-50 text-brand-600" },
  { href: "/transactions/new", title: "Record a payment", description: "Deposits, withdrawals and EMIs with receipt", icon: Receipt, tone: "bg-success-50 text-success-600" },
  { href: "/loans/new", title: "Start a loan application", description: "EMI estimate, guarantors and checks", icon: HandCoins, tone: "bg-accent-50 text-accent-600" },
  { href: "/reports", title: "Download reports", description: "Day book, loan portfolio, registers", icon: ChartColumn, tone: "bg-info-50 text-info-600" },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "I posted a transaction against the wrong account. How do I fix it?",
    a: "Posted transactions can't be edited or deleted, so the passbook stays auditable. Raise a ticket below with the transaction ID; the branch manager posts a reversal entry and you then record the payment again against the right account.",
  },
  {
    q: "How does a loan application move to approval?",
    a: "Every application starts as New, moves to Verification once documents and guarantor consent are checked, and then goes to the loan committee. You can follow each one on the Loans page under “Applications in progress”.",
  },
  {
    q: "Why can't I choose some members as guarantors?",
    a: `A guarantor must be an active member with verified KYC, can't guarantee their own loan, and can stand guarantee for at most ${MAX_GUARANTEES_PER_MEMBER} loans at a time.`,
  },
  {
    q: "A member's KYC shows “Re-KYC due”. What should I do?",
    a: "Ask the member to bring their Aadhaar and PAN, open their profile, choose Edit and re-verify. Their accounts keep working in the meantime, but new loans need verified KYC.",
  },
  {
    q: "The member lost their receipt. How do I confirm the payment?",
    a: "Open Transactions and search by the receipt or transaction number. The same entry also appears, with the running balance, on the Passbook tab of the member's profile.",
  },
  {
    q: "A member can't sign in to the member portal.",
    a: "Member login uses an OTP sent to the registered mobile. If the number has changed, update it from the member's profile (Edit) after checking their ID, then ask them to try again.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Help & support" description="Guides for everyday counter work, answers to common questions, and a way to reach the admin team" />

      <section aria-label="Quick guides" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {guides.map(({ href, title, description, icon: Icon, tone }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-card border border-neutral-border bg-neutral-surface p-5 shadow-card outline-none transition-colors hover:border-neutral-border-strong focus-visible:shadow-focus"
          >
            <span className={`flex size-10 items-center justify-center rounded-control ${tone}`}>
              <Icon size={20} strokeWidth={1.6} aria-hidden />
            </span>
            <span className="text-base leading-6 font-semibold text-text-primary">{title}</span>
            <span className="-mt-2 text-[13px] leading-[18px] text-text-secondary">{description}</span>
          </Link>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader title="Frequently asked questions" />
          <div className="mt-3 divide-y divide-neutral-border border-t border-neutral-border">
            {faqs.map((f) => (
              <details key={f.q} className="group px-5 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm leading-5 font-semibold text-text-primary outline-none focus-visible:text-brand-700 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown size={18} strokeWidth={1.6} aria-hidden className="shrink-0 text-text-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm leading-5 text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <SupportTicketForm />
          <Card className="flex flex-col gap-3 p-5 sm:p-6">
            <h2 className="text-base leading-6 font-semibold text-text-primary">Visit the office</h2>
            <p className="flex items-start gap-2.5 text-sm leading-5 text-text-secondary">
              <MapPin size={18} strokeWidth={1.6} aria-hidden className="mt-px shrink-0 text-text-muted" />
              {society.headOffice}
            </p>
            <p className="flex items-start gap-2.5 text-sm leading-5 text-text-secondary">
              <Clock size={18} strokeWidth={1.6} aria-hidden className="mt-px shrink-0 text-text-muted" />
              Monday – Saturday, 9:30 AM – 5:30 PM
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
