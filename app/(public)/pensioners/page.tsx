import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "../_components/Card";
import Badge from "../_components/Badge";
import { buttonClassName } from "../_components/Button";
import Breadcrumb from "../_components/Breadcrumb";
import Accordion from "../_components/Accordion";
import PensionersSidebar from "./_components/PensionersSidebar";

export const metadata: Metadata = {
  title: "Pensioners & Retired Employee Care Hub — AP Teacher Desk",
  description:
    "Comprehensive guidance for retired AP teachers: Service Pension & DCRG Gratuity calculators, 180-month Commutation restoration trackers, EHS health guides, and 6-office clearance pipelines.",
};

const PENSIONER_TOOLS = [
  {
    href: "/pensioners/pension-calculator",
    title: "Service Pension & DCRG Gratuity Calculator",
    titleTe: "పింఛను మరియు గ్రాట్యుటీ లెక్కింపు సాధనం",
    desc: "Calculate Basic Pension, 40% Commutation lump sum, DCRG Gratuity (₹16L limit), and EL encashment under AP Revised Pension Rules.",
    icon: "👴",
    badge: "Service Pension",
    status: "Gratuity & Commutation",
  },
  {
    href: "/pensioners/commutation-tracker",
    title: "Commutation 180-Month Restoration Tracker",
    titleTe: "కమ్యూటేషన్ 15 సంవత్సరాల రికవరీ పునరుద్ధరణ లెక్కింపు",
    desc: "Track the exact 180-month timeline for 40% commuted pension recovery and generate a ready application for STO Treasury restoration.",
    icon: "⏳",
    badge: "180-Month Rule",
    status: "Full Pension Restoration",
  },
  {
    href: "/pensioners/office-pipeline",
    title: "6-Office Retirement File Clearance Guide",
    titleTe: "6 ప్రభుత్వ కార్యాలయాల పెన్షన్ ఫైలు క్లియరెన్స్ మార్గదర్శి",
    desc: "Step-by-step roadmap detailing file movement through HM/DDO, MEO/DEO, State Audit, AG AP Vijayawada, STO Treasury, and Pension Bank.",
    icon: "🗺️",
    badge: "Clearance Pipeline",
    status: "Office Roadmap",
  },
  {
    href: "/tools/tax-calculator",
    title: "Pensioner Income Tax & Form 10E Guide",
    titleTe: "పింఛనుదారుల ఆదాయ పన్ను మరియు ఫారమ్ 10E మార్గదర్శి",
    desc: "Compare New vs Old Tax Regime for pension income, DR arrears relief under Section 89(1), and print Annexure-I tax statements.",
    icon: "🧮",
    badge: "Tax Relief",
    status: "Section 89(1)",
  },
];

export default function PensionersHubPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb items={[{ label: "Pensioners Hub" }]} />

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        {/* Mainfeed Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Emerald Treasury Hero Header */}
          <div className="bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 space-y-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm" shape="pill" dot>
                Emerald Treasury Care Suite
              </Badge>
              <span className="font-mono text-[10px] text-turmeric font-semibold">
                AP Revised Pension Rules
              </span>
            </div>

            <div>
              <h1 className="text-display text-mastheadText tracking-tight">
                Pensioners & Retired Employee Care Hub
              </h1>
              <p className="text-telugu-title text-turmeric font-medium mt-1">
                నివృత్త ఉద్యోగుల మరియు పింఛనుదారుల మార్గదర్శక కేంద్రం
              </p>
            </div>

            <p className="text-body text-mastheadText/70">
              Dedicated guidance for retired teachers and government employees in AP & TS — clear pension math, commutation restoration countdowns, and office clearance workflows.
            </p>
          </div>

          {/* Quick Office Pipeline Strip */}
          <Card className="p-4 bg-paperRaised border-hair space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                6-Office Retirement File Pipeline
              </span>
              <Link
                href="/pensioners/office-pipeline"
                className="font-mono text-[11px] text-tamarind font-semibold hover:underline"
              >
                View Detailed Guide →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-1 font-mono text-[10px] text-center">
              {["1. School DDO", "2. MEO / DEO", "3. State Audit", "4. AG AP", "5. STO Treasury", "6. Bank Branch"].map((step, i) => (
                <div key={i} className="p-1.5 rounded bg-ink/5 border border-hair font-semibold text-inkSoft">
                  {step}
                </div>
              ))}
            </div>
          </Card>

          {/* Utility Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PENSIONER_TOOLS.map((tool) => (
              <Card key={tool.href} hoverable className="p-5 space-y-3 bg-paperRaised border-hair flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-ink text-turmeric flex items-center justify-center text-lg shrink-0">
                        {tool.icon}
                      </div>
                      <Badge variant="neutral" size="sm" shape="pill">
                        {tool.badge}
                      </Badge>
                    </div>
                    <span className="text-inkSoft font-semibold">{tool.status}</span>
                  </div>

                  <div>
                    <h3 className="text-card-title text-ink">{tool.title}</h3>
                    <div className="text-telugu-body text-inkSoft mt-1">{tool.titleTe}</div>
                  </div>

                  <p className="text-body text-inkSoft pt-2 border-t border-hair/50">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={tool.href}
                    className={buttonClassName({ variant: "tamarind", size: "sm" })}
                  >
                    <span>Open Tool</span>
                    <span>→</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3 pt-4 border-t border-hair">
            <h2 className="text-section text-ink flex items-center gap-2">
              <span>❓</span> Pensioner Guidance FAQ
            </h2>
            <Accordion
              allowMultiple
              items={[
                {
                  id: "faq-pension-hub-1",
                  titleEn: "What is the 180-month commutation restoration rule in AP?",
                  titleTe: "180 నెలల కమ్యూటేషన్ రికవరీ పునరుద్ధరణ నియమం ఏమిటి?",
                  badge: "Commutation",
                  badgeVariant: "turmeric",
                  defaultOpen: true,
                  content: (
                    <p>
                      Under AP Revised Pension Rules, the 40% commuted portion of pension is recovered monthly for exactly 15 years (180 months)
                      from the date of commutation lump sum payment. Once 180 months expire, full basic pension is restored.
                    </p>
                  ),
                },
                {
                  id: "faq-pension-hub-2",
                  titleEn: "When do pensioners receive additional quantum of pension?",
                  titleTe: "పెన్షనర్లకు అదనపు పింఛను (Additional Quantum) ఎప్పుడు అందుతుంది?",
                  badge: "Age Slabs",
                  badgeVariant: "success",
                  content: (
                    <p>
                      Additional quantum of pension is automatically granted upon reaching age milestones:
                      +12% (70-75 yrs), +15% (75-80 yrs), +20% (80-85 yrs), +30% (85-90 yrs), +40% (90-95 yrs), +50% (95-100 yrs).
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4">
          <PensionersSidebar />
        </div>
      </div>
    </div>
  );
}
