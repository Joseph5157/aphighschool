// @vitest-environment node
//
// test/card-lifecycle-render.test.tsx proves the three card components gate the
// pill correctly WHEN they are handed documentType and orderState. Nothing
// there proves the pages actually hand them over: both consuming pages type
// their query result as `any` (app/(public)/page.tsx:18,
// app/(public)/category/[slug]/page.tsx:47), so a query that stopped selecting
// either field would reintroduce the exact bug with tsc silent — every state
// document would fall back to `orderState: undefined` and render `undefined`
// (or, if documentType were the field lost, a recruitment label again).
//
// These render the real Server Components against a seeded database, which is
// the only place that end-to-end threading is checked.
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { resetDb, seedCategory, makePost } from "./db";

// HomePage embeds DesktopLeftNav, itself an async Server Component, which
// React 18's renderToStaticMarkup cannot await (it throws "Objects are not
// valid as a React child (found: [object Promise])"). Only the two navigation
// rails are stubbed out; the post query, HeroCard and PostCard under test are
// all the real thing.
vi.mock("@/app/(public)/_components/DesktopLeftNav", () => ({
  default: () => null,
}));
vi.mock("@/app/(public)/_components/DesktopSidebar", () => ({
  default: () => null,
}));

const CategoryDetailPage = (await import("@/app/(public)/category/[slug]/page")).default;
const HomePage = (await import("@/app/(public)/page")).default;

describe("category page lifecycle pills", () => {
  beforeEach(resetDb);

  it("gives a circular its order state, never a recruitment label", async () => {
    const cat = await seedCategory("circulars");
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      titleEn: "Dearness Allowance Arrears Installments Release",
      documentType: "circular",
      orderState: "current",
      statusBadge: "results",
    });

    const html = renderToStaticMarkup(
      await CategoryDetailPage({ params: { slug: "circulars" } })
    );

    expect(html).toContain("Current");
    expect(html).not.toMatch(/Results/i);
    expect(html).not.toContain("undefined");
  });

  it("gives a superseded government order its own state, not a fixed Current", async () => {
    const cat = await seedCategory("govt-orders");
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      titleEn: "District Allocation Order",
      documentType: "go",
      orderState: "superseded",
      statusBadge: "hall_ticket",
    });

    const html = renderToStaticMarkup(
      await CategoryDetailPage({ params: { slug: "govt-orders" } })
    );

    expect(html).toContain("Superseded");
    expect(html).not.toMatch(/Hall Ticket/i);
  });

  it("still gives a recruitment notification its stage label", async () => {
    const cat = await seedCategory("notifications");
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      titleEn: "AP TET 2026 Examination",
      documentType: "notification",
      orderState: "current",
      statusBadge: "hall_ticket",
    });

    const html = renderToStaticMarkup(
      await CategoryDetailPage({ params: { slug: "notifications" } })
    );

    expect(html).toContain("Hall Ticket");
    expect(html).not.toContain("Current");
  });
});

describe("home page lifecycle pills", () => {
  beforeEach(resetDb);

  // HomePage renders posts[0] through HeroCard and the rest through PostCard,
  // so two posts with different order states cover both components at once
  // whichever way ORDER_BY_OFFICIAL_DATE happens to sort them.
  it("gives state documents their order state on both the hero and the cards", async () => {
    await makePost({
      isDraft: false,
      titleEn: "Dearness Allowance Arrears Installments Release",
      documentType: "circular",
      orderState: "current",
      statusBadge: "results",
    });
    await makePost({
      isDraft: false,
      titleEn: "District Allocation Order",
      documentType: "go",
      orderState: "superseded",
      statusBadge: "hall_ticket",
    });

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Current");
    expect(html).toContain("Superseded");
    expect(html).not.toMatch(/Results/i);
    expect(html).not.toMatch(/Hall ticket/i);
    expect(html).not.toContain("undefined");
  });

  it("still gives a recruitment notification its stage label", async () => {
    await makePost({
      isDraft: false,
      titleEn: "AP TET 2026 Examination",
      documentType: "notification",
      orderState: "current",
      statusBadge: "apply_link",
    });
    await makePost({
      isDraft: false,
      titleEn: "AP DSC 2026 Examination",
      documentType: "notification",
      orderState: "archived",
      statusBadge: "hall_ticket",
    });

    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Apply open");
    expect(html).toContain("Hall ticket");
    expect(html).not.toContain("Archived");
  });
});
