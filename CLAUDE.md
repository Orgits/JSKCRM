# Jai Shri Krishna Society — CRM (Next.js)

Staff console + member portal for Jai Shri Krishna Co-operative Thrift & Credit Society Ltd.
Figma: https://www.figma.com/design/ldD74TQj2LSQjkHHZvo6WH

## Stack
- Next.js (App Router, `src/` dir), TypeScript, Tailwind CSS v4 (tokens in `src/app/globals.css`)
- Icons: `lucide-react` — the Figma icons are Lucide (20px, strokeWidth 1.6)
- Fonts: DM Sans (UI) + Lora (society name, display headings) via `next/font` in `src/app/layout.tsx`
- Forms: `react-hook-form` + `zod`

## Commands
- `npm run dev` — local server at http://localhost:3000
- `npm run lint` and `npm run build` — run both before saying a task is done

## Figma frames → routes
| Frame | Node | Route / file |
|---|---|---|
| Design System (components) | 2-54 | `src/components/ui/*` |
| Staff Login | 3-23 | `src/app/(auth)/login/page.tsx` |
| Staff Login — Verify OTP | 3-141 | `src/app/(auth)/login/verify-otp/page.tsx` |
| Member Login | 3-227 | `src/app/(public)/member-login/page.tsx` |
| Dashboard | 6-120 | `src/app/(staff)/dashboard/page.tsx` |
| Members — Register New Member | 11-335 | `src/app/(staff)/members/new/page.tsx` |
| Members — Registration Successful | 27-1469 | success state in `members/new/RegisterMemberForm.tsx` |
| Members — List | 23-944 | `src/app/(staff)/members/page.tsx` (+ `MembersView.tsx`) |
| Member Profile — Overview | 24-1126 | `src/app/(staff)/members/[memberId]/page.tsx` (header + tabs in `layout.tsx`) |
| Member Profile — Passbook | 26-1304 | `src/app/(staff)/members/[memberId]/passbook/page.tsx` (+ `Passbook.tsx`) |

Built in code ahead of their Figma frames (frames are scripted in `figma/build-remaining-screens.js`,
section "07 · Loans, Deposits, Transactions, Reports & Settings" — not yet run; add node IDs here once it is):

| Frame (to be created) | Route / file |
|---|---|
| Loans — List | `src/app/(staff)/loans/page.tsx` (+ `LoansView.tsx`) |
| Loans — New Application | `src/app/(staff)/loans/new/page.tsx` (+ `NewLoanForm.tsx`, reads `?member=`) |
| Deposits | `src/app/(staff)/deposits/page.tsx` (+ `DepositsView.tsx`) |
| Transactions — Ledger | `src/app/(staff)/transactions/page.tsx` (+ `TransactionsView.tsx`) |
| Transactions — Record Payment | `src/app/(staff)/transactions/new/page.tsx` (+ `RecordPaymentForm.tsx`, reads `?member=&type=deposit\|withdrawal\|emi`) |
| Reports | `src/app/(staff)/reports/page.tsx` (+ `ReportDownloads.tsx`) |
| Settings | `src/app/(staff)/settings/page.tsx` (+ `SettingsForm.tsx`) |
| Help & Support | `src/app/(staff)/help/page.tsx` (+ `SupportTicketForm.tsx`) |
| Member — Edit | `src/app/(staff)/members/[memberId]/edit/page.tsx` (+ `EditMemberForm.tsx`) |

The "05 · Staff" (31-1747) and "06 · Daily Top-up" (33-2286) sections exist in Figma but aren't mapped
to code yet.

Frame URL format: `https://www.figma.com/design/ldD74TQj2LSQjkHHZvo6WH?node-id=<node>`

## Working from Figma
- Implement one frame per task. Fetch design context for that frame once and reuse it — the Figma
  account has a small monthly MCP call limit, so don't re-fetch or screenshot repeatedly.
- Build shared components first (Design System frame), then pages that use them.
- Figma output is a reference, not final code: convert it to our components and Tailwind token classes.
- The Starter plan's MCP cap can run out after a handful of calls. Batch a whole screen (or several)
  into one `use_figma` script, keep scripts in `figma/` so they can be re-run, and skip extra screenshots.

## Code rules
- Never hard-code hex colours. Use token classes (`bg-brand-600`, `text-text-secondary`,
  `border-neutral-border`, `shadow-card`, `rounded-card`, `font-serif`) or `var(--brand-600)`.
- Server Components by default. Add `"use client"` only to interactive pieces
  (forms, OTP inputs, tabs, segmented controls, upload tiles) and keep them small.
- Staff pages live under `src/app/(staff)/` and share `src/app/(staff)/layout.tsx`,
  which renders `Sidebar` (264px, navy gradient) + `TopBar` (72px) from `src/components/layout/`.
- Use `next/link` for navigation; active sidebar item comes from `usePathname()`.
- Page headings use `PageHeader` (`components/layout`); list pages use `FilterSelect`, `usePagination` +
  `Pagination` (`components/ui`). Pages that read search params wrap the client form in `<Suspense>`.
- TopBar titles for sub-pages (e.g. `/loans/new`) go in `pageTitles` in `components/layout/nav.ts`.
- Figma component → code component (in `src/components/ui/`):
  - Button (Type: Primary | Secondary | Ghost | Accent; Size: Large 48px | Medium 40px) → `Button`
  - Input (State: Default | Focused | Filled | Error | Read-only; label, helper, leading/trailing icon) → `TextField`
  - Input with chevron → `Select` (`size="md"` gives the 40px toolbar height, default 44px); Checkbox → `Checkbox`; Radio Option → `RadioOption`
  - Badge (Tone: Success | Warning | Danger | Info | Neutral | Brand) → `Badge`
  - Nav Item → `NavItem`; KPI Card → `KpiCard`; Document Upload (Empty | Uploaded) → `UploadTile`
  - Tab → `Tabs` (route tabs); member initials → `Avatar`
- Required field labels end with a red `*` (`text-danger-600`).
- The society's name lives only in `src/lib/society.ts` — never hard-code it in components.
- Dynamic routes: Cache Components is on, so `[param]` routes export `generateStaticParams`
  (mock IDs for now) and call `notFound()` for unknown values. Read params with `await params`.
- Mock data lives in `src/lib/mock/` until the backend APIs are connected.

## Indian formats & validation (zod)
- Money: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`
  → ₹1,84,500; large values as ₹2.86 Cr / ₹18.4 L in KPIs.
- Dates shown as DD / MM / YYYY; times as 10:42 AM.
- Mobile: `^[6-9]\d{9}$` (display as +91 98110 45672)
- Aadhaar: 12 digits, never starts with 0 or 1; always DISPLAY masked as `XXXX XXXX 1234`; never log it.
- PAN: `^[A-Z]{5}[0-9]{4}[A-Z]$`
- IFSC: `^[A-Z]{4}0[A-Z0-9]{6}$`
- PIN code: `^[1-9][0-9]{5}$`
- Member ID format: `JSK-M-0000`; Loan no.: `LN-YYYY-0000`

## Folder layout
```
src/
  app/
    globals.css, layout.tsx
    (auth)/login/page.tsx, (auth)/login/verify-otp/page.tsx
    (public)/member-login/page.tsx
    (staff)/layout.tsx, (staff)/dashboard/page.tsx, (staff)/members/page.tsx, (staff)/members/new/page.tsx
    (staff)/members/[memberId]/layout.tsx, page.tsx, passbook/page.tsx, edit/page.tsx
    (staff)/loans/, loans/new/, deposits/, transactions/, transactions/new/, reports/, settings/, help/
  components/
    ui/        Button, TextField, Select, Checkbox, RadioOption, Badge, KpiCard, NavItem, UploadTile,
               Tabs, Avatar
    layout/    Sidebar, TopBar, BrandPanel (login left panel)
  lib/
    format.ts  (currency/date helpers), loan.ts (loan products, EMI maths)
    csv.ts     (client-side CSV download)
    society.ts (society name), fees.ts (admission fees for the receipt)
    validation/member.ts  (registration + edit schemas), loan.ts, payment.ts
    mock/      members.ts (member register — source of truth for the list),
               member-profiles.ts (profile details, deposit accounts, loans, guarantees, passbooks),
               transactions.ts (ledger), dashboard.ts, staff.ts
figma/       use_figma build scripts (not part of the app; ignored by ESLint)
```
