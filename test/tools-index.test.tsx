import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ToolsIndexPage from "@/app/(public)/tools/page";

// SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A14) removed the numbered "Fill Details →
// Auto-Calculate → Export PDF" chips: they mimicked a stepper that does not
// exist and repeated the same two steps on five of six cards. One claim inside
// them was real and load-bearing, though — whether a tool can export anything —
// so it survives as plain metadata, and the rule that governed the chips
// governs it: the claim must be true of that tool's own component. That is what
// these assert, on the new copy.
describe("Tools index — the export claim matches what each tool actually does", () => {
  it("claims an export for exactly the two tools with a real print/export path", () => {
    render(<ToolsIndexPage />);
    // TaxCalculatorUI (window.print) and PrcCalculatorUI (isPrintMode) are the
    // only two tools that implement an export; the other four must not claim it.
    expect(screen.getAllByText("Exports a printable statement")).toHaveLength(2);
  });

  it("names those two tools specifically, so the count cannot drift onto the wrong cards", () => {
    render(<ToolsIndexPage />);
    for (const title of [
      "Income Tax Calculator (FY 2025-26)",
      "PRC Pay Fixation & Arrears Calculator",
    ]) {
      const card = screen.getByText(title).closest(".p-5") as HTMLElement;
      expect(card, title).not.toBeNull();
      expect(within(card).getByText("Exports a printable statement")).toBeInTheDocument();
    }
  });

  it("makes no export claim on the four tools that cannot export", () => {
    render(<ToolsIndexPage />);
    for (const title of [
      "CFMS Bill Status & Payslip Guide",
      "Earned Leave (EL) & HPL Encashment Bill",
      "GPF & APGLI Balance Estimator",
      "DA Arrears Calculator",
    ]) {
      const card = screen.getByText(title).closest(".p-5") as HTMLElement;
      expect(card, title).not.toBeNull();
      expect(within(card).queryByText("Exports a printable statement")).not.toBeInTheDocument();
    }
  });

  it("renders none of the removed process chrome", () => {
    render(<ToolsIndexPage />);
    for (const gone of ["Fill Details", "Auto-Calculate", "Export PDF", "Updated Slabs", "Surrender Calculator"]) {
      expect(screen.queryByText(gone), gone).not.toBeInTheDocument();
    }
  });
});
