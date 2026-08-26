import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "../_components/Card";
import Badge from "../_components/Badge";
import { buttonClassName } from "../_components/Button";
import Breadcrumb from "../_components/Breadcrumb";
import Accordion from "../_components/Accordion";
import ToolsSidebar from "./_components/ToolsSidebar";

export const metadata: Metadata = {
  title: "Teacher Utility Calculators — AP Teacher Desk",
  description:
    "100% client-side privacy-first salary calculators, Income Tax FY 2025-26 estimators, Leave Encashment tools, and CFMS bill checkers for AP teachers.",
};

const TOOLS = [
  {
    href: "/tools/tax-calculator",
    title: "Income Tax Calculator (FY 2025-26)",
    titleTe: "ఆదాయ పన్ను అంచనా సాధనం (ఆయవ్యయ సంవత్సరం 2025-26)",
    desc: "Compare New Tax Regime vs Old Tax Regime with HRA, 80C, 80D deductions and instant Annexure-I tax statement export.",
    icon: "🧮",
    badge: "FY 2025-26",
    status: "Updated Slabs",
    popular: true,
  },
  {
    href: "/tools/leave-encashment",
    title: "Earned Leave (EL) & HPL Encashment Bill",
    titleTe: "ఆర్జిత సెలవుల (EL) ఎన్‌క్యాష్‌మెంట్ బిల్లు లెక్కింపు",
    desc: "Calculate cash equivalent of Earned Leave surrender (15/30 days) and Half Pay Leave retirement encashment.",
    icon: "🏖️",
    badge: "EL / HPL",
    status: "Surrender Calculator",
    popular: false,
  },
  {
    href: "/tools/gpf-apgli",
    title: "GPF & APGLI Balance Estimator",
    titleTe: "జిపిఎఫ్ మరియు ఎపిజిఎల్ఐ నిధుల అంచనా సాధనం",
    desc: "Project General Provident Fund 7.1% interest growth and APGLI maturity sum assured with loan eligibility bounds.",
    icon: "💰",
    badge: "7.1% Interest",
    status: "Part-Final Loan",
    popular: false,
  },
  {
    href: "/tools/cfms-checker",
    title: "CFMS Bill Status & Payslip Guide",
    titleTe: "సిఎఫ్‌ఎమ్‌ఎస్ బిల్లు స్థితి మరియు పేస్లిప్ మార్గదర్శి",
    desc: "Direct verification portal for DDO bill submission status, EHS medical reimbursement, and monthly payslip downloads.",
    icon: "📑",
    badge: "Payslip Portal",
    status: "Direct Status",
    popular: false,
  },
  {
    href: "/tools/da-arrears",
    title: "DA Arrears Calculator",
    titleTe: "డిఏ బకాయిల లెక్కింపు సాధనం",
    desc: "Calculate Dearness Allowance arrears owed for a given Basic Pay, old/new DA percentage, and revision period, with a month-by-month breakdown.",
    icon: "📈",
    badge: "DA Revision",
    status: "Month-by-Month",
    popular: false,
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb items={[{ label: "Utility Tools" }]} />

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        {/* Main Feed Column (8 cols on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Option C Royal Indigo Hero Header */}
          <div className="bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 space-y-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <Badge variant="turmeric" size="sm" shape="pill" dot>
                Heritage Craft Utility Suite
              </Badge>
              <span className="font-mono text-[10px] text-turmeric">100% Client-Side Privacy</span>
            </div>

            <div>
              <h1 className="text-display text-mastheadText tracking-tight">
                Teacher Utility Calculators
              </h1>
              <p className="text-telugu-title text-turmeric font-medium mt-1">
                ఉపాధ్యాయుల వేతన, పన్ను మరియు బిల్లుల లెక్కింపు సాధనాలు
              </p>
            </div>

            <p className="text-xs text-mastheadText/70 font-mono leading-relaxed">
              All calculations execute strictly inside your browser. No financial data or personal pay details leave your device.
            </p>
          </div>

          {/* Privacy shield info strip */}
          <div className="bg-paperRaised border border-turmeric/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 font-mono text-xs text-inkSoft">
              <span className="text-turmericDeep text-base">🔒</span>
              <span>100% Client-Side · No Server Calls · No Financial Data Stored</span>
            </div>
            <span className="font-mono text-[10px] font-semibold text-turmericDeep bg-turmeric/10 border border-turmeric/30 px-2.5 py-1 rounded-full">
              Privacy First
            </span>
          </div>

          {/* Option C Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TOOLS.map((tool) => (
              <Card key={tool.href} hoverable className="p-5 space-y-3 bg-paperRaised border-hair flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-ink text-turmeric flex items-center justify-center text-lg shrink-0">
                        {tool.icon}
                      </div>
                      <Badge variant={tool.popular ? "tamarind" : "neutral"} size="sm" shape="pill">
                        {tool.badge}
                      </Badge>
                      {tool.popular && (
                        <span className="font-mono text-[9px] font-bold bg-turmeric/20 text-turmericDeep border border-turmeric/40 px-2 py-0.5 rounded-full">
                          ⭐ Most Used
                        </span>
                      )}
                    </div>
                    <span className="text-inkSoft font-semibold">{tool.status}</span>
                  </div>

                  <div>
                    <h3 className="text-card-title text-ink">
                      {tool.title}
                    </h3>
                    <div className="text-telugu-body text-inkSoft mt-1">
                      {tool.titleTe}
                    </div>
                  </div>

                  <p className="text-xs text-inkSoft font-mono leading-relaxed pt-2 border-t border-hair/50">
                    {tool.desc}
                  </p>

                  {/* Step flow chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {["Fill Details", "Auto-Calculate", "Export PDF"].map((step, i) => (
                      <span key={i} className="inline-flex items-center gap-1 font-mono text-[9px] bg-ink/5 text-ink border border-ink/15 px-2 py-0.5 rounded">
                        <span className="font-bold">{i + 1}</span>
                        <span className="text-inkSoft/60">·</span>
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={tool.href}
                    className={buttonClassName({ variant: "tamarind", size: "sm" })}
                  >
                    <span>Open Calculator</span>
                    <span>→</span>
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

        {/* Sidebar Column (4 cols on Desktop) */}
        <div className="lg:col-span-4">
          <ToolsSidebar />
        </div>
      </div>
    </div>
  );
}
