import React, { forwardRef } from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Visible label text. Omit only when the control is labelled externally. */
  label?: React.ReactNode;
  /** Help text rendered under the label and linked via aria-describedby. */
  description?: React.ReactNode;
}

/**
 * A labelled checkbox.
 *
 * The two checkboxes in the product were raw `<input type="checkbox">` with no
 * styling, no sizing and no focus treatment — one of them the control that sets
 * `verifiedAgainstGoir`, which decides whether a document claims a recorded
 * GOIR check. A trust-bearing control should not be the least considered one on
 * the page.
 *
 * The wrapping `<label>` gives the input its accessible name and makes the text
 * part of the hit area, which is what lifts a 16px box to a usable target
 * without drawing a 44px checkbox.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;

    const control = (
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        aria-describedby={descriptionId}
        className="h-4 w-4 shrink-0 accent-tamarind cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
    );

    if (!label) return control;

    return (
      <div className={className}>
        <label
          htmlFor={inputId}
          className="flex min-h-[44px] items-center gap-2.5 text-sm text-ink cursor-pointer"
        >
          {control}
          <span>{label}</span>
        </label>
        {description && (
          <p id={descriptionId} className="pl-[26px] text-xs text-inkSoft leading-relaxed">
            {description}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
