"use client";

import { useState } from "react";

export default function AdSlot() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div
      className="w-full h-[96px] min-h-[96px] bg-paperRaised/60 border border-dashed border-hair rounded-xl px-4 py-3 flex items-center justify-between gap-4 my-6 transition-all shadow-none"
      style={{ minHeight: "96px", height: "96px" }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-hair/50 text-inkSoft font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold">
          Sponsored
        </div>
        <div className="text-xs text-inkSoft font-mono">
          Advertisement Reserved Slot · 728x90 / Leaderboard Placement
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-inkSoft hover:text-kumkum text-xs font-mono p-1.5 rounded hover:bg-hair/30 transition-colors"
        title="Dismiss banner"
        aria-label="Close advertisement"
      >
        ✕
      </button>
    </div>
  );
}
