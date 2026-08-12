import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import LifecycleStepper from "./_components/LifecycleStepper";
import ThumbZoneBar from "./_components/ThumbZoneBar";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Badge from "@/app/(public)/_components/Badge";
import Card from "@/app/(public)/_components/Card";
import Button from "@/app/(public)/_components/Button";
import DesktopLeftNav from "@/app/(public)/_components/DesktopLeftNav";
import DesktopSidebar from "@/app/(public)/_components/DesktopSidebar";

export const revalidate = 3600; // ISR revalidation (1 hour)

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: {
        titleEn: true,
        englishAbstract: true,
        summaryTe: true,
        createdAt: true,
        slug: true,
      },
    });

    if (!post) {
      return {
        title: "Order Not Found — AP Teacher Desk",
      };
    }

    const title = `${post.titleEn} — AP Teacher Desk`;
    const description =
      post.englishAbstract || (post.summaryTe && post.summaryTe[0]) || "";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
        url: `/posts/${post.slug}`,
      },
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
  let post: any = null;
  try {
    post = await prisma.post.findFirst({
      where: { slug: params.slug, isDraft: false },
      include: {
        category: true,
        relatedFrom: {
          where: { approved: true },
          include: {
            relatedPost: {
              select: {
                id: true,
                slug: true,
                titleEn: true,
                goReference: true,
              },
            },
          },
        },
      },
    });
  } catch (e) {
    post = null;
  }

  if (!post) {
    notFound();
  }

  const now = new Date();
  const isPastDeadline = post.actionDeadline ? new Date(post.actionDeadline) < now : false;

  const formattedDeadline = post.actionDeadline
    ? new Date(post.actionDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0 pb-24">
      {/* 1. Left Rail (3 Cols / ~25% Width) */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      {/* 2. Center G.O. Document Reader (6 Cols / ~50% Width) */}
      <div className="lg:col-span-6 space-y-8">
        {/* Breadcrumb Trail & SEO Schema */}
      <Breadcrumb
        items={[
          { label: "Orders", href: "/orders" },
          ...(post.category ? [{ label: post.category.nameEn, href: `/category/${post.category.slug}` }] : []),
          { label: post.goReference || post.titleEn },
        ]}
      />

      {/* 1. Lifecycle Stepper */}
      <LifecycleStepper statusBadge={post.statusBadge} />

      {/* 2. Status Badge & GO Reference Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-paperRaised border border-hair rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          {post.actionDeadline && (
            <span
              className={`font-mono text-xs px-3 py-1 rounded-full font-semibold tracking-wider ${
                isPastDeadline
                  ? "bg-hair/60 text-inkSoft border border-hair"
                  : "bg-turmeric/20 text-turmericDeep border border-turmeric/30"
              }`}
            >
              {isPastDeadline ? "Registration closed" : `Closes ${formattedDeadline}`}
            </span>
          )}
          {post.category && (
            <span className="font-mono text-xs text-inkSoft bg-hair/40 px-2.5 py-1 rounded">
              {post.category.nameEn}
            </span>
          )}
        </div>

        {post.goReference && (
          <span className="font-mono text-xs font-bold text-ink bg-paper px-3 py-1 rounded border border-hair">
            {post.goReference}
          </span>
        )}
      </div>

      {/* 3. Bilingual Title */}
      <div>
        <h1 className="font-bold text-xl md:text-2xl text-ink tracking-tight leading-snug">
          {post.titleEn}
        </h1>
        <div className="font-telugu text-lg text-inkSoft mt-1.5 font-medium leading-relaxed">
          {post.titleTe}
        </div>
      </div>

      {/* 4. Summary Box */}
      <section
        aria-label="Summary"
        className="bg-[#FCF7EA] border border-hair/60 border-l-4 border-l-turmeric rounded-xl p-5 md:p-6 shadow-xs"
      >
        <div className="font-mono font-bold text-xs tracking-wider text-turmericDeep mb-3 flex items-center justify-between">
          <span>సారాంశం — Summary</span>
          <span className="text-[10px] text-inkSoft/70 font-normal">Living Document Brief</span>
        </div>

        {post.summaryTe && post.summaryTe.length > 0 && (
          <ul className="font-telugu text-sm text-ink font-medium leading-relaxed list-disc list-inside space-y-2">
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

      {/* 5. Related Orders Block (only if approved related orders exist) */}
      {post.relatedFrom && post.relatedFrom.length > 0 && (
        <section
          aria-label="Related Background Orders"
          className="bg-white border border-hair rounded-xl p-5 md:p-6 shadow-xs"
        >
          <div className="font-mono font-bold text-xs tracking-wider text-inkSoft mb-4 flex items-center gap-2">
            <span>🔗 Related Orders — Background</span>
            <span className="text-[10px] bg-paper px-2 py-0.5 rounded text-inkSoft font-normal">
              {post.relatedFrom.length}
            </span>
          </div>

          <div className="space-y-3">
            {post.relatedFrom.map((rel: any) => (
              <Link
                key={rel.relatedPost.id}
                href={`/posts/${rel.relatedPost.slug}`}
                className="block group bg-paperRaised hover:bg-paper border border-hair/70 rounded-lg p-3.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink group-hover:text-turmericDeep transition-colors">
                      {rel.relatedPost.titleEn}
                    </div>
                    {rel.relationshipNote && (
                      <div className="text-xs text-inkSoft font-mono mt-1">
                        Note: {rel.relationshipNote}
                      </div>
                    )}
                  </div>

                  {rel.relatedPost.goReference && (
                    <span className="font-mono text-xs text-inkSoft bg-hair/40 px-2 py-0.5 rounded flex-shrink-0">
                      {rel.relatedPost.goReference}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. PDF Viewer */}
      <section id="pdf-viewer-section" aria-label="Original Order PDF">
        {post.pdfUrl ? (
          <div className="rounded-xl overflow-hidden border border-hair shadow-sm">
            <div className="bg-ink text-white font-mono text-xs p-3.5 flex items-center justify-between gap-3">
              <span className="font-bold tracking-wider uppercase flex items-center gap-2">
                📄 ORIGINAL ORDER DOCUMENT
              </span>
              <span className="text-[11px] text-paper/70">
                Scroll / zoom in viewer below
              </span>
            </div>
            <iframe
              src={post.pdfUrl}
              title={`PDF document for ${post.titleEn}`}
              className="w-full h-[400px] border-0 bg-white"
            />
          </div>
        ) : (
          <div className="bg-paperRaised border border-hair rounded-xl p-6 text-center text-inkSoft text-xs font-mono">
            📄 PDF document not yet linked for this order.
          </div>
        )}
      </section>

      {/* 7. Source Line */}
      <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-inkSoft pt-4 border-t border-hair flex-wrap">
        <div>
          Source:{" "}
          {post.sourceUrl ? (
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink"
            >
              {post.sourceDept || "School Education Department, AP"}
            </a>
          ) : (
            <span>{post.sourceDept || "School Education Department, AP"}</span>
          )}
        </div>

        {post.verifiedAgainstGoir && (
          <span className="text-tamarind font-semibold flex items-center gap-1">
            ✓ Verified against GOIR (goir.ap.gov.in)
          </span>
        )}
      </div>

      {/* 8. Disclaimer */}
      <footer className="pt-2">
        <p className="text-[9px] text-[#A39B85] italic font-sans leading-normal">
          Independent, unofficial educational portal. Not affiliated with the Government of AP/TS. For legally binding documents, refer to the official source above.
        </p>
      </footer>

      </div>

      {/* 3. Right Desktop Sidebar Rail (3 Cols / ~25% Width) */}
      <div className="lg:col-span-3">
        <DesktopSidebar />
      </div>

      {/* 9. Thumb-Zone Action Bar (only if pdfUrl exists) */}
      {post.pdfUrl && (
        <ThumbZoneBar pdfUrl={post.pdfUrl} sourceUrl={post.sourceUrl} />
      )}
    </div>
  );
}
