"use client";

import Link from "next/link";

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

export default function CfmsCheckerUI() {
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
          Curated Link Directory & Guide
        </span>
      </div>

      {/* Header */}
      <div className="border-b border-hair pb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">
          CFMS & Govt Status Checker Links Directory
        </h1>
        <div className="font-telugu text-sm text-inkSoft mt-1 font-medium">
          ప్రభుత్వ ఉద్యోగులు & ఉపాధ్యాయుల అధికారిక పోర్టల్స్ మరియు బిల్ స్టేటస్ లింక్స్
        </div>
      </div>

      {/* Grid of Link Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GOVT_LINKS.map((item) => (
          <div
            key={item.id}
            className="bg-paperRaised border border-hair rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-ink/30 transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[9px] uppercase tracking-wider bg-hair/60 text-inkSoft px-2 py-0.5 rounded font-semibold">
                  {item.category}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider bg-tamarind/10 text-tamarind px-2 py-0.5 rounded font-semibold">
                  {item.badge}
                </span>
              </div>

              <h2 className="font-bold text-base text-ink tracking-tight">{item.titleEn}</h2>
              <div className="font-telugu text-xs text-inkSoft mt-0.5 font-medium">
                {item.titleTe}
              </div>

              {/* How to Check Steps */}
              <div className="mt-4 pt-3 border-t border-hair/50 space-y-1.5 font-mono text-[10.5px] text-inkSoft">
                <div className="font-bold text-ink text-[11px] mb-1">How to Check / ఎలా చూడాలి:</div>
                <ol className="list-decimal pl-4 space-y-1 font-sans text-xs">
                  {item.steps.map((step, idx) => (
                    <li key={idx} className="leading-snug">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-hair/50 flex justify-end">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-ink text-white px-3.5 py-2 rounded-lg hover:bg-ink/90 transition-all shadow-2xs"
              >
                <span>Open Portal (అధికారిక వెబ్‌సైట్)</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
