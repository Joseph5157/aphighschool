import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import Separator from "./Separator";

const QUICK_TOOLS = [
  { href: "/tools/tax-calculator", label: "Income Tax Calculator", icon: "🧮", badge: "FY 2025-26" },
  { href: "/tools/leave-encashment", label: "Leave Encashment Bill", icon: "🏖️", badge: "EL / HPL" },
  { href: "/tools/gpf-apgli", label: "GPF & APGLI Estimator", icon: "💰", badge: "Loan Limit" },
  { href: "/tools/cfms-checker", label: "CFMS Bill Status", icon: "📑", badge: "Payslip Portal" },
];

const POPULAR_TAGS = [
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
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span>⚡</span> Teacher Utility Tools
            </CardTitle>
            <Badge variant="tamarind" size="sm">
              Client-Side
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-2">
          {QUICK_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex items-center justify-between p-2.5 rounded-lg border border-hair/60 hover:border-ink/30 bg-paper/40 hover:bg-paperRaised transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{tool.icon}</span>
                <span className="font-bold text-xs text-ink group-hover:text-tamarind transition-colors">
                  {tool.label}
                </span>
              </div>
              <Badge variant="neutral" size="sm">
                {tool.badge}
              </Badge>
            </Link>
          ))}
          <div className="pt-2">
            <Link href="/tools" className="w-full">
              <Button variant="secondary" size="sm" fullWidth rightIcon={<span>→</span>}>
                Explore All Utility Tools
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Popular Topics & Tags Widget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>🔥</span> Popular Topics & Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {POPULAR_TAGS.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="px-2.5 py-1 rounded-md bg-hair/30 hover:bg-ink hover:text-white text-inkSoft font-semibold transition-all"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Official App & Portal Hub */}
      <Card className="bg-gradient-to-br from-paperRaised to-hair/20 border-hair">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="turmeric" size="sm" shape="pill" dot>
              Official Portals
            </Badge>
          </div>
          <div className="font-bold text-xs text-ink tracking-tight">
            AP & TS Teacher Service Quick Links
          </div>
          <p className="text-[11px] text-inkSoft leading-relaxed">
            Direct access to CFMS Treasury, AP EHS Health Cards, DIKSHA Learning App, and AG GPF account statements.
          </p>
          <Separator />
          <div className="flex justify-between items-center text-xs font-mono font-bold text-tamarind">
            <span>Verified Official Sources</span>
            <Link href="/tools/cfms-checker" className="hover:underline">
              Open Directory →
            </Link>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
