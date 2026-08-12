import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, mono = false, ...props }, ref) => {
    const errorClass = error ? "border-red-500 focus:border-red-600 focus:ring-red-500/20" : "border-hair focus:border-tamarind focus:ring-tamarind/20";
    const fontClass = mono ? "font-mono tabular-nums" : "font-sans";

    return (
      <input
        ref={ref}
        className={`w-full bg-white border rounded-lg px-3 py-2 text-xs sm:text-sm text-ink outline-none transition-all shadow-2xs ${fontClass} ${errorClass} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
