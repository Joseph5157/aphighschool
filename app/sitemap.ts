import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

const STATIC_ROUTES = [
  "/",
  "/orders",
  "/search",
  "/topics",
  "/service-desk",
  "/tools",
  "/tools/cfms-checker",
  "/tools/da-arrears",
  "/tools/gpf-apgli",
  "/tools/leave-encashment",
  "/tools/prc-calculator",
  "/tools/tax-calculator",
  "/pensioners",
  "/pensioners/commutation-tracker",
  "/pensioners/office-pipeline",
  "/pensioners/pension-calculator",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "/" || path === "/orders" ? "daily" : "monthly",
  }));

  // A database failure here must not take the whole sitemap down — a
  // shorter-than-usual sitemap degrades gracefully; throwing would 500 the route.
  try {
    const [categories, posts] = await Promise.all([
      prisma.category.findMany({ select: { slug: true, createdAt: true } }),
      prisma.post.findMany({
        where: { isDraft: false },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: category.createdAt,
      changeFrequency: "weekly",
    }));

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${siteUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly",
    }));

    return [...staticEntries, ...categoryEntries, ...postEntries];
  } catch (error) {
    console.error("[sitemap] database query failed, returning static routes only:", error);
    return staticEntries;
  }
}
