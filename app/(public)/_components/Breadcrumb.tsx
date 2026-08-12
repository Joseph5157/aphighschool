import React from "react";
import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const fullItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  // Generate Google Search BreadcrumbList JSON-LD Schema
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteUrl}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* Google SEO JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Accessible UI Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className={`overflow-x-auto no-scrollbar py-1 ${className}`}>
        <ol className="flex items-center gap-1.5 font-mono text-[11px] text-inkSoft whitespace-nowrap">
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;

            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <span className="text-inkSoft/40 select-none">/</span>}
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-ink transition-colors font-medium">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-ink font-semibold max-w-[200px] truncate" aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumb;
