import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HeroCard from "./_components/HeroCard";
import PostCard from "./_components/PostCard";
import DesktopLeftNav from "./_components/DesktopLeftNav";
import DesktopSidebar from "./_components/DesktopSidebar";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest AP Teacher Orders — AP Teacher Desk",
};

// This hourly window is a safety net, not the primary freshness mechanism:
// every post create/update/delete/publish calls revalidatePostPaths (see
// app/actions/posts.ts), which revalidates this route on-demand the moment
// the write happens. Do not lower this value to "fix" staleness — the write
// path already handles that; this just bounds drift from any change made
// directly in the DB outside those actions.
export const revalidate = 3600; // ISR

export default async function HomePage() {
  const posts = await safeQuery("homepage-feed", () =>
    prisma.post.findMany({
      where: { isDraft: false },
      orderBy: ORDER_BY_OFFICIAL_DATE,
      take: 6,
      include: {
        category: true,
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: true },
        },
      },
    })
  );

  const heroPost = posts[0];
  const listingPosts = posts.slice(1);

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
            <p className="text-xs text-inkSoft font-mono mt-1">
              AP School Education Department · Verified Government Orders & Guidance
            </p>
          </div>
        </div>

        {/* Hero Card: Most Recent Post */}
        {heroPost ? (
          <section aria-label="Featured Order">
            <HeroCard post={heroPost} />
          </section>
        ) : (
          <div className="bg-paperRaised border border-hair rounded-xl p-8 text-center text-inkSoft text-sm">
            No published posts found.
          </div>
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
        <DesktopSidebar />
      </div>
    </div>
  );
}
