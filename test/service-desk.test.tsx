import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ServiceDeskPage from "@/app/(public)/service-desk/page";

const TASKS = [
  ["Pay, Tax & DA", "/tools"],
  ["Leave & Encashment", "/tools/leave-encashment"],
  ["CFMS, Payslip, EHS & e-SR", "/tools/cfms-checker"],
  ["GPF & APGLI", "/tools/gpf-apgli"],
  ["Pension & Retirement", "/pensioners"],
  ["Orders & Official Updates", "/search"],
] as const;

describe("Teacher Service Desk", () => {
  it("renders all six service tasks with their expected internal links", () => {
    render(<ServiceDeskPage />);

    for (const [title, href] of TASKS) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: new RegExp(title) })).toHaveAttribute("href", href);
    }
  });

  it("clearly explains that government transactions happen on official portals", () => {
    render(<ServiceDeskPage />);
    expect(screen.getByLabelText("Service desk disclaimer")).toHaveTextContent(
      /unofficial guidance.*government portals/i
    );
  });
});
