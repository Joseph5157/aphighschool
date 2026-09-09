import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "../_components/Card";
import { buttonClassName } from "../_components/Button";
import Breadcrumb from "../_components/Breadcrumb";
import Accordion from "../_components/Accordion";

export const metadata: Metadata = {
  title: "Teacher Utility Calculators",
  description:
    "100% client-side salary, income tax (FY 2025-26), leave encashment, GPF/APGLI, PRC and CFMS bill-status calculators for AP teachers.",
  alternates: { canonical: "/tools" },
};

/**
 * SLOP-DENSITY-1 (AI_SLOP_AUDIT.md A14). Each entry used to carry a badge, a
 * separate status line, and two or three numbered "Fill Details →
 * Auto-Calculate → Export PDF" chips. The chips mimicked an onboarding stepper
 * that does not exist and repeated the same sequence on five of six cards,
 * and every badge and status repeated a word already in the title or the
 * description ("FY 2025-26" under "Income Tax Calculator (FY 2025-26)";
 * "Surrender Calculator" above a description about surrender).
 *
 * `exportsStatement` is the one qualifier that survived, because it is the one
 * that differs between tools and cannot be read off the title. It stays
 * verified against the implementation, exactly as the step chips were: a claim
 * that a tool exports anything must be true of that tool's own component.
 */
const TOOLS = [
  {
    href: "/tools/tax-calculator",
    title: "Income Tax Calculator (FY 2025-26)",
    titleTe: "ఆదాయ పన్ను అంచనా సాధనం (ఆయవ్యయ సంవత్సరం 2025-26)",
    desc: "Compare New Tax Regime vs Old Tax Regime with HRA, 80C, 80D deductions and instant Annexure-I tax statement export.",
    icon: "🧮",
    // Verified against TaxCalculatorUI.tsx: window.print() drives a real export.
    exportsStatement: true,
  },
  {
    href: "/tools/leave-encashment",
    title: "Earned Leave (EL) & HPL Encashment Bill",
    titleTe: "ఆర్జిత సెలవుల (EL) ఎన్‌క్యాష్‌మెంట్ బిల్లు లెక్కింపు",
    desc: "Calculate cash equivalent of Earned Leave surrender (15/30 days) and Half Pay Leave retirement encashment.",
    icon: "🏖️",
    // LeaveEncashmentUI.tsx has no print/export path.
    exportsStatement: false,
  },
  {
    href: "/tools/gpf-apgli",
    title: "GPF & APGLI Balance Estimator",
    titleTe: "జిపిఎఫ్ మరియు ఎపిజిఎల్ఐ నిధుల అంచనా సాధనం",
    desc: "Project General Provident Fund 7.1% interest growth and APGLI maturity sum assured with loan eligibility bounds.",
    icon: "💰",
    // GpfApgliUI.tsx has no print/export path.
    exportsStatement: false,
  },
  {
    href: "/tools/cfms-checker",
    title: "CFMS Bill Status & Payslip Guide",
    titleTe: "సిఎఫ్‌ఎమ్‌ఎస్ బిల్లు స్థితి మరియు పేస్లిప్ మార్గదర్శి",
    desc: "Direct verification portal for DDO bill submission status, EHS medical reimbursement, and monthly payslip downloads.",
    icon: "📑",
    // CfmsCheckerUI.tsx is a links directory — no form, no calculation, no export.
    exportsStatement: false,
  },
  {
    href: "/tools/prc-calculator",
    title: "PRC Pay Fixation & Arrears Calculator",
    titleTe: "పీఆర్‌సి పే ఫిక్సేషన్ మరియు బకాయిల లెక్కింపు సాధనం",
    desc: "Calculate revised Basic Pay under AP RPS 2022 Master Scale, fitment percentage, gross benefit, and CPS/GPF arrears allocation.",
    icon: "📊",
    // Verified against PrcCalculatorUI.tsx: isPrintMode drives a real export.
    exportsStatement: true,
  },
  {
    href: "/tools/da-arrears",
    title: "DA Arrears Calculator",
    titleTe: "డిఏ బకాయిల లెక్కింపు సాధనం",
    desc: "Calculate Dearness Allowance arrears owed for a given Basic Pay, old/new DA percentage, and revision period, with a month-by-month breakdown.",
    icon: "📈",
    // DaArrearsUI.tsx has no print/export path.
    exportsStatement: false,
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb items={[{ label: "Utility Tools" }]} />

      <div className="space-y-6">
          {/*
            SLOP-REMOVE-1 (AI_SLOP_AUDIT.md A12): the client-side privacy fact is
            stated once, plainly, above the calculators. It previously appeared
            five times on this route — as a hero eyebrow, hero body sentence, a
            bordered strip, a "Privacy First" pill, and again as a navy
            "Client-Side Security Guarantee" card in the sidebar. Repeating one
            implementation fact in five voices reads as marketing, not accuracy.
            "Heritage Craft Utility Suite" was ornamental brand copy and is gone.
          */}
          <div className="on-masthead bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 space-y-3 shadow-md relative overflow-hidden">
            <div>
              <h1 className="text-display text-mastheadText tracking-tight">
                Teacher Utility Calculators
              </h1>
              <p className="text-telugu-title text-turmeric font-medium mt-1">
                ఉపాధ్యాయుల వేతన, పన్ను మరియు బిల్లుల లెక్కింపు సాధనాలు
              </p>
            </div>

            <p className="text-body text-mastheadText/70">
              Income tax, DA arrears, leave encashment, GPF/APGLI and PRC pay fixation
              calculations for AP teachers. Every calculation runs inside your browser —
              no pay or personal detail you enter is sent to a server.
            </p>
          </div>

          {/* Option C Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {TOOLS.map((tool) => (
              <Card key={tool.href} hoverable className="p-5 space-y-3 bg-paperRaised border-hair flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-card-title text-ink">
                    <span aria-hidden="true" className="mr-1.5">{tool.icon}</span>
                    <span>{tool.title}</span>
                  </h3>
                  <div className="text-telugu-body text-inkSoft">
                    {tool.titleTe}
                  </div>

                  <p className="text-body text-inkSoft">
                    {tool.desc}
                  </p>

                  {tool.exportsStatement && (
                    <p className="text-meta font-mono text-inkSoft/90">
                      Exports a printable statement
                    </p>
                  )}
                </div>

                <div className="pt-3 flex justify-end">
                  <Link
                    href={tool.href}
                    className={buttonClassName({ variant: "tamarind", size: "sm" })}
                  >
                    <span>Open Calculator</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="space-y-3 pt-4 border-t border-hair">
            <h2 className="text-section text-ink flex items-center gap-2">
              <span>❓</span> Frequently Asked Questions
            </h2>
            <Accordion allowMultiple items={[
              {
                id: "faq-tax",
                titleEn: "Which tax regime should AP teachers choose in FY 2025-26?",
                titleTe: "ఆయవ్యయ సంవత్సరం 2025-26లో ఏ పన్ను నియమావళి ఎంచుకోవాలి?",
                badge: "Tax",
                badgeVariant: "turmeric",
                defaultOpen: true,
                content: (
                  <p>
                    For AP teachers with standard HRA and 80C deductions, the Old Regime is usually better
                    if total deductions exceed ₹2.5 lakh. Use our calculator to compare both regimes instantly.
                  </p>
                ),
              },
              {
                id: "faq-el",
                titleEn: "How many days of Earned Leave can I surrender per year?",
                titleTe: "సంవత్సరానికి ఎన్ని రోజుల ఆర్జిత సెలవులు వదులుకోవచ్చు?",
                badge: "Leave",
                badgeVariant: "neutral",
                content: (
                  <p>
                    AP teachers can surrender up to 15 days of EL per year while in service
                    and up to 30 days at retirement. HPL encashment is applicable only at superannuation.
                  </p>
                ),
              },
              {
                id: "faq-gpf",
                titleEn: "What is the current GPF interest rate for AP teachers?",
                badge: "GPF",
                badgeVariant: "neutral",
                content: (
                  <p>
                    The current GPF interest rate is <strong>7.1% per annum</strong>, compounded annually.
                    The balance grows on a monthly credit basis with final interest calculated at year end.
                  </p>
                ),
              },
              {
                id: "faq-cfms",
                titleEn: "How do I check my CFMS bill status or download my payslip?",
                badge: "CFMS",
                badgeVariant: "tamarind",
                content: (
                  <p>
                    Use our CFMS Bill Status guide to navigate directly to the DDO submission portal
                    and the payslip download section. No login needed for bill status — only Employee ID required.
                  </p>
                ),
              },
            ]} />
          </div>
        </div>
    </div>
  );
}
