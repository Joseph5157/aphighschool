// @vitest-environment node
// TERM-TOPICS-1: /topics builds its document-topic cards from the approved §7
// vocabulary and shows only topics that published posts actually carry.
import { describe, it, expect, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TopicsPage from "@/app/(public)/topics/page";
import { publishedTagCounts, searchPosts, SEARCH_RESULT_LIMIT } from "@/lib/posts/query";
import { TOPIC_TERMS } from "@/lib/terminology";
import { makePost, resetDb, testDb } from "./db";

const render = async () => renderToStaticMarkup(await TopicsPage());
const cardHeadings = (html: string) =>
  [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1].replace(/&amp;/g, "&"));

const SERVICE_GUIDE_HEADINGS = ["Pension &amp; Retirement", "Service Records, Leave &amp; Benefits"];

beforeEach(resetDb);

describe("/topics document topics", () => {
  beforeEach(async () => {
    await makePost({ slug: "transfers-go", tags: ["Transfers"] });
    await makePost({ slug: "transfers-rc", tags: ["Transfers", "PTR"] });
    await makePost({ slug: "instructors", tags: ["Recruitment"] });
    await makePost({ slug: "dsc-draft", tags: ["DSC"], isDraft: true });
  });

  it("shows only approved topics with published posts, in plan order", async () => {
    const html = await render();
    // Transfers (2 posts) and Rationalisation (legacy PTR); nothing for DSC,
    // whose only carriers are a draft and a non-evidence `Recruitment` tag.
    expect(cardHeadings(html).slice(0, 2)).toEqual([
      "Teacher Transfers",
      "Rationalisation & Re-apportionment",
    ]);
    expect(html.match(/>Document topic</g)).toHaveLength(2);
    expect(html).not.toContain("DSC Recruitment");
  });

  it("labels each card with its English and Telugu name and the published count", async () => {
    const html = await render();
    expect(html).toContain('<p lang="te" class="mt-1 text-telugu-body text-inkSoft">ఉపాధ్యాయ బదిలీలు</p>');
    expect(html).toContain("2 published documents");
    expect(html).toContain("1 published document<");
  });

  it("links each card to a ?tag= search that returns exactly the counted posts", async () => {
    const html = await render();
    const links = [...html.matchAll(/href="\/search\?tag=([^"]+)"/g)].map((m) => decodeURIComponent(m[1]));
    expect(links).toEqual(["Transfers", "Rationalisation"]);
    // Each card's count is exactly what its destination search returns.
    const shown = [...html.matchAll(/(\d+) published documents?</g)].map((m) => Number(m[1]));
    for (const [i, tag] of links.entries()) {
      expect((await searchPosts({ tag })).length, tag).toBe(shown[i]);
    }
    const rationalisation = await searchPosts({ tag: "Rationalisation" });
    expect(rationalisation.map((p) => p.slug)).toEqual(["transfers-rc"]);
  });

  it("keeps the two static service guides", async () => {
    const html = await render();
    for (const heading of SERVICE_GUIDE_HEADINGS) expect(html).toContain(heading);
    expect(html.match(/>Service guide</g)).toHaveLength(2);
  });

  it("never offers a topic outside the approved vocabulary", async () => {
    await makePost({ slug: "mdm", tags: ["MDM", "Textbooks"] });
    const html = await render();
    const approved = new Set(TOPIC_TERMS.map((t) => t.display));
    for (const heading of cardHeadings(html).slice(0, -2)) expect(approved.has(heading), heading).toBe(true);
  });
});

describe("/topics with no tagged content", () => {
  it("says so plainly and still offers search and the service guides", async () => {
    await makePost({ slug: "untagged", tags: [] });
    const html = await render();
    expect(html).not.toContain(">Document topic<");
    expect(html).toContain("No topic has published documents yet.");
    expect(html).toContain('href="/search"');
    expect(html.match(/>Service guide</g)).toHaveLength(2);
  });
});

// PR #7 review: searchPosts lists at most SEARCH_RESULT_LIMIT results, so a
// card must not promise a larger number than its destination can show.
describe("/topics counts at the search result limit", () => {
  async function seedTransfers(n: number) {
    await testDb.post.createMany({
      data: Array.from({ length: n }, (_, i) => ({
        slug: `bulk-${i}`, titleEn: `Bulk transfer order ${i}`, titleTe: "బదిలీ",
        summaryTe: ["సారాంశం."], goReference: `G.O.Ms.No.${1000 + i}`, tags: ["Transfers"], isDraft: false,
      })),
    });
  }

  it("shows exactly the limit when the search lists every matching post", async () => {
    await seedTransfers(SEARCH_RESULT_LIMIT);
    const html = await render();
    expect(html).toContain(`${SEARCH_RESULT_LIMIT} published documents`);
    expect(await searchPosts({ tag: "Transfers" })).toHaveLength(SEARCH_RESULT_LIMIT);
  });

  it("shows 100+ when more posts match than the search can list", async () => {
    await seedTransfers(SEARCH_RESULT_LIMIT + 1);
    expect((await publishedTagCounts(["Transfers"])).get("Transfers")).toBe(SEARCH_RESULT_LIMIT + 1);
    const html = await render();
    expect(html).toContain(`${SEARCH_RESULT_LIMIT}+ published documents`);
    expect(html).not.toContain(`${SEARCH_RESULT_LIMIT + 1} published`);
    expect(await searchPosts({ tag: "Transfers" })).toHaveLength(SEARCH_RESULT_LIMIT);
  });
});
