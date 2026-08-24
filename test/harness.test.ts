// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makePost, testDb } from "./db";

describe("test harness", () => {
  beforeEach(resetDb);

  it("creates and reads a post against the test database", async () => {
    await makePost({ slug: "harness-check" });
    const found = await testDb.post.findUnique({ where: { slug: "harness-check" } });
    expect(found?.slug).toBe("harness-check");
  });

  it("resetDb clears posts between tests", async () => {
    expect(await testDb.post.count()).toBe(0);
  });
});
