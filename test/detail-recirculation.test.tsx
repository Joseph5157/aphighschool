// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PostDetailPage from "@/app/(public)/posts/[slug]/page";
import { resetDb, makePost, testDb } from "./db";

// SLOP-REMOVE-1 (docs/ui/AI_SLOP_AUDIT.md A11) removed every generic
// recirculation surface from the document detail page: Previous/Next Post
// cards, the site-wide "Latest Updates & Softwares" stack, and the
// tools-category stack. Related Orders — approved, explicitly curated
// relationships — is the document's only continuation, plus one quiet link back
// to the index it belongs to.
//
// These tests are written so they FAIL if any of that comes back. Each one
// seeds posts that the removed queries would have surfaced (a chronologically
// adjacent post, an unrelated recent post, a tools-category post) and asserts
// those titles are absent from the rendered document — while an approved
// related order's title is present. Asserting only on the removed *labels*
// would pass even if the feeds returned under new headings.
describe("document detail carries no generic recirculation", () => {
  beforeEach(resetDb);

  /** Seeds a main post plus every kind of post the deleted feeds would show. */
  async function seedNeighbours() {
    const toolsCategory = await testDb.category.create({
      data: { nameEn: "Tools", nameTe: "సాధనాలు", slug: "tools" },
    });

    const main = await makePost({
      slug: "main-post",
      titleEn: "Main Post",
      isDraft: false,
      createdAt: new Date("2026-05-01T00:00:00Z"),
    });
    // Older and newer than the main post: the prev/next timeline queries.
    await makePost({
      slug: "older-post",
      titleEn: "Chronologically Older Neighbour",
      isDraft: false,
      createdAt: new Date("2026-04-01T00:00:00Z"),
    });
    await makePost({
      slug: "newer-post",
      titleEn: "Chronologically Newer Neighbour",
      isDraft: false,
      createdAt: new Date("2026-06-01T00:00:00Z"),
    });
    // The site-wide "latest updates" stack and the tools stack.
    await makePost({
      slug: "tools-post",
      titleEn: "A Tools Category Post",
      isDraft: false,
      categoryId: toolsCategory.id,
    });

    return main;
  }

  it("does not render chronologically adjacent posts", async () => {
    await seedNeighbours();

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).not.toContain("Chronologically Older Neighbour");
    expect(html).not.toContain("Chronologically Newer Neighbour");
    expect(html).not.toContain("Previous Post");
    expect(html).not.toContain("Next Post");
  });

  it("does not render the latest-updates or tools category stacks", async () => {
    await seedNeighbours();

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).not.toContain("A Tools Category Post");
    expect(html).not.toContain("AP Teachers Latest Updates");
    expect(html).not.toContain("Latest Updates");
    expect(html).not.toContain("Category Stacks");
    expect(html).not.toContain('href="/category/tools"');
  });

  it("still renders an approved related order, which is the real continuation", async () => {
    const main = await seedNeighbours();
    const background = await makePost({
      slug: "background-order",
      titleEn: "Background Order This Document Amends",
      goReference: "G.O.Ms.No.11",
      isDraft: false,
    });
    await testDb.relatedOrder.create({
      data: { postId: main.id, relatedPostId: background.id, approved: true, source: "manual" },
    });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).toContain("Background Order This Document Amends");
    expect(html).toContain('href="/posts/background-order"');
    // ...and still nothing generic alongside it.
    expect(html).not.toContain("Chronologically Newer Neighbour");
  });

  it("offers one quiet link back to the index the document belongs to", async () => {
    const category = await testDb.category.create({
      data: { nameEn: "Government Orders", nameTe: "ప్రభుత్వ ఉత్తర్వులు", slug: "govt-orders" },
    });
    await makePost({
      slug: "main-post",
      titleEn: "Main Post",
      isDraft: false,
      categoryId: category.id,
    });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).toContain('href="/category/govt-orders"');
    expect(html).toContain("All Government Orders");
  });

  it("falls back to the orders hub when a document has no category", async () => {
    await makePost({ slug: "orphan-post", titleEn: "Orphan Post", isDraft: false, categoryId: null });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "orphan-post" } }));

    expect(html).toContain('href="/orders"');
    expect(html).toContain("All orders &amp; documents");
  });
});
