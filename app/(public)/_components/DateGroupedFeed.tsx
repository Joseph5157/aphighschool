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

const FILTER_OPTIONS: { id: FilterDocType; label: string }[] = [
  { id: "all", label: "All Documents" },
  { id: "go", label: "Government Orders (GOs)" },
  { id: "circular", label: "Circulars" },
  { id: "memo", label: "Memos" },
  { id: "proceeding", label: "Proceedings" },
  { id: "notification", label: "Notifications" },
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
      // Format as Month Year (e.g. "OCTOBER 2026") or Date
      const monthYear = new Intl.DateTimeFormat("en-IN", {
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
        .format(dateObj)
        .toUpperCase();

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
    <div className="space-y-6">
      {/* Category & Document Type Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-hair/50 pt-1">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = selectedFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all whitespace-nowrap border shrink-0 ${
                isActive
                  ? "bg-masthead text-turmeric border-mastheadText/40 shadow-sm font-semibold"
                  : "bg-paperRaised text-inkSoft hover:text-ink hover:bg-paper border-hair"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Date-Grouped Timeline Stream */}
      {groupedPosts.length > 0 ? (
        <div className="space-y-6 relative">
          {/* Subtle Vertical Timeline Hairline (Desktop Stream) */}
          <div className="hidden sm:block absolute left-3.5 top-3 bottom-3 w-px bg-hair/60 -z-10" />

          {groupedPosts.map((group) => (
            <section key={group.dateGroupLabel} className="space-y-3">
              {/* Monospace Timeline Date Header */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-paperRaised border border-hair flex items-center justify-center font-mono text-xs font-bold text-tamarind shrink-0">
                  ◆
                </div>
                <div className="font-mono text-xs font-semibold tracking-wider text-inkSoft uppercase bg-paper pr-2">
                  {group.dateGroupLabel}
                </div>
                <div className="flex-1 h-px bg-hair/40" />
              </div>

              {/* Document Rows under this Date Group */}
              <div className="space-y-3 pl-0 sm:pl-7">
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


