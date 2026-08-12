import React from "react";
import Link from "next/link";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", String(page));
    return `${url.pathname}${url.search}`;
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className={`flex items-center justify-between gap-2 font-mono text-xs ${className}`} aria-label="Pagination Navigation">
      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="px-3 py-1.5 rounded-lg border border-hair bg-paperRaised text-ink hover:border-ink/40 font-bold transition-all"
          >
            ← Prev
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-lg border border-hair/50 bg-hair/20 text-inkSoft/50 font-bold cursor-not-allowed">
            ← Prev
          </span>
        )}
      </div>

      <div className="text-inkSoft text-[11px] font-semibold">
        Page <span className="text-ink font-bold">{currentPage}</span> of <span className="text-ink font-bold">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1">
        {hasNext ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="px-3 py-1.5 rounded-lg border border-hair bg-paperRaised text-ink hover:border-ink/40 font-bold transition-all"
          >
            Next →
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-lg border border-hair/50 bg-hair/20 text-inkSoft/50 font-bold cursor-not-allowed">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}

export default Pagination;
