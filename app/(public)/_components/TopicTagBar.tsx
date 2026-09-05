"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const FEATURED_TOPICS = [
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
}

export default function TopicTagBar({ baseUrl = "/search" }: TopicTagBarProps) {
  const searchParams = useSearchParams();
  const currentTag = searchParams?.get("tag");

  return (
    <div className="space-y-2 font-sans">
      <div className="font-mono text-[11px] font-bold text-inkSoft uppercase tracking-wider flex items-center justify-between">
        <span>🏷️ ప్రసిద్ధ అంశాలు — Popular Teacher Topics</span>
        <span className="text-[10px] text-inkSoft/70">1-Click Filter</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FEATURED_TOPICS.map((topic) => {
          const isActive = currentTag?.toLowerCase() === topic.tag.toLowerCase();
          return (
            <Link
              key={topic.tag}
              href={`${baseUrl}?tag=${encodeURIComponent(topic.tag)}`}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shadow-2xs ${
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
