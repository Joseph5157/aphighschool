import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryLogList from "./_components/CategoryLogList";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";

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
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Breadcrumb Trail & SEO Schema */}
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          { label: category.nameEn },
        ]}
      />

      {/* Header */}
      <div className="border-b border-hair pb-4">
        <h1 className="text-display text-ink tracking-tight flex items-center gap-2">
          {category.color && (
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
          {category.nameEn}
        </h1>
        {category.nameTe && (
          <div className="text-telugu-title text-inkSoft mt-0.5">
            {category.nameTe}
          </div>
        )}
        <div className="text-meta text-inkSoft/70 mt-1 uppercase tracking-wider">
          {postCountText}
        </div>
      </div>

      {/* Log Entries and Filters */}
      <CategoryLogList posts={category.posts} />
    </div>
  );
}
