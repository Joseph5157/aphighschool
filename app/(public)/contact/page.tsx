import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Card from "@/app/(public)/_components/Card";
import Callout from "@/app/(public)/_components/Callout";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Report a problem, flag an incorrect calculation, or contact the AP Teacher Desk team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Contact & Support" }]} />

      <section className="space-y-4">
        <h1 className="text-display text-ink font-bold tracking-tight">
          Contact & Support
        </h1>
        <p className="text-body text-inkSoft text-lg leading-relaxed">
          We welcome feedback, corrections, and reports of broken links or document inaccuracies.
        </p>
      </section>

      <Card className="p-6 md:p-8 space-y-6 border-hair bg-paperRaised">
        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">How to Reach Us</h2>
          <p className="text-body text-inkSoft">
            If you identify a discrepancy in a calculator formula, an outdated Government Order link, or a typo in a Telugu summary, please submit your feedback through our support channel:
          </p>
          <div className="p-4 rounded-lg bg-paper border border-hair text-body text-ink font-mono">
            Support Channel: <span className="text-tamarind font-semibold">[OWNER_ACTION_REQUIRED: Specify official support email / issue tracker URL]</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">Reporting Incorrect Calculations or Broken Links</h2>
          <p className="text-body text-inkSoft">
            When reporting a calculation error, please include:
          </p>
          <ul className="list-disc pl-5 text-body text-inkSoft space-y-1">
            <li>The calculator name (e.g., PRC Calculator, Tax Calculator).</li>
            <li>The inputs used (Basic Pay, HRA rate, DA rate, etc.).</li>
            <li>The expected result according to the relevant AP Government Order.</li>
            <li>The specific GO number or reference document if applicable.</li>
          </ul>
        </div>
      </Card>

      <Callout tone="warning" title="No Official Administrative Submissions" aria-label="Contact administrative warning">
        <p>
          Please do not submit personal service registers, CFMS credentials, Aadhaar details, or confidential administrative grievances to this portal. AP Teacher Desk cannot process official government applications or treasury claims.
        </p>
      </Callout>
    </div>
  );
}
