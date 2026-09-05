import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import Badge from "@/app/(public)/_components/Badge";
import { Card } from "@/app/(public)/_components/Card";
import { buttonClassName } from "@/app/(public)/_components/Button";

export const metadata: Metadata = {
  title: "Teacher Service Desk — AP Teacher Desk",
  description:
    "Find AP teacher pay, leave, CFMS, GPF, pension, and official-order guidance in one place.",
};

const TASKS = [
  {
    href: "/tools",
    title: "Pay, Tax & DA",
    detail: "Salary, income tax, PRC pay fixation, and DA arrears calculators.",
    icon: "₹",
    category: "Pay services",
  },
  {
    href: "/tools/leave-encashment",
    title: "Leave & Encashment",
    detail: "Estimate Earned Leave surrender and retirement HPL encashment.",
    icon: "EL",
    category: "Leave services",
  },
  {
    href: "/tools/cfms-checker",
    title: "CFMS, Payslip, EHS & e-SR",
    detail: "Find the existing AP government portal guides for bill status and service records.",
    icon: "AP",
    category: "Portal guides",
  },
  {
    href: "/tools/gpf-apgli",
    title: "GPF & APGLI",
    detail: "Estimate balances and find guidance for provident-fund records.",
    icon: "PF",
    category: "Fund services",
  },
  {
    href: "/pensioners",
    title: "Pension & Retirement",
    detail: "Use pension tools and follow the AP retirement-clearance roadmap.",
    icon: "60",
    category: "Retirement services",
  },
  {
    href: "/search",
    title: "Orders & Official Updates",
    detail: "Search published AP School Education orders, circulars, and guidance.",
    icon: "GO",
    category: "Document services",
  },
] as const;

export default function ServiceDeskPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 font-sans">
      <Breadcrumb items={[{ label: "Teacher Service Desk" }]} />

      <section className="relative overflow-hidden rounded-2xl border border-mastheadText/35 bg-masthead p-6 text-mastheadText shadow-md md:p-8">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-turmeric/10" aria-hidden="true" />
        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="turmeric" size="sm" shape="pill" dot>
              AP School Education
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-wider text-mastheadText/65">
              Service guide
            </span>
          </div>
          <div>
            <h1 className="text-display tracking-tight text-mastheadText">
              What do you need help with?
            </h1>
            <p className="mt-2 max-w-2xl text-body text-mastheadText/75">
              Start with the task you need to complete. This desk brings together AP teacher and School Education employee guidance already available in the portal.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="service-tasks-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-hair pb-3">
          <div>
            <h2 id="service-tasks-heading" className="text-section text-ink">
              Choose a service
            </h2>
            <p className="mt-1 text-body text-inkSoft">Six common starting points for AP teacher services.</p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-inkSoft sm:block">
            Internal portal guide
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TASKS.map((task, index) => (
            <Card key={task.href} hoverable className="group overflow-hidden border-hair bg-paperRaised">
              <Link
                href={task.href}
                className="block h-full p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind focus-visible:ring-inset"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-turmeric/35 bg-turmeric/15 font-mono text-xs font-bold text-ink">
                      {task.icon}
                    </span>
                    <Badge variant="neutral" size="sm" shape="pill">
                      {String(index + 1).padStart(2, "0")} · {task.category}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-turmericDeep" aria-hidden="true">→</span>
                </div>

                <h3 className="mt-5 text-card-title text-ink transition-colors group-hover:text-tamarind">
                  {task.title}
                </h3>
                <p className="mt-2 min-h-12 text-body text-inkSoft">{task.detail}</p>

                <span className={`${buttonClassName({ variant: "outline", size: "sm" })} mt-5`}>
                  Open guide <span aria-hidden="true">→</span>
                </span>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <aside className="rounded-xl border border-turmeric/30 bg-turmeric/10 px-4 py-3 text-sm text-inkSoft" aria-label="Service desk disclaimer">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-turmericDeep">Please note</span>
        <p className="mt-1 leading-relaxed">
          AP Teacher Desk provides unofficial guidance. Official transactions, submissions, and account access happen only on the relevant government portals.
        </p>
      </aside>
    </div>
  );
}
