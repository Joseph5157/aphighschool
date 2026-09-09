import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ToolsIndexPage from "@/app/(public)/tools/page";

describe("Tools index — step-flow chips match what each tool actually does", () => {
  it("only claims Export PDF for the two tools with a real print/export path", () => {
    render(<ToolsIndexPage />);
    // TaxCalculatorUI (window.print) and PrcCalculatorUI (isPrintMode) are the
    // only two tools that implement an export; the other four must not claim it.
    expect(screen.getAllByText("Export PDF")).toHaveLength(2);
  });

  it("renders no step-flow chips for the CFMS links directory", () => {
    render(<ToolsIndexPage />);
    const cfmsCard = screen.getByText("CFMS Bill Status & Payslip Guide").closest(".p-5") as HTMLElement;
    expect(cfmsCard).not.toBeNull();
    expect(within(cfmsCard).queryByText("Fill Details")).not.toBeInTheDocument();
    expect(within(cfmsCard).queryByText("Auto-Calculate")).not.toBeInTheDocument();
  });

  it("still shows Fill Details / Auto-Calculate for genuine calculators without export", () => {
    render(<ToolsIndexPage />);
    const leaveCard = screen.getByText("Earned Leave (EL) & HPL Encashment Bill").closest(".p-5") as HTMLElement;
    expect(within(leaveCard).getByText("Fill Details")).toBeInTheDocument();
    expect(within(leaveCard).getByText("Auto-Calculate")).toBeInTheDocument();
    expect(within(leaveCard).queryByText("Export PDF")).not.toBeInTheDocument();
  });
});
