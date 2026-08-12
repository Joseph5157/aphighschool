"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import Button from "@/app/(public)/_components/Button";

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

      if (activeFilter !== "All" && !post.tags?.includes(activeFilter)) {
        return false;
      }
      return true;
    });
  }, [posts, activeFilter]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Horizontal Scroll Filter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(["All", "Open", "Closed", "2026", "2025", ...availableTags]).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setVisibleCount(6);
              }}
              className="focus:outline-none"
            >
              <Badge
                variant={isActive ? "tamarind" : "neutral"}
                size="sm"
                shape="pill"
                className="cursor-pointer transition-all hover:border-ink/40"
              >
                {filter}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Structured Log Feed using Cards */}
      {filteredPosts.length === 0 ? (
        <Card className="p-8 text-center text-xs font-mono text-inkSoft">
          No documents found matching "{activeFilter}" filter.
        </Card>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => {
            const dateObj = new Date(post.createdAt);
            const formattedDate = dateObj.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            const isPast =
              post.statusBadge === "expired" ||
              (post.actionDeadline && new Date(post.actionDeadline) < new Date());

            return (
              <Card key={post.id} hoverable className="p-4 sm:p-5">
                <Link href={`/posts/${post.slug}`} className="group block space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap text-meta text-inkSoft">
                    <div className="flex items-center gap-2">
                      <Badge variant={isPast ? "neutral" : "success"} size="sm" dot>
                        {isPast ? "Closed" : "Active / Verified"}
                      </Badge>
                      {post.goReference && (
                        <span className="font-bold text-ink bg-hair/40 px-2 py-0.5 rounded">
                          {post.goReference}
                        </span>
                      )}
                    </div>
                    <span>{formattedDate}</span>
                  </div>

                  <h3 className="text-card-title text-ink group-hover:text-tamarind transition-colors">
                    {post.titleEn}
                  </h3>

                  <div className="text-telugu-body text-inkSoft/90">
                    {post.titleTe}
                  </div>

                  {post.summaryTe && post.summaryTe.length > 0 && (
                    <p className="text-telugu-body text-xs text-inkSoft/80 line-clamp-2 pt-1 border-t border-hair/40">
                      {post.summaryTe[0]}
                    </p>
                  )}
                </Link>
              </Card>
            );
          })}

          {visibleCount < filteredPosts.length && (
            <div className="pt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                Load More Documents ({filteredPosts.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
