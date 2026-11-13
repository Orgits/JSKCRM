/**
 * Member profile data (mock): personal, KYC, bank, nominee, deposit accounts, loans, guarantees,
 * passbooks and activity. Built on top of the member register in `./members` — that list stays the
 * source of truth for name, status, KYC, deposits and loan totals, so the list and profile agree.
 * Replace with the members / loans / deposits APIs.
 */
import { SHARE_VALUE } from "@/lib/fees";
import { MOCK_TODAY, members, type Member } from "./members";

// ---------------------------------------------------------------- Types

export type MemberDetails = {
  guardianName: string;
  guardianRelation: "Father" | "Husband";
  dateOfBirth: string;
  gender: "Male" | "Female";
  maritalStatus: "Married" | "Single" | "Widowed";
  occupation: string;
  email?: string;
  address: { line: string; locality: string; city: string; pinCode: string };
  shares: number;
  /** When e-KYC was last verified (absent while KYC is pending). */
  kycVerifiedOn?: string;
  /** Only the last 4 digits are ever kept in the UI layer. */
  aadhaarLast4: string;
  pan: string;
  bank: { name: string; branch: string; accountLast4: string; ifsc: string };
  nominee: { name: string; relation: string; dateOfBirth?: string; mobile?: string; share: number };
  /** Deposit accounts. Members without a list get savings + compulsory thrift. */
  accounts?: DepositAccount[];
};

export type MemberProfile = Member & MemberDetails;

export type DepositAccountType = "Savings" | "Compulsory thrift" | "Recurring deposit" | "Fixed deposit";

export type DepositAccount = {
  accountNo: string;
  type: DepositAccountType;
  balance: number;
  detail: string;
  note: string;
};

export type Loan = {
  loanNo: string;
  memberId: string;
  purpose: "Personal" | "Business" | "Education" | "Housing" | "Medical";
  sanctioned: number;
  sanctionedOn: string;
  emi: number;
  tenureMonths: number;
  emisPaid: number;
  outstanding: number;
  /** Next due date, or the oldest unpaid due date when overdue. */
  nextDueOn: string;
  overdueEmis: number;
  guarantorIds: string[];
  /** Google Maps link recorded at disbursal for recovery visits. */
  locationUrl?: string;
};

export type LoanStatus = "Regular" | "Overdue";

export const MAX_GUARANTEES_PER_MEMBER = 3;

// ---------------------------------------------------------------- Hand-written profiles (Figma rows)

const DETAILS: Record<string, MemberDetails> = {
  "JSK-M-0412": {
    guardianName: "Shyam Lal Gupta", guardianRelation: "Father", dateOfBirth: "1978-07-22", gender: "Male",
    maritalStatus: "Married", occupation: "Business — Gupta Hardware Store", email: "ramesh.gupta@email.com",
    address: { line: "H.No. 147/2, Gali No. 5", locality: "Mukund Pur", city: "Delhi", pinCode: "110042" },
    shares: 20, kycVerifiedOn: "2026-03-15", aadhaarLast4: "7731", pan: "AKPPG5512R",
    bank: { name: "Punjab National Bank", branch: "Badli", accountLast4: "4590", ifsc: "PUNB0123400" },
    nominee: { name: "Kamla Gupta", relation: "Wife", dateOfBirth: "1981-02-05", mobile: "9811023457", share: 100 },
    accounts: [
      { accountNo: "SB-0412", type: "Savings", balance: 45200, detail: "Interest 4.0% p.a.", note: "Withdrawable" },
      { accountNo: "CD-0412", type: "Compulsory thrift", balance: 31800, detail: "₹500/month · auto-debit on 10th", note: "Locked till exit" },
      { accountNo: "RD-0412-01", type: "Recurring deposit", balance: 18000, detail: "₹1,000/month · 18 of 36 paid", note: "Matures May 2028" },
      { accountNo: "FD-0412-03", type: "Fixed deposit", balance: 150000, detail: "7.5% p.a. · 2 years", note: "Matures 12 / 03 / 2027" },
    ],
  },
  "JSK-M-0877": {
    guardianName: "Mahesh Prasad", guardianRelation: "Husband", dateOfBirth: "1984-02-11", gender: "Female",
    maritalStatus: "Married", occupation: "Homemaker",
    address: { line: "B-22, Gali No. 2", locality: "Siraspur", city: "Delhi", pinCode: "110042" },
    shares: 10, kycVerifiedOn: "2025-08-02", aadhaarLast4: "2208", pan: "DQZPD6614K",
    bank: { name: "State Bank of India", branch: "Samaypur Badli", accountLast4: "1187", ifsc: "SBIN0010234" },
    nominee: { name: "Mahesh Prasad", relation: "Husband", share: 100 },
  },
  "JSK-M-1249": {
    guardianName: "Ram Prakash Sharma", guardianRelation: "Father", dateOfBirth: "1986-08-14", gender: "Male",
    maritalStatus: "Married", occupation: "Self-employed — Sharma General Store", email: "sanjay.sharma@email.com",
    address: { line: "H.No. 214, Gali No. 3", locality: "Mukund Pur", city: "Delhi", pinCode: "110042" },
    shares: 10, aadhaarLast4: "4821", pan: "BQXPS4821L",
    bank: { name: "Punjab National Bank", branch: "Badli", accountLast4: "7713", ifsc: "PUNB0123400" },
    nominee: { name: "Meera Sharma", relation: "Wife", share: 100 },
  },
  "JSK-M-1033": {
    guardianName: "Mohd. Yusuf Khan", guardianRelation: "Father", dateOfBirth: "1990-05-03", gender: "Male",
    maritalStatus: "Married", occupation: "Auto parts dealer",
    address: { line: "C-41, Raja Vihar", locality: "Badli", city: "Delhi", pinCode: "110042" },
    shares: 15, kycVerifiedOn: "2024-01-19", aadhaarLast4: "6640", pan: "BWKPK2290M",
    bank: { name: "HDFC Bank", branch: "Rohini Sector 11", accountLast4: "3302", ifsc: "HDFC0001428" },
    nominee: { name: "Shabana Khan", relation: "Wife", share: 100 },
  },
  "JSK-M-0219": {
    guardianName: "Vinod Sharma", guardianRelation: "Husband", dateOfBirth: "1982-12-01", gender: "Female",
    maritalStatus: "Married", occupation: "Teacher",
    address: { line: "D-9, Shiv Vihar", locality: "Libaspur", city: "Delhi", pinCode: "110042" },
    shares: 25, kycVerifiedOn: "2025-11-06", aadhaarLast4: "9015", pan: "CFRPS7120D",
    bank: { name: "Canara Bank", branch: "Badli", accountLast4: "8261", ifsc: "CNRB0004521" },
    nominee: { name: "Vinod Sharma", relation: "Husband", share: 100 },
  },
  "JSK-M-0645": {
    guardianName: "Hari Om Yadav", guardianRelation: "Father", dateOfBirth: "1987-03-19", gender: "Male",
    maritalStatus: "Married", occupation: "Driver",
    address: { line: "H.No. 66, Gali No. 7", locality: "Samaypur", city: "Delhi", pinCode: "110042" },
    shares: 10, kycVerifiedOn: "2024-06-22", aadhaarLast4: "3376", pan: "AYJPY4471B",
    bank: { name: "Bank of Baroda", branch: "Samaypur", accountLast4: "5520", ifsc: "BARB0SAMAYP" },
    nominee: { name: "Sarita Yadav", relation: "Wife", share: 100 },
  },
  "JSK-M-0958": {
    guardianName: "Gurmeet Singh", guardianRelation: "Husband", dateOfBirth: "1975-09-27", gender: "Female",
    maritalStatus: "Married", occupation: "Boutique owner",
    address: { line: "A-3, Prem Nagar", locality: "Badli", city: "Delhi", pinCode: "110042" },
    shares: 30, kycVerifiedOn: "2023-02-10", aadhaarLast4: "5148", pan: "BTGPK8834Q",
    bank: { name: "ICICI Bank", branch: "Rohini", accountLast4: "0947", ifsc: "ICIC0000521" },
    nominee: { name: "Gurmeet Singh", relation: "Husband", share: 100 },
  },
  "JSK-M-0731": {
    guardianName: "Suresh Chand Jain", guardianRelation: "Father", dateOfBirth: "1991-01-08", gender: "Male",
    maritalStatus: "Single", occupation: "Accountant",
    address: { line: "F-17, Jain Colony", locality: "Badli", city: "Delhi", pinCode: "110042" },
    shares: 10, kycVerifiedOn: "2025-10-03", aadhaarLast4: "8022", pan: "AMVPJ3309H",
    bank: { name: "State Bank of India", branch: "Badli", accountLast4: "6604", ifsc: "SBIN0010234" },
    nominee: { name: "Suresh Chand Jain", relation: "Father", share: 100 },
  },
  "JSK-M-0556": {
    guardianName: "Deepak Rawat", guardianRelation: "Husband", dateOfBirth: "1983-06-30", gender: "Female",
    maritalStatus: "Married", occupation: "Tailoring unit",
    address: { line: "H.No. 12, Block B", locality: "Siraspur", city: "Delhi", pinCode: "110042" },
    shares: 15, kycVerifiedOn: "2024-04-21", aadhaarLast4: "1260", pan: "CHNPR6672E",
    bank: { name: "Punjab National Bank", branch: "Badli", accountLast4: "2238", ifsc: "PUNB0123400" },
    nominee: { name: "Deepak Rawat", relation: "Husband", share: 100 },
  },
  "JSK-M-0389": {
    guardianName: "Ram Niwas Bansal", guardianRelation: "Father", dateOfBirth: "1969-11-15", gender: "Male",
    maritalStatus: "Married", occupation: "Retired",
    address: { line: "E-5, Bansal Market", locality: "Badli", city: "Delhi", pinCode: "110042" },
    shares: 10, kycVerifiedOn: "2022-09-11", aadhaarLast4: "4417", pan: "ABDPB1180C",
    bank: { name: "Bank of India", branch: "Badli", accountLast4: "9081", ifsc: "BKID0006012" },
    nominee: { name: "Usha Bansal", relation: "Wife", share: 100 },
  },
};

/** Loans for the Figma rows; outstanding amounts match the member register. */
const FEATURED_LOANS: Loan[] = [
  { loanNo: "LN-2025-0721", memberId: "JSK-M-0412", purpose: "Personal", sanctioned: 180000, sanctionedOn: "2025-01-10", emi: 8450, tenureMonths: 24, emisPaid: 14, outstanding: 80250, nextDueOn: "2026-12-10", overdueEmis: 0, guarantorIds: ["JSK-M-0877", "JSK-M-0219"], locationUrl: "https://maps.google.com/?q=28.7372,77.1559" },
  { loanNo: "LN-2026-0118", memberId: "JSK-M-0731", purpose: "Personal", sanctioned: 150000, sanctionedOn: "2026-04-05", emi: 7050, tenureMonths: 24, emisPaid: 7, outstanding: 96500, nextDueOn: "2026-12-05", overdueEmis: 0, guarantorIds: ["JSK-M-0412", "JSK-M-0877"], locationUrl: "https://maps.google.com/?q=28.7329,77.1446" },
  { loanNo: "LN-2025-0942", memberId: "JSK-M-0556", purpose: "Business", sanctioned: 175000, sanctionedOn: "2025-08-20", emi: 5900, tenureMonths: 36, emisPaid: 15, outstanding: 102000, nextDueOn: "2026-11-20", overdueEmis: 0, guarantorIds: ["JSK-M-0412", "JSK-M-0958"], locationUrl: "https://maps.google.com/?q=28.7457,77.1389" },
  { loanNo: "LN-2025-0610", memberId: "JSK-M-0645", purpose: "Personal", sanctioned: 80000, sanctionedOn: "2025-09-02", emi: 4200, tenureMonths: 24, emisPaid: 13, outstanding: 42600, nextDueOn: "2026-11-02", overdueEmis: 1, guarantorIds: ["JSK-M-0731", "JSK-M-0556"] },
  { loanNo: "LN-2026-0410", memberId: "JSK-M-1033", purpose: "Business", sanctioned: 150000, sanctionedOn: "2026-11-09", emi: 7100, tenureMonths: 24, emisPaid: 0, outstanding: 150000, nextDueOn: "2026-12-09", overdueEmis: 0, guarantorIds: ["JSK-M-0219", "JSK-M-0958"], locationUrl: "https://maps.google.com/?q=28.7311,77.1502" },
];

// ---------------------------------------------------------------- Generated profiles (other rows)

/** Deterministic number from a member ID, so server and browser generate the same profile. */
function hashOf(key: string): number {
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

function picker(key: string) {
  let h = hashOf(key);
  return <T,>(list: readonly T[]): T => {
    h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;
    return list[h % list.length];
  };
}

const FEMALE_NAMES = new Set(["Neha", "Kavita", "Anjali", "Rekha", "Meena", "Shalini", "Ritu", "Geeta", "Seema", "Priyanka"]);
const MALE_GUARDIANS = ["Ram Kishan", "Om Prakash", "Satish", "Mahendra", "Rajendra", "Dinesh", "Mukesh", "Naresh", "Ashok", "Harish"];
const SPOUSES_F = ["Sunita", "Rekha", "Anita", "Pushpa", "Manju", "Kiran"];
const OCCUPATIONS = ["Shopkeeper", "Government employee", "Teacher", "Electrician", "Tailor", "Driver", "Accountant", "Contractor", "Nurse", "Private job"];
const LOCALITIES = ["Badli", "Mukund Pur", "Siraspur", "Samaypur", "Libaspur", "Rohini Sector 11", "Raja Vihar"];
const BANKS: MemberDetails["bank"][] = [
  { name: "Punjab National Bank", branch: "Badli", accountLast4: "", ifsc: "PUNB0123400" },
  { name: "State Bank of India", branch: "Samaypur Badli", accountLast4: "", ifsc: "SBIN0010234" },
  { name: "Bank of Baroda", branch: "Badli", accountLast4: "", ifsc: "BARB0BADLIX" },
  { name: "HDFC Bank", branch: "Rohini Sector 11", accountLast4: "", ifsc: "HDFC0001428" },
];
const LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ";

function generatedDetails(m: Member): MemberDetails {
  const pick = picker(m.id);
  const h = hashOf(m.id);
  const [first, ...rest] = m.name.split(" ");
  const surname = rest.join(" ") || first;
  const female = FEMALE_NAMES.has(first);
  const married = h % 5 !== 0;
  const joinedYear = Number(m.joinedOn.slice(0, 4));
  const age = 24 + (h % 30);
  const digits = (n: number, len: number) => String(n % 10 ** len).padStart(len, "0");
  const guardian = `${pick(MALE_GUARDIANS)} ${surname}`;

  return {
    guardianName: guardian,
    guardianRelation: female && married ? "Husband" : "Father",
    dateOfBirth: `${joinedYear - age}-${digits(1 + (h % 12), 2)}-${digits(1 + (h % 27), 2)}`,
    gender: female ? "Female" : "Male",
    maritalStatus: married ? "Married" : "Single",
    occupation: pick(OCCUPATIONS),
    address: { line: `H.No. ${10 + (h % 290)}, Gali No. ${1 + (h % 9)}`, locality: pick(LOCALITIES), city: "Delhi", pinCode: "110042" },
    shares: 10 + (h % 3) * 5,
    kycVerifiedOn: m.kyc === "Pending" ? undefined : m.joinedOn,
    aadhaarLast4: digits(hashOf(`${m.id}-uid`), 4),
    pan: `${LETTERS[h % 23]}${LETTERS[(h >>> 5) % 23]}${LETTERS[(h >>> 10) % 23]}P${surname[0].toUpperCase()}${digits(h, 4)}${LETTERS[(h >>> 15) % 23]}`,
    bank: { ...pick(BANKS), accountLast4: digits(hashOf(`${m.id}-bank`), 4) },
    nominee: married
      ? female
        ? { name: guardian, relation: "Husband", share: 100 }
        : { name: `${pick(SPOUSES_F)} ${surname}`, relation: "Wife", share: 100 }
      : { name: guardian, relation: "Father", share: 100 },
  };
}

function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

/** Loans for generated members, shaped to match their register totals. */
function generatedLoans(): Loan[] {
  const featured = new Set(Object.keys(DETAILS));
  const others = members.filter((m) => !featured.has(m.id));
  const possibleGuarantors = others.filter((m) => m.status === "Active").map((m) => m.id);
  const out: Loan[] = [];

  for (const m of others) {
    const { active, outstanding, overdueEmis } = m.loans;
    for (let k = 0; k < active; k++) {
      const h = hashOf(`${m.id}-loan-${k}`);
      const share = active === 1 ? outstanding : k === 0 ? Math.round(outstanding * 0.6 / 50) * 50 : outstanding - Math.round(outstanding * 0.6 / 50) * 50;
      const tenure = [24, 36, 48][h % 3];
      const paid = 3 + (h % Math.max(1, tenure - 8));
      const emi = Math.round((share / (tenure - paid)) * 1.1 / 50) * 50;
      const overdue = k === 0 ? overdueEmis : 0;
      const sanctionedOn = addMonths(MOCK_TODAY, -(paid + overdue + 1)).slice(0, 8) + String(5 + (h % 20)).padStart(2, "0");
      const others2 = possibleGuarantors.filter((id) => id !== m.id);
      out.push({
        loanNo: `LN-${sanctionedOn.slice(0, 4)}-${String(h % 10000).padStart(4, "0")}`,
        memberId: m.id,
        purpose: (["Personal", "Business", "Education", "Housing", "Medical"] as const)[h % 5],
        sanctioned: Math.round((share * tenure) / (tenure - paid) / 1000) * 1000,
        sanctionedOn,
        emi,
        tenureMonths: tenure,
        emisPaid: paid,
        outstanding: share,
        nextDueOn: overdue ? addMonths(sanctionedOn, paid + 1) : addMonths(sanctionedOn, paid + overdue + 2),
        overdueEmis: overdue,
        guarantorIds: [others2[h % others2.length], others2[(h >>> 7) % others2.length]].filter((v, i, a) => a.indexOf(v) === i),
        locationUrl: h % 4 === 0 ? undefined : `https://maps.google.com/?q=28.7${300 + (h % 200)},77.1${400 + (h % 200)}`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------- Lookups

export const loans: Loan[] = [...FEATURED_LOANS, ...generatedLoans()];

export function getMemberProfile(id: string): MemberProfile | undefined {
  const m = members.find((x) => x.id === id);
  if (!m) return undefined;
  return { ...m, ...(DETAILS[id] ?? generatedDetails(m)) };
}

/** Name for a member ID (used for guarantor and borrower links). */
export function memberName(id: string): string {
  return members.find((m) => m.id === id)?.name ?? id;
}

export function loansFor(memberId: string): Loan[] {
  return loans.filter((l) => l.memberId === memberId);
}

/** Loans this member stands guarantor for. */
export function guaranteesBy(memberId: string): Loan[] {
  return loans.filter((l) => l.guarantorIds.includes(memberId));
}

export function loanStatus(loan: Loan): LoanStatus {
  return loan.overdueEmis > 0 ? "Overdue" : "Regular";
}

export function shareCapital(member: MemberProfile): number {
  return member.shares * SHARE_VALUE;
}

export function depositAccountsFor(member: MemberProfile): DepositAccount[] {
  if (member.accounts) return member.accounts;
  const n = member.id.slice(-4);
  const thrift = (balance: number): DepositAccount => ({
    accountNo: `CD-${n}`, type: "Compulsory thrift", balance, detail: "₹500/month · auto-debit on 10th", note: "Locked till exit",
  });
  // New members only have the first compulsory deposit collected at registration.
  if (member.deposits <= 2000) return [thrift(member.deposits)];
  const compulsory = Math.round((member.deposits * 0.4) / 100) * 100;
  return [
    { accountNo: `SB-${n}`, type: "Savings", balance: member.deposits - compulsory, detail: "Interest 4.0% p.a.", note: "Withdrawable" },
    thrift(compulsory),
  ];
}

// ---------------------------------------------------------------- Activity

export type ActivityTone = "brand" | "success" | "accent" | "info" | "warning" | "danger";
export type ActivityEvent = { title: string; at: string; by: string; tone: ActivityTone };

const ACTIVITY: Record<string, ActivityEvent[]> = {
  "JSK-M-0412": [
    { title: "EMI #14 received · ₹8,450 via UPI", at: "2026-11-10T10:42:00+05:30", by: "Meena (Cashier)", tone: "brand" },
    { title: "RD instalment ₹1,000 transferred from savings", at: "2026-10-30T06:00:00+05:30", by: "Auto", tone: "success" },
    { title: "Alternate mobile number updated", at: "2026-10-02T12:10:00+05:30", by: "Krishna Verma", tone: "accent" },
    { title: "Aadhaar e-KYC re-verified", at: "2026-03-15T11:05:00+05:30", by: "Krishna Verma", tone: "info" },
  ],
};

export function activityFor(member: MemberProfile): ActivityEvent[] {
  if (ACTIVITY[member.id]) return ACTIVITY[member.id];
  const events: ActivityEvent[] = [];
  for (const l of loansFor(member.id)) {
    if (l.overdueEmis) {
      events.push({ title: `${l.overdueEmis} EMI${l.overdueEmis > 1 ? "s" : ""} overdue on ${l.loanNo}`, at: `${l.nextDueOn}T23:59:00+05:30`, by: "System", tone: "danger" });
    }
    events.push({ title: `${l.purpose} loan ${l.loanNo} disbursed`, at: `${l.sanctionedOn}T12:00:00+05:30`, by: "Krishna Verma", tone: "accent" });
  }
  if (member.kycVerifiedOn && member.kycVerifiedOn !== member.joinedOn) {
    events.push({ title: "Aadhaar e-KYC re-verified", at: `${member.kycVerifiedOn}T11:00:00+05:30`, by: "Krishna Verma", tone: "info" });
  }
  events.push({ title: "Member registered", at: `${member.joinedOn}T10:30:00+05:30`, by: "Krishna Verma", tone: "brand" });
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
}

// ---------------------------------------------------------------- Passbook

export type PassbookEntry = {
  txnId: string;
  /** ISO timestamp */
  at: string;
  particulars: string;
  note: string;
  mode: "Cash" | "UPI" | "Transfer" | "Auto-debit" | "System" | "Cheque";
  /** Positive = credit, negative = debit */
  amount: number;
};

export type PassbookRow = PassbookEntry & { balance: number };

const RAMESH_SAVINGS: PassbookEntry[] = [
  { txnId: "TXN-26110298", at: "2026-11-03T10:15:00+05:30", particulars: "Cash deposit at counter", note: "Received by Meena (Cashier)", mode: "Cash", amount: 5000 },
  { txnId: "TXN-26103011", at: "2026-10-30T06:00:00+05:30", particulars: "Transfer to RD-0412-01", note: "Instalment 18 of 36", mode: "Transfer", amount: -1000 },
  { txnId: "TXN-26101007", at: "2026-10-10T06:00:00+05:30", particulars: "Compulsory thrift deposit · CD-0412", note: "October 2026", mode: "Auto-debit", amount: -500 },
  { txnId: "TXN-26100544", at: "2026-10-05T16:32:00+05:30", particulars: "UPI deposit", note: "UPI ref 6278 1934 0021", mode: "UPI", amount: 12000 },
  { txnId: "TXN-26093099", at: "2026-09-30T23:59:00+05:30", particulars: "Interest credited", note: "Q2 FY 2026-27 @ 4.0% p.a.", mode: "System", amount: 412 },
  { txnId: "TXN-26092231", at: "2026-09-22T12:20:00+05:30", particulars: "Cash withdrawal at counter", note: "Withdrawal slip #4471", mode: "Cash", amount: -8000 },
  { txnId: "TXN-26091006", at: "2026-09-10T06:00:00+05:30", particulars: "Compulsory thrift deposit · CD-0412", note: "September 2026", mode: "Auto-debit", amount: -500 },
  { txnId: "TXN-26083012", at: "2026-08-30T06:00:00+05:30", particulars: "Transfer to RD-0412-01", note: "Instalment 17 of 36", mode: "Transfer", amount: -1000 },
  { txnId: "TXN-26081004", at: "2026-08-10T06:00:00+05:30", particulars: "Compulsory thrift deposit · CD-0412", note: "August 2026", mode: "Auto-debit", amount: -500 },
  { txnId: "TXN-26072290", at: "2026-07-22T11:48:00+05:30", particulars: "Cash deposit at counter", note: "Received by Meena (Cashier)", mode: "Cash", amount: 7500 },
  { txnId: "TXN-26063098", at: "2026-06-30T23:59:00+05:30", particulars: "Interest credited", note: "Q1 FY 2026-27 @ 4.0% p.a.", mode: "System", amount: 368 },
  { txnId: "TXN-26061417", at: "2026-06-14T15:05:00+05:30", particulars: "Cheque deposit", note: "Cheque #204518 · PNB Badli", mode: "Cheque", amount: 9000 },
];

/** Entries for one account, newest first (mock: generated where no real history is written). */
function entriesFor(member: MemberProfile, account: DepositAccount): PassbookEntry[] {
  if (account.accountNo === "SB-0412") return RAMESH_SAVINGS;

  const n = member.id.slice(-4);
  const months = ["2026-11", "2026-10", "2026-09", "2026-08", "2026-07", "2026-06"];
  const label = (ym: string) =>
    new Date(`${ym}-01T00:00:00+05:30`).toLocaleString("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  switch (account.type) {
    case "Compulsory thrift":
      return months.slice(1).map((ym, i) => ({
        txnId: `TXN-${ym.replace("-", "").slice(2)}10${n}${i}`,
        at: `${ym}-10T06:00:00+05:30`,
        particulars: "Monthly compulsory deposit",
        note: label(ym),
        mode: "Auto-debit",
        amount: 500,
      }));
    case "Recurring deposit":
      return months.slice(1).map((ym, i) => ({
        txnId: `TXN-${ym.replace("-", "").slice(2)}30${n}${i}`,
        at: `${ym}-${ym === "2026-09" ? "30" : "28"}T06:00:00+05:30`,
        particulars: `RD instalment from SB-${n}`,
        note: `Instalment ${18 - i} of 36`,
        mode: "Transfer",
        amount: 1000,
      }));
    case "Fixed deposit":
      return [
        { txnId: `TXN-25031200${n}`, at: "2025-03-12T11:20:00+05:30", particulars: "Fixed deposit opened", note: "2 years @ 7.5% p.a. · interest paid at maturity", mode: "Cheque", amount: account.balance },
      ];
    default: {
      const deposit = Math.max(500, Math.round((account.balance * 0.25) / 100) * 100);
      return [
        { txnId: `TXN-261105${n}`, at: "2026-11-05T11:10:00+05:30", particulars: "Cash deposit at counter", note: "Received by Meena (Cashier)", mode: "Cash", amount: deposit },
        { txnId: `TXN-261010${n}`, at: "2026-10-10T06:00:00+05:30", particulars: `Compulsory thrift deposit · CD-${n}`, note: "October 2026", mode: "Auto-debit", amount: -500 },
        { txnId: `TXN-260930${n}`, at: "2026-09-30T23:59:00+05:30", particulars: "Interest credited", note: "Q2 FY 2026-27 @ 4.0% p.a.", mode: "System", amount: Math.round(account.balance * 0.01) },
        { txnId: `TXN-260910${n}`, at: "2026-09-10T06:00:00+05:30", particulars: `Compulsory thrift deposit · CD-${n}`, note: "September 2026", mode: "Auto-debit", amount: -500 },
      ];
    }
  }
}

function withBalances(entries: PassbookEntry[], closing: number): { rows: PassbookRow[]; opening: number } {
  let balance = closing;
  const rows = entries.map((e) => {
    const row = { ...e, balance };
    balance -= e.amount;
    return row;
  });
  return { rows, opening: balance };
}

/**
 * Passbook with running balance, newest first. The newest balance equals the account balance.
 * Mock history that would dip below zero or predate the member falls back to one opening entry.
 */
export function passbookFor(member: MemberProfile, account: DepositAccount): PassbookRow[] {
  const generated = withBalances(entriesFor(member, account), account.balance);
  const valid =
    generated.opening >= 0 &&
    generated.rows.every((r) => r.balance - r.amount >= 0 && r.at.slice(0, 10) >= member.joinedOn);
  if (valid) return generated.rows;

  return withBalances(
    [
      {
        txnId: `TXN-${member.joinedOn.replace(/-/g, "").slice(2)}${member.id.slice(-4)}`,
        at: `${member.joinedOn}T10:30:00+05:30`,
        particulars: "Account opened · initial deposit",
        note: "Collected at registration",
        mode: "Cash",
        amount: account.balance,
      },
    ],
    account.balance,
  ).rows;
}

/** All member IDs, for generateStaticParams. */
export function memberIds(): string[] {
  return members.map((m) => m.id);
}
