import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  notification: "Notified",
  apply_link: "Apply open",
  hall_ticket: "Hall ticket",
  results: "Results",
  expired: "Expired",
};

const STATUS_COLOR: Record<string, string> = {
  notification: "bg-turmeric/20 text-turmeric border border-turmeric/30",
  apply_link: "bg-tamarind/30 text-emerald-300 border border-tamarind/40",
  hall_ticket: "bg-turmeric/20 text-turmeric border border-turmeric/30",
  results: "bg-tamarind/30 text-emerald-300 border border-tamarind/40",
  expired: "bg-hair/30 text-paper/60 border border-hair/40",
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

  return (
    <div
      className="p-[2px] rounded-2xl mb-8 shadow-md"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo}55, transparent)`,
      }}
    >
    <article 
      className="bg-ink text-white rounded-2xl p-6 md:p-8 relative overflow-hidden"
    >
      {/* Background Accent Pill */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className={`font-mono text-[10px] px-2.5 py-1 rounded-full font-semibold ${
            STATUS_COLOR[post.statusBadge] || STATUS_COLOR.notification
          }`}
        >
          {STATUS_LABEL[post.statusBadge] || post.statusBadge}
        </span>

        {post.category && (
          <span 
            className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold"
            style={post.category.color ? { 
              backgroundColor: `${post.category.color}30`, 
              color: post.category.color,
              borderColor: `${post.category.color}50`
            } : { backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
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
          <span className="font-mono text-[9px] text-emerald-400 flex items-center gap-1 font-medium">
            ✓ GOIR Verified
          </span>
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

      {/* Telugu Bullet Summary */}
      {post.summaryTe && post.summaryTe.length > 0 && (
        <ul className="font-telugu text-sm space-y-1.5 text-paper/90 mt-5 border-t border-white/10 pt-4 list-disc list-inside leading-relaxed">
          {post.summaryTe.map((bullet, idx) => (
            <li key={idx} className="pl-1">
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {/* English Abstract snippet if available */}
      {post.englishAbstract && (
        <div className="text-xs text-paper/70 mt-3 font-sans italic border-l-2 border-turmeric/50 pl-3">
          {post.englishAbstract}
        </div>
      )}

      {/* Related Orders Count if any */}
      {post.relatedFrom && post.relatedFrom.length > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono bg-paper/10 text-turmeric px-3 py-1 rounded-md">
          <span>🔗 {post.relatedFrom.length} Background Order(s) Linked</span>
        </div>
      )}

      {/* Footer / Metadata */}
      <div className="font-mono text-xs text-paper/60 mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div>{post.sourceDept || "School Education, AP"}</div>
        <div>Published {formattedDate}</div>
      </div>
    </article>
    </div>
  );
}
