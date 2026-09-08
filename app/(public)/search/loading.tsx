import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * Covers only the initial navigation into `/search` (e.g. a nav link or a
 * bookmark). Once mounted, `SearchUI` owns its own debounced-query pending
 * state instead of re-triggering this — a full-page swap on every keystroke
 * would be worse than the missing affordance it replaces.
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
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />

      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
