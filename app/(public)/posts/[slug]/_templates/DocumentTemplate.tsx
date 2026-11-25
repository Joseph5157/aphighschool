import React from "react";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import OrderStateBadge from "@/app/(public)/_components/OrderStateBadge";
import LifecycleStepper from "../_components/LifecycleStepper";
import ThumbZoneBar from "../_components/ThumbZoneBar";
import TableOfContents from "../_components/TableOfContents";
import { MIN_TOC_HEADINGS } from "@/lib/posts/toc";
import RelatedOrdersTimeline from "@/app/(public)/_components/RelatedOrdersTimeline";
import ActionSummary from "../_components/ActionSummary";
import OfficialSourceCard from "../_components/OfficialSourceCard";
import { formatDate, isDeadlinePassed } from "@/lib/dates";
import { stripDecorativeTemplateEmoji } from "@/lib/posts/strip-decorative-template-emoji";
import { dropCompetitorLink } from "@/lib/posts/competitor-domains";

/** One responsive shell for short notices, normal updates and long documents. */
interface DocumentTemplateProps {
  post: any;
  lifecycleView: any;
}

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

function hasMeaningfulArticle(html: string): boolean {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();

  return Boolean(text) || /<(img|table|iframe|ul|ol|blockquote)\b/i.test(html);
}

export default function DocumentTemplate({
  post,
  lifecycleView,
}: DocumentTemplateProps) {
  const labels =
    SECTION_LABELS[lifecycleView.kind as keyof typeof SECTION_LABELS] ??
    SECTION_LABELS.state;
  const renderedContent = stripDecorativeTemplateEmoji(String(post.content ?? ""));
  const hasArticleContent = hasMeaningfulArticle(renderedContent);
  const hasSummary = Boolean(post.summaryTe?.length || post.englishAbstract);

  const formattedDeadline = post.actionDeadline
    ? formatDate(post.actionDeadline)
    : null;
  const isPastDeadline =
    Boolean(post.actionDeadline) && isDeadlinePassed(post.actionDeadline);

  const headingCount = (renderedContent.match(/<h[23][\s>]/gi) || []).length;
  const showToc = hasArticleContent && headingCount >= MIN_TOC_HEADINGS;

  const safeActionUrl = dropCompetitorLink(post.actionUrl);
  const safeSourceUrl = dropCompetitorLink(post.sourceUrl);
  const sourcePost = {
    ...post,
    actionUrl: safeActionUrl,
    sourceUrl: safeSourceUrl,
  };

  // A category index containing only this document sends the reader straight
  // back to the same page. Keep the category breadcrumb for context, but make
  // this prominent closing action useful: only offer the category when it has
  // another published document to discover. Drafts are deliberately excluded
  // by the detail query's filtered category count.
  const categoryPostCount = post.category?._count?.posts ?? 0;
  const hasCategoryAlternatives = Boolean(post.category) && categoryPostCount > 1;
  const indexHref = hasCategoryAlternatives
    ? `/category/${post.category.slug}`
    : "/orders";
  const indexLabel = hasCategoryAlternatives
    ? `Browse ${post.category.nameEn}`
    : "Browse GOs & Proceedings";

  const backLink = (
    <Link
      href={indexHref}
      className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-hair bg-paperRaised px-4 py-3 text-sm font-bold text-tamarind transition-colors hover:border-tamarind/50 hover:bg-tamarind/10"
    >
      <span className="min-w-0">{indexLabel}</span>
      <span className="flex shrink-0 items-center gap-2">
        {hasCategoryAlternatives && (
          <span className="font-mono text-xs font-semibold text-inkSoft">
            {categoryPostCount} documents
          </span>
        )}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );

  const independenceNote = (
    <p className="border-t border-hair pt-4 text-center text-sm leading-relaxed text-inkSoft">
      AP Teacher Desk is an independent information service. GOIR verification
      is shown only where recorded for a document.
    </p>
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 font-sans sm:space-y-5 md:space-y-6">
      <Breadcrumb
        items={[
          { label: "GOs & Proceedings", href: "/orders" },
          ...(post.category
            ? [
                {
                  label: post.category.nameEn,
                  href: `/category/${post.category.slug}`,
                },
              ]
            : []),
          { label: post.goReference || post.titleEn },
        ]}
      />

      <header className="overflow-hidden rounded-2xl border border-hair">
        {lifecycleView.kind === "recruitment" ? (
          <LifecycleStepper
            stages={lifecycleView.stages}
            currentStage={lifecycleView.currentStage}
            isExpired={lifecycleView.isExpired}
          />
        ) : (
          <OrderStateBadge
            state={lifecycleView.state}
            label={lifecycleView.label}
          />
        )}

        <div className="on-masthead relative space-y-4 bg-masthead p-4 text-mastheadText sm:p-6 md:p-8 lg:p-9">
          <div className="flex flex-wrap items-center gap-2 border-b border-mastheadText/20 pb-3 sm:gap-3">
            {post.category && (
              <span className="rounded border border-turmeric/30 bg-turmeric/10 px-2.5 py-1 font-mono text-xs font-semibold text-turmeric">
                {post.category.nameEn}
              </span>
            )}
            {post.goReference && (
              <span className="break-words rounded border border-mastheadText/25 bg-mastheadText/10 px-3 py-1 font-mono text-xs font-bold text-turmeric">
                {post.goReference}
              </span>
            )}
            {post.actionDeadline && (
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs font-semibold tracking-wider ${
                  isPastDeadline
                    ? "bg-mastheadText/15 text-mastheadText/70"
                    : "border border-turmeric/30 bg-turmeric/20 text-turmeric"
                }`}
              >
                {isPastDeadline
                  ? `Deadline passed: ${formattedDeadline}`
                  : `Deadline: ${formattedDeadline}`}
              </span>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-xl font-extrabold leading-snug tracking-tight text-mastheadText sm:text-display md:text-3xl lg:text-4xl">
              {post.titleEn}
            </h1>
            <div
              lang="te"
              className="text-telugu-title font-semibold leading-relaxed text-turmeric md:text-xl"
            >
              {post.titleTe}
            </div>
          </div>
        </div>
      </header>

      <div
        data-post-layout={hasArticleContent ? "article" : "short"}
        className={
          hasSummary
            ? "grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5 xl:gap-6"
            : "ml-auto w-full max-w-xl"
        }
      >
        {hasSummary && (
          <div className="lg:col-span-8 xl:col-span-9">
            <ActionSummary post={post} />
          </div>
        )}

        <aside
          aria-label="Document source and navigation"
          className={hasSummary ? "space-y-4 lg:col-span-4 xl:col-span-3" : "space-y-4"}
        >
          <OfficialSourceCard post={sourcePost} />
          {!hasArticleContent && backLink}
          {!hasArticleContent && independenceNote}
        </aside>
      </div>

      {hasArticleContent && (
        <div
          className={
            showToc
              ? "items-start space-y-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0 xl:gap-10"
              : "space-y-8"
          }
        >
          <div
            className={
              showToc
                ? "min-w-0 space-y-8 lg:col-span-8 xl:col-span-9"
                : "min-w-0 space-y-8"
            }
          >
            <section
              aria-label="Full Article & Guidelines"
              className="space-y-4 rounded-xl border border-hair/80 bg-paperRaised p-5 sm:p-6 md:p-8"
            >
              <div className="border-b border-hair pb-3 font-mono text-xs font-bold tracking-wider text-inkSoft">
                {labels.content}
              </div>
              <div
                className="prose-gazette"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </section>

            <RelatedOrdersTimeline
              relatedOrders={post.relatedFrom}
              label={labels.related}
            />
          </div>

          {showToc ? (
            <div className="lg:col-span-4 xl:col-span-3">
              <TableOfContents />
            </div>
          ) : (
            <TableOfContents />
          )}
        </div>
      )}

      {!hasArticleContent && (
        <RelatedOrdersTimeline
          relatedOrders={post.relatedFrom}
          label={labels.related}
        />
      )}

      {hasArticleContent && (
        <div className="space-y-4 border-t border-hair pt-4">
          {backLink}
          {independenceNote}
        </div>
      )}

      {post.pdfUrl && (
        <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={safeSourceUrl} />
      )}
    </div>
  );
}
