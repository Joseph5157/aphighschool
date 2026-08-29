import { describe, it, expect } from "vitest";
import { findNextMasterStage, calculatePrcFixation } from "@/lib/prc";

describe("PRC Pay Fixation Calculator", () => {
  it("correctly finds the next master scale stage for raw total pay", () => {
    expect(findNextMasterStage(35000)).toBe(35200);
    expect(findNextMasterStage(50000)).toBe(50100);
    expect(findNextMasterStage(100000)).toBe(100500);
  });

  it("calculates PRC pay fixation for a standard Basic Pay and 23% Fitment", () => {
    const result = calculatePrcFixation({
      existingBasic: 35570,
      fitmentPercent: 23,
      existingDaPercent: 30.392,
      hraPercent: 16,
      monthsArrears: 12,
    });

    expect(result.revisedBasic).toBeGreaterThan(result.existingBasic);
    expect(result.rawTotal).toBeGreaterThan(result.existingBasic);
    expect(result.revisedBasic % 100).toBe(0);
    expect(result.cpsDeduction).toBeGreaterThanOrEqual(0);
    expect(result.gpfOrCashCredit).toBeGreaterThanOrEqual(0);
  });
});
