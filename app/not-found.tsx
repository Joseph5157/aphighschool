import Link from "next/link";
import type { Metadata } from "next";
import NotFoundContent from "./(public)/_components/NotFoundContent";

export const metadata: Metadata = {
  title: "Page Not Found — AP Teacher Desk",
  robots: { index: false, follow: true },
};

/**
 * Root-level boundary: Next.js resolves a genuinely unmatched URL (a typo, a
 * stale bookmark — nothing under app/(public) matched it at all) here, outside
 * any route group, so app/(public)/layout.tsx's header/nav/footer never wrap
 * it. A minimal standalone header stands in so this doesn't read as a broken,
 * unbranded page — app/(public)/not-found.tsx (the far more common case, an
 * explicit notFound() for a removed/renamed post or category) already gets
 * the real one automatically and does not need this.
 */
export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <header className="bg-masthead text-mastheadText border-b border-mastheadText/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-masthead text-turmeric font-mono font-bold flex items-center justify-center border border-mastheadText/30 shadow-sm">
              AP
            </div>
            <span className="font-bold text-sm tracking-tight">AP Teacher Desk</span>
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        <NotFoundContent />
      </main>
    </div>
  );
}
