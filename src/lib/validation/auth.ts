import { z } from "zod";
import { MEMBER_ID, MOBILE, OTP } from "./patterns";

export const staffLoginSchema = z.object({
  staffId: z.string().trim().min(1, "Enter your staff ID"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});
export type StaffLoginValues = z.infer<typeof staffLoginSchema>;

export const otpSchema = z.object({
  otp: z.string().regex(OTP, "Enter the 6-digit code"),
});
export type OtpValues = z.infer<typeof otpSchema>;

export const memberLoginSchema = z.object({
  memberId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(MEMBER_ID, "Member ID looks like JSK-M-0000"),
  mobile: z.string().trim().regex(MOBILE, "Enter a valid 10-digit mobile number"),
});
export type MemberLoginValues = z.infer<typeof memberLoginSchema>;
