import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";
import { optionalQuery } from "@/lib/db-safe";

const STATUS_FILTERS = [
  { label: "GOIR Verified", variant: "success" as const, desc: "Official AP Govt Gazette" },
  { label: "Notified Orders", variant: "turmeric" as const, desc: "Gazette Released" },
  { label: "Apply Open", variant: "tamarind" as const, desc: "Online Applications" },
  { label: "Archive / Expired", variant: "neutral" as const, desc: "Historical Records" },
];

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
    <aside className="space-y-6 sticky top-20 hidden lg:block font-sans">
      {/* 1. Department Navigation Rail */}
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span>🏛️</span> Document Categories
              </CardTitle>
              <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
                AP School Education
              </p>
            </div>
            <Badge variant="neutral" size="sm" shape="pill">
              {categories.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex items-center justify-between p-3 rounded-xl border border-hair/60 hover:border-tamarind/50 bg-paper/30 hover:bg-paperRaised transition-all shadow-2xs"
              style={
                cat.color
                  ? { borderLeftWidth: "4px", borderLeftColor: cat.color }
                  : undefined
              }
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-xs text-ink group-hover:text-tamarind transition-colors truncate">
                  {cat.nameEn}
                </div>
                <div
                  lang="te"
                  className="font-telugu text-[11px] text-inkSoft leading-relaxed truncate mt-0.5"
                >
                  {cat.nameTe}
                </div>
              </div>
              <Badge variant="neutral" size="sm" shape="pill">
                {cat._count.posts}
              </Badge>
            </Link>
          ))}

          {categories.length === 0 && (
            <p className="text-[11px] font-mono text-inkSoft/70 px-1 py-2">
              No categories available.
            </p>
          )}

          <div className="pt-2">
            <Link
              href="/orders"
              className="text-xs font-mono font-bold text-tamarind hover:text-ink flex items-center justify-between p-2 rounded-lg hover:bg-hair/20 transition-all"
            >
              <span>Explore All Categories</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Document Status Quick Filters */}
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <span>🏷️</span> Status Hierarchy
          </CardTitle>
          <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
            Verification status breakdown
          </p>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          {STATUS_FILTERS.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-hair/15 border border-hair/30 text-xs"
            >
              <Badge variant={f.variant} size="sm" shape="pill" dot>
                {f.label}
              </Badge>
              <span className="text-[10px] font-mono text-inkSoft/70">{f.desc}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
