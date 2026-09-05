import React from "react";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import LifecycleStepper from "../_components/LifecycleStepper";
import ThumbZoneBar from "../_components/ThumbZoneBar";
import WhatsAppBanner from "../_components/WhatsAppBanner";
import PostNavCards from "../_components/PostNavCards";
import CategoryStacksGrid from "../_components/CategoryStacksGrid";
import TableOfContents from "../_components/TableOfContents";
import ActionSummary from "../_components/ActionSummary";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import { officialDate, dateLabel, formatDate } from "@/lib/dates";

interface NotificationTemplateProps { post: any; lifecycleView: any; prevPost: any; nextPost: any; categoryStacks: any[]; siblingPosts: any[]; }

export default function NotificationTemplate({ post, lifecycleView, prevPost, nextPost, categoryStacks }: NotificationTemplateProps) {
  const formattedDeadline = post.actionDeadline ? formatDate(post.actionDeadline) : null;
  const isPastDeadline = post.actionDeadline && new Date(post.actionDeadline) < new Date();

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-8 pb-24 font-sans px-2 sm:px-4">
      <Breadcrumb items={[{ label: "Orders", href: "/orders" }, ...(post.category ? [{ label: post.category.nameEn, href: `/category/${post.category.slug}` }] : []), { label: post.goReference || post.titleEn }]} />
      {lifecycleView.kind === "recruitment" && <LifecycleStepper stages={lifecycleView.stages} currentStage={lifecycleView.currentStage} isExpired={lifecycleView.isExpired} />}

      <div className="bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 lg:p-10 space-y-5 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-mastheadText/20 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {post.verifiedAgainstGoir && <Badge variant="success" size="sm" shape="pill" dot>GOIR Verified Gazette</Badge>}
            {post.category && <span className="font-mono text-xs font-semibold text-turmeric bg-turmeric/10 px-2.5 py-1 rounded border border-turmeric/20">{post.category.nameEn}</span>}
            {post.actionDeadline && <span className={`font-mono text-xs px-3 py-1 rounded-full font-semibold tracking-wider ${isPastDeadline ? "bg-mastheadText/15 text-mastheadText/70" : "bg-turmeric/20 text-turmeric border border-turmeric/30"}`}>{isPastDeadline ? "Closed" : `Deadline: ${formattedDeadline}`}</span>}
          </div>
          {post.goReference && <span className="font-mono text-xs font-bold text-turmeric bg-mastheadText/10 px-3 py-1 rounded border border-mastheadText/20 break-words">{post.goReference}</span>}
        </div>
        <div className="space-y-3">
          <h1 className="text-display text-mastheadText tracking-tight leading-snug md:text-3xl lg:text-4xl font-extrabold">{post.titleEn}</h1>
          <div lang="te" className="text-telugu-title text-turmeric font-semibold leading-relaxed text-lg md:text-xl">{post.titleTe}</div>
        </div>
        <div className="text-meta text-mastheadText/60 pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-mastheadText/20">
          {post.sourceDept && <span>{post.sourceDept}</span>}
          <span>{dateLabel(post)}: {formatDate(officialDate(post))}</span>
        </div>
      </div>

      <WhatsAppBanner />
      <ActionSummary post={post} />

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 space-y-8 lg:space-y-0 items-start">
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 min-w-0">
          {post.content && (
            <section aria-label="Full Article & Guidelines" className="bg-paperRaised border border-hair/80 rounded-xl p-6 md:p-8 shadow-2xs space-y-4">
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft border-b border-hair pb-3 flex items-center justify-between"><span>Complete Guidelines & Schedules</span><span className="text-[10px] text-inkSoft/70">Structured Document</span></div>
              <div className="prose-gazette overflow-x-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
            </section>
          )}
          {post.relatedFrom && post.relatedFrom.length > 0 && (
            <section aria-label="Related Background Orders" className="space-y-4">
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2"><span>Related Background Orders</span><Badge variant="neutral" size="sm" shape="pill">{post.relatedFrom.length}</Badge></div>
              <div className="space-y-3">
                {post.relatedFrom.map((rel: any) => (
                  <Card key={rel.relatedPost.id} hoverable className="p-4 bg-paperRaised">
                    <Link href={`/posts/${rel.relatedPost.slug}`} className="block group space-y-1">
                      <div className="flex items-center justify-between gap-2 text-meta text-inkSoft"><span className="font-bold text-tamarind min-w-0 break-words">{rel.relatedPost.goReference || "Background G.O."}</span><span className="shrink-0">{dateLabel(rel.relatedPost)} · {formatDate(officialDate(rel.relatedPost))}</span></div>
                      <div className="text-card-title text-ink group-hover:text-tamarind transition-colors">{rel.relatedPost.titleEn}</div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="lg:col-span-4 xl:col-span-3"><TableOfContents /></div>
      </div>

      <PostNavCards prevPost={prevPost} nextPost={nextPost} />
      <CategoryStacksGrid stacks={categoryStacks} />
      <footer className="border-t border-hair pt-4 text-center text-xs text-inkSoft/70 font-sans leading-relaxed"><p>AP Teacher Desk is an independent information service. GOIR verification is shown only where recorded for a document.</p></footer>
      {post.pdfUrl && <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={post.sourceUrl} />}
    </div>
  );
}
