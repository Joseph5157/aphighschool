import React from "react";
import type { Metadata } from "next";
import Badge from "../_components/Badge";
import Breadcrumb from "../_components/Breadcrumb";
import Accordion from "../_components/Accordion";
import EducationTabs, { ExamUpdateItem } from "./_components/EducationTabs";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Student & Exam Resources — AP TET, DSC, Textbooks & Hall Tickets",
  description:
    "Official AP School Education student resources, AP TET 2026 guidelines, Mega DSC hall tickets, SCERT textbooks, and exam schedules.",
};

export const revalidate = 3600;

// Fallback content shown when no live posts are tagged for this section yet.
const FALLBACK_EXAM_UPDATES: ExamUpdateItem[] = [
  {
    id: "fallback-dsc-hall-tickets",
    title: "AP Mega DSC 2026 Examination Hall Tickets",
    titleTe: "ఆంధ్రప్రదేశ్ మెగా డిఎస్‌సి 2026 హాల్ టికెట్లు విడుదల",
    category: "Hall Ticket",
    status: "Active Download",
    date: "12 Aug 2026",
    badgeVariant: "success",
    link: "/posts/ap-mega-dsc-2026-hall-tickets",
    desc: "Direct link to download Mega DSC 2026 written exam hall tickets using candidate ID.",
    tags: ["hall-ticket"],
  },
  {
    id: "fallback-tet-notification",
    title: "AP TET 2026 Official Notification & Syllabus",
    titleTe: "ఆంధ్రప్రదేశ్ ఉపాధ్యాయ అర్హత పరీక్ష (AP TET 2026) నిబంధనలు",
    category: "Notification",
    status: "Apply Open",
    date: "10 Aug 2026",
    badgeVariant: "tamarind",
    link: "/posts/ap-tet-2026-notification-guidelines",
    desc: "Online application guidelines, paper-wise eligibility criteria, and SCERT syllabus structure.",
    tags: ["exam-schedule"],
  },
  {
    id: "fallback-scert-textbooks",
    title: "SCERT AP Class 1 to 10 e-Textbooks & Workbooks",
    titleTe: "ఎస్సీఈఆర్‌టీ పాఠ్య పుస్తకాలు మరియు వర్క్ బుక్స్ డౌన్‌లోడ్",
    category: "Textbooks",
    status: "PDF Download",
    date: "05 Aug 2026",
    badgeVariant: "turmeric",
    link: "/orders",
    desc: "Official PDF downloads for AP State Board revised curriculum textbooks for Class 1 to 10.",
    tags: ["textbooks"],
  },
];

const EXAM_TAG_FILTER = ["hall-ticket", "textbooks", "exam-schedule", "results", "education", "exams"];

const QUICK_RESOURCES = [
  { label: "AP TET 2026 Syllabus", count: "Paper I & II", icon: "📘" },
  { label: "Mega DSC Hall Tickets", count: "Download Portal", icon: "🎟️" },
  { label: "SSC Board Exam Model Papers", count: "Class 10", icon: "📝" },
  { label: "DIKSHA e-Content Portal", count: "AP Videos", icon: "📲" },
];

export default async function EducationPage() {
  let examUpdates: ExamUpdateItem[] = FALLBACK_EXAM_UPDATES;
  try {
    const posts = await prisma.post.findMany({
      where: {
        isDraft: false,
        tags: { hasSome: EXAM_TAG_FILTER },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTe: true,
        englishAbstract: true,
        statusBadge: true,
        tags: true,
        createdAt: true,
      },
    });

    if (posts.length > 0) {
      examUpdates = posts.map((post) => ({
        id: post.id,
        title: post.titleEn,
        titleTe: post.titleTe,
        category: post.tags[0] || "Update",
        status: post.statusBadge,
        date: new Date(post.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        badgeVariant: "tamarind",
        link: `/posts/${post.slug}`,
        desc: post.englishAbstract || "",
        tags: post.tags,
      }));
    }
  } catch (e) {
    examUpdates = FALLBACK_EXAM_UPDATES;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <Breadcrumb items={[{ label: "Student & Exam Resources" }]} />

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

        {/* Exam countdown stat row */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold">
            🎟️ DSC Hall Tickets: Active
          </span>
          <span className="font-mono text-[10px] bg-tamarind/20 text-tamarind border border-tamarind/30 px-2.5 py-1 rounded-full font-semibold">
            📘 AP TET 2026: Apply Open
          </span>
          <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
            📚 SCERT Books: PDF Ready
          </span>
        </div>
      </div>

      {/* Quick Resource Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_RESOURCES.map((res, i) => (
          <div key={i} className="bg-[#1E293B] border border-slate-700 text-slate-100 p-3.5 rounded-xl hover:border-emerald-500/50 transition-all">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{res.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs truncate text-white">{res.label}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">{res.count}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Option B Dark Slate Updates Feed — Quick Jump Tabs */}
      <div className="space-y-4">
        <h2 className="text-section text-ink dark:text-slate-100 flex items-center justify-between">
          <span>Latest Exam & Student Notifications</span>
          <span className="text-xs font-mono font-normal text-inkSoft dark:text-slate-400">
            Updated Live
          </span>
        </h2>

        <EducationTabs examUpdates={examUpdates} />
      </div>

      {/* Upcoming Exams FAQ Accordion */}
      <div className="space-y-3">
        <h2 className="text-section text-ink flex items-center gap-2">
          <span>📅</span> Upcoming Exam Schedule
        </h2>
        <Accordion allowMultiple items={[
          {
            id: "dsc-2026",
            titleEn: "AP Mega DSC 2026 — Exam Schedule",
            titleTe: "ఆంధ్రప్రదేశ్ మెగా డిఎస్‌సి 2026 — పరీక్ష షెడ్యూల్",
            badge: "Mega DSC",
            badgeVariant: "tamarind",
            defaultOpen: true,
            content: (
              <div className="space-y-2 text-xs font-mono">
                <div><span className="text-inkSoft">Written Exam:</span> Aug–Sep 2026</div>
                <div><span className="text-inkSoft">Hall Tickets:</span> Active — Download from apssc.ap.gov.in</div>
                <div><span className="text-inkSoft">Posts:</span> 16,347 SGT / SA / LP vacancies</div>
                <div><span className="text-inkSoft">Results Expected:</span> Nov 2026</div>
              </div>
            ),
          },
          {
            id: "tet-2026",
            titleEn: "AP TET 2026 — Application & Syllabus",
            titleTe: "ఆంధ్రప్రదేశ్ టెట్ 2026 — దరఖాస్తు మరియు పాఠ్యప్రణాళిక",
            badge: "AP TET",
            badgeVariant: "turmeric",
            content: (
              <div className="space-y-2 text-xs font-mono">
                <div><span className="text-inkSoft">Apply At:</span> aptet.apcfss.in</div>
                <div><span className="text-inkSoft">Paper I:</span> Classes I–V (Child Dev + Lang + Math + EVS)</div>
                <div><span className="text-inkSoft">Paper II:</span> Classes VI–VIII (Child Dev + Lang + Subject)</div>
                <div><span className="text-inkSoft">Validity:</span> Lifetime</div>
              </div>
            ),
          },
          {
            id: "ssc-2027",
            titleEn: "SSC (Class 10) Board Exams 2027 — Timetable",
            badge: "SSC",
            badgeVariant: "neutral",
            content: (
              <p className="text-xs font-mono">
                Board exam timetable for March 2027 expected in Dec 2026. Model papers available via SCERT portal.
              </p>
            ),
          },
        ]} />
      </div>
    </div>
  );
}
