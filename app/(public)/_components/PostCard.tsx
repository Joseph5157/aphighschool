import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  notification: "Notified",
  apply_link: "Apply open",
  hall_ticket: "Hall ticket",
  results: "Results",
  expired: "Expired",
};

const STATUS_COLOR: Record<string, string> = {
  notification: "bg-tamarind/10 text-tamarind border border-tamarind/20",
  apply_link: "bg-turmeric/20 text-turmericDeep border border-turmeric/30",
  hall_ticket: "bg-turmeric/20 text-turmericDeep border border-turmeric/30",
  results: "bg-tamarind/10 text-tamarind border border-tamarind/20",
  expired: "bg-hair/60 text-inkSoft border border-hair",
};

function getCategoryAbbr(categoryName?: string | null, categorySlug?: string | null): string {
  if (categorySlug) {
    const parts = categorySlug.split("-").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 3).toUpperCase();
    return parts.map((p) => p[0]).join("").substring(0, 3).toUpperCase();
  }
  if (categoryName) {
    return categoryName.substring(0, 3).toUpperCase();
  }
  return "GO";
}

type PostCardProps = {
  post: {
    id: string;
    slug: string;
    titleEn: string;
    titleTe: string;
    statusBadge: string;
    goReference?: string | null;
    sourceDept?: string | null;
    verifiedAgainstGoir: boolean;
    createdAt: Date;
    category?: { nameEn: string; slug: string; color?: string | null; icon?: string | null } | null;
  };
};

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const abbr = getCategoryAbbr(post.category?.nameEn, post.category?.slug);

  return (
    <article className="bg-paperRaised border border-hair rounded-xl p-4 sm:p-5 flex items-start gap-4 transition-all active:scale-[0.99] hover:shadow-xs hover:border-ink/20">
      {/* Category Abbreviation Icon Block */}
      <div 
        className="w-12 h-12 rounded-lg bg-paper border border-hair font-mono font-bold text-xs text-ink flex items-center justify-center flex-shrink-0 shadow-inner"
        style={post.category?.color ? { 
          backgroundColor: `${post.category.color}15`, 
          color: post.category.color,
          borderColor: `${post.category.color}30`
        } : undefined}
      >
        {abbr}
      </div>

      {/* Main Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              STATUS_COLOR[post.statusBadge] || STATUS_COLOR.notification
            }`}
          >
            {STATUS_LABEL[post.statusBadge] || post.statusBadge}
          </span>

          {(post.category || post.goReference) && (
            <span className="font-mono text-[8.5px] text-inkSoft tracking-wide">
              {[post.category?.nameEn, post.goReference].filter(Boolean).join(" · ")}
            </span>
          )}

          {post.verifiedAgainstGoir && (
            <span className="font-mono text-[9px] text-tamarind font-medium">
              ✓ GOIR Verified
            </span>
          )}
        </div>

        <Link href={`/posts/${post.slug}`} className="group block">
          <h3 className="font-bold text-base text-ink group-hover:text-turmericDeep transition-colors line-clamp-2">
            {post.titleEn}
          </h3>
          <div className="font-telugu text-sm text-inkSoft truncate mt-0.5">
            {post.titleTe}
          </div>
        </Link>
      </div>
    </article>
  );
}
