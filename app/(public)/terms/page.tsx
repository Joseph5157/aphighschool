import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Card from "@/app/(public)/_components/Card";
import Callout from "@/app/(public)/_components/Callout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of Use for accessing AP Teacher Desk information and tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Terms of Use" }]} />

      <section className="space-y-2 sm:space-y-4">
        <h1 className="text-xl sm:text-display text-ink font-bold tracking-tight">
          Terms of Use
        </h1>
        <p className="text-xs sm:text-body text-inkSoft text-base sm:text-lg leading-relaxed">
          Please read these terms before using AP Teacher Desk services, calculators, and published document summaries.
        </p>
      </section>

      <Card className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 border-hair bg-paperRaised">
        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">1. Acceptance of Terms</h2>
          <p className="text-body text-inkSoft">
            By accessing or using AP Teacher Desk, you agree to these Terms of Use. If you do not agree with any part of these terms, please refrain from using the site.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">2. Informational & Educational Use Only</h2>
          <p className="text-body text-inkSoft">
            The content, abstracts, Telugu summaries, and calculator outputs provided on this website are for informational and educational purposes only. They do not constitute official government notifications, legal counsel, or binding treasury advice.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">3. Verification Against Official Orders</h2>
          <p className="text-body text-inkSoft">
            Users must verify all financial calculations, pay fixation amounts, tax liabilities, and service claims against official Andhra Pradesh Government Orders (GOs) and consult their respective DDOs (Drawing and Disbursing Officers) or Treasury STOs before making consequential financial decisions.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">4. Intellectual Property & Citation</h2>
          <p className="text-body text-inkSoft">
            Government orders and public circulars remain public domain property of the state. Original summaries, calculator tools, and software code on this portal are protected by applicable intellectual property rights.
          </p>
        </div>
      </Card>

      <Callout tone="guidance" title="Notice on Policy Updates" aria-label="Terms update notice">
        <p>
          These terms may be updated periodically to reflect changes in regulatory requirements or site functionality. Continued use of the portal constitutes acceptance of updated terms.
        </p>
      </Callout>
    </div>
  );
}
