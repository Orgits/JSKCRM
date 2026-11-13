"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownLeft, ArrowUpRight, CircleCheck, HandCoins, Printer, Receipt } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { RadioOption } from "@/components/ui/RadioOption";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { formatDate, formatINR, formatTime } from "@/lib/format";
import type { DepositAccountType, Loan } from "@/lib/mock/member-profiles";
import { currentStaff } from "@/lib/mock/staff";
import { nextTxnNumber } from "@/lib/mock/transactions";
import { society } from "@/lib/society";
import {
  PAYMENT_KINDS,
  PAYMENT_MODES,
  paymentSchema,
  type PaymentInput,
  type PaymentValues,
} from "@/lib/validation/payment";

export type PayerOption = {
  id: string;
  name: string;
  accounts: { accountNo: string; type: DepositAccountType; balance: number }[];
  loans: { loanNo: string; purpose: Loan["purpose"]; emi: number; outstanding: number; overdueEmis: number }[];
};

type Kind = (typeof PAYMENT_KINDS)[number];

const kinds: { value: Kind; label: string; description: string; icon: ReactNode }[] = [
  { value: "deposit", label: "Deposit", description: "Savings, thrift or RD", icon: <ArrowDownLeft {...iconProps} /> },
  { value: "withdrawal", label: "Withdrawal", description: "From savings only", icon: <ArrowUpRight {...iconProps} /> },
  { value: "emi", label: "EMI repayment", description: "Against an active loan", icon: <HandCoins {...iconProps} /> },
];

type Target = { id: string; label: string; balance: number; emi?: number; isLoan: boolean };

/** What the member can pay into / draw from for each kind of transaction. */
function targetsFor(member: PayerOption | undefined, kind: Kind): Target[] {
  if (!member) return [];
  if (kind === "emi") {
    return member.loans.map((l) => ({
      id: l.loanNo,
      label: `${l.loanNo} · ${l.purpose} · EMI ${formatINR(l.emi)}${l.overdueEmis ? ` · ${l.overdueEmis} overdue` : ""}`,
      balance: l.outstanding,
      emi: l.emi,
      isLoan: true,
    }));
  }
  return member.accounts
    .filter((a) => (kind === "withdrawal" ? a.type === "Savings" : a.type !== "Fixed deposit"))
    .map((a) => ({ id: a.accountNo, label: `${a.accountNo} · ${a.type} · ${formatINR(a.balance)}`, balance: a.balance, isLoan: false }));
}

type Posted = PaymentValues & { txnId: string; memberName: string; at: string; before: number; after: number };

function ReceiptRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm leading-5">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-right font-semibold text-text-primary tabular-nums">{value}</dd>
    </div>
  );
}

export function RecordPaymentForm({ members }: { members: PayerOption[] }) {
  const params = useSearchParams();
  const preMember = params.get("member") ?? "";
  const preKind = PAYMENT_KINDS.find((k) => k === params.get("type")) ?? "deposit";
  const [posted, setPosted] = useState<Posted | null>(null);
  const [txnNumber, setTxnNumber] = useState(nextTxnNumber);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PaymentInput, unknown, PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      kind: preKind,
      memberId: members.some((m) => m.id === preMember) ? preMember : "",
      account: "",
      amount: "",
      mode: "Cash",
      reference: "",
      remarks: "",
    },
  });

  const [kind, memberId, account, amountRaw, mode] = useWatch({ control, name: ["kind", "memberId", "account", "amount", "mode"] });
  const member = members.find((m) => m.id === memberId);
  const targets = targetsFor(member, kind);
  const target = targets.find((t) => t.id === account);
  const amount = Number(amountRaw) || 0;
  const after = target ? (kind === "deposit" ? target.balance + amount : target.balance - amount) : 0;

  /** Changing member or kind invalidates the chosen account; preselect when there's only one. */
  function resetAccount(nextMember: string, nextKind: Kind) {
    const options = targetsFor(members.find((m) => m.id === nextMember), nextKind);
    const only = options.length === 1 ? options[0] : undefined;
    setValue("account", only?.id ?? "");
    setValue("amount", only?.emi ? String(only.emi) : "");
  }

  async function onSubmit(values: PaymentValues) {
    const t = targetsFor(members.find((m) => m.id === values.memberId), values.kind).find((x) => x.id === values.account);
    if (!t) {
      setError("account", { message: "Select the account or loan" });
      return;
    }
    if (values.kind === "withdrawal" && values.amount > t.balance) {
      setError("amount", { message: `Only ${formatINR(t.balance)} is available in ${t.id}` });
      return;
    }
    if (values.kind === "emi" && values.amount > t.balance) {
      setError("amount", { message: `Loan outstanding is ${formatINR(t.balance)} — use foreclosure for a full payoff` });
      return;
    }
    await new Promise((r) => setTimeout(r, 500)); // Mock: no transactions API yet.
    setPosted({
      ...values,
      txnId: `TXN-${txnNumber}`,
      memberName: members.find((m) => m.id === values.memberId)?.name ?? values.memberId,
      at: new Date().toISOString(),
      before: t.balance,
      after: values.kind === "deposit" ? t.balance + values.amount : t.balance - values.amount,
    });
    setTxnNumber((n) => n + 1);
    window.scrollTo({ top: 0 });
  }

  if (posted) {
    const isLoan = posted.kind === "emi";
    return (
      <Card className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-8 sm:px-8 print:border-0 print:shadow-none">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600 print:hidden">
            <CircleCheck size={28} strokeWidth={1.6} aria-hidden />
          </span>
          <p className="font-serif text-base leading-6 font-semibold text-text-primary">{society.legalName}</p>
          <h2 className="text-[22px] leading-[30px] font-bold text-text-primary">
            {posted.kind === "withdrawal" ? "Payment voucher" : "Payment receipt"}
          </h2>
          <p className="text-[28px] leading-[34px] font-bold text-text-primary tabular-nums">{formatINR(posted.amount)}</p>
        </div>
        <dl className="divide-y divide-neutral-border border-y border-neutral-border">
          <ReceiptRow label="Receipt no." value={`RCPT-${posted.txnId.replace("TXN-", "")}`} />
          <ReceiptRow label="Date & time" value={`${formatDate(posted.at)}, ${formatTime(posted.at)}`} />
          <ReceiptRow label="Member" value={`${posted.memberName} (${posted.memberId})`} />
          <ReceiptRow label={isLoan ? "Loan" : "Account"} value={posted.account} />
          <ReceiptRow label="Type" value={kinds.find((k) => k.value === posted.kind)?.label} />
          <ReceiptRow label="Mode" value={posted.reference ? `${posted.mode} · ${posted.reference}` : posted.mode} />
          <ReceiptRow label={isLoan ? "Outstanding after" : "Balance after"} value={formatINR(posted.after)} />
          <ReceiptRow label="Received by" value={`${currentStaff.name}, ${currentStaff.branch}`} />
        </dl>
        <div className="flex flex-wrap justify-center gap-3 print:hidden">
          <Button variant="secondary" size="md" leadingIcon={<Printer {...iconProps} />} onClick={() => window.print()}>
            Print receipt
          </Button>
          <Link href={`/members/${posted.memberId}`} className={buttonClasses({ variant: "secondary", size: "md" })}>
            View member
          </Link>
          <Button
            size="md"
            leadingIcon={<Receipt {...iconProps} />}
            onClick={() => {
              reset({ ...getValues(), memberId: "", account: "", amount: "", reference: "", remarks: "" });
              setPosted(null);
            }}
          >
            Next payment
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader title="Transaction" />
          <div className="flex flex-col gap-5 p-5 sm:px-6 sm:pb-6">
            <fieldset className="grid gap-3 sm:grid-cols-3">
              <legend className="sr-only">Transaction type</legend>
              {kinds.map((k) => (
                <RadioOption
                  key={k.value}
                  value={k.value}
                  label={k.label}
                  description={k.description}
                  icon={k.icon}
                  {...register("kind", { onChange: (e) => resetAccount(getValues("memberId"), e.target.value) })}
                />
              ))}
            </fieldset>
            <div className="grid gap-5 md:grid-cols-2">
              <Select
                label="Member"
                required
                placeholder="Select member"
                options={members.map((m) => ({ value: m.id, label: `${m.name} · ${m.id}` }))}
                error={errors.memberId?.message}
                {...register("memberId", { onChange: (e) => resetAccount(e.target.value, getValues("kind")) })}
              />
              <Select
                key={`${memberId}-${kind}`}
                label={kind === "emi" ? "Loan" : "Account"}
                required
                disabled={!member}
                placeholder={!member ? "Select a member first" : targets.length ? "Select" : kind === "emi" ? "No active loans" : "No eligible account"}
                options={targets.map((t) => ({ value: t.id, label: t.label }))}
                error={errors.account?.message}
                {...register("account", {
                  onChange: (e) => {
                    const t = targets.find((x) => x.id === e.target.value);
                    if (t?.emi) setValue("amount", String(t.emi));
                  },
                })}
              />
              <TextField label="Amount" required inputMode="numeric" prefix="₹" placeholder="5,000" error={errors.amount?.message} {...register("amount")} />
              <Select label="Mode" required options={PAYMENT_MODES.map((m) => ({ value: m, label: m }))} {...register("mode")} />
              {mode !== "Cash" && (
                <TextField
                  label={mode === "Cheque" ? "Cheque no." : "UPI / bank reference"}
                  required
                  placeholder={mode === "Cheque" ? "204518" : "6278 1934 0021"}
                  error={errors.reference?.message}
                  {...register("reference")}
                />
              )}
              <TextField
                label="Remarks"
                placeholder="Optional — e.g. October instalment"
                containerClassName={mode === "Cash" ? "md:col-span-2" : undefined}
                error={errors.remarks?.message}
                {...register("remarks")}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-4 p-5 lg:sticky lg:top-24 sm:p-6">
        <h2 className="text-base leading-6 font-semibold text-text-primary">Summary</h2>
        <dl className="divide-y divide-neutral-border">
          <ReceiptRow label="Member" value={member?.name ?? "—"} />
          <ReceiptRow label={kind === "emi" ? "Loan" : "Account"} value={target?.id ?? "—"} />
          <ReceiptRow label={kind === "emi" ? "Outstanding now" : "Balance now"} value={target ? formatINR(target.balance) : "—"} />
          <ReceiptRow
            label={kind === "emi" ? "Outstanding after" : "Balance after"}
            value={
              target ? <span className={cn(after < 0 && "text-danger-600")}>{after < 0 ? "−" : ""}{formatINR(Math.abs(after))}</span> : "—"
            }
          />
        </dl>
        <div className="rounded-control bg-brand-50 px-4 py-3.5">
          <p className="text-xs leading-4 font-medium text-brand-700">{kind === "withdrawal" ? "Pay out" : "Collect"}</p>
          <p className="text-[28px] leading-[34px] font-bold text-brand-700 tabular-nums">{formatINR(amount)}</p>
          <p className="text-xs leading-4 text-brand-700">by {mode}</p>
        </div>
        <Button type="submit" fullWidth loading={isSubmitting} leadingIcon={<Receipt {...iconProps} />}>
          Post &amp; print receipt
        </Button>
      </Card>
    </form>
  );
}
