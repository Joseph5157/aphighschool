import React from "react";
import DocumentDate from "@/app/(public)/_components/DocumentDate";
import GoirBadge from "@/app/(public)/_components/GoirBadge";

type OfficialSourcePost = {
  sourceDept: string | null;
  documentDate: Date | null;
  createdAt: Date;
  verifiedAgainstGoir: boolean;
  actionUrl: string | null;
  pdfUrl: string | null;
  sourceUrl: string | null;
};

type SourceLink = {
  href: string;
  label: string;
  tone: "primary" | "secondary";
};

/**
 * Provenance and document actions belong together: the reader can see who
 * issued the material, which date the portal is showing, and where the
 * original document or official action lives before leaving this page.
 *
 * The component never invents an "official" claim. It renders only authored
 * fields and the recorded GOIR state already carried by the post.
 */
export default function OfficialSourceCard({ post }: { post: OfficialSourcePost }) {
  const links: SourceLink[] = [
    ...(post.pdfUrl
      ? [{ href: post.pdfUrl, label: "Open document PDF", tone: "primary" as const }]
      : []),
    ...(post.actionUrl
      ? [{ href: post.actionUrl, label: "Open action link", tone: "primary" as const }]
      : []),
    ...(post.sourceUrl
      ? [{ href: post.sourceUrl, label: "View source", tone: "secondary" as const }]
      : []),
  ];

  return (
    <section
      aria-label="Official source"
      className="rounded-xl border border-hair bg-paperRaised p-5 sm:p-6"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-section text-tamarind">Official source</h2>
          <GoirBadge verified={post.verifiedAgainstGoir} />
        </div>

        <div className="space-y-1 text-body text-ink">
          {post.sourceDept && <p className="font-semibold">{post.sourceDept}</p>}
          <DocumentDate post={post} className="block text-meta text-inkSoft" />
        </div>
      </div>

      {links.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-2 border-t border-hair pt-4">
          {links.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex min-h-[44px] items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-bold transition-colors ${
                link.tone === "primary"
                  ? "border-tamarind bg-tamarind text-paper hover:bg-tamarindDark"
                  : "border-hair bg-paper text-ink hover:border-ink/40 hover:bg-paperRaised"
              }`}
            >
              <span>{link.label}</span>
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5h5v5m0-5L10 14m9-1v5a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1h5"
                />
              </svg>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
