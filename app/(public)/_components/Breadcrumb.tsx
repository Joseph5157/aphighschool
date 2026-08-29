import React from "react";
import Link from "next/link";

export type BreadcrumbItemData = {
  label: string;
  href?: string;
};

// Export alias for backward compatibility
export type BreadcrumbItem = BreadcrumbItemData;

export interface BreadcrumbProps {
  items: BreadcrumbItemData[];
  className?: string;
}

// ---------------------------------------------------------------------------
// Shadcn-inspired Modular Primitives
// ---------------------------------------------------------------------------

export const BreadcrumbNav = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(
  ({ className = "", ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={`overflow-x-auto no-scrollbar py-1 ${className}`} {...props} />
  )
);
BreadcrumbNav.displayName = "BreadcrumbNav";

export const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(
  ({ className = "", ...props }, ref) => (
    <ol ref={ref} className={`flex items-center gap-1.5 font-mono text-[11px] text-inkSoft whitespace-nowrap ${className}`} {...props} />
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

export const BreadcrumbItemPrimitive = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  ({ className = "", ...props }, ref) => (
    <li ref={ref} className={`inline-flex items-center gap-1.5 ${className}`} {...props} />
  )
);
BreadcrumbItemPrimitive.displayName = "BreadcrumbItemPrimitive";

export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<typeof Link>>(
  ({ className = "", ...props }, ref) => (
    <Link ref={ref} className={`hover:text-ink transition-colors font-medium ${className}`} {...props} />
  )
);
BreadcrumbLink.displayName = "BreadcrumbLink";

export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={`text-ink font-semibold max-w-[200px] truncate ${className}`}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

export const BreadcrumbSeparator = ({ children, className = "", ...props }: React.ComponentPropsWithoutRef<"li">) => (
  <li role="presentation" aria-hidden="true" className={`text-inkSoft/40 select-none ${className}`} {...props}>
    {children ?? "/"}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export const BreadcrumbEllipsis = ({ className = "", ...props }: React.ComponentPropsWithoutRef<"span">) => (
  <span role="presentation" aria-hidden="true" className={`flex h-4 w-4 items-center justify-center text-inkSoft/50 ${className}`} {...props}>
    …
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// ---------------------------------------------------------------------------
// High-Level Helper Component (Backward compatible with existing <Breadcrumb />)
// ---------------------------------------------------------------------------

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const fullItems: BreadcrumbItemData[] = [{ label: "Home", href: "/" }, ...items];

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
      <BreadcrumbNav className={className}>
        <BreadcrumbList>
          {fullItems.map((item, index) => {
            const isLast = index === fullItems.length - 1;

            return (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItemPrimitive>
                  {item.href && !isLast ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItemPrimitive>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </BreadcrumbNav>
    </>
  );
}

export default Breadcrumb;

