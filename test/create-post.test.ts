// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("NEXT_REDIRECT");
  },
}));

import { createPost, publishPost } from "@/app/actions/posts";
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
});
