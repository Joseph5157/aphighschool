import React from "react";
import { dateLabel, formatDate, officialDate, type DatedPost } from "@/lib/dates";

export interface DocumentDateProps extends React.HTMLAttributes<HTMLSpanElement> {
  post: DatedPost;
  /** Separator between the label and the date. */
  separator?: string;
}

/**
 * A document's date, always with the label that says which date it is.
 *
 * `lib/dates.ts` draws the distinction the product's credibility rests on:
 * **Issued** is a fact about the department, **Added to portal** is a fact about
 * us, and the second must never be presented as the first. `dateLabel()`
 * enforces it in data; this enforces it in the interface
 * (docs/ui/DESIGN_SYSTEM.md §3.4).
 *
 * Ten call sites re-assembled `{dateLabel(post)} · {formatDate(officialDate(post))}`
 * by hand. Any one of them could have dropped the label and rendered a bare
 * date that reads as an issue date — the exact misrepresentation FRESHNESS-1
 * closed. Here the two cannot be separated: there is no prop that renders the
 * date without its label.
 *
 * The pair is also wrapped in one element so a flex row cannot wrap between
 * them, which would leave "Added to portal" stranded above an unrelated date.
 */
export function DocumentDate({
  post,
  separator = " · ",
  className = "",
  ...props
}: DocumentDateProps) {
  return (
    <span className={`whitespace-nowrap ${className}`} {...props}>
      {dateLabel(post)}
      {separator}
      {formatDate(officialDate(post))}
    </span>
  );
}

export default DocumentDate;
