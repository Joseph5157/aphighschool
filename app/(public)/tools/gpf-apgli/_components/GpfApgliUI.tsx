"use client";

import { useState, useId } from "react";
import Link from "next/link";

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

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
  const serviceNum = parseFloat(serviceYears) || 0;
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
        <span className="font-mono text-[9px] uppercase tracking-wider bg-tamarind/10 text-tamarind border border-tamarind/20 px-2.5 py-0.5 rounded-full font-semibold">
          Client-Side Tool • Runs 100% On Device
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-hair pb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          GPF & APGLI Loan & Interest Estimator
        </h1>
        <div className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          జీపీఎఫ్ లోన్ అర్హత మరియు APGLI ప్రీమియం స్లాబ్ పరిశీలన సాధనం
        </div>
      </div>

      {/* Grid: GPF & APGLI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: GPF Interest & Loan Eligibility */}
        <div className="bg-paperRaised border border-hair rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-hair pb-3">
            <h2 className="font-bold text-base text-ink">1. GPF Interest & Part-Final Loan</h2>
            <div className="font-telugu text-xs text-inkSoft">జీపీఎఫ్ నిల్వ & పార్ట్-ఫైనల్ విత్‌డ్రావల్ అర్హత</div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor={gpfBalId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                Current Opening GPF Balance (జీపీఎఫ్ నిల్వ) ₹ *
              </label>
              <input
                id={gpfBalId}
                type="number"
                value={gpfBalance}
                onChange={(e) => setGpfBalance(e.target.value)}
                className="w-full bg-white border border-hair rounded-lg px-3 py-2 text-xs font-mono text-ink outline-none focus:border-tamarind"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={monthlySubId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                  Monthly Subscription ₹
                </label>
                <input
                  id={monthlySubId}
                  type="number"
                  value={monthlySubscription}
                  onChange={(e) => setMonthlySubscription(e.target.value)}
                  className="w-full bg-white border border-hair rounded-lg px-3 py-1.5 text-xs font-mono text-ink outline-none"
                />
              </div>

              <div>
                <label htmlFor={interestRateId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                  Interest Rate %
                </label>
                <input
                  id={interestRateId}
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-white border border-hair rounded-lg px-3 py-1.5 text-xs font-mono text-ink outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor={serviceYearsId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                Total Service Completed (Years)
              </label>
              <input
                id={serviceYearsId}
                type="number"
                value={serviceYears}
                onChange={(e) => setServiceYears(e.target.value)}
                className="w-full bg-white border border-hair rounded-lg px-3 py-1.5 text-xs font-mono text-ink outline-none"
              />
            </div>
          </div>

          {/* GPF Output Summary */}
          <div className="bg-ink text-white rounded-xl p-4 font-mono text-xs space-y-2 mt-4">
            <div className="text-[10px] text-white/60 uppercase font-bold tracking-wider border-b border-white/10 pb-1">
              Estimated Annual GPF Growth
            </div>

            <div className="flex justify-between text-white/80">
              <span>Annual Subscription:</span>
              <span>{formatCurrency(annualSub)}</span>
            </div>

            <div className="flex justify-between text-white/80">
              <span>Est. Interest @ {rateNum}%:</span>
              <span className="text-emerald-300">+{formatCurrency(estimatedInterest)}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-turmeric pt-1 border-t border-white/10">
              <span>Closing Balance (1 Yr):</span>
              <span>{formatCurrency(closingBalance1Yr)}</span>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] space-y-1">
              <div className="text-white/70 font-bold uppercase">Part-Final Withdrawal Limits:</div>
              <div className="flex justify-between text-white">
                <span>Standard (75% of Balance):</span>
                <span className="font-bold text-emerald-300">{formatCurrency(maxPartFinal75)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Superannuation 1 Yr prior (90%):</span>
                <span className="font-bold text-emerald-300">{formatCurrency(maxPartFinal90)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: APGLI Slab Matcher */}
        <div className="bg-paperRaised border border-hair rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-hair pb-3">
            <h2 className="font-bold text-base text-ink">2. APGLI Compulsory Premium Slab</h2>
            <div className="font-telugu text-xs text-inkSoft">ఏపీజీఎల్ఐ కనీస ప్రీమియం స్లాబ్ పరిశీలన</div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor={basicPayId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                Monthly Basic Pay ₹ *
              </label>
              <input
                id={basicPayId}
                type="number"
                value={basicPay}
                onChange={(e) => setBasicPay(e.target.value)}
                className="w-full bg-white border border-hair rounded-lg px-3 py-2 text-xs font-mono text-ink outline-none focus:border-tamarind"
              />
            </div>

            <div>
              <label htmlFor={currPremiumId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                Current Monthly APGLI Premium Cut (₹)
              </label>
              <input
                id={currPremiumId}
                type="number"
                value={currentPremium}
                onChange={(e) => setCurrentPremium(e.target.value)}
                className="w-full bg-white border border-hair rounded-lg px-3 py-1.5 text-xs font-mono text-ink outline-none"
              />
            </div>
          </div>

          {/* APGLI Result Card */}
          <div className="bg-paper border border-hair rounded-xl p-4 font-mono text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-hair/50 pb-2">
              <span className="text-inkSoft font-semibold text-[10px] uppercase">Compulsory Minimum Slab:</span>
              <span className="font-bold text-tamarind text-sm">{formatCurrency(recommendedApgliPremium)}/mo</span>
            </div>

            {parseFloat(currentPremium) < recommendedApgliPremium ? (
              <div className="bg-amber-100 border border-amber-300 text-amber-900 rounded-lg p-2 text-[11px] font-sans">
                ⚠️ <strong>Enhancement Required:</strong> Your current deduction ({formatCurrency(parseFloat(currentPremium))}) is less than the mandatory slab for basic pay {formatCurrency(basicNum)}. Please apply for APGLI premium enhancement.
              </div>
            ) : (
              <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg p-2 text-[11px] font-sans">
                ✓ <strong>Compliant:</strong> Your current deduction meets or exceeds the mandatory APGLI slab limit.
              </div>
            )}

            <div className="text-[10px] text-inkSoft font-sans space-y-0.5 pt-1">
              <div className="font-bold text-ink">APGLI Mandatory Slabs Reference:</div>
              <div>• Basic Pay up to ₹25,220: ₹500/mo</div>
              <div>• Basic Pay ₹25,221 – ₹35,570: ₹750/mo</div>
              <div>• Basic Pay ₹35,571 – ₹48,440: ₹1,000/mo</div>
              <div>• Basic Pay ₹48,441 – ₹67,990: ₹1,400/mo</div>
              <div>• Basic Pay Above ₹67,990: ₹2,000/mo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
