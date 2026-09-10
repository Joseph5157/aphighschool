import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * SLOP-STATES-1 (AI_SLOP_AUDIT.md A17).
 *
 * This reserved six filter pills above the list. After SLOP-DETAIL-1 (A07) a
 * category renders a filter bar only when it holds more than
 * `FILTER_MIN_DOCUMENTS` documents *and* at least one facet would actually
 * narrow the list — no category in the dataset does — so the placeholder
 * promised a control that then never arrived, and paid for it in layout shift
 * every single time. A17's direction is explicit: do not draw placeholders for
 * widgets that should not be there.
 *
 * Heights are measured against the rendered page rather than guessed:
 * breadcrumb 24px, masthead 248/247px, log rows 232px at 390px and 177px at
 * 1440px, gazette footer 49/33px.
 */
export default function CategoryLoading() {
  return (
    <div
      role="status"
      aria-label="Loading category"
      className="max-w-5xl mx-auto space-y-7 pb-24 font-sans"
    >
      <span className="sr-only">Loading category…</span>

      <Skeleton className="h-6 w-40" />

      <Skeleton className="h-60 w-full rounded-2xl" />

      {/* Three rows covers the first viewport at 390x844 without reserving a
          whole page of documents the reader cannot see yet. */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[232px] lg:h-[177px] w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-8 w-full" />
    </div>
  );
}
