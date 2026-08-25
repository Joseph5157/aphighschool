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
 * Prisma cannot express COALESCE in orderBy, but ordering by documentDate with
 * nulls last and then by createdAt produces the same result: dated documents
 * sort by their official date, undated ones fall in behind by ingestion date.
 */
export const ORDER_BY_OFFICIAL_DATE = [
  { documentDate: { sort: "desc", nulls: "last" } },
  { createdAt: "desc" },
] as const;
