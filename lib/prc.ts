// AP Master Pay Scale Staging Array (RPS 2022 / Master Scale 2022)
export const AP_MASTER_SCALE = [
  13000, 13390, 13780, 14170, 14560, 14950, 15340, 15730, 16120, 16510,
  16900, 17350, 17800, 18250, 18700, 19150, 19600, 20050, 20500, 20950,
  21400, 21900, 22400, 22900, 23400, 23900, 24400, 24900, 25400, 25900,
  26400, 27000, 27600, 28200, 28800, 29400, 30000, 30600, 31200, 31800,
  32400, 33100, 33800, 34500, 35200, 35900, 36600, 37300, 38000, 38700,
  39400, 40200, 41000, 41800, 42600, 43400, 44200, 45000, 45800, 46600,
  47400, 48300, 49200, 50100, 51000, 51900, 52800, 53700, 54600, 55500,
  56400, 57500, 58600, 59700, 60800, 61900, 63000, 64100, 65200, 66300,
  67400, 68700, 70000, 71300, 72600, 73900, 75200, 76500, 77800, 79100,
  80400, 81900, 83400, 84900, 86400, 87900, 89400, 90900, 92400, 93900,
  95400, 97100, 98800, 100500, 102200, 103900, 105600, 107300, 109000, 110700,
  112400, 114300, 116200, 118100, 120000, 121900, 123800, 125700, 127600, 129500,
  131400, 133500, 135600, 137700, 139800, 141900, 144000, 146100, 148200, 150300
];

export function findNextMasterStage(totalPay: number): number {
  for (const stage of AP_MASTER_SCALE) {
    if (stage >= totalPay) return stage;
  }
  return AP_MASTER_SCALE[AP_MASTER_SCALE.length - 1];
}

export interface PrcCalculationInput {
  existingBasic: number;
  fitmentPercent: number;
  existingDaPercent: number;
  hraPercent: number;
  monthsArrears?: number;
}

export function calculatePrcFixation({
  existingBasic,
  fitmentPercent,
  existingDaPercent,
  hraPercent,
  monthsArrears = 12,
}: PrcCalculationInput) {
  const daAmount = Math.round((existingBasic * existingDaPercent) / 100);
  const fitmentAmount = Math.round((existingBasic * fitmentPercent) / 100);
  const rawTotal = existingBasic + daAmount + fitmentAmount;
  const revisedBasic = findNextMasterStage(rawTotal);

  const preHra = Math.round((existingBasic * hraPercent) / 100);
  const preGross = existingBasic + daAmount + preHra;

  // Under revised pay, DA resets to 0% at fixation point
  const postHra = Math.round((revisedBasic * hraPercent) / 100);
  const postGross = revisedBasic + postHra;

  const monthlyGrossDiff = postGross - preGross;
  const totalArrearsGross = Math.max(0, monthlyGrossDiff * monthsArrears);

  // Arrears allocation split: 10% CPS / PRAN contribution, 90% GPF Credit or Cash
  const cpsDeduction = Math.round(totalArrearsGross * 0.10);
  const gpfOrCashCredit = totalArrearsGross - cpsDeduction;

  return {
    existingBasic,
    daAmount,
    fitmentAmount,
    rawTotal,
    revisedBasic,
    preGross,
    postGross,
    monthlyGrossDiff,
    totalArrearsGross,
    cpsDeduction,
    gpfOrCashCredit,
  };
}
