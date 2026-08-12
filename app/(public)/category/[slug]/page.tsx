import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryLogList from "./_components/CategoryLogList";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Badge from "@/app/(public)/_components/Badge";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      select: { nameEn: true, nameTe: true },
    });

    if (!category) return { title: "Category Not Found — AP Teacher Desk" };

    return {
      title: `${category.nameEn} Orders — AP Teacher Desk`,
      description: `Browse all AP School Education ${category.nameEn} government orders and circulars. ${category.nameTe || ""}`,
    };
  } catch (e) {
    return { title: "AP Teacher Desk" };
  }
}

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map((cat) => ({ slug: cat.slug }));
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
        _count: { select: { posts: { where: { isDraft: false } } } },
      },
    });
  } catch (e) {
    category = null;
  }

  if (!category) notFound();

  const postCount = category._count?.posts || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-24 font-sans">

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          { label: category.nameEn },
        ]}
      />

      {/* ── Option A: Imperial Gazette Category Masthead ─────────────────── */}
      <div className="bg-[#1B2A4A] text-white rounded-2xl overflow-hidden shadow-md">
        {/* Top classification ribbon */}
        <div className="bg-[#142040] border-b border-white/10 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-white/40 tracking-widest uppercase">
          <span>AP School Education · Official Document Category</span>
          <span className="hidden sm:block">GOIR Verified</span>
        </div>

        {/* Main Header */}
        <div
          className="px-6 py-7 md:px-10 md:py-8 space-y-4 border-l-4"
          style={{ borderLeftColor: category.color || "#C9973A" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="success" size="sm" shape="pill" dot>
              GOIR Verified Category
            </Badge>
            <span className="font-mono text-xs text-amber-300/70">
              {postCount} {postCount === 1 ? "document" : "documents"}
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              {category.nameEn}
            </h1>
            {category.nameTe && (
              <p
                className="mt-1.5 text-amber-300 font-medium"
                style={{ fontFamily: "'Noto Sans Telugu', sans-serif", fontSize: "1rem", lineHeight: "1.75" }}
              >
                {category.nameTe}
              </p>
            )}
          </div>

          <p className="text-xs font-mono text-white/50 max-w-lg">
            All official {category.nameEn} government orders — sorted by publication date, newest first.
          </p>
        </div>
      </div>

      {/* ── Document Log Feed with Filters ──────────────────────────────── */}
      <CategoryLogList posts={category.posts} />

      {/* ── Gazette Footer ───────────────────────────────────────────────── */}
      <div className="border-t border-hair pt-4 font-mono text-[10px] text-inkSoft/60 text-center tracking-wide">
        All G.O.s verified against AP Government Orders Information Repository · goir.ap.gov.in
      </div>
    </div>
  );
}
