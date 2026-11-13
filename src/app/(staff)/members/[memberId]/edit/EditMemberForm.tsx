"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Lock, Save } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { formatTime } from "@/lib/format";
import { memberEditSchema, type MemberEdit, type MemberEditInput } from "@/lib/validation/member";

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <div className="grid gap-5 p-5 sm:px-6 sm:pb-6 md:grid-cols-2">{children}</div>
    </Card>
  );
}

/** Edit member — contact, address, nominee and bank. KYC identity stays read-only (re-KYC only). */
export function EditMemberForm({
  memberId,
  identity,
  accountLast4,
  defaults,
}: {
  memberId: string;
  identity: { label: string; value: string }[];
  accountLast4: string;
  defaults: MemberEditInput;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<MemberEditInput, unknown, MemberEdit>({ resolver: zodResolver(memberEditSchema), defaultValues: defaults });

  async function onSubmit(values: MemberEdit) {
    await new Promise((r) => setTimeout(r, 600)); // Mock: no members API yet.
    reset({ ...values, newBankAccount: "", reason: "" });
    setSavedAt(formatTime(new Date()));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {savedAt && (
        <p role="status" className="flex flex-wrap items-center gap-2 rounded-control border border-success-600/20 bg-success-50 px-4 py-3 text-sm leading-5 font-medium text-success-600">
          <CircleCheck size={18} strokeWidth={1.6} aria-hidden />
          Changes saved at {savedAt} and recorded in the member&apos;s activity log.
          <Link href={`/members/${memberId}`} className="ml-auto font-semibold underline-offset-2 hover:underline">
            Back to profile
          </Link>
        </p>
      )}

      <Card>
        <CardHeader
          title="Identity & KYC"
          description="These match the member's Aadhaar and PAN. To change them, re-verify KYC with the original documents."
          action={<Lock size={18} strokeWidth={1.6} aria-hidden className="text-text-muted" />}
        />
        <dl className="grid gap-px overflow-hidden border-t border-neutral-border bg-neutral-border sm:grid-cols-2 xl:grid-cols-5 mt-4 rounded-b-card">
          {identity.map((f) => (
            <div key={f.label} className="flex flex-col gap-0.5 bg-neutral-subtle px-5 py-3.5">
              <dt className="text-xs leading-4 font-medium text-text-muted">{f.label}</dt>
              <dd className="text-sm leading-5 font-semibold text-text-primary tabular-nums">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Section title="Contact">
        <TextField label="Mobile" required prefix="+91" inputMode="numeric" maxLength={10} error={errors.mobile?.message} helperText="OTP for the member portal goes here" {...register("mobile")} />
        <TextField label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <TextField label="Occupation" containerClassName="md:col-span-2" {...register("occupation")} />
      </Section>

      <Section title="Address">
        <TextField label="House / street" required containerClassName="md:col-span-2" error={errors.addressLine?.message} {...register("addressLine")} />
        <TextField label="Locality / village" required error={errors.locality?.message} {...register("locality")} />
        <TextField label="City" required error={errors.city?.message} {...register("city")} />
        <TextField label="PIN code" required inputMode="numeric" maxLength={6} error={errors.pinCode?.message} {...register("pinCode")} />
      </Section>

      <Section title="Nominee">
        <TextField label="Nominee name" required error={errors.nomineeName?.message} {...register("nomineeName")} />
        <TextField label="Relation" required error={errors.nomineeRelation?.message} {...register("nomineeRelation")} />
      </Section>

      <Section title="Bank account" description="For loan disbursals and withdrawals by transfer">
        <TextField label="Bank" required error={errors.bankName?.message} {...register("bankName")} />
        <TextField label="Branch" {...register("bankBranch")} />
        <TextField label="IFSC" required className="uppercase" error={errors.ifsc?.message} {...register("ifsc")} />
        <TextField
          label="New account number"
          inputMode="numeric"
          placeholder={`On file: XXXX${accountLast4}`}
          helperText="Leave blank to keep the account on file"
          error={errors.newBankAccount?.message}
          {...register("newBankAccount")}
        />
      </Section>

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:p-6">
        <TextField
          label="Reason for change"
          required
          placeholder="e.g. Member shifted house; new mobile number"
          containerClassName="flex-1"
          error={errors.reason?.message}
          {...register("reason")}
        />
        <div className="flex gap-3">
          <Link href={`/members/${memberId}`} className={buttonClasses({ variant: "secondary", size: "lg" })}>
            Cancel
          </Link>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty} leadingIcon={<Save {...iconProps} />}>
            Save changes
          </Button>
        </div>
      </Card>
    </form>
  );
}
