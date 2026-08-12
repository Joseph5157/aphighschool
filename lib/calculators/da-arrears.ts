export type DaArrearsInput = {
  basicPay: number;
  oldDaPercent: number;
  newDaPercent: number;
  fromMonth: number; // 1-12
  fromYear: number;
  toMonth: number; // 1-12
  toYear: number;
};

export type DaArrearsMonthRow = {
  label: string;
  basicPay: number;
  daDeltaPercent: number;
  arrears: number;
};

export type DaArrearsResult = {
  months: DaArrearsMonthRow[];
  monthCount: number;
  totalArrears: number;
  error?: string;
};

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toSafeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function calculateDaArrears(input: DaArrearsInput): DaArrearsResult {
  const basicPay = toSafeNumber(input.basicPay);
  const oldDaPercent = toSafeNumber(input.oldDaPercent);
  const newDaPercent = toSafeNumber(input.newDaPercent);
  const fromMonth = toSafeNumber(input.fromMonth);
  const fromYear = toSafeNumber(input.fromYear);
  const toMonth = toSafeNumber(input.toMonth);
  const toYear = toSafeNumber(input.toYear);

  const fromIndex = fromYear * 12 + (fromMonth - 1);
  const toIndex = toYear * 12 + (toMonth - 1);

  if (toIndex < fromIndex) {
    return {
      months: [],
      monthCount: 0,
      totalArrears: 0,
      error: "'To' month must be on or after the 'From' month.",
    };
  }

  const monthCount = toIndex - fromIndex + 1;
  const daDeltaPercent = newDaPercent - oldDaPercent;
  const monthlyArrears = daDeltaPercent > 0 ? Math.round((basicPay * daDeltaPercent) / 100) : 0;

  const months: DaArrearsMonthRow[] = [];
  for (let i = 0; i < monthCount; i++) {
    const index = fromIndex + i;
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1; // 1-12
    months.push({
      label: `${MONTH_LABELS[month - 1]} ${year}`,
      basicPay,
      daDeltaPercent,
      arrears: monthlyArrears,
    });
  }

  return {
    months,
    monthCount,
    totalArrears: monthlyArrears * monthCount,
  };
}
