import React from "react";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({ orientation = "horizontal", className = "" }: SeparatorProps) {
  if (orientation === "vertical") {
    return <div className={`w-[1px] bg-hair self-stretch ${className}`} role="separator" aria-orientation="vertical" />;
  }

  return <div className={`h-[1px] w-full bg-hair ${className}`} role="separator" aria-orientation="horizontal" />;
}

export default Separator;
