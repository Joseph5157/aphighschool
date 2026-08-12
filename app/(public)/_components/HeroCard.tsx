import Link from "next/link";
import Badge from "./Badge";

const STATUS_LABEL: Record<string, string> = {
  notification: "Notified",
  apply_link: "Apply open",
  hall_ticket: "Hall ticket",
  results: "Results",
  expired: "Expired",
};

const STATUS_VARIANT: Record<string, "tamarind" | "turmeric" | "neutral" | "success"> = {
  notification: "turmeric",
  apply_link: "success",
  hall_ticket: "turmeric",
  results: "success",
  expired: "neutral",
};

type HeroPostProps = {
  post: {
    id: string;
    slug: string;
    titleEn: string;
    titleTe: string;
    summaryTe: string[];
    englishAbstract?: string | null;
    statusBadge: string;
    goReference?: string | null;
    sourceDept?: string | null;
    verifiedAgainstGoir: boolean;
    createdAt: Date;
    category?: { nameEn: string; slug: string; color?: string | null; icon?: string | null } | null;
    relatedFrom?: Array<{ relatedPost: { titleEn: string; goReference?: string | null } }>;
  };
};

export default function HeroCard({ post }: HeroPostProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const gradientFrom = post.category?.color || "#C9973A";
  const gradientTo = "#C9973A"; // turmeric gold
  const badgeVariant = STATUS_VARIANT[post.statusBadge] || "turmeric";

  return (
    <div
      className="p-[2px] rounded-2xl mb-8 shadow-md"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo}55, transparent)`,
      }}
    >
      <article className="bg-ink text-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Background Accent Pill & Badges */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Badge variant={badgeVariant} size="sm" shape="pill" dot>
            {STATUS_LABEL[post.statusBadge] || post.statusBadge}
          </Badge>

          {post.category && (
            <span
              className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold"
              style={
                post.category.color
                  ? {
                      backgroundColor: `${post.category.color}30`,
                      color: post.category.color,
                      borderColor: `${post.category.color}50`,
                    }
                  : { backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }
              }
            >
              {post.category.nameEn}
            </span>
          )}

          {post.goReference && (
            <span className="font-mono text-[10px] text-paper/80 bg-paper/10 px-2 py-0.5 rounded border border-white/10">
              {post.goReference}
            </span>
          )}

          {post.verifiedAgainstGoir && (
            <Badge variant="success" size="sm" shape="pill" dot>
              GOIR Verified
            </Badge>
          )}
        </div>

        {/* Main Titles */}
        <Link href={`/posts/${post.slug}`} className="group block">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-turmeric transition-colors">
            {post.titleEn}
          </h2>
          <div className="font-telugu text-lg md:text-xl text-paperRaised/90 mt-1 font-medium leading-relaxed">
            {post.titleTe}
          </div>
        </Link>

        {/* Telugu Summary Bullets */}
        {post.summaryTe && post.summaryTe.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 font-telugu text-sm text-paperRaised/80 leading-relaxed">
            {post.summaryTe.slice(0, 3).map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-turmeric font-bold mt-0.5">•</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Date & Meta Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-paper/60">
          <span>{formattedDate}</span>
          <Link
            href={`/posts/${post.slug}`}
            className="text-turmeric hover:underline font-bold flex items-center gap-1"
          >
            <span>Read Summary</span>
            <span>→</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
