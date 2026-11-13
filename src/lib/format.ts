const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹1,84,500 */
export function formatINR(amount: number): string {
  return inr.format(amount);
}

/** KPI style: ₹2.86 Cr, ₹18.4 L, below a lakh falls back to ₹84,500. */
export function formatINRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${trim(abs / 1e7, 2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${trim(abs / 1e5, 1)} L`;
  return formatINR(amount);
}

function trim(n: number, digits: number) {
  return Number(n.toFixed(digits)).toString();
}

/** Plain Indian grouping: 1,248 / 1,24,800 */
export function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

// Society runs on Indian time; never depend on the server's timezone.
const TZ = "Asia/Kolkata";
const dateParts = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: TZ,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function toDate(value: Date | string) {
  return typeof value === "string" ? new Date(value) : value;
}

/** DD / MM / YYYY (IST). Accepts a Date or an ISO string. */
export function formatDate(value: Date | string): string {
  const parts = dateParts.formatToParts(toDate(value));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")} / ${get("month")} / ${get("year")}`;
}

const monthYearFmt = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, month: "short", year: "numeric" });

/** Mar 2019 (IST) — e.g. "member since Mar 2019". */
export function formatMonthYear(value: Date | string): string {
  return monthYearFmt.format(toDate(value));
}

/** "Ramesh Kumar Gupta" → "RG" (first + last name), "Priya" → "P". */
export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, " ").trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** 10:42 AM (IST) */
export function formatTime(value: Date | string): string {
  return timeFmt.format(toDate(value)).replace(/\s+/g, " ").toUpperCase();
}

/** 9811045672 → +91 98110 45672 */
export function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "").slice(-10);
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** 9811045672 → +91 98XXX XX672 (for "OTP sent to…" messages) */
export function maskMobile(mobile: string): string {
  const d = mobile.replace(/\D/g, "").slice(-10);
  return `+91 ${d.slice(0, 2)}XXX XX${d.slice(7)}`;
}

/** Aadhaar is only ever displayed masked: XXXX XXXX 1234 */
export function maskAadhaar(aadhaar: string): string {
  return `XXXX XXXX ${aadhaar.replace(/\D/g, "").slice(-4)}`;
}

/** Plain-language date for prose: 12 Mar 2019 (IST). Tables and forms use formatDate. */
const longDate = new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
export function formatDateLong(value: Date | string): string {
  return longDate.format(toDate(value));
}

/** Whole years between a date of birth and `on` (defaults to now). */
export function ageOn(dateOfBirth: string, on: Date | string = new Date()): number {
  const dob = toDate(dateOfBirth);
  const ref = toDate(on);
  let age = ref.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    ref.getMonth() < dob.getMonth() || (ref.getMonth() === dob.getMonth() && ref.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** 1 account / 4 accounts */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${formatCount(n)} ${n === 1 ? one : many}`;
}
