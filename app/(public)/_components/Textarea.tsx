import React, { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  mono?: boolean;
}

/**
 * Multi-line text input, matching Input.tsx exactly.
 *
 * Exists because the three `<textarea>` elements in the product were raw,
 * inheriting none of the form-control rules: no 16px mobile size (so iOS zoomed
 * on focus), and in one case `focus:outline-none` with only a border-colour
 * change behind it.
 *
 * Like Input, this must not set `outline-none` — focus comes from the single
 * treatment in globals.css (DESIGN_SYSTEM.md §6).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error = false, mono = false, ...props }, ref) => {
    const errorClass = error
      ? "border-kumkum focus:border-kumkum"
      : "border-hair focus:border-tamarind";
    const fontClass = mono ? "font-mono" : "font-sans";

    return (
      <textarea
        ref={ref}
        aria-invalid={error || undefined}
        // text-base on mobile prevents iOS Safari zooming on focus.
        className={`w-full bg-paperRaised border rounded-lg px-3 py-2 text-base sm:text-sm text-ink transition-colors duration-150 ${fontClass} ${errorClass} ${className}`}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
export default Textarea;
