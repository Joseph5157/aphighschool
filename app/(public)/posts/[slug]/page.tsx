import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import LifecycleStepper from "./_components/LifecycleStepper";
import ThumbZoneBar from "./_components/ThumbZoneBar";
import WhatsAppBanner from "./_components/WhatsAppBanner";
import PostNavCards from "./_components/PostNavCards";
import CategoryStacksGrid from "./_components/CategoryStacksGrid";
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
      description: `${description} AP School Education government order summary.`,
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

import NotificationTemplate from "./_templates/NotificationTemplate";
import GoMemoTemplate from "./_templates/GoMemoTemplate";

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

  const postCategory = post.category;
  const siblingPosts = postCategory
    ? await optionalQuery(
        "post-siblings",
        () =>
          prisma.post.findMany({
            where: {
              categoryId: postCategory.id,
              id: { not: post.id },
              isDraft: false,
            },
            orderBy: ORDER_BY_OFFICIAL_DATE,
            take: 3,
            select: { id: true, slug: true, titleEn: true, goReference: true, createdAt: true, documentDate: true },
          }),
        []
      )
    : [];

  // Query previous and next posts timeline
  const prevPost = await optionalQuery("prev-post", () =>
    prisma.post.findFirst({
      where: {
        createdAt: { lt: post.createdAt },
        id: { not: post.id },
        isDraft: false,
      },
      orderBy: { createdAt: "desc" },
      select: { slug: true, titleEn: true, goReference: true },
    }),
    null
  );

  const nextPost = await optionalQuery("next-post", () =>
    prisma.post.findFirst({
      where: {
        createdAt: { gt: post.createdAt },
        id: { not: post.id },
        isDraft: false,
      },
      orderBy: { createdAt: "asc" },
      select: { slug: true, titleEn: true, goReference: true },
    }),
    null
  );

  // Query latest posts for Category Stacks
  const latestNewsItems = await optionalQuery(
    "latest-news-stack",
    () =>
      prisma.post.findMany({
        where: { id: { not: post.id }, isDraft: false },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, slug: true, titleEn: true },
      }),
    []
  );

  const categoryStacks = [
    {
      title: "AP Teachers Latest Updates",
      categorySlug: "ap-teachers-latest-news",
      icon: "🔔",
      items: latestNewsItems,
    },
    {
      title: "School Apps & Teacher Utilities",
      categorySlug: "teachers-softwares",
      icon: "📱",
      items: [...latestNewsItems].reverse(),
    },
  ];

  const lifecycleView = resolveLifecycle(post);

  if (lifecycleView.kind === "recruitment" || post.documentType === "notification") {
    return (
      <NotificationTemplate
        post={post}
        lifecycleView={lifecycleView}
        prevPost={prevPost}
        nextPost={nextPost}
        categoryStacks={categoryStacks}
        siblingPosts={siblingPosts}
      />
    );
  }

  return (
    <GoMemoTemplate
      post={post}
      lifecycleView={lifecycleView}
      prevPost={prevPost}
      nextPost={nextPost}
      categoryStacks={categoryStacks}
    />
  );
}
