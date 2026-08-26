import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";
import Button from "./Button";
import Separator from "./Separator";

const QUICK_TOOLS = [
  { href: "/tools/tax-calculator", label: "Income Tax Calculator", icon: "🧮", badge: "FY 2025-26", desc: "New & Old Regimes" },
  { href: "/tools/leave-encashment", label: "Leave Encashment Bill", icon: "🏖️", badge: "EL / HPL", desc: "Surrender Calculator" },
  { href: "/tools/gpf-apgli", label: "GPF & APGLI Estimator", icon: "💰", badge: "7.1% Growth", desc: "Part-Final Eligibility" },
  { href: "/tools/cfms-checker", label: "CFMS Bill Status", icon: "📑", badge: "Payslip", desc: "Direct Status Checker" },
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
            <Link href="/tools" className="w-full">
              <Button variant="secondary" size="sm" fullWidth rightIcon={<span>→</span>}>
                Explore All Utility Tools
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 2. Popular Topics & Tags Widget */}
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <span>🔥</span> Trending Search Topics
          </CardTitle>
          <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
            Frequently referenced AP orders
          </p>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {POPULAR_TAGS.map((tag) => (
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

      {/* 3. Official App & Portal Hub */}
      <Card className="bg-gradient-to-br from-paperRaised to-hair/20 border-hair">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <Badge variant="turmeric" size="sm" shape="pill" dot>
              Official AP & TS Portals
            </Badge>
            <span className="text-[10px] font-mono text-inkSoft/70">Government Links</span>
          </div>
          
          <div className="font-bold text-xs text-ink tracking-tight">
            Teacher Service & Treasury Links
          </div>
          
          <ul className="text-xs text-inkSoft space-y-1.5 font-mono">
            <li className="flex items-center gap-2">
              <span className="text-tamarind font-bold">•</span>
              <span>CFMS Treasury Payslip Portal</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-tamarind font-bold">•</span>
              <span>AP EHS Health Cards Directory</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-tamarind font-bold">•</span>
              <span>DIKSHA App & Teacher e-SR</span>
            </li>
          </ul>

          <Separator />
          
          <div className="flex justify-between items-center text-xs font-mono font-bold text-tamarind pt-1">
            <span>Verified Sources</span>
            <Link href="/tools/cfms-checker" className="hover:underline flex items-center gap-1">
              <span>Open Guide</span>
              <span>→</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
