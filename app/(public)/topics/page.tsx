import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import { buttonClassName } from "@/app/(public)/_components/Button";
import { publishedTagCounts } from "@/lib/posts/query";
import { safeQuery } from "@/lib/db-safe";
import { TOPIC_TERMS } from "@/lib/terminology";

export const metadata: Metadata = {
  title: "Teacher Topics",
  description:
    "AP School Education documents and teacher service guides organized by topic.",
  alternates: { canonical: "/topics" },
};

const SERVICE_GUIDES = [
  {
    title: "Pension & Retirement",
    detail:
      "Use AP retirement tools and the pension-clearance roadmap already available in the portal.",
    links: [{ href: "/pensioners", label: "Open pension guidance" }],
  },
  {
    title: "Service Records, Leave & Benefits",
    detail:
      "Start with the AP portal guides for CFMS, payslip, EHS, e-SR, and leave encashment.",
    links: [
      { href: "/tools/cfms-checker", label: "Open CFMS and service-record guides" },
      { href: "/tools/leave-encashment", label: "Open leave encashment guide" },
    ],
  },
] as const;

// TERM-TOPICS-1: document topics are read from the database, so this route is
// no longer static.
export const dynamic = "force-dynamic";

type Topic = {
  title: string;
  /** Telugu name, shown under the English heading (document topics only). */
  telugu?: string;
  detail: string;
  links: ReadonlyArray<{ href: string; label: string }>;
};

function TopicCard({ topic, kind }: { topic: Topic; kind: "Document topic" | "Service guide" }) {
  return (
    <Card hoverable className="flex h-full flex-col border-hair bg-paperRaised p-5">
      <Badge variant={kind === "Document topic" ? "turmeric" : "neutral"} size="sm" shape="pill">
        {kind}
      </Badge>
      <h3 className="mt-4 text-card-title text-ink">{topic.title}</h3>
      {topic.telugu && (
        <p lang="te" className="mt-1 text-telugu-body text-inkSoft">
          {topic.telugu}
        </p>
      )}
      <p className={`mt-2 flex-1 ${topic.telugu ? "text-meta" : "text-body"} text-inkSoft`}>
        {topic.detail}
      </p>
      <nav className="mt-5 flex flex-wrap gap-2" aria-label={`${topic.title} links`}>
        {topic.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>
    </Card>
  );
}

export default async function TopicsPage() {
  // safeQuery, not optionalQuery: an empty list here would tell teachers no
  // topic has documents, which is false if the database is merely unreachable.
  const counts = await safeQuery("topics-tag-counts", () =>
    publishedTagCounts(TOPIC_TERMS.map((term) => term.tag))
  );
  // Only topics with published posts are shown — a card that leads to
  // "no matching documents" is a dead end (TERM_NAV_1_PLAN.md §7).
  const documentTopics: Topic[] = TOPIC_TERMS.flatMap((term) => {
    const count = counts.get(term.tag);
    if (!count) return [];
    return [
      {
        title: term.display,
        telugu: term.telugu[0],
        detail: `${count} published ${count === 1 ? "document" : "documents"}`,
        links: [
          { href: `/search?tag=${encodeURIComponent(term.tag)}`, label: `Search ${term.display} documents` },
        ],
      },
    ];
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 md:space-y-8 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Teacher Topics" }]} />

      <section className="relative overflow-hidden rounded-2xl border border-mastheadText/35 on-masthead bg-masthead p-4 sm:p-6 text-mastheadText shadow-md md:p-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-turmeric/10" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-2 sm:space-y-4">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            AP School Education
          </Badge>
          <div>
            <h1 className="text-xl sm:text-display tracking-tight text-mastheadText">Browse by Teacher Topic</h1>
            <p className="mt-1 sm:mt-2 max-w-2xl text-xs sm:text-body text-mastheadText/75">
              Find published AP School Education documents by topic, or open a practical guide for a common service task.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="document-topics-heading" className="space-y-3 sm:space-y-4">
        <div className="border-b border-hair pb-3">
          <h2 id="document-topics-heading" className="text-section text-ink">Document topics</h2>
          <p className="mt-1 text-body text-inkSoft">
            These links filter published AP School Education documents by their topic tags.
          </p>
        </div>
        {documentTopics.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
            {documentTopics.map((topic) => (
              <TopicCard key={topic.title} topic={topic} kind="Document topic" />
            ))}
          </div>
        ) : (
          <p className="text-body text-inkSoft">
            No topic has published documents yet. Use{" "}
            <Link href="/search" className="font-semibold text-tamarind hover:underline">
              Search
            </Link>{" "}
            to find documents by keyword or GO number.
          </p>
        )}
      </section>

      <section aria-labelledby="service-guides-heading" className="space-y-4">
        <div className="border-b border-hair pb-3">
          <h2 id="service-guides-heading" className="text-section text-ink">Service guides</h2>
          <p className="mt-1 text-body text-inkSoft">
            These links open practical AP teacher service guidance and calculators in this portal.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICE_GUIDES.map((topic) => (
            <TopicCard key={topic.title} topic={topic} kind="Service guide" />
          ))}
        </div>
      </section>
    </div>
  );
}
