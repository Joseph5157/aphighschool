import {
  recentPublishedDocuments,
  searchPosts,
  quickSearchChips,
  tagsWithPublishedContent,
  type SearchParams,
} from "@/lib/posts/query";
import { optionalQuery, safeQuery } from "@/lib/db-safe";
import SearchUI from "./_components/SearchUI";
import TopicTagBar, { FEATURED_TOPICS } from "@/app/(public)/_components/TopicTagBar";
import type { Metadata } from "next";

// Curated candidates for the discovery view's "Quick Searches" chips — only
// the ones verified against real content (quickSearchChips) are ever shown.
const QUICK_SEARCH_CANDIDATES = [
  "TET 2026",
  "DA Arrears",
  "Mega DSC",
  "PRC arrears",
  "Transfers",
  "Form 16",
];

export const metadata: Metadata = {
  title: "Search AP Teacher Orders",
  description:
    "Search AP School Education government orders, circulars, and notifications.",
  // Every ?q=/?type=/?tag= variant is the same page; canonicalize to the bare route.
  alternates: { canonical: "/search" },
};

// Results depend on the query string, so this route cannot be statically cached.
export const dynamic = "force-dynamic";

function isDiscoveryState(params: SearchParams) {
  return !params.q?.trim() && !params.type && !params.category && !params.tag && !params.from && !params.to;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const isDiscovery = isDiscoveryState(searchParams);
  const results = await safeQuery("search", () => searchPosts(searchParams));
  const recentDocuments = isDiscovery
    ? await optionalQuery("search-recent-documents", () => recentPublishedDocuments(5), [])
    : [];
  const availableTopicTags = await optionalQuery(
    "search-topic-tags",
    () => tagsWithPublishedContent(FEATURED_TOPICS.map((topic) => topic.tag)),
    []
  );
  const chips = isDiscovery
    ? await optionalQuery("search-quick-chips", () => quickSearchChips(QUICK_SEARCH_CANDIDATES), [])
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="border-b border-hair pb-4">
        <h1 className="text-display tracking-tight text-ink">Search Portal</h1>
        <p className="text-body text-inkSoft mt-1">
          Search AP Government Orders, Circulars, and Guidance by GO number, Telugu
          phrase, or topic tag
        </p>
      </div>

      <TopicTagBar baseUrl="/search" availableTags={availableTopicTags} />

      <SearchUI
        results={results}
        query={searchParams.q ?? ""}
        activeType={searchParams.type ?? null}
        isDiscovery={isDiscovery}
        recentDocuments={recentDocuments}
        quickSearchChips={chips}
      />
    </div>
  );
}
