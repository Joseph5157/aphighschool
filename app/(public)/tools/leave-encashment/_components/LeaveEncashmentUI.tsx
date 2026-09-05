"use client";

import { useId, useState } from "react";
import Link from "next/link";
import Accordion, { AccordionItemData } from "@/app/(public)/_components/Accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import NativeSelect from "@/app/(public)/_components/NativeSelect";
import Badge from "@/app/(public)/_components/Badge";
import Separator from "@/app/(public)/_components/Separator";
import { calculateElSurrender } from "@/lib/calculators/leave-encashment";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const LEAVE_FAQ_ITEMS: AccordionItemData[] = [
  {
    id: "el-surrender-rules",
    titleEn: "What are the rules for Earned Leave (EL) Surrender in AP?",
    titleTe: "ఆర్జిత సెలవు (EL) సరెండర్ బిల్లు నియమాలు",
    badge: "EL rules",
    badgeVariant: "tamarind",
    defaultOpen: true,
    content: (
      <div className="space-y-2">
        <p>AP government teachers and employees may surrender Earned Leave (EL) for encashment, subject to service rules.</p>
        <ul className="list-disc space-y-1 pl-4">
          <li><b>15-day EL surrender:</b> Normally follows a 12-month gap.</li>
          <li><b>30-day EL surrender:</b> Normally follows a 24-month gap.</li>
          <li><b>Estimate formula:</b> (Basic Pay + DA) ÷ 30 × surrender days.</li>
        </ul>
        <p>Sanction depends on the leave balance recorded in the Service Register and the decision of the competent authority.</p>
      </div>
    ),
  },
  {
    id: "retirement-encashment-cap",
    titleEn: "What is the maximum EL encashment limit at retirement?",
    titleTe: "రిటైర్మెంట్ సమయంలో గరిష్ట లీవ్ ఎన్‌క్యాష్‌మెంట్ పరిమితి ఎంత?",
    badge: "Retirement estimate",
    badgeVariant: "turmeric",
    content: (
      <div className="space-y-2">
        <p>At superannuation retirement, a government employee can encash accumulated Earned Leave (EL) up to a maximum of <b>300 days</b>.</p>
        <p>If EL balance is less than 300 days, Half Pay Leave (HPL) encashment can be combined up to the shortfall limit to reach the 300-day ceiling.</p>
      </div>
    ),
  },
];

export default function LeaveEncashmentUI() {
  const basicPayId = useId();
  const daPercentId = useId();
  const elDaysId = useId();
  const hplDaysId = useId();
  const modeId = useId();

  const [mode, setMode] = useState<"surrender" | "retirement">("surrender");
  const [basicPay, setBasicPay] = useState("52040");
  const [daPercent, setDaPercent] = useState("33.67");
  const [elDays, setElDays] = useState("15");
  const [hplDays, setHplDays] = useState("0");

  const basicNum = parseFloat(basicPay) || 0;
  const daNum = parseFloat(daPercent) || 0;
  const elNum = parseFloat(elDays) || 0;
  const hplNum = parseFloat(hplDays) || 0;
  const isSurrender = mode === "surrender";
  const surrenderResult = calculateElSurrender({
    basicPay: parseFloat(basicPay),
    daPercent: parseFloat(daPercent),
    days: elNum,
  });

  // Retirement mode deliberately preserves the existing estimate behavior.
  const daAmount = Math.round(basicNum * (daNum / 100));
  const totalMonthlyEmoluments = basicNum + daAmount;
  const dailyRate = totalMonthlyEmoluments / 30;
  const elEncashment = Math.round(dailyRate * elNum);
  const displayedElEncashment = isSurrender ? surrenderResult.encashment : elEncashment;
  const hplEncashment = isSurrender ? 0 : Math.round((dailyRate / 2) * hplNum);
  const totalGrossEncashment = isSurrender
    ? surrenderResult.encashment
    : elEncashment + hplEncashment;

  const handleModeChange = (nextMode: "surrender" | "retirement") => {
    if (nextMode === "surrender" && elDays !== "15" && elDays !== "30") {
      setElDays("15");
    }
    setMode(nextMode);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 font-sans">
      <div className="flex items-center justify-between">
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-inkSoft transition-colors hover:text-ink">
          ← Back to Utility Tools
        </Link>
        <Badge variant="tamarind" size="sm" shape="pill" dot>
          Runs 100% on device
        </Badge>
      </div>

      <div className="border-b border-hair pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Earned Leave Surrender &amp; Retirement Encashment Calculator
        </h1>
        <p lang="te" className="mt-1 font-telugu text-sm font-medium text-inkSoft">
          AP ఉపాధ్యాయులు మరియు ఉద్యోగుల కోసం లీవ్ సరెండర్, రిటైర్మెంట్ ఎన్‌క్యాష్‌మెంట్ అంచనా సాధనం
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Calculation Mode" htmlFor={modeId}>
              <NativeSelect
                id={modeId}
                value={mode}
                onChange={(event) => handleModeChange(event.target.value as "surrender" | "retirement")}
              >
                <option value="surrender">EL Surrender</option>
                <option value="retirement">Retirement Encashment</option>
              </NativeSelect>
            </Field>

            <Field label="Basic Pay" labelTe="మూల వేతనం" required htmlFor={basicPayId}>
              <Input id={basicPayId} type="number" min={0} mono value={basicPay} onChange={(event) => setBasicPay(event.target.value)} />
            </Field>

            <Field label="DA Percentage" labelTe="కరువు భత్యం %" required htmlFor={daPercentId}>
              <Input id={daPercentId} type="number" min={0} step="0.01" mono value={daPercent} onChange={(event) => setDaPercent(event.target.value)} />
            </Field>

            {isSurrender ? (
              <>
                <Field label="EL Days to Surrender" helperText="Choose the applicable 15-day or 30-day surrender option." htmlFor={elDaysId}>
                  <NativeSelect id={elDaysId} value={elDays} onChange={(event) => setElDays(event.target.value)}>
                    <option value="15">15 days</option>
                    <option value="30">30 days</option>
                  </NativeSelect>
                </Field>
                <aside className="rounded-lg border border-turmeric/30 bg-turmeric/10 p-3 text-xs leading-relaxed text-inkSoft" aria-label="EL surrender guidance">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-turmericDeep">Before you submit</span>
                  <p className="mt-1">15 days normally follows a 12-month gap; 30 days normally follows a 24-month gap. Sanction depends on your Service Register and the competent authority.</p>
                </aside>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="EL Days to Encash" htmlFor={elDaysId}>
                  <Input id={elDaysId} type="number" mono value={elDays} onChange={(event) => setElDays(event.target.value)} />
                </Field>
                <Field label="HPL Days (Half Pay)" htmlFor={hplDaysId}>
                  <Input id={hplDaysId} type="number" mono value={hplDays} onChange={(event) => setHplDays(event.target.value)} />
                </Field>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>{isSurrender ? "EL Surrender Estimate" : "Retirement Encashment Estimate"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              {isSurrender && !surrenderResult.valid ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 font-sans text-xs font-medium leading-relaxed text-red-600">
                  {surrenderResult.error}
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-inkSoft"><span>Basic Pay:</span><span className="font-bold text-ink">{formatCurrency(basicNum)}</span></div>
                  <div className="flex justify-between text-inkSoft"><span>DA ({daNum}%):</span><span className="font-bold text-ink">{formatCurrency(daAmount)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-ink"><span>Total Monthly Emoluments:</span><span>{formatCurrency(totalMonthlyEmoluments)}</span></div>
                  <div className="flex justify-between text-[11px] text-inkSoft"><span>Daily Emolument Rate (÷30):</span><span>{formatCurrency(dailyRate)} / day</span></div>
                  <div className="mt-4 space-y-1 rounded-lg bg-hair/30 p-3 text-xs">
                    <div className="flex justify-between text-inkSoft"><span>EL Encashment ({elNum} Days):</span><span className="font-bold text-ink">{formatCurrency(displayedElEncashment)}</span></div>
                    {!isSurrender && hplNum > 0 && (
                      <div className="flex justify-between text-inkSoft"><span>HPL Encashment ({hplNum} Half-Days):</span><span className="font-bold text-ink">{formatCurrency(hplEncashment)}</span></div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </div>
          <div className="flex items-baseline justify-between border-t border-hair bg-paper p-5 font-mono">
            <span className="text-xs font-bold uppercase tracking-wider text-inkSoft">
              {isSurrender ? "EL Surrender Estimate:" : "Retirement Encashment Estimate:"}
            </span>
            <span className="text-2xl font-bold text-tamarind">{formatCurrency(totalGrossEncashment)}</span>
          </div>
          {!isSurrender && (
            <p className="px-5 pb-4 text-[11px] leading-relaxed text-inkSoft">
              This retirement figure is an estimate. Confirm leave balances and eligibility with your Service Register and competent authority.
            </p>
          )}
        </Card>
      </div>

      <div className="space-y-4 border-t border-hair pt-6">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
          <span>📘</span> Leave Encashment Rules &amp; Guidance
        </h2>
        <Accordion items={LEAVE_FAQ_ITEMS} allowMultiple />
      </div>
    </div>
  );
}
