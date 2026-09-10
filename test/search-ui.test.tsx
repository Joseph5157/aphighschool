import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
  useSearchParams: () => new URLSearchParams("q=arrears&type=circular"),
  usePathname: () => "/search",
}));

import SearchUI from "@/app/(public)/search/_components/SearchUI";

const RESULT = {
  id: "1",
  slug: "da-arrears-2026",
  titleEn: "DA Arrears Payment Schedule",
  titleTe: "డీఏ బకాయిల చెల్లింపు షెడ్యూల్",
  goReference: "G.O.Ms.No.77",
  summaryTe: ["ఉపాధ్యాయులకు డీఏ బకాయిలు చెల్లించబడతాయి."],
  tags: ["DA", "Arrears"],
  documentType: "circular" as const,
  documentDate: new Date("2026-02-08"),
  createdAt: new Date("2026-08-01"),
  category: { nameEn: "Circulars", slug: "circulars" },
  relatedFrom: [{ relatedPost: { slug: "go-77-original", titleEn: "Original DA Order" } }],
};

const RECENT_DOCUMENT = {
  id: "recent-1",
  slug: "recent-go-2026",
  titleEn: "Recent Government Order",
  documentType: "go" as const,
  documentDate: new Date("2026-03-10"),
  createdAt: new Date("2026-03-11"),
  verifiedAgainstGoir: true,
  orderState: "current" as const,
};

function renderSearchUI(overrides: Partial<React.ComponentProps<typeof SearchUI>> = {}) {
  return render(
    <SearchUI
      results={[]}
      query=""
      activeType={null}
      isDiscovery
      recentDocuments={[RECENT_DOCUMENT]}
      suggestedSearches={["DA Arrears"]}
      {...overrides}
    />
  );
}

describe("SearchUI", () => {
  it("seeds the input from the q parameter", () => {
    renderSearchUI({ results: [RESULT], query: "arrears", activeType: "circular", isDiscovery: false });
    expect(screen.getByRole("searchbox")).toHaveValue("arrears");
  });

  it("renders a result with its Telugu title and tags", () => {
    renderSearchUI({ results: [RESULT], query: "arrears", activeType: "circular", isDiscovery: false });
    expect(screen.getByText("DA Arrears Payment Schedule")).toBeInTheDocument();
    expect(screen.getByText("డీఏ బకాయిల చెల్లింపు షెడ్యూల్")).toBeInTheDocument();
    expect(screen.getByText("Arrears")).toBeInTheDocument();
  });

  it("surfaces approved related orders on a result", () => {
    renderSearchUI({ results: [RESULT], query: "arrears", activeType: "circular", isDiscovery: false });
    expect(screen.getByText(/Original DA Order/)).toBeInTheDocument();
  });

  it("marks Telugu text with lang=te", () => {
    renderSearchUI({ results: [RESULT], query: "arrears", activeType: "circular", isDiscovery: false });
    expect(screen.getByText("డీఏ బకాయిల చెల్లింపు షెడ్యూల్")).toHaveAttribute("lang", "te");
  });

  it("shows an empty state when a query returns nothing", () => {
    renderSearchUI({ query: "zzzz", isDiscovery: false });
    expect(screen.getByText(/No matching documents found/i)).toBeInTheDocument();
  });

  it("renders discovery content only for the true zero state", () => {
    renderSearchUI();
    expect(screen.getByRole("heading", { name: "Recent Documents" })).toBeInTheDocument();
    expect(screen.getByText("Recent Government Order")).toBeInTheDocument();
    expect(screen.getByText("Published documents")).toBeInTheDocument();
    expect(screen.queryByText("Current")).not.toBeInTheDocument();
  });

  it("keeps the topic bar in the page and does not duplicate its heading in SearchUI", () => {
    const pageSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/search/page.tsx"), "utf8");
    const componentSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/search/_components/SearchUI.tsx"), "utf8");
    const topicBarSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/_components/TopicTagBar.tsx"), "utf8");
    expect(pageSource).toMatch(/<TopicTagBar baseUrl="\/search" availableTags=\{[^}]+\} \/>/);
    // /orders rendered the same bar until SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A06):
    // it was one of three doors to /search on a page that also carried a search
    // button, quick-search chips, type tabs and a category grid. /search owns
    // topic browsing now, and this guard's actual subject — the bar belongs to
    // the page, not duplicated inside SearchUI — is unchanged.
    expect(componentSource).not.toContain("Popular Teacher Topics");
    expect(topicBarSource).toContain('href="/topics"');
  });

  it("hides discovery content when a query or filter is active", () => {
    const { rerender } = renderSearchUI({ results: [RESULT], query: "arrears", activeType: "circular", isDiscovery: false });
    expect(screen.queryByRole("heading", { name: "Recent Documents" })).not.toBeInTheDocument();

    rerender(
      <SearchUI results={[RESULT]} query="" activeType="go" isDiscovery={false} recentDocuments={[RECENT_DOCUMENT]} suggestedSearches={[]} />
    );
    expect(screen.queryByRole("heading", { name: "Recent Documents" })).not.toBeInTheDocument();
  });

  it("shows no-results rather than discovery for an active filter with zero documents", () => {
    renderSearchUI({ activeType: "memo", isDiscovery: false });
    expect(screen.getByText(/No matching documents found/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recent Documents" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Quick Searches/i)).not.toBeInTheDocument();
  });

  // SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A08) deleted the "Find by Task" grid whose
  // five destinations this used to check: /orders, /pensioners and two
  // calculators are all primary navigation targets, and the grid was the fourth
  // discovery system on a page that had not been given a query yet. The one
  // link in the discovery view that leads somewhere only this surface knows
  // about — a real recent document — is what remains to assert.
  it("links a recent document to its own page", () => {
    renderSearchUI();
    expect(screen.getByRole("link", { name: /Recent Government Order/i })).toHaveAttribute("href", "/posts/recent-go-2026");
  });

  it("keeps the Recent Documents heading but shows its own empty state when there are none", () => {
    renderSearchUI({ recentDocuments: [] });
    expect(screen.getByRole("heading", { name: "Recent Documents" })).toBeInTheDocument();
    expect(screen.getByText("No recent documents yet.")).toBeInTheDocument();
  });

  it("offers a next step out of a no-results state", () => {
    renderSearchUI({ query: "zzzz", isDiscovery: false });
    expect(screen.getByText(/No matching documents found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse Orders & Circulars/i })).toHaveAttribute("href", "/orders");
  });

  // SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A08) regression guards. Paired: the removed
  // discovery machinery stays gone, and the jobs the empty state exists to do
  // still work.
  it("renders none of the removed discovery machinery before a query", () => {
    renderSearchUI();

    for (const gone of ["Quick Searches", "Find by Task", "Pay & DA", "Tax Forms", "Official Portal Guides", "🔍"]) {
      expect(screen.queryByText(gone), gone).not.toBeInTheDocument();
    }
    // The five task cards were whole-card links to primary navigation targets.
    for (const href of ["/orders", "/pensioners", "/tools/da-arrears", "/tools/tax-calculator", "/tools/cfms-checker"]) {
      expect(
        screen.queryAllByRole("link").filter((link) => link.getAttribute("href") === href),
        href,
      ).toHaveLength(0);
    }
  });

  it("keeps verified suggestions as plain text, in the same area as recent documents", () => {
    const { container } = renderSearchUI({ suggestedSearches: ["Transfers", "PRC arrears"] });

    const suggestion = screen.getByRole("button", { name: "Transfers" });
    expect(suggestion).toBeInTheDocument();
    // Not a pill, not wrapped in a badge, and inside the recent-documents
    // section rather than a section of its own.
    expect(suggestion.className).not.toContain("rounded-full");
    expect(suggestion.closest("section")).toBe(
      container.querySelector('section[aria-labelledby="recent-documents-heading"]'),
    );
  });

  it("renders no suggestion line when nothing verified against real content", () => {
    // The rule that outlived the chips: a suggestion the data cannot support is
    // never invented to fill the space (UI_AUDIT.md F30).
    renderSearchUI({ suggestedSearches: [] });
    expect(screen.queryByText(/^Try:/)).not.toBeInTheDocument();
  });

  it("keeps the field, the type control and real recent documents", () => {
    renderSearchUI();

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GO" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent Documents" })).toBeInTheDocument();
    expect(screen.getByText("Recent Government Order")).toBeInTheDocument();
    // Provenance and the labelled date survive the chip cleanup (A19).
    expect(screen.getByText("GOIR Verified")).toBeInTheDocument();
    expect(screen.getByText(/Issued|Added to portal/)).toBeInTheDocument();
  });

  // The debounce timer and the router.push it eventually fires are not what
  // this proves — value changing is deliberately synchronous, before the
  // timer/transition ever run, so a reverted "no pending state" regression
  // fails immediately rather than needing fake timers. Clearing is driven by
  // the results/query props actually changing (the real completion signal —
  // router.push has no promise to await), simulated here with rerender.
  it("shows a pending indicator as soon as the query changes, and clears once new results land", () => {
    const { rerender } = renderSearchUI({ query: "arrears" });
    expect(screen.queryByText(/Searching…/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "arrears 2" } });
    expect(screen.getByText(/Searching…/i)).toBeInTheDocument();

    rerender(
      <SearchUI results={[RESULT]} query="arrears 2" activeType={null} isDiscovery={false} recentDocuments={[]} suggestedSearches={[]} />
    );
    expect(screen.queryByText(/Searching…/i)).not.toBeInTheDocument();
  });
});
