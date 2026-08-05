import { prisma } from "@/lib/prisma";
import SearchUI from "./_components/SearchUI";
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
    <div className="space-y-6">
      <div className="border-b border-hair pb-4">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Search Portal</h1>
        <p className="text-xs text-inkSoft font-mono mt-1">
          Search AP Government Orders, Circulars, and Guidance by GO number or topic
        </p>
      </div>

      <SearchUI posts={posts} />
    </div>
  );
}
