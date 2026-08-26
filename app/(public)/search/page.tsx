import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import SearchUI from "./_components/SearchUI";
import type { Metadata } from "next";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";

export const metadata: Metadata = {
  title: "Search AP Teacher Orders — AP Teacher Desk",
  description:
    "Search AP School Education government orders, circulars, and notifications.",
};

export default async function SearchPage() {
  const posts = await safeQuery("search-index", () =>
    prisma.post.findMany({
      where: { isDraft: false },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTe: true,
        goReference: true,
        categoryId: true,
        documentType: true,
        category: {
          select: {
            nameEn: true,
          },
        },
      },
      orderBy: ORDER_BY_OFFICIAL_DATE,
    })
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
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
  );
}
