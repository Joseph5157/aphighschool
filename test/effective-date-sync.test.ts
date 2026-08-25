// @vitest-environment node
//
// effectiveDate (see lib/dates.ts / prisma/schema.prisma) is an app-maintained
// sort helper: COALESCE(documentDate, createdAt), kept in sync by every write
// path that touches documentDate. That's a real fragility — Prisma can't
// enforce the invariant, so only createPost and updatePost can. This file
// proves those two writers actually hold it, in both directions.
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("NEXT_REDIRECT");
  },
}));

import { createPost, updatePost } from "@/app/actions/posts";
import { resetDb, testDb } from "./db";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const VALID = {
  titleEn: "Transfer Guidelines 2026",
  titleTe: "బదిలీ మార్గదర్శకాలు 2026",
  summaryTe: "అర్హులైన ఉపాధ్యాయులు దరఖాస్తు చేసుకోవాలి.",
  goReference: "G.O.Ms.No.55",
};

// createPost/updatePost always end in redirect() (mocked above to throw), so
// a call that returns normally means something upstream — validation,
// requireAdmin, the write itself — silently failed to run. Assert that, don't
// just swallow every outcome under a name that promises otherwise.
async function swallowRedirect(fn: () => Promise<void>) {
  let redirected = false;
  try {
    await fn();
  } catch (e) {
    redirected = true;
    if ((e as Error).message !== "NEXT_REDIRECT") throw e;
  }
  if (!redirected) {
    throw new Error("expected the action to redirect (throw NEXT_REDIRECT), but it returned normally");
  }
}

describe("effectiveDate sync on createPost", () => {
  beforeEach(resetDb);

  it("matches createdAt when no documentDate is given", async () => {
    await swallowRedirect(() => createPost(form(VALID)));
    const post = await testDb.post.findFirstOrThrow();

    expect(post.documentDate).toBeNull();
    expect(post.effectiveDate.getTime()).toBe(post.createdAt.getTime());
  });

  it("pins effectiveDate to documentDate when one is given", async () => {
    await swallowRedirect(() =>
      createPost(form({ ...VALID, documentDate: "2024-02-08" }))
    );
    const post = await testDb.post.findFirstOrThrow();

    expect(post.documentDate?.toISOString().slice(0, 10)).toBe("2024-02-08");
    expect(post.effectiveDate.toISOString().slice(0, 10)).toBe("2024-02-08");
    // Proves it's actually reading documentDate, not accidentally matching createdAt.
    expect(post.effectiveDate.getTime()).not.toBe(post.createdAt.getTime());
  });
});

describe("effectiveDate sync on updatePost", () => {
  beforeEach(resetDb);

  it("moves effectiveDate to a newly-added documentDate", async () => {
    await swallowRedirect(() => createPost(form(VALID)));
    const post = await testDb.post.findFirstOrThrow();
    expect(post.effectiveDate.getTime()).toBe(post.createdAt.getTime());

    await swallowRedirect(() =>
      updatePost(post.id, form({ ...VALID, documentDate: "2020-06-01" }))
    );
    const updated = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });

    expect(updated.documentDate?.toISOString().slice(0, 10)).toBe("2020-06-01");
    expect(updated.effectiveDate.toISOString().slice(0, 10)).toBe("2020-06-01");
  });

  it("falls back to the post's own original createdAt when documentDate is cleared, not the update time", async () => {
    await swallowRedirect(() =>
      createPost(form({ ...VALID, documentDate: "2020-06-01" }))
    );
    const post = await testDb.post.findFirstOrThrow();
    const originalCreatedAt = post.createdAt;

    // Clearing documentDate: omit it from the form entirely, same as the
    // admin form submitting a blank date input.
    await swallowRedirect(() => updatePost(post.id, form(VALID)));
    const updated = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });

    expect(updated.documentDate).toBeNull();
    // The regression this guards against: effectiveDate silently drifting to
    // the update's own timestamp instead of falling back to the row's real,
    // original ingestion date.
    expect(updated.effectiveDate.getTime()).toBe(originalCreatedAt.getTime());
  });
});

describe("end-to-end: createPost/updatePost feed ORDER_BY_OFFICIAL_DATE correctly", () => {
  beforeEach(resetDb);

  // Certifies the whole chain, not just the pieces: real actions write
  // effectiveDate, and a real findMany(ORDER_BY_OFFICIAL_DATE) reads it back
  // in the right order. The two tests above independently prove createPost
  // and updatePost sync effectiveDate; test/dates.test.ts independently
  // proves ORDER_BY_OFFICIAL_DATE sorts effectiveDate correctly against
  // hand-set rows. Neither proves the two are wired together — this does.
  //
  // The middle post is deliberately created with an OLDER documentDate than
  // "oldest-order", then moved past it via updatePost. If updatePost stopped
  // syncing effectiveDate, this post's effectiveDate would stay pinned at its
  // stale creation-time value (2010) and it would sort LAST, not middle — a
  // deterministic flip, not a coin-flip between two near-identical timestamps.
  it("sorts posts created and edited through the real actions in true official-date order", async () => {
    await swallowRedirect(() =>
      createPost(form({ ...VALID, titleEn: "Oldest Order E2E", documentDate: "2015-01-01" }))
    );

    await swallowRedirect(() =>
      createPost(form({ ...VALID, titleEn: "Moved Order E2E", documentDate: "2010-01-01" }))
    );
    const moved = await testDb.post.findFirstOrThrow({ where: { titleEn: "Moved Order E2E" } });
    await swallowRedirect(() =>
      updatePost(moved.id, form({ ...VALID, titleEn: "Moved Order E2E", documentDate: "2020-01-01" }))
    );

    await swallowRedirect(() =>
      createPost(form({ ...VALID, titleEn: "Fresh Undated Order E2E" }))
    );

    const all = await testDb.post.findMany({
      orderBy: ORDER_BY_OFFICIAL_DATE,
      select: { titleEn: true },
    });

    expect(all.map((p) => p.titleEn)).toEqual([
      "Fresh Undated Order E2E",
      "Moved Order E2E",
      "Oldest Order E2E",
    ]);
  });
});
