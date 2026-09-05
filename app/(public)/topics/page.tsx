import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import { buttonClassName } from "@/app/(public)/_components/Button";

export const metadata: Metadata = {
  title: "Teacher Topics — AP Teacher Desk",
  description:
    "Browse AP School Education documents and practical teacher service guides by topic.",
};

const DOCUMENT_TOPICS = [
  {
    title: "Transfers & PTR",
    detail:
      "Browse published AP School Education documents on teacher transfers and pupil-teacher ratio.",
    links: [
      { href: "/search?tag=Transfers", label: "Search Transfers documents" },
      { href: "/search?tag=PTR", label: "Search PTR documents" },
    ],
  },
  {
    title: "TET",
    detail:
      "Find published AP Teacher Eligibility Test notifications, orders, and related updates.",
    links: [{ href: "/search?tag=TET", label: "Search TET documents" }],
  },
  {
    title: "DSC Recruitment",
    detail:
      "Find published AP DSC recruitment notifications, proceedings, and official updates.",
    links: [{ href: "/search?tag=DSC", label: "Search DSC documents" }],
  },
  {
    title: "Pay, PRC & DA",
    detail:
      "Browse published documents about pay revision, PRC, DA, and related arrears guidance.",
    links: [
      { href: "/search?tag=PRC", label: "Search PRC documents" },
      { href: "/search?tag=DA", label: "Search DA documents" },
    ],
  },
] as const;

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

type Topic = (typeof DOCUMENT_TOPICS)[number] | (typeof SERVICE_GUIDES)[number];

function TopicCard({ topic, kind }: { topic: Topic; kind: "Document topic" | "Service guide" }) {
  return (
    <Card hoverable className="flex h-full flex-col border-hair bg-paperRaised p-5">
      <Badge variant={kind === "Document topic" ? "turmeric" : "neutral"} size="sm" shape="pill">
        {kind}
      </Badge>
      <h3 className="mt-4 text-card-title text-ink">{topic.title}</h3>
      <p className="mt-2 flex-1 text-body text-inkSoft">{topic.detail}</p>
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

export default function TopicsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Teacher Topics" }]} />

      <section className="relative overflow-hidden rounded-2xl border border-mastheadText/35 bg-masthead p-6 text-mastheadText shadow-md md:p-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-turmeric/10" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-4">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            AP School Education
          </Badge>
          <div>
            <h1 className="text-display tracking-tight text-mastheadText">Browse teacher topics</h1>
            <p className="mt-2 max-w-2xl text-body text-mastheadText/75">
              Find published AP School Education documents by topic, or open a practical guide for a common service task.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="document-topics-heading" className="space-y-4">
        <div className="border-b border-hair pb-3">
          <h2 id="document-topics-heading" className="text-section text-ink">Document topics</h2>
          <p className="mt-1 text-body text-inkSoft">
            These links filter published AP School Education documents by their topic tags.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DOCUMENT_TOPICS.map((topic) => (
            <TopicCard key={topic.title} topic={topic} kind="Document topic" />
          ))}
        </div>
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
