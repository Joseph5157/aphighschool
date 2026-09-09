import React from "react";

// Variants name the TOKEN, not a judgement. `success` and `warning` were
// removed in UI-SYSTEM-2 after their call sites moved to `tamarind` and
// `turmeric`: they duplicated those two while implying an assessment the
// product does not make — "GOIR Verified" is a statement of provenance, not a
// quality rating (DESIGN_SYSTEM.md §12.1). `dark` became `ink` for the same
// reason, and because it read as a dark-mode flag.
//
// `kumkum` was added in UI-SYSTEM-1 so `superseded` had somewhere to go; before
// it, an order a later order had replaced rendered in the same green family as
// one still in force.
export type BadgeVariant =
  | "tamarind"
  | "turmeric"
  | "kumkum"
  | "neutral"
  | "ink";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "pill";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  dot?: boolean;
}

const VARIANT_MAP: Record<BadgeVariant, string> = {
  tamarind: "bg-tamarind/10 text-tamarind border-tamarind/25",
  turmeric: "bg-turmeric/15 text-turmericDeep border-turmeric/30",
  kumkum: "bg-kumkum/10 text-kumkum border-kumkum/25",
  neutral: "bg-hair/50 text-inkSoft border-hair",
  ink: "bg-ink text-paperRaised border-ink",
};

// 12px is the floor (DESIGN_SYSTEM.md §1.2). `sm` was 9px and `md` 10px, and
// `sm` is the default variant used by most call sites.
const SIZE_MAP: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-[13px] px-3 py-1.5",
};

const SHAPE_MAP: Record<BadgeShape, string> = {
  rounded: "rounded",
  pill: "rounded-full",
};

const DOT_COLOR_MAP: Record<BadgeVariant, string> = {
  tamarind: "bg-tamarind",
  turmeric: "bg-turmericDeep",
  kumkum: "bg-kumkum",
  neutral: "bg-inkSoft",
  ink: "bg-turmeric",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "tamarind",
      size = "sm",
      shape = "rounded",
      dot = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.tamarind;
    const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;
    const shapeClass = SHAPE_MAP[shape] || SHAPE_MAP.rounded;
    const dotColorClass = DOT_COLOR_MAP[variant] || DOT_COLOR_MAP.tamarind;

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border ${variantClass} ${sizeClass} ${shapeClass} ${className}`}
        {...props}
      >
        {dot && (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`} />
        )}
        <span>{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";
export default Badge;

