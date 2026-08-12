# DA Arrears Calculator — Design Spec

## Context

`teacher-tools-project-brief.md` lists a DA (Dearness Allowance) Arrears Calculator as
the #3 priority tool ("high search volume around each DA revision announcement"), after
the Income Tax Calculator (built). It is not yet built. This spec covers that tool only —
the PRC/Pay Fixation Calculator (priority #2) is deliberately out of scope here: it
requires the real AP PRC 2022 pay-matrix tables and fixation rules, a much larger,
higher accuracy-risk piece of work, and will get its own spec later.

Reference real-world example used to validate the design: G.O.Ms.No. 60 (20 Oct 2025)
and its amendment G.O.Ms.No. 62 (21 Oct 2025) — AP DA revised 33.67% → 37.31%,
effective 1 Jan 2024, arrears period Jan 2024–Sep 2025, paid via installments (10% then
three further installments), credited to GPF for OPS employees / PRAN or cash for CPS
employees. (Source: https://www.apteachers.in/2025/10/ap-new-da-3731-go-60-dearness-allowance.html)

## Goal

A client-side, no-server-calls calculator (matching the site's existing "100%
client-side" tools) that computes the gross DA arrears owed for a given Basic Pay, an
old DA%, a new DA%, and a from/to month range — with a month-by-month breakdown table
so a teacher can cross-check against their pay slips, and a contextual note on where
OPS vs CPS arrears typically get credited.

## Non-goals (explicitly out of scope for this spec)

- No hardcoded "current" AP DA rate or rate history — the tax calculator already has a
  DA% quick-pick list that goes stale after every revision; this tool avoids repeating
  that mistake. Old%/New% are plain free-text number inputs.
- No hardcoded installment schedule (dates, percentages) — GO 60/62's specific
  "10% then 3 installments" split is that G.O.'s arbitrary administrative choice, not a
  general rule. The next DA revision could pay in one lump sum or a different split
  entirely. This detail is mentioned only as general FAQ prose, never as calculator logic.
- No support for a Basic Pay change mid-period (e.g. an annual increment landing inside
  the arrears window) or multiple stepped DA revisions in one run. Single flat
  old%→new% rate, constant Basic Pay, for the whole date range. If a teacher's period
  spans an increment, they re-run the calculator once per segment.
- No tax/deduction modeling on the arrears amount — gross figure only.
- No new UI primitives — reuses `Field`, `Input`, `NativeSelect`, `Card`, `Badge`,
  `Accordion`, exactly as the existing tools (`GpfApgliUI.tsx`, `LeaveEncashmentUI.tsx`) do.
- No test framework introduction. The calculation logic is extracted into a pure
  function specifically so it *can* be tested easily later, but writing/wiring actual
  tests is a separate decision, not bundled into this build.

## File structure

- `lib/calculators/da-arrears.ts` — pure function, no React/Next imports.
- `app/(public)/tools/da-arrears/page.tsx` — thin wrapper, `Metadata` export (title/
  description), matches every other tool page in `app/(public)/tools/*/page.tsx`.
- `app/(public)/tools/da-arrears/_components/DaArrearsUI.tsx` — `"use client"` component:
  state, calls the pure function, renders inputs/results/FAQ.
- One new entry added to the `TOOLS` array in `app/(public)/tools/page.tsx` (icon, title,
  Telugu title, desc, badge, `popular: false`). It automatically inherits the Most Used
  chip logic, step-flow chips, and Privacy strip already built into that page — no
  changes needed there beyond the array entry.

## Inputs

| Field | Type | Notes |
|---|---|---|
| Basic Pay (₹) | number | same pattern as `GpfApgliUI`'s Basic Pay field |
| Old DA % | number, free text | no hardcoded value/list |
| New DA % | number, free text | no hardcoded value/list |
| From Month / Year | paired `NativeSelect` | year options = `(currentYear - 6)` through `(currentYear + 1)`, computed from `new Date()` at render time — never a hardcoded year list |
| To Month / Year | paired `NativeSelect` | inclusive of this month |
| Pension Scheme | `NativeSelect`: "OPS (Old Pension Scheme)" / "CPS (Contributory Pension Scheme)" | drives only the contextual output note, not the math |

## Calculation (`lib/calculators/da-arrears.ts`)

```
calculateDaArrears(input: {
  basicPay: number;
  oldDaPercent: number;
  newDaPercent: number;
  fromMonth: number; fromYear: number;   // 1-12, e.g. 2024
  toMonth: number; toYear: number;
}): {
  months: { label: string; basicPay: number; daDeltaPercent: number; arrears: number }[];
  monthCount: number;
  totalArrears: number;
  error?: string;   // set when the range is invalid
}
```

- `monthCount` = inclusive count of calendar months between From and To, computed via
  `Date` arithmetic (year*12+month indices), not manual month-name arrays — avoids
  year-boundary bugs.
- If the To date is before the From date: `monthCount: 0`, `months: []`,
  `totalArrears: 0`, `error: "'To' month must be on or after the 'From' month."` The UI
  omits the results table entirely in this case and shows only the inline error.
- `daDeltaPercent = newDaPercent - oldDaPercent`. If this is `<= 0`: `monthCount` and
  `months` are still computed and returned with a valid range (each row's `arrears: 0`),
  `error` is left unset, and `totalArrears: 0`. The UI renders the month table as usual
  (all rows showing ₹0, for transparency that the range itself was valid) and shows a
  neutral "No arrears payable — new DA is not higher than the old rate" message in place
  of where a positive total would otherwise be highlighted — this is distinct from the
  `error` case above, which suppresses the table entirely because the range itself is
  invalid.
- `monthlyArrears = round(basicPay * daDeltaPercent / 100)`, same value repeated once
  per row in `months` (Basic Pay is constant across the range per the non-goals above).
- `totalArrears = monthlyArrears * monthCount`.
- All numeric inputs are treated as `0` if not a finite number (`Number.isFinite` guard)
  — the function never throws, matching the graceful-degradation style already used in
  `GpfApgliUI.tsx` (`parseFloat(x) || 0`).

## UI / output

- Results card mirrors the existing tools' layout: a "Total Arrears" figure formatted
  via the same `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`
  helper already used in `GpfApgliUI.tsx`.
- Below the total: the OPS/CPS contextual note (plain text, no numbers).
- A collapsible/scrollable month-by-month table below that, one row per month:
  month label ("Jan 2024"), Basic Pay, DA Δ%, arrears for that month.
- If `error` is set: an inline validation message where the total would be, table
  omitted, styled consistent with other inline warnings on the site (e.g. the APGLI
  "below recommended slab" warning in `GpfApgliUI.tsx`).
- FAQ accordion at the bottom (`AccordionItemData[]`, general process info only):
  - "What is DA Arrears?"
  - "How are AP DA rates revised and announced?"
  - "Are DA arrears paid as a lump sum?" — explains arrears are commonly split into
    installments per the specific G.O. (as seen in GO 60/62), not assumed to be a
    single payment; points to `/orders` for the actual current schedule.
  - "Is DA arrears taxable?"
  - "Where do I find my exact DA percentages for a given period?" — points to the
    `/orders` DA-related category rather than embedding any specific rate.

## Error handling / edge cases summary

- To-month before From-month → handled (see above), no negative totals ever shown.
- New DA% ≤ Old DA% → handled (see above), no negative totals ever shown.
- Empty/non-numeric inputs → parsed with fallback to `0`, never throws.
- Same From/To month → `monthCount: 1`.

## Testing

No test framework exists in the project yet (confirmed: no Vitest/Jest in
`package.json`). The calculation logic is deliberately isolated into a pure,
side-effect-free function specifically so it's trivial to unit test whenever a test
framework is introduced — but introducing that framework is out of scope for this spec.
