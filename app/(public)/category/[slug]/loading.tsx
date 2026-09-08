import Skeleton from "@/app/(public)/_components/Skeleton";

export default function CategoryLoading() {
  return (
    <div
      role="status"
      aria-label="Loading category"
      className="max-w-5xl mx-auto space-y-7 pb-24 font-sans"
    >
      <span className="sr-only">Loading category…</span>

      <Skeleton className="h-4 w-40" />

      <Skeleton className="h-40 w-full rounded-2xl" />

      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
