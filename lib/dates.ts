export type DatedPost = {
  documentDate: Date | null;
  createdAt: Date;
};

/**
 * The date to sort and display by. documentDate is the date the department
 * issued the order; createdAt is only when it was added to this CMS. Falling
 * back is safe for ORDERING, but callers must use dateLabel() so the fallback
 * is never presented as an official publication date.
 */
export function officialDate(post: DatedPost): Date {
  return post.documentDate ?? post.createdAt;
}

export function dateLabel(post: DatedPost): "Issued" | "Added to portal" {
  return post.documentDate ? "Issued" : "Added to portal";
}

const FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatDate(date: Date): string {
  return FORMATTER.format(date);
}

/**
 * Prisma's `orderBy` cannot express COALESCE(documentDate, createdAt) — ordering
 * by documentDate with nulls last is NOT equivalent: it puts every dated row
 * ahead of every undated row, when the spec requires them interleaved by their
 * effective date. (E.g. a post added today with no documentDate must outrank a
 * 2019 GO, not sink beneath it.)
 *
 * So the Post table carries a real `effectiveDate` column, kept in sync with
 * COALESCE(documentDate, createdAt) by every write path that touches
 * documentDate (see app/actions/posts.ts). This is purely a sort/index helper —
 * display code must keep computing officialDate()/dateLabel() fresh from
 * documentDate/createdAt, never read effectiveDate directly, so a sync bug here
 * can never surface a false date, only a wrong sort position.
 */
export const ORDER_BY_OFFICIAL_DATE = { effectiveDate: "desc" } as const;
