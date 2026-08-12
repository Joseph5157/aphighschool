"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Input from "@/app/(public)/_components/Input";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";

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
  "DA Arrears",
  "Mega DSC",
  "PRC arrears",
  "Transfers",
  "Form 16",
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
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get("q") || "" : "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (searchParams) {
      const qParam = searchParams.get("q");
      if (qParam !== null) {
        setQuery(qParam);
      }
    }
  }, [searchParams]);

  const trimmedQuery = query.trim();
  const isQueryValid = trimmedQuery.length >= 2;

  const results = useMemo(() => {
    if (!isQueryValid) return [];
    const q = trimmedQuery.toLowerCase();
    return posts.filter((post) => {
      const inEn = post.titleEn ? post.titleEn.toLowerCase().includes(q) : false;
      const inTe = post.titleTe ? post.titleTe.toLowerCase().includes(q) : false;
      const inGo = post.goReference ? post.goReference.toLowerCase().includes(q) : false;
      const inCat = post.category ? post.category.nameEn.toLowerCase().includes(q) : false;
      const inDoc = post.docType ? post.docType.toLowerCase().includes(q) : false;
      return inEn || inTe || inGo || inCat || inDoc;
    });
  }, [posts, trimmedQuery, isQueryValid]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search GO number, topic, or circular..."
          className="py-3 pr-10"
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
        <div className="space-y-2.5 pt-2">
          <div className="font-mono text-[9.5px] uppercase tracking-wider text-inkSoft font-semibold">
            Trending Search Topics
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {TRENDING_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setQuery(chip)}
                className="focus:outline-none"
              >
                <Badge variant="neutral" size="sm" shape="pill" className="cursor-pointer hover:border-ink/40">
                  🔍 {chip}
                </Badge>
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
            <Card className="p-8 text-center text-xs font-mono text-inkSoft">
              No results found matching "{query}"
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((post) => (
                <Card key={post.id} hoverable className="p-4">
                  <Link href={`/posts/${post.slug}`} className="block space-y-1.5 group">
                    <h3 className="text-card-title text-ink group-hover:text-tamarind transition-colors">
                      {highlightMatch(post.titleEn, trimmedQuery)}
                    </h3>
                    <div className="text-telugu-body text-inkSoft">
                      {post.titleTe}
                    </div>
                    <div className="text-meta text-inkSoft/70 uppercase tracking-wider pt-1 border-t border-hair/30 flex items-center gap-2">
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
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
