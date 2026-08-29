// AP / TS Pension & Retirement Rules Math Engine

export interface PensionInput {
  lastBasicPay: number;
  qualifyingServiceYears: number; // Max 33 years for full pension
  commutationPercent?: number; // Default 40% max commutation
  drPercent?: number; // Dearness Relief % (e.g. 30.392%)
  age?: number; // Pensioner age for additional quantum calculation
}

export function calculateServicePension({
  lastBasicPay,
  qualifyingServiceYears,
  commutationPercent = 40,
  drPercent = 30.392,
  age = 60,
}: PensionInput) {
  // Cap qualifying service at 33 years
  const effectiveQS = Math.min(33, Math.max(1, qualifyingServiceYears));

  // Full Basic Pension = (Last Basic Pay * Qualifying Service) / 66
  const fullBasicPension = Math.round((lastBasicPay * effectiveQS) / 66);

  // Commuted Portion
  const commutedPercentVal = Math.min(40, Math.max(0, commutationPercent));
  const commutedAmount = Math.round((fullBasicPension * commutedPercentVal) / 100);
  const reducedBasicPension = fullBasicPension - commutedAmount;

  // Commutation Lump Sum Value Factor (commutation factor at age 61 is 8.194 approx)
  const commutationFactor = 8.194;
  const lumpSumCommutationValue = Math.round(commutedAmount * 12 * commutationFactor);

  // DR (Dearness Relief) on Full Pension
  const drAmount = Math.round((fullBasicPension * drPercent) / 100);

  // Additional Quantum of Pension based on Age
  let additionalPensionPercent = 0;
  if (age >= 100) additionalPensionPercent = 100;
  else if (age >= 95) additionalPensionPercent = 50;
  else if (age >= 90) additionalPensionPercent = 40;
  else if (age >= 85) additionalPensionPercent = 30;
  else if (age >= 80) additionalPensionPercent = 20;
  else if (age >= 75) additionalPensionPercent = 15;
  else if (age >= 70) additionalPensionPercent = 12;

  const additionalPensionAmount = Math.round((fullBasicPension * additionalPensionPercent) / 100);

  // Total Monthly Gross Pension = Reduced Basic Pension + DR Amount + Additional Pension
  const netMonthlyPension = reducedBasicPension + drAmount + additionalPensionAmount;

  // DCRG (Death-cum-Retirement Gratuity) = (Last Basic Pay + DA Amount) * (Half Years of Service) / 4
  const daAmount = Math.round((lastBasicPay * drPercent) / 100);
  const halfYearsService = Math.min(66, effectiveQS * 2);
  const rawDcrg = Math.round(((lastBasicPay + daAmount) * halfYearsService) / 4);
  const dcrgGratuity = Math.min(1600000, rawDcrg); // Max Cap ₹16 Lakhs (or ₹20L under revised AP rules)

  // Earned Leave Encashment (Max 300 days)
  const elEncashmentDays = 300;
  const elEncashmentAmount = Math.round(((lastBasicPay + daAmount) / 30) * elEncashmentDays);

  return {
    lastBasicPay,
    effectiveQS,
    fullBasicPension,
    commutedAmount,
    reducedBasicPension,
    lumpSumCommutationValue,
    drAmount,
    additionalPensionPercent,
    additionalPensionAmount,
    netMonthlyPension,
    dcrgGratuity,
    elEncashmentAmount,
  };
}

export function calculateCommutationRestorationDate(payoutDateStr: string) {
  const payoutDate = new Date(payoutDateStr);
  if (isNaN(payoutDate.getTime())) {
    return { error: "Invalid date" };
  }

  // 180 months (15 years) timeline
  const restorationDate = new Date(payoutDate);
  restorationDate.setMonth(restorationDate.getMonth() + 180);

  const today = new Date();
  const diffTime = restorationDate.getTime() - today.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remainingMonths = Math.max(0, Math.ceil(remainingDays / 30.4375));
  const isRestored = remainingDays <= 0;

  return {
    payoutDate: payoutDate.toISOString().split("T")[0],
    restorationDate: restorationDate.toISOString().split("T")[0],
    remainingMonths,
    isRestored,
  };
}
