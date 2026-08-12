"use client";

import { useState, useId } from "react";
import Link from "next/link";
import Accordion, { AccordionItemData } from "@/app/(public)/_components/Accordion";
import Button from "@/app/(public)/_components/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import NativeSelect from "@/app/(public)/_components/NativeSelect";
import Separator from "@/app/(public)/_components/Separator";

type FinancialYear = "2023-24" | "2024-25" | "2025-26";
type DocumentView =
  | "calculator"
  | "annexure1"
  | "annexure2"
  | "form16a"
  | "form16b"
  | "form12bb"
  | "form12ba"
  | "rentReceipt"
  | "printAll";

const DA_PRESETS = [
  { label: "20.02% (Jan-23 DA)", value: 20.02 },
  { label: "22.75% (Jul-23 DA)", value: 22.75 },
  { label: "26.39% (AP PRC 2022)", value: 26.39 },
  { label: "30.39% (AP Current)", value: 30.39 },
  { label: "Custom DA %", value: -1 },
];

const HRA_PRESETS = [
  { label: "10% (Town / Mandal)", value: 10 },
  { label: "8% (Rural)", value: 8 },
  { label: "16% (District HQ)", value: 16 },
  { label: "24% (Corporation)", value: 24 },
  { label: "Custom HRA %", value: -1 },
];

const MONTHS_LIST = [
  { m: "Mar-2023", daAdd: 0 },
  { m: "Apr-2023", daAdd: 0 },
  { m: "May-2023", daAdd: 0 },
  { m: "Jun-2023", daAdd: 0 },
  { m: "Jul-2023", daAdd: 2.73 },
  { m: "Aug-2023", daAdd: 2.73 },
  { m: "Sep-2023", daAdd: 2.73 },
  { m: "Oct-2023", daAdd: 2.73 },
  { m: "Nov-2023", daAdd: 6.37 },
  { m: "Dec-2023", daAdd: 6.37 },
  { m: "Jan-2024", daAdd: 6.37 },
  { m: "Feb-2024", daAdd: 6.37 },
];

function calcSurcharge(taxableIncome: number, baseTax: number): number {
  if (taxableIncome > 50000000) return Math.round(baseTax * 0.37);
  if (taxableIncome > 20000000) return Math.round(baseTax * 0.25);
  if (taxableIncome > 10000000) return Math.round(baseTax * 0.15);
  if (taxableIncome > 5000000) return Math.round(baseTax * 0.10);
  return 0;
}

function fmt(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

function n(s: string): number {
  return parseFloat(s) || 0;
}

function OfficialRow({
  label,
  value,
  bold = false,
  sub = false,
  highlight = false,
}: {
  label: string;
  value?: number;
  bold?: boolean;
  sub?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1fr_130px] border-b border-gray-300 text-xs leading-normal font-['Arial','Segoe_UI',Calibri,sans-serif] ${
        highlight ? "bg-gray-100 font-bold text-black" : "text-black"
      }`}
    >
      <div className={`${bold ? "font-bold text-black" : "text-gray-900"} ${sub ? "pl-5 text-gray-800" : "pl-2"} py-1 border-r border-black pr-2`}>
        {label}
      </div>
      <div className={`text-right py-1 pr-2 tabular-nums ${bold ? "font-bold text-black" : "text-black"}`}>
        {value !== undefined ? fmt(value) : ""}
      </div>
    </div>
  );
}

function InputF({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink leading-tight"
      />
    </div>
  );
}

function NumF({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">{label} (₹)</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink tabular-nums leading-tight"
      />
    </div>
  );
}

export default function TaxCalculatorUI() {
  const fyId = useId();
  const [activeTab, setActiveTab] = useState<DocumentView>("calculator");
  const [fy, setFy] = useState<FinancialYear>("2023-24");

  // Employee Details
  const [empName, setEmpName] = useState("K S S PRASAD");
  const [empFather, setEmpFather] = useState("");
  const [empDesig, setEmpDesig] = useState("School Assistant");
  const [empSchool, setEmpSchool] = useState("Z.P. High School");
  const [empPlace, setEmpPlace] = useState("Tenali");
  const [empMandal, setEmpMandal] = useState("Tenali");
  const [empDist, setEmpDist] = useState("Guntur");
  const [empPan, setEmpPan] = useState("");
  const [empTid, setEmpTid] = useState("");
  const [empFrom, setEmpFrom] = useState("01/04/2023");
  const [empTo, setEmpTo] = useState("31/03/2024");

  // DDO / Employer Details
  const [ddoName, setDdoName] = useState("");
  const [ddoDesig, setDdoDesig] = useState("Headmaster / Principal");
  const [ddoTan, setDdoTan] = useState("");
  const [ddoPan, setDdoPan] = useState("");
  const [citCity, setCitCity] = useState("Vijayawada");
  const [citPin, setCitPin] = useState("520001");
  const [certNo, setCertNo] = useState("");
  const [certDate, setCertDate] = useState("");

  // Quarterly TDS Details
  const [q1Paid, setQ1Paid] = useState("0");
  const [q1Ded, setQ1Ded] = useState("0");
  const [q1Dep, setQ1Dep] = useState("0");
  const [q1Rec, setQ1Rec] = useState("");
  const [q2Paid, setQ2Paid] = useState("0");
  const [q2Ded, setQ2Ded] = useState("0");
  const [q2Dep, setQ2Dep] = useState("0");
  const [q2Rec, setQ2Rec] = useState("");
  const [q3Paid, setQ3Paid] = useState("0");
  const [q3Ded, setQ3Ded] = useState("0");
  const [q3Dep, setQ3Dep] = useState("0");
  const [q3Rec, setQ3Rec] = useState("");
  const [q4Paid, setQ4Paid] = useState("0");
  const [q4Ded, setQ4Ded] = useState("0");
  const [q4Dep, setQ4Dep] = useState("0");
  const [q4Rec, setQ4Rec] = useState("");

  // BIN Details (for Govt Deductors)
  const [bin24G, setBin24G] = useState("");
  const [binSerial, setBinSerial] = useState("");
  const [binDate, setBinDate] = useState("");

  // Salary Inputs
  const [basic, setBasic] = useState("69020");
  const [daSelect, setDaSelect] = useState<number>(20.02);
  const [customDa, setCustomDa] = useState("20.02");
  const [hraSelect, setHraSelect] = useState<number>(10);
  const [customHra, setCustomHra] = useState("10");
  const [surrender, setSurrender] = useState("0");
  const [perq17_2, setPerq17_2] = useState("0");
  const [profit17_3, setProfit17_3] = useState("0");
  const [otherEmpSal, setOtherEmpSal] = useState("0");

  // Sec 10 Exemptions
  const [houseStatus, setHouseStatus] = useState<"Rented" | "Own">("Own");
  const [rentPaid, setRentPaid] = useState("0");
  const [ltcEx, setLtcEx] = useState("0");
  const [gratuityEx, setGratuityEx] = useState("0");
  const [commutedEx, setCommutedEx] = useState("0");
  const [leaveEnEx, setLeaveEnEx] = useState("0");

  // 80C Deductions
  const [gpf, setGpf] = useState("0");
  const [apgli, setApgli] = useState("0");
  const [gis, setGis] = useState("0");
  const [tuition, setTuition] = useState("0");
  const [hlPrincipal, setHlPrincipal] = useState("0");
  const [lic, setLic] = useState("0");
  const [pli, setPli] = useState("0");
  const [ppf, setPpf] = useState("0");
  const [s80ccc, setS80ccc] = useState("0");
  const [s80ccd1, setS80ccd1] = useState("0");
  const [s80ccd1b, setS80ccd1b] = useState("0");
  const [s80ccd2, setS80ccd2] = useState("0");

  // Other Deductions & Allowances
  const [pt, setPt] = useState("2400");
  const [s80d, setS80d] = useState("0");
  const [s24b, setS24b] = useState("0");
  const [s80e, setS80e] = useState("0");
  const [s80eeb, setS80eeb] = useState("0");
  const [s80u, setS80u] = useState("0");
  const [s80g, setS80g] = useState("0");
  const [s80tta, setS80tta] = useState("0");
  const [hpLoss, setHpLoss] = useState("0");
  const [otherSrc, setOtherSrc] = useState("0");
  const [reliefU89, setReliefU89] = useState("0");

  // Landlord & Lender Information
  const [llName, setLlName] = useState("K S S PRASAD");
  const [llAddr, setLlAddr] = useState("Tenali, Guntur District");
  const [llPan, setLlPan] = useState("");
  const [lenderName, setLenderName] = useState("State Bank of India");
  const [lenderAddr, setLenderAddr] = useState("");
  const [lenderPan, setLenderPan] = useState("");
  const [lenderType, setLenderType] = useState("Financial Institution");
  const [ltcAmt, setLtcAmt] = useState("0");
  const [ltcEv, setLtcEv] = useState("Travel tickets / bills");
  const [regime, setRegime] = useState<"old" | "new">("old");

  // ── Computations ──
  const basicNum = n(basic);
  const daPct = daSelect === -1 ? n(customDa) : daSelect;
  const hraPct = hraSelect === -1 ? n(customHra) : hraSelect;

  const rows = MONTHS_LIST.map((item) => {
    const da = Math.round((basicNum * (daPct + item.daAdd)) / 100);
    const hra = Math.round((basicNum * hraPct) / 100);
    const gross = basicNum + da + hra;
    return { month: item.m, basic: basicNum, da, hra, gross, pt: 200, net: gross - 200 };
  });

  const totBasic = rows.reduce((a, r) => a + r.basic, 0);
  const totDa = rows.reduce((a, r) => a + r.da, 0);
  const totHra = rows.reduce((a, r) => a + r.hra, 0);
  const totGross = rows.reduce((a, r) => a + r.gross, 0);
  const totPt = rows.reduce((a, r) => a + r.pt, 0);
  const totNet = rows.reduce((a, r) => a + r.net, 0);

  const sal17_1 = totGross + n(surrender);
  const p17_2 = n(perq17_2);
  const p17_3 = n(profit17_3);
  const totalGross = sal17_1 + p17_2 + p17_3;
  const otherEmpNum = n(otherEmpSal);

  // HRA Exemption Calculation
  let hraEx = 0;
  if (n(rentPaid) > 0 && houseStatus === "Rented") {
    const bdPlusDa = totBasic + totDa;
    hraEx = Math.round(Math.min(totHra, Math.max(0, n(rentPaid) - 0.1 * bdPlusDa), 0.4 * bdPlusDa));
  }

  const totalSec10 = hraEx + n(ltcEx) + n(gratuityEx) + n(commutedEx) + n(leaveEnEx);
  const raw80C = n(gpf) + n(apgli) + n(gis) + n(tuition) + n(hlPrincipal) + n(lic) + n(pli) + n(ppf);
  const cap80C = Math.min(150000, raw80C + n(s80ccc) + n(s80ccd1));
  const cap80CCD1B = Math.min(50000, n(s80ccd1b));
  const cap80D = Math.min(75000, n(s80d));
  const cap24B = Math.min(200000, n(s24b));
  const cap80EEB = Math.min(150000, n(s80eeb));
  const cap80TTA = Math.min(10000, n(s80tta));
  const totalVIA =
    cap80C + cap80CCD1B + n(s80ccd2) + cap80D + n(s80e) + n(s80g) + cap80EEB + n(s80u) + cap80TTA;

  const ptNum = n(pt);
  const stdDed = fy === "2025-26" && regime === "new" ? 75000 : 50000;
  const sec16Total = stdDed + ptNum;
  const salAfterSec10 = totalGross + otherEmpNum - totalSec10;
  const incChargeable = salAfterSec10 - sec16Total;
  const hpLossNum = n(hpLoss);
  const otherSrcNum = n(otherSrc);
  const totalOtherIncome = -hpLossNum + otherSrcNum;
  const grossTotalIncome = incChargeable + totalOtherIncome;
  const taxableIncome = Math.max(0, Math.round((grossTotalIncome - (regime === "old" ? totalVIA : 0)) / 10) * 10);

  let slabTax = 0;
  if (regime === "old") {
    if (taxableIncome > 250000) slabTax += Math.min(taxableIncome - 250000, 250000) * 0.05;
    if (taxableIncome > 500000) slabTax += Math.min(taxableIncome - 500000, 500000) * 0.2;
    if (taxableIncome > 1000000) slabTax += (taxableIncome - 1000000) * 0.3;
  } else {
    if (fy === "2025-26") {
      if (taxableIncome > 400000) slabTax += Math.min(taxableIncome - 400000, 400000) * 0.05;
      if (taxableIncome > 800000) slabTax += Math.min(taxableIncome - 800000, 400000) * 0.10;
      if (taxableIncome > 1200000) slabTax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
      if (taxableIncome > 1600000) slabTax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
      if (taxableIncome > 2000000) slabTax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
      if (taxableIncome > 2400000) slabTax += (taxableIncome - 2400000) * 0.30;
    } else {
      if (taxableIncome > 300000) slabTax += Math.min(taxableIncome - 300000, 300000) * 0.05;
      if (taxableIncome > 600000) slabTax += Math.min(taxableIncome - 600000, 300000) * 0.10;
      if (taxableIncome > 900000) slabTax += Math.min(taxableIncome - 900000, 300000) * 0.15;
      if (taxableIncome > 1200000) slabTax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
      if (taxableIncome > 1500000) slabTax += (taxableIncome - 1500000) * 0.30;
    }
  }

  const surcharge = calcSurcharge(taxableIncome, slabTax);
  const maxRebateLimit = regime === "new" ? 700000 : 500000;
  const rebate87A = taxableIncome <= maxRebateLimit ? slabTax : 0;
  const taxAfterRebate = Math.max(0, slabTax + surcharge - rebate87A);
  const cess = Math.round(taxAfterRebate * 0.04);
  const taxPayable = Math.round(taxAfterRebate + cess);
  const reliefNum = n(reliefU89);
  const advQ1 = n(q1Ded);
  const advQ2 = n(q2Ded);
  const advQ3 = n(q3Ded);
  const advQ4 = n(q4Ded);
  const totalTDS = advQ1 + advQ2 + advQ3 + advQ4;
  const totalDep = n(q1Dep) + n(q2Dep) + n(q3Dep) + n(q4Dep);
  const totalAmtPaid = n(q1Paid) + n(q2Paid) + n(q3Paid) + n(q4Paid);
  const netPayable = Math.max(0, taxPayable - reliefNum - totalTDS);
  const ayLabel = fy === "2023-24" ? "2024-25" : fy === "2024-25" ? "2025-26" : "2026-27";

  const handlePrint = () => {
    window.print();
  };

  const handlePrintAll = () => {
    setActiveTab("printAll");
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const TABS: { id: DocumentView; label: string }[] = [
    { id: "calculator", label: "🧮 Calculator" },
    { id: "annexure1", label: "Annexure-I" },
    { id: "annexure2", label: "Annexure-II" },
    { id: "form16a", label: "Form 16 Pt-A" },
    { id: "form16b", label: "Form 16 Pt-B" },
    { id: "form12bb", label: "Form 12BB" },
    { id: "form12ba", label: "Form 12BA" },
    { id: "rentReceipt", label: "HRA Receipt" },
    { id: "printAll", label: "🖨️ Print All" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans print:p-0 print:m-0 print:max-w-none print:w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/tools" className="text-xs font-mono text-inkSoft hover:text-ink font-semibold">
          ← Back to Tools / ఇతర సాధనాలు
        </Link>
        <div className="flex flex-wrap items-center bg-paperRaised border border-hair rounded-xl p-1 text-xs font-mono font-bold gap-1 shadow-2xs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.id === "printAll") {
                  handlePrintAll();
                } else {
                  setActiveTab(t.id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                t.id === "printAll"
                  ? "bg-tamarind text-white hover:bg-tamarind/90"
                  : activeTab === t.id
                  ? "bg-ink text-white"
                  : "text-inkSoft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Print Action Banner */}
      {activeTab !== "calculator" && (
        <div className="bg-ink text-white rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-lg print:hidden border-l-4 border-turmeric sticky top-3 z-30">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-turmeric uppercase">
              📄 {activeTab === "printAll" ? "Full Print Suite (All 7 Documents)" : TABS.find((t) => t.id === activeTab)?.label}
            </span>
            <span className="text-[11px] text-white/70 hidden sm:inline">
              — Official Monochrome A4 Layout
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-turmeric text-ink font-mono font-bold text-xs px-4 py-2 rounded-lg hover:bg-turmeric/90 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>🖨️</span>
              <span>Print Now (Ctrl+P)</span>
            </button>
            {activeTab !== "printAll" && (
              <button
                type="button"
                onClick={handlePrintAll}
                className="bg-tamarind text-white font-mono font-bold text-xs px-3 py-2 rounded-lg hover:bg-tamarind/90 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Print All 7 Docs
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className="bg-white/10 text-white hover:bg-white/20 font-mono font-semibold text-xs px-3 py-2 rounded-lg transition-all cursor-pointer"
            >
              ← Edit Details
            </button>
          </div>
        </div>
      )}

      {/* ── CALCULATOR VIEW ── */}
      {activeTab === "calculator" && (
        <div className="space-y-5">
          <div className="border-b border-hair pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink tracking-tight">AP Teacher Income Tax & Official Form Suite</h1>
              <p className="font-telugu text-sm text-inkSoft mt-1">
                ఆంధ్రప్రదేశ్ ఉపాధ్యాయుల ఆదాయపు పన్ను మరియు అధికారిక పత్రాలు (Annexures, Form 16, Form 12BB, Form 12BA)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={regime}
                onChange={(e) => setRegime(e.target.value as "old" | "new")}
                aria-label="Tax Regime Selection"
                className="bg-paperRaised border border-hair rounded-xl text-xs font-mono font-bold text-ink outline-none px-3 py-2"
              >
                <option value="old">Old Tax Regime (With Deductions)</option>
                <option value="new">New Tax Regime (Sec 115BAC)</option>
              </select>
              <select
                id={fyId}
                value={fy}
                onChange={(e) => setFy(e.target.value as FinancialYear)}
                aria-label="Financial Year Selection"
                className="bg-paperRaised border border-hair rounded-xl text-sm text-ink outline-none px-3 py-2"
              >
                <option value="2023-24">FY 2023-24 (AY 2024-25)</option>
                <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Employee Particulars */}
              <div className="bg-paperRaised border border-hair rounded-xl p-5 space-y-3 shadow-xs">
                <h2 className="font-bold text-sm text-ink border-b border-hair pb-2">
                  Part A: Employee & DDO Particulars
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <InputF label="Employee Name" value={empName} onChange={setEmpName} />
                  <InputF label="Father / Husband Name" value={empFather} onChange={setEmpFather} />
                  <InputF label="Designation" value={empDesig} onChange={setEmpDesig} />
                  <InputF label="School / Office" value={empSchool} onChange={setEmpSchool} />
                  <InputF label="Working Place" value={empPlace} onChange={setEmpPlace} />
                  <InputF label="Mandal" value={empMandal} onChange={setEmpMandal} />
                  <InputF label="District" value={empDist} onChange={setEmpDist} />
                  <InputF label="PAN Number" value={empPan} onChange={setEmpPan} />
                  <InputF label="Treasury ID / Ref No" value={empTid} onChange={setEmpTid} />
                  <InputF label="Employment Period From" value={empFrom} onChange={setEmpFrom} />
                  <InputF label="Employment Period To" value={empTo} onChange={setEmpTo} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-hair">
                  <InputF label="DDO Name" value={ddoName} onChange={setDdoName} />
                  <InputF label="DDO Designation" value={ddoDesig} onChange={setDdoDesig} />
                  <InputF label="DDO TAN" value={ddoTan} onChange={setDdoTan} />
                  <InputF label="DDO PAN" value={ddoPan} onChange={setDdoPan} />
                  <InputF label="CIT (TDS) City" value={citCity} onChange={setCitCity} />
                  <InputF label="CIT Pin Code" value={citPin} onChange={setCitPin} />
                  <InputF label="Certificate No." value={certNo} onChange={setCertNo} />
                  <InputF label="Certificate Date" value={certDate} onChange={setCertDate} />
                </div>
              </div>

              {/* Salary Inputs */}
              <div className="bg-paperRaised border border-hair rounded-xl p-5 space-y-3 shadow-xs">
                <h2 className="font-bold text-sm text-ink border-b border-hair pb-2">
                  Part B: Salary & Allowances
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">
                      Monthly Basic Pay (₹)
                    </label>
                    <input
                      type="number"
                      value={basic}
                      onChange={(e) => setBasic(e.target.value)}
                      className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">
                      DA Rate %
                    </label>
                    <select
                      value={daSelect}
                      onChange={(e) => setDaSelect(parseFloat(e.target.value))}
                      className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink"
                    >
                      {DA_PRESETS.map((p) => (
                        <option key={p.label} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">
                      HRA Rate %
                    </label>
                    <select
                      value={hraSelect}
                      onChange={(e) => setHraSelect(parseFloat(e.target.value))}
                      className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink"
                    >
                      {HRA_PRESETS.map((p) => (
                        <option key={p.label} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <NumF label="Surrender Pay / Bonus" value={surrender} onChange={setSurrender} />
                  <NumF label="Perquisites u/s 17(2) (Form 12BA)" value={perq17_2} onChange={setPerq17_2} />
                  <NumF label="Profits in lieu u/s 17(3) (Form 12BA)" value={profit17_3} onChange={setProfit17_3} />
                  <NumF label="Salary from Other Employer" value={otherEmpSal} onChange={setOtherEmpSal} />
                  <NumF label="Income from Other Sources" value={otherSrc} onChange={setOtherSrc} />
                  <NumF label="House Property Loss u/s 192(2B)" value={hpLoss} onChange={setHpLoss} />
                </div>
              </div>

              {/* Section 10 Exemptions */}
              <div className="bg-paperRaised border border-hair rounded-xl p-5 space-y-3 shadow-xs">
                <h2 className="font-bold text-sm text-ink border-b border-hair pb-2">
                  Section 10 Exemptions
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">
                      House Status
                    </label>
                    <select
                      value={houseStatus}
                      onChange={(e) => setHouseStatus(e.target.value as "Rented" | "Own")}
                      className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink"
                    >
                      <option value="Own">Own House</option>
                      <option value="Rented">Rented House</option>
                    </select>
                  </div>
                  {houseStatus === "Rented" && (
                    <NumF label="Annual Rent Paid" value={rentPaid} onChange={setRentPaid} />
                  )}
                  <NumF label="LTC/LTA u/s 10(5)" value={ltcEx} onChange={setLtcEx} />
                  <NumF label="Gratuity u/s 10(10)" value={gratuityEx} onChange={setGratuityEx} />
                  <NumF label="Commuted Pension u/s 10(10A)" value={commutedEx} onChange={setCommutedEx} />
                  <NumF label="Leave Encashment u/s 10(10AA)" value={leaveEnEx} onChange={setLeaveEnEx} />
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-paperRaised border border-hair rounded-xl p-5 space-y-3 shadow-xs">
                <h2 className="font-bold text-sm text-ink border-b border-hair pb-2">
                  Part C: Chapter VI-A & Other Deductions
                </h2>
                <p className="text-xs text-inkSoft font-semibold">
                  80C Group (GPF, APGLI, GIS, LIC, PLI, PPF, Tuition, Principal — Max ₹1,50,000)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <NumF label="GPF / ZPPF" value={gpf} onChange={setGpf} />
                  <NumF label="APGLI" value={apgli} onChange={setApgli} />
                  <NumF label="GIS" value={gis} onChange={setGis} />
                  <NumF label="Tuition Fees" value={tuition} onChange={setTuition} />
                  <NumF label="Home Loan Principal" value={hlPrincipal} onChange={setHlPrincipal} />
                  <NumF label="LIC Premium (Annual)" value={lic} onChange={setLic} />
                  <NumF label="PLI Premium (Annual)" value={pli} onChange={setPli} />
                  <NumF label="PPF (Annual)" value={ppf} onChange={setPpf} />
                  <NumF label="80CCC — Pension Fund" value={s80ccc} onChange={setS80ccc} />
                  <NumF label="80CCD(1) — NPS Employee" value={s80ccd1} onChange={setS80ccd1} />
                  <NumF label="80CCD(1B) — Extra NPS (₹50k)" value={s80ccd1b} onChange={setS80ccd1b} />
                  <NumF label="80CCD(2) — Employer NPS" value={s80ccd2} onChange={setS80ccd2} />
                </div>
                <p className="text-xs text-inkSoft font-semibold border-t border-hair pt-2">
                  Other Applicable Deductions
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <NumF label="Professional Tax" value={pt} onChange={setPt} />
                  <NumF label="80D — Health Insurance" value={s80d} onChange={setS80d} />
                  <NumF label="Sec 24b — Home Loan Interest" value={s24b} onChange={setS24b} />
                  <NumF label="80E — Education Loan Interest" value={s80e} onChange={setS80e} />
                  <NumF label="80EEB — EV Loan Interest" value={s80eeb} onChange={setS80eeb} />
                  <NumF label="80G — Donations" value={s80g} onChange={setS80g} />
                  <NumF label="80TTA — Savings Interest (cap ₹10k)" value={s80tta} onChange={setS80tta} />
                  <NumF label="80U — Disability" value={s80u} onChange={setS80u} />
                  <NumF label="Relief u/s 89" value={reliefU89} onChange={setReliefU89} />
                </div>
              </div>

              {/* Quarterly TDS & BIN for Govt Deductors */}
              <div className="bg-paperRaised border border-hair rounded-xl p-5 space-y-3 shadow-xs">
                <h2 className="font-bold text-sm text-ink border-b border-hair pb-2">
                  Quarterly TDS & BIN Details (Form 16 Part A)
                </h2>
                <p className="text-xs text-inkSoft">
                  For AP Govt Teachers: Book Adjustment (BIN) entries are used by Treasury/DDOs
                </p>
                <div className="grid grid-cols-5 gap-2 text-[var(--label-primary)] md:text-[var(--label-secondary)] font-semibold text-inkSoft">
                  <div>Quarter</div>
                  <div>Amt Paid (₹)</div>
                  <div>Tax Deducted (₹)</div>
                  <div>Tax Deposited (₹)</div>
                  <div>Receipt No 24Q</div>
                </div>
                {[
                  { q: "Q1 Apr-Jun", paid: q1Paid, setPaid: setQ1Paid, ded: q1Ded, setDed: setQ1Ded, dep: q1Dep, setDep: setQ1Dep, rec: q1Rec, setRec: setQ1Rec },
                  { q: "Q2 Jul-Sep", paid: q2Paid, setPaid: setQ2Paid, ded: q2Ded, setDed: setQ2Ded, dep: q2Dep, setDep: setQ2Dep, rec: q2Rec, setRec: setQ2Rec },
                  { q: "Q3 Oct-Dec", paid: q3Paid, setPaid: setQ3Paid, ded: q3Ded, setDed: setQ3Ded, dep: q3Dep, setDep: setQ3Dep, rec: q3Rec, setRec: setQ3Rec },
                  { q: "Q4 Jan-Mar", paid: q4Paid, setPaid: setQ4Paid, ded: q4Ded, setDed: setQ4Ded, dep: q4Dep, setDep: setQ4Dep, rec: q4Rec, setRec: setQ4Rec },
                ].map(({ q, paid, setPaid, ded, setDed, dep, setDep, rec, setRec }) => (
                  <div key={q} className="grid grid-cols-5 gap-2 items-center">
                    <div className="text-sm font-semibold text-ink">{q}</div>
                    <input
                      type="number"
                      value={paid}
                      onChange={(e) => setPaid(e.target.value)}
                      className="bg-white border border-hair rounded px-2 py-1.5 text-sm tabular-nums"
                    />
                    <input
                      type="number"
                      value={ded}
                      onChange={(e) => setDed(e.target.value)}
                      className="bg-white border border-hair rounded px-2 py-1.5 text-sm tabular-nums"
                    />
                    <input
                      type="number"
                      value={dep}
                      onChange={(e) => setDep(e.target.value)}
                      className="bg-white border border-hair rounded px-2 py-1.5 text-sm tabular-nums"
                    />
                    <input
                      type="text"
                      value={rec}
                      onChange={(e) => setRec(e.target.value)}
                      className="bg-white border border-hair rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3 border-t border-hair pt-2">
                  <InputF label="BIN: Receipt No. Form 24G" value={bin24G} onChange={setBin24G} />
                  <InputF label="BIN: DDO Serial No. in 24G" value={binSerial} onChange={setBinSerial} />
                  <InputF label="BIN: Date of Transfer Voucher" value={binDate} onChange={setBinDate} />
                </div>
              </div>

              {/* Landlord & Lender Information */}
              <div className="bg-paperRaised border border-hair rounded-xl p-5 space-y-3 shadow-xs">
                <h2 className="font-bold text-sm text-ink border-b border-hair pb-2">
                  Landlord & Lender Particulars (Form 12BB)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <InputF label="Landlord Name" value={llName} onChange={setLlName} />
                  <InputF label="Landlord Address" value={llAddr} onChange={setLlAddr} />
                  <InputF label="Landlord PAN" value={llPan} onChange={setLlPan} />
                  <NumF label="LTC/LTA Amount (Row 2 Form 12BB)" value={ltcAmt} onChange={setLtcAmt} />
                  <InputF label="LTC Evidence Description" value={ltcEv} onChange={setLtcEv} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-hair">
                  <InputF label="Home Loan Lender Name" value={lenderName} onChange={setLenderName} />
                  <InputF label="Lender Address" value={lenderAddr} onChange={setLenderAddr} />
                  <InputF label="Lender PAN" value={lenderPan} onChange={setLenderPan} />
                  <div>
                    <label className="block text-[var(--label-primary)] md:text-[var(--label-secondary)] text-inkSoft font-semibold mb-0.5 tracking-wide">
                      Lender Type
                    </label>
                    <select
                      value={lenderType}
                      onChange={(e) => setLenderType(e.target.value)}
                      className="w-full bg-white border border-hair rounded px-2 py-1.5 text-sm text-ink"
                    >
                      <option>Financial Institution</option>
                      <option>Employer</option>
                      <option>Others</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary Panel */}
            <div className="space-y-4">
              <div className="bg-ink text-white rounded-xl p-6 shadow-md border-l-4 border-turmeric space-y-3 sticky top-4">
                <div className="font-mono text-[9px] text-[#9AA3B8] uppercase font-bold tracking-wider">
                  Tax Payable ({regime === "old" ? "Old Regime" : "New Regime"})
                </div>
                <div className="text-3xl font-bold text-turmeric font-mono">₹{fmt(taxPayable)}</div>
                <div className="text-xs text-white/70 font-mono">Gross Salary: ₹{fmt(totalGross)}</div>
                <div className="text-xs text-white/70 font-mono">Taxable Income: ₹{fmt(taxableIncome)}</div>
                <div className="text-xs text-white/70 font-mono">Net Tax to Pay Now: ₹{fmt(netPayable)}</div>
                <div className="border-t border-white/20 pt-3 space-y-1 text-[var(--label-primary)] md:text-[var(--label-secondary)] font-mono">
                  <div className="flex justify-between">
                    <span>Gross Salary</span>
                    <span>₹{fmt(totalGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Sec 10 Exemptions</span>
                    <span>₹{fmt(totalSec10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Sec 16 (Std + PT)</span>
                    <span>₹{fmt(sec16Total)}</span>
                  </div>
                  {regime === "old" && (
                    <div className="flex justify-between">
                      <span>- Chapter VI-A</span>
                      <span>₹{fmt(totalVIA)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t border-white/20 pt-1">
                    <span>Taxable Income</span>
                    <span>₹{fmt(taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slab Tax</span>
                    <span>₹{fmt(slabTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>- Rebate 87A</span>
                    <span>₹{fmt(rebate87A)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+ Cess 4%</span>
                    <span>₹{fmt(cess)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-paperRaised border border-hair rounded-xl p-4 text-xs font-mono space-y-1.5 shadow-xs">
                <div className="font-bold text-ink border-b border-hair pb-2 mb-2">📂 Official Documents to Print</div>
                {(
                  [
                    ["annexure1", "📄 ANNEXURE - I (Salary Statement)"],
                    ["annexure2", "📄 ANNEXURE - II (Tax Calculation)"],
                    ["form16a", "📄 FORM 16 — Part A (TDS Cert)"],
                    ["form16b", "📄 FORM 16 — Part B (Annexure)"],
                    ["form12bb", "📄 FORM 12BB (Investment Claims)"],
                    ["form12ba", "📄 FORM 12BA (Perquisites)"],
                    ["rentReceipt", "📄 HRA Rent Receipt (u/s 10(13A))"],
                  ] as [DocumentView, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className="w-full text-left bg-white border border-hair p-2 rounded hover:border-ink font-bold text-ink transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePrintAll}
                  className="w-full text-center bg-tamarind text-white p-2.5 rounded-lg font-bold hover:bg-tamarindDark transition-colors shadow-sm"
                >
                  🖨️ Print All 7 Official Documents
                </button>
              </div>
            </div>
          </div>

          {/* Accordion FAQs Section */}
          <div className="pt-8 border-t border-hair space-y-4 print:hidden">
            <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
              <span>📘</span> Income Tax Guidelines & FAQs (ఆదాయపు పన్ను మార్గదర్శకాలు)
            </h2>
            <Accordion
              items={[
                {
                  id: "tax-regimes-comparison",
                  titleEn: "Which Regime is better for AP Teachers for FY 2025-26?",
                  titleTe: "FY 2025-26 కి ఉపాధ్యాయులకు ఏ పన్ను విధానం (Old vs New Regime) మంచిది?",
                  badge: "Regime Guide",
                  defaultOpen: true,
                  content: (
                    <div className="space-y-2">
                      <p>
                        <b>New Tax Regime (FY 2025-26 / AY 2026-27):</b> Offers lower tax slab rates and a higher <b>Standard Deduction of ₹75,000</b>. Tax rebate u/s 87A is available for taxable income up to <b>₹7,00,000</b> (resulting in zero tax payable for income up to ₹7.75 Lakhs).
                      </p>
                      <p>
                        <b>Old Tax Regime:</b> Allows deductions like <b>HRA exemption u/s 10(13A), 80C (up to ₹1.5L), 80D (Health Insurance), and Housing Loan Interest u/s 24(b) (up to ₹2L)</b>. If your total exemptions and deductions exceed ₹3,75,000, Old Regime usually saves more tax.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "hra-exemption-rules",
                  titleEn: "How is HRA Exemption u/s 10(13A) calculated for teachers?",
                  titleTe: "ఉపాధ్యాయులకు హెచ్‌ఆర్‌ఏ (HRA) పన్ను మినహాయింపు లెక్కించడం ఎలా?",
                  badge: "HRA Rules",
                  content: (
                    <div className="space-y-2">
                      <p>HRA exemption under Section 10(13A) is the <b>minimum</b> of the following three amounts:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Actual HRA received from government payroll.</li>
                        <li>Actual rent paid minus 10% of (Basic Pay + DA).</li>
                        <li>40% of (Basic Pay + DA) for non-metro towns/districts in AP & TS.</li>
                      </ol>
                    </div>
                  ),
                },
                {
                  id: "landlord-pan-rule",
                  titleEn: "Is Landlord PAN mandatory for claiming HRA in Form 12BB?",
                  titleTe: "ఫారం 12బిబి లో యజమాని పాన్ కార్డ్ తప్పనిసరియా?",
                  badge: "Form 12BB",
                  content: (
                    <div className="space-y-2">
                      <p>
                        As per Central Board of Direct Taxes (CBDT) circulars, providing the <b>Landlord's PAN card number is mandatory</b> if total rent paid during the financial year exceeds <b>₹1,00,000/-</b> (approx ₹8,334 per month).
                      </p>
                      <p>
                        If the landlord does not have a PAN card, a declaration in Form 60/61 along with landlord contact details must be attached to Form 12BB.
                      </p>
                    </div>
                  ),
                },
              ]}
              allowMultiple={true}
            />
          </div>
        </div>
      )}

      {/* ── ANNEXURE - I ── */}
      {(activeTab === "annexure1" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-5 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-3 print:border-none print:p-0 print-page-break text-[11px] leading-normal w-full antialiased">
          <div className="border border-black bg-gray-200 py-2 text-center font-bold text-sm uppercase tracking-wide">
            ANNEXURE - 1 (Financial Year {fy})
          </div>
          <div className="font-semibold text-xs text-gray-900 flex justify-between items-center px-1">
            <div>Month wise Income of: &nbsp;<span className="underline font-bold text-black text-sm">{empName}</span></div>
            <div className="text-xs font-normal text-gray-700">DESIG: <b>{empDesig}</b> | PAN: <b>{empPan}</b></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-black text-[var(--label-primary)] md:text-[var(--label-secondary)]" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr className="bg-gray-200 font-bold border-b-2 border-black text-[9.5px]">
                  {[
                    "Month",
                    "B.Pay",
                    "P.Pay\nS.Pay",
                    "D.A",
                    "HRA",
                    "AHRA",
                    "PHA",
                    "CCA",
                    "RA",
                    "Allow\nance",
                    "Gross\nTotal",
                    "GPF\nZPPF",
                    "APGLI",
                    "G.I.S",
                    "P.T",
                    "Salary\nLIC",
                    "E.H.I",
                    "Adv\ntax",
                    "SWF\nEWF",
                    "Dedu\nctions",
                    "Net\nAmount",
                  ].map((h, i) => (
                    <th key={i} className="border-r border-black p-1 whitespace-pre-line leading-tight">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="tabular-nums font-medium">
                {rows.map((r) => (
                  <tr key={r.month} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="border-r border-black p-1 font-bold">{r.month}</td>
                    <td className="border-r border-black p-1">{r.basic}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1">{r.da}</td>
                    <td className="border-r border-black p-1">{r.hra}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1 font-bold bg-gray-50">{r.gross}</td>
                    <td className="border-r border-black p-1">{n(gpf) > 0 ? Math.round(n(gpf) / 12) : ""}</td>
                    <td className="border-r border-black p-1">{n(apgli) > 0 ? Math.round(n(apgli) / 12) : ""}</td>
                    <td className="border-r border-black p-1">{n(gis) > 0 ? Math.round(n(gis) / 12) : ""}</td>
                    <td className="border-r border-black p-1">{r.pt}</td>
                    <td className="border-r border-black p-1">{n(lic) > 0 ? Math.round(n(lic) / 12) : ""}</td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1">{r.pt}</td>
                    <td className="p-1 font-bold bg-gray-50">{r.net}</td>
                  </tr>
                ))}
                {[
                  "D.A Arrears (1)",
                  "D.A Arrears (2)",
                  "D.A Arrears (3)",
                  "Promot Arrear",
                  "AAS Arrear",
                  "Notion Inc Arrear",
                  "Surrender Leave",
                  "Child Fee Conces",
                  "StepUp Arrears",
                  "Prepone Arrear",
                  "P.R.C Arrears",
                ].map((a, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="border-r border-black p-1 font-bold text-left">{a}</td>
                    <td colSpan={20}></td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-200 border-t-2 border-black text-[var(--label-primary)] md:text-[var(--label-secondary)]">
                  <td className="border-r border-black p-1.5">Grand Totals</td>
                  <td className="border-r border-black p-1.5">{totBasic}</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5">{totDa}</td>
                  <td className="border-r border-black p-1.5">{totHra}</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5">{totGross}</td>
                  <td className="border-r border-black p-1.5">{n(gpf)}</td>
                  <td className="border-r border-black p-1.5">{n(apgli)}</td>
                  <td className="border-r border-black p-1.5">{n(gis)}</td>
                  <td className="border-r border-black p-1.5">{totPt}</td>
                  <td className="border-r border-black p-1.5">{n(lic)}</td>
                  <td className="border-r border-black p-1.5">0</td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5"></td>
                  <td className="border-r border-black p-1.5">{totPt}</td>
                  <td className="p-1.5">{totNet}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pt-8 flex justify-between font-bold text-xs">
            <div>Signature of the Drawing Officer</div>
            <div>Signature of the Employee</div>
          </div>
        </div>
      )}

      {/* ── ANNEXURE - II ── */}
      {(activeTab === "annexure2" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-5 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-3 print:border-none print:p-0 print-page-break text-xs leading-normal w-full antialiased">
          {/* Header */}
          <div className="border border-black bg-gray-200 p-2 flex justify-between items-center font-bold text-xs">
            <div className="text-center">
              Financial Year<br /><b>{fy}</b>
            </div>
            <div className="text-center text-sm uppercase tracking-wide">
              ANNEXURE - II<br /><span className="text-xs font-semibold">INCOME TAX CALCULATION</span>
            </div>
            <div className="text-center">
              Assessment Year<br /><b>{ayLabel}</b>
            </div>
          </div>

          <div className="text-center font-bold uppercase text-sm tracking-wide">
            {empName}, {empDesig}, {empSchool}
          </div>

          <div className="grid grid-cols-4 border border-black p-1.5 text-xs font-medium gap-2 bg-gray-50">
            <div><span className="text-gray-600">PAN:</span> <b>{empPan}</b></div>
            <div><span className="text-gray-600">Tre.ID:</span> <b>{empTid}</b></div>
            <div><span className="text-gray-600">DDO TAN:</span> <b>{ddoTan}</b></div>
            <div><span className="text-gray-600">DDO PAN:</span> <b>{ddoPan}</b></div>
          </div>

          {/* Section 1: Income from Gross Salary */}
          <div className="border border-black divide-y divide-gray-300">
            <div className="grid grid-cols-[1fr_130px_130px] bg-gray-100 font-bold p-1.5 border-b border-black text-xs">
              <div>1 Income from Gross Salary</div>
              <div className="text-right tabular-nums pr-2">{fmt(totalGross)}</div>
              <div className="text-right tabular-nums pr-2">{fmt(totalGross)}</div>
            </div>
            <div className="grid grid-cols-[1fr_130px_130px] p-1 text-xs">
              <div className="pl-4 text-gray-800">Standard deduction. Sec-16(ia)</div>
              <div className="text-right tabular-nums pr-2">{fmt(stdDed)}</div>
              <div className="text-right tabular-nums pr-2 font-bold">
                <span className="text-[var(--label-primary)] md:text-[var(--label-secondary)] font-normal mr-2 text-gray-600">Sec-16(ia)</span>
                {fmt(stdDed)}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_130px] bg-gray-50 font-bold p-1.5 border-t border-black text-xs">
              <div className="text-right pr-3">Net Salary after Standard Deduction:</div>
              <div className="text-right tabular-nums pr-2">{fmt(totalGross - stdDed)}</div>
            </div>
          </div>

          {/* Section 2: HRA Exemption */}
          <div className="border border-black divide-y divide-gray-300">
            <div className="grid grid-cols-[1fr_130px] bg-gray-100 font-bold p-1.5 border-b border-black text-xs">
              <div>2 HRA Exemption. Sec.10(13-A)</div>
              <div className="text-right pr-2 font-bold text-gray-800">
                {n(rentPaid) > 0 ? "Rented House" : "Own House"}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_130px] p-1 text-[11px]">
              <div className="pl-4 text-gray-700">Total Basic Pay: ₹{fmt(totBasic)} | Total DA: ₹{fmt(totDa)} | Total HRA Received: ₹{fmt(totHra)}</div>
              <div className="text-right tabular-nums pr-2">{hraEx > 0 ? fmt(hraEx) : "—"}</div>
            </div>
            <div className="grid grid-cols-[1fr_130px] bg-gray-50 font-bold p-1.5 border-t border-black text-xs">
              <div className="text-right pr-3">Balance after HRA Exemption:</div>
              <div className="text-right tabular-nums pr-2">{fmt(totalGross - stdDed - totalSec10)}</div>
            </div>
          </div>

          {/* Section 3: Deductions from Salary */}
          <div className="border border-black divide-y divide-gray-300">
            <div className="grid grid-cols-[1fr_130px_130px] bg-gray-100 font-bold p-1.5 border-b border-black text-xs">
              <div>3 Deductions from Salary Income</div>
              <div></div>
              <div className="text-right tabular-nums pr-2">{fmt(ptNum)}</div>
            </div>
            <div className="grid grid-cols-[1fr_130px_130px] p-1 text-xs">
              <div className="pl-4 text-gray-800">Profession Tax Sec.16(iii)</div>
              <div className="text-right tabular-nums pr-2">{fmt(ptNum)}</div>
              <div className="text-right tabular-nums pr-2 font-bold">
                <span className="text-[var(--label-primary)] md:text-[var(--label-secondary)] font-normal mr-2 text-gray-600">Sec.16(iii)</span>
                {fmt(ptNum)}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_130px] bg-gray-50 font-bold p-1.5 border-t border-black text-xs">
              <div className="text-right pr-3">Income chargeable under Salaries:</div>
              <div className="text-right tabular-nums pr-2">{fmt(incChargeable)}</div>
            </div>
          </div>

          {/* Section 4 & 5: Other Sources & House Property */}
          <div className="grid grid-cols-2 border border-black divide-x divide-black text-xs">
            <div className="divide-y divide-gray-300">
              <div className="bg-gray-100 font-bold p-1.5 border-b border-black">4 Income from Other Sources</div>
              <div className="p-1.5 flex justify-between text-xs">
                <span className="pl-2 text-gray-800">Bank Interest & Other:</span>
                <span className="tabular-nums font-semibold">{otherSrcNum > 0 ? fmt(otherSrcNum) : "—"}</span>
              </div>
            </div>
            <div className="divide-y divide-gray-300">
              <div className="bg-gray-100 font-bold p-1.5 border-b border-black">5 Income / Loss House Property Sec.24</div>
              <div className="p-1.5 flex justify-between text-xs">
                <span className="pl-2 text-gray-800">Interest on Housing Loan:</span>
                <span className="tabular-nums font-semibold">{hpLossNum > 0 ? `-${fmt(hpLossNum)}` : "—"}</span>
              </div>
            </div>
          </div>

          {/* Section 6: Deductions U/S Chapter VI-A */}
          <div className="border border-black">
            <div className="bg-gray-100 font-bold p-1.5 border-b border-black flex justify-between text-xs">
              <div>6 Deductions U/S Chapter VI-A (80C Limit ₹1,50,000, 80D, 80G, etc.)</div>
              <div className="tabular-nums font-bold">{fmt(totalVIA)}</div>
            </div>
            <div className="grid grid-cols-2 p-1.5 text-[11px] gap-x-4 gap-y-1">
              <div className="flex justify-between">
                <span className="text-gray-800">80C (GPF/ZPPF, APGLI, GIS, LIC, PLI, HLP, Tuition):</span>
                <span className="tabular-nums font-bold">{fmt(cap80C)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">80CCD(1B) (Additional NPS):</span>
                <span className="tabular-nums font-bold">{fmt(cap80CCD1B)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">80D (Health Insurance / EHS):</span>
                <span className="tabular-nums font-bold">{fmt(cap80D)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">80G / 80U / 80E / 80EEB / 80TTA:</span>
                <span className="tabular-nums font-bold">{fmt(n(s80g) + n(s80u) + n(s80e) + cap80EEB + cap80TTA)}</span>
              </div>
            </div>
          </div>

          {/* Section 7: Net Taxable Income */}
          <div className="border-2 border-black bg-gray-100 p-2 flex justify-between items-center font-bold text-xs">
            <div>7 Net Taxable Income (Total Income) (1 to 5 − 6) [Rounded to nearest ₹10]</div>
            <div className="tabular-nums text-sm">₹{fmt(taxableIncome)}</div>
          </div>

          {/* Section 8: Total Tax on (7) Income - Official Slabs Grid */}
          <div className="border border-black">
            <div className="bg-gray-200 font-bold p-1.5 border-b border-black flex justify-between text-xs">
              <div>8 TOTAL Tax on (7) Income ({regime === "old" ? "Old Tax Regime, below 60 Years" : "New Tax Regime u/s 115BAC"})</div>
              <div className="tabular-nums">Net Tax: ₹{fmt(taxPayable)}</div>
            </div>
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400 font-semibold">
                  <th className="p-1 border-r border-gray-400">Income Slab</th>
                  <th className="p-1 border-r border-gray-400">Rate</th>
                  <th className="p-1 border-r border-gray-400">Taxable in Slab (₹)</th>
                  <th className="p-1 text-right pr-3">Tax Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 tabular-nums">
                <tr>
                  <td className="p-1 border-r border-gray-400 font-sans">Upto ₹2,50,000</td>
                  <td className="p-1 border-r border-gray-400 font-sans">Nil</td>
                  <td className="p-1 border-r border-gray-400">{fmt(Math.min(taxableIncome, 250000))}</td>
                  <td className="p-1 text-right pr-3">Nil</td>
                </tr>
                <tr>
                  <td className="p-1 border-r border-gray-400 font-sans">₹2,50,001 to ₹5,00,000</td>
                  <td className="p-1 border-r border-gray-400 font-sans">5%</td>
                  <td className="p-1 border-r border-gray-400">
                    {fmt(Math.max(0, Math.min(taxableIncome - 250000, 250000)))}
                  </td>
                  <td className="p-1 text-right pr-3">
                    {fmt(Math.max(0, Math.min(taxableIncome - 250000, 250000)) * 0.05)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1 border-r border-gray-400 font-sans">₹5,00,001 to ₹10,00,000</td>
                  <td className="p-1 border-r border-gray-400 font-sans">20%</td>
                  <td className="p-1 border-r border-gray-400">
                    {fmt(Math.max(0, Math.min(taxableIncome - 500000, 500000)))}
                  </td>
                  <td className="p-1 text-right pr-3">
                    {fmt(Math.max(0, Math.min(taxableIncome - 500000, 500000)) * 0.2)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1 border-r border-gray-400 font-sans">Above ₹10,00,000</td>
                  <td className="p-1 border-r border-gray-400 font-sans">30%</td>
                  <td className="p-1 border-r border-gray-400">
                    {fmt(Math.max(0, taxableIncome - 1000000))}
                  </td>
                  <td className="p-1 text-right pr-3">
                    {fmt(Math.max(0, taxableIncome - 1000000) * 0.3)}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold border-t border-black text-xs">
                  <td colSpan={3} className="p-1.5 border-r border-gray-400 text-right font-sans">Tax on Total Income:</td>
                  <td className="p-1.5 text-right pr-3 tabular-nums">{fmt(slabTax)}</td>
                </tr>
                {rebate87A > 0 && (
                  <tr>
                    <td colSpan={3} className="p-1 border-r border-gray-400 text-right font-sans">Less: Tax Rebate u/s 87A:</td>
                    <td className="p-1 text-right pr-3 tabular-nums">-{fmt(rebate87A)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="p-1 border-r border-gray-400 text-right font-sans">Add: Health (1%) & Education Cess (3%) @ 4%:</td>
                  <td className="p-1 text-right pr-3 tabular-nums">+{fmt(cess)}</td>
                </tr>
                {reliefNum > 0 && (
                  <tr>
                    <td colSpan={3} className="p-1 border-r border-gray-400 text-right font-sans">Less: Tax Relief u/s 89 (Form 10E):</td>
                    <td className="p-1 text-right pr-3 tabular-nums">-{fmt(reliefNum)}</td>
                  </tr>
                )}
                <tr className="bg-gray-200 font-bold border-t border-black text-xs">
                  <td colSpan={3} className="p-1.5 border-r border-black text-right font-sans">Total Tax Payable:</td>
                  <td className="p-1.5 text-right pr-3 tabular-nums">₹{fmt(taxPayable - reliefNum)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 9 & 10: Advance Tax Deductions & Final Payable */}
          <div className="grid grid-cols-[1fr_220px] border border-black divide-x divide-black">
            <div className="p-1.5 text-xs space-y-1">
              <div className="font-bold">9 Advance Tax Deductions (TDS Paid)</div>
              <div className="grid grid-cols-4 text-center tabular-nums pt-0.5 text-[11px]">
                <div>Q1: ₹{fmt(advQ1)}</div>
                <div>Q2: ₹{fmt(advQ2)}</div>
                <div>Q3: ₹{fmt(advQ3)}</div>
                <div>Q4: ₹{fmt(advQ4)}</div>
              </div>
              <div className="text-right pr-3 font-bold text-gray-800 text-[11px]">Total TDS Paid: ₹{fmt(totalTDS)}</div>
            </div>
            <div className="p-2 bg-gray-100 flex flex-col justify-center items-center text-center">
              <div className="text-xs font-bold uppercase">10 Total Tax to be Paid now (8 − 9)</div>
              <div className="tabular-nums font-bold text-lg text-black pt-0.5">₹{fmt(netPayable)}</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 flex justify-between font-bold text-xs">
            <div>Signature of the Drawing Officer</div>
            <div>Signature of the Employee</div>
          </div>
        </div>
      )}

      {/* ── FORM 16 PART A ── */}
      {(activeTab === "form16a" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-6 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-4 print:border-none print:p-0 print-page-break text-xs leading-normal w-full antialiased">
          <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
            <div className="text-xs font-semibold text-gray-700">FORM NO. 16</div>
            <div className="text-xs font-bold text-gray-800">[See rule 31(1)(a)]</div>
            <div className="font-bold text-sm uppercase tracking-wide">CERTIFICATE UNDER SECTION 203 OF THE INCOME-TAX ACT, 1961</div>
            <div className="text-xs text-gray-700">for Tax Deducted at Source on Salary</div>
          </div>
          <div className="flex justify-between text-xs px-1">
            <div>
              <b>Certificate No.: </b><span>{certNo || "________________"}</span>
            </div>
            <div>
              <b>Last Updated: </b><span>{certDate || "___/___/________"}</span>
            </div>
          </div>
          <div className="bg-gray-200 border border-black p-1.5 font-bold text-center uppercase text-xs tracking-wider">PART A</div>
          <div className="grid grid-cols-2 border border-black divide-x divide-black text-xs">
            <div className="p-3 space-y-1">
              <div className="font-bold uppercase border-b border-black pb-1 text-xs">Name and Address of Employer / Deductor</div>
              <div className="font-bold text-black">{ddoName || "[DDO Name]"}</div>
              <div className="text-gray-800">{empSchool}, {empPlace}, {empMandal}, {empDist}</div>
              <div>
                <b>TAN: </b><span className="font-bold">{ddoTan || "________________"}</span>
              </div>
              <div>
                <b>PAN: </b><span className="font-bold">{ddoPan || "________________"}</span>
              </div>
              <div className="text-gray-700 text-[11px]">
                <b>CIT (TDS): </b>O/o CIT (TDS), {citCity} – {citPin}
              </div>
            </div>
            <div className="p-3 space-y-1">
              <div className="font-bold uppercase border-b border-black pb-1 text-xs">Name and Designation of Employee</div>
              <div className="font-bold text-black">{empName}</div>
              <div className="font-medium">{empDesig}</div>
              <div className="text-gray-800">{empSchool}, {empPlace}, {empDist}</div>
              <div>
                <b>PAN: </b><span className="font-bold">{empPan || "________________"}</span>
              </div>
              <div>
                <b>Emp Ref No.: </b><span>{empTid || "—"}</span>
              </div>
              <div>
                <b>Assessment Year: </b><b>{ayLabel}</b>
              </div>
              <div>
                <b>Period: </b>{empFrom} to {empTo}
              </div>
            </div>
          </div>

          {/* Quarterly TDS Summary Table */}
          <div className="border border-black text-xs">
            <div className="bg-gray-200 border-b border-black p-1.5 font-bold uppercase text-center text-xs">
              Summary of Tax Deducted and Deposited in Central Government Account through Book Adjustment
            </div>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold text-xs">
                  <th className="border-r border-black p-1.5">Quarter</th>
                  <th className="border-r border-black p-1.5">Receipt No. of Quarterly Statement u/s 200(3)</th>
                  <th className="border-r border-black p-1.5 text-right pr-2">Amount Paid / Credited (₹)</th>
                  <th className="border-r border-black p-1.5 text-right pr-2">Tax Deducted (₹)</th>
                  <th className="p-1.5 text-right pr-2">Tax Deposited (₹)</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[
                  { q: "Q1", rec: q1Rec, paid: q1Paid, ded: q1Ded, dep: q1Dep },
                  { q: "Q2", rec: q2Rec, paid: q2Paid, ded: q2Ded, dep: q2Dep },
                  { q: "Q3", rec: q3Rec, paid: q3Paid, ded: q3Ded, dep: q3Dep },
                  { q: "Q4", rec: q4Rec, paid: q4Paid, ded: q4Ded, dep: q4Dep },
                ].map(({ q, rec, paid, ded, dep }) => (
                  <tr key={q} className="border-b border-gray-300">
                    <td className="border-r border-black p-1 font-bold">{q}</td>
                    <td className="border-r border-black p-1">{rec || "—"}</td>
                    <td className="border-r border-black p-1 text-right pr-2">{fmt(n(paid))}</td>
                    <td className="border-r border-black p-1 text-right pr-2">{fmt(n(ded))}</td>
                    <td className="p-1 text-right pr-2">{fmt(n(dep))}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100 border-t border-black">
                  <td colSpan={2} className="border-r border-black p-1.5 text-right">
                    TOTAL
                  </td>
                  <td className="border-r border-black p-1.5 text-right pr-2 tabular-nums">{fmt(totalAmtPaid)}</td>
                  <td className="border-r border-black p-1.5 text-right pr-2 tabular-nums">{fmt(totalTDS)}</td>
                  <td className="p-1.5 text-right pr-2 tabular-nums">{fmt(totalDep)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section I — BIN for Govt Deductors */}
          <div className="border border-black text-xs">
            <div className="bg-gray-200 border-b border-black p-1.5 font-bold uppercase text-xs">
              Section I — Book Adjustment Details (For Government Deductors — AP Teachers)
            </div>
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 border-b border-black font-bold text-xs">
                  <th className="border-r border-black p-1.5">Sl</th>
                  <th className="border-r border-black p-1.5 text-right pr-2">Tax Deposited (₹)</th>
                  <th className="border-r border-black p-1.5">Receipt No. of Form 24G</th>
                  <th className="border-r border-black p-1.5">DDO Serial No. in Form 24G</th>
                  <th className="border-r border-black p-1.5">Date of Transfer Voucher</th>
                  <th className="p-1.5">Status of Matching</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr>
                  <td className="border-r border-black p-1 font-bold">1</td>
                  <td className="border-r border-black p-1 text-right pr-2">{fmt(totalDep)}</td>
                  <td className="border-r border-black p-1">{bin24G || "—"}</td>
                  <td className="border-r border-black p-1">{binSerial || "—"}</td>
                  <td className="border-r border-black p-1">{binDate || "—"}</td>
                  <td className="p-1 font-semibold text-emerald-800">Matched</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification */}
          <div className="border border-black p-4 text-xs space-y-2">
            <div className="font-bold uppercase border-b border-black pb-1">Verification</div>
            <p className="leading-relaxed">
              I, <b>{ddoName || "_______________"}</b>, son/daughter/wife of ____________________ working in the capacity of{" "}
              <b>{ddoDesig}</b> do hereby certify that a sum of <b>Rs. {fmt(totalTDS)}/-</b> has been deducted at source and paid to
              the credit of the Central Government. I further certify that the information given above is true, complete and correct.
            </p>
            <div className="pt-6 flex justify-between font-bold">
              <div>
                Place: {empPlace}<br />Date: {certDate || "___/___/________"}
              </div>
              <div className="text-right">
                (Signature of person responsible for deduction of tax)<br />
                <b>{ddoName || "_______________"}</b><br />
                <span className="font-normal">{ddoDesig}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FORM 16 PART B ── */}
      {(activeTab === "form16b" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-6 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-4 print:border-none print:p-0 print-page-break text-xs leading-normal w-full antialiased">
          <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
            <div className="font-bold text-sm uppercase tracking-wide">FORM NO. 16 — PART B (ANNEXURE)</div>
            <div className="text-xs text-gray-700">Details of Salary Paid and any other income and tax deducted</div>
          </div>
          <div className="grid grid-cols-2 border border-black p-2.5 gap-2 text-xs bg-gray-50">
            <div>
              <b>Name of Employee: </b><span className="font-bold">{empName}</span>
            </div>
            <div>
              <b>PAN of Employee: </b><span className="font-bold">{empPan}</span>
            </div>
            <div>
              <b>Assessment Year: </b><b>{ayLabel}</b>
            </div>
            <div>
              <b>Financial Year: </b><b>{fy}</b>
            </div>
          </div>
          <div className="border border-black p-2 text-xs bg-gray-50">
            <b>Whether opting out of taxation u/s 115BAC(1A) (New Tax Regime)? </b>
            <u className="font-bold">{regime === "old" ? "YES — Opting out (Old Regime)" : "NO — New Regime"}</u>
          </div>
          <div className="border border-black divide-y divide-black">
            <div className="bg-gray-100 p-1.5 font-bold text-xs">1. Gross Salary</div>
            <OfficialRow label="  (a) Salary as per sec 17(1)" value={sal17_1} sub />
            <OfficialRow label="  (b) Value of perquisites u/s 17(2) [Form 12BA]" value={p17_2} sub />
            <OfficialRow label="  (c) Profits in lieu of salary u/s 17(3) [Form 12BA]" value={p17_3} sub />
            <OfficialRow label="  (d) Total [1(a)+1(b)+1(c)]" value={totalGross} bold />
            <OfficialRow label="  (e) Salary from other employer(s)" value={otherEmpNum} sub />
            <div className="bg-gray-100 p-1.5 font-bold text-xs border-t border-black">2. Less: Allowances exempt u/s 10</div>
            <OfficialRow label="  LTC/LTA u/s 10(5)" value={n(ltcEx)} sub />
            <OfficialRow label="  Gratuity u/s 10(10)" value={n(gratuityEx)} sub />
            <OfficialRow label="  Commuted Pension u/s 10(10A)" value={n(commutedEx)} sub />
            <OfficialRow label="  Leave Encashment u/s 10(10AA)" value={n(leaveEnEx)} sub />
            <OfficialRow label="  HRA u/s 10(13A)" value={hraEx} sub />
            <OfficialRow label="  (i) Total exempt allowances [2]" value={totalSec10} bold />
            <OfficialRow label="3. Total Salary from current employer [1(d)-2(i)]" value={totalGross - totalSec10} bold highlight />
            <div className="bg-gray-100 p-1.5 font-bold text-xs border-t border-black">4. Less: Deductions under section 16</div>
            <OfficialRow label="  (a) Standard deduction u/s 16(ia)" value={stdDed} sub />
            <OfficialRow label="  (b) Entertainment allowance u/s 16(ii)" value={0} sub />
            <OfficialRow label="  (c) Tax on employment u/s 16(iii)" value={ptNum} sub />
            <OfficialRow label="5. Total deductions u/s 16" value={sec16Total} bold />
            <OfficialRow label="6. Income chargeable under 'Salaries' [3+1(e)-5]" value={incChargeable} bold highlight />
            <div className="bg-gray-100 p-1.5 font-bold text-xs border-t border-black">7. Other income reported u/s 192(2B)</div>
            <OfficialRow label="  (a) Income / (loss) from house property" value={-hpLossNum} sub />
            <OfficialRow label="  (b) Income from other sources" value={otherSrcNum} sub />
            <OfficialRow label="8. Total other income [7(a)+7(b)]" value={totalOtherIncome} bold />
            <OfficialRow label="9. Gross total income [6+8]" value={grossTotalIncome} bold highlight />
            <div className="bg-gray-100 p-1.5 font-bold text-xs border-t border-black">10. Deductions under Chapter VI-A</div>
            <div className="grid grid-cols-[1fr_120px_120px] border-b border-gray-300 font-bold text-xs bg-gray-50">
              <div className="py-1 border-r border-black pl-2">Section</div>
              <div className="py-1 border-r border-black text-right pr-2">Gross Amt (₹)</div>
              <div className="py-1 text-right pr-2">Deductible (₹)</div>
            </div>
            {[
              { s: "(a) Section 80C", g: cap80C, d: cap80C },
              { s: "(b) Section 80CCC", g: n(s80ccc), d: n(s80ccc) },
              { s: "(c) Section 80CCD(1)", g: n(s80ccd1), d: n(s80ccd1) },
              { s: "(d) Section 80CCD(1B) — Extra NPS", g: cap80CCD1B, d: cap80CCD1B },
              { s: "(e) Section 80CCD(2) — Employer NPS", g: n(s80ccd2), d: n(s80ccd2) },
              { s: "(f) Section 80D", g: cap80D, d: cap80D },
              { s: "(g) Section 80E", g: n(s80e), d: n(s80e) },
              { s: "(h) Section 80EEB", g: cap80EEB, d: cap80EEB },
              { s: "(i) Section 80G", g: n(s80g), d: n(s80g) },
              { s: "(j) Section 80TTA", g: cap80TTA, d: cap80TTA },
              { s: "(k) Section 80U", g: n(s80u), d: n(s80u) },
            ].map(({ s, g, d }) => (
              <div key={s} className="grid grid-cols-[1fr_120px_120px] border-b border-gray-200 text-xs">
                <div className="py-1 border-r border-black pl-5 text-gray-800">{s}</div>
                <div className="py-1 border-r border-black text-right pr-2 tabular-nums">{fmt(g)}</div>
                <div className="py-1 text-right pr-2 tabular-nums">{fmt(d)}</div>
              </div>
            ))}
            <OfficialRow label="11. Aggregate deductible amount u/s Chapter VI-A" value={regime === "old" ? totalVIA : 0} bold highlight />
            <OfficialRow label="12. Total taxable income [9-11] — Rounded to nearest ₹10" value={taxableIncome} bold highlight />
            <OfficialRow label="13. Tax on total income" value={slabTax} bold />
            <OfficialRow label="14. Less: Rebate u/s 87A" value={rebate87A} sub />
            <OfficialRow label="15. Surcharge (if applicable)" value={surcharge} sub />
            <OfficialRow label="16. Health and Education Cess @ 4%" value={cess} sub />
            <OfficialRow label="17. Tax payable [13+15+16-14]" value={taxPayable} bold highlight />
            <OfficialRow label="18. Less: Relief u/s 89 (attach Form 10E)" value={reliefNum} sub />
            <OfficialRow label="19. Net tax payable [17-18]" value={taxPayable - reliefNum} bold />
            <OfficialRow label="20. Less: TDS deducted at source" value={totalTDS} sub />
            <OfficialRow label="21. Net tax payable / (refundable) [19-20]" value={netPayable} bold highlight />
          </div>
          <div className="border border-black p-4 text-xs space-y-2">
            <div className="font-bold uppercase border-b border-black pb-1">Verification (Part B)</div>
            <p className="leading-relaxed">
              I, <b>{ddoName || "_______________"}</b>, working in the capacity of <b>{ddoDesig}</b>, do hereby certify that the
              information given above is true, complete and correct.
            </p>
            <div className="pt-6 flex justify-between font-bold">
              <div>
                Place: {empPlace}<br />Date: {certDate || "___/___/________"}
              </div>
              <div className="text-right">
                (Signature of person responsible)<br />
                <b>{ddoName}</b><br />
                <span className="font-normal">{ddoDesig}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FORM 12BB ── */}
      {(activeTab === "form12bb" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-6 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-4 print:border-none print:p-0 print-page-break text-xs leading-normal w-full antialiased">
          <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
            <div className="text-xs font-semibold text-gray-700">INCOME TAX RULES, 1962</div>
            <div className="font-bold text-sm uppercase tracking-wide">FORM NO. 12BB</div>
            <div className="text-xs font-bold text-gray-800">[See rule 26C]</div>
            <div className="text-xs text-gray-700">
              Statement showing particulars of claims by an employee for deduction of tax under section 192
            </div>
          </div>
          <div className="border border-black p-3 space-y-1 text-xs bg-gray-50">
            <div>
              1. Name and address of employee: <b>{empName}</b>, {empDesig}, {empSchool}, {empPlace}, {empMandal}, {empDist}
            </div>
            <div>
              2. Permanent Account Number: <b>{empPan || "________________"}</b>
            </div>
            <div>
              3. Financial Year: <b>{fy}</b>
            </div>
          </div>
          <table className="w-full border border-black text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-200 font-bold border-b-2 border-black">
                <th className="p-1.5 border-r border-black w-8">Sl No.</th>
                <th className="p-1.5 border-r border-black">Nature of claim</th>
                <th className="p-1.5 border-r border-black text-right w-32">Amount (Rs.)</th>
                <th className="p-1.5 w-52">Evidence / particulars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              <tr>
                <td className="p-1.5 border-r border-black align-top font-bold">1</td>
                <td className="p-1.5 border-r border-black align-top">
                  <div className="font-bold">House Rent Allowance u/s 10(13A)</div>
                  <div className="text-xs mt-1 space-y-0.5 text-gray-800">
                    <div>
                      Rent paid: <b>₹{fmt(n(rentPaid))}</b>
                    </div>
                    <div>
                      Landlord Name: <b>{llName || "—"}</b>
                    </div>
                    <div>
                      Landlord Address: <b>{llAddr}</b>
                    </div>
                    <div>
                      Landlord PAN: <b>{llPan || "(Not provided)"}</b>
                    </div>
                  </div>
                </td>
                <td className="p-1.5 border-r border-black text-right align-top font-bold tabular-nums">{fmt(hraEx)}</td>
                <td className="p-1.5 align-top text-xs text-gray-700">Rent receipts with Revenue Stamp duly signed</td>
              </tr>
              <tr>
                <td className="p-1.5 border-r border-black align-top font-bold">2</td>
                <td className="p-1.5 border-r border-black align-top">
                  <div className="font-bold">Leave Travel Concessions / Assistance u/s 10(5) [LTC/LTA]</div>
                </td>
                <td className="p-1.5 border-r border-black text-right align-top font-bold tabular-nums">{fmt(n(ltcAmt))}</td>
                <td className="p-1.5 align-top text-xs text-gray-700">{ltcEv}</td>
              </tr>
              <tr>
                <td className="p-1.5 border-r border-black align-top font-bold">3</td>
                <td className="p-1.5 border-r border-black align-top">
                  <div className="font-bold">Deduction of interest on borrowing u/s 24(b) [Home Loan]</div>
                  <div className="text-xs mt-1 space-y-0.5 text-gray-800">
                    <div>
                      Interest paid: <b>₹{fmt(cap24B)}</b>
                    </div>
                    <div>
                      Lender Name: <b>{lenderName}</b>
                    </div>
                    <div>
                      Lender Address: <b>{lenderAddr || "—"}</b>
                    </div>
                    <div>
                      Lender PAN: <b>{lenderPan || "—"}</b>
                    </div>
                    <div>
                      Type: <b>{lenderType}</b>
                    </div>
                  </div>
                </td>
                <td className="p-1.5 border-r border-black text-right align-top font-bold tabular-nums">{fmt(cap24B)}</td>
                <td className="p-1.5 align-top text-xs text-gray-700">Certificate from lender showing interest paid</td>
              </tr>
              <tr>
                <td className="p-1.5 border-r border-black align-top font-bold">4</td>
                <td className="p-1.5 border-r border-black align-top" colSpan={3}>
                  <div className="font-bold mb-1">Deductions under Chapter VI-A</div>
                  <table className="w-full border-collapse border border-gray-400 text-xs">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-gray-400">
                        <th className="p-1.5 border-r border-gray-400 text-left">Section</th>
                        <th className="p-1.5 border-r border-gray-400 text-right">Amount (₹)</th>
                        <th className="p-1.5 text-left">Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { s: "80C — GPF", a: n(gpf), e: "Salary slip / GPF statement" },
                        { s: "80C — APGLI", a: n(apgli), e: "APGLI premium receipt" },
                        { s: "80C — GIS", a: n(gis), e: "GIS subscription" },
                        { s: "80C — LIC / PLI", a: n(lic) + n(pli), e: "LIC/PLI premium receipt" },
                        { s: "80C — PPF", a: n(ppf), e: "PPF passbook" },
                        { s: "80C — Tuition Fees", a: n(tuition), e: "School fee receipts" },
                        { s: "80C — Home Loan Principal", a: n(hlPrincipal), e: "Bank certificate" },
                        { s: "80CCC — Pension Fund", a: n(s80ccc), e: "Pension fund receipt" },
                        { s: "80CCD(1) — NPS Employee", a: n(s80ccd1), e: "NPS statement" },
                        { s: "80CCD(1B) — Additional NPS", a: cap80CCD1B, e: "NPS PRAN statement" },
                        { s: "80CCD(2) — Employer NPS", a: n(s80ccd2), e: "Employer certificate" },
                        { s: "80D — Health Insurance", a: cap80D, e: "Premium receipt / EHS" },
                        { s: "80E — Education Loan Interest", a: n(s80e), e: "Bank certificate" },
                        { s: "80G — Donations", a: n(s80g), e: "Receipt with 80G cert" },
                        { s: "80TTA — Savings Interest", a: cap80TTA, e: "Bank passbook" },
                        { s: "80U — Disability", a: n(s80u), e: "Medical certificate" },
                      ]
                        .filter((r) => r.a > 0)
                        .map(({ s, a, e }) => (
                          <tr key={s} className="border-b border-gray-300">
                            <td className="p-1 border-r border-gray-400">{s}</td>
                            <td className="p-1 border-r border-gray-400 text-right font-bold tabular-nums">{fmt(a)}</td>
                            <td className="p-1 text-gray-700">{e}</td>
                          </tr>
                        ))}
                      <tr className="font-bold bg-gray-100 border-t border-gray-400">
                        <td className="p-1.5 border-r border-gray-400">Total Chapter VI-A</td>
                        <td className="p-1.5 border-r border-gray-400 text-right tabular-nums">{fmt(totalVIA)}</td>
                        <td className="p-1.5"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="border-t-2 border-black pt-3 text-xs">
            <div className="font-bold uppercase text-xs">Verification</div>
            <p className="mt-1 leading-relaxed">
              I, <b>{empName}</b>, son/daughter of <b>{empFather || "_______________"}</b> do hereby certify that the
              information given above is complete and correct.
            </p>
            <div className="pt-8 flex justify-between font-bold">
              <div>
                Place: {empPlace}<br />Date: ___/___/________
              </div>
              <div>(Signature of the employee)</div>
            </div>
          </div>
        </div>
      )}

      {/* ── FORM 12BA ── */}
      {(activeTab === "form12ba" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-6 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-4 print:border-none print:p-0 print-page-break text-xs leading-normal w-full antialiased">
          <div className="text-center border-b-2 border-black pb-2 space-y-0.5">
            <div className="text-xs font-semibold text-gray-700">INCOME TAX RULES, 1962</div>
            <div className="font-bold text-sm uppercase tracking-wide">FORM NO. 12BA</div>
            <div className="text-xs font-bold text-gray-800">[See rule 26A(2)(b)]</div>
            <div className="text-xs text-gray-700">
              Statement showing particulars of perquisites, other fringe benefits or amenities and profits in lieu of salary with
              value thereof
            </div>
          </div>
          <div className="grid grid-cols-2 border border-black divide-x divide-black text-xs">
            <div className="p-3 space-y-1">
              <div className="font-bold uppercase border-b border-black pb-1 text-xs">1. Employer</div>
              <div className="font-bold text-black">{ddoName || "[DDO Name]"}</div>
              <div className="text-gray-800">{empSchool}, {empPlace}</div>
              <div>
                <b>TAN: </b><span className="font-bold">{ddoTan || "—"}</span>
              </div>
            </div>
            <div className="p-3 space-y-1">
              <div className="font-bold uppercase border-b border-black pb-1 text-xs">2. Employee</div>
              <div className="font-bold text-black">{empName}</div>
              <div>{empDesig}</div>
              <div>
                <b>PAN: </b><span className="font-bold">{empPan || "—"}</span>
              </div>
            </div>
          </div>
          <div className="border border-black p-2.5 grid grid-cols-2 gap-2 text-xs bg-gray-50">
            <div>
              <b>Financial Year: </b><b>{fy}</b>
            </div>
            <div>
              <b>Assessment Year: </b><b>{ayLabel}</b>
            </div>
          </div>
          <div className="font-bold text-xs">4. Details of perquisites and profits in lieu of salary</div>
          <table className="w-full border border-black text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200 font-bold border-b border-black">
                <th className="p-1 border-r border-black w-8">Sl.</th>
                <th className="p-1 border-r border-black">Nature of perquisite</th>
                <th className="p-1 border-r border-black text-right w-32">Value provided (₹)</th>
                <th className="p-1 border-r border-black text-right w-32">Recovered (₹)</th>
                <th className="p-1 text-right w-32">Chargeable to tax (₹)</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Accommodation",
                "Cars / Other automotive",
                "Sweeper, gardener, watchman or personal attendant",
                "Gas, electricity, water",
                "Interest free or concessional loans",
                "Holiday expenses",
                "Free or concessional travel",
                "Free meals",
                "Education",
                "Gifts, vouchers etc.",
                "Credit card expenses",
                "Club expenses",
                "Use of movable assets by employees",
                "Transfer of movable assets to employees",
                "Value of any other benefit/amenity/service/privilege",
                "Stock options (non-qualified options)",
                "Sweat Equity Shares",
                "Contributions by employer to approved Superannuation Fund",
                "Any other (specify)",
              ].map((item, i) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className="p-1 border-r border-black text-center">{i + 1}</td>
                  <td className="p-1 border-r border-black">{item}</td>
                  <td className="p-1 border-r border-black text-right tabular-nums">
                    {item.includes("perquisite") || (i === 0 && p17_2 > 0) ? fmt(p17_2) : ""}
                  </td>
                  <td className="p-1 border-r border-black text-right tabular-nums"></td>
                  <td className="p-1 text-right tabular-nums">
                    {item.includes("perquisite") || (i === 0 && p17_2 > 0) ? fmt(p17_2) : ""}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-200 border-t border-black">
                <td colSpan={2} className="p-1.5 border-r border-black text-right">
                  Total value of perquisites u/s 17(2)
                </td>
                <td className="p-1.5 border-r border-black text-right tabular-nums">{fmt(p17_2)}</td>
                <td className="p-1.5 border-r border-black text-right tabular-nums">0</td>
                <td className="p-1.5 text-right tabular-nums">{fmt(p17_2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="border border-black p-3 text-xs">
            <div className="font-bold border-b border-black pb-1 text-xs">5. Details of profits in lieu of salary u/s 17(3)</div>
            <table className="w-full border-collapse border border-gray-400 text-xs mt-1.5">
              <thead>
                <tr className="bg-gray-100 font-bold border-b border-gray-400">
                  <th className="p-1.5 border-r border-gray-400 w-8">Sl.</th>
                  <th className="p-1.5 border-r border-gray-400">Nature of profit</th>
                  <th className="p-1.5 text-right w-40">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1.5 border-r border-gray-400 text-center">1</td>
                  <td className="p-1.5 border-r border-gray-400">
                    Compensation on termination / modification of employment
                  </td>
                  <td className="p-1.5 text-right tabular-nums">{fmt(p17_3)}</td>
                </tr>
                <tr className="font-bold border-t border-gray-400 bg-gray-50">
                  <td colSpan={2} className="p-1.5 border-r border-gray-400 text-right">
                    Total profits in lieu of salary u/s 17(3)
                  </td>
                  <td className="p-1.5 text-right tabular-nums">{fmt(p17_3)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border-t-2 border-black pt-3 text-xs">
            <div className="font-bold uppercase text-xs">Verification</div>
            <p className="mt-1 leading-relaxed">
              I, <b>{ddoName || "_______________"}</b>, working in the capacity of <b>{ddoDesig}</b>, do hereby certify that the
              information given above is based on the books of account, documents and other relevant records and is true and correct.
            </p>
            <div className="pt-6 flex justify-between font-bold">
              <div>
                Place: {empPlace}<br />Date: {certDate || "___/___/________"}
              </div>
              <div className="text-right">
                (Signature)<br />
                <b>{ddoName}</b><br />
                <span className="font-normal">{ddoDesig}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECEIPT OF HOUSE RENT ── */}
      {(activeTab === "rentReceipt" || activeTab === "printAll") && (
        <div className="bg-white border-2 border-black p-8 font-['Arial','Segoe_UI',Calibri,sans-serif] text-black space-y-6 max-w-2xl mx-auto print:border-none print:p-0 print:max-w-none print:w-full print-page-break text-xs leading-relaxed antialiased">
          <div className="text-center border-b-2 border-black pb-3">
            <h1 className="text-xl font-bold uppercase tracking-wider">RECEIPT OF HOUSE RENT</h1>
            <div className="text-xs font-semibold text-gray-700">(Under Section 10(13-A) of Income Tax Act, 1961)</div>
          </div>
          <div className="space-y-4 text-xs">
            <p className="leading-relaxed">
              Received a sum of <b>Rs. {fmt(n(rentPaid))}/-</b> (Rupees ________________________________________________) from{" "}
              <b>{empName}</b>, {empDesig}, {empSchool}, towards house rent @{" "}
              <b>Rs. {fmt(Math.round(n(rentPaid) / 12))}/-</b> per month for the period <b>{empFrom}</b> to <b>{empTo}</b>{" "}
              (Financial Year <b>{fy}</b>) for the residential premises situated at:
            </p>
            <div className="border-b-2 border-black pb-2 font-semibold text-gray-900 bg-gray-50 p-2.5">
              <b>Residence Address: </b>{llAddr}
            </div>
          </div>
          <div className="pt-6 flex justify-between items-end">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-gray-900">Tenant (Employee):</div>
              <div className="font-semibold text-sm">{empName}</div>
              <div className="text-gray-700">{empDesig}</div>
              <div className="pt-8">Signature: ____________________</div>
            </div>
            <div className="text-center">
              <div className="w-28 h-28 border-2 border-dashed border-black mx-auto flex items-center justify-center text-[var(--label-primary)] md:text-[var(--label-secondary)] font-bold leading-tight p-2 bg-amber-50/50">
                Affix<br />Revenue Stamp<br />of ₹1/-
              </div>
            </div>
            <div className="space-y-1 text-xs text-right">
              <div className="font-bold text-gray-900">House Owner (Landlord):</div>
              <div className="font-semibold text-sm">{llName || "_______________"}</div>
              <div className="text-gray-700">{llAddr}</div>
              {llPan && <div><b>PAN:</b> {llPan}</div>}
              <div className="pt-8">Signature: ____________________</div>
            </div>
          </div>
          <div className="border-t border-black pt-3 text-center text-[11px] text-gray-600">
            Note: PAN of landlord is mandatory under CBDT rules if total rent paid exceeds ₹1,00,000/- per annum.
          </div>
        </div>
      )}
    </div>
  );
}
