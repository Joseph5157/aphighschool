import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchUI from "./_components/SearchUI";
import DesktopLeftNav from "../_components/DesktopLeftNav";
import DesktopSidebar from "../_components/DesktopSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search AP Teacher Orders — AP Teacher Desk",
  description:
    "Search AP School Education government orders, circulars, and notifications.",
};

export default async function SearchPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { isDraft: false },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTe: true,
        goReference: true,
        categoryId: true,
        docType: true,
        category: {
          select: {
            nameEn: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    posts = [];
  }

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
      {/* 1. Left Rail Navigation */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      {/* 2. Center Search Engine (6 Cols / ~50% Width) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="border-b border-hair pb-4">
          <h1 className="text-display tracking-tight text-ink">Search Portal</h1>
          <p className="text-xs text-inkSoft font-mono mt-1">
            Search AP Government Orders, Circulars, and Guidance by GO number or topic
          </p>
        </div>

        <Suspense fallback={<div className="text-xs font-mono text-inkSoft py-4">Loading search...</div>}>
          <SearchUI posts={posts} />
        </Suspense>
      </div>

      {/* 3. Right Sidebar Rail */}
      <div className="lg:col-span-3">
        <DesktopSidebar />
      </div>
    </div>
  );
}
