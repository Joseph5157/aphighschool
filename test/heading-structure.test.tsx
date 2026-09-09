// UI-A11Y-1, UI_AUDIT.md F12 — three routes had no h1 at all (their only
// "header" was a Badge + an unheaded <span>), and TaxCalculatorUI's route had
// two h1s across its tab states (the tool's own title, and a printable
// document section's title). DESIGN_SYSTEM.md §14 requires exactly one h1 per
// route.
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommutationTrackerUI from "@/app/(public)/pensioners/commutation-tracker/_components/CommutationTrackerUI";
import PensionCalculatorUI from "@/app/(public)/pensioners/pension-calculator/_components/PensionCalculatorUI";
import PrcCalculatorUI from "@/app/(public)/tools/prc-calculator/_components/PrcCalculatorUI";
import TaxCalculatorUI from "@/app/(public)/tools/tax-calculator/_components/TaxCalculatorUI";

function h1Texts() {
  return screen.getAllByRole("heading", { level: 1 }).map((el) => el.textContent);
}

describe("one h1 per route (UI-A11Y-1)", () => {
  it("CommutationTrackerUI has exactly one h1", () => {
    render(<CommutationTrackerUI />);
    expect(h1Texts()).toEqual(["Commutation Recovery & Restoration Tracker"]);
  });

  it("PensionCalculatorUI has exactly one h1", () => {
    render(<PensionCalculatorUI />);
    expect(h1Texts()).toEqual(["Service Pension & Gratuity Calculator"]);
  });

  it("PrcCalculatorUI has exactly one h1", () => {
    render(<PrcCalculatorUI />);
    expect(h1Texts()).toEqual(["PRC Pay Fixation Calculator"]);
  });

  it("TaxCalculatorUI has exactly one h1 on its default (calculator) tab", () => {
    render(<TaxCalculatorUI />);
    expect(h1Texts()).toEqual(["AP Teacher Income Tax & Official Form Suite"]);
  });

  it("TaxCalculatorUI's HRA Receipt tab does not introduce a second h1", () => {
    render(<TaxCalculatorUI />);
    fireEvent.click(screen.getByRole("button", { name: "HRA Receipt" }));

    // The calculator tab's own h1 unmounts on tab switch; the receipt
    // section's own title must stay a heading (not vanish), just not h1.
    expect(screen.queryAllByRole("heading", { level: 1 })).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 2, name: "RECEIPT OF HOUSE RENT" })).toBeInTheDocument();
  });
});
