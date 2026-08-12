"use client";

import { useState } from "react";

export type AccordionItemData = {
  id: string;
  titleEn: string;
  titleTe?: string;
  badge?: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
};

export default function Accordion({ items, allowMultiple = true, className = "" }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.defaultOpen) {
        initial[item.id] = true;
      }
    });
    return initial;
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return { ...prev, [id]: !prev[id] };
      } else {
        return prev[id] ? {} : { [id]: true };
      }
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isOpen = !!openIds[item.id];
        return (
          <div
            key={item.id}
            className="bg-paperRaised border border-hair rounded-xl overflow-hidden transition-all duration-200 shadow-2xs hover:border-ink/20"
          >
            {/* Header / Trigger */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none focus:bg-hair/20 hover:bg-hair/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-ink tracking-tight">
                    {item.titleEn}
                  </h3>
                  {item.badge && (
                    <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold bg-tamarind/10 text-tamarind border border-tamarind/20">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.titleTe && (
                  <div className="font-telugu text-xs text-inkSoft font-medium">
                    {item.titleTe}
                  </div>
                )}
              </div>

              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-full bg-paper flex items-center justify-center border border-hair text-inkSoft shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-tamarind border-tamarind/30 bg-tamarind/5" : ""
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Content Container */}
            <div
              id={`accordion-content-${item.id}`}
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 overflow-hidden"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4 pt-1 border-t border-hair/50 text-xs sm:text-sm text-inkSoft leading-relaxed space-y-2 font-sans">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
