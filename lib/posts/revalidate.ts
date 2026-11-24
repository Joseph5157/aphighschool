import { revalidatePath } from "next/cache";

export type RevalidateTarget = {
  slug: string;
  categorySlug: string | null;
};

export type RevalidateContext = {
  /** Category a published post moved out of. */
  previousCategorySlug?: string | null;
  /** Other detail pages whose category document count changed. */
  affectedPostSlugs?: string[];
};

/**
 * A post appears on the homepage feed, the orders index, its own detail page,
 * its category page, and the search index. Any create/update/delete must clear
 * all of them, or an hour-long ISR window will serve stale content.
 */
export function revalidatePostPaths(
  post: RevalidateTarget,
  context: RevalidateContext = {},
): void {
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/search");

  for (const slug of new Set([post.slug, ...(context.affectedPostSlugs ?? [])])) {
    revalidatePath(`/posts/${slug}`);
  }

  for (const categorySlug of new Set([
    post.categorySlug,
    context.previousCategorySlug ?? null,
  ])) {
    if (categorySlug) revalidatePath(`/category/${categorySlug}`);
  }
}
