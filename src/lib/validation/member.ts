import { z } from "zod";
import { AADHAAR, IFSC, MOBILE, PAN, PIN_CODE } from "./patterns";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const requiredText = (message: string) => z.string().trim().min(1, message);

export const DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const IMAGE_TYPES = ["image/jpeg", "image/png"];

const document = (label: string, types = DOC_TYPES) =>
  z
    .file({ error: `Upload the ${label}` })
    .max(MAX_UPLOAD_BYTES, "File must be 2 MB or smaller")
    .mime(types, types === IMAGE_TYPES ? "Use a JPG or PNG image" : "Use a PDF, JPG or PNG");

function isAdult(isoDate: string) {
  const dob = new Date(isoDate);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  const eighteen = new Date(dob.getFullYear() + 18, dob.getMonth(), dob.getDate());
  return eighteen <= today;
}

export const GENDERS = ["female", "male", "other"] as const;
export const MEMBERSHIP_TYPES = ["ordinary", "nominal"] as const;
export const RELATIONS = ["spouse", "son", "daughter", "father", "mother", "sibling", "other"] as const;

/** Register New Member — the full registration form. */
export const memberRegistrationSchema = z.object({
  // Personal
  fullName: requiredText("Enter the member's full name"),
  guardianName: requiredText("Enter father's or spouse's name"),
  dateOfBirth: requiredText("Enter date of birth").refine(isAdult, "Member must be 18 or older"),
  gender: z.enum(GENDERS, { error: "Select gender" }),
  occupation: z.string().trim(),
  mobile: z.string().trim().regex(MOBILE, "Enter a valid 10-digit mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),

  // KYC
  aadhaar: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(AADHAAR, "Aadhaar is 12 digits and can't start with 0 or 1")),
  pan: z.string().trim().toUpperCase().regex(PAN, "PAN looks like ABCDE1234F"),

  // Address
  addressLine: requiredText("Enter the address"),
  city: requiredText("Enter city / village"),
  state: requiredText("Select state"),
  pinCode: z.string().trim().regex(PIN_CODE, "Enter a valid 6-digit PIN code"),

  // Membership
  membershipType: z.enum(MEMBERSHIP_TYPES, { error: "Choose a membership type" }),
  shares: z.coerce
    .number<string>({ error: "Enter number of shares" })
    .int("Whole shares only")
    .min(1, "At least 1 share"),

  // Nominee
  nomineeName: requiredText("Enter nominee's name"),
  nomineeRelation: z.enum(RELATIONS, { error: "Select relation" }),

  // Bank
  bankAccount: z.string().trim().regex(/^\d{9,18}$/, "Account number is 9–18 digits"),
  ifsc: z.string().trim().toUpperCase().regex(IFSC, "IFSC looks like SBIN0001234"),

  // Documents
  photo: document("photograph", IMAGE_TYPES),
  aadhaarDoc: document("Aadhaar card"),
  panDoc: document("PAN card"),
  signature: document("signature", IMAGE_TYPES),

  declaration: z.boolean().refine((v) => v, "Confirm the declaration to continue"),
});

export type MemberRegistrationInput = z.input<typeof memberRegistrationSchema>;
export type MemberRegistration = z.output<typeof memberRegistrationSchema>;
