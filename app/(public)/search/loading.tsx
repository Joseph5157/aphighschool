import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * Covers only the initial navigation into `/search` (e.g. a nav link or a
 * bookmark). Once mounted, `SearchUI` owns its own debounced-query pending
 * state instead of re-triggering this — a full-page swap on every keystroke
 * would be worse than the missing affordance it replaces.
 *
 * SLOP-STATES-1 (AI_SLOP_AUDIT.md A17). The pill row here survives where the
 * category page's did not, and for a reason worth writing down: this one stands
 * for the document-type control (All · GO · Circular · Memo · Proceeding ·
 * Notification · Other), which renders on every visit. It is now seven, matching
 * the control, instead of six. The chips that *were* slop on this route — the
 * "Quick Searches" widget and the "Find by Task" grid — were removed by
 * SLOP-DETAIL-1 (A08) and were never in this skeleton.
 *
 * Measured: heading block 122/83px, type control 50/46px, recent rows 88/73px.
 */
export default function SearchLoading() {
  return (
    <div
      role="status"
      aria-label="Loading search"
      className="max-w-4xl mx-auto space-y-6 font-sans"
    >
      <span className="sr-only">Loading search…</span>

      <div className="border-b border-hair pb-4 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <Skeleton className="h-4 w-56 max-w-full lg:hidden" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />

      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] lg:h-[73px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
