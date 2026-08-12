import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";

const CATEGORIES = [
  { slug: "school-education", nameEn: "School Education", nameTe: "పాఠశాల విద్యా శాఖ", count: 12, color: "#E8A33D" },
  { slug: "finance", nameEn: "Finance & Treasury", nameTe: "ఆర్థిక & ఖజానా శాఖ", count: 8, color: "#2F6B4F" },
  { slug: "higher-education", nameEn: "Higher Education", nameTe: "ఉన్నత విద్యా శాఖ", count: 5, color: "#C7811F" },
  { slug: "dse-circulars", nameEn: "DSE Circulars", nameTe: "డీఎస్‌ఈ సర్క్యులర్లు", count: 9, color: "#B5432E" },
];

const STATUS_FILTERS = [
  { label: "GOIR Verified", variant: "success" as const, desc: "Official AP Govt Gazette" },
  { label: "Notified Orders", variant: "turmeric" as const, desc: "Gazette Released" },
  { label: "Apply Open", variant: "tamarind" as const, desc: "Online Applications" },
  { label: "Archive / Expired", variant: "neutral" as const, desc: "Historical Records" },
];

export default function DesktopLeftNav() {
  return (
    <aside className="space-y-6 sticky top-20 hidden lg:block font-sans">
      {/* 1. Department Navigation Rail */}
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span>🏛️</span> Department Directory
              </CardTitle>
              <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
                AP School Education Sections
              </p>
            </div>
            <Badge variant="neutral" size="sm" shape="pill">
              4 Depts
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex items-center justify-between p-3 rounded-xl border border-hair/60 hover:border-tamarind/50 bg-paper/30 hover:bg-paperRaised transition-all shadow-2xs"
              style={{ borderLeftWidth: "4px", borderLeftColor: cat.color }}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-xs text-ink group-hover:text-tamarind transition-colors truncate">
                  {cat.nameEn}
                </div>
                <div className="font-telugu text-[11px] text-inkSoft leading-relaxed truncate mt-0.5">
                  {cat.nameTe}
                </div>
              </div>
              <Badge variant="neutral" size="sm" shape="pill">
                {cat.count}
              </Badge>
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/orders"
              className="text-xs font-mono font-bold text-tamarind hover:text-ink flex items-center justify-between p-2 rounded-lg hover:bg-hair/20 transition-all"
            >
              <span>Explore All Categories</span>
              <span>→</span>
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
