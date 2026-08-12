import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "../_components/Card";
import Badge from "../_components/Badge";
import Button from "../_components/Button";

export const metadata: Metadata = {
  title: "Student & Exam Resources — AP TET, DSC, Textbooks & Hall Tickets",
  description:
    "Official AP School Education student resources, AP TET 2026 guidelines, Mega DSC hall tickets, SCERT textbooks, and exam schedules.",
};

const EXAM_UPDATES = [
  {
    title: "AP Mega DSC 2026 Examination Hall Tickets",
    titleTe: "ఆంధ్రప్రదేశ్ మెగా డిఎస్‌సి 2026 హాల్ టికెట్లు విడుదల",
    category: "Hall Ticket",
    status: "Active Download",
    date: "12 Aug 2026",
    badgeVariant: "success" as const,
    link: "/posts/ap-mega-dsc-2026-hall-tickets",
    desc: "Direct link to download Mega DSC 2026 written exam hall tickets using candidate ID.",
  },
  {
    title: "AP TET 2026 Official Notification & Syllabus",
    titleTe: "ఆంధ్రప్రదేశ్ ఉపాధ్యాయ అర్హత పరీక్ష (AP TET 2026) నిబంధనలు",
    category: "Notification",
    status: "Apply Open",
    date: "10 Aug 2026",
    badgeVariant: "tamarind" as const,
    link: "/posts/ap-tet-2026-notification-guidelines",
    desc: "Online application guidelines, paper-wise eligibility criteria, and SCERT syllabus structure.",
  },
  {
    title: "SCERT AP Class 1 to 10 e-Textbooks & Workbooks",
    titleTe: "ఎస్సీఈఆర్‌టీ పాఠ్య పుస్తకాలు మరియు వర్క్ బుక్స్ డౌన్‌లోడ్",
    category: "Textbooks",
    status: "PDF Download",
    date: "05 Aug 2026",
    badgeVariant: "turmeric" as const,
    link: "/orders",
    desc: "Official PDF downloads for AP State Board revised curriculum textbooks for Class 1 to 10.",
  },
];

const QUICK_RESOURCES = [
  { label: "AP TET 2026 Syllabus", count: "Paper I & II", icon: "📘" },
  { label: "Mega DSC Hall Tickets", count: "Download Portal", icon: "🎟️" },
  { label: "SSC Board Exam Model Papers", count: "Class 10", icon: "📝" },
  { label: "DIKSHA e-Content Portal", count: "AP Videos", icon: "📲" },
];

export default function EducationPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header Hero Banner (Option B Slate Theme) */}
      <div className="bg-[#0F172A] text-[#F8FAFC] border border-slate-700/80 rounded-2xl p-6 md:p-8 space-y-3 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <Badge variant="tamarind" size="sm" shape="pill" dot>
            Digital Secretariat Hub
          </Badge>
          <span className="font-mono text-[10px] text-slate-400">AP School Education</span>
        </div>

        <div>
          <h1 className="text-display text-white tracking-tight">
            Student & Exam Resources
          </h1>
          <p className="text-telugu-title text-emerald-400 font-medium mt-1">
            విద్యార్థుల పాఠ్యపుస్తకాలు, పరీక్షల నిబంధనలు మరియు హాల్ టికెట్లు
          </p>
        </div>

        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          Verified updates for AP TET 2026, Mega DSC Hall Tickets, SCERT Telugu/English Medium textbooks, and board exam schedules.
        </p>
      </div>

      {/* Quick Resource Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_RESOURCES.map((res, i) => (
          <Card key={i} className="bg-[#1E293B] border-slate-700 text-slate-100 p-3.5 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{res.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs truncate text-white">{res.label}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{res.count}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Option B Dark Slate Updates Feed */}
      <div className="space-y-4">
        <h2 className="text-section text-ink dark:text-slate-100 flex items-center justify-between">
          <span>Latest Exam & Student Notifications</span>
          <span className="text-xs font-mono font-normal text-inkSoft dark:text-slate-400">
            Updated Live
          </span>
        </h2>

        {EXAM_UPDATES.map((item, idx) => (
          <Card
            key={idx}
            className="bg-[#1E293B] border-slate-700 hover:border-emerald-500/50 text-slate-100 p-5 space-y-3 transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Badge variant={item.badgeVariant} size="sm" shape="pill" dot>
                  {item.status}
                </Badge>
                <span className="text-slate-400 font-semibold">{item.category}</span>
              </div>
              <span className="text-slate-400">{item.date}</span>
            </div>

            <div>
              <h3 className="text-card-title text-white group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <div className="text-telugu-body text-slate-300 mt-1">
                {item.titleTe}
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed pt-2 border-t border-slate-700/60">
              {item.desc}
            </p>

            <div className="pt-1 flex justify-end">
              <Link href={item.link}>
                <Button variant="secondary" size="sm" rightIcon={<span>→</span>}>
                  Open Official Link
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
