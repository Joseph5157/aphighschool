import type { Metadata } from "next";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Card from "@/app/(public)/_components/Card";
import Callout from "@/app/(public)/_components/Callout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for AP Teacher Desk — understanding client-side calculations and data handling.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Privacy Policy" }]} />

      <section className="space-y-4">
        <h1 className="text-display text-ink font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-body text-inkSoft text-lg leading-relaxed">
          AP Teacher Desk is committed to protecting user privacy. This policy explains how information is handled when you visit our site.
        </p>
      </section>

      <Card className="p-6 md:p-8 space-y-6 border-hair bg-paperRaised">
        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">1. Client-Side Calculations & Zero Personal Storage</h2>
          <p className="text-body text-inkSoft">
            All utility tools (Income Tax, PRC Pay Fixation, Leave Encashment, GPF/APGLI, and Pension Calculators) run <strong>100% locally inside your web browser</strong>. Values you enter—such as basic pay, deductions, or service dates—are never transmitted to our servers, saved in a database, or shared with third parties.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">2. Cookies & Local Storage</h2>
          <p className="text-body text-inkSoft">
            The public portal does not place advertising or tracking cookies. Local storage is used strictly for non-sensitive browser preferences, such as remembering dark/light theme mode and progressive web app (PWA) update preferences. Admin login sessions use secure, encrypted HTTP-only session cookies.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">3. Analytics & Technical Logs</h2>
          <p className="text-body text-inkSoft">
            Standard web server logs (IP address, request URL, user agent) are processed solely for server health, security monitoring, and network performance. We do not use third-party tracking pixels or personal profiling analytics.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-card-title text-ink font-bold">4. External Government Links</h2>
          <p className="text-body text-inkSoft">
            Our portal provides links to official government websites (e.g., GOIR, CFMS, Treasury). Clicking an external link directs you to that third-party domain, which is governed by its own privacy policies.
          </p>
        </div>
      </Card>

      <Callout tone="guidance" title="Data Protection Guarantee" aria-label="Privacy guarantee callout">
        <p>
          AP Teacher Desk will never request your passwords, financial PINs, Aadhaar numbers, or banking credentials.
        </p>
      </Callout>
    </div>
  );
}
