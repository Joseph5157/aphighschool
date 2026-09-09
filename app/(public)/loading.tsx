import DesktopLeftNav from "./_components/DesktopLeftNav";
import Skeleton from "./_components/Skeleton";

export default function HomeLoading() {
  return (
    <div
      role="status"
      aria-label="Loading latest orders"
      className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-8 lg:space-y-0"
    >
      <span className="sr-only">Loading latest orders…</span>

      {/* Static chrome needs no data — render it immediately. */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      {/*
        Tracks the loaded page's shape after SLOP-DENSITY-1: no hero block, no
        right rail, one list of document rows. A full skeleton pass across every
        route belongs to SLOP-STATES-1 (A17); this is the minimum that keeps the
        placeholder honest about what actually arrives.
      */}
      <div className="lg:col-span-9 space-y-6">
        <div className="border-b border-hair pb-4 space-y-2">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
