import React from "react";

/**
 * What the callout MEANS, not what colour it is.
 *
 * The same tinted-panel markup was hand-written in six places, each picking a
 * colour directly — so the palette was the API, and two panels saying the same
 * kind of thing could disagree while two saying different things matched. These
 * names map onto the semantic roles in docs/ui/DESIGN_SYSTEM.md §2.2; the
 * colours are an implementation detail of that mapping.
 */
export type CalloutTone = "note" | "guidance" | "positive" | "warning";

const TONE_MAP: Record<CalloutTone, string> = {
  note: "border-hair bg-hair/25 text-inkSoft",
  guidance: "border-turmeric/30 bg-turmeric/10 text-inkSoft",
  positive: "border-tamarind/30 bg-tamarind/10 text-tamarind",
  warning: "border-kumkum/30 bg-kumkum/10 text-kumkum",
};

export interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: CalloutTone;
  /** Optional heading. Callouts read fine without one. */
  title?: React.ReactNode;
  /**
   * Renders as `<aside>` when the content is genuinely tangential — a
   * disclaimer or a note beside the main flow — so it lands as a complementary
   * landmark rather than an anonymous div.
   */
  as?: "div" | "aside";
}

/**
 * A tinted panel carrying a short, self-contained piece of guidance.
 *
 * Not for status ON a document — that is Badge and OrderStateBadge, which carry
 * lifecycle meaning. A Callout is page furniture.
 */
export const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ tone = "note", title, as = "div", className = "", children, ...props }, ref) => {
    const Element = as;

    return (
      <Element
        ref={ref as never}
        className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${TONE_MAP[tone]} ${className}`}
        {...props}
      >
        {title && (
          <p className="mb-1 font-mono text-xs font-bold uppercase tracking-wider">
            {title}
          </p>
        )}
        {children}
      </Element>
    );
  },
);

Callout.displayName = "Callout";
export default Callout;
