import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HeroCard from "./_components/HeroCard";
import PostCard from "./_components/PostCard";
import DesktopLeftNav from "./_components/DesktopLeftNav";
import DesktopSidebar from "./_components/DesktopSidebar";
import UpcomingActionDates from "./_components/UpcomingActionDates";
import EmptyState from "./_components/EmptyState";
import { ORDER_BY_OFFICIAL_DATE, startOfTodayIST } from "@/lib/dates";
import { quickSearchChips } from "@/lib/posts/query";
import { safeQuery, optionalQuery } from "@/lib/db-safe";

import type { Metadata } from "next";

export const metadata: Metadata = {
  // The home page's page.tsx sits in the SAME segment folder as
  // app/(public)/layout.tsx, whose title.template only formats descendant
  // routes' titles, never its own segment's page — so unlike every other
  // route in this program, the home page must spell out the full title itself.
  title: "Latest AP Teacher Orders — AP Teacher Desk",
  description:
    "The latest published AP School Education government orders, circulars, and notifications, with lifecycle status and provenance shown for each.",
  alternates: { canonical: "/" },
};

// Verified against real content before render (lib/posts/query.ts's
// quickSearchChips) — see DesktopSidebar's quickSearchTags prop.
const QUICK_SEARCH_QUERY_CANDIDATES = [
  { label: "#DAArrears", query: "DA Arrears" },
  { label: "#MegaDSC2026", query: "Mega DSC" },
  { label: "#APTET", query: "TET" },
  { label: "#TransferRules", query: "Transfers" },
  { label: "#PRC", query: "PRC" },
];

// These point at static tool pages, not a search — always real, no verification needed.
const QUICK_SEARCH_STATIC_LINKS = [
  { label: "#Form16Tax", href: "/tools/tax-calculator" },
  { label: "#GPFInterest", href: "/tools/gpf-apgli" },
  { label: "#EHSMedical", href: "/tools/cfms-checker" },
];

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [posts, upcomingActionPosts] = await Promise.all([
    safeQuery("homepage-feed", () =>
      prisma.post.findMany({
        where: { isDraft: false },
        orderBy: ORDER_BY_OFFICIAL_DATE,
        take: 6,
        // Scoped to exactly what HeroCard/PostCard render — neither reads
        // relatedFrom, so it's dropped rather than fetched and discarded
        // (it previously pulled each related post's full row, content
        // field included, for every one of these 6 posts on every load).
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleTe: true,
          summaryTe: true,
          englishAbstract: true,
          statusBadge: true,
          documentType: true,
          orderState: true,
          goReference: true,
          sourceDept: true,
          verifiedAgainstGoir: true,
          createdAt: true,
          documentDate: true,
          category: { select: { nameEn: true, slug: true, color: true, icon: true } },
        },
      })
    ),
    safeQuery("homepage-upcoming-action-dates", () =>
      prisma.post.findMany({
        where: {
          isDraft: false,
          actionDeadline: { gte: startOfTodayIST() },
        },
        orderBy: { actionDeadline: "asc" },
        take: 4,
        select: {
          id: true,
          slug: true,
          titleEn: true,
          actionDeadline: true,
          goReference: true,
          sourceDept: true,
          verifiedAgainstGoir: true,
        },
      })
    ),
  ]);

  const heroPost = posts[0];
  const listingPosts = posts.slice(1);

  const verifiedQueries = await optionalQuery(
    "home-quick-search-chips",
    () => quickSearchChips(QUICK_SEARCH_QUERY_CANDIDATES.map((c) => c.query)),
    []
  );
  const quickSearchTags = [
    ...QUICK_SEARCH_QUERY_CANDIDATES.filter((c) => verifiedQueries.includes(c.query)).map((c) => ({
      label: c.label,
      href: `/search?q=${encodeURIComponent(c.query)}`,
    })),
    ...QUICK_SEARCH_STATIC_LINKS,
  ];

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
      {/* 1. Left Navigation Rail (3 Cols / ~25% Width on Desktop) */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      {/* 2. Center Feed Column (6 Cols / ~50% Width on Desktop) */}
      <div className="lg:col-span-6 space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-hair pb-4">
          <div>
            <h1 className="text-display tracking-tight text-ink">
              Latest Orders & Living Documents
            </h1>
            <p className="text-body text-inkSoft mt-1">
              AP School Education Department · Government Orders & Guidance
            </p>
          </div>
        </div>

        <UpcomingActionDates
          posts={upcomingActionPosts.filter(
            (post): post is typeof post & { actionDeadline: Date } => post.actionDeadline !== null
          )}
        />

        {/* Hero Card: Most Recent Post */}
        {heroPost ? (
          <section aria-label="Featured Order">
            <HeroCard post={heroPost} />
          </section>
        ) : (
          <EmptyState title="No published orders found." />
        )}

        {/* Remaining Listing Cards & Reserved Ad Placement */}
        {listingPosts.length > 0 && (
          <section aria-label="Recent Orders Feed" className="space-y-4">
            <h2 className="text-sm font-mono uppercase text-inkSoft tracking-wider font-semibold">
              Recent Government Orders & Circulars
            </h2>

            <div className="space-y-4">
              {listingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 3. Right Sidebar Rail (3 Cols / ~25% Width on Desktop) */}
      <div className="lg:col-span-3">
        <DesktopSidebar quickSearchTags={quickSearchTags} />
      </div>
    </div>
  );
}
