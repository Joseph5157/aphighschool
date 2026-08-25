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

  // Proves COALESCE(documentDate, createdAt), not "dated rows always beat
  // undated rows". An undated row's effective date is its OWN createdAt, so it
  // must interleave with dated rows by that value, not sink beneath all of
  // them. Here undated-order's createdAt (2022) sits between old-order's
  // documentDate (2020) and recent-order's documentDate (2024) — so the
  // correct order lands it in the MIDDLE. A nulls-last mechanism (ordering by
  // documentDate with nulls sorted after every non-null value) would instead
  // put every dated row ahead of it regardless of date, giving
  // [recent, old, undated] — wrong, and indistinguishable from correct by a
  // test that only ever puts the undated row at an end.
  it("interleaves an undated row by its own createdAt, per COALESCE(documentDate, createdAt)", async () => {
    const old = await makePost({ slug: "old-order" });
    const undated = await makePost({ slug: "undated-order" });
    const recent = await makePost({ slug: "recent-order" });

    // effectiveDate is a sort-helper column the app keeps in sync on every
    // write that touches documentDate (see app/actions/posts.ts). These test
    // writes go straight to the DB, bypassing that app layer, so the test
    // must set it itself here — exactly what createPost/updatePost do.
    await testDb.post.update({
      where: { id: old.id },
      data: { documentDate: new Date("2020-06-01"), effectiveDate: new Date("2020-06-01") },
    });
    await testDb.post.update({
      where: { id: undated.id },
      data: { createdAt: new Date("2022-06-01"), effectiveDate: new Date("2022-06-01") },
    });
    await testDb.post.update({
      where: { id: recent.id },
      data: { documentDate: new Date("2024-06-01"), effectiveDate: new Date("2024-06-01") },
    });

    const posts = await testDb.post.findMany({
      orderBy: ORDER_BY_OFFICIAL_DATE as never,
      select: { slug: true },
    });

    expect(posts.map((p) => p.slug)).toEqual([
      "recent-order",
      "undated-order",
      "old-order",
    ]);
  });
});
