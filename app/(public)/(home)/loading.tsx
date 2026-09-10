import DesktopLeftNav from "@/app/(public)/_components/DesktopLeftNav";
import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * SLOP-STATES-1 (AI_SLOP_AUDIT.md A17) finishes what SLOP-DENSITY-1 started
 * here. The shape was already right — no hero block, no right rail, one list of
 * document rows — but the rows were `h-28` (112px) against real rows measured at
 * 172–187px on a 390px viewport and 124px at 1440px. A skeleton that is 60px per
 * row short of the content is still reserving the wrong page; it just fails less
 * obviously than reserving the wrong widgets.
 *
 * Four rows, because three is what actually fits the first viewport at 390x844
 * (SLOP-DENSITY-1's measured acceptance) and reserving the whole list would push
 * grey blocks far below the fold.
 */
export default function HomeLoading() {
  return (
    <div
      role="status"
      aria-label="Loading latest orders"
      // HOME-POLISH-1: matches page.tsx's container — no `space-y-8`. The rail
      // column is always empty below `lg` (DesktopLeftNav is `hidden lg:block`),
      // and margin from `space-y-*` lands on the feed column regardless of
      // whether the preceding sibling renders anything, so it produced a dead
      // ~32px gap above this skeleton's heading on every phone width.
      className="lg:grid lg:grid-cols-12 lg:gap-8"
    >
      <span className="sr-only">Loading latest orders…</span>

      {/* Static chrome needs no data — render it immediately. */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="border-b border-hair pb-4 space-y-2">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] lg:h-[124px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
