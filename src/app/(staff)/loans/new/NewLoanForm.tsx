"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, HandCoins, Send, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioOption } from "@/components/ui/RadioOption";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { LOAN_PRODUCTS, loanQuote, processingFee, productFor } from "@/lib/loan";
import { formatDate, formatINR } from "@/lib/format";
import { MAX_GUARANTEES_PER_MEMBER } from "@/lib/mock/member-profiles";
import {
  loanApplicationSchema,
  type LoanApplicationInput,
  type LoanApplicationValues,
} from "@/lib/validation/loan";

export type BorrowerOption = {
  id: string;
  name: string;
  kycVerified: boolean;
  deposits: number;
  loanOutstanding: number;
  overdueEmis: number;
  guaranteesGiven: number;
};

/** Mock: next number in the LN-YYYY-0000 series (the dashboard's latest is LN-2026-0418). */
const NEXT_LOAN_NUMBER = 419;

function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-[13px] leading-[18px] text-text-secondary">{label}</dt>
      <dd className={strong ? "text-base leading-6 font-bold text-text-primary tabular-nums" : "text-sm leading-5 font-semibold text-text-primary tabular-nums"}>
        {value}
      </dd>
    </div>
  );
}

export function NewLoanForm({ members }: { members: BorrowerOption[] }) {
  const preselected = useSearchParams().get("member") ?? "";
  const [submitted, setSubmitted] = useState<{ loanNo: string; name: string; amount: number; purpose: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoanApplicationInput, unknown, LoanApplicationValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      memberId: members.some((m) => m.id === preselected) ? preselected : "",
      purpose: "Personal",
      amount: "",
      tenureMonths: "24",
      details: "",
      guarantor1: "",
      guarantor2: "",
      declaration: false,
    },
  });

  const [memberId, purpose, amountRaw, tenureRaw] = useWatch({ control, name: ["memberId", "purpose", "amount", "tenureMonths"] });
  const product = productFor(purpose);
  const amount = Number(amountRaw) || 0;
  const tenure = Number(tenureRaw) || 0;
  const quote = loanQuote(Math.min(amount, product.maxAmount), product.rate, tenure);
  const borrower = members.find((m) => m.id === memberId);

  const borrowerOptions = members.map((m) => ({
    value: m.id,
    label: `${m.name} · ${m.id}${m.kycVerified ? "" : " (KYC pending)"}`,
    disabled: !m.kycVerified,
  }));
  const guarantorOptions = members.map((m) => {
    const full = m.guaranteesGiven >= MAX_GUARANTEES_PER_MEMBER;
    return {
      value: m.id,
      label: `${m.name} · ${m.id}${full ? " (guarantee limit reached)" : !m.kycVerified ? " (KYC pending)" : ""}`,
      disabled: full || !m.kycVerified || m.id === memberId,
    };
  });

  async function onSubmit(values: LoanApplicationValues) {
    await new Promise((r) => setTimeout(r, 600)); // Mock: no loans API yet.
    const name = members.find((m) => m.id === values.memberId)?.name ?? values.memberId;
    setSubmitted({
      loanNo: `LN-${new Date().getFullYear()}-${String(NEXT_LOAN_NUMBER).padStart(4, "0")}`,
      name,
      amount: values.amount,
      purpose: values.purpose,
    });
    window.scrollTo({ top: 0 });
  }

  if (submitted) {
    return (
      <Card className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-6 py-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-600 ring-8 ring-success-50/60">
          <CircleCheck size={32} strokeWidth={1.6} aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[22px] leading-[30px] font-bold text-text-primary">Application submitted</h2>
          <p className="text-sm leading-5 text-text-secondary">
            {submitted.purpose} loan of {formatINR(submitted.amount)} for {submitted.name} is now with document verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm leading-5 font-semibold text-text-primary tabular-nums">{submitted.loanNo}</span>
          <Badge tone="info" dot>
            New · {formatDate(new Date())}
          </Badge>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/loans" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Back to loans
          </Link>
          <Button
            size="md"
            onClick={() => {
              reset();
              setSubmitted(null);
            }}
          >
            New application
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Card>
          <CardHeader title="Borrower" description="Search by name or member ID" />
          <div className="flex flex-col gap-4 p-5 sm:px-6 sm:pb-6">
            <Select label="Member" required placeholder="Select member" options={borrowerOptions} error={errors.memberId?.message} {...register("memberId")} />
            {borrower && (
              <dl className="grid gap-px overflow-hidden rounded-control border border-neutral-border bg-neutral-border sm:grid-cols-3">
                {[
                  { label: "Deposits", value: formatINR(borrower.deposits) },
                  { label: "Existing loans", value: formatINR(borrower.loanOutstanding) },
                  { label: "Guarantees given", value: `${borrower.guaranteesGiven} of ${MAX_GUARANTEES_PER_MEMBER}` },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col gap-0.5 bg-neutral-subtle px-4 py-3">
                    <dt className="text-xs leading-4 font-medium text-text-muted">{s.label}</dt>
                    <dd className="text-sm leading-5 font-semibold text-text-primary tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {borrower && borrower.overdueEmis > 0 && (
              <p role="alert" className="flex items-start gap-2 rounded-control bg-warning-50 px-3.5 py-2.5 text-[13px] leading-[18px] text-warning-600">
                <TriangleAlert size={16} strokeWidth={1.6} aria-hidden className="mt-px shrink-0" />
                {borrower.name} has {borrower.overdueEmis} overdue EMI{borrower.overdueEmis > 1 ? "s" : ""}. The committee will see this on the application.
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Loan details" description="Rate and limits come from the society's loan policy" />
          <div className="flex flex-col gap-5 p-5 sm:px-6 sm:pb-6">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[13px] leading-[18px] font-semibold text-text-primary">
                Loan type<span aria-hidden className="ml-0.5 text-danger-600">*</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {LOAN_PRODUCTS.map((p) => (
                  <RadioOption
                    key={p.purpose}
                    value={p.purpose}
                    label={`${p.purpose} · ${p.rate}%`}
                    description={`${p.description}. Up to ${formatINR(p.maxAmount)}`}
                    {...register("purpose", {
                      // Keep tenure valid for the new loan type.
                      onChange: (e) => {
                        const next = productFor(e.target.value);
                        if (!next.tenures.includes(Number(getValues("tenureMonths")))) {
                          setValue("tenureMonths", String(next.tenures[0]));
                        }
                      },
                    })}
                  />
                ))}
              </div>
            </fieldset>
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Loan amount"
                required
                inputMode="numeric"
                prefix="₹"
                placeholder="1,00,000"
                helperText={`Maximum ${formatINR(product.maxAmount)}`}
                error={errors.amount?.message}
                {...register("amount")}
              />
              <Select
                label="Tenure"
                required
                options={product.tenures.map((t) => ({ value: String(t), label: `${t} months` }))}
                error={errors.tenureMonths?.message}
                {...register("tenureMonths")}
              />
              <TextField
                label="Purpose in brief"
                required
                placeholder="e.g. Stock for Diwali season at the shop"
                containerClassName="md:col-span-2"
                error={errors.details?.message}
                {...register("details")}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Guarantors"
            description={`${product.purpose} loans need ${product.guarantors} member guarantor${product.guarantors > 1 ? "s" : ""}`}
          />
          <div className="grid gap-5 p-5 sm:px-6 sm:pb-6 md:grid-cols-2">
            <Select label="Guarantor 1" required placeholder="Select member" options={guarantorOptions} error={errors.guarantor1?.message} {...register("guarantor1")} />
            {product.guarantors > 1 && (
              <Select label="Guarantor 2" required placeholder="Select member" options={guarantorOptions} error={errors.guarantor2?.message} {...register("guarantor2")} />
            )}
          </div>
        </Card>

        <Checkbox
          label="I have checked the borrower's and guarantors' KYC, income proof and signed consent forms."
          error={!!errors.declaration}
          {...register("declaration")}
        />
        {errors.declaration && <p role="alert" className="-mt-4 text-[13px] leading-[18px] text-danger-600">{errors.declaration.message}</p>}
      </div>

      <Card className="flex flex-col gap-4 p-5 lg:sticky lg:top-24 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-control bg-accent-50 text-accent-600">
            <HandCoins {...iconProps} />
          </span>
          <div>
            <h2 className="text-base leading-6 font-semibold text-text-primary">Repayment estimate</h2>
            <p className="text-xs leading-4 text-text-muted">{product.rate}% p.a. reducing balance</p>
          </div>
        </div>
        <div className="rounded-control bg-brand-50 px-4 py-3.5">
          <p className="text-xs leading-4 font-medium text-brand-700">Monthly EMI</p>
          <p className="text-[28px] leading-[34px] font-bold text-brand-700 tabular-nums">{formatINR(quote.emi)}</p>
          <p className="text-xs leading-4 text-brand-700">for {tenure} months</p>
        </div>
        <dl className="divide-y divide-neutral-border">
          <Row label="Loan amount" value={formatINR(Math.min(amount, product.maxAmount))} />
          <Row label="Total interest" value={formatINR(quote.totalInterest)} />
          <Row label="Processing fee (1%)" value={formatINR(amount ? processingFee(amount) : 0)} />
          <Row label="Total repayable" value={formatINR(quote.totalPayable)} strong />
        </dl>
        <Button type="submit" fullWidth loading={isSubmitting} leadingIcon={<Send {...iconProps} />}>
          Submit application
        </Button>
        <p className="text-center text-xs leading-4 text-text-muted">Goes to document verification, then the loan committee.</p>
      </Card>
    </form>
  );
}
