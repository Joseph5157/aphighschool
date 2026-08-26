// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { searchPosts } from "@/lib/posts/query";
import { resetDb, seedCategory, testDb } from "./db";

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

  it("returns approved related orders alongside each result", async () => {
    const [a, b] = await testDb.post.findMany({ where: { isDraft: false }, orderBy: { slug: "asc" } });
    await testDb.relatedOrder.create({
      data: { postId: a.id, relatedPostId: b.id, approved: true, source: "manual" },
    });
    const r = await searchPosts({ q: "DA Arrears" });
    expect(r[0].relatedFrom[0].relatedPost.slug).toBe(b.slug);
  });
});
