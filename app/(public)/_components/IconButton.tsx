import React, { forwardRef } from "react";

export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /**
   * The accessible name. Required, and deliberately not optional: an icon-only
   * control with no name is announced as "button" and is unusable by screen
   * reader. `title` alone does not reliably supply one — several controls here
   * relied on it.
   */
  label: string;
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Adds a native tooltip. The accessible name still comes from `label`. */
  showTitle?: boolean;
}

const VARIANT_MAP: Record<IconButtonVariant, string> = {
  ghost: "text-inkSoft hover:text-ink hover:bg-hair/30",
  outline: "border border-hair bg-paperRaised text-ink hover:bg-hair/30 hover:border-ink/30",
  solid: "bg-ink text-paper hover:bg-ink/90",
};

// Both sizes clear the 44px touch floor (DESIGN_SYSTEM.md §8.1). `sm` paints a
// 36px box and reaches 44px through padding, so a compact control does not have
// to look oversized to be tappable.
const SIZE_MAP: Record<IconButtonSize, string> = {
  sm: "min-h-[44px] min-w-[44px] p-2.5 rounded-lg",
  md: "min-h-[44px] min-w-[44px] p-3 rounded-lg",
};

/**
 * An icon-only control.
 *
 * Exists because the five icon-only controls in the product (sidebar trigger,
 * theme toggle, search clear, dialog close, source link) each solved the same
 * three problems differently or not at all: accessible name, touch target, and
 * focus. The bare `✕` glyphs were roughly 16px and two had no name.
 *
 * Focus comes from the global treatment in globals.css; this component must not
 * set `outline-none`.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      icon,
      variant = "ghost",
      size = "sm",
      showTitle = false,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={showTitle ? label : undefined}
      className={`inline-flex items-center justify-center shrink-0 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_MAP[variant]} ${SIZE_MAP[size]} ${className}`}
      {...props}
    >
      <span aria-hidden="true" className="flex items-center justify-center">
        {icon}
      </span>
    </button>
  ),
);

IconButton.displayName = "IconButton";
export default IconButton;
