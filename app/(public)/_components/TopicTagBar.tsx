"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const FEATURED_TOPICS = [
  { tag: "Transfers", label: " బదిలీలు (Transfers)", icon: "🔄" },
  { tag: "TET", label: "టెట్ (TET 2026)", icon: "📝" },
  { tag: "DSC", label: "డీఎస్సీ (DSC Recruitment)", icon: "🎓" },
  { tag: "PRC", label: "పీఆర్‌సీ (PRC & Pay)", icon: "💰" },
  { tag: "DA", label: "డీఏ అరియర్స్ (DA Arrears)", icon: "📈" },
  { tag: "Pension", label: "పెన్షన్ (Pensioners)", icon: "👵" },
  { tag: "MDM", label: "మధ్యాహ్న భోజనం (MDM)", icon: "🍲" },
  { tag: "Textbooks", label: "పాఠ్యపుస్తకాలు (Textbooks)", icon: "📚" },
];

interface TopicTagBarProps {
  baseUrl?: string;
  /**
   * Tags a published post actually carries right now (lib/posts/query.ts's
   * tagsWithPublishedContent). A curated topic whose tag isn't in this list is
   * a "1-Click Filter" that would land on "no matching documents" — UI_AUDIT.md
   * F30 — so it's dropped rather than shown as a dead end.
   */
  availableTags: string[];
}

export default function TopicTagBar({ baseUrl = "/search", availableTags }: TopicTagBarProps) {
  const searchParams = useSearchParams();
  const currentTag = searchParams?.get("tag");
  const topics = FEATURED_TOPICS.filter((topic) => availableTags.includes(topic.tag));

  if (topics.length === 0) return null;

  return (
    <div className="space-y-2 font-sans">
      <div className="font-mono text-xs font-bold text-inkSoft uppercase tracking-wider flex items-center justify-between">
        <span>🏷️ ప్రసిద్ధ అంశాలు — Popular Teacher Topics</span>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/topics" className="text-xs text-tamarind hover:text-tamarindDark transition-colors">
            All topics <span aria-hidden="true">→</span>
          </Link>
          <span className="text-xs text-inkSoft/70">1-Click Filter</span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {topics.map((topic) => {
          const isActive = currentTag?.toLowerCase() === topic.tag.toLowerCase();
          return (
            <Link
              key={topic.tag}
              href={`${baseUrl}?tag=${encodeURIComponent(topic.tag)}`}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-tamarind text-white border-tamarindDark font-bold scale-105"
                  : "bg-paperRaised text-ink border-hair hover:border-tamarind hover:text-tamarind"
              }`}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
