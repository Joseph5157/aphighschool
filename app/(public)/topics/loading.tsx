import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Skeleton from "@/app/(public)/_components/Skeleton";

/**
 * TERM-TOPICS-1: /topics now reads published tag counts from the database,
 * so it joins the DB-backed routes that keep a loading state (states.test.tsx).
 * Blocks mirror the rendered page, measured in Chromium: masthead 132-148px
 * on phones and 204px from md up; document-topic cards 214-265px; then the
 * two static service-guide cards.
 */
export default function TopicsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 md:space-y-8 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Teacher Topics" }]} />

      <div role="status" aria-label="Loading teacher topics" className="space-y-4 sm:space-y-6 md:space-y-8">
        <span className="sr-only">Loading teacher topics…</span>

        <Skeleton className="h-36 md:h-[204px] w-full rounded-2xl" />

        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
