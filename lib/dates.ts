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

const YMD_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** `date`'s calendar date in Asia/Kolkata, as "YYYY-MM-DD". */
function ymdInIST(date: Date): string {
  return YMD_FORMATTER.format(date);
}

/** Today's calendar date in Asia/Kolkata, as "YYYY-MM-DD". */
export function todayInIST(): string {
  return ymdInIST(new Date());
}

/**
 * Whether `date`'s Asia/Kolkata calendar date is strictly after today's IST
 * calendar date. Deliberately NOT `date.getTime() > Date.now()`: that compares
 * against the UTC instant, so between 00:00 and 05:30 IST — when the UTC
 * calendar date is still "yesterday" — an admin picking today's date would be
 * wrongly rejected as future-dated. Comparing "YYYY-MM-DD" strings is safe
 * because both sides come from the same formatter.
 */
export function isAfterTodayIST(date: Date): boolean {
  return ymdInIST(date) > todayInIST();
}

/**
 * An action deadline's calendar date in Asia/Kolkata, as "YYYY-MM-DD".
 *
 * actionDeadline is an inclusive calendar date, not an instant. The admin form
 * and the scraper store a date-only value as 00:00 UTC (05:30 IST that day);
 * reading the stored instant in IST gives back the intended day for that form
 * and for one stored as IST midnight alike. Use this for the admin date input
 * too, so a re-saved post keeps its day.
 */
export function deadlineDateIST(deadline: Date | string): string {
  return ymdInIST(new Date(deadline));
}

/**
 * Whether an action deadline has passed: true only once the IST calendar day
 * AFTER the deadline has begun. A 30 Nov deadline stays open through
 * 23:59:59 IST on 30 Nov and closes at 00:00 IST on 1 Dec. Never compare the
 * stored instant with `now` directly — that closed posts at 05:30 IST on their
 * last day.
 */
export function isDeadlinePassed(deadline: Date | string, now: Date = new Date()): boolean {
  return deadlineDateIST(deadline) < ymdInIST(now);
}

/**
 * The first instant of today's Asia/Kolkata calendar day. This is suitable
 * for database queries over recorded action dates: a date on the current IST
 * day remains included until that day ends. `actionDeadline >= startOfTodayIST()`
 * is the query form of `!isDeadlinePassed(actionDeadline)`.
 */
export function startOfTodayIST(): Date {
  return new Date(`${todayInIST()}T00:00:00+05:30`);
}

/**
 * The calendar year (Asia/Kolkata) a post's official date falls in, for year
 * grouping/filtering. Pinned the same way formatDate() is pinned: getFullYear()
 * reads the browser's local time, so a document dated 01 Jan (stored as
 * UTC midnight) would bucket under the PREVIOUS year for any visitor west of
 * UTC. This never does.
 */
export function officialYear(post: DatedPost): number {
  return Number(ymdInIST(officialDate(post)).slice(0, 4));
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
