"use client";

import React, { useState, useMemo } from "react";
import PostCard from "./PostCard";
import EmptyState from "./EmptyState";
import { formatDate, officialDate } from "@/lib/dates";
import type { DocType, OrderState } from "@prisma/client";

export type FeedPost = {
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
  documentDate: Date | null;
  category?: { nameEn: string; slug: string; color?: string | null; icon?: string | null } | null;
};

type FilterDocType = "all" | "go" | "circular" | "memo" | "proceeding" | "notification";

const FILTER_OPTIONS: { id: FilterDocType; label: string; shortLabel: string }[] = [
  { id: "all", label: "All Updates", shortLabel: "All" },
  { id: "go", label: "Government Orders (GOs)", shortLabel: "GOs" },
  { id: "circular", label: "Circulars", shortLabel: "Circulars" },
  { id: "memo", label: "Memos", shortLabel: "Memos" },
  { id: "proceeding", label: "Proceedings", shortLabel: "Proceedings" },
  { id: "notification", label: "Notifications", shortLabel: "Notifications" },
];

export default function DateGroupedFeed({ posts }: { posts: FeedPost[] }) {
  const [selectedFilter, setSelectedFilter] = useState<FilterDocType>("all");

  const filteredPosts = useMemo(() => {
    if (selectedFilter === "all") return posts;
    return posts.filter((p) => {
      if (!p.documentType) return false;
      return p.documentType.toLowerCase() === selectedFilter.toLowerCase();
    });
  }, [posts, selectedFilter]);

  // Group filtered posts by Month/Year or exact Date string (IST)
  const groupedPosts = useMemo(() => {
    const groups: { dateGroupLabel: string; items: FeedPost[] }[] = [];
    const map = new Map<string, FeedPost[]>();

    for (const post of filteredPosts) {
      const dateObj = officialDate(post);
      // Format as Month Year (e.g. "October 2026"). Sentence case is easier
      // to scan than a tracked, all-caps data label on a narrow screen.
      const monthYear = new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(dateObj);

      if (!map.has(monthYear)) {
        map.set(monthYear, []);
      }
      map.get(monthYear)!.push(post);
    }

    map.forEach((items, dateGroupLabel) => {
      groups.push({ dateGroupLabel, items });
    });

    return groups;
  }, [filteredPosts]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Category & Document Type Pill Bar */}
      <div
        role="group"
        aria-label="Filter documents by type"
        className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-hair/50 pb-3 pt-0.5"
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = selectedFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              aria-pressed={isActive}
              aria-label={opt.label}
              className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-sans font-semibold transition-all whitespace-nowrap border shrink-0 ${
                isActive
                  ? "bg-masthead text-turmeric border-mastheadText/40 shadow-sm font-semibold"
                  : "bg-paperRaised text-inkSoft hover:text-ink hover:bg-paper border-hair"
              }`}
            >
              <span className="sm:hidden">{opt.shortLabel}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date-Grouped Timeline Stream */}
      {groupedPosts.length > 0 ? (
        <div className="space-y-4 sm:space-y-6 relative">
          {/* Subtle Vertical Timeline Hairline (Desktop Stream) */}
          <div className="hidden sm:block absolute left-3.5 top-3 bottom-3 w-px bg-hair/60 -z-10" />

          {groupedPosts.map((group) => (
            <section key={group.dateGroupLabel} className="space-y-2 sm:space-y-3">
              {/* Compact timeline date header */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-paperRaised border border-hair flex items-center justify-center font-mono text-xs font-bold text-tamarind shrink-0">
                  ◆
                </div>
                <div className="font-sans text-sm font-bold tracking-tight text-inkSoft bg-paper pr-2">
                  {group.dateGroupLabel}
                </div>
                <div className="flex-1 h-px bg-hair/40" />
              </div>

              {/* Document Rows under this Date Group */}
              <div className="space-y-2.5 sm:space-y-3 pl-0 sm:pl-7">
                {group.items.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No published orders found." />
      )}
    </div>
  );
}


