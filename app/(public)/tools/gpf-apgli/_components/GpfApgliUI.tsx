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

const GPF_FAQ_ITEMS: AccordionItemData[] = [
  {
    id: "gpf-loan-rules",
    titleEn: "What are the rules for GPF Part-Final Loan vs Temporary Advance?",
    titleTe: "జీపీఎఫ్ పార్ట్-ఫైనల్ విత్‌డ్రావల్ మరియు తాత్కాలిక అడ్వాన్స్ నిబంధనలు",
    badge: "GPF Rules",
    badgeVariant: "tamarind",
    defaultOpen: true,
    content: (
      <div className="space-y-2">
        <p>
          <b>Temporary Advance (TA):</b> Can be taken after completing 1 year of service. Repayable in 12 to 36 equal monthly installments.
        </p>
        <p>
          <b>Part-Final Withdrawal (PF):</b> Non-refundable withdrawal available after completing 15 years of service (or within 10 years of retirement).
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li><b>Up to 75% of credit balance:</b> Allowed for higher education, marriage, or medical illness of self/dependents.</li>
          <li><b>Up to 90% of credit balance:</b> Allowed within 12 months prior to retirement date.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "apgli-slab-rules",
    titleEn: "How is APGLI mandatory premium slab matched with Basic Pay?",
    titleTe: "బేసిక్ పే ఆధారంగా APGLI ప్రీమియం స్లాబ్ ఎలా నిర్ణయిస్తారు?",
    badge: "APGLI Slabs",
    badgeVariant: "turmeric",
    content: (
      <div className="space-y-2">
        <p>
          APGLI (Andhra Pradesh Government Life Insurance) is mandatory for all AP state employees up to 55 years of age. Minimum monthly premium is fixed as per Basic Pay slabs:
        </p>
        <div className="bg-paper border border-hair rounded-lg p-3 font-mono text-xs space-y-1">
          <div>• Basic Pay up to ₹25,220 ➔ Min Premium: ₹500</div>
          <div>• Basic Pay ₹25,221 to ₹35,570 ➔ Min Premium: ₹750</div>
          <div>• Basic Pay ₹35,571 to ₹48,440 ➔ Min Premium: ₹1,000</div>
          <div>• Basic Pay ₹48,441 to ₹67,980 ➔ Min Premium: ₹1,400</div>
          <div>• Basic Pay ₹67,981 & above ➔ Min Premium: ₹2,000</div>
        </div>
      </div>
    ),
  },
  {
    id: "gpf-interest-tax",
    titleEn: "Is GPF interest taxable for government employees?",
    titleTe: "జీపీఎఫ్ వడ్డీకి పన్ను వర్తిస్తుందా?",
    badge: "Taxation",
    badgeVariant: "neutral",
    content: (
      <div className="space-y-2">
        <p>
          Under Section 10(11) of the Income Tax Act, interest on GPF contributions up to <b>₹5,00,000 per annum</b> for government employees is completely tax-free.
        </p>
        <p>
          If annual employee GPF contribution exceeds ₹5 Lakhs, interest earned on the excess contribution amount above ₹5 Lakhs is taxable under 'Income from Other Sources'.
        </p>
      </div>
    ),
  },
];

export default function GpfApgliUI() {
  const gpfBalId = useId();
  const monthlySubId = useId();
  const interestRateId = useId();
  const serviceYearsId = useId();
  const basicPayId = useId();
  const currPremiumId = useId();

  // State: GPF
  const [gpfBalance, setGpfBalance] = useState<string>("450000");
  const [monthlySubscription, setMonthlySubscription] = useState<string>("6000");
  const [interestRate, setInterestRate] = useState<string>("7.1");
  const [serviceYears, setServiceYears] = useState<string>("16");

  // State: APGLI
  const [basicPay, setBasicPay] = useState<string>("52040");
  const [currentPremium, setCurrentPremium] = useState<string>("1400");

  const balNum = parseFloat(gpfBalance) || 0;
  const subNum = parseFloat(monthlySubscription) || 0;
  const rateNum = parseFloat(interestRate) || 7.1;
  const basicNum = parseFloat(basicPay) || 0;

  // GPF Annual Accumulation & Interest
  const annualSub = subNum * 12;
  const estimatedInterest = Math.round((balNum + annualSub / 2) * (rateNum / 100));
  const closingBalance1Yr = balNum + annualSub + estimatedInterest;

  // GPF Loan / Part-Final Withdrawal Limits
  const maxPartFinal75 = Math.round(balNum * 0.75);
  const maxPartFinal90 = Math.round(balNum * 0.90);

  // APGLI Slabs
  let recommendedApgliPremium = 500;
  if (basicNum >= 67990) recommendedApgliPremium = 2000;
  else if (basicNum >= 48441) recommendedApgliPremium = 1400;
  else if (basicNum >= 35571) recommendedApgliPremium = 1000;
  else if (basicNum >= 25221) recommendedApgliPremium = 750;

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
          GPF & APGLI Loan & Interest Estimator
        </h1>
        <div lang="te" className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          జీపీఎఫ్ లోన్ అర్హత మరియు APGLI ప్రీమియం స్లాబ్ పరిశీలన సాధనం
        </div>
      </div>

      {/* Grid: GPF & APGLI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: GPF Interest & Loan Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle>1. GPF Interest & Part-Final Loan</CardTitle>
            <div lang="te" className="font-telugu text-xs text-inkSoft">జీపీఎఫ్ నిల్వ & పార్ట్-ఫైనల్ విత్‌డ్రావల్ అర్హత</div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Field label="Current Opening GPF Balance" labelTe="జీపీఎఫ్ నిల్వ" required htmlFor={gpfBalId}>
              <Input id={gpfBalId} type="number" mono value={gpfBalance} onChange={(e) => setGpfBalance(e.target.value)} />
            </Field>

            <Field label="Monthly Subscription" labelTe="నెలవారీ చెల్లింపు" required htmlFor={monthlySubId}>
              <Input id={monthlySubId} type="number" mono value={monthlySubscription} onChange={(e) => setMonthlySubscription(e.target.value)} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Interest Rate (% p.a.)" htmlFor={interestRateId}>
                <Input id={interestRateId} type="number" step="0.1" mono value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
              </Field>
              <Field label="Service Completed (Yrs)" htmlFor={serviceYearsId}>
                <Input id={serviceYearsId} type="number" mono value={serviceYears} onChange={(e) => setServiceYears(e.target.value)} />
              </Field>
            </div>

            <Separator />

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-inkSoft">
                <span>Annual Subscription:</span>
                <span className="font-bold text-ink">{formatCurrency(annualSub)}</span>
              </div>
              <div className="flex justify-between text-inkSoft">
                <span>Estimated Interest (1 Yr @ {rateNum}%):</span>
                <span className="font-bold text-tamarind">{formatCurrency(estimatedInterest)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-ink font-bold">
                <span>Estimated Closing Balance:</span>
                <span className="text-sm text-ink">{formatCurrency(closingBalance1Yr)}</span>
              </div>

              <div className="mt-4 p-3 bg-hair/30 rounded-lg space-y-1 text-[11px]">
                <div className="font-bold text-ink font-sans">Part-Final Loan Limits / విత్‌డ్రావల్ పరిమితులు:</div>
                <div className="flex justify-between text-inkSoft">
                  <span>75% Max Part-Final Limit:</span>
                  <span className="font-bold text-ink">{formatCurrency(maxPartFinal75)}</span>
                </div>
                <div className="flex justify-between text-inkSoft">
                  <span>90% Retirement Limit:</span>
                  <span className="font-bold text-ink">{formatCurrency(maxPartFinal90)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: APGLI Slab Matcher */}
        <Card>
          <CardHeader>
            <CardTitle>2. APGLI Premium Slab Matcher</CardTitle>
            <div lang="te" className="font-telugu text-xs text-inkSoft">బేసిక్ పే ఆధారంగా APGLI ప్రీమియం స్లాబ్</div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Field label="Current Basic Pay" labelTe="మూల వేతనం" required htmlFor={basicPayId}>
              <Input id={basicPayId} type="number" mono value={basicPay} onChange={(e) => setBasicPay(e.target.value)} />
            </Field>

            <Field label="Current Deducted Premium" htmlFor={currPremiumId}>
              <Input id={currPremiumId} type="number" mono value={currentPremium} onChange={(e) => setCurrentPremium(e.target.value)} />
            </Field>

            <Separator />

            <div className="space-y-3">
              <div className="p-3 bg-hair/30 rounded-lg space-y-1 text-xs">
                <div className="text-inkSoft font-mono text-[11px]">Recommended Min Premium:</div>
                <div className="text-xl font-bold text-ink font-mono">{formatCurrency(recommendedApgliPremium)} / month</div>
                <div className="text-[11px] text-inkSoft/80 font-sans mt-1 leading-snug">
                  As per AP Government revised pay scale slabs, employees with Basic Pay ₹{basicNum.toLocaleString("en-IN")} must deduct at least {formatCurrency(recommendedApgliPremium)}.
                </div>
              </div>

              {parseFloat(currentPremium) < recommendedApgliPremium && (
                <div className="p-3 bg-tamarind/10 border border-tamarind/30 rounded-lg text-xs text-tamarind font-medium leading-relaxed">
                  ⚠️ Your current premium ({formatCurrency(parseFloat(currentPremium) || 0)}) is below the recommended slab minimum ({formatCurrency(recommendedApgliPremium)}). Consider submitting a proposal for policy enhancement.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accordion Rules & FAQs */}
      <div className="space-y-4 pt-6 border-t border-hair">
        <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
          <span>📘</span> GPF & APGLI Guidelines & FAQs (నిబంధనలు & వివరణలు)
        </h2>
        <Accordion items={GPF_FAQ_ITEMS} allowMultiple={true} />
      </div>
    </div>
  );
}
