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
