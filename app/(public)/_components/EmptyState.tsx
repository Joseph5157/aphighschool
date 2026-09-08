import React from "react";

/**
 * "There is genuinely nothing here" — not an error, not loading. The same
 * bordered, centered panel was hand-written at every call site (home feed,
 * category log, orders index, search) with slightly different markup each
 * time, so this collects it into one shape. `compact` fits inside a card or
 * grid cell where the full block would be too heavy (see OrdersFilterTabs).
 *
 * Not for a failed request — that is `app/(public)/error.tsx`. This is for a
 * request that succeeded and genuinely returned nothing.
 */
export interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`text-center ${
        compact
          ? "px-3 py-4"
          : "rounded-xl border border-hair bg-paperRaised p-8"
      } ${className}`}
    >
      <p className={`font-mono ${compact ? "text-xs" : "text-sm"} text-inkSoft`}>{title}</p>
      {description && (
        <p className="mt-1.5 text-xs leading-relaxed text-inkSoft/70">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export default EmptyState;
