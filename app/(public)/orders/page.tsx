import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Badge from "@/app/(public)/_components/Badge";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Button from "@/app/(public)/_components/Button";
import OrdersFilterTabs from "./_components/OrdersFilterTabs";
import OrdersSidebar from "./_components/OrdersSidebar";
import { ORDER_BY_OFFICIAL_DATE, officialDate, dateLabel, formatDate } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";

export const metadata: Metadata = {
  title: "Orders & Circulars — AP Teacher Desk",
  description:
    "Browse official AP School Education government orders, memos, proceedings and notifications — all verified against goir.ap.gov.in.",
};

export const revalidate = 3600;

export default async function OrdersPage() {
  const categories = await safeQuery("orders-categories", () =>
    prisma.category.findMany({
      where: { slug: { not: "tools" } },
      include: {
        _count: { select: { posts: { where: { isDraft: false } } } },
        posts: {
          where: { isDraft: false },
          orderBy: ORDER_BY_OFFICIAL_DATE,
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
    })
  );

  const recentPosts = await safeQuery("orders-recent", () =>
    prisma.post.findMany({
      where: { isDraft: false },
      orderBy: ORDER_BY_OFFICIAL_DATE,
      take: 5,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        goReference: true,
        createdAt: true,
        documentDate: true,
      },
    })
  );

  const totalOrders = categories.reduce(
    (sum, cat) => sum + (cat._count?.posts || 0),
    0
  );

  return (
    <div className="space-y-8 pb-24 font-sans">
      <Breadcrumb items={[{ label: "Orders & Circulars" }]} />

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        {/* Main Feed Column (8 cols on Desktop) */}
        <div className="lg:col-span-8 space-y-8">
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

              {/* Search shortcut inside hero */}
              <div className="flex items-center gap-3 pt-1">
                <Link href="/search?type=go">
                  <Button variant="outline" size="sm" leftIcon={<span>🔍</span>} rightIcon={<span>→</span>} className="border-white/40 text-white hover:bg-white/10">
                    Search Government Orders
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Recently Added strip ─────────────────────────────────────────── */}
          {recentPosts.length > 0 && (
            <div className="space-y-2">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-inkSoft font-semibold">
                🕐 Recently Added
              </h2>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.slug}`} className="shrink-0">
                    <div className="bg-[#FAF7F2] border border-hair hover:border-[#1B2A4A]/40 rounded-lg px-3 py-2 flex items-center gap-2 transition-all group min-w-fit">
                      {post.goReference && (
                        <span className="font-mono text-[10px] font-bold text-[#1B2A4A] bg-[#1B2A4A]/10 px-1.5 py-0.5 rounded shrink-0">
                          {post.goReference}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-inkSoft max-w-[160px] truncate group-hover:text-tamarind transition-colors">
                        {post.titleEn}
                      </span>
                      <span className="font-mono text-[9px] text-inkSoft/50 shrink-0">
                        {dateLabel(post)} · {formatDate(officialDate(post))}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Document Type Filter Tabs + Category Cards Grid ──────────────── */}
          <OrdersFilterTabs categories={categories} />
        </div>

        {/* Sidebar Column (4 cols on Desktop) */}
        <div className="lg:col-span-4">
          <OrdersSidebar />
        </div>
      </div>

      {/* ── Gazette Footer Note ─────────────────────────────────────────── */}
      <div className="border-t border-hair pt-4 font-mono text-[10px] text-inkSoft/60 text-center tracking-wide">
        All G.O.s verified against Andhra Pradesh Government Orders Information Repository (GOIR) · goir.ap.gov.in
      </div>
    </div>
  );
}
