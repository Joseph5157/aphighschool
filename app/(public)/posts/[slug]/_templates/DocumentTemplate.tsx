import React from "react";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import OrderStateBadge from "@/app/(public)/_components/OrderStateBadge";
import GoirBadge from "@/app/(public)/_components/GoirBadge";
import DocumentDate from "@/app/(public)/_components/DocumentDate";
import LifecycleStepper from "../_components/LifecycleStepper";
import ThumbZoneBar from "../_components/ThumbZoneBar";
import TableOfContents, { MIN_TOC_HEADINGS } from "../_components/TableOfContents";
import ActionSummary from "../_components/ActionSummary";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import { formatDate } from "@/lib/dates";
import { stripDecorativeTemplateEmoji } from "@/lib/posts/strip-decorative-template-emoji";

/**
 * The document detail shell, shared by every published document.
 *
 * `GoMemoTemplate` and `NotificationTemplate` were 95% the same file. Both
 * carried their own copy of the breadcrumb trail, the masthead header, the GOIR
 * badge, the date line, the content section, the related-orders list and the
 * independence footer — so a change to any of those had to be made twice, and a
 * change made once was a silent divergence.
 *
 * Only three things genuinely differed, and all three are still here:
 *
 *  1. The lifecycle indicator. `resolveLifecycle()` already discriminates on
 *     documentType, so the shell renders whichever branch the view describes
 *     rather than the caller choosing a template to express the same thing.
 *  2. Two section labels, which read differently for a recruitment notification
 *     than for an order.
 *  3. The action-deadline pill — see below.
 */
interface DocumentTemplateProps {
  post: any;
  lifecycleView: any;
}

/**
 * Labels that legitimately differ by document kind. A notification's body is a
 * schedule; an order's body is operative text.
 */
const SECTION_LABELS = {
  recruitment: {
    content: "Complete Guidelines & Schedules",
    related: "Related Background Orders",
  },
  state: {
    content: "Full Order Text & Clauses",
    related: "Background & Amending Orders",
  },
} as const;

export default function DocumentTemplate({
  post,
  lifecycleView,
}: DocumentTemplateProps) {
  const labels = SECTION_LABELS[lifecycleView.kind as keyof typeof SECTION_LABELS] ?? SECTION_LABELS.state;
  // Imported HTML may contain the source site's sharing/recirculation furniture.
  // Strip only class-bound decorative markers; do not rewrite quoted document text.
  const renderedContent = stripDecorativeTemplateEmoji(String(post.content ?? ""));

  // An action deadline is orthogonal to the lifecycle KIND — lib/posts/lifecycle.ts
  // says so explicitly, and isLifecycleClosed() already treats a passed deadline
  // as closing a document of EITHER kind. Only NotificationTemplate rendered it,
  // so a GO that opens an application window (the seeded GO 129) was filtered as
  // closed once its deadline passed while its own page showed no deadline at
  // all. Merging the templates is what makes that visible; showing it for both
  // is what makes the page agree with the filter.
  const formattedDeadline = post.actionDeadline ? formatDate(post.actionDeadline) : null;
  const isPastDeadline = Boolean(post.actionDeadline) && new Date(post.actionDeadline) < new Date();

  // The same threshold TableOfContents applies, decided here as well so the
  // LAYOUT can follow it. TableOfContents renders nothing below the threshold,
  // but the grid column reserved for it does not disappear on its own — a short
  // document was left with a quarter of the desktop width held empty beside its
  // text. Counted from the stored HTML rather than the DOM because this decides
  // server-rendered markup; the component still owns whether it draws anything.
  const headingCount = (renderedContent.match(/<h[23][\s>]/gi) || []).length;
  const showToc = headingCount >= MIN_TOC_HEADINGS;

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-8 pb-24 font-sans">
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          ...(post.category
            ? [{ label: post.category.nameEn, href: `/category/${post.category.slug}` }]
            : []),
          { label: post.goReference || post.titleEn },
        ]}
      />

      {/*
        One document header (AI_SLOP_AUDIT.md A09). The state indicator, the
        masthead and the At a Glance card used to be three consecutive
        full-width bordered panels before the order text, and between them the
        reference, department, date, deadline and GOIR check each appeared
        twice. The indicator is now the strip that opens this block — state
        first, still the first thing on the page — and the facts appear once,
        here, where the document identifies itself.
      */}
      <header className="rounded-2xl border border-hair overflow-hidden">
        {lifecycleView.kind === "recruitment" ? (
          <LifecycleStepper
            stages={lifecycleView.stages}
            currentStage={lifecycleView.currentStage}
            isExpired={lifecycleView.isExpired}
          />
        ) : (
          <OrderStateBadge state={lifecycleView.state} label={lifecycleView.label} />
        )}

        <div className="on-masthead bg-masthead text-mastheadText p-6 md:p-8 lg:p-10 space-y-5 relative">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-mastheadText/20 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <GoirBadge verified={post.verifiedAgainstGoir} />
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
                {isPastDeadline
                  ? `Deadline passed: ${formattedDeadline}`
                  : `Deadline: ${formattedDeadline}`}
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
          <div lang="te" className="text-telugu-title text-turmeric font-semibold leading-relaxed text-lg md:text-xl">
            {post.titleTe}
          </div>
        </div>

        <div className="text-meta text-mastheadText/60 pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-mastheadText/20">
          {post.sourceDept && <span>{post.sourceDept}</span>}
          <DocumentDate post={post} separator=": " />
        </div>
        </div>
      </header>

      <ActionSummary post={post} />

      <div className={showToc ? "lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-10 space-y-8 lg:space-y-0 items-start" : "space-y-8"}>
        <div className={showToc ? "lg:col-span-8 xl:col-span-9 space-y-8 min-w-0" : "space-y-8 min-w-0"}>
          {post.content && (
            <section
              aria-label="Full Article & Guidelines"
              className="bg-paperRaised border border-hair/80 rounded-xl p-6 md:p-8 space-y-4"
            >
              {/*
                "Structured Document" sat opposite this label and said nothing
                actionable about the document, the section or what to do next —
                generic filler beside a heading that already names the content
                (AI_SLOP_AUDIT.md A10).
              */}
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft border-b border-hair pb-3">
                {labels.content}
              </div>
              <div className="prose-gazette" dangerouslySetInnerHTML={{ __html: renderedContent }} />
            </section>
          )}

          {post.relatedFrom && post.relatedFrom.length > 0 && (
            <section aria-label="Related Background Orders" className="space-y-4">
              <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
                <span>{labels.related}</span>
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
                        <DocumentDate post={rel.relatedPost} className="shrink-0" />
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

        {/*
          Mounted either way: below the threshold it draws nothing, but its
          effect still assigns the heading ids that make a direct link to a
          section work on a document with no contents list.
        */}
        {showToc ? (
          <div className="lg:col-span-4 xl:col-span-3">
            <TableOfContents />
          </div>
        ) : (
          <TableOfContents />
        )}
      </div>

      {/*
        One quiet way back to the index this document belongs to. It replaces
        Previous/Next Post cards and the two "Latest Updates & Softwares"
        Category Stacks (AI_SLOP_AUDIT.md A11): chronological adjacency and
        site-wide recency are not relationships between documents, and they
        competed for space with the Related Orders above, which are.
      */}
      <div className="border-t border-hair pt-4">
        <Link
          href={post.category ? `/category/${post.category.slug}` : "/orders"}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-tamarind hover:underline"
        >
          <span aria-hidden="true">←</span>
          <span>
            {post.category ? `All ${post.category.nameEn}` : "All orders & documents"}
          </span>
        </Link>
      </div>

      <footer className="border-t border-hair pt-4 text-center text-xs text-inkSoft/80 font-sans leading-relaxed">
        <p>
          AP Teacher Desk is an independent information service. GOIR verification is shown
          only where recorded for a document.
        </p>
      </footer>

      {post.pdfUrl && <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={post.sourceUrl} />}
    </div>
  );
}
