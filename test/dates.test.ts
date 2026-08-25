// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { officialDate, dateLabel, formatDate, officialYear, todayInIST, isAfterTodayIST } from "@/lib/dates";

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

describe("officialYear", () => {
  const yearBoundary = new Date("2023-12-31T19:00:00.000Z"); // 2024-01-01 00:30 IST

  // getFullYear() reads the machine's own local timezone, not Asia/Kolkata.
  // This dev/test machine happens to already run as Asia/Calcutta, which
  // would silently mask a regression to getFullYear() right here — so pin
  // process.env.TZ to something else for these two tests specifically, to
  // prove officialYear() is reading the Intl-pinned IST value and not
  // whatever zone the process happens to be running under.
  beforeEach(() => {
    vi.stubEnv("TZ", "UTC");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("buckets by the Asia/Kolkata calendar year, not the process's own timezone", () => {
    // Sanity check on the premise: under the stubbed UTC zone, plain
    // getFullYear() on this instant reads 2023 — the wrong year, and exactly
    // what a regression to officialDate(post).getFullYear() would return.
    expect(yearBoundary.getFullYear()).toBe(2023);
    expect(officialYear({ documentDate: yearBoundary, createdAt })).toBe(2024);
  });

  it("falls back to createdAt's IST year when documentDate is null", () => {
    expect(officialYear({ documentDate: null, createdAt: yearBoundary })).toBe(2024);
  });
});

describe("todayInIST / isAfterTodayIST", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not flag today's date as future during the UTC/IST day-boundary gap", () => {
    // Real-world instant: 2026-08-25T01:30:00+05:30 — i.e. 25 Aug in IST, but
    // still 24 Aug in UTC. This is exactly the 00:00–05:30 IST window where
    // Date.now()-based comparison used to reject "today" as future-dated.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T20:00:00.000Z"));

    expect(todayInIST()).toBe("2026-08-25");

    const pickedToday = new Date("2026-08-25T00:00:00.000Z"); // what a <input type="date"> gives for "today"
    expect(isAfterTodayIST(pickedToday)).toBe(false);
  });

  it("still flags a genuinely future date as future", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-24T20:00:00.000Z")); // 2026-08-25 IST

    const tomorrow = new Date("2026-08-26T00:00:00.000Z");
    expect(isAfterTodayIST(tomorrow)).toBe(true);
  });
});

// --- ordering, against the database ---
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
      orderBy: ORDER_BY_OFFICIAL_DATE,
      select: { slug: true },
    });

    expect(posts.map((p) => p.slug)).toEqual([
      "recent-order",
      "undated-order",
      "old-order",
    ]);
  });
});
