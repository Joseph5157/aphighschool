import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";
import PensionersSidebar from "@/app/(public)/pensioners/_components/PensionersSidebar";
import { Card } from "@/app/(public)/_components/Card";
import Badge from "@/app/(public)/_components/Badge";

export const metadata: Metadata = {
  title: "AP Teacher Retirement 6-Office File Clearance Guide — AP Teacher Desk",
  description:
    "Step-by-step roadmap detailing the 6 offices AP teachers must clear for pension authorization: HM/DDO, MEO/DEO, State Audit, AG AP Vijayawada, STO Treasury, and Pension Bank Branch.",
};

const OFFICES = [
  {
    step: "01",
    office: "School Headmaster (HM) / DDO",
    timeline: "12 to 6 Months Before Retirement",
    tasks: [
      "Verify and update e-Service Book (e-SR) entries on CFMS",
      "Settle Earned Leave (EL) & Half Pay Leave (HPL) accounts",
      "Issue No-Dues Certificate (NDC) for audit & loans",
      "Initiate online pension proposal on CFMS NIDHI Portal (RBPS)",
    ],
  },
  {
    step: "02",
    office: "MEO / DEO Office (Pension Sanctioning Authority)",
    timeline: "6 Months Before Retirement",
    tasks: [
      "Review digitized Service Register entries & sanction orders",
      "Issue official Pension Sanctioning Order",
      "Forward digital proposal to District State Audit Department",
      "Sanction Earned Leave Encashment proceedings (300 days max)",
    ],
  },
  {
    step: "03",
    office: "State Audit Department (District Audit Officer)",
    timeline: "5 Months Before Retirement",
    tasks: [
      "Audit career pay fixations (PRC 2010, PRC 2015, RPS 2022, AAS 6/12/18/24 yrs)",
      "Clear any historical audit objections or excess draw recovery queries",
      "Issue Pre-Audit Clearance Certificate",
    ],
  },
  {
    step: "04",
    office: "Principal Accountant General AG AP (Vijayawada)",
    timeline: "3 Months Before Retirement",
    tasks: [
      "Process digital proposal via NIDHI / RBPS online system",
      "Issue Pension Payment Order (PPO) authorization",
      "Issue Gratuity Payment Order (GPO) & Commutation Payment Order (CPO)",
    ],
  },
  {
    step: "05",
    office: "Sub-Treasury Office (STO) / District Treasury (DTO)",
    timeline: "1 Month Before Retirement to Retirement Month",
    tasks: [
      "Register PPO / GPO / CPO authorizations received from AG AP",
      "Generate DCRG Gratuity, Commutation & EL Encashment Treasury Bills",
      "Initiate monthly pension credit workflow via CFMS",
    ],
  },
  {
    step: "06",
    office: "Pension Disbursing Bank Branch & APGLI District Office",
    timeline: "Retirement Month Onwards",
    tasks: [
      "Bank registers PPO and credits first monthly pension",
      "Submit APGLI Form TC-1 Final Claim to District APGLI Office",
      "Submit annual Life Certificate (Jeevan Pramaan) every Nov/Dec",
    ],
  },
];

export default function OfficePipelinePage() {
  return (
    <div className="space-y-6 font-sans">
      <Breadcrumb
        items={[
          { label: "Pensioners Hub", href: "/pensioners" },
          { label: "6-Office Retirement Pipeline" },
        ]}
      />

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 xl:gap-8 space-y-8 lg:space-y-0">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-masthead text-mastheadText border border-mastheadText/40 rounded-2xl p-6 md:p-8 space-y-3 shadow-md">
            <Badge variant="turmeric" size="sm" shape="pill" dot>
              Retirement Roadmap & Office Clearance
            </Badge>
            <h1 className="text-display text-mastheadText tracking-tight">
              AP Teacher Retirement 6-Office File Clearance Guide
            </h1>
            <p className="text-telugu-title text-turmeric font-medium mt-1">
              విశ్రాంత ఉద్యోగుల పెన్షన్ ఫైలు ఆమోదం మరియు కార్యాలయాల మార్గదర్శి
            </p>
            <p className="text-body text-mastheadText/70">
              Step-by-step guide explaining where your pension proposal moves, which office handles audit objections, and how final bills are credited.
            </p>
          </div>

          <div className="space-y-4">
            {OFFICES.map((item) => (
              <Card key={item.step} className="p-5 space-y-3 bg-paperRaised border-hair">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-ink text-turmeric flex items-center justify-center font-mono font-bold text-sm">
                      {item.step}
                    </span>
                    <h3 className="text-card-title text-ink">{item.office}</h3>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {item.timeline}
                  </Badge>
                </div>

                <ul className="space-y-2 text-body text-inkSoft font-sans pl-2">
                  {item.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-turmericDeep font-bold">✓</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <PensionersSidebar />
        </div>
      </div>
    </div>
  );
}
