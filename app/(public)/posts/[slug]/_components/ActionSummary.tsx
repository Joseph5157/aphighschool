import React from "react";

type ActionSummaryPost = {
  summaryTe: string[];
  englishAbstract: string | null;
};

/**
 * The authored explanation of the document.
 *
 * Source metadata and outbound actions deliberately live in
 * OfficialSourceCard. Keeping this component focused lets a short post use the
 * summary and source cards as a balanced pair while a detailed post can carry
 * the same introduction above its full article.
 */
export default function ActionSummary({ post }: { post: ActionSummaryPost }) {
  const hasTeluguSummary = post.summaryTe?.length > 0;

  if (!hasTeluguSummary && !post.englishAbstract) return null;

  return (
    <section
      aria-label="At a glance"
      className="h-full space-y-5 rounded-xl border border-hair/80 border-l-4 border-l-kumkum bg-paperRaised p-5 sm:p-6"
    >
      <h2 className="text-section border-b border-hair pb-3 font-bold text-kumkum">
        <span lang="te" className="font-telugu">సంక్షిప్తంగా</span>
        <span aria-hidden="true"> · </span>
        <span>At a Glance</span>
      </h2>

      <div className="space-y-4">
        {hasTeluguSummary && (
          <ul
            lang="te"
            className="font-telugu list-disc space-y-2.5 pl-6 text-telugu-body text-ink marker:text-ink"
          >
            {post.summaryTe.map((bullet, index) => (
              <li key={`${index}-${bullet}`} className="pl-1">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {post.englishAbstract && (
          <div
            className={`${
              hasTeluguSummary ? "border-t border-dashed border-hair pt-4" : ""
            } text-body italic text-inkSoft`}
          >
            <strong className="mb-1 block font-sans text-sm font-bold not-italic text-ink">
              English abstract
            </strong>
            {post.englishAbstract}
          </div>
        )}
      </div>
    </section>
  );
}
