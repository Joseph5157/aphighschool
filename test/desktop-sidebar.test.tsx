import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DesktopSidebar from "@/app/(public)/_components/DesktopSidebar";

describe("DesktopSidebar — Quick Searches only shown once verified", () => {
  it("omits the Quick Searches widget entirely when no chip is provided (e.g. loading.tsx's static render)", () => {
    render(<DesktopSidebar />);
    expect(screen.queryByText("Quick Searches")).not.toBeInTheDocument();
  });

  it("shows the Quick Searches widget once verified chips are passed", () => {
    render(<DesktopSidebar quickSearchTags={[{ label: "#DAArrears", href: "/search?q=DA+Arrears" }]} />);
    expect(screen.getByText("Quick Searches")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "#DAArrears" })).toHaveAttribute("href", "/search?q=DA+Arrears");
  });

  it("always shows the static calculator shortcuts regardless of quickSearchTags", () => {
    render(<DesktopSidebar />);
    expect(screen.getByRole("link", { name: /Income Tax Calculator/i })).toHaveAttribute("href", "/tools/tax-calculator");
  });
});
