"use client";

import { useClaimBottomBar } from "@/app/(public)/_components/BottomBarSlot";

type ThumbZoneProps = {
  pdfUrl: string;
  sourceUrl?: string | null;
};

export default function ThumbZoneBar({ pdfUrl, sourceUrl }: ThumbZoneProps) {
  // Holds the route's single bottom-bar slot so BottomNav stands down instead
  // of stacking underneath this one (audit F1, DESIGN_SYSTEM.md §5.4).
  useClaimBottomBar();

  const scrollToPdf = () => {
    const el = document.getElementById("pdf-viewer-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.open(pdfUrl, "_blank");
    }
  };

  return (
    <aside
      aria-label="Document actions"
      // z-45 is the bottom-bar layer, below the drawer scrim at 50 — this was
      // z-50 and sat above the overlay meant to disable it. lg:hidden
      // (UI-ACCEPTANCE-1, found via real rendering at 1440px): this is a
      // mobile thumb-zone pattern, and unlike its sibling BottomNav it had no
      // desktop-hiding class, so it floated as a redundant strip on wide
      // layouts — ActionSummary already renders the same pdfUrl/sourceUrl
      // links inline in the page body at every width, so nothing is lost.
      className="fixed bottom-0 left-0 right-0 z-45 bg-paperRaised/95 backdrop-blur border-t border-hair p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-center gap-3 shadow-md lg:hidden"
    >
      <div className="max-w-xl w-full mx-auto flex items-center justify-between gap-3">
        {/* Primary Action Button */}
        <button
          onClick={scrollToPdf}
          className="flex-1 min-w-0 h-[48px] min-h-[48px] bg-ink hover:bg-inkSoft text-paper font-mono font-bold text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          {/* truncate + min-w-0: at 320px the label would otherwise push the
              secondary link off the right edge of the bar. */}
          <span className="truncate">View full order</span>
        </button>

        {/* Secondary Icon Button */}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] bg-paperRaised border border-hair rounded-xl flex items-center justify-center text-ink hover:text-turmericDeep hover:border-ink/30 transition-all shadow-sm"
            title="Open source link"
            aria-label="Open source link"
          >
            ↗
          </a>
        )}
      </div>
    </aside>
  );
}
