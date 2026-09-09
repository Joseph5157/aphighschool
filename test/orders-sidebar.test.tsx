import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OrdersSidebar from "@/app/(public)/orders/_components/OrdersSidebar";

// Same F30-shaped defect UI-CONTENT-1 fixed in SearchUI/TopicTagBar and UI-SEO-1
// fixed in DesktopSidebar, found a third time here: OrdersSidebar hardcoded five
// /search?q= chips (one, #PRC2024, carrying a stale year) with no verification.
describe("OrdersSidebar — Quick Searches chips verified before render", () => {
  it("always shows the static tool-page shortcuts even with no verified search tags", () => {
    render(<OrdersSidebar />);
    expect(screen.getByRole("link", { name: "#Form16Tax" })).toHaveAttribute("href", "/tools/tax-calculator");
    expect(screen.getByRole("link", { name: "#GPFInterest" })).toHaveAttribute("href", "/tools/gpf-apgli");
    expect(screen.getByRole("link", { name: "#EHSMedical" })).toHaveAttribute("href", "/tools/cfms-checker");
  });

  it("renders verified search-query chips when provided, ahead of the static ones", () => {
    render(<OrdersSidebar verifiedSearchTags={[{ label: "#DAArrears", href: "/search?q=DA+Arrears" }]} />);
    expect(screen.getByRole("link", { name: "#DAArrears" })).toHaveAttribute("href", "/search?q=DA+Arrears");
  });

  it("never renders an unverified search chip absent from verifiedSearchTags", () => {
    render(<OrdersSidebar />);
    expect(screen.queryByText("#PRC2024")).not.toBeInTheDocument();
    expect(screen.queryByText("#MegaDSC2026")).not.toBeInTheDocument();
  });
});
