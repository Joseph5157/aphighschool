import React from "react";
import { dateLabel, formatDate, officialDate } from "@/lib/dates";

type ActionSummaryPost = {
  summaryTe: string[];
  englishAbstract: string | null;
  goReference: string | null;
  sourceDept: string | null;
  documentDate: Date | null;
  createdAt: Date;
  actionDeadline: Date | null;
  verifiedAgainstGoir: boolean;
  actionUrl: string | null;
  pdfUrl: string | null;
  sourceUrl: string | null;
};

function FactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(7.5rem,0.85fr)_minmax(0,1.5fr)] gap-3 border-b border-hair/60 py-2.5 last:border-b-0 sm:gap-5">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-wide text-inkSoft">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

export default function ActionSummary({ post }: { post: ActionSummaryPost }) {
  const hasTeluguSummary = post.summaryTe?.length > 0;
  const hasLinks = post.actionUrl || post.pdfUrl || post.sourceUrl;

  return (
    <section
      aria-label="At a glance"
      className="bg-paperRaised border border-hair/80 border-l-4 border-l-kumkum rounded-xl p-5 md:p-6 shadow-2xs space-y-5"
    >
      <div className="border-b border-hair pb-3">
        <h2 className="font-mono font-bold text-xs tracking-wider text-kumkum"><span lang="te">సంక్షిప్తంగా</span> — At a Glance</h2>
        <p className="mt-1 text-xs text-inkSoft">Author-provided summary and document facts.</p>
      </div>

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
              <strong className="mb-1 block font-mono text-[10px] font-bold not-italic text-inkSoft">English abstract</strong>
              {post.englishAbstract}
            </div>
          )}
        </div>
      )}

      <dl className="border-y border-hair/70">
        {post.goReference && (
          <FactRow label="G.O. / Reference">
            <span className="font-mono font-bold text-tamarind break-words">{post.goReference}</span>
          </FactRow>
        )}
        {post.sourceDept && <FactRow label="Department">{post.sourceDept}</FactRow>}
        <FactRow label={dateLabel(post)}>
          <span className="font-mono">{formatDate(officialDate(post))}</span>
        </FactRow>
        {post.actionDeadline && (
          <FactRow label="Important date">
            <span className="font-mono font-bold text-kumkum">{formatDate(post.actionDeadline)}</span>
          </FactRow>
        )}
        {post.verifiedAgainstGoir && (
          <FactRow label="GOIR verification">
            <span className="font-mono font-semibold text-tamarind">Verified</span>
          </FactRow>
        )}
      </dl>

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
