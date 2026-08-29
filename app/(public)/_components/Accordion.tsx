"use client";

import React, { useState } from "react";
import Badge from "./Badge";

export type AccordionItemData = {
  id: string;
  titleEn: string;
  titleTe?: string;
  badge?: string;
  badgeVariant?: "tamarind" | "turmeric" | "neutral" | "success" | "warning" | "dark";
  content: React.ReactNode;
  defaultOpen?: boolean;
};

export type AccordionProps = {
  items: AccordionItemData[];
  allowMultiple?: boolean;
  className?: string;
};

// ---------------------------------------------------------------------------
// Shadcn-inspired Modular Accordion Primitives
// ---------------------------------------------------------------------------

export const AccordionRoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-3 ${className}`} {...props} />
  )
);
AccordionRoot.displayName = "AccordionRoot";

export const AccordionItemPrimitive = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-paperRaised border border-hair rounded-xl overflow-hidden transition-all duration-200 shadow-2xs hover:border-ink/20 ${className}`}
      {...props}
    />
  )
);
AccordionItemPrimitive.displayName = "AccordionItemPrimitive";

export interface AccordionTriggerPrimitiveProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
}

export const AccordionTriggerPrimitive = React.forwardRef<HTMLButtonElement, AccordionTriggerPrimitiveProps>(
  ({ children, isOpen, className = "", ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-expanded={isOpen}
      className={`w-full text-left p-4 flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind focus-visible:ring-inset hover:bg-hair/10 transition-colors ${className}`}
      {...props}
    >
      {children}
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
  )
);
AccordionTriggerPrimitive.displayName = "AccordionTriggerPrimitive";

export interface AccordionContentPrimitiveProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
}

export const AccordionContentPrimitive = React.forwardRef<HTMLDivElement, AccordionContentPrimitiveProps>(
  ({ children, isOpen, className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`grid transition-all duration-200 ease-in-out ${
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 overflow-hidden"
      } ${className}`}
      {...props}
    >
      <div className="overflow-hidden">
        <div className="p-4 pt-1 border-t border-hair/50 text-xs sm:text-sm text-inkSoft leading-relaxed space-y-2 font-sans">
          {children}
        </div>
      </div>
    </div>
  )
);
AccordionContentPrimitive.displayName = "AccordionContentPrimitive";

// ---------------------------------------------------------------------------
// High-Level Helper Component (100% Backward Compatible)
// ---------------------------------------------------------------------------

export function Accordion({ items, allowMultiple = true, className = "" }: AccordionProps) {
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
    <AccordionRoot className={className}>
      {items.map((item) => {
        const isOpen = !!openIds[item.id];
        return (
          <AccordionItemPrimitive key={item.id}>
            <AccordionTriggerPrimitive
              onClick={() => toggleItem(item.id)}
              isOpen={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-sm sm:text-base text-ink tracking-tight">
                    {item.titleEn}
                  </h3>
                  {item.badge && (
                    <Badge variant={item.badgeVariant || "tamarind"} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.titleTe && (
                  <div lang="te" className="font-telugu text-xs text-inkSoft font-medium">
                    {item.titleTe}
                  </div>
                )}
              </div>
            </AccordionTriggerPrimitive>

            <AccordionContentPrimitive
              id={`accordion-content-${item.id}`}
              isOpen={isOpen}
            >
              {item.content}
            </AccordionContentPrimitive>
          </AccordionItemPrimitive>
        );
      })}
    </AccordionRoot>
  );
}

export default Accordion;

