import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import CategoryLogList from "./_components/CategoryLogList";

export const revalidate = 3600; // ISR revalidation (1 hour)

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      select: { nameEn: true },
    });

    if (!category) {
      return {
        title: "Category Not Found — AP Teacher Desk",
      };
    }

    return {
      title: `${category.nameEn} Orders — AP Teacher Desk`,
      description: `Browse all AP School Education ${category.nameEn} government orders and circulars.`,
    };
  } catch (e) {
    return {
      title: "AP Teacher Desk",
    };
  }
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    return categories.map((cat) => ({
      slug: cat.slug,
    }));
  } catch (e) {
    return [];
  }
}

export default async function CategoryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let category: any = null;
  try {
    category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        posts: {
          where: { isDraft: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (e) {
    category = null;
  }

  if (!category) {
    notFound();
  }

  const postCountText = `${category.posts.length} ${
    category.posts.length === 1 ? "document" : "documents"
  } · newest first`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="text-xs font-mono text-inkSoft hover:text-ink transition-colors flex items-center gap-1"
        >
          ← Back to Home Feed
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-hair pb-5">
        <h1 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
          {category.color && (
            <div 
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
          {category.nameEn}
        </h1>
        <div className="font-telugu text-sm text-inkSoft mt-0.5 font-medium">
          {category.nameTe}
        </div>
        <div className="font-mono text-[9px] text-[#9C9788] mt-1.5 font-medium uppercase tracking-wider">
          {postCountText}
        </div>
      </div>

      {/* Log Entries and Filters */}
      <CategoryLogList posts={category.posts} />
    </div>
  );
}
