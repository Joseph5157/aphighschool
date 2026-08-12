import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Badge from "@/app/(public)/_components/Badge";

const DOCTYPE_ICON: Record<string, string> = {
  go: "📜",
  memo: "📋",
  circular: "🔄",
  proceedings: "⚖️",
  notification: "🔔",
  default: "📄",
};

export const metadata: Metadata = {
  title: "Orders & Circulars — AP Teacher Desk",
  description:
    "Browse official AP School Education government orders, memos, proceedings and notifications — all verified against goir.ap.gov.in.",
};

export const revalidate = 3600;

export default async function OrdersPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: { slug: { not: "tools" } },
      include: {
        _count: { select: { posts: { where: { isDraft: false } } } },
        posts: {
          where: { isDraft: false },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            id: true,
            slug: true,
            titleEn: true,
            goReference: true,
            statusBadge: true,
            createdAt: true,
          },
        },
      },
      orderBy: { nameEn: "asc" },
    });
  } catch (e) {
    categories = [];
  }

  const totalOrders = categories.reduce(
    (sum, cat) => sum + (cat._count?.posts || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 font-sans">

      {/* ── Option A: Imperial Gazette Masthead ─────────────────────────── */}
      <div className="bg-[#1B2A4A] text-white rounded-2xl overflow-hidden shadow-md">
        {/* Top ribbon */}
        <div className="bg-[#142040] border-b border-white/10 px-6 py-2 flex items-center justify-between text-[11px] font-mono text-white/50 tracking-widest uppercase">
          <span>AP School Education Department — Official G.O. Repository</span>
          <span className="hidden sm:block">goir.ap.gov.in verified</span>
        </div>

        <div className="px-6 py-7 md:px-10 md:py-9 space-y-4">
          {/* Kicker badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="success" size="sm" shape="pill" dot>
              GOIR Verified Repository
            </Badge>
            <span className="font-mono text-xs text-amber-300/70">
              {totalOrders} Official Documents
            </span>
          </div>

          {/* Bilingual headline */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug">
              Orders &amp; Circulars Hub
            </h1>
            <p className="font-medium mt-1.5 text-amber-300" style={{ fontFamily: "'Noto Sans Telugu', sans-serif", fontSize: "1.05rem", lineHeight: "1.75" }}>
              ఉత్తర్వులు &amp; సర్క్యులర్లు — వర్గాల వారీగా
            </p>
          </div>

          <p className="text-sm text-white/60 font-mono max-w-xl leading-relaxed">
            Official government orders, department memos, proceedings, and notifications — all categories listed below.
          </p>
        </div>
      </div>

      {/* ── Category Cards Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const icon = DOCTYPE_ICON[cat.icon] || DOCTYPE_ICON.default;
          const count = cat._count?.posts || 0;

          return (
            <div
              key={cat.id}
              className="group bg-[#FAF7F2] border border-hair/70 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1B2A4A]/30 transition-all"
            >
              {/* Card Header */}
              <div
                className="px-5 py-4 border-b border-hair/60 flex items-center justify-between"
                style={{ borderLeftColor: cat.color || "#C9973A", borderLeftWidth: 4 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden="true">{icon}</span>
                  <div>
                    <h2 className="font-bold text-[#1B2A4A] text-sm tracking-tight group-hover:text-tamarind transition-colors">
                      {cat.nameEn}
                    </h2>
                    <div className="text-xs text-inkSoft" style={{ fontFamily: "'Noto Sans Telugu', sans-serif", lineHeight: "1.6" }}>
                      {cat.nameTe}
                    </div>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#1B2A4A] bg-[#1B2A4A]/10 px-2.5 py-1 rounded-full">
                  {count} docs
                </span>
              </div>

              {/* Recent orders preview list */}
              <div className="px-5 py-3 space-y-2.5 min-h-[96px]">
                {cat.posts && cat.posts.length > 0 ? (
                  cat.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="flex items-start justify-between gap-2 group/item"
                    >
                      <span className="text-xs text-ink font-medium leading-snug line-clamp-1 group-hover/item:text-tamarind transition-colors flex-1">
                        {post.titleEn}
                      </span>
                      {post.goReference && (
                        <span className="font-mono text-[10px] text-inkSoft shrink-0 bg-hair/50 px-1.5 py-0.5 rounded">
                          {post.goReference}
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <p className="text-xs font-mono text-inkSoft/60 pt-1">No documents yet.</p>
                )}
              </div>

              {/* Footer CTA */}
              <Link href={`/category/${cat.slug}`} className="block">
                <div className="px-5 py-3 border-t border-hair/60 bg-[#F3EFE6] group-hover:bg-[#1B2A4A] transition-colors flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#1B2A4A] group-hover:text-white transition-colors">
                    View All {count} Documents
                  </span>
                  <span className="text-[#1B2A4A] group-hover:text-amber-300 transition-colors font-mono text-sm">→</span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Gazette Footer Note ─────────────────────────────────────────── */}
      <div className="border-t border-hair pt-4 font-mono text-[10px] text-inkSoft/60 text-center tracking-wide">
        All G.O.s verified against Andhra Pradesh Government Orders Information Repository (GOIR) · goir.ap.gov.in
      </div>
    </div>
  );
}
