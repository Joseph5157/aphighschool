import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "../_components/Card";
import { buttonClassName } from "../_components/Button";
import Breadcrumb from "../_components/Breadcrumb";
import Accordion from "../_components/Accordion";
import OfficialPensionPortals from "./_components/OfficialPensionPortals";

export const metadata: Metadata = {
  title: "Pensioners & Retired Employee Care Hub",
  description:
    "Guidance for retired AP teachers: Service Pension & DCRG Gratuity calculators, the 180-month Commutation tracker, and the 6-office retirement clearance guide.",
  alternates: { canonical: "/pensioners" },
};

/**
 * SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A15). Same treatment as the tools index
 * (A14): the badge and status on every card repeated the title or the
 * description — "Service Pension" over "Service Pension & DCRG Gratuity
 * Calculator", "Clearance Pipeline" over "…File Clearance Guide". The tasks
 * themselves, and the descriptions that let a retired teacher pick between
 * them, are unchanged.
 */
const PENSIONER_TOOLS = [
  {
    href: "/pensioners/pension-calculator",
    title: "Service Pension & DCRG Gratuity Calculator",
    titleTe: "పింఛను మరియు గ్రాట్యుటీ లెక్కింపు సాధనం",
    desc: "Calculate Basic Pension, 40% Commutation lump sum, DCRG Gratuity (₹16L limit), and EL encashment under AP Revised Pension Rules.",
  },
  {
    href: "/pensioners/commutation-tracker",
    title: "Commutation 180-Month Restoration Tracker",
    titleTe: "కమ్యూటేషన్ 15 సంవత్సరాల రికవరీ పునరుద్ధరణ లెక్కింపు",
    desc: "Track the exact 180-month timeline for 40% commuted pension recovery and generate a ready application for STO Treasury restoration.",
  },
  {
    href: "/pensioners/office-pipeline",
    title: "6-Office Retirement File Clearance Guide",
    titleTe: "6 ప్రభుత్వ కార్యాలయాల పెన్షన్ ఫైలు క్లియరెన్స్ మార్గదర్శి",
    desc: "Step-by-step roadmap detailing file movement through HM/DDO, MEO/DEO, State Audit, AG AP Vijayawada, STO Treasury, and Pension Bank.",
  },
  {
    href: "/tools/tax-calculator",
    title: "Pensioner Income Tax & Form 10E Guide",
    titleTe: "పింఛనుదారుల ఆదాయ పన్ను మరియు ఫారమ్ 10E మార్గదర్శి",
    desc: "Compare New vs Old Tax Regime for pension income, DR arrears relief under Section 89(1), and print Annexure-I tax statements.",
  },
];

export default function PensionersHubPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb items={[{ label: "Pensioners Hub" }]} />

      <div className="space-y-6">
          {/*
            A15: "Emerald Treasury Care Suite" was invented brand copy layered
            over four concrete pension tasks, and the "care hub" sentence beneath
            it only restated the four card titles. The six-office pipeline was
            previewed here as six 10px chips AND linked as its own detailed guide
            AND listed as one of the four tasks below — the same destination three
            times. The page now names itself and shows the tasks.
          */}
          <div className="on-masthead bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 space-y-3 shadow-md relative overflow-hidden">
            <div>
              <h1 className="text-display text-mastheadText tracking-tight">
                Pensioners & Retired Employee Care Hub
              </h1>
              <p className="text-telugu-title text-turmeric font-medium mt-1">
                నివృత్త ఉద్యోగుల మరియు పింఛనుదారుల మార్గదర్శక కేంద్రం
              </p>
            </div>

            <p className="text-body text-mastheadText/70">
              Pension and gratuity calculations, the 180-month commutation
              restoration timeline, and the office-by-office retirement file route,
              under AP Revised Pension Rules.
            </p>
          </div>

          {/* Utility Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PENSIONER_TOOLS.map((tool) => (
              <Card key={tool.href} hoverable className="p-5 space-y-3 bg-paperRaised border-hair flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-card-title text-ink">
                    <span>{tool.title}</span>
                  </h3>
                  <div className="text-telugu-body text-inkSoft">{tool.titleTe}</div>

                  <p className="text-body text-inkSoft">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-3 flex justify-end">
                  <Link
                    href={tool.href}
                    className={buttonClassName({ variant: "tamarind", size: "sm" })}
                  >
                    <span>Open Tool</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <OfficialPensionPortals />

          {/* FAQ Accordion */}
          <div className="space-y-3 pt-4 border-t border-hair">
            <h2 className="text-section text-ink flex items-center gap-2">
              Pensioner Guidance FAQ
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
                  badgeVariant: "tamarind",
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
    </div>
  );
}
