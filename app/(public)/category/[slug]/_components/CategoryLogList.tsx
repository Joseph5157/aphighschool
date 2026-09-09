"use client";

import { useState, useMemo, useRef, type KeyboardEvent } from "react";
import Link from "next/link";
import type { DocType, OrderState } from "@prisma/client";
import Badge from "@/app/(public)/_components/Badge";
import GoirBadge from "@/app/(public)/_components/GoirBadge";
import {
  resolveLifecyclePill,
  type RecruitmentPill,
} from "@/app/(public)/_components/lifecyclePill";
import { isLifecycleClosed } from "@/lib/posts/lifecycle";
import { officialYear } from "@/lib/dates";
import DocumentDate from "@/app/(public)/_components/DocumentDate";
import EmptyState from "@/app/(public)/_components/EmptyState";

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
    apply_link: "tamarind",
    hall_ticket: "turmeric",
    results: "tamarind",
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
  verifiedAgainstGoir?: boolean;
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
function officialYearOf(post: PostItem): number {
  return officialYear(normalizedDates(post));
}

// Stable id for the ARIA link between a filter's tab button and the
// tabpanel it controls — filters are user-facing labels (tags, years) so
// they may contain spaces/punctuation, hence the encode.
const filterTabId = (filter: string) => `filter-tab-${encodeURIComponent(filter)}`;

/**
 * One page of documents, and the step "Load More" adds.
 *
 * It is also the floor for showing filters at all — SLOP-DETAIL-1, see
 * AI_SLOP_AUDIT.md A07. Below it every document in the category is already
 * rendered on the page, so scanning the list is faster than operating a control
 * that hides part of it — the rendered Government Orders category had three
 * documents under eight filter pills. Above it the reader cannot see the whole
 * list at once, which is the point at which narrowing it starts to help.
 */
export const FILTER_MIN_DOCUMENTS = 10;

type Facet = {
  /** Also the visible label. */
  id: string;
  matches: (post: PostItem, now: Date) => boolean;
};

/**
 * Facets derived from the documents actually in this category.
 *
 * The single rule: **a facet is offered only if choosing it would change the
 * result set** — it must match at least one document and fewer than all of
 * them. That one test retires every hardcoded assumption at once. The fixed
 * `2026` / `2025` pills aged on their own and offered a year that might match
 * nothing; `Open` / `Closed` appeared even where every document was in force,
 * where one of them was the whole list and the other was empty; and a tag
 * carried by every document narrowed nothing.
 */
function deriveFacets(posts: PostItem[], now: Date): Facet[] {
  const total = posts.length;
  const meaningful = (count: number) => count > 0 && count < total;
  const facets: Facet[] = [];

  const closedCount = posts.filter((post) => isLifecycleClosed(post, now)).length;
  if (meaningful(closedCount)) {
    // Open/Closed reads the same lifecycle model as the pill rendered on the
    // row below — see isLifecycleClosed. Never reintroduce a local statusBadge
    // rule here: it made the filter contradict the pill.
    facets.push({ id: "Open", matches: (post, at) => !isLifecycleClosed(post, at) });
    facets.push({ id: "Closed", matches: (post, at) => isLifecycleClosed(post, at) });
  }

  const yearCounts = new Map<number, number>();
  for (const post of posts) {
    const year = officialYearOf(post);
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
  }
  for (const [year, count] of [...yearCounts.entries()].sort((a, b) => b[0] - a[0])) {
    if (meaningful(count)) {
      facets.push({ id: String(year), matches: (post) => officialYearOf(post) === year });
    }
  }

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
  for (const [tag, count] of [...tagCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (meaningful(count)) {
      facets.push({ id: tag, matches: (post) => Boolean(post.tags?.includes(tag)) });
    }
  }

  return facets;
}

export default function CategoryLogList({ posts }: CategoryLogListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(FILTER_MIN_DOCUMENTS);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // `now` is captured with the facets and reused when filtering, so both reads
  // of the lifecycle model happen at the same instant. That is what makes the
  // derivation rule a guarantee rather than an approximation: every facet on
  // screen matches at least one of these documents, so choosing one can never
  // produce an empty list, and the only empty state is an empty category.
  const { facets, now } = useMemo(() => {
    const at = new Date();
    return {
      now: at,
      facets: posts.length <= FILTER_MIN_DOCUMENTS ? [] : deriveFacets(posts, at),
    };
  }, [posts]);

  const showFilters = facets.length > 0;

  const filteredPosts = useMemo(() => {
    if (activeFilter === "All") return posts;
    const facet = facets.find((f) => f.id === activeFilter);
    if (!facet) return posts;
    return posts.filter((post) => facet.matches(post, now));
  }, [posts, facets, activeFilter, now]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const filters = showFilters ? ["All", ...facets.map((f) => f.id)] : [];

  const selectFilter = (filter: string) => {
    setActiveFilter(filter);
    setVisibleCount(FILTER_MIN_DOCUMENTS);
  };

  // Roving-tabindex arrow key navigation per the WAI-ARIA tabs pattern:
  // Left/Right (and Home/End) move focus AND activate, since this list has
  // no separate "confirm" step in the mouse interaction either.
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % filters.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + filters.length) % filters.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = filters.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    selectFilter(filters[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-6">
      {/* ── Filter Pills (ARIA tablist — filtering the log below) ──────────── */}
      {showFilters && (
      <div
        role="tablist"
        aria-label="Filter documents by status, year or topic"
        className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
      >
        {filters.map((filter, index) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={filterTabId(filter)}
              role="tab"
              aria-selected={isActive}
              aria-controls="category-log-tabpanel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectFilter(filter)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded-full shrink-0"
            >
              <span
                className={`inline-block font-mono text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? "bg-ink text-paper border-ink"
                    : "bg-paperRaised text-inkSoft border-hair hover:border-ink/30 hover:text-ink"
                }`}
              >
                {filter}
              </span>
            </button>
          );
        })}
      </div>
      )}

      <div
        id="category-log-tabpanel"
        {...(showFilters
          ? { role: "tabpanel" as const, "aria-labelledby": filterTabId(activeFilter) }
          : {})}
        className="space-y-6"
      >
      {/*
        The count only appears once a filter is narrowing the list. Unfiltered
        it repeated the category masthead's own document count two elements
        higher up, and "Newest first" repeated the masthead sentence that
        already says the list is sorted newest first (A07).
      */}
      {activeFilter !== "All" && (
        <div className="text-meta text-inkSoft/80">
          {filteredPosts.length} {filteredPosts.length === 1 ? "document" : "documents"}
          {` — filtered: ${activeFilter}`}
        </div>
      )}

      {/* ── Document Log Entries ─────────────────────────────────────────── */}
      {filteredPosts.length === 0 ? (
        <EmptyState title="No documents in this category yet." />
      ) : (
        <div className="space-y-3">
          {visiblePosts.map((post) => {
            const pill = resolveLifecyclePill(post, RECRUITMENT);

            return (
              <Link key={post.id} href={`/posts/${post.slug}`} className="block group">
                <div className="bg-paperRaised border border-hair/70 rounded-xl p-4 sm:p-5 hover:border-ink/30 hover:shadow-sm transition-all space-y-2">
                  {/* Row 1: Meta badges + date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={pill.variant} size="sm" dot>
                        {pill.label}
                      </Badge>
                      <GoirBadge verified={post.verifiedAgainstGoir} />
                      {post.goReference && (
                        <span className="font-mono text-[10px] font-bold text-ink bg-ink/10 px-2 py-0.5 rounded border border-ink/15 break-words">
                          {post.goReference}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-inkSoft/80 shrink-0">
                      <DocumentDate post={normalizedDates(post)} />
                    </span>
                  </div>

                  {/* Row 2: English title */}
                  <h3 className="font-bold text-sm text-ink group-hover:text-inkSoft transition-colors leading-snug">
                    {post.titleEn}
                  </h3>

                  {/* Row 3: Telugu title */}
                  {post.titleTe && (
                    <div
                      lang="te"
                      className="text-xs text-inkSoft/90"
                      style={{ fontFamily: "var(--font-noto-telugu), sans-serif", lineHeight: "1.65" }}
                    >
                      {post.titleTe}
                    </div>
                  )}

                  {/* Row 4: Summary snippet */}
                  {post.summaryTe && post.summaryTe.length > 0 && (
                    <p
                      lang="te"
                      className="text-xs text-inkSoft/80 line-clamp-1 pt-1.5 border-t border-hair/40"
                      style={{ fontFamily: "var(--font-noto-telugu), sans-serif", lineHeight: "1.6" }}
                    >
                      {post.summaryTe[0]}
                    </p>
                  )}

                  {/* Row 5: CTA arrow */}
                  <div className="flex justify-end">
                    <span className="font-mono text-[10px] text-ink/40 group-hover:text-turmericDeep transition-colors font-semibold">
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
                onClick={() => setVisibleCount((prev) => prev + FILTER_MIN_DOCUMENTS)}
                className="font-mono text-xs font-semibold text-ink border border-ink/30 bg-paperRaised hover:bg-ink hover:text-paper px-5 py-2.5 rounded-full transition-all"
              >
                Load More Documents ({filteredPosts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
