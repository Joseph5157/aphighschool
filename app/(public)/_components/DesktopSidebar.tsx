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

const DEPT_LINKS = [
  { href: "/category/school-education", label: "School Education Dept", count: "AP / TS" },
  { href: "/category/finance", label: "Finance & Treasury Dept", count: "PRC & DA" },
  { href: "/category/higher-education", label: "Higher & Technical Ed", count: "Colleges" },
  { href: "/orders", label: "View All Departments →", count: "Directory" },
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

      {/* 2. Department Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>📁</span> Department Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-2 text-xs font-mono">
          {DEPT_LINKS.map((dept) => (
            <Link
              key={dept.href}
              href={dept.href}
              className="group flex items-center justify-between p-2 rounded-md hover:bg-hair/20 transition-all text-inkSoft hover:text-ink font-semibold"
            >
              <span>{dept.label}</span>
              <span className="text-[10px] text-inkSoft/70 font-normal">{dept.count}</span>
            </Link>
          ))}
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
