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
});
