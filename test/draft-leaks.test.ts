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
  path.join(process.cwd(), "app", "(public)", "page.tsx"),
  "utf8"
);

describe("draft leak guards", () => {
  it("generateMetadata filters out drafts", () => {
    const block = detail.slice(
      detail.indexOf("generateMetadata"),
      detail.indexOf("generateStaticParams")
    );
    expect(block).toMatch(/isDraft\s*:\s*false/);
  });

  it("the homepage only includes approved related orders", () => {
    const block = home.slice(home.indexOf("relatedFrom"), home.indexOf("relatedFrom") + 400);
    expect(block).toMatch(/approved\s*:\s*true/);
  });

  it("both pages exclude drafts from the related post itself", () => {
    for (const source of [detail, home]) {
      const block = source.slice(
        source.indexOf("relatedFrom"),
        source.indexOf("relatedFrom") + 400
      );
      expect(block).toMatch(/relatedPost\s*:\s*\{\s*isDraft\s*:\s*false\s*\}/);
    }
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

    expect(metadata.title).toBe("Order Not Found — AP Teacher Desk");
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
