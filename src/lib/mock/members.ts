import type { BadgeTone } from "@/components/ui/Badge";

/** "Today" for the mock data, so relative labels ("registered today") stay stable. */
export const MOCK_TODAY = "2026-11-11";

export type KycStatus = "Verified" | "Pending" | "Re-KYC due";
export type MemberStatus = "Active" | "Pending approval" | "Dormant";
export type MembershipType = "Ordinary" | "Nominal";

export type Member = {
  /** JSK-M-0000 */
  id: string;
  name: string;
  /** 10 digits, no +91 */
  mobile: string;
  /** ISO date */
  joinedOn: string;
  membership: MembershipType;
  kyc: KycStatus;
  status: MemberStatus;
  loans: {
    active: number;
    /** Principal outstanding across active loans */
    outstanding: number;
    closed: number;
    overdueEmis: number;
  };
  /** Total deposit balance */
  deposits: number;
};

export const kycTone: Record<KycStatus, BadgeTone> = {
  Verified: "success",
  Pending: "warning",
  "Re-KYC due": "warning",
};

export const memberStatusTone: Record<MemberStatus, BadgeTone> = {
  Active: "success",
  "Pending approval": "info",
  Dormant: "neutral",
};

const noLoans = { active: 0, outstanding: 0, closed: 0, overdueEmis: 0 };

/** Rows shown in the Figma "Members — List" frame. */
const featured: Member[] = [
  { id: "JSK-M-0412", name: "Ramesh Kumar Gupta", mobile: "9811023456", joinedOn: "2019-03-14", membership: "Ordinary", kyc: "Verified", status: "Active", loans: { active: 1, outstanding: 80250, closed: 1, overdueEmis: 0 }, deposits: 245000 },
  { id: "JSK-M-0877", name: "Sunita Devi", mobile: "9953041827", joinedOn: "2021-08-02", membership: "Ordinary", kyc: "Verified", status: "Active", loans: noLoans, deposits: 38500 },
  { id: "JSK-M-1249", name: "Sanjay Kumar Sharma", mobile: "9811045672", joinedOn: MOCK_TODAY, membership: "Ordinary", kyc: "Pending", status: "Pending approval", loans: noLoans, deposits: 500 },
  { id: "JSK-M-1033", name: "Mohd. Arif Khan", mobile: "9871266104", joinedOn: "2024-01-19", membership: "Ordinary", kyc: "Verified", status: "Active", loans: { active: 1, outstanding: 150000, closed: 0, overdueEmis: 0 }, deposits: 12000 },
  { id: "JSK-M-0219", name: "Pooja Sharma", mobile: "9899310572", joinedOn: "2017-11-06", membership: "Ordinary", kyc: "Verified", status: "Active", loans: { active: 0, outstanding: 0, closed: 2, overdueEmis: 0 }, deposits: 182300 },
  { id: "JSK-M-0645", name: "Rajesh Yadav", mobile: "9717088231", joinedOn: "2020-06-22", membership: "Ordinary", kyc: "Verified", status: "Active", loans: { active: 1, outstanding: 42600, closed: 0, overdueEmis: 1 }, deposits: 22750 },
  { id: "JSK-M-0958", name: "Harpreet Kaur", mobile: "9810155320", joinedOn: "2023-02-10", membership: "Ordinary", kyc: "Re-KYC due", status: "Active", loans: noLoans, deposits: 150000 },
  { id: "JSK-M-0731", name: "Vikas Jain", mobile: "9818427765", joinedOn: "2022-10-03", membership: "Ordinary", kyc: "Verified", status: "Active", loans: { active: 1, outstanding: 96500, closed: 0, overdueEmis: 0 }, deposits: 18200 },
  { id: "JSK-M-0556", name: "Anita Rawat", mobile: "9560031984", joinedOn: "2020-04-17", membership: "Ordinary", kyc: "Verified", status: "Active", loans: { active: 1, outstanding: 102000, closed: 1, overdueEmis: 0 }, deposits: 41900 },
  { id: "JSK-M-0389", name: "Naresh Bansal", mobile: "9868072215", joinedOn: "2018-09-11", membership: "Ordinary", kyc: "Verified", status: "Dormant", loans: noLoans, deposits: 6400 },
];

// Extra rows so search, filters and pagination have something to work on.
const firstNames = ["Amit", "Neha", "Suresh", "Kavita", "Deepak", "Anjali", "Manoj", "Rekha", "Arjun", "Meena", "Gaurav", "Shalini", "Pankaj", "Ritu", "Alok", "Geeta", "Rohit", "Seema", "Vinod", "Priyanka"];
const lastNames = ["Verma", "Mishra", "Bisht", "Joshi", "Pandey", "Chauhan", "Negi", "Saxena", "Agarwal", "Tiwari", "Rana", "Thakur", "Malhotra", "Kapoor"];

/** Small deterministic PRNG so the mock list is identical on server and client. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generated(count: number): Member[] {
  const rand = seeded(42);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const taken = new Set(featured.map((m) => m.id));

  return Array.from({ length: count }, (_, i) => {
    let num = 100 + Math.floor(rand() * 1140);
    while (taken.has(`JSK-M-${String(num).padStart(4, "0")}`)) num += 1;
    const id = `JSK-M-${String(num).padStart(4, "0")}`;
    taken.add(id);

    // Higher member numbers joined more recently (2015 → 2026).
    const year = 2015 + Math.min(11, Math.floor((num / 1250) * 12));
    const month = 1 + Math.floor(rand() * (year === 2026 ? 10 : 12));
    const day = 1 + Math.floor(rand() * 28);
    const joinedOn = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const roll = rand();
    const status: MemberStatus = roll < 0.08 ? "Pending approval" : roll < 0.14 ? "Dormant" : "Active";
    const kyc: KycStatus =
      status === "Pending approval" ? "Pending" : rand() < 0.1 ? "Re-KYC due" : "Verified";

    const hasLoan = status === "Active" && rand() < 0.45;
    const loans = hasLoan
      ? {
          active: rand() < 0.85 ? 1 : 2,
          outstanding: Math.round((25000 + rand() * 400000) / 50) * 50,
          closed: Math.floor(rand() * 3),
          overdueEmis: rand() < 0.15 ? 1 + Math.floor(rand() * 2) : 0,
        }
      : { ...noLoans, closed: rand() < 0.3 ? 1 : 0 };

    return {
      id,
      name: `${firstNames[i % firstNames.length]} ${pick(lastNames)}`,
      mobile: `${pick(["98", "97", "99", "95", "88"])}${String(Math.floor(rand() * 1e8)).padStart(8, "0")}`,
      joinedOn,
      membership: rand() < 0.9 ? "Ordinary" : "Nominal",
      kyc,
      status,
      loans,
      deposits: status === "Pending approval" ? 500 : Math.round((2000 + rand() * 300000) / 100) * 100,
    } satisfies Member;
  });
}

/** Member register — the Figma rows first, then the rest newest first. Replace with the members API. */
export const members: Member[] = [
  ...featured,
  ...generated(52).sort((a, b) => b.joinedOn.localeCompare(a.joinedOn)),
];
