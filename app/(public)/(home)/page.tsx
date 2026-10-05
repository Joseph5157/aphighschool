import { prisma } from "@/lib/prisma";
import DesktopLeftNav from "@/app/(public)/_components/DesktopLeftNav";
import UpcomingActionDates from "@/app/(public)/_components/UpcomingActionDates";
import DateGroupedFeed from "@/app/(public)/_components/DateGroupedFeed";
import { ORDER_BY_OFFICIAL_DATE, startOfTodayIST } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest AP Teacher Orders",
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
    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      <div className="lg:col-span-9 space-y-6">
        <div className="border-b border-hair pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-display tracking-tight text-ink">
              Latest Orders & Living Documents
            </h1>
            <p className="text-body text-inkSoft mt-1">
              AP School Education Department · Government Orders & Guidance
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-inkSoft bg-paperRaised px-3 py-1.5 rounded-lg border border-hair">
            <span className="w-2 h-2 rounded-full bg-turmeric animate-pulse" />
            <span>Official Gazette Stream</span>
          </div>
        </div>

        <UpcomingActionDates
          posts={upcomingActionPosts.filter(
            (post): post is typeof post & { actionDeadline: Date } => post.actionDeadline !== null
          )}
        />

        <DateGroupedFeed posts={posts} />
      </div>
    </div>
  );
}

