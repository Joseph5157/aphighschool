import React from "react";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import LifecycleStepper from "../_components/LifecycleStepper";
import ThumbZoneBar from "../_components/ThumbZoneBar";
import WhatsAppBanner from "../_components/WhatsAppBanner";
import PostNavCards from "../_components/PostNavCards";
import CategoryStacksGrid from "../_components/CategoryStacksGrid";
import TableOfContents from "../_components/TableOfContents";
import Badge from "@/app/(public)/_components/Badge";
import Button from "@/app/(public)/_components/Button";
import { Card } from "@/app/(public)/_components/Card";
import { officialDate, dateLabel, formatDate } from "@/lib/dates";

interface NotificationTemplateProps {
  post: any;
  lifecycleView: any;
  prevPost: any;
  nextPost: any;
  categoryStacks: any[];
  siblingPosts: any[];
}

export default function NotificationTemplate({
  post,
  lifecycleView,
  prevPost,
  nextPost,
  categoryStacks,
  siblingPosts,
}: NotificationTemplateProps) {
  const formattedDeadline = post.actionDeadline
    ? new Date(post.actionDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const isPastDeadline =
    post.actionDeadline && new Date(post.actionDeadline) < new Date();

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

      {/* Recruitment Stepper Header */}
      {lifecycleView.kind === "recruitment" && (
        <LifecycleStepper
          stages={lifecycleView.stages}
          currentStage={lifecycleView.currentStage}
          isExpired={lifecycleView.isExpired}
        />
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
            {post.actionDeadline && (
              <span
                className={`font-mono text-xs px-3 py-1 rounded-full font-semibold tracking-wider ${
                  isPastDeadline
                    ? "bg-mastheadText/15 text-mastheadText/70"
                    : "bg-turmeric/20 text-turmeric border border-turmeric/30"
                }`}
              >
                {isPastDeadline ? "Closed" : `Deadline: ${formattedDeadline}`}
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

      {/* Telugu Gazette Summary Brief */}
      <section
        aria-label="Summary"
        className="bg-paperRaised border border-hair/80 border-l-4 border-l-kumkum rounded-xl p-5 md:p-6 shadow-2xs"
      >
        <div className="font-mono font-bold text-xs tracking-wider text-kumkum mb-3 flex items-center justify-between">
          <span>సారాంశం — Gazette Brief Summary</span>
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
          <div className="border-t border-dashed border-hair/80 pt-3 mt-4 text-body text-inkSoft italic font-sans">
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
          <span>📋 ముఖ్యాంశాల పట్టిక — Quick Fact Overview</span>
          <span className="text-[10px] text-tamarind font-semibold bg-tamarind/10 px-2 py-0.5 rounded">Fast Reference</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans border-collapse">
            <tbody>
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5 w-1/3">Notification / Document</td>
                <td className="py-2.5 px-3 font-bold text-ink">{post.titleEn}</td>
              </tr>
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">Issuing Department</td>
                <td className="py-2.5 px-3 font-medium text-ink">{post.sourceDept || "AP School Education Department"}</td>
              </tr>
              {post.goReference && (
                <tr className="border-b border-hair/60">
                  <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">G.O. / Reference No.</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-tamarind">{post.goReference}</td>
                </tr>
              )}
              {post.actionDeadline && (
                <tr className="border-b border-hair/60">
                  <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">Key Deadline / Due Date</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-kumkum">{formattedDeadline}</td>
                </tr>
              )}
              <tr className="border-b border-hair/60">
                <td className="py-2.5 px-3 font-semibold text-inkSoft bg-ink/5">Official Repository</td>
                <td className="py-2.5 px-3 font-mono text-inkSoft">goir.ap.gov.in (Verified)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Important Action Links Box */}
      {(post.actionUrl || post.pdfUrl || post.sourceUrl) && (
        <Card className="p-5 md:p-6 bg-paperRaised border-2 border-tamarind/30 rounded-xl space-y-4 shadow-sm">
          <div className="font-mono font-bold text-xs tracking-wider text-tamarind flex items-center justify-between border-b border-tamarind/20 pb-2">
            <span>🔗 ముఖ్యమైన లింకులు — Important Action Links</span>
            <span className="text-[10px] text-inkSoft/70 font-normal">Direct Portals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {post.actionUrl && (
              <a
                href={post.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-tamarind text-white rounded-lg font-bold text-sm shadow hover:bg-tamarindDark transition-colors"
              >
                <span>🚀 Apply Online / Official Portal</span>
                <span className="text-lg">➜</span>
              </a>
            )}

            {post.pdfUrl && (
              <a
                href={post.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-kumkum text-white rounded-lg font-bold text-sm shadow hover:opacity-90 transition-opacity"
              >
                <span>📄 Download Official Notification PDF</span>
                <span className="text-lg">⬇</span>
              </a>
            )}

            {post.sourceUrl && (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-paper border border-hair text-ink font-semibold text-xs rounded-lg hover:border-tamarind transition-colors md:col-span-2"
              >
                <span>🌐 Source Announcement Page ({post.sourceDept || "Amaravathi Teacher"})</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Main Content & Table of Contents Grid (Full PC Screen Layout) */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 space-y-8 lg:space-y-0 items-start">
        {/* Left Column: Full Content & Tables (8 cols LG, 9 cols XL for PC) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8 min-w-0">
          {/* Schools360-Style Step-by-Step Procedure Guide */}
          <div className="bg-paperRaised border border-hair rounded-xl p-5 md:p-6 space-y-3 shadow-2xs">
            <div className="font-mono font-bold text-xs tracking-wider text-tamarind uppercase flex items-center justify-between">
              <span>📝 దరఖాస్తు / పరిశీలన విధానం — Step-by-Step Procedure Guide</span>
              <span className="text-[10px] text-inkSoft/70 font-normal">Action Steps</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div className="bg-paper p-3 rounded-lg border border-hair text-xs space-y-1">
                <div className="font-mono text-[10px] font-bold text-tamarind">STEP 1</div>
                <div className="font-bold text-ink">అధికారిక వెబ్‌సైట్ ఓపెన్ చేయండి</div>
                <div className="text-[11px] text-inkSoft">Visit official portal via the download links above.</div>
              </div>
              <div className="bg-paper p-3 rounded-lg border border-hair text-xs space-y-1">
                <div className="font-mono text-[10px] font-bold text-tamarind">STEP 2</div>
                <div className="font-bold text-ink">నోటిఫికేషన్ మార్గదర్శకాలు చూడండి</div>
                <div className="text-[11px] text-inkSoft">Read eligibility rules and instructions carefully.</div>
              </div>
              <div className="bg-paper p-3 rounded-lg border border-hair text-xs space-y-1">
                <div className="font-mono text-[10px] font-bold text-tamarind">STEP 3</div>
                <div className="font-bold text-ink">వివరాలు ఎంటర్ చేయండి</div>
                <div className="text-[11px] text-inkSoft">Fill required details or hall ticket credentials.</div>
              </div>
              <div className="bg-paper p-3 rounded-lg border border-hair text-xs space-y-1">
                <div className="font-mono text-[10px] font-bold text-tamarind">STEP 4</div>
                <div className="font-bold text-ink">ప్రింట్ / డౌన్‌లోడ్ తీసుకోండి</div>
                <div className="text-[11px] text-inkSoft">Download & print your final acknowledgement/PDF.</div>
              </div>
            </div>
          </div>

          {post.content && (
            <section
              aria-label="Full Article & Guidelines"
              className="bg-paperRaised border border-hair/80 rounded-xl p-6 md:p-8 shadow-2xs space-y-4"
            >
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft border-b border-hair pb-3 flex items-center justify-between">
                <span>📖 పూర్తి వివరాలు & మార్గదర్శకాలు — Complete Guidelines & Schedules</span>
                <span className="text-[10px] text-inkSoft/70">Structured Document</span>
              </div>

              <div
                className="prose-gazette overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </section>
          )}

          {/* Related Background Orders */}
          {post.relatedFrom && post.relatedFrom.length > 0 && (
            <section aria-label="Related Background Orders" className="space-y-4">
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
                <span>🔗 Related Background Orders</span>
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
        </div>

        {/* Right Column: Sticky Table of Contents Sidebar (4 cols LG, 3 cols XL) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <TableOfContents />
        </div>
      </div>

      {/* Previous & Next Post Navigation */}
      <PostNavCards prevPost={prevPost} nextPost={nextPost} />

      {/* Bottom Category Stacks */}
      <CategoryStacksGrid stacks={categoryStacks} />

      {/* Footer */}
      <footer className="border-t border-hair pt-4 text-center text-xs text-inkSoft/70 font-sans leading-relaxed">
        <p>
          AP Teacher Desk is an independent information service for teachers. Official G.O. documents are verified against goir.ap.gov.in.
        </p>
      </footer>

      {post.pdfUrl && <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={post.sourceUrl} />}
    </div>
  );
}
