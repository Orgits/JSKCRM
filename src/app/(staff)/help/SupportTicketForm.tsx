"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldLabel, FieldMessage } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { iconProps } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

const CATEGORIES = ["Wrong entry / reversal", "Member data correction", "Login or access", "Report not matching", "Something else"] as const;

const ticketSchema = z.object({
  category: z.enum(CATEGORIES, { error: "Choose a category" }),
  subject: z.string().trim().min(5, "Add a short subject"),
  details: z.string().trim().min(20, "Describe the problem (at least 20 characters)"),
  reference: z.string().trim(),
});

type Ticket = z.infer<typeof ticketSchema>;

/** Raise a support ticket (mock — no ticketing API yet). Never ask for Aadhaar here. */
export function SupportTicketForm() {
  const [ticketNo, setTicketNo] = useState<string | null>(null);
  // Mock ticket numbering until the ticketing API exists.
  const [nextTicket, setNextTicket] = useState(1043);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Ticket>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", details: "", reference: "" },
  });

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 500));
    setTicketNo(`TKT-${nextTicket}`);
    setNextTicket((n) => n + 1);
    reset();
  }

  if (ticketNo) {
    return (
      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success-600">
          <CircleCheck size={24} strokeWidth={1.6} aria-hidden />
        </span>
        <h2 className="text-base leading-6 font-semibold text-text-primary">Ticket {ticketNo} raised</h2>
        <p className="text-[13px] leading-[18px] text-text-secondary">The admin team usually replies within one working day.</p>
        <Button variant="secondary" size="md" onClick={() => setTicketNo(null)}>
          Raise another
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Raise a ticket" description="For corrections, reversals and access problems" />
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5 sm:px-6 sm:pb-6">
        <Select
          label="Category"
          required
          placeholder="Select"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          error={errors.category?.message}
          {...register("category")}
        />
        <TextField label="Subject" required placeholder="e.g. Deposit posted to wrong account" error={errors.subject?.message} {...register("subject")} />
        <TextField label="Transaction / member ID" placeholder="TXN-80412 or JSK-M-0412" {...register("reference")} />
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="ticket-details" required>
            Details
          </FieldLabel>
          <textarea
            id="ticket-details"
            rows={4}
            aria-invalid={errors.details ? true : undefined}
            placeholder="What happened, and what should it be? Don't include Aadhaar numbers."
            className={cn(
              "w-full rounded-control border bg-neutral-surface px-3.5 py-2.5 text-sm leading-5 text-text-primary outline-none placeholder:text-text-muted focus:border-brand-600 focus:shadow-focus",
              errors.details ? "border-danger-600" : "border-neutral-border-strong",
            )}
            {...register("details")}
          />
          {errors.details?.message && <FieldMessage error>{errors.details.message}</FieldMessage>}
        </div>
        <Button type="submit" size="md" loading={isSubmitting} leadingIcon={<Send {...iconProps} />}>
          Send to admin team
        </Button>
      </form>
    </Card>
  );
}
