import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, mono = false, ...props }, ref) => {
    // No `outline-none`: it cancelled the global focus outline at equal
    // specificity, and the `focus:ring-*` meant to replace it set a ring colour
    // with no ring width, so nothing painted. Focus now comes from the one
    // treatment in globals.css (DESIGN_SYSTEM.md §6); the border colour change
    // is reinforcement, not the indicator.
    const errorClass = error
      ? "border-kumkum focus:border-kumkum"
      : "border-hair focus:border-tamarind";
    const fontClass = mono ? "font-mono tabular-nums" : "font-sans";

    return (
      <input
        ref={ref}
        aria-invalid={error || undefined}
        // text-base on mobile is a functional requirement, not a preference:
        // iOS Safari zooms the viewport when a focused control is under 16px.
        className={`w-full bg-paperRaised border rounded-lg px-3 py-2 min-h-[44px] text-base sm:text-sm text-ink transition-colors duration-150 ${fontClass} ${errorClass} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
