const FALLBACK_SITE_URL = "http://localhost:3000";

export const SITE_NAME = "AP Teacher Desk";

/**
 * The one place `NEXT_PUBLIC_SITE_URL` is read for building absolute URLs
 * (metadataBase, JSON-LD `item` URLs, canonical links). UI_AUDIT.md F9: this
 * previously fell back to localhost silently in both `app/(public)/layout.tsx`
 * and `Breadcrumb.tsx` independently, with no signal if the real env var was
 * missing in a deployed environment. Still falls back for local dev — that's
 * correct there — but now says so loudly in production instead of silently
 * publishing localhost URLs into SEO metadata and structured data.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url && process.env.NODE_ENV === "production") {
    console.error(
      "[site] NEXT_PUBLIC_SITE_URL is not set in production — metadataBase, canonical " +
        "links, and BreadcrumbList JSON-LD will fall back to http://localhost:3000. " +
        "Set NEXT_PUBLIC_SITE_URL in the deployment environment."
    );
  }
  return url || FALLBACK_SITE_URL;
}
