/**
 * Some imported documents' `actionUrl`/`sourceUrl` still point at the
 * competitor site the content was originally copied from, rather than an
 * official government source or nothing at all — found in production data
 * for two posts pulled from the same import run, where no single official
 * page existed for the document type and the source article's own URL was
 * left in as a stand-in. A reader following "Open action link" or "Source
 * link" should never be sent to a rival product's page.
 *
 * This checks by hostname at render time, not just at data entry, so it
 * also covers rows already in the database and any future one that repeats
 * the same gap.
 */
const BLOCKED_LINK_HOSTS = ["apteachers.in", "amaravathiteacher.com"];

export function isCompetitorUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return false;
  }

  return BLOCKED_LINK_HOSTS.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`)
  );
}

export function dropCompetitorLink(url: string | null | undefined): string | null {
  return isCompetitorUrl(url) ? null : url ?? null;
}
