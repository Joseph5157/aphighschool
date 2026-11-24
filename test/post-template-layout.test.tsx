import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/posts/example" }));

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);

import DocumentTemplate from "@/app/(public)/posts/[slug]/_templates/DocumentTemplate";

afterEach(cleanup);

const STATE_VIEW = {
  kind: "state",
  state: "current",
  label: "Current",
  inForce: true,
};

function post(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    slug: "academic-calendar",
    titleEn: "APSCERT Academic Calendar 2026",
    titleTe: "ఏపీఎస్సీఈఆర్టీ అకడమిక్ క్యాలెండర్ 2026",
    content: "",
    goReference: "Rc.No.11/A&I/2026",
    sourceDept: "APSCERT & State Project Directorate",
    documentDate: null,
    createdAt: new Date("2026-08-29T00:00:00Z"),
    actionDeadline: null,
    verifiedAgainstGoir: false,
    pdfUrl: "https://example.com/calendar.pdf",
    sourceUrl: "https://example.com/source",
    actionUrl: null,
    summaryTe: ["ప్రధాన సమాచారం తెలుగు సారాంశంగా ఇక్కడ కనిపిస్తుంది."],
    englishAbstract: "A short authored English abstract.",
    category: { nameEn: "Circulars", slug: "circulars", _count: { posts: 1 } },
    relatedFrom: [],
    ...overrides,
  };
}

describe("reusable post template", () => {
  it("uses the compact composition for a summary-only post", () => {
    const { container } = render(
      <DocumentTemplate post={post()} lifecycleView={STATE_VIEW} />,
    );

    const layout = container.querySelector('[data-post-layout="short"]');
    expect(layout).toBeInTheDocument();
    expect(layout?.className).toContain("lg:grid-cols-12");
    expect(screen.queryByLabelText("Full Article & Guidelines")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /At a Glance/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Official source" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse Orders & Circulars" }),
    ).toHaveAttribute("href", "/orders");
  });

  it("offers a counted category browse action when another document exists", () => {
    render(
      <DocumentTemplate
        post={post({
          category: {
            nameEn: "Circulars",
            slug: "circulars",
            _count: { posts: 2 },
          },
        })}
        lifecycleView={STATE_VIEW}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Browse Circulars 2 documents" }),
    ).toHaveAttribute("href", "/category/circulars");
  });

  it("does not treat empty imported markup as article content", () => {
    const { container } = render(
      <DocumentTemplate
        post={post({ content: "<p>&nbsp;</p><div> </div>" })}
        lifecycleView={STATE_VIEW}
      />,
    );
    expect(container.querySelector('[data-post-layout="short"]')).toBeInTheDocument();
    expect(screen.queryByLabelText("Full Article & Guidelines")).not.toBeInTheDocument();
  });

  it("keeps real article content and the proportional TOC flow", () => {
    const content = Array.from(
      { length: 4 },
      (_, index) => `<h2>Section ${index + 1}</h2><p>Document detail.</p>`,
    ).join("");
    const { container } = render(
      <DocumentTemplate post={post({ content })} lifecycleView={STATE_VIEW} />,
    );

    expect(container.querySelector('[data-post-layout="article"]')).toBeInTheDocument();
    expect(screen.getByLabelText("Full Article & Guidelines")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
  });

  it("moves source metadata out of the masthead without duplicating it", () => {
    const { container } = render(
      <DocumentTemplate post={post()} lifecycleView={STATE_VIEW} />,
    );
    const header = within(container.querySelector("header")!);
    const source = within(container.querySelector('section[aria-label="Official source"]')!);

    expect(header.queryByText("APSCERT & State Project Directorate")).not.toBeInTheDocument();
    expect(source.getByText("APSCERT & State Project Directorate")).toBeInTheDocument();
    expect(source.getByText(/Added to portal/)).toBeInTheDocument();
  });

  it("keeps the full title, Telugu title and document state in the header", () => {
    const { container } = render(
      <DocumentTemplate post={post()} lifecycleView={STATE_VIEW} />,
    );
    const header = within(container.querySelector("header")!);

    expect(header.getByText("Current")).toBeInTheDocument();
    expect(header.getByRole("heading", { level: 1 })).toHaveTextContent(
      "APSCERT Academic Calendar 2026",
    );
    expect(header.getByText("ఏపీఎస్సీఈఆర్టీ అకడమిక్ క్యాలెండర్ 2026")).toHaveAttribute(
      "lang",
      "te",
    );
  });
});
