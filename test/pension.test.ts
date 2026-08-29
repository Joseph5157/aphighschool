import { describe, it, expect } from "vitest";
import { calculateServicePension, calculateCommutationRestorationDate } from "@/lib/pension";

describe("Pension & Retirement Rules Math Engine", () => {
  it("calculates full basic pension and 40% commutation for 33 years qualifying service", () => {
    const result = calculateServicePension({
      lastBasicPay: 66000,
      qualifyingServiceYears: 33,
      commutationPercent: 40,
      drPercent: 30.392,
      age: 60,
    });

    expect(result.fullBasicPension).toBe(33000); // 66000 / 2
    expect(result.commutedAmount).toBe(13200); // 40% of 33000
    expect(result.reducedBasicPension).toBe(19800); // 33000 - 13200
    expect(result.lumpSumCommutationValue).toBeGreaterThan(0);
    expect(result.dcrgGratuity).toBeGreaterThan(0);
  });

  it("calculates age-based additional pension slab for age 70 (+12%) and age 80 (+20%)", () => {
    const res70 = calculateServicePension({
      lastBasicPay: 60000,
      qualifyingServiceYears: 33,
      age: 70,
    });
    expect(res70.additionalPensionPercent).toBe(12);

    const res80 = calculateServicePension({
      lastBasicPay: 60000,
      qualifyingServiceYears: 33,
      age: 80,
    });
    expect(res80.additionalPensionPercent).toBe(20);
  });

  it("calculates exact 180-month commutation restoration date", () => {
    const res = calculateCommutationRestorationDate("2010-05-15");
    expect(res.restorationDate).toBe("2025-05-15");
    expect(res.isRestored).toBe(true);
  });
});
