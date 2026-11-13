import { BadgeCheck, Landmark, ShieldCheck } from "lucide-react";
import { iconProps } from "@/components/ui/icon";
import { society } from "@/lib/society";

export type Audience = "staff" | "member";

const copy: Record<Audience, { eyebrow: string; headline: string; points: string[] }> = {
  staff: {
    eyebrow: "Staff console",
    headline: "Serving our members with trust since day one.",
    points: [
      "Member registration, KYC and nominee records",
      "Deposits, loans and EMI collections in one place",
      "Two-step sign-in with OTP on your registered mobile",
    ],
  },
  member: {
    eyebrow: "Member portal",
    headline: "Your savings and loans, at your fingertips.",
    points: [
      "Check deposit balances and loan statements",
      "Track EMIs and upcoming due dates",
      "Secure sign-in with OTP on your registered mobile",
    ],
  },
};

const pointIcons = [Landmark, BadgeCheck, ShieldCheck];

/** Login left panel — navy gradient with the society name in Lora. Hidden below lg. */
export function BrandPanel({ audience }: { audience: Audience }) {
  const c = copy[audience];

  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-brand-700 p-12 text-text-inverse lg:flex">
      {/* Decorative rings */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full border-[48px] border-text-inverse opacity-5"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full border-[64px] border-accent-500 opacity-10"
      />

      <div className="relative flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-control bg-accent-500 font-serif text-base font-bold"
        >
          {society.monogram}
        </span>
        <span className="text-[11px] leading-[14px] font-bold tracking-[0.08em] text-sidebar-text uppercase">
          {c.eyebrow}
        </span>
      </div>

      <div className="relative flex max-w-lg flex-col gap-6">
        <p className="font-serif text-[40px] leading-[48px] font-bold">
          {society.shortName}
          <span className="block text-[28px] leading-9 font-semibold text-sidebar-text">
            Co-operative Thrift &amp; Credit Society Ltd.
          </span>
        </p>
        <p className="text-base leading-6 text-sidebar-text">{c.headline}</p>
        <ul className="flex flex-col gap-3">
          {c.points.map((point, i) => {
            const Icon = pointIcons[i % pointIcons.length];
            return (
              <li key={point} className="flex items-center gap-3 text-sm leading-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-sidebar-divider text-accent-500">
                  <Icon {...iconProps} />
                </span>
                {point}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="relative text-xs leading-4 text-sidebar-text">
        {society.legalName}
      </p>
    </aside>
  );
}
