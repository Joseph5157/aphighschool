"use client";

import { useState, useId } from "react";
import Link from "next/link";

type CalculationType = "surrender" | "retirement";

const DA_PRESETS = [
  { label: "30.39% (Current AP DA)", value: 30.39 },
  { label: "26.39% (AP PRC 2022)", value: 26.39 },
  { label: "33.67% (TS / Revised)", value: 33.67 },
  { label: "Custom DA %", value: -1 },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function LeaveEncashmentUI() {
  const calcTypeId = useId();
  const basicPayId = useId();
  const daPresetId = useId();
  const customDaId = useId();
  const surrenderDaysId = useId();
  const customDaysId = useId();
  const hplDaysId = useId();

  const [calcType, setCalcType] = useState<CalculationType>("surrender");
  const [monthlyBasic, setMonthlyBasic] = useState<string>("52040");
  const [daSelect, setDaSelect] = useState<number>(30.39);
  const [customDa, setCustomDa] = useState<string>("30.39");

  // Surrender / Encashment Days
  const [surrenderDaysSelect, setSurrenderDaysSelect] = useState<number>(15);
  const [customDays, setCustomDays] = useState<string>("15");
  const [hplDays, setHplDays] = useState<string>("0");

  const basicNum = parseFloat(monthlyBasic) || 0;
  const daPct = daSelect === -1 ? parseFloat(customDa) || 0 : daSelect;
  const daAmount = (basicNum * daPct) / 100;
  const totalMonthlyPayForLeave = basicNum + daAmount;

  const daysToEncash =
    calcType === "surrender"
      ? surrenderDaysSelect === -1
        ? parseFloat(customDays) || 0
        : surrenderDaysSelect
      : Math.min(300, surrenderDaysSelect === -1 ? parseFloat(customDays) || 0 : surrenderDaysSelect);

  // Formulas
  const elEncashmentAmount = Math.round((totalMonthlyPayForLeave * daysToEncash) / 30);
  const hplNum = parseFloat(hplDays) || 0;
  const hplEncashmentAmount = Math.round(((basicNum / 2 + daAmount) * hplNum) / 30);
  const totalEncashment = elEncashmentAmount + (calcType === "retirement" ? hplEncashmentAmount : 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 font-sans">
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
          Leave Encashment & Surrender Calculator
        </h1>
        <div className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          సంపాదిత సెలవు సరండర్ / లీవ్ ఎన్‌క్యాష్‌మెంట్ బిల్లు గణన సాధనం
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-paperRaised border border-hair rounded-xl p-5 md:p-6 shadow-xs space-y-5">
        {/* Calculation Type Switcher */}
        <div>
          <label htmlFor={calcTypeId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1.5">
            Select Purpose (ఉద్దేశం ఎంచుకోండి) *
          </label>
          <div id={calcTypeId} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setCalcType("surrender");
                setSurrenderDaysSelect(15);
              }}
              className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all text-left border ${
                calcType === "surrender"
                  ? "bg-ink text-white border-ink shadow-xs"
                  : "bg-white border-hair text-inkSoft hover:text-ink"
              }`}
            >
              <div>EL Surrender Bill (15/30 Days)</div>
              <div className="text-[10px] opacity-75 font-sans mt-0.5 font-normal">
                వార్షిక సంపాదిత సెలవు సరండర్ బిల్లు
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setCalcType("retirement");
                setSurrenderDaysSelect(300);
              }}
              className={`py-3 px-4 rounded-xl font-mono text-xs font-bold transition-all text-left border ${
                calcType === "retirement"
                  ? "bg-ink text-white border-ink shadow-xs"
                  : "bg-white border-hair text-inkSoft hover:text-ink"
              }`}
            >
              <div>Retirement Leave Encashment</div>
              <div className="text-[10px] opacity-75 font-sans mt-0.5 font-normal">
                ఉద్యోగ విరమణ సమయములో లీవ్ ఎన్‌క్యాష్‌మెంట్
              </div>
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-hair/60">
          {/* Basic Pay */}
          <div>
            <label htmlFor={basicPayId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
              Monthly Basic Pay (బేసిక్ పే) ₹ *
            </label>
            <input
              id={basicPayId}
              type="number"
              value={monthlyBasic}
              onChange={(e) => setMonthlyBasic(e.target.value)}
              placeholder="e.g. 52040"
              className="w-full bg-white border border-hair rounded-lg px-3.5 py-2 text-sm text-ink outline-none focus:border-tamarind font-mono"
            />
          </div>

          {/* DA Rate */}
          <div>
            <label htmlFor={daPresetId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
              DA Rate % (కరువు భత్యం) *
            </label>
            <select
              id={daPresetId}
              value={daSelect}
              onChange={(e) => setDaSelect(parseFloat(e.target.value))}
              className="w-full bg-white border border-hair rounded-lg px-3 py-2 text-xs font-mono text-ink outline-none focus:border-tamarind"
            >
              {DA_PRESETS.map((p) => (
                <option key={p.label} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {daSelect === -1 && (
              <div className="mt-2">
                <label htmlFor={customDaId} className="sr-only">Custom DA Percent</label>
                <input
                  id={customDaId}
                  type="number"
                  step="0.01"
                  value={customDa}
                  onChange={(e) => setCustomDa(e.target.value)}
                  placeholder="Enter custom DA %"
                  className="w-full bg-white border border-hair rounded-lg px-3 py-1.5 text-xs font-mono text-ink outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Days to Encash */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={surrenderDaysId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
              {calcType === "surrender" ? "EL Surrender Days (రోజులు)" : "Earned Leave Days (Max 300)"} *
            </label>
            <select
              id={surrenderDaysId}
              value={surrenderDaysSelect}
              onChange={(e) => setSurrenderDaysSelect(parseInt(e.target.value, 10))}
              className="w-full bg-white border border-hair rounded-lg px-3 py-2 text-xs font-mono text-ink outline-none focus:border-tamarind"
            >
              {calcType === "surrender" ? (
                <>
                  <option value={15}>15 Days (Annual Surrender)</option>
                  <option value={30}>30 Days (Bi-Annual Surrender)</option>
                  <option value={-1}>Custom Days</option>
                </>
              ) : (
                <>
                  <option value={300}>300 Days (Maximum Capped Limit)</option>
                  <option value={240}>240 Days</option>
                  <option value={180}>180 Days</option>
                  <option value={-1}>Custom Days</option>
                </>
              )}
            </select>

            {surrenderDaysSelect === -1 && (
              <div className="mt-2">
                <label htmlFor={customDaysId} className="sr-only">Custom Encashment Days</label>
                <input
                  id={customDaysId}
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Enter number of days"
                  className="w-full bg-white border border-hair rounded-lg px-3 py-1.5 text-xs font-mono text-ink outline-none"
                />
              </div>
            )}
          </div>

          {calcType === "retirement" && (
            <div>
              <label htmlFor={hplDaysId} className="block font-mono text-[10px] uppercase font-bold text-inkSoft tracking-wider mb-1">
                Half Pay Leave (HPL) Days (హాఫ్ పే లీవ్ రోజులు)
              </label>
              <input
                id={hplDaysId}
                type="number"
                value={hplDays}
                onChange={(e) => setHplDays(e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-hair rounded-lg px-3 py-2 text-xs font-mono text-ink outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Result Display Panel */}
      <div className="bg-ink text-white rounded-xl p-6 shadow-md border-l-4 border-turmeric space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-mono text-[10px] text-[#9AA3B8] uppercase tracking-wider font-semibold">
              Estimated Total Encashment Amount
            </div>
            <div className="text-3xl font-bold text-turmeric tracking-tight font-mono mt-1">
              {formatCurrency(totalEncashment)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition-all"
          >
            🖨️ Print Bill Worksheet
          </button>
        </div>

        {/* Calculation Step Breakdown */}
        <div className="pt-4 border-t border-white/10 font-mono text-xs space-y-2">
          <div className="text-white/80 font-bold uppercase text-[10px] tracking-wider mb-1">
            Calculation Formula Breakdown
          </div>

          <div className="flex justify-between py-1 border-b border-white/10 text-white/70">
            <span>Basic Pay:</span>
            <span className="font-semibold text-white">{formatCurrency(basicNum)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/10 text-white/70">
            <span>DA ({daPct}%):</span>
            <span className="font-semibold text-white">{formatCurrency(daAmount)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/10 text-white/70">
            <span>Monthly Pay for Leave (Basic + DA):</span>
            <span className="font-semibold text-white">{formatCurrency(totalMonthlyPayForLeave)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/10 text-white/70">
            <span>EL Encashment ({daysToEncash} Days × Pay / 30):</span>
            <span className="font-semibold text-emerald-300">{formatCurrency(elEncashmentAmount)}</span>
          </div>

          {calcType === "retirement" && hplNum > 0 && (
            <div className="flex justify-between py-1 border-b border-white/10 text-white/70">
              <span>HPL Encashment ({hplNum} Days):</span>
              <span className="font-semibold text-emerald-300">{formatCurrency(hplEncashmentAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Note Card */}
      <div className="bg-paperRaised border border-hair rounded-xl p-5 shadow-xs text-xs space-y-2 text-inkSoft font-sans">
        <h3 className="font-bold text-ink text-sm">AP Teacher Leave Rules Reference</h3>
        <ul className="list-disc pl-4 space-y-1 text-[11px]">
          <li><strong>Formula:</strong> Encashment = <code>(Basic Pay + DA) × Surrender Days / 30</code>. HRA and CCA are not included in leave encashment calculations.</li>
          <li><strong>Annual Surrender:</strong> Teachers are permitted to surrender 15 days of Earned Leave per financial year.</li>
          <li><strong>Retirement Limit:</strong> Earned Leave encashment at the time of retirement is capped at a maximum of 300 days as per AP Govt orders.</li>
        </ul>
      </div>
    </div>
  );
}
