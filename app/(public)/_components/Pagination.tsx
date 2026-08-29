import React from "react";
import Link from "next/link";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Shadcn-inspired Modular Primitives
// ---------------------------------------------------------------------------

export const PaginationNav = ({ className = "", ...props }: React.ComponentProps<"nav">) => (
  <nav role="navigation" aria-label="Pagination Navigation" className={`mx-auto flex w-full justify-center ${className}`} {...props} />
);

export const PaginationContent = ({ className = "", ...props }: React.ComponentProps<"ul">) => (
  <ul className={`flex flex-wrap items-center gap-1.5 font-mono text-xs ${className}`} {...props} />
);

export const PaginationItem = ({ className = "", ...props }: React.ComponentProps<"li">) => (
  <li className={className} {...props} />
);

interface PaginationLinkProps extends React.ComponentProps<typeof Link> {
  isActive?: boolean;
}

export const PaginationLink = ({ isActive, className = "", ...props }: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-lg border font-bold text-xs transition-all ${
      isActive
        ? "bg-accent/15 border-accent text-accent shadow-sm"
        : "bg-paperRaised border-hair text-ink hover:border-ink/40"
    } ${className}`}
    {...props}
  />
);

export const PaginationPrevious = ({ className = "", disabled, ...props }: React.ComponentProps<typeof PaginationLink> & { disabled?: boolean }) => {
  if (disabled) {
    return (
      <span className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border border-hair/50 bg-hair/20 text-inkSoft/50 font-bold text-xs cursor-not-allowed ${className}`}>
        ← Prev
      </span>
    );
  }
  return (
    <PaginationLink aria-label="Go to previous page" className={`gap-1 px-3 ${className}`} {...props}>
      <span>← Prev</span>
    </PaginationLink>
  );
};

export const PaginationNext = ({ className = "", disabled, ...props }: React.ComponentProps<typeof PaginationLink> & { disabled?: boolean }) => {
  if (disabled) {
    return (
      <span className={`inline-flex items-center justify-center h-8 px-3 rounded-lg border border-hair/50 bg-hair/20 text-inkSoft/50 font-bold text-xs cursor-not-allowed ${className}`}>
        Next →
      </span>
    );
  }
  return (
    <PaginationLink aria-label="Go to next page" className={`gap-1 px-3 ${className}`} {...props}>
      <span>Next →</span>
    </PaginationLink>
  );
};

export const PaginationEllipsis = ({ className = "", ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className={`flex h-8 w-8 items-center justify-center text-inkSoft font-bold ${className}`} {...props}>
    …
    <span className="sr-only">More pages</span>
  </span>
);

// ---------------------------------------------------------------------------
// High-Level Helper Component (Backward compatible with existing <Pagination />)
// ---------------------------------------------------------------------------

export function Pagination({ currentPage, totalPages, baseUrl, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    try {
      const url = new URL(baseUrl, "http://localhost");
      url.searchParams.set("page", String(page));
      return `${url.pathname}${url.search}`;
    } catch {
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}page=${page}`;
    }
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Generate array of visible page numbers with smart ellipsis insertion
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis");
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <PaginationNav className={className}>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious href={hasPrev ? createPageUrl(currentPage - 1) : "#"} disabled={!hasPrev} />
        </PaginationItem>

        {/* Page Links & Ellipses */}
        {pageNumbers.map((item, index) => (
          <PaginationItem key={typeof item === "number" ? item : `ellipsis-${index}`}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={createPageUrl(item)} isActive={item === currentPage}>
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext href={hasNext ? createPageUrl(currentPage + 1) : "#"} disabled={!hasNext} />
        </PaginationItem>
      </PaginationContent>
    </PaginationNav>
  );
}

export default Pagination;

