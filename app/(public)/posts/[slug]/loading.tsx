import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * SLOP-STATES-1 (AI_SLOP_AUDIT.md A17).
 *
 * The last block here was `grid grid-cols-1 md:grid-cols-2 gap-4` holding two
 * cards — the exact shape of `PostNavCards` (Previous/Next Post), which
 * SLOP-REMOVE-1 deleted under A11. The skeleton went on reserving space for a
 * widget that no longer exists on any document, which is the clearest possible
 * case of A17's "do not create decorative placeholder cards for widgets that
 * should be removed". What follows the document body now is a single quiet link
 * back to its category.
 *
 * Measured against the rendered page: breadcrumb 24px, header block 490/319px,
 * At a Glance 508/342px, back link 61px.
 */
export default function PostDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading document"
      className="max-w-3xl mx-auto space-y-6 pb-24 font-sans"
    >
      <span className="sr-only">Loading document…</span>

      <Skeleton className="h-6 w-56" />

      {/* One bordered header — state strip, reference, title, Telugu title —
          which is what SLOP-DETAIL-1 (A09) collapsed three stacked panels into. */}
      <Skeleton className="h-[320px] lg:h-[220px] w-full rounded-2xl" />

      {/* At a Glance. It renders nothing at all when a document has no summary,
          abstract or links, so this stays deliberately shorter than the measured
          508px rather than reserving the largest case as if it were the norm. */}
      <Skeleton className="h-[180px] lg:h-[140px] w-full rounded-2xl" />

      <div className="space-y-3 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-3/4" />
      </div>

      <Skeleton className="h-11 w-56 rounded-xl" />
    </div>
  );
}
