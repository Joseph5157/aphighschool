import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import PostCard from "@/app/(public)/_components/PostCard";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";
import { safeQuery } from "@/lib/db-safe";
import EmptyState from "@/app/(public)/_components/EmptyState";

export const metadata: Metadata = {
  title: "Orders & Circulars",
  description:
    "Browse AP School Education government orders, memos, proceedings, and notifications.",
  alternates: { canonical: "/orders" },
};

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const categories = await safeQuery("orders-categories", () =>
    prisma.category.findMany({
      where: { slug: { not: "tools" } },
      include: {
        _count: { select: { posts: { where: { isDraft: false } } } },
      },
      orderBy: { nameEn: "asc" },
    })
  );

  // Selected for PostCard, the same row the homepage and this page now share.
  // The three-post preview each category card used to carry is gone with the
  // cards (A06), so this is the page's only document list rather than its
  // fourth.
  const recentPosts = await safeQuery("orders-recent", () =>
    prisma.post.findMany({
      where: { isDraft: false },
      orderBy: ORDER_BY_OFFICIAL_DATE,
      take: 6,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTe: true,
        statusBadge: true,
        documentType: true,
        orderState: true,
        goReference: true,
        sourceDept: true,
        verifiedAgainstGoir: true,
        createdAt: true,
        documentDate: true,
        category: { select: { nameEn: true, slug: true, color: true, icon: true } },
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

      {/*
        SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A06). This page ran six discovery
        systems at once: a two-tier gazette masthead with its own search button,
        a topic tag bar, a horizontally scrolling "Recent Documents" chip strip,
        six document-type tabs, a grid of category cards each holding three mini
        document rows and a footer CTA, and a sidebar of quick-search chips. The
        tabs and the category cards were the same taxonomy twice; the chip strip
        and the mini rows were the same recency twice; the masthead button, the
        chips and the topic bar were three doors to /search.

        One browse model survives: a category index, then the documents. The
        topic bar and the verified quick-search chips still live on /search,
        which owns that job.
      */}
      <div className="on-masthead bg-masthead text-mastheadText rounded-2xl px-6 py-7 md:px-10 md:py-9 space-y-3">
        <h1 className="text-display text-mastheadText tracking-tight">
          Orders &amp; Circulars Hub
        </h1>
        <p lang="te" className="text-telugu-title text-turmeric font-medium">
          ఉత్తర్వులు &amp; సర్క్యులర్లు — వర్గాల వారీగా
        </p>
        <p className="text-body text-mastheadText/70 max-w-xl">
          AP School Education Document Index — government orders, department memos,
          proceedings, circulars and notifications.
        </p>
        <p className="text-meta font-mono text-turmeric/80">
          {totalOrders} Published documents
        </p>
      </div>

      <section aria-label="Document categories" className="space-y-2">
        {categories.length > 0 ? (
          <ul>
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-3 border-b border-hair"
                  style={
                    cat.color
                      ? { borderLeftWidth: "3px", borderLeftColor: cat.color, paddingLeft: "0.75rem" }
                      : undefined
                  }
                >
                  <span className="min-w-0">
                    <span className="block text-card-title text-ink group-hover:text-tamarind transition-colors">
                      {cat.nameEn}
                    </span>
                    <span lang="te" className="block text-telugu-body text-inkSoft truncate">
                      {cat.nameTe}
                    </span>
                  </span>
                  {/* Same rule as the homepage rail: a category with nothing
                      published shows no number rather than a "0". */}
                  {(cat._count?.posts || 0) > 0 && (
                    <span className="font-mono text-meta text-inkSoft shrink-0">
                      {cat._count.posts}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No categories available." />
        )}
      </section>

      <section aria-label="Latest documents" className="space-y-4">
        <h2 className="text-section text-ink">Latest documents</h2>
        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="No published documents yet." />
        )}
      </section>

      {/*
        A06 asked for the GOIR explanation to become quiet help text near
        provenance rather than a navy sidebar card competing with the index.
        The wording is unchanged and still bounded: GOIR is described as a
        government resource, and the claim is scoped to documents with a
        recorded check (FRESHNESS-1, DESIGN_SYSTEM.md §12.1-12.2).
      */}
      <footer className="border-t border-hair pt-4 space-y-1 text-inkSoft/90">
        <p className="text-meta font-mono">GOIR status shown per document</p>
        <p className="text-body text-inkSoft/80 max-w-2xl">
          GOIR (goir.ap.gov.in) is a government-orders resource. Documents marked &ldquo;GOIR Verified&rdquo; have a recorded verification in AP Teacher Desk.{" "}
          <a
            href="https://goir.ap.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-tamarind hover:underline"
          >
            Open GOIR
          </a>
        </p>
      </footer>
    </div>
  );
}
