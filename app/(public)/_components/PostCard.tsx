import Link from "next/link";
import type { DocType, OrderState } from "@prisma/client";
import Card from "./Card";
import Badge from "./Badge";
import GoirBadge from "./GoirBadge";
import DocumentDate from "./DocumentDate";
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
    notification: "tamarind",
    apply_link: "turmeric",
    hall_ticket: "turmeric",
    results: "tamarind",
    expired: "neutral",
  },
  fallbackVariant: "tamarind",
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
    documentType: DocType | null;
    orderState: OrderState;
    goReference?: string | null;
    sourceDept?: string | null;
    verifiedAgainstGoir: boolean;
    createdAt: Date;
    /** Required, not optional: `lib/dates.ts` decides Issued vs Added to portal
     * from its presence, and an absent field would silently read as null and
     * relabel a departmental issue date (DESIGN_SYSTEM.md §3.4). */
    documentDate: Date | null;
    category?: { nameEn: string; slug: string; color?: string | null; icon?: string | null } | null;
  };
};

export default function PostCard({ post }: PostCardProps) {
  const abbr = getCategoryAbbr(post.category?.nameEn, post.category?.slug);
  const pill = resolveLifecyclePill(post, RECRUITMENT);

  return (
    <Card hoverable className="p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4 transition-all">
      {/* Category Abbreviation Icon Block */}
      <div
        className="hidden sm:flex w-12 h-12 rounded-lg bg-paper border border-hair font-mono font-bold text-xs text-ink items-center justify-center flex-shrink-0 shadow-inner"
        style={
          post.category?.color
            ? {
                backgroundColor: `${post.category.color}15`,
                color: post.category.color,
                borderColor: `${post.category.color}30`,
              }
            : undefined
        }
      >
        {abbr}
      </div>

      {/* Main Details */}
      <div className="flex-1 min-w-0">
        {/*
          The date joined this row in SLOP-DENSITY-1. The homepage promoted its
          newest document to a HeroCard, and that card was the only place a date
          appeared on an index row — so removing the hero (AI_SLOP_AUDIT.md A01)
          would have taken "when was this issued" off the index entirely. It is
          one of the four questions PRODUCT.md says the product exists to answer,
          so it belongs on the row, not on a promoted card.
        */}
        <div className="flex items-center gap-x-2 gap-y-1 mb-1.5 flex-wrap text-meta text-inkSoft">
          <span
            className="sm:hidden inline-flex min-h-6 items-center rounded border border-hair bg-paper px-1.5 font-mono text-xs font-bold text-ink"
            style={post.category?.color ? { color: post.category.color } : undefined}
          >
            {abbr}
          </span>

          <Badge variant={pill.variant} size="sm" shape="pill">
            {pill.label}
          </Badge>

          {post.category && (
            <span className="font-sans font-semibold break-words">
              {post.category.nameEn}
            </span>
          )}

          {post.goReference && (
            <span className="font-mono tracking-wide break-words">
              {post.goReference}
            </span>
          )}

          <GoirBadge verified={post.verifiedAgainstGoir} />

          <DocumentDate post={post} className="font-mono text-inkSoft/90" />
        </div>

        <Link href={`/posts/${post.slug}`} className="group block">
          <h3 className="text-card-title text-ink group-hover:text-turmericDeep transition-colors line-clamp-2">
            {post.titleEn}
          </h3>
          <div lang="te" className="text-telugu-body text-inkSoft truncate mt-0.5">
            {post.titleTe}
          </div>
        </Link>

      </div>
    </Card>
  );
}
