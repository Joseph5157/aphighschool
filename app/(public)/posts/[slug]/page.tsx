import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveLifecycle } from "@/lib/posts/lifecycle";
import { safeQuery } from "@/lib/db-safe";

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
        title: "Page Not Found",
      };
    }

    const description =
      post.summaryTe && post.summaryTe.length > 0
        ? post.summaryTe[0]
        : post.titleTe;

    return {
      title: post.titleEn,
      description: `${description} AP School Education government order summary.`,
      alternates: { canonical: `/posts/${params.slug}` },
    };
  } catch (e) {
    // Falls through to the layout's own default title/description rather
    // than hand-duplicating "AP Teacher Desk" a third time in this file.
    return {};
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

import DocumentTemplate from "./_templates/DocumentTemplate";

export default async function PostDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await safeQuery("post-detail", async () => {
    return prisma.post.findFirst({
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
    });
  });

  if (!post) {
    notFound();
  }

  // SLOP-REMOVE-1 (AI_SLOP_AUDIT.md A11, A20) deleted four navigation queries
  // that ran on every document request: `post-siblings` (whose result was never
  // read at all), `prev-post`/`next-post` (chronological adjacency), and the two
  // "Category Stacks" latest/tools feeds. Related Orders — an approved, curated
  // relationship the main query already includes — is the document's
  // continuation; recency and publication order are not relationships between
  // documents, and a reference product does not need recirculation furniture.

  // One shell for every document. The branch that used to live here picked
  // between two 95%-identical templates to express a distinction
  // `resolveLifecycle()` had already made — and the second half of its
  // condition (`|| post.documentType === "notification"`) was dead, because
  // resolveLifecycle returns `kind: "recruitment"` for exactly that case.
  // DocumentTemplate reads the view instead.
  const lifecycleView = resolveLifecycle(post);

  return <DocumentTemplate post={post} lifecycleView={lifecycleView} />;
}
