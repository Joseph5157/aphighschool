import DesktopLeftNav from "./_components/DesktopLeftNav";
import DesktopSidebar from "./_components/DesktopSidebar";
import Skeleton from "./_components/Skeleton";

export default function HomeLoading() {
  return (
    <div
      role="status"
      aria-label="Loading latest orders"
      className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0"
    >
      <span className="sr-only">Loading latest orders…</span>

      {/* Static chrome needs no data — render it immediately. */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      <div className="lg:col-span-6 space-y-8">
        <div className="flex items-center justify-between border-b border-hair pb-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
        </div>

        {/* Hero card */}
        <Skeleton className="h-64 w-full rounded-2xl" />

        {/* Recent orders feed */}
        <div className="space-y-4">
          <Skeleton className="h-3 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <DesktopSidebar />
      </div>
    </div>
  );
}
