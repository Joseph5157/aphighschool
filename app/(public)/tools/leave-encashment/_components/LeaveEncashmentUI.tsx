"use client";

import { useState, useId } from "react";
import Link from "next/link";
import Accordion, { AccordionItemData } from "@/app/(public)/_components/Accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import Badge from "@/app/(public)/_components/Badge";
import Separator from "@/app/(public)/_components/Separator";

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

const LEAVE_FAQ_ITEMS: AccordionItemData[] = [
  {
    id: "el-surrender-rules",
    titleEn: "What are the rules for Earned Leave (EL) Surrender in AP & TS?",
    titleTe: "ఆర్న్డ్ లీవ్ (EL) సరెండర్ బిల్లు నిబంధనలు",
    badge: "EL Rules",
    badgeVariant: "tamarind",
    defaultOpen: true,
    content: (
      <div className="space-y-2">
        <p>
          State government teachers and employees can surrender Earned Leave (EL) for encashment as per state leave rules:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li><b>15 Days EL Surrender per fiscal year:</b> Allowed every 12 months.</li>
          <li><b>30 Days EL Surrender every alternate year:</b> Allowed once in 24 months.</li>
          <li><b>Calculation Formula:</b> (Basic Pay + DA) / 30 × Number of Surrender Days.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "retirement-encashment-cap",
    titleEn: "What is the maximum EL encashment limit at retirement?",
    titleTe: "రిటైర్మెంట్ సమయంలో గరిష్ట లీవ్ ఎన్‌క్యాష్‌మెంట్ పరిమితి ఎంత?",
    badge: "Retirement Cap",
    badgeVariant: "turmeric",
    content: (
      <div className="space-y-2">
        <p>
          At the time of superannuation retirement, a government employee can encash accumulated Earned Leave (EL) up to a maximum limit of <b>300 Days</b>.
        </p>
        <p>
          If EL balance is less than 300 days, Half Pay Leave (HPL) encashment can be combined up to the shortfall limit to reach the 300 days ceiling.
        </p>
      </div>
    ),
  },
];

export default function LeaveEncashmentUI() {
  const basicPayId = useId();
  const daPercentId = useId();
  const elDaysId = useId();
  const hplDaysId = useId();

  const [basicPay, setBasicPay] = useState<string>("52040");
  const [daPercent, setDaPercent] = useState<string>("33.67");
  const [elDays, setElDays] = useState<string>("15");
  const [hplDays, setHplDays] = useState<string>("0");

  const basicNum = parseFloat(basicPay) || 0;
  const daNum = parseFloat(daPercent) || 0;
  const elNum = parseFloat(elDays) || 0;
  const hplNum = parseFloat(hplDays) || 0;

  // Monthly Pay Head Total for Encashment: Basic + DA
  const daAmount = Math.round(basicNum * (daNum / 100));
  const totalMonthlyEmoluments = basicNum + daAmount;

  // Daily Rate = (Basic + DA) / 30
  const dailyRate = totalMonthlyEmoluments / 30;

  // EL Encashment = Daily Rate * EL Days
  const elEncashment = Math.round(dailyRate * elNum);

  // HPL Encashment = (Daily Rate / 2) * HPL Days
  const hplEncashment = Math.round((dailyRate / 2) * hplNum);

  const totalGrossEncashment = elEncashment + hplEncashment;

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
          Earned Leave (EL) & HPL Surrender Encashment Calculator
        </h1>
        <div lang="te" className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          ఏపీ & టిఎస్ ఉపాధ్యాయుల లీవ్ సరెండర్ ఎన్‌క్యాష్‌మెంట్ లెక్కించే సాధనం
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs Card */}
        <Card>
          <CardHeader>
            <CardTitle>Input Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Field label="Basic Pay" labelTe="మూల వేతనం" required htmlFor={basicPayId}>
              <Input
                id={basicPayId}
                type="number"
                mono
                value={basicPay}
                onChange={(e) => setBasicPay(e.target.value)}
              />
            </Field>

            <Field label="DA Percentage" labelTe="కరువు భత్యం %" required htmlFor={daPercentId}>
              <Input
                id={daPercentId}
                type="number"
                step="0.01"
                mono
                value={daPercent}
                onChange={(e) => setDaPercent(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="EL Days to Surrender" htmlFor={elDaysId}>
                <Input
                  id={elDaysId}
                  type="number"
                  mono
                  value={elDays}
                  onChange={(e) => setElDays(e.target.value)}
                />
              </Field>

              <Field label="HPL Days (Half Pay)" htmlFor={hplDaysId}>
                <Input
                  id={hplDaysId}
                  type="number"
                  mono
                  value={hplDays}
                  onChange={(e) => setHplDays(e.target.value)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle>Encashment Estimation</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 font-mono text-xs">
              <div className="flex justify-between text-inkSoft">
                <span>Basic Pay:</span>
                <span className="font-bold text-ink">{formatCurrency(basicNum)}</span>
              </div>
              <div className="flex justify-between text-inkSoft">
                <span>DA ({daNum}%):</span>
                <span className="font-bold text-ink">{formatCurrency(daAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-ink font-bold">
                <span>Total Monthly Emoluments:</span>
                <span>{formatCurrency(totalMonthlyEmoluments)}</span>
              </div>
              <div className="flex justify-between text-inkSoft text-[11px]">
                <span>Daily Emolument Rate (÷30):</span>
                <span>{formatCurrency(dailyRate)} / day</span>
              </div>

              <div className="mt-4 p-3 bg-hair/30 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between text-inkSoft">
                  <span>EL Encashment ({elNum} Days):</span>
                  <span className="font-bold text-ink">{formatCurrency(elEncashment)}</span>
                </div>
                {hplNum > 0 && (
                  <div className="flex justify-between text-inkSoft">
                    <span>HPL Encashment ({hplNum} Half-Days):</span>
                    <span className="font-bold text-ink">{formatCurrency(hplEncashment)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          <div className="p-5 border-t border-hair flex justify-between items-baseline font-mono bg-paper">
            <span className="text-xs text-inkSoft uppercase tracking-wider font-bold">
              Gross Encashment Bill:
            </span>
            <span className="text-2xl font-bold text-tamarind">
              {formatCurrency(totalGrossEncashment)}
            </span>
          </div>
        </Card>
      </div>

      {/* Accordion Rules */}
      <div className="space-y-4 pt-6 border-t border-hair">
        <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
          <span>📘</span> Leave Encashment Rules & Guidelines (సరెండర్ లీవ్ మార్గదర్శకాలు)
        </h2>
        <Accordion items={LEAVE_FAQ_ITEMS} allowMultiple={true} />
      </div>
    </div>
  );
}
