import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import LifecycleStepper from "./_components/LifecycleStepper";
import ThumbZoneBar from "./_components/ThumbZoneBar";
import Badge from "@/app/(public)/_components/Badge";
import OrderStateBadge from "@/app/(public)/_components/OrderStateBadge";
import { resolveLifecycle } from "@/lib/posts/lifecycle";
import Button from "@/app/(public)/_components/Button";
import { Card } from "@/app/(public)/_components/Card";
import { officialDate, dateLabel, formatDate, ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";
import { safeQuery, optionalQuery } from "@/lib/db-safe";

export const revalidate = 3600; // ISR revalidation (1 hour)

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await prisma.post.findFirst({
      where: { slug: params.slug, isDraft: false },
      select: { titleEn: true, titleTe: true, summaryTe: true },
    });

    if (!post) {
      return {
        title: "Order Not Found — AP Teacher Desk",
      };
    }

    const description =
      post.summaryTe && post.summaryTe.length > 0
        ? post.summaryTe[0]
        : post.titleTe;

    return {
      title: `${post.titleEn} — AP Teacher Desk`,
      description: `${description} Official AP School Education government order summary.`,
    };
  } catch (e) {
    return {
      title: "AP Teacher Desk",
    };
  }
}

export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { isDraft: false },
      select: { slug: true },
    });
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (e) {
    return [];
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await safeQuery("post-detail", () =>
    prisma.post.findFirst({
      where: { slug: params.slug, isDraft: false },
      include: {
        category: true,
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: {
            relatedPost: {
              select: {
                id: true,
                slug: true,
                titleEn: true,
                titleTe: true,
                goReference: true,
                createdAt: true,
                documentDate: true,
              },
            },
          },
        },
      },
    })
  );

  if (!post) {
    notFound();
  }

  const formattedDeadline = post.actionDeadline
    ? new Date(post.actionDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const isPastDeadline =
    post.actionDeadline && new Date(post.actionDeadline) < new Date();

  const postCategory = post.category;
  const siblingPosts = postCategory
    ? await optionalQuery(
        "post-siblings",
        () =>
          prisma.post.findMany({
            where: {
              isDraft: false,
              categoryId: postCategory.id,
              id: { not: post.id },
            },
            orderBy: ORDER_BY_OFFICIAL_DATE,
            take: 3,
            select: { id: true, slug: true, titleEn: true, goReference: true, createdAt: true, documentDate: true },
          }),
        []
      )
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 font-sans">
      {/* Breadcrumb Trail & SEO Schema */}
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          ...(post.category ? [{ label: post.category.nameEn, href: `/category/${post.category.slug}` }] : []),
          { label: post.goReference || post.titleEn },
        ]}
      />

      {/* 1. Lifecycle — recruitment stages for notifications, order state otherwise */}
      {(() => {
        const view = resolveLifecycle(post);
        return view.kind === "recruitment" ? (
          <LifecycleStepper
            stages={view.stages}
            currentStage={view.currentStage}
            isExpired={view.isExpired}
          />
        ) : (
          <OrderStateBadge state={view.state} label={view.label} />
        );
      })()}

      {/* 2. OPTION A: Imperial Gazette Hero Header Block */}
      <div className="bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 space-y-5 shadow-md relative overflow-hidden">
        {/* Badges & References Bar */}
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
            <span className="font-mono text-xs font-bold text-turmeric bg-mastheadText/10 px-3 py-1 rounded border border-mastheadText/20">
              {post.goReference}
            </span>
          )}
        </div>

        {/* Bilingual Headlines */}
        <div className="space-y-2">
          <h1 className="text-display text-mastheadText tracking-tight leading-snug">
            {post.titleEn}
          </h1>
          <div className="text-telugu-title text-turmeric font-medium leading-relaxed">
            {post.titleTe}
          </div>
        </div>

        {/* Gazette Metadata */}
        <div className="text-meta text-mastheadText/60 pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-mastheadText/20">
          <span>{post.sourceDept || "AP School Education Department"}</span>
          <span>
            {dateLabel(post)}: {formatDate(officialDate(post))}
          </span>
        </div>
      </div>

      {/* 3. OPTION A: Telugu Gazette Summary Brief */}
      <section
        aria-label="Summary"
        className="bg-paperRaised border border-hair/80 border-l-4 border-l-kumkum rounded-xl p-5 md:p-6 shadow-2xs"
      >
        <div className="font-mono font-bold text-xs tracking-wider text-kumkum mb-3 flex items-center justify-between">
          <span>సారాంశం — Gazette Brief Summary</span>
          <span className="text-[10px] text-inkSoft/70 font-normal">Living Document Brief</span>
        </div>

        {post.summaryTe && post.summaryTe.length > 0 && (
          <ul className="font-telugu text-sm text-ink font-medium leading-relaxed list-disc list-inside space-y-2.5">
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

      {/* 4. Related Background Orders Block */}
      {post.relatedFrom && post.relatedFrom.length > 0 && (
        <section
          aria-label="Related Background Orders"
          className="space-y-4"
        >
          <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
            <span>🔗 Related Background Orders</span>
            <Badge variant="neutral" size="sm" shape="pill">
              {post.relatedFrom.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {post.relatedFrom.map((rel: any) => (
              <Card key={rel.relatedPost.id} hoverable className="p-4 bg-paperRaised">
                <Link
                  href={`/posts/${rel.relatedPost.slug}`}
                  className="block group space-y-1"
                >
                  <div className="flex items-center justify-between text-meta text-inkSoft">
                    <span className="font-bold text-tamarind">
                      {rel.relatedPost.goReference || "Background G.O."}
                    </span>
                    <span>
                      {dateLabel(rel.relatedPost)} · {formatDate(officialDate(rel.relatedPost))}
                    </span>
                  </div>
                  <div className="text-card-title text-ink group-hover:text-tamarind transition-colors">
                    {rel.relatedPost.titleEn}
                  </div>
                  {rel.relationshipNote && (
                    <div className="text-xs font-mono text-inkSoft/80 pt-1">
                      Note: {rel.relationshipNote}
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 4b. Sibling Posts — More from this category */}
      {siblingPosts.length > 0 && (
        <section aria-label="More from this category" className="space-y-3">
          <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
            <span>📂 More from {postCategory?.nameEn}</span>
          </div>
          <div className="space-y-2">
            {siblingPosts.map((sibling) => (
              <Card key={sibling.id} hoverable className="p-4 bg-paperRaised">
                <Link href={`/posts/${sibling.slug}`} className="block group space-y-0.5">
                  <div className="flex items-center justify-between text-meta text-inkSoft">
                    <span className="font-bold text-tamarind">{sibling.goReference || "G.O."}</span>
                    <span>{dateLabel(sibling)} · {formatDate(officialDate(sibling))}</span>
                  </div>
                  <div className="text-card-title text-ink group-hover:text-tamarind transition-colors line-clamp-2">
                    {sibling.titleEn}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 5. PDF & External Actions */}
      {post.pdfUrl && (
        <Card className="p-6 bg-paperRaised border-hair space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-card-title text-ink">Official Gazette PDF Attachment</h3>
              <p className="text-xs font-mono text-inkSoft mt-0.5">
                Verified PDF source from AP Government Orders Information Repository
              </p>
            </div>
            <a
              href={post.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="tamarind" size="md" rightIcon={<span>↗</span>}>
                Open Original GO PDF
              </Button>
            </a>
          </div>
        </Card>
      )}

      {/* Footer Disclaimer */}
      <footer className="border-t border-hair pt-4 text-center font-mono text-[10px] text-inkSoft/70">
        <p>
          AP Teacher Desk is an independent information service for teachers. Official G.O. documents are verified against goir.ap.gov.in.
        </p>
      </footer>

      {/* Thumb-Zone Action Bar */}
      {post.pdfUrl && (
        <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={post.sourceUrl} />
      )}
    </div>
  );
}
