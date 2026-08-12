import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";

const CATEGORIES = [
  { slug: "school-education", nameEn: "School Education", nameTe: "పాఠశాల విద్య", count: 12, color: "#E8A33D" },
  { slug: "finance", nameEn: "Finance & Treasury", nameTe: "ఆర్థిక & ఖజానా శాఖ", count: 8, color: "#2F6B4F" },
  { slug: "higher-education", nameEn: "Higher Education", nameTe: "ఉన్నత విద్య", count: 5, color: "#C7811F" },
  { slug: "dse-circulars", nameEn: "DSE Circulars", nameTe: "డీఎస్‌ఈ ఉత్తర్వులు", count: 9, color: "#B5432E" },
];

const STATUS_FILTERS = [
  { label: "GOIR Verified", variant: "success" as const },
  { label: "Notified Orders", variant: "turmeric" as const },
  { label: "Apply Open", variant: "tamarind" as const },
  { label: "Archive / Expired", variant: "neutral" as const },
];

export default function DesktopLeftNav() {
  return (
    <aside className="space-y-6 sticky top-20 hidden lg:block font-sans">
      {/* 1. Department Navigation Rail */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span>🏛️</span> Departments
            </CardTitle>
            <Badge variant="neutral" size="sm">
              Categories
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 pt-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-hair/20 transition-all relative border-l-2"
              style={{ borderLeftColor: cat.color }}
            >
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-ink group-hover:text-tamarind transition-colors truncate">
                  {cat.nameEn}
                </div>
                <div className="font-telugu text-[10px] text-inkSoft/80 truncate">
                  {cat.nameTe}
                </div>
              </div>
              <Badge variant="neutral" size="sm">
                {cat.count}
              </Badge>
            </Link>
          ))}
          <div className="pt-2 border-t border-hair/50 mt-2">
            <Link
              href="/orders"
              className="text-xs font-mono text-inkSoft hover:text-ink font-bold flex items-center justify-between p-1"
            >
              <span>Browse All Categories</span>
              <span>→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Quick Filter Chips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>🏷️</span> Document Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f, i) => (
              <Badge key={i} variant={f.variant} size="sm" shape="pill" dot>
                {f.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
