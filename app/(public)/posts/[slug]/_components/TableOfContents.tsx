"use client";

import React, { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentSelector?: string;
}

/**
 * How many headings a document needs before it gets a table of contents.
 *
 * SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A10). The inspected document had two
 * sections and still got the full apparatus: a collapsible bordered widget on
 * mobile announcing "(2 sections)", a sticky desktop rail, generated ids, an
 * IntersectionObserver scroll-spy and an active state — interface ceremony for
 * a document a reader can take in by scrolling.
 *
 * Four is where the list stops being a restatement of what is already on screen
 * and starts being faster than scrolling. Long official orders — the ones with
 * numbered clauses and annexures, which are exactly the documents a TOC is for
 * — clear it easily, so the capability is intact where it earns its space.
 */
export const MIN_TOC_HEADINGS = 4;

export default function TableOfContents({ contentSelector = ".prose-gazette" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2, h3"));

    // Ids are assigned to every heading whatever the count, so a direct link to
    // a section keeps working on documents that render no TOC.
    const tocItems: TocItem[] = headings.map((heading, index) => {
      let id = heading.id;
      if (!id) {
        id = `section-${index + 1}`;
        heading.id = id;
      }
      return {
        id,
        text: heading.textContent || `Section ${index + 1}`,
        level: heading.tagName.toLowerCase() === "h2" ? 2 : 3,
      };
    });

    setItems(tocItems);

    // Below the threshold nothing renders, so the scroll-spy would observe
    // headings for an active state no one can see.
    if (tocItems.length < MIN_TOC_HEADINGS) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [contentSelector]);

  if (items.length < MIN_TOC_HEADINGS) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Collapsible Quick Jump Bar */}
      <div className="lg:hidden bg-paperRaised border border-hair rounded-lg p-3 my-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center justify-between font-mono text-xs font-bold text-tamarind"
        >
          <div className="flex items-center gap-2">
            <span>Page Index / విషయ సూచిక ({items.length} sections)</span>
          </div>
          {/* SLOP-VISUAL-1 (A03): this was the only disclosure control in the
              product drawn with ▲/▼ text glyphs. Accordion and SidebarCollapsible
              both use a rotating stroke chevron, so this one now does too —
              DESIGN_SYSTEM.md §13 wants inline SVG on currentColor, not a
              character whose shape and weight vary by platform font. */}
          <svg
            className={`w-4 h-4 shrink-0 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {mobileOpen && (
          <nav className="mt-3 pt-3 border-t border-hair/60 space-y-1.5 max-h-60 overflow-y-auto font-sans">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left text-xs py-1 px-2 rounded transition-colors ${
                  item.level === 3 ? "pl-5" : ""
                } ${
                  activeId === item.id
                    ? "bg-tamarind/15 text-tamarind font-bold"
                    : "text-inkSoft hover:bg-paper hover:text-ink"
                }`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar Navigation */}
      <nav aria-label="Table of contents" className="hidden lg:block sticky top-24 space-y-3 font-sans">
        <div className="text-xs font-bold text-inkSoft border-b border-hair pb-2 flex items-center gap-2">
          <span>Table of Contents</span>
        </div>

        <ul className="space-y-1 text-xs font-medium text-inkSoft max-h-[75vh] overflow-y-auto no-scrollbar">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left py-1 px-2.5 rounded transition-all line-clamp-2 ${
                  // SLOP-VISUAL-1 (A04): the 11px here was a second, redundant
                  // depth cue — `ml-3` already states the nesting — bought at the
                  // cost of dropping under the 12px floor (DESIGN_SYSTEM.md §1.2).
                  item.level === 3 ? "ml-3" : ""
                } ${
                  activeId === item.id
                    ? "bg-tamarind text-white font-bold translate-x-0.5"
                    : "hover:bg-paperRaised hover:text-ink"
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
