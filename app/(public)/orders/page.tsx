import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/app/(public)/_components/Card";
import Badge from "@/app/(public)/_components/Badge";

const IconBase = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const getIconPath = (icon?: string) => {
  switch (icon) {
    case "file":
      return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6";
    case "file-text":
      return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8";
    case "file-symlink":
      return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 18l3-3-3-3 M13 15H8v-4";
    case "file-certificate":
      return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M12 18v4l-2-2-2 2v-4 M9 15a3 3 0 1 0 6 0 3 3 0 0 0-6 0z";
    case "bell":
      return "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0";
    default:
      return "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6";
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-hair pb-4">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Orders & Circulars</h1>
        <p className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          ఉత్తర్వులు & సర్క్యులర్లు — శాఖల వారీగా విభజించిన సమాచారం
        </p>
      </div>

      {/* Category List Card */}
      <Card className="overflow-hidden divide-y divide-hair">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex items-center justify-between gap-3 px-5 py-4 hover:bg-hair/20 transition-all relative"
            style={{ borderLeftWidth: "4px", borderLeftColor: category.color || "transparent" }}
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {/* Icon */}
              <div
                className="shrink-0 p-2 rounded-lg bg-hair/30 text-ink opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ color: category.color || "var(--color-inkSoft)" }}
              >
                <IconBase d={getIconPath(category.icon)} size={18} />
              </div>

              {/* Category Titles */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-ink group-hover:text-tamarind transition-colors truncate">
                  {category.nameEn}
                </div>
                {category.nameTe && (
                  <div className="font-telugu text-xs text-inkSoft truncate mt-0.5 font-medium">
                    {category.nameTe}
                  </div>
                )}
              </div>
            </div>

            {/* Post Count Badge & Arrow */}
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="neutral" size="sm">
                {category._count.posts} {category._count.posts === 1 ? "Order" : "Orders"}
              </Badge>
              <span className="font-mono text-sm text-inkSoft group-hover:text-ink group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          </Link>
        ))}
      </Card>
    </div>
  );
}
