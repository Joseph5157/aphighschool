import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", className = "", ...props }, ref) => {
    if (orientation === "vertical") {
      return (
        <div
          ref={ref}
          className={`w-[1px] bg-hair self-stretch ${className}`}
          role="separator"
          aria-orientation="vertical"
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={`h-[1px] w-full bg-hair ${className}`}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
export default Separator;

