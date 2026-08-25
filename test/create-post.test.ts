// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("NEXT_REDIRECT");
  },
}));

import { createPost, publishPost, updatePost } from "@/app/actions/posts";
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

async function submit(fields: Record<string, string>) {
  try {
    await createPost(form(fields));
  } catch (e) {
    if ((e as Error).message !== "NEXT_REDIRECT") throw e;
  }
}

describe("createPost", () => {
  beforeEach(resetDb);

  it("saves the new post as a draft", async () => {
    await submit(VALID);
    const post = await testDb.post.findFirst();
    expect(post?.isDraft).toBe(true);
  });

  it("does not mark the new post as GOIR-verified unless asked", async () => {
    await submit(VALID);
    const post = await testDb.post.findFirst();
    expect(post?.verifiedAgainstGoir).toBe(false);
  });

  it("publishPost is what makes a post public", async () => {
    await submit(VALID);
    const created = await testDb.post.findFirstOrThrow();
    await publishPost(created.id);
    const after = await testDb.post.findUniqueOrThrow({ where: { id: created.id } });
    expect(after.isDraft).toBe(false);
  });

  it("persists the submitted document type and order state", async () => {
    await submit({ ...VALID, documentType: "circular", orderState: "superseded" });
    const post = await testDb.post.findFirstOrThrow();
    expect(post.documentType).toBe("circular");
    expect(post.orderState).toBe("superseded");
  });

  it("defaults to no document type and the current order state", async () => {
    await submit(VALID);
    const post = await testDb.post.findFirstOrThrow();
    expect(post.documentType).toBeNull();
    expect(post.orderState).toBe("current");
  });
});

describe("updatePost lifecycle fields", () => {
  beforeEach(resetDb);

  it("saves an edited document type and order state without disturbing effectiveDate", async () => {
    await submit({ ...VALID, documentType: "notification", orderState: "current" });
    const created = await testDb.post.findFirstOrThrow();

    try {
      await updatePost(
        created.id,
        form({ ...VALID, documentType: "go", orderState: "archived" })
      );
    } catch (e) {
      if ((e as Error).message !== "NEXT_REDIRECT") throw e;
    }

    const after = await testDb.post.findUniqueOrThrow({ where: { id: created.id } });
    expect(after.documentType).toBe("go");
    expect(after.orderState).toBe("archived");
    // effectiveDate is COALESCE(documentDate, createdAt) — see lib/dates.ts.
    // This post has no documentDate, so the edit must leave it on createdAt.
    expect(after.documentDate).toBeNull();
    expect(after.effectiveDate.getTime()).toBe(after.createdAt.getTime());
  });
});
