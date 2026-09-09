import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Skeleton from "@/app/(public)/_components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-8 pb-24 font-sans">
      <Breadcrumb items={[{ label: "Orders & Circulars" }]} />

      {/*
        Matches the page SLOP-DENSITY-1 left behind: masthead, a category index
        of plain rows, then document rows — no tab strip, no card grid, no
        sidebar. SLOP-STATES-1 (A17) owns the full skeleton pass.
      */}
      <div role="status" aria-label="Loading orders index" className="space-y-8">
        <span className="sr-only">Loading orders index…</span>

        <Skeleton className="h-44 w-full rounded-2xl" />

        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
