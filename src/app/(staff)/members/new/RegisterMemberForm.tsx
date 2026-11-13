"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, FileText, Mail, Printer, Smartphone, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioOption } from "@/components/ui/RadioOption";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { UploadTile } from "@/components/ui/UploadTile";
import { iconProps } from "@/components/ui/icon";
import { registrationFees } from "@/lib/fees";
import { formatDate, formatINR, formatMobile, formatTime, maskAadhaar } from "@/lib/format";
import { currentStaff } from "@/lib/mock/staff";
import { nextMemberNumber } from "@/lib/mock/dashboard";
import { INDIAN_STATES } from "@/lib/states";
import {
  IMAGE_TYPES,
  memberRegistrationSchema,
  type MemberRegistration,
  type MemberRegistrationInput,
} from "@/lib/validation/member";

const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

const relationOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "sibling", label: "Brother / Sister" },
  { value: "other", label: "Other" },
];

const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

const documents = [
  { name: "photo", label: "Passport-size photograph", image: true },
  { name: "signature", label: "Signature", image: true },
  { name: "aadhaarDoc", label: "Aadhaar card", image: false },
  { name: "panDoc", label: "PAN card", image: false },
] as const;

/** What the success screen shows. Holds no raw Aadhaar. */
type Registered = {
  memberId: string;
  name: string;
  mobile: string;
  aadhaarMasked: string;
  shares: number;
  /** ISO timestamp of registration */
  at: string;
  receiptNo: string;
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="grid gap-5 p-5 sm:px-6 sm:pb-6 md:grid-cols-2">{children}</div>
    </Card>
  );
}

export function RegisterMemberForm() {
  const [registered, setRegistered] = useState<Registered | null>(null);
  const [memberNumber, setMemberNumber] = useState(nextMemberNumber);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberRegistrationInput, unknown, MemberRegistration>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      fullName: "",
      guardianName: "",
      dateOfBirth: "",
      occupation: "",
      mobile: "",
      email: "",
      aadhaar: "",
      pan: "",
      addressLine: "",
      city: "",
      state: "",
      pinCode: "",
      membershipType: "ordinary",
      shares: "1",
      nomineeName: "",
      bankAccount: "",
      ifsc: "",
      declaration: false,
    },
  });

  async function onSubmit(values: MemberRegistration) {
    // Mock: no members API yet. Never log or persist the raw Aadhaar number.
    await new Promise((r) => setTimeout(r, 700));
    const at = new Date();
    const ym = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}`;
    setRegistered({
      memberId: `JSK-M-${String(memberNumber).padStart(4, "0")}`,
      name: values.fullName,
      mobile: formatMobile(values.mobile),
      aadhaarMasked: maskAadhaar(values.aadhaar),
      shares: values.shares,
      at: at.toISOString(),
      receiptNo: `RCPT-${ym}-${String(memberNumber).padStart(4, "0")}`,
    });
    setMemberNumber((n) => n + 1);
    window.scrollTo({ top: 0 });
  }

  if (registered) {
    const fees = registrationFees(registered.shares);
    return (
      <Card className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-5 py-8 text-center sm:px-10 sm:py-10 print:border-0 print:shadow-none">
        <span className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-600 ring-8 ring-success-50/60 print:hidden">
          <CircleCheck size={32} strokeWidth={1.6} aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[28px] leading-9 font-bold text-text-primary">Member registered successfully</h2>
          <p className="text-sm leading-5 text-text-secondary">
            {registered.name} has been added to the register. Membership becomes active once the
            managing committee approves it.
          </p>
        </div>

        <div className="grid w-full gap-3 text-left sm:grid-cols-2">
          <div className="flex flex-col gap-0.5 rounded-control border border-brand-100 bg-brand-50 px-4 py-3.5">
            <span className="text-xs leading-4 text-text-secondary">Member ID</span>
            <span className="text-[22px] leading-[30px] font-bold text-brand-700">{registered.memberId}</span>
            <span className="text-xs leading-4 text-text-muted">
              {registered.mobile} · Aadhaar {registered.aadhaarMasked}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1.5 rounded-control border border-neutral-border bg-neutral-subtle px-4 py-3.5">
            <span className="text-xs leading-4 text-text-secondary">Membership status</span>
            <Badge tone="info" dot>
              Pending committee approval
            </Badge>
            <span className="text-xs leading-4 text-text-muted">KYC documents to be verified in person</span>
          </div>
        </div>

        <section
          aria-label="Fee receipt"
          className="flex w-full flex-col gap-2.5 rounded-control border border-dashed border-neutral-border-strong bg-neutral-subtle px-5 py-4 text-left"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm leading-5 font-semibold text-text-primary">
              <FileText size={18} strokeWidth={1.6} aria-hidden className="text-text-secondary" />
              Fee receipt
            </h3>
            <span className="text-xs leading-4 font-semibold text-text-secondary">{registered.receiptNo}</span>
          </div>
          <p className="text-xs leading-4 text-text-muted">
            {formatDate(registered.at)}, {formatTime(registered.at)} · Collected by {currentStaff.name}
          </p>
          <dl className="flex flex-col gap-2 border-t border-neutral-border pt-2.5 text-sm leading-5">
            {fees.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-4">
                <dt className="text-text-secondary">{l.label}</dt>
                <dd className="font-medium text-text-primary tabular-nums">{formatINR(l.amount)}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-neutral-border pt-2.5">
              <dt className="font-semibold text-text-primary">Total collected</dt>
              <dd className="text-[22px] leading-[30px] font-bold text-text-primary tabular-nums">{formatINR(fees.total)}</dd>
            </div>
          </dl>
        </section>

        <div className="grid w-full gap-3 sm:grid-cols-2 print:hidden">
          <Button onClick={() => window.print()} leadingIcon={<Printer {...iconProps} />}>
            Print receipt
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              setRegistered(null);
            }}
            leadingIcon={<UserPlus {...iconProps} />}
          >
            Register another member
          </Button>
        </div>
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-sm leading-5 font-semibold text-brand-600 hover:underline print:hidden"
        >
          <Users size={16} strokeWidth={1.6} aria-hidden />
          Back to members
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <Section title="Personal details" description="As printed on the applicant's Aadhaar card">
        <TextField
          label="Full name"
          required
          autoComplete="name"
          placeholder="e.g. Ramesh Kumar Verma"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextField
          label="Father's / spouse's name"
          required
          error={errors.guardianName?.message}
          {...register("guardianName")}
        />
        <TextField
          label="Date of birth"
          required
          type="date"
          helperText="Member must be at least 18 years old"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />
        <Select
          label="Gender"
          required
          placeholder="Select gender"
          options={genderOptions}
          error={errors.gender?.message}
          {...register("gender")}
        />
        <TextField
          label="Mobile number"
          required
          type="tel"
          inputMode="numeric"
          maxLength={10}
          prefix="+91"
          leadingIcon={<Smartphone {...iconProps} />}
          placeholder="98110 45672"
          helperText="OTPs and SMS alerts go to this number"
          error={errors.mobile?.message}
          {...register("mobile")}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          leadingIcon={<Mail {...iconProps} />}
          placeholder="Optional"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Occupation"
          placeholder="Optional"
          containerClassName="md:col-span-2"
          error={errors.occupation?.message}
          {...register("occupation")}
        />
      </Section>

      <Section title="KYC" description="Aadhaar is stored securely and only ever shown masked">
        <TextField
          label="Aadhaar number"
          required
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          placeholder="12-digit Aadhaar"
          className="tabular-nums"
          error={errors.aadhaar?.message}
          {...register("aadhaar")}
        />
        <TextField
          label="PAN"
          required
          autoComplete="off"
          maxLength={10}
          placeholder="ABCDE1234F"
          className="uppercase placeholder:normal-case"
          error={errors.pan?.message}
          {...register("pan")}
        />
      </Section>

      <Section title="Address" description="Current residential address">
        <TextField
          label="House no., street, locality"
          required
          autoComplete="street-address"
          containerClassName="md:col-span-2"
          error={errors.addressLine?.message}
          {...register("addressLine")}
        />
        <TextField
          label="City / village"
          required
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register("city")}
        />
        <Select
          label="State"
          required
          placeholder="Select state"
          options={stateOptions}
          error={errors.state?.message}
          {...register("state")}
        />
        <TextField
          label="PIN code"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          error={errors.pinCode?.message}
          {...register("pinCode")}
        />
      </Section>

      <Section title="Membership">
        <fieldset className="flex flex-col gap-2.5 md:col-span-2">
          <legend className="mb-1.5 text-[13px] leading-[18px] font-semibold text-text-primary">
            Membership type<span aria-hidden="true" className="ml-0.5 text-danger-600">*</span>
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            <RadioOption
              value="ordinary"
              label="Ordinary member"
              description="Voting rights; eligible for deposits and loans"
              {...register("membershipType")}
            />
            <RadioOption
              value="nominal"
              label="Nominal member"
              description="Deposits only; no voting rights"
              {...register("membershipType")}
            />
          </div>
          {errors.membershipType && (
            <p role="alert" className="text-[13px] leading-[18px] text-danger-600">
              {errors.membershipType.message}
            </p>
          )}
        </fieldset>
        <TextField
          label="Number of shares"
          required
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          error={errors.shares?.message}
          {...register("shares")}
        />
      </Section>

      <Section title="Nominee">
        <TextField
          label="Nominee name"
          required
          error={errors.nomineeName?.message}
          {...register("nomineeName")}
        />
        <Select
          label="Relation to member"
          required
          placeholder="Select relation"
          options={relationOptions}
          error={errors.nomineeRelation?.message}
          {...register("nomineeRelation")}
        />
      </Section>

      <Section title="Bank account" description="For loan disbursals and deposit payouts">
        <TextField
          label="Account number"
          required
          inputMode="numeric"
          autoComplete="off"
          maxLength={18}
          error={errors.bankAccount?.message}
          {...register("bankAccount")}
        />
        <TextField
          label="IFSC"
          required
          autoComplete="off"
          maxLength={11}
          placeholder="SBIN0001234"
          className="uppercase placeholder:normal-case"
          error={errors.ifsc?.message}
          {...register("ifsc")}
        />
      </Section>

      <Section title="Documents" description="PDF, JPG or PNG, up to 2 MB each">
        {documents.map((doc) => (
          <Controller
            key={doc.name}
            control={control}
            name={doc.name}
            render={({ field, fieldState }) => (
              <UploadTile
                label={doc.label}
                required
                name={field.name}
                accept={doc.image ? IMAGE_TYPES.join(",") : undefined}
                hint={doc.image ? "JPG or PNG · max 2 MB" : undefined}
                file={field.value ? { name: field.value.name, size: field.value.size } : null}
                onFileChange={(f) => field.onChange(f ?? undefined)}
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
      </Section>

      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <Checkbox
            label="I have verified the original KYC documents and the applicant's details are correct."
            error={!!errors.declaration}
            {...register("declaration")}
          />
          {errors.declaration && (
            <p role="alert" className="pl-7 text-[13px] leading-[18px] text-danger-600">
              {errors.declaration.message}
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-neutral-border pt-5 sm:flex-row sm:justify-end">
          <Link href="/dashboard" className={buttonClasses({ variant: "secondary" })}>
            Cancel
          </Link>
          <Button type="submit" loading={isSubmitting} leadingIcon={<UserPlus {...iconProps} />}>
            Register member
          </Button>
        </div>
      </Card>
    </form>
  );
}
