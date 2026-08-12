import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HeroCard from "./_components/HeroCard";
import PostCard from "./_components/PostCard";
import AdSlot from "./_components/AdSlot";
import DesktopLeftNav from "./_components/DesktopLeftNav";
import DesktopSidebar from "./_components/DesktopSidebar";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest AP Teacher Orders — AP Teacher Desk",
};

export const revalidate = 3600; // ISR

export default async function HomePage() {
  let posts: any[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { isDraft: false },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        category: true,
        relatedFrom: {
          include: {
            relatedPost: true,
          },
        },
      },
    });
  } catch (e) {
    posts = [];
  }

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
              {listingPosts.map((post, index) => {
                const showAdSlot = index === 1;

                return (
                  <div key={post.id} className="space-y-4">
                    <PostCard post={post} />
                    {showAdSlot && <AdSlot />}
                  </div>
                );
              })}
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
