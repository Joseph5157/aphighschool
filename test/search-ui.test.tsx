import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

describe("SearchUI", () => {
  it("seeds the input from the q parameter", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByRole("searchbox")).toHaveValue("arrears");
  });

  it("renders a result with its Telugu title and tags", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByText("DA Arrears Payment Schedule")).toBeInTheDocument();
    expect(screen.getByText("డీఏ బకాయిల చెల్లింపు షెడ్యూల్")).toBeInTheDocument();
    expect(screen.getByText("Arrears")).toBeInTheDocument();
  });

  it("surfaces approved related orders on a result", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByText(/Original DA Order/)).toBeInTheDocument();
  });

  it("marks Telugu text with lang=te", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByText("డీఏ బకాయిల చెల్లింపు షెడ్యూల్")).toHaveAttribute("lang", "te");
  });

  it("shows an empty state when a query returns nothing", () => {
    render(<SearchUI results={[]} query="zzzz" activeType={null} />);
    expect(screen.getByText(/No documents match/i)).toBeInTheDocument();
  });

  it("shows the prompt state when there is no query", () => {
    render(<SearchUI results={[]} query="" activeType={null} />);
    expect(screen.getByText(/Trending/i)).toBeInTheDocument();
  });
});
