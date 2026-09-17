import React from "react";
import Link from "next/link";
import DocumentDate from "@/app/(public)/_components/DocumentDate";
import Badge from "@/app/(public)/_components/Badge";

interface RelatedOrderItem {
  relatedPost: {
    id: string;
    slug: string;
    titleEn: string;
    titleTe?: string | null;
    goReference?: string | null;
    documentDate: Date | null;
    createdAt: Date;
    orderState?: string | null;
  };
}

interface RelatedOrdersTimelineProps {
  relatedOrders: RelatedOrderItem[];
  label: string;
}

export default function RelatedOrdersTimeline({
  relatedOrders,
  label,
}: RelatedOrdersTimelineProps) {
  if (!relatedOrders || relatedOrders.length === 0) return null;

  return (
    <section aria-label="Related Background Orders Timeline" className="space-y-4">
      <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
        <span>{label}</span>
        <Badge variant="neutral" size="sm" shape="pill">
          {relatedOrders.length}
        </Badge>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-hair">
        {relatedOrders.map((rel) => {
          const item = rel.relatedPost;
          return (
            <div key={item.id} className="relative group">
              {/* Timeline Connector Node */}
              <div className="absolute -left-6 top-2.5 w-2.5 h-2.5 rounded-full bg-tamarind border border-paperRaised transition-transform group-hover:scale-125" />

              <div className="bg-paperRaised border border-hair/80 rounded-lg p-4 hover:border-tamarind/50 transition-colors">
                <Link href={`/posts/${item.slug}`} className="block space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-meta text-inkSoft flex-wrap">
                    <span className="font-mono font-bold text-tamarind min-w-0 break-words text-xs">
                      {item.goReference || "Background Order"}
                    </span>
                    <DocumentDate post={item} className="shrink-0 font-mono text-xs text-inkSoft/80" />
                  </div>

                  <h4 className="text-card-title text-ink font-semibold group-hover:text-tamarind transition-colors leading-snug">
                    {item.titleEn}
                  </h4>

                  {item.titleTe && (
                    <p lang="te" className="font-telugu text-xs text-inkSoft/90 truncate">
                      {item.titleTe}
                    </p>
                  )}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
