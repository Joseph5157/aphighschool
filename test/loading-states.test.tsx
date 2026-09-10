import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// HomeLoading renders DesktopLeftNav directly — it is static chrome that needs
// no route data, so the skeleton shows it immediately rather than greying it
// out. It is an async server component and cannot be rendered here, so it is
// stubbed exactly as density-regressions.test.tsx does.
vi.mock("@/app/(public)/_components/DesktopLeftNav", () => ({ default: () => null }));

import HomeLoading from "@/app/(public)/(home)/loading";
import OrdersLoading from "@/app/(public)/orders/loading";
import SearchLoading from "@/app/(public)/search/loading";
import { TYPE_FILTERS } from "@/app/(public)/search/_components/SearchUI";

// SLOP-STATES-1 — AI_SLOP_AUDIT.md A17. The finding is that skeletons "faithfully
// reproduce some of the unnecessary UI": they kept describing widgets that the
// earlier gates deleted, so every load promised a shape that never arrived.
//
// The rule these encode: a skeleton may only reserve a structure the loaded page
// can actually render. Each case below is paired — the ghost is gone AND the
// placeholder still does its job.

const pills = (c: HTMLElement) => c.querySelectorAll('[class*="rounded-full"]');
const blocks = (c: HTMLElement) => c.querySelectorAll(".animate-pulse");

describe("A17 — skeletons reserve only what the page renders", () => {
  it("reserves one chip per option the search type control actually has", () => {
    // Derived from the control, not copied: TYPE_FILTERS plus the leading "All".
    const { container } = render(<SearchLoading />);
    expect(pills(container)).toHaveLength(TYPE_FILTERS.length + 1);
  });

  it("sizes document rows to the rows that arrive, not to a third of them", () => {
    // Measured in Chromium: 172-187px at 390px wide, 124px at 1440px. `h-28`
    // (112px) left every row ~60px short on a phone.
    for (const [name, ui] of [
      ["home", <HomeLoading key="h" />],
      ["orders", <OrdersLoading key="o" />],
    ] as const) {
      const { container } = render(ui);
      const rows = container.querySelectorAll('[class*="rounded-xl"]');
      expect(rows.length, name).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.className, `${name} row`).not.toMatch(/\bh-28\b/);
        expect(row.className, `${name} row`).toMatch(/h-\[\d+px\]/);
      }
    }
  });
});

describe("A17 — the placeholders still do their job", () => {
  // The paired half. Every assertion above would also pass on an empty
  // component, so each skeleton has to still announce itself and still reserve
  // the shape the reader is waiting for.
  const CASES = [
    ["home", <HomeLoading key="h" />, "Loading latest orders"],
    ["orders", <OrdersLoading key="o" />, "Loading orders index"],
    ["search", <SearchLoading key="s" />, "Loading search"],
  ] as const;

  it("announces every loading state to assistive technology", () => {
    for (const [name, ui, label] of CASES) {
      const { unmount } = render(ui);
      const status = screen.getByRole("status", { name: new RegExp(label, "i") });
      expect(status, name).toBeInTheDocument();
      unmount();
    }
  });

  it("still reserves a visible shape on every route", () => {
    // Exact counts, not a floor. A floor of "at least a few blocks" let a
    // deleted block slip through when this was first written — the skeleton is
    // the geometry, so losing one is the defect, and a change here should be a
    // decision rather than a silent drift.
    const EXPECTED: Record<string, number> = {
      home: 6, // heading + subtitle + 4 document rows
      orders: 10, // masthead + 5 category rows + 3 document rows + footer
      search: 15, // heading + 2 subtitle lines + field + 7 type chips + 4 rows
    };

    for (const [name, ui] of CASES) {
      const { container, unmount } = render(ui);
      expect(blocks(container).length, name).toBe(EXPECTED[name]);
      unmount();
    }
  });

  it("keeps the search field the reader is waiting for", () => {
    const search = render(<SearchLoading />);
    expect(search.container.querySelectorAll('[class*="h-12"]').length).toBeGreaterThan(0);
    search.unmount();
  });
});
