import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { optionalQuery } from "@/lib/db-safe";

/**
 * The desktop category index.
 *
 * SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A02) flattened this. It was a bordered Card
 * containing five separately bordered, rounded rows, a pill counting the
 * categories, a per-category count pill, a line of microcopy under the heading,
 * and an "Explore All Categories" action pointing at a destination the primary
 * navigation already carries. Card-inside-card with pills on both ends made
 * ordinary navigation look like analytics.
 *
 * What survives is what a reader actually uses: the category name in both
 * scripts, how many published documents are in it, and the category's own
 * colour as its identity. A count of zero renders nothing rather than "0" — the
 * absence of a number is the same information without the false precision.
 */
export default async function DesktopLeftNav() {
  const categories = await optionalQuery(
    "nav-categories",
    () =>
      prisma.category.findMany({
        where: { slug: { not: "tools" } },
        include: { _count: { select: { posts: { where: { isDraft: false } } } } },
        orderBy: { nameEn: "asc" },
      }),
    []
  );

  return (
    <aside className="sticky top-20 hidden lg:block font-sans" aria-label="Document categories">
      <h2 className="text-xs font-semibold text-inkSoft border-b border-hair pb-2">
        Categories
      </h2>

      <ul className="mt-1">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/category/${cat.slug}`}
              className="group flex items-baseline justify-between gap-3 py-2.5 border-b border-hair/50"
              style={cat.color ? { borderLeftWidth: "3px", borderLeftColor: cat.color, paddingLeft: "0.625rem" } : undefined}
            >
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink group-hover:text-tamarind transition-colors truncate">
                  {cat.nameEn}
                </span>
                <span lang="te" className="block font-telugu text-xs text-inkSoft truncate">
                  {cat.nameTe}
                </span>
              </span>
              {cat._count.posts > 0 && (
                <span className="font-mono text-meta text-inkSoft shrink-0">{cat._count.posts}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {categories.length === 0 && (
        <p className="text-meta font-mono text-inkSoft/80 py-2">No categories available.</p>
      )}
    </aside>
  );
}
