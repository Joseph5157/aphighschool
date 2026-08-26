import React from "react";
import Link from "next/link";
import Badge from "../../_components/Badge";

const STATUS_BREAKDOWN = [
  { label: "GOIR Verified Gazette", count: "Official", desc: "goir.ap.gov.in verified", dot: "emerald-500" },
  { label: "Notified Orders", count: "Gazette", desc: "Department issued", dot: "amber-500" },
  { label: "Online Applications", count: "Active", desc: "TET & DSC portals", dot: "blue-500" },
  { label: "Archived / Expired", count: "Historical", desc: "Past academic years", dot: "slate-400" },
];

const POPULAR_GO_TAGS = [
  { label: "#DAArrears", href: "/search?q=DA+Arrears" },
  { label: "#MegaDSC2026", href: "/search?q=Mega+DSC" },
  { label: "#APTET", href: "/search?q=TET" },
  { label: "#TransferRules", href: "/search?q=Transfers" },
  { label: "#PRC2024", href: "/search?q=PRC" },
  { label: "#Form16Tax", href: "/tools/tax-calculator" },
  { label: "#GPFInterest", href: "/tools/gpf-apgli" },
  { label: "#EHSMedical", href: "/tools/cfms-checker" },
];

export default function OrdersSidebar() {
  return (
    <aside className="space-y-6 font-sans">
      {/* 1. GOIR Verification & Status Breakdown (Option A Gazette Theme) */}
      <div className="bg-paperRaised border border-hair rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-hair/60 pb-3">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
              <span>🏛️</span> GOIR Repository Stats
            </h3>
            <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
              Official Document Classification
            </p>
          </div>
          <Badge variant="success" size="sm" shape="pill" dot>
            Verified
          </Badge>
        </div>

        <div className="space-y-2.5">
          {STATUS_BREAKDOWN.map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-paper/60 border border-hair/60 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-${item.dot} shrink-0`} />
                <div>
                  <div className="text-xs font-bold text-ink">{item.label}</div>
                  <div className="text-[10px] font-mono text-inkSoft">{item.desc}</div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-ink bg-ink/10 px-2 py-0.5 rounded">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Trending G.O. Search Tags Widget */}
      <div className="bg-paperRaised border border-hair rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-hair/60 pb-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            <span>🔥</span> Trending G.O. Topics
          </h3>
          <span className="text-[10px] font-mono text-inkSoft">Searched</span>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {POPULAR_GO_TAGS.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="px-3 py-1 rounded-full border border-hair bg-paper/50 hover:bg-ink hover:text-paper text-inkSoft font-semibold transition-all shadow-2xs"
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Official Gazette Repository Banner */}
      <div className="bg-masthead text-mastheadText rounded-2xl p-5 space-y-3 shadow-md border border-mastheadText/40">
        <div className="flex items-center justify-between">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            goir.ap.gov.in
          </Badge>
          <span className="text-[10px] font-mono text-turmeric">AP Gazette</span>
        </div>

        <div className="font-bold text-xs text-mastheadText">
          Andhra Pradesh Government Orders Repository
        </div>

        <p className="text-xs text-mastheadText/80 font-mono leading-relaxed">
          All G.O. Ms, G.O. Rt, Memos, and Circulars published on AP Teacher Desk are verified against official gazette records.
        </p>

        <div className="pt-1">
          <a
            href="https://goir.ap.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-turmeric hover:underline font-bold"
          >
            <span>Open GOIR Official Portal</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
