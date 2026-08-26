"use client";

import Link from "next/link";
import Accordion, { AccordionItemData } from "@/app/(public)/_components/Accordion";

const GOVT_LINKS = [
  {
    id: "cfms-bill",
    titleEn: "CFMS Teacher Bill Status & Payslip Portal",
    titleTe: "సీఎఫ్ఎమ్‌ఎస్ బిల్‌ స్టేటస్ & జీతం స్లిప్ దరఖాస్తు",
    category: "Payroll / Treasury",
    url: "https://cfms.ap.gov.in/",
    steps: [
      "Open official CFMS Portal (cfms.ap.gov.in)",
      "Navigate to Citizen Services → Bill Status",
      "Enter 7-digit Year + 8-digit Bill Number / CFMS ID",
      "Click Submit to view DDO submission status, Treasury approval, & Bank UTR number",
    ],
    badge: "Official Portal",
  },
  {
    id: "medical-reimbursement",
    titleEn: "Medical Reimbursement Status Tracker",
    titleTe: "మెడికల్ రీయింబర్స్‌మెంట్ దరఖాస్తు స్టేటస్",
    category: "Health & Welfare",
    url: "http://www.ehs.ap.gov.in/",
    steps: [
      "Log into AP EHS / Medical Trust Portal (ehs.ap.gov.in)",
      "Select Employee Login with Employee ID & Password",
      "Go to Medical Reimbursement Status tab",
      "View Technical Sanction, Scrutiny Officer remarks, & Treasury DDO Status",
    ],
    badge: "EHS Trust",
  },
  {
    id: "ehs-card",
    titleEn: "EHS Health Card Download & Status",
    titleTe: "ఈహెచ్ఎస్ హెల్త్ కార్డ్ డౌన్‌లోడ్",
    category: "Health & Welfare",
    url: "http://www.ehs.ap.gov.in/",
    steps: [
      "Open EHS AP Employee Portal",
      "Log in using Employee ID / CFMS Code",
      "Click Health Card Download / Beneficiary Status",
      "Download printable e-Health card for empaneled network hospitals",
    ],
    badge: "Card Download",
  },
  {
    id: "esr-verification",
    titleEn: "e-SR (Electronic Service Register) Verification",
    titleTe: "ఈ-ఎస్ఆర్ (ఇ-సర్వీస్ రిజిస్టర్) సమాచారం",
    category: "Service Rules",
    url: "https://esr.ap.gov.in/",
    steps: [
      "Access AP e-SR Portal (esr.ap.gov.in)",
      "Log in with DDO / Individual Teacher Credentials",
      "Check Service Verification entries, Leaves, Scale Fixations, & Increment Orders",
      "Request DDO approval for any pending module entries",
    ],
    badge: "Service Record",
  },
  {
    id: "gpf-statement",
    titleEn: "AP GPF Annual Slip & Balance Download",
    titleTe: "జీపీఎఫ్ వార్షిక అకౌంట్ స్లిప్ డౌన్‌లోడ్",
    category: "Provident Fund",
    url: "https://agap.ap.nic.in/gpf.aspx",
    steps: [
      "Visit Principal Accountant General (A&E) AP Portal",
      "Select GPF Account Slip",
      "Enter Series Code (EDN / GA etc.) & GPF Account Number",
      "Select Financial Year & view annual credit/interest statement",
    ],
    badge: "AG Office",
  },
];

const FAQ_ITEMS: AccordionItemData[] = [
  {
    id: "faq-cfms-utr",
    titleEn: "What does UTR status mean in CFMS bill tracking?",
    titleTe: "సీఎఫ్ఎమ్‌ఎస్ బిల్‌ స్టేటస్‌లో UTR అంటే ఏమిటి?",
    badge: "CFMS Help",
    defaultOpen: true,
    content: (
      <div className="space-y-2">
        <p>
          <b>UTR (Unique Transaction Reference)</b> means the Treasury has successfully generated the electronic payment advice and transferred the funds to RBI / SBI for crediting into the employee’s bank account.
        </p>
        <p>
          Once UTR is generated, credit usually reflects in your salary savings account within <b>24 to 48 hours</b>.
        </p>
      </div>
    ),
  },
  {
    id: "faq-ehs-reimbursement",
    titleEn: "Who is eligible for EHS Medical Reimbursement?",
    titleTe: "ఈహెచ్ఎస్ మెడికల్ రీయింబర్స్‌మెంట్‌కు ఎవరు అర్హులు?",
    badge: "EHS Rules",
    content: (
      <div className="space-y-2">
        <p>
          All serving AP state government employees, teachers, and pensioners covered under the Employees Health Scheme (EHS) are eligible for emergency treatment reimbursement in non-empaneled hospitals or network hospital claim bills.
        </p>
        <p>
          <b>Key condition:</b> Claim must be submitted through DDO within 6 months of hospital discharge date along with original bills, discharge summary, and emergency certificate.
        </p>
      </div>
    ),
  },
  {
    id: "faq-esr-corrections",
    titleEn: "How to correct wrong entries in e-SR (Electronic Service Register)?",
    titleTe: "ఇ-సర్వీస్ రిజిస్టర్‌లో తప్పు నమోదులను ఎలా సవరించాలి?",
    badge: "e-SR Guide",
    content: (
      <div className="space-y-2">
        <p>
          If any entry (Basic Pay, Qualification, Leave credit, or Service verification) is incorrect in your e-SR profile:
        </p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Submit a formal written representation along with physical Service Book photo pages to your Headmaster / DDO.</li>
          <li>DDO will login to the e-SR portal with DDO credentials and trigger a <b>Module Correction Request</b>.</li>
          <li>Once approved by the MEO / DEO scrutiny officer, the corrected entry updates online.</li>
        </ol>
      </div>
    ),
  },
];

export default function CfmsCheckerUI() {
  const accordionLinkItems: AccordionItemData[] = GOVT_LINKS.map((item) => ({
    id: item.id,
    titleEn: item.titleEn,
    titleTe: item.titleTe,
    badge: item.badge,
    content: (
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-inkSoft">Category: <b className="text-ink">{item.category}</b></span>
        </div>
        <div className="space-y-2">
          <div className="font-bold text-ink text-xs">How to Access / step-by-step guide:</div>
          <ol className="list-decimal pl-4 space-y-1 text-xs leading-relaxed text-inkSoft">
            {item.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="pt-2 flex justify-end">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-ink text-paper px-3.5 py-2 rounded-lg hover:bg-ink/90 transition-all shadow-2xs"
          >
            <span>Open Official Portal (అధికారిక వెబ్‌సైట్)</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    ),
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/tools"
          className="text-xs font-mono text-inkSoft hover:text-ink transition-colors inline-flex items-center gap-1.5 font-semibold"
        >
          ← Back to Utility Tools / ఇతర సాధనాలు
        </Link>
        <span className="font-mono text-[9px] uppercase tracking-wider bg-tamarind/10 text-tamarind border border-tamarind/20 px-2.5 py-0.5 rounded-full font-semibold">
          Interactive Guide Directory
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-hair pb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          CFMS & Govt Status Checker Links Directory
        </h1>
        <div lang="te" className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          ప్రభుత్వ ఉద్యోగులు & ఉపాధ్యాయుల అధికారిక పోర్టల్స్ మరియు బిల్ స్టేటస్ లింక్స్
        </div>
      </div>

      {/* Accordion List for Govt Links */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
          <span>🏛️</span> Official Portal Guides & Direct Links
        </h2>
        <Accordion items={accordionLinkItems} allowMultiple={true} />
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-6 border-t border-hair">
        <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
          <span>❓</span> Frequently Asked Questions (తరచుగా అడిగే ప్రశ్నలు)
        </h2>
        <Accordion items={FAQ_ITEMS} allowMultiple={true} />
      </div>
    </div>
  );
}
