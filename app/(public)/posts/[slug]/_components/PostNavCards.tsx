import React from "react";
import Link from "next/link";
import { Card } from "@/app/(public)/_components/Card";

interface SimplePost {
  slug: string;
  titleEn: string;
  titleTe?: string;
  goReference?: string | null;
}

interface PostNavCardsProps {
  prevPost?: SimplePost | null;
  nextPost?: SimplePost | null;
}

export default function PostNavCards({ prevPost, nextPost }: PostNavCardsProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {prevPost ? (
        <Card hoverable className="p-4 bg-paperRaised border border-hair">
          <Link href={`/posts/${prevPost.slug}`} className="block group space-y-1">
            <div className="font-mono text-xs text-inkSoft flex items-center gap-1">
              <span>←</span>
              <span>Previous Post / క్రితం పోస్ట్</span>
            </div>
            <div className="text-sm font-bold text-ink group-hover:text-tamarind transition-colors line-clamp-2">
              {prevPost.titleEn}
            </div>
          </Link>
        </Card>
      ) : <div />}

      {nextPost ? (
        <Card hoverable className="p-4 bg-paperRaised border border-hair text-left md:text-right">
          <Link href={`/posts/${nextPost.slug}`} className="block group space-y-1">
            <div className="font-mono text-xs text-inkSoft flex items-center justify-start md:justify-end gap-1">
              <span>Next Post / తరువాతి పోస్ట్</span>
              <span>→</span>
            </div>
            <div className="text-sm font-bold text-ink group-hover:text-tamarind transition-colors line-clamp-2">
              {nextPost.titleEn}
            </div>
          </Link>
        </Card>
      ) : <div />}
    </div>
  );
}
