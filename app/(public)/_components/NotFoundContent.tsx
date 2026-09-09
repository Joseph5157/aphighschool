import Link from "next/link";
import { buttonClassName } from "./Button";

/**
 * Shared by both not-found boundaries this program adds:
 *  - app/(public)/not-found.tsx — explicit notFound() calls from a removed/renamed
 *    post or category, rendered inside the full public shell (header, nav, footer)
 *    since it lives in the same route group as the layout that provides them.
 *  - app/not-found.tsx (root) — a genuinely unmatched URL (typo, stale bookmark),
 *    which Next.js resolves outside any route group, so it gets no automatic shell.
 *    That file wraps this in its own minimal standalone header instead.
 *
 * No component here assumes it is wrapped by the public layout, so it stays correct
 * in both places.
 */
export default function NotFoundContent() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-5">
      <h1 className="text-display text-ink">This page could not be found</h1>
      <div className="space-y-2">
        <p className="text-sm text-inkSoft">
          The order, circular, or page you were looking for may have been moved,
          archived, or the link may be outdated.
        </p>
        <p lang="te" className="font-telugu text-sm text-inkSoft">
          మీరు వెతుకుతున్న ఉత్తర్వు, సర్క్యులర్ లేదా పేజీ తరలించబడి ఉండవచ్చు, ఆర్కైవ్ చేయబడి
          ఉండవచ్చు, లేదా లింక్ పాతదిగా మారి ఉండవచ్చు.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <Link href="/" className={buttonClassName({ variant: "primary", size: "sm" })}>
          Go to Home
        </Link>
        <Link href="/orders" className={buttonClassName({ variant: "secondary", size: "sm" })}>
          Browse Orders &amp; Circulars
        </Link>
        <Link href="/search" className={buttonClassName({ variant: "outline", size: "sm" })}>
          Search the Portal
        </Link>
      </div>
    </div>
  );
}
