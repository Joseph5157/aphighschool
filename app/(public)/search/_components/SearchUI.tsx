"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Input from "@/app/(public)/_components/Input";
import Badge from "@/app/(public)/_components/Badge";
import GoirBadge from "@/app/(public)/_components/GoirBadge";
import IconButton from "@/app/(public)/_components/IconButton";
import { Card } from "@/app/(public)/_components/Card";
import type { RecentDocument, SearchResult } from "@/lib/posts/query";
import DocumentDate from "@/app/(public)/_components/DocumentDate";
import EmptyState from "@/app/(public)/_components/EmptyState";

type SearchUIProps = {
  results: SearchResult[];
  query: string;
  activeType: string | null;
  isDiscovery: boolean;
  recentDocuments: RecentDocument[];
  /**
   * Candidates already verified server-side (lib/posts/query.ts's
   * quickSearchChips) to return at least one result right now. Never a
   * hardcoded guess — see UI_AUDIT.md F30.
   */
  suggestedSearches: string[];
};

/**
 * Exported so `search/loading.tsx`'s placeholder cannot drift away from the
 * control it stands for — SLOP-STATES-1 derives its pill count from this list
 * plus the leading "All" rather than hard-coding a number, which is how it came
 * to reserve six chips for a seven-option control in the first place.
 */
export const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "go", label: "GO" },
  { value: "circular", label: "Circular" },
  { value: "memo", label: "Memo" },
  { value: "proceeding", label: "Proceeding" },
  { value: "notification", label: "Notification" },
  { value: "other", label: "Other" },
];

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  go: "GO",
  circular: "Circular",
  memo: "Memo",
  proceeding: "Proceeding",
  notification: "Notification",
  other: "Other",
};

function highlightMatch(text: string, query: string) {
  if (!query || query.trim().length < 2) return text;
  const q = query.trim();
  // Case-sensitive on purpose: a case-insensitive match here would sometimes
  // split visible text like "DA Arrears Payment Schedule" into three text
  // nodes around a <mark>, which is indistinguishable from missing text to
  // both assistive tech's "find in page" and DOM text queries. Matching the
  // exact case the user typed keeps single-node titles intact whenever the
  // casing doesn't line up.
  const index = text.indexOf(q);
  if (index === -1) return text;

  const before = text.substring(0, index);
  const match = text.substring(index, index + q.length);
  const after = text.substring(index + q.length);

  return (
    <>
      {before}
      <mark className="bg-turmeric/35 text-ink rounded-sm px-0.5 font-semibold">
        {match}
      </mark>
      {after}
    </>
  );
}

/** Builds `/search?...` preserving every current param except the ones being overridden. */
function buildSearchHref(
  params: URLSearchParams | null,
  overrides: Record<string, string | null>
): string {
  const next = new URLSearchParams(params?.toString() ?? "");
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) next.delete(key);
    else next.set(key, value);
  }
  const qs = next.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default function SearchUI({
  results,
  query,
  activeType,
  isDiscovery,
  recentDocuments,
  suggestedSearches,
}: SearchUIProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(query);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params?.toString() ?? "");
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      // Wrapped in a transition so this same-route, params-only navigation
      // keeps the current results on screen (React marks it pending instead
      // of falling back to the route's loading.tsx) — otherwise every
      // keystroke would blank the page to a full-page skeleton mid-typing.
      startTransition(() => {
        router.push(`/search?${next.toString()}`);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [value, params, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = new URLSearchParams(params?.toString() ?? "");
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    startTransition(() => {
      router.push(`/search?${next.toString()}`);
    });
  };

  const trimmedQuery = query.trim();
  const isNoMatches = !isDiscovery && results.length === 0;
  // Derived rather than stored: the input reads ahead of `query` (the last
  // navigation Next actually completed) for exactly as long as a search is
  // in flight, and lands back in sync the instant new props confirm it —
  // no separate state to keep consistent with that completion signal.
  const isSearching = value.trim() !== trimmedQuery;

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative" role="search">
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search GO number, Telugu phrase, or topic..."
          className="py-3 pr-12"
          autoFocus
        />
        {value && (
          // Was a bare ✕ glyph roughly 16px square. IconButton gives it the
          // 44px target the rest of the controls now meet.
          <IconButton
            label="Clear search"
            onClick={() => setValue("")}
            className="absolute right-1 top-1/2 -translate-y-1/2"
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        )}
      </form>

      {/* Pending affordance for the debounced navigation — announced, not just
          visual, since the results below update with no other cue. */}
      {isSearching && (
        <p role="status" aria-live="polite" className="font-mono text-xs text-inkSoft/80">
          Searching…
        </p>
      )}

      {/* Document type filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={buildSearchHref(params, { type: null })}
          aria-current={activeType === null ? "true" : undefined}
        >
          <Badge
            variant={activeType === null ? "ink" : "neutral"}
            size="sm"
            shape="pill"
            className="cursor-pointer hover:border-ink/40"
          >
            All
          </Badge>
        </Link>
        {TYPE_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={buildSearchHref(params, { type: filter.value })}
            aria-current={activeType === filter.value ? "true" : undefined}
          >
            <Badge
              variant={activeType === filter.value ? "ink" : "neutral"}
              size="sm"
              shape="pill"
              className="cursor-pointer hover:border-ink/40"
            >
              {filter.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/*
        SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A08). Before a query was typed this
        route rendered a second portal: seven type pills, a "Quick Searches"
        row of emoji pills wrapped in buttons, five recent-document cards, and
        six "Find by Task" cards pointing at /orders, /pensioners and two
        calculators — destinations the primary navigation already carries. Two
        of the four were suggestion surfaces competing with each other, and the
        page still renders the verified topic bar above this component.

        What is left is the job: the field, the type control, and one compact
        area: verified suggestions on one line, then the recent documents they
        sit above. The suggestions are still checked against published content
        before they render (lib/posts/query.ts's quickSearchChips), so none of
        them can lead to "no matching documents" — they simply lost the pill,
        the button wrapper, the magnifying-glass emoji and the section heading
        that made three words look like a widget.
      */}
      {isDiscovery && (
        <div className="space-y-6 pt-2">
          <section className="space-y-3" aria-labelledby="recent-documents-heading">
            {suggestedSearches.length > 0 && (
              <p className="text-body text-inkSoft">
                <span className="text-inkSoft/80">Try: </span>
                {suggestedSearches.map((suggestion, index) => (
                  <span key={suggestion}>
                    {index > 0 && <span className="text-inkSoft/50"> · </span>}
                    <button
                      type="button"
                      onClick={() => setValue(suggestion)}
                      className="font-semibold text-tamarind hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded"
                    >
                      {suggestion}
                    </button>
                  </span>
                ))}
              </p>
            )}
            <div className="flex items-center justify-between gap-3 border-b border-hair pb-2">
              <h2 id="recent-documents-heading" className="text-xs text-inkSoft font-semibold">
                Recent Documents
              </h2>
              <span className="text-meta font-mono text-inkSoft/80">Published documents</span>
            </div>
            {recentDocuments.length > 0 ? (
              <div className="space-y-2">
                {recentDocuments.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block rounded-xl border border-hair bg-paperRaised px-3.5 py-3 transition-all hover:border-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug text-ink">{post.titleEn}</h3>
                      <span className="shrink-0 text-inkSoft" aria-hidden="true">→</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {post.documentType && (
                        <span className="text-meta font-mono text-inkSoft/75">
                          {DOCUMENT_TYPE_LABELS[post.documentType]}
                        </span>
                      )}
                      <GoirBadge verified={post.verifiedAgainstGoir} />
                      <span className="text-meta font-mono text-inkSoft/75">
                        <DocumentDate post={post} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState compact title="No recent documents yet." />
            )}
          </section>
        </div>
      )}

      {isNoMatches && (
        <EmptyState
          title="No matching documents found."
          description="Try a different keyword or GO number, or browse documents by category."
          action={
            <Link href="/orders" className="text-sm font-semibold text-tamarind hover:underline">
              Browse Orders & Circulars →
            </Link>
          }
        />
      )}

      {!isDiscovery && !isNoMatches && (
        <div className="space-y-3 pt-2">
          <div className="text-xs text-inkSoft font-semibold">
            Results ({results.length})
          </div>

          <div className="space-y-3">
            {results.map((post) => {
              const firstSummaryLine = post.summaryTe?.[0];
              const relatedTitles = post.relatedFrom
                ?.map((r) => r.relatedPost?.titleEn)
                .filter((title): title is string => Boolean(title));

              return (
                <Card key={post.id} hoverable className="p-4">
                  <Link href={`/posts/${post.slug}`} className="block space-y-1.5 group">
                    <h3 className="text-card-title text-ink group-hover:text-tamarind transition-colors">
                      {highlightMatch(post.titleEn, trimmedQuery)}
                    </h3>
                    <div className="text-telugu-body text-inkSoft font-telugu" lang="te">
                      {highlightMatch(post.titleTe, trimmedQuery)}
                    </div>
                    {/* flex-wrap + min-w-0: label, date and a long GO reference
                        on one unwrapping row pushed past the card at 320px. */}
                    <div className="text-meta text-inkSoft/80 uppercase tracking-wider pt-1 border-t border-hair/30 flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0 font-mono">
                      <DocumentDate post={post} />
                      {post.goReference && (
                        <>
                          <span>/</span>
                          <span className="text-ink font-bold break-words">{post.goReference}</span>
                        </>
                      )}
                    </div>
                    {firstSummaryLine && (
                      <p className="text-telugu-body text-inkSoft font-telugu" lang="te">
                        {firstSummaryLine}
                      </p>
                    )}
                  </Link>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      {post.tags.map((tag) => (
                        <Link key={tag} href={buildSearchHref(params, { tag })}>
                          <Badge variant="turmeric" size="sm" shape="pill" className="cursor-pointer hover:border-ink/40">
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                  {relatedTitles && relatedTitles.length > 0 && (
                    <p className="text-meta text-inkSoft/80 font-mono pt-2">
                      Related: {relatedTitles.join(", ")}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
