export const EL_SURRENDER_DAYS = [15, 30] as const;

export type ElSurrenderDays = (typeof EL_SURRENDER_DAYS)[number];

export type ElSurrenderInput = {
  basicPay: number;
  daPercent: number;
  days: number;
};

export type ElSurrenderResult = {
  valid: boolean;
  error?: string;
  daAmount: number;
  monthlyEmoluments: number;
  dailyRate: number;
  encashment: number;
};

export function calculateElSurrender({
  basicPay,
  daPercent,
  days,
}: ElSurrenderInput): ElSurrenderResult {
  if (!Number.isFinite(basicPay) || basicPay < 0) return invalidResult("Enter a valid Basic Pay.");
  if (!Number.isFinite(daPercent) || daPercent < 0) return invalidResult("Enter a valid DA percentage.");
  if (!EL_SURRENDER_DAYS.includes(days as ElSurrenderDays)) {
    return invalidResult("EL surrender is available only for 15 or 30 days.");
  }

  const daAmount = Math.round((basicPay * daPercent) / 100);
  const monthlyEmoluments = basicPay + daAmount;
  const dailyRate = monthlyEmoluments / 30;

  return {
    valid: true,
    daAmount,
    monthlyEmoluments,
    dailyRate,
    encashment: Math.round(dailyRate * days),
  };
}

function invalidResult(error: string): ElSurrenderResult {
  return { valid: false, error, daAmount: 0, monthlyEmoluments: 0, dailyRate: 0, encashment: 0 };
}
