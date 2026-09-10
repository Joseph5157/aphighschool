import React from "react";

type ActionSummaryPost = {
  summaryTe: string[];
  englishAbstract: string | null;
  actionUrl: string | null;
  pdfUrl: string | null;
  sourceUrl: string | null;
};

/**
 * The document's authored summary and its routes to the source.
 *
 * SLOP-DETAIL-1 (AI_SLOP_AUDIT.md A09) removed the fact table that used to sit
 * under the summary. Every row in it — G.O. / Reference, Department, the
 * labelled date, the deadline, the GOIR verification — was already rendered a
 * few hundred pixels above in the document header, so the table added an aura
 * of completeness rather than information. The facts themselves are untouched;
 * they are stated once, in the header, where the document identifies itself.
 *
 * The subtitle "Author-provided summary and document facts" went too: the
 * heading already says At a Glance, and the sentence described the section
 * rather than telling the reader anything about the document.
 *
 * What is left is what only this section carries: the authored Telugu summary,
 * the English abstract when one exists, and the action/PDF/source links. None
 * of it is synthesized — an absent summary renders nothing rather than a
 * generated one.
 */
export default function ActionSummary({ post }: { post: ActionSummaryPost }) {
  const hasTeluguSummary = post.summaryTe?.length > 0;
  const hasLinks = post.actionUrl || post.pdfUrl || post.sourceUrl;

  if (!hasTeluguSummary && !post.englishAbstract && !hasLinks) return null;

  return (
    <section
      aria-label="At a glance"
      className="bg-paperRaised border border-hair/80 border-l-4 border-l-kumkum rounded-xl p-5 md:p-6 space-y-5"
    >
      <h2 className="font-mono font-bold text-xs tracking-wider text-kumkum border-b border-hair pb-3">
        <span lang="te">సంక్షిప్తంగా</span> — At a Glance
      </h2>

      {(hasTeluguSummary || post.englishAbstract) && (
        <div className="space-y-4">
          {hasTeluguSummary && (
            <ul lang="te" className="font-telugu list-disc list-inside space-y-2.5 text-base font-medium leading-relaxed text-ink">
              {post.summaryTe.map((bullet, index) => (
                <li key={`${index}-${bullet}`} className="pl-1">
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {post.englishAbstract && (
            <div className={`${hasTeluguSummary ? "border-t border-dashed border-hair pt-4" : ""} text-body text-inkSoft italic`}>
              <strong className="mb-1 block font-mono text-xs font-bold not-italic text-inkSoft">English abstract</strong>
              {post.englishAbstract}
            </div>
          )}
        </div>
      )}

      {hasLinks && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {post.actionUrl && (
            <a href={post.actionUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-tamarind/30 bg-tamarind/10 px-3.5 py-3 text-sm font-bold text-tamarind transition-colors hover:border-tamarind hover:bg-tamarind hover:text-white">
              <span>Open action link</span><span aria-hidden="true">↗</span>
            </a>
          )}
          {post.pdfUrl && (
            <a href={post.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-kumkum/30 bg-kumkum/10 px-3.5 py-3 text-sm font-bold text-kumkum transition-colors hover:border-kumkum hover:bg-kumkum hover:text-white">
              <span>Open PDF</span><span aria-hidden="true">↗</span>
            </a>
          )}
          {post.sourceUrl && (
            <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-hair bg-paper px-3.5 py-3 text-sm font-bold text-ink transition-colors hover:border-ink/40 hover:bg-paperRaised">
              <span>Source link</span><span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </section>
  );
}
