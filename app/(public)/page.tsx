import { prisma } from "@/lib/prisma";
import PostCard from "./_components/PostCard";
import DesktopLeftNav from "./_components/DesktopLeftNav";
import UpcomingActionDates from "./_components/UpcomingActionDates";
import EmptyState from "./_components/EmptyState";
import { ORDER_BY_OFFICIAL_DATE, startOfTodayIST } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";

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

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-8 lg:space-y-0">
      {/*
        SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A02): one quiet category rail, not two
        card-kit rails. The right rail duplicated four calculators that the
        primary navigation already reaches, then repeated a "Quick Searches" chip
        set that /search owns — so the document feed was given half the page
        while its two rails competed with it. The feed now takes three quarters.
      */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="border-b border-hair pb-4">
          <h1 className="text-display tracking-tight text-ink">
            Latest Orders & Living Documents
          </h1>
          <p className="text-body text-inkSoft mt-1">
            AP School Education Department · Government Orders & Guidance
          </p>
        </div>

        <UpcomingActionDates
          posts={upcomingActionPosts.filter(
            (post): post is typeof post & { actionDeadline: Date } => post.actionDeadline !== null
          )}
        />

        {/*
          A01: every document is an ordinary row. `posts[0]` used to be promoted
          into a gradient-framed HeroCard purely because it sorted first — an
          editorial decision the data never made — and at 390px that card filled
          the rest of the first viewport, so the document index this product is
          promised to be was not visible on a phone at all.

          The section label the feed used to carry ("Recent Government Orders &
          Circulars") went with the hero: it existed to separate the promoted
          document from "the rest", and with one list it sat directly beneath an
          h1 that already says the same thing (DESIGN.md §1.3).
        */}
        {posts.length > 0 ? (
          <section aria-label="Latest documents" className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        ) : (
          <EmptyState title="No published orders found." />
        )}
      </div>
    </div>
  );
}
