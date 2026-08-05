import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

const IconBase = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const getIconPath = (icon?: string) => {
  switch (icon) {
    case 'file': return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6";
    case 'file-text': return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8";
    case 'file-symlink': return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 18l3-3-3-3 M13 15H8v-4";
    case 'file-certificate': return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v4l-2-2-2 2v-4 M9 15a3 3 0 1 0 6 0 3 3 0 0 0-6 0z";
    case 'bell': return "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0";
    default: return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6";
  }
};

export const metadata: Metadata = {
  title: "Browse Orders — AP Teacher Desk",
};

export const revalidate = 3600;

export default async function OrdersPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: {
        slug: {
          not: "tools",
        },
      },
      include: {
        _count: {
          select: { posts: { where: { isDraft: false } } },
        },
      },
      orderBy: { nameEn: "asc" },
    });
  } catch (e) {
    categories = [];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-hair pb-4">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Orders & Circulars</h1>
        <p className="font-telugu text-sm text-inkSoft mt-1">
          ఉత్తర్వులు & సర్క్యులర్లు
        </p>
      </div>

      {/* Compact List */}
      <div className="rounded-xl border border-hair overflow-hidden divide-y divide-hair">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex items-center gap-3 px-4 py-3 hover:bg-paperRaised transition-colors relative"
            style={{ borderLeftWidth: "3px", borderLeftColor: category.color || "transparent" }}
          >
            {/* Icon */}
            <div
              className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ color: category.color || "var(--color-inkSoft)" }}
            >
              <IconBase d={getIconPath(category.icon)} size={15} />
            </div>

            {/* Names */}
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              <span className="font-semibold text-sm text-ink group-hover:text-turmericDeep transition-colors truncate">
                {category.nameEn}
              </span>
              <span className="font-telugu text-[11px] text-inkSoft truncate hidden sm:inline">
                {category.nameTe}
              </span>
            </div>

            {/* Arrow */}
            <div className="shrink-0">
              {category._count.posts > 0 && (
                <span className="font-mono text-xs text-inkSoft group-hover:text-ink group-hover:translate-x-0.5 transition-all">
                  →
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
