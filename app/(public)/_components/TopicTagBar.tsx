"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
// TERM-TOPICS-1: chips are exactly the approved §7 topics, in plan order,
// labelled Telugu-first. No hand-picked extras (MDM/Textbooks were dropped by
// founder decision; both stay reachable through search). The list lives in
// lib/terminology.ts — never export data from this client module for server use.
import { TOPIC_CHIPS } from "@/lib/terminology";

interface TopicTagBarProps {
  baseUrl?: string;
  /**
   * Tags a published post actually carries right now (lib/posts/query.ts's
   * tagsWithPublishedContent). A curated topic whose tag isn't in this list is
   * a chip that would land on "no matching documents" — UI_AUDIT.md
   * F30 — so it's dropped rather than shown as a dead end.
   */
  availableTags: string[];
}

export default function TopicTagBar({ baseUrl = "/search", availableTags }: TopicTagBarProps) {
  const searchParams = useSearchParams();
  const currentTag = searchParams?.get("tag");
  const topics = TOPIC_CHIPS.filter((topic) => availableTags.includes(topic.tag));

  if (topics.length === 0) return null;

  return (
    <div className="space-y-2 font-sans">
      <div className="text-xs font-bold text-inkSoft flex items-center justify-between">
        <span>ప్రసిద్ధ అంశాలు — Popular Teacher Topics</span>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/topics" className="text-xs text-tamarind hover:text-tamarindDark transition-colors">
            All topics <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-1">
        {topics.map((topic) => {
          const isActive = currentTag?.toLowerCase() === topic.tag.toLowerCase();
          return (
            <Link
              key={topic.tag}
              href={`${baseUrl}?tag=${encodeURIComponent(topic.tag)}`}
              // max-w-full, not shrink-0: the longest approved label (GPF, ZPPF & APGLI)
              // is wider than a 320px screen, so it wraps inside its chip instead
              // of pushing the page sideways (TERM-TOPICS-1, measured).
              className={`max-w-full text-xs font-semibold px-3 py-1.5 rounded-2xl border transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-tamarind text-white border-tamarindDark font-bold scale-105"
                  : "bg-paperRaised text-ink border-hair hover:border-tamarind hover:text-tamarind"
              }`}
            >
              <span>{topic.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
