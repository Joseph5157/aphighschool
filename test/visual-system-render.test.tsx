import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolsIndexPage from "@/app/(public)/tools/page";
import PensionersPage from "@/app/(public)/pensioners/page";

// SLOP-VISUAL-1, paired half. `visual-system.test.ts` proves the emoji, the
// sub-12px type and the mono-uppercase drift are gone. On its own that is the
// weakest kind of green: every one of those assertions would also pass on a
// blank page. These assert that what the removed decoration sat next to is
// still rendered and still identifies the thing it labelled.
describe("SLOP-VISUAL-1 — the cards still identify their tools without the emoji tile", () => {
  it("names all six calculators on the tools index", () => {
    render(<ToolsIndexPage />);
    for (const title of [
      "Income Tax Calculator (FY 2025-26)",
      "Earned Leave (EL) & HPL Encashment Bill",
      "GPF & APGLI Balance Estimator",
      "CFMS Bill Status & Payslip Guide",
      "PRC Pay Fixation & Arrears Calculator",
      "DA Arrears Calculator",
    ]) {
      expect(screen.getByText(title), title).toBeInTheDocument();
    }
  });

  it("keeps the Telugu title on every tool card", () => {
    // The emoji sat inside the <h3>, immediately before the English title, with
    // the Telugu title directly below. A careless removal of the heading's
    // leading span could take the Telugu line's sibling structure with it.
    render(<ToolsIndexPage />);
    for (const titleTe of [
      "ఆదాయ పన్ను అంచనా సాధనం (ఆయవ్యయ సంవత్సరం 2025-26)",
      "డిఏ బకాయిల లెక్కింపు సాధనం",
    ]) {
      expect(screen.getByText(titleTe), titleTe).toBeInTheDocument();
    }
  });

  it("still reaches every calculator by link", () => {
    render(<ToolsIndexPage />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    for (const href of [
      "/tools/tax-calculator",
      "/tools/leave-encashment",
      "/tools/gpf-apgli",
      "/tools/cfms-checker",
      "/tools/prc-calculator",
      "/tools/da-arrears",
    ]) {
      expect(hrefs, href).toContain(href);
    }
  });

  it("names all three pensioner tasks and keeps the FAQ heading", () => {
    render(<PensionersPage />);
    for (const title of [
      "Service Pension & DCRG Gratuity Calculator",
      "Pensioner Income Tax & Form 10E Guide",
    ]) {
      expect(screen.getByText(title), title).toBeInTheDocument();
    }
    // The ❓ was the first child of this heading; the heading itself is the
    // section's only identity and must survive its removal.
    expect(screen.getByRole("heading", { name: /Pensioner Guidance FAQ/ })).toBeInTheDocument();
  });

  it("leaves no bare emoji in the rendered output of either index", () => {
    const emoji = /[\u{2300}-\u{23FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    for (const [name, ui] of [
      ["tools", <ToolsIndexPage key="t" />],
      ["pensioners", <PensionersPage key="p" />],
    ] as const) {
      const { container } = render(ui);
      expect(container.textContent ?? "", name).not.toMatch(emoji);
    }
  });
});
