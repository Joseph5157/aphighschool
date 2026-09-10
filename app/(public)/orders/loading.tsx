import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * SLOP-STATES-1 (AI_SLOP_AUDIT.md A17).
 *
 * The structure SLOP-DENSITY-1 (A06) left behind was already right — masthead, a
 * category index of plain rows, then document rows, with no tab strip, no card
 * grid and no sidebar. What this gate fixes is that every block was the wrong
 * size, and the page's closing GOIR note was not reserved at all.
 *
 * Measured against the rendered page: masthead 239/246px (was `h-44`, 176px),
 * category rows 74/77px (was `h-12`, 48px), document rows 187/124px (was `h-28`,
 * 112px), footer 132/87px (was absent).
 */
export default function OrdersLoading() {
  return (
    <div className="space-y-8 pb-24 font-sans">
      <Breadcrumb items={[{ label: "Orders & Circulars" }]} />

      <div role="status" aria-label="Loading orders index" className="space-y-8">
        <span className="sr-only">Loading orders index…</span>

        <Skeleton className="h-60 w-full rounded-2xl" />

        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px] w-full" />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] lg:h-[124px] w-full rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-24 lg:h-16 w-full" />
      </div>
    </div>
  );
}
