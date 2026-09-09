// Shared application-level patterns merged by UI-PATTERNS-1.
//
// The trust-bearing ones matter most: GOIR provenance and the date label are
// the two places where a careless surface could misrepresent what the product
// knows. Both were hand-assembled at ten call sites each before this gate, so
// these tests pin the RULE, not just one rendering of it.
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({ usePathname: () => "/posts/x" }));

// jsdom implements no IntersectionObserver, and TableOfContents builds one for
// its scroll-spy. Stubbed locally rather than in test/setup.ts so it stays
// visible to anyone reading this file, and so a future component that depends
// on real observer behaviour is not silently handed a no-op everywhere.
class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", NoopIntersectionObserver);

import GoirBadge from "@/app/(public)/_components/GoirBadge";
import DocumentDate from "@/app/(public)/_components/DocumentDate";
import Callout from "@/app/(public)/_components/Callout";
import DocumentTemplate from "@/app/(public)/posts/[slug]/_templates/DocumentTemplate";

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
    verifiedAgainstGoir: false,
    pdfUrl: null,
    sourceUrl: null,
    actionUrl: null,
    summaryTe: [],
    englishAbstract: null,
    category: { nameEn: "Government Orders", slug: "government-orders" },
    relatedFrom: [],
    ...overrides,
  };
}

const STATE_VIEW = { kind: "state", state: "current", label: "Current", inForce: true };
const RECRUITMENT_VIEW = {
  kind: "recruitment",
  stages: ["Notified", "Apply open", "Hall ticket", "Results"],
  currentStage: 2,
  isExpired: false,
};

function renderDocument(post: ReturnType<typeof makePost>, lifecycleView: unknown) {
  return render(
    <DocumentTemplate
      post={post}
      lifecycleView={lifecycleView}
      prevPost={null}
      nextPost={null}
      categoryStacks={[]}
    />,
  );
}

describe("GOIR provenance is conditional and one-directional", () => {
  it("shows the marker when a check is recorded", () => {
    render(<GoirBadge verified />);
    expect(screen.getByText("GOIR Verified")).toBeInTheDocument();
  });

  it("renders NOTHING when no check is recorded", () => {
    const { container } = render(<GoirBadge verified={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the flag is absent entirely", () => {
    const { container } = render(<GoirBadge />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no unverified state to render", () => {
    // The rule (DESIGN_SYSTEM.md §12.2) is that absence of a recorded check is
    // not evidence of a problem. A grey "Unverified" badge would be a claim the
    // product cannot support, so it must be unreachable — not merely unused.
    for (const verified of [false, undefined, null]) {
      const { container } = render(<GoirBadge verified={verified as boolean | null} />);
      expect(container.textContent).toBe("");
    }
  });
});

describe("dates always carry the label that says which date they are", () => {
  it("labels a departmental issue date as Issued", () => {
    render(<DocumentDate post={{ documentDate: ISSUED, createdAt: ADDED }} />);
    expect(screen.getByText(/^Issued/)).toBeInTheDocument();
  });

  it("labels a fallback date as Added to portal, never as an issue date", () => {
    // documentDate null means the department's date is unknown. Presenting
    // createdAt as though it were the issue date is the misrepresentation
    // FRESHNESS-1 closed.
    render(<DocumentDate post={{ documentDate: null, createdAt: ADDED }} />);

    expect(screen.getByText(/Added to portal/)).toBeInTheDocument();
    expect(screen.queryByText(/Issued/)).toBeNull();
  });

  it("keeps the label and the date in one element so a flex row cannot split them", () => {
    const { container } = render(<DocumentDate post={{ documentDate: ISSUED, createdAt: ADDED }} />);
    const span = container.querySelector("span")!;

    expect(span.textContent).toContain("Issued");
    expect(span.textContent).toMatch(/\d{4}/);
    expect(span.className).toContain("whitespace-nowrap");
  });
});

describe("Callout tones carry meaning, not a colour choice", () => {
  it("maps each tone to its semantic token", () => {
    const cases = [
      ["guidance", "turmeric"],
      ["positive", "tamarind"],
      ["warning", "kumkum"],
      ["note", "hair"],
    ] as const;

    for (const [tone, token] of cases) {
      const { container } = render(<Callout tone={tone}>text</Callout>);
      expect(container.firstElementChild!.className, tone).toContain(token);
    }
  });

  it("never paints a warning in the in-force colour family", () => {
    // GpfApgliUI said "your premium is BELOW the minimum" in tamarind — the
    // colour that elsewhere means in force — with a ⚠️ emoji carrying the
    // meaning the colour contradicted.
    const { container } = render(<Callout tone="warning">below the minimum</Callout>);
    const className = container.firstElementChild!.className;

    expect(className).toContain("kumkum");
    expect(className).not.toContain("tamarind");
  });

  it("can render as a complementary landmark for tangential content", () => {
    render(
      <Callout as="aside" tone="guidance" aria-label="disclaimer">
        note
      </Callout>,
    );
    expect(screen.getByRole("complementary", { name: "disclaimer" })).toBeInTheDocument();
  });
});

describe("the merged document template", () => {
  it("shows the order-state badge for a document with no application lifecycle", () => {
    renderDocument(makePost(), STATE_VIEW);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText(/This order is in force/)).toBeInTheDocument();
    expect(screen.queryByText("Hall ticket")).toBeNull();
  });

  it("shows the recruitment stepper for a notification", () => {
    renderDocument(makePost({ documentType: "notification" }), RECRUITMENT_VIEW);

    expect(screen.getByText("Hall ticket")).toBeInTheDocument();
    expect(screen.queryByText(/This order is in force/)).toBeNull();
  });

  it("uses section labels appropriate to the document kind", () => {
    const { unmount } = renderDocument(makePost(), STATE_VIEW);
    expect(screen.getByText("Full Order Text & Clauses")).toBeInTheDocument();
    unmount();

    renderDocument(makePost(), RECRUITMENT_VIEW);
    expect(screen.getByText("Complete Guidelines & Schedules")).toBeInTheDocument();
  });

  it("shows an action deadline on BOTH lifecycle kinds", () => {
    // lib/posts/lifecycle.ts states that a deadline is orthogonal to the
    // lifecycle kind, and isLifecycleClosed() already treats a passed deadline
    // as closing either kind. Only the notification template rendered it, so a
    // GO with an application window was filtered as closed while its own page
    // showed no deadline at all.
    const deadline = new Date("2099-01-15T00:00:00Z");

    for (const view of [STATE_VIEW, RECRUITMENT_VIEW]) {
      const { unmount } = renderDocument(makePost({ actionDeadline: deadline }), view);
      expect(screen.getByText(/Deadline:/), JSON.stringify(view.kind)).toBeInTheDocument();
      unmount();
    }
  });

  it("marks a passed deadline as passed rather than as an open call to action", () => {
    renderDocument(makePost({ actionDeadline: new Date("2020-01-15T00:00:00Z") }), STATE_VIEW);
    expect(screen.getByText(/Deadline passed:/)).toBeInTheDocument();
  });

  it("keeps the independence disclaimer on every document", () => {
    renderDocument(makePost(), STATE_VIEW);
    expect(
      screen.getByText(/independent information service/),
    ).toBeInTheDocument();
  });

  it("shows GOIR provenance only where recorded", () => {
    const { unmount } = renderDocument(makePost({ verifiedAgainstGoir: true }), STATE_VIEW);
    expect(screen.getByText("GOIR Verified")).toBeInTheDocument();
    unmount();

    renderDocument(makePost({ verifiedAgainstGoir: false }), STATE_VIEW);
    expect(screen.queryByText("GOIR Verified")).toBeNull();
    expect(screen.queryByText(/unverified/i)).toBeNull();
  });

  it("labels the document date wherever it appears", () => {
    renderDocument(makePost({ documentDate: null }), STATE_VIEW);

    // Two surfaces show it — the masthead line and ActionSummary's fact row —
    // and BOTH must carry the label. Asserting on one would let the other
    // regress to a bare date.
    const labelled = screen.getAllByText(/Added to portal/);
    expect(labelled.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/^Issued/)).toBeNull();
  });
});
