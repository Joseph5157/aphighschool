// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { resetDb, makePost, testDb } from "./db";
import { generateMetadata } from "../app/(public)/posts/[slug]/page";

const detail = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "posts", "[slug]", "page.tsx"),
  "utf8"
);
const home = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "(home)", "page.tsx"),
  "utf8"
);

describe("draft leak guards", () => {
  it("the public detail lookup is published-only and has no unrestricted slug fallback", () => {
    const start = detail.indexOf("const post = await safeQuery");
    const detailBlock = detail.slice(start, detail.indexOf("if (!post)", start));

    expect(detailBlock).toMatch(/where:\s*\{\s*slug:\s*params\.slug,\s*isDraft:\s*false\s*\}/);
    expect(detailBlock).not.toMatch(/where:\s*\{\s*slug:\s*params\.slug\s*\}/);
  });

  it("every post query on the public detail route excludes drafts", () => {
    // This used to name the four navigation queries individually. SLOP-REMOVE-1
    // deleted all four (AI_SLOP_AUDIT.md A11/A20), and a test that slices out
    // queries by name silently stops guarding anything once they are gone — so
    // it now enumerates whatever `prisma.post.find*` calls the file actually
    // contains and requires each one to filter drafts. A reintroduced feed is
    // covered automatically instead of being missed.
    const queries = [...detail.matchAll(/prisma\.post\.find\w+\(\{/g)];
    expect(queries.length).toBeGreaterThan(0);

    const unguarded = queries
      .map((match) => {
        // Stop at `include:` — the detail query's relation filter carries its
        // own `relatedPost: { isDraft: false }`, which would otherwise satisfy
        // this assertion for a top-level `where` that filters nothing. The
        // query's OWN where clause has to do the work.
        const window = detail.slice(match.index!, match.index! + 600);
        const includeAt = window.indexOf("include:");
        return includeAt === -1 ? window : window.slice(0, includeAt);
      })
      .filter((block) => !/isDraft:\s*false/.test(block));

    expect(unguarded.map((block) => block.replace(/\s+/g, " ").slice(0, 120))).toEqual([]);
  });

  it("generateMetadata filters out drafts", () => {
    const block = detail.slice(
      detail.indexOf("generateMetadata"),
      detail.indexOf("generateStaticParams")
    );
    expect(block).toMatch(/isDraft\s*:\s*false/);
  });

  it("generateStaticParams filters out drafts", () => {
    const block = detail.slice(
      detail.indexOf("generateStaticParams"),
      detail.indexOf("import DocumentTemplate")
    );
    expect(block).toMatch(/where:\s*\{\s*isDraft:\s*false\s*\}/);
  });

  it("the homepage does not fetch relatedFrom at all (nothing to leak, UI-PERF-1)", () => {
    // HeroCard/PostCard never rendered relatedFrom — the homepage query used to
    // fetch it anyway (full related-post rows, unfiltered by this file's own
    // approved/isDraft guard reasoning below). UI-PERF-1 removed the fetch
    // rather than filter it, since nothing on this page renders it. If a
    // relatedFrom fetch is ever reintroduced here, it must carry the same
    // approved:true / relatedPost:{isDraft:false} guard the detail page uses.
    expect(home).not.toMatch(/relatedFrom\s*:/);
  });

  it("the detail page excludes drafts from the related post itself", () => {
    const block = detail.slice(
      detail.indexOf("relatedFrom"),
      detail.indexOf("relatedFrom") + 400
    );
    expect(block).toMatch(/relatedPost\s*:\s*\{\s*isDraft\s*:\s*false\s*\}/);
  });
});

describe("related order filtering behaviour", () => {
  beforeEach(resetDb);

  it("a draft related post is not returned by the filtered query", async () => {
    const published = await makePost({ slug: "published-parent", isDraft: false });
    const draft = await makePost({ slug: "draft-child", isDraft: true });
    await testDb.relatedOrder.create({
      data: { postId: published.id, relatedPostId: draft.id, approved: true, source: "manual" },
    });

    const result = await testDb.post.findUnique({
      where: { slug: "published-parent" },
      include: {
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: { select: { slug: true } } },
        },
      },
    });

    expect(result?.relatedFrom).toHaveLength(0);
  });

  it("an approved, published related post is returned", async () => {
    const parent = await makePost({ slug: "parent-2", isDraft: false });
    const child = await makePost({ slug: "child-2", isDraft: false });
    await testDb.relatedOrder.create({
      data: { postId: parent.id, relatedPostId: child.id, approved: true, source: "manual" },
    });

    const result = await testDb.post.findUnique({
      where: { slug: "parent-2" },
      include: {
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: { select: { slug: true } } },
        },
      },
    });

    expect(result?.relatedFrom[0].relatedPost.slug).toBe("child-2");
  });
});

describe("generateMetadata behaviour", () => {
  beforeEach(resetDb);

  it("falls through to the not-found title for a draft slug, leaking neither title nor Telugu summary", async () => {
    await makePost({
      slug: "secret-draft-order",
      titleEn: "Secret Draft Order Title",
      titleTe: "రహస్య ముసాయిదా ఉత్తర్వు శీర్షిక",
      summaryTe: ["ఇది రహస్య సారాంశం."],
      isDraft: true,
    });

    const metadata = await generateMetadata({
      params: { slug: "secret-draft-order" },
    });

    // The root layout's title.template appends "— AP Teacher Desk" at render
    // time; this unit call gets the route's own bare title back (UI_AUDIT.md F23).
    expect(metadata.title).toBe("Page Not Found");
    expect(metadata.title).not.toContain("Secret Draft Order Title");
    expect(JSON.stringify(metadata)).not.toContain("రహస్య");
  });

  it("carries the real title for a published post", async () => {
    await makePost({
      slug: "public-order",
      titleEn: "Public Order Title",
      isDraft: false,
    });

    const metadata = await generateMetadata({
      params: { slug: "public-order" },
    });

    expect(metadata.title).toContain("Public Order Title");
  });
});
