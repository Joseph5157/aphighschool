import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";
import { buttonClassName } from "./Button";

const QUICK_TOOLS = [
  { href: "/tools/tax-calculator", label: "Income Tax Calculator", icon: "🧮", badge: "FY 2025-26", desc: "New & Old Regimes" },
  { href: "/tools/leave-encashment", label: "Leave Encashment Bill", icon: "🏖️", badge: "EL / HPL", desc: "Surrender Calculator" },
  { href: "/tools/gpf-apgli", label: "GPF & APGLI Estimator", icon: "💰", badge: "7.1% Growth", desc: "Part-Final Eligibility" },
  { href: "/tools/cfms-checker", label: "CFMS Bill Status", icon: "📑", badge: "Payslip", desc: "Direct Status Checker" },
];

const QUICK_SEARCHES = [
  { label: "#DAArrears", href: "/search?q=DA+Arrears" },
  { label: "#MegaDSC2026", href: "/search?q=Mega+DSC" },
  { label: "#APTET", href: "/search?q=TET" },
  { label: "#TransferRules", href: "/search?q=Transfers" },
  { label: "#Form16Tax", href: "/tools/tax-calculator" },
  { label: "#PRC2024", href: "/search?q=PRC" },
  { label: "#GPFInterest", href: "/tools/gpf-apgli" },
  { label: "#EHSMedical", href: "/tools/cfms-checker" },
];

export default function DesktopSidebar() {
  return (
    <aside className="space-y-6 sticky top-20 hidden lg:block font-sans">
      {/* 1. Quick Tools Widget */}
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span>⚡</span> Teacher Calculators
              </CardTitle>
              <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
                Client-Side & Offline Ready
              </p>
            </div>
            <Badge variant="tamarind" size="sm" shape="pill" dot>
              Client-Side
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-3">
          {QUICK_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center justify-between p-3 rounded-xl border border-hair/60 hover:border-ink/40 bg-paper/30 hover:bg-paperRaised transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-tamarind/10 text-tamarind border border-tamarind/20 flex items-center justify-center text-base shrink-0">
                  {tool.icon}
                </div>
                <div>
                  <div className="font-bold text-xs text-ink group-hover:text-tamarind transition-colors">
                    {tool.label}
                  </div>
                  <div className="text-[10px] font-mono text-inkSoft/70">
                    {tool.desc}
                  </div>
                </div>
              </div>
              <Badge variant="neutral" size="sm" shape="pill">
                {tool.badge}
              </Badge>
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/tools"
              className={buttonClassName({ variant: "secondary", size: "sm", fullWidth: true })}
            >
              <span>Explore All Utility Tools</span>
              <span>→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Quick Searches Widget */}
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            Quick Searches
          </CardTitle>
          <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
            Jump to a topic
          </p>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {QUICK_SEARCHES.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="px-3 py-1 rounded-full border border-hair bg-paper/40 hover:bg-ink hover:text-paper text-inkSoft font-semibold transition-all shadow-2xs"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
