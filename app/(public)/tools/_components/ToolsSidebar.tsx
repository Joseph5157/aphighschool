import React from "react";
import Link from "next/link";
import Badge from "../../_components/Badge";

const FINANCIAL_RATES = [
  { label: "Current DA Rate", val: "30.392%", note: "Govt Order 2026", badge: "Active" },
  { label: "GPF Interest Rate", val: "7.1% p.a.", note: "Quarterly Govt Rate", badge: "Fixed" },
  { label: "Standard Tax Deduction", val: "₹75,000", note: "FY 2025-26 New Regime", badge: "Updated" },
  { label: "APGLI Max Premium", val: "20% Basic", note: "Category Slabs", badge: "Max Limit" },
];

const DDO_CHECKLIST = [
  { title: "Income Tax Annexure-I", desc: "Statement export with HRA 80C breakdown", icon: "📑", href: "/tools/tax-calculator" },
  { title: "EL / HPL Encashment Bill", desc: "15-day surrender & superannuation bill", icon: "🏖️", href: "/tools/leave-encashment" },
  { title: "CFMS Bill Status", desc: "DDO submission & treasury status check", icon: "💳", href: "/tools/cfms-checker" },
];

export default function ToolsSidebar() {
  return (
    <aside className="space-y-6 font-sans">
      {/* 1. Financial Rates & Constants Widget (Option C Heritage Craft) */}
      <div className="bg-paperRaised border border-hair rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-hair/60 pb-3">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <span>📊</span> Financial Rates Summary
            </h3>
            <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
              AP Treasury Approved Standards
            </p>
          </div>
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            FY 2025-26
          </Badge>
        </div>

        <div className="space-y-2.5">
          {FINANCIAL_RATES.map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-paper/60 border border-hair/60 flex items-center justify-between gap-2"
            >
              <div>
                <div className="text-[11px] font-bold text-ink">{item.label}</div>
                <div className="text-[10px] font-mono text-inkSoft">{item.note}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-xs text-ink">{item.val}</div>
                <span className="font-mono text-[9px] text-turmericDeep font-semibold">{item.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DDO Submission & Bill Checklist Widget */}
      <div className="bg-paperRaised border border-hair rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-hair/60 pb-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <span>📋</span> DDO Bill Submission Guide
          </h3>
          <span className="text-[10px] font-mono text-inkSoft">Checklist</span>
        </div>

        <div className="space-y-2.5">
          {DDO_CHECKLIST.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center justify-between p-3 rounded-xl border border-hair/60 hover:border-ink/40 bg-paper/30 hover:bg-paperRaised transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-ink/10 text-ink border border-ink/20 flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-xs text-ink group-hover:text-inkSoft transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-mono text-inkSoft/70">
                    {item.desc}
                  </div>
                </div>
              </div>
              <span className="text-inkSoft group-hover:text-ink text-xs font-mono transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Offline Privacy Guarantee Banner */}
      <div className="bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-inkSoft)] text-paper rounded-2xl p-5 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            100% Privacy First
          </Badge>
          <span className="text-[10px] font-mono text-turmeric">Browser Native</span>
        </div>

        <div className="font-bold text-xs text-paper">
          Client-Side Security Guarantee
        </div>

        <p className="text-xs text-paper/70 font-mono leading-relaxed">
          Zero network requests executed when calculating salary, tax statements, or leave bills. All data stays local to your web browser.
        </p>
      </div>
    </aside>
  );
}
