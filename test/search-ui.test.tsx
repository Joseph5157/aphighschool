import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText(/Quick Searches/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent Documents" })).toBeInTheDocument();
    expect(screen.getByText("Recent Government Order")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Find by Task" })).toBeInTheDocument();
  });

  it("keeps the topic bar in the page and does not duplicate its heading in SearchUI", () => {
    const pageSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/search/page.tsx"), "utf8");
    const componentSource = fs.readFileSync(path.join(process.cwd(), "app/(public)/search/_components/SearchUI.tsx"), "utf8");
    expect(pageSource).toContain("<TopicTagBar baseUrl=\"/search\" />");
    expect(componentSource).not.toContain("Popular Teacher Topics");
  });

  it("hides discovery content when a query or filter is active", () => {
    const { rerender } = renderSearchUI({ results: [RESULT], query: "arrears", activeType: "circular", isDiscovery: false });
    expect(screen.queryByRole("heading", { name: "Recent Documents" })).not.toBeInTheDocument();

    rerender(
      <SearchUI results={[RESULT]} query="" activeType="go" isDiscovery={false} recentDocuments={[RECENT_DOCUMENT]} />
    );
    expect(screen.queryByRole("heading", { name: "Find by Task" })).not.toBeInTheDocument();
  });

  it("shows no-results rather than discovery for an active filter with zero documents", () => {
    renderSearchUI({ activeType: "memo", isDiscovery: false });
    expect(screen.getByText(/No matching documents found/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recent Documents" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Quick Searches/i)).not.toBeInTheDocument();
  });

  it("renders approved task links to existing destinations", () => {
    renderSearchUI();
    expect(screen.getByRole("link", { name: /Pay & DA/i })).toHaveAttribute("href", "/tools/da-arrears");
    expect(screen.getByRole("link", { name: /Government Orders/i })).toHaveAttribute("href", "/orders");
    expect(screen.getByRole("link", { name: /^Pension/i })).toHaveAttribute("href", "/pensioners");
    expect(screen.getByRole("link", { name: /Official Portal Guides/i })).toHaveAttribute("href", "/tools/cfms-checker");
    expect(screen.getByRole("link", { name: /Tax Forms/i })).toHaveAttribute("href", "/tools/tax-calculator");
    expect(screen.getByRole("link", { name: /Recent Government Order/i })).toHaveAttribute("href", "/posts/recent-go-2026");
  });
});
