"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { DocType, OrderState } from "@prisma/client";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import Button from "@/app/(public)/_components/Button";
import {
  resolveLifecyclePill,
  type RecruitmentPill,
} from "@/app/(public)/_components/lifecyclePill";
import { isLifecycleClosed } from "@/lib/posts/lifecycle";
import { officialDate, dateLabel, formatDate, officialYear } from "@/lib/dates";

// Only reached for documents that actually have an application lifecycle —
// see resolveLifecyclePill. Everything else shows its order state instead.
// This log uses Title Case where the homepage cards use sentence case.
const RECRUITMENT: RecruitmentPill = {
  labels: {
    notification: "Notified",
    apply_link: "Apply Open",
    hall_ticket: "Hall Ticket",
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
  fallbackVariant: "neutral",
};

type PostItem = {
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
  actionDeadline?: Date | string | null;
  createdAt: Date | string;
  documentDate: Date | string | null;
  tags: string[];
};

type CategoryLogListProps = {
  posts: PostItem[];
};

// PostItem's date fields can arrive as Date or string depending on the RSC
// serialization boundary — normalize before handing them to lib/dates.ts.
function normalizedDates(post: PostItem) {
  return {
    documentDate: post.documentDate ? new Date(post.documentDate) : null,
    createdAt: new Date(post.createdAt),
  };
}

// Named after officialDate()/officialYear(), which is what this computes —
// never rename to reference the DB's `effectiveDate` column: this reads
// documentDate/createdAt directly and must never be confused with, or swapped
// for, that column (a sort-helper only — see lib/dates.ts).
function officialDateOf(post: PostItem): Date {
  return officialDate(normalizedDates(post));
}

function dateLabelOf(post: PostItem) {
  return dateLabel(normalizedDates(post));
}

function officialYearOf(post: PostItem): number {
  return officialYear(normalizedDates(post));
}

export default function CategoryLogList({ posts }: CategoryLogListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(10);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => post.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const now = new Date();
    return posts.filter((post) => {
      const postYear = officialYearOf(post).toString();
      // Open/Closed reads the same lifecycle model as the pill rendered on the
      // row below — see isLifecycleClosed. Never reintroduce a local
      // statusBadge rule here: it made the filter contradict the pill.
      const isClosed = isLifecycleClosed(post, now);

      if (activeFilter === "Open") return !isClosed;
      if (activeFilter === "Closed") return isClosed;
      if (activeFilter === "2026") return postYear === "2026";
      if (activeFilter === "2025") return postYear === "2025";
      if (activeFilter !== "All" && !post.tags?.includes(activeFilter)) return false;
      return true;
    });
  }, [posts, activeFilter]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* ── Filter Pills ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(["All", "Open", "Closed", "2026", "2025", ...availableTags]).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setVisibleCount(10);
              }}
              className="focus:outline-none shrink-0"
            >
              <span
                className={`inline-block font-mono text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1B2A4A] text-white border-[#1B2A4A]"
                    : "bg-[#FAF7F2] text-inkSoft border-hair hover:border-[#1B2A4A]/30 hover:text-ink"
                }`}
              >
                {filter}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-meta text-inkSoft/70">
        <span>
          {filteredPosts.length} {filteredPosts.length === 1 ? "document" : "documents"}
          {activeFilter !== "All" && ` — filtered: ${activeFilter}`}
        </span>
        <span className="font-mono text-[10px] text-inkSoft/50">Newest first</span>
      </div>

      {/* ── Document Log Entries ─────────────────────────────────────────── */}
      {filteredPosts.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-hair rounded-xl p-8 text-center">
          <p className="font-mono text-xs text-inkSoft">
            No documents found for &ldquo;{activeFilter}&rdquo; filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visiblePosts.map((post) => {
            const pill = resolveLifecyclePill(post, RECRUITMENT);

            return (
              <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
                <div className="bg-[#FAF7F2] border border-hair/70 rounded-xl p-4 sm:p-5 hover:border-[#1B2A4A]/30 hover:shadow-sm transition-all space-y-2">
                  {/* Row 1: Meta badges + date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={pill.variant} size="sm" dot>
                        {pill.label}
                      </Badge>
                      {post.goReference && (
                        <span className="font-mono text-[10px] font-bold text-[#1B2A4A] bg-[#1B2A4A]/10 px-2 py-0.5 rounded border border-[#1B2A4A]/15">
                          {post.goReference}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-inkSoft/70 shrink-0">
                      {dateLabelOf(post)} · {formatDate(officialDateOf(post))}
                    </span>
                  </div>

                  {/* Row 2: English title */}
                  <h3 className="font-bold text-sm text-ink group-hover:text-[#1B2A4A] transition-colors leading-snug">
                    {post.titleEn}
                  </h3>

                  {/* Row 3: Telugu title */}
                  {post.titleTe && (
                    <div
                      className="text-xs text-inkSoft/90"
                      style={{ fontFamily: "'Noto Sans Telugu', sans-serif", lineHeight: "1.65" }}
                    >
                      {post.titleTe}
                    </div>
                  )}

                  {/* Row 4: Summary snippet */}
                  {post.summaryTe && post.summaryTe.length > 0 && (
                    <p
                      className="text-xs text-inkSoft/70 line-clamp-1 pt-1.5 border-t border-hair/40"
                      style={{ fontFamily: "'Noto Sans Telugu', sans-serif", lineHeight: "1.6" }}
                    >
                      {post.summaryTe[0]}
                    </p>
                  )}

                  {/* Row 5: CTA arrow */}
                  <div className="flex justify-end">
                    <span className="font-mono text-[10px] text-[#1B2A4A]/40 group-hover:text-amber-600 transition-colors font-semibold">
                      Read Full Order →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {visibleCount < filteredPosts.length && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="font-mono text-xs font-semibold text-[#1B2A4A] border border-[#1B2A4A]/30 bg-[#FAF7F2] hover:bg-[#1B2A4A] hover:text-white px-5 py-2.5 rounded-full transition-all"
              >
                Load More Documents ({filteredPosts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
