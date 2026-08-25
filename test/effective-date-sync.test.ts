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

async function expectRedirect(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (e) {
    if ((e as Error).message !== "NEXT_REDIRECT") throw e;
  }
}

describe("effectiveDate sync on createPost", () => {
  beforeEach(resetDb);

  it("matches createdAt when no documentDate is given", async () => {
    await expectRedirect(() => createPost(form(VALID)));
    const post = await testDb.post.findFirstOrThrow();

    expect(post.documentDate).toBeNull();
    expect(post.effectiveDate.getTime()).toBe(post.createdAt.getTime());
  });

  it("pins effectiveDate to documentDate when one is given", async () => {
    await expectRedirect(() =>
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
    await expectRedirect(() => createPost(form(VALID)));
    const post = await testDb.post.findFirstOrThrow();
    expect(post.effectiveDate.getTime()).toBe(post.createdAt.getTime());

    await expectRedirect(() =>
      updatePost(post.id, form({ ...VALID, documentDate: "2020-06-01" }))
    );
    const updated = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });

    expect(updated.documentDate?.toISOString().slice(0, 10)).toBe("2020-06-01");
    expect(updated.effectiveDate.toISOString().slice(0, 10)).toBe("2020-06-01");
  });

  it("falls back to the post's own original createdAt when documentDate is cleared, not the update time", async () => {
    await expectRedirect(() =>
      createPost(form({ ...VALID, documentDate: "2020-06-01" }))
    );
    const post = await testDb.post.findFirstOrThrow();
    const originalCreatedAt = post.createdAt;

    // Clearing documentDate: omit it from the form entirely, same as the
    // admin form submitting a blank date input.
    await expectRedirect(() => updatePost(post.id, form(VALID)));
    const updated = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });

    expect(updated.documentDate).toBeNull();
    // The regression this guards against: effectiveDate silently drifting to
    // the update's own timestamp instead of falling back to the row's real,
    // original ingestion date.
    expect(updated.effectiveDate.getTime()).toBe(originalCreatedAt.getTime());
  });
});
