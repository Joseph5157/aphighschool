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

export default function TableOfContents({ contentSelector = ".prose-gazette" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2, h3"));
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

    // ScrollSpy observer
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

  if (items.length === 0) return null;

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
          className="w-full flex items-center justify-between font-mono text-xs font-bold text-tamarind"
        >
          <div className="flex items-center gap-2">
            <span>📑 Page Index / విశయ సూచిక ({items.length} sections)</span>
          </div>
          <span>{mobileOpen ? "▲" : "▼"}</span>
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
        <div className="font-mono text-xs font-bold text-inkSoft uppercase tracking-wider border-b border-hair pb-2 flex items-center gap-2">
          <span>📑 Table of Contents</span>
        </div>

        <ul className="space-y-1 text-xs font-medium text-inkSoft max-h-[75vh] overflow-y-auto no-scrollbar">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left py-1 px-2.5 rounded transition-all line-clamp-2 ${
                  item.level === 3 ? "ml-3 text-[11px]" : ""
                } ${
                  activeId === item.id
                    ? "bg-tamarind text-white font-bold shadow-xs translate-x-0.5"
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
