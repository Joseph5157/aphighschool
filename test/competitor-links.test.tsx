// A document imported from a competitor's page (apteachers.in,
// amaravathiteacher.com) can carry that page's own URL in actionUrl/sourceUrl
// instead of an official source or nothing at all — found in production data
// for two posts from the same import run. A reader following "Open action
// link" or "Source link" must never be sent to a rival product's page.
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { isCompetitorUrl, dropCompetitorLink } from "@/lib/posts/competitor-domains";

vi.mock("next/navigation", () => ({ usePathname: () => "/posts/x" }));

import DocumentTemplate from "@/app/(public)/posts/[slug]/_templates/DocumentTemplate";

afterEach(cleanup);

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    id: "p1",
    slug: "go-129",
    titleEn: "Sanction of DA arrears",
    titleTe: "డిఏ బకాయిల మంజూరు",
    content: "<p>body</p>",
    goReference: "G.O.Ms.No.129",
    sourceDept: "School Education",
    documentDate: new Date("2026-03-12T00:00:00Z"),
    createdAt: new Date("2026-04-01T00:00:00Z"),
    actionDeadline: null,
    verifiedAgainstGoir: true,
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

describe("isCompetitorUrl", () => {
  it("flags the known competitor hosts, with or without www", () => {
    expect(isCompetitorUrl("https://www.apteachers.in/2026/08/x.html")).toBe(true);
    expect(isCompetitorUrl("https://apteachers.in/2026/08/x.html")).toBe(true);
    expect(isCompetitorUrl("https://amaravathiteacher.com/")).toBe(true);
    expect(isCompetitorUrl("https://amaravathiteacher.com/some/article/")).toBe(true);
  });

  it("does not flag official or unrelated domains", () => {
    expect(isCompetitorUrl("https://cse.ap.gov.in")).toBe(false);
    expect(isCompetitorUrl("https://tet2dsc.apcfss.in")).toBe(false);
    expect(isCompetitorUrl(null)).toBe(false);
    expect(isCompetitorUrl(undefined)).toBe(false);
  });

  it("is not fooled by a competitor name inside an unrelated domain", () => {
    expect(isCompetitorUrl("https://notapteachers.in/")).toBe(false);
    expect(isCompetitorUrl("https://apteachers.in.evil.com/")).toBe(false);
  });
});

describe("dropCompetitorLink", () => {
  it("nulls a competitor URL and passes through everything else", () => {
    expect(dropCompetitorLink("https://amaravathiteacher.com/x")).toBeNull();
    expect(dropCompetitorLink("https://cse.ap.gov.in")).toBe("https://cse.ap.gov.in");
    expect(dropCompetitorLink(null)).toBeNull();
  });
});

describe("document page competitor-link guard", () => {
  it("does not render an action or source link that points at a competitor", () => {
    render(
      <DocumentTemplate
        post={makePost({
          actionUrl: "https://www.apteachers.in/2026/08/x.html",
          sourceUrl: "https://amaravathiteacher.com/x",
        })}
        lifecycleView={STATE_VIEW}
      />
    );

    expect(screen.queryByRole("link", { name: /open action link/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /source link/i })).not.toBeInTheDocument();
  });

  it("still renders a legitimate action and source link", () => {
    render(
      <DocumentTemplate
        post={makePost({
          actionUrl: "https://tet2dsc.apcfss.in",
          sourceUrl: "https://goir.ap.gov.in/x",
        })}
        lifecycleView={STATE_VIEW}
      />
    );

    expect(screen.getByRole("link", { name: /open action link/i })).toHaveAttribute(
      "href",
      "https://tet2dsc.apcfss.in"
    );
    expect(screen.getByRole("link", { name: /source link/i })).toHaveAttribute(
      "href",
      "https://goir.ap.gov.in/x"
    );
  });
});
