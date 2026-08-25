// @vitest-environment node
import { describe, it, expect } from "vitest";
import { officialDate, dateLabel, formatDate } from "@/lib/dates";

const createdAt = new Date("2026-08-24T10:00:00.000Z");
const issued = new Date("2024-02-08T00:00:00.000Z");

describe("officialDate", () => {
  it("prefers documentDate when present", () => {
    expect(officialDate({ documentDate: issued, createdAt })).toEqual(issued);
  });

  it("falls back to createdAt when documentDate is null", () => {
    expect(officialDate({ documentDate: null, createdAt })).toEqual(createdAt);
  });
});

describe("dateLabel", () => {
  it("says Issued when the official date is known", () => {
    expect(dateLabel({ documentDate: issued, createdAt })).toBe("Issued");
  });

  it("never says Issued or Published for a fallback date", () => {
    const label = dateLabel({ documentDate: null, createdAt });
    expect(label).toBe("Added to portal");
    expect(label).not.toMatch(/Issued|Published/);
  });
});

describe("formatDate", () => {
  it("formats as day month year", () => {
    expect(formatDate(issued)).toBe("08 Feb 2024");
  });
});

// --- ordering, against the database ---
import { beforeEach } from "vitest";
import { resetDb, makePost, testDb } from "./db";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";

describe("official date ordering", () => {
  beforeEach(resetDb);

  it("sorts dated documents by official date, undated ones after", async () => {
    const old = await makePost({ slug: "old-order" });
    const recent = await makePost({ slug: "recent-order" });
    await makePost({ slug: "undated-order" });

    await testDb.post.update({
      where: { id: old.id },
      data: { documentDate: new Date("2023-01-01") },
    });
    await testDb.post.update({
      where: { id: recent.id },
      data: { documentDate: new Date("2026-01-01") },
    });

    const posts = await testDb.post.findMany({
      orderBy: ORDER_BY_OFFICIAL_DATE as never,
      select: { slug: true },
    });

    expect(posts.map((p) => p.slug)).toEqual([
      "recent-order",
      "old-order",
      "undated-order",
    ]);
  });
});
