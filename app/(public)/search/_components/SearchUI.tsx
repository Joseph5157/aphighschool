"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

import Input from "@/app/(public)/_components/Input";
import Badge from "@/app/(public)/_components/Badge";

type SearchPostItem = {
  id: string;
  slug: string;
  titleEn: string;
  titleTe: string;
  goReference?: string | null;
  docType?: string | null;
  category?: { nameEn: string } | null;
};

type SearchUIProps = {
  posts: SearchPostItem[];
};

const TRENDING_CHIPS = [
  "TET 2026",
  "CFMS status",
  "e-SR login",
  "PRC arrears",
  "SSC results",
];

function highlightMatch(text: string, query: string) {
  if (!query || query.trim().length < 2) return text;
  const q = query.trim();
  const index = text.toLowerCase().indexOf(q.toLowerCase());
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

export default function SearchUI({ posts }: SearchUIProps) {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const isQueryValid = trimmedQuery.length >= 2;

  const results = useMemo(() => {
    if (!isQueryValid) return [];
    const q = trimmedQuery.toLowerCase();
    return posts.filter((post) => {
      const inEn = post.titleEn.toLowerCase().includes(q);
      const inTe = post.titleTe.toLowerCase().includes(q);
      const inGo = post.goReference ? post.goReference.toLowerCase().includes(q) : false;
      const inCat = post.category ? post.category.nameEn.toLowerCase().includes(q) : false;
      return inEn || inTe || inGo || inCat;
    });
  }, [posts, trimmedQuery, isQueryValid]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search GO number, topic, or circular..."
          className="py-3"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-3.5 text-xs font-mono text-inkSoft hover:text-ink"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Trending / Assist Chips (Shown when input has < 2 chars) */}
      {!isQueryValid && (
        <div className="space-y-2 pt-2">
          <div className="font-mono text-[9.5px] uppercase tracking-wider text-inkSoft font-semibold">
            Trending & Quick Filters
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {TRENDING_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setQuery(chip)}
                className="bg-paperRaised border border-hair hover:border-ink/30 active:scale-[0.97] px-3.5 py-1.5 rounded-full text-xs text-ink font-medium transition-all hover:bg-paper shadow-2xs"
              >
                🔍 {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Section (Shown when query >= 2 chars) */}
      {isQueryValid && (
        <div className="space-y-3 pt-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-inkSoft flex items-center justify-between">
            <span>Results ({results.length})</span>
            <span className="text-[9px]">Press Esc to clear</span>
          </div>

          {results.length === 0 ? (
            <div className="bg-paperRaised border border-hair rounded-xl p-10 text-center text-sm font-mono text-inkSoft">
              No results found matching "{query}"
            </div>
          ) : (
            <div className="space-y-2.5">
              {results.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="block bg-paperRaised border border-hair hover:border-ink/30 active:scale-[0.99] rounded-xl p-4 transition-all group"
                >
                  <div className="font-bold text-sm text-ink group-hover:text-turmericDeep transition-colors">
                    {highlightMatch(post.titleEn, trimmedQuery)}
                  </div>
                  <div className="font-telugu text-xs text-inkSoft mt-0.5">
                    {post.titleTe}
                  </div>
                  <div className="font-mono text-[8.5px] text-[#9C9788] uppercase tracking-wider mt-2.5 flex items-center gap-2">
                    <span>AP SCHOOL EDUCATION</span>
                    <span>/</span>
                    <span>{post.docType || post.category?.nameEn || "GO CIRCULAR"}</span>
                    {post.goReference && (
                      <>
                        <span>/</span>
                        <span className="text-ink font-bold">
                          {highlightMatch(post.goReference, trimmedQuery)}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
