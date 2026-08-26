"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../_components/Tabs";
import Link from "next/link";

// Maps category slug → display emoji icon
const SLUG_ICON: Record<string, string> = {
  "govt-orders": "📜",
  "circulars": "🔄",
  "memos": "📋",
  "proceedings": "⚖️",
  "notifications": "🔔",
  "default": "📄",
};

// Maps tab value → category slugs it matches
const TAB_SLUGS: Record<string, string[]> = {
  "go": ["govt-orders"],
  "memo": ["memos"],
  "proceedings": ["proceedings"],
  "circular": ["circulars"],
  "notification": ["notifications"],
};

type CategoryData = {
  id: string;
  nameEn: string;
  nameTe: string;
  slug: string;
  icon: string | null;
  color?: string | null;
  _count: { posts: number };
  posts: { id: string; slug: string; titleEn: string; goReference?: string | null; createdAt: Date }[];
};

const DOC_TYPE_TABS = [
  { value: "all", label: "All", icon: "" },
  { value: "go", label: "G.O.s", icon: "📜" },
  { value: "memo", label: "Memos", icon: "📋" },
  { value: "proceedings", label: "Proceedings", icon: "⚖️" },
  { value: "circular", label: "Circulars", icon: "🔄" },
  { value: "notification", label: "Notifications", icon: "🔔" },
];

export default function OrdersFilterTabs({ categories }: { categories: CategoryData[] }) {
  return (
    <Tabs defaultValue="all">
      <TabsList className="overflow-x-auto">
        {DOC_TYPE_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.icon && <span>{tab.icon}</span>} {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {DOC_TYPE_TABS.map((tab) => {
        const filtered =
          tab.value === "all"
            ? categories
            : categories.filter((c) => (TAB_SLUGS[tab.value] || []).includes(c.slug));

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.length > 0 ? (
                filtered.map((cat) => {
                  const icon = SLUG_ICON[cat.slug] || SLUG_ICON.default;
                  const count = cat._count?.posts || 0;
                  return (
                    <div
                      key={cat.id}
                      className="group bg-paperRaised border border-hair/70 rounded-2xl overflow-hidden hover:shadow-md hover:border-ink/30 transition-all"
                    >
                      {/* Card Header */}
                      <div
                        className="px-5 py-4 border-b border-hair/60 flex items-center justify-between"
                        style={{ borderLeftColor: cat.color || "var(--color-turmeric)", borderLeftWidth: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl" aria-hidden="true">{icon}</span>
                          <div>
                            <h2 className="font-bold text-ink text-sm tracking-tight group-hover:text-tamarind transition-colors">
                              {cat.nameEn}
                            </h2>
                            <div className="text-xs text-inkSoft" style={{ fontFamily: "var(--font-noto-telugu), sans-serif", lineHeight: "1.6" }}>
                              {cat.nameTe}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-ink bg-ink/10 px-2.5 py-1 rounded-full">
                          {count} docs
                        </span>
                      </div>

                      {/* Recent posts preview */}
                      <div className="px-5 py-3 space-y-2.5 min-h-[96px]">
                        {cat.posts && cat.posts.length > 0 ? (
                          cat.posts.map((post) => (
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
                        <div className="px-5 py-3 border-t border-hair/60 bg-paper group-hover:bg-ink transition-colors flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-ink group-hover:text-paper transition-colors">
                            View All {count} Documents
                          </span>
                          <span className="text-ink group-hover:text-turmeric transition-colors font-mono text-sm">→</span>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs font-mono text-inkSoft col-span-2 py-4 text-center">No categories found for this document type.</p>
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
