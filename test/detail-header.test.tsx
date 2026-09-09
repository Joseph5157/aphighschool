// SLOP-DETAIL-1 regression guards (docs/ui/AI_SLOP_AUDIT.md A07, A08, A09, A10).
//
// Paired assertions again: the machinery is gone AND the information it was
// wrapped around is still rendered. The second half is what this gate is most
// at risk of getting wrong, because every fact removed from ActionSummary's
// table was removed on the promise that the header already states it.
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/posts/x" }));

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
import TableOfContents, { MIN_TOC_HEADINGS } from "@/app/(public)/posts/[slug]/_components/TableOfContents";
import CategoryLogList, { FILTER_MIN_DOCUMENTS } from "@/app/(public)/category/[slug]/_components/CategoryLogList";

afterEach(cleanup);

const ISSUED = new Date("2026-03-12T00:00:00Z");
const ADDED = new Date("2026-04-01T00:00:00Z");

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    slug: "go-129",
    titleEn: "Sanction of DA arrears",
    titleTe: "డిఏ బకాయిల మంజూరు",
    content: "<p>body</p>",
    goReference: "G.O.Ms.No.129",
    sourceDept: "School Education",
    documentDate: ISSUED,
    createdAt: ADDED,
    actionDeadline: null,
    verifiedAgainstGoir: true,
    pdfUrl: "https://example.com/doc.pdf",
    sourceUrl: "https://example.com/source",
    actionUrl: null,
    summaryTe: ["ఉపాధ్యాయులకు డీఏ బకాయిలు చెల్లించబడతాయి."],
    englishAbstract: null,
    category: { nameEn: "Government Orders", slug: "government-orders" },
    relatedFrom: [],
    ...overrides,
  };
}

const STATE_VIEW = { kind: "state", state: "current", label: "Current", inForce: true };

function renderDocument(overrides: Record<string, unknown> = {}) {
  return render(<DocumentTemplate post={makePost(overrides)} lifecycleView={STATE_VIEW} />);
}

describe("A09 — one document header instead of three stacked panels", () => {
  it("states each fact once in the header and never again below it", () => {
    const { container } = renderDocument();
    const header = container.querySelector("header")!;
    const glance = container.querySelector('section[aria-label="At a glance"]')!;
    const count = (root: Element, needle: string) => root.innerHTML.split(needle).length - 1;

    // Counted, not merely present: a presence check passes just as well on the
    // duplicated version this gate removed. Scoped to these two panels, which
    // are the finding — the breadcrumb trail above them legitimately names the
    // document by its reference, and does so in its schema.org JSON-LD too.
    for (const fact of ["G.O.Ms.No.129", "School Education", "Issued", "GOIR Verified"]) {
      expect(count(header, fact), `header: ${fact}`).toBe(1);
      expect(count(glance, fact), `at a glance: ${fact}`).toBe(0);
    }
  });

  it("keeps every protected fact in the header", () => {
    const { container } = renderDocument();
    const header = container.querySelector("header")!;

    expect(within(header).getByText("Current")).toBeInTheDocument();
    expect(within(header).getByText(/This order is in force/)).toBeInTheDocument();
    expect(within(header).getByText("G.O.Ms.No.129")).toBeInTheDocument();
    expect(within(header).getByText("Government Orders")).toBeInTheDocument();
    expect(within(header).getByText("School Education")).toBeInTheDocument();
    expect(within(header).getByText(/Issued/)).toBeInTheDocument();
    expect(within(header).getByText("GOIR Verified")).toBeInTheDocument();
    expect(within(header).getByRole("heading", { level: 1 })).toHaveTextContent("Sanction of DA arrears");
    expect(within(header).getByText("డిఏ బకాయిల మంజూరు")).toBeInTheDocument();
  });

  it("puts the lifecycle state before the title, not after it", () => {
    const { container } = renderDocument();
    const html = container.innerHTML;

    // "Immediately visible" is a position claim, so it is asserted as one.
    expect(html.indexOf("This order is in force")).toBeGreaterThan(-1);
    expect(html.indexOf("This order is in force")).toBeLessThan(html.indexOf("Sanction of DA arrears"));
  });

  it("renders one header block rather than a stack of separate panels", () => {
    const { container } = renderDocument();
    expect(container.querySelectorAll("header")).toHaveLength(1);
    // The state strip and the masthead are inside it, not beside it.
    const header = container.querySelector("header")!;
    expect(header.textContent).toContain("Current");
    expect(header.textContent).toContain("Sanction of DA arrears");
  });

  it("keeps the summary and the source links, which only At a Glance carries", () => {
    const { container } = renderDocument();
    // Scoped to the section: the mobile thumb-zone action bar also links to the
    // source, and that bar is a separate surface this gate does not touch.
    const glance = within(container.querySelector('section[aria-label="At a glance"]')!);

    expect(glance.getByText("ఉపాధ్యాయులకు డీఏ బకాయిలు చెల్లించబడతాయి.")).toBeInTheDocument();
    expect(glance.getByRole("link", { name: /Open PDF/i })).toHaveAttribute("href", "https://example.com/doc.pdf");
    expect(glance.getByRole("link", { name: /Source link/i })).toHaveAttribute("href", "https://example.com/source");
  });

  it("drops the filler subtitle and the section's duplicated fact labels", () => {
    renderDocument();
    for (const gone of [
      "Author-provided summary and document facts",
      "Document Status",
      "G.O. / Reference",
      "Department",
      "GOIR verification",
    ]) {
      expect(screen.queryByText(gone), gone).not.toBeInTheDocument();
    }
  });

  it("still shows a deadline once, on the header", () => {
    renderDocument({ actionDeadline: new Date("2099-01-15T00:00:00Z") });
    expect(screen.getAllByText(/Deadline:/)).toHaveLength(1);
  });
});

describe("A10 — helper label and a table of contents proportional to the document", () => {
  it("renders no 'Structured Document' filler beside the content label", () => {
    renderDocument();
    expect(screen.getByText("Full Order Text & Clauses")).toBeInTheDocument();
    expect(screen.queryByText("Structured Document")).not.toBeInTheDocument();
  });

  function renderWithHeadings(count: number) {
    const article = document.createElement("div");
    article.className = "prose-gazette";
    article.innerHTML = Array.from({ length: count }, (_, i) => `<h2>Section ${i + 1}</h2><p>text</p>`).join("");
    document.body.appendChild(article);
    const result = render(<TableOfContents />);
    return { ...result, article };
  }

  it("renders nothing for a document with fewer than the threshold's headings", () => {
    const { container, article } = renderWithHeadings(MIN_TOC_HEADINGS - 1);
    expect(container).toBeEmptyDOMElement();
    // The ids are still assigned, so a direct link to a section keeps working
    // on a document that shows no contents list.
    expect(article.querySelectorAll("h2[id]")).toHaveLength(MIN_TOC_HEADINGS - 1);
    article.remove();
  });

  it("renders the contents list for a document with enough sections", () => {
    const { container, article } = renderWithHeadings(MIN_TOC_HEADINGS);
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByRole("navigation", { name: "Table of contents" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: `Section ${MIN_TOC_HEADINGS}` }).length).toBeGreaterThan(0);
    article.remove();
  });

  it("gives a short document's text the full width instead of holding a column empty", () => {
    const { container } = renderDocument({ content: "<h2>One</h2><p>text</p>" });
    const grid = container.querySelector(".prose-gazette")!.closest("div.space-y-8")!.parentElement!;
    expect(grid.className).not.toContain("lg:grid-cols-12");
  });

  it("keeps the reading column and the contents rail side by side on a long document", () => {
    const long = Array.from({ length: MIN_TOC_HEADINGS }, (_, i) => `<h2>Section ${i + 1}</h2><p>t</p>`).join("");
    const { container } = renderDocument({ content: long });
    const grid = container.querySelector(".prose-gazette")!.closest("div.space-y-8")!.parentElement!;
    expect(grid.className).toContain("lg:grid-cols-12");
  });

  it("renders nothing for a document with no headings at all", () => {
    const { container, article } = renderWithHeadings(0);
    expect(container).toBeEmptyDOMElement();
    article.remove();
  });
});

type LogPost = React.ComponentProps<typeof CategoryLogList>["posts"][number];

function logPost(id: string, overrides: Partial<LogPost> = {}): LogPost {
  return {
    id,
    slug: `post-${id}`,
    titleEn: `Document ${id}`,
    titleTe: "పత్రం",
    summaryTe: [],
    englishAbstract: null,
    statusBadge: "notification",
    documentType: "go",
    orderState: "current",
    goReference: null,
    actionDeadline: null,
    createdAt: new Date("2026-02-08T00:00:00.000Z"),
    documentDate: new Date("2026-02-08T00:00:00.000Z"),
    tags: [],
    ...overrides,
  } as LogPost;
}

function filterLabels(): string[] {
  return screen.queryAllByRole("tab").map((tab) => tab.textContent ?? "");
}

describe("A07 — category filters proportional to the result set", () => {
  it("offers no filters for a list the reader can already see whole", () => {
    const posts = Array.from({ length: FILTER_MIN_DOCUMENTS }, (_, i) =>
      logPost(String(i), { tags: [`Tag ${i}`], orderState: i % 2 ? "current" : "superseded" })
    );
    render(<CategoryLogList posts={posts} />);

    // Every facet would have been "meaningful" here — mixed states, distinct
    // tags — and the bar is still suppressed, because the whole list is on the
    // page. Three documents under eight pills was the finding.
    expect(filterLabels()).toEqual([]);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(FILTER_MIN_DOCUMENTS);
  });

  it("offers no year filter when every document shares a year", () => {
    const posts = Array.from({ length: FILTER_MIN_DOCUMENTS + 1 }, (_, i) =>
      logPost(String(i), { documentDate: new Date(`2026-0${(i % 9) + 1}-01T00:00:00.000Z`) })
    );
    render(<CategoryLogList posts={posts} />);

    // The hardcoded pills offered 2026 AND 2025 regardless of the data; a year
    // every document shares narrows nothing, and one no document has is a dead
    // end.
    expect(filterLabels()).not.toContain("2026");
    expect(filterLabels()).not.toContain("2025");
  });

  it("derives the years that actually exist, newest first", () => {
    const posts = [
      ...Array.from({ length: 8 }, (_, i) => logPost(`a${i}`, { documentDate: new Date("2024-05-01T00:00:00.000Z") })),
      ...Array.from({ length: 3 }, (_, i) => logPost(`b${i}`, { documentDate: new Date("2023-05-01T00:00:00.000Z") })),
    ];
    render(<CategoryLogList posts={posts} />);

    const labels = filterLabels();
    expect(labels).toContain("2024");
    expect(labels).toContain("2023");
    expect(labels.indexOf("2024")).toBeLessThan(labels.indexOf("2023"));
    expect(labels).not.toContain("2026");
  });

  it("offers Open/Closed only when the list actually contains both", () => {
    const allOpen = Array.from({ length: FILTER_MIN_DOCUMENTS + 1 }, (_, i) => logPost(String(i)));
    const { unmount } = render(<CategoryLogList posts={allOpen} />);
    expect(filterLabels()).not.toContain("Open");
    expect(filterLabels()).not.toContain("Closed");
    unmount();

    const mixed = [...allOpen.slice(0, FILTER_MIN_DOCUMENTS), logPost("spent", { orderState: "superseded" })];
    render(<CategoryLogList posts={mixed} />);
    expect(filterLabels()).toContain("Open");
    expect(filterLabels()).toContain("Closed");
  });

  it("offers a tag only when it narrows the list", () => {
    const posts = [
      ...Array.from({ length: FILTER_MIN_DOCUMENTS }, (_, i) => logPost(String(i), { tags: ["Everywhere"] })),
      logPost("tagged", { tags: ["Everywhere", "Transfers"] }),
    ];
    render(<CategoryLogList posts={posts} />);

    const labels = filterLabels();
    expect(labels).toContain("Transfers");
    // Carried by every document, so selecting it changes nothing.
    expect(labels).not.toContain("Everywhere");
  });

  it("keeps lifecycle state on every row whether or not filters are offered", () => {
    render(<CategoryLogList posts={[logPost("only", { orderState: "superseded" })]} />);
    expect(filterLabels()).toEqual([]);
    expect(screen.getByText("Superseded")).toBeInTheDocument();
  });
});
