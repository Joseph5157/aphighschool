"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Input from "@/app/(public)/_components/Input";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import { dateLabel, formatDate, officialDate } from "@/lib/dates";
import type { SearchResult } from "@/lib/posts/query";

type SearchUIProps = {
  results: SearchResult[];
  query: string;
  activeType: string | null;
};

const QUICK_SEARCH_CHIPS = [
  "TET 2026",
  "DA Arrears",
  "Mega DSC",
  "PRC arrears",
  "Transfers",
  "Form 16",
];

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "go", label: "GO" },
  { value: "circular", label: "Circular" },
  { value: "memo", label: "Memo" },
  { value: "proceeding", label: "Proceeding" },
  { value: "notification", label: "Notification" },
  { value: "other", label: "Other" },
];

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

export default function SearchUI({ results, query, activeType }: SearchUIProps) {
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
      router.push(`/search?${next.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [value, params, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = new URLSearchParams(params?.toString() ?? "");
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    router.push(`/search?${next.toString()}`);
  };

  const trimmedQuery = query.trim();
  const isEmptyPrompt = trimmedQuery === "" && results.length === 0;
  const isNoMatches = trimmedQuery !== "" && results.length === 0;

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative" role="search">
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search GO number, Telugu phrase, or topic..."
          className="py-3 pr-10"
          autoFocus
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-3.5 top-3.5 text-xs font-mono text-inkSoft hover:text-ink"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      {/* Document type filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={buildSearchHref(params, { type: null })}
          aria-current={activeType === null ? "true" : undefined}
        >
          <Badge
            variant={activeType === null ? "dark" : "neutral"}
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
              variant={activeType === filter.value ? "dark" : "neutral"}
              size="sm"
              shape="pill"
              className="cursor-pointer hover:border-ink/40"
            >
              {filter.label}
            </Badge>
          </Link>
        ))}
      </div>

      {isEmptyPrompt && (
        <div className="space-y-2.5 pt-2">
          <div className="font-mono text-[9.5px] uppercase tracking-wider text-inkSoft font-semibold">
            Quick Searches
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setValue(chip)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded-full"
              >
                <Badge variant="neutral" size="sm" shape="pill" className="cursor-pointer hover:border-ink/40">
                  🔍 {chip}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {isNoMatches && (
        <Card className="p-8 text-center text-body text-inkSoft">
          No documents match your search.
        </Card>
      )}

      {!isEmptyPrompt && !isNoMatches && (
        <div className="space-y-3 pt-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-inkSoft">
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
                    <div className="text-meta text-inkSoft/70 uppercase tracking-wider pt-1 border-t border-hair/30 flex items-center gap-2 font-mono">
                      <span>{dateLabel(post)}</span>
                      <span>{formatDate(officialDate(post))}</span>
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
                    <p className="text-meta text-inkSoft/70 font-mono pt-2">
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
