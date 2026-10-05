import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Card from "@/app/(public)/_components/Card";
import Callout from "@/app/(public)/_components/Callout";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about AP Teacher Desk — an independent, Telugu-first information portal and utility tools platform for AP School Education teachers and pensioners.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6 pb-12 font-sans">
      <Breadcrumb items={[{ label: "About" }]} />

      <section className="space-y-2 sm:space-y-4">
        <h1 className="text-xl sm:text-display text-ink font-bold tracking-tight">
          About AP Teacher Desk
        </h1>
        <p className="text-xs sm:text-body text-inkSoft text-base sm:text-lg leading-relaxed">
          AP Teacher Desk is a dedicated, independent information portal and utility toolkit created for teachers, School Education employees, and pensioners in Andhra Pradesh.
        </p>
      </section>

      <Card className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 border-hair bg-paperRaised">
        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">Our Mission & Purpose</h2>
          <p className="text-body text-inkSoft">
            Government orders, pay scales, leave rules, and pension calculations can be complex and fragmented. Our goal is to provide a clear, accessible, and reliable reference hub with English abstracts, Telugu summaries (<span lang="te">తెలుగు లబ్ధి వివరణ</span>), and verified document provenance for AP School Education staff.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">What We Provide</h2>
          <ul className="list-disc pl-5 text-body text-inkSoft space-y-2">
            <li><strong>Living Document Hub:</strong> Categorized AP Government Orders (GOs), Circulars, Memos, and Proceedings with lifecycle tracking (Effective, Superseded, Amended).</li>
            <li><strong>Teacher Utility Tools:</strong> Client-side calculators for PRC 2022 pay fixation, Income Tax regime comparisons (FY 2025-26), Earned Leave (EL) & HPL encashment, and GPF/APGLI projections.</li>
            <li><strong>Pensioners Hub:</strong> Service pension, 40% commutation, DCRG gratuity calculators, 180-month commutation restoration countdown, and 6-office clearance pipeline guidance.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">Scope Lock: AP Only</h2>
          <p className="text-body text-inkSoft">
            AP Teacher Desk focuses strictly on Andhra Pradesh School Education department orders and teacher utilities. We do not aggregate general non-teaching government schemes or out-of-state regulations.
          </p>
        </div>
      </Card>

      <Callout tone="guidance" title="Independence & Disclaimer" aria-label="About independence disclaimer">
        <p>
          AP Teacher Desk is an independent, unofficial resource. It is not affiliated with, endorsed by, or operated by the Government of Andhra Pradesh or any department thereof. Official transactions must be conducted through official portals such as GOIR and CFMS.
        </p>
      </Callout>
    </div>
  );
}
