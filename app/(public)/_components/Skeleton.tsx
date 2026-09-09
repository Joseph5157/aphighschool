import React from "react";

/**
 * A single pulsing placeholder block. Compose shapes (bars, circles, cards)
 * by passing height/width/rounded utilities via className — see the route
 * `loading.tsx` files for real layouts. Purely decorative: the surrounding
 * `loading.tsx` carries the `role="status"` announcement, so every Skeleton
 * is hidden from assistive tech rather than read block by block.
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-hair/60 ${className}`}
      {...props}
    />
  ),
);

Skeleton.displayName = "Skeleton";
export default Skeleton;
