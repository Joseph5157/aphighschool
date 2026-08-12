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
  title: "Orders & Circulars Directory — AP Teacher Desk",
  description: "Browse official AP School Education government orders, memos, proceedings, and notifications by category.",
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
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Option A Gazette Header Banner */}
      <div className="border-b border-hair pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="tamarind" size="sm" shape="pill" dot>
            Official Document Directory
          </Badge>
          <span className="text-meta text-inkSoft">GOIR Verified Archives</span>
        </div>
        <h1 className="text-display text-ink tracking-tight">
          Orders & Circulars Hub
        </h1>
        <p className="text-telugu-title text-inkSoft font-medium mt-1">
          ఉత్తర్వులు & సర్క్యులర్లు వర్గాల వారీగా
        </p>
        <p className="text-xs text-inkSoft font-mono mt-1">
          Browse verified government orders, department memos, proceedings, and official notifications.
        </p>
      </div>

      {/* Categories Grid (Option A Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} hoverable className="p-5">
            <Link href={`/category/${cat.slug}`} className="group block space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-ink shrink-0 border border-hair/80 shadow-2xs"
                    style={{ backgroundColor: cat.color || "#F7F4EC" }}
                  >
                    <IconBase d={getIconPath(cat.icon)} size={18} />
                  </div>
                  <div>
                    <h3 className="text-card-title text-ink group-hover:text-tamarind transition-colors">
                      {cat.nameEn}
                    </h3>
                    <div className="text-telugu-body text-xs text-inkSoft">
                      {cat.nameTe}
                    </div>
                  </div>
                </div>

                <Badge variant="neutral" size="sm" shape="pill">
                  {cat._count?.posts || 0} Docs
                </Badge>
              </div>

              <div className="pt-2 border-t border-hair/50 flex justify-between items-center text-xs font-mono text-tamarind font-semibold group-hover:text-ink transition-colors">
                <span>View All Documents</span>
                <span>→</span>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
