"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type PostItem = {
  id: string;
  slug: string;
  titleEn: string;
  titleTe: string;
  summaryTe: string[];
  englishAbstract?: string | null;
  statusBadge: string;
  goReference?: string | null;
  actionDeadline?: Date | string | null;
  createdAt: Date | string;
  tags: string[];
};

type CategoryLogListProps = {
  posts: PostItem[];
};

type FilterType = "All" | "Open" | "Closed" | "2026" | "2025";

export default function CategoryLogList({ posts }: CategoryLogListProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(6);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const now = new Date();
    return posts.filter((post) => {
      const postDate = new Date(post.createdAt);
      const postYear = postDate.getFullYear().toString();
      const isPast =
        post.statusBadge === "expired" ||
        (post.actionDeadline && new Date(post.actionDeadline) < now);

      if (activeFilter === "Open") return !isPast;
      if (activeFilter === "Closed") return isPast;
      if (activeFilter === "2026") return postYear === "2026";
      if (activeFilter === "2025") return postYear === "2025";
      
      // If activeFilter is a tag
      if (activeFilter !== "All" && !post.tags?.includes(activeFilter)) {
        return false;
      }
      return true;
    });
  }, [posts, activeFilter]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Horizontal Scroll Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(["All", "Open", "Closed", "2026", "2025", ...availableTags]).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setVisibleCount(6);
              }}
              className={`px-3 py-1.5 rounded-full font-mono text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-ink text-white shadow-xs"
                  : "bg-paperRaised border border-hair text-inkSoft hover:text-ink"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Stripe-Changelog Style Log Entries */}
      {filteredPosts.length === 0 ? (
        <div className="bg-paperRaised border border-hair rounded-xl p-8 text-center text-xs font-mono text-inkSoft">
          No documents found matching "{activeFilter}" filter.
        </div>
      ) : (
        <div className="border-b border-hair">
          {visiblePosts.map((post) => {
            const dateObj = new Date(post.createdAt);
            const dayNum = dateObj.getDate();
            const monthStr = dateObj
              .toLocaleDateString("en-IN", { month: "short" })
              .toUpperCase();
            const yearStr = dateObj.getFullYear();

            const isPast =
              post.statusBadge === "expired" ||
              (post.actionDeadline && new Date(post.actionDeadline) < new Date());

            const tagText = isPast ? "Closed" : post.goReference || "Open";
            const isTagOpen = !isPast;

            return (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="group border-t border-hair py-4 px-2 flex flex-col gap-2 hover:bg-paperRaised/60 transition-colors block"
              >
                {/* Right Body Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <div className="font-semibold text-[11.5px] text-ink group-hover:text-turmericDeep transition-colors truncate">
                      {post.titleEn}
                    </div>

                    <span
                      className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                        isTagOpen
                          ? "bg-[#FCEFDA] text-turmericDeep border border-turmeric/20"
                          : "bg-[#EDEAE0] text-[#8C877A] border border-hair"
                      }`}
                    >
                      {tagText}
                    </span>
                  </div>

                  {/* 2-line max summary */}
                  <div className="space-y-0.5">
                    {post.englishAbstract && (
                      <div className="text-[10.5px] text-inkSoft truncate font-sans">
                        {post.englishAbstract.substring(0, 100)}
                        {post.englishAbstract.length > 100 ? "..." : ""}
                      </div>
                    )}

                    {post.summaryTe && post.summaryTe[0] && (
                      <div className="font-telugu text-[10.5px] text-inkSoft/90 truncate">
                        {post.summaryTe[0]}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Load 6 More Button */}
      {visibleCount < filteredPosts.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="font-mono text-xs font-semibold text-turmericDeep border border-hair/60 bg-paperRaised px-5 py-2.5 rounded-lg hover:bg-paper transition-colors"
          >
            Load 6 More ↓
          </button>
        </div>
      )}
    </div>
  );
}
