import React from "react";
import Link from "next/link";
import Badge from "../../_components/Badge";

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
      {/* 1. Quick Searches Widget */}
      <div className="bg-paperRaised border border-hair rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-hair/60 pb-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
            Quick Searches
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

      {/* 2. GOIR resource banner */}
      <div className="bg-masthead text-mastheadText rounded-2xl p-5 space-y-3 shadow-md border border-mastheadText/40">
        <div className="flex items-center justify-between">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            goir.ap.gov.in
          </Badge>
          <span className="text-[10px] font-mono text-turmeric">GOIR resource</span>
        </div>

        <div className="font-bold text-xs text-mastheadText">
          Government Orders Information Repository
        </div>

        <p className="text-body text-mastheadText/80">
          GOIR (goir.ap.gov.in) is a government-orders resource. Documents marked &ldquo;GOIR Verified&rdquo; have a recorded verification in AP Teacher Desk.
        </p>

        <div className="pt-1">
          <a
            href="https://goir.ap.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-turmeric hover:underline font-bold"
          >
            <span>Open GOIR</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
