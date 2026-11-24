import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * Reserves the same category masthead and compact document-log geometry as the
 * loaded route. Without a route loading state, client navigation updates the
 * URL first while leaving the previous document visible, which makes the
 * category action appear unresponsive on a slower mobile connection.
 */
export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-24 font-sans sm:space-y-6 md:space-y-7">
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          { label: "Loading category" },
        ]}
      />

      <div role="status" aria-label="Loading category documents" className="space-y-6">
        <span className="sr-only">Loading category documents…</span>

        <Skeleton className="h-60 w-full rounded-2xl" />

        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-[180px] w-full rounded-xl lg:h-[124px]" />
          ))}
        </div>

        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
