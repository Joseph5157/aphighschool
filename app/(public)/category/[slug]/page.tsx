import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryLogList from "./_components/CategoryLogList";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Badge from "@/app/(public)/_components/Badge";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";

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
  const category = await safeQuery("category-detail", () =>
    prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        posts: {
          where: { isDraft: false },
          orderBy: ORDER_BY_OFFICIAL_DATE,
        },
        _count: { select: { posts: { where: { isDraft: false } } } },
      },
    })
  );

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
      <div className="bg-masthead text-mastheadText rounded-2xl overflow-hidden shadow-md">
        {/* Top classification ribbon */}
        <div
          className="border-b border-mastheadText/20 px-6 py-2 flex items-center justify-between text-[10px] font-mono text-mastheadText/40 tracking-widest uppercase"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-masthead) 85%, black)" }}
        >
          <span>AP School Education · Official Document Category</span>
          <span className="hidden sm:block">GOIR Verified</span>
        </div>

        {/* Main Header */}
        <div
          className="px-6 py-7 md:px-10 md:py-8 space-y-4 border-l-4"
          style={{ borderLeftColor: category.color || "var(--color-turmeric)" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="success" size="sm" shape="pill" dot>
              GOIR Verified Category
            </Badge>
            <span className="font-mono text-xs text-turmeric/70">
              {postCount} {postCount === 1 ? "document" : "documents"}
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-mastheadText tracking-tight leading-snug">
              {category.nameEn}
            </h1>
            {category.nameTe && (
              <p
                lang="te"
                className="mt-1.5 text-turmeric font-medium"
                style={{ fontFamily: "var(--font-noto-telugu), sans-serif", fontSize: "1rem", lineHeight: "1.75" }}
              >
                {category.nameTe}
              </p>
            )}
          </div>

          <p className="text-xs font-mono text-mastheadText/50 max-w-lg">
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
