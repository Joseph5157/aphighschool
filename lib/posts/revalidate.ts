import { revalidatePath } from "next/cache";

export type RevalidateTarget = {
  slug: string;
  categorySlug: string | null;
};

/**
 * A post appears on the homepage feed, the orders index, its own detail page,
 * its category page, and the search index. Any create/update/delete must clear
 * all of them, or an hour-long ISR window will serve stale content.
 */
export function revalidatePostPaths(post: RevalidateTarget): void {
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/search");
  revalidatePath(`/posts/${post.slug}`);
  if (post.categorySlug) {
    revalidatePath(`/category/${post.categorySlug}`);
  }
}
