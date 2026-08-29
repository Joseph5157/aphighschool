"use client";

import { useState, useId } from "react";
import Button from "@/app/(public)/_components/Button";
import { Card, CardHeader, CardTitle } from "@/app/(public)/_components/Card";
import Field from "@/app/(public)/_components/Field";
import Input from "@/app/(public)/_components/Input";
import Separator from "@/app/(public)/_components/Separator";
import Badge from "@/app/(public)/_components/Badge";
import { calculateCommutationRestorationDate } from "@/lib/pension";

export default function CommutationTrackerUI() {
  const dateId = useId();
  const amountId = useId();
  const ppoId = useId();

  const [payoutDate, setPayoutDate] = useState("2011-06-15");
  const [commutedAmount, setCommutedAmount] = useState("12000");
  const [ppoNumber, setPpoNumber] = useState("");
  const [isPrintApplication, setIsPrintApplication] = useState(false);

  const tracker = calculateCommutationRestorationDate(payoutDate);
  const commutedVal = parseFloat(commutedAmount) || 0;
  const elapsedMonths = Math.min(180, Math.max(0, 180 - (tracker.remainingMonths || 0)));
  const progressPercent = Math.round((elapsedMonths / 180) * 100);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            180-Month Rule
          </Badge>
          <span className="font-mono text-xs text-inkSoft">Commutation Recovery & Restoration Tracker</span>
        </div>
        <Button
          variant={isPrintApplication ? "tamarind" : "outline"}
          size="sm"
          onClick={() => setIsPrintApplication(!isPrintApplication)}
        >
          {isPrintApplication ? "📄 Back to Tracker" : "🖨️ STO Restoration Application"}
        </Button>
      </div>

      {isPrintApplication ? (
        <Card className="p-6 space-y-4 bg-white text-black font-serif border border-black/30 leading-relaxed">
          <div className="text-center space-y-1 pb-4 border-b border-black">
            <h2 className="text-base font-bold uppercase tracking-wider">
              APPLICATION FOR RESTORATION OF COMMUTED PORTION OF PENSION
            </h2>
            <p className="text-xs italic">(Upon Completion of 15 Years / 180 Months Period)</p>
          </div>

          <div className="text-xs space-y-3 font-mono pt-2">
            <div>
              <p>To,</p>
              <p className="font-bold">The Sub-Treasury Officer (STO) / District Treasury Officer (DTO),</p>
              <p>Government of Andhra Pradesh.</p>
            </div>

            <div className="pt-2">
              <p><strong>Respected Sir / Madam,</strong></p>
              <p className="pl-4 pt-1">
                Sub: Request for restoration of 40% commuted portion of pension — PPO No: <strong>{ppoNumber || "[Your PPO Number]"}</strong> — Reg.
              </p>
            </div>

            <div className="pt-2 leading-relaxed font-sans text-xs space-y-2">
              <p>
                I am a retired teacher/employee receiving monthly pension under PPO No. <strong>{ppoNumber || "_____________"}</strong>.
                My 40% commuted pension amount of <strong>₹{commutedVal}</strong> was paid on <strong>{payoutDate}</strong>.
              </p>
              <p>
                As per the AP Revised Pension Rules, the recovery of 180 months (15 years) was completed on <strong>{tracker.restorationDate}</strong>.
                I kindly request you to restore my full basic pension with effect from the restoration date.
              </p>
            </div>

            <div className="pt-8 flex justify-between items-end font-sans">
              <div>
                <p>Date: ________________</p>
                <p>Place: ________________</p>
              </div>
              <div className="text-center">
                <p className="border-t border-black px-6 pt-1 font-bold">Signature of Pensioner</p>
                <p className="text-[10px] font-mono">Mobile: ________________</p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-6 p-5 space-y-5 bg-paperRaised border-hair">
            <CardHeader className="p-0 space-y-1">
              <CardTitle className="text-card-title text-ink">Commutation Parameters</CardTitle>
              <p className="text-xs text-inkSoft font-mono">
                Enter your commutation payout date to calculate your 180-month recovery timeline.
              </p>
            </CardHeader>

            <Separator />

            <div className="space-y-4">
              <Field
                htmlFor={dateId}
                label="Commutation Payout Date"
                helperText="Date when lump sum commutation was credited by Treasury"
              >
                <Input
                  id={dateId}
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                />
              </Field>

              <Field
                htmlFor={amountId}
                label="Monthly Commuted Recovery (₹)"
                helperText="Amount deducted monthly from basic pension"
              >
                <Input
                  id={amountId}
                  type="number"
                  value={commutedAmount}
                  onChange={(e) => setCommutedAmount(e.target.value)}
                  placeholder="e.g. 12000"
                />
              </Field>

              <Field
                htmlFor={ppoId}
                label="PPO Number (Optional)"
                helperText="Your Treasury Pension Payment Order Number for STO letter"
              >
                <Input
                  id={ppoId}
                  type="text"
                  value={ppoNumber}
                  onChange={(e) => setPpoNumber(e.target.value)}
                  placeholder="e.g. AP/PPO/12345"
                />
              </Field>
            </div>
          </Card>

          <div className="lg:col-span-6 space-y-4">
            <Card className="p-5 space-y-4 bg-ink text-paper border border-turmeric/30">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <Badge variant={tracker.isRestored ? "success" : "turmeric"} size="sm">
                    {tracker.isRestored ? "Restoration Completed" : "Recovery Active"}
                  </Badge>
                  <span className="font-mono text-xs text-turmeric font-bold">
                    {progressPercent}% Completed
                  </span>
                </div>
                <CardTitle className="text-display text-turmeric mt-2">
                  {tracker.restorationDate}
                </CardTitle>
                <p className="text-xs text-paper/70 font-mono">Full Pension Restoration Due Date (180 Months)</p>
              </CardHeader>

              <Separator className="bg-paper/20" />

              <div className="space-y-3 font-mono text-xs">
                <div className="w-full bg-paper/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-turmeric h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Commutation Payout Date:</span>
                  <span className="font-bold text-paper">{tracker.payoutDate}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-paper/10">
                  <span className="text-paper/70">Months Recovered:</span>
                  <span className="font-bold text-paper">{elapsedMonths} / 180 Months</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-paper/70">Remaining Months:</span>
                  <span className="font-bold text-emerald-400">
                    {tracker.isRestored ? "0 Months (Ready for Full Pension)" : `${tracker.remainingMonths} Months`}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
