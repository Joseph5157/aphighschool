import Skeleton from "@/app/(public)/_components/Skeleton";

export default function PostDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading document"
      className="max-w-3xl mx-auto space-y-6 pb-24 font-sans"
    >
      <span className="sr-only">Loading document…</span>

      <Skeleton className="h-4 w-56" />

      <div className="space-y-3">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-8 w-full max-w-lg" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      <Skeleton className="h-24 w-full rounded-xl" />

      <div className="space-y-3 pt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}
