"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Building2, CircleCheck, Bell, Percent, Receipt, Save, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { formatTime } from "@/lib/format";

type Props = {
  society: { legalName: string; headOffice: string };
  loanProducts: { purpose: string; rate: number; maxAmount: number }[];
  fees: { id: string; label: string; amount: number }[];
};

const sections: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "society", label: "Society profile", icon: Building2 },
  { id: "rates", label: "Interest rates", icon: Percent },
  { id: "fees", label: "Fees & charges", icon: Receipt },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
];

/** Mock deposit rates — confirm with the society's board resolution. */
const depositRates = [
  { id: "savings", label: "Savings", rate: 4 },
  { id: "thrift", label: "Compulsory thrift", rate: 5 },
  { id: "rd", label: "Recurring deposit", rate: 6.5 },
  { id: "fd", label: "Fixed deposit (2 years)", rate: 7.5 },
];

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader title={title} description={description} />
      <div className="p-5 sm:px-6 sm:pb-6">{children}</div>
    </Card>
  );
}

/**
 * Settings (mock): values save locally only — wire each section to the settings API.
 * Rate changes should take effect for new loans / deposits only.
 */
export function SettingsForm({ society, loanProducts, fees }: Props) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSavedAt(formatTime(new Date()));
  }

  return (
    <form onSubmit={onSubmit} onChange={() => setSavedAt(null)} className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
        {sections.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="flex h-10 shrink-0 items-center gap-2.5 rounded-control px-3 text-sm leading-5 font-medium text-text-secondary outline-none hover:bg-neutral-surface hover:text-text-primary focus-visible:shadow-focus"
          >
            <Icon size={18} strokeWidth={1.6} aria-hidden />
            {label}
          </a>
        ))}
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
        <Section id="society" title="Society profile" description="Printed on receipts, passbooks and statements">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField label="Registered name" value={society.legalName} readOnly helperText="Changes need the Registrar's approval" containerClassName="md:col-span-2" />
            <TextField label="Registration no." placeholder="As on the registration certificate" required />
            <TextField label="Head office" defaultValue={society.headOffice} required />
            <TextField label="Office phone" type="tel" prefix="+91" placeholder="Landline or mobile" />
            <TextField label="Office email" type="email" placeholder="Shown on statements" />
            <TextField label="Address" placeholder="Registered office address" required containerClassName="md:col-span-2" />
          </div>
        </Section>

        <Section id="rates" title="Interest rates" description="% per year. New rates apply to new loans and deposits only.">
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] leading-[18px] font-semibold text-text-primary">Loans (reducing balance)</h3>
              {loanProducts.map((p) => (
                <div key={p.purpose} className="grid grid-cols-[1fr_96px_140px] items-center gap-3">
                  <span className="text-sm leading-5 text-text-secondary">{p.purpose}</span>
                  <TextField size="md" aria-label={`${p.purpose} loan rate`} type="number" step="0.25" min="0" max="24" defaultValue={p.rate} trailingIcon={<span className="text-sm">%</span>} />
                  <TextField size="md" aria-label={`${p.purpose} loan limit`} type="number" min="0" step="1000" defaultValue={p.maxAmount} prefix="₹" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-[13px] leading-[18px] font-semibold text-text-primary">Deposits</h3>
              {depositRates.map((d) => (
                <div key={d.id} className="grid grid-cols-[1fr_96px] items-center gap-3">
                  <span className="text-sm leading-5 text-text-secondary">{d.label}</span>
                  <TextField size="md" aria-label={`${d.label} rate`} type="number" step="0.25" min="0" max="15" defaultValue={d.rate} trailingIcon={<span className="text-sm">%</span>} />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="fees" title="Fees & charges" description="Collected at registration — shown on the admission receipt">
          <div className="grid gap-5 md:grid-cols-2">
            {fees.map((f) => (
              <TextField key={f.id} label={f.label} type="number" min="0" prefix="₹" defaultValue={f.amount} required />
            ))}
            <TextField label="Loan processing fee" type="number" min="0" step="0.25" defaultValue={1} trailingIcon={<span className="text-sm">%</span>} helperText="Minimum ₹250" />
            <TextField label="Late EMI penalty" type="number" min="0" step="0.5" defaultValue={2} trailingIcon={<span className="text-sm">% p.m.</span>} helperText="On the overdue instalment" />
          </div>
        </Section>

        <Section id="notifications" title="Notifications" description="SMS and email sent to members and staff">
          <div className="flex flex-col gap-4">
            <Checkbox label="SMS the member after every transaction" description="Amount, account and new balance" defaultChecked />
            <Checkbox label="EMI reminder 3 days before the due date" defaultChecked />
            <Checkbox label="Alert guarantors when an EMI is 30 days overdue" defaultChecked />
            <Checkbox label="Daily cash summary email to the branch manager" description="Sent at 6:00 PM" />
          </div>
        </Section>

        <Section id="security" title="Security" description="Applies to every staff login">
          <div className="grid gap-5 md:grid-cols-2">
            <Select
              label="Sign out after inactivity"
              defaultValue="30"
              options={[
                { value: "15", label: "15 minutes" },
                { value: "30", label: "30 minutes" },
                { value: "60", label: "1 hour" },
              ]}
            />
            <Select
              label="Withdrawals needing manager approval"
              defaultValue="50000"
              options={[
                { value: "20000", label: "Above ₹20,000" },
                { value: "50000", label: "Above ₹50,000" },
                { value: "100000", label: "Above ₹1,00,000" },
              ]}
            />
            <Checkbox label="Ask for an OTP on every login" description="Sent to the staff member's registered mobile" defaultChecked className="md:col-span-2" />
          </div>
        </Section>

        <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-card border border-neutral-border bg-neutral-surface px-5 py-3 shadow-elevated">
          {savedAt && (
            <p role="status" className="mr-auto flex items-center gap-1.5 text-sm leading-5 font-medium text-success-600">
              <CircleCheck size={16} strokeWidth={1.6} aria-hidden />
              Saved at {savedAt}
            </p>
          )}
          <Button type="reset" variant="ghost" size="md" onClick={() => setSavedAt(null)}>
            Discard changes
          </Button>
          <Button type="submit" size="md" loading={saving} leadingIcon={<Save {...iconProps} />}>
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
