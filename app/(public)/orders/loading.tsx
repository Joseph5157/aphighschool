import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import OrdersSidebar from "./_components/OrdersSidebar";
import Skeleton from "@/app/(public)/_components/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-8 pb-24 font-sans">
      <Breadcrumb items={[{ label: "Orders & Circulars" }]} />

      <div
        role="status"
        aria-label="Loading orders index"
        className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0"
      >
        <span className="sr-only">Loading orders index…</span>

        <div className="lg:col-span-8 space-y-8">
          <Skeleton className="h-48 w-full rounded-2xl" />

          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        </div>

        {/* OrdersSidebar needs no data — render it immediately. */}
        <div className="lg:col-span-4">
          <OrdersSidebar />
        </div>
      </div>
    </div>
  );
}
