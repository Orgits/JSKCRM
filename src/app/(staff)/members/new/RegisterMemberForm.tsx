"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Mail, Smartphone, UserPlus } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioOption } from "@/components/ui/RadioOption";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { UploadTile } from "@/components/ui/UploadTile";
import { iconProps } from "@/components/ui/icon";
import { formatMobile, maskAadhaar } from "@/lib/format";
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
type Registered = { memberId: string; name: string; mobile: string; aadhaarMasked: string };

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
    setRegistered({
      memberId: `JSK-M-${String(memberNumber).padStart(4, "0")}`,
      name: values.fullName,
      mobile: formatMobile(values.mobile),
      aadhaarMasked: maskAadhaar(values.aadhaar),
    });
    setMemberNumber((n) => n + 1);
    window.scrollTo({ top: 0 });
  }

  if (registered) {
    return (
      <Card className="flex flex-col items-center gap-5 px-6 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CircleCheck size={28} strokeWidth={1.6} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-[22px] leading-[30px] font-bold text-text-primary">Member registered</h2>
          <p className="text-sm leading-5 text-text-secondary">
            {registered.name} has been added to the society register.
          </p>
        </div>
        <dl className="grid w-full max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-control border border-neutral-border bg-neutral-subtle p-4 text-left text-sm leading-5">
          <dt className="text-text-secondary">Member ID</dt>
          <dd className="font-semibold text-text-primary">{registered.memberId}</dd>
          <dt className="text-text-secondary">Mobile</dt>
          <dd className="text-text-primary">{registered.mobile}</dd>
          <dt className="text-text-secondary">Aadhaar</dt>
          <dd className="text-text-primary tabular-nums">{registered.aadhaarMasked}</dd>
        </dl>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              reset();
              setRegistered(null);
            }}
          >
            Register another member
          </Button>
          <Link href="/dashboard" className={buttonClasses({ size: "md" })}>
            Go to dashboard
          </Link>
        </div>
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
