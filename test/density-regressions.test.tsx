// @vitest-environment node
//
// SLOP-DENSITY-1 regression guards (docs/ui/AI_SLOP_AUDIT.md A01, A02, A06,
// A14, A15).
//
// Two kinds of assertion, deliberately paired on every surface:
//
//   1. the removed structure does not come back, and
//   2. the product information it was wrapped around is still rendered.
//
// The second kind is the one that matters. "Delete the hero" is trivially
// satisfiable by deleting the document; what the gate actually required is that
// the newest document still appears, with its state, its reference, its Telugu
// title and its date, as an ordinary row.
//
// (The row carried a one-line Telugu summary for part of this gate. It was
// measured out again: at 390x844 it made rows 219px tall, which put only two
// documents fully inside the first viewport against DESIGN_SYSTEM.md 5.3's
// three-row target. The summary lives on the document page.)
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { resetDb, seedCategory, makePost, testDb } from "./db";

// DesktopLeftNav is an async Server Component; renderToStaticMarkup cannot
// await it. Stubbed so the page under test still renders — the rail has its own
// assertions below, against the component itself.
vi.mock("@/app/(public)/_components/DesktopLeftNav", () => ({ default: () => null }));

const HomePage = (await import("@/app/(public)/page")).default;
const OrdersPage = (await import("@/app/(public)/orders/page")).default;
const PensionersPage = (await import("@/app/(public)/pensioners/page")).default;

/** PostCard's document title element — the shared row both indexes now use. */
function documentRowCount(html: string): number {
  return html.split("text-card-title").length - 1;
}

describe("A01 — the homepage promotes no document to a hero", () => {
  beforeEach(resetDb);

  async function seedThree() {
    const cat = await seedCategory("govt-orders");
    // Newest last, so `posts[0]` after ORDER_BY_OFFICIAL_DATE is "Newest Order"
    // — the one that used to be pulled out into the HeroCard.
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      slug: "oldest-order",
      titleEn: "Oldest Order",
      titleTe: "పాత ఉత్తర్వు",
      goReference: "G.O.Ms.No.1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      slug: "middle-order",
      titleEn: "Middle Order",
      titleTe: "మధ్య ఉత్తర్వు",
      goReference: "G.O.Ms.No.2",
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
    });
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      slug: "newest-order",
      titleEn: "Newest Order",
      titleTe: "కొత్త ఉత్తర్వు",
      goReference: "G.O.Ms.No.3",
      orderState: "current",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
    });
  }

  it("renders every published document as the same row, including the newest", async () => {
    await seedThree();
    const html = renderToStaticMarkup(await HomePage());

    // Three documents, three document rows. When the newest was promoted into a
    // HeroCard this count was two, because the hero rendered a different shape.
    expect(documentRowCount(html)).toBe(3);
    for (const title of ["Newest Order", "Middle Order", "Oldest Order"]) {
      expect(html).toContain(title);
    }
  });

  it("renders none of the hero's distinguishing chrome", async () => {
    await seedThree();
    const html = renderToStaticMarkup(await HomePage());

    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("Read Summary");
    expect(html).not.toContain("Featured Order");
  });

  it("keeps state, reference, Telugu content and the labelled date on the newest document", async () => {
    await seedThree();
    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain("Current");
    expect(html).toContain("G.O.Ms.No.3");
    expect(html).toContain("కొత్త ఉత్తర్వు");
    // The date carries its label, on the row, for every document — never a bare
    // date (DESIGN_SYSTEM.md §3.4). documentDate is unset on these, so every
    // row must say "Added to portal", not "Issued".
    expect(html.split("Added to portal").length - 1).toBe(3);
    expect(html).not.toContain("Issued");
  });
});

describe("A02 — the homepage carries one quiet rail, not two card kits", () => {
  beforeEach(resetDb);

  it("renders no tool shortcuts or quick-search chips beside the feed", async () => {
    await makePost({ isDraft: false, titleEn: "Some Order" });
    const html = renderToStaticMarkup(await HomePage());

    for (const gone of [
      "Explore All Utility Tools",
      "Explore All Categories",
      "Quick Searches",
      "#DAArrears",
      "#Form16Tax",
      "Income Tax Calculator",
    ]) {
      expect(html, gone).not.toContain(gone);
    }
  });

  it("still lists categories, with counts, in the surviving rail", async () => {
    const cat = await seedCategory("govt-orders");
    await makePost({ categoryId: cat.id, isDraft: false, titleEn: "A Government Order" });
    await testDb.category.create({
      data: { nameEn: "Empty Category", nameTe: "ఖాళీ వర్గం", slug: "empty-category" },
    });

    // importActual, not import: this file stubs the rail so the pages under
    // test can render, and the rail's own assertions need the real component.
    const { default: DesktopLeftNav } = await vi.importActual<{
      default: () => Promise<JSX.Element>;
    }>("@/app/(public)/_components/DesktopLeftNav");
    const html = renderToStaticMarkup(await DesktopLeftNav());

    expect(html).toContain("Government Orders");
    expect(html).toContain('href="/category/govt-orders"');
    expect(html).toContain(">1<");
    // A category with nothing published shows no count rather than a "0" — the
    // absence is the same information without the false precision.
    expect(html).toContain("Empty Category");
    expect(html).not.toContain(">0<");
  });
});

describe("A06 — the orders index runs one browse model", () => {
  beforeEach(resetDb);

  async function seedOrders() {
    const cat = await seedCategory("govt-orders");
    await makePost({
      categoryId: cat.id,
      isDraft: false,
      slug: "an-order",
      titleEn: "An Indexed Government Order",
      goReference: "G.O.Ms.No.42",
      orderState: "current",
    });
  }

  it("renders no document-type tabs, recency strip, or quick-search chips", async () => {
    await seedOrders();
    const html = renderToStaticMarkup(await OrdersPage());

    for (const gone of [
      'role="tab"',
      "Recent Documents",
      "Quick Searches",
      "#DAArrears",
      "#Form16Tax",
      "Search Government Orders",
      "View All",
    ]) {
      expect(html, gone).not.toContain(gone);
    }

    // One document list, not two: the category cards each carried three mini
    // document rows on top of the recency strip, so a single seeded document
    // used to appear twice on this page.
    expect(documentRowCount(html)).toBe(2); // the category row + the document row
  });

  it("keeps the category index, the document list, and per-document state", async () => {
    await seedOrders();
    const html = renderToStaticMarkup(await OrdersPage());

    expect(html).toContain('href="/category/govt-orders"');
    expect(html).toContain("Government Orders");
    expect(html).toContain("An Indexed Government Order");
    expect(html).toContain("G.O.Ms.No.42");
    expect(html).toContain("Current");
    expect(html).toContain("Added to portal");
    expect(html).toContain(">1<"); // the category's published count
  });

  it("shows no count at all for a category with nothing published", async () => {
    await seedOrders();
    await testDb.category.create({
      data: { nameEn: "Empty Category", nameTe: "ఖాళీ వర్గం", slug: "empty-category" },
    });

    const html = renderToStaticMarkup(await OrdersPage());
    expect(html).toContain("Empty Category");
    expect(html).not.toContain(">0<");
  });

  it("keeps the bounded GOIR provenance wording as page help text", async () => {
    await seedOrders();
    const html = renderToStaticMarkup(await OrdersPage());

    expect(html).toContain("GOIR status shown per document");
    expect(html).toContain("is a government-orders resource");
    expect(html).toContain("Published documents");
    // The claim stays scoped to recorded checks — never collection-wide.
    expect(html).not.toMatch(/GOIR Verified Repository|all documents verified/i);
  });
});

describe("A15 — the pensioners hub is a task index, not a suite", () => {
  it("renders no invented branding, duplicated pipeline preview, or unsourced rates", () => {
    const html = renderToStaticMarkup(<PensionersPage />);

    for (const gone of [
      "Emerald Treasury",
      "Care Suite",
      "View Detailed Guide",
      "1. School DDO",
      "5. STO Treasury",
      "Treasury DR Standards",
      "Current DR Rate",
      "AP Treasury",
      "Service Pension</", // the badge that repeated the card's own title
      "Clearance Pipeline",
    ]) {
      expect(html, gone).not.toContain(gone);
    }
  });

  it("keeps the four pension tasks and the sourced official portals", () => {
    const html = renderToStaticMarkup(<PensionersPage />);

    for (const kept of [
      "Service Pension &amp; DCRG Gratuity Calculator",
      "Commutation 180-Month Restoration Tracker",
      "6-Office Retirement File Clearance Guide",
      "Pensioner Income Tax &amp; Form 10E Guide",
      "https://agaeap.cag.gov.in/Pension/Home",
      "Jeevan Pramaan Portal",
      "Digital Life Certificate submission via Face Auth App",
    ]) {
      expect(html, kept).toContain(kept);
    }
  });

  it("uses no raw Tailwind palette colour where the deleted rates widget did", () => {
    // The DR-rates card painted its gratuity figure `text-emerald-700`, a
    // default-palette colour DESIGN_SYSTEM.md R0.2 bans and that does not flip
    // in dark mode. It left with the widget.
    const html = renderToStaticMarkup(<PensionersPage />);
    expect(html).not.toMatch(/emerald-\d|amber-\d|gray-\d|red-\d/);
  });
});
