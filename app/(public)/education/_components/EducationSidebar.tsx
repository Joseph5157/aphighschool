import React from "react";
import Link from "next/link";
import Badge from "../../_components/Badge";

const QUICK_DOWNLOADS = [
  { label: "AP TET 2026 Syllabus", info: "Paper I & II PDFs", icon: "📘", href: "/posts/ap-tet-2026-notification-guidelines" },
  { label: "Mega DSC Hall Tickets", info: "Candidate ID Portal", icon: "🎟️", href: "/posts/ap-mega-dsc-2026-hall-tickets" },
  { label: "SSC Board Model Papers", info: "Class 10 All Subjects", icon: "📝", href: "/orders" },
  { label: "DIKSHA e-Content Portal", info: "AP SCERT Videos", icon: "📲", href: "https://diksha.gov.in/ap", external: true },
];

const KEY_DATES = [
  { event: "Mega DSC Written Exam", date: "Aug–Sep 2026", status: "Active", variant: "success" as const },
  { event: "AP TET Online Apply", date: "Deadline 25 Aug", status: "Open", variant: "tamarind" as const },
  { event: "SSC Class 10 Timetable", date: "Dec 2026 Expected", status: "Upcoming", variant: "neutral" as const },
];

const OFFICIAL_PORTALS = [
  { name: "AP School Education Dept", url: "https://schooledu.ap.gov.in" },
  { name: "AP TET Official Portal", url: "https://aptet.apcfss.in" },
  { name: "AP DSC Candidate Portal", url: "https://apssc.ap.gov.in" },
  { name: "SCERT AP Textbooks", url: "https://scert.ap.gov.in" },
];

export default function EducationSidebar() {
  return (
    <aside className="space-y-6 font-sans">
      {/* 1. Quick Resource Downloads Widget (Option B Dark Slate) */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>⚡</span> Quick Exam Downloads
            </h3>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              SCERT & Exam Portals
            </p>
          </div>
          <Badge variant="tamarind" size="sm" shape="pill" dot>
            Verified
          </Badge>
        </div>

        <div className="space-y-2.5">
          {QUICK_DOWNLOADS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-700/80 hover:border-emerald-500/50 bg-[#0F172A]/50 hover:bg-[#0F172A] transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {item.info}
                  </div>
                </div>
              </div>
              <span className="text-slate-400 group-hover:text-emerald-400 text-xs font-mono transition-colors">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Key Exam Deadlines & Countdowns Widget */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-sm text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <span>📅</span> Exam Schedule Tracker
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Live Status</span>
        </div>

        <div className="space-y-3">
          {KEY_DATES.map((item) => (
            <div
              key={item.event}
              className="p-3 rounded-xl bg-[#0F172A]/40 border border-slate-700/60 flex items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-xs text-slate-100">{item.event}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.date}</div>
              </div>
              <Badge variant={item.variant} size="sm" shape="pill" dot>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Official Government Portals */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-2xl p-5 space-y-3 text-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <Badge variant="turmeric" size="sm" shape="pill" dot>
            Official AP Portals
          </Badge>
          <span className="text-[10px] font-mono text-slate-400">Direct Links</span>
        </div>

        <div className="font-bold text-xs text-white">
          AP School Education Exam Portals
        </div>

        <ul className="text-xs text-slate-300 space-y-2 font-mono">
          {OFFICIAL_PORTALS.map((portal) => (
            <li key={portal.name}>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between hover:text-emerald-400 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{portal.name}</span>
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-emerald-400 transition-colors">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
