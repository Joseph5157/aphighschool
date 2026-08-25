// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makePost, testDb } from "./db";

describe("post schema shape", () => {
  beforeEach(resetDb);

  it("stores a documentDate distinct from createdAt", async () => {
    const post = await makePost({ slug: "dated" });
    const issued = new Date("2024-02-08T00:00:00.000Z");
    await testDb.post.update({ where: { id: post.id }, data: { documentDate: issued } });

    const found = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(found.documentDate?.toISOString()).toBe(issued.toISOString());
    expect(found.documentDate?.getTime()).not.toBe(found.createdAt.getTime());
  });

  it("leaves documentDate null when no official date is known", async () => {
    const post = await makePost({ slug: "undated" });
    const found = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(found.documentDate).toBeNull();
  });

  it("defaults orderState to current", async () => {
    const post = await makePost({ slug: "state-default" });
    const found = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(found.orderState).toBe("current");
  });

  it("accepts each documentType enum value", async () => {
    const values = ["go", "circular", "memo", "proceeding", "notification", "other"] as const;
    for (const value of values) {
      const post = await makePost({ slug: `type-${value}` });
      const updated = await testDb.post.update({
        where: { id: post.id },
        data: { documentType: value },
      });
      expect(updated.documentType).toBe(value);
    }
  });

  it("accepts each orderState enum value", async () => {
    const values = ["current", "amended", "superseded", "archived"] as const;
    for (const value of values) {
      const post = await makePost({ slug: `state-${value}` });
      const updated = await testDb.post.update({
        where: { id: post.id },
        data: { orderState: value },
      });
      expect(updated.orderState).toBe(value);
    }
  });
});
