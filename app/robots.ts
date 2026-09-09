import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin CMS and API routes are not public content and have no
      // metadata of their own — keep them out of search results.
      disallow: ["/admin", "/api"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
