import { z } from "zod";
import { LOAN_PRODUCTS } from "@/lib/loan";
import { MEMBER_ID } from "./patterns";

const PURPOSES = ["Personal", "Business", "Education", "Housing", "Medical"] as const;

/** New loan application. Cross-field rules (limits, guarantors) are checked in superRefine. */
export const loanApplicationSchema = z
  .object({
    memberId: z.string().regex(MEMBER_ID, "Select the borrower"),
    purpose: z.enum(PURPOSES, { error: "Choose a loan type" }),
    amount: z.coerce
      .number<string>({ error: "Enter the loan amount" })
      .int("Whole rupees only")
      .min(5000, "Minimum loan is ₹5,000"),
    tenureMonths: z.coerce.number<string>({ error: "Select tenure" }).int().positive("Select tenure"),
    details: z.string().trim().min(10, "Describe what the loan is for (at least 10 characters)"),
    guarantor1: z.string(),
    guarantor2: z.string(),
    declaration: z.boolean().refine((v) => v, "Confirm the documents have been checked"),
  })
  .superRefine((v, ctx) => {
    const product = LOAN_PRODUCTS.find((p) => p.purpose === v.purpose);
    if (!product) return;
    if (v.amount > product.maxAmount) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: `${v.purpose} loans are capped at ₹${product.maxAmount.toLocaleString("en-IN")}` });
    }
    if (!product.tenures.includes(v.tenureMonths)) {
      ctx.addIssue({ code: "custom", path: ["tenureMonths"], message: "Select one of the listed tenures" });
    }
    const guarantors = [v.guarantor1, v.guarantor2].slice(0, product.guarantors);
    guarantors.forEach((g, i) => {
      const path = [`guarantor${i + 1}`];
      if (!MEMBER_ID.test(g)) ctx.addIssue({ code: "custom", path, message: "Select a guarantor" });
      else if (g === v.memberId) ctx.addIssue({ code: "custom", path, message: "The borrower can't be their own guarantor" });
    });
    if (guarantors.length === 2 && guarantors[0] && guarantors[0] === guarantors[1]) {
      ctx.addIssue({ code: "custom", path: ["guarantor2"], message: "Choose two different guarantors" });
    }
  });

export type LoanApplicationInput = z.input<typeof loanApplicationSchema>;
export type LoanApplicationValues = z.output<typeof loanApplicationSchema>;
