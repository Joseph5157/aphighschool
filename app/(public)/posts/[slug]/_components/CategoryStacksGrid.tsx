import React from "react";
import Link from "next/link";
import { Card } from "@/app/(public)/_components/Card";
import Badge from "@/app/(public)/_components/Badge";

interface StackItem {
  id: string;
  slug: string;
  titleEn: string;
}

interface CategoryStack {
  title: string;
  /** Resolved destination for "View More" — not always a category (e.g. the
   * site-wide "latest updates" stack links to /orders, not a category page). */
  href: string;
  icon: string;
  items: StackItem[];
}

interface CategoryStacksGridProps {
  stacks: CategoryStack[];
}

export default function CategoryStacksGrid({ stacks }: CategoryStacksGridProps) {
  if (!stacks || stacks.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 border-t border-hair">
      <div className="font-mono font-bold text-xs tracking-wider text-inkSoft uppercase flex items-center justify-between">
        <span>🔔 తాజా అప్‌డేట్‌లు — Latest Updates & Softwares</span>
        <span className="text-[10px] text-inkSoft/80">Category Stacks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stacks.map((stack, sIdx) => (
          <Card key={sIdx} className="p-5 bg-paperRaised border border-hair rounded-xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-hair/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{stack.icon}</span>
                <h3 className="font-bold text-sm text-ink tracking-tight">{stack.title}</h3>
              </div>
              <Link
                href={stack.href}
                className="font-mono text-xs font-bold text-tamarind hover:underline flex items-center gap-1"
              >
                <span>View More</span>
                <span>→</span>
              </Link>
            </div>

            {/* List */}
            <ul className="space-y-2.5">
              {stack.items.map((item, iIdx) => (
                <li key={item.id || iIdx} className="flex items-center gap-2">
                  <span className="text-tamarind text-xs font-mono font-bold shrink-0">›</span>
                  <Link
                    href={`/posts/${item.slug}`}
                    className="text-xs font-medium text-ink hover:text-tamarind transition-colors line-clamp-1 flex-1 min-w-0"
                  >
                    {item.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
