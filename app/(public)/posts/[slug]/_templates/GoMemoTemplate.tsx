import React from "react";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import OrderStateBadge from "@/app/(public)/_components/OrderStateBadge";
import ThumbZoneBar from "../_components/ThumbZoneBar";
import WhatsAppBanner from "../_components/WhatsAppBanner";
import PostNavCards from "../_components/PostNavCards";
import CategoryStacksGrid from "../_components/CategoryStacksGrid";
import TableOfContents from "../_components/TableOfContents";
import Badge from "@/app/(public)/_components/Badge";
import Button from "@/app/(public)/_components/Button";
import { Card } from "@/app/(public)/_components/Card";
import { officialDate, dateLabel, formatDate } from "@/lib/dates";

interface GoMemoTemplateProps {
  post: any;
  lifecycleView: any;
  prevPost: any;
  nextPost: any;
  categoryStacks: any[];
}

export default function GoMemoTemplate({
  post,
  lifecycleView,
  prevPost,
  nextPost,
  categoryStacks,
}: GoMemoTemplateProps) {
  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-8 pb-24 font-sans px-2 sm:px-4">
      {/* Breadcrumb Trail */}
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          ...(post.category ? [{ label: post.category.nameEn, href: `/category/${post.category.slug}` }] : []),
          { label: post.goReference || post.titleEn },
        ]}
      />

      {/* Order State Badge (Current, Amended, Superseded) */}
      {lifecycleView.kind === "state" && (
        <OrderStateBadge state={lifecycleView.state} label={lifecycleView.label} />
      )}

      {/* Imperial Gazette Hero Header */}
      <div className="bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 lg:p-10 space-y-5 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-mastheadText/20 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {post.verifiedAgainstGoir && (
              <Badge variant="success" size="sm" shape="pill" dot>
                GOIR Verified Gazette
              </Badge>
            )}
            {post.category && (
              <span className="font-mono text-xs font-semibold text-turmeric bg-turmeric/10 px-2.5 py-1 rounded border border-turmeric/20">
                {post.category.nameEn}
              </span>
            )}
          </div>

          {post.goReference && (
            <span className="font-mono text-xs font-bold text-turmeric bg-mastheadText/10 px-3 py-1 rounded border border-mastheadText/20 break-words">
              {post.goReference}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-display text-mastheadText tracking-tight leading-snug md:text-3xl lg:text-4xl font-extrabold">
            {post.titleEn}
          </h1>
          <div className="text-telugu-title text-turmeric font-semibold leading-relaxed text-lg md:text-xl">
            {post.titleTe}
          </div>
        </div>

        <div className="text-meta text-mastheadText/60 pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-mastheadText/20">
          <span>{post.sourceDept || "AP School Education Department"}</span>
          <span>
            {dateLabel(post)}: {formatDate(officialDate(post))}
          </span>
        </div>
      </div>

      {/* WhatsApp Join Bar */}
      <WhatsAppBanner />

      {/* Executive Telugu Summary Brief */}
      <section
        aria-label="Summary"
        className="bg-paperRaised border border-hair/80 border-l-4 border-l-kumkum rounded-xl p-5 md:p-6 shadow-2xs"
      >
        <div className="font-mono font-bold text-xs tracking-wider text-kumkum mb-3 flex items-center justify-between">
          <span>సారాంశం — Executive Order Brief</span>
          <span className="text-[10px] text-inkSoft/70 font-normal">Living Document Brief</span>
        </div>

        {post.summaryTe && post.summaryTe.length > 0 && (
          <ul lang="te" className="font-telugu text-base text-ink font-medium leading-relaxed list-disc list-inside space-y-2.5">
            {post.summaryTe.map((bullet: string, idx: number) => (
              <li key={idx} className="pl-1">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {post.englishAbstract && (
          <div className="border-t border-dashed border-hair/80 pt-3 mt-4 text-xs text-inkSoft italic font-sans leading-relaxed">
            <strong className="font-mono text-[10px] font-bold text-inkSoft not-italic block mb-1">
              English Executive Abstract
            </strong>
            {post.englishAbstract}
          </div>
        )}
      </section>

      {/* Schools360-Style Quick Fact Overview Box */}
      <Card className="p-5 md:p-6 bg-paperRaised border border-hair/80 rounded-xl space-y-4 shadow-2xs">
        <div className="font-mono font-bold text-xs tracking-wider text-inkSoft uppercase border-b border-hair pb-2 flex items-center justify-between">
          <span>📋 ముఖ్యాంశాల పట్టిక — Quick Order Fact Sheet</span>
          <span className="text-[10px] text-tamarind font-semibold bg-tamarind/10 px-2 py-0.5 rounded">Fast Reference</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <tbody>
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5 w-1/3">Order Title</td>
                <td className="py-2.5 px-3 font-bold text-ink">{post.titleEn}</td>
              </tr>
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">Issuing Department</td>
                <td className="py-2.5 px-3 font-medium text-ink">{post.sourceDept || "AP School Education Department"}</td>
              </tr>
              {post.goReference && (
                <tr className="border-b border-hair/60">
                  <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">G.O. / Memo Number</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-tamarind">{post.goReference}</td>
                </tr>
              )}
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">Official Date</td>
                <td className="py-2.5 px-3 font-mono text-ink">{formatDate(officialDate(post))}</td>
              </tr>
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">GOIR Verification</td>
                <td className="py-2.5 px-3 font-mono text-tamarind font-semibold">goir.ap.gov.in (Verified)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Main Content Grid (Full PC Screen Layout) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 space-y-8 lg:space-y-0 items-start">
        {/* Left Column (8 cols LG, 9 cols XL): Content + Background Orders + PDF */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 min-w-0">
          {post.content && (
            <section
              aria-label="Full Article & Guidelines"
              className="bg-paperRaised border border-hair/80 rounded-xl p-6 md:p-8 shadow-2xs space-y-4"
            >
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft border-b border-hair pb-3 flex items-center justify-between">
                <span>📖 ఉత్తర్వులు & వివరాలు — Full Order Text & Clauses</span>
                <span className="text-[10px] text-inkSoft/70">Structured Document</span>
              </div>

              <div
                className="prose-gazette overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </section>
          )}

          {/* Background Orders Relationship Tree */}
          {post.relatedFrom && post.relatedFrom.length > 0 && (
            <section aria-label="Related Background Orders" className="space-y-4">
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
                <span>🔗 Background & Amending Orders</span>
                <Badge variant="neutral" size="sm" shape="pill">
                  {post.relatedFrom.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {post.relatedFrom.map((rel: any) => (
                  <Card key={rel.relatedPost.id} hoverable className="p-4 bg-paperRaised">
                    <Link href={`/posts/${rel.relatedPost.slug}`} className="block group space-y-1">
                      <div className="flex items-center justify-between gap-2 text-meta text-inkSoft">
                        <span className="font-bold text-tamarind min-w-0 break-words">
                          {rel.relatedPost.goReference || "Background G.O."}
                        </span>
                        <span className="shrink-0">
                          {dateLabel(rel.relatedPost)} · {formatDate(officialDate(rel.relatedPost))}
                        </span>
                      </div>
                      <div className="text-card-title text-ink group-hover:text-tamarind transition-colors">
                        {rel.relatedPost.titleEn}
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* PDF Attachment Card */}
          {post.pdfUrl && (
            <Card className="p-6 bg-paperRaised border-hair space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-card-title text-ink">Official Gazette PDF Attachment</h3>
                  <p className="text-xs font-mono text-inkSoft mt-0.5">
                    Verified PDF source from AP Government Orders Information Repository
                  </p>
                </div>
                <a href={post.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="tamarind" size="md" rightIcon={<span>↗</span>}>
                    Open Original GO PDF
                  </Button>
                </a>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (4 cols LG, 3 cols XL): Sticky TOC Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <TableOfContents />
        </div>
      </div>

      {/* Previous & Next Post Cards */}
      <PostNavCards prevPost={prevPost} nextPost={nextPost} />

      {/* Bottom Category Stacks */}
      <CategoryStacksGrid stacks={categoryStacks} />

      {/* Footer */}
      <footer className="border-t border-hair pt-4 text-center font-mono text-[10px] text-inkSoft/70">
        <p>
          AP Teacher Desk is an independent information service for teachers. Official G.O. documents are verified against goir.ap.gov.in.
        </p>
      </footer>

      {post.pdfUrl && <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={post.sourceUrl} />}
    </div>
  );
}
