import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "../_components/Card";
import Badge from "../_components/Badge";
import Button from "../_components/Button";
import Breadcrumb from "../_components/Breadcrumb";
import DesktopLeftNav from "../_components/DesktopLeftNav";
import DesktopSidebar from "../_components/DesktopSidebar";

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
];

export default function ToolsIndexPage() {
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0 font-sans">
      {/* 1. Left Rail Navigation */}
      <div className="lg:col-span-3">
        <DesktopLeftNav />
      </div>

      {/* 2. Center Tools Content (Option C Heritage Craft Pattern) */}
      <div className="lg:col-span-6 space-y-6">
        <Breadcrumb items={[{ label: "Utility Tools" }]} />

        {/* Option C Royal Indigo Hero Header */}
        <div className="bg-[#1B2A4A] text-white border border-[#2B3C63] rounded-2xl p-6 space-y-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <Badge variant="turmeric" size="sm" shape="pill" dot>
              Heritage Craft Utility Suite
            </Badge>
            <span className="font-mono text-[10px] text-amber-300">100% Client-Side Privacy</span>
          </div>

          <div>
            <h1 className="text-display text-white tracking-tight">
              Teacher Utility Calculators
            </h1>
            <p className="text-telugu-title text-amber-200 font-medium mt-1">
              ఉపాధ్యాయుల వేతన, పన్ను మరియు బిల్లుల లెక్కింపు సాధనాలు
            </p>
          </div>

          <p className="text-xs text-slate-200 font-mono leading-relaxed">
            All calculations execute strictly inside your browser. No financial data or personal pay details leave your device.
          </p>
        </div>

        {/* Option C Card Grid */}
        <div className="space-y-4">
          {TOOLS.map((tool) => (
            <Card key={tool.href} hoverable className="p-5 space-y-3 bg-[#FAF7F2] border-hair">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2A4A] text-amber-300 flex items-center justify-center text-lg shrink-0">
                    {tool.icon}
                  </div>
                  <Badge variant={tool.popular ? "tamarind" : "neutral"} size="sm" shape="pill">
                    {tool.badge}
                  </Badge>
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

              <div className="pt-1 flex justify-end">
                <Link href={tool.href}>
                  <Button variant="tamarind" size="sm" rightIcon={<span>→</span>}>
                    Open Calculator
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Right Sidebar Rail */}
      <div className="lg:col-span-3">
        <DesktopSidebar />
      </div>
    </div>
  );
}
