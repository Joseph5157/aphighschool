// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PostDetailPage from "@/app/(public)/posts/[slug]/page";
import { resetDb, makePost, testDb } from "./db";

// UI-LINKS-1: the two "Category Stacks" on every post-detail page linked
// "View More" to /category/ap-teachers-latest-news and /category/teachers-softwares
// — slugs that never existed in the Category table, so both 404'd. The second
// stack also just showed the first stack's own posts reversed (not a real
// "Tools" category query), and a "NEW" badge was assigned by array position
// (first 3 items) rather than by any actual date.
describe("post detail Category Stacks — real category, no fabricated freshness", () => {
  beforeEach(resetDb);

  it("links the second stack to the real /category/tools when tools-category posts exist", async () => {
    const toolsCategory = await testDb.category.create({
      data: { nameEn: "Tools", nameTe: "సాధనాలు", slug: "tools" },
    });
    await makePost({ slug: "main-post", titleEn: "Main Post", isDraft: false });
    await makePost({
      slug: "tools-post",
      titleEn: "A Tools Category Post",
      isDraft: false,
      categoryId: toolsCategory.id,
    });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).toContain('href="/category/tools"');
    expect(html).not.toContain("ap-teachers-latest-news");
    expect(html).not.toContain("teachers-softwares");
    expect(html).toContain("A Tools Category Post");
  });

  it("omits the second stack entirely when there is no other tools-category post", async () => {
    await makePost({ slug: "main-post", titleEn: "Main Post", isDraft: false });
    await makePost({ slug: "other-post", titleEn: "Some Other Post", isDraft: false });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).not.toContain("School Apps");
    expect(html).not.toContain('href="/category/tools"');
  });

  it("points the site-wide 'latest updates' stack at the real /orders hub", async () => {
    await makePost({ slug: "main-post", titleEn: "Main Post", isDraft: false });
    await makePost({ slug: "other-post", titleEn: "Some Other Post", isDraft: false });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).toContain("AP Teachers Latest Updates");
    expect(html).toContain('href="/orders"');
  });

  it("no longer marks stack items NEW by array position", async () => {
    await makePost({ slug: "main-post", titleEn: "Main Post", isDraft: false });
    await makePost({ slug: "other-post", titleEn: "Some Other Post", isDraft: false });

    const html = renderToStaticMarkup(await PostDetailPage({ params: { slug: "main-post" } }));

    expect(html).not.toContain(">NEW<");
  });
});
