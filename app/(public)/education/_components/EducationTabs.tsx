"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../_components/Tabs";
import Badge, { BadgeVariant } from "../../_components/Badge";

export type ExamUpdateItem = {
  id: string;
  title: string;
  titleTe?: string;
  category: string;
  status: string;
  date: string;
  badgeVariant: BadgeVariant;
  link: string;
  desc: string;
  tags: string[];
};

const TABS = [
  { value: "all", label: "All Updates", icon: "" },
  { value: "hall-ticket", label: "Hall Tickets", icon: "🎟️" },
  { value: "textbooks", label: "Textbooks", icon: "📚" },
  { value: "exam-schedule", label: "Exam Schedule", icon: "📅" },
  { value: "results", label: "Results", icon: "🏆" },
];

function UpdateCard({ item }: { item: ExamUpdateItem }) {
  return (
    <div className="bg-[#1E293B] border border-slate-700 hover:border-emerald-500/50 text-slate-100 rounded-xl p-5 space-y-3 transition-all group shadow-sm">
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
        <h3 className="font-bold text-sm sm:text-base text-white tracking-tight group-hover:text-emerald-400 transition-colors">
          {item.title}
        </h3>
        {item.titleTe && (
          <div className="text-telugu-body text-slate-300 mt-1">{item.titleTe}</div>
        )}
      </div>

      <p className="text-xs text-slate-400 font-mono leading-relaxed pt-2 border-t border-slate-700/60">
        {item.desc}
      </p>

      <div className="pt-1 flex justify-end">
        <Link href={item.link}>
          <button className="inline-flex items-center gap-1.5 font-mono font-bold text-xs px-2.5 py-1.5 rounded-md border border-slate-500 text-slate-200 hover:border-emerald-400 hover:text-emerald-400 transition-all">
            Open Official Link <span>→</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function EducationTabs({ examUpdates }: { examUpdates: ExamUpdateItem[] }) {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.icon && <span>{tab.icon}</span>} {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => {
        const filtered =
          tab.value === "all" ? examUpdates : examUpdates.filter((item) => item.tags.includes(tab.value));

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="space-y-4">
              {filtered.length > 0 ? (
                filtered.map((item) => <UpdateCard key={item.id} item={item} />)
              ) : (
                <p className="text-xs font-mono text-slate-400 py-4 text-center">No updates in this category yet.</p>
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
