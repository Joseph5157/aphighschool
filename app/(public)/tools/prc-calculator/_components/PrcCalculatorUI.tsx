"use client";

import { useState, useId } from "react";
import Link from "next/link";
import Accordion from "@/app/(public)/_components/Accordion";
import Button from "@/app/(public)/_components/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import NativeSelect from "@/app/(public)/_components/NativeSelect";
import Separator from "@/app/(public)/_components/Separator";
import Badge from "@/app/(public)/_components/Badge";
import { calculatePrcFixation } from "@/lib/prc";

function fmt(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

const FITMENT_PRESETS = [
  { label: "23% (AP RPS 2022 Official)", value: 23 },
  { label: "27% (Proposed 11th PRC)", value: 27 },
  { label: "30% (Recommended 12th PRC)", value: 30 },
  { label: "Custom Fitment %", value: -1 },
];

const DA_PRESETS = [
  { label: "30.392% (AP Current DA)", value: 30.392 },
  { label: "26.39% (RPS 2022 Merge DA)", value: 26.39 },
  { label: "33.53% (Central DA Merge)", value: 33.53 },
  { label: "Custom DA %", value: -1 },
];

const HRA_PRESETS = [
  { label: "16% (District HQ / Major Towns)", value: 16 },
  { label: "10% (Mandal / Town)", value: 10 },
  { label: "8% (Rural / Village)", value: 8 },
  { label: "24% (Corporation / GHMC)", value: 24 },
  { label: "Custom HRA %", value: -1 },
];

export default function PrcCalculatorUI() {
  const basicId = useId();
  const fitmentId = useId();
  const daId = useId();
  const hraId = useId();
  const monthsId = useId();

  const [existingBasic, setExistingBasic] = useState("35570");
  const [fitmentPreset, setFitmentPreset] = useState("23");
  const [customFitment, setCustomFitment] = useState("23");
  const [daPreset, setDaPreset] = useState("30.392");
  const [customDa, setCustomDa] = useState("30.392");
  const [hraPreset, setHraPreset] = useState("16");
  const [customHra, setCustomHra] = useState("16");
  const [monthsArrears, setMonthsArrears] = useState("12");
  const [isPrintMode, setIsPrintMode] = useState(false);

  const fitmentVal = fitmentPreset === "-1" ? parseFloat(customFitment) || 0 : parseFloat(fitmentPreset) || 0;
  const daVal = daPreset === "-1" ? parseFloat(customDa) || 0 : parseFloat(daPreset) || 0;
  const hraVal = hraPreset === "-1" ? parseFloat(customHra) || 0 : parseFloat(customHra) || 0;
  const basicNum = parseFloat(existingBasic) || 0;
  const monthsNum = parseInt(monthsArrears, 10) || 0;

  const result = calculatePrcFixation({
    existingBasic: basicNum,
    fitmentPercent: fitmentVal,
    existingDaPercent: daVal,
    hraPercent: hraVal,
    monthsArrears: monthsNum,
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Navigation & Options */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            RPS 2022 / Master Scale
          </Badge>
          <span className="font-mono text-xs text-inkSoft">PRC Pay Fixation Calculator</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isPrintMode ? "tamarind" : "outline"}
            size="sm"
            onClick={() => setIsPrintMode(!isPrintMode)}
          >
            {isPrintMode ? "📄 Back to Form" : "🖨️ Print DDO Statement"}
          </Button>
        </div>
      </div>

      {isPrintMode ? (
        /* Printable DDO Fixation Statement */
        <Card className="p-6 space-y-4 bg-white text-black font-serif border border-black/30">
          <div className="text-center space-y-1 pb-4 border-b border-black">
            <h2 className="text-lg font-bold uppercase tracking-wider">
              PROCEEDINGS OF THE DRAWING & DISBURSING OFFICER
            </h2>
            <p className="text-xs italic">
              Pay Fixation Statement under Revised Pay Scales (PRC)
            </p>
          </div>

          <div className="grid grid-cols-2 text-xs font-mono gap-y-2 pt-2">
            <div><strong>Employee Basic Pay:</strong> ₹{fmt(result.existingBasic)}</div>
            <div><strong>Fitment Percentage:</strong> {fitmentVal}%</div>
            <div><strong>Merged DA Percentage:</strong> {daVal}%</div>
            <div><strong>HRA Rate:</strong> {hraVal}%</div>
          </div>

          <div className="pt-4 space-y-2">
            <h3 className="text-xs font-bold uppercase border-b border-black/40 pb-1">
              Fixation Calculation Breakdown
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-black">
              <thead>
                <tr className="bg-black/5">
                  <th className="border border-black p-2">Item</th>
                  <th className="border border-black p-2 text-right">Pre-PRC (Existing)</th>
                  <th className="border border-black p-2 text-right">Post-PRC (Revised)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">Basic Pay</td>
                  <td className="border border-black p-2 text-right">₹{fmt(result.existingBasic)}</td>
                  <td className="border border-black p-2 text-right font-bold">₹{fmt(result.revisedBasic)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">DA Amount</td>
                  <td className="border border-black p-2 text-right">₹{fmt(result.daAmount)}</td>
                  <td className="border border-black p-2 text-right">₹0 (Merged)</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">HRA Amount</td>
                  <td className="border border-black p-2 text-right">₹{fmt(Math.round((result.existingBasic * hraVal) / 100))}</td>
                  <td className="border border-black p-2 text-right">₹{fmt(Math.round((result.revisedBasic * hraVal) / 100))}</td>
                </tr>
                <tr className="font-bold bg-black/5">
                  <td className="border border-black p-2">Gross Total</td>
                  <td className="border border-black p-2 text-right">₹{fmt(result.preGross)}</td>
                  <td className="border border-black p-2 text-right text-emerald-800">₹{fmt(result.postGross)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-black/40 text-xs font-mono flex justify-between items-end">
            <div>
              <p><strong>Monthly Net Benefit:</strong> +₹{fmt(result.monthlyGrossDiff)}/month</p>
              <p><strong>Est. Total Arrears ({monthsNum} months):</strong> ₹{fmt(result.totalArrearsGross)}</p>
            </div>
            <div className="text-center pt-8">
              <p className="border-t border-black px-4 pt-1 font-sans">Signature of DDO / Head Master</p>
            </div>
          </div>
        </Card>
      ) : (
        /* Interactive Calculator Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Controls Form */}
          <Card className="lg:col-span-6 p-5 space-y-5 bg-paperRaised border-hair">
            <CardHeader className="p-0 space-y-1">
              <CardTitle className="text-card-title text-ink">Pay Fixation Parameters</CardTitle>
              <p className="text-body text-inkSoft">
                Enter your existing pay scale details to calculate your revised pay step under PRC.
              </p>
            </CardHeader>

            <Separator />

            <div className="space-y-4">
              <Field
                htmlFor={basicId}
                label="Existing Basic Pay (₹)"
                helperText="Your current basic pay stage in rupees"
              >
                <Input
                  id={basicId}
                  type="number"
                  value={existingBasic}
                  onChange={(e) => setExistingBasic(e.target.value)}
                  placeholder="e.g. 35570"
                />
              </Field>

              <Field
                htmlFor={fitmentId}
                label="Fitment Percentage (%)"
                helperText="Select official or proposed fitment rate"
              >
                <NativeSelect
                  id={fitmentId}
                  value={fitmentPreset}
                  onChange={(e) => setFitmentPreset(e.target.value)}
                >
                  {FITMENT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </NativeSelect>
                {fitmentPreset === "-1" && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={customFitment}
                      onChange={(e) => setCustomFitment(e.target.value)}
                      placeholder="Enter custom fitment %"
                    />
                  </div>
                )}
              </Field>

              <Field
                htmlFor={daId}
                label="Existing DA Percentage (%)"
                helperText="DA percentage merged at fixation"
              >
                <NativeSelect
                  id={daId}
                  value={daPreset}
                  onChange={(e) => setDaPreset(e.target.value)}
                >
                  {DA_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </NativeSelect>
                {daPreset === "-1" && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={customDa}
                      onChange={(e) => setCustomDa(e.target.value)}
                      placeholder="Enter custom DA %"
                    />
                  </div>
                )}
              </Field>

              <Field
                htmlFor={hraId}
                label="HRA Category (%)"
                helperText="Applicable HRA rate for your working location"
              >
                <NativeSelect
                  id={hraId}
                  value={hraPreset}
                  onChange={(e) => setHraPreset(e.target.value)}
                >
                  {HRA_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </NativeSelect>
                {hraPreset === "-1" && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={customHra}
                      onChange={(e) => setCustomHra(e.target.value)}
                      placeholder="Enter custom HRA %"
                    />
                  </div>
                )}
              </Field>

              <Field
                htmlFor={monthsId}
                label="Arrears Duration (Months)"
                helperText="Number of months for PRC arrears calculation"
              >
                <Input
                  id={monthsId}
                  type="number"
                  value={monthsArrears}
                  onChange={(e) => setMonthsArrears(e.target.value)}
                  placeholder="e.g. 12"
                />
              </Field>
            </div>
          </Card>

          {/* Results Comparison Card */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-5 space-y-4 bg-ink text-paper border border-turmeric/30">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <Badge variant="turmeric" size="sm">
                    Fixation Summary
                  </Badge>
                  <span className="font-mono text-xs text-turmeric font-bold">
                    +₹{fmt(result.monthlyGrossDiff)} / month
                  </span>
                </div>
                <CardTitle className="text-display text-turmeric mt-2">
                  ₹{fmt(result.revisedBasic)}
                </CardTitle>
                <p className="text-xs text-paper/70 font-mono">Revised Basic Pay Stage (Master Scale)</p>
              </CardHeader>

              <Separator className="bg-paper/20" />

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Raw Calculated Fitment Pay:</span>
                  <span className="font-bold text-paper">₹{fmt(result.rawTotal)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Pre-PRC Monthly Gross:</span>
                  <span className="font-bold text-paper">₹{fmt(result.preGross)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Post-PRC Monthly Gross:</span>
                  <span className="font-bold text-turmeric">₹{fmt(result.postGross)}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-paper/70">Est. Total Gross Arrears ({monthsNum} mo):</span>
                  <span className="font-bold text-emerald-400">₹{fmt(result.totalArrearsGross)}</span>
                </div>
              </div>
            </Card>

            {/* Arrears Allocation Split Card */}
            <Card className="p-5 space-y-3 bg-paperRaised border-hair">
              <h3 className="text-xs font-bold font-mono text-ink uppercase tracking-wide">
                Arrears Split & Deductions
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-ink/5 border border-hair rounded-lg space-y-1">
                  <span className="text-inkSoft text-[10px]">10% CPS / PRAN Share</span>
                  <p className="font-bold text-ink text-sm">₹{fmt(result.cpsDeduction)}</p>
                </div>
                <div className="p-3 bg-turmeric/10 border border-turmeric/30 rounded-lg space-y-1">
                  <span className="text-turmericDeep text-[10px]">GPF / Cash Net Payout</span>
                  <p className="font-bold text-ink text-sm">₹{fmt(result.gpfOrCashCredit)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* FAQ Accordion */}
      <div className="pt-4 border-t border-hair space-y-3">
        <h2 className="text-section text-ink flex items-center gap-2">
          <span>❓</span> PRC Pay Fixation FAQ
        </h2>
        <Accordion
          allowMultiple
          items={[
            {
              id: "faq-prc-1",
              titleEn: "How is new Basic Pay fixed under AP PRC Master Scale?",
              titleTe: "పీఆర్‌సి మాస్టర్ స్కేల్ ఆధారంగా కొత్త మూల వేతనం ఎలా ఖరారు చేస్తారు?",
              badge: "Fixation",
              badgeVariant: "turmeric",
              defaultOpen: true,
              content: (
                <p>
                  Existing Basic Pay is added to the merged DA percentage and the sanctioned Fitment percentage.
                  The resulting sum is rounded UP to the immediate next stage in the official RPS Master Scale.
                </p>
              ),
            },
            {
              id: "faq-prc-2",
              titleEn: "What happens to DA after PRC fixation?",
              titleTe: "పీఆర్‌సి ఫిక్సేషన్ తర్వాత డిఏ ఎంత అవుతుంది?",
              badge: "DA Merge",
              badgeVariant: "neutral",
              content: (
                <p>
                  The existing DA percentage is merged into the new basic pay at the time of fixation, resetting the
                  new DA rate to 0% as of the fixation date. Subsequent DA announcements apply on the revised basic.
                </p>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
