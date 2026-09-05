import { searchPosts, type SearchParams } from "@/lib/posts/query";
import { safeQuery } from "@/lib/db-safe";
import SearchUI from "./_components/SearchUI";
import TopicTagBar from "@/app/(public)/_components/TopicTagBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search AP Teacher Orders — AP Teacher Desk",
  description:
    "Search AP School Education government orders, circulars, and notifications.",
};

// Results depend on the query string, so this route cannot be statically cached.
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const results = await safeQuery("search", () => searchPosts(searchParams));

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="border-b border-hair pb-4">
        <h1 className="text-display tracking-tight text-ink">Search Portal</h1>
        <p className="text-body text-inkSoft mt-1">
          Search AP Government Orders, Circulars, and Guidance by GO number, Telugu
          phrase, or topic tag
        </p>
      </div>

      <TopicTagBar baseUrl="/search" />

      <SearchUI
        results={results}
        query={searchParams.q ?? ""}
        activeType={searchParams.type ?? null}
      />
    </div>
  );
}
