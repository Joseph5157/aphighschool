import React, { forwardRef } from "react";

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ children, className = "", error = false, ...props }, ref) => {
    const errorClass = error ? "border-red-500 focus:border-red-600" : "border-hair focus:border-tamarind";

    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`w-full appearance-none bg-paperRaised border rounded-lg px-3 py-2 pr-8 text-xs sm:text-sm text-ink outline-none transition-all shadow-2xs font-sans cursor-pointer ${errorClass} ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-inkSoft">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

NativeSelect.displayName = "NativeSelect";
export default NativeSelect;
