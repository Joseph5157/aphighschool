import React from "react";

export type BadgeVariant =
  | "tamarind"
  | "turmeric"
  | "neutral"
  | "success"
  | "warning"
  | "dark";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "pill";

export type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  dot?: boolean;
  className?: string;
};

const VARIANT_MAP: Record<BadgeVariant, string> = {
  tamarind: "bg-tamarind/10 text-tamarind border-tamarind/20",
  turmeric: "bg-turmeric/20 text-turmericDeep border-turmeric/30",
  neutral: "bg-hair/60 text-inkSoft border-hair",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  dark: "bg-ink text-paperRaised border-ink",
};

const SIZE_MAP: Record<BadgeSize, string> = {
  sm: "text-[9px] px-2 py-0.5",
  md: "text-[10px] px-2.5 py-1",
  lg: "text-xs px-3 py-1.5",
};

const SHAPE_MAP: Record<BadgeShape, string> = {
  rounded: "rounded",
  pill: "rounded-full",
};

const DOT_COLOR_MAP: Record<BadgeVariant, string> = {
  tamarind: "bg-tamarind",
  turmeric: "bg-turmericDeep",
  neutral: "bg-inkSoft",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  dark: "bg-turmeric",
};

export default function Badge({
  children,
  variant = "tamarind",
  size = "sm",
  shape = "rounded",
  dot = false,
  className = "",
}: BadgeProps) {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.tamarind;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;
  const shapeClass = SHAPE_MAP[shape] || SHAPE_MAP.rounded;
  const dotColorClass = DOT_COLOR_MAP[variant] || DOT_COLOR_MAP.tamarind;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border ${variantClass} ${sizeClass} ${shapeClass} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`} />
      )}
      <span>{children}</span>
    </span>
  );
}
