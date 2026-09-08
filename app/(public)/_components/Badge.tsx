import React from "react";

// `kumkum` is new in UI-SYSTEM-1. Without it `superseded` had nowhere to go and
// was mapped to `tamarind` — the green family — so an order that a later order
// had replaced rendered in the same colour as one still in force. See
// lifecyclePill.ts and docs/ui/DESIGN_SYSTEM.md §3.2.
//
// `success` and `warning` are retained as aliases of `tamarind` and `turmeric`
// so existing call sites keep working; UI-SYSTEM-2 migrates them. They no
// longer carry their own colours: they previously used raw `emerald-*` and
// `amber-*` from Tailwind's default palette, which AGENTS.md forbids and which
// never participated in the dark-mode flip — on the two most trust-bearing
// markers in the product, "GOIR Verified" and "Current".
export type BadgeVariant =
  | "tamarind"
  | "turmeric"
  | "kumkum"
  | "neutral"
  | "success"
  | "warning"
  | "dark";

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
  success: "bg-tamarind/10 text-tamarind border-tamarind/25",
  warning: "bg-turmeric/15 text-turmericDeep border-turmeric/30",
  dark: "bg-ink text-paperRaised border-ink",
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
  success: "bg-tamarind",
  warning: "bg-turmericDeep",
  dark: "bg-turmeric",
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

