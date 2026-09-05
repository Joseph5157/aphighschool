import { describe, expect, it } from "vitest";
import { calculateElSurrender } from "@/lib/calculators/leave-encashment";

describe("EL surrender calculation", () => {
  it("calculates a 15-day surrender from Basic Pay and DA", () => {
    expect(calculateElSurrender({ basicPay: 52040, daPercent: 33.67, days: 15 })).toMatchObject({
      valid: true,
      daAmount: 17522,
      monthlyEmoluments: 69562,
      encashment: 34781,
    });
  });

  it("calculates a 30-day surrender", () => {
    const result = calculateElSurrender({ basicPay: 52040, daPercent: 33.67, days: 30 });
    expect(result.valid).toBe(true);
    expect(result.encashment).toBe(69562);
  });

  it.each([0, 14, 16, 31, -15])("rejects invalid surrender values: %s days", (days) => {
    expect(calculateElSurrender({ basicPay: 52040, daPercent: 33.67, days })).toMatchObject({
      valid: false,
      error: "EL surrender is available only for 15 or 30 days.",
      encashment: 0,
    });
  });
});
