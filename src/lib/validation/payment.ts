import { z } from "zod";
import { MEMBER_ID } from "./patterns";

export const PAYMENT_KINDS = ["deposit", "withdrawal", "emi"] as const;
export const PAYMENT_MODES = ["Cash", "UPI", "Cheque", "Transfer"] as const;

/**
 * Record payment at the counter. Balance and account-type checks need the member's accounts,
 * so the form does those on submit.
 */
export const paymentSchema = z
  .object({
    kind: z.enum(PAYMENT_KINDS),
    memberId: z.string().regex(MEMBER_ID, "Select the member"),
    account: z.string().min(1, "Select the account or loan"),
    amount: z.coerce
      .number<string>({ error: "Enter the amount" })
      .int("Whole rupees only")
      .positive("Enter the amount")
      .max(1_000_000, "Amounts over ₹10,00,000 need the branch manager"),
    mode: z.enum(PAYMENT_MODES),
    reference: z.string().trim(),
    remarks: z.string().trim().max(120, "Keep remarks under 120 characters"),
  })
  .superRefine((v, ctx) => {
    if (v.mode !== "Cash" && v.reference.length < 4) {
      ctx.addIssue({
        code: "custom",
        path: ["reference"],
        message: v.mode === "Cheque" ? "Enter the cheque number" : "Enter the UPI / bank reference",
      });
    }
    if (v.kind === "withdrawal" && v.mode === "Cash" && v.amount > 20000) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Cash withdrawals above ₹20,000 must be paid by transfer or cheque" });
    }
  });

export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentValues = z.output<typeof paymentSchema>;
