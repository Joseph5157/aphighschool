// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

import { revalidatePostPaths } from "@/lib/posts/revalidate";

function paths() {
  return revalidatePath.mock.calls.map((c) => c[0]);
}

describe("revalidatePostPaths", () => {
  beforeEach(() => revalidatePath.mockReset());

  it("revalidates every public surface a post appears on", () => {
    revalidatePostPaths({ slug: "go-129-transfers", categorySlug: "govt-orders" });
    expect(paths()).toEqual(
      expect.arrayContaining([
        "/",
        "/orders",
        "/search",
        "/admin/posts",
        "/posts/go-129-transfers",
        "/category/govt-orders",
      ])
    );
  });

  it("skips the category path when the post has no category", () => {
    revalidatePostPaths({ slug: "loose-post", categorySlug: null });
    expect(paths()).not.toContain("/category/null");
    expect(paths()).toContain("/posts/loose-post");
  });

  it("revalidates the search index", () => {
    revalidatePostPaths({ slug: "x", categorySlug: null });
    expect(paths()).toContain("/search");
  });

  it("revalidates every detail page whose category count changed", () => {
    revalidatePostPaths(
      { slug: "new-order", categorySlug: "govt-orders" },
      { affectedPostSlugs: ["older-order", "new-order"] },
    );

    expect(paths()).toContain("/posts/new-order");
    expect(paths()).toContain("/posts/older-order");
    expect(paths().filter((path) => path === "/posts/new-order")).toHaveLength(1);
  });

  it("revalidates both category indexes when a published post moves", () => {
    revalidatePostPaths(
      { slug: "moved-order", categorySlug: "circulars" },
      { previousCategorySlug: "govt-orders" },
    );

    expect(paths()).toContain("/category/circulars");
    expect(paths()).toContain("/category/govt-orders");
  });
});
