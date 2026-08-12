# DA Arrears Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side DA (Dearness Allowance) Arrears Calculator tool at `/tools/da-arrears`, matching the existing tools' pattern (`tax-calculator`, `leave-encashment`, `gpf-apgli`, `cfms-checker`).

**Architecture:** A pure, side-effect-free calculation function in `lib/calculators/da-arrears.ts` (no React/Next imports) computes the month-by-month and total arrears from Basic Pay, old/new DA%, and a from/to month range. A `"use client"` UI component (`DaArrearsUI.tsx`) owns form state, calls that function, and renders inputs/results/FAQ using the site's existing `Field`/`Input`/`NativeSelect`/`Card`/`Table`/`Badge`/`Accordion` components. A thin `page.tsx` supplies `Metadata` and renders the UI component, exactly like the other four tools. A new entry in the `/tools` hub's `TOOLS` array links to it.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind (existing design tokens only — `ink`, `inkSoft`, `tamarind`, `turmeric`, `hair`, `paper`, `paperRaised`). No new dependencies.

## Global Constraints

(Verbatim from `docs/superpowers/specs/2026-08-12-da-arrears-calculator-design.md` — every task below must honor these.)

- No hardcoded DA%, no hardcoded "current" AP DA rate or rate history — Old%/New% are plain free-text number inputs.
- No hardcoded installment schedule (dates or percentages) anywhere in code — that detail is general FAQ prose only, never calculator logic.
- Year dropdown options are computed at render time from `new Date().getFullYear()` — never a hardcoded year list.
- Single flat old%→new% DA rate and constant Basic Pay for the whole date range — no mid-period Basic Pay change, no multiple stepped DA revisions.
- No tax/deduction modeling — gross arrears figure only.
- 100% client-side — no server calls, no API routes.
- Reuse existing UI primitives only (`Field`, `Input`, `NativeSelect`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Badge`, `Accordion`, `Table` family, `Separator`) — no new UI primitive components.
- No test framework introduction (no Vitest/Jest added to `package.json`). Verification uses a temporary, uncommitted script run via the already-installed `tsx` CLI, and manual `tsc`/dev-server checks.

---

### Task 1: Pure calculation function

**Files:**
- Create: `lib/calculators/da-arrears.ts`
- Temporary (create then delete, never committed): `lib/calculators/__verify.ts`

**Interfaces:**
- Produces (used by Task 2):
  ```ts
  export type DaArrearsInput = {
    basicPay: number;
    oldDaPercent: number;
    newDaPercent: number;
    fromMonth: number; // 1-12
    fromYear: number;
    toMonth: number; // 1-12
    toYear: number;
  };

  export type DaArrearsMonthRow = {
    label: string;        // e.g. "Jan 2024"
    basicPay: number;
    daDeltaPercent: number;
    arrears: number;
  };

  export type DaArrearsResult = {
    months: DaArrearsMonthRow[];
    monthCount: number;
    totalArrears: number;
    error?: string;
  };

  export function calculateDaArrears(input: DaArrearsInput): DaArrearsResult;
  ```

- [ ] **Step 1: Write the failing verification script**

Create `lib/calculators/__verify.ts`:

```ts
import { calculateDaArrears } from "./da-arrears";

function assertEqual(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`FAIL ${label}: expected ${e}, got ${a}`);
  }
  console.log(`PASS ${label}`);
}

// Case 1: standard 3-month range, positive DA delta
const r1 = calculateDaArrears({
  basicPay: 50000,
  oldDaPercent: 10,
  newDaPercent: 15,
  fromMonth: 1,
  fromYear: 2024,
  toMonth: 3,
  toYear: 2024,
});
assertEqual(r1.monthCount, 3, "case1 monthCount");
assertEqual(r1.totalArrears, 7500, "case1 totalArrears");
assertEqual(r1.months[0].label, "Jan 2024", "case1 first month label");
assertEqual(r1.months[0].arrears, 2500, "case1 first month arrears");
assertEqual(r1.months[2].label, "Mar 2024", "case1 last month label");
assertEqual(r1.error, undefined, "case1 no error");

// Case 2: year-boundary range (Nov 2023 to Feb 2024 = 4 months)
const r2 = calculateDaArrears({
  basicPay: 40000,
  oldDaPercent: 20,
  newDaPercent: 25,
  fromMonth: 11,
  fromYear: 2023,
  toMonth: 2,
  toYear: 2024,
});
assertEqual(r2.monthCount, 4, "case2 monthCount (year boundary)");
assertEqual(r2.months[0].label, "Nov 2023", "case2 first month label");
assertEqual(r2.months[3].label, "Feb 2024", "case2 last month label");
assertEqual(r2.totalArrears, 8000, "case2 totalArrears");

// Case 3: invalid range (To before From)
const r3 = calculateDaArrears({
  basicPay: 50000,
  oldDaPercent: 10,
  newDaPercent: 15,
  fromMonth: 3,
  fromYear: 2024,
  toMonth: 1,
  toYear: 2024,
});
assertEqual(r3.monthCount, 0, "case3 monthCount");
assertEqual(r3.totalArrears, 0, "case3 totalArrears");
assertEqual(r3.months.length, 0, "case3 no months");
assertEqual(typeof r3.error, "string", "case3 has error string");

// Case 4: new DA not higher than old DA -> zero arrears, valid range, no error
const r4 = calculateDaArrears({
  basicPay: 50000,
  oldDaPercent: 15,
  newDaPercent: 10,
  fromMonth: 1,
  fromYear: 2024,
  toMonth: 3,
  toYear: 2024,
});
assertEqual(r4.monthCount, 3, "case4 monthCount still valid");
assertEqual(r4.totalArrears, 0, "case4 totalArrears zero");
assertEqual(r4.months[0].arrears, 0, "case4 row arrears zero");
assertEqual(r4.error, undefined, "case4 no error (range itself is valid)");

// Case 5: equal from/to month = 1 month
const r5 = calculateDaArrears({
  basicPay: 50000,
  oldDaPercent: 10,
  newDaPercent: 12,
  fromMonth: 6,
  fromYear: 2025,
  toMonth: 6,
  toYear: 2025,
});
assertEqual(r5.monthCount, 1, "case5 monthCount single month");
assertEqual(r5.totalArrears, 1000, "case5 totalArrears");

// Case 6: non-finite inputs fall back to 0, never throw
const r6 = calculateDaArrears({
  basicPay: NaN,
  oldDaPercent: 10,
  newDaPercent: 15,
  fromMonth: 1,
  fromYear: 2024,
  toMonth: 1,
  toYear: 2024,
});
assertEqual(r6.totalArrears, 0, "case6 NaN basicPay treated as 0");

console.log("All checks passed.");
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx tsx lib/calculators/__verify.ts`
Expected: FAIL — module `./da-arrears` does not exist (TypeScript/module-resolution error).

- [ ] **Step 3: Write the implementation**

Create `lib/calculators/da-arrears.ts`:

```ts
export type DaArrearsInput = {
  basicPay: number;
  oldDaPercent: number;
  newDaPercent: number;
  fromMonth: number; // 1-12
  fromYear: number;
  toMonth: number; // 1-12
  toYear: number;
};

export type DaArrearsMonthRow = {
  label: string;
  basicPay: number;
  daDeltaPercent: number;
  arrears: number;
};

export type DaArrearsResult = {
  months: DaArrearsMonthRow[];
  monthCount: number;
  totalArrears: number;
  error?: string;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toSafeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function calculateDaArrears(input: DaArrearsInput): DaArrearsResult {
  const basicPay = toSafeNumber(input.basicPay);
  const oldDaPercent = toSafeNumber(input.oldDaPercent);
  const newDaPercent = toSafeNumber(input.newDaPercent);
  const fromMonth = toSafeNumber(input.fromMonth);
  const fromYear = toSafeNumber(input.fromYear);
  const toMonth = toSafeNumber(input.toMonth);
  const toYear = toSafeNumber(input.toYear);

  const fromIndex = fromYear * 12 + (fromMonth - 1);
  const toIndex = toYear * 12 + (toMonth - 1);

  if (toIndex < fromIndex) {
    return {
      months: [],
      monthCount: 0,
      totalArrears: 0,
      error: "'To' month must be on or after the 'From' month.",
    };
  }

  const monthCount = toIndex - fromIndex + 1;
  const daDeltaPercent = newDaPercent - oldDaPercent;
  const monthlyArrears = daDeltaPercent > 0 ? Math.round((basicPay * daDeltaPercent) / 100) : 0;

  const months: DaArrearsMonthRow[] = [];
  for (let i = 0; i < monthCount; i++) {
    const index = fromIndex + i;
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1; // 1-12
    months.push({
      label: `${MONTH_LABELS[month - 1]} ${year}`,
      basicPay,
      daDeltaPercent,
      arrears: monthlyArrears,
    });
  }

  return {
    months,
    monthCount,
    totalArrears: monthlyArrears * monthCount,
  };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx tsx lib/calculators/__verify.ts`
Expected: six `PASS ...` lines followed by `All checks passed.`, exit code 0.

- [ ] **Step 5: Delete the temporary verification script**

```bash
rm lib/calculators/__verify.ts
```

- [ ] **Step 6: Commit**

```bash
git add lib/calculators/da-arrears.ts
git commit -m "feat: add DA arrears pure calculation function"
```

---

### Task 2: Tool page and client UI component

**Files:**
- Create: `app/(public)/tools/da-arrears/page.tsx`
- Create: `app/(public)/tools/da-arrears/_components/DaArrearsUI.tsx`

**Interfaces:**
- Consumes: `calculateDaArrears`, `DaArrearsInput`, `DaArrearsResult` from `@/lib/calculators/da-arrears` (Task 1).
- Consumes existing components (no changes to any of them):
  - `Field` — `app/(public)/_components/Field.tsx`: props `{ label?, labelTe?, helperText?, errorMessage?, required?, htmlFor?, children, className? }`
  - `Input` — `app/(public)/_components/Input.tsx`: standard `<input>` props + `{ error?, mono? }`
  - `NativeSelect` — `app/(public)/_components/NativeSelect.tsx`: standard `<select>` props + `{ error? }`
  - `Card`, `CardHeader`, `CardTitle`, `CardContent` — `app/(public)/_components/Card.tsx`
  - `Badge` — `app/(public)/_components/Badge.tsx`: `{ children, variant?, size?, shape?, dot?, className? }`
  - `Accordion`, `AccordionItemData` — `app/(public)/_components/Accordion.tsx`
  - `Separator` — `app/(public)/_components/Separator.tsx`
  - `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell` — `app/(public)/_components/Table.tsx`
- Produces: the route `/tools/da-arrears`, consumed by Task 3 (linked by href string only, no component import needed there).

- [ ] **Step 1: Create the client UI component**

Create `app/(public)/tools/da-arrears/_components/DaArrearsUI.tsx`:

```tsx
"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import Accordion, { AccordionItemData } from "@/app/(public)/_components/Accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import NativeSelect from "@/app/(public)/_components/NativeSelect";
import Badge from "@/app/(public)/_components/Badge";
import Separator from "@/app/(public)/_components/Separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/app/(public)/_components/Table";
import { calculateDaArrears } from "@/lib/calculators/da-arrears";

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const DA_FAQ_ITEMS: AccordionItemData[] = [
  {
    id: "what-is-da-arrears",
    titleEn: "What is DA Arrears?",
    titleTe: "డిఏ బకాయిలు అంటే ఏమిటి?",
    badge: "Basics",
    badgeVariant: "tamarind",
    defaultOpen: true,
    content: (
      <p>
        Dearness Allowance (DA) is periodically revised by the government to offset
        inflation. When a revised DA rate is announced with a past effective date (the
        order is issued months after the rate technically kicked in), employees are owed
        the difference for every month between the effective date and the date the new
        rate starts appearing in their regular salary. That backdated difference is DA
        arrears.
      </p>
    ),
  },
  {
    id: "how-da-revised",
    titleEn: "How are AP DA rates revised and announced?",
    titleTe: "ఆంధ్రప్రదేశ్‌లో డిఏ రేట్లు ఎలా సవరిస్తారు?",
    badge: "Process",
    badgeVariant: "neutral",
    content: (
      <p>
        The AP government revises DA periodically via a Government Order (G.O.) published
        by the Finance Department, usually tracking the All-India Consumer Price Index.
        The G.O. states the new percentage and the date it takes effect — often earlier
        than the date the G.O. itself is issued, which creates the arrears period.
      </p>
    ),
  },
  {
    id: "lump-sum",
    titleEn: "Are DA arrears paid as a lump sum?",
    titleTe: "డిఏ బకాయిలు మొత్తం ఒకేసారి చెల్లిస్తారా?",
    badge: "Payment",
    badgeVariant: "turmeric",
    content: (
      <p>
        Not usually. Each G.O. sets its own disbursal schedule — arrears are frequently
        split into a smaller upfront portion followed by further installments over
        subsequent months, rather than paid in full at once. The exact split changes with
        every revision, so check your specific G.O. (browse{" "}
        <Link href="/orders" className="text-tamarind underline">
          Orders &amp; Circulars
        </Link>
        ) for the current disbursal schedule rather than assuming a fixed pattern.
      </p>
    ),
  },
  {
    id: "taxable",
    titleEn: "Is DA arrears taxable?",
    titleTe: "డిఏ బకాయిలపై పన్ను వర్తిస్తుందా?",
    badge: "Taxation",
    badgeVariant: "neutral",
    content: (
      <p>
        Yes. DA arrears are treated as salary income in the year they are received and
        are taxable at your applicable slab rate, same as regular DA. Some employees claim
        relief under Section 89(1) if the arrears push them into a higher slab than the
        years the arrears actually relate to — consult your DDO or a tax advisor for that
        relief claim.
      </p>
    ),
  },
  {
    id: "find-exact-rates",
    titleEn: "Where do I find my exact DA percentages for a given period?",
    titleTe: "ఒక నిర్దిష్ట కాలానికి ఖచ్చితమైన డిఏ శాతాలు ఎక్కడ దొరుకుతాయి?",
    badge: "Reference",
    badgeVariant: "neutral",
    content: (
      <p>
        This calculator does not pre-fill DA rates, since they change with every G.O. —
        enter the exact old and new percentages from your specific order. Browse{" "}
        <Link href="/orders" className="text-tamarind underline">
          Orders &amp; Circulars
        </Link>{" "}
        for the latest verified DA G.O.s.
      </p>
    ),
  },
];

export default function DaArrearsUI() {
  const basicPayId = useId();
  const oldDaId = useId();
  const newDaId = useId();
  const fromMonthId = useId();
  const fromYearId = useId();
  const toMonthId = useId();
  const toYearId = useId();
  const pensionSchemeId = useId();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear - 6; y <= currentYear + 1; y++) years.push(y);
    return years;
  }, [currentYear]);

  const [basicPay, setBasicPay] = useState<string>("50000");
  const [oldDaPercent, setOldDaPercent] = useState<string>("");
  const [newDaPercent, setNewDaPercent] = useState<string>("");
  const [fromMonth, setFromMonth] = useState<number>(1);
  const [fromYear, setFromYear] = useState<number>(currentYear - 1);
  const [toMonth, setToMonth] = useState<number>(currentMonth);
  const [toYear, setToYear] = useState<number>(currentYear);
  const [pensionScheme, setPensionScheme] = useState<"OPS" | "CPS">("OPS");

  const result = useMemo(
    () =>
      calculateDaArrears({
        basicPay: parseFloat(basicPay) || 0,
        oldDaPercent: parseFloat(oldDaPercent) || 0,
        newDaPercent: parseFloat(newDaPercent) || 0,
        fromMonth,
        fromYear,
        toMonth,
        toYear,
      }),
    [basicPay, oldDaPercent, newDaPercent, fromMonth, fromYear, toMonth, toYear]
  );

  const daDeltaPercent = (parseFloat(newDaPercent) || 0) - (parseFloat(oldDaPercent) || 0);
  const hasNoArrears = !result.error && daDeltaPercent <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {/* Top Bar / Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/tools"
          className="text-xs font-mono text-inkSoft hover:text-ink transition-colors inline-flex items-center gap-1.5 font-semibold"
        >
          ← Back to Utility Tools / ఇతర సాధనాలు
        </Link>
        <Badge variant="tamarind" size="sm" shape="pill" dot>
          Runs 100% On Device
        </Badge>
      </div>

      {/* Header */}
      <div className="border-b border-hair pb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          DA Arrears Calculator
        </h1>
        <div className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          డిఏ బకాయిల లెక్కింపు సాధనం
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>1. Enter Your DA Revision Details</CardTitle>
            <div className="font-telugu text-xs text-inkSoft">మీ డిఏ సవరణ వివరాలు నమోదు చేయండి</div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Field label="Basic Pay (Monthly)" labelTe="మూల వేతనం" required htmlFor={basicPayId}>
              <Input
                id={basicPayId}
                type="number"
                mono
                value={basicPay}
                onChange={(e) => setBasicPay(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Old DA %" labelTe="పాత డిఏ శాతం" required htmlFor={oldDaId}>
                <Input
                  id={oldDaId}
                  type="number"
                  step="0.01"
                  mono
                  value={oldDaPercent}
                  onChange={(e) => setOldDaPercent(e.target.value)}
                  placeholder="e.g. 33.67"
                />
              </Field>
              <Field label="New DA %" labelTe="కొత్త డిఏ శాతం" required htmlFor={newDaId}>
                <Input
                  id={newDaId}
                  type="number"
                  step="0.01"
                  mono
                  value={newDaPercent}
                  onChange={(e) => setNewDaPercent(e.target.value)}
                  placeholder="e.g. 37.31"
                />
              </Field>
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="font-mono text-[10px] sm:text-xs uppercase font-bold text-inkSoft tracking-wider">
                Arrears Period / బకాయిల కాలం
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="From Month" htmlFor={fromMonthId}>
                  <NativeSelect
                    id={fromMonthId}
                    value={fromMonth}
                    onChange={(e) => setFromMonth(Number(e.target.value))}
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="From Year" htmlFor={fromYearId}>
                  <NativeSelect
                    id={fromYearId}
                    value={fromYear}
                    onChange={(e) => setFromYear(Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="To Month" htmlFor={toMonthId}>
                  <NativeSelect
                    id={toMonthId}
                    value={toMonth}
                    onChange={(e) => setToMonth(Number(e.target.value))}
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="To Year" htmlFor={toYearId}>
                  <NativeSelect
                    id={toYearId}
                    value={toYear}
                    onChange={(e) => setToYear(Number(e.target.value))}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
            </div>

            <Separator />

            <Field label="Pension Scheme" labelTe="పెన్షన్ విధానం" htmlFor={pensionSchemeId}>
              <NativeSelect
                id={pensionSchemeId}
                value={pensionScheme}
                onChange={(e) => setPensionScheme(e.target.value as "OPS" | "CPS")}
              >
                <option value="OPS">OPS (Old Pension Scheme)</option>
                <option value="CPS">CPS (Contributory Pension Scheme)</option>
              </NativeSelect>
            </Field>
          </CardContent>
        </Card>

        {/* Card 2: Results */}
        <Card>
          <CardHeader>
            <CardTitle>2. Arrears Estimate</CardTitle>
            <div className="font-telugu text-xs text-inkSoft">బకాయిల అంచనా</div>
          </CardHeader>

          <CardContent className="space-y-4">
            {result.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium leading-relaxed">
                ⚠️ {result.error}
              </div>
            ) : (
              <>
                <div className="p-3 bg-hair/30 rounded-lg space-y-1">
                  <div className="text-inkSoft font-mono text-[11px]">
                    {hasNoArrears ? "Result:" : "Total Estimated Arrears:"}
                  </div>
                  {hasNoArrears ? (
                    <div className="text-sm font-bold text-ink font-sans leading-snug">
                      No arrears payable — new DA is not higher than the old rate.
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-tamarind font-mono">
                      {formatCurrency(result.totalArrears)}
                    </div>
                  )}
                  <div className="text-[11px] text-inkSoft/80 font-sans mt-1">
                    Across {result.monthCount} month{result.monthCount === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="p-3 bg-tamarind/5 border border-tamarind/20 rounded-lg text-[11px] text-inkSoft leading-relaxed">
                  {pensionScheme === "OPS" ? (
                    <>
                      As an <b>OPS</b> employee, DA arrears are typically credited to your
                      General Provident Fund (GPF) account rather than paid as cash-in-hand
                      — check your specific G.O. for exact disbursal terms.
                    </>
                  ) : (
                    <>
                      As a <b>CPS</b> employee, DA arrears are typically credited to your
                      PRAN account or paid in cash per the specific G.O. — check your order
                      for exact terms.
                    </>
                  )}
                </div>

                {result.months.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>DA Δ%</TableHead>
                        <TableHead>Arrears</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.months.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell className="font-mono text-xs">{row.label}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {row.daDeltaPercent.toFixed(2)}%
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {formatCurrency(row.arrears)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className="font-mono text-xs">
                          Total
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatCurrency(result.totalArrears)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accordion FAQs */}
      <div className="space-y-4 pt-6 border-t border-hair">
        <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
          <span>📘</span> DA Arrears Guidelines & FAQs (నిబంధనలు & వివరణలు)
        </h2>
        <Accordion items={DA_FAQ_ITEMS} allowMultiple={true} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the page wrapper**

Create `app/(public)/tools/da-arrears/page.tsx`:

```tsx
import type { Metadata } from "next";
import DaArrearsUI from "./_components/DaArrearsUI";

export const metadata: Metadata = {
  title: "DA Arrears Calculator for AP Teachers — AP Teacher Desk",
  description:
    "Free online Dearness Allowance (DA) arrears calculator for AP and TS government teachers. Enter your old/new DA percentage and period to get an instant month-by-month arrears estimate.",
};

export default function DaArrearsPage() {
  return <DaArrearsUI />;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual smoke test against the dev server**

Run: `npm run dev` (in the background)

Then:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/da-arrears
```
Expected: `200`

```bash
curl -s http://localhost:3000/tools/da-arrears | grep -o "DA Arrears Calculator"
curl -s http://localhost:3000/tools/da-arrears | grep -o "Arrears Estimate"
```
Expected: both strings found.

Stop the dev server when done.

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/tools/da-arrears/page.tsx" "app/(public)/tools/da-arrears/_components/DaArrearsUI.tsx"
git commit -m "feat: add DA Arrears Calculator tool page"
```

---

### Task 3: Link the tool from the `/tools` hub

**Files:**
- Modify: `app/(public)/tools/page.tsx:47-57` (the `TOOLS` array — insert a new entry after the `cfms-checker` entry, before the closing `];`)

**Interfaces:**
- Consumes: the route path `/tools/da-arrears` (Task 2). No component-level import needed — the hub only ever references other tools by `href` string, matching its existing pattern.

- [ ] **Step 1: Add the new entry to the `TOOLS` array**

In `app/(public)/tools/page.tsx`, the array currently ends like this:

```tsx
  {
    href: "/tools/cfms-checker",
    title: "CFMS Bill Status & Payslip Guide",
    titleTe: "సిఎఫ్‌ఎమ్‌ఎస్ బిల్లు స్థితి మరియు పేస్లిప్ మార్గదర్శి",
    desc: "Direct verification portal for DDO bill submission status, EHS medical reimbursement, and monthly payslip downloads.",
    icon: "📑",
    badge: "Payslip Portal",
    status: "Direct Status",
    popular: false,
  },
];
```

Replace it with:

```tsx
  {
    href: "/tools/cfms-checker",
    title: "CFMS Bill Status & Payslip Guide",
    titleTe: "సిఎఫ్‌ఎమ్‌ఎస్ బిల్లు స్థితి మరియు పేస్లిప్ మార్గదర్శి",
    desc: "Direct verification portal for DDO bill submission status, EHS medical reimbursement, and monthly payslip downloads.",
    icon: "📑",
    badge: "Payslip Portal",
    status: "Direct Status",
    popular: false,
  },
  {
    href: "/tools/da-arrears",
    title: "DA Arrears Calculator",
    titleTe: "డిఏ బకాయిల లెక్కింపు సాధనం",
    desc: "Calculate Dearness Allowance arrears owed for a given Basic Pay, old/new DA percentage, and revision period, with a month-by-month breakdown.",
    icon: "📈",
    badge: "DA Revision",
    status: "Month-by-Month",
    popular: false,
  },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev` (in the background), then:
```bash
curl -s http://localhost:3000/tools | grep -o "DA Arrears Calculator"
curl -s http://localhost:3000/tools | grep -o 'href="/tools/da-arrears"'
```
Expected: both found — confirms the card renders and links correctly.

Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/tools/page.tsx"
git commit -m "feat: link DA Arrears Calculator from the tools hub"
```

---

### Task 4: Final end-to-end verification

**Files:** none (verification only).

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: no errors (confirms Tasks 1-3 together, not just individually).

- [ ] **Step 2: Full dev-server walkthrough**

Run: `npm run dev` (in the background). Then:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools/da-arrears
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tools
```
Expected: both `200`.

```bash
curl -s http://localhost:3000/tools/da-arrears | grep -o "Runs 100% On Device"
curl -s http://localhost:3000/tools/da-arrears | grep -o "Pension Scheme"
curl -s http://localhost:3000/tools/da-arrears | grep -o "DA Arrears Guidelines"
```
Expected: all three strings found — confirms the input card, pension toggle, and FAQ accordion all rendered.

Check the dev server's own log output for any thrown errors or React hydration warnings during these requests. Expected: none.

Stop the dev server when done.

- [ ] **Step 3: Confirm no stray files**

Run: `git status --short`
Expected: clean working tree relative to the three commits made in Tasks 1-3 — specifically confirm `lib/calculators/__verify.ts` is not present (it must have been deleted in Task 1, Step 5, and never committed).
