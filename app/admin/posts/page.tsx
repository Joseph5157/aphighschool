import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePost, publishPost } from "@/app/actions/posts";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  notification: "Notified",
  apply_link: "Apply Open",
  hall_ticket: "Hall Ticket",
  results: "Results",
  expired: "Expired",
};

const STATUS_COLOR: Record<string, string> = {
  notification: "bg-tamarind/10 text-tamarind",
  apply_link: "bg-turmeric/20 text-turmericDeep",
  hall_ticket: "bg-turmeric/20 text-turmericDeep",
  results: "bg-tamarind/10 text-tamarind",
  expired: "bg-hair/60 text-inkSoft",
};

export default async function PostsListPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-ink text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + New Post
        </Link>
      </div>

      {posts.length === 0 && (
        <p className="text-inkSoft text-sm">
          No posts yet. Run <code className="font-mono">npm run db:seed</code> for sample
          data, or create one directly.
        </p>
      )}

      <div className="space-y-2">
        {posts.map((post: (typeof posts)[number]) => (
          <div
            key={post.id}
            className="bg-paperRaised border border-hair rounded-xl p-4 flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {post.isDraft && (
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-bold bg-turmeric/20 text-turmericDeep border border-turmeric/30">
                    DRAFT
                  </span>
                )}
                <span
                  className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full font-semibold ${
                    STATUS_COLOR[post.statusBadge]
                  }`}
                >
                  {STATUS_LABEL[post.statusBadge]}
                </span>
                {post.goReference && (
                  <span className="font-mono text-[10px] text-inkSoft">{post.goReference}</span>
                )}
                {post.verifiedAgainstGoir && (
                  <span className="font-mono text-[10px] text-tamarind">✓ GOIR verified</span>
                )}
                {post.category && (
                  <span className="font-mono text-[10px] text-inkSoft">{post.category.nameEn}</span>
                )}
              </div>
              <div className="font-semibold text-sm truncate">{post.titleEn}</div>
              <div className="font-telugu text-xs text-inkSoft truncate">{post.titleTe}</div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {post.isDraft && (
                <form
                  action={async () => {
                    "use server";
                    await publishPost(post.id);
                  }}
                >
                  <button className="text-xs font-semibold text-tamarind bg-tamarind/10 hover:bg-tamarind/20 px-2.5 py-1 rounded">
                    Publish
                  </button>
                </form>
              )}
              <Link
                href={`/admin/posts/${post.id}`}
                className="text-xs font-semibold text-inkSoft hover:text-ink"
              >
                Edit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deletePost(post.id);
                }}
              >
                <button className="text-xs font-semibold text-kumkum">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

