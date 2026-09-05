"use client";

import { useState, useId } from "react";
import Accordion from "@/app/(public)/_components/Accordion";
import Button from "@/app/(public)/_components/Button";
import { Card, CardHeader, CardTitle } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import NativeSelect from "@/app/(public)/_components/NativeSelect";
import Separator from "@/app/(public)/_components/Separator";
import Badge from "@/app/(public)/_components/Badge";
import { calculateServicePension } from "@/lib/pension";

function fmt(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

export default function PensionCalculatorUI() {
  const basicId = useId();
  const qsId = useId();
  const commId = useId();
  const drId = useId();
  const ageId = useId();

  const [lastBasic, setLastBasic] = useState("60000");
  const [qualifyingYears, setQualifyingYears] = useState("33");
  const [commutation, setCommutation] = useState("40");
  const [drRate, setDrRate] = useState("30.392");
  const [ageVal, setAgeVal] = useState("60");
  const [isPrintMode, setIsPrintMode] = useState(false);

  const basicNum = parseFloat(lastBasic) || 0;
  const qsNum = parseFloat(qualifyingYears) || 0;
  const commNum = parseFloat(commutation) || 0;
  const drNum = parseFloat(drRate) || 0;
  const ageNum = parseFloat(ageVal) || 60;

  const result = calculateServicePension({
    lastBasicPay: basicNum,
    qualifyingServiceYears: qsNum,
    commutationPercent: commNum,
    drPercent: drNum,
    age: ageNum,
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm" shape="pill" dot>
            AP Treasury Pension Standard
          </Badge>
          <span className="font-mono text-xs text-inkSoft">Service Pension & Gratuity Calculator</span>
        </div>
        <Button
          variant={isPrintMode ? "tamarind" : "outline"}
          size="sm"
          onClick={() => setIsPrintMode(!isPrintMode)}
        >
          {isPrintMode ? "📄 Back to Calculator" : "🖨️ Print Pension Statement"}
        </Button>
      </div>

      {isPrintMode ? (
        <Card className="p-6 space-y-4 bg-white text-black font-serif border border-black/30">
          <div className="text-center space-y-1 pb-4 border-b border-black">
            <h2 className="text-lg font-bold uppercase tracking-wider">
              ESTIMATED PENSION & RETIREMENT BENEFITS STATEMENT
            </h2>
            <p className="text-xs italic">AP Revised Pension Rules (Master Treasury Staging)</p>
          </div>

          <div className="grid grid-cols-2 text-xs font-mono gap-y-2 pt-2">
            <div><strong>Last Basic Pay:</strong> ₹{fmt(result.lastBasicPay)}</div>
            <div><strong>Qualifying Service:</strong> {result.effectiveQS} Years</div>
            <div><strong>Commutation (%):</strong> {commNum}%</div>
            <div><strong>Dearness Relief (DR):</strong> {drNum}%</div>
          </div>

          <div className="pt-4 space-y-2">
            <table className="w-full text-xs text-left border-collapse border border-black">
              <thead>
                <tr className="bg-black/5">
                  <th className="border border-black p-2">Benefit Head</th>
                  <th className="border border-black p-2 text-right">Calculation Entitlement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">Full Basic Pension</td>
                  <td className="border border-black p-2 text-right font-bold">₹{fmt(result.fullBasicPension)}/mo</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Less: Commuted Portion ({commNum}%)</td>
                  <td className="border border-black p-2 text-right text-red-700">-₹{fmt(result.commutedAmount)}/mo</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Reduced Basic Pension</td>
                  <td className="border border-black p-2 text-right font-bold">₹{fmt(result.reducedBasicPension)}/mo</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Dearness Relief (DR {drNum}%)</td>
                  <td className="border border-black p-2 text-right">+₹{fmt(result.drAmount)}/mo</td>
                </tr>
                <tr className="font-bold bg-black/5">
                  <td className="border border-black p-2">Net Monthly Pension Payout</td>
                  <td className="border border-black p-2 text-right text-emerald-800">₹{fmt(result.netMonthlyPension)}/mo</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">Lump Sum Commutation Value Received</td>
                  <td className="border border-black p-2 text-right font-bold">₹{fmt(result.lumpSumCommutationValue)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2 font-bold">DCRG Gratuity Payout (Max ₹16L Cap)</td>
                  <td className="border border-black p-2 text-right font-bold">₹{fmt(result.dcrgGratuity)}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">EL Encashment (300 Days Max)</td>
                  <td className="border border-black p-2 text-right font-bold">₹{fmt(result.elEncashmentAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 p-5 space-y-5 bg-paperRaised border-hair">
            <CardHeader className="p-0 space-y-1">
              <CardTitle className="text-card-title text-ink">Retirement Parameters</CardTitle>
              <p className="text-body text-inkSoft">
                Enter your last basic pay and qualifying service years.
              </p>
            </CardHeader>

            <Separator />

            <div className="space-y-4">
              <Field
                htmlFor={basicId}
                label="Last Basic Pay (₹)"
                helperText="Your last drawn basic pay prior to retirement"
              >
                <Input
                  id={basicId}
                  type="number"
                  value={lastBasic}
                  onChange={(e) => setLastBasic(e.target.value)}
                  placeholder="e.g. 60000"
                />
              </Field>

              <Field
                htmlFor={qsId}
                label="Qualifying Service (Years)"
                helperText="Total active net service years (Max 33 years)"
              >
                <Input
                  id={qsId}
                  type="number"
                  value={qualifyingYears}
                  onChange={(e) => setQualifyingYears(e.target.value)}
                  placeholder="e.g. 33"
                />
              </Field>

              <Field
                htmlFor={commId}
                label="Commutation Rate (%)"
                helperText="Percentage commuted for lump sum payout (Max 40%)"
              >
                <NativeSelect
                  id={commId}
                  value={commutation}
                  onChange={(e) => setCommutation(e.target.value)}
                >
                  <option value="40">40% (Maximum Allowed)</option>
                  <option value="30">30% Commutation</option>
                  <option value="20">20% Commutation</option>
                  <option value="0">0% (No Commutation)</option>
                </NativeSelect>
              </Field>

              <Field
                htmlFor={drId}
                label="Dearness Relief (DR %)"
                helperText="Current DR rate sanctioned by Treasury"
              >
                <Input
                  id={drId}
                  type="number"
                  value={drRate}
                  onChange={(e) => setDrRate(e.target.value)}
                  placeholder="e.g. 30.392"
                />
              </Field>

              <Field
                htmlFor={ageId}
                label="Pensioner Age (Years)"
                helperText="Age for additional quantum of pension entitlement"
              >
                <Input
                  id={ageId}
                  type="number"
                  value={ageVal}
                  onChange={(e) => setAgeVal(e.target.value)}
                  placeholder="e.g. 60"
                />
              </Field>
            </div>
          </Card>

          <div className="lg:col-span-6 space-y-4">
            <Card className="p-5 space-y-4 bg-ink text-paper border border-turmeric/30">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <Badge variant="turmeric" size="sm">
                    Monthly Pension
                  </Badge>
                  <span className="font-mono text-xs text-turmeric font-bold">
                    DR {drNum}% Included
                  </span>
                </div>
                <CardTitle className="text-display text-turmeric mt-2">
                  ₹{fmt(result.netMonthlyPension)} / mo
                </CardTitle>
                <p className="text-xs text-paper/70 font-mono">Net Monthly Pension (Post-Commutation)</p>
              </CardHeader>

              <Separator className="bg-paper/20" />

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Full Basic Pension:</span>
                  <span className="font-bold text-paper">₹{fmt(result.fullBasicPension)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Commuted Amount (-{commNum}%):</span>
                  <span className="font-bold text-red-400">-₹{fmt(result.commutedAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Dearness Relief ({drNum}%):</span>
                  <span className="font-bold text-paper">+₹{fmt(result.drAmount)}</span>
                </div>
                {result.additionalPensionPercent > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-paper/10 text-emerald-400">
                    <span>Age {ageNum} Additional Quantum (+{result.additionalPensionPercent}%):</span>
                    <span className="font-bold">+₹{fmt(result.additionalPensionAmount)}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5 space-y-3 bg-paperRaised border-hair">
              <h3 className="text-xs font-bold font-mono text-ink uppercase tracking-wide">
                Lump Sum Retirement Benefits
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-ink/5 border border-hair rounded-lg space-y-1">
                  <span className="text-inkSoft text-[10px]">Commutation Lump Sum</span>
                  <p className="font-bold text-ink text-sm">₹{fmt(result.lumpSumCommutationValue)}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-1">
                  <span className="text-emerald-800 text-[10px]">DCRG Gratuity Payout</span>
                  <p className="font-bold text-ink text-sm">₹{fmt(result.dcrgGratuity)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-hair space-y-3">
        <h2 className="text-section text-ink flex items-center gap-2">
          <span>❓</span> Pension Calculation Rules & FAQ
        </h2>
        <Accordion
          allowMultiple
          items={[
            {
              id: "faq-pension-1",
              titleEn: "How is Full Basic Pension calculated for AP teachers?",
              titleTe: "పూర్తి మూల పింఛను ఎలా లెక్కిస్తారు?",
              badge: "Pension",
              badgeVariant: "turmeric",
              defaultOpen: true,
              content: (
                <p>
                  Full Basic Pension is calculated as: <code>(Last Basic Pay × Qualifying Service Years) / 66</code>.
                  33 years of service entitles a teacher to 50% of their last basic pay as basic pension.
                </p>
              ),
            },
            {
              id: "faq-pension-2",
              titleEn: "When is commuted pension restored?",
              titleTe: "కమ్యూటేషన్ మొత్తం ఎప్పుడు పునరుద్ధరించబడుతుంది?",
              badge: "Commutation",
              badgeVariant: "neutral",
              content: (
                <p>
                  Commuted pension is recovered monthly for exactly 15 years (180 months) from the date of lump sum commutation payment,
                  after which the full basic pension is automatically restored.
                </p>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
