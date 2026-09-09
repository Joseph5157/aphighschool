import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PrcCalculatorUI from "@/app/(public)/tools/prc-calculator/_components/PrcCalculatorUI";

describe("PRC Calculator UI — HRA preset wiring", () => {
  it("recomputes the fixation summary when a different HRA preset is chosen", () => {
    render(<PrcCalculatorUI />);

    const summaryBefore = screen.getByText(/\/ month/).textContent;

    fireEvent.change(screen.getByLabelText("HRA Category (%)"), {
      target: { value: "8" },
    });

    const summaryAfter = screen.getByText(/\/ month/).textContent;
    expect(summaryAfter).not.toBe(summaryBefore);
  });
});
