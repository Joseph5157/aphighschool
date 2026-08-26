import Link from "next/link";
import type { DocType, OrderState } from "@prisma/client";
import Badge from "./Badge";
import { officialDate, dateLabel, formatDate } from "@/lib/dates";
import { resolveLifecyclePill, type RecruitmentPill } from "./lifecyclePill";

// Only reached for documents that actually have an application lifecycle —
// see resolveLifecyclePill. Everything else shows its order state instead.
const RECRUITMENT: RecruitmentPill = {
  labels: {
    notification: "Notified",
    apply_link: "Apply open",
    hall_ticket: "Hall ticket",
    results: "Results",
    expired: "Expired",
  },
  variants: {
    notification: "turmeric",
    apply_link: "success",
    hall_ticket: "turmeric",
    results: "success",
    expired: "neutral",
  },
  fallbackVariant: "turmeric",
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
    documentType: DocType | null;
    orderState: OrderState;
    goReference?: string | null;
    sourceDept?: string | null;
    verifiedAgainstGoir: boolean;
    createdAt: Date;
    documentDate: Date | null;
    category?: { nameEn: string; slug: string; color?: string | null; icon?: string | null } | null;
    relatedFrom?: Array<{ relatedPost: { titleEn: string; goReference?: string | null } }>;
  };
};

export default function HeroCard({ post }: HeroPostProps) {
  const gradientFrom = post.category?.color || "var(--color-turmeric)";
  const pill = resolveLifecyclePill(post, RECRUITMENT);

  return (
    <div
      className="p-[2px] rounded-2xl mb-8 shadow-md"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, color-mix(in srgb, var(--color-turmeric) 33%, transparent), transparent)`,
      }}
    >
      <article className="bg-ink text-paper rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Background Accent Pill & Badges */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Badge variant={pill.variant} size="sm" shape="pill" dot>
            {pill.label}
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
                  : {
                      backgroundColor: "color-mix(in srgb, var(--color-paper) 20%, transparent)",
                      color: "var(--color-paper)",
                    }
              }
            >
              {post.category.nameEn}
            </span>
          )}

          {post.goReference && (
            <span className="font-mono text-[10px] text-paper/80 bg-paper/10 px-2 py-0.5 rounded border border-hair/20">
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
          <h2 className="text-display text-paper group-hover:text-turmeric transition-colors">
            {post.titleEn}
          </h2>
          <div className="text-telugu-title text-paperRaised/90 mt-1">
            {post.titleTe}
          </div>
        </Link>

        {/* Telugu Summary Bullets */}
        {post.summaryTe && post.summaryTe.length > 0 && (
          <div className="mt-4 pt-4 border-t border-hair/20 space-y-2 text-telugu-body text-paperRaised/80">
            {post.summaryTe.slice(0, 3).map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-turmeric font-bold mt-0.5">•</span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        )}

        {/* Date & Meta Footer */}
        <div className="mt-6 pt-4 border-t border-hair/20 flex items-center justify-between text-xs font-mono text-paper/60">
          <span>
            {dateLabel(post)} · {formatDate(officialDate(post))}
          </span>
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
