"use client";

import { useState } from "react";
import Link from "next/link";

type Regime = "new" | "old";

type TaxBreakdown = {
  grossSalary: number;
  standardDeduction: number;
  hraExemption: number;
  totalDeductions: number;
  taxableIncome: number;
  taxBeforeCess: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  finalTax: number;
};

function calculateTax(salary: number, regime: Regime, hra: number): TaxBreakdown {
  const grossSalary = Math.max(0, salary);

  if (regime === "new") {
    const standardDeduction = 75000;
    const hraExemption = 0;
    const totalDeductions = standardDeduction;
    const taxableIncome = Math.max(0, grossSalary - totalDeductions);

    let taxBeforeCess = 0;

    if (taxableIncome <= 700000) {
      taxBeforeCess = 0;
    } else {
      if (taxableIncome > 400000) {
        taxBeforeCess += Math.min(taxableIncome - 400000, 400000) * 0.05;
      }
      if (taxableIncome > 800000) {
        taxBeforeCess += Math.min(taxableIncome - 800000, 400000) * 0.1;
      }
      if (taxableIncome > 1200000) {
        taxBeforeCess += Math.min(taxableIncome - 1200000, 400000) * 0.15;
      }
      if (taxableIncome > 1600000) {
        taxBeforeCess += Math.min(taxableIncome - 1600000, 400000) * 0.2;
      }
      if (taxableIncome > 2000000) {
        taxBeforeCess += Math.min(taxableIncome - 2000000, 400000) * 0.25;
      }
      if (taxableIncome > 2400000) {
        taxBeforeCess += (taxableIncome - 2400000) * 0.3;
      }
    }

    const rebate87A = taxableIncome <= 700000 ? taxBeforeCess : 0;
    const taxAfterRebate = Math.max(0, taxBeforeCess - rebate87A);
    const cess = Math.round(taxAfterRebate * 0.04);
    const finalTax = Math.round(taxAfterRebate + cess);

    return {
      grossSalary,
      standardDeduction,
      hraExemption,
      totalDeductions,
      taxableIncome,
      taxBeforeCess,
      rebate87A,
      taxAfterRebate,
      cess,
      finalTax,
    };
  } else {
    // Old Regime
    const standardDeduction = 50000;
    const hraExemption = Math.max(0, hra);
    const totalDeductions = standardDeduction + hraExemption;
    const taxableIncome = Math.max(0, grossSalary - totalDeductions);

    let taxBeforeCess = 0;

    if (taxableIncome <= 500000) {
      taxBeforeCess = 0;
    } else {
      if (taxableIncome > 250000) {
        taxBeforeCess += Math.min(taxableIncome - 250000, 250000) * 0.05;
      }
      if (taxableIncome > 500000) {
        taxBeforeCess += Math.min(taxableIncome - 500000, 500000) * 0.2;
      }
      if (taxableIncome > 1000000) {
        taxBeforeCess += (taxableIncome - 1000000) * 0.3;
      }
    }

    const rebate87A = taxableIncome <= 500000 ? taxBeforeCess : 0;
    const taxAfterRebate = Math.max(0, taxBeforeCess - rebate87A);
    const cess = Math.round(taxAfterRebate * 0.04);
    const finalTax = Math.round(taxAfterRebate + cess);

    return {
      grossSalary,
      standardDeduction,
      hraExemption,
      totalDeductions,
      taxableIncome,
      taxBeforeCess,
      rebate87A,
      taxAfterRebate,
      cess,
      finalTax,
    };
  }
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function TaxCalculatorUI() {
  const [salaryInput, setSalaryInput] = useState<string>("");
  const [regime, setRegime] = useState<Regime>("new");
  const [hraInput, setHraInput] = useState<string>("");

  const salaryNum = parseFloat(salaryInput) || 0;
  const hraNum = parseFloat(hraInput) || 0;

  const result = salaryNum > 0 ? calculateTax(salaryNum, regime, hraNum) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Navigation */}
      <div>
        <Link
          href="/tools"
          className="text-xs font-mono text-inkSoft hover:text-ink transition-colors flex items-center gap-1"
        >
          ← Back to Utility Tools
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-hair pb-4">
        <h1 className="text-xl font-bold text-ink tracking-tight">
          Income Tax Calculator
        </h1>
        <div className="font-telugu text-sm text-inkSoft mt-0.5 font-medium">
          ఆదాయపు పన్ను గణన సాధనం
        </div>

        <div className="mt-2.5">
          <span className="font-mono text-[9px] uppercase tracking-wider bg-tamarind text-white px-2.5 py-0.5 rounded-full font-semibold inline-block">
            RUNS ON YOUR DEVICE — NO DATA SENT
          </span>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-paperRaised border border-hair rounded-xl p-5 md:p-6 space-y-5 shadow-xs">
        {/* Field 1: Salary */}
        <div>
          <label className="block font-mono uppercase text-[9.5px] font-bold text-inkSoft tracking-wider mb-1.5">
            Annual Gross Salary (₹) *
          </label>
          <input
            type="number"
            value={salaryInput}
            onChange={(e) => setSalaryInput(e.target.value)}
            placeholder="e.g. 840000"
            className="w-full bg-white border border-hair rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/50 font-mono transition-all"
            min="0"
          />
        </div>

        {/* Field 2: Regime Toggle */}
        <div>
          <label className="block font-mono uppercase text-[9.5px] font-bold text-inkSoft tracking-wider mb-1.5">
            Tax Regime *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRegime("new")}
              className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all ${
                regime === "new"
                  ? "bg-ink text-white shadow-xs"
                  : "bg-white border border-hair text-inkSoft hover:text-ink"
              }`}
            >
              New Regime (FY 25-26)
            </button>
            <button
              type="button"
              onClick={() => setRegime("old")}
              className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all ${
                regime === "old"
                  ? "bg-ink text-white shadow-xs"
                  : "bg-white border border-hair text-inkSoft hover:text-ink"
              }`}
            >
              Old Regime
            </button>
          </div>
        </div>

        {/* Field 3: HRA Exemption (Old Regime Only) */}
        {regime === "old" && (
          <div className="pt-2 border-t border-hair/60">
            <label className="block font-mono uppercase text-[9.5px] font-bold text-inkSoft tracking-wider mb-1.5">
              HRA Exemption Claimed (₹)
            </label>
            <input
              type="number"
              value={hraInput}
              onChange={(e) => setHraInput(e.target.value)}
              placeholder="0"
              className="w-full bg-white border border-hair rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/50 font-mono transition-all"
              min="0"
            />
            <span className="text-[9px] text-[#9C9788] font-mono mt-1 block">
              Leave 0 if not applicable
            </span>
          </div>
        )}
      </div>

      {/* Result Panel (Only when salary > 0) */}
      {result && (
        <section aria-label="Tax Calculation Result">
          <div className="bg-ink text-white rounded-xl p-6 shadow-md border-l-4 border-turmeric">
            <div className="font-mono text-[9px] text-[#9AA3B8] uppercase tracking-wider font-semibold block mb-1">
              Estimated Tax Payable
            </div>
            <div className="text-3xl font-bold text-turmeric tracking-tight font-mono">
              {formatCurrency(result.finalTax)}
            </div>
            <div className="font-mono text-[9.5px] text-[#9AA3B8] mt-1 block">
              FY 2025-26 · AY 2026-27 · {regime === "new" ? "New Regime" : "Old Regime"}
            </div>

            {/* Breakdown Table */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-1.5">
              <div className="font-mono text-[9.5px] uppercase font-bold text-paper/90 tracking-wider mb-2">
                Detailed Calculation Breakdown
              </div>

              <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                <span>Gross Annual Salary:</span>
                <span className="font-semibold text-white">{formatCurrency(result.grossSalary)}</span>
              </div>

              <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                <span>Standard Deduction:</span>
                <span className="text-emerald-300">- {formatCurrency(result.standardDeduction)}</span>
              </div>

              {regime === "old" && result.hraExemption > 0 && (
                <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                  <span>HRA Exemption:</span>
                  <span className="text-emerald-300">- {formatCurrency(result.hraExemption)}</span>
                </div>
              )}

              <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                <span>Net Taxable Income:</span>
                <span className="font-semibold text-white">{formatCurrency(result.taxableIncome)}</span>
              </div>

              <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                <span>Base Tax (Slabs):</span>
                <span>{formatCurrency(result.taxBeforeCess)}</span>
              </div>

              {result.rebate87A > 0 && (
                <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                  <span>Rebate u/s 87A:</span>
                  <span className="text-emerald-300">- {formatCurrency(result.rebate87A)}</span>
                </div>
              )}

              <div className="font-mono text-[9px] text-paper/80 py-1 border-t border-white/10 flex justify-between">
                <span>Health & Education Cess (4%):</span>
                <span>{formatCurrency(result.cess)}</span>
              </div>

              <div className="font-mono text-[10px] text-turmeric font-bold py-1.5 border-t border-white/20 flex justify-between">
                <span>Total Tax Payable:</span>
                <span>{formatCurrency(result.finalTax)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <footer>
        <p className="text-[9px] text-[#A39B85] italic font-sans leading-normal">
          Estimate only — for official filing use the Income Tax Department e-filing portal (incometax.gov.in). Consult a tax professional for advice specific to your situation.
        </p>
      </footer>
    </div>
  );
}
