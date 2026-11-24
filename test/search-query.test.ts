// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import {
  recentPublishedDocuments,
  searchPosts,
  quickSearchChips,
  tagsWithPublishedContent,
  publishedTagCounts,
} from "@/lib/posts/query";
import { makePost, resetDb, seedCategory, testDb } from "./db";

async function fixture() {
  const cat = await seedCategory("govt-orders");
  await testDb.post.create({
    data: {
      slug: "da-arrears-2026",
      titleEn: "DA Arrears Payment Schedule",
      titleTe: "డీఏ బకాయిల చెల్లింపు షెడ్యూల్",
      summaryTe: ["ఉపాధ్యాయులకు డీఏ బకాయిలు మూడు విడతలుగా చెల్లించబడతాయి."],
      goReference: "G.O.Ms.No.77",
      tags: ["DA", "Arrears"],
      documentType: "circular",
      categoryId: cat.id,
      isDraft: false,
    },
  });
  await testDb.post.create({
    data: {
      slug: "transfers-go-129",
      titleEn: "District Allocation Guidelines",
      titleTe: "జిల్లా కేటాయింపు మార్గదర్శకాలు",
      summaryTe: ["సీనియారిటీ ఆధారంగా కేటాయింపు."],
      goReference: "G.O.Ms.No.129",
      tags: ["Transfers"],
      documentType: "go",
      categoryId: cat.id,
      isDraft: false,
    },
  });
  await testDb.post.create({
    data: {
      slug: "hidden-draft",
      titleEn: "Draft About Transfers",
      titleTe: "బదిలీల ముసాయిదా",
      summaryTe: ["ముసాయిదా."],
      tags: ["Transfers"],
      documentType: "go",
      isDraft: true,
    },
  });
}

describe("searchPosts", () => {
  beforeEach(async () => {
    await resetDb();
    await fixture();
  });

  it("matches an English title", async () => {
    const r = await searchPosts({ q: "District Allocation" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("matches a Telugu phrase", async () => {
    const r = await searchPosts({ q: "బకాయిల" });
    expect(r.map((p) => p.slug)).toEqual(["da-arrears-2026"]);
  });

  it("matches a GO number", async () => {
    const r = await searchPosts({ q: "G.O.Ms.No.129" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("matches a tag", async () => {
    const r = await searchPosts({ q: "arrears" });
    expect(r.map((p) => p.slug)).toContain("da-arrears-2026");
  });

  it("matches text inside a Telugu summary", async () => {
    const r = await searchPosts({ q: "మూడు విడతలుగా" });
    expect(r.map((p) => p.slug)).toEqual(["da-arrears-2026"]);
  });

  it("is case-insensitive", async () => {
    const r = await searchPosts({ q: "district allocation" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("never returns drafts", async () => {
    const r = await searchPosts({ q: "Transfers" });
    expect(r.map((p) => p.slug)).not.toContain("hidden-draft");
  });

  it("filters by document type", async () => {
    const r = await searchPosts({ type: "go" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("filters by category slug", async () => {
    const r = await searchPosts({ category: "govt-orders" });
    expect(r).toHaveLength(2);
  });

  it("filters by tag parameter", async () => {
    const r = await searchPosts({ tag: "Transfers" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("combines a query with a type filter", async () => {
    const r = await searchPosts({ q: "Transfers", type: "circular" });
    expect(r).toHaveLength(0);
  });

  it("ignores an unknown document type rather than returning everything", async () => {
    const r = await searchPosts({ type: "banana" });
    expect(r).toHaveLength(0);
  });

  it("returns nothing for an empty parameter set", async () => {
    const r = await searchPosts({});
    expect(r).toEqual([]);
  });

  it("lists published recent documents in official-date order and excludes drafts", async () => {
    await testDb.post.update({
      where: { slug: "da-arrears-2026" },
      data: { documentDate: new Date("2026-02-08") },
    });
    await testDb.post.update({
      where: { slug: "transfers-go-129" },
      data: { documentDate: new Date("2026-03-10") },
    });

    const recent = await recentPublishedDocuments(6);

    expect(recent.map((post) => post.slug)).toEqual(["transfers-go-129", "da-arrears-2026"]);
    expect(recent.map((post) => post.slug)).not.toContain("hidden-draft");
  });

  it("returns approved related orders alongside each result", async () => {
    const [a, b] = await testDb.post.findMany({ where: { isDraft: false }, orderBy: { slug: "asc" } });
    await testDb.relatedOrder.create({
      data: { postId: a.id, relatedPostId: b.id, approved: true, source: "manual" },
    });
    const r = await searchPosts({ q: "DA Arrears" });
    expect(r[0].relatedFrom[0].relatedPost.slug).toBe(b.slug);
  });
});

// UI_AUDIT.md F30: a quick-search chip or topic-tag chip that leads to "no
// matching documents" is an unsupported claim, so both functions must drop a
// candidate the moment nothing published actually matches it.
describe("quickSearchChips", () => {
  beforeEach(async () => {
    await resetDb();
    await fixture();
  });

  it("keeps a candidate that returns real results and drops one that doesn't", async () => {
    const kept = await quickSearchChips(["District Allocation", "Nonexistent Topic Xyz"]);
    expect(kept).toEqual(["District Allocation"]);
  });

  it("returns nothing when no candidate matches", async () => {
    const kept = await quickSearchChips(["Totally Unrelated Phrase"]);
    expect(kept).toEqual([]);
  });
});

describe("tagsWithPublishedContent", () => {
  beforeEach(async () => {
    await resetDb();
    await fixture();
  });

  it("keeps a tag a published post carries and drops one nothing carries", async () => {
    const kept = await tagsWithPublishedContent(["Transfers", "Pension"]);
    expect(kept).toEqual(["Transfers"]);
  });

  it("does not credit a tag that only exists on a draft", async () => {
    // "hidden-draft" in the fixture carries "Transfers" too but is a draft;
    // the published "transfers-go-129" post already covers the positive case
    // above, so this asserts a tag with ONLY a draft carrier is excluded.
    await testDb.post.update({ where: { slug: "transfers-go-129" }, data: { isDraft: true } });
    const kept = await tagsWithPublishedContent(["Transfers"]);
    expect(kept).toEqual([]);
  });
});

// TERM-TOPICS-1: the ?tag= filter and the topic counts agree on what counts as
// a canonical topic: the canonical tag or a reviewed legacyTags value, never a
// search alias, whole tag, case-insensitive.
describe("canonical topic tags", () => {
  beforeEach(async () => {
    await resetDb();
    await makePost({ slug: "ptr-legacy", titleEn: "Staff pattern revision", tags: ["PTR"] });
    await makePost({ slug: "canonical-lower", titleEn: "Surplus posts list", tags: ["rationalisation"] });
    await makePost({ slug: "instructors", titleEn: "Academic Instructors engagement", tags: ["Recruitment"] });
    await makePost({ slug: "aptet", titleEn: "Response sheet link", tags: ["APTET"] });
    await makePost({ slug: "draft-ptr", titleEn: "Draft pattern", tags: ["PTR"], isDraft: true });
  });

  it("?tag=Rationalisation finds the legacy PTR post and the canonical tag in any case", async () => {
    const r = await searchPosts({ tag: "Rationalisation" });
    expect(r.map((p) => p.slug).sort()).toEqual(["canonical-lower", "ptr-legacy"]);
  });

  it("?tag=DSC does not treat a Recruitment tag as DSC", async () => {
    expect(await searchPosts({ tag: "DSC" })).toEqual([]);
  });

  it("a non-canonical ?tag= still matches itself", async () => {
    expect((await searchPosts({ tag: "Recruitment" })).map((p) => p.slug)).toEqual(["instructors"]);
  });

  it("counts published posts per topic the same way, ignoring drafts", async () => {
    const counts = await publishedTagCounts(["Rationalisation", "TET", "DSC"]);
    expect(Object.fromEntries(counts)).toEqual({ Rationalisation: 2, TET: 1 });
  });

  it("counts exactly what each topic's ?tag= search returns", async () => {
    const counts = await publishedTagCounts(["Rationalisation", "TET"]);
    for (const [tag, count] of counts) {
      expect((await searchPosts({ tag })).length, tag).toBe(count);
    }
  });

  it("matches a canonical topic by tags only, not by words in a title", async () => {
    // Before TERM-TOPICS-1, ?tag= also matched titles: ?tag=DA found any title
    // containing "da" (Update, Candidates), inflating the topic past its count.
    await makePost({ slug: "untagged-update", titleEn: "Candidates Update on Rationalisation", tags: [] });
    await makePost({ slug: "da-tagged", titleEn: "Arrears schedule", tags: ["DA"] });
    expect((await searchPosts({ tag: "Rationalisation" })).map((p) => p.slug)).not.toContain("untagged-update");
    expect((await searchPosts({ tag: "DA" })).map((p) => p.slug)).toEqual(["da-tagged"]);
    expect(Object.fromEntries(await publishedTagCounts(["DA"]))).toEqual({ DA: 1 });
  });

  it("matches a canonical topic tag case-insensitively in the URL too", async () => {
    expect((await searchPosts({ tag: "rationalisation" })).length).toBe(2);
  });

  it("keeps the title fallback for a non-canonical ?tag=", async () => {
    await makePost({ slug: "titled", titleEn: "Recruitment calendar", tags: [] });
    const r = (await searchPosts({ tag: "Recruitment" })).map((p) => p.slug).sort();
    expect(r).toEqual(["instructors", "titled"]);
  });
});
